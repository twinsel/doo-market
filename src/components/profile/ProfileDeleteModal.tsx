import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ProfileDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDeleting: boolean;
  onConfirmDelete: () => void;
}

export const ProfileDeleteModal: React.FC<ProfileDeleteModalProps> = ({
  isOpen,
  onClose,
  isDeleting,
  onConfirmDelete,
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
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-lg font-black text-gray-900">حذف الحساب نهائياً</h3>
            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟ سيتم مسح جميع بياناتك وعناوينك وطلباتك المخزنة ولا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="flex-1 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={onConfirmDelete}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black text-white shadow-lg shadow-red-600/25 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف الحساب'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
