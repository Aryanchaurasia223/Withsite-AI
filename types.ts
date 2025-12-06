
export interface BusinessData {
  businessName: string;
  tagline: string;
  industry: string;
  ownerName?: string;
  gstNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone: string;
  email: string;
  logo?: string;
  openingHours: DaySchedule[];
  description: string;
  heroImages: { url: string; alt: string }[];
  foundedYear: string;
  bestSellers: ProductItem[];
  catalogue: ProductItem[];
  categories: CategoryItem[];
  noteBarText: string;
  video?: string;
  themeColor: string;
  font: string;
  currency: string;
  instagram?: string;
  facebook?: string;
  userSeoMetaDescription?: string;
  userSeoKeywords?: string;
  
  // Customizable Product Categories
  productCategories: string[];

  // Dynamic Product Fields (Replacing fixed dropdown/spec fields)
  productFields: {
    id: string;
    label: string;
    options: string[];
  }[];
}

export interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

export interface ProductItem {
  id: string;
  sku?: string;
  name: string;
  image: string;
  images?: string[];
  price?: string;
  salePrice?: string;
  stock?: string;
  description?: string;
  category?: string; 
  
  // Dynamic Specs (Key: Field Label, Value: Selected Option)
  specs?: Record<string, string>;

  // Legacy/Optional fields (kept for compatibility or specific display logic if needed)
  colors?: string[];
  sizes?: string[];
  material?: string;
  dimensions?: string;
  
  dropdownValue?: string;
  isBestSeller?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
}

export interface CollectionItem {
  title: string;
  description: string;
  imageKeyword: string;
}

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  aboutText: string;
  collections: CollectionItem[];
  valueProps: string[];
  metaDescription: string;
  seoKeywords: string[];
  footerBio: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  query: string;
  date: string;
}

export interface User {
  phone: string;
  name: string;
  profileImage?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  image?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered';
  total: string;
  items: string[];
}

export interface CustomerAddress {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  text: string;
}