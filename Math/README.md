# Toán Vui 1–6 — Ứng dụng học toán web tĩnh

## Luyện thi TIMO cho cả lớp 1–6 (v23 · 23/10/2026)
- Thêm TIMO lớp 1, 3, 4, 5, 6 (lớp 2 giữ bộ riêng 80 dạng). Ngân hàng dạng bài dùng chung `js/data/timo-bank.js` (Tư duy logic, Số học) và `js/data/timo-bank2.js` (Lý thuyết số, Hình học, Tổ hợp): mỗi dạng có `g: [lớp từ, lớp đến]`, độ lớn số / độ dài dãy tăng theo lớp (`S(g, [l1..l6])`).
- `js/data/timo-grades.js` tạo chủ đề `tm{lớp}_logic|arith|numth|geo|comb|vocab` cho từng lớp, kèm kiến thức trọng tâm (theo lớp), lỗi sai thường gặp, ví dụ mẫu sinh tự động.
- Số dạng bài: lớp 1: 42 · lớp 3: 76 · lớp 4: 88 · lớp 5: 99 · lớp 6: 104 (tổng 5 phân môn).
- Trang TIMO có nút chọn lớp (mặc định theo lớp học sinh, lưu `settings.timoGrade`); thi thử 3 vòng tạo đề theo lớp đang chọn. Từ điển thêm ~80 thuật ngữ.
- Thêm `js/core/ga.js` vào SHELL của sw.js.

## Chạy được trên mọi trình duyệt – quy trình cập nhật (04/10/2026)
Trước đây service worker trả **bản JS cũ đã lưu** trước rồi mới tải bản mới → trình duyệt nào từng mở trang (thường là Chrome) vẫn chạy bản cũ / lẫn cũ – mới, trình duyệt mới mở (Edge) thì chạy bản mới.
- `sw.js`: trang, JS, CSS **ưu tiên mạng** (luôn bản mới nhất); mạng chậm quá 4 giây hoặc mất mạng mới dùng bản đã lưu. Ảnh, phông chữ vẫn dùng bản lưu.
- `index.html`: mọi file js/css có `?v=số phiên bản`; `js/core/pwa.js` tự kiểm tra bản mới khi mở lại trang và tải lại 1 lần khi bản mới kích hoạt (không tải lại khi con đang làm bài).
- `js/core/boot.js` (nạp đầu tiên): phát hiện tệp cũ / tệp tải hỏng → tự xoá bộ nhớ tạm của trang và tải lại 1 lần; vẫn hỏng thì hiện hướng dẫn + nút "Xoá bộ nhớ tạm & tải lại". Trình duyệt quá cũ được báo rõ cần cập nhật.
- Bản đồ lỗi trên trình duyệt nào đó → tự chuyển sang danh sách chủ đề (đúng thứ tự học), không để trang trắng.
- Bỏ cú pháp mới (`??`, `.flat()`) → chạy được Chrome ≥ 61, Safari/iOS ≥ 11, Firefox ≥ 60, Edge, Cốc Cốc, Samsung Internet.
- `.htaccess`: html, js, css, webmanifest luôn hỏi lại máy chủ (no-cache).

**Mỗi lần sửa code rồi tải lên hosting:** chạy `node tools/doi-phien-ban.js` (tăng `?v=` trong index.html, `VERSION` trong sw.js, `TV_BUILD` trong js/ui/core.js) → tải toàn bộ lên. Thêm file js mới thì nhớ thêm vào `index.html` và danh sách `SHELL` trong `sw.js` (công cụ sẽ nhắc).

## Vẽ hình đúng cho các dạng toán hình (v17 · 18/10/2026)
Nhiều dạng bài trước đây **tả hình bằng chữ** (“một hình tam giác được chia thành 4 tam giác nhỏ…”, “trên tia Ox lấy A, B…”) hoặc có hình **không khớp đề** (đề nói từ A đến B mà hình đi A→E; cạnh 3 cm và 7 cm vẽ dài bằng nhau). Nay:
- **Bộ vẽ hình đúng tỉ lệ** `geo` + các hàm dựng sẵn `MA.Vis.G` trong `js/core/visuals.js`: đường gấp khúc theo độ dài thật, tam giác theo 3 cạnh / đáy – chiều cao, tam giác vuông, hình chữ nhật, vuông, bình hành, thang (cân, vuông), thoi theo 2 đường chéo, đa giác đều, tứ giác 4 cạnh, điểm trên đoạn / tia / đường thẳng có đường kích thước, tia chung gốc, điểm không thẳng hàng, tam giác chia quạt, hình chữ nhật chia ô. Khung hình tự vừa chữ (không bị cắt nhãn). Hình có số đo (`shape` rect/square/tri/para/trap/rhombus/polyline, `cuboid`, `angle`) tự vẽ đúng tỉ lệ — kể cả ở phần ví dụ, lời giải.
- Hình mới: `solids` (khối cầu, trụ, hộp chữ nhật, lập phương + đồ vật), `shapes` (dãy hình phẳng nhỏ), `symrow` (dãy hình đối xứng có tên).
- **Gắn hình + sửa lời đề cho khớp hình** ở khoảng 75 dạng bài lớp 1–6 và TIMO: đếm hình (tam giác, chữ nhật, đoạn thẳng, góc, đường thẳng), đường gấp khúc, trung điểm, điểm nằm giữa, tia đối, góc bẹt, hình tròn trong hình vuông, ghép hình, chữ L, vườn có lối đi, hàng rào có cổng, lát gạch, hồ trồng cây, hộp không nắp, biểu đồ quạt, khối hình…
- Sửa lỗi dữ liệu gặp khi soát: Lát gạch có thể ra số viên lẻ (12,5 viên) và “dài 6 m, rộng 8 m”; Diện tích HCN lớp 3 lộ đáp số trong chú thích lưới ô; Chu vi tam giác lớp 3 có thể ra 3 cạnh không tạo thành tam giác; Diện tích phân số có thể chiều rộng > chiều dài; phân số chưa tối giản (4/6) ở Chu vi tổng – tỉ.
- Kiểm tra: `kiem-tra-de` (200 lần/dạng) không lỗi; vẽ thử hơn 22.000 hình không lỗi; đã soát bằng ảnh từng dạng bài trên khung máy tính và điện thoại.

