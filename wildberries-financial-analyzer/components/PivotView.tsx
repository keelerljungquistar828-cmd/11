import React from 'react';
import { PivotData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
  data: PivotData;
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b'];

const PivotView: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: '销售订单', value: data.salesCount },
    { name: '不签收订单', value: data.returnCount },
    { name: '拒收订单', value: data.rejectedCount },
    { name: '财务调整', value: data.adjustmentCount },
  ].filter(d => d.value > 0);

  const locationData = Object.entries(data.deliveryLocations)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: '总记录数', value: data.totalOrderCount, icon: '📊', color: 'bg-gray-50' },
          { label: '销售订单', value: data.salesCount, icon: '✅', color: 'bg-indigo-50' },
          { label: '不签收订单', value: data.returnCount, icon: '🔙', color: 'bg-green-50' },
          { label: '拒收订单', value: data.rejectedCount, icon: '❌', color: 'bg-red-50' },
          { label: '财务调整', value: data.adjustmentCount, icon: '⚖️', color: 'bg-purple-50' },
          { label: '平均时长', value: `${data.avgDuration.toFixed(1)} 天`, icon: '⏱️', color: 'bg-yellow-50' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3 ${stat.color}`}>
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">{stat.label}</p>
              <p className="text-lg font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h3 className="font-bold text-gray-700 mb-6 text-sm uppercase tracking-widest">记录构成分布 (第二层)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie data={chartData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="name">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h3 className="font-bold text-gray-700 mb-6 text-sm uppercase tracking-widest">签收地点分布排行</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={locationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fontWeight: 'bold'}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" name="订单数" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PivotView;