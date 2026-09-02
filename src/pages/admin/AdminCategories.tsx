import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Edit, Trash2, X, ExternalLink, Upload, Info, Edit3, Tag, Layers, Save, Eye, EyeOff, LayoutGrid, List, Search } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Category } from '../../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// 📂  بطاقة التصنيف المطورة - نمط بطاقة المنتج
// ============================================================

const AdminCategoryCard: React.FC<{
  category: Category;
  productsCount: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
}> = ({ category, productsCount, onEdit, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const accentColor = category.color || '#3B82F6';
  const isActive = category.active !== false;

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
          {/* Category Image */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-100">
              <img
                src={category.image || '/images/placeholder.jpg'}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => (e.currentTarget.src = '/images/placeholder.jpg')}
              />
            </div>
            {/* Status indicator on image */}
            <span className={`absolute -bottom-1 -left-1 h-5 w-5 rounded-full border-4 border-white shadow-sm ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </div>

          {/* Category Info */}
          <div className="flex-1 text-right min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate(category.id, { active: !isActive })}
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={isActive ? 'إخفاء القسم' : 'إظهار القسم'}
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
              {category.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium truncate">
              {category.nameEn || 'بدون اسم إنجليزي'}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-end">
               <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                الترتيب: {category.order}
              </span>
              <span className="text-[9px] font-black text-slate-400">
                📦 {productsCount} منتج
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== BODY ====== */}
      <div className="p-5">
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/30">
          <div className="flex-1 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">لون التمييز</p>
            <div className="flex items-center gap-2 mt-1 justify-end">
              <span className="text-xs font-black text-slate-700">{category.color}</span>
              <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/products?category=${category.id}`)}
            className="flex flex-col items-center shrink-0 border-r border-slate-200 pr-4 hover:text-blue-600 transition-colors"
          >
            <p className="text-[10px] font-black text-slate-400">فتح القسم</p>
            <ExternalLink size={18} className="mt-1" />
          </button>
        </div>
      </div>

      {/* ====== FOOTER ====== */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="flex-1 h-10 rounded-2xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <Edit size={14} /> تعديل البيانات
        </button>
        <button
          type="button"
          onClick={() => onDelete(category.id, category.name)}
          className="h-10 w-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================
// 📝  نافذة تعديل القسم - المبوب المودرن (CategoryModal)
// ============================================================

const CategoryModal: React.FC<{
  category: Category;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
}> = ({ category, isOpen, isLoading, onClose, onSave }) => {
  const [localCategory, setLocalCategory] = useState<Category>(category);
  const [previewUrl, setPreviewUrl] = useState<string | null>(category.image || null);
  const [activeTab, setActiveTab] = useState<'basic' | 'style'>('basic');

  useEffect(() => {
    setLocalCategory(category);
    setPreviewUrl(category.image || null);
  }, [category]);

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
                <Layers size={28} />
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black">{localCategory.id ? 'تعديل القسم' : 'قسم جديد'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-1">تنسيق وتصنيف منتجات المتجر</p>
              </div>
            </div>
            <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"><X size={24} /></button>
          </div>

          <div className="relative flex gap-2 mt-8 bg-black/20 rounded-2xl p-1.5">
             <button onClick={() => setActiveTab('basic')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'basic' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>المعلومات الأساسية</button>
             <button onClick={() => setActiveTab('style')} className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === 'style' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white'}`}>التصميم والحالة</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8" dir="rtl">
          <form onSubmit={(e) => { e.preventDefault(); onSave(localCategory); }} className="space-y-6">
            {activeTab === 'basic' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">الاسم عربي *</label>
                    <input required value={localCategory.name} onChange={e => setLocalCategory({ ...localCategory, name: e.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2">الاسم إنجليزي</label>
                    <input value={localCategory.nameEn || ''} onChange={e => setLocalCategory({ ...localCategory, nameEn: e.target.value })} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white focus:border-blue-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2">صورة القسم</label>
                  <div className="flex gap-2">
                    <input value={localCategory.image || ''} onChange={e => { setLocalCategory({ ...localCategory, image: e.target.value }); setPreviewUrl(e.target.value); }} className="flex-1 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right outline-none focus:bg-white" placeholder="رابط الصورة..." />
                    <label className="shrink-0 h-14 px-6 rounded-2xl bg-blue-50 text-blue-600 border-2 border-blue-100 text-xs font-black flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-all">
                      <Upload size={18} /> رفع
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) {
                           const reader = new FileReader();
                           reader.onloadend = () => { const res = reader.result as string; setPreviewUrl(res); setLocalCategory({ ...localCategory, image: res }); };
                           reader.readAsDataURL(file);
                         }
                      }} />
                    </label>
                  </div>
                </div>

                {previewUrl && (
                  <div className="relative w-full h-40 rounded-[2rem] overflow-hidden border-4 border-slate-50 bg-slate-100">
                    <img src={previewUrl} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => { setPreviewUrl(null); setLocalCategory({ ...localCategory, image: '' }); }} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl shadow-lg"><X size={14}/></button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'style' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2 text-right block">لون القسم</label>
                    <div className="relative h-14 rounded-2xl overflow-hidden border-2 border-slate-100">
                      <input type="color" value={localCategory.color || '#3B82F6'} onChange={e => setLocalCategory({ ...localCategory, color: e.target.value })} className="absolute inset-0 w-full h-full scale-150 cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 mr-2 text-right block">ترتيب الظهور</label>
                    <input type="number" value={localCategory.order} onChange={e => setLocalCategory({ ...localCategory, order: Number(e.target.value) })} className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-right" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/50">
                   <div className="text-right">
                     <p className="text-sm font-black text-slate-900">حالة القسم</p>
                     <p className="text-[10px] text-slate-400 font-bold">يحدد ما إذا كان القسم سيظهر للعملاء أم لا</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={localCategory.active !== false} onChange={e => setLocalCategory({ ...localCategory, active: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-20px] shadow-inner"></div>
                   </label>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-4 border-t-2 border-slate-50">
               <button type="submit" disabled={isLoading} className="flex-[2] h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                 {isLoading ? 'جاري الحفظ...' : <><Save size={20} /> حفظ القسم</>}
               </button>
               <button type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-black hover:bg-slate-200 transition-all">إلغاء</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// 🏠  الصفحة الرئيسية للإدارة (AdminCategoriesPage)
// ============================================================

export const AdminCategoriesPage: React.FC = () => {
  const { data, addCategory, updateCategory, deleteCategory } = useShop();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    let filtered = [...data.categories];

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.nameEn?.toLowerCase().includes(s)
      );
    }

    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data.categories, search]);

  const getProductsCount = useCallback((categoryId: string) => {
    return (data.products || []).filter(p => p.categoryId === categoryId).length;
  }, [data.products]);

  const handleOpenAdd = () => {
    const maxOrder = Math.max(...categories.map(c => c.order || 0), 0);
    setEditingCategory({
      id: '', name: '', nameEn: '', icon: 'Package', image: '/images/product-1.jpg',
      color: '#3B82F6', order: maxOrder + 1, active: true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (category: Category) => {
    setIsLoading(true);
    if (category.id) {
      await updateCategory(category.id, category);
    } else {
      await addCategory(category);
    }
    setIsLoading(false);
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف قسم "${name}"؟`)) {
      deleteCategory(id);
    }
  };

  const handleUpdateActive = (id: string, updates: Partial<Category>) => {
    updateCategory(id, updates);
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header - التصميم الموحد الجديد بدقة مطلقة */}
      <div className="relative h-20 overflow-hidden rounded-[2rem] bg-[#0f172a] px-8 shadow-2xl flex items-center justify-between border border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Right Side: Icon & Title */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner shrink-0">
            <Layers className="text-orange-500" size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-white">أقسام المتجر</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">نظّم منتجاتك في مجموعات سهلة التصفح</p>
          </div>
        </div>

        {/* Left Side: Actions (Add, Toggle, Search) */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Add Button */}
          <button
            onClick={handleOpenAdd}
            className="h-10 px-6 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Plus size={18} /> <span>قسم جديد</span>
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
              placeholder="بحث في الأقسام..."
              className="h-10 pr-10 pl-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 outline-none transition-all w-56 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Categories Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map(cat => (
            <AdminCategoryCard
              key={cat.id}
              category={cat}
              productsCount={getProductsCount(cat.id)}
              onEdit={(c) => { setEditingCategory(c); setIsModalOpen(true); }}
              onDelete={handleDelete}
              onUpdate={handleUpdateActive}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-6 font-black uppercase text-[10px]">القسم</th>
                <th className="p-6 font-black uppercase text-[10px]">الترتيب</th>
                <th className="p-6 font-black uppercase text-[10px]">المنتجات</th>
                <th className="p-6 font-black uppercase text-[10px]">الحالة</th>
                <th className="p-6 font-black uppercase text-[10px]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map(cat => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  productsCount={getProductsCount(cat.id)}
                  onEdit={(c) => { setEditingCategory(c); setIsModalOpen(true); }}
                  onDelete={handleDelete}
                  onUpdate={handleUpdateActive}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingCategory && (
          <CategoryModal
            category={editingCategory}
            isOpen={isModalOpen}
            isLoading={isLoading}
            onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryRow: React.FC<{
  category: Category;
  productsCount: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
}> = ({ category, productsCount, onEdit, onDelete, onUpdate }) => {
  const isActive = category.active !== false;
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-6">
        <div className="flex items-center gap-4 justify-start">
          <img src={category.image || '/images/placeholder.jpg'} className="h-12 w-12 rounded-xl object-cover border border-slate-100" alt="" />
          <div className="text-right">
            <div className="font-black text-slate-900">{category.name}</div>
            <div className="text-[10px] text-slate-400 font-bold">{category.nameEn || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="p-6 text-right"><span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{category.order}</span></td>
      <td className="p-6 text-right"><span className="font-black text-blue-600">{productsCount} منتج</span></td>
      <td className="p-6 text-right">
        <button onClick={() => onUpdate(category.id, { active: !isActive })} className={`px-3 py-1 rounded-full text-[10px] font-black ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
          {isActive ? 'نشط' : 'مخفي'}
        </button>
      </td>
      <td className="p-6">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(category)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Edit size={18}/></button>
          <button onClick={() => onDelete(category.id, category.name)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
        </div>
      </td>
    </tr>
  );
};

export default AdminCategoriesPage;
