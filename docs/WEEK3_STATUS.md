# Week 3 — Evidence Index, Owner và Status

## Evidence package

| Evidence | What a reviewer can verify | Owner | Status |
| --- | --- | --- | --- |
| [Input Dictionary](INPUT_DICTIONARY.md) | Meaning, type, unit, rule, source và output use của input | Trần Minh Ngọc | Ready for Checkpoint 3 |
| [Source Register](SOURCE_REGISTER.md) | Source → exact use → convention → limitation | Trần Minh Ngọc + Lê Bảo An | Ready for Checkpoint 3 |
| [Assumptions and Limitations](ASSUMPTIONS.md) | Các simplification ảnh hưởng output và disclosure | Hoàng Khánh Linh | Ready for Checkpoint 3 |
| [Sample Input-to-Output Case](SAMPLE_INPUT_OUTPUT.md) | Trace từ holdings/market data đến output dự kiến | Nguyễn Ngọc Anh | Ready for Checkpoint 3 |
| [Data Structure and Flow](DATA_STRUCTURE_AND_FLOW.md) | Canonical entities, units, pipeline và failure paths | Lê Bảo An | Ready for Checkpoint 3 |
| [Validation and Early Logic Test](VALIDATION_AND_EARLY_TEST.md) | Error rules và expected arithmetic checks | Nguyễn Quỳnh Anh | Ready for Checkpoint 3 |
| [Sample data package](../data/README.md) | CSV fixture, provenance, frequency và limitations | Nguyễn Quỳnh Anh | Ready for Checkpoint 3 |

## Scope decisions retained from Week 2

- Target user: nhà đầu tư cá nhân đã có hiểu biết cơ bản về tài chính và đầu tư, muốn kiểm tra một danh mục nhỏ đa tài sản.
- Core task: nhập danh mục, xem risk/return allocation và thử một thay đổi tỷ trọng.
- Core output: Risk and Return Allocation Brief theo mã/nhóm.
- Main measures: CAGR khi đủ horizon và annualized volatility; fixture Week 3 quá ngắn nên không báo CAGR.
- Không mở lại account system, chatbot, optimization, forecasting, overall score hoặc dashboard phụ.

## Checkpoint 3 review questions

1. Input nào thực sự cần thiết để tạo core output, và input contextual nào nên bỏ/để optional?
2. Source hiện tại có đủ coverage, convention và quyền sử dụng cho prototype không?
3. Assumption nào có thể làm người dùng hiểu sai output nếu không hiển thị cạnh kết quả?
4. Sample case đã trace được input → logic → output và failure path chưa?
5. Quyết định nào phải khóa trước Week 4: minimum horizon, adjusted/unadjusted price, weight drift/rebalance, covariance/annualization hay licensed source?

## Feedback-to-revision record

| Field | Record |
| --- | --- |
| Feedback received | Pending Checkpoint 3 |
| Decision after feedback | Pending |
| Revision made | Pending |
| Reason | Pending |

## Definition of done

- [x] Core/conditional/contextual inputs được phân biệt và có validation rule.
- [x] Mỗi source map tới exact product use và limitation.
- [x] Real market-data fixture và simulated holdings có provenance rõ ràng.
- [x] Assumptions, limitations, data structure và flow được công bố.
- [x] Early logic test có expected results và reconciliation.
- [x] Owner và trạng thái được ghi cho từng evidence.
- [ ] Ghi nhận feedback Checkpoint 3 và cập nhật revision record.

Package được coi là **ready for Checkpoint 3**, chưa phải production-ready financial methodology.
