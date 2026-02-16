import React, { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

const AIChatBot = () => {
  useEffect(() => {
    createChat({
      webhookUrl: process.env.REACT_APP_N8N_CHAT_WEBHOOK_URL,
      target: "#n8n-chat",
      mode: "window",
      showWelcomeScreen: true,
      defaultLanguage: "es",
      //loadPreviousSession: false, // Prevent initial fetch error if webhook is invalid or CORS issues exist
      initialMessages: [
        "¡Hola! Soy el asistente virtual de ReservaT AI.",
        "¿En qué puedo ayudarte hoy?",
      ],
      i18n: {
        es: {
          title: "ReservaT AI",
          subtitle: "Tu asistente de viajes inteligente",
          getStarted: "Iniciar conversación",
          inputPlaceholder: "Escribe tu pregunta...",
        },
      },
    });
  }, []);

  return (
    <div id="n8n-chat">
      <style>{`
        :root {
          /* Colors form tailwind.config.js & Futuristic Theme */
          --chat--color--primary: #263DBF; /* Reservat Primary */
          --chat--color--primary-shade-50: #1d2e96;
          --chat--color--primary--shade-100: #152270;
          --chat--color--secondary: #2E3C8C; /* Reservat Secondary */
          --chat--color-secondary-shade-50: #222d6b;
          
          /* Futuristic Dark/Light Theme Mix */
          --chat--color-light: #f8fafc;
          --chat--color-light-shade-50: #e2e8f0;
          --chat--color-light-shade-100: #cbd5e1;
          --chat--color-medium: #94a3b8;
          --chat--color-dark: #0f172a; /* Slate 900 for high contrast */
          --chat--color-disabled: #cbd5e1;
          --chat--color-typing: #404040;

          /* Dimensions & Layout */
          --chat--spacing: 1rem;
          --chat--border-radius: 1rem; /* More rounded */
          --chat--transition-duration: 0.2s;
          --chat--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

          /* Window Styles */
          --chat--window--width: 380px;
          --chat--window--height: 600px;
          --chat--window--border-radius: 1.5rem;
          --chat--window--shadow: 0 10px 40px -10px rgba(38, 61, 191, 0.3); /* Blueish shadow */
          
          /* Header - Futuristic Gradient */
          --chat--header--background: linear-gradient(135deg, #263DBF 0%, #0f172a 100%);
          --chat--header--color: #ffffff;
          
          /* Messages */
          --chat--message--border-radius: 1rem;
          --chat--message--bot--background: #f1f5f9;
          --chat--message--bot--color: #0f172a;
          --chat--message--user--background: #263DBF;
          --chat--message--user--color: #ffffff;
          
          /* Toggle Button - Pulsing effect handled by n8n or CSS animation if supported */
          --chat--toggle--background: #263DBF;
          --chat--toggle--hover--background: #1d2e96;
        }
        
        /* Additional custom styling can be added if the DOM allows */
        .n8n-chat-window {
            backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
};

export default AIChatBot;
