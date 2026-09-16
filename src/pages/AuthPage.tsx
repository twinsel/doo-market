import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Zap,
  Gift,
  ShoppingBag,
  Tag,
  AtSign,
  AlertCircle,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import {
  signUpUserWithSupabase,
  signInUserWithSupabase,
  sendPasswordResetEmail
} from '../services/supabaseService';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, data, isAuthenticated, currentUser } = useShop();

  const tabParam = searchParams.get('tab');
  // ----- State -----
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    tabParam === 'register' ? 'register' : 'login'
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    } else if (tab === 'login') {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Shared
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Forgot Password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // ----- Effects -----
  useEffect(() => {
    const isGuest = currentUser?.id?.startsWith('guest-') || false;
    if (isAuthenticated && !isGuest) {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // ----- Handlers -----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const result = await signInUserWithSupabase(loginEmail, loginPassword);

    if (result.ok && result.user) {
      login(result.user);
      setIsLoading(false);
      navigate('/');
    } else {
      setLoginError(result.error || 'كلمة المرور أو البريد الإلكتروني غير صحيح');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('كلمات المرور غير متطابقة');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (!agreedTerms) {
      setRegError('يرجى الموافقة على الشروط والأحكام للمتابعة');
      return;
    }

    setIsLoading(true);

    const isAdmin = regEmail.toLowerCase().includes('admin') ||
                    regEmail.toLowerCase().includes('مدير');

    const result = await signUpUserWithSupabase(
      regEmail,
      regPassword,
      regName,
      regPhone,
      isAdmin ? 'admin' : 'buyer'
    );

    if (result.ok && result.user) {
      login(result.user);
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } else {
      setRegError(result.error || 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsResetLoading(true);
    setResetMessage('');

    const res = await sendPasswordResetEmail(resetEmail.trim());
    setIsResetLoading(false);
    setResetMessage(res.message);
  };

  const handleGuestEntry = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    login({
      id: 'guest-' + Date.now(),
      name: 'زائر المتجر',
      email: '',
      phone: '',
      role: 'buyer'
    });
    setIsLoading(false);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:flex-row font-sans" dir="rtl">
      {/* ============================================================ */}
      {/* LEFT / MAIN FORM CONTAINER (Expanded Space) */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 max-w-xl mx-auto w-full">
        {/* Top Header Logo (Mobile Only) */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <Link to={isAuthenticated && !(currentUser?.id?.startsWith('guest-')) ? '/home' : '/auth'} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md font-black">
              دُو
            </div>
            <span className="text-lg font-black text-slate-900">{data.settings.siteName || 'دُو ماركت'}</span>
          </Link>
        </div>

        {/* Main Form Content */}
        <div className="my-auto space-y-6">
          {/* Title & Subtitle */}
          <div className="text-right space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              {activeTab === 'login' ? 'أدخل بياناتك للمتابعة' : 'أنشئ حسابك الجديد واستمتع بخصومات حصرية'}
            </p>
          </div>

          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-3xl bg-emerald-500 p-6 text-white text-center space-y-3 shadow-xl"
              >
                <CheckCircle2 size={40} className="mx-auto text-white" />
                <h3 className="text-xl font-black">تم إنشاء الحساب بنجاح! 🎉</h3>
                <p className="text-xs text-emerald-100 font-bold">جاري تحويلك إلى المتجر...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forgot Password Modal */}
          <AnimatePresence>
            {showForgotPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl border border-orange-200 bg-orange-50/50 p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                  <span className="text-sm font-black text-orange-900 flex items-center gap-2">
                    <Lock size={16} className="text-orange-500" />
                    استعادة كلمة المرور
                  </span>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setResetMessage(''); }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    إلغاء
                  </button>
                </div>

                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  أدخل بريدك الإلكتروني وسنرسل لك رمز تعيين كلمة المرور فوراً:
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                    />
                    <AtSign size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>

                  {resetMessage && (
                    <div className="rounded-xl bg-emerald-100 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                      {resetMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isResetLoading || !resetEmail.trim()}
                    className="w-full rounded-2xl bg-orange-500 py-3 text-xs font-black text-white shadow-md hover:bg-orange-600 disabled:opacity-50"
                  >
                    {isResetLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!showForgotPassword && (
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {/* Email Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-slate-600">البريد الإلكتروني</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                      <Mail size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-slate-600">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 pe-11 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                      <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Options Row: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowForgotPassword(true); setResetEmail(loginEmail); }}
                      className="text-orange-500 hover:text-orange-600 hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                    <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
                      <span>تذكرني</span>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                    </label>
                  </div>

                  {/* Login Error Alert */}
                  {loginError && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-600 flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Login Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <ArrowLeft size={18} />
                        <span>تسجيل الدخول</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  {/* Name Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-slate-600">الاسم الكامل</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="محمد أحمد"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                      <User size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-slate-600">البريد الإلكتروني</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                      <Mail size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-slate-600">رقم الجوال (اختياري)</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="0901234567"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                      <Phone size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-slate-600">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 pe-11 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                      <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="block text-xs font-bold text-slate-600">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 ps-11 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      />
                      <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-1 text-right">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={e => setAgreedTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
                    </label>
                  </div>

                  {/* Register Error Alert */}
                  {regError && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-600 flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <ArrowLeft size={18} />
                        <span>إنشاء حساب جديد</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          )}

          {/* Divider: أو */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-[#FAF9F6] px-4 text-xs font-bold text-slate-400">
              أو
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => alert('خدمة تسجيل الدخول بـ Google متاحة عبر الحساب المباشر')}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>الدخول بحساب Google</span>
          </button>

          {/* Guest Browsing Button (Mobile Only) */}
          <button
            type="button"
            onClick={handleGuestEntry}
            className="flex lg:hidden w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-100/80 hover:border-slate-400 transition-all active:scale-[0.98]"
          >
            <Sparkles size={16} className="text-amber-500" />
            <span>الدخول كزائر</span>
          </button>

          {/* Switch Tab Link */}
          <div className="text-center pt-2">
            {activeTab === 'login' ? (
              <p className="text-xs font-bold text-slate-500">
                ليس لديك حساب؟{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); }}
                  className="font-black text-orange-500 hover:underline ms-1"
                >
                  أنشئ حساباً جديداً
                </button>
              </p>
            ) : (
              <p className="text-xs font-bold text-slate-500">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setLoginError(''); setRegError(''); }}
                  className="font-black text-orange-500 hover:underline ms-1"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Back Home Link */}
        <div className="pt-6 text-center border-t border-slate-200/60 mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors"
          >
            <Home size={14} />
            <span>العودة للصفحة الرئيسية</span>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* RIGHT PANEL - FLOATING ORANGE BRANDING CARD */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-3/12 xl:w-3/12 min-w-[280px] bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 text-white p-6 sm:p-8 flex-col justify-between relative overflow-hidden shrink-0 shadow-2xl rounded-2xl my-5 ms-8 lg:ms-12 ml-8 lg:ml-12 border border-orange-400/30">
        {/* Background Decorative Glow Circle */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

        {/* Top Branding Badge (Static Header with Orange Square Logo) */}
        <button
          type="button"
          onClick={handleGuestEntry}
          className="relative z-10 flex items-center gap-3 text-right hover:opacity-90 transition-all cursor-pointer group active:scale-95"
          title="اضغط للدخول المباشر إلى المتجر"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-600 font-black text-xl shadow-md border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
            دُو
          </div>
          <div className="text-right">
            <h3 className="text-base font-black text-white leading-none">{data.settings.siteName || 'دُو ماركت'}</h3>
            <span className="text-[10px] text-orange-100 font-bold block mt-1 hover:underline">اضغط للدخول المباشر للمتجر ⚡</span>
          </div>
        </button>

        {/* Campaign Welcome Text (Identical to user's image) */}
        <div className="relative z-10 my-4 space-y-2 text-right border-y border-white/15 py-4">
          <h2 className="text-xl font-black text-white leading-tight tracking-wide drop-shadow-sm">
            كل احتياجاتك اليومية... في لحظة
          </h2>
          <p className="text-xs font-bold text-orange-100 leading-relaxed opacity-95">
            اطلب من متاجرك المفضلة واختر طريقة الاستلام الأنسب لك
          </p>
        </div>

        {/* Guest Entry Button under Campaign Header */}
        <div className="relative z-10 my-2">
          <button
            type="button"
            onClick={handleGuestEntry}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/20 hover:bg-white hover:text-orange-600 backdrop-blur-md py-3 px-4 text-xs font-black text-white transition-all duration-300 active:scale-95 shadow-md w-full group"
          >
            <Sparkles size={16} className="text-amber-300 group-hover:text-orange-600 transition-colors" />
            <span>الدخول كزائر ✨</span>
          </button>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-3 my-auto py-4 text-right">
          {[
            { icon: Tag, text: 'آلاف المنتجات من بائعين موثوقين' },
            { icon: Zap, text: 'صفقات وعروض حصرية كل يوم' },
            { icon: Truck, text: 'شحن سريع لجميع المناطق' },
            { icon: ShieldCheck, text: 'دفع آمن وحماية كاملة' }
          ].map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-bold text-white/90">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/20 shadow-inner">
                  <IconComp size={14} />
                </div>
                <span className="text-[11px] leading-tight">{feat.text}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 pt-4 border-t border-white/15 text-center text-[10px] font-bold text-orange-100">
          منصة تسوق إلكتروني موثقة في المملكة العربية السعودية
        </div>
      </div>
    </div>
  );
};
