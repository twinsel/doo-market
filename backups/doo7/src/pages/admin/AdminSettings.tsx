import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Sparkles, LogOut, Store, Palette, Phone, Share2, Bell, QrCode, Shield, Database, Globe, Heart, Mail, MessageCircle, Instagram, Youtube, Facebook, Twitter, Lock, RefreshCw, Download, Upload, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

// ============================================================
// 🏷️  مكونات مساعدة أنيقة
// ============================================================

const SectionCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  variant?: 'default' | 'gradient' | 'glass';
}> = ({ title, description, children, icon, iconBg = 'from-slate-700 to-slate-900', variant = 'default' }) => {
  const variants = {
    default: 'bg-white shadow-sm ring-1 ring-black/5',
    gradient: 'bg-gradient-to-br from-white to-orange-50/50 ring-1 ring-orange-200/50 shadow-lg shadow-orange-100/20',
    glass: 'bg-white/80 backdrop-blur-xl ring-1 ring-white/20 shadow-xl'
  };

  return (
    <section className={`rounded-3xl p-6 ${variants[variant]} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center text-white shadow-lg`}>
              {icon}
            </div>
          )}
          <div>
            <h2 className="font-black text-slate-900 text-base tracking-tight">{title}</h2>
            {description && (
              <p className="text-xs text-slate-400 font-medium mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
};

const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, type = 'text', placeholder, icon, required, min, max, step }) => {
  return (
    <label className="block text-right">
      <span className="mb-1.5 block text-xs font-black text-slate-600 mr-1 flex items-center gap-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-400/10 transition-all duration-200 placeholder:text-slate-300"
      />
    </label>
  );
};

const TextAreaField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => {
  return (
    <label className="block text-right">
      <span className="mb-1.5 block text-xs font-black text-slate-600 mr-1">{label}</span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full min-h-[80px] rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-400/10 transition-all duration-200 resize-y placeholder:text-slate-300"
      />
    </label>
  );
};

const ToggleSwitch: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => {
  return (
    <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border-2 border-slate-200/80 cursor-pointer hover:border-orange-200 transition-all duration-200">
      <div>
        <p className="text-sm font-black text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
      </div>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:after:translate-x-[-20px] shadow-inner"></div>
      </div>
    </label>
  );
};

// ============================================================
// 🏠  الصفحة الرئيسية
// ============================================================

