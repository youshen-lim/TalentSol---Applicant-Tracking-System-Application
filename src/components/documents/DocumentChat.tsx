import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Document } from '@/pages/Documents';
import { Send, Bot, User, FileText } from 'lucide-react';
import { cn, formatDate, generateId } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface DocumentChatProps {
  selectedDocument: Document | null;
}

/**
 * DocumentChat component
 * Provides a chat interface for natural language querying about documents
 */
const DocumentChat: React.FC<DocumentChatProps> = ({ selectedDocument }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      content: "Hello! I'm your document assistant. You can ask me about document status, request updates, or get information about document workflows.",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add document selection message when document changes
  useEffect(() => {
    if (selectedDocument) {
      const documentMessage: Message = {
        id: generateId(),
        content: `You've selected "${selectedDocument.title}" for ${selectedDocument.candidateName}. This document is currently ${selectedDocument.status}. How can I help you with this document?`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, documentMessage]);
    }
  }, [selectedDocument]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate assistant response
    setTimeout(() => {
      let responseContent = '';

      // Generate contextual responses based on user input and selected document
      if (inputValue.toLowerCase().includes('status')) {
        if (selectedDocument) {
          responseContent = `The document "${selectedDocument.title}" for ${selectedDocument.candidateName} is currently ${selectedDocument.status}.`;
          if (selectedDocument.dueDate) {
            responseContent += ` It's due on ${formatDate(selectedDocument.dueDate)}.`;
          }
        } else {
          responseContent = "Please select a document first to check its status.";
        }
      } else if (inputValue.toLowerCase().includes('send reminder') || inputValue.toLowerCase().includes('remind')) {
        if (selectedDocument) {
          responseContent = `I've sent a reminder to ${selectedDocument.candidateName} about the "${selectedDocument.title}" document.`;
        } else {
          responseContent = "Please select a document first to send a reminder.";
        }
      } else if (inputValue.toLowerCase().includes('when') && selectedDocument) {
        responseContent = `The document "${selectedDocument.title}" was created on ${formatDate(selectedDocument.createdAt)} and last updated on ${formatDate(selectedDocument.updatedAt)}.`;
      } else {
        // Generic responses
        const genericResponses = [
          "I can help you track document status, send reminders, or provide information about document workflows.",
          "Would you like me to explain the e-signature process?",
          "I can help you understand the document workflow status for any candidate.",
          "Is there anything specific about this document you'd like to know?",
        ];
        responseContent = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      }

      const assistantMessage: Message = {
        id: generateId(),
        content: responseContent,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat header */}
      <div className="p-4 border-b bg-ats-blue/10">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-ats-blue" />
          <h3 className="font-medium">Document Assistant</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Ask about document status, workflows, or request actions
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  message.sender === 'user'
                    ? "bg-ats-blue text-white"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.sender === 'assistant' ? 'Assistant' : 'You'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-ats-blue hover:bg-ats-dark-blue"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Powered by Claude AI • Ask about document status, workflows, or request actions
        </p>
      </div>
    </>
  );
};

export default DocumentChat;
