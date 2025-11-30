"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AnimatedInput } from "./animated-input";
import { AnimatedButton } from "./animated-button";
import { animateSuccess, animateError } from "@/lib/utils/auth-animations";
import gsap from "gsap";

const MODAL_DISMISSED_KEY = "auth_modal_dismissed";

export function FirstVisitModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [acceptTerms, setAcceptTerms] = useState(false);

  // Check if modal should be shown
  useEffect(() => {
    const checkModalStatus = async () => {
      try {
        // Check if user is already logged in
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If there's an auth error (like invalid refresh token), clear the session
        if (error) {
          await supabase.auth.signOut();
        }
        
        if (session) return;

        // Check if modal was previously dismissed
        const dismissed = localStorage.getItem(MODAL_DISMISSED_KEY);
        if (!dismissed) {
          // Small delay for better UX
          setTimeout(() => {
            setIsOpen(true);
          }, 500);
        }
      } catch (err) {
        // If any error occurs, try to sign out to clear bad state
        await supabase.auth.signOut();
      }
    };

    checkModalStatus();
  }, []);

  // Animate modal entrance
  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      
      if (!prefersReducedMotion) {
        // Backdrop fade in
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );

        // Modal scale and fade in
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.9, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.2)" }
        );
      }

      // Trap focus
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener("keydown", handleTabKey);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion && modalRef.current && backdropRef.current) {
      // Animate out
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });

      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setIsOpen(false);
          localStorage.setItem(MODAL_DISMISSED_KEY, "true");
        },
      });
    } else {
      setIsOpen(false);
      localStorage.setItem(MODAL_DISMISSED_KEY, "true");
    }
  };

  const handleTabSwitch = (tab: "login" | "signup") => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setError("");

    // Animate tab content
    if (formRef.current) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, x: tab === "login" ? -20 : 20 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        );
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      // Success animation
      if (formRef.current) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!prefersReducedMotion) {
          await animateSuccess(formRef.current);
        }
      }

      localStorage.setItem(MODAL_DISMISSED_KEY, "true");
      setIsOpen(false);
      router.push("/profile");
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);

      // Error animation
      if (formRef.current) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!prefersReducedMotion) {
          const errorElement = formRef.current.querySelector("[data-error]") as HTMLElement;
          if (errorElement) {
            animateError(errorElement);
          }
        }
      }
    } finally {
      setLoading(false);
    }
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
    const passwordError = validatePassword(signupData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Success animation
      if (formRef.current) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!prefersReducedMotion) {
          await animateSuccess(formRef.current);
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        setUserEmail(signupData.email);
        setShowEmailConfirmation(true);
      } else {
        // Auto-login (no email confirmation required)
        localStorage.setItem(MODAL_DISMISSED_KEY, "true");
        setIsOpen(false);
        router.push("/profile");
        router.refresh();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);

      // Error animation
      if (formRef.current) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!prefersReducedMotion) {
          const errorElement = formRef.current.querySelector("[data-error]") as HTMLElement;
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
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength: 66, label: "Medium", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  if (!isOpen) return null;

  const passwordStrength = activeTab === "signup" ? getPasswordStrength(signupData.password) : null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container with Scrolling */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        {/* Modal */}
        <div
          ref={modalRef}
          className="relative w-full bg-gradient-to-br from-neutral-900 via-black to-neutral-900 rounded-2xl shadow-2xl border border-gold-500/20 overflow-hidden"
        >
          {/* Decorative gradient border */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 via-gold-500 to-yellow-600" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="relative p-5 sm:p-6">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-block mb-3">
                <div className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center overflow-hidden bg-white p-1">
                  <img
                    src="/logo-white.jpg"
                    alt="Dazzle Jewels Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-white mb-2">
                Welcome to Dazzle Jewels
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm">
                {activeTab === "signup"
                  ? "Create an account to get started"
                  : "Sign in to your account"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 mb-5 p-1 bg-neutral-800/50 rounded-lg">
              <button
                onClick={() => handleTabSwitch("signup")}
                className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all duration-300 ${
                  activeTab === "signup"
                    ? "bg-gradient-to-r from-yellow-500 via-gold-500 to-yellow-600 text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => handleTabSwitch("login")}
                className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all duration-300 ${
                  activeTab === "login"
                    ? "bg-gradient-to-r from-yellow-500 via-gold-500 to-yellow-600 text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Login
              </button>
            </div>

            {/* Email Confirmation Message */}
            {showEmailConfirmation ? (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Check Your Email</h3>
                  <p className="text-sm text-neutral-400 mb-4">
                    We&apos;ve sent a confirmation email to <span className="text-gold-500 font-medium">{userEmail}</span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    Please click the link in the email to verify your account and complete your registration.
                  </p>
                </div>
                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-yellow-500 via-gold-500 to-yellow-600 text-black font-semibold hover:shadow-lg transition-all"
                  >
                    Got it!
                  </button>
                  <p className="text-xs text-neutral-500">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => setShowEmailConfirmation(false)}
                      className="text-gold-500 hover:text-gold-400 underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <>
            {/* Forms */}
            {activeTab === "login" ? (
              <form ref={formRef} onSubmit={handleLogin} className="space-y-4">
                <AnimatedInput
                  id="modal-login-email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={loginData.email}
                  onChange={(e) => {
                    setLoginData({ ...loginData, email: e.target.value });
                    if (error) setError("");
                  }}
                  required
                  autoComplete="email"
                />

                <AnimatedInput
                  id="modal-login-password"
                  name="password"
                  type="password"
                  label="Password"
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value });
                    if (error) setError("");
                  }}
                  required
                  autoComplete="current-password"
                />

                {error && (
                  <div data-error className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <AnimatedButton type="submit" loading={loading} disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </AnimatedButton>
              </form>
            ) : (
              <form ref={formRef} onSubmit={handleSignup} className="space-y-4">
                <AnimatedInput
                  id="modal-signup-name"
                  name="fullName"
                  type="text"
                  label="Full Name"
                  value={signupData.fullName}
                  onChange={(e) => {
                    setSignupData({ ...signupData, fullName: e.target.value });
                    if (error) setError("");
                  }}
                  required
                  autoComplete="name"
                />

                <AnimatedInput
                  id="modal-signup-email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={signupData.email}
                  onChange={(e) => {
                    setSignupData({ ...signupData, email: e.target.value });
                    if (error) setError("");
                  }}
                  required
                  autoComplete="email"
                />

                <div>
                  <AnimatedInput
                    id="modal-signup-password"
                    name="password"
                    type="password"
                    label="Password"
                    value={signupData.password}
                    onChange={(e) => {
                      setSignupData({ ...signupData, password: e.target.value });
                      if (error) setError("");
                    }}
                    required
                    autoComplete="new-password"
                  />

                  {signupData.password && passwordStrength && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">Password strength</span>
                        <span
                          className={`font-medium ${
                            passwordStrength.label === "Weak"
                              ? "text-red-400"
                              : passwordStrength.label === "Medium"
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
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

                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-gold-500 focus:ring-2 focus:ring-gold-500/50 transition-all cursor-pointer"
                  />
                  <span className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
                    I agree to the{" "}
                    <a href="#" className="text-gold-500 hover:text-gold-400">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-gold-500 hover:text-gold-400">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {error && (
                  <div data-error className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <AnimatedButton type="submit" loading={loading} disabled={loading || !acceptTerms}>
                  {loading ? "Creating account..." : "Create Account"}
                </AnimatedButton>
              </form>
            )}

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-neutral-800/50 text-center">
              <button
                onClick={handleClose}
                className="text-xs sm:text-sm text-neutral-400 hover:text-gold-500 transition-colors"
              >
                Continue browsing →
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
