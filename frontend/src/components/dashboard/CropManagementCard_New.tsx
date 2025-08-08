'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useTheme } from "next-themes";
import Cookies from 'js-cookie';
import { 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Bot,
  RefreshCw,
  ListTodo,
  Plus,
  CheckCircle,
  Clock
} from "lucide-react";

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

export default function CropManagementCard() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { theme } = useTheme();
  
  // Agenda state
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [agendaError, setAgendaError] = useState<string | null>(null);
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaDescription, setNewAgendaDescription] = useState('');
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Helper functions
  const getAgendasForDate = (date: Date) => {
    const dateString = date.toDateString();
    return agendas.filter(agenda => {
      const agendaDate = agenda.scheduled_date 
        ? new Date(agenda.scheduled_date).toDateString()
        : new Date(agenda.created_at).toDateString();
      return agendaDate === dateString;
    });
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options);
  };

  // Agenda functions
  const fetchAgendas = async () => {
    setAgendaLoading(true);
    setAgendaError(null);
    try {
      const token = Cookies.get('auth_token') || localStorage.getItem('token');
      if (!token) {
        setAgendaLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/agendas/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgendas(data || []);
      } else {
        setAgendaError('Failed to fetch agendas');
      }
    } catch (error) {
      setAgendaError('Error fetching agendas');
    } finally {
      setAgendaLoading(false);
    }
  };

  const createAgenda = async () => {
    if (!newAgendaTitle.trim()) return;

    setAgendaError(null);
    try {
      const token = Cookies.get('auth_token') || localStorage.getItem('token');
      if (!token) {
        setAgendaError('Not logged in');
        return;
      }

      const response = await fetch('http://localhost:8000/api/agendas/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newAgendaTitle,
          description: newAgendaDescription,
          priority: 'medium',
          agenda_type: 'farming',
          scheduled_date: selectedDate.toISOString()
        }),
      });

      if (response.ok) {
        const newAgenda = await response.json();
        setAgendas(prev => [newAgenda, ...prev]);
        setNewAgendaTitle('');
        setNewAgendaDescription('');
        setShowAddAgenda(false);
      } else {
        setAgendaError('Failed to create agenda');
      }
    } catch (error) {
      setAgendaError('Error creating agenda');
    }
  };

  const generateAIAgendas = async () => {
    setGeneratingAI(true);
    setAgendaError(null);
    try {
      const token = Cookies.get('auth_token') || localStorage.getItem('token');
      if (!token) {
        setAgendaError('Not logged in');
        return;
      }

      const response = await fetch('http://localhost:8000/api/agendas/ai-suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const suggestions = await response.json();
        const suggestionArray = Array.isArray(suggestions) ? suggestions : suggestions.suggestions || [];
        setAgendas(prev => [...suggestionArray, ...prev]);
      } else {
        setAgendaError('Failed to generate AI suggestions');
      }
    } catch (error) {
      setAgendaError('Error generating AI suggestions');
    } finally {
      setGeneratingAI(false);
    }
  };

  const completeAgenda = async (agendaId: number) => {
    setAgendaError(null);
    try {
      const token = Cookies.get('auth_token') || localStorage.getItem('token');
      if (!token) {
        setAgendaError('Not logged in');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/agendas/${agendaId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAgendas(prev => prev.map(agenda => 
          agenda.id === agendaId 
            ? { ...agenda, status: 'completed' }
            : agenda
        ));
      } else {
        setAgendaError('Failed to complete agenda');
      }
    } catch (error) {
      setAgendaError('Error completing agenda');
    }
  };

  // Load agendas on component mount
  useEffect(() => {
    fetchAgendas();
  }, []);

  const calendarDays = generateCalendarDays();
  const selectedDateAgendas = getAgendasForDate(selectedDate);
  const completedAgendas = selectedDateAgendas.filter(a => a.status === 'completed');
  const pendingAgendas = selectedDateAgendas.filter(a => a.status !== 'completed');

  return (
    <Card className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-green-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {language === 'bn' ? 'ফসল ব্যবস্থাপনা ক্যালেন্ডার' : 'Crop Management Calendar'}
              </h3>
              <p className="text-xs text-gray-600">
                {language === 'bn' ? 'এজেন্ডা এবং কাজের তালিকা' : 'Agendas and Task List'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage(prev => prev === 'bn' ? 'en' : 'bn')}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-gray-800">
            {currentDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h4>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                {language === 'bn' ? 
                  ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'][['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)] : 
                  day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const dayAgendas = getAgendasForDate(date);
              const hasAgendas = dayAgendas.length > 0;

              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative p-2 text-sm rounded-lg transition-all duration-200 
                    ${isSelected ? 'bg-green-500 text-white' : 
                      isToday ? 'bg-blue-100 text-blue-800' :
                      hasAgendas ? 'bg-yellow-50 text-yellow-800' :
                      isCurrentMonth ? 'hover:bg-gray-100 text-gray-800' : 
                      'text-gray-400 hover:bg-gray-50'}
                  `}
                >
                  <div>{date.getDate()}</div>
                  {hasAgendas && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Info */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {formatDate(selectedDate)}
            </h4>
            <div className="flex space-x-2">
              <Button
                onClick={generateAIAgendas}
                disabled={generatingAI}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {generatingAI ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                <span className="ml-1">
                  {language === 'bn' ? 'AI পরামর্শ' : 'AI Suggestions'}
                </span>
              </Button>
              <Button
                onClick={() => setShowAddAgenda(!showAddAgenda)}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4" />
                <span className="ml-1">
                  {language === 'bn' ? 'যোগ করুন' : 'Add'}
                </span>
              </Button>
            </div>
          </div>

          {/* Add Agenda Form */}
          {showAddAgenda && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 p-4 rounded-lg space-y-3 mb-4"
            >
              <input
                type="text"
                value={newAgendaTitle}
                onChange={(e) => setNewAgendaTitle(e.target.value)}
                placeholder={language === 'bn' ? 'এজেন্ডার শিরোনাম...' : 'Agenda title...'}
                className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <textarea
                value={newAgendaDescription}
                onChange={(e) => setNewAgendaDescription(e.target.value)}
                placeholder={language === 'bn' ? 'বিবরণ (ঐচ্ছিক)...' : 'Description (optional)...'}
                className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-20 resize-none"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={createAgenda}
                  disabled={!newAgendaTitle.trim()}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {language === 'bn' ? 'তৈরি করুন' : 'Create'}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddAgenda(false);
                    setNewAgendaTitle('');
                    setNewAgendaDescription('');
                  }}
                  size="sm"
                  variant="outline"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {agendaError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4">
              {agendaError}
            </div>
          )}

          {/* Loading State */}
          {agendaLoading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-gray-600">
                {language === 'bn' ? 'এজেন্ডা লোড হচ্ছে...' : 'Loading agendas...'}
              </p>
            </div>
          )}

          {/* Agendas for Selected Date */}
          {!agendaLoading && (
            <div className="space-y-4">
              {/* Pending Agendas */}
              {pendingAgendas.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {language === 'bn' ? 'অপেক্ষমাণ কাজ' : 'Pending Tasks'} ({pendingAgendas.length})
                  </h5>
                  <div className="space-y-2">
                    {pendingAgendas.map((agenda) => (
                      <motion.div
                        key={agenda.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-white border rounded-lg hover:border-green-300 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h6 className="font-medium text-gray-800">{agenda.title}</h6>
                              {agenda.created_by_ai && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  <Bot className="w-3 h-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={`${
                                  agenda.priority === 'high' ? 'border-red-400 text-red-700' :
                                  agenda.priority === 'medium' ? 'border-yellow-400 text-yellow-700' :
                                  'border-green-400 text-green-700'
                                }`}
                              >
                                {agenda.priority}
                              </Badge>
                            </div>
                            
                            {agenda.description && (
                              <p className="text-sm text-gray-600 mb-2">{agenda.description}</p>
                            )}
                            
                            {agenda.ai_reasoning && (
                              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded italic">
                                {language === 'bn' ? 'AI যুক্তি: ' : 'AI Reasoning: '}{agenda.ai_reasoning}
                              </p>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => completeAgenda(agenda.id)}
                            size="sm"
                            variant="outline"
                            className="ml-3 text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Agendas */}
              {completedAgendas.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                    {language === 'bn' ? 'সম্পন্ন কাজ' : 'Completed Tasks'} ({completedAgendas.length})
                  </h5>
                  <div className="space-y-2">
                    {completedAgendas.map((agenda) => (
                      <motion.div
                        key={agenda.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <h6 className="font-medium text-green-800 line-through">{agenda.title}</h6>
                          {agenda.created_by_ai && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              <Bot className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        {agenda.description && (
                          <p className="text-sm text-green-700 line-through">{agenda.description}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Agendas */}
              {selectedDateAgendas.length === 0 && !agendaLoading && (
                <div className="text-center py-8">
                  <ListTodo className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {language === 'bn' 
                      ? 'এই দিনের জন্য কোন এজেন্ডা নেই। নতুন এজেন্ডা যোগ করুন।' 
                      : 'No agendas for this day. Add a new agenda.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
