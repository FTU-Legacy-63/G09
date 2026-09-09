# Week 4 — Financial Logic Specification

Tài liệu này khóa **financial logic** của Finfolio 2.0: benchmark, return attribution, risk attribution, optimization, và data-sufficiency policy. Đây là file được hứa ở [SOLUTION_STRUCTURE.md §10](SOLUTION_STRUCTURE.md) (owner: Hoàng Khánh Linh) và là câu trả lời cho câu hỏi trung tâm của Week 4:

> Input đã xác định được chuyển thành output bằng logic tài chính nào, và logic đó có kiểm tra được không?

Mọi công thức dưới đây đều đi kèm **reconciliation identity** — một đẳng thức phải đúng trong dung sai số học, dùng làm acceptance test trong [VALIDATION_AND_EARLY_TEST.md](VALIDATION_AND_EARLY_TEST.md).

---

## 0. Bốn quyết định khóa ở Week 4

| # | Quyết định Week 3 để lại | Quyết định Week 4 | Ảnh hưởng |
| --- | --- | --- | --- |
| D1 | Benchmark = Deferred | **VN-Index là benchmark chính thức**; kiến trúc benchmark ba tầng được định nghĩa ở §2 | Mở khóa toàn bộ Brinson attribution |
| D2 | Market cap = Contextual, chưa có rule phân loại | **Dùng bộ chỉ số HOSE (VN30 / VNMidcap / VNSmallcap)** làm size rule, point-in-time tại `data_start` (§5.2) | Size trở thành attribution dimension có nguồn, không phải threshold tự đặt |
| D3 | Minimum horizon chưa khóa | **Data-sufficiency policy** theo từng metric (§8) | Chặn việc annualize trên cửa sổ quá ngắn |
| D4 | Optimization nằm ngoài core MVP | **Markowitz vào core MVP** như bước 5 của logic path; ghi nhận là scope change có điều kiện (§7) | Đảo ngược một phần revision Checkpoint 2 — xem record trong README |

---

## 1. Logic path sau Week 4

```text
Validate → Calculate → Attribute (return) → Attribute (risk) → Optimize → Compare → Explain
```

So với Week 2, hai bước được tách và một bước được thêm:

- `Attribute` tách thành **return attribution** (§3–§5, đo *quyết định nào tạo ra lợi nhuận*) và **risk attribution** (§6, đo *quyết định nào tạo ra biến động*);
- `Optimize` (§7) được thêm và chỉ chạy khi data-sufficiency policy ở §8 cho phép.

Nguyên tắc bắt buộc xuyên suốt: **mọi module dùng chung một return matrix, một horizon, một base currency, một annualization factor và một covariance estimator.** Nếu attribution dùng Σ₁ còn optimizer dùng Σ₂ thì hai tab trong cùng một brief sẽ mâu thuẫn nhau. Đây là integration rule, không phải khuyến nghị.

---

## 2. Kiến trúc benchmark

### 2.1 Vấn đề phải giải

Brinson-Fachler cần `benchmark weight` và `benchmark return` cho **từng segment**. VN-Index chỉ là chỉ số vốn hóa của cổ phiếu niêm yết HOSE, trong khi danh mục mục tiêu là **đa tài sản** (VN equity + gold proxy ETF + cryptoasset). Nếu lấy thẳng VN-Index làm benchmark cho toàn danh mục thì gold và crypto không có benchmark weight.

### 2.2 Quyết định

VN-Index là benchmark, và **trọng số benchmark của các asset class ngoài VN equity bằng 0**. Đây không phải cách né vấn đề: nó phát biểu đúng một quyết định đầu tư có thật — *nhà đầu tư đã chọn rời khỏi thị trường cổ phiếu Việt Nam để nắm vàng và crypto*, và toàn bộ hệ quả của lựa chọn đó phải hiện ra ở **allocation effect**.

| Tầng | Segment | Benchmark weight | Benchmark return |
| --- | --- | --- | --- |
| Level 0 | Vietnam equity | 100% | VN-Index period return `B` |
| Level 0 | Gold proxy ETF, Cryptoasset, Cash | 0% | Không tồn tại → dùng convention §3.3 |
| Level 1 | GICS Level-1 sector trong VN equity sleeve | Tỷ trọng sector trong VN-Index tại `data_start` | Sector sub-index return |
| Level 2 | Từng mã trong sector | Tỷ trọng free-float mcap của mã trong VN-Index | Không cần — selection được phân rã xuống mã |

### 2.3 Nguồn dữ liệu benchmark và fallback

