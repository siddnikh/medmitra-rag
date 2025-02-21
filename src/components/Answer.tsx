import React from "react";
import ReactMarkdown from "react-markdown";
import type { Answer as AnswerType } from "../types";

interface AnswerProps {
  answer: AnswerType;
  isTyping?: boolean;
}

export function Answer({ answer, isTyping }: AnswerProps) {
  return (
    <div className="flex w-full gap-8 font-body">
      {/* Main chat content - 2/3 width */}
      <div className="flex-grow-[2] bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
        {isTyping ? (
          <div className="flex gap-2 items-center">
            <div className="typing-dot"></div>
            <div className="typing-dot animation-delay-200"></div>
            <div className="typing-dot animation-delay-400"></div>
          </div>
        ) : (
          <>
            <div className="prose prose-invert max-w-none prose-headings:font-heading prose-h1:text-blue-400 prose-h2:text-blue-300/90 prose-p:font-body prose-p:text-gray-200 prose-strong:text-blue-200">
              <ReactMarkdown>{answer.text}</ReactMarkdown>
            </div>
            {answer.disclaimer && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 italic font-body">
                  {answer.disclaimer}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sources sidebar - 1/3 width */}
      <div className="flex-grow-1 w-1/3">
        {answer.sources.length > 0 && (
          <div className="bg-gray-800/30 rounded-xl p-6 backdrop-blur-sm border border-blue-500/10">
            <h3 className="text-lg font-heading font-semibold mb-4 text-blue-400">
              Sources
            </h3>
            <ul className="space-y-3">
              {answer.sources.map((source) => (
                <li key={source.id} className="group">
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-400 transition-colors font-body"
                  >
                    {source.title}
                  </a>
                  {source.author && (
                    <span className="block text-sm text-gray-500 font-body">
                      {source.author}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
