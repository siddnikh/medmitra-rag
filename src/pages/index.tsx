import React, { useState, useEffect, useRef } from "react";
import { Answer } from "@/components/Answer";
import { ChatInput } from "@/components/ChatInput";
import type { Answer as AnswerType } from "@/types";

interface Message {
  type: "user" | "system";
  content: string;
  answer?: AnswerType;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<AnswerType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on initial render
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (message: string) => {
    setMessages((prev) => [...prev, { type: "user", content: message }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const answer: AnswerType = await response.json();

      setIsTyping(false);
      setCurrentAnswer(answer);
      setMessages((prev) => [
        ...prev,
        { type: "system", content: answer.text, answer },
      ]);
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content:
            "Sorry, there was an error processing your request. Please try again.",
          answer: {
            text: "Error processing request",
            sources: [],
            followUpQuestions: [],
            disclaimer: "An error occurred",
          },
        },
      ]);
      console.error("Chat error:", error);
    }
  };

  const isInitialView = messages.length === 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="text-center py-8">
        <h1
          className={`font-display text-blue-400 font-semibold transition-all duration-300 ${
            isInitialView ? "text-4xl" : "text-2xl"
          }`}
        >
          Medical Q&A
        </h1>
      </header>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col items-center px-4 max-w-7xl mx-auto w-full overflow-hidden">
        {isInitialView ? (
          <div className="flex-1 flex items-center justify-center w-full max-w-2xl mx-auto">
            <div className="w-full animate-fadeIn">
              <ChatInput onSubmit={handleSubmit} isInitialView={true} />
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full space-y-8 py-8 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "system" && message.answer ? (
                  <div
                    className={`w-full transition-opacity duration-500 ${
                      isTyping && index === messages.length - 1
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                  >
                    <Answer
                      answer={message.answer}
                      isTyping={isTyping && index === messages.length - 1}
                    />
                  </div>
                ) : (
                  <div className="max-w-2xl bg-blue-500/10 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 font-body">
                    {message.content}
                  </div>
                )}
              </div>
            ))}

            {/* Move loading animation outside the message map, so it's always at the bottom */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-2xl bg-blue-500/10 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 animate-pulse">
                  <div className="flex space-x-2">
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat input */}
        {!isInitialView && (
          <div className="sticky bottom-0 w-full pb-8 pt-4 bg-gradient-to-t from-gray-900 to-transparent">
            <ChatInput
              onSubmit={handleSubmit}
              followUpQuestions={currentAnswer?.followUpQuestions}
            />
          </div>
        )}
      </main>
    </div>
  );
}