export const AdminSettingsPage: React.FC = () => {
  const { data, updateSettings, resetData } = useShop();
  const a = data.settings;

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [jsonBackup, setJsonBackup] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const t = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    const saved = localStorage.getItem('doo_admin_pass') || 'admin';
    if (currentPass !== saved && currentPass !== 'admin') {
      setPassError('كلمة المرور الحالية غير صحيحة');
      return;
    }

    if (newPass.length < 4) {
      setPassError('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('تأكيد كلمة المرور غير متطابق');
      return;
    }

    localStorage.setItem('doo_admin_pass', newPass);
    setPassSuccess('تم تغيير كلمة مرور المسؤول بنجاح!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `doo-market-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importBackup = () => {
    try {
      const parsed = JSON.parse(jsonBackup);
      data.settings = { ...data.settings, ...parsed.settings };
      if (parsed.products) data.products = parsed.products;
      if (parsed.categories) data.categories = parsed.categories;
      if (parsed.banners) data.banners = parsed.banners;
      if (parsed.sections) data.sections = parsed.sections;
      updateSettings({});
      alert('✅ تم استيراد البيانات بنجاح!');
      setJsonBackup('');
    } catch {
      alert('❌ ملف JSON غير صالح');
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Header */}
      <div className="relative h-20 overflow-hidden rounded-3xl bg-slate-900 px-6 shadow-xl flex items-center justify-between">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Left Side: Version Badge */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10 text-white">
            <span className="text-[10px] font-black text-slate-300">إصدار النظام</span>
            <span className="text-[10px] font-black text-orange-400">v2.0.0</span>
          </div>
        </div>

        {/* Right Side: Title & Icon */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="text-right">
            <h1 className="text-lg font-black text-white flex items-center justify-end gap-3">
              إعدادات المتجر
              <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <Store className="text-orange-400" size={20} />
              </div>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">الهوية، الأمان، والنسخ الاحتياطي</p>
          </div>
        </div>
      </div>

      {/* 1. هوية المشروع */}
      <SectionCard
        title="هوية المشروع / العلامة"
        description="غيّر اسم المتجر وشعار الأيقونة مثل ما تغيّر العملة"
        icon={<Store size={18} />}
        iconBg="from-orange-500 to-orange-600"
        variant="gradient"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="اسم المتجر (الكامل)"
            value={a.siteName}
            onChange={v => t('siteName', v)}
            icon={<Globe size={14} />}
            placeholder="مثل: دوو ماركت"
          />
          <InputField
            label="نص الأيقونة (قصير)"
            value={a.brandMark}
            onChange={v => t('brandMark', v)}
            icon={<Palette size={14} />}
            placeholder="مثل: دوو"
          />
          <InputField
            label="الشعار الفرعي"
            value={a.siteTagline}
            onChange={v => t('siteTagline', v)}
            icon={<Heart size={14} />}
            placeholder="شعار المتجر"
          />
          <InputField
            label="رمز العملة"
            value={a.currencySymbol}
            onChange={v => t('currencySymbol', v)}
            icon={<span className="text-sm">💰</span>}
            placeholder="مثل: ر.س, $"
          />
          <InputField
            label="حد الشحن المجاني"
            value={String(a.freeShippingMin)}
            onChange={v => t('freeShippingMin', Number(v) || 0)}
            icon={<span className="text-sm">🚚</span>}
            type="number"
            min={0}
            placeholder="مثل: 200"
          />
        </div>
      </SectionCard>

      {/* 2. حجز المخزون */}
      <SectionCard
        title="حجز المخزون في السلة"
        description="عند التفعيل: إضافة منتج للسلة يخصم الكمية فوراً من المخزون"
        icon={<Lock size={18} />}
        iconBg="from-blue-500 to-blue-600"
      >
        <ToggleSwitch
          label="تفعيل حجز المخزون عند الإضافة للسلة"
          checked={a.reserveStockInCart}
          onChange={v => t('reserveStockInCart', v)}
        />
        <div className="mt-4">
          <InputField
            label="مدة الحجز (بالساعات)"
            value={String(a.cartHoldHours)}
            onChange={v => t('cartHoldHours', Number(v) || 1)}
            type="number"
            min={1}
            placeholder="مثل: 24"
            icon={<span className="text-sm">⏰</span>}
          />
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            💡 أمثلة: 1 = ساعة · 2 = ساعتان · 6 = ست ساعات · 24 = يوم
          </p>
        </div>
      </SectionCard>

      {/* 3. التواصل */}
      <SectionCard
        title="التواصل"
        description="معلومات التواصل الأساسية للمتجر"
        icon={<Phone size={18} />}
        iconBg="from-emerald-500 to-emerald-600"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="الهاتف"
            value={a.phone}
            onChange={v => t('phone', v)}
            icon={<Phone size={14} />}
            placeholder="+966 50 000 0000"
          />
          <InputField
            label="البريد"
            value={a.email}
            onChange={v => t('email', v)}
            icon={<Mail size={14} />}
            placeholder="info@domain.com"
          />
          <InputField
            label="واتساب (مع مفتاح الدولة)"
            value={a.whatsapp}
            onChange={v => t('whatsapp', v)}
            icon={<MessageCircle size={14} />}
            placeholder="966501234567"
          />
        </div>
        <ToggleSwitch
          label="إظهار الاشتراك بتنبيهات واتساب في المتجر"
          checked={Boolean(a.showWhatsAppSubscribe ?? true)}
          onChange={v => t('showWhatsAppSubscribe', v)}
        />
      </SectionCard>

      {/* 4. وسائل التواصل الاجتماعي */}
      <SectionCard
        title="وسائل التواصل الاجتماعي"
        description="روابط حسابات المتجر على منصات التواصل"
        icon={<Share2 size={18} />}
        iconBg="from-purple-500 to-purple-600"
      >
        <ToggleSwitch
          label="إظهار أيقونات التواصل في الفوتر"
          checked={a.showSocial}
          onChange={v => t('showSocial', v)}
        />
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <InputField
            label="فيسبوك"
            value={a.socialFacebook}
            onChange={v => t('socialFacebook', v)}
            icon={<Facebook size={14} />}
            placeholder="https://facebook.com/..."
          />
          <InputField
            label="تويتر"
            value={a.socialX}
            onChange={v => t('socialX', v)}
            icon={<Twitter size={14} />}
            placeholder="https://twitter.com/..."
          />
          <InputField
            label="يوتيوب"
            value={a.socialYoutube}
            onChange={v => t('socialYoutube', v)}
            icon={<Youtube size={14} />}
            placeholder="https://youtube.com/..."
          />
          <InputField
            label="إنستغرام"
            value={a.socialInstagram}
            onChange={v => t('socialInstagram', v)}
            icon={<Instagram size={14} />}
            placeholder="https://instagram.com/..."
          />
          <InputField
            label="تلغرام"
            value={a.socialTelegram}
            onChange={v => t('socialTelegram', v)}
            icon={<MessageCircle size={14} />}
            placeholder="https://t.me/..."
          />
        </div>
      </SectionCard>

      {/* 5. شريط الإعلان */}
      <SectionCard
        title="شريط الإعلان"
        description="شريط يظهر أعلى الموقع للإعلانات المهمة"
        icon={<Bell size={18} />}
        iconBg="from-amber-500 to-amber-600"
      >
        <ToggleSwitch
          label="إظهار شريط الإعلان أعلى الموقع"
          checked={a.showAnnouncement}
          onChange={v => t('showAnnouncement', v)}
        />
        <div className="mt-4">
          <InputField
            label="نص الإعلان"
            value={a.announcement}
            onChange={v => t('announcement', v)}
            icon={<Bell size={14} />}
            placeholder="خصم 20% على جميع المنتجات"
          />
        </div>
      </SectionCard>

      {/* 6. رمز QR */}
      <SectionCard
        title="رمز QR"
        description="رمز QR للتواصل السريع مع المتجر"
        icon={<QrCode size={18} />}
        iconBg="from-indigo-500 to-indigo-600"
      >
        <ToggleSwitch
          label="إظهار رمز QR في الموقع"
          checked={a.showQr}
          onChange={e => t('showQr', e)}
        />
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <InputField
            label="عنوان QR"
            value={a.qrTitle}
            onChange={v => t('qrTitle', v)}
            placeholder="اسحب للتحميل"
          />
          <InputField
            label="رابط صورة QR"
            value={a.qrImage}
            onChange={v => t('qrImage', v)}
            placeholder="https://..."
          />
        </div>
        <InputField
          label="وصف QR"
          value={a.qrSubtitle}
          onChange={v => t('qrSubtitle', v)}
          placeholder="قسم المكياج والعناية..."
        />
        {a.qrImage && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 border-2 border-slate-200/80">
            <p className="mb-2 text-xs font-black text-slate-600">📸 معاينة الرمز الحالي</p>
            <img
              src={a.qrImage}
              alt="رمز QR"
              className="h-28 w-28 rounded-xl object-contain ring-1 ring-slate-200 bg-white p-2"
            />
          </div>
        )}
      </SectionCard>

      {/* 7. شاشات الترحيب والوداع */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50/50 via-white to-orange-50/50 p-6 shadow-sm ring-1 ring-blue-200/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="text-blue-500" size={24} />
              شاشات الترحيب والوداع
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              تخصيص الرسائل التي تظهر للمستخدم عند فتح التطبيق أو الخروج منه
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 border-2 border-blue-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Sparkles size={16} />
              </div>
              <span className="text-xs font-black text-blue-600">شاشة الترحيب (البداية)</span>
            </div>

            <ToggleSwitch
              label="تفعيل شاشة الترحيب"
              checked={a.showWelcomeScreen !== false}
              onChange={v => t('showWelcomeScreen', v)}
            />

            <div className="mt-4 space-y-4">
              <TextAreaField
                label="رسالة الترحيب"
                value={a.welcomeMessage}
                onChange={v => t('welcomeMessage', v)}
                placeholder="أهلاً بك في دوو ماركت..."
                rows={2}
              />
              <InputField
                label="مدة الظهور (بالثواني)"
                type="number"
                min={1}
                value={a.welcomeDuration || 4}
                onChange={v => t('welcomeDuration', Number(v) || 4)}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 border-2 border-orange-100/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <LogOut size={16} />
              </div>
              <span className="text-xs font-black text-orange-600">شاشة الوداع (تسجيل الخروج)</span>
            </div>

            <p className="text-[10px] text-slate-400 font-medium mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
              💡 تظهر هذه الرسالة عند الضغط على تسجيل الخروج كعميل.
            </p>

            <div className="space-y-4">
              <TextAreaField
                label="رسالة الوداع"
                value={a.logoutMessage}
                onChange={v => t('logoutMessage', v)}
                placeholder="شكراً لزيارتك..."
                rows={2}
              />
              <InputField
                label="مدة الظهور (بالثواني)"
                type="number"
                min={1}
                value={a.logoutDuration || 3}
                onChange={v => t('logoutDuration', Number(v) || 3)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 8. أمان لوحة التحكم */}
      <SectionCard
        title="أمان لوحة التحكم"
        description="تغيير كلمة مرور المسؤول للدخول إلى لوحة التحكم"
        icon={<Shield size={18} />}
        iconBg="from-red-500 to-red-600"
      >
        <div className="bg-red-50/50 p-4 rounded-2xl border-2 border-red-100/50 mb-4">
          <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <AlertCircle size={14} className="text-red-500" />
            الافتراضية حالياً: <span className="font-mono text-orange-600 font-black">admin</span> إن لم تغيّرها من قبل.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
          <div className="relative">
            <InputField
              label="كلمة المرور الحالية"
              value={currentPass}
              onChange={setCurrentPass}
              type={showPassword ? 'text' : 'password'}
              icon={<Lock size={14} />}
            />
          </div>
          <div className="relative">
            <InputField
              label="كلمة المرور الجديدة"
              value={newPass}
              onChange={setNewPass}
              type={showPassword ? 'text' : 'password'}
              icon={<Lock size={14} />}
            />
          </div>
          <div className="relative">
            <InputField
              label="تأكيد كلمة المرور"
              value={confirmPass}
              onChange={setConfirmPass}
              type={showPassword ? 'text' : 'password'}
              icon={<CheckCircle size={14} />}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          </button>

          {passError && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-100 text-red-600 text-xs font-bold">
              <AlertCircle size={14} />
              {passError}
            </div>
          )}
          {passSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-100 text-emerald-600 text-xs font-bold">
              <CheckCircle size={14} />
              {passSuccess}
            </div>
          )}

          <button
            type="submit"
            className="rounded-full bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            تغيير كلمة المرور
          </button>
        </form>
      </SectionCard>

      {/* 9. نسخ احتياطي */}
      <SectionCard
        title="نسخ احتياطي للبيانات"
        description="تصدير أو استيراد بيانات المتجر"
        icon={<Database size={18} />}
        iconBg="from-teal-500 to-teal-600"
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportBackup}
            className="rounded-full bg-gradient-to-br from-teal-500 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-gap-2"
          >
            <Download size={14} />
            تصدير نسخة احتياطية
          </button>
          <button
            onClick={() => {
              if (confirm('⚠️ إعادة ضبط كل البيانات للوضع الافتراضي؟ يُفضّل التصدير أولاً.')) {
                resetData();
                alert('✅ تمت استعادة البيانات للوضع الافتراضي بنجاح');
              }
            }}
            className="rounded-full bg-red-50 px-5 py-2.5 text-xs font-black text-red-600 hover:bg-red-100 transition-all duration-200 flex items-center gap-2 border-2 border-red-100/50"
          >
            <RefreshCw size={14} />
            إعادة ضبط
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <textarea
              value={jsonBackup}
              onChange={e => setJsonBackup(e.target.value)}
              placeholder="📄 الصق محتوى ملف JSON هنا..."
              className="min-h-32 w-full rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 p-4 text-xs font-mono text-slate-700 outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-400/10 transition-all duration-200 resize-y"
            />
          </div>
          <button
            onClick={importBackup}
            className="rounded-full bg-slate-100 px-5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200 transition-all duration-200 flex items-center gap-2 border-2 border-slate-200/50"
          >
            <Upload size={14} />
            استيراد JSON
          </button>
        </div>
      </SectionCard>
    </div>
  );
};
