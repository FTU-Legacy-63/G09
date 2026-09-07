# Finfolio 2.0 — Project Proposal

## 1. Problem direction

Week 1 xác định difficulty sau:

> Nhà đầu tư cá nhân có thể nhìn thấy giá trị, return hoặc volatility của toàn danh mục nhưng khó xác định lợi nhuận và rủi ro đang được phân bổ ở vị thế nào. Vì vậy, họ khó kiểm tra một thay đổi tỷ trọng trước khi quyết định giữ nguyên hay tái phân bổ.

Week 2 chuyển difficulty này thành một MVP nhỏ nhất vẫn tạo ra giá trị. MVP không cố gắng chấm điểm toàn bộ chất lượng danh mục hoặc đưa ra danh mục tối ưu.

## 2. Target user and core task

### Primary target user

**Nhà đầu tư cá nhân đã có hiểu biết cơ bản về tài chính và đầu tư, muốn kiểm tra một danh mục nhỏ gồm nhiều loại tài sản trong instrument universe được hỗ trợ.**

MVP chỉ hỗ trợ một user segment này. Người mới chưa hiểu metric tài chính, nhà quản lý quỹ chuyên nghiệp và tổ chức tài chính không phải target user của giai đoạn hiện tại.

### Core task

> Điền thông tin danh mục, kiểm tra risk and return allocation theo từng mã/nhóm tài sản và thử tác động của một thay đổi tỷ trọng.

Người dùng hoàn thành core task khi có thể ghi nhận một trong hai quyết định: giữ nguyên hoặc tái phân bổ, kèm lý do dựa trên output.

## 3. MVP definition

| Câu hỏi | Câu trả lời của Finfolio 2.0 |
|---|---|
| Core user need | Biết return và risk đang được phân bổ ở đâu trong danh mục nhiều loại tài sản |
| Core input | Current holdings snapshot, market price/FX và một target-weight change |
| Core logic | Validate → Calculate → Attribute → Compare → Explain |
| Core output | Risk and Return Allocation Brief theo từng mã/nhóm tài sản |
| Must include | Current allocation, CAGR/volatility, return/risk contribution, concentration insight và một before/after comparison |
| Not included yet | Overall score, risk-tolerance scoring, account, chatbot, optimization, forecasting và execution |

## 4. Essential input

| Input | Mục đích | MVP rule |
|---|---|---|
| Instrument identifier | Liên kết current holding với historical data | Phải map duy nhất tới symbol và exchange |
| Quantity đang nắm giữ | Tính position value tại đầu kỳ | Positive decimal; không hỗ trợ short |
| Asset group và currency | Tổng hợp theo nhóm và quy đổi base currency | System resolve; người dùng xác nhận khi cần |
| Daily close và FX | Tạo base-currency return series | Product information từ nguồn được map và có common dates |
| Analysis horizon | Khóa period cho current/proposed comparison | Start < end và đủ observations theo policy |
| Một target-weight change | Tạo alternative portfolio | Có lower/upper bound; phần còn lại được cân pro-rata về 100% |

Người dùng có thể chọn sample portfolio thay vì nhập tay. Live API không phải điều kiện để chứng minh MVP.

## 5. Core logic path

1. **Validate:** kiểm tra identifier, holdings quantity, currency, target-weight bounds và data compatibility.
2. **Calculate:** tính position value theo base currency, portfolio weight, CAGR và annualized volatility.
3. **Attribute:** phân rã return contribution và volatility contribution theo vị thế/nhóm.
4. **Compare:** áp dụng một proposed weight change và tính lại cùng bộ chỉ số trên cùng dữ liệu.
5. **Explain:** tạo concentration insight, before/after statement, assumptions và limitations.

Mỗi bước phải tạo dữ liệu cho output chính. Logic không phục vụ Risk and Return Allocation Brief sẽ không vào MVP.

## 6. Main visible output

Nếu chỉ giữ một output, Finfolio 2.0 giữ **Risk and Return Allocation Brief**.

| User question | Visible result | Acceptance idea |
|---|---|---|
| Danh mục hiện được phân bổ thế nào? | Allocation theo vị thế/nhóm | Tổng weight bằng 100% và truy nguyên được về holdings |
| Return đến từ đâu? | Return contribution | Tổng contribution khớp portfolio period return trong sai số cho phép |
| Risk tập trung ở đâu? | Volatility contribution và concentration insight | Tổng risk contribution khớp annualized portfolio volatility theo phương pháp công bố |
| Một thay đổi tỷ trọng có tác động gì? | Before/after comparison | Hai trạng thái dùng cùng dữ liệu, horizon, currency và assumptions |

