# Finfolio 2.0 — Portfolio Attribution & Risk Analytics

Finfolio 2.0 giúp nhà đầu tư cá nhân đã có kiến thức tài chính hiểu lợi nhuận và rủi ro đang tập trung ở đâu trong danh mục cổ phiếu, so sánh kết quả với benchmark và xem một phương án phân bổ tham khảo do mô hình tối ưu hóa tạo ra trước khi tự quyết định có tái phân bổ hay không.

## Repository evidence

| Giai đoạn | File evidence chính |
| --- | --- |
| Week 1 | [Problem Direction](docs/WEEK1.md) |
| Week 2 | [Product Direction & MVP](docs/WEEK2.md) |
| Week 3 | [Information & Data Readiness](docs/WEEK3.md) |
| Week 4 | [Financial Logic & Expected Results](docs/WEEK4.md) |
| Week 5 | [MVP Feature, Flow & Implementation Readiness](docs/WEEK5.md) |

## Team members and roles

| Thành viên | MSSV | Vai trò | Trách nhiệm chính |
| --- | ---: | --- | --- |
| Hoàng Khánh Linh | 2412380024 | Product Owner | Phạm vi sản phẩm, logic tài chính, benchmark, giả định tối ưu hóa và chấp nhận phương pháp |
| Nguyễn Quỳnh Anh | 2413380010 | Product Manager | Yêu cầu, acceptance criteria, test scenario, revision và theo dõi trạng thái |
| Lê Bảo An | 2412380002 | Lead Developer | Kiến trúc, pipeline dữ liệu–tính toán, tích hợp benchmark/optimizer, kiểm thử và triển khai |
| Trần Minh Ngọc | 2412380036 | Business Analyst | Yêu cầu dữ liệu, nguồn benchmark, phân loại ngành/factor, data dictionary và giới hạn dữ liệu |
| Nguyễn Ngọc Anh | 2413380008 | UI/UX Designer | User flow, cấu trúc thông tin, trực quan attribution và so sánh current–optimized |

## Current product scope

Core MVP chỉ hỗ trợ **cổ phiếu** và một flow hoàn chỉnh: nhập danh mục → kiểm tra dữ liệu → phân tích danh mục hiện tại → phân rã return/risk → so sánh benchmark → tối ưu hóa có ràng buộc → so sánh current–optimized → giải thích kết quả để người dùng tự quyết định. Kết quả tối ưu hóa là phương án phân bổ tham khảo, không phải lời khuyên đầu tư.

Final product dự kiến mở rộng sang nhiều asset class và Monte Carlo. Sample data trong [`data/`](data/README.md) chỉ là fixture phục vụ kiểm thử/fallback, không phải hành trình chính của người dùng.
