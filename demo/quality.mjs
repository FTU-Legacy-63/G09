// Prototype evidence policy from Week 4; arithmetic fixtures are not decision-grade.
export function riskReadiness(data) {
  const required = Math.max(120, 10 * data.symbols.length);
  const observations = Math.min(...data.symbols.map(s => data.returns?.[s]?.length || 0));
  return {ready:observations >= required,observations,required,
    reason:`Risk attribution và tối ưu hóa cần ít nhất ${required} return chung; hiện có ${observations}. Đổi khoảng ngày dài hơn; allocation và period return vẫn dùng được.`};
}
