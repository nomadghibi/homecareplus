import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Eye, 
  Share2, 
  Trash2,
  Calendar,
  User,
  AlertTriangle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function DocumentCard({ 
  document, 
  status,
  categoryConfig, 
  statusConfig,
  clients,
  caregivers,
  onView,
  onDelete 
}) {
  const category = categoryConfig[document.category] || categoryConfig.other;
  const statusStyle = statusConfig[status] || statusConfig.active;
  
  const CategoryIcon = category.icon;

  // Get entity name
  const getEntityName = () => {
    if (document.entity_type === 'client') {
      const client = clients.find(c => c.id === document.entity_id);
      return client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
    }
    if (document.entity_type === 'caregiver') {
      const caregiver = caregivers.find(c => c.id === document.entity_id);
      return caregiver ? `${caregiver.first_name} ${caregiver.last_name}` : 'Unknown Caregiver';
    }
    return document.entity_type.charAt(0).toUpperCase() + document.entity_type.slice(1);
  };

  // Check if expiring soon
  const isExpiringSoon = () => {
    if (!document.expiration_date || status === 'expired') return false;
    const daysUntil = differenceInDays(new Date(document.expiration_date), new Date());
    return daysUntil <= 30 && daysUntil >= 0;
  };

  const daysUntilExpiry = document.expiration_date 
    ? differenceInDays(new Date(document.expiration_date), new Date())
    : null;

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                {document.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Version {document.version}
              </p>
            </div>
          </div>
          <Badge className={`${statusStyle.color} border flex-shrink-0`}>
            {statusStyle.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {/* Entity Info */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 truncate">{getEntityName()}</span>
        </div>

        {/* Expiration Warning */}
        {isExpiringSoon() && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-xs text-orange-700 font-medium">
              Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Expiration Date */}
        {document.expiration_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              Expires: {format(new Date(document.expiration_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Upload Info */}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>Uploaded by {document.uploaded_by || 'Unknown'}</div>
          <div>{format(new Date(document.created_date), 'MMM d, yyyy')}</div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onView(document)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(document.file_url, '_blank')}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDelete(document.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}