## Lớp 1–5 theo SGK Kết nối tri thức (v21 · 19/10/2026)
- **Ôn lý thuyết SGK cho cả 6 lớp, mỗi lớp 2 tập**: trang `#/theory` có nút chọn Lớp 1–6 và Tập một / Tập hai. Lớp 1–5 xếp theo **Chủ đề** và **tên bài** đúng mục lục SGK (bỏ các bài Luyện tập chung / Ôn tập / Thực hành vì không có lý thuyết mới). Tổng cộng 211 bài lý thuyết lớp 1–5 (686 câu Đúng/Sai – trắc nghiệm, 370 thẻ hỏi – đáp) + 43 bài lớp 6.
- **Chủ đề mới / tách theo SGK**: `g2_stats` (kiểm đếm, biểu đồ tranh, chắc chắn – có thể – không thể), `g3_stats` (bảng số liệu, khả năng xảy ra), `g4_expr` (số chẵn lẻ, biểu thức chứa chữ, bài toán ba bước), `g4_addsub` (cộng trừ số nhiều chữ số, tính chất), `g4_fracadd` (cộng trừ phân số – tách khỏi `g4_frac`), `g5_time` (số đo thời gian – tách khỏi `g5_measure`). Lớp 1: “Vị trí” mở rộng thành “Hình khối · Vị trí”.
- **Thêm 57 dạng bài** (lớp 1: 20, lớp 2: 7, lớp 3: 10, lớp 4: 14, lớp 5: 6) + dạng “📘 Lý thuyết SGK” cho mọi chủ đề có bài SGK.
- File: `js/data/grade1-sgk.js` … `grade5-sgk.js` (nạp sau `theory-core.js`, trước `interactive.js`). Sách tiểu học khai báo `unit: 'Chủ đề'` → trang lý thuyết hiện “Chủ đề 1, 2…”, sách lớp 6 hiện “Chương I, II…”.

## Lớp 6 – Học kì 2 theo SGK Tập hai (v16 · 18/10/2026)
- **Ôn lý thuyết SGK Tập hai**: Bài 23–43 (Chương VI–IX), cùng khung với Tập một. Trang `#/theory` có nút chọn **Tập một / Tập hai** (và chọn lớp khi có thêm lớp). Số trang chỉ ghi ở các mục Luyện tập chung / Bài tập cuối chương.
- **Tách chủ đề HK2 theo chương SGK** (file `js/data/grade6-hk2.js`): Phân số → `g6_frac`, `g6_fracops`, `g6_fracword`; Số thập phân → `g6_dec`, `g6_pct`; Hình cơ bản → `g6_lines`, `g6_angle`; Dữ liệu, xác suất → `g6_stats`, `g6_prob`. Dạng bài cũ được chuyển sang chủ đề mới (giữ tên); thêm ~33 dạng bài mới (số đối, hỗn số, tính nhanh phân phối, ước lượng, làm tròn số nguyên, tỉ lệ bản đồ, góc, tia đối nhau, biểu đồ cột kép, sự kiện chắc chắn/không thể/có thể…). Hình mới `bar2` (biểu đồ cột kép).
- Kho lý thuyết dùng chung `js/data/theory-core.js` (`MA.Theory.add({ grade, vol, … })`, mỗi lớp nhiều tập). Lưu ý: thống kê theo **dạng bài** của các dạng đã chuyển chủ đề bắt đầu lại từ đầu; mức thành thạo chủ đề cũ vẫn giữ.

## Ôn lý thuyết Toán 6 theo SGK (v15 · 17/10/2026)
- Trang mới **📘 Ôn lý thuyết SGK** (`#/theory`, mở từ thẻ ở đầu trang Học bài lớp 6 và mục “📘 Theo SGK” trong từng chủ đề): đúng mục lục SGK Toán 6 – Tập một (Kết nối tri thức) – 5 chương, Bài 1–22, kèm số trang sách.
- Mỗi bài: **Cần nhớ** · **Công thức** · hình minh họa · **Thẻ hỏi – đáp** (bấm để lật) · **Kiểm tra nhanh 5 câu** (Đúng/Sai + trắc nghiệm lý thuyết) · nút 🔊 nghe đọc. Mỗi chương có **Sơ đồ ghi nhớ** và bài kiểm tra theo đúng các mục “Luyện tập chung” / “Bài tập cuối chương”. Thêm: kiểm tra cả tập (20 câu), lật thẻ ôn nhanh (`#/theory/the`), mục Hoạt động thực hành trải nghiệm.
- Chủ đề mới **🦋 Tính đối xứng của hình phẳng** (`g6_sym`, Chương V – Bài 21, 22) với 8 dạng bài; xếp ở bước “Cuối HK1” trên Bản đồ (curriculum.js).
- Dạng bài **“📘 Lý thuyết SGK”** được thêm vào các chủ đề lớp 6 tương ứng → câu lý thuyết xuất hiện cả trong Luyện tập, Kiểm tra, Ôn tập thông minh.
- Kỹ thuật: dữ liệu `js/data/grade6-lythuyet.js` (kho `MA.Theory`, hình `MA.Vis.add('sym', …)`), giao diện `js/ui/views-theory.js`; kết quả từng bài lưu ở `u.theory`. Thêm lớp khác: gọi `MA.Theory.add({ grade, book, series, chapters: [...] })` trong file dữ liệu mới. Đã đổi mã băm CSP trong index.html vì đoạn script đầu trang thêm đường dẫn `theory`.

