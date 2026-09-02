import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Zap, 
  Check, 
  X,
  Package,
  Filter
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Product } from '../../types';
import { useSearchParams } from 'react-router-dom';

export const AdminProductsPage: React.FC = () => {
  const { data, addProduct, updateProduct, deleteProduct } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenAdd = () => {
    setEditingProduct({
      id: '',
      name: '',
      nameEn: '',
      description: '',
      price: 99,
      originalPrice: 199,
      images: ['/images/product-1.jpg'],
      categoryId: data.categories[0]?.id || 'cat-fashion',
      rating: 4.8,
      reviews: 1,
      sold: 0,
      stock: 20,
      featured: true,
      flashDeal: false,
      freeShipping: true,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;

    if (editingProduct.id) {
      updateProduct(editingProduct.id, editingProduct);
    } else {
      addProduct({
        ...editingProduct,
        images: editingProduct.images && editingProduct.images.length ? editingProduct.images : ['/images/product-1.jpg']
      });
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة المنتجات</h1>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            إضافة وتعديل الأسعار والمخزون وتفعيل عروض البرق
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>منتج جديد</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث في المنتجات بالاسم..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-xs font-bold outline-none focus:border-orange-500 shadow-sm"
          />
          <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {categoryFilter && (
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600 border border-orange-100">
            <Filter size={14} />
            <span>القسم: {data.categories.find(c => c.id === categoryFilter)?.name || categoryFilter}</span>
            <button
              onClick={() => {
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
              className="ms-1 hover:text-orange-800"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-start text-xs font-bold">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-400">
            <tr>
              <th className="p-3.5 text-start">المنتج</th>
              <th className="p-3.5 text-start">القسم</th>
              <th className="p-3.5 text-start">السعر الحالي</th>
              <th className="p-3.5 text-start">السعر الأصلي</th>
              <th className="p-3.5 text-start">المخزون</th>
              <th className="p-3.5 text-start">عرض برق</th>
              <th className="p-3.5 text-start">الحالة</th>
              <th className="p-3.5 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(prod => {
              const cat = data.categories.find(c => c.id === prod.categoryId);
              return (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} className="h-10 w-10 rounded-xl object-cover bg-slate-100" alt="" />
                      <div>
                        <div className="font-black text-slate-900 line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-slate-400">{prod.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">{cat?.name || 'عام'}</td>
                  <td className="p-3.5 font-black text-orange-600">
                    {prod.price} {currencySymbol}
                  </td>
                  <td className="p-3.5 text-slate-400 line-through">
                    {prod.originalPrice} {currencySymbol}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateProduct(prod.id, { stock: Math.max(0, prod.stock - 1) })}
                        className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-center"
                      >
                        -
                      </button>
                      <span className={`w-8 text-center font-black ${prod.stock <= 5 ? 'text-red-600' : 'text-slate-800'}`}>
                        {prod.stock}
                      </span>
                      <button
                        onClick={() => updateProduct(prod.id, { stock: prod.stock + 1 })}
                        className="h-6 w-6 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-center"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => updateProduct(prod.id, { flashDeal: !prod.flashDeal })}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black transition-all ${
                        prod.flashDeal
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Zap size={10} />
                      {prod.flashDeal ? 'نشط' : 'معطل'}
                    </button>
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => updateProduct(prod.id, { active: !prod.active })}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        prod.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {prod.active ? 'ظاهر' : 'مخفي'}
                    </button>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsModalOpen(true);
                        }}
                        className="text-slate-500 hover:text-orange-600 transition-colors"
                        title="تعديل"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${prod.name}؟`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">
                {editingProduct.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">اسم المنتج *</label>
                <input
                  required
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السعر الحالي ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السعر الأصلي ({currencySymbol})</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">القسم</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  >
                    {data.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">المخزون المتوفر</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">رابط الصورة (URL)</label>
                <input
                  value={editingProduct.images[0] || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">وصف المنتج</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.flashDeal}
                    onChange={e => setEditingProduct({ ...editingProduct, flashDeal: e.target.checked })}
                    className="rounded accent-orange-500"
                  />
                  <span>تفعيل كعرض برق ⚡</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={e => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded accent-orange-500"
                  />
                  <span>منتج مميز</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-2 text-xs font-black text-white shadow hover:bg-orange-600"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
