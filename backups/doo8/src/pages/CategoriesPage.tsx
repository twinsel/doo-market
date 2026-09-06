import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export const CategoriesPage: React.FC = () => {
  const { data, getProductsByCategory } = useShop();
  const categories = data.categories
    .filter(c => c.active)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">كل الأقسام</h1>
        <p className="text-sm text-gray-500 font-bold mt-1">تصفّح المنتجات حسب اهتمامك</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map(cat => {
          const count = getProductsByCategory(cat.id).length;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-lg hover:ring-orange-200"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
                  style={{
                    background: `linear-gradient(to top, ${cat.color || '#FF6A00'}, transparent 70%)`
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3 text-right">
                  <div className="text-lg font-black text-white drop-shadow-md">{cat.name}</div>
                  <div className="text-xs font-bold text-white/90 drop-shadow">{count} منتج</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
