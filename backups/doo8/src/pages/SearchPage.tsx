import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/ProductGrid';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { searchProducts } = useShop();

  const results = React.useMemo(() => searchProducts(query), [query, searchProducts]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="mb-2 text-2xl font-black text-gray-900">نتائج البحث</h1>
      <p className="mb-6 text-sm text-gray-500 font-bold">
        {query ? (
          <>
            عن «<span className="font-bold text-orange-600">{query}</span>» — {results.length} نتيجة
          </>
        ) : (
          'أدخل كلمة للبحث'
        )}
      </p>

      <ProductGrid
        products={results}
        emptyText="لم نجد أي منتجات مطابقة لكلمة البحث"
      />
    </div>
  );
};
