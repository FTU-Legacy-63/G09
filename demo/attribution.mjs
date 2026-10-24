export const PERIODS = ['1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'];
function periodBoundary(dates, period) {
  if(period==='ALL') return dates[0];
  const end = new Date(`${dates.at(-1)}T00:00:00Z`), cutoff = new Date(end);
  if (period === 'YTD') { cutoff.setUTCMonth(0, 1); }
  else if (period.endsWith('M')) {
    const day=cutoff.getUTCDate(); cutoff.setUTCDate(1); cutoff.setUTCMonth(cutoff.getUTCMonth()-parseInt(period));
    const last=new Date(Date.UTC(cutoff.getUTCFullYear(),cutoff.getUTCMonth()+1,0)).getUTCDate(); cutoff.setUTCDate(Math.min(day,last));
  } else cutoff.setUTCFullYear(cutoff.getUTCFullYear()-parseInt(period));
  return cutoff.toISOString().slice(0,10);
}
export function periodStart(dates, period) {
  const day=periodBoundary(dates,period), i=dates.findIndex(d=>d>=day);
  return i<0 ? dates.length-1 : i;
}
function sampleCovariance(left, right) {
  const leftMean=left.reduce((sum,value)=>sum+value,0)/left.length;
  const rightMean=right.reduce((sum,value)=>sum+value,0)/right.length;
  return left.reduce((sum,value,index)=>sum+(value-leftMean)*(right[index]-rightMean),0)/(left.length-1);
}
function windowRisk(data, start, positions) {
  const indices=data.dates.slice(start+1).map((_,offset)=>start+1+offset).filter(index=>(Date.parse(data.dates[index])-Date.parse(data.dates[index-1]))/86400000<=7);
  if(indices.length<2) return {contributions:positions.map(()=>null),volatility:null,observations:indices.length};
  const series=data.symbols.map(symbol=>indices.map(index=>data.prices[symbol][index]/data.prices[symbol][index-1]-1));
  const covariance=series.map(left=>series.map(right=>sampleCovariance(left,right)));
  const weights=positions.map(position=>position.weight);
  const variance=weights.reduce((sum,weight,i)=>sum+weight*weights.reduce((inner,other,j)=>inner+other*covariance[i][j],0),0);
  const dailySigma=Math.sqrt(Math.max(0,variance));
  if(dailySigma===0) return {contributions:positions.map(()=>0),volatility:0,observations:indices.length};
  const contributions=weights.map((weight,i)=>weight*weights.reduce((sum,other,j)=>sum+covariance[i][j]*other,0)/dailySigma*Math.sqrt(252));
  return {contributions,volatility:dailySigma*Math.sqrt(252),observations:indices.length};
}
export function attributionWindow(data, period='ALL') {
  const start=periodStart(data.dates,period), end=data.dates.length-1;
  const startCapital=data.current.valuePath[start];
  let positions=data.symbols.map((symbol,i)=>{
    const quantity=data.initialCapital*data.current.weights[i]/data.prices[symbol][0];
    const startValue=quantity*data.prices[symbol][start], endValue=quantity*data.prices[symbol][end];
    const weight=startValue/startCapital;
    const localPath=data.localPrices?.[symbol];
    const fxAvailable=localPath && (data.instruments[symbol].currency!=='USD' || (data.fxRates?.[start]>0 && data.fxRates?.[end]>0));
    const localReturn=fxAvailable ? localPath[end]/localPath[start]-1 : null;
    const fxReturn=fxAvailable ? (data.instruments[symbol].currency==='USD' ? data.fxRates[end]/data.fxRates[start]-1 : 0) : null;
    return {symbol,...data.instruments[symbol],weight,assetReturn:data.prices[symbol][end]/data.prices[symbol][start]-1,pnl:endValue-startValue,contribution:(endValue-startValue)/startCapital,localContribution:fxAvailable?weight*localReturn:null,fxContribution:fxAvailable?weight*fxReturn:null,interactionContribution:fxAvailable?weight*localReturn*fxReturn:null};
  });
  const risk=windowRisk(data,start,positions);
  positions=positions.map((position,index)=>({...position,riskContribution:risk.contributions[index]}));
  const requestedStart=periodBoundary(data.dates,period);
  const complete=period==='ALL'||(Date.parse(data.dates[0])-Date.parse(requestedStart))/86400000<=7;
  return {positions,start,end,startDate:data.dates[start],endDate:data.dates[end],startCapital,periodReturn:data.current.valuePath[end]/startCapital-1,pnl:data.current.valuePath[end]-startCapital,volatility:risk.volatility,riskObservations:risk.observations,requestedStart,complete,observations:end-start+1};
}
export function groupAttribution(positions, mode='symbol') {
  if(mode==='symbol') return positions;
  const grouped=new Map();
  for(const p of positions) {
    const classificationMode = mode==='sector'||mode==='industry';
    const key=classificationMode ? (p[mode] || (p.className==='Equity' ? 'Chưa có phân loại' : `Không áp dụng · ${p.className}`)) : mode==='class'?p.className:mode==='currency'?p.currency:p.group;
    const g=grouped.get(key)||{symbol:key,name:key,members:[],weight:0,pnl:0,contribution:0,riskContribution:0,riskAvailable:true};
    g.members.push(p.symbol);
    g.weight+=p.weight; g.pnl+=p.pnl; g.contribution+=p.contribution;
    if(Number.isFinite(p.riskContribution)) g.riskContribution+=p.riskContribution; else g.riskAvailable=false;
    grouped.set(key,g);
  }
  return [...grouped.values()].map(g=>({...g,name:['sector','industry'].includes(mode)?g.members.join(', '):g.name,assetReturn:g.weight>0?g.contribution/g.weight:0,riskContribution:g.riskAvailable?g.riskContribution:null}));
}
export function csvCell(value) {
  const text=String(value??'');
  // Prevent spreadsheet formula injection in external names/tickers.
  const safe=/^[=+@\-]/.test(text.trimStart()) && typeof value!=='number' ? `'${text}` : text;
  return `"${safe.replaceAll('"','""')}"`;
}
