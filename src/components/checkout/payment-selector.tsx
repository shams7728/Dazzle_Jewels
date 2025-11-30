"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Truck, Loader2, CheckCircle2, XCircle } from "lucide-react";

type PaymentMethod = "razorpay" | "cod";

interface PaymentSelectorProps {
    amount: number;
    onPaymentSuccess: (paymentId: string) => void;
    onPaymentError: (error: Error) => void;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

interface RazorpayErrorResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id: string;
            payment_id: string;
        };
    };
}

// Error type classification for better user messaging
type PaymentErrorType = 
    | "timeout"
    | "declined"
    | "network"
    | "gateway_unavailable"
    | "user_cancelled"
    | "unknown";

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
    modal: {
        ondismiss: () => void;
    };
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

export function PaymentSelector({
    amount,
    onPaymentSuccess,
    onPaymentError,
    customerInfo,
}: PaymentSelectorProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("razorpay");
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [errorType, setErrorType] = useState<PaymentErrorType | null>(null);
    const [canRetry, setCanRetry] = useState(false);

    const handlePaymentMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setPaymentStatus("idle");
        setErrorMessage("");
        setErrorType(null);
        setCanRetry(false);
    };

    // Classify error type based on error code and description
    const classifyPaymentError = (error: RazorpayErrorResponse["error"]): PaymentErrorType => {
        const code = error.code?.toLowerCase() || "";
        const description = error.description?.toLowerCase() || "";
        const reason = error.reason?.toLowerCase() || "";

        // Timeout errors
        if (code.includes("timeout") || description.includes("timeout") || reason.includes("timeout")) {
            return "timeout";
        }

        // Declined/failed payments
        if (
            code.includes("payment_failed") ||
            code.includes("payment_declined") ||
            description.includes("declined") ||
            description.includes("insufficient") ||
            reason.includes("declined")
        ) {
            return "declined";
        }

        // Network errors
        if (
            code.includes("network") ||
            description.includes("network") ||
            reason.includes("network") ||
            code.includes("connection")
        ) {
            return "network";
        }

        // Gateway unavailable
        if (
            code.includes("gateway") ||
            code.includes("server_error") ||
            description.includes("unavailable") ||
            description.includes("maintenance")
        ) {
            return "gateway_unavailable";
        }

        return "unknown";
    };

    // Get user-friendly error message based on error type
    const getUserFriendlyErrorMessage = (type: PaymentErrorType, originalMessage: string): string => {
        switch (type) {
            case "timeout":
                return "Payment gateway timed out. Your payment was not processed. Please try again.";
            case "declined":
                return `Payment was declined. ${originalMessage}. Please check your payment details or try a different payment method.`;
            case "network":
                return "Network connection issue. Please check your internet connection and try again.";
            case "gateway_unavailable":
                return "Payment gateway is temporarily unavailable. Please try again in a few moments or choose a different payment method.";
            case "user_cancelled":
                return "Payment was cancelled. You can retry when ready.";
            case "unknown":
            default:
                return `Payment failed: ${originalMessage}. Please try again or contact support if the issue persists.`;
        }
    };

    const handleRazorpayPayment = () => {
        if (!window.Razorpay) {
            const error = new Error("Razorpay SDK not loaded. Please refresh the page and try again.");
            setErrorMessage(error.message);
            setErrorType("gateway_unavailable");
            setPaymentStatus("error");
            setCanRetry(true);
            onPaymentError(error);
            return;
        }

        setProcessing(true);
        setPaymentStatus("idle");
        setErrorMessage("");
        setErrorType(null);
        setCanRetry(false);

        const options: RazorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_1234567890",
            amount: Math.round(amount * 100), // Convert to paise
            currency: "INR",
            name: "Dazzle Jewelry",
            description: "Purchase from Dazzle Jewelry",
            handler: function (response: RazorpayResponse) {
                // Payment successful
                setPaymentStatus("success");
                setProcessing(false);
                setErrorType(null);
                setCanRetry(false);
                onPaymentSuccess(response.razorpay_payment_id);
            },
            prefill: {
                name: customerInfo.name,
                email: customerInfo.email,
                contact: customerInfo.phone,
            },
            theme: {
                color: "#FBBF24", // Yellow accent
            },
            modal: {
                ondismiss: function () {
                    // User closed the payment modal - this is not an error, just cancellation
                    setProcessing(false);
                    setPaymentStatus("idle");
                    setErrorType("user_cancelled");
                    setCanRetry(true);
                    // Don't call onPaymentError for user cancellation
                },
            },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", function (response: RazorpayErrorResponse) {
            const errorType = classifyPaymentError(response.error);
            const friendlyMessage = getUserFriendlyErrorMessage(errorType, response.error.description);
            
            const error = new Error(friendlyMessage);
            setErrorMessage(friendlyMessage);
            setErrorType(errorType);
            setPaymentStatus("error");
            setProcessing(false);
            setCanRetry(true); // Always allow retry on payment failure
            onPaymentError(error);
        });

        rzp.open();
    };

    const handleRetryPayment = () => {
        // Reset error state and retry
        setPaymentStatus("idle");
        setErrorMessage("");
        setErrorType(null);
        setCanRetry(false);
        
        // Retry based on selected method
        if (selectedMethod === "razorpay") {
            handleRazorpayPayment();
        } else {
            handleCODPayment();
        }
    };

    const handleCODPayment = () => {
        // For COD, we just need to confirm the selection
        // The actual order creation will happen in the parent component
        setPaymentStatus("success");
        onPaymentSuccess("COD");
    };

    const handleProceedToPayment = () => {
        if (selectedMethod === "razorpay") {
            handleRazorpayPayment();
        } else {
            handleCODPayment();
        }
    };

    return (
        <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-neutral-400">Select Payment Method</h3>
                
                <div className="grid gap-3 md:grid-cols-2">
                    {/* Online Payment */}
                    <button
                        type="button"
                        onClick={() => handlePaymentMethodSelect("razorpay")}
                        disabled={processing}
                        className={`flex items-center gap-3 rounded-lg border p-4 transition-all min-h-[80px] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black ${
                            selectedMethod === "razorpay"
                                ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                                : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
                        } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                        role="radio"
                        aria-checked={selectedMethod === "razorpay"}
                        aria-label="Online payment via Razorpay"
                    >
                        <CreditCard className="h-8 w-8 flex-shrink-0" aria-hidden="true" />
                        <div className="text-left">
                            <div className="font-semibold">Online Payment</div>
                            <div className="text-xs text-neutral-500">
                                UPI, Cards, Net Banking, Wallets
                            </div>
                        </div>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                        type="button"
                        onClick={() => handlePaymentMethodSelect("cod")}
                        disabled={processing}
                        className={`flex items-center gap-3 rounded-lg border p-4 transition-all min-h-[80px] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black ${
                            selectedMethod === "cod"
                                ? "border-yellow-500 bg-yellow-500/10 text-yellow-500"
                                : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
                        } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                        role="radio"
                        aria-checked={selectedMethod === "cod"}
                        aria-label="Cash on delivery"
                    >
                        <Truck className="h-8 w-8 flex-shrink-0" aria-hidden="true" />
                        <div className="text-left">
                            <div className="font-semibold">Cash on Delivery</div>
                            <div className="text-xs text-neutral-500">
                                Pay when you receive
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Payment Status Messages */}
            {paymentStatus === "success" && (
                <div className="flex items-start gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-500">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Payment method confirmed!</p>
                        <p className="mt-1 text-xs text-green-400">
                            {selectedMethod === "razorpay"
                                ? "Your payment was successful"
                                : "You've selected Cash on Delivery"}
                        </p>
                    </div>
                </div>
            )}

            {paymentStatus === "error" && (
                <div className="space-y-3">
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-medium">
                                {errorType === "timeout" && "Payment Timeout"}
                                {errorType === "declined" && "Payment Declined"}
                                {errorType === "network" && "Network Error"}
                                {errorType === "gateway_unavailable" && "Gateway Unavailable"}
                                {errorType === "user_cancelled" && "Payment Cancelled"}
                                {errorType === "unknown" && "Payment Failed"}
                            </p>
                            <p className="mt-1 text-xs text-red-400">
                                {errorMessage}
                            </p>
                            
                            {/* Helpful suggestions based on error type */}
                            {errorType === "declined" && (
                                <div className="mt-2 text-xs text-red-300">
                                    <p className="font-medium">Suggestions:</p>
                                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                                        <li>Verify your card details are correct</li>
                                        <li>Ensure sufficient balance in your account</li>
                                        <li>Try a different payment method</li>
                                        <li>Contact your bank if the issue persists</li>
                                    </ul>
                                </div>
                            )}
                            
                            {errorType === "timeout" && (
                                <div className="mt-2 text-xs text-red-300">
                                    <p className="font-medium">What happened?</p>
                                    <p className="mt-1">The payment gateway took too long to respond. Your payment was not processed, and no charges were made.</p>
                                </div>
                            )}
                            
                            {errorType === "network" && (
                                <div className="mt-2 text-xs text-red-300">
                                    <p className="font-medium">Troubleshooting:</p>
                                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                                        <li>Check your internet connection</li>
                                        <li>Try switching between WiFi and mobile data</li>
                                        <li>Refresh the page and try again</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Retry Button */}
                    {canRetry && errorType !== "user_cancelled" && (
                        <Button
                            onClick={handleRetryPayment}
                            variant="outline"
                            className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                            Retry Payment
                        </Button>
                    )}
                </div>
            )}

            {/* Payment Information */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                            {selectedMethod === "razorpay" ? "Secure Online Payment" : "Cash on Delivery"}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                            {selectedMethod === "razorpay"
                                ? "Your payment information is encrypted and secure. We support all major payment methods."
                                : "Pay with cash when your order is delivered to your doorstep. No advance payment required."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Proceed Button */}
            {paymentStatus !== "success" && (
                <Button
                    onClick={handleProceedToPayment}
                    disabled={processing}
                    className="w-full min-h-[44px]"
                    size="lg"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {selectedMethod === "razorpay" ? "Pay" : "Confirm"} ₹{amount.toFixed(2)}
                        </>
                    )}
                </Button>
            )}
            
            {/* Form Data Preservation Notice */}
            {paymentStatus === "error" && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 text-xs text-neutral-400">
                    <p>✓ Your shipping and order information has been saved. You can retry payment without re-entering your details.</p>
                </div>
            )}
        </div>
    );
}
