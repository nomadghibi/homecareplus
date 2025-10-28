import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Search } from "lucide-react";

export default function NewMessageDialog({ onClose, currentUser, allUsers, onChannelCreated }) {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const createDMMutation = useMutation({
    mutationFn: async (targetUser) => {
      // Check if DM channel already exists
      const channels = await base44.entities.Channel.list();
      const existing = channels.find(c => 
        c.channel_type === 'direct' &&
        c.members?.includes(currentUser.email) &&
        c.members?.includes(targetUser.email)
      );

      if (existing) {
        return existing;
      }

      // Create new DM channel
      return base44.entities.Channel.create({
        name: `${currentUser.full_name} & ${targetUser.full_name}`,
        channel_type: 'direct',
        members: [currentUser.email, targetUser.email],
        admins: [currentUser.email, targetUser.email],
        last_message_at: new Date().toISOString(),
        is_archived: false,
        unread_count: {},
        settings: {
          notifications_enabled: true,
          allow_file_uploads: true,
          retention_days: 90
        }
      });
    },
    onSuccess: (channel) => {
      queryClient.invalidateQueries(['channels']);
      onChannelCreated(channel);
    },
  });

  const filteredUsers = allUsers?.filter(user =>
    user.email !== currentUser?.email &&
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>New Message</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers?.map(user => {
              const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
              
              return (
                <button
                  key={user.email}
                  onClick={() => createDMMutation.mutate(user)}
                  disabled={createDMMutation.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </button>
              );
            })}

            {filteredUsers?.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}