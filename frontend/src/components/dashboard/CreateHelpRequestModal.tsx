'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handshake, MapPin, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CreateHelpRequestModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateHelpRequestModal = ({ onClose, onSubmit }: CreateHelpRequestModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    location: '',
    isPaid: false,
    amount: '',
    tags: ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: formData.isPaid ? parseInt(formData.amount) : undefined,
      tags: formData.tags.filter(tag => tag.trim() !== '')
    });
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Handshake className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">সাহায্য চাই</h2>
                  <p className="text-gray-600">আপনার প্রয়োজনীয় সাহায্যের বিবরণ দিন</p>
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
                  <Label htmlFor="title">শিরোনাম *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="যেমন: ধান রোপণে সহায়তা প্রয়োজন"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">বিস্তারিত বিবরণ *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="আপনার সাহায্যের প্রয়োজনীয়তা সম্পর্কে বিস্তারিত লিখুন..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">শ্রেণী *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">সরঞ্জাম</SelectItem>
                        <SelectItem value="labor">শ্রমিক</SelectItem>
                        <SelectItem value="knowledge">জ্ঞান</SelectItem>
                        <SelectItem value="financial">আর্থিক</SelectItem>
                        <SelectItem value="other">অন্যান্য</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="urgency">জরুরি মাত্রা *</Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">কম জরুরি</SelectItem>
                        <SelectItem value="medium">মাঝারি জরুরি</SelectItem>
                        <SelectItem value="high">উচ্চ জরুরি</SelectItem>
                        <SelectItem value="critical">অতি জরুরি</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">স্থান *</Label>
                  <div className="flex gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-2" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="আপনার গ্রাম/শহর"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={formData.isPaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                    className="w-4 h-4 text-green-600"
                  />
                  <Label htmlFor="isPaid" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    অর্থ প্রদান করব
                  </Label>
                </div>

                {formData.isPaid && (
                  <div>
                    <Label htmlFor="amount">পরিমাণ (টাকা)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="যেমন: ২০০০"
                      min="0"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>ট্যাগ</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTag}>
                    ট্যাগ যোগ করুন
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        placeholder={`ট্যাগ ${index + 1}`}
                      />
                      {formData.tags.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTag(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">প্রিভিউ</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(formData.urgency)}>
                      {formData.urgency === 'critical' ? 'অতি জরুরি' : 
                       formData.urgency === 'high' ? 'উচ্চ জরুরি' :
                       formData.urgency === 'medium' ? 'মাঝারি জরুরি' : 'কম জরুরি'}
                    </Badge>
                    {formData.category && (
                      <Badge variant="outline">
                        {formData.category === 'equipment' ? 'সরঞ্জাম' :
                         formData.category === 'labor' ? 'শ্রমিক' :
                         formData.category === 'knowledge' ? 'জ্ঞান' :
                         formData.category === 'financial' ? 'আর্থিক' : 'অন্যান্য'}
                      </Badge>
                    )}
                    {formData.isPaid && formData.amount && (
                      <Badge className="bg-green-100 text-green-800">
                        ৳{formData.amount}
                      </Badge>
                    )}
                  </div>
                  {formData.title && (
                    <p className="font-medium">{formData.title}</p>
                  )}
                  {formData.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  সাহায্য চাই
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

export default CreateHelpRequestModal;
