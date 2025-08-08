import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext.jsx';

// Mock data for fallback
const mockUserCommunity = {
  id: '1',
  name: 'রংপুর কৃষি সম্প্রদায়',
  description: 'রংপুর অঞ্চলের কৃষকদের জন্য একটি ঐক্যবদ্ধ সম্প্রদায়। আমরা একসাথে কাজ করে কৃষি উন্নয়নে অবদান রাখছি।',
  location: 'রংপুর',
  area: 'রংপুর সদর, মিঠাপুকুর, গংগাচড়া',
  leader: {
    id: 'leader1',
    name: 'আব্দুল করিম',
    role: 'leader',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    joinDate: '২০২২-০১-১৫',
    contributionPoints: 1250,
    location: 'রংপুর সদর'
  },
  coLeaders: [
    {
      id: 'co1',
      name: 'রহমান মিয়া',
      role: 'co-leader',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      joinDate: '২০২২-০৩-২০',
      contributionPoints: 890,
      location: 'মিঠাপুকুর'
    }
  ],
  elders: [
    {
      id: 'elder1',
      name: 'মোস্তফা আলী',
      role: 'elder',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
      joinDate: '২০২১-০৮-১০',
      contributionPoints: 650,
      location: 'গংগাচড়া'
    }
  ],
  members: [],
  totalMembers: 45,
  ageInDays: 730,
  helpRequests: [
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
    }
  ],
  events: [
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
    }
  ],
  achievements: ['সেরা সম্প্রদায় ২০২৩', '১০০+ সদস্য', '৫০+ সাহায্য'],
  rules: ['সবাইকে সম্মান করুন', 'সাহায্য চাইলে স্পষ্টভাবে বলুন', 'অন্যের জিনিস যত্নে ব্যবহার করুন'],
  joinRequirements: ['কৃষি কাজে আগ্রহী হতে হবে', 'নিয়মিত অংশগ্রহণ করতে হবে'],
  isPublic: true,
  createdAt: '২০২২-০১-১৫',
  image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=200&fit=crop'
};

const mockNearbyCommunities = [
  {
    id: '2',
    name: 'কুমিল্লা কৃষি বন্ধু',
    description: 'কুমিল্লা অঞ্চলের কৃষকদের জন্য একটি আধুনিক কৃষি সম্প্রদায়। প্রযুক্তি ও ঐতিহ্যের মিশেলে।',
    location: 'কুমিল্লা',
    area: 'কুমিল্লা সদর, চৌদ্দগ্রাম, মনোহরগঞ্জ',
    leader: {
      id: 'leader2',
      name: 'নুরুল আমিন',
      role: 'leader',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      joinDate: '২০২১-১২-০১',
      contributionPoints: 980,
      location: 'কুমিল্লা সদর'
    },
    coLeaders: [],
    elders: [],
    members: [],
    totalMembers: 32,
    ageInDays: 1095,
    helpRequests: [],
    events: [],
    achievements: ['নবীন কৃষক পুরস্কার ২০২৩'],
    rules: ['সত্যবাদী হোন', 'অন্যের মতামত শ্রদ্ধা করুন'],
    joinRequirements: ['কৃষি কাজে অভিজ্ঞতা থাকতে হবে'],
    isPublic: true,
    createdAt: '২০২১-১২-০১',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72f?w=400&h=200&fit=crop',
    distance: 35
  },
  {
    id: '3',
    name: 'যশোর কৃষি উন্নয়ন',
    description: 'যশোর অঞ্চলের কৃষকদের জন্য একটি প্রগতিশীল সম্প্রদায়।',
    location: 'যশোর',
    area: 'যশোর সদর, বাঘারপাড়া, ঝিকরগাছা',
    leader: {
      id: 'leader3',
      name: 'আব্দুল হামিদ',
      role: 'leader',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      joinDate: '২০২০-০৬-১৫',
      contributionPoints: 1500,
      location: 'যশোর সদর'
    },
    coLeaders: [],
    elders: [],
    members: [],
    totalMembers: 28,
    ageInDays: 1460,
    helpRequests: [],
    events: [],
    achievements: ['দীর্ঘস্থায়ী সম্প্রদায়'],
    rules: ['সহযোগিতা করুন', 'শিক্ষা দিন'],
    joinRequirements: ['কৃষি কাজে অভিজ্ঞতা থাকতে হবে'],
    isPublic: true,
    createdAt: '২০২০-০৬-১৫',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72f?w=400&h=200&fit=crop',
    distance: 45
  }
];

