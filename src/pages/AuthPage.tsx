import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Phone, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BrandLogoBadge } from '../components/Header';

export const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, data } = useShop();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      name: name.trim() || 'مستخدم',
      email: email.trim(),
      phone: phone.trim(),
      role: email.includes('admin') ? 'admin' : 'buyer'
    });
    navigate(-1);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5 text-center space-y-6">
        <div className="flex justify-center">
          <BrandLogoBadge size="lg" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {tab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>
          <p className="mt-1 text-xs text-gray-500 font-bold">
            مرحباً بك في {data.settings.siteName} — تسوق بذكاء
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 rounded-xl py-2.5 text-xs font-black transition-all ${
              tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 rounded-xl py-2.5 text-xs font-black transition-all ${
              tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            حساب جديد
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الاسم الكامل</label>
              <div className="relative">
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold ps-10 outline-none focus:border-orange-500 focus:bg-white"
                />
                <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">البريد الإلكتروني أو رقم الهاتف</label>
            <div className="relative">
              <input
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold ps-10 outline-none focus:border-orange-500 focus:bg-white"
              />
              <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">كلمة المرور</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold ps-10 pe-10 outline-none focus:border-orange-500 focus:bg-white"
              />
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 hover:opacity-95 active:scale-95 transition-all"
          >
            {tab === 'login' ? 'دخول' : 'تسجيل حساب'}
          </button>
        </form>
      </div>
    </div>
  );
};
