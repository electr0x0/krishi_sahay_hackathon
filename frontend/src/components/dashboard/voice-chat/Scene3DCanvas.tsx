'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

interface Scene3DCanvasProps {
  children: React.ReactNode;
  enableControls?: boolean;
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function Scene3DCanvas({ children, enableControls = false }: Scene3DCanvasProps) {
  return (
    <Canvas
      shadows
      className="!absolute !inset-0"
      gl={{ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      }}
    >
      <Suspense fallback={null}>
        {/* Camera setup */}
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
        
        {/* Optional orbit controls for interactivity */}
        {enableControls && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        )}
        
        {/* Environment for better lighting */}
        <Environment preset="sunset" />
        
        {/* Scene content */}
        {children}
      </Suspense>
    </Canvas>
  );
}

