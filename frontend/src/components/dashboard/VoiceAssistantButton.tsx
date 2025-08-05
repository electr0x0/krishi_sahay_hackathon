'use client';

import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

const VoiceAssistantButton = () => {
  return (
    <motion.button
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center text-white"
      aria-label="Open Voice Assistant"
    >
      <Mic className="w-8 h-8" />
    </motion.button>
  );
};

export default VoiceAssistantButton;
