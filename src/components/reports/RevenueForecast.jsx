import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, addMonths } from "date-fns";

export default function RevenueForecast({ claims }) {
  // Get historical data (last 6 months)
  const today = new Date();
  const sixMonthsAgo = addMonths(today, -5);
  const historicalMonths = eachMonthOfInterval({ start: sixMonthsAgo, end: today });

  const historicalData = historicalMonths.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthClaims = claims.filter(c => {
      if (!c.service_date_from) return false;
      const claimDate = new Date(c.service_date_from);
      return claimDate >= monthStart && claimDate <= monthEnd;
    });

    const revenue = monthClaims.reduce((sum, c) => sum + (c.total_charge || 0), 0);

    return {
      month: format(month, 'MMM yyyy'),
      revenue,
      type: 'historical'
    };
  });

  // Simple linear forecast for next 3 months
  const avgGrowthRate = historicalData.length >= 2
    ? (historicalData[historicalData.length - 1].revenue - historicalData[0].revenue) / historicalData.length
    : 0;

  const lastRevenue = historicalData[historicalData.length - 1]?.revenue || 0;

  const forecastMonths = [1, 2, 3].map(i => {
    const forecastMonth = addMonths(today, i);
    const forecastedRevenue = lastRevenue + (avgGrowthRate * i);
    
    // Add some variance for upper/lower bounds
    const variance = forecastedRevenue * 0.1;

    return {
      month: format(forecastMonth, 'MMM yyyy'),
      revenue: forecastedRevenue,
      lower: forecastedRevenue - variance,
      upper: forecastedRevenue + variance,
      type: 'forecast'
    };
  });

  const allData = [...historicalData, ...forecastMonths];

  const totalForecastedRevenue = forecastMonths.reduce((sum, m) => sum + m.revenue, 0);
  const growthRate = historicalData.length >= 2
    ? ((lastRevenue - historicalData[0].revenue) / historicalData[0].revenue) * 100
    : 0;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Revenue Forecast (Next 3 Months)
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Historical
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Projected
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Current Month</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ${lastRevenue.toFixed(0)}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Projected (Q1)</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              ${totalForecastedRevenue.toFixed(0)}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 font-medium">Growth Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={allData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              fillOpacity={1}
              fill="url(#colorRevenue)" 
              name="Revenue"
              connectNulls
            />
            <Area 
              type="monotone" 
              dataKey="upper" 
              stroke="#10b981" 
              strokeDasharray="5 5"
              fillOpacity={0.3}
              fill="url(#colorForecast)" 
              name="Upper Bound"
            />
            <Area 
              type="monotone" 
              dataKey="lower" 
              stroke="#10b981" 
              strokeDasharray="5 5"
              fillOpacity={0.3}
              fill="url(#colorForecast)" 
              name="Lower Bound"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Forecast Assumptions */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-2">Forecast Assumptions</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Based on {historicalData.length}-month historical trend</li>
            <li>• Linear projection with ±10% confidence interval</li>
            <li>• Assumes current client base and service mix remain constant</li>
            <li>• Does not account for seasonal variations or market changes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}