export interface Channel {
  id: string;
  title: string;
  youtubeUrl: string;
  niche: string;
  description: string;
  subscribers: number;
  monthlyViews: number;
  monthlyRevenue: number;
  audienceCountry: string;
  channelAge: string;
  monetized: boolean;
  shorts: boolean; // True if Shorts-focused channel
  price: number;
  whatsappNumber: string;
  featured: boolean;
  status: 'available' | 'sold';
  images: string[];
  createdAt: any; // Timestamp or Date ISO string
  updatedAt: any; // Timestamp or Date ISO string
  soldPrice?: number;
  soldDate?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AppSettings {
  whatsappNumber: string;
  appName: string;
  currencySymbol: string;
}

export interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number;
  role: string;
  createdAt: any;
}

export interface HomepageStats {
  totalListings: number;
  totalSold: number;
  totalSubscribersSold: number;
  totalMarketplaceValue: number;
}
