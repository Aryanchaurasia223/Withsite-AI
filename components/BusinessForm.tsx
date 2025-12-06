import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Briefcase, ShoppingBag, MapPin, Phone, Palette, Settings, 
  Sparkles, Plus, Trash2, Upload, Image as ImageIcon, 
  Loader2, Wand2, RefreshCw, Eye, Download, Eraser, 
  ChevronDown, ChevronUp, Search, User as UserIcon, X, Check, Save, Star, Edit2, Tag,
  ChevronLeft, ChevronRight, Type, Calendar, MessageSquare, ArrowRight, GripHorizontal, Globe, Instagram, Facebook, LayoutTemplate, Copy, Share2
} from 'lucide-react';
import { BusinessData, ContactSubmission, User, ProductItem } from '../types';
import { 
  generateLogo, removeBackground, generateProductImage, 
  generateProductDescription, generateHeroImage, generateSEODescription 
} from '../services/geminiService';

export const industries = [
  "Jewellery", "Clothing", "Electronics", "Restaurant", "Furniture", 
  "Beauty & Health", "Home Decor", "Groceries", "Toys", "Other"
];

export const industryCategories: Record<string, string[]> = {
  "Jewellery": ["Necklaces", "Rings", "Earrings", "Bracelets", "Sets", "Watches"],
  "Clothing": ["Men", "Women", "Kids", "Accessories", "Footwear"],
  "Electronics": ["Mobiles", "Laptops", "Audio", "Cameras", "Accessories"],
  "Restaurant": ["Starters", "Main Course", "Desserts", "Beverages"],
  "Furniture": ["Living Room", "Bedroom", "Dining", "Office"],
  "Beauty & Health": ["Skincare", "Makeup", "Haircare", "Wellness"],
  "Home Decor": ["Wall Art", "Lighting", "Vases", "Rugs", "Cushions"],
  "Groceries": ["Fruits", "Vegetables", "Dairy", "Snacks", "Beverages"],
  "Toys": ["Action Figures", "Dolls", "Puzzles", "Educational", "Outdoor"],
  "Other": ["New Arrivals", "Best Sellers"]
};

export const industryFieldDefaults: Record<string, {id: string, label: string, options: string[]}[]> = {
  "Jewellery": [{ id: "metal", label: "Metal", options: ["Gold", "Silver", "Platinum", "Rose Gold"] }, { id: "purity", label: "Purity", options: ["24K", "22K", "18K", "14K"] }],
  "Clothing": [{ id: "size", label: "Size", options: ["XS", "S", "M", "L", "XL", "XXL"] }, { id: "fabric", label: "Fabric", options: ["Cotton", "Polyester", "Silk", "Linen", "Wool"] }],
  "Electronics": [{ id: "warranty", label: "Warranty", options: ["6 Months", "1 Year", "2 Years"] }, { id: "color", label: "Color", options: ["Black", "White", "Silver", "Gold", "Blue"] }],
  "Restaurant": [{ id: "spice", label: "Spice Level", options: ["Mild", "Medium", "Spicy", "Extra Spicy"] }, { id: "portion", label: "Portion", options: ["Regular", "Large", "Family"] }],
  "Furniture": [{ id: "material", label: "Material", options: ["Wood", "Metal", "Glass", "Fabric"] }, { id: "finish", label: "Finish", options: ["Matte", "Glossy", "Textured"] }],
  "Beauty & Health": [{ id: "skin", label: "Skin Type", options: ["All", "Oily", "Dry", "Sensitive"] }, { id: "benefit", label: "Key Benefit", options: ["Hydrating", "Anti-aging", "Brightening"] }],
  "Home Decor": [{ id: "style", label: "Style", options: ["Modern", "Vintage", "Bohemian", "Industrial"] }],
  "Groceries": [{ id: "pack", label: "Pack Size", options: ["250g", "500g", "1kg", "5kg"] }, { id: "type", label: "Type", options: ["Organic", "Regular"] }],
  "Toys": [{ id: "age", label: "Age Group", options: ["0-2 Years", "3-5 Years", "6-9 Years", "10+ Years"] }],
  "Other": []
};

