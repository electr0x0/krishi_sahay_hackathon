'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wrench, 
  Users, 
  Upload, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AddSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddSharingModal({ isOpen, onClose, onSubmit }: AddSharingModalProps) {
  const [activeTab, setActiveTab] = useState('equipment');
  const [formData, setFormData] = useState({
    // Equipment fields
    name: '',
    type: '',
    description: '',
    price_per_hour: '',
    price_per_day: '',
    location: '',
    features: [] as string[],
    
    // Labor fields
    title: '',
    labor_type: '',
    description: '',
    date_needed: '',
    duration_hours: '',
    payment_per_hour: '',
    skills_required: [] as string[],
    urgency: 'medium'
  });

  const [newFeature, setNewFeature] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const equipmentTypes = [
    { value: 'tractor', label: 'ট্রাক্টর' },
    { value: 'tiller', label: 'পাওয়ার টিলার' },
    { value: 'sprayer', label: 'স্প্রেয়ার' },
    { value: 'harvester', label: 'হারভেস্টার' },
    { value: 'irrigation', label: 'সেচ যন্ত্র' },
    { value: 'other', label: 'অন্যান্য' }
  ];

  const laborTypes = [
    { value: 'planting', label: 'রোপণ' },
    { value: 'harvesting', label: 'উত্তোলন' },
    { value: 'weeding', label: 'নিড়ানি' },
    { value: 'irrigation', label: 'সেচ' },
    { value: 'other', label: 'অন্যান্য' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'কম জরুরি' },
    { value: 'medium', label: 'মাঝারি' },
    { value: 'high', label: 'জরুরি' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (activeTab === 'equipment') {
      onSubmit({
        type: 'equipment',
        ...formData
      });
    } else {
      onSubmit({
        type: 'labor',
        ...formData
      });
    }
    onClose();
  };

  const isFormValid = () => {
    if (activeTab === 'equipment') {
      return formData.name && formData.type && formData.description && 
             formData.price_per_hour && formData.price_per_day && formData.location;
    } else {
      return formData.title && formData.labor_type && formData.description && 
             formData.date_needed && formData.duration_hours && formData.payment_per_hour;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">নতুন তালিকা যোগ করুন</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="equipment" className="flex items-center">
                  <Wrench className="w-4 h-4 mr-2" />
                  যন্ত্রপাতি
                </TabsTrigger>
                <TabsTrigger value="labor" className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  শ্রমিক চাহিদা
                </TabsTrigger>
              </TabsList>

              <TabsContent value="equipment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      যন্ত্রপাতির নাম *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="যন্ত্রপাতির নাম লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      ধরন *
                    </label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    বিবরণ *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="যন্ত্রপাতির বিস্তারিত বিবরণ লিখুন"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      দাম (প্রতি ঘণ্টা) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price_per_hour}
                      onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                      placeholder="৳"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      দাম (প্রতি দিন) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price_per_day}
                      onChange={(e) => handleInputChange('price_per_day', e.target.value)}
                      placeholder="৳"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    অবস্থান *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="আপনার অবস্থান লিখুন"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    বিশেষ বৈশিষ্ট্য
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="বৈশিষ্ট্য যোগ করুন"
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <Button onClick={addFeature} size="sm">
                        যোগ করুন
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          {feature}
                          <button
                            onClick={() => removeFeature(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="labor" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      কাজের শিরোনাম *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="কাজের শিরোনাম লিখুন"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      কাজের ধরন *
                    </label>
                    <Select value={formData.labor_type} onValueChange={(value) => handleInputChange('labor_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {laborTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    বিস্তারিত বিবরণ *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="কাজের বিস্তারিত বিবরণ লিখুন"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      প্রয়োজনীয় তারিখ *
                    </label>
                    <Input
                      type="date"
                      value={formData.date_needed}
                      onChange={(e) => handleInputChange('date_needed', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      সময়কাল (ঘণ্টা) *
                    </label>
                    <Input
                      type="number"
                      value={formData.duration_hours}
                      onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                      placeholder="ঘণ্টা"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      মজুরি (প্রতি ঘণ্টা) *
                    </label>
                    <Input
                      type="number"
                      value={formData.payment_per_hour}
                      onChange={(e) => handleInputChange('payment_per_hour', e.target.value)}
                      placeholder="৳"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      জরুরি
                    </label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    প্রয়োজনীয় দক্ষতা
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="দক্ষতা যোগ করুন"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} size="sm">
                        যোগ করুন
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          {skill}
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                বাতিল
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                তালিকা যোগ করুন
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
