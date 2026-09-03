import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AddReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, addReview } = useShop();

  const product = getProduct(id || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-gray-500 font-bold">المنتج غير موجود</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview(product.id, rating, comment.trim(), name.trim() || 'عميل موثوق');
    setIsSubmitted(true);
    setTimeout(() => {
      navigate(-1);
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
          >
            <ArrowRight size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">إضافة تقييم منتج</h1>
            <p className="text-xs text-gray-500 font-bold line-clamp-1">{product.name}</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-lg font-black text-gray-900">شكراً لتقييمك!</h2>
            <p className="text-xs text-gray-500 font-bold">تم نشر تقييمك بنجاح وسيفيد العملاء الآخرين.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star selector */}
            <div className="text-center py-2">
              <label className="block text-xs font-bold text-gray-500 mb-2">اختر تقييمك:</label>
              <div className="flex justify-center gap-1.5" dir="ltr">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-125"
                  >
                    <Star
                      size={28}
                      className={
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">اسمك (اختياري)</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="سارة أو مجهول"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">رأيك وتجربتك بالمنتج *</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="اكتب تفاصيل تجربتك مع المنتج، الخامة، سرعة التوصيل..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 hover:opacity-95 active:scale-95 transition-all"
            >
              إرسال التقييم
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
