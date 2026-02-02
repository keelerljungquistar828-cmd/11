import React from 'react';
import { SummaryData } from '../types';

interface Props {
  data: SummaryData;
}

const SummaryView: React.FC<Props> = ({ data }) => {
  const format = (val: number) => new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2 }).format(val) + " " + data.currency;
  
  const groups = [
    {
      title: "第一层，数据汇总计算层 (L1)",
      fields: [
        { label: '报告编号', value: data.reportId, type: 'info' },
        { label: '法人', value: data.entity, type: 'info' },
        { label: '销售总额', value: format(data.sales), type: 'plus' },
        { label: '最终应付 (NET)', value: format(data.totalPayable), type: 'total' },
      ]
    },
    {
      title: "平台结算构成",
      fields: [
        { label: '忠诚度计划补偿', value: format(data.loyaltyCompensation), type: 'plus' },
        { label: '商品结算金额', value: format(data.payableSettlement), type: 'highlight' },
        { label: '平均扣率 (折算)', value: data.negotiatedDiscount + "%" },
        { label: '收单费 (Acq.)', value: "-" + format(data.acquiring), type: 'minus' },
      ]
    },
    {
      title: "损耗扣除项明细",
      fields: [
        { label: '物流配送', value: "-" + format(data.logistics), type: 'minus' },
        { label: '仓储存储', value: "-" + format(data.storage), type: 'minus' },
        { label: '入库验收', value: "-" + format(data.acceptance), type: 'minus' },
        { label: '罚金扣款', value: "-" + format(data.penalties), type: 'minus' },
        { label: '平台杂项', value: "-" + format(data.otherDeductions), type: 'minus' },
        { label: '佣金调整', value: format(data.commissionAdjustment) },
        { label: '周期偏差', value: format(data.oneTimeAdjustment) },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {groups.map((group, idx) => (
        <div key={idx} className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{group.title}</h3>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
            {group.fields.map((f, i) => (
              <div key={i} className="group">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">{f.label}</span>
                <span className={`text-lg font-bold block tracking-tight ${
                  f.type === 'plus' ? 'text-[#1d1d1f]' : 
                  f.type === 'minus' ? 'text-apple-red' : 
                  f.type === 'highlight' ? 'text-apple-blue text-xl' :
                  f.type === 'info' ? 'text-gray-700 font-medium' :
                  f.type === 'total' ? 'text-apple-blue text-2xl' : 'text-gray-900'
                }`}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryView;