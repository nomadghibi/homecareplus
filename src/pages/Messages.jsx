import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send,
  Plus,
  Search,
  Hash,
  Users,
  User,
  Calendar,
  Paperclip,
  Image,
  File,
  Smile,
  MoreVertical,
  Pin,
  Archive,
  Bell,
  BellOff,
  CheckCheck,
  Check,
  Edit2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import ChannelList from "../components/messages/ChannelList";
import MessageThread from "../components/messages/MessageThread";
import NewChannelDialog from "../components/messages/NewChannelDialog";
import NewMessageDialog from "../components/messages/NewMessageDialog";

export default function Messages() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.Channel.list('-last_message_at'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedChannel?.id],
    queryFn: () => base44.entities.Message.filter({ channel_id: selectedChannel.id }, '-created_date'),
    enabled: !!selectedChannel,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ['visits'],
    queryFn: () => base44.entities.Visit.list(),
  });

  // Filter channels by user membership
  const myChannels = channels.filter(c => 
    c.members?.includes(user?.email) && !c.is_archived
  );

  // Categorize channels
  const directChannels = myChannels.filter(c => c.channel_type === 'direct');
  const groupChannels = myChannels.filter(c => c.channel_type === 'group');
  const visitChannels = myChannels.filter(c => c.channel_type === 'visit');

  // Calculate unread counts
  const getUnreadCount = (channel) => {
    if (!user) return 0;
    return channel.unread_count?.[user.email] || 0;
  };

  const totalUnread = myChannels.reduce((sum, c) => sum + getUnreadCount(c), 0);

  // Search messages
  const filteredMessages = messages.filter(msg => 
    msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-select first channel on load
  useEffect(() => {
    if (!selectedChannel && myChannels.length > 0) {
      setSelectedChannel(myChannels[0]);
    }
  }, [myChannels.length]);

  // Mark channel as read when selected
  useEffect(() => {
    if (selectedChannel && user) {
      const unread = getUnreadCount(selectedChannel);
      if (unread > 0) {
        // Mark as read
        const newUnreadCount = { ...selectedChannel.unread_count };
        newUnreadCount[user.email] = 0;
        
        base44.entities.Channel.update(selectedChannel.id, {
          unread_count: newUnreadCount
        }).then(() => {
          queryClient.invalidateQueries(['channels']);
        });
      }
    }
  }, [selectedChannel?.id]);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 p-6">
      {/* Sidebar - Channels List */}
      <Card className="w-80 border-none shadow-lg flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Messages
              {totalUnread > 0 && (
                <Badge className="bg-red-500 text-white">
                  {totalUnread}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setShowNewMessage(true)}
                title="New Message"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setShowNewChannel(true)}
                title="New Channel"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="p-0">
            <ChannelList
              title="Direct Messages"
              icon={User}
              channels={directChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              getUnreadCount={getUnreadCount}
              currentUser={user}
              allUsers={allUsers}
            />

            <ChannelList
              title="Channels"
              icon={Hash}
              channels={groupChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              getUnreadCount={getUnreadCount}
              currentUser={user}
            />

            <ChannelList
              title="Visit Threads"
              icon={Calendar}
              channels={visitChannels}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              getUnreadCount={getUnreadCount}
              currentUser={user}
              visits={visits}
            />
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 border-none shadow-lg flex flex-col">
        {selectedChannel ? (
          <MessageThread
            channel={selectedChannel}
            messages={filteredMessages}
            currentUser={user}
            allUsers={allUsers}
            visits={visits}
            onChannelUpdate={() => queryClient.invalidateQueries(['channels'])}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
              <p className="text-sm mb-4">Choose a conversation or start a new one</p>
              <Button onClick={() => setShowNewMessage(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* New Channel Dialog */}
      {showNewChannel && (
        <NewChannelDialog
          onClose={() => setShowNewChannel(false)}
          currentUser={user}
          allUsers={allUsers}
          visits={visits}
        />
      )}

      {/* New Message Dialog */}
      {showNewMessage && (
        <NewMessageDialog
          onClose={() => setShowNewMessage(false)}
          currentUser={user}
          allUsers={allUsers}
          onChannelCreated={(channel) => {
            setSelectedChannel(channel);
            setShowNewMessage(false);
          }}
        />
      )}
    </div>
  );
}