# Finfolio 2.0 — Portfolio Attribution & Risk Analytics

> Finfolio 2.0 giúp nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp hiểu lợi nhuận và rủi ro đến từ đâu, từ đó đưa ra quyết định phân bổ dựa trên bằng chứng định lượng thay vì chỉ nhìn vào các chỉ số tổng hợp.

## Repository evidence

| Giai đoạn | Bằng chứng |
|---|---|
| Week 1 | Problem candidates, target user, user task, problem statement, đóng góp cá nhân và revision sau checkpoint trong README này |
| Week 2 | [Project Proposal](docs/PROJECT_PROPOSAL.md) |
| Week 2 | [Solution Structure](docs/SOLUTION_STRUCTURE.md) |

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

## 8. Open questions

1. Trong Finfolio 1.0, nhà đầu tư còn thiếu thông tin nào quan trọng nhất khi cân nhắc tái phân bổ danh mục?
2. Người dùng hiểu “return contribution” và “risk contribution” theo cách trình bày nào dễ nhất?
3. Nên dùng portfolio thật, portfolio giả lập hay cả hai trong demo và kiểm thử?
4. Instrument universe nhỏ nhất nào đủ để chứng minh problem và core user task?
5. Evidence nào cần thu thập để xác nhận difficulty này thực sự tồn tại với target users?

## 9. Checkpoint 1 feedback and revision

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
| Target user | Nhà đầu tư cá nhân đang tự theo dõi một danh mục nhỏ gồm nhiều vị thế nhưng chưa sử dụng hệ thống portfolio analytics chuyên nghiệp |
| Problem | Chỉ số tổng không giải thích nguồn tập trung lợi nhuận/rủi ro hoặc tác động của một thay đổi tỷ trọng |
| User task | Đánh giá danh mục hiện tại và so sánh một phương án tái phân bổ |
| Desired outcome | Người dùng có thể giải thích quyết định giữ nguyên hoặc điều chỉnh danh mục bằng kết quả truy nguyên được |
| Main output | **Portfolio Decision Brief** |
| Core process | Calculate → attribute → compare → explain |
| Product pattern | Dashboard application, phù hợp để trình bày các kết quả liên kết trong Decision Brief |
| Core MVP | Allocation + return/risk contribution + concentration insight + một so sánh before/after |

VaR/Expected Shortfall, stress testing, Monte Carlo và index futures không còn là yêu cầu bắt buộc của core MVP. Chúng chỉ được bổ sung nếu Week 3–4 chứng minh được nhu cầu, dữ liệu, logic và khả năng kiểm thử.

Chi tiết lập luận sản phẩm nằm trong [PROJECT_PROPOSAL.md](docs/PROJECT_PROPOSAL.md). Chuỗi giải pháp, MVP, fallback, technical route và responsibility map nằm trong [SOLUTION_STRUCTURE.md](docs/SOLUTION_STRUCTURE.md).

## Checkpoint 2 revision record

Phần này được cập nhật sau Checkpoint 2 để lưu lại chu trình PBL.

| Nội dung | Ghi nhận |
|---|---|
| Feedback received | _Chưa cập nhật_ |
| Decision | _Keep / Change / Simplify / Restart_ |
| Revision made | _Chưa cập nhật_ |
| Reason | _Chưa cập nhật_ |

## Responsible use of AI

AI được sử dụng để hỗ trợ tổ chức và biên tập tài liệu theo cấu trúc Week 1–2. Nhóm chịu trách nhiệm kiểm tra mọi giả định, công thức, nguồn dữ liệu và tuyên bố về người dùng; chỉ các artefact thực sự có trong repository mới được dùng làm evidence chính thức.