## Dùng thử VIP 1 ngày cho tài khoản đăng ký bằng SĐT (v14 · 07/10/2026)
- Hồ sơ **đăng ký bằng SĐT cha/mẹ** được **dùng thử VIP 24 giờ**, **mỗi SĐT 1 lần** (máy chủ ghi nhận `trialAt`, không dùng lại được). Hồ sơ đã có từ trước, SĐT chưa từng VIP/dùng thử cũng được.
- Đăng ký xong (hoặc đăng nhập lại bằng tên + SĐT) → **tự hiện màn hình kích hoạt**: bắt buộc **nhập lại SĐT** (phải khớp số đã đăng ký) + **đặt mật khẩu** (≥ 6 kí tự, nhập 2 lần). Từ đó SĐT này đăng nhập bằng **SĐT + mật khẩu** (tab 👑 VIP), giống tài khoản VIP.
- Có nút “Để sau” → không hỏi lại; kích hoạt sau ở Khu vực VIP (“🎁 Dùng thử VIP 1 ngày miễn phí”, đường dẫn `vip/trial`).
- Đang dùng thử: Trang chủ có thanh “🎁 Con đang dùng thử VIP · còn N giờ”, Khu vực VIP hiện giờ còn lại; vẫn **nhập mã VIP** được → VIP 1 năm tính từ hôm nay. Admin thấy nhãn “🎁 dùng thử” / “đã dùng thử”.
- Hết hạn: tự về tài khoản thường, giữ nguyên kết quả học; vẫn đăng nhập bằng SĐT + mật khẩu và tạo thêm hồ sơ anh/chị/em (hồ sơ thường) được.
- Máy chủ: hành động `vip.trial` (cần phiên `auth.phone`), giới hạn 5 lượt kích hoạt / IP / 24 giờ. Số giờ dùng thử: `'trial_hours'` trong `api/config.php` (không có dòng này = 24; `0` = tắt dùng thử).
- Chạy không có máy chủ: dùng thử kích hoạt trên máy (không kiểm soát được mỗi SĐT 1 lần giữa các máy).

## TIMO lớp 2 – bổ sung từ đề thi cũ (v13 · 07/10/2026)
- Phân tích 10 đề TIMO lớp 2 (5 đề vòng loại, 5 đề vòng quốc gia 2016–2021) → thêm 33 dạng bài trong `js/data/timo-g2-de.js` (nạp sau `timo-g2.js`, dùng `MA.Data.extend`): tháng, gia đình/lớp học, chạy vòng – cưa gỗ, vị trí đếm từ sau, đoán số; biểu thức có phép chia, tổng dãy cách đều, tìm số trong phép nhân/chia, tính ngược, đổi chỗ thừa số; cho để hơn/kém, đếm số theo chữ số, điền dấu +/−, làm tròn lên, suy luận chẵn lẻ, chia hết – bội, chia đống khác nhau, Dirichlet, so sánh số nhiều chữ số; kiến thức hình, lăng trụ, đường thẳng qua n điểm, cắt hình tròn; quy tắc nhân, tổ hợp chọn 2/3, khuyến mại, đếm số chứa chữ số, chẵn lẻ trong dãy, chia đồ vật giống nhau, số mức giá trả được, lập số chia hết/có lặp, so sánh chữ số. Tổng TIMO lớp 2: 80 dạng.
- Thi thử theo đúng cấu trúc của BTC: **Vòng loại** (Preliminary) 25 câu trắc nghiệm A–D, 60 phút, song ngữ; **Vòng quốc gia** (Heat) 25 câu điền đáp án, 90 phút, tiếng Anh + dòng trích thuật ngữ tiếng Việt dưới mỗi câu (giống đề thật); **Vòng quốc tế** (Final) 30 câu (6/phân môn), 120 phút, tiếng Anh. Chấm 4 điểm/câu (quốc tế 5 điểm/câu). Mốc giải: quốc gia Vàng 80 · Bạc 60 · Đồng 40 · KK 20 /100; quốc tế 120 · 90 · 60 · 30 /150 (sửa ở `ROUNDS` trong `timo-core.js`). Vòng loại không xét huy chương.
- Chế độ "English + từ khoá" nay hiện danh sách thuật ngữ dưới đề (giống đề vòng quốc gia), từ điển thêm ~45 thuật ngữ.

## Luyện thi TIMO – lớp 2 (v12 · 07/10/2026)
- Mục mới **🌏 TIMO** (thanh menu máy tính + ô "Luyện thi TIMO" ở Trang chủ), đường dẫn `#/timo`.
- 5 phân môn theo cấu trúc đề TIMO (25 câu = 5 × 5): Tư duy logic, Số học, Lý thuyết số, Hình học, Tổ hợp + chủ đề Từ vựng. 47 dạng bài sinh đề ngẫu nhiên, xây theo tài liệu ôn chuyên đề (22 bài) — không chép đề gốc.
- Ngôn ngữ đề (chọn ở trang TIMO, lưu trong cài đặt `timoLang`): **Song ngữ** (mặc định) · Tiếng Việt · English + từ khoá (tự chú thích nghĩa tiếng Việt dưới từ khoá) · English. Nút 🔊 đọc phần tiếng Anh bằng giọng Anh rồi phần tiếng Việt.
- **Miễn phí:** học bài + luyện từng phân môn (`#/learn/tm2_…`, `#/practice/tm2_…`), thẻ từ vựng `#/timo/vocab`.
- **VIP:** thi thử 3 vòng `#/timo/thi/heat|national|final` — vòng loại (song ngữ), vòng quốc gia (tiếng Anh + từ khoá tiếng Việt), vòng chung kết (chỉ tiếng Anh); 25 câu, 90 phút, chấm theo phân môn, mức giải ước tính (Vàng ≥ 21, Bạc ≥ 17, Đồng ≥ 13, KK ≥ 9 câu — sửa ở `MEDALS` trong `js/data/timo-core.js`).
- Kỹ thuật: chủ đề có `track: 'timo'` → `MA.Data.topics()` bỏ qua (không vào bản đồ SGK), lấy bằng `MA.Data.track('timo', 2)`. File mới: `js/data/timo-core.js`, `js/data/timo-g2.js`, `js/ui/views-timo.js`. `MA.Vis.add('raw', …)` cho hình SVG; `MA.Sound.speakEn/speakSay`.
- Thêm lớp khác: tạo `timo-g3.js` (id `tm3_logic`, `tm3_arith`, …), thêm 3 vào `GRADES` trong `views-timo.js`, nạp file trong index.html + sw.js.
- Lưu ý: đổi đoạn `<script>` nội tuyến trong index.html thì phải cập nhật mã `sha256-…` trong thẻ Content-Security-Policy.

