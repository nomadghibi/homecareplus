import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Hash,
  Users,
  Bell,
  BellOff,
  Pin,
  Archive,
  CheckCheck,
  Check,
  Loader2,
  File,
  Image as ImageIcon,
  X
} from "lucide-react";
import { format } from "date-fns";

export default function MessageThread({ 
  channel, 
  messages, 
  currentUser, 
  allUsers,
  visits,
  onChannelUpdate 
}) {
  const [messageText, setMessageText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;

      // Upload file if attached
      if (attachedFile) {
        setUploadingFile(true);
        const result = await base44.integrations.Core.UploadFile({ file: attachedFile });
        fileUrl = result.file_url;
        fileName = attachedFile.name;
        fileType = attachedFile.type;
        fileSize = attachedFile.size;
        setUploadingFile(false);
      }

      const message = await base44.entities.Message.create({
        channel_id: channel.id,
        sender_email: currentUser.email,
        content: data.content,
        message_type: fileUrl ? 'file' : 'text',
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        reply_to: replyingTo?.id,
        read_by: [currentUser.email]
      });

      // Update channel's last_message_at and unread counts
      const unreadCount = { ...channel.unread_count };
      channel.members?.forEach(email => {
        if (email !== currentUser.email) {
          unreadCount[email] = (unreadCount[email] || 0) + 1;
        }
      });

      await base44.entities.Channel.update(channel.id, {
        last_message_at: new Date().toISOString(),
        unread_count: unreadCount
      });

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['channels']);
      setMessageText("");
      setReplyingTo(null);
      setAttachedFile(null);
      onChannelUpdate();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (message) => {
      if (!message.read_by?.includes(currentUser.email)) {
        const newReadBy = [...(message.read_by || []), currentUser.email];
        await base44.entities.Message.update(message.id, {
          read_by: newReadBy
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ message, emoji }) => {
      const reactions = message.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);
      
      let newReactions;
      if (existingReaction) {
        if (existingReaction.users.includes(currentUser.email)) {
          // Remove reaction
          existingReaction.users = existingReaction.users.filter(u => u !== currentUser.email);
          newReactions = reactions.filter(r => r.users.length > 0);
        } else {
          // Add user to reaction
          existingReaction.users.push(currentUser.email);
          newReactions = reactions;
        }
      } else {
        // New reaction
        newReactions = [...reactions, { emoji, users: [currentUser.email] }];
      }

      await base44.entities.Message.update(message.id, {
        reactions: newReactions
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() || attachedFile) {
      sendMessageMutation.mutate({ content: messageText });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setAttachedFile(file);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Mark messages as read when they appear
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.sender_email !== currentUser.email && !msg.read_by?.includes(currentUser.email)) {
        markAsReadMutation.mutate(msg);
      }
    });
  }, [messages.length]);

  const getUserDisplay = (email) => {
    const user = allUsers.find(u => u.email === email);
    return {
      name: user?.full_name || email,
      initials: user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || email[0].toUpperCase()
    };
  };

  const getChannelTitle = () => {
    if (channel.channel_type === 'direct') {
      const otherEmail = channel.members?.find(email => email !== currentUser?.email);
      return getUserDisplay(otherEmail).name;
    } else if (channel.channel_type === 'visit') {
      const visit = visits?.find(v => v.id === channel.visit_id);
      return channel.name || `Visit - ${visit?.scheduled_date || 'Unknown'}`;
    } else {
      return channel.name;
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(msg => {
      const date = format(new Date(msg.created_date), 'yyyy-MM-dd');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const quickReactions = ['👍', '❤️', '😊', '🎉', '👏', '🔥'];

  return (
    <>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {channel.channel_type === 'group' && (
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                {channel.icon || '#'}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{getChannelTitle()}</CardTitle>
              <p className="text-sm text-slate-500">
                {channel.description || `${channel.members?.length || 0} members`}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bell className="w-4 h-4 mr-2" />
                Mute Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                View Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Archive className="w-4 h-4 mr-2" />
                Archive Channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Messages for this date */}
              {msgs.map((message, idx) => {
                const sender = getUserDisplay(message.sender_email);
                const isOwnMessage = message.sender_email === currentUser.email;
                const showAvatar = idx === 0 || msgs[idx - 1].sender_email !== message.sender_email;
                const replyMessage = message.reply_to ? messages.find(m => m.id === message.reply_to) : null;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-1'} group`}
                  >
                    {/* Avatar */}
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {sender.initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-slate-900">
                            {sender.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(message.created_date), 'h:mm a')}
                          </span>
                          {message.edited && (
                            <Badge variant="outline" className="text-xs">
                              edited
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Reply Preview */}
                      {replyMessage && (
                        <div className="mb-2 pl-3 border-l-2 border-slate-300 text-sm text-slate-600 bg-slate-50 rounded p-2">
                          <span className="font-medium">{getUserDisplay(replyMessage.sender_email).name}</span>
                          <p className="truncate">{replyMessage.content}</p>
                        </div>
                      )}

                      {/* Message Text */}
                      <div className="bg-slate-50 rounded-lg px-3 py-2 inline-block max-w-2xl">
                        <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">
                          {message.content}
                        </p>

                        {/* File Attachment */}
                        {message.file_url && (
                          <div className="mt-2 flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                            {message.file_type?.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 text-blue-600" />
                            ) : (
                              <File className="w-4 h-4 text-slate-600" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {message.file_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(message.file_size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(message.file_url, '_blank')}
                            >
                              Open
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {message.reactions.map((reaction, idx) => (
                            <button
                              key={idx}
                              onClick={() => addReactionMutation.mutate({ message, emoji: reaction.emoji })}
                              className={`
                                px-2 py-0.5 rounded-full text-sm flex items-center gap-1
                                ${reaction.users.includes(currentUser.email)
                                  ? 'bg-blue-100 border border-blue-300'
                                  : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
                                }
                              `}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-xs font-medium">{reaction.users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message Actions (on hover) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-0 bg-white shadow-md rounded-lg border border-slate-200 flex">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Smile className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {quickReactions.map(emoji => (
                              <DropdownMenuItem
                                key={emoji}
                                onClick={() => addReactionMutation.mutate({ message, emoji })}
                              >
                                <span className="text-lg">{emoji}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => setReplyingTo(message)}
                        >
                          Reply
                        </Button>

                        {/* Read Receipts */}
                        {isOwnMessage && (
                          <div className="px-2 flex items-center">
                            {message.read_by?.length === channel.members?.length ? (
                              <CheckCheck className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Check className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="w-full space-y-2">
          {/* Reply Preview */}
          {replyingTo && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm">
              <div className="flex-1">
                <span className="font-medium">Replying to {getUserDisplay(replyingTo.sender_email).name}</span>
                <p className="text-slate-600 truncate">{replyingTo.content}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setReplyingTo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Attached File Preview */}
          {attachedFile && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm">
              <File className="w-4 h-4 text-blue-600" />
              <span className="flex-1 font-medium truncate">{attachedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setAttachedFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <Textarea
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />

            <Button
              type="submit"
              disabled={(!messageText.trim() && !attachedFile) || uploadingFile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadingFile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </>
  );
}