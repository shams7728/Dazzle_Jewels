"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AnimatedInput } from "@/components/auth/animated-input";
import { AnimatedButton } from "@/components/auth/animated-button";
import { animateSuccess, animateError } from "@/lib/utils/auth-animations";

export default function LoginPage() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            // Success animation
            if (formRef.current) {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (!prefersReducedMotion) {
                    await animateSuccess(formRef.current);
                }
            }

            router.push("/profile");
            router.refresh();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
            
            // Error animation
            if (formRef.current) {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (!prefersReducedMotion) {
                    const errorElement = formRef.current.querySelector('[data-error]') as HTMLElement;
                    if (errorElement) {
                        animateError(errorElement);
                    }
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account"
            footerText="Don't have an account?"
            footerLink="/signup"
            footerLinkText="Sign up"
        >
            <form ref={formRef} onSubmit={handleLogin} className="space-y-6">
                <AnimatedInput
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                />

                <AnimatedInput
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                />

                {/* Remember Me & Forgot Password */}
                <div data-animate className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-all"
                        />
                        <span className="text-neutral-400 group-hover:text-neutral-300 transition-colors">
                            Remember me
                        </span>
                    </label>
                    <a
                        href="#"
                        className="text-gold-500 hover:text-gold-400 transition-colors"
                    >
                        Forgot password?
                    </a>
                </div>

                {/* Error Message */}
                {error && (
                    <div data-error data-animate className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <div data-animate>
                    <AnimatedButton type="submit" loading={loading} disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </AnimatedButton>
                </div>
            </form>
        </AuthLayout>
    );
}
