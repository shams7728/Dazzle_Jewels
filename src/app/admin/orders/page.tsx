"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Eye, Search, ChevronLeft, ChevronRight, Calendar, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { orderService } from "@/lib/services/order-service";
import type { OrderStatus, OrderFilters, PaginatedOrders } from "@/types/order-management";

type SortField = 'created_at' | 'total' | 'status';
type SortDirection = 'asc' | 'desc';

export default function AdminOrdersPage() {
    const [paginatedData, setPaginatedData] = useState<PaginatedOrders | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const filters: OrderFilters = {};
            
            if (statusFilter !== 'all') {
                filters.status = [statusFilter];
            }
            
            if (searchQuery.trim()) {
                filters.searchQuery = searchQuery.trim();
            }
            
            if (dateFrom) {
                filters.dateFrom = new Date(dateFrom);
            }
            
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                filters.dateTo = endDate;
            }

            const data = await orderService.getOrders(filters, { page: currentPage, limit: 20 });
            
            // Apply client-side sorting if needed
            if (data.orders) {
                data.orders.sort((a, b) => {
                    let comparison = 0;
                    if (sortField === 'created_at') {
                        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    } else if (sortField === 'total') {
                        comparison = a.total - b.total;
                    } else if (sortField === 'status') {
                        comparison = a.status.localeCompare(b.status);
                    }
                    return sortDirection === 'asc' ? comparison : -comparison;
                });
            }
            
            setPaginatedData(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, searchQuery, dateFrom, dateTo, sortField, sortDirection]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleStatusFilter = (status: OrderStatus | 'all') => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "text-green-500 bg-green-500/10";
            case "shipped": return "text-blue-500 bg-blue-500/10";
            case "processing": return "text-yellow-500 bg-yellow-500/10";
            case "confirmed": return "text-cyan-500 bg-cyan-500/10";
            case "pending": return "text-orange-500 bg-orange-500/10";
            case "cancelled": return "text-red-500 bg-red-500/10";
            default: return "text-neutral-400 bg-neutral-800";
        }
    };

    const orders = paginatedData?.orders || [];
    const totalPages = paginatedData?.totalPages || 0;
    const total = paginatedData?.total || 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Orders</h1>
                    <p className="text-neutral-400">Manage customer orders ({total} total)</p>
                </div>
            </div>

            {/* Filters */}
            <div className="space-y-4 rounded-xl border border-neutral-800 bg-black p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search by order number, customer name, or email..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full rounded-lg bg-neutral-900 py-2 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <select 
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | 'all')}
                        className="rounded-lg bg-neutral-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Date Range Picker */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-neutral-500" />
                        <span className="text-sm text-neutral-400">Date Range:</span>
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <span className="text-neutral-500">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>
                    {(dateFrom || dateTo) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setDateFrom('');
                                setDateTo('');
                                setCurrentPage(1);
                            }}
                            className="text-neutral-400 hover:text-white"
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-400">
                        <thead className="bg-neutral-900 text-neutral-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order #</th>
                                <th className="px-6 py-4 font-medium">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="flex items-center gap-1 hover:text-white"
                                    >
                                        Date
                                        <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="flex items-center gap-1 hover:text-white"
                                    >
                                        Status
                                        <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </th>
                                <th className="px-6 py-4 font-medium">
                                    <button
                                        onClick={() => handleSort('total')}
                                        className="flex items-center gap-1 hover:text-white"
                                    >
                                        Total
                                        <ArrowUpDown className="h-3 w-3" />
                                    </button>
                                </th>
                                <th className="px-6 py-4 font-medium">Payment</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-yellow-500" />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        className="cursor-pointer hover:bg-neutral-900/50 transition-colors"
                                        onClick={() => window.location.href = `/admin/orders/${order.id}`}
                                    >
                                        <td className="px-6 py-4 font-mono text-xs text-yellow-500">
                                            {order.order_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                <span className="text-xs text-neutral-500">
                                                    {new Date(order.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white">{order.shipping_address?.name || "Guest"}</span>
                                                <span className="text-xs text-neutral-500">{order.shipping_address?.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            ₹{order.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium border ${
                                                order.payment_status === 'completed' 
                                                    ? 'border-green-500/20 text-green-500 bg-green-500/5' 
                                                    : order.payment_status === 'failed'
                                                    ? 'border-red-500/20 text-red-500 bg-red-500/5'
                                                    : order.payment_status === 'refunded'
                                                    ? 'border-purple-500/20 text-purple-500 bg-purple-500/5'
                                                    : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'
                                            }`}>
                                                {order.payment_status === 'completed' && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                                                {order.payment_status === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />}
                                                {order.payment_status === 'failed' && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                                                {order.payment_status === 'refunded' && <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />}
                                                {order.payment_status?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/orders/${order.id}`} onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/50 px-6 py-4">
                        <div className="text-sm text-neutral-400">
                            Page {currentPage} of {totalPages} ({total} total orders)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="text-neutral-400 hover:text-white disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="text-neutral-400 hover:text-white disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
