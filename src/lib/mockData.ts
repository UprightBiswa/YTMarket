import { Channel, Testimonial, HomepageStats } from '../types';

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: "tech-unboxing-pro",
    title: "TechUnbox Pro",
    youtubeUrl: "https://youtube.com/c/techunboxpro-demo",
    niche: "Tech & Gadgets",
    description: "A highly active tech review and unboxing channel with a loyal audience from the USA and UK. Main organic traffic is generated through search queries on trending mobile phones and laptops. High RPM due to premium viewer geographic coordinates. Ideal for affiliate programs and sponsor sponsorships.",
    subscribers: 245000,
    monthlyViews: 680000,
    monthlyRevenue: 3450,
    audienceCountry: "United States",
    channelAge: "3 Years",
    monetized: true,
    shorts: false,
    price: 18500,
    whatsappNumber: "+919144534891",
    featured: true,
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date("2026-01-10T12:00:00Z").toISOString(),
    updatedAt: new Date("2026-06-01T15:30:00Z").toISOString()
  },
  {
    id: "finance-freedom-hub",
    title: "Finance Freedom Hub",
    youtubeUrl: "https://youtube.com/c/financefreedomhub-demo",
    niche: "Finance & Investing",
    description: "Passive income ideas, investing, stock market tutorials, and personal finance tips. Standard long-from evergreen content that gets persistent organic recommended traffic. Extremely high RPM of $14.50 CPM. Full ownership transfer of Google AdSense and email credentials. Zero copyright strikes or restrictions.",
    subscribers: 152000,
    monthlyViews: 310000,
    monthlyRevenue: 4100,
    audienceCountry: "United States",
    channelAge: "2.5 Years",
    monetized: true,
    shorts: false,
    price: 24000,
    whatsappNumber: "+919144534891",
    featured: true,
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date("2026-02-15T09:00:00Z").toISOString(),
    updatedAt: new Date("2026-05-20T11:00:00Z").toISOString()
  },
  {
    id: "gaming-pixel-arena",
    title: "Pixel Arena",
    youtubeUrl: "https://youtube.com/c/pixelarena-demo",
    niche: "Gaming",
    description: "Highly engaged Minecraft and Roblox gameplay Shorts channel with active commentaries. Highly requested live streams audience. Includes active merchandise store setup and secondary Discord community with 4,000 members. No copyright issues.",
    subscribers: 412000,
    monthlyViews: 1450000,
    monthlyRevenue: 1850,
    audienceCountry: "United Kingdom",
    channelAge: "4 Years",
    monetized: true,
    shorts: true,
    price: 15000,
    whatsappNumber: "+919144534891",
    featured: false,
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date("2025-11-01T14:30:00Z").toISOString(),
    updatedAt: new Date("2026-06-03T10:15:00Z").toISOString()
  },
  {
    id: "travel-nomad-diaries",
    title: "Nomad Diaries",
    youtubeUrl: "https://youtube.com/c/nomaddiaries-demo",
    niche: "Travel & Vlogs",
    description: "A travel channel highlighting budget travel hacks, cinematic vlogs, and tour guides. Very highly recommended for anyone who wants to upload talking head or cinematic clips. Solid history of organic growth.",
    subscribers: 88000,
    monthlyViews: 240000,
    monthlyRevenue: 1100,
    audienceCountry: "Canada",
    channelAge: "2 Years",
    monetized: true,
    shorts: false,
    price: 8900,
    whatsappNumber: "+919144534891",
    featured: false,
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date("2026-03-01T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-06-04T12:00:00Z").toISOString()
  },
  {
    id: "crypto-bull-run",
    title: "Crypto Daily Bull",
    youtubeUrl: "https://youtube.com/c/cryptodailybull-demo",
    niche: "Crypto & Web3",
    description: "Specialized niche channel focused on crypto indicators, Web3 developments, and coin analysis. Sold instantly for full requesting price.",
    subscribers: 305000,
    monthlyViews: 980000,
    monthlyRevenue: 5600,
    audienceCountry: "United States",
    channelAge: "1.5 Years",
    monetized: true,
    shorts: false,
    price: 29500,
    whatsappNumber: "+919144534891",
    featured: false,
    status: "sold",
    images: [
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date("2025-10-05T08:00:00Z").toISOString(),
    updatedAt: new Date("2026-05-18T16:45:00Z").toISOString(),
    soldPrice: 28000,
    soldDate: "2026-05-18"
  },
  {
    id: "culinary-mastery-delight",
    title: "Chef's Plate Secrets",
    youtubeUrl: "https://youtube.com/c/chefsplate-demo",
    niche: "Cooking & Food",
    description: "An elegant baking and quick cooking guide. Sold within 24 hours to a food brand looking for an established audience footprint.",
    subscribers: 112000,
    monthlyViews: 450000,
    monthlyRevenue: 1350,
    audienceCountry: "Germany",
    channelAge: "2 Years",
    monetized: false,
    shorts: true,
    price: 6500,
    whatsappNumber: "+919144534891",
    featured: false,
    status: "sold",
    images: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: new Date("2026-04-01T11:00:00Z").toISOString(),
    updatedAt: new Date("2026-05-25T14:20:00Z").toISOString(),
    soldPrice: 6500,
    soldDate: "2026-05-25"
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "testi-1",
    name: "Alex Sterling",
    review: "Sold my 180k tech channel in just 4 days through this marketplace! The WhatsApp ownership hand-off recommended by the admin was flawless and very secure.",
    rating: 5,
    role: "Verified Seller",
    createdAt: new Date("2026-05-20T10:00:00Z").toISOString()
  },
  {
    id: "testi-2",
    name: "Mariam Al-Mansoori",
    review: "I bought a finance-niche channel to bootstrap our brand. The statistics were completely accurate and verified. Outstanding, simple transaction!",
    rating: 5,
    role: "Verified Buyer",
    createdAt: new Date("2026-05-28T14:30:00Z").toISOString()
  },
  {
    id: "testi-3",
    name: "Devon Miller",
    review: "The admin is extremely responsive. Within 2 hours of sending a message regarding the Pixel Arena channel, we had fully negotiated the deal. Highly trustworthy.",
    rating: 5,
    role: "Verified Buyer",
    createdAt: new Date("2026-06-02T09:00:00Z").toISOString()
  }
];

export const INITIAL_STATS: HomepageStats = {
  totalListings: 6,
  totalSold: 2,
  totalSubscribersSold: 417000,
  totalMarketplaceValue: 34500
};

export const NICHES = [
  "Tech & Gadgets",
  "Finance & Investing",
  "Gaming",
  "Travel & Vlogs",
  "Crypto & Web3",
  "Cooking & Food",
  "Health & Fitness",
  "Entertainment & Humor",
  "Education & Science"
];
