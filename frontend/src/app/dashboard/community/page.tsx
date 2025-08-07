'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Crown, 
  Shield, 
  Star, 
  Calendar, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus,
  UserCheck,
  Handshake,
  Gift,
  BookOpen,
  Music,
  Camera,
  Clock,
  CheckCircle,
  UserMinus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCommunityData } from '@/hooks/useCommunityData';
import CreateCommunityModal from '@/components/dashboard/CreateCommunityModal';
import CreateHelpRequestModal from '@/components/dashboard/CreateHelpRequestModal';
import CreateEventModal from '@/components/dashboard/CreateEventModal';
import CommunityDetailsModal from '@/components/dashboard/CommunityDetailsModal';

// Types for the Shomprodai system
interface CommunityMember {
  id: string;
  name: string;
  role: 'leader' | 'co-leader' | 'elder' | 'member';
  avatar: string;
  joinDate: string;
  contributionPoints: number;
  location: string;
}

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  requester: {
    id: string;
    name: string;
    avatar: string;
  };
  category: 'equipment' | 'labor' | 'knowledge' | 'financial' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  datePosted: string;
  isPaid: boolean;
  amount?: number;
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  acceptedBy?: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'training' | 'charity' | 'cultural' | 'meeting' | 'celebration';
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  location: string;
  date: string;
  time: string;
  attendees: number;
  maxAttendees?: number;
  isFree: boolean;
  fee?: number;
  image?: string;
}

interface Shomprodai {
  id: string;
  name: string;
  description: string;
  location: string;
  area: string;
  leader: CommunityMember;
  coLeaders: CommunityMember[];
  elders: CommunityMember[];
  members: CommunityMember[];
  totalMembers: number;
  ageInDays: number;
  helpRequests: HelpRequest[];
  events: CommunityEvent[];
  achievements: string[];
  rules: string[];
  joinRequirements: string[];
  isPublic: boolean;
  createdAt: string;
  image: string;
  distance?: number; // Distance from user's location
}