Brief kết thúc bằng evidence, assumptions và limitations để người dùng tự ghi nhận quyết định. Sản phẩm không gắn nhãn “nên mua”, “nên bán” hoặc “best portfolio”.

## 7. Measurement convention

- **CAGR** là thước đo return tổng hợp của asset và portfolio trên data period.
- **Annualized volatility** là thước đo risk cơ sở của asset và portfolio.
- **Return contribution** dùng period return contribution; không cộng trực tiếp individual CAGR để tạo portfolio CAGR.
- **Risk contribution** dùng volatility contribution theo covariance/Euler decomposition để có thể kiểm tra tổng contribution.
- Current và alternative portfolio phải dùng cùng price series, frequency, base currency, lookback và missing-data rule.

Cách tách CAGR khỏi return contribution tránh một phép cộng không hợp lệ nhưng vẫn giữ CAGR và volatility là hai đơn vị đo chính người dùng nhìn thấy.

## 8. Complete user flow

1. Người dùng chọn sample portfolio hoặc nhập một danh mục nhỏ thuộc instrument universe được hỗ trợ.
2. Hệ thống xác thực input và hiển thị current allocation.
3. Hệ thống tính return/risk contribution và chỉ ra concentration đáng chú ý.
4. Người dùng thay đổi tỷ trọng của một vị thế; hệ thống cân bằng theo rule được công bố.
5. Hệ thống tạo before/after comparison với cùng data period và assumptions.
6. Risk and Return Allocation Brief hiển thị evidence, assumptions và limitations.
7. Người dùng ghi nhận quyết định giữ nguyên hoặc tái phân bổ và lý do.

Flow hoàn chỉnh mới là MVP. Một tập hợp màn hình hoặc metric rời rạc chưa được xem là MVP.

## 9. Scope decisions

### Core MVP

- Một target user segment.
- Một portfolio nhỏ gồm các asset classes được hỗ trợ.
- Một base currency và compatible daily historical series.
- Current allocation theo vị thế/nhóm.
- CAGR và annualized volatility.
- Return contribution và volatility contribution.
- Một concentration insight.
- Một proposed weight change và before/after comparison.
- Evidence, assumptions và limitations.

### Fallback MVP

- Một sample portfolio cố định.
- Static historical CSV đã làm sạch.
- Một instrument universe nhỏ có dữ liệu tương thích.
- Một proposed reallocation được xác định trước.
- Cùng Risk and Return Allocation Brief như core MVP.

### Not included yet

- Overall portfolio score và cơ chế trọng số theo risk tolerance.
- Account, cloud storage và multi-user management.
- Chatbot hoặc AI recommendation.
- Portfolio optimization hoặc “best weights”.
- Monte Carlo, VaR/Expected Shortfall và stress testing.
- Forecasting, real-time data, brokerage integration và đặt lệnh.
- Full dashboard ngoài những thành phần cần để trình bày output chính.

## 10. Checkpoint 2 revision

| Nội dung | Ghi nhận |
|---|---|
| Feedback | Cần nói rõ người dùng nhận được gì; output và feature đang quá rộng; overall score cần tiêu chí, thang điểm và trọng số có căn cứ |
| Decision | **Simplify** |
| Change | Bỏ overall score khỏi MVP và tập trung vào một Risk and Return Allocation Brief có metric, formula và acceptance idea rõ |
| Rationale | Contribution và before/after comparison truy nguyên được về holdings; một overall score với trọng số chưa kiểm chứng có thể tạo cảm giác chính xác giả |

Risk tolerance và user-selected weights là một hypothesis cho giai đoạn sau, không phải logic đã được chấp nhận trong MVP.

## 11. Questions for Week 3

1. Instrument universe nhỏ nhất nào vẫn thể hiện được danh mục nhiều loại tài sản?
2. Base currency, FX source, daily cutoff và missing-data rule là gì?
3. Return contribution method nào phù hợp với holdings snapshot và có thể tính tay để kiểm thử?
4. Volatility contribution sẽ dùng covariance convention và tolerance nào?
5. Rule cân bằng proposed weights sẽ phân bổ phần còn lại ra sao?
6. Người dùng mục tiêu có hiểu brief và tự đưa ra quyết định mà không cần overall score hay không?
