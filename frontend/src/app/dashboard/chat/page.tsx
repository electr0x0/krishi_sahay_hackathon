'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  User, 
  Plus,
  MessageCircle,
  Trash2,
  Clock,
  Smartphone,
  Cpu,
  Leaf,
  Sparkles,
  Brain,
  RotateCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';

// Import highlight.js styles for code syntax highlighting
import 'highlight.js/styles/github.css';

// Custom markdown components for better styling
const MarkdownComponents = {
  // Custom paragraph styling
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  
  // Custom heading styling
  h1: ({ children }) => (
    <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold mb-2 text-gray-800">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-medium mb-1 text-gray-700">{children}</h3>
  ),
  
  // Custom list styling
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="ml-2">{children}</li>
  ),
  
  // Custom code styling
  code: ({ inline, className, children, ...props }) => {
    return !inline ? (
      <pre className="bg-gray-800 text-gray-100 p-3 rounded-lg mb-2 overflow-x-auto text-xs">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    );
  },
  
  // Custom blockquote styling
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 pl-3 italic text-gray-700 mb-2">
      {children}
    </blockquote>
  ),
  
  // Custom table styling
  table: ({ children }) => (
    <div className="overflow-x-auto mb-2">
      <table className="min-w-full text-xs border border-gray-300">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium text-left">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-2 py-1">{children}</td>
  ),
  
  // Custom link styling
  a: ({ children, href }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
  
  // Custom strong/bold styling
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  
  // Custom emphasis/italic styling
  em: ({ children }) => (
    <em className="italic text-gray-800">{children}</em>
  ),
  
  // Custom horizontal rule
  hr: () => (
    <hr className="border-gray-300 my-3" />
  )
};

// Voice Recognition Hook
const useVoiceRecognition = (language = 'bn-BD') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = (event) => {
        const result = event.results[0][0];
        setTranscript(result.transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening, setTranscript };
};

// TTS Hook using Backend gTTS Service
const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const speak = async (text) => {
    if (!text.trim() || isSpeaking || isLoading) return;

    try {
      setIsLoading(true);
      console.log('🎯 Using backend gTTS service for:', text.substring(0, 50) + '...');

      // Detect language
      const containsBengali = /[\u0980-\u09FF]/.test(text);
      const languageCode = containsBengali ? 'bn' : 'en';

      // Stop any currently playing audio
      stop();

      // Call backend TTS API
      const response = await api.synthesizeSpeech(text, languageCode, false);
      
      // Create audio from response blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onplay = () => {
        setIsSpeaking(true);
        setIsLoading(false);
        console.log('✅ Backend gTTS started playing');
      };
      
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.log('✅ Backend gTTS completed');
      };
      
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
        console.error('❌ Backend gTTS playback failed');
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('❌ Backend gTTS failed:', error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  };

  return { 
    isSpeaking,
    isLoading,
    speak, 
    stop
  };
};

