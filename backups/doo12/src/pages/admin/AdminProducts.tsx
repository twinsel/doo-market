import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Zap,
  Check,
  X,
  Package,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Truck,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  ShoppingBag,
  DollarSign,
  Save,
  Upload,
  Image as ImageIcon,
  Tag,
  Edit3,
  Info,
  Layers,
  Box,
  LayoutGrid,
  List,
  Pencil,
  Award
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// 🏷️  شارات الحالة - تصميم عصري بلون أزرق
// ============================================================

const StatusBadge: React.FC<{ status: string; count: number }> = ({ status, count }) => {
  const statusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'عرض برق': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'مميز': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    'نشط': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'شحن مجاني': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    'أكثر مبيعاً': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
    'جديد': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  };

  const colors = statusColors[status] || statusColors['نشط'];

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border
      ${colors.bg} ${colors.text} ${colors.border}
    `}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {status}
      {count > 1 && <span className="text-[9px] opacity-70">({count})</span>}
    </span>
  );
};

// ============================================================
// 📦  بطاقة المنتج للإدارة - التصميم المطور (AdminProductCard)
// ============================================================

const AdminProductCard: React.FC<{
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
  const isLowStock = product.stock <= 5 && product.stock > 0;
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

// ============================================================
// 📊  بطاقة إحصائية - تصميم عصري
// ============================================================

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  textColor: string;
  trend?: number;
}> = ({ title, value, icon: Icon, color, textColor, trend }) => (
  <div className="h-20 bg-white px-5 rounded-[1.75rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
    <div className="text-right flex flex-col justify-center h-full">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="flex items-center gap-2 justify-end">
        {trend !== undefined && (
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        <p className="text-xl font-black text-slate-900">{value.toLocaleString()}</p>
      </div>
    </div>
    <div className={`h-10 w-10 rounded-xl ${color} ${textColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shrink-0`}>
      <Icon size={18} />
    </div>
  </div>
);

// ============================================================
// 📝  نافذة تعديل المنتج - المبوب المودرن (ProductModal)
// ============================================================

interface ProductModalProps {
  product: Product;
  categories: any[];
  currencySymbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onDelete?: (id: string, name: string) => void;
  setEditingProduct: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  currencySymbol,
  isOpen,
  onClose,
  onSave,
  onDelete,
  setEditingProduct
}) => {
  const [imagePreview, setImagePreview] = useState<string>(product.images?.[0] || '');
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'status' | 'variants'>('basic');

  // local state for variant form
  const [varSize, setVarSize] = useState('');
  const [varColor, setVarColor] = useState('#3B82F6');
  const [varStock, setVarStock] = useState(1);
  const [varPrice, setVarPrice] = useState<string>('');
  const [varSku, setVarSku] = useState('');

  useEffect(() => {
    setImagePreview(product.images?.[0] || '');
  }, [product]);

  if (!isOpen) return null;

  const statusOptions = [
    { key: 'flashDeal', label: 'عرض برق', icon: <Zap size={16} />, color: 'red', checked: product.flashDeal },
    { key: 'featured', label: 'مميز', icon: <Star size={16} />, color: 'amber', checked: product.featured },
    { key: 'active', label: 'نشط', icon: <CheckCircle2 size={16} />, color: 'emerald', checked: product.active !== false },
    { key: 'freeShipping', label: 'شحن مجاني', icon: <Truck size={16} />, color: 'blue', checked: product.freeShipping },
    { key: 'bestseller', label: 'أكثر مبيعاً', icon: <TrendingUp size={16} />, color: 'purple', checked: product.bestseller },
    { key: 'isNew', label: 'جديد', icon: <Clock size={16} />, color: 'teal', checked: product.isNew },
  ];

  const activeCount = statusOptions.filter(s => s.checked).length;

  const handleStatusToggle = (key: string) => {
    const currentValue = product[key as keyof Product] as boolean;
    setEditingProduct({ ...product, [key]: !currentValue });
  };

  const assignedStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

  // التحقق من اكتمال المعلومات الأساسية
  const isBasicComplete = product.name.trim() !== '' && product.price > 0 && product.images.length > 0;

  // التحقق من صحة بيانات المقاسات والألوان (إذا كانت مفعلة)
  const isVariantsValid = useMemo(() => {
    if (!product.hasVariants) return true;
    if (assignedStock !== product.stock) return false;

    return product.variants?.every(v => {
      const sizeValid = product.hasSizes === false || (v.size && v.size !== 'none');
      const colorValid = product.hasColors === false || (v.color && v.color !== 'none' && v.color !== '#FFFFFF');
      return sizeValid && colorValid;
    }) ?? false;
  }, [product, assignedStock]);

  // التحقق النهائي من صلاحية الحفظ
  const canSave = isBasicComplete && isVariantsValid;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 shrink-0 text-white" dir="rtl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Package size={28} />
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black">{product.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-1">قم بتحديث بيانات المتجر بدقة واحترافية</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {product.id && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(product.id, product.name)}
                  className="h-12 px-5 rounded-2xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 border border-red-500/20"
                >
                  <Trash2 size={18} /> <span className="text-xs font-black">حذف</span>
                </button>
              )}
              <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center backdrop-blur-md">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="relative flex gap-2 mt-8 bg-black/20 rounded-2xl p-1.5 backdrop-blur-sm">
            {[
              { id: 'basic', label: 'المعلومات الأساسية', icon: Edit3 },
              { id: 'details', label: 'تفاصيل العرض', icon: Info },
              ...(product.hasVariants ? [{ id: 'variants', label: 'المقاسات والألوان', icon: Box }] : []),
              { id: 'status', label: `الحالات (${activeCount})`, icon: Tag }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar" dir="rtl">
          <form onSubmit={onSave} className="space-y-8">
            {activeTab === 'basic' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2 flex items-center gap-2">اسم المنتج <span className="text-red-500">*</span></label>
                  <input required value={product.name} onChange={e => setEditingProduct({ ...product, name: e.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black outline-none focus:bg-white focus:border-blue-500 transition-all text-right" placeholder="ادخل اسم المنتج هنا..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">السعر الحالي ({currencySymbol})</label>
                    <input type="number" required value={product.price} onChange={e => setEditingProduct({ ...product, price: Number(e.target.value) })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black outline-none focus:bg-white focus:border-blue-500 transition-all text-right" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">السعر الأصلي</label>
                    <input type="number" value={product.originalPrice} onChange={e => setEditingProduct({ ...product, originalPrice: Number(e.target.value) })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black outline-none focus:bg-white focus:border-blue-500 transition-all text-right" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2 flex items-center justify-between">
                       <span>إجمالي المخزون المستهدف</span>
                       <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-md">يجب توزيعه بالكامل</span>
                    </label>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={e => setEditingProduct({ ...product, stock: Number(e.target.value) })}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black outline-none focus:bg-white focus:border-blue-500 transition-all text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2 flex items-center gap-2"><ImageIcon size={14}/> رابط الصورة الرئيسية</label>
                  <div className="flex gap-2">
                    <input value={product.images[0] || ''} onChange={e => { setEditingProduct({ ...product, images: [e.target.value] }); setImagePreview(e.target.value); }} className="flex-1 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black outline-none focus:bg-white transition-all text-right" placeholder="https://..." />
                    <div className="relative shrink-0">
                       <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) {
                           const reader = new FileReader();
                           reader.onloadend = () => { setImagePreview(reader.result as string); setEditingProduct({ ...product, images: [reader.result as string] }); };
                           reader.readAsDataURL(file);
                         }
                       }} />
                       <button type="button" className="h-full px-6 rounded-2xl bg-blue-50 text-blue-600 border-2 border-blue-100 text-xs font-black hover:bg-blue-100 transition-all flex items-center gap-2"><Upload size={18}/> رفع</button>
                    </div>
                  </div>
                </div>

                {imagePreview && (
                  <div className="relative w-full h-56 rounded-[2rem] overflow-hidden border-4 border-slate-50 bg-slate-100 group">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImagePreview(''); setEditingProduct({ ...product, images: [] }); }} className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-red-500 text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2 flex items-center gap-2"><Info size={14}/> وصف المنتج</label>
                  <textarea rows={6} value={product.description || ''} onChange={e => setEditingProduct({ ...product, description: e.target.value })} className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition-all text-right resize-none custom-scrollbar" placeholder="اشرح تفاصيل المنتج ومميزاته هنا..." />
                </div>

                {/* مفتاح المقاسات والألوان */}
                <div className="space-y-4">
                  <div className="p-4 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">المقاسات والألوان</p>
                      <p className="text-[10px] text-slate-400 font-bold">تفعيل خيارات المقاسات والألوان لهذا المنتج</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={product.hasVariants}
                        onChange={e => setEditingProduct({
                          ...product,
                          hasVariants: e.target.checked,
                          hasSizes: e.target.checked ? (product.hasSizes ?? true) : false,
                          hasColors: e.target.checked ? (product.hasColors ?? true) : false
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-20px] shadow-inner"></div>
                    </label>
                  </div>

                </div>


                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2 flex items-center gap-2"><Star size={14} className="text-amber-400"/> التقييم الافتراضي</label>
                    <input type="number" step="0.1" max="5" value={product.rating || 0} onChange={e => setEditingProduct({ ...product, rating: Number(e.target.value) })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500"/> إجمالي المبيعات</label>
                    <input type="number" value={product.sold || 0} onChange={e => setEditingProduct({ ...product, sold: Number(e.target.value) })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right" />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'variants' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 text-right">
                {/* Variant Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-[2.5rem] flex items-center justify-between">
                      <div className="text-left text-white">
                        <p className="text-[10px] font-black text-slate-400 uppercase">المستهدف</p>
                        <p className="text-2xl font-[1000] text-white leading-none">{product.stock}</p>
                      </div>
                   </div>
                   <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-[2.5rem] flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-blue-400 uppercase">الموزع</p>
                        <p className="text-2xl font-[1000] text-blue-700 leading-none">
                           {product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0}
                        </p>
                      </div>
                   </div>
                   <div className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between ${
                     (product.stock - (product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0)) === 0
                     ? 'bg-emerald-50 border-emerald-100'
                     : 'bg-orange-50 border-orange-100'
                   }`}>
                      <div className="text-left">
                        <p className={`text-[10px] font-black uppercase ${
                          (product.stock - (product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0)) === 0
                          ? 'text-emerald-400' : 'text-orange-400'
                        }`}>المتبقي</p>
                        <p className={`text-2xl font-[1000] leading-none ${
                          (product.stock - (product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0)) === 0
                          ? 'text-emerald-700' : 'text-orange-700'
                        }`}>
                           {product.stock - (product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0)}
                        </p>
                      </div>
                   </div>
                </div>

                {/* Entry Form */}
                <div className="p-8 rounded-[3rem] bg-slate-50 border-2 border-slate-100 space-y-6">
                   <div className="flex items-center justify-between px-2">
                      <h3 className="font-black text-slate-900 text-base">تقسيم المخزون</h3>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100">أدخل الكميات لكل مقاس ولون</span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-xs font-black text-slate-500">1. المقاس</label>
                          <label className="relative inline-flex items-center cursor-pointer scale-75">
                            <input
                              type="checkbox"
                              checked={product.hasSizes !== false}
                              onChange={e => setEditingProduct({ ...product, hasSizes: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-16px] shadow-inner"></div>
                          </label>
                        </div>
                        {product.hasSizes !== false && (
                          <input
                            value={varSize}
                            onChange={e => setVarSize(e.target.value)}
                            type="text"
                            placeholder="مثلاً: 42"
                            className="w-full h-14 rounded-2xl border-2 border-white bg-white p-4 text-sm font-black outline-none shadow-sm focus:border-blue-500 transition-all text-right"
                          />
                        )}
                        {product.hasSizes === false && (
                          <div className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-[10px] font-bold text-slate-400">المقاس معطل</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                          <label className="text-xs font-black text-slate-500">2. اللون</label>
                          <label className="relative inline-flex items-center cursor-pointer scale-75">
                            <input
                              type="checkbox"
                              checked={product.hasColors !== false}
                              onChange={e => setEditingProduct({ ...product, hasColors: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-16px] shadow-inner"></div>
                          </label>
                        </div>
                        {product.hasColors !== false && (
                          <div className="flex gap-2 h-14 relative">
                             <div className="flex-1 relative">
                                <input
                                  value={varColor}
                                  onChange={e => setVarColor(e.target.value.toUpperCase())}
                                  type="text"
                                  placeholder="#HEX"
                                  className="w-full h-full rounded-2xl border-2 border-white bg-white pr-4 pl-14 text-sm font-black outline-none shadow-sm focus:border-blue-500 transition-all text-right"
                                />
                                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-11 rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                                   <input
                                     type="color"
                                     value={varColor}
                                     onChange={e => setVarColor(e.target.value.toUpperCase())}
                                     className="absolute inset-0 w-full h-full scale-[2] cursor-pointer"
                                   />
                                </div>
                             </div>
                          </div>
                        )}
                        {product.hasColors === false && (
                          <div className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-[10px] font-bold text-slate-400">اللون معطل</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 mr-2 block h-6">3. الكمية</label>
                        <input
                          value={varStock}
                          onChange={e => setVarStock(Number(e.target.value))}
                          type="number"
                          min="1"
                          className="w-full h-14 rounded-2xl border-2 border-white bg-white p-4 text-sm font-black outline-none shadow-sm focus:border-blue-500 transition-all text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 mr-2 block h-6">4. السعر (اختياري)</label>
                        <input
                          value={varPrice}
                          onChange={e => setVarPrice(e.target.value)}
                          type="number"
                          placeholder="نفس السعر"
                          className="w-full h-14 rounded-2xl border-2 border-white bg-white p-4 text-sm font-black outline-none shadow-sm focus:border-blue-500 transition-all text-right"
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 mr-2">رمز التخزين (SKU)</label>
                        <input
                          value={varSku}
                          onChange={e => setVarSku(e.target.value)}
                          type="text"
                          placeholder="مثلاً: SHOE-RED-42"
                          className="w-full h-14 rounded-2xl border-2 border-white bg-white p-4 text-sm font-black outline-none shadow-sm focus:border-blue-500 transition-all text-right"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                             const q = varStock;
                             const s = product.hasSizes !== false ? varSize : 'none';
                             const c = product.hasColors !== false ? varColor : 'none';
                             const p = varPrice ? Number(varPrice) : undefined;
                             const sku = varSku;

                             const assigned = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                             const remaining = product.stock - assigned;

                             if((product.hasSizes !== false && !s) || (product.hasColors !== false && (!c || c === '#FFFFFF')) || q <= 0) {
                                alert(product.hasColors !== false && (!c || c === '#FFFFFF') ? 'الرجاء اختيار لون محدد للمنتج' : 'الرجاء إكمال بيانات المقاس والكمية');
                                return;
                             }
                             if(q > remaining) {
                                alert(`الكمية المدخلة (${q}) أكبر من المتبقي (${remaining})`);
                                return;
                             }

                             const newVariants = [...(product.variants || [])];
                             const existingIdx = newVariants.findIndex(v => v.size === s && v.color === c);
                             if(existingIdx > -1) {
                                newVariants[existingIdx] = { ...newVariants[existingIdx], stock: newVariants[existingIdx].stock + q, price: p, sku };
                             } else {
                                newVariants.push({ id: Math.random().toString(36).substr(2, 9), size: s, color: c, stock: q, price: p, sku });
                             }

                             setEditingProduct({
                               ...product,
                               variants: newVariants,
                               colors: product.hasColors !== false ? Array.from(new Set([...(product.colors || []), c])) : (product.colors || []),
                               sizes: product.hasSizes !== false ? Array.from(new Set([...(product.sizes || []), s])) : (product.sizes || [])
                             });

                             // Reset fields via state
                             setVarSize('');
                             setVarStock(1);
                             setVarPrice('');
                             setVarSku('');
                          }}
                          className="w-full h-14 rounded-2xl bg-blue-600 text-white font-[1000] shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={(product.stock - (product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0)) <= 0}
                        >
                          <Plus size={22} /> إضافة للمخزون (باقي {product.stock - assignedStock})
                        </button>
                      </div>
                   </div>
                </div>

                {/* List of Added Variations */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">توزيع الـ {product.stock} قطعة</h4>
                      {product.variants && product.variants.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...product, variants: [], colors: [], sizes: [] })}
                          className="text-[10px] font-black text-red-500 hover:underline"
                        >
                          تصفير التوزيع
                        </button>
                      )}
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {product.variants?.map((v) => (
                        <div key={v.id} className="relative bg-white border-2 border-slate-100 rounded-[2rem] p-5 shadow-sm hover:border-blue-200 transition-all group">
                           <div className="flex items-center gap-4">
                              {product.hasColors !== false && v.color !== 'none' && (
                                <div className="relative group/color-preview">
                                  <div className="w-12 h-12 rounded-2xl border-4 border-slate-50 shadow-inner flex-shrink-0 cursor-pointer" style={{ backgroundColor: v.color }} />
                                  <input
                                    type="color"
                                    value={v.color}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-12 h-12"
                                    onChange={(e) => {
                                      const newColor = e.target.value.toUpperCase();
                                      const updatedVariants = product.variants?.map(item => item.id === v.id ? { ...item, color: newColor } : item);
                                      setEditingProduct({
                                        ...product,
                                        variants: updatedVariants,
                                        colors: Array.from(new Set([...(product.colors || []), newColor]))
                                      });
                                    }}
                                  />
                                </div>
                              )}
                              {product.hasColors !== false && v.color === 'none' && (
                                <div className="relative group/add-color flex-shrink-0">
                                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-red-200 bg-red-50 flex items-center justify-center text-[8px] font-black text-red-400 group-hover/add-color:bg-red-100 transition-colors cursor-pointer leading-tight text-center px-1">
                                    اضغط لإضافة لون
                                  </div>
                                  <input
                                    type="color"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-12 h-12"
                                    onChange={(e) => {
                                      const newColor = e.target.value.toUpperCase();
                                      const updatedVariants = product.variants?.map(item => item.id === v.id ? { ...item, color: newColor } : item);
                                      setEditingProduct({
                                        ...product,
                                        variants: updatedVariants,
                                        colors: Array.from(new Set([...(product.colors || []), newColor]))
                                      });
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                 {product.hasSizes !== false && v.size !== 'none' && (
                                   <h5 className="font-black text-slate-900 text-sm">المقاس: {v.size}</h5>
                                 )}
                                 {product.hasColors !== false && v.color !== 'none' && (
                                   <p className="text-[10px] font-black text-slate-400 uppercase">{v.color}</p>
                                 )}
                              </div>
                              <div className="text-left">
                                 <span className="text-lg font-black text-blue-600">{v.stock}</span>
                                 <p className="text-[8px] font-black text-slate-300 uppercase">قطعة</p>
                              </div>
                           </div>
                           <button
                             type="button"
                             onClick={() => {
                                const filtered = product.variants?.filter(x => x.id !== v.id);
                                setEditingProduct({ ...product, variants: filtered });
                             }}
                             className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-300"
                           >
                             <Trash2 size={14} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'status' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {statusOptions.map((status) => {
                    const colorVariants: Record<string, string> = {
                      red: status.checked ? 'border-red-500 bg-red-50' : 'border-slate-100 bg-white hover:border-slate-200',
                      amber: status.checked ? 'border-amber-500 bg-amber-50' : 'border-slate-100 bg-white hover:border-slate-200',
                      emerald: status.checked ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200',
                      blue: status.checked ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200',
                      purple: status.checked ? 'border-purple-500 bg-purple-50' : 'border-slate-100 bg-white hover:border-slate-200',
                      teal: status.checked ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white hover:border-slate-200',
                    };
                    return (
                      <label key={status.key} className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 ${colorVariants[status.color]}`}>
                        <div className="flex items-center gap-4 text-right">
                           <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${status.checked ? `bg-${status.color}-500 text-white shadow-lg shadow-${status.color}-500/40` : 'bg-slate-50 text-slate-400'}`}>
                             {status.icon}
                           </div>
                           <span className={`text-sm font-black ${status.checked ? 'text-slate-900' : 'text-slate-400'}`}>{status.label}</span>
                        </div>
                        <input type="checkbox" checked={status.checked} onChange={() => handleStatusToggle(status.key)} className="sr-only" />
                        <div className={`h-6 w-11 rounded-full relative transition-colors duration-300 ${status.checked ? `bg-${status.color}-500` : 'bg-slate-200'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${status.checked ? 'translate-x-[-22px]' : 'translate-x-[-4px]'}`} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-4 border-t-2 border-slate-50">
               {activeTab !== 'status' ? (
                 <div className="flex gap-4">
                   <button
                     type="button"
                     onClick={() => {
                       if (activeTab === 'basic') setActiveTab('details');
                       else if (activeTab === 'details') setActiveTab(product.hasVariants ? 'variants' : 'status');
                       else if (activeTab === 'variants') setActiveTab('status');
                     }}
                     className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                   >
                     الخطوة التالية <ChevronLeft size={18} />
                   </button>
                   <button type="button" onClick={onClose} className="w-32 h-14 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-all">إلغاء</button>
                 </div>
               ) : (
                 <>
                   {!canSave && (
                     <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-black flex items-center justify-center gap-3 border-2 border-red-100">
                        <AlertCircle size={18} />
                        <span>لا يمكنك الحفظ: يرجى استكمال المعلومات الأساسية وتوزيع المخزون بشكل صحيح أولاً.</span>
                     </div>
                   )}
                   {canSave && (
                     <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-black flex items-center justify-center gap-3 border-2 border-emerald-100">
                        <Check size={18} />
                        <span>جميع البيانات مكتملة! يمكنك الآن إضافة المنتج للمتجر.</span>
                     </div>
                   )}
                   <div className="flex gap-4">
                     <button
                       type="submit"
                       disabled={!canSave}
                       className="flex-[2] h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <Save size={20} /> {product.id ? 'حفظ التعديلات' : 'إضافة إلى المتجر'}
                     </button>
                     <button type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-all">إلغاء</button>
                   </div>
                 </>
               )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// 🏠  صفحة المنتجات الرئيسية للإدارة (AdminProductsPage)
// ============================================================

export const AdminProductsPage: React.FC = () => {
  const { data, addProduct, updateProduct, deleteProduct } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  const filteredProducts = useMemo(() => {
    return (data.products || []).filter(p => {
      const matchesSearch = !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [data.products, search, categoryFilter]);

  const stats = useMemo(() => ({
    total: filteredProducts.length,
    active: filteredProducts.filter(p => p.active !== false).length,
    outOfStock: filteredProducts.filter(p => p.stock === 0).length,
    flashDeals: filteredProducts.filter(p => p.flashDeal).length,
  }), [filteredProducts]);

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingProduct({
      id: '', name: '', nameEn: '', description: '', price: 0, originalPrice: 0,
      images: ['/images/product-1.jpg'], categoryId: data.categories[0]?.id || '',
      rating: 4.5, reviews: 0, sold: 0, stock: 10, featured: false, flashDeal: false,
      freeShipping: false, active: true, bestseller: false, isNew: true,
      hasCustomLabel: false, customLabelText: '',
      hasVariants: false, hasSizes: true, hasColors: true
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;
    if (editingProduct.id) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      addProduct(editingProduct);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`⚠️ هل أنت متأكد من حذف "${name}"؟`)) {
      deleteProduct(id);
    }
  };

  const handleToggleFlashDeal = (id: string) => {
     const p = data.products.find(x => x.id === id);
     if(p) updateProduct(id, { flashDeal: !p.flashDeal });
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header - التصميم الموحد الجديد بدقة مطلقة */}
      <div className="relative h-20 overflow-hidden rounded-[2rem] bg-[#0f172a] px-8 shadow-2xl flex items-center justify-between border border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Right Side: Icon & Title */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner shrink-0">
            <Package className="text-orange-500" size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-white">إدارة المخزون</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">تحكم كامل في منتجاتك وأسعارك وعروضك</p>
          </div>
        </div>

        {/* Left Side: Actions (Add, Toggle, Search) */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Add Button */}
          <button
            onClick={handleOpenAdd}
            className="h-10 px-6 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Plus size={18} /> <span>منتج جديد</span>
          </button>

          {/* View Mode Toggle - Pill Toggle */}
          <div className="flex bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0 h-10 items-center">
             <button
               onClick={() => setViewMode('grid')}
               className={`h-8 w-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                 viewMode === 'grid'
                   ? 'bg-white text-slate-900 shadow-xl'
                   : 'text-white/60 hover:text-white'
               }`}
             >
               <LayoutGrid size={18}/>
             </button>
             <button
               onClick={() => setViewMode('table')}
               className={`h-8 w-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                 viewMode === 'table'
                   ? 'bg-white text-slate-900 shadow-xl'
                   : 'text-white/60 hover:text-white'
               }`}
             >
               <List size={18}/>
             </button>
          </div>

          {/* Search Bar - Pill Style */}
          <div className="relative group hidden sm:block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في المنتجات..."
              className="h-10 pr-10 pl-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 outline-none transition-all w-56 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المنتجات" value={stats.total} icon={Package} color="bg-slate-100" textColor="text-slate-700" />
        <StatCard title="منتجات نشطة" value={stats.active} icon={CheckCircle2} color="bg-emerald-50" textColor="text-emerald-500" trend={12} />
        <StatCard title="نفد المخزون" value={stats.outOfStock} icon={AlertCircle} color="bg-orange-50" textColor="text-orange-500" trend={-5} />
        <StatCard title="عروض برق" value={stats.flashDeals} icon={Zap} color="bg-blue-50" textColor="text-blue-500" trend={8} />
      </div>

      {/* Category Filter Indicator (if active) */}
      {categoryFilter && (
        <div className="flex justify-end">
           <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-5 py-2 text-sm font-black text-blue-600 border border-blue-100">
             <Filter size={16} /> <span>القسم: {data.categories.find(c => c.id === categoryFilter)?.name}</span>
             <button onClick={() => { searchParams.delete('category'); setSearchParams(searchParams); }} className="hover:text-blue-800 transition-colors"><X size={16} /></button>
           </div>
        </div>
      )}

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-50">
           <Package size={80} className="mx-auto text-slate-100 mb-6" />
           <p className="text-2xl font-black text-slate-300">لا توجد منتجات مطابقة لعملية البحث</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p, i) => (
            <AdminProductCard
              key={p.id}
              product={p}
              currencySymbol={currencySymbol}
              categories={data.categories}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteProduct}
              onUpdate={updateProduct}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-6 font-black uppercase text-[10px]">المنتج</th>
                <th className="p-6 font-black uppercase text-[10px]">القسم</th>
                <th className="p-6 font-black uppercase text-[10px]">السعر</th>
                <th className="p-6 font-black uppercase text-[10px]">المخزون</th>
                <th className="p-6 font-black uppercase text-[10px]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((p, i) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  index={i}
                  currencySymbol={currencySymbol}
                  categories={data.categories}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteProduct}
                  onUpdate={updateProduct}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <ProductModal
            product={editingProduct}
            categories={data.categories}
            currencySymbol={currencySymbol}
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            setEditingProduct={setEditingProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductRow: React.FC<{
  product: Product;
  index: number;
  currencySymbol: string;
  categories: any[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onUpdate: (id: string, updates: Partial<Product>) => void;
}> = ({ product, index, currencySymbol, categories, onEdit, onDelete, onUpdate }) => {
  const cat = categories.find(c => c.id === product.categoryId);
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-6">
        <div className="flex items-center gap-4 justify-start">
          <img src={product.images[0]} className="h-12 w-12 rounded-xl object-cover border border-slate-100" alt="" />
          <div className="text-right">
            <div className="font-black text-slate-900">{product.name}</div>
            <div className="text-[10px] text-slate-400 font-bold">{product.id}</div>
          </div>
        </div>
      </td>
      <td className="p-6 text-right"><span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{cat?.name || 'عام'}</span></td>
      <td className="p-6 text-right"><span className="font-black text-blue-600">{product.price.toLocaleString()} {currencySymbol}</span></td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-3">
           <button onClick={() => onUpdate(product.id, { stock: Math.max(0, product.stock - 1) })} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black">−</button>
           <span className="font-black w-8 text-center">{product.stock}</span>
           <button onClick={() => onUpdate(product.id, { stock: product.stock + 1 })} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black">+</button>
        </div>
      </td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(product)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Edit size={18}/></button>
          <button onClick={() => onDelete(product.id, product.name)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
        </div>
      </td>
    </tr>
  );
};

export default AdminProductsPage;