export const industrySEO: Record<string, { description: string, keywords: string }> = {
  "Jewellery": {
    description: "Discover exquisite handcrafted jewellery. Shop our exclusive collection of gold, diamond, and silver pieces perfect for every occasion.",
    keywords: "jewellery, gold, diamond, silver, necklace, earrings, rings, wedding jewellery"
  },
  "Clothing": {
    description: "Shop the latest fashion trends. Premium clothing for men, women, and kids with quality fabrics and stylish designs.",
    keywords: "fashion, clothing, apparel, menswear, womenswear, kids clothes, trendy, online store"
  },
  "Electronics": {
    description: "Best deals on electronics and gadgets. Smartphones, laptops, accessories and more at unbeatable prices.",
    keywords: "electronics, gadgets, smartphones, laptops, headphones, tech, accessories"
  },
  "Restaurant": {
    description: "Experience authentic flavors. Order fresh and delicious food online for delivery or takeaway.",
    keywords: "restaurant, food delivery, online ordering, authentic food, delicious, takeaway"
  },
  "Furniture": {
    description: "Transform your home with our premium furniture collection. Modern, durable, and stylish furniture for every room.",
    keywords: "furniture, home decor, sofa, bed, dining table, interior design, wooden furniture"
  },
  "Beauty & Health": {
    description: "Premium beauty and wellness products. Skincare, makeup, and health essentials for a radiant you.",
    keywords: "beauty, skincare, makeup, wellness, health, cosmetics, natural products"
  },
  "Home Decor": {
    description: "Elevate your living space with unique home decor items. Wall art, lighting, rugs, and more.",
    keywords: "home decor, interior decoration, wall art, lighting, rugs, vases, home styling"
  },
  "Groceries": {
    description: "Fresh groceries delivered to your doorstep. Fruits, vegetables, dairy, and daily essentials.",
    keywords: "grocery, fresh produce, vegetables, fruits, dairy, supermarket, daily essentials"
  },
  "Toys": {
    description: "Fun and educational toys for kids of all ages. Explore our wide range of games, puzzles, and action figures.",
    keywords: "toys, kids games, puzzles, educational toys, action figures, dolls, gifts for kids"
  },
  "Other": {
    description: "Welcome to our store. Discover our wide range of quality products and best sellers.",
    keywords: "online store, shop, best sellers, quality products, new arrivals"
  }
};

const sections = [
  { id: "identity", label: "Identity", icon: Briefcase },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "contact", label: "Contact", icon: MapPin },
  { id: "design", label: "Design", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings },
];

const fontOptions = [
  { name: "Inter", label: "Modern Sans", family: "'Inter', sans-serif" },
  { name: "Playfair Display", label: "Elegant Serif", family: "'Playfair Display', serif" },
  { name: "Roboto", label: "Clean Sans", family: "'Roboto', sans-serif" },
  { name: "Montserrat", label: "Geometric", family: "'Montserrat', sans-serif" },
  { name: "Merriweather", label: "Classic Serif", family: "'Merriweather', serif" }
];

const colorOptions = [
    "#000000", "#FFFFFF", "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"
];

// Reusable Step Navigation Component
const StepNavigation = ({ onBack, onNext, nextLabel = "Continue", isFirst = false, isLast = false }: { onBack: () => void, onNext: () => void, nextLabel?: string, isFirst?: boolean, isLast?: boolean }) => (
  <div className="flex gap-4 mt-10 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
    {!isFirst && (
        <button 
            onClick={onBack}
            className="flex-1 py-4 rounded-xl font-bold text-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
        >
            Back
        </button>
    )}
    <button 
        onClick={onNext}
        className={`flex-1 py-4 rounded-xl font-bold text-sm text-white shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isLast ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-black dark:bg-white dark:text-black'}`}
    >
        {isLast ? "Generate App" : nextLabel} {isLast ? <Sparkles size={16} /> : <ArrowRight size={16} />}
    </button>
  </div>
);

interface BusinessFormProps {
  data: BusinessData;
  onChange: (field: keyof BusinessData, value: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
  contactSubmissions: ContactSubmission[];
  currentUser: User | null;
  onOpenProfile: () => void;
  hasGenerated: boolean;
  onDownload: () => void;
  onRobotAlert: (message: string, variant: 'error' | 'tip' | 'success') => void;
  onFocusSection?: (sectionId: string) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({ 
  data, onChange, onSubmit, isLoading, contactSubmissions, 
  currentUser, onOpenProfile, hasGenerated, onDownload, onRobotAlert, onFocusSection
}) => {
  const [activeSection, setActiveSection] = useState("identity");
  const [animationClass, setAnimationClass] = useState("animate-fade-in");
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  // Logo & Image States
  const [showLogoGenerator, setShowLogoGenerator] = useState(false);
  const [logoStyle, setLogoStyle] = useState("Minimalist");
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Product State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productFormStep, setProductFormStep] = useState(1);
  const [productForm, setProductForm] = useState<Partial<ProductItem>>({
    name: "", category: "", price: "", stock: "", description: "", images: [], specs: {}
  });
  const [isGeneratingProductImage, setIsGeneratingProductImage] = useState(false);
  const [isGeneratingProductDesc, setIsGeneratingProductDesc] = useState(false);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGeneratingHero, setIsGeneratingHero] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

  // Calculate Progress
  const completion = useMemo(() => {
    let completed = 0;
    const total = 9; // Total milestone points

    // Identity (3 points)
    if (data.businessName.length > 2) completed++;
    if (data.industry) completed++;
    if (data.description.length > 10) completed++;

    // Design (2 points)
    if (data.logo) completed++;
    if (data.heroImages.length > 0) completed++;

    // Products (2 points)
    if (data.catalogue.length > 0) completed += 2; // Heavy weight

    // Contact (2 points)
    if (data.phone.length > 5) completed++;
    if (data.address.city.length > 2) completed++;

    return Math.min(Math.round((completed / total) * 100), 100);
  }, [data]);

