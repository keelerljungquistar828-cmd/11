import * as XLSX from 'xlsx';
import { RawRow, SummaryData } from '../types';

/**
 * 鲁棒的数字解析：清除千分位空格、处理逗号小数点、支持括号负数
 */
const parseNum = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  let s = String(val).trim();
  // 彻底清除所有类型的空白字符 (空格, 不换行空格等)
  s = s.replace(/[\s\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ''); 
  if (s.startsWith('(') && s.endsWith(')')) {
    s = '-' + s.substring(1, s.length - 1);
  }
  const cleaned = s.replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const parseWBExcel = async (file: File): Promise<{ summary: SummaryData; rows: RawRow[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 寻找表头行
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(jsonData.length, 50); i++) {
          const row = jsonData[i] || [];
          if (row.some(cell => {
            const val = String(cell).toLowerCase();
            return val.includes('srid') || val.includes('артикул поставщика') || val.includes('article');
          })) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error("未能识别报表表头。请确保上传的是 Wildberries 原始明细报表（包含 Srid 列）。");
        }

        // --- 元数据提取 ---
        let period = "未知周期";
        let entity = "未知主体";
        let reportId = "未知编号";
        
        // 遍历表头之前的行来提取 Meta 信息
        for (let i = 0; i < headerRowIndex; i++) {
          const rowValues = (jsonData[i] || []).map(v => String(v || "").trim());
          const rowStr = rowValues.join(" ");
          if (!rowStr) continue;

          // 1. 周期提取
          const dateMatches = rowStr.match(/(\d{2}\.\d{2}\.\d{4})/g);
          if (dateMatches && dateMatches.length >= 2) {
            period = `${dateMatches[0]} - ${dateMatches[1]}`;
          }

          // 2. 法人实体提取
          if (/Продавец|Организация|法人|Entity|Supplier/i.test(rowStr)) {
            const parts = rowStr.split(/[:：]/);
            if (parts.length > 1) {
              entity = parts[1].trim();
            } else {
              const cleaned = rowStr.replace(/(Продавец|Организация|法人|Entity|Supplier)/i, '').trim();
              if (cleaned.length > 2) entity = cleaned;
            }
          }

          // 3. 报告编号
          const idMatch = rowStr.match(/(\d{8,12})/);
          if (idMatch && reportId === "未知编号") reportId = idMatch[1];
        }

        const headers = jsonData[headerRowIndex].map(h => String(h || "").trim());
        const dataRows = jsonData.slice(headerRowIndex + 1);
        const findIdx = (names: string[]) => headers.findIndex(h => names.some(n => h.toLowerCase().includes(n.toLowerCase())));

        const colMap = {
          srid: findIdx(['Srid']),
          sku: findIdx(['Артикул поставщика', 'Supplier article']),
          name: findIdx(['Название', 'Product name']),
          catalogPrice: findIdx(['Цена розничная', 'Retail price']),
          realizedPrice: findIdx(['реализовал Товар (Пр)', 'Realized price']),
          docType: findIdx(['Тип документа', 'Document type']),
          paymentReason: findIdx(['Обоснование для оплаты', 'Payment reason']),
          delivery: findIdx(['Услуги по доставке', 'Delivery services']),
          logisticsReimbursement: findIdx(['Возмещение издержек']),
          penalty: findIdx(['Общая сумма штрафов', 'Penalty']),
          storage: findIdx(['Хранение', 'Storage']),
          payableToSeller: findIdx(['К перечислению Продавцу', 'Payable to seller']),
          loyaltyComp: findIdx(['Компенсация скидки', 'Loyalty compensation']),
          otherDeductions: findIdx(['Удержания']),
          commissionAdj: findIdx(['Корректировка Вознаграждения']),
          discountPercent: findIdx(['Согласованный продуктовый']),
          wbCommission: findIdx(['Вознаграждение Вайлдберриз (ВВ)']),
          wbVat: findIdx(['НДС с Вознаграждения']),
          acceptance: findIdx(['Операции на приемке']),
          location: findIdx(['Наименование офи赛处']),
          orderDate: findIdx(['Дата заказа']),
          saleDate: findIdx(['Дата продажи']),
          oneTimeAdj: findIdx(['Разовое изменение срока']),
          acquiring: findIdx(['Эквайринг', 'Acquiring']),
        };

        let totalRealized = 0;
        let totalLoyaltyComp = 0;
        let goodsSettlement = 0;
        let logisticsTotal = 0;
        let storageTotal = 0;
        let acceptanceTotal = 0;
        let penaltyTotal = 0;
        let otherTotal = 0;
        let commissionAdjTotal = 0;
        let oneTimeAdjTotal = 0;
        let acquiringTotal = 0;

        const rows: RawRow[] = [];

        dataRows.forEach(r => {
          if (!r || r.length === 0) return;

          const docType = String(r[colMap.docType] || "").toLowerCase();
          const reason = String(r[colMap.paymentReason] || "").toLowerCase();
          
          const isSale = docType.includes("продажа") || reason.includes("销售") || reason.includes("продажа");
          const isReturn = docType.includes("возврат") || reason.includes("退货") || reason.includes("возврат");
          const sign = isSale ? 1 : (isReturn ? -1 : 0);

          const rawRealized = parseNum(r[colMap.realizedPrice]);
          const realized = Math.abs(rawRealized) * (sign || 1); 
          const loyalty = Math.abs(parseNum(r[colMap.loyaltyComp])) * (sign || 1);
          const payable = parseNum(r[colMap.payableToSeller]);
          const rowAcquiring = Math.abs(parseNum(r[colMap.acquiring]));

          // L1 核心汇总逻辑
          totalRealized += (sign !== 0 ? realized : rawRealized);
          totalLoyaltyComp += loyalty;

          if (sign !== 0) {
            goodsSettlement += payable; 
          }

          logisticsTotal += Math.abs(parseNum(r[colMap.delivery])) + Math.abs(parseNum(r[colMap.logisticsReimbursement]));
          storageTotal += Math.abs(parseNum(r[colMap.storage]));
          acceptanceTotal += Math.abs(parseNum(r[colMap.acceptance]));
          penaltyTotal += Math.abs(parseNum(r[colMap.penalty]));
          otherTotal += Math.abs(parseNum(r[colMap.otherDeductions]));
          commissionAdjTotal += parseNum(r[colMap.commissionAdj]);
          oneTimeAdjTotal += parseNum(r[colMap.oneTimeAdj]);
          acquiringTotal += rowAcquiring;

          const sridVal = String(r[colMap.srid] || '').trim();
          if (sridVal || r[colMap.docType]) {
            const rawSku = String(r[colMap.sku] || '').trim();
            const rawName = String(r[colMap.name] || '').trim();

            rows.push({
              srid: sridVal || 'MISC',
              sku: rawSku || 'N/A',
              productName: rawName || '未知商品',
              catalogPrice: parseNum(r[colMap.catalogPrice]),
              realizedPrice: sign !== 0 ? realized : 0,
              wbCommission: parseNum(r[colMap.wbCommission]),
              wbVat: parseNum(r[colMap.wbVat]),
              deliveryFee: Math.abs(parseNum(r[colMap.delivery])) + Math.abs(parseNum(r[colMap.logisticsReimbursement])),
              logisticsFee: 0,
              storageFee: Math.abs(parseNum(r[colMap.storage])),
              acceptanceFee: Math.abs(parseNum(r[colMap.acceptance])),
              acquiringFee: rowAcquiring,
              penaltyFee: Math.abs(parseNum(r[colMap.penalty])),
              commissionAdj: parseNum(r[colMap.commissionAdj]),
              loyaltyBonus: loyalty,
              loyaltyDeduction: 0,
              transactionType: (reason + " " + docType).trim(),
              orderDate: String(r[colMap.orderDate] || ''),
              saleDate: String(r[colMap.saleDate] || ''),
              deliveryPlace: String(r[colMap.location] || '未知'),
              currency: 'руб.'
            });
          }
        });

        // 纠正公式：goodsSettlement (Payable to Seller) 已经减去了佣金和收单费。
        // 因此最终应付金额不应再减去一次 acquiringTotal。
        const netTotalPayable = goodsSettlement 
          - logisticsTotal 
          - storageTotal 
          - penaltyTotal 
          - otherTotal 
          - acceptanceTotal
          + commissionAdjTotal
          + oneTimeAdjTotal;

        const summary: SummaryData = {
          reportId,
          entity,
          period,
          generationDate: new Date().toLocaleDateString(),
          reportType: "财务明细分析",
          sales: totalRealized + totalLoyaltyComp, 
          loyaltyCompensation: totalLoyaltyComp,
          // 为了让 UI 展示逻辑 (应付商品结算 - 收单费 - 物流 ... = 最终实付) 闭合，
          // 这里的 payableSettlement 需要把收单费加回来作为“毛结算金额”。
          payableSettlement: goodsSettlement + acquiringTotal, 
          negotiatedDiscount: parseNum(dataRows[0]?.[colMap.discountPercent]),
          logistics: logisticsTotal,
          storage: storageTotal,
          acceptance: acceptanceTotal,
          acquiring: acquiringTotal,
          otherDeductions: otherTotal,
          penalties: penaltyTotal,
          commissionAdjustment: commissionAdjTotal,
          loyaltyParticipation: 0,
          loyaltyIntegralDeduction: 0,
          oneTimeAdjustment: oneTimeAdjTotal,
          totalPayable: netTotalPayable,
          currency: 'руб.'
        };

        resolve({ summary, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};