import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  Plus,
  Search,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Star,
  BarChart3,
  FileText,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QualityAuditForm from "../components/quality/QualityAuditForm";
import QualityAuditDetails from "../components/quality/QualityAuditDetails";
import SatisfactionSurveyForm from "../components/quality/SatisfactionSurveyForm";
import QualityDashboard from "../components/quality/QualityDashboard";

export default function QualityAssurance() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [editingAudit, setEditingAudit] = useState(null);
  const queryClient = useQueryClient();

  const { data: audits = [] } = useQuery({
    queryKey: ['qualityAudits'],
    queryFn: () => base44.entities.QualityAudit.list('-audit_date'),
  });

  const { data: surveys = [] } = useQuery({
    queryKey: ['satisfactionSurveys'],
    queryFn: () => base44.entities.ClientSatisfactionSurvey.list('-survey_date'),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: caregivers = [] } = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => base44.entities.Caregiver.list(),
  });

  const createAuditMutation = useMutation({
    mutationFn: (data) => base44.entities.QualityAudit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['qualityAudits']);
      setShowAuditForm(false);
      setEditingAudit(null);
    },
  });

  const updateAuditMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.QualityAudit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['qualityAudits']);
      setShowAuditForm(false);
      setEditingAudit(null);
      setSelectedAudit(null);
    },
  });

  const createSurveyMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientSatisfactionSurvey.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['satisfactionSurveys']);
      setShowSurveyForm(false);
    },
  });

  const handleAuditSubmit = (data) => {
    if (editingAudit) {
      updateAuditMutation.mutate({ id: editingAudit.id, data });
    } else {
      createAuditMutation.mutate(data);
    }
  };

  const filteredAudits = audits.filter(audit => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      audit.audit_number?.toLowerCase().includes(searchLower) ||
      audit.auditor_name?.toLowerCase().includes(searchLower);

    const matchesType = typeFilter === "all" || audit.audit_type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Calculate stats
  const stats = {
    totalAudits: audits.length,
    passRate: audits.length > 0 
      ? ((audits.filter(a => a.pass_fail === 'pass').length / audits.length) * 100).toFixed(1)
      : 0,
    avgScore: audits.length > 0
      ? (audits.reduce((sum, a) => sum + (a.overall_score || 0), 0) / audits.length).toFixed(1)
      : 0,
    avgSatisfaction: surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + (s.overall_satisfaction || 0), 0) / surveys.length).toFixed(1)
      : 0,
    nps: surveys.length > 0
      ? (() => {
          const scores = surveys.map(s => s.likelihood_to_recommend || 0);
          const promoters = scores.filter(s => s >= 9).length;
          const detractors = scores.filter(s => s <= 6).length;
          return Math.round(((promoters - detractors) / scores.length) * 100);
        })()
      : 0,
  };

  const auditTypeConfig = {
    internal: { label: "Internal Audit", color: "bg-blue-100 text-blue-700" },
    external: { label: "External Audit", color: "bg-purple-100 text-purple-700" },
    regulatory: { label: "Regulatory Audit", color: "bg-red-100 text-red-700" },
    client_satisfaction: { label: "Client Satisfaction", color: "bg-green-100 text-green-700" },
    caregiver_performance: { label: "Caregiver Performance", color: "bg-orange-100 text-orange-700" },
    documentation_review: { label: "Documentation Review", color: "bg-teal-100 text-teal-700" },
    medication_audit: { label: "Medication Audit", color: "bg-pink-100 text-pink-700" },
    evv_audit: { label: "EVV Audit", color: "bg-indigo-100 text-indigo-700" },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            Quality Assurance
          </h1>
          <p className="text-slate-500 mt-1">
            {audits.length} audit{audits.length !== 1 ? 's' : ''} • {surveys.length} survey{surveys.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowSurveyForm(true)}
          >
            <Star className="w-4 h-4 mr-2" />
            New Survey
          </Button>
          <Button 
            onClick={() => {
              setEditingAudit(null);
              setShowAuditForm(true);
            }}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Audit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Audits</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalAudits}</p>
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
                <p className="text-sm text-slate-500 mb-1">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.passRate}%</p>
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
                <p className="text-sm text-slate-500 mb-1">Avg Audit Score</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgScore}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Client Satisfaction</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.avgSatisfaction}/5</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">NPS Score</p>
                <p className={`text-2xl font-bold ${stats.nps >= 50 ? 'text-green-600' : stats.nps >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stats.nps}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <QualityDashboard
            audits={audits}
            surveys={surveys}
            clients={clients}
            caregivers={caregivers}
          />
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="mt-6 space-y-6">
          {/* Filters */}
          <Card className="border-none shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search audits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-64 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(auditTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Forms */}
          {showAuditForm && (
            <QualityAuditForm
              audit={editingAudit}
              clients={clients}
              caregivers={caregivers}
              onSubmit={handleAuditSubmit}
              onCancel={() => {
                setShowAuditForm(false);
                setEditingAudit(null);
              }}
              isLoading={createAuditMutation.isPending || updateAuditMutation.isPending}
            />
          )}

          {/* Audit Details */}
          {selectedAudit && !showAuditForm && (
            <QualityAuditDetails
              audit={selectedAudit}
              clients={clients}
              caregivers={caregivers}
              onClose={() => setSelectedAudit(null)}
              onEdit={(audit) => {
                setEditingAudit(audit);
                setShowAuditForm(true);
              }}
            />
          )}

          {/* Audits List */}
          {filteredAudits.length === 0 ? (
            <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No audits found</h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm || typeFilter !== "all" ? "Try adjusting your filters" : "Get started by creating your first quality audit"}
                </p>
                {!searchTerm && typeFilter === "all" && (
                  <Button onClick={() => setShowAuditForm(true)} className="bg-gradient-to-r from-green-500 to-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Audit
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAudits.map((audit) => {
                const auditType = auditTypeConfig[audit.audit_type] || auditTypeConfig.internal;
                
                return (
                  <Card 
                    key={audit.id}
                    className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedAudit(audit)}
                  >
                    <CardHeader className="border-b border-slate-100">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={auditType.color}>
                          {auditType.label}
                        </Badge>
                        {audit.pass_fail && (
                          <Badge className={
                            audit.pass_fail === 'pass' ? 'bg-green-100 text-green-700' :
                            audit.pass_fail === 'conditional_pass' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {audit.pass_fail === 'pass' ? 'Pass' : audit.pass_fail === 'conditional_pass' ? 'Conditional' : 'Fail'}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {audit.audit_number || `Audit #${audit.id.slice(0, 8)}`}
                      </CardTitle>
                      <p className="text-sm text-slate-500">{audit.auditor_name}</p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(audit.audit_date), 'MMM d, yyyy')}
                      </div>
                      {audit.overall_score !== null && audit.overall_score !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Overall Score</span>
                          <Badge variant="outline" className="text-lg font-bold">
                            {audit.overall_score}%
                          </Badge>
                        </div>
                      )}
                      {audit.deficiencies_found && audit.deficiencies_found.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <AlertTriangle className="w-4 h-4" />
                          {audit.deficiencies_found.length} deficienc{audit.deficiencies_found.length === 1 ? 'y' : 'ies'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="mt-6 space-y-6">
          {showSurveyForm && (
            <SatisfactionSurveyForm
              clients={clients}
              onSubmit={(data) => createSurveyMutation.mutate(data)}
              onCancel={() => setShowSurveyForm(false)}
              isLoading={createSurveyMutation.isPending}
            />
          )}

          {surveys.length === 0 ? (
            <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No surveys yet</h3>
                <p className="text-slate-500 mb-6">Start collecting client satisfaction feedback</p>
                <Button onClick={() => setShowSurveyForm(true)} className="bg-gradient-to-r from-yellow-500 to-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Survey
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveys.map((survey) => {
                const client = clients.find(c => c.id === survey.client_id);
                
                return (
                  <Card key={survey.id} className="border-none shadow-lg">
                    <CardHeader className="border-b border-slate-100">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-yellow-100 text-yellow-700">
                          Survey
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-slate-900">{survey.overall_satisfaction}/5</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">
                        {client ? `${client.first_name} ${client.last_name}` : 'Unknown Client'}
                      </CardTitle>
                      <p className="text-sm text-slate-500">{survey.respondent_name}</p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {format(new Date(survey.survey_date), 'MMM d, yyyy')}
                      </div>
                      {survey.likelihood_to_recommend !== null && survey.likelihood_to_recommend !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">NPS Score</span>
                          <Badge variant="outline" className="font-bold">
                            {survey.likelihood_to_recommend}/10
                          </Badge>
                        </div>
                      )}
                      {survey.would_recommend !== null && survey.would_recommend !== undefined && (
                        <div className="flex items-center gap-2">
                          {survey.would_recommend ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">Would recommend</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-700">Would not recommend</span>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}