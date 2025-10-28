import { useState } from 'react';
import { Plus, DollarSign, TrendingUp, Settings, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockPricingStrategies } from '@/api/mockData';
import StrategyForm from '@/components/pricing/StrategyForm';
import ServiceRatesTable from '@/components/pricing/ServiceRatesTable';
import RateModifiersTable from '@/components/pricing/RateModifiersTable';

export default function PricingStrategies() {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  const [activeTab, setActiveTab] = useState('strategies');

  // Get default strategy
  const defaultStrategy = mockPricingStrategies.strategies.find(s => s.is_default);
  const currentStrategy = selectedStrategy || defaultStrategy;

  // Get service rates for selected strategy
  const strategyServiceRates = mockPricingStrategies.serviceRates.filter(
    sr => sr.pricing_strategy_id === currentStrategy?.id
  );

  // Get rate modifiers for selected strategy
  const strategyModifiers = mockPricingStrategies.rateModifiers.filter(
    rm => rm.pricing_strategy_id === currentStrategy?.id
  );

  // Get mileage rates for selected strategy
  const strategyMileageRates = mockPricingStrategies.mileageRates.filter(
    mr => mr.pricing_strategy_id === currentStrategy?.id
  );

  const getStrategyTypeColor = (type) => {
    const colors = {
      private_pay: 'bg-blue-100 text-blue-800',
      medicare: 'bg-green-100 text-green-800',
      medicaid: 'bg-purple-100 text-purple-800',
      premium: 'bg-amber-100 text-amber-800',
      standard: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.standard;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Strategies</h1>
          <p className="text-gray-600 mt-1">
            Manage pricing strategies, service rates, and billing modifiers
          </p>
        </div>
        <Button onClick={() => setShowStrategyForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Strategy
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPricingStrategies.strategies.filter(s => s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total configured strategies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {strategyServiceRates.length}
            </div>
            <p className="text-xs text-muted-foreground">
              In {currentStrategy?.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Modifiers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {strategyModifiers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active adjustments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Base Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                strategyServiceRates.reduce((sum, sr) => sum + sr.hourly_rate, 0) /
                strategyServiceRates.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Per hour average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="service-rates">Service Rates</TabsTrigger>
          <TabsTrigger value="modifiers">Rate Modifiers</TabsTrigger>
          <TabsTrigger value="mileage">Mileage Rates</TabsTrigger>
          <TabsTrigger value="payer-schedules">Payer Fee Schedules</TabsTrigger>
        </TabsList>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Strategies</CardTitle>
              <CardDescription>
                Define pricing strategies for different payer types and service packages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPricingStrategies.strategies.map((strategy) => (
                    <TableRow
                      key={strategy.id}
                      className={selectedStrategy?.id === strategy.id ? 'bg-blue-50' : ''}
                    >
                      <TableCell className="font-medium">
                        {strategy.name}
                        {strategy.is_default && (
                          <Badge variant="outline" className="ml-2">Default</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStrategyTypeColor(strategy.strategy_type)}>
                          {strategy.strategy_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {strategy.description}
                      </TableCell>
                      <TableCell>
                        {new Date(strategy.effective_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={strategy.is_active ? "success" : "secondary"}>
                          {strategy.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStrategy(strategy)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Rates Tab */}
        <TabsContent value="service-rates" className="space-y-4">
          <ServiceRatesTable
            strategy={currentStrategy}
            serviceRates={strategyServiceRates}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        {/* Rate Modifiers Tab */}
        <TabsContent value="modifiers" className="space-y-4">
          <RateModifiersTable
            strategy={currentStrategy}
            modifiers={strategyModifiers}
          />
        </TabsContent>

        {/* Mileage Rates Tab */}
        <TabsContent value="mileage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mileage Reimbursement Rates</CardTitle>
              <CardDescription>
                Configure mileage reimbursement for {currentStrategy?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rate Per Mile</TableHead>
                    <TableHead>Minimum Miles</TableHead>
                    <TableHead>Maximum Miles</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyMileageRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">
                        {formatCurrency(rate.rate_per_mile)}
                      </TableCell>
                      <TableCell>{rate.minimum_billable_miles} mi</TableCell>
                      <TableCell>
                        {rate.maximum_billable_miles ? `${rate.maximum_billable_miles} mi` : 'No limit'}
                      </TableCell>
                      <TableCell>
                        {new Date(rate.effective_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {rate.notes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payer Fee Schedules Tab */}
        <TabsContent value="payer-schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payer Fee Schedules</CardTitle>
              <CardDescription>
                Insurance payer-specific rates and limits for {currentStrategy?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payer</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Procedure Code</TableHead>
                    <TableHead>Allowed Amount</TableHead>
                    <TableHead>Unit Type</TableHead>
                    <TableHead>Max Units/Day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPricingStrategies.payerFeeSchedules
                    .filter(pfs => pfs.pricing_strategy_id === currentStrategy?.id)
                    .map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.payer_name}
                        </TableCell>
                        <TableCell>{schedule.service_type.replace('_', ' ')}</TableCell>
                        <TableCell>
                          {schedule.procedure_code || '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(schedule.allowed_amount)}
                        </TableCell>
                        <TableCell>{schedule.unit_type}</TableCell>
                        <TableCell>
                          {schedule.max_units_per_day || 'Unlimited'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Strategy Form Dialog */}
      {showStrategyForm && (
        <StrategyForm
          open={showStrategyForm}
          onClose={() => setShowStrategyForm(false)}
        />
      )}
    </div>
  );
}
