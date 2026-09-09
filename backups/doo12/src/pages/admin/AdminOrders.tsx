// ============================================================
// Doo Market
// src/pages/admin/AdminOrdersPage.tsx
// ============================================================
// صفحة إدارة الطلبات - مع تحسينات التتبع

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Trash2,
  Printer,
  Download,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Eye,
  Filter,
  Package,
  LayoutGrid,
  List,
  AlertTriangle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'تم استلام الطلب';
    case 'processing': return 'قيد التجهيز والتغليف';
    case 'shipped': return 'تم الشحن مع مندوب التوصيل';
    case 'delivering': return 'في مرحلة التسليم';
    case 'delivered': return 'تم التوصيل بنجاح';
    case 'cancelled': return 'ملغي';
    default: return 'تم استلام الطلب';
  }
};

const OrderCard: React.FC<{
  order: Order;
  currencySymbol: string;
  onView: () => void;
  onStatusUpdate: (id: string, status: Order['status']) => void;
  onDelete: () => void;
}> = ({ order, currencySymbol, onView, onStatusUpdate, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 space-y-4 hover:shadow-xl transition-all group text-right relative"
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-orange-600">#{order.id}</span>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            order.status === 'delivering' ? 'bg-purple-50 text-purple-600 border-purple-100' :
            order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
            order.status === 'processing' ? 'bg-amber-50 text-amber-600 border-amber-100' :
            order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
            'bg-orange-50 text-orange-600 border-orange-100'
          }`}>
            {getStatusLabel(order.status)}
          </span>
          <button
            type="button"
            onClick={onDelete}
            className="h-8 w-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-100 shrink-0"
            title="حذف الطلب نهائياً"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="text-right">
        <h3 className="font-black text-slate-900">{order.customer.name}</h3>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{order.customer.city} · {order.customer.phone}</p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/50">
        <p className="text-[10px] text-slate-400 font-black mb-1.5 uppercase">المنتجات</p>
        <p className="text-xs font-bold text-slate-700 line-clamp-1">
          {order.items.map(it => `${it.quantity}x ${it.name}`).join(' ، ')}
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 block">تحديث حالة الشحنة:</label>
        <select
          value={order.status}
          onChange={e => onStatusUpdate(order.id, e.target.value as any)}
          className={`w-full rounded-2xl px-3 py-2 text-xs font-black outline-none border transition-all cursor-pointer ${
            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            order.status === 'delivering' ? 'bg-purple-50 text-purple-800 border-purple-200' :
            order.status === 'shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
            order.status === 'processing' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            order.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
            'bg-orange-50 text-orange-800 border-orange-200'
          }`}
        >
          <option value="pending">1. تم استلام الطلب</option>
          <option value="processing">2. قيد التجهيز والتغليف</option>
          <option value="shipped">3. تم الشحن مع مندوب التوصيل</option>
          <option value="delivering">4. في مرحلة التسليم</option>
          <option value="delivered">5. تم التوصيل بنجاح</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="text-right">
           <p className="text-[9px] font-black text-slate-400 uppercase">الإجمالي</p>
           <p className="text-base font-black text-slate-900">{order.total.toLocaleString()} {currencySymbol}</p>
        </div>
        <button onClick={onView} className="h-9 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black hover:bg-slate-800 transition-all flex items-center gap-2">
          <Eye size={14} /> عرض التفاصيل
        </button>
      </div>
    </motion.div>
  );
};

export const AdminOrdersPage: React.FC = () => {
  const { data, updateOrderStatus, deleteOrder } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('id') || '';

  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [refreshKey, setRefreshKey] = useState(0);

  React.useEffect(() => {
    const id = searchParams.get('id');
    if (id) setSearch(id);
  }, [searchParams]);

  const orders = data.orders || [];
  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        !search.trim() ||
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.phone.includes(search);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleStatusUpdate = useCallback((orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    setRefreshKey(prev => prev + 1);
  }, [updateOrderStatus, selectedOrder]);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['رقم الطلب,اسم العميل,الهاتف,المدينة,العنوان,المبلغ,الحالة,التاريخ']
        .concat(
          orders.map(
            o =>
              `${o.id},"${o.customer.name}",${o.customer.phone},"${o.customer.city}","${o.customer.address}",${o.total},${o.status},${o.createdAt}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'orders-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDeleteOrder = () => {
    if (!orderToDelete) return;
    deleteOrder(orderToDelete.id);
    if (selectedOrder?.id === orderToDelete.id) {
      setSelectedOrder(null);
    }
    setOrderToDelete(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8" dir="rtl" key={refreshKey}>
      <div className="relative h-20 overflow-hidden rounded-[2rem] bg-[#0f172a] px-8 shadow-2xl flex items-center justify-between border border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner shrink-0">
            <Package className="text-orange-500" size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-white">إدارة الطلبات والشحنات</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">تحديث القائمة المنسدلة لحالات الطلب وإدارة/حذف الطلبات</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="h-10 px-6 rounded-2xl bg-blue-600 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Download size={18} /> <span>تصدير CSV</span>
          </button>

          <div className="flex bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0 h-10 items-center">
             <button
               onClick={() => setViewMode('grid')}
               className={`h-8 w-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                 viewMode === 'grid'
                   ? 'bg-white text-slate-900 shadow-xl'
                   : 'text-white/60 hover:text-white'
               }`}
             >
               <LayoutGrid size={18}/>
             </button>
             <button
               onClick={() => setViewMode('table')}
               className={`h-8 w-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                 viewMode === 'table'
                   ? 'bg-white text-slate-900 shadow-xl'
                   : 'text-white/60 hover:text-white'
               }`}
             >
               <List size={18}/>
             </button>
          </div>

          <div className="relative group hidden sm:block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث عن طلب..."
              className="h-10 pr-10 pl-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 outline-none transition-all w-56 font-bold"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 px-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: '1. تم استلام الطلب' },
            { id: 'processing', label: '2. قيد التجهيز والتغليف' },
            { id: 'shipped', label: '3. تم الشحن مع مندوب التوصيل' },
            { id: 'delivering', label: '4. في مرحلة التسليم' },
            { id: 'delivered', label: '5. تم التوصيل بنجاح' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`rounded-full px-4 py-2 text-[10px] font-black transition-all border ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-50">
           <Package size={80} className="mx-auto text-slate-100 mb-6" />
           <p className="text-2xl font-black text-slate-300">لا توجد طلبات مطابقة</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <OrderCard
              key={`${order.id}-${order.status}-${refreshKey}`}
              order={order}
              currencySymbol={currencySymbol}
              onView={() => setSelectedOrder(order)}
              onStatusUpdate={handleStatusUpdate}
              onDelete={() => setOrderToDelete(order)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-start text-xs font-bold">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-400">
              <tr>
                <th className="p-3.5 text-start">رقم الطلب</th>
                <th className="p-3.5 text-start">العميل</th>
                <th className="p-3.5 text-start">المنتجات</th>
                <th className="p-3.5 text-start">الإجمالي</th>
                <th className="p-3.5 text-start">طريقة الدفع</th>
                <th className="p-3.5 text-start">القائمة المنسدلة لحالة الشحنة</th>
                <th className="p-3.5 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={`${order.id}-${order.status}-${refreshKey}`} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-black text-orange-600">#{order.id}</td>
                  <td className="p-3.5">
                    <div className="text-slate-900">{order.customer.name}</div>
                    <div className="text-[10px] text-slate-400">{order.customer.city} · {order.customer.phone}</div>
                  </td>
                  <td className="p-3.5 max-w-[200px]">
                    <span className="line-clamp-1 text-slate-700">
                      {order.items.map(it => `${it.quantity}x ${it.name}`).join(' ، ')}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-slate-900">
                    {order.total} {currencySymbol}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {order.paymentMethod === 'cod'
                      ? 'عند الاستلام'
                      : order.paymentMethod === 'card'
                      ? 'بطاقة مدى/ائتمان'
                      : 'محفظة رقمية'}
                  </td>
                  <td className="p-3.5">
                    <select
                      value={order.status}
                      onChange={e => handleStatusUpdate(order.id, e.target.value as any)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black outline-none border transition-all cursor-pointer ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        order.status === 'delivering' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        order.status === 'processing' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                        'bg-orange-50 text-orange-800 border-orange-200'
                      }`}
                    >
                      <option value="pending">1. تم استلام الطلب</option>
                      <option value="processing">2. قيد التجهيز والتغليف</option>
                      <option value="shipped">3. تم الشحن مع مندوب التوصيل</option>
                      <option value="delivering">4. في مرحلة التسليم</option>
                      <option value="delivered">5. تم التوصيل بنجاح</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 text-xs font-black text-slate-700 hover:text-orange-600"
                      >
                        <Eye size={14} />
                        <span>تفاصيل</span>
                      </button>
                      <button
                        onClick={() => setOrderToDelete(order)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        title="حذف الطلب نهائياً"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">تفاصيل الطلب #{selectedOrder.id}</h2>
                <span className="text-xs text-slate-400 font-bold">
                  {new Date(selectedOrder.createdAt).toLocaleString('ar-SA')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 space-y-1.5 text-xs font-bold">
              <span className="text-slate-400 block mb-1">معلومات العميل</span>
              <div className="text-slate-900 font-black">{selectedOrder.customer.name}</div>
              <div className="text-slate-600">{selectedOrder.customer.city} · {selectedOrder.customer.address}</div>
              <div className="text-slate-600" dir="ltr">{selectedOrder.customer.phone}</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-900 block">تحديث القائمة المنسدلة لحالة الطلب:</label>
              <select
                value={selectedOrder.status}
                onChange={e => {
                  const newStatus = e.target.value as any;
                  handleStatusUpdate(selectedOrder.id, newStatus);
                }}
                className={`w-full rounded-2xl p-3 text-xs font-black outline-none border transition-all cursor-pointer ${
                  selectedOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  selectedOrder.status === 'delivering' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                  selectedOrder.status === 'shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                  selectedOrder.status === 'processing' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  selectedOrder.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                  'bg-orange-50 text-orange-800 border-orange-200'
                }`}
              >
                <option value="pending">1. تم استلام الطلب</option>
                <option value="processing">2. قيد التجهيز والتغليف</option>
                <option value="shipped">3. تم الشحن مع مندوب التوصيل</option>
                <option value="delivering">4. في مرحلة التسليم</option>
                <option value="delivered">5. تم التوصيل بنجاح</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">المنتجات المطلوبة</span>
              {selectedOrder.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <img src={it.image} className="h-10 w-10 rounded-lg object-cover" alt="" />
                    <div>
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-400">الكمية: {it.quantity}</div>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">
                    {it.price * it.quantity} {currencySymbol}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs font-bold">
              <div className="flex justify-between text-slate-500">
                <span>المجموع الفرعي:</span>
                <span>{selectedOrder.subtotal} {currencySymbol}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>رسوم التوصيل:</span>
                <span>{selectedOrder.shipping === 0 ? 'مجاني' : `${selectedOrder.shipping} ${currencySymbol}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-100 pt-2">
                <span>الإجمالي:</span>
                <span className="text-orange-600">{selectedOrder.total} {currencySymbol}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(selectedOrder)}
                className="flex items-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2 text-xs font-bold transition-all border border-red-100"
              >
                <Trash2 size={14} />
                <span>حذف الطلب</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Printer size={14} />
                  <span>طباعة الفاتورة</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl text-center space-y-5 border border-slate-100"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 shadow-inner">
                <AlertTriangle size={38} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">حذف الطلب نهائياً</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  هل أنت متأكد من حذف الطلب <span className="text-red-600 font-black">#{orderToDelete.id}</span> الخاص بالعميل <span className="text-slate-900 font-black">{orderToDelete.customer.name}</span>؟
                </p>
                <p className="text-[11px] font-bold text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100 mt-2">
                  ⚠️ سيتم حذف الطلب كلياً من السجلات ولن يتمكن العميل من تتبعه بعد الآن.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmDeleteOrder}
                  className="flex-1 rounded-2xl bg-red-600 hover:bg-red-500 py-3.5 text-sm font-black text-white shadow-xl shadow-red-600/30 transition-all active:scale-95"
                >
                  نعم، احذف الطلب
                </button>
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 rounded-2xl bg-slate-100 hover:bg-slate-200 py-3.5 text-sm font-black text-slate-700 transition-all active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrdersPage;