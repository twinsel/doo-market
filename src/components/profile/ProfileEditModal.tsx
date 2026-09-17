import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { User } from '../../types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  editName: string;
  setEditName: (name: string) => void;
  editPhone: string;
  setEditPhone: (phone: string) => void;
  editAvatar: string;
  setEditAvatar: (avatar: string) => void;
  editSuccessMsg: string;
  isSavingProfile: boolean;
  handleSaveProfile: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  presetAvatars: string[];
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  editAvatar,
  setEditAvatar,
  editSuccessMsg,
  isSavingProfile,
  handleSaveProfile,
  handleImageUpload,
  presetAvatars,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-right"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">تعديل بيانات الحساب</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-600 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Selection & Upload */}
              <div className="space-y-2 text-right">
                <label className="block text-xs font-bold text-gray-600">الصورة الشخصية</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-inner shrink-0 ring-2 ring-orange-100">
                    {editAvatar ? (
                      <img src={editAvatar} className="h-full w-full object-cover" alt="" />
                    ) : (
                      currentUser.name.charAt(0)
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-orange-300 bg-orange-50/50 p-2 text-xs font-black text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer">
                      <Upload size={14} />
                      <span>تحميل صورة من جهازك</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {editAvatar && (
                      <button
                        type="button"
                        onClick={() => setEditAvatar('')}
                        className="text-[10px] font-bold text-red-500 hover:underline block"
                      >
                        إزالة الصورة الشخصية
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset Avatars Row */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-gray-400 mb-1.5">أو اختر صورة رمزية جاهزة:</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(url)}
                        className={`h-10 w-10 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          editAvatar === url ? 'border-orange-500 ring-2 ring-orange-500/30 scale-105' : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <img src={url} className="h-full w-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <label className="block text-xs font-bold text-gray-600">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="block text-xs font-bold text-gray-600">رقم الجوال</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1 text-right opacity-60">
                <label className="block text-xs font-bold text-gray-500">البريد الإلكتروني (غير قابل للتعديل)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email || ''}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 p-3 text-sm font-bold text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={onClose}
                  className="rounded-2xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-black text-white shadow-md transition-all active:scale-95 ${
                    isSavingProfile
                      ? 'bg-slate-800 shadow-slate-800/20 cursor-wait'
                      : 'bg-orange-500 shadow-orange-500/20 hover:bg-orange-600'
                  }`}
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-orange-400" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ التعديلات</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
