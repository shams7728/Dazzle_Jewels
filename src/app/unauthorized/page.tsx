import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center">
            <div className="rounded-full bg-neutral-900 p-6 mb-6">
                <ShieldAlert className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-neutral-400 max-w-md mb-8 text-lg">
                You do not have permission to view this page. This area is restricted to administrators only.
            </p>
            <Link href="/">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-12 px-8">
                    Return Home
                </Button>
            </Link>
        </div>
    );
}
