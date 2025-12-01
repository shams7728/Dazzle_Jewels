import { DashboardStats } from '@/components/admin/dashboard-stats';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { OrdersChart } from '@/components/admin/orders-chart';
import { RecentOrdersTable } from '@/components/admin/recent-orders-table';
import { TopProducts } from '@/components/admin/top-products';
import { LiveActivity } from '@/components/admin/live-activity';
import { ShowcaseStatistics } from '@/components/admin/showcase-statistics';

export default function AdminDashboard() {
    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white lg:text-3xl">Dashboard</h1>
                <p className="text-sm text-neutral-400 lg:text-base">Real-time overview of your store&apos;s performance</p>
            </div>

            {/* Stats Cards */}
            <DashboardStats />

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart />
                <OrdersChart />
            </div>

            {/* Showcase Statistics */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4">Showcase Sections</h2>
                <ShowcaseStatistics />
            </div>

            {/* Products and Activity Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <TopProducts />
                <LiveActivity />
            </div>

            {/* Recent Orders Table */}
            <RecentOrdersTable />
        </div>
    );
}
