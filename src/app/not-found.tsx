import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
            <div className="rounded-full bg-neutral-900 p-6 mb-6">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-neutral-400 max-w-md mb-8 text-lg">
                Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
            </p>
            <Link href="/">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-12 px-8">
                    Return Home
                </Button>
            </Link>
        </div>
    );
}
