import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Copy, CheckCircle2, Share2, Clock } from "lucide-react";
import { addDays, format } from "date-fns";

export default function ShareLinkDialog({ document, onClose }) {
  const [expiryDays, setExpiryDays] = useState(7);
  const [shareLink, setShareLink] = useState(document.secure_link || null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const generateLinkMutation = useMutation({
    mutationFn: async () => {
      const expiryDate = addDays(new Date(), expiryDays).toISOString();
      const randomToken = Math.random().toString(36).substring(2, 15);
      const secureLink = `${window.location.origin}/shared/${randomToken}`;
      
      // Update document with secure link
      await base44.entities.Document.update(document.id, {
        secure_link: secureLink,
        link_expiry: expiryDate
      });
      
      return secureLink;
    },
    onSuccess: (link) => {
      setShareLink(link);
      queryClient.invalidateQueries(['documents']);
    },
  });

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const revokeLink = useMutation({
    mutationFn: () => base44.entities.Document.update(document.id, {
      secure_link: null,
      link_expiry: null
    }),
    onSuccess: () => {
      setShareLink(null);
      queryClient.invalidateQueries(['documents']);
    },
  });

  const linkExpired = document.link_expiry && new Date(document.link_expiry) < new Date();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Document
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div>
            <p className="font-medium text-slate-900 mb-2">{document.title}</p>
            <Badge variant="outline" className="text-xs">
              {document.category.replace(/_/g, ' ')}
            </Badge>
          </div>

          {!shareLink || linkExpired ? (
            <>
              <div>
                <Label htmlFor="expiry">Link expires after:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="expiry"
                    type="number"
                    min="1"
                    max="365"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="flex items-center text-sm text-slate-600">
                    days ({format(addDays(new Date(), expiryDays), 'MMM d, yyyy')})
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2 text-sm text-blue-900">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Secure Sharing</p>
                    <p className="text-xs text-blue-700">
                      Anyone with this link can view the document until it expires. 
                      You can revoke access at any time.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                onClick={() => generateLinkMutation.mutate()}
                disabled={generateLinkMutation.isPending}
              >
                {generateLinkMutation.isPending ? 'Generating...' : 'Generate Share Link'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <Label>Secure Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      value={shareLink} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                  )}
                </div>

                {document.link_expiry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-slate-600">
                      Expires: {format(new Date(document.link_expiry), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-900">
                    💡 This link provides temporary view-only access. The document cannot be downloaded without proper authentication.
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => revokeLink.mutate()}
                disabled={revokeLink.isPending}
              >
                Revoke Access
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}