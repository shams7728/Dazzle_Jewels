"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: "Dazzle Jewelry",
        supportEmail: "support@dazzle.com",
        currency: "INR",
        taxRate: "18",
        shippingFee: "0",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert("Settings saved successfully!");
        }, 1000);
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-neutral-400">Manage your store configuration.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-xl border border-neutral-800 bg-black p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">General Information</h2>

                    <div className="space-y-2">
                        <Label htmlFor="siteName" className="text-white">Store Name</Label>
                        <Input
                            id="siteName"
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supportEmail" className="text-white">Support Email</Label>
                        <Input
                            id="supportEmail"
                            name="supportEmail"
                            type="email"
                            value={settings.supportEmail}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-black p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Store Configuration</h2>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-white">Currency</Label>
                            <Input
                                id="currency"
                                name="currency"
                                value={settings.currency}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taxRate" className="text-white">Tax Rate (%)</Label>
                            <Input
                                id="taxRate"
                                name="taxRate"
                                type="number"
                                value={settings.taxRate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shippingFee" className="text-white">Standard Shipping (₹)</Label>
                            <Input
                                id="shippingFee"
                                name="shippingFee"
                                type="number"
                                value={settings.shippingFee}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
