import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { Sparkles, LogOut } from 'lucide-react';

export const WelcomeModal: React.FC = () => {
  const { isLoggingOut, logoutMsg, data } = useShop();
  const [showWelcome, setShowWelcome] = useState(false);
  const s = data.settings;

  useEffect(() => {
    if (s.showWelcomeScreen !== false && !isLoggingOut) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), (s.welcomeDuration || 3) * 1000);
      return () => clearTimeout(timer);
    }
  }, [s.showWelcomeScreen, s.welcomeDuration, isLoggingOut]);

  return (
    <AnimatePresence>
      {/* Logout Overlay */}
      {isLoggingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500 shadow-2xl shadow-orange-500/20"
          >
            <LogOut size={40} className="text-white" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black mb-4 leading-tight"
          >
            {logoutMsg.split('...')[0]}...
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-lg max-w-xs leading-relaxed"
          >
            {logoutMsg.split('...')[1] || ''}
          </motion.p>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="h-2 w-2 rounded-full bg-orange-500"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Welcome Overlay */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowWelcome(false)}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white p-6 text-center cursor-pointer select-none"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-500/30 text-white text-4xl font-black"
          >
            {s.brandMark || 'دُو'}
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-black text-slate-900 mb-2">{s.siteName}</h1>
            <p className="text-orange-600 font-bold mb-6 flex items-center justify-center gap-2 text-lg">
              <Sparkles size={20} />
              {s.siteTagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-xs p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-500"
          >
            "{s.welcomeMessage || 'أهلاً بك في دُو ماركت - استمتع بتجربة تسوق فريدة'}"
          </motion.div>

          <div className="absolute bottom-12 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Loading Premium Experience
            </span>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
