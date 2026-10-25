// Finfolio 1.0 submitted riskFreeRate: 3 in Project cũ/src/App.tsx.
// A compatibility assumption, NOT a fetched government yield or live quote.
export const DEFAULT_RISK_FREE_ANNUAL = 0.03;
export const DEFAULT_RISK_FREE_SOURCE = 'Mặc định lãi suất phi rủi ro Finfolio';
export function resolveRiskFree({mode='default',percent='',source='',quote=null}={}) {
  if (mode === 'default') {
    if (Number.isFinite(quote?.annual) && quote.annual > -1 && quote.annual <= 1 && typeof quote.source === 'string' && quote.source.startsWith('HNX')) {
      return {annual:quote.annual,source:quote.source,observedAt:quote.observedAt || null,mode};
    }
    return {annual:DEFAULT_RISK_FREE_ANNUAL,source:DEFAULT_RISK_FREE_SOURCE,observedAt:null,mode};
  }
  if (mode !== 'custom') throw Error('Chọn chế độ lãi suất mặc định hoặc tùy chỉnh.');
  const raw=String(percent).trim(), annual=Number(raw)/100;
  if (!raw || !Number.isFinite(annual) || annual<=-1 || annual>1) throw Error('Lãi suất tùy chỉnh phải lớn hơn −100% và không quá 100%/năm. Chọn mặc định nếu không muốn nhập.');
  return {annual,source:String(source).trim() || 'Giả định tùy chỉnh của người dùng, không phải báo giá lãi suất đã xác minh',mode};
}
export function riskFreeForResult(data) {
  if (data.riskFreeAnnual === null || data.riskFreeAnnual === undefined) return resolveRiskFree();
  return {annual:data.riskFreeAnnual,source:data.riskFreeSource || 'Giả định của bản phân tích đã lưu',mode:data.riskFreeMode || 'custom'};
}
