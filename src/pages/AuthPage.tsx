import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Fingerprint,
  AtSign,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';

// ============================================================
// Sub-Components
// ============================================================

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  bgColor?: string;
  textColor?: string;
  hoverBg?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  icon,
  label,
  onClick,
  bgColor = 'bg-white/10',
  textColor = 'text-white/70',
  hoverBg = 'hover:bg-white/20'
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-white/10 ${bgColor} py-3 text-xs font-bold ${textColor} ${hoverBg} transition-all duration-300 active:scale-95`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
  rightElement?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  required = true,
  error,
  rightElement
}) => (
  <div className="space-y-1.5 text-right">
    <label className="block text-xs font-bold text-slate-300">
      {label}
      {required && <span className="text-red-400 me-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border ${
          error ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'
        } bg-slate-950/50 p-3.5 ps-11 pe-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20`}
      />
      <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500">
        {icon}
      </span>
      {rightElement && (
        <span className="absolute end-4 top-1/2 -translate-y-1/2">
          {rightElement}
        </span>
      )}
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 text-[11px] font-bold text-red-400 justify-start"
      >
        <AlertCircle size={13} />
        {error}
      </motion.p>
    )}
  </div>
);

// ============================================================
// Main Component
// ============================================================

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, data, isAuthenticated } = useShop();

  // ----- State -----
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

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
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);

  // Shared
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ----- Effects -----
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // ----- Handlers -----
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    const isAdmin = loginEmail.toLowerCase().includes('admin') ||
                    loginEmail.toLowerCase().includes('مدير');

    login({
      name: loginEmail.split('@')[0] || 'مستخدم',
      email: loginEmail.trim(),
      phone: '',
      role: isAdmin ? 'admin' : 'buyer'
    });

    setIsLoading(false);
    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // Validation
    if (regPassword !== regConfirmPassword) {
      setRegError('كلمات المرور غير متطابقة');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (!agreedTerms) {
      setRegError('يرجى الموافقة على الشروط والأحكام');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const isAdmin = regEmail.toLowerCase().includes('admin') ||
                    regEmail.toLowerCase().includes('مدير');

    login({
      name: regName.trim() || 'مستخدم',
      email: regEmail.trim(),
      phone: regPhone.trim(),
      role: isAdmin ? 'admin' : 'buyer'
    });

    setIsLoading(false);
    setShowSuccess(true);

    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

  const handleGuestEntry = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    login({
      id: 'guest-' + Date.now(),
      name: 'زائر المتجر',
      email: '',
      phone: '',
      role: 'buyer'
    });
    setIsLoading(false);
    navigate('/');
  };

  // ----- Animation Variants -----
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      x: -30,
      transition: { duration: 0.25, ease: 'easeIn' }
    }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 300 }
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 my-auto"
      dir="rtl"
    >
      {/* ---------- Animated Background ---------- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 40, 0],
            y: [0, -40, 0]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-orange-600/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-red-600/15 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl"
        />
      </div>

      {/* ---------- Main Card ---------- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
      >
        {/* ----- Success Overlay ----- */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              variants={successVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[2.5rem] bg-slate-900/95 backdrop-blur-xl p-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20"
              >
                <CheckCircle2 size={48} className="text-emerald-400" />
              </motion.div>
              <h2 className="text-2xl font-black text-white">تم إنشاء الحساب بنجاح! 🎉</h2>
              <p className="mt-2 text-sm text-slate-400 font-bold">
                جاري تحويلك إلى المتجر...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----- Header ----- */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2.5 rounded-full bg-orange-500/10 px-4 py-2 border border-orange-500/20">
              <Sparkles size={16} className="text-orange-400" />
              <span className="text-xs font-black text-orange-400">
                {data.settings.siteName || 'دُو ماركت'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {activeTab === 'login' ? 'مرحباً بك مجدداً' : 'انضم إلى المتجر'}
            </h1>
            <p className="text-sm text-slate-400 font-bold max-w-xs mx-auto">
              {activeTab === 'login'
                ? 'سجل دخولك للوصول إلى طلباتك وعروضك الحصرية'
                : 'أنشئ حساباً جديداً واستمتع بتجربة تسوق فريدة'}
            </p>
          </div>
        </div>

        {/* ----- Features Row ----- */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {[
            { icon: Zap, label: 'عروض برق' },
            { icon: Truck, label: 'توصيل سريع' },
            { icon: ShieldCheck, label: 'دفع آمن' },
            { icon: Gift, label: 'مكافآت حصرية' }
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-2xl bg-white/5 p-2.5 border border-white/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                <item.icon size={15} />
              </div>
              <span className="text-[11px] font-bold text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>

        {/* ----- Tab Switcher ----- */}
        <div className="relative mt-6 flex rounded-2xl bg-slate-950/60 p-1 border border-white/5">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setLoginError(''); setRegError(''); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-all duration-300 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-all duration-300 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {/* ----- Forms ----- */}
        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleLogin}
              className="mt-6 space-y-4"
            >
              {/* Email / Phone */}
              <InputField
                label="البريد الإلكتروني أو رقم الجوال"
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="example@mail.com أو 0501234567"
                icon={<AtSign size={18} />}
                error={loginError}
              />

              {/* Password */}
              <InputField
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock size={18} />}
                error={loginError}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                  />
                  <span>تذكرني</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')}
                  className="text-[11px] font-bold text-orange-400 hover:text-orange-300 hover:underline transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft size={18} />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleRegister}
              className="mt-6 space-y-4"
            >
              {/* Name */}
              <InputField
                label="الاسم الكامل"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="محمد أحمد"
                icon={<User size={18} />}
                error={regError}
              />

              {/* Email */}
              <InputField
                label="البريد الإلكتروني"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="example@mail.com"
                icon={<Mail size={18} />}
                error={regError}
              />

              {/* Phone */}
              <InputField
                label="رقم الجوال (اختياري)"
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0501234567"
                icon={<Phone size={18} />}
                required={false}
                error={regError}
              />

              {/* Password */}
              <InputField
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="•••••••• (6 أحرف على الأقل)"
                icon={<Lock size={18} />}
                error={regError}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {/* Confirm Password */}
              <InputField
                label="تأكيد كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Fingerprint size={18} />}
                error={regError}
              />

              {/* Checkboxes */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                  />
                  <span>أوافق على <button type="button" className="text-orange-400 hover:underline">شروط الاستخدام</button> و <button type="button" className="text-orange-400 hover:underline">سياسة الخصوصية</button></span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={receiveUpdates}
                    onChange={(e) => setReceiveUpdates(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-slate-950 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
                  />
                  <span>أرغب في تلقي العروض والتحديثات</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>إنشاء حساب جديد</span>
                    <ArrowLeft size={18} />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ----- Divider ----- */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] font-bold text-slate-400">
            أو تابع كزائر
          </span>
        </div>

        {/* ----- Guest & Social Buttons ----- */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGuestEntry}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>🛒 التصفح كزائر (معاينة المتجر)</span>
          </button>

          <div className="flex items-center gap-2.5">
            <SocialButton
              icon={<span className="text-lg">🔑</span>}
              label="دخول مسؤول"
              onClick={() => {
                login({
                  id: 'admin-demo',
                  name: 'مدير النظام',
                  email: 'admin@doomarket.com',
                  phone: '',
                  role: 'admin'
                });
                navigate('/');
              }}
              bgColor="bg-purple-500/10"
              textColor="text-purple-400"
              hoverBg="hover:bg-purple-500/20"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <SocialButton
              icon={<span className="text-lg">📱</span>}
              label="حساب تجريبي"
              onClick={() => {
                login({
                  id: 'demo-user',
                  name: 'مستخدم تجريبي',
                  email: 'demo@doomarket.com',
                  phone: '0501234567',
                  role: 'buyer'
                });
                navigate('/');
              }}
              bgColor="bg-emerald-500/10"
              textColor="text-emerald-400"
              hoverBg="hover:bg-emerald-500/20"
            />
          </div>

          {/* Social Media */}
          <div className="flex items-center gap-2.5 mt-1">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-bold text-slate-500">تواصل معنا</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="flex items-center justify-center gap-3">
            {[
              { icon: <Facebook size={18} />, label: 'Facebook', href: data.settings.socialFacebook || '#' },
              { icon: <Twitter size={18} />, label: 'Twitter', href: data.settings.socialX || '#' },
              { icon: <Instagram size={18} />, label: 'Instagram', href: data.settings.socialInstagram || '#' },
              { icon: <Github size={18} />, label: 'GitHub', href: 'https://github.com/munzeralsmaeel/doo-market' }
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/20 hover:text-white transition-all active:scale-95"
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ----- Footer Security ----- */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>مشفر ومحمي بأعلى معايير الأمان</span>
          </div>
          <p className="text-[10px] text-slate-600 font-bold">
            © {new Date().getFullYear()} {data.settings.siteName || 'دُو ماركت'} · جميع الحقوق محفوظة
          </p>
        </div>
      </motion.div>
    </div>
  );
};
