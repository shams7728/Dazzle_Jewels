"use client";

/**
 * Poster Style Preview Component
 * 
 * This component shows visual examples of all theme and animation combinations
 * Useful for admins to understand the different styles available
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";

const THEMES = [
    { value: "modern", name: "Modern", description: "Clean sans-serif" },
    { value: "elegant", name: "Elegant", description: "Sophisticated serif" },
    { value: "bold", name: "Bold", description: "Strong impact" },
    { value: "minimal", name: "Minimal", description: "Light & spacious" },
];

const ANIMATIONS = [
    { value: "none", name: "None" },
    { value: "fade-in", name: "Fade In" },
    { value: "slide-up", name: "Slide Up" },
    { value: "zoom-in", name: "Zoom In" },
    { value: "bounce", name: "Bounce" },
];

const COLORS = [
    { value: "white", name: "White", bg: "bg-gradient-to-r from-purple-900 to-indigo-900" },
    { value: "black", name: "Black", bg: "bg-gradient-to-r from-amber-400 to-yellow-400" },
    { value: "yellow", name: "Yellow", bg: "bg-gradient-to-r from-neutral-900 to-neutral-800" },
];

export function PosterStylePreview() {
    const [selectedTheme, setSelectedTheme] = useState("modern");
    const [selectedAnimation, setSelectedAnimation] = useState("fade-in");
    const [selectedColor, setSelectedColor] = useState("white");
    const [key, setKey] = useState(0);

    const getThemeClasses = (theme: string) => {
        switch (theme) {
            case "elegant":
                return "font-serif";
            case "bold":
                return "font-black tracking-tight";
            case "minimal":
                return "font-light tracking-wide";
            default:
                return "font-sans";
        }
    };

    const getAnimationClasses = (animation: string) => {
        switch (animation) {
            case "fade-in":
                return "animate-fade-in";
            case "slide-up":
                return "animate-slide-up";
            case "zoom-in":
                return "animate-zoom-in";
            case "bounce":
                return "animate-bounce-in";
            default:
                return "";
        }
    };

    const getTextColorClasses = (color: string) => {
        switch (color) {
            case "black":
                return "text-black";
            case "yellow":
                return "text-yellow-500";
            default:
                return "text-white";
        }
    };

    const getCurrentBg = () => {
        return COLORS.find(c => c.value === selectedColor)?.bg || COLORS[0].bg;
    };

    const replayAnimation = () => {
        setKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6 p-6 bg-neutral-900 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Style Preview</h3>
                <Button 
                    onClick={replayAnimation}
                    variant="outline"
                    size="sm"
                    className="bg-neutral-800 border-neutral-700"
                >
                    Replay Animation
                </Button>
            </div>

            {/* Preview Area */}
            <div className={`relative h-64 w-full overflow-hidden rounded-xl ${getCurrentBg()}`}>
                <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
                    <div 
                        key={key}
                        className={`
                            ${getAnimationClasses(selectedAnimation)} 
                            ${getThemeClasses(selectedTheme)}
                            text-center
                        `}
                    >
                        <h2 className={`text-4xl font-bold mb-3 ${getTextColorClasses(selectedColor)} drop-shadow-lg`}>
                            Sample Poster Title
                        </h2>
                        <p className={`text-lg ${selectedColor === 'black' ? 'text-black/90' : selectedColor === 'yellow' ? 'text-yellow-400' : 'text-white/90'} drop-shadow-md`}>
                            This is how your poster will look with these settings
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Theme Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Theme Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {THEMES.map((theme) => (
                            <button
                                key={theme.value}
                                onClick={() => setSelectedTheme(theme.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                    selectedTheme === theme.value
                                        ? 'bg-yellow-500 text-black border-yellow-500'
                                        : 'bg-neutral-800 text-white border-neutral-700 hover:border-neutral-600'
                                }`}
                            >
                                <div className="font-semibold text-sm">{theme.name}</div>
                                <div className="text-xs opacity-70">{theme.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Animation Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Animation</label>
                    <div className="grid grid-cols-2 gap-2">
                        {ANIMATIONS.map((anim) => (
                            <button
                                key={anim.value}
                                onClick={() => {
                                    setSelectedAnimation(anim.value);
                                    replayAnimation();
                                }}
                                className={`p-3 rounded-lg border text-center transition-all ${
                                    selectedAnimation === anim.value
                                        ? 'bg-yellow-500 text-black border-yellow-500'
                                        : 'bg-neutral-800 text-white border-neutral-700 hover:border-neutral-600'
                                }`}
                            >
                                <div className="font-semibold text-sm">{anim.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Text Color</label>
                    <div className="grid grid-cols-1 gap-2">
                        {COLORS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setSelectedColor(color.value)}
                                className={`p-3 rounded-lg border text-center transition-all ${
                                    selectedColor === color.value
                                        ? 'bg-yellow-500 text-black border-yellow-500'
                                        : 'bg-neutral-800 text-white border-neutral-700 hover:border-neutral-600'
                                }`}
                            >
                                <div className="font-semibold text-sm">{color.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                <p className="text-sm text-neutral-300">
                    <span className="font-semibold text-white">Current Selection:</span> {' '}
                    {THEMES.find(t => t.value === selectedTheme)?.name} theme with {' '}
                    {ANIMATIONS.find(a => a.value === selectedAnimation)?.name} animation and {' '}
                    {COLORS.find(c => c.value === selectedColor)?.name} text
                </p>
            </div>
        </div>
    );
}
