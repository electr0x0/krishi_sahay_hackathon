'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RegisterForm = ({ onToggleMode, onSuccess }) => {
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setError(null);
      
      if (data.password !== data.confirmPassword) {
        setError('পাসওয়ার্ড মিলছে না');
        return;
      }

      await registerUser(data);
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'নিবন্ধন করতে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="w-full p-8">
      <div>
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">নতুন অ্যাকাউন্ট</h2>
          <p className="text-gray-600">কৃষি সহায়তার সাথে যুক্ত হন</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পূর্ণ নাম *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('full_name', {
                    required: 'নাম প্রয়োজন',
                    minLength: { value: 2, message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' }
                  })}
                  type="text"
                  placeholder="আপনার পূর্ণ নাম"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                    errors.full_name ? "border-red-300" : "border-gray-300"
                  )}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ইমেইল *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'ইমেইল প্রয়োজন',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'সঠিক ইমেইল ঠিকানা দিন'
                    }
                  })}
                  type="email"
                  placeholder="আপনার ইমেইল ঠিকানা"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                    errors.email ? "border-red-300" : "border-gray-300"
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ফোন নম্বর
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('phone_number')}
                    type="tel"
                    placeholder="০১৭xxxxxxxx"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  অবস্থান
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('location')}
                    type="text"
                    placeholder="জেলা/উপজেলা"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                কৃষি অভিজ্ঞতা
              </label>
              <select
                {...register('farming_experience')}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">অভিজ্ঞতা নির্বাচন করুন</option>
                <option value="beginner">নতুন (০-২ বছর)</option>
                <option value="intermediate">মধ্যম (৩-৭ বছর)</option>
                <option value="experienced">অভিজ্ঞ (৮-১৫ বছর)</option>
                <option value="expert">বিশেষজ্ঞ (১৫+ বছর)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'পাসওয়ার্ড প্রয়োজন',
                    minLength: {
                      value: 6,
                      message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="আপনার পাসওয়ার্ড"
                  className={cn(
                    "w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                    errors.password ? "border-red-300" : "border-gray-300"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড নিশ্চিত করুন *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'পাসওয়ার্ড নিশ্চিত করুন',
                    validate: (value) => 
                      value === watch('password') || 'পাসওয়ার্ড মিলছে না'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  className={cn(
                    "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                    errors.confirmPassword ? "border-red-300" : "border-gray-300"
                  )}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                নিবন্ধন হচ্ছে...
              </div>
            ) : (
              'নিবন্ধন করুন'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-emerald-600 hover:text-emerald-500 font-medium"
              >
                লগইন করুন
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;