const mockHelpRequests = [
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
];

const mockEvents = [
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
];

export const useCommunityData = () => {
  const { user, isAuthenticated } = useAuth();
  const [userCommunity, setUserCommunity] = useState<any>(null);
  const [nearbyCommunities, setNearbyCommunities] = useState<any[]>([]);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [communityMessages, setCommunityMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Transform member data to match frontend format
  const transformMember = (member: any) => {
    if (!member) return null;
    return {
      ...member,
      name: member.user?.full_name || member.name || 'Unknown',
      email: member.user?.email || member.email || '',
      phone: member.user?.phone || member.phone || '',
      avatar: member.user?.profile_image || member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      location: member.user?.address || member.location || 'Unknown'
    };
  };

  // Transform API response to match frontend format
  const transformCommunityData = (data: any) => {
    if (!data) return null;
    return {
      ...data,
      totalMembers: data.total_members || data.totalMembers || 0,
      ageInDays: data.age_in_days || data.ageInDays || 0,
      helpRequests: data.help_requests || data.helpRequests || [],
      coLeaders: (data.co_leaders || data.coLeaders || []).map(transformMember),
      elders: (data.elders || []).map(transformMember),
      leader: transformMember(data.leader),
      joinRequirements: data.join_requirements || data.joinRequirements || [],
      image: data.image_url || data.image || 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400&h=200&fit=crop', // Default image
      rules: data.rules || [],
      achievements: data.achievements || []
    };
  };

  // Fetch community chat messages and count help/events
  const fetchCommunityChatMessages = async (communityId: number) => {
    try {
      const response = await api.getCommunityChat(communityId);
      const messages = response.messages || [];
      setCommunityMessages(messages);
      
      // Count help requests and events from chat messages
      const helpRequestMessages = messages.filter((msg: any) => msg.message_type === 'help_request');
      const eventMessages = messages.filter((msg: any) => msg.message_type === 'event');
      
      setHelpRequests(helpRequestMessages);
      setEvents(eventMessages);
      
      return { helpRequestMessages, eventMessages };
    } catch (error: any) {
      console.error('Error fetching community chat:', error);
      return { helpRequestMessages: [], eventMessages: [] };
    }
  };

  // Fetch user's community
  const fetchUserCommunity = async () => {
    if (!isAuthenticated) {
      setUserCommunity(null);
      setHelpRequests([]);
      setEvents([]);
      return;
    }

    try {
      const data = await api.safeRequest('/api/community/user/joined', {}, mockUserCommunity);
      const transformedData = transformCommunityData(data);
      
      // If real data, fetch chat messages to get real counts
      if (data && data !== mockUserCommunity && data.id) {
        const { helpRequestMessages, eventMessages } = await fetchCommunityChatMessages(data.id);
        transformedData.helpRequests = helpRequestMessages;
        transformedData.events = eventMessages;
      }
      
      setUserCommunity(transformedData);
    } catch (error) {
      console.warn('Failed to fetch user community, using mock data:', error.message);
      setUserCommunity(mockUserCommunity);
    }
  };

  // Fetch nearby communities
  const fetchNearbyCommunities = async () => {
    if (!isAuthenticated) {
      setNearbyCommunities(mockNearbyCommunities);
      return;
    }

    try {
      const data = await api.request('/api/community/nearby');
      const transformedData = Array.isArray(data) ? data.map(transformCommunityData) : data;
      setNearbyCommunities(transformedData);
    } catch (error) {
      console.error('Failed to fetch nearby communities:', error);
      // Fallback to mock data if API fails
      setNearbyCommunities(mockNearbyCommunities);
    }
  };

  // Fetch help requests
  const fetchHelpRequests = async () => {
    if (!isAuthenticated) {
      setHelpRequests(mockHelpRequests);
      return;
    }

    try {
      const data = await api.safeRequest('/api/community/help-requests', {}, { help_requests: mockHelpRequests });
      setHelpRequests(data.help_requests || data);
    } catch (error) {
      console.warn('Failed to fetch help requests, using mock data:', error.message);
      setHelpRequests(mockHelpRequests);
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    if (!isAuthenticated) {
      setEvents(mockEvents);
      return;
    }

    try {
      const data = await api.safeRequest('/api/community/events', {}, { events: mockEvents });
      setEvents(data.events || data);
    } catch (error) {
      console.warn('Failed to fetch events, using mock data:', error.message);
      setEvents(mockEvents);
    }
  };

  // Join community
  const joinCommunity = async (communityId: any) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated, cannot join community');
      return { success: false, message: 'Please login to join communities' };
    }

    try {
      await api.joinCommunity(communityId);
      console.log('Joined community:', communityId);
      
      // Refresh community data after joining
      await fetchUserCommunity();
      await fetchNearbyCommunities();
      
      return { success: true, message: 'Successfully joined community' };
    } catch (error: any) {
      console.error('Failed to join community:', error);
      return { success: false, message: error.message };
    }
  };

  // Leave community
  const leaveCommunity = async () => {
    if (!isAuthenticated) {
      console.warn('User not authenticated, cannot leave community');
      return { success: false, message: 'Please login to leave communities' };
    }

    try {
      await api.leaveCommunity();
      console.log('Left community');
      
      // Refresh community data after leaving
      await fetchUserCommunity();
      await fetchNearbyCommunities();
      
      return { success: true, message: 'Successfully left community' };
    } catch (error) {
      console.error('Failed to leave community:', error);
      return { success: false, message: error.message };
    }
  };

  // Create community
  const createCommunity = async (communityData: any) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated, cannot create community');
      return { success: false, message: 'Please login to create communities' };
    }

    try {
      const response = await api.createCommunity(communityData);
      console.log('Community created:', response);
      
      // Refresh community data after a small delay to ensure backend is updated
      setTimeout(async () => {
        await fetchUserCommunity();
        await fetchNearbyCommunities();
      }, 500);
      
      return { success: true, message: 'Community created successfully' };
    } catch (error) {
      console.error('Failed to create community:', error);
      return { success: false, message: error.message };
    }
  };

  // Create help request
  const createHelpRequest = async (helpRequestData: any) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated, cannot create help request');
      return { success: false, message: 'Please login to create help requests' };
    }

    try {
      await api.createHelpRequest(helpRequestData);
      // Refresh help requests
      await fetchHelpRequests();
      return { success: true, message: 'Help request created successfully' };
    } catch (error) {
      console.error('Failed to create help request:', error);
      return { success: false, message: error.message };
    }
  };

  // Create event
  const createEvent = async (eventData: any) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated, cannot create event');
      return { success: false, message: 'Please login to create events' };
    }

    try {
      await api.createEvent(eventData);
      // Refresh events
      await fetchEvents();
      return { success: true, message: 'Event created successfully' };
    } catch (error) {
      console.error('Failed to create event:', error);
      return { success: false, message: error.message };
    }
  };

  // Accept help request
  const acceptHelpRequest = async (helpRequestId: any) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated, cannot accept help request');
      return { success: false, message: 'Please login to accept help requests' };
    }

    try {
      await api.acceptHelpRequest(helpRequestId);
      // Refresh help requests
      await fetchHelpRequests();
      return { success: true, message: 'Help request accepted successfully' };
    } catch (error) {
      console.error('Failed to accept help request:', error);
      return { success: false, message: error.message };
    }
  };

  // Join event
  const joinEvent = async (eventId: any) => {
    if (!isAuthenticated) {
      console.warn('User not authenticated, cannot join event');
      return { success: false, message: 'Please login to join events' };
    }

    try {
      await api.joinEvent(eventId);
      // Refresh events
      await fetchEvents();
      return { success: true, message: 'Successfully joined event' };
    } catch (error) {
      console.error('Failed to join event:', error);
      return { success: false, message: error.message };
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchUserCommunity(),
          fetchNearbyCommunities(),
          fetchHelpRequests(),
          fetchEvents()
        ]);
      } catch (error) {
        console.error('Failed to load community data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  return {
    userCommunity,
    nearbyCommunities,
    helpRequests,
    events,
    communityMessages,
    loading,
    error,
    isAuthenticated,
    joinCommunity,
    leaveCommunity,
    createCommunity,
    createHelpRequest,
    createEvent,
    acceptHelpRequest,
    joinEvent,
    refreshData: () => {
      fetchUserCommunity();
      fetchNearbyCommunities();
      fetchHelpRequests();
      fetchEvents();
    }
  };
};
