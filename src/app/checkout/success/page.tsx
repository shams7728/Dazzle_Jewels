"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 rounded-full bg-green-500/10 p-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white">Order Placed Successfully!</h1>
            <p className="mb-8 text-neutral-400">
                Thank you for your purchase. Your order ID is <span className="text-white font-mono">{orderId}</span>.
            </p>
            <div className="flex gap-4">
                <Link href="/">
                    <Button variant="outline">Return Home</Button>
                </Link>
                <Link href="/products">
                    <Button>Continue Shopping</Button>
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
