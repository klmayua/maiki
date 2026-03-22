'use client'

import { useState, useEffect, useRef } from 'react'
import { useConversations, useMessages, useWebSocket } from '@/hooks/useMessages'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
} from 'lucide-react'

export default function MessagesPage() {
  const { user, token } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { conversations, loading: loadingConversations } = useConversations()
  const {
    messages,
    loading: loadingMessages,
    sendMessage: sendMessageApi,
    hasMore,
    fetchMore,
  } = useMessages(selectedConversation)

  const { isConnected, sendMessage: sendWsMessage } = useWebSocket(token || '')

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    // Send via API first
    const sentMessage = await sendMessageApi(newMessage)

    // Then notify via WebSocket for real-time updates
    if (isConnected) {
      const conversation = conversations.find(c => c.id === selectedConversation)
      const participantIds = conversation?.participants.map(p => p.id) || []

      sendWsMessage({
        type: 'message',
        conversation_id: selectedConversation,
        content: newMessage,
        participants: participantIds,
      })
    }

    setNewMessage('')
  }

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.id !== user?.id)
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm text-maiki-400">
          Connect with clients and VAs in real-time
        </p>
      </div>

      <div className="flex-1 glass-card rounded-xl overflow-hidden flex">
        {/* Conversations List */}
        <div
          className={cn(
            'w-full lg:w-80 border-r border-white/10 flex flex-col',
            isMobileOpen ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maiki-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-maiki-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-maiki-400 focus:outline-none focus:border-maiki-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-4 text-center text-maiki-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-maiki-400">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation)
                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation.id)
                      setIsMobileOpen(true)
                    }}
                    className={cn(
                      'w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5',
                      selectedConversation === conversation.id && 'bg-maiki-600/20'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maiki-500 to-maiki-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {otherParticipant
                        ? `${otherParticipant.first_name[0]}${otherParticipant.last_name[0]}`
                        : '?'}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white truncate">
                          {otherParticipant
                            ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                            : 'Unknown'}
                        </span>
                        {conversation.last_message_at && (
                          <span className="text-xs text-maiki-400">
                            {formatDistanceToNow(new Date(conversation.last_message_at))}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-maiki-400 truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="bg-gold-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {conversation.unread_count}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            'flex-1 flex flex-col',
            !isMobileOpen ? 'hidden lg:flex' : 'flex'
          )}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden p-2 -ml-2 text-maiki-300 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversation)
                    const otherParticipant = conversation ? getOtherParticipant(conversation) : null
                    return (
                      <>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maiki-500 to-maiki-600 flex items-center justify-center text-white font-semibold">
                          {otherParticipant
                            ? `${otherParticipant.first_name[0]}${otherParticipant.last_name[0]}`
                            : '?'}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {otherParticipant
                              ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
                              : 'Unknown'}
                          </div>
                          <div className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Online
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-maiki-300 hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-maiki-300 hover:text-white transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-maiki-300 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {hasMore && (
                  <button
                    onClick={fetchMore}
                    className="w-full py-2 text-sm text-maiki-400 hover:text-white transition-colors"
                  >
                    Load more messages
                  </button>
                )}

                {loadingMessages ? (
                  <div className="text-center text-maiki-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-maiki-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  [...messages].reverse().map((message) => {
                    const isMe = message.sender_id === user?.id
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          isMe ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            isMe
                              ? 'bg-maiki-600 text-white'
                              : 'bg-white/10 text-white'
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-1',
                              isMe ? 'text-maiki-200' : 'text-maiki-400'
                            )}
                          >
                            <span className="text-xs">
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              <>
                                {message.is_edited && (
                                  <span className="text-xs">edited</span>
                                )}
                                {message.is_deleted ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <CheckCheck className="w-3 h-3" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-maiki-300 hover:text-white transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-maiki-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-maiki-400 focus:outline-none focus:border-maiki-500"
                  />
                  <button className="p-2 text-maiki-300 hover:text-white transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-maiki-600 text-white rounded-lg hover:bg-maiki-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-maiki-800 flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-maiki-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Your Messages
              </h3>
              <p className="text-sm text-maiki-400 max-w-sm">
                Select a conversation from the list to view messages, or start a new conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
