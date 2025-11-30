"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/utils/animations";

export interface ProductTabsProps {
  description: string;
  specifications?: Record<string, string>;
  shippingInfo?: string;
  returnPolicy?: string;
}

type TabType = "description" | "specifications" | "shipping";

export function ProductTabs({
  description,
  specifications,
  shippingInfo,
  returnPolicy,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [openAccordions, setOpenAccordions] = useState<Set<TabType>>(
    new Set(["description"])
  );
  
  // Detect reduced motion preference
  const prefersReducedMotion = usePrefersReducedMotion();

  const toggleAccordion = (tab: TabType) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tab)) {
        newSet.delete(tab);
      } else {
        newSet.add(tab);
      }
      return newSet;
    });
  };

  const tabs = [
    { id: "description" as TabType, label: "Description" },
    { id: "specifications" as TabType, label: "Specifications" },
    { id: "shipping" as TabType, label: "Shipping & Returns" },
  ];

  return (
    <div className="w-full">
      {/* Desktop Tab Navigation */}
      <div className="hidden md:block">
        <div className="border-b border-neutral-800">
          <div className="flex gap-4 lg:gap-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative pb-4 px-2 text-sm font-medium whitespace-nowrap touch-manipulation min-h-[44px] flex items-center",
                  !prefersReducedMotion && "transition-colors duration-200",
                  activeTab === tab.id
                    ? "text-yellow-500"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
                style={{
                  transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="py-6">
          {activeTab === "description" && (
            <div 
              className={cn(
                !prefersReducedMotion && "animate-fade-in"
              )}
              style={{
                animationDuration: prefersReducedMotion ? '0ms' : '300ms',
              }}
            >
              <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div 
              className={cn(
                !prefersReducedMotion && "animate-fade-in"
              )}
              style={{
                animationDuration: prefersReducedMotion ? '0ms' : '300ms',
              }}
            >
              {specifications && Object.keys(specifications).length > 0 ? (
                <SpecificationsTable specifications={specifications} />
              ) : (
                <p className="text-neutral-400">
                  No specifications available for this product.
                </p>
              )}
            </div>
          )}

          {activeTab === "shipping" && (
            <div 
              className={cn(
                "space-y-6",
                !prefersReducedMotion && "animate-fade-in"
              )}
              style={{
                animationDuration: prefersReducedMotion ? '0ms' : '300ms',
              }}
            >
              {shippingInfo && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Shipping Information
                  </h3>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {shippingInfo}
                  </p>
                </div>
              )}
              {returnPolicy && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Return Policy
                  </h3>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {returnPolicy}
                  </p>
                </div>
              )}
              {!shippingInfo && !returnPolicy && (
                <p className="text-neutral-400">
                  No shipping or return information available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Accordion Layout */}
      <div className="md:hidden space-y-4">
        {/* Description Accordion */}
        <AccordionItem
          title="Description"
          isOpen={openAccordions.has("description")}
          onToggle={() => toggleAccordion("description")}
        >
          <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </AccordionItem>

        {/* Specifications Accordion */}
        <AccordionItem
          title="Specifications"
          isOpen={openAccordions.has("specifications")}
          onToggle={() => toggleAccordion("specifications")}
        >
          {specifications && Object.keys(specifications).length > 0 ? (
            <SpecificationsTable specifications={specifications} />
          ) : (
            <p className="text-neutral-400">
              No specifications available for this product.
            </p>
          )}
        </AccordionItem>

        {/* Shipping & Returns Accordion */}
        <AccordionItem
          title="Shipping & Returns"
          isOpen={openAccordions.has("shipping")}
          onToggle={() => toggleAccordion("shipping")}
        >
          <div className="space-y-6">
            {shippingInfo && (
              <div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  Shipping Information
                </h3>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {shippingInfo}
                </p>
              </div>
            )}
            {returnPolicy && (
              <div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  Return Policy
                </h3>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {returnPolicy}
                </p>
              </div>
            )}
            {!shippingInfo && !returnPolicy && (
              <p className="text-neutral-400">
                No shipping or return information available.
              </p>
            )}
          </div>
        </AccordionItem>
      </div>
    </div>
  );
}

// Accordion Item Component for Mobile
interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionItem({
  title,
  isOpen,
  onToggle,
  children,
}: AccordionItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between bg-neutral-900 px-4 py-4 text-left hover:bg-neutral-800 min-h-[56px] touch-manipulation",
          !prefersReducedMotion && "transition-colors duration-200"
        )}
        style={{
          transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
        }}
      >
        <span className="font-medium text-white text-base">{title}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-neutral-400 flex-shrink-0 ml-2",
            !prefersReducedMotion && "transition-transform duration-300",
            isOpen && "rotate-180"
          )}
          style={{
            transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
          }}
        />
      </button>
      <div
        className={cn(
          "ease-in-out",
          !prefersReducedMotion && "transition-all duration-300",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
        style={{
          transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
        }}
      >
        <div className="px-4 py-4 bg-black/20">{children}</div>
      </div>
    </div>
  );
}

// Specifications Table Component
interface SpecificationsTableProps {
  specifications: Record<string, string>;
}

function SpecificationsTable({ specifications }: SpecificationsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800">
      <table className="w-full">
        <tbody className="divide-y divide-neutral-800">
          {Object.entries(specifications).map(([key, value], index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? "bg-neutral-900/50" : "bg-black/20"}
            >
              <td className="px-4 py-3 text-sm font-medium text-neutral-400 w-1/3">
                {key}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-200">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
