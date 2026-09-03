import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, Clock } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { CartHoldTimer } from './CartHoldTimer';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const { toggleWishlist, wishlist, data, cart, addToCart, currentUser } = useShop();
  const [isFlying, setIsFlying] = useState(false);
  const navigate = useNavigate();
  const imgRef = useRef<HTMLImageElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const currencySymbol = data.settings.currencySymbol || 'ر.س';
  const category = data.categories.find(c => c.id === product.categoryId);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  // المخزون يقسم 100 درجة كما طلب المستخدم
  const stockPercentage = isOutOfStock ? 0 : Math.min((product.stock / 100) * 100, 100);

  const isWishlisted = wishlist.some(id => String(id) === String(product.id));
  const cartItem = cart.find(item => String(item.productId) === String(product.id));
  const cartQty = cartItem ? cartItem.quantity : 0;

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product.id);
    },
    [product.id, toggleWishlist]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOutOfStock) return;

      const isGuest = !currentUser || currentUser.id?.startsWith('guest-');
      if (isGuest) {
        navigate('/auth');
        return;
      }

      if (product.hasVariants) {
        navigate(`/product/${product.id}`);
        return;
      }

      setIsFlying(true);
      const res = addToCart(product.id, 1);
      if (!res.ok) {
        if (res.isGuest) {
          navigate('/auth');
        } else if (res.error) {
          alert(res.error);
        }
      }
      setTimeout(() => setIsFlying(false), 1300);
    },
    [product.id, isOutOfStock, product.hasVariants, addToCart, currentUser, navigate]
  );

  const handleRatingClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/product/${product.id}/review`);
    },
    [product.id, navigate]
  );

  const holdHoursText = (hours = 1) => {
    if (hours === 1) return 'ساعة';
    if (hours === 2) return 'ساعتين';
    if (hours > 2 && hours <= 10) return `${hours} ساعات`;
    return `${hours} ساعة`;
  };

  const displayColors = product.colors && product.colors.length > 0 
    ? product.colors 
    : ['#FF6A00', '#000000', '#FFFFFF'];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${
        isOutOfStock
          ? 'bg-slate-50 border border-slate-100 grayscale-[0.8] opacity-75'
          : 'bg-white'
      }`}
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F9F9]">
        <div
          className="cursor-pointer h-full w-full"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <img
            ref={imgRef}
            src={product.images[0]}
            alt={product.name}
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-60 grayscale' : ''
            }`}
            loading="lazy"
          />
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-4 right-4 z-10 flex items-center justify-center transition-transform active:scale-90"
          aria-label="إضافة للمفضلة"
        >
          <Heart
            size={24}
            className={`drop-shadow-lg transition-colors duration-300 ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        {/* Cart Reservation Timer badge on top left */}
        {cartItem?.reservedUntil && (
          <div className="absolute top-4 left-4 z-10 scale-90 origin-top-left shadow-lg rounded-full overflow-hidden">
            <CartHoldTimer until={cartItem.reservedUntil} />
          </div>
        )}

        {/* Flying animation to cart icon */}
        <AnimatePresence>
          {isFlying && (
            <motion.img
              key="flying-img"
              src={product.images[0]}
              initial={{
                position: 'fixed',
                top: imgRef.current?.getBoundingClientRect().top ?? 0,
                left: imgRef.current?.getBoundingClientRect().left ?? 0,
                width: 150,
                height: 150,
                opacity: 0.8,
                zIndex: 9999,
                borderRadius: '30px',
                filter: 'brightness(1.2) contrast(1.1) saturate(1.2)'
              }}
              animate={{
                top:
                  document.getElementById('cart-icon-target-mobile')?.getBoundingClientRect().top ??
                  document.getElementById('cart-icon-target')?.getBoundingClientRect().top ??
                  0,
                left:
                  document.getElementById('cart-icon-target-mobile')?.getBoundingClientRect().left ??
                  document.getElementById('cart-icon-target')?.getBoundingClientRect().left ??
                  0,
                width: 20,
                height: 20,
                opacity: 0,
                rotate: 360,
                borderRadius: '50%'
              }}
              transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
              className="object-cover shadow-2xl pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col p-2 pt-1">
        {/* Category Badge */}
        <div className="flex justify-end mb-0.5">
          <span className="text-[10px] font-bold text-[#A34D2E] opacity-80">
            {category?.name || 'عام'}
          </span>
        </div>

        {/* Product Title */}
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 text-[13px] font-bold text-gray-800 leading-[1.3] hover:text-orange-600 transition-colors text-right mb-1"
        >
          {product.name}
        </Link>

        {/* Ratings, Reviews & Pricing Row */}
        <div className="flex flex-col items-end gap-0.5 mb-2">
          {/* Reviews and Stars */}
          <button
            type="button"
            onClick={handleRatingClick}
            className="flex items-center justify-end gap-1 group/rate"
          >
            <span className="text-[9px] font-bold text-gray-400 group-hover/rate:text-orange-500">
              ({product.reviews || (product.id === 'p1' ? '1240' : '890')})
            </span>
            <span className="text-[11px] font-black text-gray-900">
              {product.rating || '4.7'}
            </span>
            <div className="flex gap-0.5 flex-row-reverse">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.floor(product.rating || 4.5) ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-gray-200'}
                />
              ))}
            </div>
          </button>

          {/* Discount badge & Color Swatches */}
          <div className="flex items-center justify-end gap-2.5 mt-0.5">
            {product.originalPrice > product.price && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 line-through decoration-slate-300">
                  {product.originalPrice.toLocaleString('en-US')}
                </span>
                <div className="rounded-md bg-pink-50 px-1.5 py-0.5 text-[9px] font-black text-pink-600 border border-pink-100/50">
                  -{discountPercent}%
                </div>
              </div>
            )}
            {product.hasColors !== false && (
              <div className="flex items-center gap-1">
                {displayColors.slice(0, 3).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-3.5 h-3.5 rounded-full border border-slate-200 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)] transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {product.colors && product.colors.length > 3 && (
                  <span className="text-[8px] font-bold text-slate-400 mr-0.5">
                    +{product.colors.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Reservation Duration Notice */}
        {!isOutOfStock && (
          <div className="flex items-center justify-end gap-1 mb-1.5 opacity-60">
            <span className="text-[9px] font-bold text-slate-500">
              حجز {holdHoursText(data.settings.cartHoldHours || 1)}
            </span>
            <Clock size={10} className="text-slate-400" />
          </div>
        )}

        {/* Bottom Actions Row: Price & Circular Cart Progress Button */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-50 pt-2">
          {/* Price & Stock Badge */}
          <div className="flex flex-col items-start gap-1 pb-1 flex-1">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[9px] font-bold text-gray-800">{currencySymbol}</span>
              <span className="text-base font-[900] text-gray-900 tracking-tight">
                {product.price.toLocaleString('en-US')}
              </span>
            </div>

            {/* Custom Label - الملصق المخصص (الوردي) */}
            {product.hasCustomLabel && product.customLabelText && (
              <div className="bg-pink-50 text-pink-600 text-[10px] font-black px-3 py-1 rounded-xl border border-pink-100/50 mt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-500">
                {product.customLabelText}
              </div>
            )}

            {/* Standard Badges - الملصقات التلقائية (تظهر فقط إذا لم يوجد ملصق مخصص أو كانت ضرورية كفاذ الكمية) */}
            {(isOutOfStock || isLowStock || (product.showBadge && product.badgeText && !product.hasCustomLabel)) && (
              <div
                className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-tight ${
                  isOutOfStock
                    ? 'bg-red-50 text-red-500 border border-red-100'
                    : isLowStock
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}
              >
                {isOutOfStock
                  ? 'نفذت الكمية'
                  : isLowStock
                  ? 'شارف على النفاذ'
                  : product.badgeText}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="flex flex-col items-center">
            {/* Cart Button with Circular Stock Progress */}
            <div className="relative flex items-center justify-center">
              {!isOutOfStock ? (
                <>
                  <svg className="absolute h-[54px] w-[54px] -rotate-90 transform pointer-events-none">
                    <circle
                      cx="27"
                      cy="27"
                      r="23"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <motion.circle
                      cx="27"
                      cy="27"
                      r="23"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray="145"
                      initial={{ strokeDashoffset: 145 }}
                      animate={{ strokeDashoffset: 145 - (145 * stockPercentage) / 100 }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                      strokeLinecap="round"
                      className="text-[#10B981]"
                    />
                  </svg>
                  <button
                    ref={btnRef}
                    type="button"
                    onClick={handleAddToCart}
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-all active:scale-95 ${
                      cartQty > 0 ? 'bg-emerald-500' : 'bg-[#FF6A00] hover:bg-[#E55F00]'
                    }`}
                    aria-label="إضافة إلى السلة"
                  >
                    <ShoppingCart size={17} />
                  </button>
                </>
              ) : (
                <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                  منتهي
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
});
