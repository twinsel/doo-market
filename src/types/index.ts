export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  image: string;
  color: string;
  order: number;
  active: boolean;
}

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
  sku?: string;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  originalPrice: number;
  images: string[];
  categoryId: string;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
  hasVariants?: boolean;
  hasSizes?: boolean;
  hasColors?: boolean;
  variants?: ProductVariant[];
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  featured?: boolean;
  flashDeal?: boolean;
  flashEndsAt?: string;
  freeShipping?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  isNew?: boolean;
  active: boolean;
  bestseller?: boolean;
  hasCustomLabel?: boolean;
  customLabel?: string;
  customLabelText?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  order: number;
  active: boolean;
  bgColor: string;
}

export interface Section {
  id: string;
  type: 'flash' | 'category' | 'featured' | 'new' | 'bestsellers' | 'promo';
  title: string;
  subtitle: string;
  active: boolean;
  order: number;
  categoryId?: string;
  promoText?: string;
  promoColor?: string;
  bannerImage?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerButtonText?: string;
  bannerLink?: string;
  showBanner?: boolean;
}

export interface StoreSettings {
  siteName: string;
  brandMark: string;
  siteTagline: string;
  currency: string;
  currencySymbol: string;
  primaryColor: string;
  phone: string;
  email: string;
  freeShippingMin: number;
  announcement: string;
  showAnnouncement: boolean;
  whatsapp: string;
  qrImage: string;
  qrTitle: string;
  qrSubtitle: string;
  showQr: boolean;
  socialFacebook: string;
  socialX: string;
  socialYoutube: string;
  socialInstagram: string;
  socialTelegram: string;
  showSocial: boolean;
  showBrandMark?: boolean;
  showWhatsAppSubscribe?: boolean;
  cartHoldHours: number;
  reserveStockInCart: boolean;
  showWelcomeScreen: boolean;
  welcomeMessage: string;
  welcomeDuration: number;
  logoutMessage: string;
  logoutDuration: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  reservedUntil?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivering' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'card' | 'wallet';
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
  };
  createdAt: string;
  updatedAt?: string;
  trackingSteps?: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'admin';
  avatar?: string;
  joinedAt?: string;
  cart?: any[];
  wishlist?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ShopData {
  settings: StoreSettings;
  categories: Category[];
  banners: Banner[];
  sections: Section[];
  products: Product[];
  orders?: Order[];
  reviews?: Review[];
  reservations?: any[];
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
  receiveUpdates?: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}
