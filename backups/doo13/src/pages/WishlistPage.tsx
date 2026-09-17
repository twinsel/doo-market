import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductGrid } from '../components/ProductGrid';

export const WishlistPage: React.FC = () => {
  const { wishlist, getProduct } = useShop();
  const wishlistedProducts = wishlist
    .map(id => getProduct(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p && p.active));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-400">
          <Heart size={36} />
        </div>
        <h1 className="text-xl font-black text-gray-900">قائمة المفضلة فارغة</h1>
        <p className="mt-2 text-sm text-gray-500 font-bold leading-relaxed">
          احفظ المنتجات التي تعجبك هنا لتصل إليها بسرعة لاحقاً
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="mb-6 text-2xl font-black text-gray-900">
        المفضلة ({wishlistedProducts.length})
      </h1>
      <ProductGrid products={wishlistedProducts} />
    </div>
  );
};
