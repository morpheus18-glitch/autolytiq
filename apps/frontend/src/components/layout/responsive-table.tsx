import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ResponsiveTableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any, index: number) => ReactNode[];
  renderMobileCard?: (item: any, index: number) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export default function ResponsiveTable({
  headers,
  data,
  renderRow,
  renderMobileCard,
  loading = false,
  emptyMessage = "No data available"
}: ResponsiveTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {renderRow(item, index).map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {data.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              {renderMobileCard ? renderMobileCard(item, index) : (
                <div className="space-y-2">
                  {renderRow(item, index).map((cell, cellIndex) => (
                    <div key={cellIndex} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        {headers[cellIndex]}:
                      </span>
                      <div>{cell}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}