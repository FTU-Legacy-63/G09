import { simulatePortfolio } from './simulation.mjs';
import { allocationScenario } from './finance.mjs';
self.onmessage = ({ data }) => {
  try {
    const result = data.kind === 'simulation' ? simulatePortfolio(data.input, data.options) : allocationScenario(data.input, data.options);
    self.postMessage({ ok: true, result });
  } catch (error) { self.postMessage({ ok: false, error: error.message || 'Chưa tính được kết quả.' }); }
};
