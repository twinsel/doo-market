import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/ProductGrid';

export const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, getProductsByCategory } = useShop();
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const category = data.categories.find(c => c.id === id);
  const products = useMemo(() => getProductsByCategory(id || ''), [id, getProductsByCategory]);

  const maxCategoryPrice = useMemo(() => {
    return products.length ? Math.max(...products.map(p => p.price), 10) : 1000;
  }, [products]);

  const [priceLimit, setPriceLimit] = useState<number | null>(null);
  const currentPriceLimit = priceLimit ?? maxCategoryPrice;
  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  const filteredAndSortedProducts = useMemo(() => {
    let list = products.filter(p => p.price <= currentPriceLimit);

    switch (sortBy) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        list = [...list].sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
    }
    return list;
  }, [products, currentPriceLimit, sortBy]);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-800">القسم غير موجود</h2>
        <Link to="/categories" className="mt-4 inline-block font-bold text-orange-600">
          تصفح كل الأقسام
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs font-bold text-gray-400">
        <Link to="/" className="hover:text-orange-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft size={12} />
        <Link to="/categories" className="hover:text-orange-600 transition-colors">
          الأقسام
        </Link>
        <ChevronLeft size={12} />
        <span className="text-gray-700">{category.name}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{category.name}</h1>
            <p className="mt-1 text-sm text-gray-500 font-bold">
              {filteredAndSortedProducts.length} من {products.length} منتج متاح
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(prev => !prev)}
            className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors"
          >
            <SlidersHorizontal size={16} />
            <span>تصفية وترتيب</span>
          </button>
        </div>

        {/* Filter Drawer */}
        {showFilters && (
          <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Sort By Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  الترتيب حسب:
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value="popular">الأكثر مبيعاً وشعبية</option>
                    <option value="price-asc">السعر: من الأقل للأعلى</option>
                    <option value="price-desc">السعر: من الأعلى للأقل</option>
                    <option value="rating">الأعلى تقييماً</option>
                  </select>
                  <ArrowUpDown size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-500">أقصى سعر:</label>
                  <span className="text-xs font-black text-orange-600">
                    {currentPriceLimit} {currencySymbol}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max={maxCategoryPrice}
                  step="5"
                  value={currentPriceLimit}
                  onChange={e => setPriceLimit(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={filteredAndSortedProducts}
        emptyText="لا توجد منتجات تطابق شروط التصفية الحالية"
      />
    </div>
  );
};
