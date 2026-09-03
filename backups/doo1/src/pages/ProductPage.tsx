import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Heart, 
  ShoppingBag, 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Clock, 
  Minus, 
  Plus,
  MessageSquare
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Countdown } from '../components/Countdown';
import { CartHoldTimer } from '../components/CartHoldTimer';
import { ProductCard } from '../components/ProductCard';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, addToCart, toggleWishlist, wishlist, data, getProductsByCategory, cart } = useShop();

  const product = getProduct(id || '');

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-gray-500 font-bold">المنتج غير موجود</p>
        <Link to="/" className="mt-4 inline-block font-bold text-orange-600">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Variant matching - منطق ذكي للبحث عن التوليفة الصحيحة
  const currentVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;

    // إذا كان اللون معطلاً نستخدم القيمة الافتراضية، وإلا نستخدم اللون المختار
    const colorToMatch = product.hasColors !== false ? selectedColor : 'none';
    // إذا كان المقاس معطلاً نستخدم القيمة الافتراضية، وإلا نستخدم المقاس المختار
    const sizeToMatch = product.hasSizes !== false ? selectedSize : 'none';

    return product.variants.find(v => v.color === colorToMatch && v.size === sizeToMatch);
  }, [product, selectedColor, selectedSize]);

  const variantStock = currentVariant ? currentVariant.stock : (product.variants?.length ? 0 : product.stock || 0);
  const isOutOfStock = variantStock <= 0;
  const isLowStock = !isOutOfStock && variantStock <= 5;

  const discountPercent = product && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    const result = addToCart(product.id, quantity, selectedColor, selectedSize);

    if (result.ok) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } else {
      alert(result.error);
    }
  };

  const isWishlisted = product ? wishlist.some(wId => String(wId) === String(product.id)) : false;
  const cartItem = cart.find(item => String(item.productId) === String(id));
  const category = product ? data.categories.find(c => c.id === product.categoryId) : undefined;
  const relatedProducts = product ? getProductsByCategory(product.categoryId).filter(p => p.id !== product.id).slice(0, 5) : [];
  const productReviews = (data.reviews || []).filter(r => r.productId === id);

  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      {/* Breadcrumb Navigation */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-gray-400 font-bold">
        <Link to="/" className="hover:text-orange-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft size={12} />
        {category && (
          <>
            <Link to={`/category/${category.id}`} className="hover:text-orange-600 transition-colors">
              {category.name}
            </Link>
            <ChevronLeft size={12} />
          </>
        )}
        <span className="text-gray-700 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Media Gallery */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 relative aspect-square">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />

            {/* Discount Badge */}
            {discountPercent > 0 && (
              <span className="absolute start-4 top-4 rounded-full bg-gradient-to-l from-orange-500 to-red-500 px-3.5 py-1 text-xs font-black text-white shadow-md">
                خصم {discountPercent}%
              </span>
            )}

            {/* Floating Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 end-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md text-gray-700 hover:bg-white transition-all active:scale-90"
              aria-label="المفضلة"
            >
              <Heart
                size={20}
                className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
              />
            </button>
          </div>

          {/* Multiple Thumbnails if available */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all ${
                    activeImageIndex === idx ? 'border-orange-500' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} className="h-full w-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Options */}
        <div className="flex flex-col space-y-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7 space-y-5">
            {/* Flash Deal Notice */}
            {product.flashDeal && product.flashEndsAt && (
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-3 text-white">
                <span className="text-xs font-black">⚡ عرض البرق ينتهي خلال:</span>
                <Countdown endsAt={product.flashEndsAt} compact />
              </div>
            )}

            {/* Cart Hold Notice */}
            {cartItem?.reservedUntil && (
              <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-3 border border-amber-200">
                <span className="text-xs font-bold text-amber-800">هذا المنتج محجوز في سلتك</span>
                <CartHoldTimer until={cartItem.reservedUntil} />
              </div>
            )}

            {/* Title & Category */}
            <div>
              <span className="text-xs font-black text-orange-600">{category?.name || 'عام'}</span>
              <h1 className="mt-1 text-xl font-black text-gray-900 sm:text-2xl leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Ratings and Reviews */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={15}
                    className={
                      star <= Math.round(product.rating || 4.5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-black text-gray-900">{product.rating || '4.7'}</span>
              <span className="text-xs font-bold text-gray-400">
                ({product.reviews || 120} تقييم)
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                تم بيع {product.sold || 350}+ قطعة
              </span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-orange-600">{currencySymbol}</span>
                <span className="text-3xl font-[1000] text-gray-900 tracking-tight">
                  {product.price.toLocaleString('en-US')}
                </span>
              </div>
              {product.originalPrice > product.price && (
                <span className="text-sm font-bold text-gray-400 line-through">
                  {product.originalPrice.toLocaleString('en-US')} {currencySymbol}
                </span>
              )}
            </div>

            {/* Colors selector */}
            {product.hasColors !== false && product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">اللون:</label>
                <div className="flex gap-2.5">
                  {product.colors.map(color => {
                    // التحقق مما إذا كان هذا اللون متوفراً في أي مقاس
                    const hasAnyStock = product.variants
                      ? product.variants.some(v => v.color === color && v.stock > 0)
                      : (product.colors?.includes(color) && product.stock > 0);

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          // عند تغيير اللون، نتحقق إذا كان المقاس الحالي متوفراً للون الجديد
                          if (product.variants && product.hasSizes !== false) {
                            const sizeExists = product.variants.some(v => v.color === color && v.size === selectedSize && v.stock > 0);
                            if (!sizeExists) {
                              // إذا لم يكن متوفراً، نختار أول مقاس متوفر لهذا اللون
                              const firstAvailable = product.variants.find(v => v.color === color && v.stock > 0);
                              if (firstAvailable) setSelectedSize(firstAvailable.size);
                            }
                          }
                        }}
                        style={{ backgroundColor: color }}
                        className={`h-8 w-8 rounded-full transition-all relative ${
                          selectedColor === color
                            ? 'border-2 border-orange-500 ring-2 ring-orange-500/30 scale-110'
                            : 'border border-slate-200 hover:border-slate-300'
                        } ${!hasAnyStock ? 'opacity-40 grayscale-[0.5]' : ''}`}
                      >
                        {!hasAnyStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-red-500 rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes selector - فلتر ذكي بناءً على اللون المختار */}
            {product.hasSizes !== false && product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">المقاس:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => {
                    // التحقق مما إذا كان المقاس متوفراً للون المختار حالياً
                    const isAvailableForColor = product.variants
                      ? product.variants.some(v => (product.hasColors !== false ? v.color === selectedColor : true) && v.size === size && v.stock > 0)
                      : true;

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!isAvailableForColor}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] rounded-xl px-3 py-2 text-xs font-black transition-all ${
                          selectedSize === size
                            ? 'bg-orange-500 text-white shadow-md'
                            : isAvailableForColor
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50 line-through'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & CTA Button */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50/80 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-black text-sm text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.min(variantStock, prev + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-lg transition-all active:scale-95 ${
                  isOutOfStock
                    ? 'bg-gray-300 cursor-not-allowed'
                    : addedSuccess
                    ? 'bg-emerald-500 shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30 hover:opacity-95'
                }`}
              >
                <ShoppingBag size={18} />
                <span>
                  {isOutOfStock
                    ? 'نفذت الكمية'
                    : addedSuccess
                    ? 'تمت الإضافة للسلة!'
                    : 'إضافة إلى السلة'}
                </span>
              </button>
            </div>

            {/* Stock status indicator - يظهر لجميع المنتجات عند انخفاض المخزون */}
            {isLowStock && (
              <p className="text-xs font-bold text-amber-600 animate-pulse">
                ⚠️ تبقى {variantStock} قطع فقط في المخزون!
              </p>
            )}

            {product.variants && product.variants.length > 0 && !currentVariant && !isOutOfStock && (
              <p className="text-[10px] font-bold text-red-500">
                ⚠️ هذه التوليفة (اللون والمقاس) غير متوفرة حالياً.
              </p>
            )}

            {/* Description */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-black text-gray-900 mb-2">تفاصيل المنتج</h3>
              <p className="text-xs leading-relaxed text-gray-600 font-bold whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="rounded-full bg-orange-50 p-2 text-orange-600">
                <Truck size={18} />
              </div>
              <span className="text-[11px] font-black text-gray-800">شحن سريع</span>
              <span className="text-[9px] text-gray-400 font-bold">خلال 2-4 أيام</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 border-x border-gray-100">
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[11px] font-black text-gray-800">ضمان أصلي</span>
              <span className="text-[9px] text-gray-400 font-bold">100% جودة معتمدة</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                <RotateCcw size={18} />
              </div>
              <span className="text-[11px] font-black text-gray-800">استرجاع سهل</span>
              <span className="text-[9px] text-gray-400 font-bold">خلال 30 يوم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-orange-500" />
            <h2 className="text-lg font-black text-gray-900">تقييمات وآراء العملاء</h2>
          </div>
          <Link
            to={`/product/${product.id}/review`}
            className="rounded-xl bg-orange-50 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors"
          >
            + إضافة تقييمك
          </Link>
        </div>

        {productReviews.length > 0 ? (
          <div className="space-y-4">
            {productReviews.map(rev => (
              <div key={rev.id} className="border-b border-gray-50 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-black text-gray-900">{rev.userName}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{rev.createdAt}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-1.5" dir="ltr">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-bold leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-bold text-center py-6">
            كن أول من يكتب تقييماً لهذا المنتج!
          </p>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-gray-900">منتجات قد تعجبك</h2>
            {category && (
              <Link
                to={`/category/${category.id}`}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                تصفح المزيد
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
