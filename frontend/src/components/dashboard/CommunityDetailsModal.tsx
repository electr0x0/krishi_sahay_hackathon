'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { 
  X, 
  MapPin, 
  Users, 
  Crown, 
  Shield, 
  Star, 
  Calendar, 
  Clock,
  MessageCircle,
  Handshake,
  BookOpen,
  Gift,
  Music,
  Camera,
  CheckCircle,
  UserPlus,
  UserMinus,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CommunityDetailsModalProps {
  community: any;
  onClose: () => void;
  onJoin: () => void;
  onLeave?: () => void;
  canJoin: boolean;
  isUserMember?: boolean;
}

const CommunityDetailsModal = ({ community, onClose, onJoin, onLeave, canJoin, isUserMember }: CommunityDetailsModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showHelpRequestForm, setShowHelpRequestForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'warning'; message: string} | null>(null);

  // Load chat messages
  const loadChatMessages = async () => {
    if (!community?.id) return;
    
    setChatLoading(true);
    try {
      const response = await api.getCommunityChat(community.id);
      setChatMessages(response.messages || []);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

    // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage || !community?.id) return;

    setSendingMessage(true);
    try {
      const messageData = {
        content: newMessage.trim(),
        message_type: 'text',
        metadata: null
      };

      const response = await api.sendCommunityMessage(community.id, messageData);
      setChatMessages(prev => [...prev, response]);
      setNewMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setAlert({type: 'error', message: 'মেসেজ পাঠাতে সমস্যা হয়েছে'});
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setSendingMessage(false);
    }
  };

  // Send help request as chat message
  const sendHelpRequest = async (helpData: any) => {
    if (!community?.id) return;

    try {
      const messageData = {
        content: `সাহায্য প্রয়োজন: ${helpData.title}\n\n${helpData.description}`,
        message_type: 'help_request',
        metadata: {
          title: helpData.title,
          description: helpData.description,
          category: helpData.category,
          urgency: helpData.urgency,
          location: helpData.location,
          is_paid: helpData.is_paid,
          amount: helpData.amount
        }
      };

      const response = await api.sendCommunityMessage(community.id, messageData);
      setChatMessages(prev => [...prev, response]);
      setShowHelpRequestForm(false);
      setAlert({type: 'success', message: 'সাহায্যের অনুরোধ সফলভাবে পাঠানো হয়েছে!'});
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      console.error('Failed to send help request:', error);
      setAlert({type: 'error', message: 'সাহায্যের অনুরোধ পাঠাতে সমস্যা হয়েছে'});
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Send event as chat message
  const sendEvent = async (eventData: any) => {
    if (!community?.id) return;

    try {
      const messageData = {
        content: `নতুন ইভেন্ট: ${eventData.title}\n\n${eventData.description}\n\nতারিখ: ${eventData.date}\nসময়: ${eventData.time}\nস্থান: ${eventData.location}`,
        message_type: 'event',
        metadata: {
          title: eventData.title,
          description: eventData.description,
          type: eventData.type,
          location: eventData.location,
          date: eventData.date,
          time: eventData.time,
          is_free: eventData.is_free,
          fee: eventData.fee,
          attendees: [{
            user_id: user?.id,
            user_name: user?.full_name,
            joined_at: new Date().toISOString(),
            is_creator: true
          }]
        }
      };

      const response = await api.sendCommunityMessage(community.id, messageData);
      setChatMessages(prev => [...prev, response]);
      setShowEventForm(false);
      setAlert({type: 'success', message: 'ইভেন্ট সফলভাবে তৈরি করা হয়েছে!'});
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      console.error('Failed to send event:', error);
      setAlert({type: 'error', message: 'ইভেন্ট তৈরি করতে সমস্যা হয়েছে'});
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Load chat when tab changes to chat
  useEffect(() => {
    if (activeTab === 'chat') {
      loadChatMessages();
    }
  }, [activeTab, community?.id]);

  // Handle help request actions
  const handleAcceptHelp = async (messageId: any) => {
    try {
      await api.acceptHelpRequest(community.id, messageId);
      setAlert({type: 'success', message: 'সাহায্য অনুরোধ সফলভাবে গ্রহণ করেছেন!'});
      loadChatMessages(); // Refresh to show updated status
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      setAlert({type: 'error', message: error.message || 'সাহায্য গ্রহণে সমস্যা হয়েছে'});
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleCompleteHelp = async (messageId: any) => {
    try {
      await api.completeHelpRequest(community.id, messageId);
      setAlert({type: 'success', message: 'সাহায্য সফলভাবে সম্পন্ন হয়েছে!'});
      loadChatMessages(); // Refresh to show updated status
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      setAlert({type: 'error', message: error.message || 'সাহায্য সম্পন্নে সমস্যা হয়েছে'});
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Handle event payment  
  const handlePayForEvent = async (messageId: any) => {
    try {
      await api.payForEvent(community.id, messageId);
      setAlert({type: 'success', message: 'ইভেন্টের জন্য পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!'});
      loadChatMessages(); // Refresh to show updated status
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      setAlert({type: 'error', message: error.message || 'পেমেন্টে সমস্যা হয়েছে'});
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Handle joining event
  const handleJoinEvent = async (messageId: any) => {
    try {
      // Update the event metadata to add current user as attendee
      const response = await api.sendCommunityMessage(community.id, {
        content: `${user?.full_name} ইভেন্টে যোগ দিয়েছেন`,
        message_type: 'system',
        metadata: {
          action: 'join_event',
          event_message_id: messageId,
          user_id: user?.id,
          user_name: user?.full_name
        }
      });
      
      setAlert({type: 'success', message: 'ইভেন্টে সফলভাবে যোগ দিয়েছেন!'});
      loadChatMessages(); // Refresh to show updated status
      setTimeout(() => setAlert(null), 3000);
    } catch (error: any) {
      setAlert({type: 'error', message: 'ইভেন্টে যোগ দিতে সমস্যা হয়েছে'});
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'co-leader': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'elder': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'training': return <BookOpen className="w-4 h-4" />;
      case 'charity': return <Gift className="w-4 h-4" />;
      case 'cultural': return <Music className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'celebration': return <Camera className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getAgeLabel = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} বছর`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} মাস`;
    } else {
      return `${days} দিন`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="community-details-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Alert */}
            {alert && (
              <div className="mb-4">
                <Alert variant={alert.type === 'error' ? 'destructive' : alert.type === 'success' ? 'success' : 'warning'}>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{community.name}</h2>
                  <p className="text-gray-600">{community.location}, {community.area}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">সংক্ষিপ্ত</TabsTrigger>
                    <TabsTrigger value="members">সদস্য</TabsTrigger>
                    <TabsTrigger value="chat">আলোচনা</TabsTrigger>
                    <TabsTrigger value="tracker">ট্র্যাকার</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>সম্প্রদায় সম্পর্কে</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700">{community.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">{getAgeLabel(community.ageInDays)} পুরানো</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">{community.totalMembers} সদস্য</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">নিয়মাবলী</h4>
                          <ul className="space-y-1">
                            {community.rules?.map((rule: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                {rule}
                              </li>
                            )) || <li className="text-sm text-gray-500">কোন নিয়ম নির্ধারিত হয়নি</li>}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">যোগদানের শর্তাবলী</h4>
                          <ul className="space-y-1">
                            {community.joinRequirements?.map((req: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                {req}
                              </li>
                            )) || <li className="text-sm text-gray-500">কোন শর্ত নির্ধারিত হয়নি</li>}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">সাফল্য</h4>
                          <div className="flex flex-wrap gap-2">
                            {community.achievements?.length > 0 ? (
                              community.achievements.map((achievement: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {achievement}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">এখনো কোন অর্জন নেই</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Members Tab */}
                  <TabsContent value="members" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>নেতৃত্ব</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                            <img
                              src={community.leader.avatar}
                              alt={community.leader.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{community.leader.name}</h4>
                                {getRoleIcon('leader')}
                              </div>
                              <p className="text-sm text-gray-600">{community.leader.location}</p>
                              {community.leader.email && (
                                <p className="text-xs text-gray-500">{community.leader.email}</p>
                              )}
                              {community.leader.phone && (
                                <p className="text-xs text-gray-500">{community.leader.phone}</p>
                              )}
                            </div>
                          </div>

                          {community.coLeaders?.map((coLeader: any) => (
                            <div key={coLeader.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <img
                                src={coLeader.avatar}
                                alt={coLeader.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{coLeader.name}</h4>
                                  {getRoleIcon('co-leader')}
                                </div>
                                <p className="text-sm text-gray-600">{coLeader.location}</p>
                                {coLeader.email && (
                                  <p className="text-xs text-gray-500">{coLeader.email}</p>
                                )}
                                {coLeader.phone && (
                                  <p className="text-xs text-gray-500">{coLeader.phone}</p>
                                )}
                              </div>
                            </div>
                          ))}

                          {community.elders?.map((elder: any) => (
                            <div key={elder.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <img
                                src={elder.avatar}
                                alt={elder.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{elder.name}</h4>
                                  {getRoleIcon('elder')}
                                </div>
                                <p className="text-sm text-gray-600">{elder.location}</p>
                                {elder.email && (
                                  <p className="text-xs text-gray-500">{elder.email}</p>
                                )}
                                {elder.phone && (
                                  <p className="text-xs text-gray-500">{elder.phone}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Chat Tab */}
                  <TabsContent value="chat" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          সম্প্রদায় আলোচনা
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Chat Messages Area */}
                        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                          {chatLoading ? (
                            <div className="text-center text-gray-500 py-8">
                              Loading messages...
                            </div>
                          ) : chatMessages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                              No messages yet. Start the conversation!
                            </div>
                          ) : (
                            chatMessages.map((message) => (
                              <div key={message.id} className={`flex gap-3 p-3 rounded-lg ${
                                message.message_type === 'help_request' ? 'bg-red-50' :
                                message.message_type === 'event' ? 'bg-blue-50' :
                                message.message_type === 'system' ? 'bg-yellow-50' :
                                'bg-gray-50'
                              }`}>
                                <img 
                                  src={message.user?.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'}
                                  alt={message.user?.full_name || 'User'}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{message.user?.full_name || 'Unknown User'}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.created_at).toLocaleString('bn-BD')}
                                    </span>
                                  </div>
                                  <p className="text-sm">{message.content}</p>
                                  {message.message_type !== 'text' && (
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {message.message_type === 'help_request' ? 'সাহায্য অনুরোধ' :
                                         message.message_type === 'event' ? 'ইভেন্ট' : 
                                         message.message_type === 'system' ? 'সিস্টেম' : message.message_type}
                                      </Badge>
                                      {message.metadata?.urgency && (
                                        <Badge variant="outline" className="text-xs">
                                          {message.metadata.urgency === 'high' ? 'জরুরি' :
                                           message.metadata.urgency === 'medium' ? 'মাধ্যম' : 'কম'}
                                        </Badge>
                                      )}
                                      {/* Status badges */}
                                      {message.metadata?.status && (
                                        <Badge variant="outline" className={`text-xs ${
                                          message.metadata.status === 'completed' ? 'bg-green-100 text-green-800' :
                                          message.metadata.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {message.metadata.status === 'completed' ? 'সম্পন্ন' :
                                           message.metadata.status === 'accepted' ? 'গৃহীত' : message.metadata.status}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Action Buttons */}
                                  {message.message_type === 'help_request' && (
                                    <div className="flex gap-2 mt-2">
                                      {!message.metadata?.status && message.user.id !== user?.id ? (
                                        // Not yet accepted and not self - show accept button
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-green-600 border-green-300 hover:bg-green-50"
                                          onClick={() => handleAcceptHelp(message.id)}
                                        >
                                          <Handshake className="w-3 h-3 mr-1" />
                                          সাহায্য করি
                                        </Button>
                                      ) : message.metadata?.status === 'accepted' ? (
                                        // Accepted but not completed - show complete/pay button
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                          onClick={() => handleCompleteHelp(message.id)}
                                        >
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          {message.metadata?.is_paid ? 'পেমেন্ট করুন' : 'সম্পন্ন করুন'}
                                        </Button>
                                      ) : null}
                                      
                                      {message.metadata?.accepted_by_name && (
                                        <span className="text-xs text-gray-500 flex items-center">
                                          <Users className="w-3 h-3 mr-1" />
                                          {message.metadata.accepted_by_name} গ্রহণ করেছেন
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {message.message_type === 'event' && (
                                    <div className="flex gap-2 mt-2">
                                      {!message.metadata?.attendees?.some(a => a.user_id === user?.id) ? (
                                        <div className="flex gap-2">
                                          {message.metadata?.is_free ? (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                              onClick={() => handleJoinEvent(message.id)}
                                            >
                                              <UserPlus className="w-3 h-3 mr-1" />
                                              যোগ দিন
                                            </Button>
                                          ) : (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                              onClick={() => handlePayForEvent(message.id)}
                                            >
                                              <CreditCard className="w-3 h-3 mr-1" />
                                              পেমেন্ট করুন (৳{message.metadata?.fee || 0})
                                            </Button>
                                          )}
                                        </div>
                                      ) : (
                                        <Badge variant="outline" className="text-green-600 border-green-300">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          যোগ দিয়েছেন
                                        </Badge>
                                      )}
                                      
                                      {message.metadata?.attendees?.length > 0 && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-gray-600 hover:text-gray-800"
                                          onClick={() => {
                                            setSelectedEvent(message);
                                            setShowEventDetails(true);
                                          }}
                                        >
                                          <Users className="w-3 h-3 mr-1" />
                                          {message.metadata.attendees.length} জন অংশগ্রহণকারী
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {/* Chat Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="আপনার বার্তা লিখুন..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={sendingMessage}
                          />
                          <Button 
                            size="sm" 
                            onClick={sendMessage}
                            disabled={sendingMessage || !newMessage.trim()}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {sendingMessage ? 'পাঠাচ্ছে...' : 'পাঠান'}
                          </Button>
                        </div>
                        
                        {/* Quick Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-600"
                            onClick={() => setShowHelpRequestForm(true)}
                          >
                            <Handshake className="w-4 h-4 mr-1" />
                            সাহায্য চান
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-purple-600"
                            onClick={() => setShowEventForm(true)}
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            ইভেন্ট তৈরি
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tracker Tab - Clash of Clans Style */}
                  <TabsContent value="tracker" className="space-y-4">
                    <div className="grid gap-4">
                      {/* Active Help Requests */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Handshake className="w-5 h-5 mr-2 text-blue-600" />
                            সক্রিয় সাহায্য অনুরোধ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {chatMessages.filter(msg => msg.message_type === 'help_request').length > 0 ? (
                            chatMessages
                              .filter(msg => msg.message_type === 'help_request')
                              .slice(0, 3)
                              .map((help: any, index: number) => (
                                <div key={index} className="p-3 border rounded-lg bg-blue-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm">{help.metadata?.title || help.content.split('\n')[0]}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-600">অনুরোধকারী: {help.user?.full_name}</span>
                                        <Badge variant="outline" size="sm">
                                          {help.metadata?.status === 'completed' ? 'সম্পন্ন' : 
                                           help.metadata?.status === 'accepted' ? 'গৃহীত' : 'অপেক্ষমাণ'}
                                        </Badge>
                                      </div>
                                      {help.metadata?.accepted_by_name && (
                                        <div className="flex items-center gap-1 mt-1">
                                          <CheckCircle className="w-3 h-3 text-green-600" />
                                          <span className="text-xs text-green-600">
                                            {help.metadata.accepted_by_name} সাহায্য করছেন
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {help.metadata?.is_paid && (
                                      <Badge variant="outline" className="text-green-600 border-green-300">
                                        ৳{help.metadata?.amount}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <p className="text-center text-gray-500 py-4">কোন সাহায্যের অনুরোধ নেই</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Upcoming Events */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                            আগামী ইভেন্ট
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {chatMessages.filter(msg => msg.message_type === 'event').length > 0 ? (
                            chatMessages
                              .filter(msg => msg.message_type === 'event')
                              .slice(0, 3)
                              .map((event: any, index: number) => (
                                <div key={index} className="p-3 border rounded-lg bg-purple-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm">{event.metadata?.title || event.content.split('\n')[0]}</h4>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                                        <span>আয়োজক: {event.user?.full_name}</span>
                                        <span>•</span>
                                        <span>{event.metadata?.date}</span>
                                      </div>
                                      {event.metadata?.attendees && event.metadata.attendees.length > 0 && (
                                        <div className="flex items-center gap-1 mt-2">
                                          <Users className="w-3 h-3 text-purple-600" />
                                          <span className="text-xs text-purple-600">
                                            {event.metadata.attendees.length} জন অংশগ্রহণকারী
                                          </span>
                                          <div className="flex -space-x-1 ml-2">
                                            {event.metadata.attendees.slice(0, 3).map((attendee: any, idx: number) => (
                                              <div key={idx} className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center border border-white">
                                                <span className="text-xs font-medium text-purple-600">
                                                  {attendee.user_name?.charAt(0)?.toUpperCase()}
                                                </span>
                                              </div>
                                            ))}
                                            {event.metadata.attendees.length > 3 && (
                                              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center border border-white">
                                                <span className="text-xs text-gray-600">+{event.metadata.attendees.length - 3}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {!event.metadata?.is_free && (
                                      <Badge variant="outline" className="text-red-600 border-red-300">
                                        ৳{event.metadata?.fee}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <p className="text-center text-gray-500 py-4">কোন ইভেন্ট নেই</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Community Activity Stats */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Star className="w-5 h-5 mr-2 text-yellow-600" />
                            সম্প্রদায়ের কার্যকলাপ
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                {chatMessages.filter(msg => msg.message_type === 'help_request' && msg.metadata?.status === 'completed').length}
                              </div>
                              <div className="text-xs text-green-600">সম্পন্ন সাহায্য</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">
                                {chatMessages.filter(msg => msg.message_type === 'event' && msg.metadata?.attendees?.length > 0).length}
                              </div>
                              <div className="text-xs text-purple-600">সক্রিয় ইভেন্ট</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {chatMessages.filter(msg => msg.message_type === 'help_request' && msg.metadata?.status === 'accepted').length}
                              </div>
                              <div className="text-xs text-blue-600">চলমান সাহায্য</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">
                                {chatMessages.filter(msg => msg.message_type === 'text').length}
                              </div>
                              <div className="text-xs text-orange-600">মোট বার্তা</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Top Contributors */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                            শীর্ষ অবদানকারী
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            // Calculate contributions
                            const contributions: { [key: string]: { name: string; helps: number; events: number; total: number } } = {};
                            
                            chatMessages.forEach(msg => {
                              const userName = msg.user?.full_name || 'অজানা';
                              if (!contributions[userName]) {
                                contributions[userName] = { name: userName, helps: 0, events: 0, total: 0 };
                              }
                              
                              if (msg.message_type === 'help_request') {
                                contributions[userName].helps++;
                                contributions[userName].total++;
                              } else if (msg.message_type === 'event') {
                                contributions[userName].events++;
                                contributions[userName].total++;
                              }
                              
                              // Add points for accepting help
                              if (msg.metadata?.accepted_by_name && contributions[msg.metadata.accepted_by_name]) {
                                contributions[msg.metadata.accepted_by_name].total += 2; // Bonus for helping
                              }
                            });
                            
                            const topContributors = Object.values(contributions)
                              .sort((a, b) => b.total - a.total)
                              .slice(0, 5);
                              
                            return topContributors.length > 0 ? (
                              <div className="space-y-2">
                                {topContributors.map((contributor, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100">
                                        {index === 0 && <Crown className="w-3 h-3 text-yellow-600" />}
                                        {index > 0 && <span className="text-xs font-medium">{index + 1}</span>}
                                      </div>
                                      <span className="text-sm font-medium">{contributor.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" size="sm">{contributor.total} পয়েন্ট</Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-gray-500 py-4">কার্যকলাপ নেই</p>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>সম্প্রদায় ছবি</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={community.image}
                      alt={community.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>পরিসংখ্যান</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">সদস্য</span>
                      <span className="font-semibold">{community.totalMembers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ইভেন্ট</span>
                      <span className="font-semibold">{community.events.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">সাহায্য অনুরোধ</span>
                      <span className="font-semibold">{community.helpRequests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">বয়স</span>
                      <span className="font-semibold">{getAgeLabel(community.ageInDays)}</span>
                    </div>
                  </CardContent>
                </Card>

                {isUserMember ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>সদস্যতা</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">আপনি এই সম্প্রদায়ের সদস্য</span>
                      </div>
                      {onLeave && (
                        <Button 
                          onClick={() => {
                            if (window.confirm('আপনি কি সত্যিই এই সম্প্রদায় ছেড়ে যেতে চান?')) {
                              onLeave();
                            }
                          }}
                          variant="outline"
                          className="w-full text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          সম্প্রদায় ছাড়ুন
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : canJoin ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>যোগদান</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={onJoin}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        এই সম্প্রদায়ে যোগ দিন
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>যোগদান</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        আপনি শুধুমাত্র আপনার কাছাকাছি সম্প্রদায়ে যোগ দিতে পারবেন (৫০ কিমি এর মধ্যে)।
                      </p>
                      <Button 
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        যোগদান সম্ভব নয়
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Help Request Form Modal */}
      {showHelpRequestForm && (
        <motion.div
          key="help-request-form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelpRequestForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">সাহায্য অনুরোধ</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              sendHelpRequest({
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                urgency: formData.get('urgency'),
                location: formData.get('location'),
                is_paid: formData.get('is_paid') === 'on',
                amount: formData.get('amount')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">শিরোনাম</label>
                  <input name="title" required className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">বিবরণ</label>
                  <textarea name="description" required className="w-full border rounded px-3 py-2 h-20"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ধরন</label>
                  <select name="category" required className="w-full border rounded px-3 py-2">
                    <option value="labor">শ্রমিক</option>
                    <option value="equipment">যন্ত্রপাতি</option>
                    <option value="advice">পরামর্শ</option>
                    <option value="resources">সম্পদ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">জরুরিত্ব</label>
                  <select name="urgency" required className="w-full border rounded px-3 py-2">
                    <option value="low">কম</option>
                    <option value="medium">মাধ্যম</option>
                    <option value="high">বেশি</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">স্থান</label>
                  <input name="location" required className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_paid" id="is_paid" />
                  <label htmlFor="is_paid" className="text-sm">টাকার বিনিময়ে</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">টাকার পরিমাণ (ঐচ্ছিক)</label>
                  <input name="amount" type="number" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1">পাঠান</Button>
                <Button type="button" variant="outline" onClick={() => setShowHelpRequestForm(false)}>বাতিল</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <motion.div
          key="event-form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEventForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">নতুন ইভেন্ট</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              sendEvent({
                title: formData.get('title'),
                description: formData.get('description'),
                type: formData.get('type'),
                location: formData.get('location'),
                date: formData.get('date'),
                time: formData.get('time'),
                is_free: formData.get('is_free') === 'on',
                fee: formData.get('fee')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ইভেন্টের নাম</label>
                  <input name="title" required className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">বিবরণ</label>
                  <textarea name="description" required className="w-full border rounded px-3 py-2 h-20"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ধরন</label>
                  <select name="type" required className="w-full border rounded px-3 py-2">
                    <option value="training">প্রশিক্ষণ</option>
                    <option value="meeting">সভা</option>
                    <option value="cultural">সাংস্কৃতিক</option>
                    <option value="charity">দান</option>
                    <option value="celebration">উৎসব</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">স্থান</label>
                  <input name="location" required className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">তারিখ</label>
                  <input name="date" type="date" required className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">সময়</label>
                  <input name="time" type="time" required className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_free" id="is_free_event" defaultChecked />
                  <label htmlFor="is_free_event" className="text-sm">বিনামূল্যে</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ফি (ঐচ্ছিক)</label>
                  <input name="fee" type="number" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button type="submit" className="flex-1">তৈরি করুন</Button>
                <Button type="button" variant="outline" onClick={() => setShowEventForm(false)}>বাতিল</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <motion.div
          key="event-details-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
          onClick={() => setShowEventDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">ইভেন্ট বিবরণ</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEventDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{selectedEvent.metadata?.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedEvent.metadata?.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">তারিখ:</span>
                    <span className="ml-2 text-gray-600">{selectedEvent.metadata?.date}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">সময়:</span>
                    <span className="ml-2 text-gray-600">{selectedEvent.metadata?.time}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">স্থান:</span>
                    <span className="ml-2 text-gray-600">{selectedEvent.metadata?.location}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ধরন:</span>
                    <span className="ml-2 text-gray-600">{selectedEvent.metadata?.type}</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-3">অংশগ্রহণকারী ({selectedEvent.metadata?.attendees?.length || 0})</h5>
                  {selectedEvent.metadata?.attendees?.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedEvent.metadata.attendees.map((attendee: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {attendee.user_name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{attendee.user_name}</div>
                            <div className="text-xs text-gray-500">
                              {attendee.is_creator ? 'ইভেন্ট তৈরিকারী' : 'অংশগ্রহণকারী'}
                              {attendee.joined_at && ` • ${new Date(attendee.joined_at).toLocaleDateString()}`}
                            </div>
                          </div>
                          {attendee.is_creator && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                              <Crown className="w-3 h-3 mr-1" />
                              তৈরিকারী
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">এখনো কেউ যোগ দেননি</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommunityDetailsModal;
