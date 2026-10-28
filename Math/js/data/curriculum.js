/* =========================================================
 * curriculum.js — THỨ TỰ HỌC THEO CHƯƠNG TRÌNH THỰC TẾ (GDPT 2018)
 * Sắp lại thứ tự chủ đề, bản đồ học tập và bài nền tảng (prereqs) của cả 6 lớp
 * theo trình tự SGK "Kết nối tri thức với cuộc sống" (bộ sách dùng nhiều nhất;
 * Chân trời sáng tạo / Cánh diều cùng khung chương trình, thứ tự gần giống).
 *
 * Mỗi lớp: steps = các cột trên bản đồ (theo thời gian trong năm học),
 * mỗi cột liệt kê chủ đề theo thứ tự học. Số "Trạm"/"Chủ đề" = thứ tự đọc từ
 * trái sang phải, trên xuống dưới. Bài nền tảng cùng lớp luôn nằm ở cột trước.
 * File này nạp SAU các file gradeN.js và interactive.js.
 * ========================================================= */
(function (MA) {
  'use strict';
  const D = MA.Data;
  const pre = (map) => Object.entries(map).forEach(([id, p]) => { const t = D.topic(id); if (t) t.prereqs = p; });

  // ---------------- LỚP 1 ----------------
  // HK1: Số 0–10 → Hình phẳng → Cộng trừ phạm vi 10 → Hình khối, vị trí
  // HK2: Số đến 100 → Độ dài, cm → Cộng trừ không nhớ phạm vi 100 → Giờ, lịch → Toán có lời văn
  D.arrange(1, [
    ['g1_10'],
    ['g1_shapes', 'g1_addsub10'],
    ['g1_position'],
    ['g1_100', 'g1_length'],
    ['g1_addsub100', 'g1_time', 'g1_word']
  ], 'Học kì 1: Số 0–10 · Hình phẳng · Cộng trừ phạm vi 10 · Khối lập phương, khối hộp chữ nhật, vị trí. Học kì 2: Số đến 100 · Độ dài, cm · Cộng trừ phạm vi 100 · Giờ, lịch · Toán có lời văn',
  ['Đầu HK1', 'HK1', 'Cuối HK1', 'Đầu HK2', 'Cuối HK2']);

  // ---------------- LỚP 2 ----------------
  // HK1: Cộng trừ qua 10, có nhớ phạm vi 100 → toán nhiều hơn/ít hơn, thành phần phép tính
  //      → kg, lít, ngày giờ → điểm, đoạn thẳng, đường gấp khúc
  // HK2: Phép nhân, chia (bảng 2, 5) → Số đến 1000 → Tiền Việt Nam → Cộng trừ phạm vi 1000
  pre({
    g2_review100: ['g1_100'],
    g2_within20: ['g2_review100', 'g1_addsub10'],
    g2_add: ['g2_within20', 'g1_addsub100'],
    g2_sub: ['g2_add'],
    g2_geometry: ['g2_add'],
    g2_numbers: ['g1_100'],
    g2_money: ['g2_numbers', 'g2_muldiv'],
    g2_1000: ['g2_numbers', 'g2_add', 'g2_sub']
  });
  // (bổ sung 07/10/2026 theo "Bài tập Toán tăng cường lớp 2 – Tập một", tuần 1–18)
  D.arrange(2, [
    ['g2_review100'],
    ['g2_within20'],
    ['g2_add'],
    ['g2_sub'],
    ['g2_word', 'g2_findx', 'g2_measure', 'g2_geometry'],
    ['g2_muldiv', 'g2_numbers'],
    ['g2_money', 'g2_1000'],
    ['g2_stats', 'g2_logic', 'g2_hsg']
  ], 'Học kì 1: Ôn tập số đến 100, tia số · Cộng trừ qua 10 trong phạm vi 20 · Cộng trừ có nhớ phạm vi 100 · Toán có lời văn · Tìm thành phần · kg, lít, ngày giờ · Điểm, đoạn thẳng, đường gấp khúc. Học kì 2: Nhân chia bảng 2, 5 · Số đến 1000 · Tiền Việt Nam · Cộng trừ phạm vi 1000 · Ôn luyện HSG',
  ['Tuần 1–3', 'Tuần 4–8', 'Tuần 10–11', 'Tuần 12–13', 'Cuối HK1', 'Đầu HK2', 'HK2', 'Cuối năm']);

  // ---------------- LỚP 3 ----------------
  // HK1: Bảng nhân chia 3–9 · Một phần mấy → Hình phẳng, hình khối → Gấp/giảm, chia có dư
  //      → mm, g, ml, °C → Biểu thức số
  // HK2: Số đến 10 000, 100 000 → Chu vi, diện tích → Cộng trừ phạm vi 100 000
  pre({
    g3_area: ['g3_geo', 'g3_table'],
    g3_expr: ['g3_table', 'g3_divrem']
  });
  D.arrange(3, [
    ['g3_table'],
    ['g3_frac', 'g3_geo', 'g3_times', 'g3_divrem'],
    ['g3_measure', 'g3_expr'],
    ['g3_num', 'g3_area'],
    ['g3_addsub'],
    ['g3_stats', 'g3_logic']
  ], 'Học kì 1: Bảng nhân chia · Một phần mấy · Hình học · Gấp, giảm · Chia có dư · mm, g, ml, °C · Biểu thức. Học kì 2: Số đến 100 000 · Chu vi, diện tích · Cộng trừ phạm vi 100 000 · Đồng hồ, tháng – năm, tiền · Bảng số liệu, khả năng xảy ra · Tư duy',
  ['Đầu HK1', 'HK1', 'Cuối HK1', 'Đầu HK2', 'HK2', 'Cuối năm']);

  // ---------------- LỚP 4 ----------------
  // HK1: Số nhiều chữ số · Góc, song song – vuông góc → Yến tạ tấn, m², giây thế kỉ → Tổng – hiệu
  // HK2: Nhân chia → Trung bình cộng → Rút về đơn vị · Thống kê · Phân số → Phép tính phân số
  pre({
    g4_sumdiff: ['g3_divrem', 'g2_word'],
    g4_avg: ['g4_ops'],
    g4_unit: ['g4_avg'],
    g4_frac: ['g4_ops']
  });
  // (19/10/2026) theo 12 chủ đề SGK: thêm g4_expr (Ôn tập), g4_addsub (Chủ đề 5), g4_fracadd (Chủ đề 11)
  D.arrange(4, [
    ['g4_expr', 'g4_geo', 'g4_big'],
    ['g4_measure', 'g4_addsub'],
    ['g4_sumdiff'],
    ['g4_ops'],
    ['g4_avg'],
    ['g4_unit', 'g4_stats', 'g4_frac'],
    ['g4_fracadd'],
    ['g4_fracops', 'g4_logic']
  ], 'Học kì 1: Số chẵn lẻ, biểu thức chứa chữ · Góc, đo góc · Số có nhiều chữ số · Yến tạ tấn, m², giây, thế kỉ · Cộng trừ, tính chất · Tổng – hiệu · Vuông góc, song song. Học kì 2: Nhân chia · Trung bình cộng · Rút về đơn vị · Thống kê · Phân số · Cộng trừ phân số · Nhân chia phân số · Tư duy',
  ['Đầu HK1', 'HK1', 'Cuối HK1', 'Đầu HK2', 'HK2', 'HK2', 'HK2', 'Cuối năm']);

  // ---------------- LỚP 5 ----------------
  // HK1: Ôn phân số, hỗn số → Số thập phân → Phép tính số thập phân → Tam giác, hình thang, hình tròn
  // HK2: Tỉ số, tổng – tỉ, hiệu – tỉ → Tỉ số phần trăm · Thể tích → Hình hộp, lập phương
  //      → Chuyển động đều → Biểu đồ quạt
  pre({
    g5_area: ['g3_area', 'g5_decops'],
    g5_ratio: ['g4_sumdiff', 'g4_unit', 'g5_frac'],
    g5_pct: ['g5_ratio', 'g5_decops'],
    g5_measure: ['g4_measure', 'g5_dec'],
    g5_motion: ['g5_decops']
  });
  // (19/10/2026) theo 11 chủ đề SGK: thêm g5_time (Chủ đề 10 – số đo thời gian, trước chuyển động đều)
  pre({ g5_motion: ['g5_time'] });
  D.arrange(5, [
    ['g5_frac', 'g5_dec'],
    ['g5_measure', 'g5_decops'],
    ['g5_area'],
    ['g5_ratio'],
    ['g5_pct', 'g5_solid'],
    ['g5_time'],
    ['g5_motion', 'g5_stats'],
    ['g5_logic']
  ], 'Học kì 1: Phân số, hỗn số · Số thập phân · km², ha · Phép tính số thập phân · Tam giác, hình thang, hình tròn. Học kì 2: Tỉ số, tỉ lệ bản đồ · Tỉ số phần trăm · Thể tích, hình hộp, hình lập phương · Số đo thời gian · Chuyển động đều · Biểu đồ quạt tròn · Tư duy',
  ['Đầu HK1', 'HK1', 'Cuối HK1', 'Đầu HK2', 'HK2', 'HK2', 'Cuối HK2', 'Cuối năm']);

  // ---------------- LỚP 6 ----------------
  // HK1: Tập hợp số tự nhiên → Lũy thừa → Chia hết, số nguyên tố → ƯCLN, BCNN · Số nguyên · Hình phẳng
  // HK2: Phân số → Số thập phân, tỉ số % · Điểm, đường thẳng, góc · Thống kê, xác suất
  // (17/10/2026) thêm Chương V – Tính đối xứng (g6_sym) ở cuối HK1, đúng mục lục SGK Tập một
  // (18/10/2026) HK2 tách theo chương SGK Tập hai: Phân số (3 chủ đề) · Số thập phân (2) · Hình cơ bản (2) · Dữ liệu, xác suất (2)
  pre({ g6_sym: ['g6_shapes'], g6_dec: ['g6_fracops'], g6_pct: ['g6_dec'], g6_angle: ['g6_lines'], g6_prob: ['g6_stats'] });
  D.arrange(6, [
    ['g6_sets'],
    ['g6_power'],
    ['g6_divis'],
    ['g6_gcd', 'g6_int', 'g6_shapes'],
    ['g6_sym'],
    ['g6_frac'],
    ['g6_fracops'],
    ['g6_fracword', 'g6_dec'],
    ['g6_pct', 'g6_lines'],
    ['g6_angle', 'g6_stats'],
    ['g6_prob', 'g6_adv']
  ], 'Học kì 1 (SGK Tập một): Số tự nhiên · Lũy thừa · Chia hết · ƯCLN–BCNN · Số nguyên · Hình phẳng · Tính đối xứng. Học kì 2 (SGK Tập hai): Phân số · Phép tính phân số · Hai bài toán về phân số · Số thập phân · Tỉ số phần trăm · Điểm, đường thẳng · Góc · Dữ liệu, biểu đồ · Xác suất thực nghiệm',
  ['Đầu HK1', 'HK1', 'HK1', 'HK1', 'Cuối HK1', 'Đầu HK2', 'HK2', 'HK2', 'HK2', 'Cuối HK2', 'Cuối năm']);
})(window.MA);
