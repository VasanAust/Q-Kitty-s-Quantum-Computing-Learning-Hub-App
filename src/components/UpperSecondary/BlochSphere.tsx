import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export const GATE_BLOCH_STATES: Record<string, { theta: number, phi: number }> = {
  '|0⟩': { theta: 0, phi: 0 },
  '|1⟩': { theta: Math.PI, phi: 0 },
  '|+⟩': { theta: Math.PI / 2, phi: 0 },
  '|-⟩': { theta: Math.PI / 2, phi: Math.PI },
  '|i⟩': { theta: Math.PI / 2, phi: Math.PI / 2 },
  '|-i⟩': { theta: Math.PI / 2, phi: -Math.PI / 2 },
};

interface BlochSphereProps {
  qubitState: { theta: number, phi: number };
}

function WebGLFallback({ theta, phi }: { theta: number, phi: number }) {
  // Simple 2D SVG alternative when WebGL fails
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.cos(theta);
  
  // Project to 2D
  const px = 160 + x * 80;
  const py = 160 - y * 80;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1117] p-8">
      <div className="text-rose-400 text-[10px] font-bold mb-4 uppercase tracking-widest opacity-60">
        3D Acceleration Unavailable - Showing 2D Projection
      </div>
      <svg width="240" height="240" viewBox="0 0 320 320" className="drop-shadow-[0_0_15px_rgba(30,58,95,0.3)]">
        {/* Sphere grid */}
        <circle cx="160" cy="160" r="100" fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />
        <ellipse cx="160" cy="160" rx="100" ry="30" fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Axes */}
        <line x1="160" y1="40" x2="160" y2="280" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
        <line x1="40" y1="160" x2="280" y2="160" stroke="#ef4444" strokeWidth="1" opacity="0.3" />
        
        {/* State Vector */}
        <line x1="160" y1="160" x2={px} y2={py} stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
        <circle cx={px} cy={py} r="6" fill="#4ade80" className="animate-pulse shadow-[0_0_10px_#4ade80]" />
        
        {/* Labels */}
        <text x="160" y="30" textAnchor="middle" fill="#3b82f6" className="text-xs font-mono">|0⟩</text>
        <text x="160" y="300" textAnchor="middle" fill="#3b82f6" className="text-xs font-mono">|1⟩</text>
        <text x={px + 15} y={py} fill="#4ade80" className="text-sm font-bold">|ψ⟩</text>
      </svg>
      <div className="mt-4 text-slate-500 text-[10px] max-w-[200px] text-center italic">
        Tip: Try enabling Hardware Acceleration in your browser settings for the full 3D experience.
      </div>
    </div>
  );
}

function StateVector({ theta, phi }: { theta: number, phi: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const targetX = Math.sin(theta) * Math.cos(phi);
  const targetY = Math.cos(theta);
  const targetZ = Math.sin(theta) * Math.sin(phi);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
    }
  });

  const currentPos = meshRef.current?.position || new THREE.Vector3(targetX, targetY, targetZ);

  return (
    <>
      <Line
        points={[[0, 0, 0], [currentPos.x, currentPos.y, currentPos.z]]}
        color="#4ade80"
        lineWidth={3}
      />
      <mesh ref={meshRef} position={[targetX, targetY, targetZ]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial emissive="#4ade80" emissiveIntensity={1.5} color="#4ade80" />
        <Html distanceFactor={6} position={[0.1, 0.1, 0]}>
          <div className="text-emerald-400 font-bold text-xl pointer-events-none drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">|ψ⟩</div>
        </Html>
      </mesh>
    </>
  );
}

export default function BlochSphere({ qubitState }: BlochSphereProps) {
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglAvailable(false);
    }
  }, []);

  if (!webglAvailable) {
    return (
      <div className="w-full h-[320px] bg-[#0d1117] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
        <WebGLFallback theta={qubitState.theta} phi={qubitState.phi} />
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] bg-[#0d1117] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <Canvas 
        camera={{ position: [2.5, 1.5, 2.5], fov: 40 }}
        gl={{ 
          antialias: false, 
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false 
        }}
        onCreated={({ gl }) => {
          // If context lost or creation fails during initialization
          if (!gl.getContext()) setWebglAvailable(false);
        }}
        onError={(e) => {
          console.warn("Canvas error:", e);
          setWebglAvailable(false);
        }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <OrbitControls 
          enablePan={false} 
          minDistance={2} 
          maxDistance={6} 
          autoRotate={false}
        />

        {/* Outer wireframe sphere */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#1e3a5f" wireframe transparent opacity={0.2} />
        </mesh>

        {/* Inner solid sphere */}
        <mesh>
          <sphereGeometry args={[0.99, 32, 32]} />
          <meshStandardMaterial color="#0a1628" opacity={0.4} transparent metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Axis lines */}
        <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#3b82f6" lineWidth={2} opacity={0.5} transparent />
        <Html position={[0, 1.2, 0]}>
          <div className="text-blue-400 font-mono text-sm font-bold bg-slate-900/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-blue-500/30">|0⟩</div>
        </Html>
        <Html position={[0, -1.2, 0]}>
          <div className="text-blue-400 font-mono text-sm font-bold bg-slate-900/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-blue-500/30">|1⟩</div>
        </Html>

        <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="#ef4444" lineWidth={2} opacity={0.5} transparent />
        <Html position={[1.2, 0, 0]}>
          <div className="text-red-400 font-mono text-sm font-bold bg-slate-900/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-red-500/30">|+⟩</div>
        </Html>
        <Html position={[-1.2, 0, 0]}>
          <div className="text-red-400 font-mono text-sm font-bold bg-slate-900/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-red-500/30">|-⟩</div>
        </Html>

        <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="#22c55e" lineWidth={2} opacity={0.5} transparent />

        <StateVector theta={qubitState.theta} phi={qubitState.phi} />
      </Canvas>
    </div>
  );
}

