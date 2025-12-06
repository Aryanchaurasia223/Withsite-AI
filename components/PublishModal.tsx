
import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Copy, Share2, Smartphone, Download, Globe, QrCode, Loader2, Check, ExternalLink } from 'lucide-react';

interface PublishModalProps {
  businessName: string;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ businessName, onClose }) => {
  const [step, setStep] = useState<'building' | 'live'>('building');
  const [progress, setProgress] = useState(0);
  const [copiedApp, setCopiedApp] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  // Robust safe name generation (matches App.tsx)
  const safeName = (businessName || "store")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        // Get the current URL without query parameters to ensure we stay on the current domain
        const url = window.location.href.split('?')[0];
        setBaseUrl(url);
    }
  }, []);
  
  // Functional links
  const webLink = `${baseUrl}?store=${safeName}`;

  useEffect(() => {
    if (step === 'building') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('live');
            return 100;
          }
          return prev + 1.5; // Simulate build time
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedApp(true);
    setTimeout(() => setCopiedApp(false), 2000);
  };

  const handleDownloadApk = () => {
    // Simulate APK download logic
    const element = document.createElement("a");
    const file = new Blob([`Mock APK content for ${businessName}\nVersion: 1.0.0`], {type: 'application/vnd.android.package-archive'});
    element.href = URL.createObjectURL(file);
    element.download = `${safeName}.apk`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            {step === 'building' ? <Loader2 className="animate-spin text-purple-600" /> : <span className="text-2xl">🎉</span>}
            {step === 'building' ? 'Generating Link...' : 'Link Ready!'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {step === 'building' ? (
             <div className="py-8 text-center space-y-8">
                 <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f4f4f5" strokeWidth="8" className="dark:stroke-zinc-800" />
                      <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="8" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * progress / 100)} 
                        strokeLinecap="round" 
                        className="transition-all duration-75 ease-linear" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-black text-2xl text-zinc-900 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-zinc-900 dark:text-white font-bold animate-pulse">Creating Web Link...</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">Optimizing assets & generating unique URL</p>
                 </div>
             </div>
          ) : (
             <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Status Banner */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-4 rounded-2xl flex items-start gap-3">
                   <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full text-green-600 dark:text-green-300 shrink-0">
                      <CheckCircle size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-green-800 dark:text-green-300 text-sm mb-1">Web Link Generated</h4>
                      <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                        Your store is now accessible on the web. Share the link below with your customers.
                      </p>
                   </div>
                </div>

                {/* Primary Web Link */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Store Web Link</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 overflow-hidden">
                            <Globe size={18} className="text-purple-500 shrink-0" />
                            <a href={webLink} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 truncate select-all hover:underline hover:text-purple-600">
                                {webLink}
                            </a>
                        </div>
                        <a href={webLink} target="_blank" rel="noopener noreferrer" className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 p-3 rounded-xl transition-colors shrink-0" title="Open Link">
                            <ExternalLink size={20} />
                        </a>
                        <button onClick={() => copyToClipboard(webLink)} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 p-3 rounded-xl transition-colors shrink-0" title="Copy">
                            {copiedApp ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                        </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 px-1">
                        Customers can use this link to view your website and install the mobile app.
                    </p>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* QR Code */}
                        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                            <div className="bg-white p-2 rounded-lg border border-zinc-100">
                               <QrCode size={48} className="text-black" />
                            </div>
                            <span className="text-[10px] font-bold uppercase text-zinc-400">Scan to Open</span>
                        </div>
                        
                        {/* Download Button */}
                        <button 
                            onClick={handleDownloadApk}
                            className="bg-black dark:bg-white text-white dark:text-black rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg group"
                        >
                            <div className="bg-white/20 dark:bg-black/10 p-2 rounded-full">
                                <Download size={24} className="group-hover:animate-bounce" />
                            </div>
                            <span className="text-xs font-bold">Download App APK</span>
                        </button>
                    </div>
                </div>

             </div>
          )}
        </div>
      </div>
    </div>
  );
};
