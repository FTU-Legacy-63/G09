# Finfolio 2.0 — Portfolio Attribution & Risk Analytics

> Finfolio 2.0 giúp nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp hiểu lợi nhuận và rủi ro đến từ đâu, từ đó đưa ra quyết định phân bổ dựa trên bằng chứng định lượng thay vì chỉ nhìn vào các chỉ số tổng hợp.

## Repository evidence

| Giai đoạn | Bằng chứng |
|---|---|
| Week 1 | Problem candidates, target user, user task, problem statement, đóng góp cá nhân và revision sau checkpoint trong README này |
| Week 2 | [Project Proposal](docs/PROJECT_PROPOSAL.md) |
| Week 2 | [Solution Structure](docs/SOLUTION_STRUCTURE.md) |
| Week 3 | [Evidence Index, Owner and Status](docs/WEEK3_STATUS.md) |

## Team members and visible contribution

| Thành viên | MSSV | Trách nhiệm | Output có thể kiểm tra |
|---|---:|---|---|
| Hoàng Khánh Linh | 2412380024 | Product Owner — xác định financial reasoning và giữ phạm vi sản phẩm | Tài liệu công thức và giả định cho performance attribution, risk attribution, factor exposure và stress analysis |
| Nguyễn Quỳnh Anh | 2413380010 | Product Manager — chuyển yêu cầu sản phẩm thành kế hoạch kiểm thử và điều phối các workstream | Test portfolio, test cases tính tay và báo cáo đối chiếu kết quả |
| Lê Bảo An | 2412380002 | Lead Developer — thiết kế kiến trúc và tích hợp các module phân tích | Source code, portfolio analytics engine, market-data integration và bản triển khai web |
| Trần Minh Ngọc | 2412380036 | Business Analyst — xác định, thu thập và chuẩn hóa dữ liệu | Dataset đã làm sạch, data dictionary, nguồn dữ liệu và danh sách giới hạn dữ liệu |
| Nguyễn Ngọc Anh | 2413380008 | UI/UX Designer — thiết kế hành trình và cách trình bày kết quả | User flow, wireframe, Figma design và component library |

Các đường dẫn đến issue, commit, file dữ liệu, test và Figma sẽ được bổ sung khi từng output được đưa lên repository. Tên vai trò tự nó không được xem là bằng chứng đóng góp.

---

# Week 1 — Problem Direction

## 1. Problem candidates

Nhóm xem xét ba hướng vấn đề trước khi chọn phạm vi dự án.

| Candidate | Target user | Task/decision | Khó khăn chính | Đánh giá |
|---|---|---|---|---|
| Công cụ so sánh sản phẩm tiết kiệm | Người mới đi làm đang chọn kênh tiết kiệm | So sánh lãi suất, kỳ hạn và thanh khoản | Điều kiện của nhiều ngân hàng khó so sánh đồng thời | Khả thi nhưng chiều sâu phân tích định lượng còn hạn chế |
| Công cụ so sánh khoản vay cá nhân | Người vay lần đầu | Đánh giá khả năng chi trả và so sánh các khoản vay | Lãi suất, phí và nghĩa vụ trả nợ có thể dẫn đến các kết luận khác nhau | Có ý nghĩa tài chính nhưng đã có nhiều sản phẩm tương tự |
| **Finfolio 2.0 — Portfolio Attribution & Risk Analytics** | Nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp | Quyết định có nên giữ nguyên hoặc tái phân bổ danh mục | Chỉ số tổng không giải thích tài sản nào tạo ra lợi nhuận và rủi ro; tác động của thay đổi phân bổ khó được đánh giá trước | **Được chọn** vì có task rõ, phù hợp quantitative finance và tận dụng được năng lực của nhóm |

## 2. Selected target user

Target user chính là **nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp**.

