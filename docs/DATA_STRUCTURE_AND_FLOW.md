# Week 3 — Data Structure và Data Flow

## Canonical data structure

| Entity | Primary key | Important fields | Purpose |
| --- | --- | --- | --- |
| `portfolios` | `portfolio_id` | base_currency, owner_session, created_at | Context của một lần phân tích |
| `transactions` | `transaction_id` | portfolio_id, symbol_id, side, quantity, trade_price, trade_date | Tái tạo holdings; có thể thay bằng opening holdings trong sample |
| `instruments` | `symbol_id` | vendor_symbol, exchange, asset_group, quote_currency, proxy_label | Resolve instrument một cách không mơ hồ |
| `market_prices` | (`symbol_id`, `session_date`) | close_price, source_id, retrieved_at | Chuỗi giá versioned và có provenance |
| `fx_rates` | (`quote_currency`, `base_currency`, `session_date`) | fx_rate, source_id, retrieved_at | Đổi mọi vị thế về base currency |
| `portfolio_scenarios` | (`portfolio_id`, `scenario_id`, `symbol_id`) | proposed_weight, min_weight, max_weight, locked | Current/proposed state |
| `metric_results` | (`portfolio_id`, `scenario_id`, `metric_id`, `as_of`) | value, unit, horizon, method_version | Output dẫn xuất, không ghi đè raw input |
| `evidence_log` | `evidence_id` | source_id, retrieval_time, assumption_ids, limitation_ids | Trace output về nguồn và convention |

## Week 3 fixture mapping

- `data/sample_portfolio.csv` gộp opening holdings và scenario để review nhanh.
- `data/sample_config.csv` giữ base currency, horizon, frequency, benchmark và rebalance rule.
- `data/sample_market_data.csv` gộp instrument prices và FX observations; trường `series_type` phân biệt `asset_price`, `benchmark_price` và `fx_rate`.
- Production implementation nên dùng các entity tách riêng ở trên, không dùng CSV phẳng làm database.

## Identity and unit rules

- Canonical identity là tổ hợp vendor symbol + exchange/venue; không tự động map bare ticker khi có thể trùng thị trường.
- Raw price giữ nguyên quote currency; conversion chỉ xảy ra trong normalized layer.
- `fx_rate_to_base` luôn có orientation “base currency units per one quote currency unit”.
- Raw observations là immutable; transformed matrices và metrics lưu method version.
- Mọi result phải mang `unit`, `horizon`, `frequency`, `source_id` và các assumption IDs liên quan.

## Data flow chính

```text
User holdings / sample case
        ↓
Schema validation → instrument resolution → holdings validation
        ↓                         ↘ explicit unsupported-symbol error
Price + metadata + FX retrieval → raw cache with source/timestamp
        ↓
Normalize dates, currencies and units
        ↓
Align common observations → sufficiency/staleness checks
        ↓
Position value → allocation → base-currency returns → covariance
        ↓
Return attribution + risk attribution + concentration insight
        ↓
Apply proposed weights with published bounds/rebalance rule
        ↓
Recalculate on identical data/horizon/assumptions
        ↓
Risk and Return Allocation Brief
  ├─ evidence and before/after result
  ├─ assumptions and limitations
  └─ user-recorded decision and reason
```

## Failure paths

- Schema/value error: giữ lại form state, chỉ đúng field và rule vi phạm.
- Unresolved/ambiguous instrument: dừng instrument đó; không thay bằng ticker gần giống.
- Missing FX hoặc không đủ common observations: không tính metric phụ thuộc; nêu chính xác dữ liệu thiếu.
- Missing optional benchmark/market cap: core brief vẫn chạy, phần optional hiển thị unavailable.
- Proposed weights/bounds sai: không chạy comparison cho đến khi scenario hợp lệ.

Flow này chỉ khóa evidence readiness. Formula specification đầy đủ, thresholds và expected results chi tiết thuộc Week 4.
