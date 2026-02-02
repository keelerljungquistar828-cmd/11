import React, { useState, useMemo } from 'react';
import { SkuMetric } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  metrics: SkuMetric[];
  currency: string;
}

const COLORS = [
  '#6366f1', // 销售利润 (Indigo)
  '#f43f5e', // 平台佣金 (Rose)
  '#f59e0b', // 收单费 (Amber)
  '#10b981', // 尾程运费 (Emerald)
  '#8b5cf6', // 退货平摊 (Violet)
  '#94a3b8', // 杂费 (Slate)
];

const SkuView: React.FC<Props> = ({ metrics, currency }) => {
  const [selectedSku, setSelectedSku] = useState<string | null>(metrics.length > 0 ? metrics[0].sku : null);

  const format = (val: number) => new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2 }).format(Math.abs(val)) + " " + currency;

  const selectedMetric = useMemo(() => 
    metrics.find(m => m.sku === selectedSku), 
    [metrics, selectedSku]
  );

  const pieData = useMemo(() => {
    if (!selectedMetric) return [];
    
    // 饼图展示单品平均售价的去向构成
    return [
      { name: '平均利润 (到账)', value: Math.max(0, selectedMetric.avgNetProfit), color: COLORS[0] },
      { name: '平台佣金', value: Math.abs(selectedMetric.avgCommission), color: COLORS[1] },
      { name: '收单费 (Acquiring)', value: Math.abs(selectedMetric.avgAcquiring), color: COLORS[2] },
      { name: '尾程运费', value: Math.abs(selectedMetric.avgSalesLogistics), color: COLORS[3] },
      { name: '退货/拒收平摊', value: Math.abs(selectedMetric.avgReturnLogistics), color: COLORS[4] },
      { name: '其他杂费平摊', value: Math.abs(selectedMetric.avgMisc), color: COLORS[5] },
    ].filter(d => d.value > 0.01);
  }, [selectedMetric]);

  return (
    <div className="flex flex-col lg:flex-row h-[700px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* 左侧 SKU 列表 */}
      <div className="w-full lg:w-1/3 border-r border-gray-100 flex flex-col h-full overflow-hidden bg-gray-50/20">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-black text-gray-700 text-xs uppercase tracking-[0.2em]">SKU 效益分析 ({metrics.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {metrics.map((m) => (
            <div 
              key={m.sku}
              onClick={() => setSelectedSku(m.sku)}
              className={`p-5 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-white ${
                selectedSku === m.sku ? 'bg-white border-l-4 border-l-indigo-600 shadow-inner' : 'hover:pl-6'
              }`}
            >
              <div className="flex flex-col space-y-2">
                {/* 商品名称 */}
                <span className="font-bold text-gray-900 text-sm leading-snug line-clamp-2" title={m.productName}>
                  {m.productName}
                </span>
                
                {/* 卖家编号 */}
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                    卖家货号
                  </span>
                  <span className="font-mono text-[10px] text-gray-500 font-medium">
                    {m.sku}
                  </span>
                </div>

                {/* 订单统计 */}
                <div className="pt-1 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">订单统计</span>
                    <span className="text-[11px] text-gray-700 font-bold">
                      共 {m.totalOrders} 笔 (销 {m.salesCount} | 退 {m.returnCount + m.rejectedCount})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.returnRate > 0.25 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      退拒率 {(m.returnRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧明细占比分析 */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedMetric ? (
          <div className="flex-1 overflow-y-auto p-10 space-y-10">
            {/* 头部信息 */}
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                {selectedMetric.productName}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-indigo-500 font-black uppercase tracking-widest">
                  卖家货号: {selectedMetric.sku}
                </span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs text-gray-500 font-bold">
                  分析周期内单品平均收益表现
                </span>
              </div>
            </div>

            {/* 核心指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: '平均实收售价', value: format(selectedMetric.avgRealized), color: 'text-gray-900', bg: 'bg-gray-50' },
                 { label: '平均物流成本', value: `-${format(selectedMetric.avgSalesLogistics + selectedMetric.avgReturnLogistics)}`, color: 'text-red-500', bg: 'bg-red-50/30' },
                 { label: '平均到账净利', value: format(selectedMetric.avgNetProfit), color: 'text-indigo-600 font-black', bg: 'bg-indigo-50/50' },
                 { label: '投资回报率(ROI)', value: ((selectedMetric.avgNetProfit / (selectedMetric.avgRealized || 1)) * 100).toFixed(1) + "%", color: 'text-green-600', bg: 'bg-green-50/30' },
               ].map((stat, i) => (
                 <div key={i} className={`${stat.bg} rounded-2xl p-4 border border-gray-100/50 transition-transform hover:scale-[1.02]`}>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                 </div>
               ))}
            </div>

            {/* 饼图分析区 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 flex flex-col md:flex-row items-center gap-10">
              <div className="w-full md:w-3/5 h-[400px] relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">单品均价</span>
                   <span className="text-xl font-black text-gray-900">{format(selectedMetric.avgRealized)}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={135}
                      paddingAngle={4}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => format(value)}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* 右侧图例列表 */}
              <div className="w-full md:w-2/5 space-y-4">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">单品平均费用构成详单</h4>
                 {pieData.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center space-x-3">
                         <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }}></div>
                         <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-black ${item.name.includes('利润') ? 'text-indigo-600' : 'text-gray-900'}`}>
                          {format(item.value)}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold">
                          {((item.value / (selectedMetric.avgRealized || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                   </div>
                 ))}
                 <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center">
                    <span className="text-xs font-black text-gray-900 uppercase">平均单件销售收益</span>
                    <span className="text-sm font-black text-indigo-600">{format(selectedMetric.avgRealized)}</span>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">📊</span>
             </div>
             <p className="text-sm font-black uppercase tracking-widest text-gray-400">请从左侧选择一个 SKU 进行深度效益分析</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkuView;