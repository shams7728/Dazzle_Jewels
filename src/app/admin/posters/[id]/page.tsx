"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlignLeft, AlignCenter, AlignRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PRESET_BACKGROUNDS = [
    { name: "Purple Gradient", value: "bg-gradient-to-r from-purple-900 to-indigo-900" },
    { name: "Rose Gradient", value: "bg-gradient-to-r from-rose-900 to-pink-900" },
    { name: "Amber Gradient", value: "bg-gradient-to-r from-amber-900 to-yellow-900" },
    { name: "Ocean Gradient", value: "bg-gradient-to-r from-blue-900 to-cyan-900" },
    { name: "Emerald Gradient", value: "bg-gradient-to-r from-emerald-900 to-green-900" },
    { name: "Midnight", value: "bg-neutral-900" },
];

const ANIMATION_STYLES = [
    { name: "None", value: "none" },
    { name: "Fade In", value: "fade-in" },
    { name: "Slide Up", value: "slide-up" },
    { name: "Zoom In", value: "zoom-in" },
    { name: "Bounce", value: "bounce" },
];

const THEME_STYLES = [
    { name: "Modern", value: "modern" },
    { name: "Elegant", value: "elegant" },
    { name: "Bold", value: "bold" },
    { name: "Minimal", value: "minimal" },
];