## Toán tăng cường lớp 2 – Tập một (v11 · 07/10/2026)
Chuyển thể bộ bài giảng điện tử "Bài tập Toán tăng cường lớp 2 – Tập một" (Kết nối tri thức, Tuần 1–18) thành **68 dạng bài sinh đề ngẫu nhiên** trong `js/data/grade2-tangcuong.js`:
- **2 chủ đề mới:** 💯 *Ôn tập các số đến 100 · Tia số* (Tuần 1–3, 13 dạng) và 🔟 *Cộng, trừ (qua 10) trong phạm vi 20* (Tuần 4–8, 17 dạng) — có bài học, thơ ghi nhớ, lỗi hay gặp, ví dụ mẫu.
- **Bổ sung dạng bài:** Cộng có nhớ (6) · Trừ có nhớ (6) · Tìm thành phần (3) · Toán có lời văn – tóm tắt, đổi chục, đủ chỗ xe (6) · Đo lường – cân đĩa, giờ chiều/tối, lịch tháng, can lít (10) · Hình học – đường gấp khúc, đoạn/đường thẳng (5) · Tư duy – thử thách cuối tuần (2).
- **Bản đồ lớp 2** thêm 2 bước đầu: Tuần 1–3 → Tuần 4–8 → Tuần 10–11 (cộng có nhớ) → Tuần 12–13 (trừ có nhớ) → Cuối HK1 → … (`curriculum.js`).
- `sw.js`: VERSION = `toanvui-v11-lop2-tang-cuong`.

