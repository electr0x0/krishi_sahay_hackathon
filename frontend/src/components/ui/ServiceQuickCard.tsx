'use client';

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { FloatingCard } from "@/components/ui/aceternity";

interface ServiceQuickCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
  onAction?: () => void;
}

const ServiceQuickCard = ({ 
  title, 
  description, 
  price, 
  features, 
  popular = false,
  ctaText = "শুরু করুন",
  onAction 
}: ServiceQuickCardProps) => {
  return (
    <FloatingCard className={`p-10 relative ${popular ? 'ring-2 ring-green-500' : ''}`}>
      {popular && (
        <div className="absolute -top-3 pt-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Star className="w-3 h-3 mr-1" />
            জনপ্রিয়
          </div>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-4">{description}</p>
        <div className="text-3xl font-bold text-green-600 mb-2">{price}</div>
        {price !== "বিনামূল্যে" && (
          <div className="text-sm text-slate-500">প্রতি মাসে</div>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-slate-700">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            {feature}
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className={`w-full py-3 px-4 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center ${
          popular 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
        }`}
      >
        {ctaText}
        <ArrowRight className="w-4 h-4 ml-2" />
      </motion.button>
    </FloatingCard>
  );
};

export default ServiceQuickCard;
