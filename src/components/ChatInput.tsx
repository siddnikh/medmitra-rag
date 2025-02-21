import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  followUpQuestions?: string[];
  isInitialView?: boolean;
}

export function ChatInput({
  onSubmit,
  followUpQuestions,
  isInitialView,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a medical question..."
          className={`w-full p-4 pr-12 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 
            backdrop-blur-sm border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]
            focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.25)]
            transition-all duration-300 font-body ${
              isInitialView ? "text-xl" : "text-base"
            }`}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-400 
            hover:text-blue-300 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {followUpQuestions && followUpQuestions.length > 0 && (
        <div className="absolute -top-16 left-0 right-0 flex gap-2 overflow-x-auto pb-4 animate-slideUp">
          {followUpQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSubmit(question)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 
                text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 transition-colors
                border border-blue-500/20 whitespace-nowrap font-body"
            >
              <Sparkles className="w-4 h-4" />
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
