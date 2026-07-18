
import React from 'react';

interface SmartLoaderProps {
  size?: number;
  className?: string;
  showDataStream?: boolean;
}

const SmartLoader: React.FC<SmartLoaderProps> = ({ size = 24, className = "", showDataStream = false }) => {
  // Generate deterministic but varied properties for particles
  const particles = showDataStream ? [...Array(12)].map((_, i) => ({
    id: i,
    left: `${(i * 8.3) + (Math.sin(i) * 5)}%`, // Spread across width with some jitter
    delay: `${(i * 0.15) + (Math.cos(i) * 0.5)}s`,
    duration: `${1 + (Math.abs(Math.sin(i)) * 1.5)}s`,
    opacity: 0.2 + (Math.abs(Math.cos(i)) * 0.6),
    height: `${4 + (Math.abs(Math.sin(i * 2)) * 10)}px`,
    width: i % 3 === 0 ? '1px' : '2px',
  })) : [];

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Dynamic Data Stream Particles - Enhanced Version */}
      {showDataStream && (
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute bg-current rounded-full animate-[dataStream_linear_infinite]"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: p.opacity,
                height: p.height,
                width: p.width,
                top: '-20px',
                filter: 'blur(0.5px)',
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Outer Glow / Halo */}
      <div className="absolute inset-0 bg-current rounded-full blur-xl opacity-10 animate-pulse" />

      {/* Outer Rotating Rings - High Tech */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 animate-[spin_4s_linear_infinite]"
      >
        <circle 
          cx="50" cy="50" r="48" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeDasharray="4 8" 
          className="opacity-20"
        />
      </svg>
      
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 animate-[spin_2.5s_linear_infinite_reverse]"
      >
        <circle 
          cx="50" cy="50" r="40" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeDasharray="20 10" 
          className="opacity-30"
        />
      </svg>

      {/* The Pulsing Neural Core */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-full h-full bg-current rounded-full blur-[4px] animate-pulse opacity-40" />
        <div className="w-4 h-4 bg-current rounded-full shadow-[0_0_15px_currentColor] relative z-10" />
      </div>

      {/* Orbiting Scanning Segment */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 animate-[spin_1.2s_cubic-bezier(0.4,0,0.2,1)_infinite]"
      >
        <path 
          d="M 50 10 A 40 40 0 0 1 90 50" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round"
          className="drop-shadow-[0_0_5px_currentColor]"
        />
      </svg>

      <style>{`
        @keyframes dataStream {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(${size + 40}px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SmartLoader;
