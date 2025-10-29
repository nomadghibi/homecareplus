import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  CreditCard,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClaimForm from "../components/billing/ClaimForm";
import ClaimDetails from "../components/billing/ClaimDetails";
import SubscriptionManager from "../components/billing/SubscriptionManager";

export default function Billing() {
  const [activeTab, setActiveTab] = useState("subscription"); // 'subscription' or 'claims'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const queryClient = useQueryClient();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.Claim.list('-created_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Claim.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['claims']);
      setShowForm(false);
    },
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  const getClient = (clientId) => clients.find(c => c.id === clientId);

  const filteredClaims = claims.filter(claim => {
    const client = getClient(claim.client_id);
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      claim.claim_number?.toLowerCase().includes(searchLower) ||
      claim.payer?.toLowerCase().includes(searchLower) ||
      client?.first_name?.toLowerCase().includes(searchLower) ||
      client?.last_name?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "all" || claim.claim_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalBilled = claims.reduce((sum, c) => sum + (c.total_charge || 0), 0);
  const totalPaid = claims.reduce((sum, c) => sum + (c.paid_amount || 0), 0);
  const avgDSO = claims.length > 0 
    ? claims.reduce((sum, c) => sum + (c.days_outstanding || 0), 0) / claims.length 
    : 0;
  const pendingClaims = claims.filter(c => 
    c.claim_status === 'submitted' || c.claim_status === 'accepted'
  ).length;

  const statusConfig = {
    draft: { color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock, label: "Draft" },
    submitted: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock, label: "Submitted" },
    accepted: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Accepted" },
    paid: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, label: "Paid" },
    rejected: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Rejected" },
    denied: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Denied" },
    appealed: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle, label: "Appealed" },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            Billing & Claims
          </h1>
          <p className="text-slate-500 mt-1">
            Manage claims, payments, and revenue cycle
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Claim
        </Button>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("subscription")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "subscription"
              ? "text-purple-600 border-b-2 border-purple-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription & Billing
          </div>
        </button>
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "claims"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Claims Management
          </div>
        </button>
      </div>

      {/* Subscription Tab Content */}
      {activeTab === "subscription" && (
        <SubscriptionManager />
      )}

      {/* Claims Tab Content */}
      {activeTab === "claims" && (
        <>
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Billed</p>
                <p className="text-2xl font-bold text-green-600">${totalBilled.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-600">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Avg DSO</p>
                <p className="text-2xl font-bold text-orange-600">{Math.round(avgDSO)}</p>
                <p className="text-xs text-slate-500 mt-1">days</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending Claims</p>
                <p className="text-2xl font-bold text-blue-600">{pendingClaims}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
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
                placeholder="Search by claim number, payer, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims List */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Claims</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                Loading claims...
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No claims found</p>
              </div>
            ) : (
              filteredClaims.map((claim) => {
                const client = getClient(claim.client_id);
                const status = statusConfig[claim.claim_status] || statusConfig.draft;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold text-slate-900">
                            {claim.claim_number}
                          </h4>
                          <Badge className={`${status.color} border flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm text-slate-600">
                          <div>
                            <span className="text-slate-500">Client:</span>{' '}
                            {client ? `${client.first_name} ${client.last_name}` : 'Unknown'}
                          </div>
                          <div>
                            <span className="text-slate-500">Payer:</span> {claim.payer}
                          </div>
                          <div>
                            <span className="text-slate-500">Service:</span>{' '}
                            {claim.service_date_from
                              ? format(new Date(claim.service_date_from), 'MMM d, yyyy')
                              : 'N/A'}
                          </div>
                          {claim.submission_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {claim.days_outstanding || 0} days outstanding
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 text-lg">
                          ${(claim.total_charge || 0).toFixed(2)}
                        </div>
                        {claim.paid_amount > 0 && (
                          <div className="text-sm text-green-600 flex items-center gap-1 justify-end mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            ${claim.paid_amount.toFixed(2)} paid
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claim Form */}
        </>
      )}

      {/* Claim Form (for both tabs if needed) */}
      {showForm && (
        <ClaimForm
          clients={clients}
          visits={visits}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Claim Details (for claims tab) */}
      {selectedClaim && (
        <ClaimDetails
          claim={selectedClaim}
          client={getClient(selectedClaim.client_id)}
          visits={visits.filter(v => selectedClaim.visit_ids?.includes(v.id))}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </div>
  );
}