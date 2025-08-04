"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Shadcn UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Aceternity UI Components
import { BackgroundGradient } from "@/components/ui/background-gradient"

// Icons
import { Bot, Loader2, Plus, User, Grid, Paperclip, Globe, MapPin, ArrowUp, Moon, Sun } from "lucide-react"

// Other Libraries
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import TextareaAutosize from 'react-textarea-autosize'

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Card component for a single price item
const PriceCard = ({ item }: { item: string }) => {
  // Use regex to capture the name and the final number (price)
  const match = item.match(/(.*)[\s:](\d+\.?\d*)$/);

  if (!match) {
    // Fallback for items that don't match, e.g., just display them
    return (
      <div className="p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{item}</p>
      </div>
    );
  }

  const name = match[1].trim().replace(/:$/, '').trim(); // Get name, remove trailing colon
  const price = match[2];

  return (
    <div className="p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-800/50 transition-colors duration-200 text-left">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{name}</p>
      {/* FIX: Price text is now green */}
      <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{price} BDT</p>
    </div>
  );
};

// Component to render a list of prices in a grid
const PriceList = ({ text }: { text: string }) => {
  const colonIndex = text.indexOf(':');
  // If no colon, it's not a list we can parse, so render as plain text.
  if (colonIndex === -1) {
    return <p>{text}</p>;
  }

  const intro = text.substring(0, colonIndex + 1);
  const itemsText = text.substring(colonIndex + 1).trim();

  // A more robust and defensive splitting logic
  let items = [];
  // Prioritize newline splitting for lists like the mineral water example
  if (itemsText.includes('\n*')) {
      items = itemsText.split('\n');
  } else {
      // Fallback for comma-separated or other formats
      // This handles cases like "item one, item two. item three"
      const normalizedText = itemsText.replace(/ Taka \*/g, ',').replace(/\.\s*(?=[A-Z])/g, ',');
      items = normalizedText.split(',');
  }

  const cleanedItems = items
    .map(item => item.replace(/^[\*\s]+/, '').replace(/\.$/, '').trim())
    .filter(Boolean);

  // Safeguard against non-list content. If we only have one item,
  // it's likely not a list, so we render the original text as a paragraph.
  if (cleanedItems.length <= 1) {
      return <p>{text}</p>;
  }

  return (
    <div className="text-left">
      <p className="mb-4">{intro}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {cleanedItems.map((item, index) => (
          <PriceCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};


// Component for the AI's message with typing effect
const AssistantMessage = ({ content }: { content: string }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  
  // Check if the content is a price list to render it differently
  const isPriceList = typeof content === 'string' && (content.includes("prices for") || content.includes("price of"));

  useEffect(() => {
    // If it's a price list, display it immediately without animation
    if (isPriceList) {
      setDisplayedContent(content);
      return;
    }
    if (typeof content !== 'string') return;

    // Adjust typing speed based on content length
    let delay = 30;
    const len = content.length;
    if (len > 1500) {
        delay = 1;
    } else if (len > 500) {
        delay = 5;
    } else if (len > 100) {
        delay = 15;
    }

    let charIndex = 0
    setDisplayedContent("")
    
    const interval = setInterval(() => {
      if(charIndex < content.length) {
        setDisplayedContent(prev => prev + content[charIndex])
        charIndex++
      } else {
        clearInterval(interval)
      }
    }, delay) // Use dynamic delay

    return () => clearInterval(interval)
  }, [content, isPriceList])

  // If it's a price list, render the structured PriceList component
  if (isPriceList) {
    return <PriceList text={content} />;
  }

  // Otherwise, render the standard markdown with typing effect
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedContent || ""}
      </ReactMarkdown>
    </div>
  )
}

export default function ChatPage() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: query,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setQuery("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/agent/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from agent");
      }

      const data = await response.json();
      
      let assistantContent = "Sorry, I couldn't process that. Please try again.";
      
      if (data?.result?.messages && Array.isArray(data.result.messages)) {
        const aiMessage = [...data.result.messages]
          .reverse()
          .find(m => m.type === 'ai' && m.content);
        
        // Simplified content handling, parsing is now done in the display component
        if (aiMessage && typeof aiMessage.content === 'string') {
            assistantContent = aiMessage.content;
        }
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, an error occurred. Please check the console and try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  const renderWelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-zinc-800 dark:text-zinc-200">
          How can I help you today?
        </h1>
        
        <BackgroundGradient
            className="rounded-[22px] w-full max-w-3xl p-4 sm:p-10 bg-white dark:bg-zinc-900"
            containerClassName="w-full max-w-3xl"
        >
            <div className="relative">
                <TextareaAutosize
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your data, documents, or the web..."
                    className="w-full min-h-[100px] resize-none border-0 focus:ring-0 focus:outline-none bg-transparent p-2 text-base text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit(e)
                        }
                    }}
                    maxRows={8}
                />
                <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2 text-neutral-600 dark:text-neutral-300">
                        <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Globe className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><MapPin className="h-4 w-4" /></Button>
                    </div>
                    {/* FIX: Welcome screen button is now green */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !query.trim()}
                        size="icon"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </BackgroundGradient>
    </div>
  )

  const renderChat = () => (
    <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex items-end gap-2", message.role === "user" ? "justify-end" : "justify-start")}
                >
                    {message.role === "assistant" && <Bot className="h-6 w-6 text-zinc-500 self-start" />}
                    <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3",
                        message.role === "user" 
                            // FIX: User message bubble is now green
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-bl-none"
                    )}>
                        {/* The AssistantMessage component now handles all display logic */}
                        {message.role === 'assistant' ? (
                            <AssistantMessage content={message.content} />
                        ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                              </ReactMarkdown>
                            </div>
                        )}
                        <p className="text-xs opacity-60 mt-2 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {message.role === "user" && <User className="h-6 w-6 text-zinc-500 self-start" />}
                </motion.div>
            ))}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-end gap-2 justify-start"
                >
                    <Bot className="h-6 w-6 text-zinc-500 self-start" />
                    <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-zinc-100 dark:bg-zinc-800">
                        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                    </div>
                </motion.div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 pb-6">
            <BackgroundGradient
                className="rounded-[22px] bg-white dark:bg-zinc-900"
                containerClassName="w-full"
            >
                <form onSubmit={handleSubmit} className="relative flex items-end p-2">
                    <TextareaAutosize
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a follow-up..."
                        className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none bg-transparent p-2 text-base text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        maxRows={5}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        size="icon"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full ml-2"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
                    </Button>
                </form>
            </BackgroundGradient>
        </div>
    </div>
  )

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="flex h-full w-full bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-black/[0.1] dark:border-white/[0.1]">
            {/* Sidebar */}
            <aside className="w-16 flex-shrink-0 flex flex-col items-center py-6 space-y-4 border-r border-black/[0.1] dark:border-white/[0.1]">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><Plus className="h-5 w-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>New Chat</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>Profile</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"><Grid className="h-5 w-5" /></Button>
                        </TooltipTrigger>
                        <TooltipContent side="right"><p>Explore</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Controls */}
                <header className="flex-shrink-0 flex justify-end items-center p-4 space-x-2 border-b border-black/[0.1] dark:border-white/[0.1]">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </header>

                {messages.length === 0 ? renderWelcomeScreen() : renderChat()}
            </main>
        </div>
    </div>
  )
}
