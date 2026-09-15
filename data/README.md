# Historical Week 3 sample fixture

Thư mục này giữ fixture đã commit trước khi nhóm khóa Core MVP ở phạm vi equity-only. Nó là test evidence/fallback kỹ thuật, không phải dữ liệu khách hàng và không phải bước chính trong user journey.

## Files

- `sample_portfolio.csv`: holdings giả lập gồm FPT, HPG, GLD và BTC.
- `sample_scenario.csv`: scenario lịch sử tăng BTC lên 20%.
- `sample_config.csv`: calculation context của fixture.
- `sample_market_data.csv`: 10 ngày quan sát giá/FX lấy qua `yahoo-finance2` vào 2026-08-26 UTC.

## Boundary

Fixture có 10 common dates cho FPT, HPG, GLD, BTC-USD và USD/VND. Cửa sổ này chỉ đủ kiểm tra parsing, currency conversion, allocation, return aggregation và risk-contribution arithmetic. Nó không đủ để diễn giải CAGR/volatility cho quyết định.

Fixture cũng chưa có benchmark series, sector/factor mapping hoặc optimization result. Do đó, nó **không phải evidence hoàn chỉnh của Core MVP hiện tại**, vốn chỉ hỗ trợ cổ phiếu và bắt buộc có benchmark cùng constrained optimization. Phần GLD/BTC được giữ để bảo toàn historical evidence, không chứng minh current multi-asset support.

## Conventions

- Unadjusted daily close; price return only.
- Dividends, transaction costs, tax và slippage chưa được tính.
- USD assets dùng same-date USD/VND close.
- Values chỉ được làm tròn khi ghi CSV.
- Yahoo adapter là nguồn prototype không có SLA và coverage có thể thay đổi.

Data requirements, source register, assumptions và readiness hiện tại được gộp tại [Week 3](../docs/WEEK3.md). Financial acceptance logic nằm tại [Week 4](../docs/WEEK4.md).
