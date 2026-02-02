import { RawRow, AggregatedSrid, OrderStatus, SummaryData, PivotData, SkuMetric } from '../types';

export const EMPTY_SUMMARY: SummaryData = {
  reportId: "000000000",
  entity: "未导入数据",
  period: "等待上传",
  generationDate: "-",
  reportType: "无",
  sales: 0,
  loyaltyCompensation: 0,
  payableSettlement: 0,
  negotiatedDiscount: 0,
  logistics: 0,
  storage: 0,
  acceptance: 0,
  acquiring: 0,
  otherDeductions: 0,
  penalties: 0,
  commissionAdjustment: 0,
  loyaltyParticipation: 0,
  loyaltyIntegralDeduction: 0,
  oneTimeAdjustment: 0,
  totalPayable: 0,
  currency: "руб."
};

export const mergeReports = (reports: SummaryData[]): SummaryData => {
  if (reports.length === 0) return EMPTY_SUMMARY;
  if (reports.length === 1) return reports[0];

  const periods = Array.from(new Set(reports.map(r => r.period))).filter(p => p !== "等待上传");
  const mergedPeriod = periods.length > 0 ? periods.join(" | ") : "等待上传";
  
  const entities = Array.from(new Set(reports.map(r => r.entity))).filter(e => e !== "未导入数据");
  const mergedEntity = entities.length > 0 ? entities.join(", ") : "未导入数据";

  const first = reports[0];

  return reports.reduce((acc, curr) => ({
    ...acc,
    sales: acc.sales + curr.sales,
    loyaltyCompensation: acc.loyaltyCompensation + curr.loyaltyCompensation,
    payableSettlement: acc.payableSettlement + curr.payableSettlement,
    logistics: acc.logistics + curr.logistics,
    storage: acc.storage + curr.storage,
    acceptance: acc.acceptance + curr.acceptance,
    acquiring: acc.acquiring + curr.acquiring,
    penalties: acc.penalties + curr.penalties,
    commissionAdjustment: acc.commissionAdjustment + curr.commissionAdjustment,
    otherDeductions: acc.otherDeductions + curr.otherDeductions,
    loyaltyIntegralDeduction: acc.loyaltyIntegralDeduction + curr.loyaltyIntegralDeduction,
    loyaltyParticipation: acc.loyaltyParticipation + curr.loyaltyParticipation,
    oneTimeAdjustment: acc.oneTimeAdjustment + curr.oneTimeAdjustment,
    totalPayable: acc.totalPayable + curr.totalPayable,
  }), { 
    ...EMPTY_SUMMARY, 
    reportId: "MERGED",
    reportType: "合并分析报告",
    period: mergedPeriod,
    generationDate: first.generationDate,
    entity: mergedEntity,
    currency: first.currency,
    sales: 0,
    loyaltyCompensation: 0,
    payableSettlement: 0,
    logistics: 0,
    storage: 0,
    acceptance: 0,
    acquiring: 0,
    penalties: 0,
    commissionAdjustment: 0,
    otherDeductions: 0,
    loyaltyIntegralDeduction: 0,
    loyaltyParticipation: 0,
    oneTimeAdjustment: 0,
    totalPayable: 0,
  });
};

export const processFinancialData = (rawRows: RawRow[]) => {
  if (rawRows.length === 0) return [];
  
  const sridGroups: Record<string, RawRow[]> = {};
  rawRows.forEach(row => {
    const sridStr = String(row.srid).trim();
    if (sridStr && sridStr !== '0' && sridStr !== 'MISC' && sridStr.length > 4) {
      if (!sridGroups[sridStr]) sridGroups[sridStr] = [];
      sridGroups[sridStr].push(row);
    }
  });

  const aggregatedSrids: AggregatedSrid[] = [];
  
  Object.entries(sridGroups).forEach(([srid, rows]) => {
    const totalRealized = rows.reduce((sum, r) => sum + r.realizedPrice, 0);

    const hasSaleDoc = rows.some(r => {
      const t = r.transactionType.toLowerCase();
      return t.includes("продажа") || t.includes("销售");
    });
    
    const hasReturnDoc = rows.some(r => {
      const t = r.transactionType.toLowerCase();
      return t.includes("возврат") || t.includes("退货");
    });

    const hasLogistics = rows.some(r => {
      const t = r.transactionType.toLowerCase();
      return (t.includes("逻辑") || t.includes("доставка") || t.includes("логистика")) && r.deliveryFee !== 0;
    });

    const bestSku = rows.find(r => r.sku && r.sku !== 'N/A' && r.sku.length > 2)?.sku || rows[0].sku || 'N/A';
    const bestName = rows.find(r => r.productName && r.productName !== '未知商品' && r.productName.length > 1)?.productName || rows[0].productName || "未知商品";

    let status = OrderStatus.OTHERS;
    
    if (bestName === '未知商品' && bestSku === 'N/A') {
      status = OrderStatus.ADJUSTMENT;
    } else if (totalRealized > 0) {
      status = OrderStatus.SALES;
    } else if (hasReturnDoc) {
      status = OrderStatus.RETURNS;
    } else if (hasLogistics) {
      status = OrderStatus.REJECTED;
    } else if (hasSaleDoc) {
      status = OrderStatus.SALES;
    }

    const hasAnyMoney = rows.some(r => (
      r.realizedPrice !== 0 || r.deliveryFee !== 0 || r.penaltyFee !== 0 || 
      r.storageFee !== 0 || r.acceptanceFee !== 0 || r.commissionAdj !== 0 || r.loyaltyBonus !== 0
    ));
    if (status === OrderStatus.OTHERS && !hasAnyMoney) return;

    const catalogPrice = Math.max(...rows.map(r => r.catalogPrice));
    const logistics = rows.reduce((sum, r) => sum + r.deliveryFee, 0);
    const penalty = rows.reduce((sum, r) => sum + r.penaltyFee, 0);
    const totalCommission = rows.reduce((sum, r) => sum + (r.wbCommission + r.wbVat), 0);
    const loyaltyBonus = rows.reduce((sum, r) => sum + r.loyaltyBonus, 0);
    const adjustment = rows.reduce((sum, r) => sum + r.commissionAdj, 0);
    const acquiring = rows.reduce((sum, r) => sum + r.acquiringFee, 0);
    const storage = rows.reduce((sum, r) => sum + r.storageFee, 0);
    const acceptance = rows.reduce((sum, r) => sum + r.acceptanceFee, 0);
    
    const netProfit = totalRealized + loyaltyBonus - totalCommission - acquiring - logistics - penalty - storage - acceptance + adjustment;

    const firstOrderDate = rows.find(r => r.orderDate && r.orderDate !== '0')?.orderDate;
    const firstSaleDate = rows.find(r => r.saleDate && r.saleDate !== '0')?.saleDate;

    aggregatedSrids.push({
      srid,
      sku: bestSku,
      productName: bestName,
      status,
      catalogPrice,
      realizedPrice: totalRealized,
      totalCommission,
      logistics,
      storage,
      acceptance,
      acquiring,
      penalty,
      adjustment,
      loyaltyBonus,
      loyaltyDeduction: rows.reduce((sum, r) => sum + r.loyaltyDeduction, 0),
      netProfit,
      orderDate: new Date(firstOrderDate || Date.now()),
      saleDate: new Date(firstSaleDate || Date.now()),
      deliveryPlace: rows.find(r => r.deliveryPlace && r.deliveryPlace !== '仓库' && r.deliveryPlace !== '未知')?.deliveryPlace || rows[0].deliveryPlace,
      durationDays: (firstOrderDate && firstSaleDate) 
        ? Math.max(1, Math.floor((new Date(firstSaleDate).getTime() - new Date(firstOrderDate).getTime()) / (1000*60*60*24))) 
        : 0,
      currency: rows[0].currency
    });
  });

  return aggregatedSrids;
};