- **Specific:** không nhắm đến mọi nhà đầu tư; tập trung vào người đã có danh mục nhưng chưa có quy trình phân tích chuyên sâu.
- **Relevant:** người dùng trực tiếp gặp khó khăn khi xác định nguồn gốc lợi nhuận và rủi ro.
- **Reachable:** nhóm có thể phỏng vấn nhà đầu tư cá nhân trong mạng lưới gần và sử dụng test portfolio để kiểm tra cách họ đọc kết quả.
- **Task-based:** người dùng cần đánh giá danh mục trước khi quyết định giữ nguyên hoặc tái phân bổ.

Các nhà đầu tư chuyên nghiệp có thể hưởng lợi từ sản phẩm nhưng không phải target user chính của MVP vì nhu cầu và tiêu chuẩn của họ vượt quá phạm vi dự án bảy tuần.

## 3. User task or decision

Sau khi nhập danh mục, người dùng cần quyết định liệu có nên:

- tăng hoặc giảm tỷ trọng một tài sản;
- thêm một loại tài sản để đa dạng hóa;
- hoặc loại bỏ một vị thế tạo ra rủi ro không tương xứng.

Người dùng cần hiểu current allocation, nguồn đóng góp lợi nhuận/rủi ro và tác động của một phương án thay đổi tỷ trọng trước khi quyết định.

## 4. Specific difficulty

Người dùng có thể nhìn thấy giá trị, return hoặc volatility của toàn danh mục nhưng vẫn gặp bốn khó khăn:

1. Không biết tài sản nào thực sự tạo ra phần lớn lợi nhuận.
2. Không biết rủi ro đang tập trung ở vị thế, nhóm tài sản hoặc exposure nào.
3. Không thể đánh giá trước tác động của một thay đổi tỷ trọng.
4. Khó so sánh các tài sản có đặc tính và đơn vị rủi ro khác nhau trong cùng một danh mục.

## 5. Draft problem statement

> Nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế gặp khó khăn khi đánh giá mức độ và nguồn gốc rủi ro để quyết định giữ nguyên hay tái phân bổ, vì các chỉ số tổng hợp không cho thấy lợi nhuận và rủi ro đang tập trung ở vị thế nào, đồng thời họ khó kiểm tra trước tác động của một thay đổi tỷ trọng.

Problem statement tập trung vào **user, task, difficulty và context**; chưa đưa công nghệ hoặc giao diện vào định nghĩa vấn đề.

## 6. Finance and banking relevance

Đây là bài toán trực tiếp của quantitative finance, portfolio management và risk management:

- phân rã performance và risk contribution;
- đánh giá exposure và mức độ tập trung;
- so sánh current portfolio với một phương án thay đổi tỷ trọng;
- hỗ trợ quyết định giữ nguyên hoặc tái cân bằng danh mục.

Sản phẩm không chỉ hiển thị dữ liệu mà phải giúp người dùng giải thích và bảo vệ một quyết định tài chính.

## 7. Initial observation and assumptions to verify

Quan sát ban đầu từ Finfolio 1.0 là nhà đầu tư đã có thể nhìn thấy giá trị, return hoặc volatility của toàn danh mục, nhưng chưa được giải thích rõ vị thế nào tạo ra phần lớn lợi nhuận và rủi ro hoặc một thay đổi tỷ trọng sẽ tác động thế nào.

Đây là **giả thuyết vấn đề**, chưa phải kết luận đã được kiểm chứng. Nhóm cần xác nhận bằng phỏng vấn ngắn, quan sát quy trình hiện tại hoặc phản hồi từ người dùng mục tiêu.

## 8. Đóng góp cá nhân trong Week 1

Đóng góp được ghi theo **output cụ thể và vị trí có thể kiểm tra**, không chỉ theo tên vai trò.