| Item | Nguồn chính | Fallback | Trạng thái |
| --- | --- | --- | --- |
| VN-Index daily close | Data provider hỗ trợ mã `VNINDEX` (SSI FastConnect index list, thư viện `vnstock`) | ETF proxy `E1VFVN30.VN` — **phải gắn nhãn VN30 proxy, không được gọi là VN-Index** | Cần chốt trước implementation |
| Sector benchmark return | Tự dựng sub-index từ constituent VN-Index (free-float mcap weighted, cùng công thức HOSE §2.4) | Bộ chỉ số ngành VNAllshare của HOSE: `VNFIN`, `VNIND`, `VNREAL`, `VNMAT`, `VNENE`, `VNCONS`, `VNCOND`, `VNHEAL`, `VNIT`, `VNUTI` | Fallback là **proxy**: universe VNAllshare rộng hơn VN-Index → phải disclose |
| Sector của từng mã | **GICS Level 1** (chuẩn mà HOSE-Index 4.0 dùng, review 6 tháng/lần) | Ánh xạ thủ công có lưu link công bố | Không được tự gán ngành |
| Constituent + free-float mcap | Công bố rổ chỉ số của HOSE | — | Cần snapshot tại `data_start` |

> ⚠ **Rủi ro đã biết:** Week 3 ghi nhận `^VNINDEX` và `^VN30` **không resolve** qua adapter Yahoo hiện tại ([SOURCE_USE_MAP.md](SOURCE_USE_MAP.md)). Vì vậy chuyển sang benchmark VN-Index **bắt buộc phải đổi hoặc bổ sung data source**. Đây là dependency chặn, không phải việc phụ. Nếu đến hạn implementation vẫn chưa có nguồn VN-Index, hệ thống chạy fallback `E1VFVN30.VN` và **mọi output phải đổi nhãn thành "VN30 ETF proxy benchmark"**, không được im lặng thay thế.

### 2.4 Công thức chỉ số tham chiếu

Index HOSE là free-float market-cap weighted có capping:

```text
Index_t = CMV_t / Divisor_t          với  CMV_t = Σ_i ( p_i,t × s_i × f_i × c_i )
```

`p` giá, `s` số cổ phiếu lưu hành, `f` free-float ratio, `c` capping factor. Khi nhóm tự dựng sector sub-index thì phải dùng **cùng `f` và `c`**, nếu không sector return sẽ không cộng lại thành VN-Index return.

**Reconciliation R1:** `Σ_sector ( W_sector × b_sector ) = B` trong dung sai 1 bp. Nếu sai, dữ liệu benchmark không nhất quán và attribution không được phép chạy.

---

## 3. Return attribution — Brinson-Fachler

### 3.1 Chọn biến thể: Brinson-Fachler, không phải BHB gốc

Nhóm dùng **Brinson-Fachler (1985)**, không dùng công thức allocation của BHB gốc.

| | Allocation |
| --- | --- |
| BHB gốc | `A_i = (w_i − W_i) × b_i` |
| **Brinson-Fachler (dùng)** | `A_i = (w_i − W_i) × (b_i − B)` |

Lý do: công thức BHB thưởng cho *mọi* vị thế overweight có return dương, kể cả khi ngành đó vẫn thua benchmark tổng thể. BF trừ đi `B` nên chỉ ghi nhận allocation là tốt khi overweight vào ngành **thắng benchmark**. Đây là hành vi đúng với quyết định của nhà đầu tư. Brinson-Hood-Beebower vẫn là khung ba hiệu ứng (allocation / selection / interaction) mà nhóm giữ nguyên; chỉ riêng dạng đại số của allocation là theo Fachler.

### 3.2 Ba hiệu ứng

Với segment `i`, `w` = portfolio weight, `W` = benchmark weight, `r` = portfolio segment return, `b` = benchmark segment return, `B` = tổng benchmark return:

```text
Allocation_i   = (w_i − W_i) × (b_i − B)
Selection_i    =  W_i        × (r_i − b_i)
Interaction_i  = (w_i − W_i) × (r_i − b_i)
```

**Reconciliation R2:** `Σ_i (Allocation_i + Selection_i + Interaction_i) = R_p − B`, dung sai 0.5 bp.

Nhóm **báo cáo interaction tách riêng**, không gộp vào selection. Lý do: interaction là số duy nhất trả lời câu hỏi *"bạn có đặt tiền lớn vào đúng chỗ bạn chọn mã giỏi không?"*, và với danh mục cá nhân tập trung thì nó thường không nhỏ. Nếu người dùng thấy ba cột khó đọc, UI có thể gộp `Selection + Interaction` thành một cột "security decisions", nhưng số gốc ba cột vẫn phải có trong brief.

### 3.3 Convention cho segment ngoài benchmark — **lỗ hổng đã bịt**

