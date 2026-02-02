import React, { useState, useMemo, useRef, useCallback } from 'react';
import { EMPTY_SUMMARY, processFinancialData, calculatePivot, calculateSkuLayer, mergeReports } from './services/wbLogic';
import { parseWBExcel } from './services/excelParser';
import SummaryView from './components/SummaryView';
import PivotView from './components/PivotView';
import OrderTableView from './components/OrderTableView';
import SkuView from './components/SkuView';
import ProfitCompass from './components/ProfitCompass';
import { SummaryData, RawRow, AggregatedSrid } from './types';

const App: React.FC = () => {
  const [mainTab, setMainTab] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [customSummaries, setCustomSummaries] = useState<SummaryData[]>([]);
  const [customRows, setCustomRows] = useState<RawRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSummary = useMemo(() => {
    if (customSummaries.length > 0) {
      return customSummaries.length > 1 ? mergeReports(customSummaries) : customSummaries[0];
    }
    return EMPTY_SUMMARY;
  }, [customSummaries]);

  const aggregatedData: AggregatedSrid[] = useMemo(() => {
    return processFinancialData(customRows);
  }, [customRows]);

  const pivot = useMemo(() => calculatePivot(aggregatedData), [aggregatedData]);
  const skuMetrics = useMemo(() => calculateSkuLayer(aggregatedData), [aggregatedData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    const newSummaries: SummaryData[] = [];
    const newRows: RawRow[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const { summary, rows } = await parseWBExcel(files[i]);
        newSummaries.push(summary);
        newRows.push(...rows);
      }
      setCustomSummaries(prev => [...prev, ...newSummaries]);
      setCustomRows(prev => [...prev, ...newRows]);
    } catch (err) {
      console.error("解析错误:", err);
      alert("导入失败: " + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = useCallback(() => {
    if (customRows.length === 0) return;
    setCustomSummaries([]);
    setCustomRows([]);
    setActiveTab(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [customRows.length]);

  const analysisSubTabs = [
    { label: '数据概览', component: <SummaryView data={currentSummary} /> },
    { label: '多维透视', component: <PivotView data={pivot} /> },
    { label: '明细追踪', component: <OrderTableView srids={aggregatedData} /> },
    { label: 'SKU 效益', component: <SkuView metrics={skuMetrics} currency={currentSummary.currency} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-10">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#1d1d1f] w-7 h-7 rounded-sm flex items-center justify-center text-white font-bold text-sm">W</div>
            <h1 className="text-[15px] font-bold text-[#1d1d1f] tracking-tight">账务分析中枢</h1>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-sm">
            <button 
              onClick={() => setMainTab(0)} 
              className={`px-4 py-1.5 rounded-sm text-[13px] font-semibold transition-all ${mainTab === 0 ? 'bg-white text-apple-blue shadow-sm' : 'text-gray-500 hover:text-[#1d1d1f]'}`}
            >
              对账分析
            </button>
            <button 
              onClick={() => setMainTab(1)} 
              className={`px-4 py-1.5 rounded-sm text-[13px] font-semibold transition-all ${mainTab === 1 ? 'bg-white text-apple-blue shadow-sm' : 'text-gray-500 hover:text-[#1d1d1f]'}`}
            >
              利润定价
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {mainTab === 0 && (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="apple-button-primary text-white text-[12px] font-semibold px-5 py-2 rounded-sm transition-all shadow-sm active:scale-95"
              >
                 {isImporting ? '处理中...' : '导入明细报表'}
              </button>
              <button 
                onClick={handleReset}
                disabled={customRows.length === 0}
                className={`text-[12px] font-semibold px-4 py-2 rounded-sm transition-all border ${customRows.length > 0 ? 'bg-white border-gray-200 text-[#1d1d1f] hover:bg-gray-50' : 'bg-transparent text-gray-300 border-gray-100 cursor-not-allowed'}`}
              >
                 重置
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept=".xlsx, .xls, .csv" className="hidden" />
            </>
          )}
        </div>
      </nav>

      {mainTab === 0 ? (
        <div className="flex-1 flex flex-col items-center">
          <header className="w-full px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-3">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">报表统计周期</span>
                <h2 className="text-4xl font-bold text-[#1d1d1f] tracking-tight">{currentSummary.period}</h2>
                <div className="flex items-center space-x-3 pt-1">
                   <div className={`w-2 h-2 rounded-full ${customRows.length > 0 ? 'bg-apple-green' : 'bg-gray-300'}`}></div>
                   <span className="text-[13px] font-semibold text-gray-400">
                     {customRows.length > 0 ? '数据已同步' : '待上传'}
                   </span>
                </div>
              </div>
              
              <div className={`p-6 rounded-sm flex flex-col items-end min-w-[300px] transition-all duration-300 ${
                customRows.length > 0 ? 'bg-white border border-gray-200 shadow-sm' : 'bg-transparent border border-dashed border-gray-200 text-gray-300'
              }`}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">周期结算净额</p>
                <p className={`text-4xl font-bold tracking-tighter ${customRows.length > 0 ? 'text-apple-blue' : 'text-gray-200'}`}>
                  {new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2 }).format(currentSummary.totalPayable)} <span className="text-xl font-medium ml-1">{currentSummary.currency}</span>
                </p>
              </div>
            </div>
          </header>

          <main className="w-full px-8 pb-20">
            {customRows.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-sm border border-gray-200 text-center p-12">
                 <div className="apple-button-primary w-16 h-16 text-white rounded-md flex items-center justify-center mb-8 text-3xl shadow-sm">􀇼</div>
                 <h3 className="text-2xl font-bold text-[#1d1d1f] mb-4 tracking-tight">上传报表以开始分析</h3>
                 <p className="text-gray-400 text-[14px] font-medium leading-relaxed">支持 Wildberries 官方结算明细。我们将通过 Srid 聚合模型为您呈现四层深度的财务画像。</p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-sm w-fit border border-gray-200">
                  {analysisSubTabs.map((tab, idx) => (
                    <button key={idx} onClick={() => setActiveTab(idx)} className={`px-5 py-2 rounded-sm text-[13px] font-bold transition-all ${activeTab === idx ? 'bg-white text-apple-blue shadow-sm' : 'text-gray-500 hover:text-[#1d1d1f]'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {analysisSubTabs[activeTab].component}
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        <main className="flex-1 w-full px-8 py-10">
          <ProfitCompass />
        </main>
      )}
      
      <footer className="py-10 px-12 border-t border-gray-200 flex justify-between items-center text-[12px] font-medium text-gray-400">
         <span>Wildberries 财务智能终端 v2.8.0</span>
         <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-green"></span>
              <span>数据处理引擎运行中</span>
            </span>
            <span className="opacity-50">© 2025 跨境财务逻辑实验室</span>
         </div>
      </footer>
    </div>
  );
};

export default App;