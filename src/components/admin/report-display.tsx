'use client';

import { Button } from '@/components/ui/button';
import type { ReportMetrics } from '@/types/order-management';

interface ReportDisplayProps {
  metrics: ReportMetrics;
}

// Helper function to export as CSV
function exportToCSV(metrics: ReportMetrics) {
  const csvRows = [
    // Header
    ['Metric', 'Value'],
    ['Total Orders', metrics.total_orders.toString()],
    ['Total Revenue', `₹${metrics.total_revenue.toFixed(2)}`],
    ['Average Order Value', `₹${metrics.average_order_value.toFixed(2)}`],
    [''],
    ['Status', 'Order Count', 'Total Revenue', '% of Orders', 'Avg Order Value'],
    ...metrics.status_breakdown.map(breakdown => {
      const percentage = (breakdown.count / metrics.total_orders) * 100;
      const avgValue = breakdown.total_revenue / breakdown.count;
      return [
        breakdown.status,
        breakdown.count.toString(),
        `₹${breakdown.total_revenue.toFixed(2)}`,
        `${percentage.toFixed(1)}%`,
        `₹${avgValue.toFixed(2)}`
      ];
    })
  ];

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `order-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function to export as PDF (using browser print)
function exportToPDF() {
  window.print();
}

export function ReportDisplay({ metrics }: ReportDisplayProps) {
  // Calculate percentages for visual charts
  const maxRevenue = Math.max(...metrics.status_breakdown.map(b => b.total_revenue), 1);

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex gap-3 justify-end print:hidden">
        <Button
          onClick={() => exportToCSV(metrics)}
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
        <Button
          onClick={exportToPDF}
          variant="outline"
          className="border-red-500 text-red-700 hover:bg-red-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Export PDF
        </Button>
      </div>
      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Report</h1>
        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">Total Orders</p>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-blue-900">{metrics.total_orders.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">Total number of orders</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">Total Revenue</p>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-green-900">
            ₹{metrics.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-green-600 mt-1">Cumulative revenue</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-700">Average Order Value</p>
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-4xl font-bold text-purple-900">
            ₹{metrics.average_order_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-purple-600 mt-1">Per order average</p>
        </div>
      </div>

      {/* Status Breakdown Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Status Breakdown</h3>
        
        {/* Visual Bar Chart */}
        <div className="mb-6 space-y-3">
          {metrics.status_breakdown.map((breakdown) => {
            const percentage = (breakdown.count / metrics.total_orders) * 100;
            const revenuePercentage = (breakdown.total_revenue / maxRevenue) * 100;
            
            return (
              <div key={breakdown.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                    breakdown.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    breakdown.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    breakdown.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    breakdown.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                    breakdown.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {breakdown.status.charAt(0).toUpperCase() + breakdown.status.slice(1)}
                  </span>
                  <span className="text-gray-600">
                    {breakdown.count} orders ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      breakdown.status === 'delivered' ? 'bg-green-500' :
                      breakdown.status === 'shipped' ? 'bg-blue-500' :
                      breakdown.status === 'processing' ? 'bg-yellow-500' :
                      breakdown.status === 'confirmed' ? 'bg-purple-500' :
                      breakdown.status === 'cancelled' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-right">
                  Revenue: ₹{breakdown.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.status_breakdown.map((breakdown) => {
                const percentage = (breakdown.count / metrics.total_orders) * 100;
                const avgValue = breakdown.total_revenue / breakdown.count;
                
                return (
                  <tr key={breakdown.status} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        breakdown.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        breakdown.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        breakdown.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        breakdown.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                        breakdown.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {breakdown.status.charAt(0).toUpperCase() + breakdown.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {breakdown.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{breakdown.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="mr-2">{percentage.toFixed(1)}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{avgValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 text-sm text-gray-900">{metrics.total_orders.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ₹{metrics.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">100%</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ₹{metrics.average_order_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status Distribution Pie Chart (CSS-based) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none print:border-0">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Order Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.status_breakdown.map((breakdown) => {
            const percentage = (breakdown.count / metrics.total_orders) * 100;
            
            return (
              <div key={breakdown.status} className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${percentage * 2.51} 251`}
                      className={
                        breakdown.status === 'delivered' ? 'text-green-500' :
                        breakdown.status === 'shipped' ? 'text-blue-500' :
                        breakdown.status === 'processing' ? 'text-yellow-500' :
                        breakdown.status === 'confirmed' ? 'text-purple-500' :
                        breakdown.status === 'cancelled' ? 'text-red-500' :
                        'text-gray-500'
                      }
                    />
                  </svg>
                  <span className="absolute text-lg font-bold text-gray-900">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                  breakdown.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  breakdown.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  breakdown.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  breakdown.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                  breakdown.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {breakdown.status.charAt(0).toUpperCase() + breakdown.status.slice(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{breakdown.count} orders</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