  // Auto-slide to center active tab using bounding client rect
  useEffect(() => {
    const scrollActiveTabIntoView = () => {
        const container = tabsContainerRef.current;
        const activeTab = document.getElementById(`tab-btn-${activeSection}`);
        
        if (container && activeTab) {
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();
            
            // Calculate center of container
            const containerCenter = containerRect.left + containerRect.width / 2;
            // Calculate center of tab
            const tabCenter = tabRect.left + tabRect.width / 2;
            
            // Distance to move
            const offset = tabCenter - containerCenter;
            
            container.scrollBy({
                left: offset,
                behavior: 'smooth'
            });
        }
    };
    
    // Slight delay to ensure layout (transforms, bold fonts) is stable before calculating
    const timer = setTimeout(scrollActiveTabIntoView, 150);
    return () => clearTimeout(timer);
  }, [activeSection]);

  // --- Handlers ---

  const changeSection = (newSectionId: string) => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    const newIndex = sections.findIndex(s => s.id === newSectionId);
    
    // Determine animation direction for slide effect
    if (newIndex > currentIndex) {
        setAnimationClass("animate-slide-in-right");
    } else if (newIndex < currentIndex) {
        setAnimationClass("animate-slide-in-left");
    } else {
        setAnimationClass("animate-fade-in");
    }

    setActiveSection(newSectionId);
    
    // Notify parent to scroll preview on mobile
    if (onFocusSection) {
        onFocusSection(newSectionId);
    }

