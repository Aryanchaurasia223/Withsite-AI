
import React, { useState, useRef } from 'react';
import { User, X, Edit2, Camera, Phone, Loader2, Shield, LogOut } from 'lucide-react';

interface ProfileModalProps {
  user: { name: string; phone: string; profileImage?: string } | null;
  onClose: () => void;
  onLogout: () => void;
  onUpdateProfile: (name: string, phone: string, profileImage?: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedPhone, setEditedPhone] = useState(user?.phone || "");
  const [editedImage, setEditedImage] = useState(user?.profileImage || "");
  
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSaveInitiate = () => {
    if (editedPhone !== user.phone) {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowOtp(true);
        }, 1500);
    } else {
        onUpdateProfile(editedName, editedPhone, editedImage);
        setIsEditing(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if (otp.length !== 4) {
          setError("Code must be 4 digits.");
          return;
      }
      setIsLoading(true);
      setError("");
      setTimeout(() => {
          setIsLoading(false);
          onUpdateProfile(editedName, editedPhone, editedImage);
          setShowOtp(false);
          setIsEditing(false);
          setOtp("");
      }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in duration-300">
      
      {/* Card Container with animated background shadow */}
      <div className="relative w-full max-w-md mx-4 group">
        
        {/* Animated Shadow/Glow Background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative bg-white dark:bg-black w-full rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Merchant Profile</h2>
                <button 
                    onClick={onClose} 
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
            
            <div className="p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group mb-5">
                        <div className="h-28 w-28 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden border-4 border-white dark:border-black shadow-lg ring-1 ring-zinc-100 dark:ring-zinc-800">
                            {(isEditing ? editedImage : user.profileImage) ? (
                                <img src={isEditing ? editedImage : user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-10 w-10 text-zinc-300" />
                            )}
                        </div>
                        {isEditing && !showOtp && (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <Camera size={24} className="text-white drop-shadow-md" />
                            </div>
                        )}
                        {/* Verified Badge */}
                        {!isEditing && (
                            <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white dark:border-black shadow-sm" title="Verified">
                                <Shield size={12} fill="currentColor" />
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>
                    
                    <div className="text-center w-full space-y-1">
                        {isEditing && !showOtp ? (
                            <input 
                                value={editedName} 
                                onChange={(e) => setEditedName(e.target.value)}
                                className="text-2xl font-bold bg-zinc-50 dark:bg-zinc-900 border-b-2 border-zinc-200 dark:border-zinc-800 w-full text-center outline-none py-2 mb-2 text-zinc-900 dark:text-white focus:border-black dark:focus:border-white rounded-lg transition-colors"
                                placeholder="Your Name"
                                autoFocus
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{user.name}</h2>
                        )}
                        
                        {!isEditing && (
                             <p className="text-sm font-medium text-zinc-500">{user.phone}</p>
                        )}
                    </div>
                </div>

                {showOtp ? (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 text-center bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Verify New Number</label>
                        <p className="text-xs text-zinc-500 mb-6">Enter the 4-digit code sent to <span className="text-zinc-900 dark:text-white font-mono">{editedPhone}</span></p>
                        <input 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="0000"
                            maxLength={4}
                            className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-black outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white transition-all shadow-sm focus:shadow-md"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-xs mt-3 font-bold flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"/>{error}</p>}
                    </div>
                    <div className="flex gap-3">
                            <button onClick={() => setShowOtp(false)} className="flex-1 py-3.5 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                            <button onClick={handleVerifyOtp} disabled={isLoading} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Confirm Change"}
                            </button>
                    </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {isEditing && (
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-4 animate-in slide-in-from-bottom-2">
                                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mb-2 block ml-1">Mobile Number</label>
                                <div className="flex items-center gap-3 bg-white dark:bg-black p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 focus-within:border-black dark:focus-within:border-white transition-colors">
                                    <Phone size={18} className="text-zinc-400" />
                                    <input 
                                        value={editedPhone}
                                        onChange={(e) => setEditedPhone(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-white font-medium"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-2">
                            {isEditing ? (
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditing(false)} className="flex-1 py-3.5 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                                    <button onClick={handleSaveInitiate} disabled={isLoading} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                                        <Edit2 size={16} className="text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" /> Edit Profile
                                    </button>
                                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-100 dark:hover:border-red-900/20 border border-transparent py-4 rounded-xl text-sm font-bold transition-all">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </>
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
