import React, { useState } from "react";
import { MessageSquare, X, Send, Sparkles, User, Bot } from "lucide-react";

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "¡Hola! Soy tu asistente de ReservaT. ¿Cómo puedo ayudarte hoy con tus planes de viaje?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: input,
    };

    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: "bot",
        text: "Gracias por tu mensaje. Estoy aprendiendo para darte la mejor información sobre hoteles, restaurantes y experiencias en Colombia.",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-reservat-primary p-6 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  Asistente Virtual
                </h3>
                <div className="flex items-center text-xs text-white/80">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  En línea
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] flex items-end space-x-2 ${
                    message.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "user"
                        ? "bg-reservat-primary text-white"
                        : "bg-white border border-gray-200 text-gray-400 shadow-sm"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      message.sender === "user"
                        ? "bg-reservat-primary text-white rounded-tr-none"
                        : "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white border-t border-gray-100"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Escribe tu mensaje..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-reservat-primary/50 text-sm transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-reservat-primary text-white rounded-xl hover:shadow-lg hover:shadow-reservat-primary/30 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest font-bold">
              Potenciado por ReservaT AI
            </p>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-white text-gray-600 border border-gray-100 rotate-90"
            : "bg-reservat-primary text-white"
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-reservat-primary/20 animate-ping group-hover:hidden"></div>
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <MessageSquare className="w-8 h-8 fill-current opacity-80" />
        )}
      </button>
    </div>
  );
};

export default AIChatBot;
