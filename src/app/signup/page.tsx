"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AnimatedInput } from "@/components/auth/animated-input";
import { AnimatedButton } from "@/components/auth/animated-button";
import { animateSuccess, animateError } from "@/lib/utils/auth-animations";

export default function SignupPage() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (error) setError("");
    };

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number";
        }
        return null;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!acceptTerms) {
            setError("Please accept the terms and conditions");
            return;
        }

        // Validate password
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
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

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 3) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join Dazzle Jewelry today"
            footerText="Already have an account?"
            footerLink="/login"
            footerLinkText="Sign in"
        >
            <form ref={formRef} onSubmit={handleSignup} className="space-y-6">
                <AnimatedInput
                    id="fullName"
                    name="fullName"
                    type="text"
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    autoComplete="name"
                />

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

                <div>
                    <AnimatedInput
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        autoComplete="new-password"
                    />
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div data-animate className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-neutral-400">Password strength</span>
                                <span className={`font-medium ${
                                    passwordStrength.label === 'Weak' ? 'text-red-400' :
                                    passwordStrength.label === 'Medium' ? 'text-yellow-400' :
                                    'text-green-400'
                                }`}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                    style={{ width: `${passwordStrength.strength}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Terms and Conditions */}
                <div data-animate>
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-all"
                        />
                        <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                            I agree to the{' '}
                            <a href="#" className="text-gold-500 hover:text-gold-400">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-gold-500 hover:text-gold-400">
                                Privacy Policy
                            </a>
                        </span>
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <div data-error data-animate className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <div data-animate>
                    <AnimatedButton type="submit" loading={loading} disabled={loading || !acceptTerms}>
                        {loading ? "Creating account..." : "Create Account"}
                    </AnimatedButton>
                </div>
            </form>
        </AuthLayout>
    );
}
