# Week 3 — Evidence Index, Owner và Status

## Evidence package

| Evidence | What a reviewer can verify | Owner | Status |
| --- | --- | --- | --- |
| [Input Dictionary](INPUT_DICTIONARY.md) | Meaning, type, unit, rule, source và output use của input | Trần Minh Ngọc | Ready for Checkpoint 3 |
| [Source–Use Map](SOURCE_USE_MAP.md) | Source → exact use → convention → limitation | Trần Minh Ngọc + Lê Bảo An | Ready for Checkpoint 3 |
| [Assumptions and Limitations](ASSUMPTIONS.md) | Các simplification ảnh hưởng output và disclosure | Hoàng Khánh Linh | Ready for Checkpoint 3 |
| [Sample Input-to-Output Case](SAMPLE_INPUT_OUTPUT.md) | Trace từ holdings/market data đến output dự kiến | Nguyễn Ngọc Anh | Ready for Checkpoint 3 |
| [Data Structure and Flow](DATA_STRUCTURE_AND_FLOW.md) | Canonical entities, units, pipeline và failure paths | Lê Bảo An | Ready for Checkpoint 3 |
| [Validation and Early Logic Test](VALIDATION_AND_EARLY_TEST.md) | Error rules và expected arithmetic checks | Nguyễn Quỳnh Anh | Ready for Checkpoint 3 |
| [Sample data package](../data/README.md) | CSV fixture, provenance, frequency và limitations | Nguyễn Quỳnh Anh | Ready for Checkpoint 3 |

## Scope decisions retained from Week 2

- Target user: nhà đầu tư cá nhân đã có hiểu biết cơ bản về tài chính và đầu tư, muốn kiểm tra một danh mục nhỏ đa tài sản.
- Core task: nhập danh mục, xem risk/return allocation và thử một thay đổi tỷ trọng.
- Core output: Risk and Return Allocation Brief theo mã/nhóm.
- Core user input: current holdings snapshot và đúng một target-weight change; transaction history được deferred.
- Main measures: CAGR khi đủ horizon và annualized volatility; fixture Week 3 quá ngắn nên không báo CAGR.
- Không mở lại account system, chatbot, optimization, forecasting, overall score hoặc dashboard phụ.

## Checkpoint 3 defense answers

| Checkpoint question | Team answer before feedback |
| --- | --- |
| Information nào thực sự cần cho main output? | Holdings snapshot (`symbol`, `quantity`), instrument metadata, price/FX series, horizon và một target-weight change. Transaction history, benchmark và market cap không cần cho core brief. |
| Mỗi item đến từ đâu? | Holdings/scenario từ user; price/FX và metadata từ provisional market source; base currency, bounds và pro-rata rule do nhóm cấu hình; derived metrics do calculation layer tạo. |
| Thành viên khác có thể giải thích meaning/use không? | Input dictionary tách information role, unit, rule, output affected và owner; source IDs nối trực tiếp sang fixture. |
| Sample có trace được tới intended output không? | Có. `G09_SAMPLE_01` đi từ holdings → real price/FX → allocation/contribution → một BTC target change → one Risk and Return Allocation Brief. |
| Cần remove/simplify/disclose gì trước Week 4? | Remove transaction history khỏi MVP; defer benchmark/market cap; disclose price-only return, short horizon, static-weight risk estimate và provisional data source. |

Quyết định cần khóa ở Week 4: minimum horizon, full return/volatility methodology, missing-data tolerance và production data source.

## Feedback-to-revision record

| Field | Record |
| --- | --- |
| Feedback received | Pending Checkpoint 3 |
| Decision after feedback | Pending |
| Revision made | Pending |
| Reason | Pending |

## Pre-checkpoint internal revision

| Decision | Revision made | Reason |
| --- | --- | --- |
| Simplify | Khóa input ở current holdings snapshot; transaction history được deferred | Tránh phải xử lý cash flow/holdings chronology ngoài core MVP |
| Clarify | Scenario chỉ nhận một BTC target weight và suy ra các weights còn lại theo pro-rata | Sample giờ kiểm chứng đúng user flow đã công bố |
| Correct | Period return dùng fixed-quantity buy-and-hold; volatility được gọi đúng là static-weight estimate | Loại bỏ mâu thuẫn giữa “không rebalance” và constant-weight daily return |
| Trace | Đổi đúng tên `SOURCE_USE_MAP.md`, thêm source IDs và sửa market-data schema | Cho phép trace từng observation tới nguồn và exact use |

## Definition of done

- [x] Core/conditional/contextual inputs được phân biệt và có validation rule.
- [x] Mỗi source map tới exact product use và limitation.
- [x] Real market-data fixture và simulated holdings có provenance rõ ràng.
- [x] Assumptions, limitations, data structure và flow được công bố.
- [x] Early logic test có expected results và reconciliation.
- [x] Owner và trạng thái được ghi cho từng evidence.
- [ ] Ghi nhận feedback Checkpoint 3 và cập nhật revision record.

Package được coi là **ready for Checkpoint 3**, chưa phải production-ready financial methodology.
