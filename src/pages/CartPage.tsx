import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, Tag, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CartHoldTimer } from '../components/CartHoldTimer';
import { QrCodeCard } from '../components/QrCodeCard';

export const CartPage: React.FC = () => {
  const { cart, cartTotal, removeFromCart, updateCartQuantity, clearCart, getProduct, data } = useShop();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const navigate = useNavigate();

  const currencySymbol = data.settings.currencySymbol || 'ر.س';
  const freeShippingThreshold = data.settings.freeShippingMin || 99;
  const shippingFee = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : 25;
  const finalTotal = Math.max(0, cartTotal - appliedDiscount + shippingFee);

  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartTotal);
  const freeShippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'DOO10' || code === 'SAVE10') {
      const disc = Math.round(cartTotal * 0.1);
      setAppliedDiscount(disc);
      setCouponSuccess(`تم تطبيق خصم 10% (-${disc} ${currencySymbol})`);
    } else if (code === 'DOO20') {
      const disc = Math.round(cartTotal * 0.2);
      setAppliedDiscount(disc);
      setCouponSuccess(`تم تطبيق خصم 20% (-${disc} ${currencySymbol})`);
    } else if (code) {
      setCouponError('كود الخصم غير صالح أو منتهي الصلاحية');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-orange-500 shadow-inner">
          <ShoppingBag size={42} />
        </div>
        <h1 className="text-2xl font-black text-gray-900">سلة التسوق فارغة</h1>
        <p className="mt-2 text-sm font-bold text-gray-500 leading-relaxed">
          لم تقم بإضافة أي منتجات لسلتك بعد. استكشف آلاف المنتجات والعروض المميزة!
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:scale-105 active:scale-95"
        >
          <span>ابدأ التسوق الآن</span>
          <ArrowRight size={16} className="rotate-180" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <span>سلة التسوق</span>
          <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
            ({cart.reduce((sum, item) => sum + item.quantity, 0)} منتجات)
          </span>
        </h1>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
        >
          <Trash2 size={14} />
          <span>إفراغ السلة</span>
        </button>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between text-xs font-black mb-2">
          <div className="flex items-center gap-1.5 text-gray-800">
            <Truck size={16} className="text-orange-500" />
            {freeShippingRemaining > 0 ? (
              <span>
                أضف بقيمة <strong className="text-orange-600">{freeShippingRemaining} {currencySymbol}</strong> للحصول على شحن مجاني!
              </span>
            ) : (
              <span className="text-emerald-600">🎉 مبروك! لقد حصلت على شحن مجاني لطلبك</span>
            )}
          </div>
          <span className="text-gray-500">{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => {
            const product = getProduct(item.productId);
            if (!product) return null;

            return (
              <div
                key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover bg-gray-50"
                  />
                  <div>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-sm font-black text-gray-900 hover:text-orange-600 transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-500">
                      <span>{product.price} {currencySymbol}</span>
                      {item.selectedSize && <span>· المقاس: {item.selectedSize}</span>}
                      {item.selectedColor && (
                        <span className="inline-block h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor }} />
                      )}
                    </div>
                    {item.reservedUntil && (
                      <div className="mt-1.5">
                        <CartHoldTimer until={item.reservedUntil} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-xl bg-gray-100 p-1">
                    <button
                      onClick={() => {
                        const res = updateCartQuantity(item.productId, item.quantity - 1, item.selectedColor, item.selectedSize);
                        if (!res.ok) alert(res.error);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm active:scale-95 text-gray-700"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                    <button
                      onClick={() => {
                        const res = updateCartQuantity(item.productId, item.quantity + 1, item.selectedColor, item.selectedSize);
                        if (!res.ok) alert(res.error);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm active:scale-95 text-gray-700"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal for item */}
                  <div className="text-start sm:text-end">
                    <span className="text-sm font-black text-gray-900">
                      {(product.price * item.quantity).toLocaleString('en-US')} {currencySymbol}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedSize)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="حذف المنتج"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* QR Code Quick Information */}
          <div className="mt-4">
            <QrCodeCard compact />
          </div>
        </div>

        {/* Order Summary Checkout Card */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
            <h2 className="text-base font-black text-gray-900">ملخص الطلب</h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="كود الخصم (مثال: DOO10)"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold outline-none focus:border-orange-500 focus:bg-white"
                  />
                  <Tag size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 active:scale-95 transition-all"
                >
                  تطبيق
                </button>
              </div>
              {couponError && <p className="text-[10px] font-bold text-red-500">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] font-bold text-emerald-600">{couponSuccess}</p>}
            </form>

            {/* Price Calculations */}
            <div className="space-y-2.5 border-t border-gray-100 pt-4 text-xs font-bold">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي:</span>
                <span>{cartTotal.toLocaleString('en-US')} {currencySymbol}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم المطبق:</span>
                  <span>-{appliedDiscount} {currencySymbol}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>الشحن والتوصيل:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-black">مجاني</span>
                  ) : (
                    `${shippingFee} ${currencySymbol}`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-gray-900">
                <span>الإجمالي النهائي:</span>
                <span className="text-orange-600">{finalTotal.toLocaleString('en-US')} {currencySymbol}</span>
              </div>
            </div>

            {/* Checkout CTA Button */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>متابعة إتمام الطلب</span>
              <ArrowRight size={16} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
