
import React, { useState, useMemo, useEffect, useRef } from "react";
import { BusinessData, GeneratedContent, ProductItem } from "../types";
import { 
  ShoppingBag, User, X, Quote,
  Instagram, Facebook, Twitter, Search, Menu, MapPin, Phone, Mail, Clock, ArrowRight, Star, Send, Globe,
  ChevronLeft, ChevronRight, Heart, Download
} from "lucide-react";
import { CustomerPanel } from "./CustomerPanel";
import { industryCategories } from "./BusinessForm";

interface WebsitePreviewProps {
  business: BusinessData;
  content: GeneratedContent | null;
  onContactSubmit?: (data: { name: string; phone: string; query: string }) => void;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({ business, content, onContactSubmit }) => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const imageScrollRef = useRef<HTMLDivElement>(null);

  // App Download Banner State
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Favorites State
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Currency State
  const [previewCurrency, setPreviewCurrency] = useState(business.currency || "INR");

  // Helper to generate safe IDs for category buttons
  const getCategoryId = (cat: string) => `cat-btn-${cat.replace(/[^a-zA-Z0-9]/g, '-')}`;

  // Helper to determine stock status
  const getStockStatus = (stockStr: string | undefined) => {
    const qty = parseInt(stockStr || "0", 10);
    if (isNaN(qty) || qty <= 0) return { label: "Out of Stock", color: "text-red-500", bg: "bg-red-50", indicator: "bg-red-500", buyable: false };
    if (qty <= 10) return { label: `Low Stock (${qty} left)`, color: "text-orange-500", bg: "bg-orange-50", indicator: "bg-orange-500", buyable: true };
    return { label: "In Stock", color: "text-green-600", bg: "bg-green-50", indicator: "bg-green-500", buyable: true };
  };

  // Sync currency if business settings change
  useEffect(() => {
    if (business.currency) {
      setPreviewCurrency(business.currency);
    }
  }, [business.currency]);

