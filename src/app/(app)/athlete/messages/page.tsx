"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, ArrowLeft, User, Plus, Search, X } from "lucide-react";

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

interface Contact {
  id: string;
  name: string;
  avatar: string | null;
  type: "user" | "client";
  role: string;
}

export default function AthleteMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [meId, setMeId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout>(null);

  // New conversation modal state
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [creatingConv, setCreatingConv] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMeId(d?.id || ""));
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(selectedConv), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/athlete/messages");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/athlete/messages/${convId}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      senderType: "client",
      senderId: meId,
      content,
      type: "text",
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch(`/api/athlete/messages/${selectedConv}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      fetchMessages(selectedConv);
      fetchConversations();
    } catch {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConv);
  const otherName = selectedConversation?.participants[0]?.name || "Conversa";

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch("/api/athlete/messages/contacts");
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } finally {
      setLoadingContacts(false);
    }
  };

  const openNewConvModal = () => {
    setShowNewConvModal(true);
    setContactSearch("");
    fetchContacts();
  };

  const startConversation = async (contact: Contact) => {
    setCreatingConv(true);
    try {
      const body = contact.type === "user"
        ? { userId: contact.id }
        : { clientId: contact.id };

      const res = await fetch("/api/athlete/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.conversationId) {
        setShowNewConvModal(false);
        await fetchConversations();
        setSelectedConv(data.conversationId);
        setMobileView("chat");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setCreatingConv(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-500 mt-1">Conversas com o teu PT e atletas</p>
        </div>
        <button
          onClick={openNewConvModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nova Conversa
        </button>
      </div>

      <div className="flex-1 flex bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-0">
        {/* Conversations List */}
        <div
          className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Conversas</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Sem conversas</p>
                <button
                  onClick={openNewConvModal}
                  className="mt-3 text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                >
                  Iniciar uma conversa
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConv(conv.id);
                    setMobileView("chat");
                  }}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${
                    selectedConv === conv.id ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      {conv.participants[0]?.avatar ? (
                        <img
                          src={conv.participants[0].avatar}
                          className="w-10 h-10 rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <User className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {conv.participants[0]?.name || "PT"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-emerald-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="font-semibold text-gray-900">{otherName}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Envia a primeira mensagem!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === meId && msg.senderType === "client";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMine ? "text-emerald-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString("pt-PT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Escreve uma mensagem..."
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white rounded-xl transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Seleciona uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConvModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Nova Conversa</h2>
              <button
                onClick={() => setShowNewConvModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Pesquisar contactos..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  {contactSearch ? "Nenhum contacto encontrado" : "Sem contactos disponíveis"}
                </div>
              ) : (
                <>
                  {/* PT section */}
                  {filteredContacts.some((c) => c.type === "user") && (
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2">
                        Personal Trainer
                      </p>
                      {filteredContacts
                        .filter((c) => c.type === "user")
                        .map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => startConversation(contact)}
                            disabled={creatingConv}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                          >
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              {contact.avatar ? (
                                <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                              ) : (
                                <User className="w-5 h-5 text-emerald-600" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                              <p className="text-xs text-emerald-600">{contact.role}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Athletes section */}
                  {filteredContacts.some((c) => c.type === "client") && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2">
                        Atletas
                      </p>
                      {filteredContacts
                        .filter((c) => c.type === "client")
                        .map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => startConversation(contact)}
                            disabled={creatingConv}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              {contact.avatar ? (
                                <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                              ) : (
                                <User className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                              <p className="text-xs text-gray-500">{contact.role}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
