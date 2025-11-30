"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface MobileBackButtonProps {
  fallbackHref?: string;
  className?: string;
}

export function MobileBackButton({ fallbackHref = "/products", className = "" }: MobileBackButtonProps) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // Check if there's browser history
    setHasHistory(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (hasHistory) {
      router.back();
    } else {
      // Fallback to products page if no history
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center text-sm text-neutral-400 transition-colors hover:text-white ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
