"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore, CheckoutSession, CartItem } from "@/lib/store/cart";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { AddressForm, ShippingAddress } from "@/components/checkout/address-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import dynamic from "next/dynamic";

// Lazy load PaymentSelector to reduce initial bundle size
const PaymentSelector = dynamic(
    () => import("@/components/checkout/payment-selector").then(mod => ({ default: mod.PaymentSelector })),
    {
        loading: () => (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        ),
        ssr: false, // Payment selector needs browser APIs
    }
);

type CheckoutStep = "address" | "payment" | "review";

export default function CheckoutPage() {
    const router = useRouter();
    const { items: cartItems, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
    const [paymentId, setPaymentId] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

    // Validate Buy Now session structure
    const validateBuyNowSession = (session: unknown): session is CheckoutSession => {
        // Check if session is an object
        if (!session || typeof session !== 'object') {
            console.warn('Buy Now session validation failed: session is not an object');
            return false;
        }

        const sessionObj = session as Record<string, unknown>;

        // Check for required items array
        if (!sessionObj.items || !Array.isArray(sessionObj.items)) {
            console.warn('Buy Now session validation failed: items is not an array');
            return false;
        }

        // Check that items array is not empty
        if (sessionObj.items.length === 0) {
            console.warn('Buy Now session validation failed: items array is empty');
            return false;
        }

        // Validate each item in the array
        for (let i = 0; i < sessionObj.items.length; i++) {
            const item = sessionObj.items[i];

            // Check if item is an object
            if (!item || typeof item !== 'object') {
                console.warn(`Buy Now session validation failed: item at index ${i} is not an object`);
                return false;
            }

            const itemObj = item as Record<string, unknown>;

            // Check for required product field
            if (!itemObj.product || typeof itemObj.product !== 'object') {
                console.warn(`Buy Now session validation failed: item at index ${i} missing valid product`);
                return false;
            }

            const product = itemObj.product as Record<string, unknown>;

            // Check for required product fields
            if (!product.id || typeof product.id !== 'string') {
                console.warn(`Buy Now session validation failed: item at index ${i} product missing valid id`);
                return false;
            }

            if (!product.title || typeof product.title !== 'string') {
                console.warn(`Buy Now session validation failed: item at index ${i} product missing valid title`);
                return false;
            }

            if (typeof product.base_price !== 'number' || product.base_price < 0) {
                console.warn(`Buy Now session validation failed: item at index ${i} product missing valid base_price`);
                return false;
            }

            // Check for required quantity field
            if (typeof itemObj.quantity !== 'number' || itemObj.quantity < 1) {
                console.warn(`Buy Now session validation failed: item at index ${i} missing valid quantity`);
                return false;
            }

            // If variant exists, validate it
            if (itemObj.variant !== undefined && itemObj.variant !== null) {
                if (typeof itemObj.variant !== 'object') {
                    console.warn(`Buy Now session validation failed: item at index ${i} variant is not an object`);
                    return false;
                }

                const variant = itemObj.variant as Record<string, unknown>;

                if (!variant.id || typeof variant.id !== 'string') {
                    console.warn(`Buy Now session validation failed: item at index ${i} variant missing valid id`);
                    return false;
                }

                if (typeof variant.price_adjustment !== 'number') {
                    console.warn(`Buy Now session validation failed: item at index ${i} variant missing valid price_adjustment`);
                    return false;
                }
            }
        }

        // All validations passed
        return true;
    };

    // Initialize checkout state synchronously from sessionStorage
    const initializeCheckoutState = () => {
        // Check for Buy Now session in sessionStorage synchronously
        if (typeof window !== 'undefined') {
            try {
                const buyNowSessionData = sessionStorage.getItem('buyNowSession');
                if (buyNowSessionData) {
                    try {
                        const session: unknown = JSON.parse(buyNowSessionData);

                        // Validate session structure with comprehensive checks
                        if (validateBuyNowSession(session)) {
                            console.log('Buy Now session validated successfully');

                            // Clean up session from storage immediately after reading
                            sessionStorage.removeItem('buyNowSession');

                            // TypeScript now knows session is CheckoutSession
                            return {
                                checkoutType: "buyNow" as const,
                                items: session.items as CartItem[],
                                isInitialized: true
                            };
                        } else {
                            console.warn('Invalid Buy Now session structure, falling back to cart');
                            // Clean up invalid session data
                            sessionStorage.removeItem('buyNowSession');
                        }
                    } catch (parseError) {
                        console.error('Error parsing Buy Now session JSON:', parseError);
                        // Clean up corrupted session data
                        try {
                            sessionStorage.removeItem('buyNowSession');
                        } catch (cleanupError) {
                            console.error('Error cleaning up corrupted session:', cleanupError);
                        }
                    }
                }
            } catch (storageError) {
                console.error('Error accessing sessionStorage (may be disabled or in privacy mode):', storageError);
                // Continue with cart checkout - don't break user experience
            }
        }

        // Fall back to cart checkout
        console.log('Falling back to cart checkout');
        return {
            checkoutType: "cart" as const,
            items: cartItems,
            isInitialized: true
        };
    };

    // Initialize state synchronously
    const initialState = initializeCheckoutState();

    // Checkout type state
    const [checkoutType] = useState<"cart" | "buyNow">(initialState.checkoutType);
    const [checkoutItems, setCheckoutItems] = useState<CartItem[]>(initialState.items);
    const [isInitialized, setIsInitialized] = useState(false);

    // Coupon State
    const [appliedCouponCode, setAppliedCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);

    // Delivery charge state - default to 50 (will be updated when pincode is entered)
    const [deliveryCharge, setDeliveryCharge] = useState(50);

    const [formData, setFormData] = useState<ShippingAddress>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
    });

    // Calculate amounts
    const calculateSubtotal = () => {
        return checkoutItems.reduce((total, item) => {
            let basePrice = item.product.base_price;
            if (item.product.discount_price && item.product.discount_price < basePrice) {
                basePrice = item.product.discount_price;
            }
            const price = item.variant ? basePrice + item.variant.price_adjustment : basePrice;
            return total + price * item.quantity;
        }, 0);
    };

    const subtotal = calculateSubtotal();
    const tax = (subtotal - discount + deliveryCharge) * 0.1; // 10% tax
    const totalAmount = subtotal - discount + deliveryCharge + tax;

    // Mark initialization as complete on mount
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    // Update checkout items when cart changes (only for cart checkout)
    useEffect(() => {
        if (checkoutType === "cart") {
            setCheckoutItems(cartItems);
        }
    }, [cartItems, checkoutType]);

    // Redirect if no items to checkout - only after initialization is complete
    useEffect(() => {
        // Wait for initialization to complete before checking redirect conditions
        if (!isInitialized) {
            return;
        }

        // Never redirect for Buy Now checkout type
        if (checkoutType === "buyNow") {
            return;
        }

        // Only redirect for cart checkout when both cart and checkout items are empty
        if (checkoutType === "cart" && checkoutItems.length === 0 && cartItems.length === 0) {
            console.log('Cart checkout with no items, redirecting to home');
            router.push("/");
        }
    }, [isInitialized, checkoutItems, checkoutType, cartItems, router]);

    useEffect(() => {
        // Prefill user data if logged in
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Fetch profile to prefill
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    fullName: profile.full_name || prev.fullName,
                    email: user.email || prev.email,
                    phone: profile.phone || prev.phone,
                    address: profile.address || prev.address,
                    city: profile.city || prev.city,
                    state: profile.state || prev.state,
                    zipCode: profile.zip_code || prev.zipCode,
                }));
            }
        }
    };

    const handleAddressChange = (address: ShippingAddress) => {
        setFormData(address);
    };

    const handleDeliveryChargeCalculated = (charge: number) => {
        setDeliveryCharge(charge);
    };

    const handleCouponApplied = (discountAmount: number, code: string) => {
        setDiscount(discountAmount);
        setAppliedCouponCode(code);
    };

    const handleCouponRemoved = () => {
        setDiscount(0);
        setAppliedCouponCode("");
    };

    const handlePaymentSuccess = (paymentIdOrMethod: string) => {
        setPaymentId(paymentIdOrMethod);
        if (paymentIdOrMethod === "COD") {
            setPaymentMethod("cod");
        } else {
            setPaymentMethod("razorpay");
        }
        // Automatically proceed to review step
        setCurrentStep("review");
    };

    const handlePaymentError = (error: Error) => {
        console.error("Payment error:", error);
        // Form data is preserved, user can retry
    };

    const steps: { id: CheckoutStep; label: string; number: number }[] = [
        { id: "address", label: "Address", number: 1 },
        { id: "payment", label: "Payment", number: 2 },
        { id: "review", label: "Review", number: 3 },
    ];

    const canProceedToPayment = () => {
        return (
            formData.fullName &&
            formData.email &&
            formData.phone &&
            formData.address &&
            formData.city &&
            formData.state &&
            formData.zipCode
        );
    };

    const handleNextStep = () => {
        if (currentStep === "address" && canProceedToPayment()) {
            setCurrentStep("payment");
        } else if (currentStep === "payment") {
            setCurrentStep("review");
        }
    };

    const handlePreviousStep = () => {
        if (currentStep === "review") {
            setCurrentStep("payment");
        } else if (currentStep === "payment") {
            setCurrentStep("address");
        }
    };



    const createOrder = async () => {
        try {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert([
                    {
                        order_number: `ORD-${Date.now()}`, // Temporary, will be replaced by trigger
                        user_id: user?.id || null,
                        subtotal: subtotal,
                        discount: discount,
                        coupon_code: appliedCouponCode || null,
                        delivery_charge: deliveryCharge,
                        tax: tax,
                        total: totalAmount,
                        shipping_address: formData,
                        delivery_pincode: formData.zipCode,
                        payment_method: paymentMethod,
                        payment_status: paymentMethod === "cod" ? "pending" : "completed",
                        payment_id: paymentMethod === "razorpay" ? paymentId : null,
                        status: "pending"
                    },
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            if (!order) {
                throw new Error("Failed to create order - no order data returned");
            }

            // 2. Create Order Items - use checkoutItems instead of items
            const orderItems = checkoutItems.map((item) => {
                const price = item.variant
                    ? item.product.base_price + item.variant.price_adjustment
                    : item.product.base_price;

                // Get product image from variant or product
                const productImage = item.variant?.images?.[0] || item.product.variants?.[0]?.images?.[0] || null;

                // Build variant name from color and material
                const variantName = item.variant
                    ? [item.variant.color, item.variant.material].filter(Boolean).join(' - ') || 'Default'
                    : null;

                return {
                    order_id: order.id,
                    product_id: item.product.id,
                    product_name: item.product.title,
                    product_image: productImage,
                    variant_id: item.variant?.id || null,
                    variant_name: variantName,
                    quantity: item.quantity,
                    price: price,
                    subtotal: price * item.quantity,
                };
            });

            const { error: itemsError } = await supabase
                .from("order_items")
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Success - only clear cart if this was a cart checkout
            if (checkoutType === "cart") {
                clearCart();
            }
            // For Buy Now, we don't clear the cart as it should remain unchanged

            router.push(`/checkout/success?orderId=${order.id}`);
        } catch (error) {
            console.error("Error creating order:", error);

            // Better error handling for Supabase errors
            let errorMessage = "Unknown error";

            if (error && typeof error === 'object') {
                if ('message' in error) {
                    errorMessage = String(error.message);
                } else if ('error' in error) {
                    errorMessage = String(error.error);
                } else {
                    errorMessage = JSON.stringify(error);
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error("Detailed error:", errorMessage);
            alert("Error creating order: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        await createOrder();
    };

    if (checkoutItems.length === 0) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
                {checkoutType === "buyNow" && (
                    <span className="rounded-full bg-primary/20 px-4 py-1 text-sm font-medium text-primary" role="status" aria-label="Buy Now checkout mode">
                        Buy Now
                    </span>
                )}
            </header>

            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-1 items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${currentStep === step.id
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : steps.findIndex((s) => s.id === currentStep) > index
                                                ? "border-green-500 bg-green-500 text-white"
                                                : "border-muted-foreground/30 bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {steps.findIndex((s) => s.id === currentStep) > index ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span className="font-semibold">{step.number}</span>
                                    )}
                                </div>
                                <span
                                    className={`mt-2 text-sm font-medium ${currentStep === step.id
                                            ? "text-primary"
                                            : steps.findIndex((s) => s.id === currentStep) > index
                                                ? "text-green-500"
                                                : "text-muted-foreground"
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`mx-4 h-0.5 flex-1 transition-all ${steps.findIndex((s) => s.id === currentStep) > index
                                            ? "bg-green-500"
                                            : "bg-neutral-700"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Step Content */}
                <div className="space-y-6">
                    {/* Address Step */}
                    {currentStep === "address" && (
                        <section className="rounded-xl border border-border bg-card p-6" aria-labelledby="shipping-heading">
                            <h2 id="shipping-heading" className="mb-4 text-xl font-semibold text-foreground">Shipping Details</h2>
                            <div className="text-muted-foreground text-sm mb-4">
                                Step 1: Enter your shipping address
                            </div>
                            <AddressForm
                                onAddressChange={handleAddressChange}
                                initialAddress={formData}
                                onDeliveryChargeCalculated={handleDeliveryChargeCalculated}
                                orderSubtotal={subtotal}
                            />
                        </section>
                    )}

                    {/* Payment Step */}
                    {currentStep === "payment" && (
                        <section className="rounded-xl border border-border bg-card p-6" aria-labelledby="payment-heading">
                            <h2 id="payment-heading" className="mb-4 text-xl font-semibold text-foreground">Payment Method</h2>
                            <div className="text-muted-foreground text-sm mb-4">
                                Step 2: Choose your payment method
                            </div>
                            <PaymentSelector
                                amount={totalAmount}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentError={handlePaymentError}
                                customerInfo={{
                                    name: formData.fullName,
                                    email: formData.email,
                                    phone: formData.phone,
                                }}
                            />
                        </section>
                    )}

                    {/* Review Step */}
                    {currentStep === "review" && (
                        <section className="rounded-xl border border-border bg-card p-6" aria-labelledby="review-heading">
                            <h2 id="review-heading" className="mb-4 text-xl font-semibold text-foreground">Review Order</h2>
                            <div className="text-muted-foreground text-sm mb-4">
                                Step 3: Review your order details
                            </div>

                            {/* Shipping Address Review */}
                            <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
                                <h3 className="mb-2 font-semibold text-foreground">Shipping Address</h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>{formData.fullName}</p>
                                    <p>{formData.email}</p>
                                    <p>{formData.phone}</p>
                                    <p>{formData.address}</p>
                                    <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentStep("address")}
                                    className="mt-2 text-primary hover:text-primary/80"
                                >
                                    Edit Address
                                </Button>
                            </div>

                            {/* Payment Method Review */}
                            <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
                                <h3 className="mb-2 font-semibold text-foreground">Payment Method</h3>
                                <p className="text-sm text-muted-foreground">
                                    {paymentMethod === "razorpay" ? "Online Payment (Razorpay)" : "Cash on Delivery"}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentStep("payment")}
                                    className="mt-2 text-primary hover:text-primary/80"
                                >
                                    Change Payment Method
                                </Button>
                            </div>
                        </section>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        {currentStep !== "address" && (
                            <Button
                                variant="outline"
                                onClick={handlePreviousStep}
                                className="flex-1"
                            >
                                Previous
                            </Button>
                        )}
                        {currentStep !== "review" && (
                            <Button
                                onClick={handleNextStep}
                                disabled={currentStep === "address" && !canProceedToPayment()}
                                className="flex-1"
                            >
                                Continue
                            </Button>
                        )}
                        {currentStep === "review" && (
                            <Button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Place Order - ₹${totalAmount.toFixed(2)}`
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <section className="sticky top-24 rounded-xl border border-border bg-card p-6" aria-labelledby="order-summary-heading">
                        <h2 id="order-summary-heading" className="mb-4 text-xl font-semibold text-foreground">Order Summary</h2>
                        <OrderSummary
                            items={checkoutItems}
                            subtotal={subtotal}
                            discount={discount}
                            deliveryCharge={deliveryCharge}
                            tax={tax}
                            total={totalAmount}
                            couponCode={appliedCouponCode}
                            onCouponApplied={handleCouponApplied}
                            onCouponRemoved={handleCouponRemoved}
                            showCouponInput={true}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