Khi `W_i = 0` (gold, crypto, hoặc cổ phiếu HNX/UPCOM không nằm trong VN-Index), `b_i` **không tồn tại**. Nếu không công bố convention thì kết quả tùy thuộc cách code, và đây là nguồn sai lệch âm thầm phổ biến nhất của Brinson.

**Convention khóa: `b_i := r_i` khi `W_i = 0`.**

Hệ quả: `Selection_i = 0`, `Interaction_i = 0`, và

```text
Allocation_i = w_i × (r_i − B)
```

Toàn bộ kết quả của một vị thế ngoài benchmark được ghi nhận là **quyết định phân bổ**, không phải kỹ năng chọn mã. Điều này đúng về mặt kinh tế: không có benchmark thì không có gì để "chọn giỏi hơn".

Đối xứng, khi `w_i = 0` nhưng `W_i > 0` (ngành có trong VN-Index mà danh mục không nắm), đặt `r_i := b_i`, cho `Selection_i = Interaction_i = 0` và `Allocation_i = (0 − W_i)(b_i − B)`. Đây là cách hiệu ứng của việc **không nắm một ngành** được đo.

### 3.4 Nesting — ba tầng ghép vào nhau thế nào

Attribution được chạy hai lần và ghép bằng một đẳng thức, không phải bằng cách cộng dồn tùy tiện.

**Level 0 (asset class).** Segment = VN equity / Gold / Crypto / Cash. Vì benchmark chỉ có một segment khác 0, đẳng thức Level 0 rút gọn về dạng đọc được:

```text
R_p − B  =  Σ_(ngoài benchmark) w_i × (r_i − B)   +   w_equity × (r_equity − B)
              └── hiệu ứng rời khỏi VN equity ──┘      └── sleeve active return ──┘
```

**Level 1 (sector trong equity sleeve).** Chạy BF đầy đủ giữa equity sleeve (trọng số chuẩn hóa về 100%) và VN-Index. Kết quả cho `r_equity − B`.

**Đẳng thức nối hai tầng — Reconciliation R3:**

```text
w_equity × Σ_sector (A_sector + S_sector + I_sector)  =  Level-0 (Selection + Interaction) của VN equity
```

Nghĩa là: attribution ngành **không cộng thẳng** vào attribution asset class — nó phải được **nhân với tỷ trọng sleeve** trước. Bỏ qua bước scaling này là lỗi số học thường gặp; R3 là test bắt nó.

**Level 2 (mã trong sector).** Selection của một ngành được phân rã xuống từng mã:

```text
Selection_sector = W_sector × Σ_(mã j ∈ sector) [ v_j × (r_j − b_sector) ]
```

với `v_j` là trọng số của mã `j` **trong ngành đó của danh mục** (`Σ_j v_j = 1`).

**Reconciliation R4:** tổng đóng góp mã trong một ngành = `Selection_sector` của ngành đó.

---

## 4. Multi-period linking — **lỗ hổng đã bịt**

Hiệu ứng Brinson là **arithmetic**, còn return thì **compound**. Cộng thẳng excess return của các kỳ con sẽ luôn lệch so với excess return của cả kỳ. Không phải sai số làm tròn — là sai về bản chất.

Ví dụ kiểm chứng được (2 kỳ):

| Kỳ | `R_p` | `B` | Excess |
| --- | ---: | ---: | ---: |
| 1 | +3.00% | +2.00% | +1.00 pp |
| 2 | −4.00% | −3.80% | −0.20 pp |
| **Compound** | **−1.1200%** | **−1.8760%** | **+0.7560 pp** |
| Cộng thẳng | | | +0.8000 pp |
| **Residual** | | | **+4.40 bp** |

Nhóm dùng **Cariño (1999) logarithmic smoothing**:

```text
K   = [ ln(1 + R_p) − ln(1 + B) ] / (R_p − B)            (toàn kỳ)
k_t = [ ln(1 + R_p,t) − ln(1 + B_t) ] / (R_p,t − B_t)    (từng kỳ con)
Effect_adjusted(i,t) = Effect(i,t) × k_t / K
```

Khi mẫu số tiến về 0 (`R = B`) thì đặt hệ số = 1.

Với ví dụ trên: `K = 1.0152128`, `k = [0.975617, 1.040583]`, excess sau hiệu chỉnh = `[+0.9610 pp, −0.2050 pp]`, tổng = **+0.7560 pp**, residual **0.00 bp**.

**Reconciliation R5:** `Σ_t Σ_i Effect_adjusted(i,t) = R_p − B` toàn kỳ, dung sai 0.5 bp.

Cấu hình khóa: `attribution_frequency = monthly` (kỳ con là tháng), `linking_method = carino`. Nếu horizon ngắn hơn 2 kỳ con thì linking bị bỏ qua và brief hiển thị "single-period attribution".