| Thành viên | Đóng góp Week 1 | Output nhìn thấy được | Evidence location |
|---|---|---|---|
| Hoàng Khánh Linh | Xác định financial reasoning của hướng Finfolio 2.0; làm rõ difficulty và finance relevance | Mô tả difficulty, problem statement và lập luận portfolio/risk management | [Specific difficulty](#4-specific-difficulty), [Finance and banking relevance](#6-finance-and-banking-relevance) |
| Nguyễn Quỳnh Anh | Tổng hợp và kiểm tra tính nhất quán của các problem candidates; ghi nhận revision sau checkpoint | Bảng so sánh ba candidates và checkpoint decision | [Problem candidates](#1-problem-candidates), [Checkpoint 1 feedback and revision](#10-checkpoint-1-feedback-and-revision) |
| Lê Bảo An | Tổ chức repository và tích hợp các phần Week 1 thành README có thể review | Cấu trúc README, liên kết evidence và lịch sử cập nhật repository | [README](README.md), [Commit history](https://github.com/FTU-Legacy-63/G09/commits/main) |
| Trần Minh Ngọc | Rà soát bối cảnh Finfolio 1.0, giả thuyết ban đầu và các câu hỏi về information/data readiness | Initial observation và danh sách open questions cần kiểm chứng | [Initial observation](#7-initial-observation-and-assumptions-to-verify), [Open questions](#9-open-questions) |
| Nguyễn Ngọc Anh | Làm rõ target user, user task và nhu cầu diễn giải output đối với nhà đầu tư cá nhân | Target-user definition, user task và câu hỏi về cách trình bày contribution | [Selected target user](#2-selected-target-user), [User task or decision](#3-user-task-or-decision) |

Mỗi thành viên cần có khả năng giải thích phần mình phụ trách. Khi có issue, commit hoặc artefact riêng, nhóm sẽ bổ sung link tương ứng để tăng chất lượng individual evidence.

## 9. Open questions

1. Trong Finfolio 1.0, nhà đầu tư còn thiếu thông tin nào quan trọng nhất khi cân nhắc tái phân bổ danh mục?
2. Người dùng hiểu “return contribution” và “risk contribution” theo cách trình bày nào dễ nhất?
3. Nên dùng portfolio thật, portfolio giả lập hay cả hai trong demo và kiểm thử?
4. Instrument universe nhỏ nhất nào đủ để chứng minh problem và core user task?
5. Evidence nào cần thu thập để xác nhận difficulty này thực sự tồn tại với target users?

## 10. Checkpoint 1 feedback and revision

| Nội dung | Ghi nhận |
|---|---|
| Feedback received | Các vai trò cần rõ hơn và khối lượng công việc cần được phân chia hợp lý hơn giữa các thành viên. |
| Decision | **Change** — giữ nguyên hướng vấn đề nhưng sửa responsibility map. |
| Revision made | Mỗi thành viên được gắn với một output có thể kiểm tra và một dependency cụ thể thay vì chỉ có tên vai trò chung. |
| Remaining question | Cần bổ sung link issue/commit/file cho từng output khi công việc được đưa lên repository. |

---

# Week 2 — Product Direction

## Product decision summary

Week 2 kế thừa difficulty đã xác định ở Week 1:

> Người dùng không biết lợi nhuận và rủi ro đang tập trung ở đâu, vì vậy họ khó đánh giá có nên thay đổi phân bổ danh mục hay không.

| Thành phần | Quyết định hiện tại |
|---|---|
| Target user | Nhà đầu tư cá nhân đã có hiểu biết cơ bản về tài chính và đầu tư, muốn kiểm tra một danh mục nhỏ gồm nhiều loại tài sản trong instrument universe được hỗ trợ |
| Core task | Điền thông tin danh mục, kiểm tra risk/return allocation và thử một thay đổi tỷ trọng |
| Essential input | Asset/group label, identifier, giao dịch mua/bán, quantity, currency và proposed weights có giới hạn |
| Logic path | Validate → Calculate → Attribute → Compare → Explain |
| Main output | **Risk and Return Allocation Brief theo từng mã/nhóm tài sản** |
| Main measurement | CAGR và annualized volatility; contribution dùng cùng period và phương pháp được công bố |
| User action | Ghi nhận quyết định giữ nguyên hoặc tái phân bổ và lý do |

MVP chỉ giữ một flow hoàn chỉnh từ input đến một output chính. Overall score, user-defined scoring weights, account system, chatbot, portfolio optimization, Monte Carlo, stress testing, VaR/Expected Shortfall, futures và các dashboard phụ chưa thuộc core MVP.

## MVP cut-scope answers

| Câu hỏi | Quyết định |
|---|---|
| Nếu chỉ giữ một output, output nào quan trọng nhất? | Risk and Return Allocation Brief theo từng mã/nhóm, kèm một before/after comparison |
| Feature nào không cần cho core task? | Overall score, recommendation engine, chatbot, account, optimization và forecasting |
| Có thể dùng sample data thay vì API không? | Có. Sample portfolio và static historical data là fallback chính thức |
| Có thể chỉ hỗ trợ một user segment không? | Có. Chỉ hỗ trợ nhà đầu tư cá nhân đã có kiến thức tài chính cơ bản |
| Có thể giới hạn asset universe không? | Có. Chỉ nhận các tài sản có daily price, currency và lịch dữ liệu tương thích |

Chi tiết lập luận sản phẩm nằm trong [PROJECT_PROPOSAL.md](docs/PROJECT_PROPOSAL.md). Chuỗi giải pháp, MVP, fallback, technical route và responsibility map nằm trong [SOLUTION_STRUCTURE.md](docs/SOLUTION_STRUCTURE.md).

## Checkpoint 2 revision record

Phần này được cập nhật sau Checkpoint 2 để lưu lại chu trình PBL.

| Nội dung | Ghi nhận |
|---|---|
| Feedback received | Output sau khi dùng sản phẩm chưa đủ rõ; phạm vi đang lớn; nếu dùng overall score thì phải giải thích tiêu chí, thang điểm, trọng số và liên hệ với risk tolerance |
| Decision | **Simplify** |
| Revision made | Bỏ overall score khỏi core MVP; khóa một output chính là Risk and Return Allocation Brief; công bố metric, formula, assumptions và rule tái phân bổ; đưa account, chatbot, optimization và dashboard phụ ra ngoài MVP |
| Reason | Một output truy nguyên và kiểm thử được tạo giá trị rõ hơn một điểm tổng hợp dựa trên trọng số chưa được kiểm chứng |

---

# Week 3 — Information and Evidence Readiness

Week 3 không mở rộng feature. Nhóm kiểm tra liệu input, source, assumptions và sample hiện tại có đủ để tạo output MVP một cách truy nguyên hay chưa.

## Evidence package

| Evidence | Review purpose |
| --- | --- |
| [Input Dictionary](docs/INPUT_DICTIONARY.md) | Meaning, type, unit, validation rule, source và output use |
| [Source Register](docs/SOURCE_REGISTER.md) | Source → exact product use → convention → limitation |
| [Assumptions and Limitations](docs/ASSUMPTIONS.md) | Simplification nào ảnh hưởng đến cách đọc output |
| [Sample Input-to-Output Case](docs/SAMPLE_INPUT_OUTPUT.md) | Trace một case từ holdings và market data đến output dự kiến |
| [Data Structure and Flow](docs/DATA_STRUCTURE_AND_FLOW.md) | Canonical entities, normalization, calculation path và failure paths |
| [Validation and Early Logic Test](docs/VALIDATION_AND_EARLY_TEST.md) | Validation rules, expected arithmetic results và reconciliation |
| [Sample data package](data/README.md) | Holdings giả lập, real market observations, config và provenance |
| [Owner and Status](docs/WEEK3_STATUS.md) | Owner, readiness, checkpoint questions và revision record |

## Current readiness decision

Package hiện **ready for Checkpoint 3**, nhưng chưa phải production-ready methodology:

- core input đã được tách khỏi benchmark/market cap mang tính optional hoặc contextual;
- sample holdings do nhóm tạo, còn price/FX observations là dữ liệu thực được đóng băng trong repo;
- source prototype có coverage gaps và chưa có license/SLA cho production;
- fixture 10 ngày chỉ dùng để test data flow và arithmetic, không dùng để diễn giải CAGR hoặc ra quyết định đầu tư;
- feedback Checkpoint 3 và revision tương ứng vẫn phải được bổ sung sau buổi review.
