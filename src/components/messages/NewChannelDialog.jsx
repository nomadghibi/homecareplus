import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Users, Hash, Calendar, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewChannelDialog({ onClose, currentUser, allUsers, visits }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    channel_type: "group",
    icon: "📢",
    visit_id: "",
    members: [currentUser?.email]
  });
  const queryClient = useQueryClient();

  const createChannelMutation = useMutation({
    mutationFn: (data) => base44.entities.Channel.create({
      ...data,
      last_message_at: new Date().toISOString(),
      is_archived: false,
      admins: [currentUser.email],
      unread_count: {},
      settings: {
        notifications_enabled: true,
        allow_file_uploads: true,
        retention_days: 90
      }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createChannelMutation.mutate(formData);
  };

  const toggleMember = (email) => {
    const members = formData.members.includes(email)
      ? formData.members.filter(m => m !== email)
      : [...formData.members, email];
    setFormData(prev => ({ ...prev, members }));
  };

  const iconOptions = ['📢', '💬', '🎯', '📅', '💼', '🚀', '⚡', '🔔', '📊', '🎉'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Create New Channel</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            {/* Channel Type */}
            <div>
              <Label>Channel Type</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Button
                  type="button"
                  variant={formData.channel_type === 'group' ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setFormData(prev => ({ ...prev, channel_type: 'group' }))}
                >
                  <Hash className="w-6 h-6" />
                  <span>Group</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.channel_type === 'direct' ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setFormData(prev => ({ ...prev, channel_type: 'direct' }))}
                >
                  <Users className="w-6 h-6" />
                  <span>Direct</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.channel_type === 'visit' ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setFormData(prev => ({ ...prev, channel_type: 'visit' }))}
                >
                  <Calendar className="w-6 h-6" />
                  <span>Visit</span>
                </Button>
              </div>
            </div>

            {/* Channel Name */}
            {formData.channel_type !== 'direct' && (
              <div>
                <Label htmlFor="name">Channel Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. scheduling, billing-team, general"
                  required
                />
              </div>
            )}

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's this channel about?"
                rows={3}
              />
            </div>

            {/* Icon Selection */}
            {formData.channel_type === 'group' && (
              <div>
                <Label>Channel Icon</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`
                        w-12 h-12 rounded-lg text-2xl flex items-center justify-center
                        ${formData.icon === icon 
                          ? 'bg-blue-100 border-2 border-blue-600' 
                          : 'bg-slate-100 hover:bg-slate-200 border-2 border-transparent'
                        }
                      `}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Visit Selection */}
            {formData.channel_type === 'visit' && (
              <div>
                <Label htmlFor="visit">Select Visit</Label>
                <Select
                  value={formData.visit_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visit_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a visit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {visits?.slice(0, 20).map(visit => (
                      <SelectItem key={visit.id} value={visit.id}>
                        {visit.scheduled_date} - {visit.scheduled_start_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Member Selection */}
            <div>
              <Label>Members ({formData.members.length})</Label>
              <div className="mt-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                {allUsers?.map(user => (
                  <div
                    key={user.email}
                    onClick={() => user.email !== currentUser?.email && toggleMember(user.email)}
                    className={`
                      flex items-center justify-between p-3 cursor-pointer
                      ${user.email === currentUser?.email ? 'bg-slate-50 cursor-not-allowed' : 'hover:bg-slate-50'}
                      ${formData.members.includes(user.email) ? 'bg-blue-50' : ''}
                    `}
                  >
                    <div>
                      <p className="font-medium text-sm">{user.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      {user.email === currentUser?.email && (
                        <Badge variant="secondary" className="mt-1">You</Badge>
                      )}
                    </div>
                    {formData.members.includes(user.email) && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || formData.members.length === 0 || createChannelMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createChannelMutation.isPending ? 'Creating...' : 'Create Channel'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}