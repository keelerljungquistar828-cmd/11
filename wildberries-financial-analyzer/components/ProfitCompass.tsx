import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';

// --- Components: BlurInput ---
const BlurInput = ({ value, onChange, className, type = "number", ...props }: any) => {
    const [localValue, setLocalValue] = useState(value);
    useEffect(() => { setLocalValue(value); }, [value]);
    const handleBlur = () => {
        if (type === 'number') {
            const num = parseFloat(localValue);
            if (!isNaN(num)) onChange(num);
            else setLocalValue(value);
        } else {
            onChange(localValue);
        }
    };
    const handleKeyDown = (e: any) => { if (e.key === 'Enter') e.currentTarget.blur(); };
    return (
        <input
            {...props}
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`bg-white border border-gray-300 rounded-none text-[#1d1d1f] focus:border-apple-blue focus:ring-1 focus:ring-apple-blue outline-none transition-all hover:border-apple-blue/50 ${className}`}
        />
    );
};

// --- Icons ---
const Icons = {
    Calculator: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="0"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>,
    Package: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>,
    Settings: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
    ChevronDown: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>,
    ChevronUp: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m18 15-6-6-6 6"/></svg>,
    Upload: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    TrendingUp: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    Info: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
};

// --- Initial Data ---
const DEFAULT_COMMISSIONS = {
    CN: [
        { category: '专业乐器', subject: '吉他线', rateFBO: 11, rateFBS: 11 }, 
        { category: '专业乐器', subject: '吉他效果器', rateFBO: 11, rateFBS: 11 },
        { category: '餐具器具', subject: '保温瓶', rateFBO: 16, rateFBS: 16 },
    ],
    KZ: [
        { category: '专业乐器', subject: '吉他线', rateFBO: 13, rateFBS: 18 }, 
        { category: '专业乐器', subject: '吉他效果器', rateFBO: 13, rateFBS: 18 },
        { category: '餐具器具', subject: '保温瓶', rateFBO: 14, rateFBS: 19 }, 
    ],
    RU: [
        { category: '专业乐器', subject: '吉他线', rateFBO: 20, rateFBS: 28 }, 
        { category: '专业乐器', subject: '吉他效果器', rateFBO: 20, rateFBS: 28 },
        { category: '餐具器具', subject: '保温瓶', rateFBO: 22, rateFBS: 30 }, 
    ]
};

const INITIAL_SCENARIOS = [
    { id: 'cn_cross', region: 'CN', mode: 'Direct', logic: 'CN_CROSS_V3', taxRate: 0.0, bankFee: 1.0, opFee: 6.0, commDiscount: 0.8 },
    { id: 'cn_overseas', region: 'CN', mode: 'Overseas', logic: 'CN_OVERSEAS_HYBRID', taxRate: 0.0, bankFee: 1.0, opFee: 3.0, commDiscount: 1.0 },
    { id: 'kz_fbo', region: 'KZ', mode: 'FBO', logic: 'LOCAL_V1', taxRate: 6.0, bankFee: 1.25, opFee: 0, commDiscount: 1.0 },
    { id: 'kz_fbs', region: 'KZ', mode: 'FBS', logic: 'LOCAL_V1', taxRate: 6.0, bankFee: 1.25, opFee: 3.0, commDiscount: 1.0 },
    { id: 'ru_fbo', region: 'RU', mode: 'FBO', logic: 'LOCAL_V1', taxRate: 8.0, bankFee: 3.0, opFee: 0, commDiscount: 1.0 },
    { id: 'ru_fbs', region: 'RU', mode: 'FBS', logic: 'LOCAL_V1', taxRate: 8.0, bankFee: 3.0, opFee: 3.0, commDiscount: 1.0 }
];

const REGION_ORDER = ['CN', 'KZ', 'RU'];

const getModeLabel = (mode: string) => {
    switch (mode) {
        case 'Direct': return '跨境直发';
        case 'Overseas': return '海外仓';
        case 'FBO': return '本土 FBO';
        case 'FBS': return '本土 FBS';
        default: return mode;
    }
};

