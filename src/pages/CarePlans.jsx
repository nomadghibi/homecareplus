import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  FileCheck,
  Copy
} from "lucide-react";
import { format, differenceInDays, parseISO, isPast } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CarePlanForm from "../components/careplans/CarePlanForm";
import CarePlanDetails from "../components/careplans/CarePlanDetails";
import CarePlanTemplates from "../components/careplans/CarePlanTemplates";

export default function CarePlans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [clientFilter, setClientFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: carePlans = [], isLoading } = useQuery({
    queryKey: ['carePlans'],
    queryFn: () => base44.entities.CarePlan.list('-created_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.CarePlan.create({
        ...data,
        created_by: user.email,
        last_updated_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['carePlans']);
      setShowForm(false);
      setEditingPlan(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const user = await base44.auth.me();
      return base44.entities.CarePlan.update(id, {
        ...data,
        last_updated_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['carePlans']);
      setShowForm(false);
      setEditingPlan(null);
      setSelectedPlan(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (plan) => {
      const user = await base44.auth.me();
      const { id, created_date, updated_date, ...planData } = plan;
      return base44.entities.CarePlan.create({
        ...planData,
        plan_name: `${plan.plan_name} (Copy)`,
        status: 'draft',
        created_by: user.email,
        approved_by: null,
        approved_date: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['carePlans']);
    },
  });

  const handleSubmit = (data) => {
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleUseTemplate = (template, templateData) => {
    setEditingPlan(templateData);
    setShowTemplates(false);
    setShowForm(true);
  };

  const getClient = (clientId) => clients.find(c => c.id === clientId);

  // Filter care plans
  const filteredPlans = carePlans.filter(plan => {
    const client = getClient(plan.client_id);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      plan.plan_name?.toLowerCase().includes(searchLower) ||
      plan.primary_diagnosis?.toLowerCase().includes(searchLower) ||
      client?.first_name?.toLowerCase().includes(searchLower) ||
      client?.last_name?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    const matchesClient = clientFilter === "all" || plan.client_id === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  // Calculate stats
  const stats = {
    total: carePlans.length,
    active: carePlans.filter(p => p.status === 'active').length,
    draft: carePlans.filter(p => p.status === 'draft').length,
    pending: carePlans.filter(p => p.status === 'pending_approval').length,
    dueReview: carePlans.filter(p => {
      if (!p.review_date) return false;
      const daysUntil = differenceInDays(parseISO(p.review_date), new Date());
      return daysUntil <= 30 && daysUntil >= 0;
    }).length
  };

  const statusConfig = {
    draft: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Draft", icon: FileText },
    active: { color: "bg-green-100 text-green-700 border-green-200", label: "Active", icon: CheckCircle2 },
    pending_approval: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending Approval", icon: Clock },
    completed: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Completed", icon: FileCheck },
    expired: { color: "bg-red-100 text-red-700 border-red-200", label: "Expired", icon: AlertTriangle }
  };

  const careLevelConfig = {
    basic: { color: "bg-blue-100 text-blue-700", label: "Basic" },
    moderate: { color: "bg-orange-100 text-orange-700", label: "Moderate" },
    intensive: { color: "bg-red-100 text-red-700", label: "Intensive" },
    skilled: { color: "bg-purple-100 text-purple-700", label: "Skilled" }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Care Plan Management
          </h1>
          <p className="text-slate-500 mt-1">
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} • {stats.dueReview} due for review
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(true)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Use Template
          </Button>
          <Button 
            onClick={() => {
              setEditingPlan(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Care Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Plans</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Drafts</p>
                <p className="text-2xl font-bold text-slate-600">{stats.draft}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Due Review</p>
                <p className="text-2xl font-bold text-orange-600">{stats.dueReview}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by plan name, diagnosis, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <User className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Care Plans Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No care plans found</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Get started by creating your first care plan"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowTemplates(true)} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Care Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const client = getClient(plan.client_id);
            const status = statusConfig[plan.status] || statusConfig.draft;
            const careLevel = careLevelConfig[plan.care_level];
            const StatusIcon = status.icon;

            // Check if review is due
            const reviewDue = plan.review_date && differenceInDays(parseISO(plan.review_date), new Date()) <= 30;
            const expired = plan.expiration_date && isPast(parseISO(plan.expiration_date));

            return (
              <Card 
                key={plan.id} 
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                onClick={() => setSelectedPlan(plan)}
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${status.color.split(' ')[0]}`} />
                
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 group-hover:text-emerald-600 transition-colors truncate">
                        {plan.plan_name}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${status.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        {careLevel && (
                          <Badge className={careLevel.color}>
                            {careLevel.label}
                          </Badge>
                        )}
                        {reviewDue && (
                          <Badge className="bg-orange-100 text-orange-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Review Due
                          </Badge>
                        )}
                        {expired && (
                          <Badge className="bg-red-100 text-red-700">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateMutation.mutate(plan);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 space-y-3">
                  {client && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {client.first_name} {client.last_name}
                      </span>
                    </div>
                  )}
                  
                  {plan.primary_diagnosis && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{plan.primary_diagnosis}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {plan.effective_date ? format(parseISO(plan.effective_date), 'MMM d, yyyy') : 'Not set'}
                    </div>
                    {plan.hours_per_week && (
                      <Badge variant="outline" className="text-xs">
                        {plan.hours_per_week} hrs/week
                      </Badge>
                    )}
                  </div>
                  
                  {/* Progress indicators */}
                  {plan.goals && plan.goals.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                      <Target className="w-3 h-3" />
                      {plan.goals.filter(g => g.status === 'achieved').length}/{plan.goals.length} goals achieved
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Care Plan Form */}
      {showForm && (
        <CarePlanForm
          plan={editingPlan}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPlan(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <CarePlanTemplates
          clients={clients}
          onUseTemplate={handleUseTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Care Plan Details */}
      {selectedPlan && !showForm && (
        <CarePlanDetails
          plan={selectedPlan}
          client={getClient(selectedPlan.client_id)}
          onClose={() => setSelectedPlan(null)}
          onEdit={(plan) => {
            setEditingPlan(plan);
            setShowForm(true);
          }}
          onDuplicate={(plan) => duplicateMutation.mutate(plan)}
        />
      )}
    </div>
  );
}