// Helper function to render tool outputs in a structured way
const ToolOutputDisplay = ({ toolOutputs, toolCalls, language }) => {
  if (!toolOutputs && !toolCalls) return null;

  try {
    const outputs = typeof toolOutputs === 'string' ? JSON.parse(toolOutputs) : toolOutputs || {};
    const calls = typeof toolCalls === 'string' ? JSON.parse(toolCalls) : toolCalls || [];
    
    // If we have tool calls but no outputs, show just the calls
    const hasOutputs = Object.keys(outputs).length > 0;
    const hasCalls = Array.isArray(calls) && calls.length > 0;
    
    if (!hasOutputs && !hasCalls) return null;
    
    return (
      <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 w-1/2 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
              <Cpu className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {language === 'bn' ? 'AI টুলস' : 'AI Tools'}
            </span>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        {/* Show tool calls if available */}
        {hasCalls && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {calls.map((call, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs font-medium text-gray-700">
                    {call.name?.replace(/_/g, ' ') || 'Unknown Tool'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Show tool outputs if available */}
        {hasOutputs && Object.entries(outputs).map(([tool, data], index) => (
          <div key={index} className="mb-4 last:mb-0">
            <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center capitalize">
              <div className="w-5 h-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-xs text-white">🔧</span>
              </div>
              {tool.replace(/_/g, ' ')}
            </div>
            
            {/* Weather data display */}
            {(tool.includes('weather') || tool.includes('current_weather')) && data && typeof data === 'object' && (
              <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                {data.main && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🌡️</span>
                        <span className="text-sm font-medium text-gray-700">Temperature</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{Math.round(data.main.temp)}°C</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">💧</span>
                        <span className="text-sm font-medium text-gray-700">Humidity</span>
                      </div>
                      <span className="text-lg font-bold text-cyan-600">{data.main.humidity}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Market price display */}
            {(tool.includes('price') || tool.includes('item_price')) && (
              <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                {Array.isArray(data) ? (
                  <div className="space-y-2">
                    {data.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-sm mr-2">💰</span>
                          <span className="font-medium text-gray-800 text-sm">{item.item || item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">৳{item.price}</span>
                      </div>
                    ))}
                  </div>
                ) : data && typeof data === 'object' && data.price ? (
                  <div className="flex items-center justify-between p-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-sm mr-2">💰</span>
                      <span className="font-medium text-gray-800 text-sm">{data.item || 'পণ্য'}</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">৳{data.price}</span>
                  </div>
                ) : (
                  <div className="p-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-sm mr-2">💰</span>
                      <span className="text-sm text-green-600 font-medium">Price information retrieved</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Crop/Disease diagnosis display */}
            {tool.includes('crop') && data && (
              <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                {typeof data === 'object' ? (
                  <div className="space-y-3">
                    {data.disease && (
                      <div className="p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🦠</span>
                          <span className="font-medium text-gray-800">Disease: {data.disease}</span>
                        </div>
                      </div>
                    )}
                    {data.treatment && (
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">💊</span>
                          <span className="font-medium text-gray-800">Treatment: {data.treatment}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🌱</span>
                      <span className="text-gray-700">{String(data).substring(0, 100)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Generic data display for other tools */}
            {!tool.includes('weather') && !tool.includes('price') && !tool.includes('crop') && !tool.includes('forecast') && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-lg mr-2">✅</span>
                    <span className="text-gray-700 font-medium">Data retrieved successfully</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* If no outputs but we have calls, show a generic message */}
        {!hasOutputs && hasCalls && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center text-gray-600">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">
                {language === 'bn' ? 'AI টুলস ব্যবহার করা হয়েছে' : 'AI Tools executed successfully'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error parsing tool data:', error);
    return (
      <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 w-1/2 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="text-blue-700 font-medium">
            {language === 'bn' ? 'AI টুল ব্যবহার করা হয়েছে' : 'AI Tools used successfully'}
          </span>
        </div>
      </div>
    );
  }
};

const ChatInterface = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // New state for typing effect
  const [typingMessage, setTypingMessage] = useState(''); // Current typing message content
  const [typingMessageId, setTypingMessageId] = useState(null); // ID of message being typed
  const [currentSession, setCurrentSession] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [language] = useState('bn'); // Only Bengali as requested
  
  const messagesEndRef = useRef(null);
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceRecognition('bn-BD');
  const { 
    isSpeaking, 
    isLoading: isTTSLoading,
    speak, 
    stop: stopSpeaking
  } = useSpeechSynthesis();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update input with voice transcript
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      setTranscript('');
    }
  }, [transcript, setTranscript]);

  // Initialize on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadChatSessions();
    }
  }, [isAuthenticated]); // loadChatSessions is defined within this component, so it's safe to exclude

  // Load chat sessions
  const loadChatSessions = async () => {
    try {
      const sessions = await api.getChatSessions();
      setChatSessions(sessions);
      
      // If no current session and sessions exist, select the most recent
      if (!currentSession && sessions.length > 0) {
        await selectSession(sessions[0]);
      } else if (!currentSession) {
        // Create a new session if none exist
        await createNewSession();
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  // Create new session
  const createNewSession = async () => {
    try {
      const sessionData = await api.createChatSession({
        title: 'নতুন কথোপকথন',
        language: 'bn'
      });
      
      setCurrentSession(sessionData);
      setChatSessions(prev => [sessionData, ...prev]);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
  };

  // Select a session and load its messages
  const selectSession = async (session) => {
    try {
      setCurrentSession(session);
      const history = await api.getChatHistory(session.session_id);
      setMessages(history || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    }
  };

  // Delete a session
  const deleteSession = async (sessionId) => {
    try {
      await fetch(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' });
      setChatSessions(prev => prev.filter(s => s.session_id !== sessionId));
      
      if (currentSession?.session_id === sessionId) {
        const remaining = chatSessions.filter(s => s.session_id !== sessionId);
        if (remaining.length > 0) {
          await selectSession(remaining[0]);
        } else {
          await createNewSession();
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // Function to create typing effect for AI responses
  const typeMessage = async (messageContent, messageId) => {
    setIsTyping(true);
    setTypingMessageId(messageId);
    setTypingMessage('');
    
    const words = messageContent.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setTypingMessage(currentText);
      
      // Fast typing speed - 50ms per word
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Small pause before completing the message
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setIsTyping(false);
    setTypingMessage('');
    setTypingMessageId(null);
  };

  const sendMessage = async (messageText, isVoice = false) => {
    if (!messageText.trim() || !currentSession) return;

    // Create user message object and add it immediately
    const userMessage = {
      message_id: Date.now().toString(),
      role: 'user',
      content: messageText,
      message_type: isVoice ? 'voice' : 'text',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately to show it in chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputText('');

    try {
      const response = await api.sendMessage(currentSession.session_id, {
        content: messageText,
        language: 'bn',
        message_type: isVoice ? 'voice' : 'text',
        voice_confidence: isVoice ? 0.9 : undefined,
        voice_duration: isVoice ? 2.0 : undefined
      });

      setIsLoading(false);

      // Add user message first (without AI response yet)
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.message_id !== userMessage.message_id);
        return [...withoutTemp, response.user_message];
      });

      // Start typing effect for AI response
      const aiMessageWithTyping = {
        ...response.ai_message,
        isTyping: true
      };
      
      setMessages(prev => [...prev, aiMessageWithTyping]);

      // Start the typing animation
      await typeMessage(response.ai_message.content, response.ai_message.message_id);

      // Replace with final message
      setMessages(prev => 
        prev.map(msg => 
          msg.message_id === response.ai_message.message_id 
            ? { ...response.ai_message, isTyping: false }
            : msg
        )
      );
      
      // Speak AI response if it's a voice message
      if (isVoice && response.ai_message.content) {
        setTimeout(() => {
          speak(response.ai_message.content);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.message_id !== userMessage.message_id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputText);
  };

  const handleVoiceMessage = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">অনুগ্রহ করে লগইন করুন</h1>
          <p className="text-gray-600">চ্যাট ব্যবহার করতে আপনাকে লগইন করতে হবে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen border-2 rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl"></div>
      </div>
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-16'} bg-white/80 backdrop-blur-md border-r border-gray-100 transition-all duration-300 flex-shrink-0 shadow-sm relative z-10`}>
        <div className="p-4">
          <Button
            onClick={() => setShowSidebar(!showSidebar)}
            variant="ghost"
            size="sm"
            className="w-full justify-start hover:bg-green-50 text-green-700"
          >
            <MessageCircle className="h-4 w-4" />
            {showSidebar && <span className="ml-2 font-medium">চ্যাট সেশন</span>}
          </Button>
        </div>

        {showSidebar && (
          <div className="px-4 pb-4">
            <Button
              onClick={createNewSession}
              className="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন চ্যাট
            </Button>

            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {chatSessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`group p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentSession?.session_id === session.session_id
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm'
                      : 'bg-gray-50/50 border-gray-200 hover:bg-white hover:border-gray-300'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {session.title}
                        </h4>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(session.last_activity).toLocaleDateString('bn-BD')}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.session_id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md shadow-sm p-4 border-b border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  কৃষি সহায়
                </h1>
                <p className="text-xs text-gray-500 flex items-center">
                  <Brain className="w-3 h-3 mr-1" />
                  স্মার্ট কৃষি বিশেষজ্ঞ
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* TTS Status/Stop Button */}
              {(isSpeaking || isTTSLoading) && (
                <Button
                  onClick={stopSpeaking}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:bg-green-50 p-2"
                >
                  {isTTSLoading ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              {/* AI Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">অনলাইন</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="w-full max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 px-8"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-green-500/25">
                    <Leaf className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent">
                    Welcome to 
                  </span>
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    কৃষি সহায়
                  </span>
                </h1>
                
                <p className="text-gray-600 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                  Get started by asking a question about farming and agriculture. Chat can do the rest. Not sure where to start?
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
                    onClick={() => setInputText("ধানের রোগ সম্পর্কে জানতে চাই")}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl">🌾</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Crop diseases</h3>
                    <p className="text-sm text-gray-600">Learn about rice and other crop diseases</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    onClick={() => setInputText("আজকের আবহাওয়া কেমন?")}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl">🌤️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Weather info</h3>
                    <p className="text-sm text-gray-600">Get current weather and forecasts</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
                    onClick={() => setInputText("সবজির দাম জানতে চাই")}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Market prices</h3>
                    <p className="text-sm text-gray-600">Check current vegetable and crop prices</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                    onClick={() => setInputText("স্মার্ট কৃষি প্রযুক্তি সম্পর্কে জানতে চাই")}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smart farming</h3>
                    <p className="text-sm text-gray-600">Learn about modern agricultural technology</p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.message_id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`flex items-start max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-green-100 to-emerald-50 border border-green-200'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Leaf className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`relative group ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      <div className={`px-3 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm hover:shadow-md'
                      }`}>
                        {message.role === 'user' ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <>
                            <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-green">
                              {message.isTyping && isTyping && typingMessageId === message.message_id ? (
                                // Show typing effect
                                <div className="space-y-2">
                                  <ReactMarkdown
                                    components={MarkdownComponents}
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                  >
                                    {typingMessage}
                                  </ReactMarkdown>
                                  <div className="inline-flex items-center space-x-1">
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                  </div>
                                </div>
                              ) : (
                                // Show complete message
                                <ReactMarkdown
                                  components={MarkdownComponents}
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              )}
                            </div>
                          </>
                        )}
                        
                        {message.message_type === 'voice' && (
                          <div className="flex items-center mt-2 text-xs opacity-70">
                            <div className="flex items-center bg-black/10 rounded-full px-2 py-1">
                              <Smartphone className="w-3 h-3 mr-1" />
                              <span>ভয়েস</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Message actions for AI responses */}
                      {message.role === 'assistant' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => speak(message.content)}
                                disabled={isSpeaking || isTTSLoading}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50"
                              >
                                {isTTSLoading ? (
                                  <RotateCw className="w-3 h-3 animate-spin" />
                                ) : isSpeaking ? (
                                  <VolumeX className="w-3 h-3" />
                                ) : (
                                  <Volume2 className="w-3 h-3" />
                                )}
                              </Button>
                              
                              {message.processing_time && (
                                <div className="flex items-center text-xs text-gray-400">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {message.processing_time.toFixed(1)}s
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Tool outputs display - only show after typing is complete */}
                          {!(message.isTyping && isTyping && typingMessageId === message.message_id) && (
                            <ToolOutputDisplay 
                              toolOutputs={message.tool_outputs}
                              toolCalls={message.tool_calls}
                              language={language}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-6"
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-50 border border-green-200 rounded-full flex items-center justify-center shadow-md">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      {/* Modern typing indicator */}
                      <div className="flex space-x-1">
                        <motion.div 
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            delay: 0
                          }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            delay: 0.2
                          }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            delay: 0.4
                          }}
                        />
                      </div>
                      
                      {/* AI thinking text with shimmer effect */}
                      <motion.span 
                        className="text-sm text-gray-600 font-medium"
                        animate={{ 
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity 
                        }}
                      >
                        AI চিন্তা করছে...
                      </motion.span>
                    </div>
                    
                    {/* Cool progress bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <motion.div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-1 rounded-full"
                          animate={{ 
                            width: ["0%", "70%", "100%", "0%"]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md shadow-xl p-4 border-t border-gray-100"
        >
          <div className="w-full max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-end space-x-3 bg-gray-50/80 p-3 rounded-xl border border-gray-200">
                <div className="flex-1 relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="আপনার প্রশ্ন লিখুন..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-200 shadow-sm text-sm"
                    rows={2}
                    disabled={isLoading}
                  />
                  {inputText.length > 0 && (
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                      {inputText.length} অক্ষর
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleVoiceMessage}
                    disabled={isLoading}
                    variant={isListening ? "default" : "outline"}
                    size="lg"
                    className={`relative rounded-full ${isListening ? 
                      "bg-red-500 hover:bg-red-600 text-white animate-pulse" : 
                      "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                    {isListening && (
                      <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                  >
                    {isLoading ? (
                      <RotateCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;