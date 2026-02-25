"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Plus, Search, ArrowLeft, User } from "lucide-react";

interface Participant {
  name: string;
  avatar: string | null;
  type: string;
  id: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: { content: string; createdAt: string; senderType: string } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: string;
  senderType: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface ClientOption {
  id: string;
  name: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    fetchConversations();
    fetchClients();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv);
      // Poll for new messages every 5s
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(selectedConv), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    const res = await fetch("/api/messages");
    if (res.ok) setConversations(await res.json());
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    const res = await fetch(`/api/messages/${convId}`);
    if (res.ok) {
      const msgs = await res.json();
      setMessages(msgs);
    }
    setLoadingMessages(false);
  };

  const fetchClients = async () => {
    const res = await fetch("/api/clients");
    if (res.ok) {
      const data = await res.json();
      setClients(data.map((c: ClientOption) => ({ id: c.id, name: c.name })));
    }
  };

  const startConversation = async (clientId: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId }),
    });
    if (res.ok) {
      const { conversationId } = await res.json();
      setSelectedConv(conversationId);
      setShowNewConv(false);
      setMobileView("chat");
      fetchConversations();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    const content = newMessage.trim();
    setNewMessage("");
    
    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderType: "user",
      senderId: "",
      content,
      type: "text",
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    const res = await fetch(`/api/messages/${selectedConv}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      fetchMessages(selectedConv);
      fetchConversations();
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConv);
  const filteredClients = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Conversations sidebar */}
      <div className={`w-full sm:w-80 border-r border-gray-100 flex flex-col ${mobileView === "chat" ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Mensagens</h2>
            <button onClick={() => setShowNewConv(!showNewConv)} className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showNewConv && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar atleta..." className="input-field pl-8 text-sm py-1.5" />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredClients.map((c) => (
                  <button key={c.id} onClick={() => startConversation(c.id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-left transition-colors">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-semibold">{getInitials(c.name)}</div>
                    <span className="text-sm text-gray-700">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">A carregar...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sem conversas</p>
              <p className="text-xs text-gray-400 mt-1">Inicie uma nova conversa</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setSelectedConv(conv.id); setMobileView("chat"); setLoadingMessages(true); }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-gray-50 ${selectedConv === conv.id ? "bg-emerald-50" : "hover:bg-gray-50"}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-semibold">
                    {conv.participants[0]?.name ? getInitials(conv.participants[0].name) : <User className="w-4 h-4" />}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-medium">{conv.unreadCount}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.participants.map((p) => p.name).join(", ")}</p>
                    {conv.lastMessage && <span className="text-[11px] text-gray-400">{timeAgo(conv.lastMessage.createdAt)}</span>}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.lastMessage.content}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${mobileView === "list" ? "hidden sm:flex" : "flex"}`}>
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Selecione uma conversa</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setMobileView("list")} className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-semibold">
                {selectedConversation?.participants[0]?.name ? getInitials(selectedConversation.participants[0].name) : <User className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{selectedConversation?.participants.map((p) => p.name).join(", ")}</p>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="text-center text-gray-400 text-sm py-8">A carregar mensagens...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">Nenhuma mensagem. Diga olá!</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.senderType === "user" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.senderType === "user" ? "text-emerald-200" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Escrever mensagem..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 border-0 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()} className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
