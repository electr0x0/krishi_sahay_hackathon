'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import dynamic from 'next/dynamic';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Brain,
  RotateCw,
  Leaf,
  Pause,
  Play,
  MessageSquare,
  Cpu,
  StopCircle,
  Timer,
  Maximize2,
  Radio
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';

// Import highlight.js styles
import 'highlight.js/styles/github-dark.css';

// Dynamically import 3D components (client-side only)
const Scene3DCanvas = dynamic(() => import('@/components/dashboard/voice-chat/Scene3DCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <motion.div
        className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
});

const RiceFieldScene = dynamic(() => import('@/components/dashboard/voice-chat/RiceFieldScene'), { 
  ssr: false 
});

// Custom markdown components for better styling
const MarkdownComponents: any = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-white">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-semibold mb-2 text-gray-200">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-medium mb-1 text-gray-300">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-2 space-y-1 text-sm text-white">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1 text-sm text-white">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="ml-2 text-gray-200">{children}</li>
  ),
  code: ({ inline, className, children, ...props }) => {
    return !inline ? (
      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg mb-2 overflow-x-auto text-xs border border-gray-700">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-green-400 pl-3 italic text-gray-300 mb-2 bg-gray-800/30 py-2 rounded-r">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-green-400">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-300">{children}</em>
  ),
  hr: () => (
    <hr className="border-gray-600 my-3" />
  )
};

