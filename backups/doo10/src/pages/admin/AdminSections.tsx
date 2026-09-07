import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Layout,
  Eye,
  EyeOff,
  GripVertical,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Tag,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit,
  Upload,
  Image as ImageIcon,
  X,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Section } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ============================================================
// 🏷️  تسميات الأنواع مع أيقونات وألوان
// ============================================================
const typeConfig: Record<string, any> = {
  flash: {
    label: 'عروض برق',
    icon: <Zap />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200'
  },
  featured: {
    label: 'مميزة',
    icon: <Star />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200'
  },
  category: {
    label: 'أقسام',
    icon: <Layers />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  new: {
    label: 'وصل حديثاً',
    icon: <Sparkles />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200'
  },
  bestsellers: {
    label: 'الأكثر مبيعاً',
    icon: <TrendingUp />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  promo: {
    label: 'شريط ترويجي',
    icon: <Tag />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200'
  }
};

// ============================================================
// 🍞  مكون الإشعارات المدمج
// ============================================================
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl text-white font-black text-sm shadow-xl ${colors[type]} animate-in slide-in-from-top-4 duration-300`}>
      {message}
    </div>
  );
};

// ============================================================
// 📝  نافذة تعديل القسم والبانر
// ============================================================
const SectionModal: React.FC<{
  section: Section;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (section: Section) => void;
}> = ({ section, isOpen, isLoading, onClose, onSave }) => {
  const [localSection, setLocalCategory] = useState<Section>(section);
  const [previewUrl, setPreviewUrl] = useState<string | null>(section.bannerImage || null);

  React.useEffect(() => {
    setLocalCategory(section);
    setPreviewUrl(section.bannerImage || null);
  }, [section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSection);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLocalCategory({ ...localSection, bannerImage: result });
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setLocalCategory({ ...localSection, bannerImage: '' });
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 z-50 cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                تعديل القسم والبانر
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                تخصيص نصوص القسم وإضافة بانر ترويجي
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Section Main Info */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
               <Layout size={14} /> معلومات القسم الأساسية
            </h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 mr-1">عنوان القسم</label>
              <input
                type="text"
                required
                value={localSection.title}
                onChange={e => setLocalCategory({ ...localSection, title: e.target.value })}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 mr-1">وصف القسم (فرعي)</label>
              <input
                type="text"
                value={localSection.subtitle || ''}
                onChange={e => setLocalCategory({ ...localSection, subtitle: e.target.value })}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {/* Banner Settings */}
          <div className="space-y-4 p-4 rounded-2xl border-2 border-orange-100/50 bg-orange-50/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} /> إعدادات البانر الترويجي
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSection.showBanner}
                  onChange={e => setLocalCategory({ ...localSection, showBanner: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:duration-300 peer-checked:after:translate-x-[-16px] shadow-inner"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 mr-1">عنوان البانر</label>
                <input
                  type="text"
                  value={localSection.bannerTitle || ''}
                  onChange={e => setLocalCategory({ ...localSection, bannerTitle: e.target.value })}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-400"
                  placeholder="مثال: خصم خاص لعملاء القسم"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 mr-1">نص البانر الفرعي</label>
                <input
                  type="text"
                  value={localSection.bannerSubtitle || ''}
                  onChange={e => setLocalCategory({ ...localSection, bannerSubtitle: e.target.value })}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-400"
                  placeholder="مثال: صالح حتى نهاية الأسبوع"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 mr-1">نص الزر</label>
                  <input
                    type="text"
                    value={localSection.bannerButtonText || ''}
                    onChange={e => setLocalCategory({ ...localSection, bannerButtonText: e.target.value })}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-400"
                    placeholder="مثال: تسوق الآن"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 mr-1">رابط الزر</label>
                  <input
                    type="text"
                    value={localSection.bannerLink || ''}
                    onChange={e => setLocalCategory({ ...localSection, bannerLink: e.target.value })}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-400"
                    placeholder="مثال: /deals"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 mr-1">صورة البانر</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localSection.bannerImage || ''}
                    onChange={e => setLocalCategory({ ...localSection, bannerImage: e.target.value })}
                    className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-orange-400"
                    placeholder="رابط الصورة..."
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <button type="button" className="h-full px-4 rounded-2xl bg-orange-50 text-orange-600 border-2 border-orange-100 hover:bg-orange-100 transition-colors">
                      <Upload size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {previewUrl && (
                <div className="relative w-full h-24 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 mt-2">
                  <img src={previewUrl} className="w-full h-full object-cover" alt="معاينة" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 rounded-xl bg-red-500 text-white shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-black text-slate-500 hover:bg-slate-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// 📦  بطاقة القسم المطورة - نمط بطاقة المنتجات والأقسام
// ============================================================
const AdminSectionCard: React.FC<{
  section: Section;
  index: number;
  total: number;
  onMove: (id: string, direction: number) => void;
  onToggle: (id: string) => void;
  onEdit: (section: Section) => void;
}> = ({ section, index, total, onMove, onToggle, onEdit }) => {
  const config = typeConfig[section.type] || {
    label: section.type,
    icon: <Layout />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200'
  };

  const isActive = section.active !== false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[2.5rem] shadow-sm ring-1 transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isActive
          ? 'ring-black/5 hover:ring-orange-200 hover:shadow-xl'
          : 'ring-black/5 bg-slate-50/50 opacity-70'
      }`}
    >
      {/* ====== HEADER ====== */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start gap-4">
          {/* Type Icon Box */}
          <div className="relative shrink-0">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border-2 ${config.bgColor}`}>
               {React.cloneElement(config.icon as React.ReactElement, { size: 24 } as any)}
            </div>
            <span className={`absolute -bottom-1 -left-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </div>

          {/* Info */}
          <div className="flex-1 text-right min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>
              <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                #{index + 1}
              </span>
            </div>

            <h3 className="font-black text-base text-slate-900 mt-1 line-clamp-1">
              {section.title}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold line-clamp-1 mt-0.5">
              {section.subtitle || 'لا يوجد وصف فرعي'}
            </p>
          </div>
        </div>
      </div>

      {/* ====== BODY ====== */}
      <div className="p-5 flex-1 space-y-4">
        {section.bannerImage ? (
           <div className="relative h-20 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
              <img src={section.bannerImage} className="w-full h-full object-cover opacity-80" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-2">
                 <span className="text-[8px] font-black text-white bg-orange-500 px-1.5 py-0.5 rounded-md">بانر مدمج</span>
              </div>
           </div>
        ) : (
          <div className="h-20 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center text-slate-300 gap-1">
             <ImageIcon size={20} className="opacity-20" />
             <span className="text-[9px] font-black opacity-40">لا يوجد بانر لهذا القسم</span>
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
           <span className="text-[10px] font-black text-slate-400">ترتيب القسم</span>
           <div className="flex items-center gap-1">
              <button
                disabled={index === 0}
                onClick={() => onMove(section.id, -1)}
                className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-orange-500 disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                disabled={index === total - 1}
                onClick={() => onMove(section.id, 1)}
                className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-orange-500 disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
           </div>
        </div>
      </div>

      {/* ====== FOOTER ====== */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2">
        <button
          onClick={() => onEdit(section)}
          className="flex-1 h-9 rounded-xl bg-blue-600 text-white font-black text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
        >
          <Edit size={14} /> تعديل وإدارة
        </button>
        <button
          onClick={() => onToggle(section.id)}
          className={`h-9 px-3 rounded-xl font-black text-[10px] transition-all border flex items-center gap-2 ${
            isActive
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
            : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
          }`}
        >
          {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {isActive ? 'نشط' : 'مخفي'}
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================
// 🏠  الصفحة الرئيسية
// ============================================================
const SectionRow: React.FC<{
  section: Section;
  index: number;
  total: number;
  onMove: (id: string, direction: number) => void;
  onToggle: (id: string) => void;
  onEdit: (section: Section) => void;
}> = ({ section, index, total, onMove, onToggle, onEdit }) => {
  const config = typeConfig[section.type] || {
    label: section.type,
    icon: <Layout />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200'
  };
  const isActive = section.active !== false;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="p-6">
        <div className="text-right">
          <div className="font-black text-slate-900">{section.title}</div>
          <div className="text-[10px] text-slate-400 font-bold">{section.subtitle || 'N/A'}</div>
        </div>
      </td>
      <td className="p-6 text-right">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${config.bgColor} ${config.color}`}>
          {config.label}
        </span>
      </td>
      <td className="p-6 text-right">
         <div className="flex items-center gap-2 justify-end">
           <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">#{index + 1}</span>
           <div className="flex flex-col gap-0.5">
             <button disabled={index === 0} onClick={() => onMove(section.id, -1)} className="text-slate-300 hover:text-orange-500 disabled:opacity-0"><ChevronUp size={12}/></button>
             <button disabled={index === total - 1} onClick={() => onMove(section.id, 1)} className="text-slate-300 hover:text-orange-500 disabled:opacity-0"><ChevronDown size={12}/></button>
           </div>
         </div>
      </td>
      <td className="p-6 text-right">
        <button onClick={() => onToggle(section.id)} className={`px-3 py-1 rounded-full text-[10px] font-black ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
          {isActive ? 'نشط' : 'مخفي'}
        </button>
      </td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(section)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Edit size={18}/></button>
        </div>
      </td>
    </tr>
  );
};

export const AdminSectionsPage: React.FC = () => {
  const { data, updateSettings, updateSection } = useShop();
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const sections = useMemo(() => {
    let list = [...(data.sections || [])];
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(sec =>
        sec.title.toLowerCase().includes(s) ||
        sec.subtitle?.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data.sections, search]);

  const moveSection = (id: string, direction: number) => {
    const idx = sections.findIndex(s => s.id === id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const list = [...sections];
    const oldOrder = list[idx].order;
    list[idx] = { ...list[idx], order: list[targetIdx].order };
    list[targetIdx] = { ...list[targetIdx], order: oldOrder };

    data.sections = list;
    updateSettings({});
  };

  const toggleSectionActive = (id: string) => {
    updateSection(id, { active: !sections.find(s => s.id === id)?.active });
  };

  const handleSaveSection = async (section: Section) => {
    setIsLoading(true);
    try {
      updateSection(section.id, section);
      setToast({ message: 'تم تحديث القسم بنجاح', type: 'success' });
      setEditingSection(null);
    } catch (e) {
      setToast({ message: 'حدث خطأ أثناء الحفظ', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const visibleCount = sections.filter(s => s.active !== false).length;
  const hiddenCount = sections.filter(s => s.active === false).length;

  return (
    <div className="space-y-6" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header - التصميم الموحد الجديد بدقة مطلقة */}
      <div className="relative h-20 overflow-hidden rounded-[2rem] bg-[#0f172a] px-8 shadow-2xl flex items-center justify-between border border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Right Side: Icon & Title */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner shrink-0">
            <Layout className="text-orange-500" size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-white">أقسام الصفحة الرئيسية</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">فعّل/أخفِ ورتّب الأقسام — التغييرات تظهر فوراً</p>
          </div>
        </div>

        {/* Left Side: Actions (Stats, Toggle, Search) */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Stats Badges */}
          <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-emerald-500/20 shrink-0">
            <Eye size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400">{visibleCount} ظاهر</span>
          </div>

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
              placeholder="بحث سريع..."
              className="h-10 pr-10 pl-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 outline-none transition-all w-56 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 flex items-center justify-between">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">إجمالي الأقسام</p>
            <p className="text-2xl font-black text-slate-900">{sections.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Layout size={22} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 flex items-center justify-between">
          <div className="text-right">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">ظاهرة</p>
            <p className="text-2xl font-black text-slate-900">{visibleCount}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Eye size={22} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 flex items-center justify-between">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">مخفية</p>
            <p className="text-2xl font-black text-slate-900">{hiddenCount}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <EyeOff size={22} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 flex items-center justify-between">
          <div className="text-right">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider">الترتيب الحالي</p>
            <p className="text-2xl font-black text-slate-900">#{sections.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
            <ArrowUpDown size={22} />
          </div>
        </div>
      </div>

      {/* Sections List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sections.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
              <Layout size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-lg font-black text-slate-400">لا توجد أقسام</p>
              <p className="text-sm text-slate-300 font-medium">أضف أقساماً جديدة من إعدادات المتجر</p>
            </div>
          ) : (
            sections.map((sec, idx) => (
              <AdminSectionCard
                key={sec.id}
                section={sec}
                index={idx}
                total={sections.length}
                onMove={moveSection}
                onToggle={toggleSectionActive}
                onEdit={setEditingSection}
              />
            ))
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-right text-sm font-bold">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-6 font-black uppercase text-[10px]">القسم</th>
                <th className="p-6 font-black uppercase text-[10px]">النوع</th>
                <th className="p-6 font-black uppercase text-[10px]">الترتيب</th>
                <th className="p-6 font-black uppercase text-[10px]">الحالة</th>
                <th className="p-6 font-black uppercase text-[10px]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sections.map((sec, idx) => (
                <SectionRow
                  key={sec.id}
                  section={sec}
                  index={idx}
                  total={sections.length}
                  onMove={moveSection}
                  onToggle={toggleSectionActive}
                  onEdit={setEditingSection}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Helpful Tip */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 border border-slate-200/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
            <Sparkles size={20} />
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-800">💡 نصائح سريعة</p>
            <ul className="text-xs text-slate-500 font-medium space-y-1 mt-1">
              <li>• استخدم زر التعديل الأزرق <Edit size={12} className="inline" /> لإضافة بانر ترويجي للقسم</li>
              <li>• يمكنك تغيير عنوان القسم ووصفه ليظهر بشكل مخصص لعملائك</li>
              <li>• التغييرات تنعكس فوراً على المتجر دون الحاجة لتحديث الصفحة</li>
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingSection && (
          <SectionModal
            section={editingSection}
            isOpen={!!editingSection}
            isLoading={isLoading}
            onClose={() => setEditingSection(null)}
            onSave={handleSaveSection}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSectionsPage;
