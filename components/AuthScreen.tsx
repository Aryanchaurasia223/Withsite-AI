
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2, ChevronLeft, ShieldCheck, RefreshCw, CheckCircle2, Sparkles, Sun, Moon } from "lucide-react";

interface AuthScreenProps {
  onLogin: (phone: string, name: string) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, isDarkMode, onToggleTheme }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  
  // OTP State for 4 digits
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  useEffect(() => {
      if (step === 'otp') {
          setTimeout(() => otpRefs.current[0]?.focus(), 500);
      }
  }, [step]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Enter a valid 10-digit number");
      return;
    }
    if (!fullName.trim()) {
        setError("Please enter your name");
        return;
    }

    setError("");
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setResendCooldown(60);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 4) {
      setError("Enter the 4-digit code");
      return;
    }
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onLogin(phone, fullName || "Merchant");
      }, 1500);
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      
      const newOtp = [...otp];
      newOtp[index] = value.substring(value.length - 1);
      setOtp(newOtp);
      setError("");

      if (value && index < 3) {
          otpRefs.current[index + 1]?.focus();
      }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          otpRefs.current[index - 1]?.focus();
      }
  };

  const handleResendOtp = () => {
    setResendCooldown(60);
    setError("");
  };

  // Shared Abstract Background Component
  const AbstractBackground = () => (
    <div className="absolute inset-0 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-zinc-950"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Dark Mode Toggle - Responsive Positioning & Styling */}
      {onToggleTheme && (
        <button 
          onClick={onToggleTheme}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 md:bg-zinc-100 md:dark:bg-zinc-800 backdrop-blur-md text-white md:text-zinc-900 md:dark:text-white border border-white/10 md:border-transparent hover:scale-110 transition-all shadow-lg"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}

      {/* DESKTOP LEFT PANEL / MOBILE HEADER */}
      <div className="relative w-full md:w-1/2 h-[35%] md:h-full bg-zinc-950 text-white flex flex-col p-6 md:p-12 overflow-hidden shrink-0">
          <AbstractBackground />

          {/* Brand Header - Top Left */}
          <div className="relative z-10 flex items-center gap-3 mb-auto md:mb-0">
               <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-full flex items-center justify-center text-black font-serif font-bold italic text-sm md:text-lg shadow-2xl shadow-purple-900/20 cursor-pointer hover:scale-110 hover:rotate-6 transition-all duration-300 hover:shadow-purple-500/40">Ws</div>
               <span className="font-bold text-lg md:text-xl tracking-tight">WithSite AI</span>
          </div>
          
          <div className="relative z-10 w-full max-w-lg mx-auto md:mx-0 flex flex-col items-center md:items-start text-center md:text-left justify-center flex-1">
              <h1 className="text-3xl md:text-6xl font-bold tracking-tight mb-4 md:mb-8 leading-tight">
                  Build Your <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 animate-pulse">Dream Digital Empire</span>
              </h1>
              
              <p className="text-zinc-400 text-xs md:text-lg leading-relaxed mb-4 md:mb-12 max-w-sm md:max-w-md">
                  Launch your professional mobile app and website in minutes with our AI-powered platform. No coding required.
              </p>
          </div>

          {/* Stats - Desktop Only */}
          <div className="hidden md:flex relative z-10 gap-8 border-t border-zinc-800 pt-8 mt-auto w-full">
              <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-white">10k+</span>
                  <span className="text-sm text-zinc-500 uppercase tracking-wider">Merchants</span>
              </div>
              <div className="w-px bg-zinc-800 h-full"></div>
              <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-white">4.9</span>
                  <span className="text-sm text-zinc-500 uppercase tracking-wider">Rating</span>
              </div>
          </div>
      </div>

      {/* RIGHT PANEL: Form (Desktop) / BOTTOM SHEET (Mobile) */}
      <div className="w-full md:w-1/2 h-[65%] md:h-full relative z-10 bg-white dark:bg-black flex flex-col -mt-6 md:mt-0 rounded-t-3xl md:rounded-none overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-none">
         <div className="flex-1 flex flex-col justify-center px-6 md:px-24 w-full max-w-xl mx-auto py-8 md:py-10 overflow-y-auto hide-scrollbar">
             
             {/* Header Section */}
             <div className="mb-8 md:mb-10 animate-in slide-in-from-bottom-5 duration-500">
                 {step === 'otp' && (
                     <button 
                         onClick={() => { setStep('phone'); setIsSuccess(false); }}
                         className="mb-6 md:mb-8 flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white text-xs font-bold uppercase tracking-widest transition-colors group"
                     >
                         <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                         Back
                     </button>
                 )}

                 <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3 text-zinc-900 dark:text-white">
                     {isSuccess ? (
                         <span className="text-green-600 dark:text-green-500 flex items-center gap-2 md:gap-3">
                             Success <CheckCircle2 size={32} className="animate-bounce" />
                         </span>
                     ) : step === 'phone' ? (
                         "Get Started"
                     ) : (
                         "Verification"
                     )}
                 </h2>
                 
                 <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-lg">
                     {step === 'phone' 
                        ? "Enter your details to create your store." 
                        : <span className="flex items-center gap-2">Code sent to <span className="text-black dark:text-white font-bold font-mono">+91 {phone}</span></span>
                     }
                 </p>
             </div>

             {/* Dynamic Form Area */}
             <div className="animate-in slide-in-from-bottom-5 duration-700 delay-100">
                 {step === 'phone' ? (
                     <form onSubmit={handleSendOtp} className="space-y-5">
                         <div className="space-y-4">
                             <div className="space-y-1.5">
                                 <label className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                                 <input 
                                     value={fullName}
                                     onChange={(e) => setFullName(e.target.value)}
                                     className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-base md:text-lg font-bold outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 placeholder:font-normal"
                                     placeholder="e.g. Rahul Verma"
                                 />
                             </div>

                             <div className="space-y-1.5">
                                 <label className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Phone Number</label>
                                 <div className="relative">
                                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold select-none">+91</span>
                                     <input 
                                         type="tel"
                                         inputMode="numeric"
                                         value={phone}
                                         onChange={(e) => {
                                             const val = e.target.value.replace(/\D/g, '');
                                             if (val.length <= 10) setPhone(val);
                                         }}
                                         className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 text-base md:text-lg font-bold outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 tracking-widest placeholder:font-normal"
                                         placeholder="98765 00000"
                                     />
                                 </div>
                             </div>
                         </div>

                         {error && (
                            <div className="text-red-500 text-xs md:text-sm font-bold flex items-center gap-2 animate-pulse bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                         )}

                         <button 
                             type="submit"
                             disabled={isLoading}
                             className="w-full bg-black dark:bg-white text-white dark:text-black h-12 md:h-14 rounded-xl font-bold text-sm md:text-base hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                         >
                             {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                         </button>
                         
                         <p className="text-[10px] md:text-xs text-center text-zinc-400 mt-6 leading-relaxed">
                            By clicking continue, you agree to our <a href="#" className="underline hover:text-black dark:hover:text-white">Terms</a> and <a href="#" className="underline hover:text-black dark:hover:text-white">Privacy</a>.
                         </p>
                     </form>
                 ) : (
                     <div className="space-y-6 md:space-y-8">
                         <div className="flex gap-3 justify-between px-2 md:px-0">
                             {otp.map((digit, idx) => (
                                 <div key={idx} className="flex-1 aspect-[4/5] max-w-[70px] md:max-w-[80px]">
                                     <input
                                         ref={el => { otpRefs.current[idx] = el }}
                                         type="text"
                                         inputMode="numeric"
                                         maxLength={1}
                                         value={digit}
                                         onChange={(e) => handleOtpChange(idx, e.target.value)}
                                         onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                         className={`
                                            w-full h-full text-center text-2xl md:text-3xl font-bold 
                                            bg-zinc-50 dark:bg-zinc-900 
                                            border-2 rounded-2xl outline-none transition-all caret-purple-600
                                            ${digit ? 'border-black dark:border-white text-black dark:text-white scale-100 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 text-zinc-900 scale-95'}
                                            focus:border-black dark:focus:border-white focus:scale-105 focus:shadow-xl focus:z-10
                                         `}
                                     />
                                 </div>
                             ))}
                         </div>
                         
                         <div className="space-y-4">
                             {error && (
                                 <div className="text-center text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/10 py-2 rounded-lg">
                                    {error}
                                 </div>
                             )}

                             <button 
                                 onClick={handleVerifyOtp}
                                 disabled={isLoading || isSuccess}
                                 className={`
                                    w-full h-12 md:h-14 rounded-xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 shadow-lg 
                                    ${isSuccess 
                                        ? 'bg-green-500 text-white cursor-default' 
                                        : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-[0.99]'
                                    }
                                    disabled:opacity-90
                                 `}
                             >
                                 {isLoading ? (
                                     <Loader2 className="animate-spin" /> 
                                 ) : isSuccess ? (
                                     "Verified Successfully"
                                 ) : (
                                     <>Verify Account <ShieldCheck size={18} /></>
                                 )}
                             </button>
                             
                             {!isSuccess && (
                                 <button 
                                     onClick={handleResendOtp}
                                     disabled={resendCooldown > 0}
                                     className="w-full py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                 >
                                     {resendCooldown > 0 ? (
                                         <span>Resend in 00:{resendCooldown.toString().padStart(2, '0')}</span>
                                     ) : (
                                         <><RefreshCw size={12} /> Resend OTP</>
                                     )}
                                 </button>
                             )}
                         </div>
                     </div>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};
