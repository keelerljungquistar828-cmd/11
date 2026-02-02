
import React, { useState } from 'react';
import { AggregatedSrid, OrderStatus } from '../types';

interface Props { srids: AggregatedSrid[] }

const OrderTableView: React.FC<Props> = ({ srids }) => {
  const [filter, setFilter] = useState<OrderStatus | '全部'>('全部');

  const filtered = srids.filter(s => filter === '全部' || s.status === filter);
  const format = (val: number, cur: string) => {
    const formatted = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2 }).format(val);
    return formatted + " " + cur;
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.SALES: return 'bg-indigo-100 text-indigo-700';
      case OrderStatus.RETURNS: return 'bg-green-100 text-green-700';
      case OrderStatus.REJECTED: return 'bg-red-100 text-red-700';
      case OrderStatus.ADJUSTMENT: return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50 gap-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-widest">明细记录层 (第三层)</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {['全部', OrderStatus.SALES, OrderStatus.RETURNS, OrderStatus.REJECTED, OrderStatus.ADJUSTMENT].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${
                filter === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {type === '全部' ? '全部' : type}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-white border-b border-gray-200 text-[10px] text-gray-400 uppercase tracking-widest font-black z-10">
            <tr>
              <th className="px-4 py-4">记录编号(SRID)</th>
              <th className="px-4 py-4">商品信息</th>
              <th className="px-2 py-4">类型</th>
              <th className="px-4 py-4">销售额</th>
              <th className="px-4 py-4">佣金</th>
              <th className="px-4 py-4">收单费</th>
              <th className="px-4 py-4">尾程运费</th>
              <th className="px-4 py-4">杂费与补偿</th>
              <th className="px-4 py-4 text-right">到账金额</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-gray-100">
            {filtered.map((s, i) => {
              // 杂费 = (忠诚度补偿) - (仓储 + 罚款 + 验收 + 周期调整)
              // 注意：佣金已经在聚合时包含了 VAT
              const miscTotal = s.loyaltyBonus - (s.storage + s.penalty + s.acceptance + s.adjustment);
              
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-mono text-gray-400 text-[9px]">{s.srid}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[11px] leading-tight truncate max-w-[150px]" title={s.productName}>{s.productName}</span>
                      <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter">{s.sku}</span>
                    </div>
                  </td>
                  <td className="px-2 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${getStatusStyle(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-gray-700">
                    {format(s.realizedPrice, s.currency)}
                  </td>
                  <td className="px-4 py-4 text-red-400">
                    {s.totalCommission !== 0 ? `-${format(s.totalCommission, s.currency)}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-red-400">
                    {s.acquiring !== 0 ? `-${format(s.acquiring, s.currency)}` : '-'}
                  </td>
                  <td className="px-4 py-4 text-red-400">
                    {s.logistics !== 0 ? `-${format(s.logistics, s.currency)}` : '-'}
                  </td>
                  <td className={`px-4 py-4 font-medium ${miscTotal >= 0 ? 'text-blue-500' : 'text-red-400'}`}>
                    {miscTotal !== 0 ? (miscTotal > 0 ? '+' : '') + format(miscTotal, s.currency) : '-'}
                  </td>
                  <td className={`px-4 py-4 text-right font-black ${s.netProfit >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                    {format(s.netProfit, s.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
          没有匹配的明细记录
        </div>
      )}
    </div>
  );
};

export default OrderTableView;