---

## 5. Các chiều phân tích bổ sung

### 5.1 Exchange factor — tách làm hai nghĩa

Nhóm dùng từ "exchange factor" cho hai thứ khác nhau; tài liệu tách rõ để tránh nhầm.

**(a) Venue — sàn niêm yết (HOSE / HNX / UPCOM).** Là một **grouping dimension**, chạy cùng bộ công thức §3. VN-Index chỉ phủ HOSE, nên mọi mã HNX/UPCOM có `W = 0` và rơi vào convention §3.3 — toàn bộ thành allocation effect. Đây là cách trả lời câu "việc mua ngoài HOSE đã đóng góp gì".

**(b) Currency — hiệu ứng tỷ giá.** Với tài sản định giá USD, return theo VND phân rã:

```text
(1 + R_base) = (1 + R_local) × (1 + R_fx)
R_base = R_local + R_fx + (R_local × R_fx)
         └local┘  └ fx ┘   └── cross ──┘
```

Đóng góp cấp danh mục: `Currency_i = w_i × (R_fx,i + R_local,i × R_fx,i)`.

**Reconciliation R6:** `Σ_i w_i × R_base,i = Σ_i w_i × (R_local,i + R_fx,i + cross_i)` — đúng theo định nghĩa, dùng để bắt lỗi orientation tỷ giá (VND/USD bị lật ngược là lỗi hay gặp nhất ở bước này).

> **Đây KHÔNG phải mô hình Karnosky-Singer.** Karnosky-Singer tách currency management effect bằng cách dùng hedged return và **forward premium / interest-rate differential**. Nhóm không có nguồn forward rate VND/USD có license, và thị trường forward VND cũng kém thanh khoản. Vì vậy nhóm dùng phân rã naive ở trên và **phải ghi rõ trong brief**: hiệu ứng currency đo được là *currency exposure*, không phải *currency management skill*, vì danh mục không có vị thế phòng hộ nào để đánh giá.

### 5.2 Market cap — quy tắc phân loại (câu hỏi nhóm chưa rõ)

Không tự đặt ngưỡng VND. Nhóm dùng **chính bộ chỉ số quy mô của HOSE**, vì đó là quy tắc do thị trường công bố, có ground rules công khai và được review định kỳ:

| Size bucket | Định nghĩa theo HOSE-Index Ground Rules 4.0 |
| --- | --- |
| **Large cap** | Là cấu phần **VN30** — 30 mã dẫn đầu về free-float market cap và thanh khoản |
| **Mid cap** | Là cấu phần **VNMidcap** — 70 mã kế tiếp trong VNAllshare sau khi loại VN30 (VN30 + VNMidcap = VN100) |
| **Small cap** | Thuộc **VNSmallcap** — phần còn lại của VNAllshare sau khi loại VN100 |

Điều kiện sàng lọc đi kèm của HOSE (giữ nguyên, không sửa): free-float ≥ 10%, turnover ratio ≥ 0.05%, loại mã có KLGD < 300.000 cổ phiếu hoặc GTGD < 30 tỷ VND.

**Rule bắt buộc — point-in-time.** Danh sách cấu phần được **chụp tại `data_start` và đóng băng** cho cả cửa sổ phân tích, kèm `effective_date` của kỳ review. Điều này sửa trực tiếp limitation của Week 3 ("market cap là latest metadata, không point-in-time aligned"). Dùng rổ chỉ số *hiện tại* để phân loại một giai đoạn *quá khứ* là look-ahead bias.

**Fallback khi không lấy được danh sách cấu phần:** xếp universe theo free-float market cap giảm dần và cắt theo **cumulative coverage** 0–70% = Large, 70–90% = Mid, 90–100% = Small (quy ước MSCI/FTSE). Fallback phải gắn nhãn `size_rule = coverage_proxy`, không được trình bày như phân loại của HOSE.

**Size dùng để làm gì.** Vì VN30/VNMidcap/VNSmallcap đều là tập con của VN-Index, benchmark weight và benchmark return theo từng size bucket đều tính được → size là một **attribution dimension hợp lệ**, chạy đúng công thức §3, trả lời "việc nghiêng về large cap đã đóng góp bao nhiêu".

> ⚠ Trên fixture Week 3, cả FPT và HPG đều là VN30 → size attribution suy biến (100% large cap, không có gì để so). Muốn chiều size có ý nghĩa, universe phải mở rộng sang ít nhất một mã mid/small cap. Đây là next step cho data workstream, không phải lỗi công thức.

### 5.3 Thứ tự ưu tiên các chiều

Ba chiều (sector, size, venue) **không được chạy đồng thời trong một bảng** — hiệu ứng sẽ bị đếm hai lần. Brief hiển thị **sector là chiều chính**, còn size và venue là hai tab thay thế, mỗi tab là một phân rã độc lập của cùng một `R_p − B`.

**Reconciliation R7:** tổng ba hiệu ứng của tab sector, tab size và tab venue **đều bằng** `R_p − B`. Ba con đường khác nhau, một đích đến.

---

## 6. Risk attribution — Euler allocation

### 6.1 Hai loại rủi ro, không phải một

Đây là **lỗ hổng nhất quán lớn nhất** của logic hiện tại: return attribution đo **active return** (so với VN-Index), trong khi risk attribution của Week 3 đo **total volatility** (không có benchmark). Hai bảng cạnh nhau trong cùng một brief nhưng trả lời hai câu hỏi khác nhau, và người đọc sẽ mặc định chúng khớp nhau.

Nhóm giữ cả hai và **gọi đúng tên**:

| | Total risk | Active risk (tracking error) |
| --- | --- | --- |
| Vector | `w` (portfolio weights) | `a = w − W` (active weights) |
| Đại lượng | `σ_p = √(wᵀΣw)` | `TE = √(aᵀΣa)` |
| Marginal | `MCR_i = (Σw)_i / σ_p` | `MCTE_i = (Σa)_i / TE` |
| Contribution | `RC_i = w_i × MCR_i` | `ATC_i = a_i × MCTE_i` |
| Trả lời | "Danh mục dao động vì ai?" | "Danh mục lệch khỏi VN-Index vì ai?" |
| Đi cùng | CAGR, volatility | Brinson attribution |

Cả hai đều dựa trên tính thuần nhất bậc 1 của độ lệch chuẩn, nên Euler cho phân rã **cộng đúng bằng tổng**:

**Reconciliation R8:** `Σ_i RC_i = σ_p` và `Σ_i ATC_i = TE`, dung sai 1e-8.

### 6.2 Tính cộng theo nhóm

Euler contribution cộng được theo bất kỳ cách gộp nào, **chính xác tuyệt đối, không phải xấp xỉ**:

```text
RC_group = Σ_(i ∈ group) RC_i
```

Nhờ đó risk attribution dùng đúng bộ nhóm với return attribution (asset class → sector → mã → size → venue) mà không cần công thức riêng.

Kiểm chứng trên fixture Week 3 đã commit:

| Nhóm | RC | Risk share | Portfolio weight | Risk / weight |
| --- | ---: | ---: | ---: | ---: |
| FPT.VN (IT) | 10.0979 pp | 45.9275% | 35.6420% | **1.2886** |
| HPG.VN (Materials) | 1.8415 pp | 8.3756% | 23.6598% | 0.3540 |
| GLD | 4.9226 pp | 22.3891% | 24.7009% | 0.9064 |
| BTC-USD | 5.1246 pp | 23.3078% | 15.9973% | **1.4570** |
| *Vietnam equity* | *11.9394 pp* | *54.3031%* | *59.3018%* | *0.9157* |
| **Tổng** | **21.9866 pp** | **100.0000%** | **100.0000%** | — |

Cột **risk / weight** là concentration insight của brief: giá trị > 1 nghĩa là vị thế đang tiêu tốn nhiều rủi ro hơn phần vốn nó chiếm. BTC-USD ở 1.4570 là mức lệch lớn nhất dù chỉ chiếm 16% giá trị. Đây là câu người dùng hành động được, và nó rơi ra trực tiếp từ Euler chứ không cần thêm scoring.

### 6.3 Ước lượng covariance

| Tham số | Quyết định |
| --- | --- |
| Estimator mặc định | **Ledoit-Wolf shrinkage**; sample covariance (`ddof=1`) chỉ hiển thị để đối chiếu |
| Lý do | Sample covariance kém điều kiện khi `T` không lớn hơn `N` nhiều lần; shrinkage kéo về mục tiêu có cấu trúc, giảm phương sai ước lượng |
| Annualization | Nhân `252` cho ma trận covariance daily (tương đương `√252` cho độ lệch chuẩn) |
| Điều kiện chạy | `T ≥ max(120, 10 × N)` — xem §8 |
| Kiểm tra bắt buộc | Ma trận phải positive semi-definite; báo condition number trong evidence panel |

### 6.4 Giới hạn phải công bố

- Euler là đại lượng **biên**: `RC_i` cho biết ảnh hưởng của một thay đổi *nhỏ* quanh trọng số hiện tại, không phải rủi ro mất đi nếu bán sạch vị thế.
- Độ lệch chuẩn coi upside và downside như nhau, và **giả định đuôi mỏng**. Với BTC-USD, giả định này sai theo hướng đánh giá thấp rủi ro. Brief phải nói câu này.
- `RC` dùng **start weights** (static-weight estimate), không phải realized path của buy-and-hold — giữ nguyên assumption A09 của Week 3.
- Đây là rủi ro **đã đo được trong quá khứ**, không phải dự báo.

---

## 7. Optimization — Markowitz

### 7.1 Ghi nhận scope change

Week 2 đã chốt "portfolio optimization và automatic best weights" nằm ngoài core MVP, sau feedback Checkpoint 2 rằng phạm vi đang quá lớn. Week 4 **đưa optimization trở lại core MVP**. Điều kiện để việc đảo ngược này không lặp lại đúng vấn đề cũ:

1. Optimizer **không tạo output mới** — nó thêm hai điểm tham chiếu vào chính Risk and Return Allocation Brief đã có.
2. Optimizer **không đưa ra khuyến nghị**. Không có nhãn "danh mục tốt nhất", không có nút "áp dụng".
3. Optimizer **dùng lại nguyên bộ Σ, horizon, base currency, bounds** của §6 — không có tham số riêng.
4. Optimizer **có fallback tắt được**: nếu §8 không đủ dữ liệu, tab frontier ẩn đi và brief vẫn hoàn chỉnh.

### 7.2 Bài toán

```text
min_w   wᵀ Σ w
s.t.    Σ_i w_i = 1
        w_i ≥ 0                       (long-only — bắt buộc bởi assumption A01)
        min_weight_i ≤ w_i ≤ max_weight_i
        Σ_(i ∈ class) w_i ≤ cap_class  (ví dụ crypto ≤ 20%)
        μᵀw ≥ μ_target                 (chỉ khi dựng frontier)
        Σ_i |w_i − w_current,i| ≤ τ    (turnover, tùy chọn)
```

Ba điểm được báo cáo: **GMV** (min variance toàn cục), **max-Sharpe** với `(μᵀw − r_f) / √(wᵀΣw)`, và **vị trí hiện tại của người dùng** trên cùng mặt phẳng σ–μ, cộng với vị thế proposed từ bước Compare.

### 7.3 Tại sao long-only là ràng buộc bắt buộc, không phải tùy chọn

Chạy nghiệm giải tích không ràng buộc trên một ví dụ minh họa 3 tài sản (σ = 20% / 30% / 60%, ρ₁₂ = 0.10, ρ₁₃ = 0.20, ρ₂₃ = 0.30, μ = 8% / 5% / 25%, `r_f` = 4%):

| Danh mục | Equity | Gold | Crypto | σ | μ | Sharpe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GMV không ràng buộc | 71.54% | 29.23% | **−0.77%** | 17.3737% | 6.9923% | 0.1722 |
| Max-Sharpe không ràng buộc | 70.08% | **−28.53%** | 58.45% | 38.6290% | 18.7927% | 0.3829 |
| GMV long-only, crypto ≤ 20%, mỗi mã ≤ 60% | 60.00% | 38.95% | 1.05% | 17.7882% | 7.0105% | 0.1697 |

Nghiệm không ràng buộc yêu cầu **bán khống 28.53% gold** — vi phạm trực tiếp assumption A01 và nằm ngoài khả năng của target user. Đây là lý do ràng buộc `w ≥ 0` và các cap theo asset class được ghi vào đặc tả, không để tùy chọn.

### 7.4 Ước lượng expected return — rủi ro lớn nhất của module này

Nghiệm Markowitz cực kỳ nhạy với `μ`, trong khi `μ` là đại lượng khó ước lượng nhất. Kiểm chứng trên chính ví dụ trên, chỉ thay đổi `μ` của crypto:

| μ crypto | Equity | Gold | Crypto |
| ---: | ---: | ---: | ---: |
| 23% | 72.99% | −24.81% | 51.82% |
| 25% | 70.08% | −28.53% | 58.45% |
| 27% | 67.15% | −32.30% | 65.15% |

Thay đổi 2 điểm phần trăm ở một input làm trọng số crypto dịch **13.3 điểm phần trăm**. Vì vậy:

| Estimator | Vai trò |
| --- | --- |
| Historical mean | **Mặc định, gắn nhãn "high estimation error"** |
| James-Stein shrinkage về grand mean | Tùy chọn, giảm nhiễu |
| **Reverse-optimised equilibrium return** từ trọng số VN-Index (`μ_eq = λΣw_bmk`) | Khuyến nghị — nối thẳng optimizer với benchmark đã chọn ở §2, và cho ra nghiệm gần benchmark thay vì nghiệm cực đoan |

Brief **phải hiển thị nghiệm dưới ít nhất hai estimator**. Một frontier duy nhất trình bày như sự thật là cách nhanh nhất để module này thành thứ mà Checkpoint 2 đã phê bình.

### 7.5 Test nội tại của optimizer

**Reconciliation R9 (GMV property):** tại nghiệm GMV không ràng buộc, **marginal risk contribution của mọi tài sản phải bằng nhau**. Kiểm chứng trên ví dụ §7.3: `MCR = [17.3737%, 17.3737%, 17.3737%]` cho cả ba tài sản, và `Σ RC = 17.3737% = σ_GMV`, residual 0.00 bp. Đây là unit test mạnh nhất cho cả optimizer lẫn module Euler — nó bắt lỗi ở cả hai cùng lúc.

**Reconciliation R10:** `σ` và `μ` của mọi điểm optimizer báo ra phải tính lại được bằng đúng hàm mà module §6 dùng, ra cùng kết quả tới 1e-10.

### 7.6 Input còn thiếu

`r_f` (risk-free rate) là **input mới bắt buộc** cho max-Sharpe và chưa có trong input dictionary Week 3. Đề xuất: lợi suất trái phiếu chính phủ Việt Nam kỳ hạn 1 năm hoặc lãi suất tiền gửi tham chiếu, lưu kèm nguồn và ngày quan sát, đơn vị `% annual`, base currency VND. Không được hard-code.

---

## 8. Data-sufficiency policy (khóa yêu cầu còn treo từ Week 3)

`T` = số quan sát return, `N` = số tài sản.

| Metric | Yêu cầu tối thiểu | Hành vi khi không đủ |
| --- | --- | --- |
| Position value, weight, allocation | 1 quan sát | Luôn chạy |
| Period return, return contribution | `T ≥ 1` | Luôn chạy |
| **CAGR / annualised return** | **`T ≥ 252`** (≈1 năm giao dịch) | Ẩn CAGR, chỉ hiện period return, nêu lý do |
| **Annualised volatility** | **`T ≥ 60`**; cảnh báo nếu `T < 120` | Không annualize, chỉ hiện period volatility |
| **Covariance, Euler RC/ATC** | **`T ≥ max(120, 10N)`** | Chặn toàn bộ risk attribution |
| **Markowitz** | Như trên, cộng Σ phải positive definite | Ẩn tab frontier, brief vẫn hoàn chỉnh |
| Multi-period linking | ≥ 2 kỳ con | Chuyển sang single-period attribution |
| Brinson attribution | Benchmark có đủ dữ liệu cùng ngày với danh mục | Chặn attribution, không thay bằng proxy im lặng |
| Staleness | `data_end` cách ngày dữ liệu mới nhất ≤ 5 phiên | Cảnh báo và hiển thị last available date |

Cơ sở của ngưỡng `T ≥ max(120, 10N)`: mô phỏng từ Σ đã biết (seed 7, 3 tài sản, σ thật = 20% / 30% / 60%) cho ước lượng volatility hằng năm:

| T | Ước lượng σ | Sai lệch lớn nhất |
| ---: | --- | ---: |
| 9 (fixture Week 3) | 15.17% / 28.50% / 61.68% | **4.83 pp** |
| 30 | 15.23% / 26.09% / 45.69% | **14.31 pp** |
| 60 | 20.21% / 29.78% / 51.29% | 8.71 pp |
| 120 | 20.58% / 25.02% / 51.36% | 8.64 pp |
| 252 | 19.39% / 30.42% / 64.98% | 4.98 pp |
| 504 | 20.23% / 30.50% / 59.86% | 0.50 pp |

Kết luận đọc được từ bảng: fixture 9 quan sát của Week 3 **chỉ đủ để kiểm tra số học**, đúng như nhóm đã tự giới hạn. Không có cửa sổ nào dưới 252 quan sát cho ước lượng đủ ổn định để người dùng ra quyết định.

---

## 9. Bảng reconciliation — dùng làm acceptance test

| ID | Đẳng thức | Dung sai |
| --- | --- | --- |
| R1 | `Σ_sector W_sector × b_sector = B` | 1 bp |
| R2 | `Σ_i (A_i + S_i + I_i) = R_p − B` | 0.5 bp |
| R3 | `w_equity × Σ_sector effects = Level-0 (S + I) của VN equity` | 0.5 bp |
| R4 | `Σ_(mã ∈ sector) contribution = Selection_sector` | 0.5 bp |
| R5 | `Σ_t Σ_i Effect_adjusted = R_p − B` toàn kỳ (Cariño) | 0.5 bp |
| R6 | `R_base = R_local + R_fx + cross` cho mọi tài sản ngoại tệ | 1e-10 |
| R7 | Tổng hiệu ứng của tab sector = tab size = tab venue = `R_p − B` | 0.5 bp |
| R8 | `Σ RC_i = σ_p` và `Σ ATC_i = TE` | 1e-8 |
| R9 | MCR bằng nhau tại GMV không ràng buộc | 1e-8 |
| R10 | σ, μ của optimizer tính lại khớp module §6 | 1e-10 |
| R11 | `Σ_i w_i = 1` và `Σ_i proposed_w_i = 1` | 1e-9 |

