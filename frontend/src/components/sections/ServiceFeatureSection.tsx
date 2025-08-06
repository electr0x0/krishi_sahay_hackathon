'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";

interface ServiceFeatureProps {
  title: string;
  description: string;
  features: string[];
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

const ServiceFeatureSection = ({
  title,
  description,
  features,
  imageSrc,
  imageAlt,
  reverse = false
}: ServiceFeatureProps) => {
  return (
    <div className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={reverse ? 'lg:col-start-2' : ''}
      >
        <h3 className="text-3xl font-bold text-slate-800 mb-6">{title}</h3>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">{description}</p>
        
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start"
            >
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-300 flex items-center"
        >
          আরও জানুন
          <ArrowRight className="w-4 h-4 ml-2" />
        </motion.button>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`relative ${reverse ? 'lg:col-start-1' : ''}`}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Floating elements for visual interest */}
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            নতুন
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-100 rounded-full -z-10 opacity-60" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-100 rounded-full -z-10 opacity-40" />
      </motion.div>
    </div>
  );
};

export default ServiceFeatureSection;
