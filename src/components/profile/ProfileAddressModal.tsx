import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';

interface ProfileAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddressId: string | null;
  addrName: string;
  setAddrName: (val: string) => void;
  addrCity: string;
  setAddrCity: (val: string) => void;
  addrStreet: string;
  setAddrStreet: (val: string) => void;
  addrBuilding: string;
  setAddrBuilding: (val: string) => void;
  addrPhone: string;
  setAddrPhone: (val: string) => void;
  addrNotes: string;
  setAddrNotes: (val: string) => void;
  addrIsDefault: boolean;
  setAddrIsDefault: (val: boolean) => void;
  handleSaveAddress: (e: React.FormEvent) => void;
}

export const ProfileAddressModal: React.FC<ProfileAddressModalProps> = ({
  isOpen,
  onClose,
  editingAddressId,
  addrName,
  setAddrName,
  addrCity,
  setAddrCity,
  addrStreet,
  setAddrStreet,
  addrBuilding,
  setAddrBuilding,
  addrPhone,
  setAddrPhone,
  addrNotes,
  setAddrNotes,
  addrIsDefault,
  setAddrIsDefault,
  handleSaveAddress,
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
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-right"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" />
                {editingAddressId ? 'تعديل عنوان التوصيل' : 'إضافة موقع / عنوان جديد 📍'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600">اسم الموقع (مثال: المنزل، العمل)</label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={e => setAddrName(e.target.value)}
                    placeholder="المنزل"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600">المدينة</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={e => setAddrCity(e.target.value)}
                    placeholder="الرياض، جدة، دمشق..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-600">اسم الحي والشارع التفصيلي *</label>
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={e => setAddrStreet(e.target.value)}
                  placeholder="حي الياسمين، شارع أنس بن مالك"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600">رقم المبنى / الشقة (اختياري)</label>
                  <input
                    type="text"
                    value={addrBuilding}
                    onChange={e => setAddrBuilding(e.target.value)}
                    placeholder="مبنى 12، شقة 4"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600">رقم جوال للتوصيل</label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={e => setAddrPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-600">ملاحظات سائق التوصيل (اختياري)</label>
                <textarea
                  rows={2}
                  value={addrNotes}
                  onChange={e => setAddrNotes(e.target.value)}
                  placeholder="مثال: بجوار المسجد، يرجى الاتصال قبل الوصول"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addrDefault"
                  checked={addrIsDefault}
                  onChange={e => setAddrIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="addrDefault" className="text-xs font-bold text-gray-700 cursor-pointer">
                  تعيين كعنوان افتراضي للتوصيل السريع
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
                >
                  {editingAddressId ? 'حفظ التعديلات' : 'إضافة العنوان 📍'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
