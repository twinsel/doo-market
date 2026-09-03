import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon, Tag, Edit3, Info, Layers, Eye, EyeOff, ExternalLink, MoveHorizontal, Palette, CheckCircle2, LayoutGrid, List, Search } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Banner } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// 📂  بطاقة البانر المطورة - نمط بطاقة المنتج
// ============================================================

const AdminBannerCard: React.FC<{
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string, title: string) => void;
  onToggleActive: (id: string) => void;
}> = ({ banner, onEdit, onDelete, onToggleActive }) => {
  const isActive = banner.active !== false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[2.5rem] shadow-sm ring-1 transition-all duration-300 overflow-hidden ${
        isActive
          ? 'ring-black/5 hover:ring-blue-200 hover:shadow-xl'
          : 'ring-black/5 bg-slate-50/50 opacity-70'
      }`}
    >
      {/* ====== HEADER ====== */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start gap-4">
          {/* Banner Image */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-100">
              <img
                src={banner.image || '/images/hero-1.jpg'}
                alt={banner.title}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => (e.currentTarget.src = '/images/hero-1.jpg')}
              />
            </div>
            {/* Status indicator on image */}
            <span className={`absolute -bottom-1 -left-1 h-5 w-5 rounded-full border-4 border-white shadow-sm ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </div>

          {/* Banner Info */}
          <div className="flex-1 text-right min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleActive(banner.id)}
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={isActive ? 'إخفاء البانر' : 'إظهار البانر'}
                >
                  {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {isActive ? 'نشط' : 'مخفي'}
                </span>
              </div>
            </div>

            <h3 className="font-black text-base text-slate-900 mt-1 line-clamp-1">
              {banner.title || 'بدون عنوان'}
            </h3>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">
              {banner.subtitle || 'لا يوجد وصف فرعي'}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-end">
               <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                الترتيب: {banner.order}
              </span>
              <span className="text-[9px] font-black text-slate-400 truncate max-w-[100px]">
                🔗 {banner.link}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== BODY ====== */}
      <div className="p-5">
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/30">
          <div className="flex-1 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">لون الخلفية</p>
            <div className="flex items-center gap-2 mt-1 justify-end">
              <span className="text-xs font-black text-slate-700">{banner.bgColor || '#3B82F6'}</span>
              <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: banner.bgColor || '#3B82F6' }} />
            </div>
          </div>
          <div className="shrink-0 border-r border-slate-200 pr-4 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">نص الزر</p>
            <p className="text-xs font-black text-blue-600 mt-1">{banner.buttonText}</p>
          </div>
        </div>
      </div>

      {/* ====== FOOTER ====== */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2" dir="rtl">
        <button
          type="button"
          onClick={() => onEdit(banner)}
          className="flex-1 h-10 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <Edit size={14} /> تعديل البيانات
        </button>
        <button
          type="button"
          onClick={() => onDelete(banner.id, banner.title)}
          className="h-10 w-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================
// 📝  نافذة تعديل البانر - المبوب المودرن (BannerModal)
// ============================================================

const BannerModal: React.FC<{
  banner: Banner;
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: Banner) => void;
}> = ({ banner, isOpen, onClose, onSave }) => {
  const [localBanner, setLocalBanner] = useState<Banner>(banner);
  const [currentTab, setCurrentTab] = useState<'basic' | 'style'>('basic');

  useEffect(() => {
    setLocalBanner(banner);
  }, [banner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 shrink-0 text-white" dir="rtl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl">
                <ImageIcon size={28} />
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black">{localBanner.id.includes('now') ? 'إضافة بانر' : 'تعديل البانر'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-1">تنسيق الواجهة الرئيسية للمتجر</p>
              </div>
            </div>
            <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"><X size={24} /></button>
          </div>

          <div className="relative flex gap-2 mt-8 bg-black/20 rounded-2xl p-1.5">
             <button onClick={() => setCurrentTab('basic')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${currentTab === 'basic' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>المحتوى والنصوص</button>
             <button onClick={() => setCurrentTab('style')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${currentTab === 'style' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>التصميم والروابط</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8" dir="rtl">
          <form onSubmit={(e) => { e.preventDefault(); onSave(localBanner); }} className="space-y-6">
            {currentTab === 'basic' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-500 mr-2 flex items-center justify-end gap-2">العنوان الرئيسي *</label>
                  <input required value={localBanner.title} onChange={e => setLocalBanner({ ...localBanner, title: e.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="مثال: عروض نهاية العام" />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-500 mr-2 flex items-center justify-end gap-2">العنوان الفرعي</label>
                  <textarea rows={3} value={localBanner.subtitle} onChange={e => setLocalBanner({ ...localBanner, subtitle: e.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white focus:border-blue-500 transition-all resize-none" placeholder="اكتب وصفاً جذاباً للبانر..." />
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-xs font-black text-slate-500 mr-2">صورة البانر</label>
                  <div className="flex gap-2">
                    <input value={localBanner.image} onChange={e => setLocalBanner({ ...localBanner, image: e.target.value })} className="flex-1 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white" placeholder="رابط الصورة..." />
                    <label className="shrink-0 h-14 px-6 rounded-2xl bg-blue-50 text-blue-600 border-2 border-blue-100 text-xs font-black flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-all">
                      <Upload size={18} /> رفع
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) {
                           const reader = new FileReader();
                           reader.onloadend = () => { setLocalBanner({ ...localBanner, image: reader.result as string }); };
                           reader.readAsDataURL(file);
                         }
                      }} />
                    </label>
                  </div>
                </div>

                {localBanner.image && (
                  <div className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden border-4 border-slate-50 bg-slate-100">
                    <img src={localBanner.image} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
              </motion.div>
            )}

            {currentTab === 'style' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2 text-right">
                      <label className="text-xs font-black text-slate-500 mr-2">نص الزر</label>
                      <input value={localBanner.buttonText} onChange={e => setLocalBanner({ ...localBanner, buttonText: e.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="تسوق الآن" />
                   </div>
                   <div className="space-y-2 text-right">
                      <label className="text-xs font-black text-slate-500 mr-2">الرابط الموجه</label>
                      <input value={localBanner.link} onChange={e => setLocalBanner({ ...localBanner, link: e.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="/deals" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-slate-500 mr-2">لون الخلفية</label>
                    <div className="relative h-14 rounded-2xl overflow-hidden border-2 border-slate-100 flex items-center gap-3 px-4 bg-slate-50">
                      <input type="color" value={localBanner.bgColor || '#3B82F6'} onChange={e => setLocalBanner({ ...localBanner, bgColor: e.target.value })} className="h-8 w-8 rounded-full cursor-pointer border-2 border-white shadow-sm" />
                      <span className="text-xs font-black text-slate-500">{localBanner.bgColor || '#3B82F6'}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-slate-500 mr-2">ترتيب الظهور</label>
                    <input type="number" value={localBanner.order} onChange={e => setLocalBanner({ ...localBanner, order: Number(e.target.value) })} className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/50">
                   <div className="text-right">
                     <p className="text-sm font-black text-slate-900">حالة العرض</p>
                     <p className="text-[10px] text-slate-400 font-bold">تحديد ما إذا كان البانر سيظهر في الصفحة الرئيسية</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={localBanner.active !== false} onChange={e => setLocalBanner({ ...localBanner, active: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-20px] shadow-inner"></div>
                   </label>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4 border-t-2 border-slate-50">
               <button type="submit" className="flex-[2] h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                 <Save size={20} /> حفظ التغييرات
               </button>
               <button type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const BannerStatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  textColor: string;
}> = ({ title, value, icon: Icon, color, textColor }) => (
  <div className="h-20 bg-white px-5 rounded-[1.75rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
    <div className="text-right flex flex-col justify-center h-full">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-black text-slate-900 mt-0.5">{value.toLocaleString()}</p>
    </div>
    <div className={`h-10 w-10 rounded-xl ${color} ${textColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shrink-0`}>
      <Icon size={18} />
    </div>
  </div>
);

// ============================================================
// 🏠  الصفحة الرئيسية للإدارة (AdminBannersPage)
// ============================================================

export const AdminBannersPage: React.FC = () => {
  const { data, updateSettings } = useShop();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');

  const banners = useMemo(() => {
    let filtered = [...data.banners];

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(s) ||
        b.subtitle?.toLowerCase().includes(s)
      );
    }

    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data.banners, search]);

  const handleOpenAdd = () => {
    setEditingBanner({
      id: 'banner-' + Date.now(),
      title: '',
      subtitle: '',
      image: '/images/hero-1.jpg',
      link: '/deals',
      buttonText: 'تسوق الآن',
      order: banners.length + 1,
      active: true,
      bgColor: '#3B82F6'
    });
    setIsModalOpen(true);
  };

  const handleSave = (banner: Banner) => {
    const exists = banners.some(b => b.id === banner.id);
    const updated = exists
      ? banners.map(b => (b.id === banner.id ? banner : b))
      : [banner, ...banners];

    data.banners = updated;
    updateSettings({});
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`⚠️ هل أنت متأكد من حذف البانر "${title || 'هذا البانر'}"؟`)) {
      data.banners = banners.filter(b => b.id !== id);
      updateSettings({});
    }
  };

  const handleToggleActive = (id: string) => {
     const banner = banners.find(b => b.id === id);
     if(banner) {
        handleSave({ ...banner, active: !banner.active });
     }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header - التصميم الموحد الجديد بدقة مطلقة */}
      <div className="relative h-20 overflow-hidden rounded-[2rem] bg-[#0f172a] px-8 shadow-2xl flex items-center justify-between border border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Right Side: Icon & Title */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner shrink-0">
            <ImageIcon className="text-orange-500" size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-white">شرائح العرض (البانرات)</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">إدارة الإعلانات الكبرى في أعلى الصفحة الرئيسية</p>
          </div>
        </div>

        {/* Left Side: Actions (Add, Toggle, Search) */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Add Button */}
          <button
            onClick={handleOpenAdd}
            className="h-10 px-6 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Plus size={18} /> <span>بانر جديد</span>
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
              placeholder="بحث في البانرات..."
              className="h-10 pr-10 pl-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 outline-none transition-all w-56 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <BannerStatCard title="إجمالي البانرات" value={banners.length} icon={Layers} color="bg-blue-50" textColor="text-blue-500" />
        <BannerStatCard title="البانرات النشطة" value={banners.filter(b => b.active).length} icon={CheckCircle2} color="bg-emerald-50" textColor="text-emerald-500" />
        <BannerStatCard title="مخفية حالياً" value={banners.filter(b => !b.active).length} icon={EyeOff} color="bg-orange-50" textColor="text-orange-500" />
      </div>

      {/* Banners Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {banners.length === 0 ? (
            <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-50">
               <ImageIcon size={80} className="mx-auto text-slate-100 mb-6" />
               <p className="text-2xl font-black text-slate-300">لا توجد إعلانات معروضة حالياً</p>
            </div>
          ) : (
            banners.map(banner => (
              <AdminBannerCard
                key={banner.id}
                banner={banner}
                onEdit={(b) => { setEditingBanner(b); setIsModalOpen(true); }}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-6 font-black uppercase text-[10px]">البانر</th>
                <th className="p-6 font-black uppercase text-[10px]">الترتيب</th>
                <th className="p-6 font-black uppercase text-[10px]">الرابط والزر</th>
                <th className="p-6 font-black uppercase text-[10px]">الحالة</th>
                <th className="p-6 font-black uppercase text-[10px]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {banners.map(banner => (
                <BannerRow
                  key={banner.id}
                  banner={banner}
                  onEdit={(b) => { setEditingBanner(b); setIsModalOpen(true); }}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingBanner && (
          <BannerModal
            banner={editingBanner}
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setEditingBanner(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BannerRow: React.FC<{
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string, title: string) => void;
  onToggleActive: (id: string) => void;
}> = ({ banner, onEdit, onDelete, onToggleActive }) => {
  const isActive = banner.active !== false;
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-6">
        <div className="flex items-center gap-4 justify-start">
          <img src={banner.image || '/images/hero-1.jpg'} className="h-12 w-24 rounded-xl object-cover border border-slate-100 shadow-sm" alt="" />
          <div className="text-right">
            <div className="font-black text-slate-900">{banner.title || 'بدون عنوان'}</div>
            <div className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">{banner.subtitle || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="p-6 text-right"><span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{banner.order}</span></td>
      <td className="p-6 text-right">
        <div className="space-y-1">
          <div className="text-[10px] font-black text-blue-600">{banner.buttonText}</div>
          <div className="text-[9px] text-slate-400 truncate max-w-[150px]">{banner.link}</div>
        </div>
      </td>
      <td className="p-6 text-right">
        <button onClick={() => onToggleActive(banner.id)} className={`px-3 py-1 rounded-full text-[10px] font-black ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
          {isActive ? 'نشط' : 'مخفي'}
        </button>
      </td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(banner)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Edit size={18}/></button>
          <button onClick={() => onDelete(banner.id, banner.title)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
        </div>
      </td>
    </tr>
  );
};

export default AdminBannersPage;