const CommunityPage = () => {
  const { user } = useAuth();
  const {
    userCommunity,
    nearbyCommunities,
    helpRequests,
    events,
    loading,
    error,
    isAuthenticated,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    createHelpRequest,
    createEvent,
    acceptHelpRequest,
    joinEvent
  } = useCommunityData();
  
  const [activeTab, setActiveTab] = useState('my-community');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreateHelpRequest, setShowCreateHelpRequest] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCommunityDetails, setShowCommunityDetails] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [showWorldwide, setShowWorldwide] = useState(false);
  const [userLocation, setUserLocation] = useState('রংপুর'); 

  // Mock data for worldwide communities (will be replaced by API data)
  const [worldwideCommunities, setWorldwideCommunities] = useState<any[]>([]);

  const [allHelpRequests, setAllHelpRequests] = useState<HelpRequest[]>([
    {
      id: 'help1',
      title: 'ধান রোপণে সহায়তা প্রয়োজন',
      description: 'আমার ২ একর জমিতে ধান রোপণ করতে সাহায্য দরকার। কেউ কি সাহায্য করতে পারবেন?',
      requester: {
        id: 'user1',
        name: 'ফাতেমা খাতুন',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'
      },
      category: 'labor',
      urgency: 'high',
      location: 'রংপুর সদর',
      datePosted: '২০২৪-০১-১৫',
      isPaid: false,
      status: 'open',
      tags: ['ধান রোপণ', 'শ্রমিক', 'জরুরি']
    },
    {
      id: 'help2',
      title: 'ট্রাক্টর ভাড়া চাই',
      description: 'আমার জমি চাষ করার জন্য ট্রাক্টর ভাড়া দরকার। কেউ কি ভাড়া দিতে পারবেন?',
      requester: {
        id: 'user2',
        name: 'রহমান মিয়া',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'
      },
      category: 'equipment',
      urgency: 'medium',
      location: 'কুমিল্লা সদর',
      datePosted: '২০২৪-০১-১৪',
      isPaid: true,
      amount: 2000,
      status: 'open',
      tags: ['ট্রাক্টর', 'ভাড়া', 'চাষ']
    }
  ]);

  const [allEvents, setAllEvents] = useState<CommunityEvent[]>([
    {
      id: 'event1',
      title: 'কৃষি প্রযুক্তি প্রশিক্ষণ',
      description: 'আধুনিক কৃষি প্রযুক্তি সম্পর্কে প্রশিক্ষণ। বিশেষজ্ঞ কৃষি কর্মকর্তা উপস্থিত থাকবেন।',
      type: 'training',
      organizer: {
        id: 'org1',
        name: 'কৃষি সম্প্রসারণ অধিদপ্তর',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50&h=50&fit=crop&crop=face'
      },
      location: 'রংপুর কৃষি কলেজ',
      date: '২০২৪-০২-১০',
      time: 'সকাল ৯টা',
      attendees: 25,
      maxAttendees: 50,
      isFree: true,
      image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=200&fit=crop'
    },
    {
      id: 'event2',
      title: 'কৃষি উৎসব ২০২৪',
      description: 'বাংলাদেশের কৃষি ঐতিহ্য উদযাপনের জন্য একটি বড় উৎসব।',
      type: 'cultural',
      organizer: {
        id: 'org2',
        name: 'কৃষি মন্ত্রণালয়',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50&h=50&fit=crop&crop=face'
      },
      location: 'ঢাকা কৃষি বিশ্ববিদ্যালয়',
      date: '২০২৪-০৩-১৫',
      time: 'সকাল ১০টা',
      attendees: 150,
      maxAttendees: 500,
      isFree: true,
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72f?w=400&h=200&fit=crop'
    }
  ]);

  const filteredNearbyCommunities = nearbyCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || community.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });





  const filteredHelpRequests = allHelpRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || request.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || event.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'co-leader': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'elder': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleJoinCommunity = async (community: Shomprodai) => {
    // Check if community is within 50km
    if (community.distance && community.distance > 50) {
      alert('আপনি শুধুমাত্র আপনার কাছাকাছি সম্প্রদায়ে যোগ দিতে পারবেন (৫০ কিমি এর মধ্যে)।');
      return;
    }
    
    try {
      const result = await joinCommunity(community.id);
      if (result.success) {
        alert(`${community.name} এ সফলভাবে যোগ দিয়েছেন!`);
      } else {
        alert('ত্রুটি: ' + result.message);
      }
    } catch (error) {
      alert('সম্প্রদায়ে যোগ দিতে সমস্যা হয়েছে');
    }
  };

  const handleLeaveCommunity = async () => {
    if (confirm('আপনি কি নিশ্চিত যে আপনি এই সম্প্রদায় ছাড়তে চান?')) {
      try {
        const result = await leaveCommunity();
        if (result.success) {
          alert('সম্প্রদায় সফলভাবে ছেড়েছেন!');
        } else {
          alert('ত্রুটি: ' + result.message);
        }
      } catch (error) {
        alert('সম্প্রদায় ছাড়তে সমস্যা হয়েছে');
      }
    }
  };

  // Ensure community object has all required properties
  const ensureCommunityProperties = (community: any) => {
    return {
      ...community,
      helpRequests: community.helpRequests || [],
      events: community.events || [],
      achievements: community.achievements || [],
      rules: community.rules || [],
      joinRequirements: community.joinRequirements || [],
      coLeaders: community.coLeaders || [],
      elders: community.elders || [],
      members: community.members || [],
      totalMembers: community.totalMembers || 0
    };
  };

  const handleCommunityClick = (community: Shomprodai) => {
    setSelectedCommunity(ensureCommunityProperties(community));
    setShowCommunityDetails(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">সম্প্রদায়</h1>
          <p className="text-gray-600 mt-2">কৃষি সম্প্রদায়ে যোগ দিন, সাহায্য করুন এবং সাহায্য নিন</p>
        </div>
        <div className="flex gap-3">
          {!userCommunity && (
            <Button onClick={() => setShowCreateCommunity(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              নতুন সম্প্রদায়
            </Button>
          )}
          <Button onClick={() => setShowCreateHelpRequest(true)} variant="outline">
            <Handshake className="w-4 h-4 mr-2" />
            সাহায্য চাই
          </Button>
          <Button onClick={() => setShowCreateEvent(true)} variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            ইভেন্ট তৈরি
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="সম্প্রদায়, সাহায্য বা ইভেন্ট খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">সব স্থান</option>
          <option value="ঢাকা">ঢাকা</option>
          <option value="চট্টগ্রাম">চট্টগ্রাম</option>
          <option value="রাজশাহী">রাজশাহী</option>
          <option value="খুলনা">খুলনা</option>
          <option value="বরিশাল">বরিশাল</option>
          <option value="সিলেট">সিলেট</option>
          <option value="রংপুর">রংপুর</option>
          <option value="ময়মনসিংহ">ময়মনসিংহ</option>
        </select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-community">আমার সম্প্রদায়</TabsTrigger>
          <TabsTrigger value="join">যোগ দিন</TabsTrigger>
        </TabsList>

        {/* My Community Tab */}
        <TabsContent value="my-community" className="space-y-6">
          {userCommunity ? (
            <div className="space-y-6">
              {/* User's Community Card */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleCommunityClick(userCommunity)}>
                <div className="relative">
                  <img
                    src={userCommunity.image}
                    alt={userCommunity.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      সদস্য
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {userCommunity.name}
                    {getRoleIcon('leader')}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{userCommunity.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {userCommunity.location}, {userCommunity.area}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{userCommunity.totalMembers || 0} সদস্য</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{getAgeLabel(userCommunity.ageInDays || 0)} পুরানো</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userCommunity.achievements?.slice(0, 2).map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {achievement}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">কোন অর্জন নেই</span>}
                  </div>
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedCommunity(ensureCommunityProperties(userCommunity));
                        setShowCommunityDetails(true);
                      }}
                    >
                      বিস্তারিত দেখুন
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('help-tracker')}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Handshake className="w-5 h-5 mr-2 text-blue-600" />
                      সাহায্য ট্র্যাকার
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">{userCommunity.helpRequests?.length || 0}</p>
                    <p className="text-sm text-gray-600">সক্রিয় অনুরোধ</p>
                    <Button variant="ghost" size="sm" className="mt-2 w-full text-blue-600">
                      বিস্তারিত দেখুন →
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('event-tracker')}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                      ইভেন্ট ট্র্যাকার
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-600">{userCommunity.events?.length || 0}</p>
                    <p className="text-sm text-gray-600">আগামী ইভেন্ট</p>
                    <Button variant="ghost" size="sm" className="mt-2 w-full text-purple-600">
                      বিস্তারিত দেখুন →
                    </Button>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setSelectedCommunity(ensureCommunityProperties(userCommunity));
                  setShowCommunityDetails(true);
                }}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-600" />
                      সদস্য তালিকা
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">{userCommunity.totalMembers || 0}</p>
                    <p className="text-sm text-gray-600">মোট সদস্য</p>
                    <Button variant="ghost" size="sm" className="mt-2 w-full text-green-600">
                      বিস্তারিত দেখুন →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>আপনার সম্প্রদায়</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">আপনি এখনও কোন সম্প্রদায়ে যোগ দেননি।</p>
                <Button 
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => setActiveTab('join')}
                >
                  সম্প্রদায় খুঁজুন
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Join Communities Tab */}
        <TabsContent value="join" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">সব সম্প্রদায়</h2>
            <div className="text-sm text-gray-600">
              অবস্থান অনুযায়ী ফিল্টার করতে উপরের ড্রপডাউন ব্যবহার করুন
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">সম্প্রদায় লোড হচ্ছে...</p>
            </div>
          ) : filteredNearbyCommunities.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">কোন সম্প্রদায় পাওয়া যায়নি</h3>
                <p className="text-sm">
                  {searchTerm || selectedLocation !== 'all' 
                    ? 'আপনার অনুসন্ধান অনুযায়ী কোন সম্প্রদায় পাওয়া যায়নি। অনুসন্ধানের শর্ত পরিবর্তন করে আবার চেষ্টা করুন।'
                    : 'আপনার এলাকায় কোন সম্প্রদায় নেই। নতুন সম্প্রদায় তৈরি করুন।'
                  }
                </p>
                <Button 
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => setShowCreateCommunity(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন সম্প্রদায় তৈরি করুন
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNearbyCommunities.map((community) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleCommunityClick(community)}>
                  <div className="relative">
                    <img
                      src={community.image}
                      alt={community.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-blue-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {getAgeLabel(community.ageInDays)}
                      </Badge>
                    </div>
                    {community.distance && (
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="secondary">
                          <MapPin className="w-4 h-4 mr-1" />
                          {community.distance} কিমি
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {community.name}
                      {getRoleIcon('leader')}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{community.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {community.location}, {community.area}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{community.totalMembers} সদস্য</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">{getAgeLabel(community.ageInDays)} পুরানো</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {community.achievements?.slice(0, 2).map((achievement, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {achievement}
                        </Badge>
                      )) || <span className="text-sm text-gray-500">কোন অর্জন নেই</span>}
                    </div>
                    {!userCommunity ? (
                      community.distance && community.distance <= 50 ? (
                        <Button 
                          size="sm" 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinCommunity(community);
                          }}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          যোগ দিন
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          disabled
                          title="৫০ কিমি এর বেশি দূরে"
                        >
                          <X className="w-4 h-4 mr-2" />
                          খুব দূরে
                        </Button>
                      )
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        disabled
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        ইতিমধ্যে সদস্য
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Help Tracker Tab */}
        <TabsContent value="help-tracker" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">সাহায্য ট্র্যাকার</h2>
            <Button 
              onClick={() => setActiveTab('my-community')} 
              variant="outline"
              size="sm"
            >
              ← ফিরে যান
            </Button>
          </div>
          
          <div className="grid gap-4">
            {helpRequests && helpRequests.length > 0 ? (
              helpRequests.map((help: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{help.metadata?.title || help.content?.split('\n')[0] || 'সাহায্যের অনুরোধ'}</h3>
                          <Badge variant={help.metadata?.status === 'completed' ? 'default' : help.metadata?.status === 'accepted' ? 'secondary' : 'outline'}>
                            {help.metadata?.status === 'completed' ? 'সম্পন্ন' : 
                             help.metadata?.status === 'accepted' ? 'গৃহীত' : 'অপেক্ষমাণ'}
                          </Badge>
                          {help.metadata?.is_paid && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              ৳{help.metadata?.amount || 0}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{help.metadata?.description || help.content || 'বিবরণ নেই'}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>অনুরোধকারী: {help.user?.full_name || 'অজানা'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{help.metadata?.location || 'অবস্থান উল্লেখ নেই'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(help.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {help.metadata?.accepted_by_name && (
                          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {help.metadata.accepted_by_name} সাহায্য করছেন
                              </span>
                            </div>
                            {help.metadata?.accepted_at && (
                              <span className="text-xs text-green-600">
                                {new Date(help.metadata.accepted_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Handshake className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">কোন সাহায্যের অনুরোধ নেই</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Event Tracker Tab */}
        <TabsContent value="event-tracker" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">ইভেন্ট ট্র্যাকার</h2>
            <Button 
              onClick={() => setActiveTab('my-community')} 
              variant="outline"
              size="sm"
            >
              ← ফিরে যান
            </Button>
          </div>
          
          <div className="grid gap-4">
            {events && events.length > 0 ? (
              events.map((event: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{event.metadata?.title || event.content?.split('\n')[0] || 'ইভেন্ট'}</h3>
                          <Badge variant="outline" className="text-purple-600 border-purple-300">
                            {event.metadata?.type || 'সাধারণ'}
                          </Badge>
                          {!event.metadata?.is_free && (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              ৳{event.metadata?.fee || 0}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{event.metadata?.description || event.content || 'বিবরণ নেই'}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{event.metadata?.date || 'তারিখ উল্লেখ নেই'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.metadata?.time || 'সময় উল্লেখ নেই'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.metadata?.location || 'অবস্থান উল্লেখ নেই'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>আয়োজক: {event.user?.full_name || 'অজানা'}</span>
                          </div>
                        </div>
                        
                        {event.metadata?.attendees && event.metadata.attendees.length > 0 && (
                          <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-800">
                                অংশগ্রহণকারী ({event.metadata.attendees.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {event.metadata.attendees.slice(0, 5).map((attendee: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1 bg-white rounded-full px-2 py-1 text-xs">
                                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-medium">
                                      {attendee.user_name?.charAt(0)?.toUpperCase()}
                                    </span>
                                  </div>
                                  <span>{attendee.user_name}</span>
                                  {attendee.is_creator && (
                                    <Crown className="w-3 h-3 text-yellow-500" />
                                  )}
                                </div>
                              ))}
                              {event.metadata.attendees.length > 5 && (
                                <span className="text-xs text-purple-600">+{event.metadata.attendees.length - 5} আরো</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">কোন ইভেন্ট নেই</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AnimatePresence>
        {showCreateCommunity && (
          <CreateCommunityModal
            onClose={() => setShowCreateCommunity(false)}
            onSubmit={async (data) => {
              try {
                const result = await createCommunity(data);
                if (result.success) {
                  alert('সম্প্রদায় সফলভাবে তৈরি হয়েছে!');
                } else {
                  alert('ত্রুটি: ' + result.message);
                }
              } catch (error) {
                alert('সম্প্রদায় তৈরিতে সমস্যা হয়েছে');
              }
              setShowCreateCommunity(false);
            }}
          />
        )}
        {showCreateHelpRequest && (
          <CreateHelpRequestModal
            onClose={() => setShowCreateHelpRequest(false)}
            onSubmit={(data) => {
              // Handle help request creation
              setShowCreateHelpRequest(false);
            }}
          />
        )}
        {showCreateEvent && (
          <CreateEventModal
            onClose={() => setShowCreateEvent(false)}
            onSubmit={(data) => {
              // Handle event creation
              setShowCreateEvent(false);
            }}
          />
        )}
        {showCommunityDetails && selectedCommunity && (
          <CommunityDetailsModal
            community={selectedCommunity}
            onClose={() => {
              setShowCommunityDetails(false);
              setSelectedCommunity(null);
            }}
            onJoin={() => {
              if (selectedCommunity) {
                handleJoinCommunity(selectedCommunity);
                setShowCommunityDetails(false);
                setSelectedCommunity(null);
              }
            }}
            onLeave={async () => {
              try {
                const result = await leaveCommunity();
                if (result.success) {
                  alert('সফলভাবে সম্প্রদায় ছেড়েছেন!');
                  setShowCommunityDetails(false);
                  setSelectedCommunity(null);
                } else {
                  alert('ত্রুটি: ' + result.message);
                }
              } catch (error) {
                alert('সম্প্রদায় ছাড়তে সমস্যা হয়েছে');
              }
            }}
            canJoin={!userCommunity && (selectedCommunity.distance ? selectedCommunity.distance <= 50 : true)}
            isUserMember={!!userCommunity && userCommunity.id === selectedCommunity.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;