## Bạn ảo đua rank 🤖 (v10)
- Admin Board → **🤖 Bạn ảo đua rank**: chọn lớp, số bạn ảo (1–30), tốc độ học (🐢 Chậm ~70 · 🚲 Vừa ~150 · 🚀 Nhanh ~260 · ⚡ Siêu tốc ~420 XP/ngày học), XP khởi đầu (0 / 1 tuần / 1 tháng / 3 tháng / 6 tháng). Mỗi nhóm có thể đổi tốc độ, số bạn, tắt/bật, 🎲 đổi bạn (tên + ảnh + điểm mới), xoá.
- XP **tự tăng mỗi ngày**: mỗi bạn ảo có mức chăm riêng (0,55–1,45 lần tốc độ nhóm), có ngày nghỉ; trong ngày tăng dần từ 7h đến 21h; có XP tuần cho bảng “Tuần này”. Điểm được **tính lại từ hạt giống + ngày**, không lưu ở đâu → mọi máy thấy giống nhau, không tốn dung lượng máy chủ.
- Cấu hình lưu trong nội dung (`bots` trong content-config.js): có máy chủ thì tự phát hành; không có máy chủ thì tải file content-config.js ở tab Cài đặt.
- Bạn ảo luôn có dấu **🤖** trên bảng xếp hạng (bục vinh quang, bảng, vị trí “#” ở trang chủ), dòng chữ mờ hơn; **không** tính vào KPI, thống kê, báo cáo. Trang quản trị hiện cả XP học sinh thật cao nhất mỗi lớp để chọn tốc độ phù hợp.
- `sw.js`: VERSION = `toanvui-v10-ban-ao-dua-rank`.

## Cập nhật 04/10/2026
- **Phông chữ Nunito lưu ngay trong website** (`assets/fonts/`, giấy phép SIL OFL): không còn tải từ Google → mở nhanh hơn, mất mạng / dạng ứng dụng vẫn đúng phông. CSP đã bỏ tên miền Google.
- **Viết lại 20 dạng bài ít biến thể** (đề lặp lại): Số cạnh của hình (L1), Hiệu đặc biệt, Đếm đoạn thẳng, Đếm hình tam giác, Đếm hình chữ nhật, Ba điểm thẳng hàng, Dãy nhân đôi, Bắt tay – đếm cặp, Hình tiếp theo, Khối hình (L2), Đếm hình vuông, Góc vuông của hình (L3), Góc vuông trong hình (L4), Gấp cạnh lên, Hơn kém bao nhiêu, Quạt và góc, Giảm rồi tăng (L5), Bộ ba nguyên tố, Số đo góc đặc biệt, Tăng rồi giảm (L6). Tên dạng bài giữ nguyên nên tiến độ cũ không mất.
- **Bộ kiểm tra tự động** trong thư mục `tools/` (không cần tải lên hosting, `.htaccess` đã chặn):
  - `node tools/kiem-tra-de.js` — sinh thử mỗi dạng bài 200 lần: báo lỗi, NaN/undefined, đáp án không có trong lựa chọn, lựa chọn trùng, dạng bài ít biến thể.
  - `node tools/kiem-tra-trang.js http://127.0.0.1:8080/` — (cần Playwright) mở mọi trang trên máy tính + điện thoại cho cả 6 lớp, làm thử câu hỏi, báo lỗi JS / tràn ngang / thiếu phông.
  - Nên chạy cả hai trước mỗi lần cập nhật website.
- `sw.js`: VERSION = `toanvui-v4-fonts-gens`.

## Có gì mới ở phiên bản 2 (10/2026)

**An toàn**
- Mật khẩu quản trị mặc định bị **bắt buộc đổi** ở lần đăng nhập đầu (mật khẩu mới ≥ 8 kí tự). Khi chưa đổi, tài khoản quản trị không xem/sửa được dữ liệu.
- **Mã VIP do máy chủ sinh ngẫu nhiên** (dạng `VIP-XXXXX-XXXXX`), gắn với tên + SĐT, chỉ dùng 1 lần. Không còn chuỗi bí mật trong mã nguồn trình duyệt → không tự tạo được mã giả. (Mã kiểu cũ `VIP-xxxxxx-YYMMDD` hết hiệu lực.)
- Chặn chèn mã độc (XSS): máy chủ làm sạch tên, ảnh đại diện; trình duyệt chỉ chấp nhận 16 ảnh đại diện có sẵn; thêm Content-Security-Policy.
- Bảng xếp hạng lấy **số liệu máy chủ làm chuẩn** cho mọi hồ sơ đã đồng bộ (từ v18): máy nào giữ bản sao cũ của hồ sơ (vd. máy tính quản trị) vẫn thấy đủ và đúng như trên điện thoại; hồ sơ có trên máy thì lấy số lớn hơn giữa bản máy và bản máy chủ.
- Bảng xếp hạng: **XP do máy chủ giới hạn** (tối đa 3.000 XP/ngày) → không sửa trình duyệt để gian lận được; tên hiển thị dạng rút gọn (ví dụ “N.M. Anh”).
- Học sinh không tự đặt được loại tài khoản/hạn VIP; câu hỏi VIP của thầy cô chỉ gửi cho tài khoản VIP; mã lớp gốc chỉ quản trị thấy.
- Tab “Quản trị” không còn hiện cho học sinh — thầy cô vào bằng đường dẫn `/admin`.
- `.htaccess` chặn tải file `.md`, `.sqlite`, thư mục `.git`; thêm các header bảo mật.

**Học hiệu quả hơn** (`js/core/tutor.js`)
- Mức thành thạo theo **từng dạng bài**; luyện tập tự ưu tiên dạng còn yếu / đến hạn ôn / chưa làm.
- **Ôn tập ngắt quãng**: mỗi dạng bài có lịch ôn 1 – 3 – 7 – 14 – 30 – 60 ngày.
- **Nhiệm vụ hôm nay** (~15 phút): ôn đến hạn + sửa lỗi sai + học tiếp bài mới, thưởng +30 XP.
- **Bài kiểm tra đầu vào** 15 câu cho học sinh mới ở mỗi lớp.
- **Chẩn đoán lỗi tức thì** khi làm sai (quên nhớ, lệch 1, sai dấu, sai dấu phẩy, đổi chỗ chữ số…).
- **Bớt trắc nghiệm**: câu Vận dụng (60%) và Nâng cao (100%) có đáp số là số được chuyển sang tự nhập (tắt được trong menu cá nhân).
- 12 dạng bài ít biến thể đã được viết lại; sửa lỗi chấm sai đáp số thập phân có 3 chữ số sau dấu phẩy.

**Mở rộng**
- **Lớp 1** (9 chủ đề, 40 dạng bài); lớp 1–2 có bàn phím số to; bấm 🔊 để “Cô đọc đề” (không tự đọc).
- **Bản đồ học tập** (Học bài → 🗺️ Bản đồ): các chủ đề là “trạm”, sao theo mức thành thạo.
- **Câu hỏi tương tác**: bấm vào tia số (lớp 2, 5, 6), tô màu phân số (lớp 3, 4, 6). Tự loại khỏi phiếu in.
- **Báo cáo tuần cho cha mẹ** (menu cá nhân → 📨): sao chép gửi Zalo / chia sẻ / in.
- **Lớp học & bài tập về nhà** (Admin Board → 🏫): tạo lớp có mã, giao bài theo chủ đề + hạn nộp, xem bảng điểm và bản đồ nhiệt thành thạo cả lớp. Học sinh nhập mã lớp tại Hồ sơ → Tài khoản.
- **Cài như ứng dụng (PWA)** và **mở được khi mất mạng** (`manifest.webmanifest`, `sw.js`). ⚠️ Mỗi lần sửa file trên website, hãy đổi chuỗi `VERSION` trong `sw.js` để máy học sinh tải bản mới.


Hai cách chạy:
- **Không máy chủ**: mở `index.html` bằng trình duyệt (hoặc GitHub Pages / Netlify). Dữ liệu nằm trên trình duyệt từng máy.
- **Có máy chủ đồng bộ** (khuyên dùng): đưa cả thư mục lên **hosting PHP + MySQL** → tài khoản, gói VIP, kết quả học, câu hỏi/đề thi được lưu trên máy chủ, học sinh học được trên nhiều máy, xếp hạng chung toàn trường. Xem mục *Triển khai lên hosting* bên dưới.

## Cấu trúc thư mục

```
index.html                 Khung trang, nạp các file theo thứ tự
css/style.css              Toàn bộ giao diện (sáng/tối, mobile, in A4)
assets/                    Ảnh linh vật, ảnh bìa, giấy khen
js/config/                 FILE CẤU HÌNH (chỉnh tay hoặc tải từ Admin Board rồi chép đè)
  accounts-config.js       Tài khoản quản trị dùng khi chạy không có máy chủ (mật khẩu dạng băm), tài khoản tạo sẵn
  content-config.js        Nội dung: chủ đề ẩn/VIP, dạng bài VIP, câu hỏi & đề thi do thầy cô biên soạn
  sync-config.js           Đường dẫn API máy chủ, bật/tắt đồng bộ
api/                       MÁY CHỦ ĐỒNG BỘ (PHP)
  index.php                API: đăng nhập SĐT / VIP / quản trị, tải về – gửi lên, gói VIP, mã VIP, xếp hạng chung
  config.php               Cấu hình CSDL MySQL (hoặc SQLite), tài khoản quản trị ban đầu
  .htaccess, data/         Chặn truy cập file cấu hình & thư mục dữ liệu
js/core/                   LÕI
  nav.js                   ĐƯỜNG DẪN: dạng gọn /learn trên hosting, dạng #/learn khi mở file trực tiếp
  utils.js                 Số ngẫu nhiên, định dạng số VN, chấm đáp án, tạo câu trắc nghiệm
  storage.js               Lưu dữ liệu trên trình duyệt (localStorage) + sao lưu/khôi phục
  sync.js                  ĐỒNG BỘ MÁY CHỦ: ưu tiên trên máy (mất mạng vẫn học), tự gửi/tải, gộp dữ liệu 2 máy
  sound.js                 Âm thanh đúng/sai + giọng đọc tiếng Việt (chỉ đọc khi bấm 🔊; tự chọn giọng Việt tốt nhất,
                           đọc số & kí hiệu toán kiểu cô giáo; không có giọng Việt thì hướng dẫn cài, không đọc giọng ngoại)
  account.js               TÀI KHOẢN: định danh bằng tên + SĐT cha/mẹ (mã hóa), loại Thường/VIP, mã VIP, quản trị, nhật ký đăng nhập
  content.js               PHÂN QUYỀN NỘI DUNG VIP + ngân hàng câu hỏi / đề thi tự soạn
  analytics.js             THỐNG KÊ & KPI từng tài khoản, so sánh đối chứng VIP – Thường
  tutor.js                 HỌC THÍCH ỨNG: thành thạo theo dạng bài, ôn tập ngắt quãng, nhiệm vụ hôm nay, chẩn đoán lỗi, bài đầu vào
  boot.js                  Tự kiểm tra khi mở trang: phát hiện tệp cũ/hỏng, tự sửa, hướng dẫn
  pwa.js                   Cài như ứng dụng, đăng kí sw.js, tự cập nhật bản mới
  user.js                  NGƯỜI HỌC: đăng nhập bằng tên, XP, hạng theo lớp, huy hiệu, sổ lỗi sai, bảng xếp hạng
  bots.js                  BẠN ẢO ĐUA RANK 🤖: nhóm tài khoản ảo theo lớp, XP tự tăng mỗi ngày (tính từ hạt giống)
  visuals.js               Thư viện hình minh họa SVG (đặt tính, sơ đồ đoạn thẳng, cân, trục số, phân số…)
js/data/                   KIẾN THỨC & BỘ CÂU HỎI THEO LỚP
  registry.js              Kho đăng ký các lớp/chủ đề + hàm sinh đề
  grade1.js                    Lớp 1 — 9 chủ đề, 40 dạng bài
  grade2.js + grade2-more.js   Lớp 2 — 12 chủ đề, 227 dạng bài
  grade2-hsg.js                    + chủ đề "Ôn luyện HSG lớp 2" (60 dạng, đủ 80 bài HSG; bài trùng dạng được gộp)
  grade2-tangcuong.js              + Toán tăng cường lớp 2 tập 1: 2 chủ đề mới + 68 dạng bài (Tuần 1–18)
  grade3.js                    Lớp 3 — 11 chủ đề, 77 dạng bài
  grade4.js                    Lớp 4 — 11 chủ đề, 71 dạng bài
  grade5.js                    Lớp 5 — 11 chủ đề, 68 dạng bài
  grade6.js + grade6-more.js   Lớp 6 — 11 chủ đề, 173 dạng bài
  grade6-hk2.js                Lớp 6 — HK2 tách chủ đề theo chương SGK Tập hai + dạng bài mới
  theory-core.js               Kho Ôn lý thuyết SGK dùng chung (MA.Theory)
  grade6-lythuyet.js           Lớp 6 — Ôn lý thuyết SGK Tập một (Bài 1–22) + chủ đề Tính đối xứng
  grade6-lythuyet-t2.js        Lớp 6 — Ôn lý thuyết SGK Tập hai (Bài 23–43)
  interactive.js               Dạng bài tương tác (tia số, tô màu phân số) cho lớp 2–6
  curriculum.js                Thứ tự chủ đề + các bước trên Bản đồ theo chương trình thực tế (SGK Kết nối tri thức)
js/ui/                     GIAO DIỆN
  core.js                  Điều hướng, menu, thông báo, hộp thoại, cài đặt (chọn giọng cô đọc, tốc độ, nghe thử)
  charts.js                BỘ BIỂU ĐỒ dùng chung: cột, mạng nhện, vành khuyên, thanh so sánh, xếp hạng (KPI, tổng quan)
  quiz.js                  Bộ máy làm bài (luyện tập / kiểm tra / lời giải / giấy khen)
  views-home.js            Đăng nhập, trang chủ
  views-learn.js           Học bài
  views-practice.js        Luyện tập, ôn tập, kiểm tra
  views-tools.js           Phiếu in A4, xếp hạng & hồ sơ, bảng nháp
  views-vip.js             KHU VỰC VIP: thiết lập SĐT + mật khẩu, KPI của tôi, tư vấn sửa lỗi, luyện chuyên sâu nâng cao
  report.js                BÁO CÁO HỌC TẬP CHI TIẾT: thống kê & biểu đồ đến từng bài học (VIP + Admin Board)
  views-admin.js           ADMIN BOARD: tổng quan, tài khoản, KPI & đối chứng, thống kê, ngân hàng câu hỏi, đề thi & VIP, cài đặt
```

## Thêm chủ đề / dạng bài mới

Mỗi chủ đề là một object trong `gradeN.js`. Mỗi dạng bài là một hàm sinh câu hỏi:

```js
{ level: 2, name: 'Tên dạng', fn() {
    const a = R(10, 50), b = R(10, 40);          // số ngẫu nhiên
    return Q({
      text: `Tính <b>${a} + ${b}</b>`,          // đề bài (HTML)
      answer: a + b,                             // đáp án
      wrongs: [a + b + 10, a + b - 1],           // có wrongs => trắc nghiệm; bỏ đi => nhập đáp số
      unit: 'quả', hint: 'Gợi ý…',
      steps: ['Bước 1…', 'Bước 2…'],             // lời giải từng bước
      visual: { type: 'column', op: '+', a, b }, // hình minh họa trong đề
      solVisual: { type: 'bar', rows: [...] }    // hình minh họa trong lời giải
    });
} }
```

Để thêm lớp mới: gọi `MA.Data.addGrade({ grade, name, color, emoji, desc, topics })`.
Để thêm dạng bài vào chủ đề có sẵn: `MA.Data.extend('g3_table', [ ...gens ])`.
Để thêm chủ đề vào lớp có sẵn: `MA.Data.addTopics(3, [ ...topics ])`, rồi thêm id của nó vào đúng cột trong `js/data/curriculum.js`.
`MA.Data.arrange(lớp, [[id, id], [id], …], mô tả, ['Đầu HK1', …])`: mỗi mảng con là một **Bước** trên Bản đồ (theo thời gian trong năm học), thứ tự đọc = số Trạm. Bài nền tảng (`prereqs`) cùng lớp phải nằm ở cột trước. Chủ đề chưa khai báo sẽ tự vào cột cuối.

Lưu ý: khi chạy không có máy chủ, dữ liệu học tập và bảng xếp hạng được lưu trên trình duyệt của từng máy;
dùng **Hồ sơ → Sao lưu** để chuyển sang máy khác.

Dạng bài tương tác: thêm `input: { kind: 'nline', min, max, step }` (bấm vào tia số) hoặc `input: { kind: 'shade', d }` (tô màu d phần) vào câu hỏi có đáp án là số, và đánh dấu `interactive: true` cho dạng bài (xem `js/data/interactive.js`). Đặt `keepMc: true` nếu muốn câu luôn là trắc nghiệm.

## Tài khoản & quản trị

- Học sinh đăng nhập bằng **tên + số điện thoại cha/mẹ** (khuyên dùng). SĐT chỉ lưu dạng mã băm và 3 số cuối, không hiển thị với học sinh.
- **Admin Board**: mở đường dẫn `/admin` (hoặc `index.html#/admin`). Màn hình học sinh không còn hiện tab Quản trị.
  Tài khoản và mật khẩu ban đầu nằm trong `api/config.php` (bản có máy chủ) — lần đăng nhập đầu **bắt buộc đổi mật khẩu**.
- **Tài khoản VIP**: hiệu lực **1 năm kể từ ngày kích hoạt**; bắt buộc đăng nhập bằng **SĐT cha/mẹ + mật khẩu (≥ 6 kí tự)**.
  Đặc quyền: tham gia tất cả kì thi, luyện chuyên sâu nâng cao, xem KPI của chính mình, tư vấn sửa lỗi sai + bài tập bổ trợ + lộ trình 7 ngày.
- Cấp VIP: trên cùng máy → tab Tài khoản → “Cấp VIP” (bắt buộc có SĐT; đặt mật khẩu ban đầu hoặc để học sinh tự đặt). Học sinh ở máy khác → tab Cài đặt → “Tạo mã kích hoạt VIP” (theo tên + SĐT; **cần nối máy chủ**, mã do máy chủ sinh và chỉ dùng 1 lần), phụ huynh nhập mã ở Hồ sơ → Tài khoản, rồi bắt buộc đặt mật khẩu.
- **Gói VIP gia đình (anh chị em)**: 1 gói VIP gồm tối đa **2 hồ sơ học độc lập**, dùng **chung SĐT + mật khẩu** và chung hạn 1 năm.
  - Đăng nhập tab 👑 VIP → chọn hồ sơ con muốn học (hoặc “➕ Thêm hồ sơ cho anh/chị/em” khi còn suất: tạo mới hoặc gắn hồ sơ cũ cùng SĐT).
  - Mỗi hồ sơ có tiến độ, KPI, sổ lỗi sai, xếp hạng riêng. Khu vực VIP có bảng so sánh 2 anh em và nút “🔄 Chuyển sang”.
  - Đổi mật khẩu ở 1 hồ sơ → áp dụng cho cả gói. Admin thấy “👪 gói n/2”; hệ thống chặn hồ sơ thứ 3. Bỏ VIP 1 hồ sơ không ảnh hưởng hồ sơ còn lại.
  - Dữ liệu VIP cũ (mỗi tài khoản 1 mật khẩu) được tự chuyển sang gói gia đình khi mở trang.
- Quên mật khẩu: quản trị bấm 🔑 ở tab Tài khoản để đặt lại.
- Chỉnh nội dung (ẩn/VIP/câu hỏi/đề thi) → tab Cài đặt → “Tải file content-config.js” → chép đè `js/config/content-config.js` trên website.

⚠️ Khi chạy **không có máy chủ**: mọi dữ liệu nằm trên trình duyệt từng máy, mã nguồn có thể bị người rành kĩ thuật đọc được, và không tạo được mã VIP (chỉ cấp VIP trực tiếp trên máy). Khi chạy **có máy chủ**, mật khẩu, mã VIP và dữ liệu được kiểm soát ở máy chủ (xem mục dưới); riêng việc khóa nội dung VIP vẫn thực hiện trên trình duyệt.

## Gắn cờ câu khó 🚩 (mọi tài khoản · bổ trợ trọng tâm cho VIP)

- Mỗi câu hỏi (luyện tập, ôn tập, kiểm tra, đề thi) có nút **🚩** ở góc trên (lớp 1–3 hiện chữ “Câu này khó”). Bấm lại để bỏ cờ. Trong bài kiểm tra/đề thi, gắn cờ không lộ đáp án và không phát âm thanh.
- Màn kết quả: nút 🚩 cho từng câu và nút **“Gắn cờ tất cả câu sai”**.
- **Ôn tập → 🚩 Cờ của con** (`/review/flags`): gom cờ theo **dạng bài**, số cờ mỗi dạng, xem lời giải, làm lại đúng các câu đã gắn, bỏ cờ.
- **VIP**: các dạng được xếp theo mức cần luyện (số cờ, % đúng, lỗi sai 14 ngày) và có nút **🎯 Luyện bổ trợ (8 câu)**: ôn nền → câu gốc đã gắn cờ → câu mới cùng dạng → 1 câu nâng mức. Tài khoản thường được **dùng thử 1 lần**.
- Cờ là dữ liệu **riêng** của từng hồ sơ (`u.flags`, đồng bộ cùng hồ sơ): không cộng XP, không vào bảng xếp hạng, không so sánh giữa các học viên.

## Chế độ tập trung (toàn màn hình)

Trong mọi màn hình làm bài (luyện tập, ôn tập, thử thách ngày, sổ lỗi sai, bài kiểm tra, đề thi) có nút **⛶ Toàn màn hình**: ẩn thanh menu, chân trang và phóng to trình duyệt để con tập trung. Bấm **🗗 Thu nhỏ** hoặc phím **Esc** để thoát. Lựa chọn được ghi nhớ: lần làm bài sau tự vào chế độ tập trung; rời màn hình làm bài thì tự trở lại bình thường. iPhone/iPad không cho trang web phóng toàn màn hình — khi đó app vẫn ẩn menu để tập trung.

## Báo cáo học tập chi tiết (VIP & Admin Board)

- **Học sinh VIP**: Khu vực VIP → 📈 *Báo cáo học tập chi tiết* (cha/mẹ xem được cả báo cáo của anh/chị/em trong gói).
- **Quản trị**: Admin Board → 📑 *Báo cáo từng học sinh* (lọc theo tên / VIP / lớp), hoặc nút 📈 ở tab Tài khoản.
- Bộ lọc **7 / 30 / 90 ngày** và **theo lớp** áp dụng cho mọi số liệu. Gồm: lịch học 13 tuần; thời gian học mỗi ngày (luyện tập + đọc bài); số câu đúng/sai; độ chính xác theo ngày/tuần; điểm kiểm tra; mức thành thạo từng bài; thời gian theo bài; kiểu lỗi hay gặp; bảng chi tiết từng bài (trạng thái, ngày học đầu, thời gian, số câu, % đúng, mức độ, lần cuối).
- Bấm một bài → trang chi tiết: kết quả **từng dạng bài**, lỗi sai gần đây (con trả lời / đáp án / kiểu lỗi), **bài liên quan** (nền tảng & học tiếp) và nút luyện bài, luyện dạng yếu.
- Di chuột / chạm vào biểu đồ để xem số liệu; mỗi biểu đồ có “Xem bảng số liệu”; **Xuất CSV** (mở bằng Excel) và **In báo cáo**.
- Thời gian **đọc bài** được đo khi mở trang bài học (tối đa 20 phút mỗi lần, dừng khi chuyển tab); thời gian **luyện tập** tính theo từng câu (tối đa 5 phút/câu). Số liệu theo từng bài được ghi từ phiên bản này; dữ liệu cũ hơn vẫn được tính vào tổng của lớp hiện tại.

## Triển khai lên hosting (đồng bộ tài khoản & dữ liệu)

**Yêu cầu:** hosting PHP ≥ 7.4 có PDO MySQL (hầu hết hosting cPanel/DirectAdmin ở VN đều có), HTTPS (SSL miễn phí Let's Encrypt).

1. **Tạo cơ sở dữ liệu** trong cPanel → *MySQL Databases*: tạo database (ví dụ `abc_toanvui`), tạo user + mật khẩu, gán user vào database với *ALL PRIVILEGES*.
2. **Sửa `api/config.php`**: điền `name`, `user`, `pass` (host thường là `localhost`), và đổi mật khẩu quản trị ban đầu trong `default_admin`.
   (Để trống `user` → dùng SQLite, tiện chạy thử.)
3. **Upload** toàn bộ thư mục `toan-vui-web` lên `public_html` (hoặc thư mục con) bằng File Manager / FTP.
4. Mở `https://ten-mien/api/index.php?check=1` → các dòng đều ✔. Bảng dữ liệu tự tạo, **không cần import SQL**.
5. Mở `https://ten-mien/admin` → đăng nhập bằng tài khoản ban đầu → hệ thống **bắt buộc đặt mật khẩu mới**.
   Không cần upload `README.md` lên hosting (đã bị `.htaccess` chặn tải nếu lỡ upload).
6. Dữ liệu cũ đang nằm trên trình duyệt các máy: mở trang (đúng tên miền mới) trên máy đó và đăng nhập quản trị một lần → hệ thống tự đẩy lên. Nếu trước đây dùng file `index.html` mở trực tiếp, hãy dùng *Sao lưu → Gộp dữ liệu từ file* ở tab Cài đặt trên tên miền mới.

**Đường dẫn gọn:** trên hosting, địa chỉ trang có dạng `ten-mien.vn/learn/g3_table` (không có `#/`). File `.htaccess` ở thư mục gốc (đã kèm) giúp tải lại trang không bị lỗi 404 — hoạt động cả khi đặt web trong thư mục con. Liên kết cũ dạng `/#/learn` vẫn mở được và tự đổi sang dạng gọn. Hosting không hỗ trợ `.htaccess` (Nginx thuần, GitHub Pages…): đặt `cleanUrls: false` trong `js/config/sync-config.js` (hoặc cấu hình Nginx `try_files $uri $uri/ /index.html;`). Mở trực tiếp file `index.html` trên máy vẫn dùng dạng `#/`.

**Cách đồng bộ hoạt động**
- Hồ sơ **có SĐT cha/mẹ** được lưu lên máy chủ; mã hồ sơ = mã băm SĐT + tên → cùng tên + cùng SĐT ở máy nào cũng là một hồ sơ. Hồ sơ chỉ có tên vẫn chỉ nằm trên máy (biểu tượng 💾).
- Mọi thao tác ghi ngay trên máy, sau ~2 giây tự gửi lên máy chủ; mất mạng vẫn học bình thường, có mạng lại tự gửi (biểu tượng ☁️ / ⏳ / ⚠️ trên thanh tiêu đề).
- Hai máy cùng học một hồ sơ khi mất mạng → khi có mạng dữ liệu được **gộp** (giữ tiến độ lớn hơn, hợp nhất nhật ký từng ngày, huy hiệu, lịch sử).
- **Gói VIP gia đình**: mật khẩu kiểm tra ở máy chủ (bcrypt), đổi mật khẩu ở một máy → máy khác phải dùng mật khẩu mới. Số điện thoại đã có gói VIP thì đăng nhập bằng tên + SĐT sẽ được yêu cầu mật khẩu. Thử sai 8 lần/15 phút sẽ bị tạm khóa.
- **Mã VIP** được máy chủ kiểm tra lại và chỉ dùng được **một lần** trên toàn hệ thống.
- **Admin Board** khi nối máy chủ: thấy mọi học sinh ở mọi máy; cấp/thu VIP, khóa, xóa, đặt lại mật khẩu, câu hỏi, đề thi, quyền VIP… **tự phát hành cho tất cả các máy** (không cần chép đè file cấu hình).
- **Bảng xếp hạng** gồm tất cả học sinh đã đồng bộ (theo lớp, tất cả / tuần này).

**Bảo mật:** SĐT không gửi lên máy chủ (chỉ mã băm + 3 số cuối; lưu ý mã băm SĐT có thể bị dò ngược nên không coi là bí mật tuyệt đối). Mật khẩu VIP & quản trị lưu bằng bcrypt. Phiên đăng nhập là token ngẫu nhiên (máy chủ chỉ giữ SHA-256), hạn 180 ngày. File `config.php` và thư mục `api/data/` bị chặn truy cập bằng `.htaccess` (hosting Nginx thuần cần chặn tương tự trong cấu hình).
Tài khoản thường (không mật khẩu) chỉ được bảo vệ bằng việc biết tên + SĐT — muốn bảo vệ chặt hơn hãy dùng gói VIP có mật khẩu.

**Sao lưu:** sao lưu database định kỳ bằng cPanel → *Backup* hoặc phpMyAdmin → *Export*.
