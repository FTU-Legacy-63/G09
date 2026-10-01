export const PERIODS = ['1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'];
export function periodStart(dates, period) {
  if (period === 'ALL') return 0;
  const end = new Date(`${dates.at(-1)}T00:00:00Z`), cutoff = new Date(end);
  if (period === 'YTD') { cutoff.setUTCMonth(0, 1); }
  else if (period.endsWith('M')) {
    const day=cutoff.getUTCDate(); cutoff.setUTCDate(1); cutoff.setUTCMonth(cutoff.getUTCMonth()-parseInt(period));
    const last=new Date(Date.UTC(cutoff.getUTCFullYear(),cutoff.getUTCMonth()+1,0)).getUTCDate(); cutoff.setUTCDate(Math.min(day,last));
  } else cutoff.setUTCFullYear(cutoff.getUTCFullYear()-parseInt(period));
  const day=cutoff.toISOString().slice(0,10), i=dates.findIndex(d=>d>=day);
  return i<0 ? dates.length-1 : i;
}
export function attributionWindow(data, period='ALL') {
  const start=periodStart(data.dates,period), end=data.dates.length-1;
  const startCapital=data.current.valuePath[start];
  const positions=data.symbols.map((symbol,i)=>{
    const quantity=data.initialCapital*data.current.weights[i]/data.prices[symbol][0];
    const startValue=quantity*data.prices[symbol][start], endValue=quantity*data.prices[symbol][end];
    return {symbol,...data.instruments[symbol],weight:startValue/startCapital,assetReturn:data.prices[symbol][end]/data.prices[symbol][start]-1,pnl:endValue-startValue,contribution:(endValue-startValue)/startCapital};
  });
  const requestedStart=period==='ALL'?data.dates[0]:null;
  return {positions,start,end,startDate:data.dates[start],endDate:data.dates[end],startCapital,periodReturn:data.current.valuePath[end]/startCapital-1,pnl:data.current.valuePath[end]-startCapital,requestedStart,observations:end-start+1};
}
export function groupAttribution(positions, mode='symbol') {
  if(mode==='symbol') return positions;
  const grouped=new Map();
  for(const p of positions) {
    const key=mode==='class'?p.className:mode==='currency'?p.currency:p.group;
    const g=grouped.get(key)||{symbol:key,name:key,weight:0,pnl:0,contribution:0};
    g.weight+=p.weight; g.pnl+=p.pnl; g.contribution+=p.contribution; grouped.set(key,g);
  }
  return [...grouped.values()].map(g=>({...g,assetReturn:g.weight>0?g.contribution/g.weight:0}));
}
export function csvCell(value) {
  const text=String(value??'');
  // Prevent spreadsheet formula injection in external names/tickers.
  const safe=/^[=+@\-]/.test(text.trimStart()) && typeof value!=='number' ? `'${text}` : text;
  return `"${safe.replaceAll('"','""')}"`;
}
