import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutGrid, ShoppingBag, Heart, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: 'cart' | 'wish';
}

const navItems: NavItem[] = [
  { to: '/profile', label: 'حسابي', icon: User },
  { to: '/wishlist', label: 'المفضلة', icon: Heart, badgeKey: 'wish' },
  { to: '/cart', label: 'السلة', icon: ShoppingBag, badgeKey: 'cart' },
  { to: '/categories', label: 'الأقسام', icon: LayoutGrid },
  { to: '/', label: 'الرئيسية', icon: Home }
];

export const BottomNav: React.FC = () => {
  const { cartCount, wishlistCount } = useShop();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(4); // Default to 'الرئيسية' (index 4 in LTR array)

  useEffect(() => {
    const path = location.pathname;
    const found = navItems.findIndex(item => 
      item.to === '/' ? path === '/' : path.startsWith(item.to)
    );
    if (found !== -1) {
      setActiveIndex(found);
    }
  }, [location.pathname]);

  // Hide bottom nav on specific fullscreen pages
  if (/^\/(checkout|admin|product\/.*\/review)/.test(location.pathname)) {
    return null;
  }

  const step = 100 / navItems.length;
  const centerPoint = activeIndex * step + step / 2;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] lg:hidden select-none" dir="ltr">
      <div className="relative mx-auto max-w-md overflow-visible">
        {/* Floating Active Label Pill above the Notch */}
        <div className="absolute bottom-[72px] left-0 right-0 h-0 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              className="absolute text-center"
              style={{ left: `${activeIndex * step}%`, width: `${step}%` }}
            >
              <span className="inline-block rounded-full bg-orange-600 px-2.5 py-0.5 text-[9px] font-black text-white shadow-lg border border-orange-400/50">
                {navItems[activeIndex].label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Curved Navigation Bar Container */}
        <nav className="relative w-full" style={{ height: 'calc(50px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Dynamic SVG Notch Path */}
          <div className="absolute inset-0 h-[50px] w-full">
            <svg
              viewBox="0 0 100 60"
              preserveAspectRatio="none"
              className="h-full w-full"
              style={{ filter: 'drop-shadow(0px -4px 8px rgba(0,0,0,0.15))' }}
            >
              <motion.path
                animate={{
                  d: `M 0,0
                      H ${centerPoint - 14}
                      C ${centerPoint - 9} 0, ${centerPoint - 8} 26, ${centerPoint} 26
                      C ${centerPoint + 8} 26, ${centerPoint + 9} 0, ${centerPoint + 14} 0
                      H 100
                      V 60
                      H 0
                      Z`
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                fill="white"
              />
            </svg>
          </div>

          {/* Solid Base Fill below safe area */}
          <div className="absolute top-[49px] bottom-0 left-0 right-0 bg-white" />

          {/* Floating Circle Button for Active Item */}
          <motion.div
            animate={{ left: `${activeIndex * step}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="absolute top-[-24px] z-30 flex items-center justify-center pointer-events-none"
            style={{ width: `${step}%` }}
          >
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_8px_20px_rgba(249,115,22,0.5)] flex items-center justify-center border-[4px] border-white relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-white"
                >
                  {React.createElement(navItems[activeIndex].icon, {
                    size: 20,
                    strokeWidth: 2.5
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Floating Button Badge Counter */}
              {(() => {
                const count =
                  navItems[activeIndex].badgeKey === 'cart'
                    ? cartCount
                    : navItems[activeIndex].badgeKey === 'wish'
                    ? wishlistCount
                    : 0;
                if (count > 0) {
                  return (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-black text-white ring-1 ring-white">
                      {count}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </motion.div>

          {/* Navigation Links Row */}
          <div className="relative z-20 flex h-[50px] items-stretch">
            {navItems.map((item, idx) => {
              const isActive = activeIndex === idx;
              const badgeNum =
                item.badgeKey === 'cart'
                  ? cartCount
                  : item.badgeKey === 'wish'
                  ? wishlistCount
                  : 0;
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative flex flex-1 flex-col items-center justify-center"
                >
                  <div className="relative">
                    <motion.div
                      animate={{
                        opacity: isActive ? 0 : 1,
                        scale: isActive ? 0 : 1,
                        y: isActive ? 25 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent size={21} className="text-gray-400/80" strokeWidth={2} />
                    </motion.div>

                    {badgeNum > 0 && !isActive && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-300 px-1 text-[8px] font-black text-gray-700 ring-1 ring-white">
                        {badgeNum}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