  // Load Favorites from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('customer_favorites');
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Auto-scroll active category into center using bounding client rect logic
  useEffect(() => {
    const scrollActiveCategoryIntoView = () => {
        const container = categoriesContainerRef.current;
        const activeBtn = document.getElementById(getCategoryId(activeCategory));
        
        if (container && activeBtn) {
           const containerRect = container.getBoundingClientRect();
           const btnRect = activeBtn.getBoundingClientRect();
           
           // Calculate center of container
           const containerCenter = containerRect.left + containerRect.width / 2;
           // Calculate center of tab
           const btnCenter = btnRect.left + btnRect.width / 2;
           
           // Distance to move
           const offset = btnCenter - containerCenter;
           
           container.scrollBy({
               left: offset,
               behavior: 'smooth'
           });
        }
    };
    
    const timer = setTimeout(scrollActiveCategoryIntoView, 150);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  // Toggle Favorite Handler
  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      localStorage.setItem('customer_favorites', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Reset detail image index when product changes
  useEffect(() => {
      if (selectedProduct) {
          setDetailImageIndex(0);
      }
  }, [selectedProduct]);

  // Handle Image Carousel Scroll
  const handleImageScroll = () => {
      if (imageScrollRef.current) {
          const scrollLeft = imageScrollRef.current.scrollLeft;
          const width = imageScrollRef.current.offsetWidth;
          const index = Math.round(scrollLeft / width);
          if (index !== detailImageIndex) {
            setDetailImageIndex(index);
          }
      }
  };

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", phone: "", query: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  
  const heroImages = business.heroImages?.length 
    ? business.heroImages.map(h => h.url) 
    : ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2069&auto=format&fit=crop"];
  
  const themeColor = business.themeColor || "#000000";

  const catalogue = business.catalogue?.length ? [...business.catalogue].reverse() : [];
  
  const displayCatalogue = catalogue.filter(p => {
    // If showing favorites, ensure it is in favorites list
    if (showFavoritesOnly && !favorites.has(p.id)) return false;

    // If searching or viewing favorites, ignore category filter to search entire store. 
    // Otherwise, respect the active category.
    const matchesCategory = (searchQuery || showFavoritesOnly) ? true : (activeCategory === "All" || p.category === activeCategory);
    
    const matchesSearch = !searchQuery 
      ? true 
      : (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const categoryList = useMemo(() => {
    if (catalogue.length > 0) {
        return Array.from(new Set(catalogue.map(c => c.category))).filter(Boolean) as string[];
    }
    // Fallback to configured categories if no products yet
    return (business.productCategories || industryCategories[business.industry] || ["New", "Sale"]).slice(0, 5);
  }, [catalogue, business.industry, business.productCategories]);

  // Determine if theme color is light or dark for text contrast
  const isLightColor = (hex: string) => {
    const c = hex.substring(1);      // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma > 150; // threshold
  };
  const textColorOnTheme = isLightColor(themeColor) ? "black" : "white";

  const handleContactSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if(!contactForm.name || !contactForm.phone) return;
    
    setIsSubmittingContact(true);
    
    // Simulate network delay or just call the prop
    if (onContactSubmit) {
        onContactSubmit(contactForm);
    }
    
    setTimeout(() => {
        setIsSubmittingContact(false);
        setContactSuccess(true);
        setContactForm({ name: "", phone: "", query: "" });
        setTimeout(() => setContactSuccess(false), 3000);
    }, 1000);
  };

  const handleAddToCart = () => {
    setCartCount(p => p + 1);
    setSelectedProduct(null);
    // Trigger animation
    setIsCartAnimating(true);
    setTimeout(() => setIsCartAnimating(false), 600);
  };

  const handleInstallApp = () => {
      // Simulate APK download logic
      const safeName = (business.businessName || "store").toLowerCase().replace(/[^a-z0-9]/g, '-');
      const element = document.createElement("a");
      // Create a dummy file for the APK
      const file = new Blob([`Mock APK content for ${business.businessName}\nVersion: 1.0.0`], {type: 'application/vnd.android.package-archive'});
      element.href = URL.createObjectURL(file);
      element.download = `${safeName}.apk`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Hide banner and close menu
      setShowInstallBanner(false);
      setIsMenuOpen(false);
  };

  // Helper to convert and format price based on selected currency
  const getDisplayPrice = (priceStr: string | undefined) => {
    if (!priceStr) return "";
    // Extract numeric value
    const val = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    
    // Base currency is what is stored in the database (business.currency)
    const baseCurrency = business.currency || "INR";
    
    let finalVal = val;
    const RATE = 84; // Approx 1 USD = 84 INR

    if (baseCurrency === 'INR' && previewCurrency === 'USD') {
        finalVal = val / RATE;
    } else if (baseCurrency === 'USD' && previewCurrency === 'INR') {
        finalVal = val * RATE;
    }

    const sym = previewCurrency === 'USD' ? '$' : '₹';
    
    // Format: Show decimals only if needed or if USD
    return `${sym}${finalVal.toLocaleString(undefined, { 
      minimumFractionDigits: previewCurrency === 'USD' ? 2 : 0, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Construct Address String for Map
  const addressString = `${business.address.street || ''} ${business.address.city || ''} ${business.address.country || ''}`.trim() || "India";

  // Helper for hours
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = business.openingHours?.find(h => h.day === today);
  const formatTime = (time: string) => {
      if (!time) return "";
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
  };

  if (showCustomerPanel) {
    return <CustomerPanel onClose={() => setShowCustomerPanel(false)} themeColor={themeColor} />;
  }

  // --- Render ---

  return (
    <div className="min-h-full bg-white text-zinc-900 pb-20 font-sans relative" style={{ fontFamily: business.font }}>
      
      {/* App Install Smart Banner */}
      {showInstallBanner && (
        <div className="bg-black text-white px-4 py-3 flex items-center justify-between sticky top-0 z-[60] animate-slide-in-from-top duration-500 shadow-md">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                    {business.logo ? (
                         <img src={business.logo} className="w-6 h-6 object-contain" alt="Logo" />
                    ) : (
                        <ShoppingBag size={18} className="text-white" />
                    )}
                </div>
                <div>
                    <p className="text-xs font-bold text-white">Get the {business.businessName || "Store"} App</p>
                    <p className="text-[10px] text-zinc-400">Shop faster & easier</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleInstallApp}
                    className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
                >
                    Install
                </button>
                <button onClick={() => setShowInstallBanner(false)} className="text-zinc-400 hover:text-white p-1">
                    <X size={16} />
                </button>
            </div>
        </div>
      )}

      {/* Sticky Header */}
      <header className={`sticky ${showInstallBanner ? 'top-[60px]' : 'top-0'} z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300`}>
        <div className="px-4 h-16 flex items-center justify-between">
           {isSearchOpen ? (
               <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                   <Search size={18} className="text-zinc-400" />
                   <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 bg-transparent outline-none text-sm font-medium h-full py-2"
                      autoFocus
                   />
                   <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-2 text-zinc-400">
                       <X size={18} />
                   </button>
               </div>
           ) : (
               <>
                    {/* Hamburger Menu */}
                    <button onClick={() => setIsMenuOpen(true)} className="p-2 -ml-2 text-zinc-600 hover:bg-zinc-50 rounded-full">
                        <Menu size={22} strokeWidth={1.5} />
                    </button>

                    {/* Logo / Brand Name */}
                    <div className="flex items-center gap-2" style={{ color: themeColor }}>
                        {business.logo ? (
                            <img src={business.logo} className="h-8 w-auto object-contain max-w-[100px]" alt="Logo" />
                        ) : (
                            <span className="font-bold text-lg tracking-tight truncate max-w-[150px]">{business.businessName || "My Store"}</span>
                        )}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-1 -mr-2">
                        <button onClick={() => setIsSearchOpen(true)} className="p-2 text-zinc-600 hover:bg-zinc-50 rounded-full">
                            <Search size={22} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={() => setShowCustomerPanel(true)} 
                            className={`p-2 hover:bg-zinc-50 rounded-full relative transition-all duration-300 ${isCartAnimating ? 'scale-110 bg-zinc-100 text-black' : 'text-zinc-600'}`}
                        >
                            <ShoppingBag size={22} strokeWidth={1.5} className={isCartAnimating ? 'animate-bounce' : ''} />
                            {cartCount > 0 && (
                                <span className={`absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white ${isCartAnimating ? 'animate-ping' : ''}`}>
                                </span>
                            )}
                            {cartCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
               </>
           )}
        </div>
      </header>

      {/* Side Menu Drawer */}
      {isMenuOpen && (
          <div className="fixed inset-0 z-[70] flex">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
              <div className="relative w-[80%] max-w-[300px] bg-white h-full shadow-2xl animate-slide-in-left flex flex-col">
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                      <h2 className="font-bold text-lg">Menu</h2>
                      <button onClick={() => setIsMenuOpen(false)}><X size={20} className="text-zinc-400" /></button>
                  </div>
                  <div className="p-4 space-y-1">
                      <button onClick={handleInstallApp} className="w-full text-left p-3 rounded-lg bg-black text-white hover:opacity-90 font-bold text-sm flex items-center gap-3 mb-2 shadow-sm">
                          <Download size={18} /> Install App
                      </button>
                      <button onClick={() => { setShowFavoritesOnly(false); setIsMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-zinc-50 font-medium text-sm flex items-center gap-3">
                          <ShoppingBag size={18} /> Shop All
                      </button>
                      <button onClick={() => { setShowFavoritesOnly(true); setIsMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-zinc-50 font-medium text-sm flex items-center gap-3">
                          <Heart size={18} /> Favorites
                      </button>
                      <button onClick={() => { setShowCustomerPanel(true); setIsMenuOpen(false); }} className="w-full text-left p-3 rounded-lg hover:bg-zinc-50 font-medium text-sm flex items-center gap-3">
                          <User size={18} /> My Account
                      </button>
                      <div className="my-2 border-t border-zinc-100"></div>
                      <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Contact</div>
                      <a href={`tel:${business.phone}`} className="w-full text-left p-3 rounded-lg hover:bg-zinc-50 font-medium text-sm flex items-center gap-3 text-zinc-600">
                          <Phone size={16} /> Call Us
                      </a>
                      {business.instagram && (
                          <a href={business.instagram} target="_blank" rel="noreferrer" className="w-full text-left p-3 rounded-lg hover:bg-zinc-50 font-medium text-sm flex items-center gap-3 text-zinc-600">
                              <Instagram size={16} /> Instagram
                          </a>
                      )}
                  </div>
                  <div className="mt-auto p-6 bg-zinc-50 border-t border-zinc-100">
                      <p className="text-xs text-zinc-400 text-center">Powered by WithSite AI</p>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="min-h-screen">
          
          {/* Hero Banner */}
          {!showFavoritesOnly && (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-zinc-100 overflow-hidden">
                {heroImages.map((img, idx) => (
                    <div 
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ${currentHeroIndex === idx ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={img} className="w-full h-full object-cover" alt="Hero" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                ))}
                
                <div className="absolute bottom-6 left-5 right-5 text-white animate-slide-up-fade">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-90">{business.tagline || "Welcome"}</p>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold leading-tight mb-4 drop-shadow-lg">
                        {content?.headline || `Welcome to ${business.businessName}`}
                    </h2>
                    <button 
                        style={{ backgroundColor: themeColor, color: textColorOnTheme }}
                        className="px-6 py-2.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                        Shop Now
                    </button>
                </div>
              </div>
          )}

          {/* Categories - Sticky below header */}
          <div className={`sticky ${showInstallBanner ? 'top-[124px]' : 'top-16'} z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-50 py-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all duration-300`}>
             <div 
                ref={categoriesContainerRef}
                className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-1 w-full snap-x"
             >
                 <button 
                    id={getCategoryId("All")}
                    onClick={() => { setActiveCategory("All"); setShowFavoritesOnly(false); }}
                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border snap-start ${activeCategory === "All" && !showFavoritesOnly ? 'border-transparent text-white shadow-md transform scale-105' : 'bg-zinc-50 border-zinc-100 text-zinc-600'}`}
                    style={activeCategory === "All" && !showFavoritesOnly ? { backgroundColor: themeColor, color: textColorOnTheme } : {}}
                 >
                    All Items
                 </button>
                 {categoryList.map(cat => (
                     <button 
                        key={cat}
                        id={getCategoryId(cat)}
                        onClick={() => { setActiveCategory(cat); setShowFavoritesOnly(false); }}
                        className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border snap-start ${activeCategory === cat && !showFavoritesOnly ? 'border-transparent text-white shadow-md transform scale-105' : 'bg-zinc-50 border-zinc-100 text-zinc-600'}`}
                        style={activeCategory === cat && !showFavoritesOnly ? { backgroundColor: themeColor, color: textColorOnTheme } : {}}
                     >
                        {cat}
                     </button>
                 ))}
                 {/* Spacer */}
                 <div className="w-6 shrink-0" />
             </div>
          </div>

          {/* Catalogue Grid */}
          <div className="px-4 py-6">
             <div className="flex justify-between items-end mb-6">
                 <div>
                    <h3 className="text-xl font-bold font-serif text-zinc-900">
                        {showFavoritesOnly ? "Your Favorites" : (activeCategory === "All" ? "New Arrivals" : activeCategory)}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">{displayCatalogue.length} products found</p>
                 </div>
             </div>

             {displayCatalogue.length === 0 ? (
                 <div className="py-20 text-center">
                     <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Search className="text-zinc-300" size={24} />
                     </div>
                     <p className="text-zinc-500 text-sm font-medium">No products found.</p>
                     {showFavoritesOnly && <button onClick={() => setShowFavoritesOnly(false)} className="mt-4 text-xs font-bold underline">Browse All</button>}
                 </div>
             ) : (
                 <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                     {displayCatalogue.map(product => {
                         const stockStatus = getStockStatus(product.stock);
                         return (
                             <div 
                                key={product.id} 
                                onClick={() => setSelectedProduct(product)}
                                className="group cursor-pointer"
                             >
                                 <div className="aspect-[3/4] rounded-2xl bg-zinc-100 overflow-hidden mb-3 relative shadow-sm">
                                     {product.image ? (
                                         <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-50">
                                             <ShoppingBag size={24} />
                                         </div>
                                     )}
                                     
                                     {/* Out of Stock Overlay in Grid */}
                                     {!stockStatus.buyable && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
                                            <span className="bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full">Sold Out</span>
                                        </div>
                                     )}
                                     
                                     {/* Wishlist Button */}
                                     <button 
                                        onClick={(e) => toggleFavorite(e, product.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm z-20 hover:scale-110 transition-transform"
                                     >
                                         <Heart size={14} className={favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-zinc-600"} />
                                     </button>
                                     
                                     {product.category === 'Sale' && stockStatus.buyable && (
                                         <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">SALE</span>
                                     )}
                                 </div>
                                 <h4 className="font-bold text-sm text-zinc-900 leading-tight mb-1 line-clamp-2">{product.name}</h4>
                                 <div className="flex items-center gap-2">
                                     <span className="font-bold text-sm" style={{ color: themeColor }}>{getDisplayPrice(product.price)}</span>
                                     {/* Fake original price logic for demo */}
                                     {product.category === 'Sale' && (
                                         <span className="text-xs text-zinc-400 line-through decoration-zinc-400 decoration-1">
                                             {getDisplayPrice((parseFloat(product.price?.replace(/[^0-9.]/g, '') || "0") * 1.2).toString())}
                                         </span>
                                     )}
                                 </div>
                             </div>
                         );
                     })}
                 </div>
             )}
          </div>

          {/* About Section */}
          <section className="px-5 py-10 bg-zinc-50 border-t border-zinc-100">
              <div className="text-center max-w-sm mx-auto">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-zinc-900">
                        <Quote size={20} className="fill-current opacity-20" />
                   </div>
                   <h3 className="font-serif font-bold text-xl mb-3">Our Story</h3>
                   <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                       {content?.aboutText || business.description || "We are passionate about providing the best quality products to our customers."}
                   </p>
                   
                   {content?.valueProps && (
                       <div className="grid grid-cols-1 gap-3 mt-8 text-left">
                           {content.valueProps.map((prop, i) => (
                               <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-zinc-100">
                                   <div className="p-1.5 bg-green-50 text-green-600 rounded-full mt-0.5 shrink-0">
                                       <Star size={12} fill="currentColor" />
                                   </div>
                                   <span className="text-xs font-bold text-zinc-700">{prop}</span>
                               </div>
                           ))}
                       </div>
                   )}
              </div>
          </section>

          {/* Contact Section */}
          <section className="px-5 py-10 bg-white">
               <h3 className="font-serif font-bold text-xl mb-6">Visit Us</h3>
               
               <div className="space-y-4">
                   <div className="flex gap-4">
                       <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center shrink-0">
                           <MapPin size={18} className="text-zinc-600" />
                       </div>
                       <div>
                           <h4 className="font-bold text-sm mb-1">Address</h4>
                           <p className="text-sm text-zinc-500 leading-relaxed">{addressString}</p>
                       </div>
                   </div>

                   <div className="flex gap-4">
                       <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center shrink-0">
                           <Clock size={18} className="text-zinc-600" />
                       </div>
                       <div>
                           <h4 className="font-bold text-sm mb-1">Opening Hours</h4>
                           {todaySchedule ? (
                               <p className="text-sm text-zinc-500">
                                   Today: {todaySchedule.isClosed ? <span className="text-red-500 font-bold">Closed</span> : <span className="text-green-600 font-bold">Open {formatTime(todaySchedule.startTime)} - {formatTime(todaySchedule.endTime)}</span>}
                               </p>
                           ) : (
                               <p className="text-sm text-zinc-500">Check schedule</p>
                           )}
                           <button className="text-xs font-bold text-zinc-400 mt-1 underline">See full week</button>
                       </div>
                   </div>
                   
                   <div className="flex gap-4">
                       <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center shrink-0">
                           <Mail size={18} className="text-zinc-600" />
                       </div>
                       <div className="flex-1">
                           <h4 className="font-bold text-sm mb-3">Send Message</h4>
                           <form onSubmit={handleContactSubmitForm} className="space-y-3">
                               <input 
                                  required
                                  value={contactForm.name}
                                  onChange={e => setContactForm({...contactForm, name: e.target.value})}
                                  placeholder="Your Name" 
                                  className="w-full bg-zinc-50 border-none rounded-lg text-sm px-4 py-3 font-medium placeholder:font-normal focus:ring-1 focus:ring-zinc-300" 
                               />
                               <input 
                                  required
                                  type="tel"
                                  value={contactForm.phone}
                                  onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                                  placeholder="Phone Number" 
                                  className="w-full bg-zinc-50 border-none rounded-lg text-sm px-4 py-3 font-medium placeholder:font-normal focus:ring-1 focus:ring-zinc-300" 
                               />
                               <textarea 
                                  value={contactForm.query}
                                  onChange={e => setContactForm({...contactForm, query: e.target.value})}
                                  placeholder="How can we help?" 
                                  rows={2} 
                                  className="w-full bg-zinc-50 border-none rounded-lg text-sm px-4 py-3 font-medium placeholder:font-normal focus:ring-1 focus:ring-zinc-300 resize-none" 
                               />
                               <button 
                                  disabled={isSubmittingContact || contactSuccess}
                                  type="submit" 
                                  style={{ backgroundColor: contactSuccess ? "#22c55e" : themeColor, color: textColorOnTheme }}
                                  className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                               >
                                  {isSubmittingContact ? "Sending..." : contactSuccess ? "Sent Successfully!" : "Send Message"}
                                  {!isSubmittingContact && !contactSuccess && <Send size={14} />}
                               </button>
                           </form>
                       </div>
                   </div>
               </div>
          </section>

          {/* Footer */}
          <footer className="bg-zinc-900 text-zinc-400 py-10 px-5 text-center">
               <div className="flex justify-center gap-6 mb-8">
                   {business.facebook && <a href={business.facebook} className="hover:text-white transition-colors"><Facebook size={20} /></a>}
                   {business.instagram && <a href={business.instagram} className="hover:text-white transition-colors"><Instagram size={20} /></a>}
                   <a href={`mailto:${business.email}`} className="hover:text-white transition-colors"><Mail size={20} /></a>
               </div>
               <p className="text-xs leading-relaxed max-w-xs mx-auto mb-6">
                   {content?.footerBio || "Thank you for visiting our store. We hope you have a wonderful shopping experience."}
               </p>
               <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                   &copy; {new Date().getFullYear()} {business.businessName}
               </div>
          </footer>
      </main>

      {/* Product Detail Modal - Absolute Positioned for correct nesting */}
      {selectedProduct && (() => {
          const status = getStockStatus(selectedProduct.stock);
          const images = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];

          return (
            <div className="absolute inset-0 z-[60] bg-white animate-in slide-in-from-bottom-5 flex flex-col">
                {/* Nav */}
                <div className="flex justify-between items-center p-4 absolute top-0 w-full z-10 pointer-events-none">
                    <button 
                        onClick={() => setSelectedProduct(null)}
                        className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-zinc-900 pointer-events-auto hover:bg-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={(e) => toggleFavorite(e, selectedProduct.id)}
                        className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm pointer-events-auto hover:bg-white transition-colors"
                    >
                        <Heart size={20} className={favorites.has(selectedProduct.id) ? "fill-red-500 text-red-500" : "text-zinc-900"} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
                    {/* Swipeable Image Carousel */}
                    <div className="relative w-full aspect-[3/4] bg-zinc-100 group">
                        <div 
                            ref={imageScrollRef}
                            onScroll={handleImageScroll}
                            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                        >
                            {images.map((img, idx) => (
                                <img 
                                    key={idx}
                                    src={img}
                                    className="w-full h-full object-cover shrink-0 snap-center" 
                                    alt={`${selectedProduct.name} ${idx + 1}`}
                                />
                            ))}
                        </div>
                        
                        {/* Pagination Dots */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/20 backdrop-blur-md rounded-full">
                                {images.map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === detailImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 -mt-6 bg-white rounded-t-[2rem] relative z-10 min-h-[50vh]">
                        <div className="w-12 h-1 bg-zinc-200 rounded-full mx-auto mb-6 opacity-50"></div>
                        
                        <div className="flex justify-between items-start mb-2">
                            <h1 className="text-2xl font-serif font-bold text-zinc-900 pr-4 leading-tight">{selectedProduct.name}</h1>
                            <span className="text-xl font-bold whitespace-nowrap" style={{ color: themeColor }}>
                                {getDisplayPrice(selectedProduct.price)}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                {selectedProduct.category}
                            </span>
                            <span className={`text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded-lg ${status.bg} ${status.color}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${status.indicator}`}></div>
                                {status.label}
                            </span>
                        </div>

                        <div className="prose prose-sm text-zinc-500 leading-relaxed mb-8">
                            <p>{selectedProduct.description || "No description available for this product."}</p>
                        </div>

                        {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                            <div className="mb-8 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Specifications</h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                    {Object.entries(selectedProduct.specs).map(([key, val]) => (
                                        <div key={key}>
                                            <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wide">{key}</span>
                                            <span className="text-sm font-bold text-zinc-800">{val as string}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Bottom Bar */}
                <div className="absolute bottom-0 w-full p-4 bg-white border-t border-zinc-100 flex items-center gap-4 z-20 pb-8 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                        <button className="w-6 h-6 flex items-center justify-center font-bold text-zinc-500 hover:text-black transition-colors">-</button>
                        <span className="text-sm font-bold w-4 text-center">1</span>
                        <button className="w-6 h-6 flex items-center justify-center font-bold text-zinc-500 hover:text-black transition-colors">+</button>
                    </div>
                    <button 
                        disabled={!status.buyable}
                        onClick={handleAddToCart}
                        style={{ backgroundColor: status.buyable ? themeColor : undefined, color: status.buyable ? textColorOnTheme : undefined }}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${!status.buyable ? 'opacity-50 cursor-not-allowed bg-zinc-300 text-zinc-500 shadow-none' : ''}`}
                    >
                        {status.buyable ? (
                            <><ShoppingBag size={18} /> Add to Cart</>
                        ) : (
                            "Out of Stock"
                        )}
                    </button>
                </div>
            </div>
          );
      })()}
    </div>
  );
};
