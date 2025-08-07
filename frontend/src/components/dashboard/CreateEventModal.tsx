'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, DollarSign, BookOpen, Gift, Music, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CreateEventModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateEventModal = ({ onClose, onSubmit }: CreateEventModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    date: '',
    time: '',
    maxAttendees: '',
    isFree: true,
    fee: '',
    image: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
      fee: formData.isFree ? undefined : parseInt(formData.fee)
    });
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

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'training': return 'প্রশিক্ষণ';
      case 'charity': return 'দান';
      case 'cultural': return 'সাংস্কৃতিক';
      case 'meeting': return 'সভা';
      case 'celebration': return 'উৎসব';
      default: return 'অন্যান্য';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
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
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">ইভেন্ট তৈরি করুন</h2>
                  <p className="text-gray-600">সম্প্রদায়ের জন্য একটি নতুন ইভেন্ট তৈরি করুন</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">ইভেন্টের নাম *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="যেমন: কৃষি প্রযুক্তি প্রশিক্ষণ"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">বিস্তারিত বিবরণ *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="ইভেন্ট সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">ইভেন্টের ধরন *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training">প্রশিক্ষণ</SelectItem>
                        <SelectItem value="charity">দান</SelectItem>
                        <SelectItem value="cultural">সাংস্কৃতিক</SelectItem>
                        <SelectItem value="meeting">সভা</SelectItem>
                        <SelectItem value="celebration">উৎসব</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">স্থান *</Label>
                    <div className="flex gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-2" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="ইভেন্টের স্থান"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">তারিখ *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">সময় *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxAttendees">সর্বোচ্চ অংশগ্রহণকারী</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="যেমন: ৫০"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                    className="w-4 h-4 text-green-600"
                  />
                  <Label htmlFor="isFree" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    বিনামূল্যে ইভেন্ট
                  </Label>
                </div>

                {!formData.isFree && (
                  <div>
                    <Label htmlFor="fee">ফি (টাকা)</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={formData.fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                      placeholder="যেমন: ২০০"
                      min="0"
                    />
                  </div>
                )}
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="image">ছবির URL (ঐচ্ছিক)</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">প্রিভিউ</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {formData.type && (
                      <Badge className="bg-purple-100 text-purple-800">
                        {getEventTypeIcon(formData.type)}
                        <span className="ml-1">{getEventTypeLabel(formData.type)}</span>
                      </Badge>
                    )}
                    {formData.isFree ? (
                      <Badge className="bg-green-100 text-green-800">বিনামূল্যে</Badge>
                    ) : (
                      formData.fee && <Badge className="bg-orange-100 text-orange-800">৳{formData.fee}</Badge>
                    )}
                  </div>
                  {formData.title && (
                    <p className="font-medium">{formData.title}</p>
                  )}
                  {formData.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {formData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {formData.location}
                      </div>
                    )}
                    {formData.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formData.date}
                      </div>
                    )}
                    {formData.maxAttendees && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        সর্বোচ্চ {formData.maxAttendees} জন
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  ইভেন্ট তৈরি করুন
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  বাতিল
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateEventModal;
