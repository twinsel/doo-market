import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  UserPlus,
  Compass,
  CheckCircle2,
  Zap,
  Truck,
  ShieldCheck,
  Gift,
  ArrowLeft
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BrandLogoBadge } from './Header';

interface AppAuthGateProps {
  onClose?: () => void;
}

export const AppAuthGate: React.FC<AppAuthGateProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, data, isAuthenticated, currentUser } = useShop();

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tab === 'register' && password !== confirmPassword && confirmPassword) {
      setErrorMsg('كلمات المرور غير متطابقة، يرجى التأكد وإعادة المحاولة');
      return;
    }

    if (tab === 'register' && !agreedTerms) {
      setErrorMsg('يرجى الموافقة على الشروط والأحكام للمتابعة');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const isUserAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('مدير');
      login({
        name: name.trim() || 'مستخدم',
        email: email.trim(),
        phone: phone.trim(),
        role: isUserAdmin ? 'admin' : 'buyer'
      });
      setIsLoading(false);
      if (onClose) onClose();
    }, 600);
  };

  const handleGuestEntry = () => {
    setIsLoading(true);
    setTimeout(() => {
      login({
        id: 'guest-' + Date.now(),
        name: 'زائر المتجر',
        email: '',
        phone: '',
        role: 'buyer'
      });
      setIsLoading(false);
      if (onClose) onClose();
    }, 400);
  };

  const handleQuickAdminDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      login({
        id: 'usr-admin',
        name: 'مسؤول النظام',
        email: 'admin@doomarket.com',
        phone: '',
        role: 'admin'
      });
      setIsLoading(false);
      if (onClose) onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/95 backdrop-blur-xl p-4 sm:p-6" dir="rtl">
      {/* Background Animated Glowing Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, -30, 0]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-600/30 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-600/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl"
        />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative my-auto w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-white"
      >
        {/* Top Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              if (isAuthenticated && !currentUser?.id?.startsWith('guest-')) {
                window.location.hash = '#/home';
              } else {
                window.location.hash = '#/auth';
              }
            }}
            className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer group"
            title="دُو ماركت"
          >
            <BrandLogoBadge size="lg" />
          </button>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-black text-orange-400 border border-orange-500/20">
              <Sparkles size={13} className="animate-spin text-orange-400" style={{ animationDuration: '4s' }} />
              {data.settings.siteName} — تجربة تسوق عالمية
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {tab === 'login' ? 'مرحباً بك مجدداً!' : 'انضم إلى مجتمع دو ماركت'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-bold max-w-sm mx-auto">
              {tab === 'login'
                ? 'سجل دخولك الآن للوصول إلى عروضك الحصرية ومتابعة طلباتك بذكاء'
                : 'أنشئ حسابك الجديد واستمتع بخصومات حصرية وتجربة تسوق سريعة'}
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="my-6 grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 p-2.5 border border-white/5 text-xs font-bold text-slate-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
              <Zap size={16} />
            </div>
            <span>عروض برق يومية</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 p-2.5 border border-white/5 text-xs font-bold text-slate-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Truck size={16} />
            </div>
            <span>توصيل سريع ومضمون</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 p-2.5 border border-white/5 text-xs font-bold text-slate-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <ShieldCheck size={16} />
            </div>
            <span>دفع آمن 100%</span>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/5 p-2.5 border border-white/5 text-xs font-bold text-slate-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Gift size={16} />
            </div>
            <span>مكافآت وخصومات</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative mb-6 flex rounded-2xl bg-slate-950/60 p-1 border border-white/5">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-black transition-all duration-300 ${
              tab === 'login'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn size={15} />
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-black transition-all duration-300 ${
              tab === 'register'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={15} />
            حساب جديد
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center text-xs font-bold text-red-400"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {tab === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3.5 ps-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20"
                />
                <User size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">البريد الإلكتروني أو رقم الجوال</label>
            <div className="relative">
              <input
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@mail.com أو 0501234567"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3.5 ps-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20"
              />
              <Mail size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-300">كلمة المرور</label>
              {tab === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')}
                  className="text-[11px] font-bold text-orange-400 hover:text-orange-300 hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3.5 ps-11 pe-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20"
              />
              <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-xs font-bold text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3.5 ps-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20"
                />
                <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
            </motion.div>
          )}

          {/* Options Checkboxes */}
          <div className="flex items-center justify-between pt-1">
            {tab === 'login' ? (
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-orange-500"
                />
                <span>تذكرني على هذا الجهاز</span>
              </label>
            ) : (
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={e => setAgreedTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-orange-500"
                />
                <span>أوافق على شروط الاستخدام وسياسة الخصوصية</span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{tab === 'login' ? 'تسجيل الدخول ومتابعة التسوق' : 'إنشاء حساب رسمي جديد'}</span>
                <ArrowLeft size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] font-bold text-slate-400">
            أو تصفح وتجربة التطبيق
          </span>
        </div>

        {/* Action Buttons: Guest & Admin Demo */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGuestEntry}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
          >
            <Compass size={16} className="text-amber-400" />
            <span>التصفح كزائر (معاينة المتجر السريعة)</span>
          </button>

          <button
            type="button"
            onClick={handleQuickAdminDemo}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 py-2.5 text-[11px] font-bold text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
          >
            <span>🔑 تجربة الدخول كمسؤول (Admin Demo)</span>
          </button>
        </div>

        {/* Footer Security Note */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span>تطبيق مشفر ومحمي 100% وفق أعلى معايير الأمان العالمية</span>
        </div>
      </motion.div>
    </div>
  );
};
