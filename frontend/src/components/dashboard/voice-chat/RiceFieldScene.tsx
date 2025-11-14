'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Individual rice plant component
function RicePlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle swaying motion like wind
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Stem */}
      <mesh ref={meshRef} position={[0, 0.5 * scale, 0]}>
        <cylinderGeometry args={[0.02 * scale, 0.03 * scale, 1 * scale, 8]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      {/* Rice grain cluster */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 1 * scale, 0]}>
          <sphereGeometry args={[0.08 * scale, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

// Rice field grid
function RiceField() {
  const plants = useMemo(() => {
    const temp = [];
    const gridSize = 15;
    const spacing = 0.4;
    
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        // Add some randomness to position and scale
        const randomX = x * spacing + (Math.random() - 0.5) * 0.1;
        const randomZ = z * spacing + (Math.random() - 0.5) * 0.1;
        const randomScale = 0.8 + Math.random() * 0.4;
        
        temp.push({
          position: [randomX, 0, randomZ] as [number, number, number],
          scale: randomScale,
          key: `plant-${x}-${z}`
        });
      }
    }
    return temp;
  }, []);

  return (
    <group position={[0, -1.5, 0]}>
      {plants.map((plant) => (
        <RicePlant key={plant.key} position={plant.position} scale={plant.scale} />
      ))}
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#86efac" roughness={0.8} />
      </mesh>
    </group>
  );
}

// 3D Voice Visualizer Bars
export function VoiceVisualizer3D({ isActive, amplitude = 0.5 }: { isActive: boolean; amplitude?: number }) {
  const barsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (barsRef.current && isActive) {
      barsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const scale = 0.5 + Math.sin(state.clock.elapsedTime * 2 + i) * amplitude;
        mesh.scale.y = scale;
      });
    }
  });

  const bars = useMemo(() => {
    const temp = [];
    const count = 12;
    const radius = 1.5;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      temp.push({ x, z, key: i });
    }
    return temp;
  }, []);

  return (
    <group ref={barsRef}>
      {bars.map((bar) => (
        <mesh key={bar.key} position={[bar.x, 0, bar.z]} castShadow>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <MeshWobbleMaterial 
            color="#22c55e" 
            speed={2} 
            factor={isActive ? 0.3 : 0}
            emissive="#10b981"
            emissiveIntensity={isActive ? 0.5 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}

// Animated microphone 3D model
export function Microphone3D({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      if (isActive) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <Float speed={isActive ? 3 : 1} rotationIntensity={0.5} floatIntensity={isActive ? 0.8 : 0.2}>
      <group ref={groupRef}>
        {/* Mic body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
          <meshStandardMaterial 
            color={isActive ? "#22c55e" : "#64748b"} 
            metalness={0.8}
            roughness={0.2}
            emissive={isActive ? "#10b981" : "#000000"}
            emissiveIntensity={isActive ? 0.5 : 0}
          />
        </mesh>
        
        {/* Mic grille */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial 
            color="#1e293b" 
            metalness={0.9}
            roughness={0.3}
          />
        </mesh>
        
        {/* Mic stand */}
        <mesh position={[0, -0.8, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// Main scene component
export default function RiceFieldScene({ 
  isListening, 
  isSpeaking 
}: { 
  isListening: boolean; 
  isSpeaking: boolean; 
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#fbbf24" />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Rice Field */}
      <RiceField />
      
      {/* 3D Voice Visualizer */}
      <group position={[0, 0, 0]}>
        <VoiceVisualizer3D isActive={isListening || isSpeaking} amplitude={isSpeaking ? 0.8 : 0.5} />
        
        {/* Central Microphone */}
        <Microphone3D isActive={isListening} />
      </group>
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#0f172a', 5, 20]} />
    </>
  );
}

