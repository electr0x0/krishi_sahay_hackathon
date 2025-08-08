'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';


// Dynamically import the Map component to avoid SSR issues
import dynamic from 'next/dynamic';
const MapEditor = dynamic(() => import('@/components/dashboard/MapEditor'), { ssr: false });

const ProfilePage = () => {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            // Ensure user object is available before fetching
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const profileData = await api.getProfile();
                setProfile(profileData);
                setFormData({
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                    latitude: profileData.latitude,
                    longitude: profileData.longitude,
                });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!authLoading) {
            fetchProfile();
        }
    }, [user, authLoading]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMapChange = ({ lat, lng }) => {
        setFormData({ ...formData, latitude: lat, longitude: lng });
    };

    const handleSave = async () => {
        try {
            const updatedProfile = await api.updateProfile(formData);
            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    if (isLoading || authLoading) {
        return <div className="text-center p-10">প্রোফাইল লোড হচ্ছে...</div>;
    }

    if (!profile) {
        return <div className="text-center p-10 text-red-500">প্রোফাইল খুঁজে পাওয়া যায়নি।</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg"
        >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h1 className="text-3xl font-bold text-gray-800">আমার প্রোফাইল</h1>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                        <Edit size={16} /> সম্পাদনা করুন
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                            <Save size={16} /> সংরক্ষণ করুন
                        </button>
                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                            <X size={16} /> বাতিল
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Info */}
                <div className="space-y-4">
                    <InfoField icon={User} label="পুরো নাম" value={profile.full_name} isEditing={isEditing} name="full_name" onChange={handleInputChange} />
                    <InfoField icon={Mail} label="ইমেইল" value={profile.email} />
                    <InfoField icon={Phone} label="ফোন নম্বর" value={profile.phone} isEditing={isEditing} name="phone" onChange={handleInputChange} />
                    <InfoField icon={MapPin} label="অবস্থান" value={formData.latitude && formData.longitude ? `${Number(formData.latitude).toFixed(4)}, ${Number(formData.longitude).toFixed(4)}` : 'নির্ধারণ করা হয়নি'} />
                </div>

                {/* Map View/Editor */}
                <div className="rounded-lg overflow-hidden h-64 md:h-auto">
                    {isEditing ? (
                        <MapEditor
                            lat={formData.latitude || 23.8103}
                            lng={formData.longitude || 90.4125}
                            onLocationChange={handleMapChange}
                        />
                    ) : (
                         <MapEditor
                            lat={profile.latitude || 23.8103}
                            lng={profile.longitude || 90.4125}
                            isDraggable={false}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const InfoField = ({ icon: Icon, label, value, isEditing = false, name, onChange }) => (
    <div>
        <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-1">
            <Icon size={16} /> {label}
        </label>
        {isEditing && (name === 'full_name' || name === 'phone') ? (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full p-2 border rounded-lg"
            />
        ) : (
            <p className="text-lg text-gray-800 p-2">{value || 'N/A'}</p>
        )}
    </div>
);

export default ProfilePage;
