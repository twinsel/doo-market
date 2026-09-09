import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Countdown } from '../components/Countdown';
import { Section, Product } from '../types';

// Hero Banner Carousel
const HeroBannerCarousel: React.FC = React.memo(() => {
  const { data } = useShop();
  const banners = data.banners.filter(b => b.active).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;
  const currentBanner = banners[currentIndex % banners.length];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-lg sm:rounded-3xl">
      <div className="relative aspect-[21/9] min-h-[180px] sm:min-h-[240px] md:aspect-[3/1]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBanner.id}
            src={currentBanner.image}
            alt={currentBanner.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(270deg, ${currentBanner.bgColor}f2 0%, ${currentBanner.bgColor}aa 30%, transparent 65%)`
          }}
        />

        {/* Banner Content */}
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="max-w-xs px-6 sm:px-10 text-right">
            <motion.h2
              key={currentBanner.title}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl drop-shadow-sm"
            >
              {currentBanner.title}
            </motion.h2>
            <p className="mt-1 text-xs text-white/90 sm:text-sm leading-relaxed font-bold drop-shadow-sm">
              {currentBanner.subtitle}
            </p>
            <Link
              to={currentBanner.link}
              className="mt-4 inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-sm font-black text-orange-600 shadow-xl transition hover:scale-105 active:scale-95"
            >
              {currentBanner.buttonText}
            </Link>
          </div>
        </div>

        {/* Nav Controls */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}
              className="absolute start-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white transition-all active:scale-90"
              aria-label="السابق"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}
              className="absolute end-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white transition-all active:scale-90"
              aria-label="التالي"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 start-1/2 flex -translate-x-1/2 gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex % banners.length ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`شريحة ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
});

// Category Avatars Horizontal Scroll Row
const CategoryAvatars: React.FC = React.memo(() => {
  const { data } = useShop();
  if (!data?.categories || !Array.isArray(data.categories)) return null;

  const categories = data.categories
    .filter(c => c && c.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const gradientBorders = [
    'from-blue-400 to-cyan-400',
    'from-orange-400 to-red-400',
    'from-purple-400 to-pink-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-indigo-400 to-blue-500'
  ];

  return (
    <div className="flex items-start gap-5 overflow-x-auto pb-6 pt-2 no-scrollbar px-1 scroll-smooth">
      {categories.map((cat, idx) => {
        const count = (data.products || []).filter(p => p && p.categoryId === cat.id && p.active).length;
        const borderGradient = gradientBorders[idx % gradientBorders.length];

        return (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="group flex shrink-0 flex-col items-center gap-2.5"
          >
            <div className="relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`h-[72px] w-[72px] rounded-full bg-gradient-to-tr ${borderGradient} p-[2.5px] shadow-sm transition-shadow group-hover:shadow-md`}
              >
                <div className="h-full w-full overflow-hidden rounded-full bg-white p-[2px]">
                  <div className="h-full w-full overflow-hidden rounded-full bg-amber-50 relative">
                    <div className="absolute inset-0 bg-amber-400 opacity-20" />
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-115 relative z-10"
                      loading="lazy"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Product Count Badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="absolute -bottom-1 -right-1 flex h-5 w-auto min-w-[30px] items-center justify-center rounded-[8px] bg-orange-50 border-2 border-orange-100 px-2 text-[10px] font-black text-orange-600 shadow-sm z-20 whitespace-nowrap"
              >
                {count}
              </motion.div>
            </div>

            <span className="text-center text-[12px] font-black text-gray-800 transition-colors group-hover:text-orange-600 line-clamp-1 w-[72px]">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
});

// Section Renderer
const SectionView: React.FC<{ section: Section; products: Product[] }> = React.memo(({ section, products }) => {
  const { data } = useShop();
  if (!section.active || (section.type === 'flash' && products.length === 0)) return null;

  if (section.type === 'promo') {
    return (
      <section
        id={section.id}
        className="scroll-mt-32 rounded-2xl px-4 py-5 text-center text-sm font-bold text-gray-800 shadow-sm sm:text-base border border-orange-100"
        style={{ backgroundColor: section.promoColor || '#FFF7ED' }}
      >
        {section.promoText || section.title}
      </section>
    );
  }

  if (section.type === 'category') {
    return (
      <section id={section.id} className="mb-2 scroll-mt-32">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-[19px] font-black text-gray-900 tracking-tight">تصنيفات</h2>
          <Link
            to="/categories"
            className="text-[13px] font-bold text-orange-600 hover:bg-orange-50 px-3 py-1 rounded-full transition-colors"
          >
            عرض الكل
          </Link>
        </div>
        <CategoryAvatars />
      </section>
    );
  }

  const isFlash = section.type === 'flash';
  const endsAt = products.find(p => p.flashEndsAt)?.flashEndsAt || new Date(Date.now() + 8 * 3600 * 1000).toISOString();

  return (
    <section id={section.id} className="space-y-4 scroll-mt-32">
      {/* Section Header Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 ${
          isFlash
            ? 'bg-gradient-to-l from-orange-600 via-orange-500 to-red-500 text-white shadow-lg'
            : 'bg-white shadow-sm border border-gray-100'
        }`}
      >
        <div className="flex-1">
          <h2
            className={`text-xl font-black flex items-center gap-2 ${
              isFlash ? 'text-white' : 'text-gray-900'
            }`}
          >
            {section.title}
            {isFlash && <span className="text-xl">⚡</span>}
          </h2>
          <p className={`text-xs mt-0.5 font-bold ${isFlash ? 'text-white/90' : 'text-gray-500'}`}>
            {section.subtitle}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isFlash && <Countdown endsAt={endsAt} />}
          <Link
            to={isFlash ? '/deals' : '/categories'}
            className={`inline-flex items-center gap-1 text-[13px] font-black ${
              isFlash
                ? 'rounded-full bg-white/30 px-4 py-1.5 text-white hover:bg-white/40 shadow-sm backdrop-blur-sm'
                : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            <span>عرض الكل</span>
            <ChevronLeft size={16} />
          </Link>
        </div>
      </div>

      {/* Section Specific Promotional Banner */}
      {section.showBanner && section.bannerImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-xl aspect-[21/9] md:aspect-[4/1]"
        >
          <img
            src={section.bannerImage}
            alt={section.bannerTitle}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-transparent p-6 sm:p-10 flex flex-col justify-center items-end text-right">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">{section.bannerTitle}</h3>
            <p className="text-xs sm:text-sm text-white/80 font-bold mb-4 max-w-xs">{section.bannerSubtitle}</p>
            {section.bannerButtonText && (
              <Link
                to={section.bannerLink || '#'}
                className="inline-flex items-center rounded-2xl bg-white px-6 py-2.5 text-sm font-black text-slate-900 shadow-xl transition hover:scale-105 active:scale-95"
              >
                {section.bannerButtonText}
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Product Cards Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-gray-400">
          لا توجد منتجات في هذا القسم
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 10).map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}

      {section.type === 'featured' && (
        <div className="mt-4 text-center text-xs text-gray-400 font-bold">
          {data.settings.siteName} · أسعار تنافسية كل يوم
        </div>
      )}
    </section>
  );
});

export const HomePage: React.FC = () => {
  const {
    data,
    getFlashProducts,
    getFeaturedProducts,
    getNewProducts,
    getBestsellers,
    getProductsByCategory,
    syncStatus
  } = useShop();
  const location = useLocation();

  const sections = data?.sections ? [...data.sections].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  const categorySection = sections.find(s => s.type === 'category');

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, [location.hash]);

  const resolvedSections = useMemo(() => {
    return sections.map(sec => {
      let prods: Product[] = [];
      switch (sec.type) {
        case 'flash':
          prods = getFlashProducts();
          break;
        case 'featured':
          prods = getFeaturedProducts();
          break;
        case 'new':
          prods = getNewProducts();
          break;
        case 'bestsellers':
          prods = getBestsellers();
          break;
        case 'category':
          prods = sec.categoryId ? getProductsByCategory(sec.categoryId) : [];
          break;
      }
      return { section: sec, products: prods };
    });
  }, [sections, getFlashProducts, getFeaturedProducts, getNewProducts, getBestsellers, getProductsByCategory]);

  if (syncStatus === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent shadow-sm" />
        <p className="text-[13px] font-bold text-gray-400">جاري تحميل واجهة المتجر...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-3 py-4 sm:px-4 sm:py-6">
      {/* 1. Hero Banner Carousel */}
      <HeroBannerCarousel />

      {/* 2. Categories Circular Avatars */}
      {categorySection && (
        <SectionView
          section={{ ...categorySection, title: 'تصنيفات' }}
          products={[]}
        />
      )}

      {/* 3. Dynamic Sections (Flash deals, featured, new, bestsellers, promo) */}
      {resolvedSections
        .filter(item => item.section.type !== 'category')
        .map(({ section, products }) => (
          <SectionView key={section.id} section={section} products={products} />
        ))}

      {sections.length === 0 && (
        <div className="py-20 text-center text-gray-400">
          <p className="font-bold">لا يوجد محتوى متاح حالياً</p>
        </div>
      )}
    </div>
  );
};
