import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ClientProfitability({ clients, visits, claims, detailed = false }) {
  // Calculate profitability per client
  const clientProfitability = clients.map(client => {
    const clientVisits = visits.filter(v => v.client_id === client.id && v.status === 'completed');
    const clientClaims = claims.filter(c => c.client_id === client.id);
    
    const totalRevenue = clientClaims.reduce((sum, c) => sum + (c.total_charge || 0), 0);
    const totalPaid = clientClaims.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
    const totalHours = clientVisits.reduce((sum, v) => sum + (v.billable_hours || 0), 0);
    
    // Estimate labor cost (using average rate of $20/hr for demo)
    const avgHourlyRate = 20;
    const laborCost = totalHours * avgHourlyRate;
    
    // Calculate profit (simplified)
    const grossProfit = totalPaid - laborCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const revenuePerVisit = clientVisits.length > 0 ? totalRevenue / clientVisits.length : 0;

    return {
      id: client.id,
      name: `${client.first_name} ${client.last_name}`,
      careLevel: client.care_level,
      totalRevenue,
      totalPaid,
      laborCost,
      grossProfit,
      profitMargin,
      totalVisits: clientVisits.length,
      totalHours,
      revenuePerVisit
    };
  }).filter(c => c.totalVisits > 0).sort((a, b) => b.grossProfit - a.b);

  const topProfitable = clientProfitability.slice(0, 10);
  
  const totalRevenue = clientProfitability.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalProfit = clientProfitability.reduce((sum, c) => sum + c.grossProfit, 0);
  const avgProfitMargin = clientProfitability.length > 0
    ? clientProfitability.reduce((sum, c) => sum + c.profitMargin, 0) / clientProfitability.length
    : 0;

  // Group by care level
  const careLevelData = ['basic', 'moderate', 'intensive'].map(level => {
    const levelClients = clientProfitability.filter(c => c.careLevel === level);
    const revenue = levelClients.reduce((sum, c) => sum + c.totalRevenue, 0);
    const profit = levelClients.reduce((sum, c) => sum + c.grossProfit, 0);
    const avgMargin = levelClients.length > 0
      ? levelClients.reduce((sum, c) => sum + c.profitMargin, 0) / levelClients.length
      : 0;

    return {
      level: level.charAt(0).toUpperCase() + level.slice(1),
      revenue,
      profit,
      margin: avgMargin,
      clients: levelClients.length
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Gross Profit</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">${totalProfit.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Avg Profit Margin</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{avgProfitMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Active Clients</span>
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{clientProfitability.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Profitability by Care Level */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Profitability by Care Level</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={careLevelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="profit" fill="#10b981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Profitable Clients */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Top 10 Most Profitable Clients</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Client</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700">Care Level</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Visits</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Revenue</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Labor Cost</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Gross Profit</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topProfitable.map((client, idx) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </Badge>
                        <span className="font-medium text-slate-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={`${
                        client.careLevel === 'intensive' ? 'bg-red-100 text-red-700' :
                        client.careLevel === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {client.careLevel}
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-slate-600">{client.totalVisits}</td>
                    <td className="p-4 text-right font-semibold text-blue-600">${client.totalRevenue.toFixed(2)}</td>
                    <td className="p-4 text-right text-slate-600">${client.laborCost.toFixed(2)}</td>
                    <td className="p-4 text-right font-semibold text-green-600">${client.grossProfit.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {client.profitMargin > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={client.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                          {client.profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}