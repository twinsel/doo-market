// ============================================================
// Doo Market
// src/context/ShopContext.tsx
// ============================================================
// السياق الرئيسي - مع تحميل الطلبات بشكل صحيح

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ShopData, Product, CartItem, Order, User, Review, Category, Banner, Section, StoreSettings } from '../types';
import { initialShopData } from '../data/initialData';
import { getStoreSettings, updateStoreSettings, supabase } from '../lib/supabase';
import {
  syncOrderToSupabase,
  fetchOrdersFromSupabase,
  syncUserToSupabase,
  fetchUsersFromSupabase,
  deleteUserFromSupabase,
  setUserOnlineStatus,
  syncShopStateToSupabase,
  fetchShopStateFromSupabase
} from '../services/supabaseService';

const STORAGE_SHOP_DATA = 'doo_shop_data_v6';
const STORAGE_CART = 'doo_cart_v6';
const STORAGE_WISHLIST = 'doo_wishlist_v6';
const STORAGE_USER = 'doo_buyer_session_v6';
const STORAGE_USERS_LIST = 'doo_users_list_v6';

interface ShopContextType {
  data: ShopData;
  cart: CartItem[];
  wishlist: string[];
  currentUser: User | null;
  registeredUsers: User[];
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  logoutMsg: string;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  addToCart: (productId: string, quantity?: number, selectedColor?: string, selectedSize?: string) => { ok: boolean; isGuest?: boolean; error?: string };
  removeFromCart: (productId: string, selectedColor?: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => { ok: boolean; error?: string };
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  getProduct: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getFlashProducts: () => Product[];
  getFeaturedProducts: () => Product[];
  getNewProducts: () => Product[];
  getBestsellers: () => Product[];
  searchProducts: (query: string) => Product[];
  checkoutOrder: (customer: { name: string; phone: string; city: string; address: string; paymentMethod: 'cod' | 'card' | 'wallet' }) => { ok: boolean; orderId?: string; error?: string };
  addReview: (productId: string, rating: number, comment: string, userName?: string) => void;
  login: (user: Partial<User>) => void;
  logout: () => void;
  deleteUser: (identifier: string, userEmailOpt?: string) => void;
  clearAllUsers: () => void;
  updateSettings: (settings: Partial<StoreSettings>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateSection: (id: string, section: Partial<Section>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  resetData: () => void;
  refreshShopState: () => Promise<void>;
  syncStatus: 'idle' | 'loading' | 'synced';
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage or fallback to initialShopData
  const [data, setData] = useState<ShopData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SHOP_DATA);
      if (saved) {
        const parsed = JSON.parse(saved);

        // التأكد من تحميل الطلبات
        const orders = parsed.orders || initialShopData.orders || [];
        console.log(`📦 تم تحميل ${orders.length} طلب من localStorage`);

        return {
          ...initialShopData,
          ...parsed,
          settings: { ...initialShopData.settings, ...parsed.settings, showAnnouncement: false },
          categories: parsed.categories && parsed.categories.length ? parsed.categories : initialShopData.categories,
          products: parsed.products && parsed.products.length ? parsed.products : initialShopData.products,
          banners: parsed.banners && parsed.banners.length ? parsed.banners : initialShopData.banners,
          sections: parsed.sections && parsed.sections.length ? parsed.sections : initialShopData.sections,
          orders: orders,
          reviews: parsed.reviews || initialShopData.reviews,
        };
      }
    } catch (e) {
      console.error('Failed to load shop data from storage:', e);
    }
    return initialShopData;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const refreshShopState = useCallback(async () => {
    try {
      const dbSettings = await getStoreSettings().catch(() => null);
      if (dbSettings) {
        setData(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            ...dbSettings,
            showAnnouncement: dbSettings.show_announcement ?? dbSettings.showAnnouncement ?? prev.settings.showAnnouncement,
            announcement: dbSettings.announcement ?? prev.settings.announcement,
          }
        }));
      }

      const remoteState = await fetchShopStateFromSupabase().catch(() => null);
      if (remoteState && remoteState.settings) {
        setData(prev => ({
          ...prev,
          settings: { ...prev.settings, ...remoteState.settings },
          categories: remoteState.categories && remoteState.categories.length > 0 ? remoteState.categories : prev.categories,
          banners: remoteState.banners && remoteState.banners.length > 0 ? remoteState.banners : prev.banners,
          sections: remoteState.sections && remoteState.sections.length > 0 ? remoteState.sections : prev.sections,
          products: remoteState.products && remoteState.products.length > 0 ? remoteState.products : prev.products
        }));
      }

      const dbOrders = await fetchOrdersFromSupabase().catch(() => null);
      if (dbOrders) {
        setData(prev => ({ ...prev, orders: dbOrders }));
      }

      const dbUsers = await fetchUsersFromSupabase().catch(() => null);
      if (dbUsers) {
        setRegisteredUsers(dbUsers);
      }
    } catch (e) {
      console.warn('refreshShopState error:', e);
    }
  }, []);

  // Clear legacy cached data keys on mount and fetch Supabase real-time data
  useEffect(() => {
    try {
      [
        'doo_users_list_v1', 'doo_users_list_v2', 'doo_users_list_v3', 'doo_users_list_v4', 'doo_users_list_v5',
        'doo_buyer_session_v1', 'doo_buyer_session_v2', 'doo_buyer_session_v3', 'doo_buyer_session_v4', 'doo_buyer_session_v5',
        'doo_shop_data_v1', 'doo_shop_data_v2', 'doo_shop_data_v3', 'doo_shop_data_v4', 'doo_shop_data_v5',
        'doo_cart_v1', 'doo_cart_v2', 'doo_cart_v3', 'doo_cart_v4', 'doo_cart_v5',
        'doo_wishlist_v1', 'doo_wishlist_v2', 'doo_wishlist_v3', 'doo_wishlist_v4', 'doo_wishlist_v5'
      ].forEach(k => localStorage.removeItem(k));
    } catch {}

    refreshShopState();

    const shopStateChannel = supabase
      .channel('realtime_shop_settings_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
        refreshShopState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_state' }, () => {
        refreshShopState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        refreshShopState();
      })
      .subscribe();

    // Listen to real-time user deletion events (kicks out deleted user instantly)
    const deletionChannel = supabase
      .channel('realtime_user_deletion_channel')
      .on('broadcast', { event: 'user_deleted' }, (payload: any) => {
        const deletedId = payload?.payload?.userId;
        const deletedEmail = payload?.payload?.email;

        try {
          const cachedUser = localStorage.getItem(STORAGE_USER);
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            if (parsed && (parsed.id === deletedId || (parsed.email && parsed.email.toLowerCase() === (deletedEmail || '').toLowerCase()))) {
              localStorage.clear();
              sessionStorage.clear();
              setCurrentUser(null);
              supabase.auth.signOut().catch(() => {});
              window.location.href = `${window.location.origin}/#/auth?tab=register`;
            }
          }
        } catch (e) {
          console.warn('User deletion handler error:', e);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(shopStateChannel);
      supabase.removeChannel(deletionChannel);
    };
  }, [refreshShopState]);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_LIST);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [deletedUserKeys, setDeletedUserKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('doo_deleted_users_v6');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('Failed to save registered users:', e);
    }
  }, [registeredUsers]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'synced'>('idle');

  // Save to localStorage and Sync to Supabase DB in background
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SHOP_DATA, JSON.stringify(data));
      syncShopStateToSupabase(data).catch(() => {});
    } catch (e) {
      console.error('Failed to save shop data:', e);
    }
  }, [data]);

  // Sync current user to Supabase DB
  useEffect(() => {
    if (currentUser && !currentUser.id?.startsWith('guest-') && !isLoggingOut) {
      syncUserToSupabase(currentUser).catch(() => {});
    }
  }, [currentUser, isLoggingOut]);

  // Cart reservation cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const expiredItems = cart.filter(item => item.reservedUntil && new Date(item.reservedUntil) < now);

      if (expiredItems.length > 0) {
        setData(prev => ({
          ...prev,
          products: prev.products.map(p => {
            const matches = expiredItems.filter(ei => String(ei.productId) === String(p.id));
            if (matches.length > 0) {
              let updatedP = { ...p };
              matches.forEach(m => {
                if (updatedP.variants && updatedP.variants.length > 0) {
                  updatedP.variants = updatedP.variants.map(v => {
                    if (v.color === m.selectedColor && v.size === m.selectedSize) {
                      return { ...v, stock: v.stock + m.quantity };
                    }
                    return v;
                  });
                  updatedP.stock = updatedP.variants.reduce((sum, v) => sum + v.stock, 0);
                } else {
                  updatedP.stock = updatedP.stock + m.quantity;
                }
              });
              return updatedP;
            }
            return p;
          })
        }));

        setCart(prev => prev.filter(item => !item.reservedUntil || new Date(item.reservedUntil) >= now));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_USER);
      }
    } catch (e) {
      console.error('Failed to save user:', e);
    }
  }, [currentUser]);

  // Cart calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const prod = data.products.find(p => String(p.id) === String(item.productId));
      return total + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }, [cart, data.products]);

  const wishlistCount = wishlist.length;

  const addToCart = useCallback((productId: string, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    const isGuest = !currentUser || currentUser.id.startsWith('guest-');
    if (isGuest) {
      return { ok: false, isGuest: true, error: 'يلزم تسجيل الدخول لإضافة المنتجات والشراء' };
    }

    const product = data.products.find(p => String(p.id) === String(productId));
    if (!product) return { ok: false, error: 'المنتج غير موجود' };

    let availableStock = product.stock;
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
      availableStock = variant ? variant.stock : 0;
    }

    if (quantity > availableStock) {
      return { ok: false, error: `عذراً، المخزون المتاح هو ${availableStock} فقط` };
    }

    const holdHours = data.settings.cartHoldHours || 1;
    const reservedUntil = new Date(Date.now() + holdHours * 3600 * 1000).toISOString();

    setData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (String(p.id) === String(productId)) {
          let updatedP = { ...p };
          if (updatedP.variants && updatedP.variants.length > 0) {
            updatedP.variants = updatedP.variants.map(v => {
              if (v.color === selectedColor && v.size === selectedSize) {
                return { ...v, stock: v.stock - quantity };
              }
              return v;
            });
            updatedP.stock = updatedP.variants.reduce((sum, v) => sum + v.stock, 0);
          } else {
            updatedP.stock = updatedP.stock - quantity;
          }
          return updatedP;
        }
        return p;
      })
    }));

    setCart(prev => {
      const existingIndex = prev.findIndex(item =>
        String(item.productId) === String(productId) &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          reservedUntil
        };
        return updated;
      }
      return [...prev, { productId, quantity, selectedColor, selectedSize, reservedUntil }];
    });

    return { ok: true };
  }, [data.products, data.settings.cartHoldHours]);

  const removeFromCart = useCallback((productId: string, selectedColor?: string, selectedSize?: string) => {
    let removedQty = 0;
    let targetItem: CartItem | undefined;

    setCart(prev => {
      targetItem = prev.find(i =>
        String(i.productId) === String(productId) &&
        i.selectedColor === selectedColor &&
        i.selectedSize === selectedSize
      );
      if (targetItem) removedQty = targetItem.quantity;
      return prev.filter(i => i !== targetItem);
    });

    if (removedQty > 0) {
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => {
          if (String(p.id) === String(productId)) {
            let updatedP = { ...p };
            if (updatedP.variants && updatedP.variants.length > 0) {
              updatedP.variants = updatedP.variants.map(v => {
                if (v.color === selectedColor && v.size === selectedSize) {
                  return { ...v, stock: v.stock + removedQty };
                }
                return v;
              });
              updatedP.stock = updatedP.variants.reduce((sum, v) => sum + v.stock, 0);
            } else {
              updatedP.stock = updatedP.stock + removedQty;
            }
            return updatedP;
          }
          return p;
        })
      }));
    }
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => {
    const item = cart.find(i =>
      String(i.productId) === String(productId) &&
      i.selectedColor === selectedColor &&
      i.selectedSize === selectedSize
    );

    if (!item) return { ok: false, error: 'المنتج غير موجود في السلة' };

    const diff = quantity - item.quantity;

    if (diff === 0) return { ok: true };

    if (diff > 0) {
      const product = data.products.find(p => String(p.id) === String(productId));
      let availableStock = product?.stock || 0;
      if (product?.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
        availableStock = variant ? variant.stock : 0;
      }

      if (diff > availableStock) {
        return { ok: false, error: `عذراً، المخزون المتاح هو ${availableStock} فقط` };
      }
    }

    setData(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (String(p.id) === String(productId)) {
          let updatedP = { ...p };
          if (updatedP.variants && updatedP.variants.length > 0) {
            updatedP.variants = updatedP.variants.map(v => {
              if (v.color === selectedColor && v.size === selectedSize) {
                return { ...v, stock: v.stock - diff };
              }
              return v;
            });
            updatedP.stock = updatedP.variants.reduce((sum, v) => sum + v.stock, 0);
          } else {
            updatedP.stock = updatedP.stock - diff;
          }
          return updatedP;
        }
        return p;
      })
    }));

    setCart(prev => prev.map(i => {
      if (String(i.productId) === String(productId) &&
          i.selectedColor === selectedColor &&
          i.selectedSize === selectedSize) {
        return { ...i, quantity };
      }
      return i;
    }));

    return { ok: true };
  }, [cart, data.products]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const exists = prev.some(id => String(id) === String(productId));
      if (exists) {
        return prev.filter(id => String(id) !== String(productId));
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  const getProduct = useCallback((id: string) => {
    return data.products.find(p => String(p.id) === String(id));
  }, [data.products]);

  const getProductsByCategory = useCallback((categoryId: string) => {
    return data.products.filter(p => p.active && p.categoryId === categoryId);
  }, [data.products]);

  const getFlashProducts = useCallback(() => {
    return data.products.filter(p => p.active && p.flashDeal);
  }, [data.products]);

  const getFeaturedProducts = useCallback(() => {
    return data.products.filter(p => p.active && p.featured);
  }, [data.products]);

  const getNewProducts = useCallback(() => {
    return data.products.filter(p => p.active && (p.isNew || p.id.includes('p1') || p.id.includes('p2') || p.id.includes('p4') || p.id.includes('p6')));
  }, [data.products]);

  const getBestsellers = useCallback(() => {
    return [...data.products.filter(p => p.active)].sort((a, b) => (b.sold || 0) - (a.sold || 0));
  }, [data.products]);

  const searchProducts = useCallback((query: string) => {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return data.products.filter(p =>
      p.active && (
        p.name.toLowerCase().includes(q) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      )
    );
  }, [data.products]);

  const checkoutOrder = useCallback((customer: { name: string; phone: string; city: string; address: string; paymentMethod: 'cod' | 'card' | 'wallet' }) => {
    if (cart.length === 0) {
      return { ok: false, error: 'السلة فارغة' };
    }

    const orderItems = cart.map(item => {
      const prod = data.products.find(p => String(p.id) === String(item.productId));
      return {
        productId: item.productId,
        name: prod?.name || 'منتج',
        price: prod?.price || 0,
        quantity: item.quantity,
        image: prod?.images[0] || '/images/product-1.jpg',
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      };
    });

    const subtotal = cartTotal;
    const shipping = subtotal >= data.settings.freeShippingMin ? 0 : 25;
    const total = subtotal + shipping;
    const orderId = 'DM' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      id: orderId,
      items: orderItems,
      subtotal,
      shipping,
      discount: 0,
      total,
      status: 'pending',
      paymentMethod: customer.paymentMethod,
      customer: {
        name: customer.name,
        phone: customer.phone,
        city: customer.city,
        address: customer.address
      },
      createdAt: new Date().toISOString(),
      trackingSteps: [
        {
          title: 'تم استلام الطلب',
          description: 'تم تأكيد طلبك بنجاح وجارٍ التجهيز في مستودعاتنا',
          timestamp: new Date().toISOString(),
          completed: true
        },
        {
          title: 'قيد التجهيز والتغليف',
          description: 'فحص الجودة وتغليف المنتجات بعناية',
          timestamp: 'قريباً',
          completed: false
        },
        {
          title: 'تم الشحن مع مندوب التوصيل',
          description: 'تسليم الشحنة لشركة الشحن المعتمدة',
          timestamp: 'خلال 24 ساعة',
          completed: false
        },
        {
          title: 'في مرحلة التسليم',
          description: 'المندوب في طريقه إلى عنوانك',
          timestamp: 'المتوقع قريباً',
          completed: false
        },
        {
          title: 'تم التوصيل بنجاح',
          description: 'تم تسليم الطلب للعميل',
          timestamp: 'قريباً',
          completed: false
        }
      ]
    };

    setData(prev => ({
      ...prev,
      orders: [newOrder, ...(prev.orders || [])],
      products: prev.products.map(p => {
        const cartItemsForProduct = cart.filter(ci => String(ci.productId) === String(p.id));
        if (cartItemsForProduct.length > 0) {
          const totalQty = cartItemsForProduct.reduce((sum, item) => sum + item.quantity, 0);
          return { ...p, sold: (p.sold || 0) + totalQty };
        }
        return p;
      })
    }));

    syncOrderToSupabase(newOrder);

    clearCart();
    return { ok: true, orderId };
  }, [cart, cartTotal, data.products, data.settings.freeShippingMin, clearCart]);

  const addReview = useCallback((productId: string, rating: number, comment: string, userName = 'عميل موثق') => {
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      productId,
      userName,
      rating,
      comment,
      createdAt: 'الآن'
    };

    setData(prev => {
      const updatedReviews = [newRev, ...(prev.reviews || [])];
      const updatedProducts = prev.products.map(p => {
        if (String(p.id) === String(productId)) {
          const count = (p.reviews || 0) + 1;
          const newRating = Number((((p.rating * (p.reviews || 1)) + rating) / count).toFixed(1));
          return { ...p, reviews: count, rating: newRating };
        }
        return p;
      });

      return {
        ...prev,
        reviews: updatedReviews,
        products: updatedProducts
      };
    });
  }, []);

  const login = useCallback((user: Partial<User>) => {
    const newUser: User = {
      id: user.id || 'usr-' + Date.now(),
      name: user.name || 'مستخدم',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'buyer',
      avatar: user.avatar,
      joinedAt: user.joinedAt,
      cart: user.cart || [],
      wishlist: user.wishlist || []
    };
    setCurrentUser(newUser);

    try {
      localStorage.setItem(STORAGE_USER, JSON.stringify(newUser));
      localStorage.setItem('doo_user_cache', JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to cache login session:', e);
    }

    setRegisteredUsers(prev => {
      const existsIndex = prev.findIndex(u =>
        u.id === newUser.id ||
        (u.email && newUser.email && u.email.toLowerCase() === newUser.email.toLowerCase())
      );
      if (existsIndex > -1) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...newUser };
        return updated;
      }
      return [newUser, ...prev];
    });

    syncUserToSupabase({ ...newUser, isOnline: true });
    setUserOnlineStatus(newUser.id, true, newUser.email);
    refreshShopState();
  }, [refreshShopState]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setLogoutMsg(data.settings.logoutMessage || 'جاري تسجيل الخروج... نتمنى أن تكون قد استمتعت بتجربة شراء فريدة');
    if (currentUser) {
      await setUserOnlineStatus(currentUser.id, false, currentUser.email);
      await syncUserToSupabase({ ...currentUser, isOnline: false }).catch(() => {});
      setRegisteredUsers(prev => prev.map(u => (
        (u.id === currentUser.id || (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase()))
          ? { ...u, isOnline: false }
          : u
      )));
    }
    await supabase.auth.signOut().catch(() => {});
    try {
      localStorage.removeItem(STORAGE_USER);
      sessionStorage.clear();
    } catch {}
    setCurrentUser(null);
    refreshShopState();
    setTimeout(() => {
      setIsLoggingOut(false);
    }, (data.settings.logoutDuration || 3) * 1000);
  }, [data.settings.logoutMessage, data.settings.logoutDuration, currentUser, refreshShopState]);

  const deleteUser = useCallback((userIdentifier: string, userEmailOpt?: string) => {
    if (!userIdentifier && !userEmailOpt) return;

    const cleanId = (userIdentifier || '').trim();
    const targetUser = registeredUsers.find(u =>
      u.id === cleanId || u.email === userIdentifier || u.email === userEmailOpt
    ) || (currentUser && (currentUser.id === cleanId || currentUser.email === userIdentifier || currentUser.email === userEmailOpt) ? currentUser : null);

    const userName = targetUser?.name;
    const userPhone = targetUser?.phone;
    const userEmail = (userEmailOpt || targetUser?.email || (cleanId.includes('@') ? cleanId : '')).trim().toLowerCase();

    // 1. Permanent Blacklist
    setDeletedUserKeys(prev => {
      const next = [...prev];
      if (cleanId && !next.includes(cleanId)) next.push(cleanId);
      if (userEmail && !next.includes(userEmail)) next.push(userEmail);
      try {
        localStorage.setItem('doo_deleted_users_v6', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2. Delete from Supabase
    deleteUserFromSupabase(cleanId, userEmail);

    // 3. Filter registeredUsers
    setRegisteredUsers(prev => prev.filter(u =>
      u.id !== cleanId && (!userEmail || u.email?.toLowerCase() !== userEmail)
    ));

    // 4. Purge active currentUser
    if (currentUser && (currentUser.id === cleanId || (userEmail && currentUser.email?.toLowerCase() === userEmail))) {
      try {
        localStorage.removeItem(STORAGE_USER);
        sessionStorage.clear();
      } catch {}
      setCurrentUser(null);
    }

    setData(prev => ({
      ...prev,
      orders: (prev.orders || []).filter(o => {
        const matchName = userName && o.customer?.name && o.customer.name.trim().toLowerCase() === userName.trim().toLowerCase();
        const matchPhone = userPhone && o.customer?.phone && userPhone && o.customer.phone.replace(/\D/g, '').includes(userPhone.replace(/\D/g, ''));
        return !matchName && !matchPhone;
      })
    }));

    clearCart();
    setWishlist([]);

    try {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_CART);
      localStorage.removeItem(STORAGE_WISHLIST);
      localStorage.removeItem('doo_user_cache');
      localStorage.removeItem('doo_buyer_session_v6');
    } catch (e) {
      console.error('Failed to clear storage on delete user:', e);
    }
  }, [registeredUsers, currentUser, clearCart]);

  const clearAllUsers = useCallback(() => {
    setRegisteredUsers([]);
    setCurrentUser(null);
    clearCart();
    setWishlist([]);
    setData(prev => ({
      ...prev,
      orders: []
    }));
    try {
      localStorage.removeItem(STORAGE_USERS_LIST);
      localStorage.removeItem(STORAGE_USER);
    } catch {}
  }, [clearCart]);

  const updateSettings = useCallback((newSettings: Partial<StoreSettings>) => {
    setData(prev => {
      const updated = {
        ...prev,
        settings: { ...prev.settings, ...newSettings }
      };
      try {
        localStorage.setItem(STORAGE_SHOP_DATA, JSON.stringify(updated));
      } catch {}

      updateStoreSettings({
        id: 'main',
        ...updated.settings,
        show_announcement: updated.settings.showAnnouncement,
        announcement: updated.settings.announcement,
      }).catch(() => {});

      syncShopStateToSupabase(updated).catch(() => {});

      return updated;
    });
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const id = 'p' + (data.products.length + 1);
    const newProd: Product = { ...product, id };
    setData(prev => ({
      ...prev,
      products: [newProd, ...prev.products]
    }));
  }, [data.products.length]);

  const updateProduct = useCallback((id: string, productUpdate: Partial<Product>) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => String(p.id) === String(id) ? { ...p, ...productUpdate } : p)
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => String(p.id) !== String(id))
    }));
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const id = 'cat-' + Date.now();
    const newCat: Category = { ...category, id };
    setData(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
  }, []);

  const updateCategory = useCallback((id: string, categoryUpdate: Partial<Category>) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, ...categoryUpdate } : c)
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  }, []);

  const updateSection = useCallback((id: string, sectionUpdate: Partial<Section>) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...sectionUpdate } : s)
    }));
  }, []);

  // دالة updateOrderStatus المحسّنة
  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setData(prev => ({
      ...prev,
      orders: (prev.orders || []).map(o => {
        if (o.id === orderId) {
          const statusOrder: Order['status'][] = [
            'pending', 'processing', 'shipped', 'delivering', 'delivered'
          ];
          const maxCompletedIndex = statusOrder.indexOf(status);

          let existingSteps = o.trackingSteps || [];

          if (existingSteps.length === 0) {
            const defaultSteps = [
              { title: 'تم استلام الطلب', description: 'تم تأكيد طلبك بنجاح وجارٍ التجهيز بمستودعاتنا' },
              { title: 'قيد التجهيز والتغليف', description: 'فحص الجودة وتغليف المنتجات بعناية' },
              { title: 'تم الشحن مع مندوب التوصيل', description: 'تسليم الشحنة لشركة الشحن المعتمدة' },
              { title: 'في مرحلة التسليم', description: 'المندوب في طريقه إلى عنوانك' },
              { title: 'تم التوصيل بنجاح', description: 'تم تسليم الشحنة للعميل بنجاح' }
            ];

            existingSteps = defaultSteps.map((step, idx) => ({
              ...step,
              completed: idx <= 0,
              timestamp: idx <= 0 ? new Date().toISOString() : 'قريباً'
            }));
          }

          const updatedSteps = existingSteps.map((step, idx) => {
            const shouldBeCompleted = idx <= maxCompletedIndex;

            if (shouldBeCompleted && !step.completed) {
              return {
                ...step,
                completed: true,
                timestamp: new Date().toISOString()
              };
            }

            if (!shouldBeCompleted) {
              return {
                ...step,
                completed: false,
                timestamp: step.timestamp || 'قريباً'
              };
            }

            return step;
          });

          return {
            ...o,
            status,
            trackingSteps: updatedSteps,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    }));
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setData(prev => ({
      ...prev,
      orders: (prev.orders || []).filter(o => o.id !== orderId)
    }));
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_SHOP_DATA);
    setData(initialShopData);
  }, []);

  return (
    <ShopContext.Provider
      value={{
        data,
        cart,
        wishlist,
        currentUser,
        registeredUsers,
        isAuthenticated: !!currentUser,
        isLoggingOut,
        logoutMsg,
        cartCount,
        cartTotal,
        wishlistCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        getProduct,
        getProductsByCategory,
        getFlashProducts,
        getFeaturedProducts,
        getNewProducts,
        getBestsellers,
        searchProducts,
        checkoutOrder,
        addReview,
        login,
        logout,
        deleteUser,
        clearAllUsers,
        updateSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSection,
        updateOrderStatus,
        deleteOrder,
        resetData,
        refreshShopState,
        syncStatus
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};