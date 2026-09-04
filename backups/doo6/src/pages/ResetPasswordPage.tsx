import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const requestSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صحيح'),
});

const updateSchema = z.object({
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string().min(8, 'تأكيد كلمة المرور مطلوب'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type RequestFormData = z.infer<typeof requestSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, updatePassword, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'request' | 'update'>('request');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register: requestRegister,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors, isSubmitting: requestSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const {
    register: updateRegister,
    handleSubmit: handleUpdateSubmit,
    formState: { errors: updateErrors, isSubmitting: updateSubmitting },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setStep('update');
    }
  }, [searchParams]);

  const onRequestReset = async (data: RequestFormData) => {
    setServerError('');
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (error: any) {
      setServerError(error.message || 'فشل إرسال رابط إعادة التعيين');
    }
  };

  const onUpdatePassword = async (data: UpdateFormData) => {
    setServerError('');
    try {
      await updatePassword(data.password);
      setSuccess(true);
      setTimeout(() => navigate('/auth'), 2000);
    } catch (error: any) {
      setServerError(error.message || 'فشل تحديث كلمة المرور');
    }
  };

  const isLoading = authLoading || requestSubmitting || updateSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-orange-600/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-red-600/15 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
      >
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span>رجوع إلى تسجيل الدخول</span>
        </button>

        <div className="mt-4 text-center space-y-2">
          <h1 className="text-2xl font-black text-white">
            {step === 'request' ? 'استعادة كلمة المرور' : 'تعيين كلمة مرور جديدة'}
          </h1>
          <p className="text-sm text-slate-400 font-bold">
            {step === 'request'
              ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
              : 'أدخل كلمة المرور الجديدة لحسابك'}
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"
          >
            <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-3" />
            <p className="text-sm font-bold text-emerald-400">
              {step === 'request'
                ? 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني بنجاح'
                : 'تم تحديث كلمة المرور بنجاح! جاري التحويل...'}
            </p>
          </motion.div>
        ) : (
          <>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center text-xs font-bold text-red-400"
              >
                {serverError}
              </motion.div>
            )}

            {step === 'request' ? (
              <form onSubmit={handleRequestSubmit(onRequestReset)} className="mt-6 space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-bold text-slate-300">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      {...requestRegister('email')}
                      className={`w-full rounded-2xl border ${
                        requestErrors.email ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'
                      } bg-slate-950/50 p-3.5 ps-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20`}
                    />
                    <Mail size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  {requestErrors.email && (
                    <p className="flex items-center gap-1 text-[11px] font-bold text-red-400 justify-start">
                      <AlertCircle size={13} /> {requestErrors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>إرسال رابط الاستعادة</span>
                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpdateSubmit(onUpdatePassword)} className="mt-6 space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-bold text-slate-300">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="•••••••• (8 أحرف على الأقل)"
                      {...updateRegister('password')}
                      className={`w-full rounded-2xl border ${
                        updateErrors.password ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'
                      } bg-slate-950/50 p-3.5 ps-11 pe-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20`}
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
                  {updateErrors.password && (
                    <p className="flex items-center gap-1 text-[11px] font-bold text-red-400 justify-start">
                      <AlertCircle size={13} /> {updateErrors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="block text-xs font-bold text-slate-300">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...updateRegister('confirmPassword')}
                      className={`w-full rounded-2xl border ${
                        updateErrors.confirmPassword ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'
                      } bg-slate-950/50 p-3.5 ps-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20`}
                    />
                    <Lock size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  {updateErrors.confirmPassword && (
                    <p className="flex items-center gap-1 text-[11px] font-bold text-red-400 justify-start">
                      <AlertCircle size={13} /> {updateErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition-all hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>تحديث كلمة المرور</span>
                      <ArrowLeft size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};
