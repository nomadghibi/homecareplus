import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ServiceRatesTable({ strategy, serviceRates, formatCurrency }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Service Rates</CardTitle>
          <CardDescription>
            Hourly rates and billing rules for {strategy?.name}
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Service Rate
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Type</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead>Min Hours</TableHead>
              <TableHead>Min Charge</TableHead>
              <TableHead>Billing Increment</TableHead>
              <TableHead>Overtime</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceRates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No service rates configured for this strategy
                </TableCell>
              </TableRow>
            ) : (
              serviceRates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {rate.service_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{rate.service_name}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(rate.hourly_rate)}/hr
                  </TableCell>
                  <TableCell>{rate.minimum_hours} hrs</TableCell>
                  <TableCell>{formatCurrency(rate.minimum_charge)}</TableCell>
                  <TableCell>{rate.billing_increment_minutes} min</TableCell>
                  <TableCell>
                    {rate.allow_overtime ? (
                      <span className="text-sm">
                        {rate.overtime_multiplier}x after {rate.overtime_threshold_hours}hrs
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Service Rate Summary */}
        {serviceRates.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Lowest Rate</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(Math.min(...serviceRates.map(r => r.hourly_rate)))}/hr
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Rate</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(
                  serviceRates.reduce((sum, r) => sum + r.hourly_rate, 0) / serviceRates.length
                )}/hr
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Highest Rate</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(Math.max(...serviceRates.map(r => r.hourly_rate)))}/hr
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
