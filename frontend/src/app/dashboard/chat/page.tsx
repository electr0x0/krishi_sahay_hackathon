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
  Bot, 
  User as UserIcon, 
  Loader2, 
  Plus,
  MessageCircle,
  Trash2,
  Star,
  StarOff,
  Clock,
  Smartphone,
  Cpu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { Card } from '@/components/ui/card';
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
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
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
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-600 font-medium mb-2 flex items-center">
          <Cpu className="w-3 h-3 mr-1" />
          {language === 'bn' ? 'AI টুল ব্যবহার করেছে' : 'AI used tools'}
        </div>
        
        {/* Show tool calls if available */}
        {hasCalls && (
          <div className="mb-2">
            <div className="text-xs font-medium text-blue-700 mb-1">
              {language === 'bn' ? 'ব্যবহৃত টুলসমূহ:' : 'Tools Used:'}
            </div>
            <div className="flex flex-wrap gap-1">
              {calls.map((call, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {call.name?.replace(/_/g, ' ') || 'Unknown Tool'}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Show tool outputs if available */}
        {hasOutputs && Object.entries(outputs).map(([tool, data], index) => (
          <div key={index} className="mb-2 last:mb-0">
            <div className="text-xs font-medium text-blue-700 mb-1 capitalize">
              📊 {tool.replace(/_/g, ' ')}
            </div>
            
            {/* Weather data display */}
            {(tool.includes('weather') || tool.includes('current_weather')) && data && typeof data === 'object' && (
              <div className="text-xs text-gray-600 bg-white p-2 rounded">
                {data.main && (
                  <>
                    🌡️ {Math.round(data.main.temp)}°C 
                    {data.main.feels_like && ` (অনুভব ${Math.round(data.main.feels_like)}°C)`}
                    | 💧 {data.main.humidity}%
                    {data.wind && ` | 💨 ${data.wind.speed} m/s`}
                    {data.name && ` | 📍 ${data.name}`}
                  </>
                )}
                {data.weather && data.weather[0] && (
                  <div className="mt-1">☁️ {data.weather[0].description}</div>
                )}
              </div>
            )}
            
            {/* Weather forecast display */}
            {(tool.includes('forecast') || tool.includes('weather_forecast')) && data && data.list && (
              <div className="text-xs text-gray-600 bg-white p-2 rounded">
                <div className="font-medium mb-1">পরবর্তী ৩ দিনের পূর্বাভাস:</div>
                {data.list.slice(0, 3).map((item, i) => (
                  <div key={i} className="mb-1">
                    📅 {new Date(item.dt * 1000).toLocaleDateString('bn-BD')} - 
                    🌡️ {Math.round(item.main.temp)}°C | 
                    ☁️ {item.weather[0]?.description}
                  </div>
                ))}
              </div>
            )}
            
            {/* Market price display */}
            {(tool.includes('price') || tool.includes('item_price')) && (
              <div className="text-xs text-gray-600 bg-white p-2 rounded space-y-1">
                {Array.isArray(data) ? (
                  data.slice(0, 3).map((item, i) => (
                    <div key={i}>💰 {item.item || item.name}: ৳{item.price} {item.unit && `per ${item.unit}`}</div>
                  ))
                ) : data && typeof data === 'object' && data.price ? (
                  <div>💰 {data.item || 'Item'}: ৳{data.price} {data.unit && `per ${data.unit}`}</div>
                ) : (
                  <div>💰 {language === 'bn' ? 'দাম তথ্য পাওয়া গেছে' : 'Price information retrieved'}</div>
                )}
              </div>
            )}
            
            {/* Crop/Disease diagnosis display */}
            {tool.includes('crop') && data && (
              <div className="text-xs text-gray-600 bg-white p-2 rounded">
                {typeof data === 'object' ? (
                  <div>
                    {data.disease && <div>🦠 রোগ: {data.disease}</div>}
                    {data.treatment && <div>💊 চিকিৎসা: {data.treatment}</div>}
                    {data.prevention && <div>🛡️ প্রতিরোধ: {data.prevention}</div>}
                  </div>
                ) : (
                  <div>🌱 {String(data).substring(0, 100)}</div>
                )}
              </div>
            )}
            
            {/* Generic data display for other tools */}
            {!tool.includes('weather') && !tool.includes('price') && !tool.includes('crop') && !tool.includes('forecast') && (
              <div className="text-xs text-gray-600 bg-white p-2 rounded">
                {typeof data === 'object' ? (
                  <div>
                    {Object.keys(data).length > 0 ? (
                      Object.entries(data).slice(0, 3).map(([key, value], i) => (
                        <div key={i}>{key}: {String(value).substring(0, 50)}</div>
                      ))
                    ) : (
                      'ডেটা প্রাপ্ত'
                    )}
                  </div>
                ) : (
                  <div>{String(data).substring(0, 100)}</div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* If no outputs but we have calls, show a generic message */}
        {!hasOutputs && hasCalls && (
          <div className="text-xs text-gray-500 italic">
            {language === 'bn' ? 'টুল ব্যবহার করা হয়েছে কিন্তু আউটপুট প্রদর্শনযোগ্য নয়' : 'Tools were used but output is not displayable'}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error parsing tool data:', error);
    return (
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-600">
        <Cpu className="w-3 h-3 inline mr-1" />
        {language === 'bn' ? 'AI টুল ব্যবহার করেছে' : 'AI used tools'}
      </div>
    );
  }
};

const ChatInterface = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  }, [isAuthenticated]);

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

  const sendMessage = async (messageText, isVoice = false) => {
    if (!messageText.trim() || !currentSession) return;

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

      // Add both messages to the display
      setMessages(prev => [...prev, response.user_message, response.ai_message]);
      
      // Speak AI response if it's a voice message
      if (isVoice && response.ai_message.content) {
        setTimeout(() => {
          speak(response.ai_message.content);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
    <div className="h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0`}>
        <div className="p-4">
          <Button
            onClick={() => setShowSidebar(!showSidebar)}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <MessageCircle className="h-4 w-4" />
            {showSidebar && <span className="ml-2">চ্যাট সেশন</span>}
          </Button>
        </div>

        {showSidebar && (
          <div className="px-4 pb-4">
            <Button
              onClick={createNewSession}
              className="w-full mb-4 bg-green-500 hover:bg-green-600"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              নতুন চ্যাট
            </Button>

            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {chatSessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentSession?.session_id === session.session_id
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
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
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
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
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm p-6 border-b border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">কৃষি সহায়</h1>
                <p className="text-sm text-gray-500">আপনার কৃষি বিশেষজ্ঞ</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* TTS Status/Stop Button */}
              {(isSpeaking || isTTSLoading) && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700"
                >
                  {isTTSLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              {/* Backend TTS Indicator */}
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded" title="gTTS সেবা ব্যবহার করা হচ্ছে">
                🤖 gTTS
              </span>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bot className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  আস্সালামু আলাইকুম!
                </h2>
                <p className="text-gray-500">
                  আমি আপনার কৃষি বিষয়ক যেকোনো প্রশ্নের উত্তর দিতে পারি
                </p>
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
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-green-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      {message.role === 'user' ? (
                        <UserIcon className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.role === 'user' ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={MarkdownComponents}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {message.message_type === 'voice' && (
                        <div className="flex items-center mt-2 text-xs opacity-75">
                          <Smartphone className="w-3 h-3 mr-1" />
                          ভয়েস মেসেজ
                        </div>
                      )}
                      
                      {message.role === 'assistant' && (
                        <>
                          <div className="flex items-center mt-2 space-x-2">
                            <Button
                              onClick={() => speak(message.content)}
                              variant="ghost"
                              size="sm"
                              className="h-6 p-1 text-gray-500 hover:text-gray-700"
                              disabled={isSpeaking}
                            >
                              <Volume2 className="w-4 h-4" />
                            </Button>
                            
                            {message.processing_time && (
                              <span className="text-xs text-gray-500">
                                {message.processing_time.toFixed(1)}s
                              </span>
                            )}
                          </div>
                          
                          {/* Tool outputs display */}
                          <ToolOutputDisplay 
                            toolOutputs={message.tool_outputs}
                            toolCalls={message.tool_calls}
                            language={language}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-sm text-gray-500">চিন্তা করছি...</span>
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
          className="bg-white shadow-lg p-6 border-t border-gray-200"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleVoiceMessage}
                  disabled={isLoading}
                  variant={isListening ? "destructive" : "outline"}
                  size="lg"
                  className={isListening ? "animate-pulse" : ""}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;