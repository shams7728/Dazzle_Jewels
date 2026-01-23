"use client";

import { Shield, RotateCcw, Award, Truck, CreditCard } from "lucide-react";
import { useState } from "react";

interface Badge {
  icon: React.ReactNode;
  text: string;
  description?: string;
}

interface TrustBadgesProps {
  badges?: Badge[];
}

const defaultBadges: Badge[] = [
  {
    icon: <Shield className="h-5 w-5" />,
    text: "Secure Checkout",
    description: "Your payment information is encrypted and secure"
  },
  {
    icon: <RotateCcw className="h-5 w-5" />,
    text: "Easy Returns",
    description: "30-day hassle-free return policy"
  },
  {
    icon: <Award className="h-5 w-5" />,
    text: "Warranty",
    description: "1-year manufacturer warranty included"
  }
];

export function TrustBadges({ badges = defaultBadges }: TrustBadgesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="relative flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary p-2 rounded-lg hover:bg-muted min-h-[44px] touch-manipulation"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex-shrink-0">{badge.icon}</div>
            <span className="text-sm font-medium">{badge.text}</span>

            {/* Tooltip */}
            {badge.description && hoveredIndex === index && (
              <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-800 px-3 py-2 text-xs text-white shadow-lg max-w-[200px] whitespace-normal text-center">
                {badge.description}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ShippingInfoProps {
  estimatedDelivery?: string;
  shippingCost?: number;
  freeShippingThreshold?: number;
}

export function ShippingInfo({
  estimatedDelivery = "3-5 business days",
  shippingCost = 0,
  freeShippingThreshold = 5000
}: ShippingInfoProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4 md:p-6">
      <div className="flex items-start gap-3 md:gap-4">
        <Truck className="h-6 w-6 flex-shrink-0 text-primary mt-0.5" />
        <div className="flex-1">
          <h3 className="text-base md:text-sm font-semibold text-white mb-2">Shipping Information</h3>
          <div className="space-y-1.5 text-sm md:text-sm text-neutral-300">
            <p>Estimated Delivery: <span className="text-white font-medium">{estimatedDelivery}</span></p>
            {shippingCost === 0 ? (
              <p className="text-green-500 font-medium">Free Shipping</p>
            ) : (
              <p>Shipping Cost: <span className="text-foreground font-medium">₹{shippingCost}</span></p>
            )}
            {shippingCost > 0 && freeShippingThreshold && (
              <p className="text-xs text-muted-foreground">
                Free shipping on orders over ₹{freeShippingThreshold}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PaymentMethod {
  name: string;
  icon: React.ReactNode;
}

interface PaymentMethodsProps {
  methods?: PaymentMethod[];
}

const defaultPaymentMethods: PaymentMethod[] = [
  { name: "Credit Card", icon: <CreditCard className="h-6 w-6" /> },
  { name: "Debit Card", icon: <CreditCard className="h-6 w-6" /> },
  { name: "UPI", icon: <span className="text-xs font-bold">UPI</span> },
  { name: "Cash on Delivery", icon: <span className="text-xs font-bold">COD</span> }
];

export function PaymentMethods({ methods = defaultPaymentMethods }: PaymentMethodsProps) {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4 md:p-6">
      <h3 className="text-base md:text-sm font-semibold text-foreground mb-4">Accepted Payment Methods</h3>
      <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-3">
        {methods.map((method, index) => (
          <div
            key={index}
            className="relative flex items-center justify-center rounded-md border border-border bg-card p-3 text-muted-foreground transition-all hover:border-primary hover:text-primary min-h-[44px] min-w-[44px] touch-manipulation"
            onMouseEnter={() => setHoveredMethod(method.name)}
            onMouseLeave={() => setHoveredMethod(null)}
          >
            {method.icon}

            {/* Tooltip */}
            {hoveredMethod === method.name && (
              <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-800 px-3 py-2 text-xs text-white shadow-lg">
                {method.name}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface GuaranteeInfoProps {
  guaranteeText?: string;
  guaranteeDetails?: string;
}

export function GuaranteeInfo({
  guaranteeText = "1-Year Warranty",
  guaranteeDetails = "Comprehensive warranty covering manufacturing defects and material issues"
}: GuaranteeInfoProps) {
  return (
    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 md:p-6">
      <div className="flex items-start gap-3 md:gap-4">
        <Award className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0 text-green-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-green-500 mb-2">{guaranteeText}</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{guaranteeDetails}</p>
        </div>
      </div>
    </div>
  );
}
