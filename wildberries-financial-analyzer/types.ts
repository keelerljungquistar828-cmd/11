export enum OrderStatus {
  SALES = '销售订单',
  REJECTED = '拒收订单',
  RETURNS = '不签收订单',
  ADJUSTMENT = '财务调整',
  OTHERS = '其他'
}

export interface RawRow {
  srid: string;
  sku: string;
  productName?: string;
  catalogPrice: number; // 吊牌价 (Цена розничная)
  realizedPrice: number; // 实际成交价 (Вайлдберриз реализовал То瓦尔 (Пр))
  wbCommission: number;
  wbVat: number;
  deliveryFee: number;
  logisticsFee: number;
  storageFee: number;
  acceptanceFee: number;
  acquiringFee: number;
  penaltyFee: number;
  commissionAdj: number;
  loyaltyBonus: number;
  loyaltyDeduction: number;
  transactionType: string;
  orderDate: string;
  saleDate: string;
  deliveryPlace: string;
  currency: string;
}

export interface AggregatedSrid {
  srid: string;
  sku: string;
  productName: string;
  status: OrderStatus;
  catalogPrice: number;
  realizedPrice: number; 
  totalCommission: number;
  logistics: number;
  storage: number;
  acceptance: number;
  acquiring: number;
  penalty: number;
  adjustment: number;
  loyaltyBonus: number;
  loyaltyDeduction: number;
  netProfit: number;
  orderDate: Date;
  saleDate: Date;
  deliveryPlace: string;
  durationDays: number;
  currency: string;
}

export interface SummaryData {
  reportId: string;
  entity: string;
  period: string;
  generationDate: string;
  reportType: string;
  sales: number;
  loyaltyCompensation: number;
  payableSettlement: number; 
  negotiatedDiscount: number;
  logistics: number;
  storage: number;
  acceptance: number;
  acquiring: number;
  otherDeductions: number;
  penalties: number;
  commissionAdjustment: number;
  loyaltyParticipation: number;
  loyaltyIntegralDeduction: number;
  oneTimeAdjustment: number;
  totalPayable: number;
  currency: string;
}

export interface PivotData {
  totalOrderCount: number;
  salesCount: number;
  returnCount: number;
  rejectedCount: number;
  adjustmentCount: number;
  avgDuration: number;
  deliveryLocations: Record<string, number>;
}

export interface SkuMetric {
  sku: string;
  productName: string;
  totalOrders: number;
  salesCount: number;
  returnCount: number;
  rejectedCount: number;
  adjustmentCount: number;
  returnRate: number;
  
  // Per order averages
  avgRealized: number;      // Average net realized price (income) per order
  avgCommission: number;    // Average commission paid per order
  avgAcquiring: number;     // Average acquiring fee per order
  avgSalesLogistics: number;// Average logistics cost for successful sales
  avgReturnLogistics: number;// Amortized cost of returns/rejected across all orders
  avgMisc: number;          // Average misc (penalty, storage, etc) per order
  avgNetProfit: number;     // Average net profit per order
}