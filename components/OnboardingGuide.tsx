
import React from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, ArrowRight, Briefcase, ShoppingBag, Smartphone, Rocket } from 'lucide-react';

interface GuideProps {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  totalSteps: number;
}

export const OnboardingGuide: React.FC<GuideProps> = ({ step, onNext, onPrev, onClose, totalSteps }) => {
  const steps = [
    {
      title: "Welcome to WithSite AI",
      desc: "Let's create your professional business app in just a few minutes. This guide will walk you through the essential steps.",
      position: "center"
    },
    {
      title: "1. Brand Identity",
      desc: "Start here. Upload your logo, set your business name, and choose your industry to customize the AI's output.",
      position: "left-top"
    },
    {
      title: "2. Add Products",
      desc: "Build your catalogue. Add products, upload photos, and use our AI tools to write descriptions and enhance images.",
      position: "left-mid"
    },
    {
      title: "3. Live Preview",
      desc: "Watch your app come to life instantly. The mobile preview on the right updates as you type.",
      position: "right-center"
    },
    {
      title: "4. Generate App",
      desc: "When you're ready, click here to generate your website and download the native Android APK package.",
      position: "bottom-left"
    }
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  // Dynamic positioning classes for the card
  const getPositionClass = (pos: string) => {
    switch(pos) {
      case 'center': 
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'left-top': 
        // Points to top of editor panel
        return 'top-32 left-4 md:left-[100px] md:translate-x-0'; 
      case 'left-mid': 
        // Points to products section area
        return 'top-1/2 left-4 md:left-[100px] -translate-y-1/2';
      case 'right-center': 
        // Points to preview
        return 'top-1/2 right-4 md:right-[25%] -translate-y-1/2';
      case 'bottom-left': 
        // Points to generate button
        return 'bottom-24 left-4 md:left-[100px]';
      default: 
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  // Pulse animation positioning for the "target" indicator
  const getTargetClass = (pos: string) => {
    switch(pos) {
      case 'center': return 'hidden';
      case 'left-top': return 'top-20 md:left-[225px] left-1/2';
      case 'left-mid': return 'top-1/2 md:left-[225px] left-1/2';
      case 'right-center': return 'top-1/2 md:right-[15%] right-4';
      case 'bottom-left': return 'bottom-10 md:left-[225px] left-1/2';
      default: return 'hidden';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px] transition-all duration-500">
       
       {/* Target Indicator (Pulse) */}
       {current.position !== 'center' && (
           <div className={`absolute ${getTargetClass(current.position)} -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500`}>
               <span className="relative flex h-12 w-12">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-12 w-12 border-4 border-white"></span>
                </span>
           </div>
       )}

       {/* Guide Card */}
       {step === 0 ? (
          // SPECIAL ATTRACTIVE WELCOME CARD
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative animate-in zoom-in-95 duration-300">
                  {/* Background gradient */}
                  <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-purple-50/80 to-transparent dark:from-purple-900/20 pointer-events-none" />
                  
                  <button onClick={onClose} className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors z-20">
                    <X size={20} />
                  </button>

                  <div className="flex flex-col items-center p-8 pt-10 text-center relative z-10">
                      {/* Robot SVG */}
                      <div className="w-28 h-28 mb-4 relative">
                          <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-lg">
                              <defs>
                                <linearGradient id="guideMetalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#e4e4e7', stopOpacity: 1 }} />
                                </linearGradient>
                              </defs>
                              <g className="animate-float">
                                  {/* Body */}
                                  <rect x="50" y="110" width="100" height="70" rx="30" fill="url(#guideMetalGradient)" stroke="#d4d4d8" strokeWidth="2" />
                                  <circle cx="100" cy="145" r="15" className="fill-zinc-800" />
                                  <text x="100" y="150" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Ws</text>
                                  {/* Legs */}
                                  <rect x="75" y="160" width="12" height="35" rx="6" fill="#a1a1aa" />
                                  <rect x="115" y="160" width="12" height="35" rx="6" fill="#a1a1aa" />
                                  {/* Head */}
                                  <g transform="translate(0, -10)">
                                      <rect x="85" y="105" width="30" height="20" fill="#71717a" />
                                      <rect x="40" y="30" width="120" height="90" rx="45" fill="white" stroke="#d4d4d8" strokeWidth="2" />
                                      <line x1="100" y1="30" x2="100" y2="10" stroke="#71717a" strokeWidth="3" />
                                      {/* Glowing Antenna */}
                                      <circle 
                                        cx="100" 
                                        cy="10" 
                                        r="6" 
                                        fill="#c084fc" 
                                        className="animate-pulse" 
                                        style={{ filter: 'drop-shadow(0 0 8px #c084fc)' }}
                                      />
                                      {/* Face */}
                                      <g className="animate-blink origin-[100px_70px]">
                                          <ellipse cx="75" cy="70" rx="10" ry="14" fill="#18181b" />
                                          <circle cx="78" cy="66" r="3" fill="white" />
                                          <ellipse cx="125" cy="70" rx="10" ry="14" fill="#18181b" />
                                          <circle cx="128" cy="66" r="3" fill="white" />
                                          <path d="M85 92 Q 100 100 115 92" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
                                      </g>
                                  </g>
                                  {/* Waving Arm */}
                                  <g className="animate-wave origin-[50px_135px]">
                                      <path d="M50 135 Q 35 115 35 95" stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" fill="none" />
                                      <circle cx="35" cy="95" r="6" fill="white" stroke="#d4d4d8" strokeWidth="2" />
                                  </g>
                                  {/* Other Arm */}
                                  <g>
                                      <path d="M150 135 L 170 155" stroke="#d4d4d8" strokeWidth="6" strokeLinecap="round" />
                                      <circle cx="170" cy="155" r="6" fill="white" stroke="#d4d4d8" strokeWidth="2" />
                                  </g>
                              </g>
                          </svg>
                      </div>

                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Hi there! I'm WithSite.</h2>
                      <p className="text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed text-sm">
                          I'll help you build a professional store app in minutes.
                      </p>

                      {/* Visual Process Roadmap */}
                      <div className="w-full mb-8 relative px-2">
                          {/* Connecting Line */}
                          <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10"></div>
                          
                          <div className="flex justify-between items-center">
                             {[
                                 { label: "Identity", icon: Briefcase },
                                 { label: "Products", icon: ShoppingBag },
                                 { label: "Preview", icon: Smartphone },
                                 { label: "Launch", icon: Rocket }
                             ].map((item, idx) => (
                                 <div key={idx} className="flex flex-col items-center gap-2 group cursor-default">
                                     <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-purple-200 group-hover:text-purple-500 transition-colors shadow-sm z-10">
                                         <item.icon size={16} />
                                     </div>
                                     <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors">{item.label}</span>
                                 </div>
                             ))}
                          </div>
                      </div>

                      <button 
                        onClick={onNext}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2 group"
                      >
                         Start Tour <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
       ) : (
          <div className={`absolute ${getPositionClass(current.position)} transition-all duration-500 max-w-[90vw]`}>
              <div className="bg-white dark:bg-zinc-900 w-full md:w-80 p-6 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 relative animate-in zoom-in-95 duration-300">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <X size={16} />
                </button>
                
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-purple-600' : 'w-1.5 bg-zinc-200 dark:bg-zinc-700'}`} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">{current.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {current.desc}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                    <button 
                      onClick={onPrev} 
                      disabled={step === 0}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors ${step === 0 ? 'text-zinc-200 dark:text-zinc-800 cursor-not-allowed' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                        <ChevronLeft size={14} /> Back
                    </button>
                    
                    <button 
                      onClick={isLast ? onClose : onNext}
                      className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
                    >
                        {isLast ? "Get Started" : "Next Step"} {isLast ? <Check size={14}/> : <ChevronRight size={14}/>}
                    </button>
                </div>
              </div>
          </div>
       )}
    </div>
  );
};
