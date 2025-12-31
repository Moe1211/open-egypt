'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PriceChangeReport {
  id: string;
  brand_id: string;
  brand_name: string;
  report_date: string;
  new_entries: number;
  updated_entries: number;
  created_at: string;
}

export default function PriceChangeLogs() {
  const [reports, setReports] = useState<PriceChangeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const response = await fetch('/api/price-changes?limit=5');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch price changes');
        }

        setReports(result.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching price changes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Daily Price Change Reports
        </CardTitle>
        {/* <CardDescription> */}
          {/* Track daily updates to the car prices database. Shows new entries and price updates by brand. */}
        {/* </CardDescription> */}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading reports...
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
            Error: {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No price change reports available yet.
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="rounded-md border">
            <Table>
              {/* <TableCaption> */}
                {/* Showing the most recent price change reports. Reports are generated daily during price sync operations. */}
              {/* </TableCaption> */}
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">New Entries</TableHead>
                  <TableHead className="text-right">Updated Entries</TableHead>
                  <TableHead className="text-right">Total Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {formatDate(report.report_date)}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{report.brand_name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {report.new_entries > 0 ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          +{report.new_entries}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {report.updated_entries > 0 ? (
                        <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                          {report.updated_entries}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {report.new_entries + report.updated_entries}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

