# Week 3 — Sample Input-to-Output Case

## Mục đích evidence

Case này cho thấy input dự kiến có thể đi hết logic path tới **Risk and Return Allocation Brief**. Holdings là dữ liệu giả lập của nhóm; chuỗi market/FX là quan sát thực đã lưu cố định để người review tái lập kết quả. Case không phải bằng chứng về problem và không phải khuyến nghị đầu tư.

## Evidence files

- [Sample portfolio](../data/sample_portfolio.csv)
- [One-change scenario](../data/sample_scenario.csv)
- [Sample configuration](../data/sample_config.csv)
- [Sample market data](../data/sample_market_data.csv)
- [Data provenance and conventions](../data/README.md)

## Input summary

| Position | Group | Quantity | Start market close | Currency | Start value in VND | Start weight | Derived proposed weight |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: |
| FPT.VN | Vietnam equity | 100 | 70,200 | VND | 7,020,000 | 35.6420% | 33.9437% |
| HPG.VN | Vietnam equity | 200 | 23,300 | VND | 4,660,000 | 23.6598% | 22.5324% |
| GLD | Gold proxy ETF | 0.5 | 370.600006 | USD | 4,865,051.58 | 24.7009% | 23.5239% |
| BTC-USD | Cryptoasset | 0.002 | 60,003.757813 | USD | 3,150,797.32 | 15.9973% | 20% |
| **Total** |  |  |  |  | **19,695,848.90** | **100.0000%** | **100%** |

Start values use the 2026-07-01 USD/VND observation. Analysis window is 2026-07-01 through 2026-07-15 with 10 aligned price dates and 9 return observations.

## Intended visible output

| User question | Evidence shown | Trace to input |
| --- | --- | --- |
| Danh mục hiện được phân bổ thế nào? | Value và start weight theo symbol/group | Quantity × price × FX |
| Return đến từ đâu? | Period return contribution theo vị thế | Base-currency cumulative asset return × start weight |
| Risk tập trung ở đâu? | Annualized volatility, Euler risk contribution và concentration insight | Daily return matrix, sample covariance, start weights, annualization factor |
| Một thay đổi tỷ trọng có tác động gì? | Current/proposed comparison trên cùng horizon và assumptions | Proposed weights + cùng market-data matrix |

## Illustrative result from the fixture

| Metric | Current weights | Proposed weights |
| --- | ---: | ---: |
| Period portfolio return | -1.2618% | -0.8269% |
| Static-weight annualized volatility estimate | 21.9866% | 22.4981% |

Current-state period return contribution:

| Position | Asset cumulative return | Contribution to portfolio period return |
| --- | ---: | ---: |
| FPT.VN | -4.8433% | -1.7263 percentage points |
| HPG.VN | -3.8627% | -0.9139 percentage points |
| GLD | 0.4875% | 0.1204 percentage points |
| BTC-USD | 7.8636% | 1.2580 percentage points |
| **Reconciliation** |  | **-1.2618 percentage points** |

Current-state risk contribution:

| Position | Contribution to annualized volatility | Share of portfolio volatility |
| --- | ---: | ---: |
| FPT.VN | 10.0979 percentage points | 45.9274% |
| HPG.VN | 1.8415 percentage points | 8.3756% |
| GLD | 4.9226 percentage points | 22.3893% |
| BTC-USD | 5.1246 percentage points | 23.3078% |
| **Reconciliation** | **21.9866 percentage points** | **100.0000%** |

Một câu insight có thể hiển thị: “Trong fixture ngắn này, FPT chiếm 35.64% giá trị đầu kỳ nhưng khoảng 45.93% measured volatility contribution.” Đây chỉ là kiểm tra output shape; 9 return observations không đủ để kết luận concentration bền vững.

## Một output, một takeaway có thể hành động

Tất cả kết quả trên là các section của **một Risk and Return Allocation Brief**, không phải các output rời. Sau khi xem brief, người dùng nhận được và hiểu được:

- **Nhận được:** current allocation, nguồn đóng góp return/risk và một before/after scenario trên cùng dữ liệu.
- **Hiểu được:** FPT đang đóng góp risk lớn hơn tỷ trọng vốn, trong khi tăng BTC lên 20% làm period return của fixture bớt âm nhưng static-weight volatility estimate tăng từ 21.99% lên 22.50%.
- **Có thể hành động:** tự ghi nhận quyết định giữ nguyên hoặc dùng proposed allocation; Finfolio không tự phát lệnh mua/bán hay gọi một phương án là “tốt nhất”.

## User flow covered

1. Người dùng tải/nhập holdings; MVP dùng base currency VND đã được khóa trong configuration.
2. Hệ thống resolve instrument, validate input, tải price/FX rồi hiển thị allocation.
3. Hệ thống tính return và volatility contribution, kèm assumptions/limitations.
4. Người dùng chỉ đổi BTC-USD từ current weight 15.9973% lên target 20%.
5. Hệ thống phân bổ 80% còn lại theo pro-rata thành `33.9437/22.5324/23.5239/20.0000`, rồi tính lại trên cùng dates, prices, FX và convention.
6. Decision Brief hiển thị before/after và cho người dùng ghi nhận quyết định.

Không hiển thị CAGR từ fixture Week 3 vì horizon quá ngắn. CAGR vẫn là metric MVP dự kiến khi cửa sổ dữ liệu đạt policy tối thiểu được khóa ở Week 4.
