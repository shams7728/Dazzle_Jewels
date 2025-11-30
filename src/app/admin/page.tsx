import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { ShowcaseStatistics } from '@/components/admin/showcase-statistics';

const stats = [
    { label: 'Total Revenue', value: '₹45,231', icon: DollarSign, change: '+20.1%' },
    { label: 'Active Orders', value: '12', icon: ShoppingBag, change: '+2' },
    { label: 'Products', value: '48', icon: Package, change: '+4' },
    { label: 'Customers', value: '2,300', icon: Users, change: '+180' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-6 lg:space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white lg:text-3xl">Dashboard</h1>
                <p className="text-sm text-neutral-400 lg:text-base">Overview of your store&apos;s performance.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-neutral-800 bg-black p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-neutral-900 p-2 text-yellow-500">
                                <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                            </div>
                            <span className="text-xs font-medium text-green-500 lg:text-sm">{stat.change}</span>
                        </div>
                        <div className="mt-3 lg:mt-4">
                            <p className="text-xs font-medium text-neutral-400 lg:text-sm">{stat.label}</p>
                            <h3 className="text-xl font-bold text-white lg:text-2xl">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-base font-bold text-white mb-3 lg:text-lg lg:mb-4">Showcase Sections</h2>
                <ShowcaseStatistics />
            </div>

            <div className="rounded-xl border border-neutral-800 bg-black p-4 lg:p-6">
                <h2 className="text-base font-bold text-white lg:text-lg">Recent Orders</h2>
                <div className="mt-4 h-48 flex items-center justify-center text-neutral-500 lg:h-64">
                    Chart or Table Placeholder
                </div>
            </div>
        </div>
    );
}
