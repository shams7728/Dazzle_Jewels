'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import type { ReportMetrics, OrderStatus } from '@/types/order-management';

// Lazy load ReportDisplay to reduce initial bundle size
const ReportDisplay = dynamic(
  () => import('@/components/admin/report-display').then(mod => ({ default: mod.ReportDisplay })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-yellow-500 mb-2" />
          <p className="text-sm text-neutral-400">Loading report display...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${jobId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'completed') {
        // Job completed successfully
        setMetrics(data.data);
        setJobStatus('completed');
        setLoading(false);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      } else if (data.status === 'failed') {
        // Job failed
        setError(data.error || 'Report generation failed');
        setJobStatus('failed');
        setLoading(false);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      } else {
        // Still processing
        setJobStatus(data.status);
      }
    } catch (err) {
      console.error('Error polling job status:', err);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setMetrics(null);
    setJobId(null);
    setJobStatus(null);

    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (dateFrom) {
        params.append('dateFrom', new Date(dateFrom).toISOString());
      }
      
      if (dateTo) {
        params.append('dateTo', new Date(dateTo).toISOString());
      }
      
      if (selectedStatus.length > 0) {
        params.append('status', selectedStatus.join(','));
      }
      
      if (productId) {
        params.append('product_id', productId);
      }

      const response = await fetch(`/api/admin/reports?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 202) {
        // Async processing - start polling
        setJobId(data.jobId);
        setJobStatus('processing');
        
        // Poll every 2 seconds
        const interval = setInterval(() => {
          pollJobStatus(data.jobId);
        }, 2000);
        
        setPollingInterval(interval);
      } else if (response.ok) {
        // Sync response - display immediately
        setMetrics(data);
        setLoading(false);
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      setLoading(false);
    }
  };

  const toggleStatus = (status: OrderStatus) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order Reports & Analytics</h1>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date Range */}
          <div>
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-4">
          <Label className="mb-2 block">Order Status</Label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus.includes(status)
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Filter */}
        <div className="mb-4">
          <Label htmlFor="productId">Product ID (Optional)</Label>
          <Input
            id="productId"
            type="text"
            placeholder="Enter product ID to filter by specific product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={loading}
          className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Generating Report...
            </>
          ) : (
            'Generate Report'
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Async Processing Status */}
      {loading && jobId && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Processing Large Dataset</p>
          <p className="text-sm">
            Your report is being generated asynchronously. Job ID: {jobId}
          </p>
          <p className="text-sm mt-1">
            Status: <span className="font-semibold">{jobStatus || 'pending'}</span>
          </p>
          <div className="mt-2">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Report Display */}
      {metrics && <ReportDisplay metrics={metrics} />}

      {/* Empty State */}
      {!metrics && !loading && !error && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">
            Select filters and click "Generate Report" to view analytics
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Large datasets will be processed asynchronously
          </p>
        </div>
      )}
    </div>
  );
}
