export const DECISIONS = ['Giữ nguyên', 'Cân nhắc tái phân bổ'];

export function decisionSnapshot(result) {
  if(!result?.dates?.length || !result.current || !result.symbols?.length) throw new Error('Hãy phân tích danh mục trước khi lưu quyết định.');
  const finite=value=>{if(!Number.isFinite(value)) throw new Error('Kết quả phân tích không hợp lệ; hãy phân tích lại.');return value;};
  return {
    schemaVersion:1, reportingCurrency:'VND', startDate:result.dates[0], endDate:result.dates.at(-1),
    initialCapital:finite(result.initialCapital), finalValue:finite(result.current.valuePath.at(-1)),
    periodReturn:finite(result.current.periodReturn), volatility:finite(result.current.volatility),
    benchmark:result.benchmark?.symbol || null, fetchedAtUtc:result.fetchedAtUtc || null,
    holdings:result.symbols.map((symbol,i)=>({symbol,weight:finite(result.current.weights[i])})),
    method:'Hypothetical buy-and-hold price return; initial-weight covariance risk; no dividends/fees',
  };
}

export function decisionRecord(result,decision,reason,userId,id) {
  const text=String(reason||'').trim();
  if(!DECISIONS.includes(decision)) throw new Error('Chọn một quyết định.');
  if(text.length<8 || text.length>2000) throw new Error('Lý do cần từ 8 đến 2.000 ký tự.');
  if(!/^[a-f0-9-]{36}$/i.test(userId||'')) throw new Error('Hãy đăng nhập trước khi lưu.');
  return {id,user_id:userId,decision,reason:text,snapshot:decisionSnapshot(result)};
}

// Use the current tab only, and discard Google provider credentials entirely.
export function tabAuthStorage(storage) {
  return {
    getItem:key=>storage.getItem(key),
    removeItem:key=>storage.removeItem(key),
    setItem:(key,value)=>{
      try {
        const parsed=JSON.parse(value);
        if(parsed && typeof parsed==='object') {delete parsed.provider_token;delete parsed.provider_refresh_token;}
        storage.setItem(key,JSON.stringify(parsed));
      } catch {storage.setItem(key,value);}
    },
  };
}
