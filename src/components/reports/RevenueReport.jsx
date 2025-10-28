import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export default function RevenueReport({ claims, detailed = false }) {
  // Revenue by payer
  const revenueByPayer = claims.reduce((acc, claim) => {
    const payer = claim.payer || 'Unknown';
    if (!acc[payer]) {
      acc[payer] = { billed: 0, paid: 0, count: 0 };
    }
    acc[payer].billed += claim.total_charge || 0;
    acc[payer].paid += claim.paid_amount || 0;
    acc[payer].count += 1;
    return acc;
  }, {});

  const payerData = Object.entries(revenueByPayer)
    .map(([name, data]) => ({
      name,
      billed: data.billed,
      paid: data.paid,
      count: data.count,
      collectionRate: data.billed > 0 ? (data.paid / data.billed) * 100 : 0
    }))
    .sort((a, b) => b.billed - a.billed)
    .slice(0, 5);

  // Monthly revenue trend (last 6 months)
  const today = new Date();
  const sixMonthsAgo = subMonths(today, 5);
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: today });

  const monthlyRevenue = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthClaims = claims.filter(c => {
      if (!c.service_date_from) return false;
      const claimDate = new Date(c.service_date_from);
      return claimDate >= monthStart && claimDate <= monthEnd;
    });

    return {
      month: format(month, 'MMM'),
      billed: monthClaims.reduce((sum, c) => sum + (c.total_charge || 0), 0),
      paid: monthClaims.reduce((sum, c) => sum + (c.paid_amount || 0), 0),
      claims: monthClaims.length
    };
  });

  const totalBilled = claims.reduce((sum, c) => sum + (c.total_charge || 0), 0);
  const totalPaid = claims.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
  const totalOutstanding = totalBilled - totalPaid;
  const collectionRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Billed</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">${totalBilled.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Collected</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Outstanding</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">${totalOutstanding.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Collection Rate</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{collectionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="billed" stroke="#3b82f6" strokeWidth={2} name="Billed" />
              <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Collected" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {detailed && (
        <>
          {/* Revenue by Payer */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>Revenue by Payer (Top 5)</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={payerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="billed" fill="#3b82f6" name="Billed" />
                  <Bar dataKey="paid" fill="#10b981" name="Paid" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payer Details Table */}
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>Payer Performance Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Payer</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">Claims</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">Billed</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">Collected</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-700">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payerData.map((payer, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-900">{payer.name}</td>
                        <td className="p-4 text-right text-slate-600">{payer.count}</td>
                        <td className="p-4 text-right font-semibold text-slate-900">${payer.billed.toFixed(2)}</td>
                        <td className="p-4 text-right font-semibold text-green-600">${payer.paid.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <Badge className={`${
                            payer.collectionRate >= 95 ? 'bg-green-100 text-green-700' :
                            payer.collectionRate >= 85 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {payer.collectionRate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}