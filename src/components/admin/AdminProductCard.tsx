import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Tag, Zap, Star, Edit, Trash2 } from 'lucide-react';
import { Product } from '../../types';

export const AdminProductCard: React.FC<{
  product: Product;
  currencySymbol: string;
  categories: any[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onUpdate: (id: string, updates: Partial<Product>) => void;
}> = ({ product, currencySymbol, categories, onEdit, onDelete, onUpdate }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabelText, setTempLabelText] = useState(product.customLabelText || '');

  const cat = categories.find(c => c.id === product.categoryId);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const labels = [
    { show: product.flashDeal, label: '⚡ عرض برق', color: 'bg-blue-500' },
    { show: product.featured, label: '⭐ مميز', color: 'bg-indigo-500' },
    { show: product.bestseller, label: '🏆 الأكثر مبيعاً', color: 'bg-violet-500' },
    { show: product.isNew, label: '🆕 جديد', color: 'bg-cyan-500' },
    { show: product.freeShipping, label: '🚚 شحن مجاني', color: 'bg-sky-500' },
    { show: product.hasCustomLabel && product.customLabelText, label: `🎯 ${product.customLabelText}`, color: 'bg-pink-500' },
  ];

  const activeLabels = labels.filter(l => l.show);

  const handleSaveLabel = () => {
    onUpdate(product.id, { customLabelText: tempLabelText });
    setIsEditingLabel(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[2.5rem] shadow-sm ring-1 transition-all duration-300 overflow-hidden ${
        product.active
          ? 'ring-black/5 hover:ring-blue-200 hover:shadow-xl'
          : 'ring-black/5 bg-slate-50/50 opacity-70'
      }`}
    >
      {/* ====== HEADER ====== */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-100">
              <img
                src={product.images[imageIndex] || '/images/placeholder.jpg'}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => (e.currentTarget.src = '/images/placeholder.jpg')}
              />
            </div>
            {product.images.length > 1 && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === imageIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}
            {discount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 text-right min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate(product.id, { active: !product.active })}
                  className={`p-1.5 rounded-xl transition-all ${
                    product.active
                      ? 'text-emerald-500 hover:bg-emerald-50'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={product.active ? 'إخفاء المنتج' : 'إظهار المنتج'}
                >
                  {product.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  product.active
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {product.active ? 'نشط' : 'مخفي'}
                </span>
              </div>
            </div>

            <h3 className="font-black text-base text-slate-900 mt-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium truncate">
              {product.nameEn}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-end">
              <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                {cat?.name || 'عام'}
              </span>
              <span className="text-[9px] font-black text-slate-400">
                🏷️ {product.sold} مباع
              </span>
              <span className="text-[9px] font-black text-slate-400">
                ⭐ {product.rating} ({product.reviews})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== BODY ====== */}
      <div className="p-5 space-y-4">
        {/* Price Section */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/30">
          <div className="flex-1 text-right">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider">السعر الحالي</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-black text-slate-900">
                {product.price.toLocaleString()} {currencySymbol}
              </span>
              {discount > 0 && (
                <span className="text-[10px] text-slate-400 line-through">
                  {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="text-center shrink-0 border-r border-blue-200/50 pr-4">
            <p className="text-[10px] font-black text-slate-400">المخزون</p>
            <p className={`text-lg font-black ${product.stock <= 5 ? 'text-red-500' : 'text-slate-900'}`}>
              {product.stock}
            </p>
          </div>
        </div>

        {/* Labels */}
        {activeLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end">
            {activeLabels.map((label, idx) => (
              <span
                key={idx}
                className={`text-[9px] font-black text-white px-2.5 py-1 rounded-full ${label.color} shadow-sm`}
              >
                {label.label}
              </span>
            ))}
          </div>
        )}

        {/* القسم + ملصق مخصص */}
        <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border-2 border-slate-200/30">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/80 border border-slate-200/50">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-pink-500" />
              <span className="text-[10px] font-black text-slate-700">ملصق مخصص</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer scale-75">
              <input
                type="checkbox"
                checked={product.hasCustomLabel}
                onChange={() => onUpdate(product.id, { hasCustomLabel: !product.hasCustomLabel })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-pink-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 peer-checked:after:translate-x-[-20px] shadow-inner relative"></div>
            </label>
          </div>

          {product.hasCustomLabel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black text-slate-500">نص الملصق</span>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingLabel) {
                      handleSaveLabel();
                    } else {
                      setTempLabelText(product.customLabelText || '');
                      setIsEditingLabel(true);
                    }
                  }}
                  className={`text-[9px] font-black transition-colors ${isEditingLabel ? 'text-emerald-600' : 'text-blue-500'}`}
                >
                  {isEditingLabel ? 'حفظ' : 'تعديل'}
                </button>
              </div>

              {isEditingLabel ? (
                <input
                  type="text"
                  value={tempLabelText}
                  onChange={(e) => setTempLabelText(e.target.value)}
                  placeholder="اكتب النص هنا..."
                  className="w-full rounded-xl border-2 border-pink-100 bg-white p-2 text-xs font-bold outline-none focus:border-pink-300 transition-all text-right"
                  autoFocus
                />
              ) : (
                <div className="p-2 rounded-xl bg-white/50 border border-slate-200/50 text-right">
                  <span className="text-[11px] font-black text-pink-600">
                    {product.customLabelText || 'لم يتم إدخال نص'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Quick Toggles */}
        <div className="grid grid-cols-2 gap-2">
           <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-[10px] font-black text-slate-600 flex items-center gap-1"><Zap size={12} className="text-blue-500"/> برق</span>
              <input type="checkbox" checked={product.flashDeal} onChange={() => onUpdate(product.id, { flashDeal: !product.flashDeal })} className="rounded accent-blue-500 scale-90" />
           </label>
           <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="text-[10px] font-black text-slate-600 flex items-center gap-1"><Star size={12} className="text-indigo-500"/> مميز</span>
              <input type="checkbox" checked={product.featured} onChange={() => onUpdate(product.id, { featured: !product.featured })} className="rounded accent-indigo-500 scale-90" />
           </label>
        </div>
      </div>

      {/* ====== FOOTER ====== */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="flex-1 h-10 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <Edit size={14} /> تعديل كامل
        </button>
        <button
          type="button"
          onClick={() => onDelete(product.id, product.name)}
          className="h-10 w-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};