export const calculatePivot = (srids: AggregatedSrid[]): PivotData => {
  if (srids.length === 0) return { totalOrderCount: 0, salesCount: 0, returnCount: 0, rejectedCount: 0, adjustmentCount: 0, avgDuration: 0, deliveryLocations: {} };
  
  const sales = srids.filter(s => s.status === OrderStatus.SALES);
  const returns = srids.filter(s => s.status === OrderStatus.RETURNS);
  const rejected = srids.filter(s => s.status === OrderStatus.REJECTED);
  const adjustments = srids.filter(s => s.status === OrderStatus.ADJUSTMENT);

  const ordersWithDuration = srids.filter(s => s.durationDays > 0);
  const avgDur = ordersWithDuration.length > 0 
    ? ordersWithDuration.reduce((sum, s) => sum + s.durationDays, 0) / ordersWithDuration.length 
    : 0;

  return {
    totalOrderCount: srids.length,
    salesCount: sales.length,
    returnCount: returns.length,
    rejectedCount: rejected.length,
    adjustmentCount: adjustments.length,
    avgDuration: avgDur,
    deliveryLocations: srids.reduce((acc: any, s) => {
      if (s.deliveryPlace && s.deliveryPlace !== '仓库' && s.deliveryPlace !== '未知') {
        acc[s.deliveryPlace] = (acc[s.deliveryPlace] || 0) + 1;
      }
      return acc;
    }, {})
  };
};

export const calculateSkuLayer = (srids: AggregatedSrid[]): SkuMetric[] => {
  const skus = Array.from(new Set(srids.map(s => s.sku)));
  return skus.map(sku => {
    const items = srids.filter(s => s.sku === sku);
    const count = items.length;
    const sales = items.filter(it => it.status === OrderStatus.SALES);
    const returns = items.filter(it => it.status === OrderStatus.RETURNS || it.status === OrderStatus.REJECTED);
    
    const returnCount = items.filter(i => i.status === OrderStatus.RETURNS).length;
    const rejectedCount = items.filter(i => i.status === OrderStatus.REJECTED).length;
    
    const totalRealized = items.reduce((s, i) => s + i.realizedPrice, 0);
    const totalCommission = items.reduce((s, i) => s + i.totalCommission, 0);
    const totalAcquiring = items.reduce((s, i) => s + i.acquiring, 0);
    const totalSalesLogistics = sales.reduce((s, i) => s + i.logistics, 0);
    const totalReturnLogistics = returns.reduce((s, i) => s + i.logistics, 0);
    const totalMisc = items.reduce((s, i) => s + i.penalty + i.acceptance + i.storage + i.adjustment, 0);
    const totalNetProfit = items.reduce((s, i) => s + i.netProfit, 0);
    
    return {
      sku,
      productName: items[0].productName,
      totalOrders: count,
      salesCount: sales.length,
      returnCount,
      rejectedCount,
      adjustmentCount: items.filter(i => i.status === OrderStatus.ADJUSTMENT).length,
      returnRate: count > 0 ? (returnCount + rejectedCount) / count : 0,
      
      avgRealized: totalRealized / count,
      avgCommission: totalCommission / count,
      avgAcquiring: totalAcquiring / count,
      avgSalesLogistics: totalSalesLogistics / count,
      avgReturnLogistics: totalReturnLogistics / count,
      avgMisc: totalMisc / count,
      avgNetProfit: totalNetProfit / count
    };
  });
};