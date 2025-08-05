'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LoginForm = ({ onToggleMode, onSuccess }) => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setError(null);
      await login(data);
      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'লগইন করতে সমস্যা হয়েছে');
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
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">স্বাগতম!</h2>
          <p className="text-gray-600">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
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
                ইমেইল
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                পাসওয়ার্ড
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
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                লগইন হচ্ছে...
              </div>
            ) : (
              'লগইন করুন'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              অ্যাকাউন্ট নেই?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-green-600 hover:text-green-500 font-medium"
              >
                নিবন্ধন করুন
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;