export default function EditPosterPage() {
    const router = useRouter();
    const params = useParams();
    const posterId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [textPosition, setTextPosition] = useState("center");
    const [textColor, setTextColor] = useState("white");
    const [isActive, setIsActive] = useState(true);

    // New Features
    const [animationStyle, setAnimationStyle] = useState("fade-in");
    const [themeStyle, setThemeStyle] = useState("modern");

    // Background State
    const [backgroundType, setBackgroundType] = useState("image");
    const [selectedPreset, setSelectedPreset] = useState(PRESET_BACKGROUNDS[0].value);
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        fetchPoster();
    }, [posterId]);

    const fetchPoster = async () => {
        try {
            const { data, error } = await supabase
                .from("posters")
                .select("*")
                .eq("id", posterId)
                .single();

            if (error) throw error;

            if (data) {
                setTitle(data.title || "");
                setDescription(data.description || "");
                setLink(data.link || "");
                setTextPosition(data.text_position || "center");
                setTextColor(data.text_color || "white");
                setIsActive(data.is_active);
                setBackgroundType(data.background_type || "image");
                setAnimationStyle(data.animation_style || "fade-in");
                setThemeStyle(data.theme_style || "modern");

                if (data.background_type === "preset") {
                    setSelectedPreset(data.image_url);
                } else {
                    setCurrentImageUrl(data.image_url);
                    setImagePreview(data.image_url);
                }
            }
        } catch (error) {
            console.error("Error fetching poster:", error);
            alert("Failed to load poster");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setBackgroundType("image");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            let finalImageUrl = backgroundType === "preset" ? selectedPreset : currentImageUrl;

            // Upload new image if selected
            if (backgroundType === "image" && imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `posters/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("products")
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("products")
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
            }

            // Update database
            const { error: dbError } = await supabase
                .from("posters")
                .update({
                    title,
                    description,
                    link,
                    image_url: finalImageUrl,
                    background_type: backgroundType,
                    text_position: textPosition,
                    text_color: textColor,
                    is_active: isActive,
                    animation_style: animationStyle,
                    theme_style: themeStyle,
                })
                .eq("id", posterId);

            if (dbError) throw dbError;

            router.push("/admin/posters");
            router.refresh();
        } catch (error) {
            console.error("Error updating poster:", error);
            alert("Error updating poster: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    // Preview Component with Animation
    const PosterPreview = () => {
        const getThemeClasses = () => {
            switch (themeStyle) {
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

        const getAnimationClasses = () => {
            switch (animationStyle) {
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

        return (
            <div className={`relative h-64 w-full overflow-hidden rounded-xl border border-neutral-800 ${backgroundType === 'preset' ? selectedPreset : 'bg-neutral-900'}`}>
                {backgroundType === 'image' && imagePreview && (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                )}

                <div className={`absolute inset-0 flex flex-col justify-center p-8 ${textPosition === 'left' ? 'items-start text-left' :
                        textPosition === 'right' ? 'items-end text-right' :
                            'items-center text-center'
                    }`}>
                    <div className={`${backgroundType === 'image' ? 'bg-black/40 p-6 rounded-xl backdrop-blur-sm' : ''} ${getAnimationClasses()} ${getThemeClasses()}`}>
                        {title && (
                            <h3 className={`text-3xl font-bold mb-2 ${textColor === 'white' ? 'text-white' : textColor === 'black' ? 'text-black' : 'text-yellow-500'}`}>
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className={`${textColor === 'white' ? 'text-white/90' : textColor === 'black' ? 'text-black/90' : 'text-yellow-400'}`}>
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/posters">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-white">Edit Poster</h1>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column: Form */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-neutral-800 bg-black p-6">
                        <form onSubmit={handleUpdate} className="space-y-6">
                            {/* Title & Description */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Summer Sale"
                                        className="bg-neutral-900 border-neutral-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a catchy description..."
                                        className="bg-neutral-900 border-neutral-800"
                                    />
                                </div>
                            </div>

                            {/* Theme Style */}
                            <div className="space-y-2">
                                <Label>Theme Style</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {THEME_STYLES.map((theme) => (
                                        <Button
                                            key={theme.value}
                                            type="button"
                                            variant="outline"
                                            className={themeStyle === theme.value ? "bg-yellow-500 text-black border-yellow-500" : "bg-neutral-900 border-neutral-800"}
                                            onClick={() => setThemeStyle(theme.value)}
                                        >
                                            {theme.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Animation Style */}
                            <div className="space-y-2">
                                <Label>Animation</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ANIMATION_STYLES.map((anim) => (
                                        <Button
                                            key={anim.value}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className={animationStyle === anim.value ? "bg-yellow-500 text-black border-yellow-500" : "bg-neutral-900 border-neutral-800"}
                                            onClick={() => setAnimationStyle(anim.value)}
                                        >
                                            {anim.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Settings */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Text Alignment</Label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'left', icon: AlignLeft },
                                            { value: 'center', icon: AlignCenter },
                                            { value: 'right', icon: AlignRight },
                                        ].map((pos) => (
                                            <Button
                                                key={pos.value}
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className={textPosition === pos.value ? "bg-yellow-500 text-black border-yellow-500" : "bg-neutral-900 border-neutral-800"}
                                                onClick={() => setTextPosition(pos.value)}
                                            >
                                                <pos.icon className="h-4 w-4" />
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Text Color</Label>
                                    <div className="flex gap-2">
                                        {['white', 'black', 'yellow'].map((color) => (
                                            <Button
                                                key={color}
                                                type="button"
                                                variant="outline"
                                                className={`${textColor === color ? 'ring-2 ring-yellow-500' : ''} ${color === 'white' ? 'bg-white text-black' :
                                                        color === 'black' ? 'bg-black text-white border-white' :
                                                            'bg-yellow-500 text-black'
                                                    }`}
                                                onClick={() => setTextColor(color)}
                                            >
                                                {color.charAt(0).toUpperCase() + color.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Background Selection */}
                            <div className="space-y-4">
                                <Label>Background Style</Label>
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant={backgroundType === 'image' ? 'default' : 'outline'}
                                        onClick={() => setBackgroundType('image')}
                                        className={backgroundType === 'image' ? "bg-white text-black" : ""}
                                    >
                                        Upload Image
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={backgroundType === 'preset' ? 'default' : 'outline'}
                                        onClick={() => setBackgroundType('preset')}
                                        className={backgroundType === 'preset' ? "bg-white text-black" : ""}
                                    >
                                        Use Preset
                                    </Button>
                                </div>

                                {backgroundType === 'image' ? (
                                    <div className="space-y-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="bg-neutral-900 border-neutral-800"
                                        />
                                        <p className="text-xs text-neutral-500">
                                            {imageFile ? "New image selected" : "Keep current image or upload new"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {PRESET_BACKGROUNDS.map((preset) => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => setSelectedPreset(preset.value)}
                                                className={`h-12 rounded-md ${preset.value} ${selectedPreset === preset.value ? 'ring-2 ring-white' : ''}`}
                                                title={preset.name}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Destination Link</Label>
                                <Input
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="e.g., /products/123"
                                    className="bg-neutral-900 border-neutral-800"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                            </div>

                            <Button type="submit" className="w-full bg-yellow-500 text-black hover:bg-yellow-400" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Update Poster"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Live Preview</h2>
                    <div className="sticky top-6">
                        <PosterPreview />
                        <p className="mt-4 text-sm text-neutral-500">
                            This is how your poster will appear on the home page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