---

## 10. Lỗ hổng còn lại sau Week 4

Ghi ra để nhóm bảo vệ được ở giữa kỳ, thay vì bị hỏi bất ngờ.

| # | Lỗ hổng | Mức độ | Hướng xử lý |
| --- | --- | --- | --- |
| G1 | Nguồn dữ liệu VN-Index chưa resolve được qua adapter hiện tại | **Chặn** | Đổi/bổ sung data source trước implementation; fallback `E1VFVN30.VN` phải đổi nhãn benchmark |
| G2 | Chưa có snapshot constituent + free-float mcap của VN-Index tại `data_start` | **Chặn** Level-1/Level-2 | Data workstream lấy công bố rổ chỉ số của HOSE |
| G3 | Universe hiện tại chỉ có mã VN30 → chiều size suy biến | Trung bình | Mở rộng universe thêm ít nhất 1 mã mid cap và 1 mã small cap |
| G4 | Currency effect là phân rã naive, không phải Karnosky-Singer | Trung bình | Chấp nhận cho MVP; công bố rõ là *exposure*, không phải *management skill* |
| G5 | `r_f` chưa có nguồn | Trung bình | Bổ sung vào input dictionary với nguồn và ngày quan sát |
| G6 | Return vẫn là price return, chưa gồm cổ tức | Trung bình | Giữ nguyên A03; VN-Index cũng là price index nên hai bên **nhất quán** — nhưng total-return index của HOSE có sẵn nếu nhóm muốn nâng cấp cả hai cùng lúc |
| G7 | Σ tính trên dữ liệu daily giao nhau giữa equity/crypto → mất quan sát cuối tuần của crypto | Thấp | Giữ A06; báo số quan sát bị loại |
| G8 | Euler dựa trên độ lệch chuẩn, giả định đuôi mỏng | Thấp cho MVP | Công bố giới hạn; VaR/ES vẫn ngoài scope |

> G6 đáng chú ý: chọn VN-Index (price index) làm benchmark **lại giúp** assumption A03 trở nên nhất quán, vì cả danh mục lẫn benchmark đều bỏ cổ tức. Nếu sau này nhóm chuyển sang total return thì phải chuyển **cả hai bên cùng lúc**, nếu không attribution sẽ thiên vị có hệ thống.

---

## Nguồn tham chiếu

- [HOSE-Index Ground Rules 4.0 (bản dịch tiếng Anh)](https://static2.vietstock.vn/vietstock/2024/12/30/20241230_25_12_hose_index_4_0_translation.pdf) — quy tắc VN30 / VNMidcap / VNSmallcap / VNAllshare, chuẩn phân ngành GICS Level 1, công thức chỉ số và capping
- [HOSE-Index Series factsheet](https://static2.vietstock.vn/vietstock/2025/1/13/20250113_form_factsheet_mcindices_eng_t01_2025.pdf)
- [SSI FastConnect — danh mục mã chỉ số](https://guide.ssi.com.vn/ssi-products/fastconnect-data/data-mapping/index-list) — `VNINDEX`, `VN30`, `VN100`, `VNMID`, `VNSML`, `VNALL` và 10 mã chỉ số ngành
- [Carl Bacon, *Performance Attribution* — CFA Institute Research Foundation Literature Review](https://rpc.cfainstitute.org/sites/default/files/-/media/documents/book/rf-lit-review/2019/rflr-performance-attribution.pdf) — Brinson-Fachler vs BHB, xử lý interaction, lý do phải linking đa kỳ
- [Cariño multiple-period smoothing](https://eagledocs.atlassian.net/wiki/spaces/Performance2017/pages/856719637)
- [Karnosky-Singer model overview](https://eagledocs.atlassian.net/wiki/spaces/Performance2017/pages/856720237/Overview+of+the+Karnosky-Singer+Model) — mô hình nhóm **không** dùng, và lý do
- [Ledoit & Wolf, *Honey, I Shrunk the Sample Covariance Matrix*](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=433840)
- [vnstock — thư viện dữ liệu thị trường Việt Nam](https://github.com/thinh-vu/vnstock) — ứng viên nguồn VN-Index; **license phi thương mại, chỉ dùng cho prototype học thuật**
