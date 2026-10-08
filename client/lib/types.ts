export type BusinessCategory =
  | "medicine"
  | "gym"
  | "grocery"
  | "electronics"
  | "restaurant"
  | "salon"
  | "custom";

export interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  isAvailable: boolean;
}

export interface BusinessAccount {
  id: string;
  domain?: string;
  businessName: string;
  category: BusinessCategory;
  categoryLabel: string;
  ownerName: string;
  phone: string;
  email?: string;
  address?: string;
  currency: string;
  workingHours: string;
  greetingMessage: string;
  aiPersonaPrompt: string;
  antiBanDelay: {
    min: number;
    max: number;
    typingSimulation: boolean;
    typingSpeedWpm: number;
  };
  enableAi: boolean;
  enableStockQueries: boolean;
  allowedChats: string;
  apiKey: string;
  webhookUrl?: string;
  status: "connected" | "qr_ready" | "disconnected";
  phoneNumber?: string;
  catalog: CatalogItem[];
  createdAt: string;
  stats: {
    totalMessages: number;
    inboundQueries: number;
    ordersPlaced: number;
    stockInquiries: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: "customer" | "business" | "system";
  text: string;
  mediaUrl?: string;
  timestamp: string;
  isAiGenerated?: boolean;
  status?: "sent" | "delivered" | "read" | "typing";
}

export interface BusinessTemplate {
  id: BusinessCategory;
  title: string;
  shortDesc: string;
  tagline: string;
  iconName: string;
  badge: string;
  accentColor: string;
  sampleCatalog: CatalogItem[];
  defaultGreeting: string;
  defaultPrompt: string;
  quickQuestions: string[];
  sampleInteractions: {
    user: string;
    bot: string;
  }[];
}

export const BUSINESS_TEMPLATES: Record<BusinessCategory, BusinessTemplate> = {
  medicine: {
    id: "medicine",
    title: "Medicine & Pharmacy Shop",
    shortDesc: "Prescription refills, medicine stock lookup, dosage guidelines & emergency orders.",
    tagline: "Instant medicine availability & prescription delivery on WhatsApp",
    iconName: "Pill",
    badge: "Healthcare & Pharma",
    accentColor: "emerald",
    defaultGreeting: "👋 Hello! Welcome to {BusinessName}. Send your prescription photo or ask for any medicine name to check instant stock and price.",
    defaultPrompt: "You are an empathetic, certified pharmacy assistant for {BusinessName}. You provide instant medicine availability, prices, dosage precautions, and accept prescription orders politely.",
    quickQuestions: [
      "Is Paracetamol 650mg in stock?",
      "Do you have Blood Sugar test strips?",
      "Can I send prescription photo?",
      "What is the price of Vitamin C tablets?",
      "Do you have Baby Diapers Size L?"
    ],
    sampleInteractions: [
      {
        user: "Do you have Paracetamol 650 and what's the price?",
        bot: "✅ *Paracetamol 650mg (Dolo)* is in stock! Price is *₹32.00 per strip (15 tablets)*. We have 120 strips available. Would you like to order?"
      },
      {
        user: "Is Amoxicillin 500mg available?",
        bot: "📦 *Amoxicillin 500mg* is currently in stock (*45 boxes*). Price: *₹115.00/strip*. Please attach a doctor's prescription for antibiotics."
      }
    ],
    sampleCatalog: [
      { id: "med-1", sku: "MED-001", name: "Paracetamol 650mg (Dolo)", category: "Fever & Pain", price: 32.0, stock: 120, unit: "strip", description: "15 tablets per strip", isAvailable: true },
      { id: "med-2", sku: "MED-002", name: "Amoxicillin 500mg Capsules", category: "Antibiotics", price: 115.0, stock: 45, unit: "strip", description: "10 capsules per strip (Rx required)", isAvailable: true },
      { id: "med-3", sku: "MED-003", name: "Vitamin C + Zinc Chewable", category: "Supplements", price: 95.0, stock: 80, unit: "bottle", description: "60 chewable tablets", isAvailable: true },
      { id: "med-4", sku: "MED-004", name: "Digital Infrared Thermometer", category: "Medical Devices", price: 850.0, stock: 15, unit: "pcs", description: "Non-contact fast reading", isAvailable: true },
      { id: "med-5", sku: "MED-005", name: "Antiseptic Disinfectant Liquid 500ml", category: "First Aid", price: 160.0, stock: 35, unit: "bottle", description: "Antibacterial antiseptic", isAvailable: true }
    ]
  },
  gym: {
    id: "gym",
    title: "Gym & Fitness Club",
    shortDesc: "Membership renewals, trainer slot bookings, workout plans & supplement sales.",
    tagline: "Automate membership queries, personal trainer bookings & protein orders",
    iconName: "Dumbbell",
    badge: "Health & Fitness",
    accentColor: "blue",
    defaultGreeting: "💪 Hey Champion! Welcome to {BusinessName}. Ask about membership plans, personal training slots, or workout timings.",
    defaultPrompt: "You are a motivating fitness consultant and desk manager for {BusinessName}. You answer membership pricing, personal trainer bookings, supplements stock, and gym timing inquiries with energy.",
    quickQuestions: [
      "What are the 3-month & 1-year membership fees?",
      "What are the morning gym timings?",
      "Do you have Whey Protein Isolate in stock?",
      "How to book a trial personal trainer session?",
      "Is Zumba and CrossFit included?"
    ],
    sampleInteractions: [
      {
        user: "What are your membership plans?",
        bot: "🔥 *Membership Plans at {BusinessName}:*\n• *Monthly Pass:* ₹1,499/mo\n• *Quarterly (3 Months):* ₹3,899 (Save 15%)\n• *Annual VIP Plan:* ₹12,999 (Includes free trainer trial & steam bath)\n\nWould you like to book a *Free 1-Day Trial Pass* today?"
      },
      {
        user: "Do you have Whey Protein in stock?",
        bot: "🥛 *100% Gold Standard Whey Protein (2kg Chocolate)* is in stock! Price: *₹4,999*. We have 8 tubs left. Free shaker bottle included!"
      }
    ],
    sampleCatalog: [
      { id: "gym-1", sku: "GYM-M01", name: "Monthly Fitness Membership", category: "Memberships", price: 1499.0, stock: 999, unit: "month", description: "Full gym & cardio access", isAvailable: true },
      { id: "gym-2", sku: "GYM-M03", name: "Quarterly Transformation Pass (3 Mo)", category: "Memberships", price: 3899.0, stock: 999, unit: "quarter", description: "Gym + Diet Consultation", isAvailable: true },
      { id: "gym-3", sku: "GYM-ANN", name: "Annual Elite VIP Membership", category: "Memberships", price: 12999.0, stock: 999, unit: "year", description: "All-access + Locker + Steam", isAvailable: true },
      { id: "gym-4", sku: "SUP-001", name: "Whey Protein Isolate (2kg Chocolate)", category: "Supplements", price: 4999.0, stock: 18, unit: "tub", description: "24g protein per scoop", isAvailable: true },
      { id: "gym-5", sku: "SUP-002", name: "Creatine Monohydrate (300g Micronized)", category: "Supplements", price: 999.0, stock: 30, unit: "tub", description: "Strength & endurance boost", isAvailable: true }
    ]
  },
  grocery: {
    id: "grocery",
    title: "Grocery & Supermarket",
    shortDesc: "Daily grocery list ordering, fresh vegetable stock, instant bill calculation & doorstep delivery.",
    tagline: "Turn WhatsApp into a 24/7 online grocery store with instant cart billing",
    iconName: "ShoppingCart",
    badge: "Retail & Daily Needs",
    accentColor: "amber",
    defaultGreeting: "🛒 Hello! Welcome to {BusinessName}. Simply send your grocery list or ask for fresh fruits, vegetables, rice, and daily essentials.",
    defaultPrompt: "You are a helpful grocery store manager for {BusinessName}. You check live stock of groceries, calculate cart totals, and confirm home delivery orders with customer delivery address.",
    quickQuestions: [
      "What is the price of 5kg Basmati Rice?",
      "Do you have fresh Cow Milk & Butter?",
      "Can I send my handwritten grocery list?",
      "What is the minimum order for free delivery?",
      "Do you have Mustard Oil 1L pouch?"
    ],
    sampleInteractions: [
      {
        user: "How much is 5kg Fortune Basmati Rice?",
        bot: "🌾 *Fortune Royal Basmati Rice (5kg Bag)* is in stock! Price: *₹495.00* (MRP ₹560, you save ₹65). Would you like home delivery?"
      },
      {
        user: "I need 2L Milk, 1kg Sugar, and 500g Amul Butter",
        bot: "🛍️ *Your Order Summary:*\n1. Fresh Cow Milk (2L) - ₹120.00\n2. Premium Sugar (1kg) - ₹46.00\n3. Amul Butter (500g) - ₹275.00\n━━━━━━━━━━━━━━━\n*Total Amount:* *₹441.00*\n\nPlease reply with your *Delivery Address* to confirm dispatch within 45 mins! 🚚"
      }
    ],
    sampleCatalog: [
      { id: "groc-1", sku: "GROC-01", name: "Fortune Basmati Rice (5kg Bag)", category: "Grains & Rice", price: 495.0, stock: 45, unit: "bag", description: "Long grain aromatic rice", isAvailable: true },
      { id: "groc-2", sku: "GROC-02", name: "Fresh Cow Milk (1 Litre Pouch)", category: "Dairy", price: 60.0, stock: 80, unit: "pouch", description: "Daily morning fresh milk", isAvailable: true },
      { id: "groc-3", sku: "GROC-03", name: "Amul Butter (500g Block)", category: "Dairy", price: 275.0, stock: 24, unit: "pcs", description: "Pasteurized salted butter", isAvailable: true },
      { id: "groc-4", sku: "GROC-04", name: "Refined Sunflower Oil (1 Litre)", category: "Cooking Essentials", price: 145.0, stock: 60, unit: "bottle", description: "Healthy heart cooking oil", isAvailable: true },
      { id: "groc-5", sku: "GROC-05", name: "Organic Farm Eggs (Pack of 12)", category: "Dairy & Eggs", price: 110.0, stock: 50, unit: "tray", description: "Fresh farm protein eggs", isAvailable: true }
    ]
  },
  electronics: {
    id: "electronics",
    title: "Electronics & Gadgets Shop",
    shortDesc: "Specs comparison, gadget price inquiries, warranty check & digital invoice sending.",
    tagline: "Provide live gadget pricing, warranty checks & automatic invoice dispatch",
    iconName: "Tv",
    badge: "Consumer Tech",
    accentColor: "indigo",
    defaultGreeting: "⚡ Welcome to {BusinessName}! Ask for mobile, laptop, earphones, monitor specs, best discounts, and live availability.",
    defaultPrompt: "You are an expert electronics sales advisor for {BusinessName}. You answer technical specifications, compare models, provide discounts, check stock, and share warranty details concisely.",
    quickQuestions: [
      "Do you have Wireless Noise-Cancelling Headphones?",
      "What is the price of 65W Fast Charger?",
      "Do you have RGB Mechanical Keyboards in stock?",
      "What is the warranty on Smartwatches?",
      "Do you offer 0% EMI options?"
    ],
    sampleInteractions: [
      {
        user: "What mechanical keyboards do you have?",
        bot: "⌨️ *Mechanical Keyboards in Stock:*\n• *RGB Gaming Mechanical Keyboard (Blue Switch)* - *₹2,499.00* (14 pcs left)\n• *Wireless Compact 75% Keyboard* - *₹3,999.00* (6 pcs left)\n\nBoth include *1-Year Manufacturer Warranty* & free Type-C cable!"
      },
      {
        user: "Price of 65W GaN Charger?",
        bot: "⚡ *65W Dual Port GaN Fast Charger (Type-C + USB-A)* is *₹1,299.00*. In stock: *28 units*. Charges iPhone/Android/Laptops in 35 mins!"
      }
    ],
    sampleCatalog: [
      { id: "elec-1", sku: "ELEC-K01", name: "RGB Mechanical Gaming Keyboard", category: "Peripherals", price: 2499.0, stock: 14, unit: "pcs", description: "Tactile Blue switches with RGB", isAvailable: true },
      { id: "elec-2", sku: "ELEC-M01", name: "Wireless Ergonomic Mouse 2.4G", category: "Peripherals", price: 899.0, stock: 35, unit: "pcs", description: "Silent click, 4000 DPI sensor", isAvailable: true },
      { id: "elec-3", sku: "ELEC-A01", name: "Active Noise-Cancelling Earbuds", category: "Audio", price: 2999.0, stock: 20, unit: "pcs", description: "35dB ANC with 30hr battery", isAvailable: true },
      { id: "elec-4", sku: "ELEC-C01", name: "65W GaN Dual Port Fast Charger", category: "Accessories", price: 1299.0, stock: 28, unit: "pcs", description: "Type-C PD 3.0 & USB-A QC 4.0", isAvailable: true },
      { id: "elec-5", sku: "ELEC-D01", name: "27-inch 2K QHD Gaming Monitor 165Hz", category: "Displays", price: 18999.0, stock: 5, unit: "pcs", description: "IPS 1ms HDR400 FreeSync", isAvailable: true }
    ]
  },
  restaurant: {
    id: "restaurant",
    title: "Restaurant, Cafe & Cloud Kitchen",
    shortDesc: "Digital menu card sharing, table reservations, takeaway orders & review collection.",
    tagline: "Automate digital menu cards, table bookings & takeaway food orders",
    iconName: "Utensils",
    badge: "Food & Hospitality",
    accentColor: "rose",
    defaultGreeting: "🍽️ Welcome to {BusinessName}! Check our today's special menu, book a table, or place an instant takeaway order.",
    defaultPrompt: "You are a hospitable restaurant host for {BusinessName}. You share menus, suggest chef specials, handle table bookings, and record takeaway orders.",
    quickQuestions: [
      "Send me today's food menu with prices",
      "Do you have table available for 4 people tonight?",
      "What are your top vegetarian chef specials?",
      "What is the delivery time for Chicken Biryani?",
      "Do you have gluten-free dessert options?"
    ],
    sampleInteractions: [
      {
        user: "Can you send the dinner menu?",
        bot: "📋 *Chef's Signature Specials at {BusinessName}:*\n🍗 *Royal Dum Chicken Biryani* - ₹340.00\n🧀 *Paneer Butter Masala (Handi)* - ₹280.00\n🫓 *Butter Garlic Naan* - ₹60.00\n🍨 *Sizzling Brownie with Ice Cream* - ₹180.00\n\nReply with items to place an instant takeaway or delivery order! 🛵"
      }
    ],
    sampleCatalog: [
      { id: "rest-1", sku: "FOOD-B01", name: "Royal Dum Chicken Biryani (Special)", category: "Main Course", price: 340.0, stock: 50, unit: "plate", description: "Aromatic basmati with tender chicken", isAvailable: true },
      { id: "rest-2", sku: "FOOD-P01", name: "Paneer Butter Masala (Rich Gravy)", category: "Vegetarian", price: 280.0, stock: 40, unit: "handi", description: "Fresh cottage cheese in butter gravy", isAvailable: true },
      { id: "rest-3", sku: "FOOD-N01", name: "Butter Garlic Naan", category: "Breads", price: 60.0, stock: 200, unit: "pcs", description: "Crisp tandoori naan with roasted garlic", isAvailable: true },
      { id: "rest-4", sku: "FOOD-D01", name: "Sizzling Chocolate Brownie", category: "Dessert", price: 180.0, stock: 30, unit: "portion", description: "Hot walnut brownie with vanilla scoop", isAvailable: true }
    ]
  },
  salon: {
    id: "salon",
    title: "Salon, Spa & Beauty Care",
    shortDesc: "Appointment slot booking, beauty service price list, stylist scheduling & reminder pings.",
    tagline: "Effortless WhatsApp appointment bookings & service price lists",
    iconName: "Scissors",
    badge: "Beauty & Wellness",
    accentColor: "purple",
    defaultGreeting: "✨ Welcome to {BusinessName}! Check our beauty & grooming services, spa packages, or book your salon appointment.",
    defaultPrompt: "You are an elegant salon receptionist for {BusinessName}. You share service rate cards, recommend bridal or spa packages, and confirm appointment slots.",
    quickQuestions: [
      "What is the price for Haircut + Beard Styling?",
      "Can I book an appointment for tomorrow 4 PM?",
      "What facial packages do you offer?",
      "Do you provide bridal makeup services?",
      "What is the pricing for Keratin hair treatment?"
    ],
    sampleInteractions: [
      {
        user: "What are your hair treatment prices?",
        bot: "💇‍♀️ *Hair Styling & Treatment Menu:*\n• *Executive Haircut & Styling:* ₹450.00\n• *Keratin Protein Treatment:* ₹3,200.00\n• *Deep Conditioning Hair Spa:* ₹1,100.00\n\nWhich service would you like to book for?"
      }
    ],
    sampleCatalog: [
      { id: "sal-1", sku: "SAL-H01", name: "Executive Haircut & Beard Grooming", category: "Hair & Grooming", price: 450.0, stock: 999, unit: "service", description: "Precision wash, cut, and beard sculpting", isAvailable: true },
      { id: "sal-2", sku: "SAL-S01", name: "Organic Hydrating Hair Spa", category: "Hair Care", price: 1100.0, stock: 999, unit: "service", description: "Deep steam nourishment & scalp massage", isAvailable: true },
      { id: "sal-3", sku: "SAL-F01", name: "Gold Radiance Glow Facial", category: "Skin Care", price: 1650.0, stock: 999, unit: "service", description: "60-min ultrasonic brightening facial", isAvailable: true }
    ]
  },
  custom: {
    id: "custom",
    title: "Custom Business / Agency / Store",
    shortDesc: "Universal WhatsApp gateway for any retail shop, coaching institute, real estate, or service provider.",
    tagline: "Build a custom automated WhatsApp bot for any business or service",
    iconName: "Briefcase",
    badge: "Universal",
    accentColor: "slate",
    defaultGreeting: "👋 Hello! Welcome to {BusinessName}. How may we assist you today? Feel free to ask about our services, pricing, or catalog.",
    defaultPrompt: "You are a professional business manager for {BusinessName}. You answer customer inquiries accurately based on our services catalog, provide quotes, and collect lead contact information.",
    quickQuestions: [
      "What services do you provide?",
      "What is your pricing and rate card?",
      "How can I book an initial consultation?",
      "What are your business operating hours?",
      "Can I speak with a human support agent?"
    ],
    sampleInteractions: [
      {
        user: "What are your services and charges?",
        bot: "🏢 Welcome to *{BusinessName}*! We provide premium customized solutions. Let us know what specific requirement you have, and our team will provide an instant quotation."
      }
    ],
    sampleCatalog: [
      { id: "cust-1", sku: "SRV-001", name: "Standard Service Consultation (1 Hr)", category: "Consulting", price: 999.0, stock: 999, unit: "session", description: "Comprehensive discovery and solution plan", isAvailable: true },
      { id: "cust-2", sku: "SRV-002", name: "Full Business Solution Package", category: "Enterprise", price: 8500.0, stock: 999, unit: "project", description: "End-to-end service delivery with SLA", isAvailable: true }
    ]
  }
};
