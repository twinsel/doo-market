import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Banknote, CreditCard, Wallet, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useShop } from '../context/ShopContext';

const paymentOptions = [
  { id: 'cod', label: 'الدفع عند الاستلام', icon: Banknote },
  { id: 'card', label: 'بطاقة ائتمان / مدى', icon: CreditCard },
  { id: 'wallet', label: 'محفظة رقمية (Apple Pay)', icon: Wallet }
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, checkoutOrder, data, currentUser } = useShop();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState('الرياض');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet'>('cod');
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate('/cart');
    }
  }, [cart, isSuccess, navigate]);

  const isValid = name.trim() && phone.trim().length >= 8 && city.trim() && address.trim();
  const currencySymbol = data.settings.currencySymbol || 'ر.س';
  const shippingFee = cartTotal >= (data.settings.freeShippingMin || 99) ? 0 : 25;
  const total = cartTotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = checkoutOrder({
      name,
      phone,
      city,
      address,
      paymentMethod
    });

    if (result.ok) {
      setTrackingCode(result.orderId || 'DM8421');
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      alert(result.error || 'تعذر إتمام الطلب');
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-200"
        >
          <Check size={56} className="text-white" strokeWidth={3} />
        </motion.div>

        <h1 className="text-3xl font-[1000] text-slate-900 tracking-tight">تم تأكيد طلبك بنجاح!</h1>
        <p className="mt-4 text-slate-500 font-bold leading-relaxed max-w-sm">
          شكراً لتسوقك مع {data.settings.siteName}. سنقوم بتجهيز وشحن طلبك في أسرع وقت ممكن.
        </p>

        {/* Tracking Code Box */}
        <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl bg-orange-50 border border-orange-100 px-8 py-5 shadow-sm">
          <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
            رقم التتبع الخاص بك
          </span>
          <span className="text-2xl font-black text-orange-600">
            #{trackingCode}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-10 w-full max-w-xs">
          <Link
            to="/track-order"
            className="rounded-2xl bg-gray-900 px-4 py-3.5 text-xs font-black text-white shadow hover:bg-gray-800 transition-all text-center"
          >
            تتبع شحنتك
          </Link>
          <Link
            to="/"
            className="rounded-2xl bg-orange-500 px-4 py-3.5 text-xs font-black text-white shadow hover:bg-orange-600 transition-all text-center"
          >
            متابعة التسوق
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">إتمام الطلب والدفع</h1>
        <p className="text-xs text-gray-500 font-bold mt-1">الرجاء إدخال بيانات التوصيل وطريقة الدفع</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Form */}
        <div className="md:col-span-2 space-y-5">
          {/* Shipping Details Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
            <h2 className="text-sm font-black text-gray-900">بيانات التوصيل</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الاسم الكامل *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">رقم الجوال *</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0501234567"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">المدينة *</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white"
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                  <option value="الخبر">الخبر</option>
                  <option value="أبها">أبها</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">العنوان التفصيلي *</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="اسم الحي، الشارع، رقم المبنى"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-3">
            <h2 className="text-sm font-black text-gray-900">طريقة الدفع</h2>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {paymentOptions.map(opt => {
                const isSelected = paymentMethod === opt.id;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id as any)}
                    className={`flex items-center gap-3 rounded-2xl p-4 border-2 text-start transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-black ring-2 ring-orange-500/20'
                        : 'border-gray-100 bg-gray-50/50 text-gray-700 font-bold hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent size={20} className={isSelected ? 'text-orange-600' : 'text-gray-400'} />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
            <h2 className="text-sm font-black text-gray-900">ملخص الطلب</h2>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map(item => {
                const prod = data.products.find(p => String(p.id) === String(item.productId));
                return (
                  <div key={item.productId} className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{item.quantity}x</span>
                      <span className="line-clamp-1 max-w-[130px]">{prod?.name || 'منتج'}</span>
                    </div>
                    <span>{((prod?.price || 0) * item.quantity).toLocaleString('en-US')} {currencySymbol}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs font-bold text-gray-600">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{cartTotal.toLocaleString('en-US')} {currencySymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>الشحن:</span>
                <span className={shippingFee === 0 ? 'text-emerald-600 font-black' : ''}>
                  {shippingFee === 0 ? 'مجاني' : `${shippingFee} ${currencySymbol}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-gray-900">
                <span>المجموع الكلي:</span>
                <span className="text-orange-600">{total.toLocaleString('en-US')} {currencySymbol}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!isValid || isSubmitting}
              onClick={handlePlaceOrder}
              className={`w-full rounded-2xl py-4 text-sm font-black text-white shadow-lg transition-all active:scale-95 ${
                !isValid || isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30 hover:opacity-95'
              }`}
            >
              {isSubmitting ? 'جارٍ تأكيد الطلب...' : 'تأكيد الطلب الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