// Tool Output Display Component
const ToolOutputDisplay = ({ toolOutputs, toolCalls, language = 'bn' }) => {
  if (!toolOutputs && !toolCalls) return null;

  try {
    const outputs = typeof toolOutputs === 'string' ? JSON.parse(toolOutputs) : toolOutputs || {};
    const calls = typeof toolCalls === 'string' ? JSON.parse(toolCalls) : toolCalls || [];
    
    const hasOutputs = Object.keys(outputs).length > 0;
    const hasCalls = Array.isArray(calls) && calls.length > 0;
    
    if (!hasOutputs && !hasCalls) return null;
    
    return (
      <div className="mt-2 p-2 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center mr-1">
              <Cpu className="w-2 h-2 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-400">
              {language === 'bn' ? 'AI টুলস' : 'AI Tools'}
            </span>
          </div>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        {hasCalls && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {calls.map((call, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center px-2 py-1 bg-black/40 rounded-full border border-green-500/30"
                >
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs font-medium text-green-300">
                    {call.name?.replace(/_/g, ' ') || 'Unknown Tool'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {hasOutputs && Object.entries(outputs).map(([tool, data], index) => (
          <div key={index} className="mb-2 last:mb-0">
            <div className="text-xs font-semibold text-green-400 mb-1 flex items-center capitalize">
              <div className="w-3 h-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded flex items-center justify-center mr-1">
                <span className="text-xs text-white">🔧</span>
              </div>
              {tool.replace(/_/g, ' ')}
            </div>
            
            {/* Weather data display */}
            {(tool.includes('weather') || tool.includes('current_weather')) && data && typeof data === 'object' && (
              <div className="bg-black/30 p-2 rounded-lg border border-blue-500/30">
                {(data as any).main && (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between p-2 bg-blue-900/30 rounded-lg">
                      <div className="flex items-center min-w-0">
                        <span className="text-sm mr-2">🌡️</span>
                        <span className="text-xs font-medium text-blue-300 truncate">Temperature</span>
                      </div>
                      <span className="text-sm font-bold text-blue-400 flex-shrink-0">{Math.round((data as any).main.temp)}°C</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-cyan-900/30 rounded-lg">
                      <div className="flex items-center min-w-0">
                        <span className="text-sm mr-2">💧</span>
                        <span className="text-xs font-medium text-cyan-300 truncate">Humidity</span>
                      </div>
                      <span className="text-sm font-bold text-cyan-400 flex-shrink-0">{(data as any).main.humidity}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Market price display */}
            {(tool.includes('price') || tool.includes('item_price')) && (
              <div className="bg-black/30 p-2 rounded-lg border border-green-500/30">
                {Array.isArray(data) ? (
                  <div className="space-y-2">
                    {data.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-green-900/30 rounded-lg">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className="text-sm mr-2 flex-shrink-0">💰</span>
                          <span className="font-medium text-green-300 text-xs truncate">{item.item || item.name}</span>
                        </div>
                        <span className="text-xs font-bold text-green-400 flex-shrink-0 ml-2">৳{item.price}</span>
                      </div>
                    ))}
                  </div>
                ) : data && typeof data === 'object' && (data as any).price ? (
                  <div className="flex items-center justify-between p-2 bg-green-900/30 rounded-lg">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className="text-sm mr-2 flex-shrink-0">💰</span>
                      <span className="font-medium text-green-300 text-xs truncate">{(data as any).item || 'পণ্য'}</span>
                    </div>
                    <span className="text-xs font-bold text-green-400 flex-shrink-0 ml-2">৳{(data as any).price}</span>
                  </div>
                ) : (
                  <div className="p-2 bg-green-900/30 rounded-lg text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-sm mr-2">💰</span>
                      <span className="text-xs text-green-400 font-medium">Price information retrieved</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Detection history display */}
            {(tool.includes('detection') || tool.includes('history')) && (
              <div className="bg-black/30 p-3 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-center">
                  <span className="text-sm mr-2">🔍</span>
                  <span className="text-sm text-purple-400 font-medium">Detection history retrieved</span>
                </div>
              </div>
            )}
            
            {/* Generic data display for other tools */}
            {!tool.includes('weather') && !tool.includes('price') && !tool.includes('crop') && !tool.includes('detection') && (
              <div className="bg-black/30 p-3 rounded-lg border border-gray-500/30">
                <div className="flex items-center justify-center">
                  <span className="text-lg mr-2">✅</span>
                  <span className="text-gray-300 font-medium">Data retrieved successfully</span>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {!hasOutputs && hasCalls && (
          <div className="bg-black/30 p-3 rounded-lg border border-green-500/30">
            <div className="text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-green-400">
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
      <div className="mt-3 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="text-green-400 font-medium">
            {language === 'bn' ? 'AI টুল ব্যবহার করা হয়েছে' : 'AI Tools used successfully'}
          </span>
        </div>
      </div>
    );
  }
};

// Voice Recognition Hook
const useVoiceRecognition = (language = 'bn-BD', onFinalResult: ((text: string, confidence: number) => void) | null = null) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    console.log('🎤 Checking speech recognition support...');
    
    if (typeof window !== 'undefined') {
      const hasSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setIsSupported(hasSupport);
      
      if (hasSupport) {
        console.log('✅ Speech recognition supported');
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;
        
        recognitionRef.current.onstart = () => {
          console.log('🎤 Speech recognition started');
          setIsListening(true);
          setError(null);
        };
        
        recognitionRef.current.onresult = (event: any) => {
          console.log('🎤 Speech result event:', event);
          const result = event.results[event.results.length - 1];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0.8;
          
          console.log('🎤 Transcript:', transcript, 'Final:', result.isFinal);
          setTranscript(transcript);
          setConfidence(confidence);
          
          if (result.isFinal) {
            finalTranscriptRef.current = transcript;
            console.log('🎤 Final speech result:', transcript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          console.log('🎤 Speech recognition ended');
          setIsListening(false);
          
          // Trigger callback with final result if available
          if (finalTranscriptRef.current.trim() && onFinalResult) {
            console.log('🎯 Processing final transcript:', finalTranscriptRef.current);
            onFinalResult(finalTranscriptRef.current, confidence);
          }
          
          // Reset for next session
          finalTranscriptRef.current = '';
        };
      } else {
        console.error('❌ Speech recognition not supported');
        setError('Speech recognition not supported in this browser');
      }
    }
  }, [language, onFinalResult]);

  const startListening = async () => {
    if (!recognitionRef.current) {
      console.error('❌ Speech recognition not initialized');
      setError('Speech recognition not available');
      return;
    }

    try {
      console.log('🎤 Starting speech recognition...');
      setTranscript('');
      setConfidence(0);
      setError(null);
      
      // Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone permission granted');
      }
      
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      setError(`Failed to start: ${error}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log('🎤 Stopping speech recognition...');
      recognitionRef.current.stop();
    }
  };

  return { 
    isListening, 
    transcript, 
    confidence, 
    isSupported,
    error,
    startListening, 
    stopListening, 
    setTranscript 
  };
};

// Enhanced TTS Hook
const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);

  const speak = async (text: string, onComplete?: () => void) => {
    if (!text.trim() || isSpeaking || isLoading) return;

    try {
      setIsLoading(true);
      console.log('🎯 Using backend gTTS service for voice response');

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
        setIsPaused(false);
      };
      
      audioRef.current.onpause = () => {
        setIsPaused(true);
      };
      
      audioRef.current.onended = () => {
        console.log('🔊 TTS finished speaking');
        setIsSpeaking(false);
        setIsPaused(false);
        URL.revokeObjectURL(audioUrl);
        
        // Call onComplete callback when speech actually finishes
        if (onComplete) {
          setTimeout(() => {
            console.log('🔊 Calling onComplete callback');
            onComplete();
          }, 500); // Small delay to ensure smooth transition
        }
      };
      
      audioRef.current.onerror = () => {
        console.error('🔊 TTS audio error');
        setIsSpeaking(false);
        setIsLoading(false);
        setIsPaused(false);
        URL.revokeObjectURL(audioUrl);
        
        // Still call onComplete even on error
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('❌ TTS failed:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pause = () => {
    if (audioRef.current && isSpeaking) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (audioRef.current && isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
    setIsPaused(false);
  };

  return { 
    isSpeaking,
    isLoading,
    isPaused,
    speak, 
    pause,
    resume,
    stop
  };
};

// Old 2D visualizer removed - now using 3D rice field scene with visualizer

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_outputs?: any;
  tool_calls?: any;
}

interface ChatSession {
  session_id: string;
  title: string;
  language: string;
}

// Main Voice Chat Component
const VoiceChatInterface = () => {
  const { isAuthenticated } = useAuth();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [uiState, setUiState] = useState('idle'); // idle, listening, processing, speaking, waiting
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [waitingCountdown, setWaitingCountdown] = useState(0);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    isSpeaking, 
    isLoading: isTTSLoading,
    isPaused,
    speak, 
    pause,
    resume,
    stop: stopSpeaking
  } = useSpeechSynthesis();

  // Type out message effect
  const typeMessage = useCallback((message: string, onComplete?: () => void) => {
    setIsTyping(true);
    setTypingMessage('');
    let index = 0;
    
    const typeNextChar = () => {
      if (index < message.length) {
        setTypingMessage(prev => prev + message[index]);
        index++;
        typingTimeoutRef.current = setTimeout(typeNextChar, 20);
      } else {
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    };
    
    typeNextChar();
  }, []);

  // Start waiting for next input with countdown
  const startWaitingForInput = useCallback(() => {
    if (!isConversationActive) return;
    
    setUiState('waiting');
    setWaitingCountdown(10);
    
    const countdown = setInterval(() => {
      setWaitingCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          // Auto-stop conversation if no input
          setIsConversationActive(false);
          setUiState('idle');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start listening automatically after 2 seconds
    waitingTimeoutRef.current = setTimeout(() => {
      if (isConversationActive) {
        startListening();
      }
    }, 2000);
  }, [isConversationActive]);

  // Define processVoiceInput function after speak is available
  const processVoiceInput = useCallback(async (voiceText: string, confidence = 0.8) => {
    if (!voiceText.trim() || !currentSession) return;

    // Clear any waiting timeouts
    if (waitingTimeoutRef.current) {
      clearTimeout(waitingTimeoutRef.current);
    }

    console.log('🎯 Processing voice input:', voiceText);
    setIsProcessing(true);
    setUiState('processing');
    
    // Add to conversation history
    const userMessage: Message = {
      role: 'user',
      content: voiceText,
      timestamp: new Date().toISOString()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const response = await api.sendMessage(currentSession.session_id, {
        content: voiceText,
        language: 'bn',
        message_type: 'voice',
        voice_confidence: confidence,
        voice_duration: 2.0
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.ai_message.content,
        timestamp: new Date().toISOString(),
        tool_outputs: response.ai_message.tool_outputs,
        tool_calls: response.ai_message.tool_calls
      };
      
      setConversationHistory(prev => [...prev, aiMessage]);
      
      // Type out the response first, then speak it
      typeMessage(response.ai_message.content, () => {
        setTimeout(() => {
          // Use the onComplete callback to wait for TTS to finish
          speak(response.ai_message.content, () => {
            console.log('🎯 TTS completed, checking for next input...');
            // After speaking finishes, start waiting for next input if conversation is active
            if (isConversationActive) {
              startWaitingForInput();
            }
          });
        }, 500);
      });
      
    } catch (error) {
      console.error('Failed to process voice input:', error);
      const errorMessage = 'দুঃখিত, আপনার প্রশ্ন প্রক্রিয়া করতে সমস্যা হয়েছে।';
      
      typeMessage(errorMessage, () => {
        setTimeout(() => {
          speak(errorMessage, () => {
            if (isConversationActive) {
              startWaitingForInput();
            }
          });
        }, 500);
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, speak, typeMessage, isConversationActive, startWaitingForInput]);
  
  const { 
    isListening, 
    transcript, 
    confidence,
    isSupported,
    error,
    startListening, 
    stopListening 
  } = useVoiceRecognition('bn-BD', processVoiceInput);

  // Initialize session on mount
  useEffect(() => {
    if (isAuthenticated) {
      initializeSession();
    }
  }, [isAuthenticated]);

  // Update UI state based on different states
  useEffect(() => {
    if (isListening) {
      setUiState('listening');
    } else if (isProcessing || isTTSLoading) {
      setUiState('processing');
    } else if (isSpeaking) {
      setUiState('speaking');
    } else if (isConversationActive && waitingCountdown > 0) {
      setUiState('waiting');
    } else {
      setUiState('idle');
    }
  }, [isListening, isProcessing, isTTSLoading, isSpeaking, isConversationActive, waitingCountdown]);

  // Initialize session on mount
  useEffect(() => {
    if (isAuthenticated) {
      initializeSession();
    }
  }, [isAuthenticated]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const initializeSession = async () => {
    try {
      const sessionData = await api.createChatSession({
        title: 'ভয়েস কথোপকথন',
        language: 'bn'
      });
      setCurrentSession(sessionData);
    } catch (error) {
      console.error('Failed to initialize voice session:', error);
    }
  };

  const startConversation = async () => {
    console.log('🚀 Starting continuous conversation mode');
    setIsConversationActive(true);
    await handleVoiceToggle();
  };

  const stopConversation = () => {
    console.log('🛑 Stopping conversation mode');
    setIsConversationActive(false);
    setUiState('idle');
    setWaitingCountdown(0);
    
    if (waitingTimeoutRef.current) {
      clearTimeout(waitingTimeoutRef.current);
    }
    
    if (isListening) {
      stopListening();
    }
    
    if (isSpeaking) {
      stopSpeaking();
    }
  };

  const handleVoiceToggle = async () => {
    console.log('🎯 Voice toggle clicked. Current state:', { isListening, isSupported, error });
    
    if (!isSupported) {
      alert('আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না। Chrome বা Edge ব্যবহার করুন।');
      return;
    }

    if (isListening) {
      console.log('🛑 Stopping listening...');
      stopListening();
      if (transcript.trim()) {
        console.log('📝 Processing transcript:', transcript);
        processVoiceInput(transcript);
      }
    } else {
      console.log('🎤 Starting listening...');
      await startListening();
    }
  };

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      stopSpeaking();
    }
  };

  const getMainButtonIcon = () => {
    switch (uiState) {
      case 'listening':
        return <MicOff className="w-8 h-8" />;
      case 'processing':
        return <RotateCw className="w-8 h-8 animate-spin" />;
      case 'speaking':
        return isPaused ? <Play className="w-8 h-8" /> : <Pause className="w-8 h-8" />;
      case 'waiting':
        return <Timer className="w-8 h-8" />;
      default:
        return <Mic className="w-8 h-8" />;
    }
  };

  const getMainButtonColor = () => {
    switch (uiState) {
      case 'listening':
        return 'from-red-500 to-pink-600';
      case 'processing':
        return 'from-blue-500 to-indigo-600';
      case 'speaking':
        return 'from-purple-500 to-violet-600';
      case 'waiting':
        return 'from-orange-500 to-yellow-600';
      default:
        return 'from-green-500 to-emerald-600';
    }
  };

  const getStatusText = () => {
    switch (uiState) {
      case 'listening':
        return 'শুনছি...';
      case 'processing':
        return 'চিন্তা করছি...';
      case 'speaking':
        return isPaused ? 'থামানো হয়েছে' : 'বলছি...';
      case 'waiting':
        return `পরবর্তী প্রশ্নের জন্য অপেক্ষা করছি (${waitingCountdown}s)`;
      default:
        return isConversationActive ? 'কথোপকথন শুরু করুন' : 'কথা বলুন';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">অনুগ্রহ করে লগইন করুন</h1>
          <p className="text-gray-600">ভয়েস চ্যাট ব্যবহার করতে আপনাকে লগইন করতে হবে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden flex flex-col">
      {/* 3D Rice Field Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene3DCanvas enableControls={false}>
          <RiceFieldScene isListening={isListening} isSpeaking={isSpeaking} />
        </Scene3DCanvas>
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />
      </div>

      {/* Subtle particle overlay */}
      <div className="absolute inset-0 overflow-hidden z-[1] pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 flex-shrink-0 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm border-b border-green-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(34, 197, 94, 0.3)',
                    '0 0 50px rgba(34, 197, 94, 0.6)',
                    '0 0 30px rgba(34, 197, 94, 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  AI এর সাথে কথা বলুন
                </h1>
                <p className="text-gray-400 text-sm font-medium">
                  <span className="mr-1">🌾</span>
                  কৃষি বিষয়ে ভয়েস কথোপকথন
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Debug Info */}
              <div className="text-xs text-gray-400 bg-black/20 rounded px-2 py-1">
                {!isSupported && <span className="text-red-400">❌ Voice not supported</span>}
                {error && <span className="text-red-400">❌ {error}</span>}
                {isSupported && !error && <span className="text-green-400">✅ Voice ready</span>}
              </div>
              
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  variant="outline"
                  size="sm"
                  className="border-red-400 text-red-400 hover:bg-red-50"
                >
                  <VolumeX className="w-4 h-4 mr-2" />
                  থামান
                </Button>
              )}
              
              <motion.div 
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-md border border-green-400/30"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(34, 197, 94, 0.2)',
                    '0 0 20px rgba(34, 197, 94, 0.4)',
                    '0 0 10px rgba(34, 197, 94, 0.2)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <motion.div 
                  className={`w-2.5 h-2.5 rounded-full ${uiState === 'idle' ? 'bg-green-400' : 'bg-yellow-400'}`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                />
                <span className="text-white text-sm font-bold">
                  {uiState === 'idle' ? 'প্রস্তুত' : 'সক্রিয়'}
                </span>
              </motion.div>
            </div>
          </div>
          
          {/* Debug Panel */}
          {(transcript || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-black/20 rounded-lg backdrop-blur-md"
            >
              {transcript && (
                <div className="text-white">
                  <span className="text-gray-400">শুনছি: </span>
                  <span className="text-green-400">{transcript}</span>
                  <span className="text-gray-500 text-xs ml-2">({Math.round(confidence * 100)}%)</span>
                </div>
              )}
              {error && (
                <div className="text-red-400 mt-2">
                  <span className="text-gray-400">ত্রুটি: </span>
                  {error}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Main Voice Interface - Integrated with 3D Scene */}
        <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0">
          <div className="text-center w-full max-w-4xl">
            {/* 3D Scene Info Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-green-500/30">
                <Maximize2 className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">🌾 3D ধান ক্ষেত দৃশ্য</span>
                <Radio className="w-4 h-4 text-green-400 animate-pulse" />
              </div>
            </motion.div>

            {/* Main Control Panel */}
            <motion.div
              className="relative"
              animate={{
                scale: uiState === 'listening' ? 1.05 : uiState === 'speaking' ? 1.03 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Glass panel */}
              <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Status indicator with better visibility */}
                <motion.div
                  className="mb-6"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl ${
                    uiState === 'listening' ? 'bg-red-500/20 border-2 border-red-400' :
                    uiState === 'speaking' ? 'bg-purple-500/20 border-2 border-purple-400' :
                    uiState === 'processing' ? 'bg-blue-500/20 border-2 border-blue-400' :
                    'bg-green-500/20 border-2 border-green-400'
                  }`}>
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        uiState === 'listening' ? 'bg-red-400' :
                        uiState === 'speaking' ? 'bg-purple-400' :
                        uiState === 'processing' ? 'bg-blue-400' :
                        'bg-green-400'
                      }`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                    <span className="text-white font-bold text-lg">{getStatusText()}</span>
                  </div>
                </motion.div>

                {/* Enhanced Main Button */}
                <motion.button
                  onClick={uiState === 'speaking' ? handleSpeechToggle : handleVoiceToggle}
                  disabled={uiState === 'processing'}
                  className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br ${getMainButtonColor()} text-white flex items-center justify-center transition-all duration-300 disabled:opacity-70 overflow-hidden shadow-2xl mb-6 mx-auto`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  animate={{
                    boxShadow: [
                      '0 0 40px rgba(34, 197, 94, 0.5)',
                      '0 0 80px rgba(34, 197, 94, 0.8)',
                      '0 0 40px rgba(34, 197, 94, 0.5)',
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  {/* Multiple animated rings */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{
                        scale: uiState !== 'idle' ? [1, 1.5 + i * 0.2, 1] : 1,
                        opacity: uiState !== 'idle' ? [0.5, 0, 0.5] : 0,
                      }}
                      transition={{
                        duration: 2,
                        repeat: uiState !== 'idle' ? Infinity : 0,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                  
                  {/* Inner glow */}
                  <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm" />
                  
                  {/* Icon */}
                  <motion.div
                    className="relative z-10"
                    animate={{
                      rotate: uiState === 'processing' ? 360 : 0,
                      scale: uiState !== 'idle' ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      rotate: {
                        duration: 2,
                        repeat: uiState === 'processing' ? Infinity : 0,
                        ease: "linear"
                      },
                      scale: {
                        duration: 1,
                        repeat: Infinity,
                      }
                    }}
                  >
                    {getMainButtonIcon()}
                  </motion.div>
                </motion.button>

                {/* Instructions */}
                <p className="text-gray-300 text-sm">
                  {uiState === 'idle' && '🎤 বোতামে ক্লিক করে কথা বলা শুরু করুন'}
                  {uiState === 'listening' && '🎙️ শুনছি... আপনার প্রশ্ন বলুন'}
                  {uiState === 'processing' && '🤖 AI চিন্তা করছে...'}
                  {uiState === 'speaking' && '🔊 AI উত্তর দিচ্ছে...'}
                  {uiState === 'waiting' && `⏳ ${waitingCountdown} সেকেন্ড...`}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Instructions - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 flex-shrink-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm"
        >
          <div className="max-w-5xl mx-auto">
            {/* Feature badges */}
            <div className="flex justify-center gap-3 mb-4 flex-wrap">
              <div className="inline-flex items-center space-x-2 bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-green-400/30">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-xs font-semibold">3D Rice Field</span>
              </div>
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-blue-400/30">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-xs font-semibold">AI Powered</span>
              </div>
              <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-purple-400/30">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 text-xs font-semibold">Real-time Voice</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
              <motion.div 
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-green-400/50 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2 text-base">কথা বলুন</h3>
                <p className="text-gray-300 text-xs leading-relaxed">বোতামে ক্লিক করে আপনার কৃষি সম্পর্কিত প্রশ্ন বলুন</p>
              </motion.div>
              
              <motion.div 
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-blue-400/50 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2 text-base">AI চিন্তা করে</h3>
                <p className="text-gray-300 text-xs leading-relaxed">কৃষি বিশেষজ্ঞের মতো উত্তর প্রস্তুত করে</p>
              </motion.div>
              
              <motion.div 
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-purple-400/50 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2 text-base">উত্তর শুনুন</h3>
                <p className="text-gray-300 text-xs leading-relaxed">স্বয়ংক্রিয়ভাবে বাংলায় উত্তর বলা হবে</p>
              </motion.div>
            </div>
            
            {/* Manual Test Buttons */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={() => processVoiceInput('আমার ধানের পাতা হলুদ হয়ে যাচ্ছে। কী করব?')}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                  disabled={isProcessing}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  নমুনা প্রশ্ন পাঠান
                </Button>
                
                <Button
                  onClick={startConversation}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
                  disabled={uiState === 'processing' || isConversationActive}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  কথোপকথন শুরু করুন
                </Button>
              </div>
              
              {isConversationActive && (
                <Button
                  onClick={stopConversation}
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-50 text-sm px-4 py-2"
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  কথোপকথন বন্ধ করুন
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Conversation History Sidebar */}
        <AnimatePresence>
          {conversationHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-2 top-2 bottom-2 w-72 sm:w-80 bg-black/40 backdrop-blur-md rounded-xl border border-gray-600 overflow-hidden flex flex-col"
            >
              <div className="p-3 border-b border-gray-600 flex-shrink-0">
                <h3 className="text-white font-semibold flex items-center text-sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  কথোপকথনের ইতিহাস
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {conversationHistory.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-2 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-green-900/30 border-l-4 border-green-500' 
                        : 'bg-blue-900/30 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                        message.role === 'user' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {message.role === 'user' ? <Mic className="w-2.5 h-2.5 text-white" /> : <Brain className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString('bn-BD')}
                      </span>
                    </div>
                    
                    <div className="text-xs text-white leading-relaxed overflow-hidden">
                      {isTyping && index === conversationHistory.length - 1 && message.role === 'assistant' ? (
                        <ReactMarkdown 
                          components={MarkdownComponents} 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {typingMessage}
                        </ReactMarkdown>
                      ) : (
                        <ReactMarkdown 
                          components={MarkdownComponents} 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    
                    {message.role === 'assistant' && (message.tool_outputs || message.tool_calls) && (
                      <div className="mt-2">
                        <ToolOutputDisplay 
                          toolOutputs={message.tool_outputs} 
                          toolCalls={message.tool_calls} 
                          language="bn" 
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceChatInterface;
