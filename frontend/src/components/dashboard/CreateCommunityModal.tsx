'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Shield, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateCommunityModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateCommunityModal = ({ onClose, onSubmit }: CreateCommunityModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    area: '',
    isPublic: true,
    rules: [''],
    requirements: ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rules: formData.rules.filter(rule => rule.trim() !== ''),
      requirements: formData.requirements.filter(req => req.trim() !== '')
    });
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
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
                <div className="p-2 bg-green-100 rounded-lg">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">নতুন সম্প্রদায় তৈরি করুন</h2>
                  <p className="text-gray-600">একটি নতুন কৃষি সম্প্রদায় তৈরি করুন</p>
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
                  <Label htmlFor="name">সম্প্রদায়ের নাম *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="যেমন: রংপুর কৃষি সম্প্রদায়"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">বিবরণ *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="আপনার সম্প্রদায় সম্পর্কে লিখুন..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">জেলা *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="জেলা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="বরগুনা">বরগুনা</SelectItem>
                        <SelectItem value="বরিশাল">বরিশাল</SelectItem>
                        <SelectItem value="ভোলা">ভোলা</SelectItem>
                        <SelectItem value="ঝালকাঠি">ঝালকাঠি</SelectItem>
                        <SelectItem value="পটুয়াখালী">পটুয়াখালী</SelectItem>
                        <SelectItem value="পিরোজপুর">পিরোজপুর</SelectItem>
                        <SelectItem value="বান্দরবান">বান্দরবান</SelectItem>
                        <SelectItem value="ব্রাহ্মণবাড়িয়া">ব্রাহ্মণবাড়িয়া</SelectItem>
                        <SelectItem value="চাঁদপুর">চাঁদপুর</SelectItem>
                        <SelectItem value="চট্টগ্রাম">চট্টগ্রাম</SelectItem>
                        <SelectItem value="কুমিল্লা">কুমিল্লা</SelectItem>
                        <SelectItem value="কক্সবাজার">কক্সবাজার</SelectItem>
                        <SelectItem value="ফেনী">ফেনী</SelectItem>
                        <SelectItem value="খাগড়াছড়ি">খাগড়াছড়ি</SelectItem>
                        <SelectItem value="লক্ষ্মীপুর">লক্ষ্মীপুর</SelectItem>
                        <SelectItem value="নোয়াখালী">নোয়াখালী</SelectItem>
                        <SelectItem value="রাঙামাটি">রাঙামাটি</SelectItem>
                        <SelectItem value="ঢাকা">ঢাকা</SelectItem>
                        <SelectItem value="ফরিদপুর">ফরিদপুর</SelectItem>
                        <SelectItem value="গাজীপুর">গাজীপুর</SelectItem>
                        <SelectItem value="গোপালগঞ্জ">গোপালগঞ্জ</SelectItem>
                        <SelectItem value="কিশোরগঞ্জ">কিশোরগঞ্জ</SelectItem>
                        <SelectItem value="মাদারীপুর">মাদারীপুর</SelectItem>
                        <SelectItem value="মানিকগঞ্জ">মানিকগঞ্জ</SelectItem>
                        <SelectItem value="মুন্শিগঞ্জ">মুন্শিগঞ্জ</SelectItem>
                        <SelectItem value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</SelectItem>
                        <SelectItem value="নরসিংদী">নরসিংদী</SelectItem>
                        <SelectItem value="রাজবাড়ি">রাজবাড়ি</SelectItem>
                        <SelectItem value="শরীয়তপুর">শরীয়তপুর</SelectItem>
                        <SelectItem value="টাঙ্গাইল">টাঙ্গাইল</SelectItem>
                        <SelectItem value="বাগেরহাট">বাগেরহাট</SelectItem>
                        <SelectItem value="চুয়াডাঙ্গা">চুয়াডাঙ্গা</SelectItem>
                        <SelectItem value="যশোর">যশোর</SelectItem>
                        <SelectItem value="ঝিনাইদহ">ঝিনাইদহ</SelectItem>
                        <SelectItem value="খুলনা">খুলনা</SelectItem>
                        <SelectItem value="কুষ্টিয়া">কুষ্টিয়া</SelectItem>
                        <SelectItem value="মাগুরা">মাগুরা</SelectItem>
                        <SelectItem value="মেহেরপুর">মেহেরপুর</SelectItem>
                        <SelectItem value="নড়াইল">নড়াইল</SelectItem>
                        <SelectItem value="সাতক্ষীরা">সাতক্ষীরা</SelectItem>
                        <SelectItem value="জামালপুর">জামালপুর</SelectItem>
                        <SelectItem value="ময়মনসিংহ">ময়মনসিংহ</SelectItem>
                        <SelectItem value="নেত্রকোনা">নেত্রকোনা</SelectItem>
                        <SelectItem value="শেরপুর">শেরপুর</SelectItem>
                        <SelectItem value="বগুড়া">বগুড়া</SelectItem>
                        <SelectItem value="জয়পুরহাট">জয়পুরহাট</SelectItem>
                        <SelectItem value="নওগাঁ">নওগাঁ</SelectItem>
                        <SelectItem value="নাটোর">নাটোর</SelectItem>
                        <SelectItem value="চাঁপাইনবাবগঞ্জ">চাঁপাইনবাবগঞ্জ</SelectItem>
                        <SelectItem value="পাবনা">পাবনা</SelectItem>
                        <SelectItem value="রাজশাহী">রাজশাহী</SelectItem>
                        <SelectItem value="সিরাজগঞ্জ">সিরাজগঞ্জ</SelectItem>
                        <SelectItem value="দিনাজপুর">দিনাজপুর</SelectItem>
                        <SelectItem value="গাইবান্ধা">গাইবান্ধা</SelectItem>
                        <SelectItem value="কুড়িগ্রাম">কুড়িগ্রাম</SelectItem>
                        <SelectItem value="লালমনিরহাট">লালমনিরহাট</SelectItem>
                        <SelectItem value="নীলফামারী">নীলফামারী</SelectItem>
                        <SelectItem value="পঞ্চগড়">পঞ্চগড়</SelectItem>
                        <SelectItem value="রংপুর">রংপুর</SelectItem>
                        <SelectItem value="ঠাকুরগাঁও">ঠাকুরগাঁও</SelectItem>
                        <SelectItem value="হবিগঞ্জ">হবিগঞ্জ</SelectItem>
                        <SelectItem value="মৌলভীবাজার">মৌলভীবাজার</SelectItem>
                        <SelectItem value="সুনামগঞ্জ">সুনামগঞ্জ</SelectItem>
                        <SelectItem value="সিলেট">সিলেট</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="area">এলাকা</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      placeholder="যেমন: রংপুর সদর, মিঠাপুকুর"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="visibility">দৃশ্যমানতা</Label>
                  <Select
                    value={formData.isPublic ? 'public' : 'private'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isPublic: value === 'public' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">সর্বজনীন</SelectItem>
                      <SelectItem value="private">ব্যক্তিগত</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>নিয়মাবলী</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRule}>
                    নিয়ম যোগ করুন
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        placeholder={`নিয়ম ${index + 1}`}
                      />
                      {formData.rules.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRule(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>যোগদানের শর্তাবলী</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                    শর্ত যোগ করুন
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`শর্ত ${index + 1}`}
                      />
                      {formData.requirements.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  সম্প্রদায় তৈরি করুন
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

export default CreateCommunityModal;
