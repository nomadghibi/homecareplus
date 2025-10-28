import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Filter,
  FileSpreadsheet,
  FileDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import RevenueReport from "../components/reports/RevenueReport";
import VisitAnalytics from "../components/reports/VisitAnalytics";
import CaregiverPerformance from "../components/reports/CaregiverPerformance";
import ClientProfitability from "../components/reports/ClientProfitability";
import ComparisonView from "../components/reports/ComparisonView";
import RevenueForecast from "../components/reports/RevenueForecast";

export default function Reports() {
  const [dateRange, setDateRange] = useState("current_month");
  const [comparisonPeriod, setComparisonPeriod] = useState("previous_month");
  const [selectedReport, setSelectedReport] = useState("overview");

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list('-scheduled_date'),
  });

  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.Claim.list('-created_date'),
  });

  const { data: evvEvents = [] } = useQuery({
    queryKey: ['evvEvents'],
    queryFn: () => base44.entities.EVVEvent.list('-created_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  // Calculate date ranges
  const getDateRange = (period) => {
    const today = new Date();
    switch (period) {
      case "current_month":
        return { start: startOfMonth(today), end: endOfMonth(today), label: format(today, 'MMMM yyyy') };
      case "previous_month":
        const lastMonth = subMonths(today, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth), label: format(lastMonth, 'MMMM yyyy') };
      case "current_quarter":
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);
        return { start: quarterStart, end: quarterEnd, label: `Q${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}` };
      case "current_year":
        return { start: startOfYear(today), end: endOfYear(today), label: today.getFullYear().toString() };
      default:
        return { start: startOfMonth(today), end: endOfMonth(today), label: format(today, 'MMMM yyyy') };
    }
  };

  const currentRange = getDateRange(dateRange);
  const comparisonRange = getDateRange(comparisonPeriod);

  // Filter data by date range
  const filterByDateRange = (items, dateField, range) => {
    return items.filter(item => {
      if (!item[dateField]) return false;
      const itemDate = new Date(item[dateField]);
      return itemDate >= range.start && itemDate <= range.end;
    });
  };

  const currentVisits = filterByDateRange(visits, 'scheduled_date', currentRange);
  const comparisonVisits = filterByDateRange(visits, 'scheduled_date', comparisonRange);
  const currentClaims = filterByDateRange(claims, 'service_date_from', currentRange);
  const comparisonClaims = filterByDateRange(claims, 'service_date_from', comparisonRange);

  // Calculate key metrics
  const calculateMetrics = (visitsData, claimsData) => {
    const totalVisits = visitsData.length;
    const completedVisits = visitsData.filter(v => v.status === 'completed').length;
    const completionRate = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;
    
    const totalRevenue = claimsData.reduce((sum, c) => sum + (c.total_charge || 0), 0);
    const totalPaid = claimsData.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
    const collectionRate = totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0;
    
    const totalHours = visitsData.reduce((sum, v) => sum + (v.billable_hours || 0), 0);
    const avgRevenuePerVisit = completedVisits > 0 ? totalRevenue / completedVisits : 0;

    return {
      totalVisits,
      completedVisits,
      completionRate,
      totalRevenue,
      totalPaid,
      collectionRate,
      totalHours,
      avgRevenuePerVisit
    };
  };

  const currentMetrics = calculateMetrics(currentVisits, currentClaims);
  const comparisonMetrics = calculateMetrics(comparisonVisits, comparisonClaims);

  // Export functions
  const exportToExcel = () => {
    // Create CSV content
    const csvData = [
      ['HomeCare+ Analytics Report'],
      ['Report Period:', currentRange.label],
      ['Generated:', format(new Date(), 'MMM d, yyyy h:mm a')],
      [''],
      ['SUMMARY METRICS'],
      ['Metric', 'Current Period', 'Previous Period', 'Change'],
      ['Total Visits', currentMetrics.totalVisits, comparisonMetrics.totalVisits, currentMetrics.totalVisits - comparisonMetrics.totalVisits],
      ['Completion Rate', `${currentMetrics.completionRate.toFixed(1)}%`, `${comparisonMetrics.completionRate.toFixed(1)}%`, `${(currentMetrics.completionRate - comparisonMetrics.completionRate).toFixed(1)}%`],
      ['Total Revenue', `$${currentMetrics.totalRevenue.toFixed(2)}`, `$${comparisonMetrics.totalRevenue.toFixed(2)}`, `$${(currentMetrics.totalRevenue - comparisonMetrics.totalRevenue).toFixed(2)}`],
      ['Collection Rate', `${currentMetrics.collectionRate.toFixed(1)}%`, `${comparisonMetrics.collectionRate.toFixed(1)}%`, `${(currentMetrics.collectionRate - comparisonMetrics.collectionRate).toFixed(1)}%`],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homecare-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    // In a real app, use a library like jsPDF or html2pdf
    alert('PDF export would generate a comprehensive report with charts and tables. Requires jsPDF library integration.');
  };

  const reportTypes = [
    {
      id: 'overview',
      title: "Executive Overview",
      description: "High-level KPIs and trends",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 'revenue',
      title: "Revenue Analysis",
      description: "Financial performance and forecasting",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 'visits',
      title: "Visit Analytics",
      description: "Completion rates and patterns",
      icon: Calendar,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 'caregivers',
      title: "Caregiver Performance",
      description: "Individual scorecards and rankings",
      icon: Users,
      color: "from-orange-500 to-red-500"
    },
    {
      id: 'clients',
      title: "Client Profitability",
      description: "Revenue and cost per client",
      icon: TrendingUp,
      color: "from-teal-500 to-green-500"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={exportToPDF} className="bg-gradient-to-r from-indigo-500 to-purple-600 gap-2">
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Report Period
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="previous_month">Previous Month</SelectItem>
                  <SelectItem value="current_quarter">Current Quarter</SelectItem>
                  <SelectItem value="current_year">Current Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Compare With
              </label>
              <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous_month">Previous Month</SelectItem>
                  <SelectItem value="previous_quarter">Previous Quarter</SelectItem>
                  <SelectItem value="previous_year">Previous Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Selector */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          return (
            <Card 
              key={report.id}
              className={`border-none shadow-md cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-indigo-500 scale-105' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${report.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{report.title}</h3>
                <p className="text-xs text-slate-600">{report.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Summary */}
      <ComparisonView
        currentMetrics={currentMetrics}
        comparisonMetrics={comparisonMetrics}
        currentLabel={currentRange.label}
        comparisonLabel={comparisonRange.label}
      />

      {/* Dynamic Report Content */}
      {selectedReport === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <VisitAnalytics visits={currentVisits} clients={clients} caregivers={caregivers} />
          <RevenueReport claims={currentClaims} />
        </div>
      )}

      {selectedReport === 'revenue' && (
        <div className="space-y-6">
          <RevenueReport claims={currentClaims} detailed={true} />
          <RevenueForecast claims={claims} />
          <ClientProfitability clients={clients} visits={currentVisits} claims={currentClaims} />
        </div>
      )}

      {selectedReport === 'visits' && (
        <VisitAnalytics visits={currentVisits} clients={clients} caregivers={caregivers} detailed={true} />
      )}

      {selectedReport === 'caregivers' && (
        <CaregiverPerformance caregivers={caregivers} visits={currentVisits} evvEvents={evvEvents} />
      )}

      {selectedReport === 'clients' && (
        <ClientProfitability clients={clients} visits={currentVisits} claims={currentClaims} detailed={true} />
      )}
    </div>
  );
}