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
    // Add user message
    setMessages((prev) => [...prev, { type: "user", content: message }]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate API call - replace with actual API call
    setTimeout(() => {
      const mockAnswer: AnswerType = {
        text:
          "# Understanding Health and the Human Body\n\n" +
          "The human body is an incredibly complex system that requires careful attention and maintenance. Understanding how different parts work together is key to maintaining good health.\n\n" +
          "## Considering Medical Factors\n\n" +
          "When considering medical questions, it's important to look at both immediate symptoms and long-term effects. Various factors like diet, exercise, sleep, and stress levels all play crucial roles in our overall wellbeing. These elements don't exist in isolation - they form an interconnected web of influences on our health.\n\n" +
          "## Modern Medical Science\n\n" +
          "Modern medical science continues to make breakthrough discoveries about how our bodies function. From the microscopic level of cellular interactions to the broader systems like circulation and digestion, we're constantly learning more about human biology. This growing knowledge helps us develop better treatments and preventive measures.\n\n" +
          "## Impact of Lifestyle Choices\n\n" +
          "Lifestyle choices have a significant impact on health outcomes. Regular exercise, balanced nutrition, adequate sleep, and stress management techniques can help prevent many common health issues. It's also important to maintain regular check-ups with healthcare providers to catch potential problems early.\n\n" +
          "## Individual Variations\n\n" +
          "While general health guidelines exist, individual needs can vary greatly based on factors like age, genetics, environment, and pre-existing conditions. What works well for one person may not be as effective for another, which is why personalized medical advice is so important.",
        sources: [
          {
            id: "1",
            title: "Sample Medical Journal",
            author: "Dr. Smith",
            link: "https://example.com",
          },
        ],
        followUpQuestions: [
          "What are the side effects?",
          "How long does treatment take?",
          "Are there alternative treatments?",
        ],
        disclaimer:
          "This is for informational purposes only. Consult your doctor for medical advice.",
      };

      setIsTyping(false);
      setCurrentAnswer(mockAnswer);
      setMessages((prev) => [
        ...prev,
        { type: "system", content: mockAnswer.text, answer: mockAnswer },
      ]);
    }, 1500);
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
                  <Answer
                    answer={message.answer}
                    isTyping={isTyping && index === messages.length - 1}
                  />
                ) : (
                  <div className="max-w-2xl bg-blue-500/10 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 font-body">
                    {message.content}
                  </div>
                )}
              </div>
            ))}
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
