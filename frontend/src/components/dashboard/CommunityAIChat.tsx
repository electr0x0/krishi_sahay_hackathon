'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import ReactMarkdown from 'react-markdown';

interface CommunityAIChatProps {
  community: any;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CommunityAIChat = ({ community, isOpen, onClose }: CommunityAIChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `আসসালামু আলাইকুম! আমি আপনার সম্প্রদায় সহায়ক AI। আমি "${community?.name || 'সম্প্রদায়'}" সম্পর্কে সব কিছু ব্যাখ্যা করতে পারি।\n\nআপনি আমাকে জিজ্ঞাসা করতে পারেন:\n\n• সম্প্রদায়ের বিভিন্ন বৈশিষ্ট্য সম্পর্কে\n• কীভাবে আলোচনা, ট্র্যাকার, স্টোর বা তহবিল ব্যবহার করবেন\n• সম্প্রদায়ে যোগদান বা নতুন সম্প্রদায় তৈরি করার বিষয়ে\n• সাহায্য চাওয়া বা দেওয়ার নিয়ম\n• ইভেন্ট তৈরি বা যোগদান\n• তহবিলে দান, ঋণ বা বিনিয়োগ\n\nআপনার প্রশ্ন করুন!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, community]);

  // Create or get chat session
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession();
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const createSession = async () => {
    try {
      const session = await api.createChatSession({
        title: `সম্প্রদায় সহায়ক: ${community?.name || 'Community'}`,
        language: 'bn'
      });
      setSessionId(session.session_id);
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create enhanced prompt with community context
      const enhancedPrompt = `আপনি একজন কৃষি সম্প্রদায় সহায়ক AI। আপনি "${community?.name || 'সম্প্রদায়'}" সম্প্রদায় সম্পর্কে সাহায্য করছেন।

সম্প্রদায়ের তথ্য:
- নাম: ${community?.name || 'N/A'}
- অবস্থান: ${community?.location || 'N/A'}, ${community?.area || 'N/A'}
- সদস্য সংখ্যা: ${community?.totalMembers || 0}
- বর্ণনা: ${community?.description || 'N/A'}

সম্প্রদায়ের বৈশিষ্ট্যগুলো:
1. **সংক্ষিপ্ত (Overview)**: সম্প্রদায়ের মূল তথ্য, নিয়ম এবং যোগদানের শর্ত দেখুন
2. **সদস্য (Members)**: সম্প্রদায়ের সব সদস্যদের তালিকা
3. **আলোচনা (Chat)**: সদস্যদের সাথে কথা বলুন, সাহায্য চান বা ইভেন্ট তৈরি করুন
4. **ট্র্যাকার (Tracker)**: সাহায্যের অনুরোধ এবং ইভেন্টগুলো দেখুন এবং ট্র্যাক করুন
5. **স্টোর (Store)**: কৃষি যন্ত্রপাতি, বীজ, সার ইত্যাদি কিনুন বা বিক্রি করুন
6. **তহবিল (Funds)**: সম্প্রদায়ের তহবিলে দান করুন, ঋণ নিন (সুদ ছাড়া) বা বিনিয়োগ করুন (লাভের জন্য)

ব্যবহারকারীর প্রশ্ন: ${text.trim()}

আপনার কাজ:
- সহজ বাংলায় উত্তর দিন
- কৃষকদের জন্য বোঝার মতো ভাষা ব্যবহার করুন
- উদাহরণ দিন
- ধাপে ধাপে ব্যাখ্যা করুন
- সম্প্রদায়ের বৈশিষ্ট্যগুলো সম্পর্কে বিস্তারিত জানান`;

      const response = await api.sendMessage(sessionId, {
        content: enhancedPrompt,
        language: 'bn',
        message_type: 'text'
      });

      const aiMessage: Message = {
        id: response.ai_message.message_id || Date.now().toString(),
        role: 'assistant',
        content: response.ai_message.content || 'দুঃখিত, আমি উত্তর দিতে পারিনি।',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'দুঃখিত, আপনার বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !sessionId) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessageWithText(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'সম্প্রদায় কী?',
    'কীভাবে আলোচনায় যোগ দিব?',
    'তহবিল কীভাবে ব্যবহার করব?',
    'সাহায্য কীভাবে চাইব?'
  ];

  const handleQuickQuestion = async (question: string) => {
    if (!sessionId) {
      await createSession();
      // Wait a bit for session to be created
      setTimeout(async () => {
        await sendMessageWithText(question);
      }, 500);
    } else {
      await sendMessageWithText(question);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          
          {/* Chat Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <CardHeader className="border-b bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">সম্প্রদায় সহায়ক AI</CardTitle>
                    <p className="text-xs text-green-100">প্রশ্ন করুন, আমি সাহায্য করব</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">দ্রুত প্রশ্ন:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(q)}
                        className="text-xs h-auto py-1 px-2"
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('bn-BD', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        {user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  disabled={isLoading || !sessionId}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading || !sessionId}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter চাপুন বা Send বাটনে ক্লিক করুন
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommunityAIChat;

