import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Search,
  User,
  Clock,
  FileText,
  Eye,
  Edit,
  Trash,
  UserPlus,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date'),
  });

  const filteredLogs = auditLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      log.user_email?.toLowerCase().includes(searchLower) ||
      log.entity_type?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actionConfig = {
    create: { 
      icon: UserPlus, 
      color: "bg-green-100 text-green-700 border-green-200", 
      label: "Create" 
    },
    read: { 
      icon: Eye, 
      color: "bg-blue-100 text-blue-700 border-blue-200", 
      label: "Read" 
    },
    update: { 
      icon: Edit, 
      color: "bg-yellow-100 text-yellow-700 border-yellow-200", 
      label: "Update" 
    },
    delete: { 
      icon: Trash, 
      color: "bg-red-100 text-red-700 border-red-200", 
      label: "Delete" 
    },
    login: { 
      icon: User, 
      color: "bg-purple-100 text-purple-700 border-purple-200", 
      label: "Login" 
    },
    logout: { 
      icon: User, 
      color: "bg-slate-100 text-slate-700 border-slate-200", 
      label: "Logout" 
    },
  };

  const stats = {
    total: auditLogs.length,
    creates: auditLogs.filter(l => l.action === 'create').length,
    updates: auditLogs.filter(l => l.action === 'update').length,
    deletes: auditLogs.filter(l => l.action === 'delete').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          Audit Logs
        </h1>
        <p className="text-slate-500 mt-1">
          Complete activity history for compliance and security
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Events</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
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
                <p className="text-sm text-slate-500 mb-1">Creates</p>
                <p className="text-2xl font-bold text-green-600">{stats.creates}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Updates</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.updates}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Deletes</p>
                <p className="text-2xl font-bold text-red-600">{stats.deletes}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash className="w-6 h-6 text-red-600" />
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
                placeholder="Search by user, entity, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log List */}
      <Card className="border-none shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">
                Loading audit logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No audit logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const action = actionConfig[log.action] || {
                  icon: FileText,
                  color: "bg-slate-100 text-slate-700 border-slate-200",
                  label: log.action
                };
                const ActionIcon = action.icon;

                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${action.color} border flex items-center justify-center flex-shrink-0`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge className={`${action.color} border`}>
                            {action.label}
                          </Badge>
                          <span className="font-medium text-slate-900">
                            {log.entity_type}
                          </span>
                          {log.entity_id && (
                            <span className="text-xs text-slate-500 font-mono">
                              ID: {log.entity_id.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            {log.user_email || 'System'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {format(new Date(log.timestamp || log.created_date), 'MMM d, yyyy h:mm:ss a')}
                          </div>
                          {log.ip_address && (
                            <div className="text-xs text-slate-500">
                              IP: {log.ip_address}
                            </div>
                          )}
                          {log.user_agent && (
                            <div className="text-xs text-slate-500 truncate">
                              {log.user_agent}
                            </div>
                          )}
                        </div>
                        {log.details && (
                          <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
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
    </div>
  );
}