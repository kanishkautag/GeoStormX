import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Bot, User, Rocket } from "lucide-react";
import axios from "axios";
import './Chatbot.css'; // Import the new CSS file

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am the AURA Risk Advisor. Ask me anything about the Cosmic Weather Insurance platform, its features, or the latest alerts.",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsTyping(true);

    try {
      // API call to your Python backend
      const res = await axios.post("http://localhost:8000/chat", {
        message: currentInput,
      });

      const botResponse = {
        id: Date.now() + 1,
        text: res.data.response || "Sorry, I couldn't understand that.",
        isUser: false,
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error calling chatbot backend:", error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the AURA network. Please ensure the backend is running and try again.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const suggestedQuestions = [
    "How does this platform work?",
    "What is the latest warning?",
    "What kind of data do you use?",
    "How is my insurance premium calculated?",
  ];

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="chat-window"
          >
            {/* Header */}
            <div className="chat-header">
              <div className="header-content">
                <Bot className="bot-icon" />
                <h3 className="header-title">AURA</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="close-button"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-wrapper ${
                    message.isUser ? "user" : "bot"
                  }`}
                >
                  <div className="message-bubble">
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="message-wrapper bot">
                  <div className="message-bubble">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />

              {messages.length === 1 && (
                <div className="suggested-questions">
                  {suggestedQuestions.map((q, i) => (
                    <button key={i} onClick={() => setInputText(q)} className="suggested-question-btn">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about space weather risk..."
                className="chat-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="send-button"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="chat-toggle-button"
      >
        <AnimatePresence>
            {isOpen ? <X key="close" size={24} /> : <Rocket key="open" size={24} />}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default Chatbot;