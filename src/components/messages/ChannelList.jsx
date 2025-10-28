import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function ChannelList({ 
  title, 
  icon: Icon, 
  channels, 
  selectedChannel, 
  onSelectChannel, 
  getUnreadCount,
  currentUser,
  allUsers = [],
  visits = []
}) {
  if (channels.length === 0) return null;

  const getChannelDisplay = (channel) => {
    if (channel.channel_type === 'direct') {
      // Find the other person in DM
      const otherEmail = channel.members?.find(email => email !== currentUser?.email);
      const otherUser = allUsers.find(u => u.email === otherEmail);
      return {
        name: otherUser?.full_name || otherEmail || 'Unknown User',
        initials: otherUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
        icon: channel.icon || '👤'
      };
    } else if (channel.channel_type === 'visit') {
      const visit = visits.find(v => v.id === channel.visit_id);
      return {
        name: channel.name || `Visit ${visit?.scheduled_date || ''}`,
        initials: 'V',
        icon: channel.icon || '📅'
      };
    } else {
      return {
        name: channel.name,
        initials: channel.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CH',
        icon: channel.icon || '#'
      };
    }
  };

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="px-4 py-3 bg-slate-50 flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        <Icon className="w-4 h-4" />
        {title}
        <Badge variant="secondary" className="ml-auto">
          {channels.length}
        </Badge>
      </div>

      <div className="divide-y divide-slate-50">
        {channels.map((channel) => {
          const display = getChannelDisplay(channel);
          const unread = getUnreadCount(channel);
          const isSelected = selectedChannel?.id === channel.id;

          return (
            <div
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className={`
                px-4 py-3 cursor-pointer transition-colors
                ${isSelected 
                  ? 'bg-blue-50 border-l-4 border-blue-600' 
                  : 'hover:bg-slate-50 border-l-4 border-transparent'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {channel.channel_type === 'direct' ? (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {display.initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {display.icon}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`font-semibold text-sm truncate ${unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                      {display.name}
                    </h4>
                    {channel.last_message_at && (
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {format(new Date(channel.last_message_at), 'MMM d')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500 truncate">
                      {channel.description || `${channel.members?.length || 0} members`}
                    </p>
                    {unread > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs flex-shrink-0">
                        {unread > 99 ? '99+' : unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}