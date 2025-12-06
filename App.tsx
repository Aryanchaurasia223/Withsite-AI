
import React, { useState, useEffect, useRef } from "react";
import { BusinessForm, industrySEO, industryFieldDefaults, industryCategories } from "./components/BusinessForm";
import { WebsitePreview } from "./components/WebsitePreview";
import { AuthScreen } from "./components/AuthScreen";
import { ProfileModal } from "./components/ProfileModal";
import { PublishModal } from "./components/PublishModal";
import { OnboardingGuide } from "./components/OnboardingGuide";
import { RobotGuide } from "./components/RobotGuide";
import { generateWebsiteContent } from "./services/geminiService";
import { BusinessData, GeneratedContent, User, ContactSubmission } from "./types";
import { 
  Download, Smartphone, LayoutDashboard, Moon, Sun, ArrowRight, Sparkles, CheckCircle, Package, ShieldCheck, HelpCircle, ChevronUp, ChevronDown, Maximize2, Minimize2, User as UserIcon, Globe
} from "lucide-react";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 'merchant' = Editor, 'customer' = Preview
  const [appMode, setAppMode] = useState<'merchant' | 'customer'>('merchant');
  const [isSharedLink, setIsSharedLink] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Guide State
  const [showGuide, setShowGuide] = useState(true);
  const [guideStep, setGuideStep] = useState(0);

  // Robot Guide State
  const [robotMessage, setRobotMessage] = useState<string | null>(null);
  const [robotVariant, setRobotVariant] = useState<'error' | 'tip' | 'success'>('tip');

  // Logo Animation State (Header)
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);

  const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const defaultOpeningHours = defaultDays.map(day => ({
    day,
    startTime: "09:00",
    endTime: "17:00",
    isClosed: day === "Sunday"
  }));

  const initialIndustry = "Jewellery";

  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: "",
    tagline: "",
    industry: initialIndustry,
    address: { street: "", city: "", state: "", zip: "", country: "India" },
    phone: "",
    email: "",
    openingHours: defaultOpeningHours,
    description: "",
    heroImages: [], 
    foundedYear: "",
    bestSellers: [],
    catalogue: [],
    categories: [],
    noteBarText: "Welcome to our exclusive online store",
    themeColor: "#000000",
    font: "Inter",
    currency: "INR",
    instagram: "",
    facebook: "",
    userSeoMetaDescription: industrySEO?.[initialIndustry]?.description || "",
    userSeoKeywords: industrySEO?.[initialIndustry]?.keywords || "",
    productCategories: industryCategories[initialIndustry] || [],
    productFields: industryFieldDefaults[initialIndustry] || []
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
  // Initialize with some dummy data for the table demonstration
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([
      { id: '101', name: 'Riya Sharma', phone: '+91 98765 43210', query: 'Do you ship to Mumbai?', date: 'Oct 24, 2:30 PM' },
      { id: '102', name: 'Amit Patel', phone: '+91 99887 76655', query: 'Is this available in bulk?', date: 'Oct 23, 10:15 AM' },
      { id: '103', name: 'Sneha Gupta', phone: '+91 88776 65544', query: 'Can I customize the color?', date: 'Oct 22, 6:45 PM' },
  ]);

  // Handle URL Routing for Shared Links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeName = params.get('store');
    
    if (storeName) {
      const savedData = localStorage.getItem(`withsite_store_${storeName}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setBusinessData(parsed.business);
          setGeneratedContent(parsed.content);
          setAppMode('customer');
          setIsSharedLink(true);
          setHasGenerated(true);
          setIsAuthenticated(true); // Auto-login for customer view
          setUser({ name: 'Guest', phone: '' });
          setShowGuide(false);
        } catch (e) {
          console.error("Failed to load store data", e);
        }
      }
    }
  }, []);

  // Correctly handle Tailwind Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (phone: string, name: string) => {
    setUser({ phone, name });
    setIsAuthenticated(true);
    // Reset guide on login
    setGuideStep(0);
    setShowGuide(true);
    // Welcome message from Robot
    triggerRobot(`Hi ${name}! Let's build your app. Start by adding your business name and logo.`, 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileModal(false);
    // If on shared link, clear URL on logout
    if (isSharedLink) {
        const url = new URL(window.location.href);
        window.history.pushState({}, '', url.pathname);
        setIsSharedLink(false);
        setAppMode('merchant');
    }
  };

  const handleUpdateProfile = (name: string, phone: string, profileImage?: string) => {
    if (user) setUser({ ...user, name, phone, profileImage });
  };

  const handleInputChange = (field: keyof BusinessData, value: any) => {
    setBusinessData((prev) => ({ ...prev, [field]: value }));
  };

  const triggerRobot = (message: string, variant: 'error' | 'tip' | 'success' = 'tip') => {
    setRobotMessage(message);
    setRobotVariant(variant);
  };

  const saveStoreData = (data: BusinessData, content: GeneratedContent | null) => {
      // Robust safe name generation (matches PublishModal.tsx)
      const safeName = (data.businessName || "store")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      localStorage.setItem(`withsite_store_${safeName}`, JSON.stringify({
          business: data,
          content: content
      }));
  };

  const handleGenerate = async () => {
    if (!businessData.businessName) {
        triggerRobot("I need a Business Name to build your app! Please enter it in the Identity section.", "error");
        return;
    }
    if (businessData.catalogue.length === 0) {
        triggerRobot("Your store is empty! Please add at least one product before generating the app.", "error");
        return;
    }

    setIsLoading(true);
    setAppMode('customer'); // Switch to preview on generate
    try {
      const content = await generateWebsiteContent(businessData);
      setGeneratedContent(content);
      setHasGenerated(true);
      saveStoreData(businessData, content); // Save data for link sharing
      triggerRobot("Great job! Your app is generated. Click 'Publish' to go live and share it.", "success");
    } catch (error) {
      console.error("Failed to generate content", error);
      triggerRobot("Something went wrong while generating content. Please check your internet and try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = (data: { name: string; phone: string; query: string }) => {
    const newSubmission: ContactSubmission = {
      id: Date.now().toString(),
      name: data.name,
      phone: data.phone,
      query: data.query,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
    setContactSubmissions(prev => [newSubmission, ...prev]);
  };

  const handleLogoClick = () => {
    if (isLogoAnimating) return;
    setIsLogoAnimating(true);
    setTimeout(() => setIsLogoAnimating(false), 700);
  };

  if (!isAuthenticated) {
    return (
       <div className={darkMode ? 'dark' : ''}>
          <AuthScreen 
            onLogin={handleLogin} 
            isDarkMode={darkMode} 
            onToggleTheme={() => setDarkMode(!darkMode)}
          />
       </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      
      {/* Navbar - Simplified if viewing as customer via link */}
      <header className={`h-[72px] border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-between px-5 md:px-6 z-40 shrink-0 relative ${isSharedLink ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className={`${isLogoAnimating ? 'animate-complete' : ''}`} onClick={handleLogoClick}>
            <div className="h-9 w-9 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black font-serif font-bold text-sm italic tracking-tight shadow-lg shadow-black/20 dark:shadow-white/20 transition-all duration-300 hover:rotate-12 hover:scale-110 cursor-pointer select-none">
               Ws
            </div>
          </div>
          <span className="font-serif font-bold text-lg tracking-tight hidden md:block animate-typewriter">WithSite AI</span>
        </div>

        {/* View Switcher - Only show for Merchant */}
        {!isSharedLink && (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full absolute left-1/2 -translate-x-1/2 border border-zinc-200 dark:border-zinc-800 shadow-sm z-50">
               <button 
                 onClick={() => setAppMode('merchant')}
                 className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${appMode === 'merchant' ? 'bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
               >
                 <LayoutDashboard size={14} /> <span className="hidden sm:inline">Editor</span>
               </button>
               <button 
                 onClick={() => setAppMode('customer')}
                 className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${appMode === 'customer' ? 'bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
               >
                 <Smartphone size={14} /> <span className="hidden sm:inline">Preview</span>
               </button>
            </div>
        )}

        <div className="flex items-center gap-2 md:gap-3">
           {!isSharedLink && (
               <button 
                 onClick={() => { setShowGuide(true); setGuideStep(0); }}
                 className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-colors"
                 title="Restart Tour"
               >
                 <HelpCircle size={20} />
               </button>
           )}

           <button 
             onClick={() => setDarkMode(!darkMode)}
             className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors text-zinc-600 dark:text-zinc-400"
           >
             {darkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>

           <button 
              onClick={() => setShowProfileModal(true)}
              className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition-all ml-1"
              title="Profile"
           >
              {user?.profileImage ? (
                 <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {user?.name?.charAt(0) || <UserIcon size={16} />}
                 </div>
              )}
           </button>
           
           {!isSharedLink && (
               <button 
                  onClick={() => setShowPublishModal(true)}
                  disabled={!hasGenerated}
                  className="hidden md:flex bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg text-xs font-bold hover:opacity-80 transition-all items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group ml-2 shadow-lg hover:shadow-xl"
                >
                  Publish <Globe size={12} className="group-hover:rotate-12 transition-transform" />
                </button>
           )}
        </div>
      </header>

      {/* Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* ================= DESKTOP LAYOUT ================= */}
        
        {/* Editor Panel - Full Screen on Desktop when active */}
        {!isSharedLink && (
            <div className={`
                hidden md:flex absolute inset-0 z-20 bg-white dark:bg-black md:relative w-full
                ${appMode === 'merchant' ? 'flex' : 'hidden'}
            `}>
              <div className="w-full h-full overflow-y-auto custom-scrollbar relative bg-white dark:bg-black">
                 <div className="absolute inset-0 text-zinc-200 dark:text-zinc-900 bg-grid-pattern opacity-40 pointer-events-none" />
                 <div className="relative z-10 w-full h-full">
                    <BusinessForm 
                      data={businessData} 
                      onChange={handleInputChange} 
                      onSubmit={handleGenerate}
                      isLoading={isLoading}
                      contactSubmissions={contactSubmissions}
                      currentUser={user}
                      onOpenProfile={() => setShowProfileModal(true)}
                      hasGenerated={hasGenerated}
                      onDownload={() => setShowPublishModal(true)}
                      onRobotAlert={triggerRobot}
                    />
                 </div>
              </div>
            </div>
        )}

        {/* Preview Panel - Full Screen on Desktop when active */}
        <div className={`
            hidden md:flex absolute inset-0 z-10 bg-zinc-50 dark:bg-zinc-950 flex-col items-center justify-center md:relative w-full
            ${appMode === 'customer' ? 'flex' : 'hidden'}
        `}>
           <div className={`bg-white dark:bg-black shadow-[0_20px_80px_-20px_rgba(0,0,0,0.3)] border-[8px] border-zinc-900 dark:border-zinc-800 relative overflow-hidden flex flex-col ${isSharedLink ? 'w-full h-full border-none rounded-none' : 'w-[375px] h-[812px] rounded-[40px]'}`}>
             {!isSharedLink && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black dark:bg-zinc-800 rounded-b-2xl z-50 flex justify-center items-center pointer-events-none"></div>}
             <div className="flex-1 relative overflow-hidden bg-white dark:bg-black flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth no-scrollbar">
                    <WebsitePreview business={businessData} content={generatedContent} onContactSubmit={handleContactSubmit} />
                </div>
                {isLoading && (
                  <div className="absolute inset-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in">
                     <div className="relative mb-6">
                        <div className="w-16 h-16 border-2 border-zinc-100 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                     </div>
                     <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">Generating App</h3>
                  </div>
                )}
             </div>
           </div>
        </div>

        {/* ================= MOBILE LAYOUT (Full Screen Toggle) ================= */}
        <div className="md:hidden absolute inset-0 flex flex-col overflow-hidden">
            
            {appMode === 'merchant' && !isSharedLink ? (
                /* 1. Full Screen Editor */
                <div className="flex-1 bg-white dark:bg-black overflow-y-auto custom-scrollbar">
                    <BusinessForm 
                        data={businessData} 
                        onChange={handleInputChange} 
                        onSubmit={handleGenerate}
                        isLoading={isLoading}
                        contactSubmissions={contactSubmissions}
                        currentUser={user}
                        onOpenProfile={() => setShowProfileModal(true)}
                        hasGenerated={hasGenerated}
                        onDownload={() => setShowPublishModal(true)}
                        onRobotAlert={triggerRobot}
                    />
                </div>
            ) : (
                /* 2. Full Screen Preview */
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative overflow-y-auto scroll-smooth">
                    <WebsitePreview business={businessData} content={generatedContent} onContactSubmit={handleContactSubmit} />
                    {isLoading && (
                      <div className="absolute inset-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8">
                         <div className="w-12 h-12 border-2 border-zinc-100 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin mb-4"></div>
                         <h3 className="font-bold">Building...</h3>
                      </div>
                    )}
                </div>
            )}
        </div>

      </main>

      {/* Overlays (Guide, Modal, Robot) */}
      {!isSharedLink && showGuide && (
         <OnboardingGuide 
            step={guideStep} 
            totalSteps={5}
            onNext={() => setGuideStep(p => Math.min(p + 1, 4))}
            onPrev={() => setGuideStep(p => Math.max(p - 1, 0))}
            onClose={() => setShowGuide(false)}
         />
      )}
      
      {!isSharedLink && (
          <RobotGuide 
            message={robotMessage} 
            variant={robotVariant}
            onClose={() => setRobotMessage(null)} 
          />
      )}

      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
          onLogout={handleLogout}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* Publish & Share Modal */}
      {showPublishModal && (
        <PublishModal 
          businessName={businessData.businessName}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
};

export default App;
