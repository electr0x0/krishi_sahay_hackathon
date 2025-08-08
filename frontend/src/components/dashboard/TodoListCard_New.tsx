'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useTheme } from "next-themes";
import { CheckCircle, Clock, AlertTriangle, ListTodo, Bot, Plus, RefreshCw } from "lucide-react";

interface Agenda {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  agenda_type: string;
  scheduled_date?: string;
  due_date?: string;
  estimated_duration?: number;
  created_by_ai: boolean;
  ai_reasoning?: string;
  created_at: string;
  completed_at?: string;
}

export default function TodoListCard() {
  const { theme } = useTheme();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchTodayAgendas();
  }, []);

  const fetchTodayAgendas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/agendas/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgendas(data || []);
      }
    } catch (error) {
      console.error('Error fetching today agendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = async () => {
    setGeneratingAI(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/agendas/ai-suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force_refresh: true,
          max_suggestions: 5
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('AI suggestions generated:', data);
        // Refresh agendas to show new suggestions
        fetchTodayAgendas();
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const createAgenda = async () => {
    if (!newAgendaTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/agendas/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newAgendaTitle,
          priority: 'medium',
          agenda_type: 'user_created',
          scheduled_date: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        setNewAgendaTitle('');
        setShowAddForm(false);
        fetchTodayAgendas();
      }
    } catch (error) {
      console.error('Error creating agenda:', error);
    }
  };

  const completeAgenda = async (agendaId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/agendas/${agendaId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        fetchTodayAgendas();
      }
    } catch (error) {
      console.error('Error completing agenda:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Clock className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'জরুরি';
      case 'high': return 'উচ্চ';
      case 'medium': return 'মাঝারি';
      case 'low': return 'কম';
      default: return priority;
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ঘন্টা${mins > 0 ? ` ${mins} মিনিট` : ''}`;
    }
    return `${mins} মিনিট`;
  };

  const cardContent = (
    <div className="space-y-4">
      {/* Header with AI Suggestion Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-gray-800">আজকের কাজের তালিকা</h3>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            {agendas.filter(a => a.status === 'pending').length} বাকি
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={generateAISuggestions}
            disabled={generatingAI}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
          >
            <Bot className="w-3 h-3 mr-1" />
            {generatingAI ? 'তৈরি হচ্ছে...' : 'AI পরামর্শ'}
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
          >
            <Plus className="w-3 h-3 mr-1" />
            যোগ করুন
          </Button>
          <Button
            onClick={fetchTodayAgendas}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Add New Agenda Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newAgendaTitle}
              onChange={(e) => setNewAgendaTitle(e.target.value)}
              placeholder="নতুন কাজের নাম লিখুন..."
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createAgenda()}
            />
            <Button onClick={createAgenda} size="sm" className="text-xs px-2 py-1 h-7">
              যোগ করুন
            </Button>
            <Button 
              onClick={() => setShowAddForm(false)} 
              variant="outline" 
              size="sm"
              className="text-xs px-2 py-1 h-7"
            >
              বাতিল
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agenda List */}
      {!loading && agendas.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-2">আজকের জন্য কোন কাজ নেই</p>
          <p className="text-xs">AI পরামর্শ বাটনে ক্লিক করে নতুন কাজের তালিকা পান</p>
        </div>
      )}

      {!loading && agendas.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {agendas.map((agenda) => (
            <motion.div
              key={agenda.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                agenda.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="mt-0.5">
                {agenda.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <button
                    onClick={() => completeAgenda(agenda.id)}
                    className="w-4 h-4 border-2 border-gray-300 rounded hover:border-green-500 transition-colors"
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h4 className={`text-sm font-medium leading-tight ${
                    agenda.status === 'completed' 
                      ? 'text-green-700 line-through' 
                      : 'text-gray-800'
                  }`}>
                    {agenda.title}
                  </h4>
                  {agenda.created_by_ai && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      <Bot className="w-2 h-2 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                
                {agenda.description && (
                  <p className={`text-xs mb-2 leading-relaxed ${
                    agenda.status === 'completed' 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}>
                    {agenda.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(agenda.priority)}
                    <span className="text-gray-500">{getPriorityText(agenda.priority)}</span>
                  </div>
                  
                  {agenda.estimated_duration && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(agenda.estimated_duration)}</span>
                    </div>
                  )}
                </div>
                
                {agenda.ai_reasoning && (
                  <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                    💡 {agenda.ai_reasoning}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <ShineBorder
      className="relative overflow-hidden bg-white/95 backdrop-blur-sm"
      color={theme === 'dark' ? ["#A07CFE", "#FE8FB5", "#FFBE7B"] : ["#A07CFE", "#FE8FB5", "#FFBE7B"]}
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-4">
          {cardContent}
        </CardContent>
      </Card>
    </ShineBorder>
  );
}