    // Scroll content to top
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Scroll to center on focus for all devices to ensure visibility
    setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleNextStep = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
        changeSection(sections[currentIndex + 1].id);
    } else {
        onSubmit();
    }
  };

  const handlePrevStep = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
        changeSection(sections[currentIndex - 1].id);
    }
  };

  const handleLogoGenerate = async () => {
    if (!data.businessName) {
        onRobotAlert("Please enter a Business Name first!", "error");
        return;
    }
    setIsGeneratingLogo(true);
    try {
        const logo = await generateLogo(data.businessName, data.industry, logoStyle);
        if (logo) {
            onChange("logo", logo);
            onRobotAlert("Logo generated successfully!", "success");
            setShowLogoGenerator(false);
        } else {
            onRobotAlert("Failed to generate logo.", "error");
        }
    } catch (e) {
        onRobotAlert("Error generating logo.", "error");
    } finally {
        setIsGeneratingLogo(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'logo') onChange("logo", reader.result as string);
        else {
           // For hero images, append to array
           const newHero = { url: reader.result as string, alt: "Hero Image" };
           onChange("heroImages", [...data.heroImages, newHero]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBg = async () => {
    if (!data.logo) return;
    setIsRemovingBg(true);
    try {
        const result = await removeBackground(data.logo);
        if (result) {
            onChange("logo", result);
            onRobotAlert("Background removed!", "success");
        }
    } catch (e) {
        onRobotAlert("Could not remove background.", "error");
    } finally {
        setIsRemovingBg(false);
    }
  };

  // --- Product Handlers ---

  const handleProductSave = () => {
    if (!productForm.name || !productForm.price) return;
    
    const newProduct: ProductItem = {
      id: productForm.id || Date.now().toString(),
      name: productForm.name,
      price: productForm.price,
      stock: productForm.stock || "100", // Default to 100 if not specified
      category: productForm.category || "New",
      description: productForm.description || "",
      image: productForm.image || "",
      images: productForm.images || (productForm.image ? [productForm.image] : []),
      specs: productForm.specs || {},
      isBestSeller: false
    };

    let updatedCatalogue = [...data.catalogue];
    if (productForm.id) {
        updatedCatalogue = updatedCatalogue.map(p => p.id === productForm.id ? newProduct : p);
    } else {
        updatedCatalogue.push(newProduct);
    }

    onChange("catalogue", updatedCatalogue);
    setIsProductFormOpen(false);
    setProductForm({ name: "", category: "", price: "", stock: "", description: "", images: [], specs: {} });
    setProductFormStep(1);
    onRobotAlert("Product saved!", "success");
  };

  const handleProductEdit = (product: ProductItem) => {
    setProductForm(product);
    setIsProductFormOpen(true);
    setProductFormStep(1);
  };

  const handleProductDelete = (id: string) => {
    onChange("catalogue", data.catalogue.filter(p => p.id !== id));
  };

  const handleProductImageGenerate = async () => {
    if (!productForm.name) {
        onRobotAlert("Enter product name first", "error");
        return;
    }
    setIsGeneratingProductImage(true);
    try {
        const img = await generateProductImage(productForm.name, productForm.category || "General", data.industry);
        if (img) {
            setProductForm(prev => ({ ...prev, image: img, images: [img] }));
            onRobotAlert("Image generated!", "success");
        }
    } catch(e) {
        onRobotAlert("Failed to generate image", "error");
    } finally {
        setIsGeneratingProductImage(false);
    }
  };

  const handleProductDescGenerate = async () => {
    if (!productForm.name) return;
    setIsGeneratingProductDesc(true);
    try {
        const desc = await generateProductDescription(productForm.name, productForm.category || "General", data.industry);
        if (desc) setProductForm(prev => ({ ...prev, description: desc }));
    } catch(e) {
        onRobotAlert("Failed to write description", "error");
    } finally {
        setIsGeneratingProductDesc(false);
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, image: reader.result as string, images: [reader.result as string] }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Hero & SEO Handlers ---

  const handleHeroGenerate = async () => {
      setIsGeneratingHero(true);
      try {
          const img = await generateHeroImage(data.businessName, data.industry);
          if (img) {
              const newHero = { url: img, alt: "AI Generated Hero" };
              onChange("heroImages", [newHero, ...data.heroImages]); // Add to beginning
              onRobotAlert("Hero banner created!", "success");
          }
      } catch(e) {
          onRobotAlert("Failed to create banner", "error");
      } finally {
          setIsGeneratingHero(false);
      }
  };

  const handleSEOGenerate = async () => {
      if (!data.description) {
          onRobotAlert("Please add a business description first in Identity tab.", "error");
          return;
      }
      setIsGeneratingSEO(true);
      try {
          const seoDesc = await generateSEODescription(data.businessName, data.industry, data.description, data.userSeoKeywords || "");
          if (seoDesc) {
              onChange("userSeoMetaDescription", seoDesc);
              onRobotAlert("SEO optimized!", "success");
          }
      } catch(e) {
          onRobotAlert("Failed to generate SEO", "error");
      } finally {
          setIsGeneratingSEO(false);
      }
  };

  const handleCopyHours = () => {
    const monday = data.openingHours.find(d => d.day === "Monday");
    if (!monday) return;
    
    const newHours = data.openingHours.map(d => ({
        ...d,
        startTime: monday.startTime,
        endTime: monday.endTime,
        isClosed: monday.isClosed
    }));
    onChange("openingHours", newHours);
    onRobotAlert("Copied Monday's schedule to all days", "success");
  };

  // Modern Input Style Helper with "AI Texture" feel
  const inputClass = "w-full px-5 py-4 bg-white/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";
  const labelClass = "text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1 mb-2 block";
  
  // Card Class with Texture and Glassmorphism
  const cardClass = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/50 dark:shadow-black/40 animate-in slide-in-from-bottom-4 relative overflow-hidden group hover:border-zinc-300/50 dark:hover:border-zinc-700/50 transition-colors";
  
  const SectionHeader = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
      <h3 className="text-xl font-black mb-8 flex items-center gap-4 tracking-tight">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-${color}-50 to-${color}-100/50 dark:from-${color}-900/30 dark:to-${color}-900/10 text-${color}-600 dark:text-${color}-400 shadow-sm ring-1 ring-${color}-100 dark:ring-${color}-900/30`}>
              <Icon size={22} strokeWidth={2.5} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
              {title}
          </span>
      </h3>
  );

  return (
    <div className="w-full max-w-4xl mx-auto pb-32 md:pb-12">
      
      {/* Top Navigation Tabs - Sticky Glassmorphism with Texture */}
      {/* Updated layout to prevent cutting off buttons and progress bar overlap */}
      <div className="sticky top-0 z-30 -mx-4 md:mx-0 transition-all duration-300">
        <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm mask-gradient" />
        
        <div className="relative z-10 flex flex-col pt-4 pb-2">
            
            {/* Progress Bar Container */}
            <div className="flex items-center gap-3 px-6 mb-3">
                 <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/30">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-1000 ease-out"
                        style={{ width: `${completion}%` }}
                    />
                 </div>
                 <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 w-8 text-right">
                    {completion}%
                 </div>
            </div>

            <div 
                ref={tabsContainerRef}
                className="flex gap-3 overflow-x-auto hide-scrollbar px-6 w-full snap-x py-2" 
                id="tabs-container"
            >
                {sections.map((section, idx) => {
                    const isActive = activeSection === section.id;
                    const isCompleted = idx < sections.findIndex(s => s.id === activeSection);
                    
                    return (
                        <button
                            key={section.id}
                            id={`tab-btn-${section.id}`}
                            onClick={() => changeSection(section.id)}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border snap-start
                                ${isActive 
                                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-purple-500/20 scale-100 border-transparent ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-black' 
                                    : isCompleted 
                                        ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800' 
                                        : 'bg-transparent text-zinc-400 dark:text-zinc-600 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                                }
                            `}
                        >
                            {isCompleted && !isActive ? (
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                    <Check size={10} className="text-white" strokeWidth={4} />
                                </div>
                            ) : (
                                <section.icon size={14} className={isActive ? "animate-pulse" : ""} strokeWidth={2.5} />
                            )}
                            {section.label}
                        </button>
                    );
                })}
                {/* Spacer for right padding to allow last item centering */}
                <div className="w-6 shrink-0" />
            </div>
        </div>
      </div>

      <div key={activeSection} className={`px-4 md:px-8 transition-all duration-500 ${animationClass}`}>
        
        {/* --- IDENTITY SECTION --- */}
        {activeSection === "identity" && (
            <div className="space-y-6">
                <div className={cardClass}>
                    <SectionHeader icon={Briefcase} title="Brand Basics" color="purple" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className={labelClass}>Business Name</label>
                            <input 
                                value={data.businessName}
                                onChange={e => onChange("businessName", e.target.value)}
                                onFocus={handleInputFocus}
                                className={inputClass}
                                placeholder="e.g. Luxe Gems"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClass}>Industry</label>
                            <div className="relative">
                                <select 
                                    value={data.industry}
                                    onChange={e => {
                                        const newInd = e.target.value;
                                        onChange("industry", newInd);
                                        // Reset categories and fields when industry changes
                                        onChange("productCategories", industryCategories[newInd] || []);
                                        onChange("productFields", industryFieldDefaults[newInd] || []);
                                        // Update SEO defaults
                                        if (industrySEO[newInd]) {
                                            onChange("userSeoMetaDescription", industrySEO[newInd].description);
                                            onChange("userSeoKeywords", industrySEO[newInd].keywords);
                                        }
                                    }}
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                    onFocus={handleInputFocus}
                                >
                                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className={labelClass}>Tagline (Optional)</label>
                            <input 
                                value={data.tagline}
                                onChange={e => onChange("tagline", e.target.value)}
                                onFocus={handleInputFocus}
                                className={inputClass}
                                placeholder="e.g. Timeless elegance for every occasion"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1">
                            <label className={labelClass}>Description</label>
                            <textarea 
                                value={data.description}
                                onChange={e => onChange("description", e.target.value)}
                                onFocus={handleInputFocus}
                                rows={3}
                                className={`${inputClass} resize-none`}
                                placeholder="Tell us about your brand..."
                            />
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <SectionHeader icon={ImageIcon} title="Brand Logo" color="blue" />
                    
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative group w-48 h-48 shrink-0">
                            <div className={`w-full h-full rounded-[2rem] flex items-center justify-center overflow-hidden transition-all duration-300 relative shadow-sm ${data.logo ? 'bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800' : 'bg-zinc-50 dark:bg-black/50 border-2 border-dashed border-zinc-300 dark:border-zinc-700 group-hover:border-blue-400'}`}>
                                
                                {/* Background Grid for transparency check */}
                                {data.logo && <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />}

                                {data.logo ? (
                                    <img 
                                        src={data.logo} 
                                        className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110" 
                                        alt="Logo" 
                                    />
                                ) : (
                                    <div className="text-center p-4 transform transition-transform duration-300 group-hover:scale-105">
                                        <div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                            <Upload size={24} className="text-zinc-400" />
                                        </div>
                                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wide group-hover:text-blue-500 transition-colors">Upload or Generate</span>
                                    </div>
                                )}
                            </div>
                            {data.logo && (
                                <button 
                                    onClick={() => onChange("logo", undefined)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 hover:scale-110 border-4 border-white dark:border-zinc-950 z-10"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 w-full space-y-4">
                             <div className="flex gap-4">
                                 <button 
                                    onClick={() => setShowLogoGenerator(!showLogoGenerator)}
                                    className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl text-sm font-bold shadow-sm hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                                 >
                                     <Wand2 size={16} className="group-hover:rotate-12 transition-transform" /> AI Generate
                                 </button>
                                 <button 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="flex-1 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-2xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                                 >
                                     <Upload size={16} /> Upload
                                 </button>
                                 <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                             </div>

                             {data.logo && (
                                 <button 
                                    onClick={handleRemoveBg}
                                    disabled={isRemovingBg}
                                    className="w-full py-3 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center gap-2 transition-colors border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-zinc-400"
                                 >
                                    {isRemovingBg ? <Loader2 className="animate-spin" size={12} /> : <Eraser size={14} />} 
                                    Remove Background
                                 </button>
                             )}
                        </div>
                    </div>

                    {showLogoGenerator && (
                        <div className="mt-8 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50 animate-in slide-in-from-top-2">
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Choose Style</h4>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {["Minimalist", "Modern", "Vintage", "Luxury", "3D", "Iconic"].map(style => (
                                    <button 
                                        key={style}
                                        onClick={() => setLogoStyle(style)}
                                        className={`px-5 py-3 rounded-xl text-xs font-bold border transition-all ${logoStyle === style ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md transform scale-105' : 'bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={handleLogoGenerate}
                                disabled={isGeneratingLogo}
                                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all shadow-lg"
                            >
                                {isGeneratingLogo ? <Loader2 className="animate-spin" /> : "Generate Logo"}
                            </button>
                        </div>
                    )}
                </div>

                <StepNavigation onNext={handleNextStep} onBack={handlePrevStep} isFirst />
            </div>
        )}

        {/* --- PRODUCTS SECTION --- */}
        {activeSection === "products" && (
            <div className="space-y-6">
                {!isProductFormOpen ? (
                    <div className={cardClass}>
                        <div className="flex justify-between items-center mb-8">
                            <SectionHeader icon={ShoppingBag} title={`Catalogue (${data.catalogue.length})`} color="green" />
                            <button 
                                onClick={() => { setProductForm({ images: [], specs: {}, stock: "" }); setIsProductFormOpen(true); }}
                                className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                            >
                                <Plus size={16} /> Add Product
                            </button>
                        </div>

                        {data.catalogue.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-zinc-50/50 dark:bg-zinc-900/30">
                                <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                                    <ShoppingBag className="text-zinc-300 dark:text-zinc-600" size={32} />
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Your store is empty.</p>
                                <button onClick={() => setIsProductFormOpen(true)} className="mt-4 text-sm font-bold text-green-600 hover:underline">Add your first product</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.catalogue.map((product) => (
                                    <div key={product.id} className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 p-4 rounded-3xl flex gap-5 shadow-sm hover:shadow-md transition-all group items-center backdrop-blur-sm">
                                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-700">
                                            {product.image && <img src={product.image} className="w-full h-full object-cover" alt={product.name} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold truncate text-sm text-zinc-900 dark:text-zinc-100">{product.name}</h4>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleProductEdit(product)} className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-50 shadow-sm border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"><Edit2 size={12}/></button>
                                                    <button onClick={() => handleProductDelete(product.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 border border-red-100 dark:border-red-900/30"><Trash2 size={12}/></button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium mt-1">{product.price}</p>
                                            <span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-500 mt-3 inline-block border border-zinc-200 dark:border-zinc-700">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <StepNavigation onNext={handleNextStep} onBack={handlePrevStep} />
                    </div>
                ) : (
                    <div className={`${cardClass} animate-in zoom-in-95`}>
                         <div className="flex justify-between items-center mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                             <h3 className="font-black text-xl flex items-center gap-2">
                                 {productForm.id ? <Edit2 size={20} className="text-zinc-400"/> : <Plus size={20} className="text-zinc-400"/>}
                                 {productForm.id ? "Edit Product" : "New Product"}
                             </h3>
                             <button onClick={() => setIsProductFormOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={24} className="text-zinc-400" /></button>
                         </div>
                         
                         <div className="space-y-8">
                            {/* Product Form Content */}
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-full md:w-40 h-40 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl shrink-0 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 relative group cursor-pointer hover:border-purple-400 transition-colors" onClick={() => productFileInputRef.current?.click()}>
                                    {productForm.image ? (
                                        <img src={productForm.image} className="w-full h-full object-cover rounded-3xl shadow-sm" alt="Product" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload size={24} className="mx-auto text-zinc-400 mb-2" />
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Add Photo</span>
                                        </div>
                                    )}
                                    <input ref={productFileInputRef} type="file" className="hidden" onChange={handleProductImageUpload} />
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <div className="space-y-1">
                                        <label className={labelClass}>Product Name</label>
                                        <input 
                                            value={productForm.name}
                                            onChange={e => setProductForm({...productForm, name: e.target.value})}
                                            onFocus={handleInputFocus}
                                            className={inputClass}
                                            placeholder="e.g. Diamond Ring"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <label className={labelClass}>Price</label>
                                            <input 
                                                value={productForm.price}
                                                onChange={e => setProductForm({...productForm, price: e.target.value})}
                                                onFocus={handleInputFocus}
                                                className={inputClass}
                                                placeholder="e.g. ₹2000"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className={labelClass}>Stock Qty</label>
                                            <input
                                                type="number"
                                                value={productForm.stock}
                                                onChange={e => setProductForm({...productForm, stock: e.target.value})}
                                                onFocus={handleInputFocus}
                                                className={inputClass}
                                                placeholder="e.g. 50"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className={labelClass}>Category</label>
                                            <div className="relative">
                                                <select 
                                                    value={productForm.category}
                                                    onChange={e => setProductForm({...productForm, category: e.target.value})}
                                                    onFocus={handleInputFocus}
                                                    className={`${inputClass} appearance-none`}
                                                >
                                                    <option value="">Select...</option>
                                                    {data.productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* AI Tools Row */}
                            <div className="flex gap-4 p-2 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <button 
                                    onClick={handleProductImageGenerate}
                                    disabled={isGeneratingProductImage}
                                    className="flex-1 py-3.5 bg-white dark:bg-zinc-800 shadow-sm rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:shadow-md transition-all text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-700"
                                >
                                    {isGeneratingProductImage ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />} AI Enhance Image
                                </button>
                                <button 
                                    onClick={handleProductDescGenerate}
                                    disabled={isGeneratingProductDesc}
                                    className="flex-1 py-3.5 bg-white dark:bg-zinc-800 shadow-sm rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:shadow-md transition-all text-purple-600 dark:text-purple-400 border border-zinc-200 dark:border-zinc-700"
                                >
                                    {isGeneratingProductDesc ? <Loader2 size={16} className="animate-spin"/> : <Type size={16} />} AI Description
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className={labelClass}>Description</label>
                                <textarea 
                                    value={productForm.description}
                                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                                    onFocus={handleInputFocus}
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Product description..."
                                />
                            </div>

                            {/* Dynamic Specs */}
                            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 block flex items-center gap-2"><Tag size={12}/> Specifications</label>
                                <div className="grid grid-cols-2 gap-5">
                                    {data.productFields.map(field => (
                                        <div key={field.id} className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-500 ml-1">{field.label}</label>
                                            <div className="relative">
                                                <select
                                                    value={productForm.specs?.[field.label] || ""}
                                                    onChange={e => setProductForm({
                                                        ...productForm, 
                                                        specs: { ...productForm.specs, [field.label]: e.target.value }
                                                    })}
                                                    onFocus={handleInputFocus}
                                                    className="w-full p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none appearance-none focus:border-purple-500 transition-colors"
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={12} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleProductSave}
                                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-purple-900/5"
                            >
                                Save Product
                            </button>
                         </div>
                    </div>
                )}
            </div>
        )}

        {/* --- CONTACT SECTION --- */}
        {activeSection === "contact" && (
            <div className="space-y-6">
                 <div className={cardClass}>
                     <SectionHeader icon={MapPin} title="Location & Contact" color="red" />
                     <div className="grid grid-cols-1 gap-6">
                         <div className="space-y-1">
                            <label className={labelClass}>Street Address</label>
                            <input 
                                value={data.address.street}
                                onChange={e => onChange("address", { ...data.address, street: e.target.value })}
                                onFocus={handleInputFocus}
                                className={inputClass}
                                placeholder="e.g. 123 Market Street"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className={labelClass}>City</label>
                                <input 
                                    value={data.address.city}
                                    onChange={e => onChange("address", { ...data.address, city: e.target.value })}
                                    onFocus={handleInputFocus}
                                    className={inputClass}
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Pincode</label>
                                <input 
                                    value={data.address.zip}
                                    onChange={e => onChange("address", { ...data.address, zip: e.target.value })}
                                    onFocus={handleInputFocus}
                                    className={inputClass}
                                    placeholder="ZIP"
                                />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className={labelClass}>Phone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        value={data.phone}
                                        onChange={e => onChange("phone", e.target.value)}
                                        onFocus={handleInputFocus}
                                        className={`${inputClass} pl-12`}
                                        placeholder="Phone"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Email</label>
                                <input 
                                    value={data.email}
                                    onChange={e => onChange("email", e.target.value)}
                                    onFocus={handleInputFocus}
                                    className={inputClass}
                                    placeholder="Email"
                                />
                            </div>
                         </div>
                     </div>
                 </div>

                 <div className={cardClass}>
                     <div className="flex justify-between items-start">
                        <SectionHeader icon={Calendar} title="Opening Hours" color="orange" />
                        <button 
                            onClick={handleCopyHours}
                            className="mt-1 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm"
                            title="Copy Monday's schedule to all days"
                        >
                            <Copy size={14} /> <span className="hidden sm:inline">Copy Monday</span>
                        </button>
                     </div>
                     <div className="space-y-3">
                         {data.openingHours.map((schedule, idx) => (
                             <div key={schedule.day} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 p-4 rounded-2xl border border-white/40 dark:border-zinc-800/40 hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm transition-all duration-300">
                                 <div className="flex items-center gap-3 min-w-[120px]">
                                     <div className={`w-2 h-2 rounded-full transition-colors ${schedule.isClosed ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                                     <div className="font-bold text-sm text-zinc-600 dark:text-zinc-300">{schedule.day}</div>
                                 </div>
                                 
                                 <div className="flex items-center gap-4 flex-1 justify-end">
                                     {!schedule.isClosed ? (
                                         <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="relative group/input">
                                                <input 
                                                    type="time" 
                                                    value={schedule.startTime}
                                                    onChange={e => {
                                                        const newHours = [...data.openingHours];
                                                        newHours[idx].startTime = e.target.value;
                                                        onChange("openingHours", newHours);
                                                    }}
                                                    className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-2 text-xs font-bold outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all w-24 sm:w-28 text-center cursor-pointer shadow-sm group-hover/input:border-zinc-300"
                                                />
                                            </div>
                                            <span className="text-zinc-300 font-bold">-</span>
                                            <div className="relative group/input">
                                                <input 
                                                    type="time" 
                                                    value={schedule.endTime}
                                                    onChange={e => {
                                                        const newHours = [...data.openingHours];
                                                        newHours[idx].endTime = e.target.value;
                                                        onChange("openingHours", newHours);
                                                    }}
                                                    className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-2 text-xs font-bold outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all w-24 sm:w-28 text-center cursor-pointer shadow-sm group-hover/input:border-zinc-300"
                                                />
                                            </div>
                                         </div>
                                     ) : (
                                          <div className="flex-1 text-center py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 animate-in zoom-in-95">
                                             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Closed</span>
                                          </div>
                                     )}

                                     <label className="relative inline-flex items-center cursor-pointer ml-2">
                                        <input 
                                            type="checkbox" 
                                            checked={!schedule.isClosed} 
                                            onChange={e => {
                                                const newHours = [...data.openingHours];
                                                newHours[idx].isClosed = !e.target.checked;
                                                onChange("openingHours", newHours);
                                            }}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white shadow-inner"></div>
                                     </label>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
                 
                 <StepNavigation onNext={handleNextStep} onBack={handlePrevStep} />
            </div>
        )}

        {/* --- DESIGN SECTION --- */}
        {activeSection === "design" && (
            <div className="space-y-6">
                <div className={cardClass}>
                    <SectionHeader icon={Palette} title="Appearance" color="pink" />
                    
                    {/* Theme Color */}
                    <div className="mb-10">
                        <label className={labelClass}>Theme Color</label>
                        <div className="flex flex-wrap gap-5">
                            {colorOptions.map(color => (
                                <button
                                    key={color}
                                    onClick={() => onChange("themeColor", color)}
                                    className={`w-14 h-14 rounded-2xl border-4 transition-all ${data.themeColor === color ? 'border-white dark:border-zinc-800 scale-110 shadow-xl ring-2 ring-black dark:ring-white rotate-3' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-600 bg-transparent flex items-center justify-center cursor-pointer hover:border-zinc-400 group">
                                <input 
                                    type="color"
                                    value={data.themeColor}
                                    onChange={e => onChange("themeColor", e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
                                />
                                <Plus size={20} className="text-zinc-400 group-hover:text-zinc-600" />
                            </div>
                        </div>
                    </div>

                    {/* Font Selection */}
                    <div>
                        <label className={labelClass}>Typography</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fontOptions.map(font => (
                                <button
                                    key={font.name}
                                    onClick={() => onChange("font", font.family)}
                                    className={`p-6 rounded-3xl border text-left transition-all ${data.font === font.family ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-black text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
                                >
                                    <span className="text-2xl block mb-2 font-bold" style={{ fontFamily: font.family }}>Aa</span>
                                    <span className="text-base block mb-1" style={{ fontFamily: font.family }}>{font.name}</span>
                                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">{font.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <SectionHeader icon={ImageIcon} title="Hero Banners" color="indigo" />
                    
                    <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-8 snap-x -mx-2 px-2 pt-2">
                        {/* Add/Generate Card */}
                        <div className="w-80 h-48 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 shrink-0 flex flex-col items-center justify-center gap-4 snap-start hover:border-indigo-400 transition-colors group cursor-pointer">
                             <div className="flex gap-3">
                                <button 
                                    onClick={handleHeroGenerate}
                                    disabled={isGeneratingHero}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    {isGeneratingHero ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} AI Generate
                                </button>
                                <label className="px-6 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                    <Upload size={14} /> Upload
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} />
                                </label>
                             </div>
                             <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-indigo-400 transition-colors">16:9 Landscape Banner</span>
                        </div>

                        {data.heroImages.map((img, i) => (
                            <div key={i} className="w-80 h-48 rounded-3xl overflow-hidden relative shrink-0 shadow-lg group snap-start border border-zinc-100 dark:border-zinc-800">
                                <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Hero" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]" />
                                <button 
                                    onClick={() => onChange("heroImages", data.heroImages.filter((_, idx) => idx !== i))}
                                    className="absolute top-4 right-4 p-3 bg-white/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg backdrop-blur-md hover:bg-red-500 hover:rotate-90"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <StepNavigation onNext={handleNextStep} onBack={handlePrevStep} />
            </div>
        )}

        {/* --- SETTINGS SECTION --- */}
        {activeSection === "settings" && (
            <div className="space-y-6">
                <div className={cardClass}>
                    <SectionHeader icon={Globe} title="SEO & Meta" color="teal" />
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className={labelClass}>Meta Description</label>
                            <div className="relative">
                                <textarea 
                                    value={data.userSeoMetaDescription}
                                    onChange={e => onChange("userSeoMetaDescription", e.target.value)}
                                    onFocus={handleInputFocus}
                                    rows={4}
                                    className={`${inputClass} resize-none pr-14 leading-relaxed`}
                                    placeholder="Search engine description..."
                                />
                                <button 
                                    onClick={handleSEOGenerate}
                                    disabled={isGeneratingSEO}
                                    className="absolute bottom-4 right-4 p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-zinc-500 hover:text-purple-600 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                    title="AI Rewrite"
                                >
                                    {isGeneratingSEO ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className={labelClass}>Keywords</label>
                            <input 
                                value={data.userSeoKeywords}
                                onChange={e => onChange("userSeoKeywords", e.target.value)}
                                onFocus={handleInputFocus}
                                className={inputClass}
                                placeholder="Comma separated keywords"
                            />
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <SectionHeader icon={UserIcon} title="Social Links" color="yellow" />
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className={labelClass}>Instagram</label>
                            <div className="relative">
                                <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                                <input 
                                    value={data.instagram}
                                    onChange={e => onChange("instagram", e.target.value)}
                                    onFocus={handleInputFocus}
                                    className={`${inputClass} pl-14`}
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className={labelClass}>Facebook</label>
                            <div className="relative">
                                <Facebook className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                                <input 
                                    value={data.facebook}
                                    onChange={e => onChange("facebook", e.target.value)}
                                    onFocus={handleInputFocus}
                                    className={`${inputClass} pl-14`}
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <SectionHeader icon={Settings} title="Store Settings" color="gray" />
                     <div className="space-y-1">
                            <label className={labelClass}>Currency</label>
                            <div className="relative">
                                <select 
                                    value={data.currency}
                                    onChange={e => onChange("currency", e.target.value)}
                                    onFocus={handleInputFocus}
                                    className={`${inputClass} appearance-none cursor-pointer`}
                                >
                                    <option value="INR">Indian Rupee (₹)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                    <option value="GBP">British Pound (£)</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                </div>

                {hasGenerated && (
                    <div className={cardClass}>
                        <SectionHeader icon={Share2} title="Share Store" color="green" />
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-green-50 dark:ring-green-900/10">
                                <Globe size={28} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="text-lg font-bold mb-2">Ready to Launch?</h4>
                            <p className="text-sm text-zinc-500 mb-6 max-w-xs mx-auto">
                                Your store is ready! Generate a unique web link to share with your customers on WhatsApp, Instagram, and more.
                            </p>
                            <button 
                                onClick={onDownload}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
                            >
                                <Share2 size={16} /> Generate Web Link
                            </button>
                        </div>
                    </div>
                )}

                <StepNavigation onNext={handleNextStep} onBack={handlePrevStep} isLast />
            </div>
        )}
        
      </div>

    </div>
  );
};