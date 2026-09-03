// src/types/index.ts
// ============================================================
// Doo Market - Unified Production Types Specification
// React 19 + TypeScript + Supabase Auth + PostgreSQL + RLS + Guest Checkout
// ============================================================

// ============================================================
// 1. Shared Enums & Identifiers
// ============================================================

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivering'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'cod'
  | 'card'
  | 'wallet'
  | 'bank_transfer';

/**
 * ✅ User Roles (database/profile roles)
 * Guest is an unauthenticated state (user === null), not a stored database role.
 */
export type UserRole =
  | 'buyer'
  | 'admin'
  | 'manager'
  | 'support';

export type SectionType =
  | 'flash'
  | 'category'
  | 'featured'
  | 'new'
  | 'bestsellers'
  | 'promo';

export type NotificationType =
  | 'order'
  | 'payment'
  | 'shipping'
  | 'promotion'
  | 'system';

export type ErrorLevel =
  | 'info'
  | 'warning'
  | 'error'
  | 'critical';

/**
 * ✅ Unified String Identifier for all Supabase UUIDs/IDs
 */
export type EntityId = string;

// ============================================================
// 2. Utility Types
// ============================================================

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type WithTimestamps = {
  createdAt: string;
  updatedAt?: string;
};

export type WithActive = {
  active: boolean;
};

export type WithOrder = {
  order: number;
};

// ============================================================
// 3. Core Store Types
// ============================================================

export interface Category extends Partial<WithTimestamps> {
  id: EntityId;
  name: string;
  nameEn: string;
  icon: string;
  image: string;
  color: string;
  order: number;
  active: boolean;
  parentId?: EntityId;
  children?: Category[];
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * ✅ Optional color and size for non-clothing variants
 */
export interface ProductVariant {
  id: EntityId;
  color?: string;
  size?: string;
  stock: number;
  sku?: string;
  price?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  attributes?: Record<string, string>;
}

export interface Product extends Partial<WithTimestamps> {
  id: EntityId;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  originalPrice: number;
  costPrice?: number;
  images: string[];
  categoryId: EntityId;
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
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  metaTitle?: string;
  metaDescription?: string;
  viewedCount?: number;
  wishlistCount?: number;
}

export interface Banner {
  id: EntityId;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  link: string;
  buttonText: string;
  order: number;
  active: boolean;
  bgColor: string;
  textColor?: string;
  startDate?: string;
  endDate?: string;
  type?: 'banner' | 'popup' | 'slider';
}

export interface Section {
  id: EntityId;
  type: SectionType;
  title: string;
  subtitle: string;
  active: boolean;
  order: number;
  categoryId?: EntityId;
  promoText?: string;
  promoColor?: string;
  bannerImage?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerButtonText?: string;
  bannerLink?: string;
  showBanner?: boolean;
  productIds?: EntityId[];
  limit?: number;
  layout?: 'grid' | 'slider' | 'list';
  backgroundColor?: string;
}

export interface StoreSettings {
  siteName: string;
  brandMark: string;
  siteTagline: string;
  currency: string;
  currencySymbol: string;
  primaryColor: string;
  secondaryColor?: string;
  phone: string;
  email: string;
  whatsapp: string;
  address?: string;
  mapLocation?: string;
  freeShippingMin: number;
  shippingCost?: number;
  estimatedDeliveryDays?: number;
  announcement: string;
  showAnnouncement: boolean;
  qrImage: string;
  qrTitle: string;
  qrSubtitle: string;
  showQr: boolean;
  socialFacebook: string;
  socialX: string;
  socialYoutube: string;
  socialInstagram: string;
  socialTelegram: string;
  socialTiktok?: string;
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
  enableCod?: boolean;
  enableCardPayment?: boolean;
  enableWalletPayment?: boolean;
  taxPercentage?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  favicon?: string;
}

// ============================================================
// 4. Cart & Order Types (Retaining UI Selection Attributes)
// ============================================================

export interface CartItem {
  productId: EntityId;
  variantId?: EntityId;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
  priceAtAdd?: number;
  originalPriceAtAdd?: number;
  discountAppliedAtAdd?: number;
  reservedUntil?: string;
  maxQuantity?: number;
  flashDealEndsAt?: string;
  addedAt?: string;
}

export interface OrderItem {
  productId: EntityId;
  variantId?: EntityId;
  name: string;
  price: number;
  originalPrice?: number;
  discountApplied?: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  sku?: string;
  weight?: number;
  totalPrice?: number;
  taxAmount?: number;
}

export interface Order {
  id: EntityId;
  orderNumber?: string;
  userId?: EntityId;
  guestEmail?: string;
  guestPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax?: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  customer: {
    name: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
  };
  shippingAddress?: {
    name: string;
    phone: string;
    city: string;
    address: string;
    postalCode?: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    city: string;
    address: string;
    postalCode?: string;
  };
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
  trackingSteps?: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    location?: string;
    trackingNumber?: string;
  }[];
  discountCode?: string;
  discountAmount?: number;
  notes?: string;
}

// ============================================================
// 5. User Profiles, Addresses & Support Tickets
// ============================================================

export interface User extends Partial<WithTimestamps> {
  id: EntityId;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  orderCount?: number;
  totalSpent?: number;
  lastLoginAt?: string;
  joinedAt?: string;
  cart?: any[];
  wishlist?: any[];
  preferredCurrency?: string;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Address extends Partial<WithTimestamps> {
  id: EntityId;
  userId: EntityId;
  name: string;
  city: string;
  district?: string;
  street: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  postalCode?: string;
  phone: string;
  notes?: string;
  isDefault: boolean;
}

export interface Review extends Partial<WithTimestamps> {
  id: EntityId;
  productId: EntityId;
  userId?: EntityId;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  verifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: string;
  response?: {
    comment: string;
    createdAt: string;
  };
}

export interface Reservation {
  id: EntityId;
  productId: EntityId;
  variantId?: EntityId;
  userId: EntityId;
  quantity: number;
  expiresAt: string;
  createdAt: string;
}

// ============================================================
// 6. Notifications & Support Tickets (Guest Compatible)
// ============================================================

export interface Notification {
  id: EntityId;
  userId: EntityId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface SupportTicketMessage {
  id: EntityId;
  sender: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface SupportTicket extends Partial<WithTimestamps> {
  id: EntityId;
  userId?: EntityId;
  guestEmail?: string;
  guestPhone?: string;
  userEmail?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'order' | 'payment' | 'shipping' | 'product' | 'account' | 'other';
  attachment?: string[];
  messages?: SupportTicketMessage[];
}

// ============================================================
// 7. Full Shop Data State
// ============================================================

export interface ShopData {
  settings: StoreSettings;
  categories: Category[];
  banners: Banner[];
  sections: Section[];
  products: Product[];
  orders?: Order[];
  reviews?: Review[];
  reservations?: Reservation[];
  notifications?: Notification[];
  users?: User[];
  addresses?: Address[];
  supportTickets?: SupportTicket[];
}

// ============================================================
// 8. API Response Interfaces
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface UploadedFile {
  id: EntityId;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

// ============================================================
// 9. Auth Forms & Validation Types
// ============================================================

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

export interface UpdateProfileFormData {
  name: string;
  phone: string;
  email?: string;
  avatar?: File;
  bio?: string;
  birthDate?: string;
}

export interface AddressFormData {
  name: string;
  city: string;
  district?: string;
  street: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  postalCode?: string;
  phone: string;
  notes?: string;
  isDefault: boolean;
}
