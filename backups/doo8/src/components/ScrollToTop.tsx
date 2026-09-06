import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // إذا كان المستخدم يتنقل للأمام (ضغط على منتج مثلاً)
    // نقوم بصعود الصفحة للأعلى فوراً
    if (navType !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // 'instant' لضمان عدم حدوث وميض أو تأخير بصرى
      });
    }
    // في حالة 'POP' (زر الرجوع)، المتصفح سيتولى تلقائياً العودة للمكان السابق
  }, [pathname, navType]);

  return null;
};
