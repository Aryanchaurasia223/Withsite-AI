
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface RobotGuideProps {
  message: string | null;
  variant: 'error' | 'tip' | 'success';
  onClose: () => void;
}

export const RobotGuide: React.FC<RobotGuideProps> = ({ message, variant, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      // Auto-dismiss success tips after 5 seconds, but keep errors a bit longer
      const timer = setTimeout(() => {
        handleClose();
      }, variant === 'error' ? 8000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [message, variant]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!message && !isVisible) return null;

  const isError = variant === 'error';
  const bubbleColor = isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-black text-white';

  // Light colors for antenna
  const antennaColor = isError ? "#ef4444" : "#22d3ee"; // Red or Cyan

  return (
    <div className={`fixed bottom-6 right-6 z-[90] flex flex-row-reverse items-end gap-4 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      
      {/* Robot Container */}
      <div className="relative w-24 h-24 shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 200 220" className="drop-shadow-xl filter">
            <defs>
            <linearGradient id="metalGradientGuide" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e4e4e7', stopOpacity: 1 }} />
            </linearGradient>
            </defs>

            {/* Body Group - Animate based on variant */}
            <g className={isError ? "animate-wiggle" : "animate-float"}>
                {/* Legs */}
                <rect x="75" y="160" width="12" height="35" rx="6" fill="#a1a1aa" />
                <rect x="115" y="160" width="12" height="35" rx="6" fill="#a1a1aa" />

                {/* Body */}
                <rect x="50" y="110" width="100" height="70" rx="30" fill="url(#metalGradientGuide)" stroke="#d4d4d8" strokeWidth="2" />
                
                {/* Logo */}
                <circle cx="100" cy="145" r="15" className="fill-zinc-800" />
                <text x="100" y="150" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Ws</text>

                {/* Head Group */}
                <g transform="translate(0, -10)">
                    <rect x="85" y="105" width="30" height="20" fill="#71717a" />
                    <rect x="40" y="30" width="120" height="90" rx="45" fill="white" stroke={isError ? "#fca5a5" : "#d4d4d8"} strokeWidth="2" />
                    
                    {/* Antenna */}
                    <line x1="100" y1="30" x2="100" y2="10" stroke="#71717a" strokeWidth="3" />
                    <circle 
                      cx="100" 
                      cy="10" 
                      r="6" 
                      fill={antennaColor} 
                      className="animate-pulse" 
                      style={{ filter: `drop-shadow(0 0 6px ${antennaColor})` }}
                    />

                    {/* Face */}
                    <g className="origin-[100px_70px]">
                        {isError ? (
                            // Error Expression
                            <g>
                                <line x1="65" y1="55" x2="85" y2="65" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
                                <line x1="135" y1="55" x2="115" y2="65" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
                                <circle cx="75" cy="75" r="8" fill="#18181b" />
                                <circle cx="125" cy="75" r="8" fill="#18181b" />
                                <path d="M85 100 Q 100 90 115 100" stroke="#18181b" strokeWidth="3" fill="none" />
                            </g>
                        ) : (
                            // Happy Expression
                            <g className="animate-blink">
                                <ellipse cx="75" cy="70" rx="10" ry="14" fill="#18181b" />
                                <circle cx="78" cy="66" r="3" fill="white" />
                                <ellipse cx="125" cy="70" rx="10" ry="14" fill="#18181b" />
                                <circle cx="128" cy="66" r="3" fill="white" />
                                <path d="M85 92 Q 100 100 115 92" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
                            </g>
                        )}
                    </g>
                </g>

                {/* Arms */}
                {isError ? (
                     <g>
                        <path d="M50 135 L 30 115" stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" />
                        <path d="M150 135 L 170 115" stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" />
                     </g>
                ) : (
                    <g>
                        {/* Left Arm - Pointing Left to Bubble */}
                        <path d="M50 135 Q 25 155 5 135" stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" fill="none" />
                        <circle cx="5" cy="135" r="6" fill="white" stroke="#d4d4d8" strokeWidth="2" />
                        
                        {/* Right Arm - Pointing Left to Bubble */}
                        <path d="M150 135 Q 115 155 85 135" stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" fill="none" />
                        <circle cx="85" cy="135" r="6" fill="white" stroke="#d4d4d8" strokeWidth="2" />
                    </g>
                )}
            </g>
        </svg>
      </div>

      {/* Speech Bubble */}
      <div className={`relative max-w-[250px] p-4 rounded-2xl rounded-br-none shadow-lg border animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 ${bubbleColor} ${isError ? 'border-red-200' : 'border-zinc-800 dark:border-zinc-700'}`}>
         <button onClick={handleClose} className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity">
            <X size={12} />
         </button>
         <h4 className="font-bold text-xs mb-1 uppercase tracking-wider">{isError ? "Oops!" : "Guide"}</h4>
         <p className="text-sm font-medium leading-relaxed">
            {message}
         </p>
         {/* Bubble Tail - Positioned on Right Side pointing to Robot */}
         <div className={`absolute -bottom-2 right-0 w-4 h-4 -translate-x-4 rotate-45 transform border-b border-r ${isError ? 'bg-red-50 border-red-200' : 'bg-black border-zinc-800'}`}></div>
      </div>

    </div>
  );
};
