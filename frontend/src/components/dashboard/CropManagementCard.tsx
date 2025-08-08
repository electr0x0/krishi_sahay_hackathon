'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useTheme } from "next-themes";
import { 
  Calendar, 
  Sprout, 
  Droplets, 
  Bug, 
  Scissors, 
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Wheat,
  Leaf,
  TreePine
} from "lucide-react";

interface CropActivity {
  id: string;
  cropName: string;
  cropNameEn: string;
  activity: string;
  activityEn: string;
  date: Date;
  status: 'pending' | 'completed' | 'overdue';
  type: 'planting' | 'watering' | 'fertilizing' | 'spraying' | 'harvesting' | 'weeding';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  notesEn?: string;
}

interface Crop {
  id: string;
  name: string;
  nameEn: string;
  plantedDate: Date;
  expectedHarvest: Date;
  stage: 'planted' | 'growing' | 'flowering' | 'fruiting' | 'harvest-ready';
  health: 'excellent' | 'good' | 'fair' | 'poor';
  area: number; // in decimal
  variety: string;
  varietyEn: string;
}

export default function CropManagementCard() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [selectedView, setSelectedView] = useState<'calendar' | 'crops' | 'activities'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { theme } = useTheme();

  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: 'ইরি ধান',
      nameEn: 'Boro Rice',
      plantedDate: new Date(2024, 10, 15), // November 15, 2024
      expectedHarvest: new Date(2024, 3, 10), // April 10, 2025
      stage: 'growing',
      health: 'good',
      area: 2.5,
      variety: 'ব্রি ধান-২৯',
      varietyEn: 'BRRI dhan29'
    },
    {
      id: '2',
      name: 'টমেটো',
      nameEn: 'Tomato',
      plantedDate: new Date(2024, 11, 1), // December 1, 2024
      expectedHarvest: new Date(2025, 1, 20), // February 20, 2025
      stage: 'flowering',
      health: 'excellent',
      area: 0.8,
      variety: 'রোমা',
      varietyEn: 'Roma'
    },
    {
      id: '3',
      name: 'আলু',
      nameEn: 'Potato',
      plantedDate: new Date(2024, 10, 20), // November 20, 2024
      expectedHarvest: new Date(2025, 1, 15), // February 15, 2025
      stage: 'growing',
      health: 'fair',
      area: 1.2,
      variety: 'ডায়মন্ড',
      varietyEn: 'Diamond'
    }
  ]);

  const [activities, setActivities] = useState<CropActivity[]>([
    {
      id: '1',
      cropName: 'ইরি ধান',
      cropNameEn: 'Boro Rice',
      activity: 'সার প্রয়োগ',
      activityEn: 'Fertilizer Application',
      date: new Date(),
      status: 'pending',
      type: 'fertilizing',
      priority: 'high',
      notes: 'ইউরিয়া ৫০ কেজি প্রতি বিঘায়',
      notesEn: 'Urea 50kg per bigha'
    },
    {
      id: '2',
      cropName: 'টমেটো',
      cropNameEn: 'Tomato',
      activity: 'পানি সেচ',
      activityEn: 'Watering',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'pending',
      type: 'watering',
      priority: 'medium'
    },
    {
      id: '3',
      cropName: 'আলু',
      cropNameEn: 'Potato',
      activity: 'আগাছা পরিষ্কার',
      activityEn: 'Weeding',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      status: 'overdue',
      type: 'weeding',
      priority: 'high'
    },
    {
      id: '4',
      cropName: 'টমেটো',
      cropNameEn: 'Tomato',
      activity: 'কীটনাশক স্প্রে',
      activityEn: 'Pesticide Spray',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      status: 'pending',
      type: 'spraying',
      priority: 'medium'
    }
  ]);

  const getCropIcon = (cropName: string) => {
    if (cropName.includes('ধান') || cropName.toLowerCase().includes('rice')) return Wheat;
    if (cropName.includes('টমেটো') || cropName.toLowerCase().includes('tomato')) return Sprout;
    if (cropName.includes('আলু') || cropName.toLowerCase().includes('potato')) return Wheat;
    return Leaf;
  };

  const getActivityIcon = (type: CropActivity['type']) => {
    switch (type) {
      case 'planting': return Wheat;
      case 'watering': return Droplets;
      case 'fertilizing': return TreePine;
      case 'spraying': return Bug;
      case 'harvesting': return Scissors;
      case 'weeding': return Leaf;
      default: return Sprout;
    }
  };

  const getStageColor = (stage: Crop['stage']) => {
    switch (stage) {
      case 'planted': return 'bg-green-100 text-green-800';
      case 'growing': return 'bg-blue-100 text-blue-800';
      case 'flowering': return 'bg-purple-100 text-purple-800';
      case 'fruiting': return 'bg-orange-100 text-orange-800';
      case 'harvest-ready': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: Crop['health']) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: CropActivity['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: CropActivity['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-green-400 bg-green-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => 
      activity.date.toDateString() === date.toDateString()
    );
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
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

  const tabs = [
    { id: 'calendar', label: language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar', icon: Calendar },
    { id: 'crops', label: language === 'bn' ? 'ফসল' : 'Crops', icon: Sprout },
    { id: 'activities', label: language === 'bn' ? 'কার্যক্রম' : 'Activities', icon: Clock }
  ];

  return (
    <Card className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-green-500 rounded-lg">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                {language === 'bn' ? 'ফসল ব্যবস্থাপনা' : 'Crop Management'}
              </h3>
              <p className="text-xs text-gray-600">
                {language === 'bn' ? 'আপনার কৃষি কার্যক্রম পরিকল্পনা' : 'Plan your farming activities'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-md text-xs font-medium bg-white/60 hover:bg-white/80"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 bg-white/60 p-1 rounded-lg border">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                  selectedView === tab.id
                    ? 'bg-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Calendar View */}
          {selectedView === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h4 className="text-lg font-bold text-gray-800">
                  {formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))}
                </h4>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'].map((day, index) => (
                  <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
                    {language === 'bn' ? day : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                  </div>
                ))}

                {/* Calendar Days */}
                {generateCalendarDays().map((date, index) => {
                  const dayActivities = getActivitiesForDate(date);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();

                  return (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square p-2 rounded-lg text-sm transition-all duration-200 relative ${
                        !isCurrentMonth
                          ? 'text-gray-300'
                          : isSelected
                          ? 'bg-green-500 text-white'
                          : isToday
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : 'hover:bg-white/80 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div>{date.getDate()}</div>
                      {dayActivities.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {dayActivities.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-green-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Selected Date Activities */}
              {getActivitiesForDate(selectedDate).length > 0 && (
                <div className="mt-6 bg-white/80 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-3">
                    {formatDate(selectedDate)} - {language === 'bn' ? 'কার্যক্রম' : 'Activities'}
                  </h5>
                  <div className="space-y-2">
                    {getActivitiesForDate(selectedDate).map((activity) => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">
                              {language === 'bn' ? activity.activity : activity.activityEn}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({language === 'bn' ? activity.cropName : activity.cropNameEn})
                            </span>
                          </div>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status === 'completed' ? (language === 'bn' ? 'সম্পন্ন' : 'Done') :
                             activity.status === 'overdue' ? (language === 'bn' ? 'বিলম্বিত' : 'Overdue') :
                             (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Crops View */}
          {selectedView === 'crops' && (
            <motion.div
              key="crops"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {crops.map((crop, index) => {
                const IconComponent = getCropIcon(crop.name);
                const daysToHarvest = Math.ceil((crop.expectedHarvest.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <motion.div
                    key={crop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 p-5 rounded-lg border-l-4 border-green-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <IconComponent className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            {language === 'bn' ? crop.name : crop.nameEn}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {language === 'bn' ? crop.variety : crop.varietyEn} • {crop.area} {language === 'bn' ? 'শতক' : 'decimal'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStageColor(crop.stage)}>
                        {crop.stage === 'planted' ? (language === 'bn' ? 'বপন করা' : 'Planted') :
                         crop.stage === 'growing' ? (language === 'bn' ? 'বৃদ্ধি' : 'Growing') :
                         crop.stage === 'flowering' ? (language === 'bn' ? 'ফুল' : 'Flowering') :
                         crop.stage === 'fruiting' ? (language === 'bn' ? 'ফল' : 'Fruiting') :
                         (language === 'bn' ? 'ফসল তোলা' : 'Ready')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">
                          {language === 'bn' ? 'রোপণের তারিখ' : 'Planted Date'}
                        </p>
                        <p className="text-sm font-medium">{formatDate(crop.plantedDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          {language === 'bn' ? 'ফসল তোলার তারিখ' : 'Expected Harvest'}
                        </p>
                        <p className="text-sm font-medium">{formatDate(crop.expectedHarvest)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {language === 'bn' ? 'স্বাস্থ্য:' : 'Health:'}
                        </span>
                        <span className={`text-sm font-medium ${getHealthColor(crop.health)}`}>
                          {crop.health === 'excellent' ? (language === 'bn' ? 'চমৎকার' : 'Excellent') :
                           crop.health === 'good' ? (language === 'bn' ? 'ভাল' : 'Good') :
                           crop.health === 'fair' ? (language === 'bn' ? 'মোটামুটি' : 'Fair') :
                           (language === 'bn' ? 'খারাপ' : 'Poor')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {daysToHarvest > 0 ? (
                          <>
                            {daysToHarvest} {language === 'bn' ? 'দিন বাকি' : 'days to harvest'}
                          </>
                        ) : (
                          <span className="text-orange-600 font-medium">
                            {language === 'bn' ? 'ফসল তোলার সময়!' : 'Ready to harvest!'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Activities View */}
          {selectedView === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {activities
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type);
                  const isOverdue = activity.status === 'overdue';
                  const daysFromNow = Math.ceil((activity.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor(activity.priority)} ${
                        isOverdue ? 'border-red-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 p-2 rounded-lg ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                          activity.status === 'overdue' ? 'bg-red-100 text-red-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {activity.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : activity.status === 'overdue' ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : (
                            <IconComponent className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {language === 'bn' ? activity.activity : activity.activityEn}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {language === 'bn' ? activity.cropName : activity.cropNameEn}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(activity.status)}>
                                {activity.status === 'completed' ? (language === 'bn' ? 'সম্পন্ন' : 'Done') :
                                 activity.status === 'overdue' ? (language === 'bn' ? 'বিলম্বিত' : 'Overdue') :
                                 (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {formatDate(activity.date)}
                              {daysFromNow === 0 ? (
                                <span className="ml-2 text-blue-600 font-medium">
                                  ({language === 'bn' ? 'আজ' : 'Today'})
                                </span>
                              ) : daysFromNow === 1 ? (
                                <span className="ml-2 text-green-600 font-medium">
                                  ({language === 'bn' ? 'আগামীকাল' : 'Tomorrow'})
                                </span>
                              ) : daysFromNow === -1 ? (
                                <span className="ml-2 text-orange-600 font-medium">
                                  ({language === 'bn' ? 'গতকাল' : 'Yesterday'})
                                </span>
                              ) : daysFromNow > 1 ? (
                                <span className="ml-2 text-gray-500">
                                  ({daysFromNow} {language === 'bn' ? 'দিন পরে' : 'days'})
                                </span>
                              ) : (
                                <span className="ml-2 text-red-600 font-medium">
                                  ({Math.abs(daysFromNow)} {language === 'bn' ? 'দিন বিলম্ব' : 'days overdue'})
                                </span>
                              )}
                            </span>
                            
                            <Badge className={`${
                              activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                              activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {activity.priority === 'high' ? (language === 'bn' ? 'উচ্চ' : 'High') :
                               activity.priority === 'medium' ? (language === 'bn' ? 'মাধ্যম' : 'Medium') :
                               (language === 'bn' ? 'নিম্ন' : 'Low')}
                            </Badge>
                          </div>
                          
                          {activity.notes && (
                            <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              {language === 'bn' ? activity.notes : activity.notesEn}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Activity Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-6 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন কার্যক্রম যোগ করুন' : 'Add New Activity'}</span>
        </motion.button>
      </CardContent>
    </Card>
  );
}