const ProfitCompass: React.FC = () => {
    const [config, setConfig] = useState({
        ex_RUB_CNY: 13.5, 
        ex_RUB_CNY_CN: 13.8, 
        ex_USD_CNY: 7.25, 
        cn_direct_log_base: 18, cn_direct_log_step: 4, 
        cn_overseas_log_base: 12, cn_overseas_log_step: 2, 
        kz_log_base: 80, kz_log_step: 10,
        kz_log_coefficient: 1.0, 
        ru_log_base: 80, ru_log_step: 10,
        ru_log_coefficient: 1.0 
    });

    const [scenarios, setScenarios] = useState(INITIAL_SCENARIOS);
    const [commDb, setCommDb] = useState(DEFAULT_COMMISSIONS);
    const [selectedCategory, setSelectedCategory] = useState('专业乐器');
    const [selectedSubject, setSelectedSubject] = useState('吉他线');
    const [procurementCost, setProcurementCost] = useState(35); 
    const [headHaulUnitPrice, setHeadHaulUnitPrice] = useState(4.0);
    const [cnCommissionDiscount, setCnCommissionDiscount] = useState(1.0);
    const [productPhys, setProductPhys] = useState({ weight_g: 250, length_cm: 15, width_cm: 10, height_cm: 5 });
    const [prices, setPrices] = useState({ CN: 129, KZ: 1800, RU: 2100 });
    const [spp, setSpp] = useState({ CN: 20, KZ: 20, RU: 20 });
    const [isCommImporting, setIsCommImporting] = useState(false);
    const [expandedDetail, setExpandedDetail] = useState<string | null>(null);

    const volLiters = useMemo(() => {
        return parseFloat(((productPhys.length_cm * productPhys.width_cm * productPhys.height_cm) / 1000).toFixed(3));
    }, [productPhys]);

    const getCommRate = (region: string, mode: string) => {
        const list = (commDb as any)[region] || [];
        const item = list.find((i: any) => i.category === selectedCategory && i.subject === selectedSubject);
        if (!item) return 0;
        if (region === 'CN') return item.rateFBS; 
        return mode === 'FBO' ? item.rateFBO : item.rateFBS;
    };

    const updateCommRate = (region: string, field: 'rateFBO' | 'rateFBS', value: number) => {
        setCommDb(prev => {
            const next = { ...prev };
            const list = [...((next as any)[region] || [])];
            const idx = list.findIndex(i => i.category === selectedCategory && i.subject === selectedSubject);
            if (idx !== -1) {
                list[idx] = { ...list[idx], [field]: value };
            }
            (next as any)[region] = list;
            return next;
        });
    };

    const handleCommUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsCommImporting(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
            
            const newDb: any = JSON.parse(JSON.stringify(commDb));
            
            const countryMap: Record<string, string> = {
                '中国': 'CN', 'CHINA': 'CN', 'CN': 'CN',
                '哈萨克斯坦': 'KZ', '哈萨克': 'KZ', 'KAZAKHSTAN': 'KZ', 'KZ': 'KZ',
                '俄罗斯': 'RU', 'RUSSIA': 'RU', 'RU': 'RU'
            };

            jsonData.forEach(row => {
                const rawCountry = String(row['国家'] || row['Market'] || row['Region'] || '').trim().toUpperCase();
                const region = countryMap[rawCountry] || rawCountry;
                
                if (!['CN', 'KZ', 'RU'].includes(region)) return;
                
                const cat = String(row['一级类目'] || row['Category'] || '');
                const sub = String(row['二级品名'] || row['Subject'] || '');
                const fbo = parseFloat(row['FBO扣点'] || row['FBO Rate'] || row['FBO模式'] || 0);
                const fbs = parseFloat(row['FBS扣点'] || row['FBS Rate'] || row['FBS模式'] || 0);
                
                if (!newDb[region]) newDb[region] = [];
                const existingIdx = newDb[region].findIndex((i:any) => i.category === cat && i.subject === sub);
                
                if (existingIdx !== -1) {
                    newDb[region][existingIdx] = { ...newDb[region][existingIdx], rateFBO: fbo, rateFBS: fbs };
                } else {
                    newDb[region].push({ category: cat, subject: sub, rateFBO: fbo, rateFBS: fbs });
                }
            });
            
            setCommDb(newDb);
            alert("佣金表导入成功！对应的类目佣金已更新。");
        } catch (err) {
            console.error("佣金表解析错误:", err);
            alert("导入失败：请确保 Excel 包含‘国家’、‘一级类目’、‘二级品名’、‘FBO扣点’、‘FBS扣点’等必要字段。");
        } finally {
            setIsCommImporting(false);
            event.target.value = ''; 
        }
    };

    const updateScenario = (id: string, field: string, value: any) => {
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, [field]: Number(value) } : s));
    };

    const calculateProfit = (scenario: any) => {
        const price = (prices as any)[scenario.region];
        const currentSPP = (spp as any)[scenario.region];
        const rate = getCommRate(scenario.region, scenario.mode);
        const rubToCny = (val: number) => val / config.ex_RUB_CNY;

        let revenue = 0, commTotal = 0, logTotal = 0, feesTotal = 0, netCNY = 0;
        let commOrig = 0, logOrig = 0, feesOrig = 0, revenueOrig = 0;
        const effectiveCommDiscount = scenario.region === 'CN' ? cnCommissionDiscount : scenario.commDiscount;
        const effectiveRate = rate * effectiveCommDiscount;
        let logBase = 0, logStep = 0;
        const logCoeff = scenario.region === 'KZ' ? config.kz_log_coefficient : (scenario.region === 'RU' ? config.ru_log_coefficient : 1.0);
        const cur = scenario.region === 'CN' ? 'CNY' : (scenario.region === 'KZ' ? 'KZT' : 'RUB');

        if (scenario.region === 'CN') {
            logBase = scenario.mode === 'Direct' ? config.cn_direct_log_base : config.cn_overseas_log_base; 
            logStep = scenario.mode === 'Direct' ? config.cn_direct_log_step : config.cn_overseas_log_step;
        } else if (scenario.region === 'KZ') { 
            logBase = config.kz_log_base; logStep = config.kz_log_step; 
        } else { 
            logBase = config.ru_log_base; logStep = config.ru_log_step; 
        }

        if (scenario.logic === 'CN_CROSS_V3' || scenario.logic === 'CN_OVERSEAS_HYBRID') {
            revenueOrig = price;
            revenue = price;
            commOrig = price * (rate / 100) * effectiveCommDiscount;
            commTotal = commOrig;
            
            if (scenario.logic === 'CN_CROSS_V3') {
                const units = Math.ceil(productPhys.weight_g / 100) || 1;
                logOrig = logBase + ((units - 1) * logStep);
                logTotal = logOrig;
            } else {
                const vCeil = Math.ceil(volLiters < 1 ? 1 : volLiters);
                const lastMileCNY = logBase + ((vCeil - 1) * logStep); 
                const headHaulCNY = (productPhys.weight_g / 1000) * headHaulUnitPrice * config.ex_USD_CNY;
                logOrig = lastMileCNY + headHaulCNY;
                logTotal = logOrig;
            }

            feesOrig = price * (scenario.taxRate / 100) + price * (scenario.bankFee / 100) + scenario.opFee;
            feesTotal = feesOrig;
            netCNY = revenue - commTotal - logTotal - feesTotal - procurementCost;
        } else {
            revenueOrig = price;
            commOrig = revenueOrig * (rate / 100) * effectiveCommDiscount;
            const vCeil = Math.ceil(volLiters < 1 ? 1 : volLiters);
            logOrig = (logBase + ((vCeil - 1) * logStep)) * logCoeff; 
            const taxOrig = revenueOrig * (scenario.taxRate / 100);
            const bankOrig = revenueOrig * (scenario.bankFee / 100);
            feesOrig = taxOrig + bankOrig;

            const headHaulCNY = (productPhys.weight_g / 1000) * headHaulUnitPrice * config.ex_USD_CNY;
            
            revenue = rubToCny(revenueOrig);
            commTotal = rubToCny(commOrig);
            logTotal = rubToCny(logOrig) + headHaulCNY;
            feesTotal = rubToCny(feesOrig) + scenario.opFee;
            netCNY = revenue - commTotal - logTotal - feesTotal - procurementCost;
        }

        return {
            income: revenue,
            incomeOrig: revenueOrig,
            displayPrice: scenario.region === 'CN' ? (price * (1 - currentSPP/100) * config.ex_RUB_CNY_CN) : (price * (1 - currentSPP/100)),
            commTotal, commOrig,
            logTotal, logOrig,
            feesTotal, feesOrig,
            netCNY, 
            margin: (netCNY / (revenue || 1)) * 100, 
            roi: (netCNY / (procurementCost || 1)) * 100,
            rateUsed: effectiveRate,
            currency: cur,
            isCN: scenario.region === 'CN'
        };
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-none">
            {/* Top Bar */}
            <div className="bg-white border border-gray-200 p-8 rounded-none flex flex-wrap items-center justify-between gap-8 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-apple-blue text-white flex items-center justify-center rounded-none shadow-lg">
                        <Icons.Calculator size={30} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#1d1d1f] tracking-tight flex items-center gap-3">
                            利润定价分析罗盘 <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500 font-bold uppercase tracking-widest">v2.9.2</span>
                        </h2>
                        <p className="text-[13px] text-gray-400 font-bold mt-0.5">多区域全链路财务仿真与收益预测引擎</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex gap-2">
                        <ConfigInput label="定价汇率 RUB" value={config.ex_RUB_CNY_CN} onChange={(v:any) => setConfig({...config, ex_RUB_CNY_CN: v})} symbol="₽" highlight={true} />
                        <ConfigInput label="回款汇率 RUB" value={config.ex_RUB_CNY} onChange={(v:any) => setConfig({...config, ex_RUB_CNY: v})} symbol="₽" />
                        <ConfigInput label="物流汇率 USD" value={config.ex_USD_CNY} onChange={(v:any) => setConfig({...config, ex_USD_CNY: v})} symbol="¥" />
                    </div>
                    
                    <div className="h-12 border-l border-gray-100 mx-2 hidden md:block"></div>
                    
                    <label className="h-[52px] px-6 bg-[#1d1d1f] hover:bg-apple-blue text-white text-[13px] font-black uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer active:scale-95 shadow-lg">
                        <Icons.Upload size={18} />
                        {isCommImporting ? '导入中...' : '导入佣金配置'}
                        <input type="file" onChange={handleCommUpload} className="hidden" accept=".xlsx, .xls, .csv" />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm space-y-6">
                        <h3 className="text-[12px] font-black text-[#1d1d1f] uppercase tracking-[0.2em] flex items-center gap-2 pb-4 border-b border-gray-50">
                            <Icons.Package size={16} className="text-apple-blue" /> 基础货品属性
                        </h3>
                        
                        <div className="space-y-5">
                            <SearchableSelect label="品类层级" options={Array.from(new Set(commDb.CN.map((i:any)=>i.category)))} value={selectedCategory} onChange={setSelectedCategory} />
                            <SearchableSelect label="具体品名" options={commDb.CN.filter((i:any)=>i.category===selectedCategory).map((s:any)=>s.subject)} value={selectedSubject} onChange={setSelectedSubject} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 block mb-1.5 ml-1 uppercase">采购成本 (¥)</label>
                                    <BlurInput value={procurementCost} onChange={setProcurementCost} className="w-full text-[15px] font-black p-3" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 block mb-1.5 ml-1 uppercase">头程运价 ($)</label>
                                    <BlurInput value={headHaulUnitPrice} onChange={setHeadHaulUnitPrice} className="w-full text-[15px] font-black p-3" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-5 border border-gray-100 space-y-5">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">单品毛重 (g)</label>
                                <BlurInput value={productPhys.weight_g} onChange={(v:any) => setProductPhys({...productPhys, weight_g: v})} className="w-24 text-right text-[14px] font-black p-2" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {['length_cm','width_cm','height_cm'].map((key, i) => (
                                    <div key={key}>
                                        <label className="text-[9px] font-bold text-gray-400 block mb-1 text-center uppercase">{['长','宽','高'][i]}</label>
                                        <BlurInput value={(productPhys as any)[key]} onChange={(v:any) => setProductPhys({...productPhys, [key]: v})} className="w-full text-center text-[12px] font-black p-2" />
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[11px] font-black text-[#1d1d1f] uppercase tracking-widest">
                                <span>计费体积</span>
                                <div className="flex items-center gap-1.5 text-apple-blue font-black">
                                    <span className="text-[14px]">{volLiters}</span>
                                    <span className="text-[9px]">升 (L)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {REGION_ORDER.map(region => (
                            <div key={region} className="bg-white border border-gray-200 rounded-none shadow-sm group">
                                <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-apple-blue"></div>
                                        <span className="text-[13px] font-black text-[#1d1d1f] tracking-tight">{region === 'CN' ? '中国旗舰' : region === 'KZ' ? '哈萨克店' : '俄罗斯店'}配置</span>
                                    </div>
                                    <Icons.Settings size={14} className="text-gray-300 group-hover:text-apple-blue transition-colors" />
                                </div>
                                <div className="p-5 space-y-5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">佣金扣点 %</span>
                                            {region === 'CN' && (
                                                <div className="flex items-center gap-2 bg-indigo-50 px-2 py-0.5 border border-indigo-100">
                                                    <span className="text-[9px] text-indigo-400 font-black uppercase">折扣</span>
                                                    <BlurInput value={Math.round(cnCommissionDiscount*100)} onChange={(v:any)=>setCnCommissionDiscount(v/100)} className="w-8 text-center font-black text-xs bg-transparent border-none p-0 focus:ring-0" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white p-3 border border-gray-100 flex flex-col items-center">
                                                <span className="text-[9px] font-bold text-gray-300 uppercase mb-1">FBO 模式</span>
                                                <BlurInput value={(commDb as any)[region].find((i:any)=>i.category===selectedCategory && i.subject===selectedSubject)?.rateFBO} onChange={(v:any)=>updateCommRate(region, 'rateFBO', v)} className="w-full text-center text-[14px] font-black border-none bg-transparent" />
                                            </div>
                                            <div className="bg-white p-3 border border-gray-100 flex flex-col items-center">
                                                <span className="text-[9px] font-bold text-gray-300 uppercase mb-1">FBS 模式</span>
                                                <BlurInput value={(commDb as any)[region].find((i:any)=>i.category===selectedCategory && i.subject===selectedSubject)?.rateFBS} onChange={(v:any)=>updateCommRate(region, 'rateFBS', v)} className="w-full text-center text-[14px] font-black border-none bg-transparent" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-tighter">结算税费 %</label>
                                            <BlurInput value={scenarios.find(s=>s.region===region)?.taxRate} onChange={(v:any)=>scenarios.filter(s=>s.region===region).forEach(s=>updateScenario(s.id, 'taxRate', v))} className="w-full text-[14px] font-black p-2.5" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-tighter">收单手续 %</label>
                                            <BlurInput value={scenarios.find(s=>s.region===region)?.bankFee} onChange={(v:any)=>scenarios.filter(s=>s.region===region).forEach(s=>updateScenario(s.id, 'bankFee', v))} className="w-full text-[14px] font-black p-2.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-none shadow-md overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest w-48">核心决策维度</th>
                                    {REGION_ORDER.map(region => (
                                        <th key={region} className="px-8 py-5 text-center border-l border-gray-100 min-w-[280px]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[16px] font-black text-[#1d1d1f] tracking-tight mb-1">{region === 'CN' ? '中国旗舰店' : region === 'KZ' ? '哈萨克子店' : '俄罗斯本土店'}</span>
                                                <span className="text-[9px] font-bold text-apple-blue uppercase tracking-[0.2em]">实时测算模拟</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-8 py-10 align-top">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icons.TrendingUp size={14} className="text-apple-blue" />
                                            <span className="text-[12px] font-black text-[#1d1d1f] uppercase tracking-wider">定价决策</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">基于回款目标与前台 SPP 活动力度的价格映射关系。</p>
                                    </td>
                                    {REGION_ORDER.map(region => {
                                        const res = calculateProfit(scenarios.find(s => s.region === region));
                                        return (
                                            <td key={region} className="px-8 py-10 border-l border-gray-50 bg-white">
                                                <div className="bg-[#f5f5f7] p-8 text-center mb-8 border border-gray-100 shadow-inner group">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 opacity-60 group-hover:opacity-100 transition-opacity">预估前台标价</div>
                                                    <span className="text-5xl font-black text-[#1d1d1f] tracking-tighter">₽{Math.round(res.displayPrice)}</span>
                                                </div>
                                                <div className="space-y-6 px-4">
                                                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{region === 'CN' ? '¥' : '₽'} 回款价设定</span>
                                                        <BlurInput value={(prices as any)[region]} onChange={(v:any)=>setPrices({...prices, [region]:v})} className="w-28 text-right font-black text-[18px] bg-transparent border-none p-0 focus:ring-0 text-apple-blue" />
                                                    </div>
                                                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">SPP 补偿 %</span>
                                                        <BlurInput value={(spp as any)[region]} onChange={(v:any)=>setSpp({...spp, [region]:v})} className="w-20 text-right font-black text-[16px] text-gray-400 bg-transparent border-none p-0 focus:ring-0" />
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                <tr>
                                    <td className="px-8 py-10">
                                        <span className="text-[12px] font-black text-[#1d1d1f] uppercase tracking-wider block mb-2">全链路损耗</span>
                                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">基于 CNY 折算的各链路固定及变动成本明细。</p>
                                    </td>
                                    {REGION_ORDER.map(region => {
                                        const scs = scenarios.filter(s => s.region === region);
                                        return (
                                            <td key={region} className="px-6 py-10 border-l border-gray-50 bg-gray-50/20">
                                                <div className="grid grid-cols-2 gap-4">
                                                    {scs.map(s => {
                                                        const res = calculateProfit(s);
                                                        return (
                                                            <div key={s.id} className="bg-white border border-gray-100 p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-all">
                                                                <span className="text-[10px] font-black text-[#1d1d1f] uppercase mb-5 px-3 py-1 bg-gray-50 border border-gray-100 tracking-widest">{getModeLabel(s.mode)}</span>
                                                                <div className="space-y-3 w-full text-center">
                                                                    <div className="flex justify-between items-center text-[11px] text-gray-400 border-b border-gray-50 pb-2">
                                                                        <span className="font-bold">类目佣金 ({res.rateUsed.toFixed(0)}%)</span>
                                                                        <span className="font-black text-[#1d1d1f]">¥{res.commTotal.toFixed(1)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[11px] text-gray-400 border-b border-gray-50 pb-2">
                                                                        <span className="font-bold">物流费用总计</span>
                                                                        <span className="font-black text-apple-red">¥{res.logTotal.toFixed(1)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-[11px] text-gray-400">
                                                                        <span className="font-bold">收单/税费/杂项</span>
                                                                        <span className="font-black text-apple-red">¥{res.feesTotal.toFixed(1)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>

                                <tr className="bg-apple-blue/5">
                                    <td className="px-8 py-16">
                                        <span className="text-[15px] font-black text-apple-blue tracking-tighter mb-2 block uppercase">应收收益表现</span>
                                        <p className="text-[12px] text-gray-400 font-bold leading-tight">基于当前结算汇率的最终单笔到账利润预估。</p>
                                    </td>
                                    {REGION_ORDER.map(region => {
                                        const scs = scenarios.filter(s => s.region === region);
                                        return (
                                            <td key={region} className="px-6 py-16 border-l border-white shadow-inner">
                                                <div className="grid grid-cols-2 gap-10">
                                                    {scs.map(s => {
                                                        const res = calculateProfit(s);
                                                        const isPos = res.netCNY > 0;
                                                        const isExpanded = expandedDetail === s.id;
                                                        return (
                                                            <div key={s.id} className="flex flex-col items-center text-center">
                                                                <span className={`text-4xl font-black tracking-tighter ${isPos ? 'text-[#1d1d1f]' : 'text-apple-red'}`}>
                                                                    {isPos ? '¥' : '-¥'}{Math.abs(res.netCNY).toFixed(1)}
                                                                </span>
                                                                <div className={`mt-8 px-6 py-2.5 text-[13px] font-black uppercase tracking-widest border ${isPos ? 'bg-apple-blue text-white border-apple-blue shadow-lg shadow-apple-blue/20' : 'bg-apple-red text-white border-apple-red shadow-lg shadow-apple-red/20'}`}>
                                                                    ROI {res.roi.toFixed(1)}%
                                                                </div>
                                                                <div className="mt-4 flex flex-col items-center">
                                                                    <span className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">边际利润 {res.margin.toFixed(0)}%</span>
                                                                </div>
                                                                
                                                                {/* 计算详情展开按钮 */}
                                                                <button 
                                                                    onClick={() => setExpandedDetail(isExpanded ? null : s.id)}
                                                                    className="mt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-apple-blue hover:underline transition-all"
                                                                >
                                                                    {isExpanded ? <Icons.ChevronUp size={12} /> : <Icons.ChevronDown size={12} />}
                                                                    计算详情
                                                                </button>

                                                                {/* 展开的详情面板 */}
                                                                {isExpanded && (
                                                                    <div className="mt-4 w-full bg-white border border-gray-100 p-4 text-left shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 z-20">
                                                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-50">
                                                                            <Icons.Info size={14} className="text-apple-blue" />
                                                                            <span className="text-[11px] font-black uppercase tracking-widest text-[#1d1d1f]">利润核算推导</span>
                                                                        </div>
                                                                        
                                                                        <div className="space-y-2.5">
                                                                            <div className="flex justify-between text-[11px]">
                                                                                <span className="text-gray-400 font-bold">公式：</span>
                                                                                <span className="font-mono text-[9px] bg-gray-50 px-1 text-gray-600">收益 - 佣金 - 物流 - 税杂 - 成本</span>
                                                                            </div>
                                                                            
                                                                            <div className="space-y-1.5 pt-2">
                                                                                <DetailRow label="回款收益" cny={res.income} orig={res.incomeOrig} cur={res.currency} color="text-apple-blue" isCN={res.isCN} />
                                                                                <DetailRow label="类目佣金" cny={-res.commTotal} orig={res.commOrig} cur={res.currency} color="text-apple-red" isCN={res.isCN} />
                                                                                <DetailRow label="全链物流" cny={-res.logTotal} orig={res.logOrig} cur={res.currency} color="text-apple-red" isCN={res.isCN} />
                                                                                <DetailRow label="税费杂项" cny={-res.feesTotal} orig={res.feesOrig} cur={res.currency} color="text-apple-red" isCN={res.isCN} />
                                                                                <DetailRow label="采购成本" cny={-procurementCost} orig={procurementCost} cur="CNY" color="text-apple-red" isCN={true} />
                                                                            </div>

                                                                            <div className="pt-3 mt-2 border-t border-gray-100 flex justify-between items-baseline">
                                                                                <span className="text-[10px] font-black text-[#1d1d1f] uppercase tracking-tighter">最终净利</span>
                                                                                <span className={`text-[15px] font-black ${isPos ? 'text-[#1d1d1f]' : 'text-apple-red'}`}>¥{res.netCNY.toFixed(1)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Intelligence Summary */}
                    <div className="bg-[#1d1d1f] text-white p-10 rounded-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-apple-blue">财务执行摘要</span>
                                </div>
                                <p className="text-[15px] font-medium leading-relaxed text-gray-300">
                                    模拟器已根据最新的 <span className="text-white font-black underline decoration-apple-blue underline-offset-4">全链路损耗模型</span> 进行对冲计算。
                                    请特别关注汇率波动对边际利润的杠杆效应，尤其是俄罗斯本土仓储费用的动态溢价与 SPP 活动的补偿水位。
                                </p>
                            </div>
                            <div className="flex flex-col items-end border-l border-gray-700 pl-8 hidden md:flex">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">当前模拟汇率对</span>
                                <span className="text-2xl font-black text-white tracking-tighter">RUB {config.ex_RUB_CNY_CN} → CNY</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components ---

function DetailRow({ label, cny, orig, cur, color, isCN }: any) {
    return (
        <div className="flex flex-col gap-0.5 group">
            <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-gray-500">{label}</span>
                <span className={`text-[11px] font-black ${color}`}>¥{Math.abs(cny).toFixed(1)}</span>
            </div>
            {!isCN && (
                <div className="flex justify-end">
                    <span className="text-[9px] text-gray-300 font-mono italic">({Math.abs(orig).toFixed(1)} {cur})</span>
                </div>
            )}
        </div>
    );
}

function SearchableSelect({ label, options, value, onChange }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const filtered = options.filter((o: string) => o.toLowerCase().includes(search.toLowerCase()));
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <label className="text-[11px] font-bold text-gray-500 block mb-1.5 ml-1 uppercase tracking-wider">{label}</label>
            <div className="w-full text-[13px] font-bold border border-gray-200 rounded-none p-3 flex justify-between items-center cursor-pointer bg-white hover:border-gray-300 transition-colors" onClick={() => { setIsOpen(!isOpen); setSearch(''); }}>
                <span className={`truncate ${value ? 'text-[#1d1d1f]' : 'text-gray-300'}`}>{value || "请选择..."}</span>
                <Icons.ChevronDown size={14} className="text-gray-400" />
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-none shadow-xl max-h-60 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-gray-50">
                        <input autoFocus className="w-full bg-[#f5f5f7] text-[12px] font-medium outline-none text-[#1d1d1f] px-3 py-2 rounded-none" placeholder="搜索关键词..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {filtered.length > 0 ? filtered.map((opt: string) => (
                            <div key={opt} className={`px-4 py-2.5 text-[13px] font-bold cursor-pointer transition-colors ${opt === value ? 'bg-apple-blue text-white' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`} onClick={() => { onChange(opt); setIsOpen(false); }}>{opt}</div>
                        )) : <div className="p-4 text-[12px] text-gray-400 text-center font-medium">无结果</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

function ConfigInput({ label, value, onChange, symbol, highlight = false }: any) {
    return (
        <div className={`flex flex-col items-start px-4 py-2 rounded-none border transition-all ${highlight ? 'border-apple-blue bg-white shadow-sm ring-1 ring-apple-blue/10' : 'border-gray-200 bg-white'}`}>
            <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-tight">{label}</span>
            <div className="flex items-baseline gap-1.5 w-full">
                <span className="text-xs font-bold text-gray-400">{symbol}</span>
                <BlurInput type="number" value={value} onChange={onChange} className="w-full bg-transparent font-black text-[15px] text-left outline-none border-none p-0 focus:ring-0" />
            </div>
        </div>
    )
}

export default ProfitCompass;