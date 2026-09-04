import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/ProductGrid';
import { Countdown } from '../components/Countdown';

export const DealsPage: React.FC = () => {
  const { getFlashProducts } = useShop();
  const flashProducts = getFlashProducts();
  const endsAt = flashProducts.find(p => p.flashEndsAt)?.flashEndsAt || new Date(Date.now() + 8 * 3600 * 1000).toISOString();

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      {/* Deals Header Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-l from-orange-600 via-orange-500 to-red-500 p-5 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black sm:text-3xl flex items-center gap-2">
              <span>⚡ عروض البرق</span>
            </h1>
            <p className="mt-1 text-sm text-white/90 font-bold">
              خصومات هائلة لوقت محدود — أسرع قبل نفاد الكمية
            </p>
          </div>
          <Countdown endsAt={endsAt} />
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={flashProducts}
        emptyText="لا توجد عروض برق نشطة حالياً"
      />
    </div>
  );
};
