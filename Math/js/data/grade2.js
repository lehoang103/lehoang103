/* =========================================================
 * grade2.js — KIẾN THỨC & BỘ CÂU HỎI TOÁN LỚP 2 (Chương trình GDPT 2018)
 * 11 chủ đề · mỗi chủ đề: bài học + ví dụ mẫu + bộ sinh câu hỏi 3 mức độ
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, Q, fmt, shuffle, readVi } = MA.U;
  const V = MA.Vis;

  // ---- Kho tên & đồ vật cho toán có lời văn ----
  const NAMES = ['Lan', 'Mai', 'Nam', 'Hà', 'An', 'Bình', 'Minh', 'Hoa', 'Tùng', 'Linh', 'Khoa', 'Ngọc'];
  const ITEMS = [
    { n: 'quả cam', u: 'quả', i: '🍊' }, { n: 'viên bi', u: 'viên', i: '🔵' }, { n: 'quyển vở', u: 'quyển', i: '📒' },
    { n: 'bông hoa', u: 'bông', i: '🌸' }, { n: 'cái kẹo', u: 'cái', i: '🍬' }, { n: 'quả táo', u: 'quả', i: '🍎' },
    { n: 'cái bút chì', u: 'cái', i: '✏️' }, { n: 'con tem', u: 'con', i: '🏷️' }, { n: 'quả bóng', u: 'quả', i: '⚽' }
  ];
  const two = () => { const a = pick(NAMES); let b = pick(NAMES); while (b === a) b = pick(NAMES); return [a, b]; };
  // Cặp số 2 chữ số có nhớ khi cộng
  function addCarryPair(max = 100) { let a, b; do { a = R(11, 89); b = R(5, 89); } while ((a % 10) + (b % 10) < 10 || a + b >= max); return [a, b]; }
  function subBorrowPair() { let a, b; do { a = R(21, 99); b = R(6, a - 5); } while ((a % 10) >= (b % 10)); return [a, b]; }

  const topics = [];

  // =====================================================================
  // 1. SỐ ĐẾN 1000
  // =====================================================================
  topics.push({
    id: 'g2_numbers', icon: '🔢', title: 'Các số trong phạm vi 1000',
    tagline: 'Trăm – chục – đơn vị · Đọc, viết, so sánh số',
    summary: 'Mỗi số có ba chữ số gồm hàng trăm, hàng chục và hàng đơn vị. 10 đơn vị = 1 chục, 10 chục = 1 trăm, 10 trăm = 1 nghìn.',
    prereqs: [],
    rules: [
      { title: 'Cấu tạo số có ba chữ số', desc: 'Số 345 gồm 3 trăm, 4 chục và 5 đơn vị.', formula: '345 = 300 + 40 + 5', example: 'Số 507 gồm 5 trăm, 0 chục, 7 đơn vị → đọc là “năm trăm linh bảy”.', tip: 'Chữ số 0 ở hàng chục đọc là “linh”.', visual: { type: 'blocks', n: 345 } },
      { title: 'So sánh hai số', desc: 'So sánh lần lượt từ hàng cao nhất: hàng trăm → hàng chục → hàng đơn vị. Chữ số nào lớn hơn thì số đó lớn hơn.', example: '456 < 465 vì hàng trăm bằng nhau (4 = 4), hàng chục 5 < 6.', tip: 'Số nào có nhiều chữ số hơn thì lớn hơn: 99 < 100.' },
      { title: 'Số liền trước, số liền sau', desc: 'Số liền sau = số đó + 1. Số liền trước = số đó − 1.', example: 'Số liền trước của 300 là 299; số liền sau của 299 là 300.', tip: 'Hãy tưởng tượng các số xếp hàng trên tia số.', visual: { type: 'numberline', min: 296, max: 304, highlight: [299, 300] } }
    ],
    poem: ['Trăm, chục, đơn vị ba nhà,', 'Đếm từ phải sang thật là dễ thay!', 'So sánh từ trái sang ngay,', 'Hàng nào lớn trước, số này lớn hơn!'],
    pitfalls: [
      { wrong: '“Ba trăm linh năm” viết là 3005', right: 'Viết là 305 (3 trăm, 0 chục, 5 đơn vị)', why: 'Số có ba chữ số chỉ có 3 chữ số, không viết thêm số 0.' },
      { wrong: '189 > 201 vì 9 > 1', right: '189 < 201 vì so sánh hàng trăm trước: 1 < 2', why: 'Luôn so sánh từ hàng cao nhất (bên trái).' }
    ],
    examples: [
      { q: 'Viết số gồm 6 trăm, 0 chục và 8 đơn vị. Đọc số đó.', steps: ['6 trăm = 600, 0 chục = 0, 8 đơn vị = 8.', '600 + 0 + 8 = 608.', 'Đọc: “sáu trăm linh tám”.'], visual: { type: 'blocks', n: 608 } },
      { q: 'Sắp xếp các số 512, 251, 521, 215 theo thứ tự từ bé đến lớn.', steps: ['So hàng trăm: 2 < 5 nên 251 và 215 bé hơn.', '215 < 251 (hàng chục 1 < 5); 512 < 521 (hàng chục 1 < 2).', 'Kết quả: 215, 251, 512, 521.'] }
    ],
    gens: [
      { level: 1, name: 'Cấu tạo số', fn() { const h = R(1, 9), t = R(0, 9), u = R(0, 9), n = h * 100 + t * 10 + u; return Q({ text: `Số gồm <b>${h} trăm, ${t} chục và ${u} đơn vị</b> là:`, answer: n, wrongs: [h * 100 + u * 10 + t, t * 100 + h * 10 + u, h * 1000 + t * 10 + u, h * 10 + t + u], hint: 'Viết lần lượt chữ số hàng trăm, hàng chục, hàng đơn vị.', steps: [`${h} trăm = ${h * 100}; ${t} chục = ${t * 10}; ${u} đơn vị = ${u}.`, `${h * 100} + ${t * 10} + ${u} = <b>${n}</b>.`], solVisual: { type: 'blocks', n } }); } },
      { level: 1, name: 'So sánh số', fn() { let a = R(100, 999), b = pick([a, a + R(1, 30), a - R(1, 30), Number(String(a).split('').reverse().join(''))]); if (b < 100 || b > 999) b = a + 9; const s = a > b ? '>' : a < b ? '<' : '='; return Q({ text: `Chọn dấu thích hợp: <b>${a} ... ${b}</b>`, answer: s, options: ['>', '<', '='], shuffle: false, hint: 'So sánh từ hàng trăm, rồi hàng chục, rồi hàng đơn vị.', steps: [`Hàng trăm: ${String(a)[0]} và ${String(b)[0]}; hàng chục: ${String(a)[1]} và ${String(b)[1]}; hàng đơn vị: ${String(a)[2]} và ${String(b)[2]}.`, `Vậy ${a} <b>${s}</b> ${b}.`] }); } },
      { level: 1, name: 'Liền trước – liền sau', fn() { const n = R(101, 998) - (R(0, 1) ? 0 : R(0, 9)) ; const after = R(0, 1); const ans = after ? n + 1 : n - 1; return Q({ text: `Số liền ${after ? 'sau' : 'trước'} của <b>${n}</b> là:`, answer: ans, hint: `Số liền ${after ? 'sau thì cộng thêm 1' : 'trước thì bớt đi 1'}.`, steps: [`${n} ${after ? '+' : '−'} 1 = <b>${ans}</b>.`], visual: { type: 'numberline', min: n - 3, max: n + 3, highlight: [n], hide: [ans] } }); } },
      { level: 2, name: 'Đọc số', fn() { const h = R(1, 9), t = pick([0, R(1, 9)]), u = R(1, 9), n = h * 100 + t * 10 + u; return Q({ text: `Số “<b>${readVi(n)}</b>” viết là:`, answer: n, wrongs: [h * 1000 + t * 10 + u, h * 100 + u * 10 + t, h * 10 + u, h * 100 + (t + 1) % 10 * 10 + u], hint: 'Xác định chữ số hàng trăm, chục, đơn vị. “Linh” nghĩa là hàng chục bằng 0.', steps: [`“${readVi(n)}” gồm ${h} trăm, ${t} chục, ${u} đơn vị.`, `Viết là <b>${n}</b>.`] }); } },
      { level: 2, name: 'Viết thành tổng', fn() { const h = R(1, 9), t = R(1, 9), u = R(0, 9), n = h * 100 + t * 10 + u; return Q({ text: `Điền số thích hợp: <b>${n} = ${h * 100} + ... + ${u}</b>`, answer: t * 10, wrongs: [t, t * 100, u * 10], hint: `Chữ số ${t} ở hàng chục có giá trị là bao nhiêu?`, steps: [`Chữ số ${t} ở hàng chục nên có giá trị ${t} chục = <b>${t * 10}</b>.`] }); } },
      { level: 2, name: 'Số lớn nhất / bé nhất', fn() { const arr = shuffle([R(100, 999), R(100, 999), R(100, 999), R(100, 999)]); if (new Set(arr).size < 4) return this.fn(); const big = R(0, 1); const ans = big ? Math.max(...arr) : Math.min(...arr); return Q({ text: `Số ${big ? '<b>lớn nhất</b>' : '<b>bé nhất</b>'} trong các số ${arr.join('; ')} là:`, answer: ans, options: arr, hint: 'So sánh chữ số hàng trăm trước.', steps: [`Xếp theo thứ tự: ${arr.slice().sort((a, b) => a - b).join(' < ')}.`, `Số ${big ? 'lớn nhất' : 'bé nhất'} là <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Lập số từ chữ số', fn() { const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3); const big = R(0, 1); const s = ds.slice().sort((a, b) => big ? b - a : a - b); const ans = +s.join(''); return Q({ text: `Từ ba chữ số <b>${ds.join(', ')}</b>, hãy lập số ${big ? 'lớn nhất' : 'bé nhất'} có ba chữ số khác nhau.`, answer: ans, hint: big ? 'Đặt chữ số lớn nhất ở hàng trăm.' : 'Đặt chữ số bé nhất ở hàng trăm.', steps: [`Hàng trăm cần chữ số ${big ? 'lớn' : 'bé'} nhất: ${s[0]}; tiếp theo ${s[1]}; cuối cùng ${s[2]}.`, `Số cần tìm: <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Số đặc biệt', fn() { const T = [
        { t: 'Số bé nhất có ba chữ số khác nhau là:', a: 102, w: [100, 123, 101], s: ['Hàng trăm bé nhất là 1, hàng chục bé nhất là 0, hàng đơn vị bé nhất khác 1 và 0 là 2.', 'Số cần tìm: <b>102</b>.'] },
        { t: 'Số lớn nhất có ba chữ số khác nhau là:', a: 987, w: [999, 989, 978], s: ['Chọn 9 ở hàng trăm, 8 ở hàng chục, 7 ở hàng đơn vị.', 'Số cần tìm: <b>987</b>.'] },
        { t: 'Có bao nhiêu số có hai chữ số?', a: 90, w: [99, 89, 100], s: ['Các số có hai chữ số từ 10 đến 99.', 'Số lượng: 99 − 10 + 1 = <b>90</b> số.'] },
        { t: 'Số tròn trăm lớn nhất có ba chữ số là:', a: 900, w: [990, 999, 1000], s: ['Số tròn trăm có dạng _00.', 'Lớn nhất là <b>900</b>.'] },
        { t: 'Có bao nhiêu số tròn chục từ 10 đến 100?', a: 10, w: [9, 11, 100], s: ['10, 20, 30, 40, 50, 60, 70, 80, 90, 100.', 'Có <b>10</b> số.'] },
        { t: 'Số liền sau của số lớn nhất có hai chữ số là:', a: 100, w: [98, 99, 101], s: ['Số lớn nhất có hai chữ số là 99.', 'Số liền sau của 99 là <b>100</b>.'] }
      ]; const o = pick(T); return Q({ text: o.t, answer: o.a, wrongs: o.w, hint: 'Đọc kĩ điều kiện đề bài: “khác nhau”, “tròn chục”, “tròn trăm”…', steps: o.s }); } }
    ]
  });

  // =====================================================================
  // 2. CỘNG CÓ NHỚ TRONG PHẠM VI 100
  // =====================================================================
  topics.push({
    id: 'g2_add', icon: '➕', title: 'Phép cộng có nhớ trong phạm vi 100',
    tagline: 'Gộp tròn chục · Thẳng hàng đơn vị · Nhớ 1 sang hàng chục',
    summary: 'Phép cộng có nhớ xảy ra khi tổng hai chữ số ở hàng đơn vị từ 10 trở lên. Ta viết chữ số hàng đơn vị của tổng và nhớ 1 chục sang hàng chục.',
    prereqs: ['g2_numbers'],
    rules: [
      { title: '1. Đặt tính thẳng cột', desc: 'Đơn vị thẳng đơn vị, chục thẳng chục. Dấu + đặt bên trái, kẻ gạch ngang thay dấu bằng.', example: '38 + 25 = 63', tip: 'Tính từ PHẢI sang TRÁI: hàng đơn vị trước, hàng chục sau.', visual: { type: 'column', op: '+', a: 38, b: 25 } },
      { title: '2. Quy tắc nhớ 1', desc: '8 + 5 = 13, viết 3 nhớ 1. 3 + 2 = 5, thêm 1 bằng 6, viết 6.', formula: 'Đơn vị ≥ 10 → viết (tổng − 10), nhớ 1 sang hàng chục', example: '47 + 35 = 82', tip: 'Chấm một chấm nhỏ trên hàng chục để không quên số nhớ.', visual: { type: 'blocks', nums: [47, 35], op: '+' } },
      { title: '3. Mẹo tính nhẩm “tách để tròn chục”', desc: 'Khi cộng với số có đơn vị 9, 8, 7 hãy tách số kia để gộp cho tròn chục.', example: '38 + 25 = 38 + 2 + 23 = 40 + 23 = 63', tip: 'Tính nhẩm siêu tốc mà không cần đặt tính!' }
    ],
    poem: ['Cộng từ phải sang bên trái,', 'Đơn vị đủ mười chớ có ngại!', 'Viết đuôi hàng đơn vị xuống đây,', 'Nhớ một sang chục cộng liền tay!'],
    pitfalls: [
      { wrong: '38 + 25 = 53 (quên cộng số nhớ)', right: '38 + 25 = 63 (3 + 2 = 5, thêm 1 bằng 6)', why: 'Lỗi hay gặp nhất: quên cộng 1 đã nhớ vào hàng chục.' },
      { wrong: '47 + 5: đặt số 5 thẳng với số 4', right: 'Số 5 là đơn vị, phải thẳng cột với số 7 → 52', why: 'Đặt lệch cột làm kết quả sai hoàn toàn (thành 97).' }
    ],
    examples: [
      { q: 'Đặt tính rồi tính: 46 + 28', steps: V.columnSteps(46, 28, '+'), visual: { type: 'column', op: '+', a: 46, b: 28 } },
      { q: 'Tính nhanh: 29 + 45', steps: ['Tách 45 = 1 + 44.', '29 + 1 = 30.', '30 + 44 = <b>74</b>.'] }
    ],
    gens: [
      { level: 1, name: 'Đặt tính rồi tính', fn() { const [a, b] = addCarryPair(); return Q({ text: `Đặt tính rồi tính: <b>${a} + ${b}</b> = ?`, answer: a + b, hint: `Hàng đơn vị: ${a % 10} + ${b % 10} = ${a % 10 + b % 10}, viết ${(a + b) % 10} nhớ 1.`, steps: V.columnSteps(a, b, '+'), solVisual: { type: 'column', op: '+', a, b } }); } },
      { level: 1, name: 'Trắc nghiệm cộng', fn() { const a = R(12, 89), b = R(3, 9); if ((a % 10) + b < 10) return this.fn(); return Q({ text: `Kết quả của phép tính <b>${a} + ${b}</b> là:`, answer: a + b, wrongs: [a + b - 10, a + b + 10, a + b - 1], hint: `${b} là số có một chữ số, đặt thẳng cột với ${a % 10}.`, steps: V.columnSteps(a, b, '+'), solVisual: { type: 'column', op: '+', a, b } }); } },
      { level: 1, name: 'Bó que tính', fn() { const [a, b] = addCarryPair(60); return Q({ text: `Nhìn hình bó que tính, tính tổng <b>${a} + ${b}</b>.`, visual: { type: 'blocks', nums: [a, b], op: '+' }, answer: a + b, hint: 'Gộp que rời: đủ 10 que rời thì bó thành 1 bó chục.', steps: [`Que rời: ${a % 10} + ${b % 10} = ${a % 10 + b % 10} que → bó được 1 chục, còn ${(a % 10 + b % 10) - 10} que rời.`, `Bó chục: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor((a + b) / 10)} bó.`, `Tổng: <b>${a + b}</b>.`] }); } },
      { level: 2, name: 'Điền số còn thiếu', fn() { const s = R(4, 9) * 10, a = R(11, s - 11); return Q({ text: `Số thích hợp điền vào chỗ chấm: <b>${a} + ... = ${s}</b>`, answer: s - a, wrongs: [s - a + 10, s - a - 10, s + a - 100 > 0 ? s + a - 100 : s - a + 1], hint: 'Muốn tìm số hạng chưa biết, lấy tổng trừ đi số hạng đã biết.', steps: [`Số cần điền = ${s} − ${a}.`, `${s} − ${a} = <b>${s - a}</b>.`], solVisual: { type: 'bar', rows: [{ label: 'Tổng', segs: [{ v: a, inner: a }, { v: s - a, inner: '?', dashed: true }] }], right: { text: s } } }); } },
      { level: 2, name: 'Tách tròn chục', fn() { const a = R(1, 8) * 10 + pick([7, 8, 9]), b = R(12, 98 - a); if (b < 12) return this.fn(); const need = 10 - a % 10; return Q({ text: `Tính nhẩm bằng cách tách để tròn chục: <b>${a} + ${b}</b>`, answer: a + b, hint: `${a} cần thêm ${need} nữa để tròn chục. Hãy tách ${need} từ ${b}.`, steps: [`Tách ${b} = ${need} + ${b - need}.`, `${a} + ${need} = ${a + need}.`, `${a + need} + ${b - need} = <b>${a + b}</b>.`] }); } },
      { level: 2, name: 'So sánh tổng', fn() { const [a, b] = addCarryPair(); const c = a + b + pick([-10, -1, 0, 1, 10]); const s = a + b > c ? '>' : a + b < c ? '<' : '='; return Q({ text: `Chọn dấu thích hợp: <b>${a} + ${b} ... ${c}</b>`, answer: s, options: ['>', '<', '='], shuffle: false, hint: 'Tính tổng vế trái trước rồi so sánh.', steps: [`${a} + ${b} = ${a + b}.`, `${a + b} ${s} ${c}.`] }); } },
      { level: 3, name: 'Tính nhanh ba số', fn() { const x = R(1, 4) * 10 + R(1, 9), y = R(1, 4) * 10 + (10 - x % 10), z = R(11, 30); if (x + y + z > 100) return this.fn(); const arr = shuffle([x, y, z]); return Q({ text: `Tính nhanh: <b>${arr.join(' + ')}</b>`, answer: x + y + z, wrongs: [x + y + z - 10, x + y + z + 10, x + y + z - 1], hint: 'Tìm hai số có hàng đơn vị cộng lại tròn chục (ví dụ 3 và 7, 6 và 4…) rồi cộng trước.', steps: [`Ghép đôi tròn chục: ${x} + ${y} = ${x + y}.`, `${x + y} + ${z} = <b>${x + y + z}</b>.`] }); } },
      { level: 3, name: 'Tìm chữ số bị che', fn() { const [a, b] = addCarryPair(); const u = a % 10; return Q({ text: `Tìm chữ số thích hợp thay cho dấu ★: <b>${Math.floor(a / 10)}★ + ${b} = ${a + b}</b>`, answer: u, hint: `Lấy tổng trừ đi số hạng đã biết: ${a + b} − ${b}.`, steps: [`${Math.floor(a / 10)}★ = ${a + b} − ${b} = ${a}.`, `Vậy ★ = <b>${u}</b>.`] }); } },
      { level: 3, name: 'Tổng lớn nhất', fn() { const d = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4).sort((a, b) => b - a); const ans = (d[0] + d[1]) * 10 + d[2] + d[3]; return Q({ text: `Dùng cả bốn chữ số <b>${shuffle(d).join(', ')}</b> lập hai số có hai chữ số sao cho tổng của chúng <b>lớn nhất</b>. Tổng đó là:`, answer: ans, wrongs: [ans - 9, ans - 18, ans + 9], hint: 'Hai chữ số lớn nhất đặt ở hàng chục, hai chữ số còn lại đặt ở hàng đơn vị.', steps: [`Hàng chục: ${d[0]} và ${d[1]}; hàng đơn vị: ${d[2]} và ${d[3]}.`, `Ví dụ: ${d[0]}${d[2]} + ${d[1]}${d[3]} = <b>${ans}</b>.`] }); } }
    ]
  });

  // =====================================================================
  // 3. TRỪ CÓ NHỚ TRONG PHẠM VI 100
  // =====================================================================
  topics.push({
    id: 'g2_sub', icon: '➖', title: 'Phép trừ có nhớ trong phạm vi 100',
    tagline: 'Mượn 1 chục thành 10 · Trừ đơn vị · Bớt 1 ở hàng chục',
    summary: 'Khi chữ số hàng đơn vị của số bị trừ bé hơn của số trừ, ta mượn 1 chục (10 đơn vị) để trừ, rồi nhớ 1 vào số trừ ở hàng chục (hoặc bớt 1 ở số bị trừ).',
    prereqs: ['g2_add'],
    rules: [
      { title: '1. Bản chất “mượn 1 chục”', desc: '52 − 27: 2 không trừ được 7, lấy 12 − 7 = 5, viết 5 nhớ 1. 2 thêm 1 bằng 3, 5 − 3 = 2, viết 2.', formula: 'Số bị trừ − Số trừ = Hiệu', example: '52 − 27 = 25', tip: 'Đã MƯỢN thì PHẢI TRẢ!', visual: { type: 'column', op: '-', a: 52, b: 27 } },
      { title: '2. Số tròn chục trừ đi một số', desc: '60 − 24: 0 không trừ được 4, lấy 10 − 4 = 6, viết 6 nhớ 1. 2 thêm 1 bằng 3, 6 − 3 = 3.', example: '60 − 24 = 36', tip: 'Không được lấy 4 − 0! Luôn lấy số trên trừ số dưới.' },
      { title: '3. Thử lại bằng phép cộng', desc: 'Hiệu + Số trừ = Số bị trừ. Nếu đúng thì phép trừ đúng.', example: '25 + 27 = 52 ✔', tip: 'Thử lại giúp con chắc chắn 100%.' }
    ],
    poem: ['Số trên bé hơn số dưới,', 'Mượn một chục nhớ mười tươi!', 'Gộp vào trừ ngay số dưới,', 'Nhớ bớt hàng chục chớ lười!'],
    pitfalls: [
      { wrong: '52 − 27 = 35 (lấy ngược 7 − 2 = 5)', right: '12 − 7 = 5, nhớ 1; 5 − 3 = 2 → 25', why: 'Tuyệt đối không trừ ngược từ dưới lên.' },
      { wrong: '63 − 28 = 45 (quên trả 1 ở hàng chục)', right: '63 − 28 = 35', why: 'Đánh dấu số nhớ để không quên.' }
    ],
    examples: [{ q: 'Đặt tính rồi tính: 84 − 39', steps: V.columnSteps(84, 39, '-'), visual: { type: 'column', op: '-', a: 84, b: 39 } }],
    gens: [
      { level: 1, name: 'Đặt tính rồi tính', fn() { const [a, b] = subBorrowPair(); return Q({ text: `Đặt tính rồi tính: <b>${a} − ${b}</b> = ?`, answer: a - b, hint: `${a % 10} không trừ được ${b % 10}, lấy ${a % 10 + 10} − ${b % 10}.`, steps: V.columnSteps(a, b, '-'), solVisual: { type: 'column', op: '-', a, b } }); } },
      { level: 1, name: 'Trắc nghiệm trừ', fn() { const [a, b] = subBorrowPair(); const rev = Math.floor(a / 10) * 10 - Math.floor(b / 10) * 10 + Math.abs(a % 10 - b % 10); return Q({ text: `Kết quả của <b>${a} − ${b}</b> là:`, answer: a - b, wrongs: [rev, a - b + 10, a - b - 1], hint: 'Đừng lấy số dưới trừ số trên ở hàng đơn vị nhé!', steps: V.columnSteps(a, b, '-'), solVisual: { type: 'column', op: '-', a, b } }); } },
      { level: 1, name: 'Tròn chục trừ', fn() { const a = R(3, 9) * 10, b = R(11, a - 5); if (b % 10 === 0) return this.fn(); return Q({ text: `Hiệu của <b>${a}</b> và <b>${b}</b> là:`, answer: a - b, wrongs: [a - b + 10, a - Math.floor(b / 10) * 10 + b % 10, a - b - 10], hint: `0 không trừ được ${b % 10}, lấy 10 − ${b % 10}.`, steps: V.columnSteps(a, b, '-'), solVisual: { type: 'column', op: '-', a, b } }); } },
      { level: 2, name: 'Tìm số bị trừ ẩn', fn() { const [a, b] = subBorrowPair(); return Q({ text: `Điền số: <b>... − ${b} = ${a - b}</b>`, answer: a, hint: 'Số bị trừ = Hiệu + Số trừ.', steps: [`Số cần điền = ${a - b} + ${b} = <b>${a}</b>.`] }); } },
      { level: 2, name: 'Bớt đi (tranh)', fn() { const it = pick(ITEMS); const a = R(12, 18), b = R(a - 9, a - 3); return Q({ text: `Có ${a} ${it.n}, bớt đi ${b} ${it.u}. Còn lại bao nhiêu ${it.u}?`, visual: { type: 'objects', groups: [{ icon: it.i, count: a, label: `${a} ${it.u}` }] }, answer: a - b, unit: it.u, hint: '“Bớt đi” → làm phép trừ.', steps: [`${a} − ${b} = <b>${a - b}</b> (${it.u}).`] }); } },
      { level: 2, name: 'Chuỗi phép tính', fn() { const a = R(60, 99), b = R(11, 29), c = R(5, 19); if (a - b - c < 5) return this.fn(); return Q({ text: `Tính: <b>${a} − ${b} − ${c}</b>`, answer: a - b - c, wrongs: [a - b + c, a - b - c + 10, a - b - c - 10], hint: 'Tính lần lượt từ trái sang phải.', steps: [`${a} − ${b} = ${a - b}.`, `${a - b} − ${c} = <b>${a - b - c}</b>.`] }); } },
      { level: 3, name: 'Hiệu đặc biệt', fn() {
        const k = R(1, 8), s = R(3, 9);
        const P = [
          ['số lớn nhất có hai chữ số', 99, 'gồm 9 chục và 9 đơn vị'], ['số bé nhất có hai chữ số', 10, 'gồm 1 chục và 0 đơn vị'],
          ['số lớn nhất có một chữ số', 9, ''], ['số tròn chục lớn nhất có hai chữ số', 90, ''],
          ['số bé nhất có hai chữ số giống nhau', 11, ''], ['số lớn nhất có hai chữ số khác nhau', 98, 'chục lớn nhất là 9, đơn vị lớn nhất khác 9 là 8'],
          ['số chẵn lớn nhất có hai chữ số', 98, ''], ['số lẻ bé nhất có hai chữ số', 11, ''], ['số lẻ lớn nhất có một chữ số', 9, ''],
          ['số chẵn lớn nhất có một chữ số', 8, ''],
          [`số lớn nhất có hai chữ số mà chữ số hàng chục là ${k}`, k * 10 + 9, `hàng chục ${k}, hàng đơn vị lớn nhất là 9`],
          [`số bé nhất có hai chữ số mà chữ số hàng chục là ${k}`, k * 10, `hàng chục ${k}, hàng đơn vị bé nhất là 0`],
          [`số lớn nhất có hai chữ số mà tổng hai chữ số bằng ${s}`, s * 10, `muốn lớn nhất thì hàng chục lớn nhất: ${s} và 0`],
          [`số bé nhất có hai chữ số mà tổng hai chữ số bằng ${s}`, 10 + s - 1, `muốn bé nhất thì hàng chục là 1, hàng đơn vị là ${s - 1}`]
        ];
        let a = pick(P), b = pick(P), g = 0; while ((a[1] === b[1]) && g++ < 30) b = pick(P); if (a[1] < b[1]) [a, b] = [b, a];
        const ans = a[1] - b[1]; const why = (o) => `${o[0][0].toUpperCase() + o[0].slice(1)}: <b>${o[1]}</b>${o[2] ? ` (${o[2]})` : ''}.`;
        return Q({ text: `Hiệu của ${a[0]} và ${b[0]} là:`, answer: ans, wrongs: [ans + 1, ans - 1, ans + 10, a[1] + b[1]], hint: 'Tìm từng số theo điều kiện trước, rồi mới trừ.', steps: [why(a), why(b), `${a[1]} − ${b[1]} = <b>${ans}</b>.`] });
      } },
      { level: 3, name: 'Giữ nguyên hiệu', fn() { const a = R(52, 98), b = R(19, 49); const k = 10 - (b % 10 || 10); return Q({ text: `Tính nhanh bằng cách thêm cùng một số vào số bị trừ và số trừ: <b>${a} − ${b}</b>`, answer: a - b, hint: `Thêm ${k} vào cả hai số để số trừ tròn chục: (${a} + ${k}) − (${b} + ${k}).`, steps: [`Thêm ${k} vào cả hai số, hiệu không đổi.`, `${a + k} − ${b + k} = <b>${a - b}</b>.`] }); } }
    ]
  });

  // =====================================================================
  // 4. CỘNG TRỪ TRONG PHẠM VI 1000
  // =====================================================================
  topics.push({
    id: 'g2_1000', icon: '💯', title: 'Cộng, trừ trong phạm vi 1000',
    tagline: 'Đặt tính 3 chữ số · Có nhớ, không nhớ',
    summary: 'Cộng, trừ số có ba chữ số làm giống như số có hai chữ số: đặt thẳng cột, tính từ hàng đơn vị → chục → trăm.',
    prereqs: ['g2_add', 'g2_sub', 'g2_numbers'],
    rules: [
      { title: 'Cộng số có ba chữ số', desc: 'Cộng lần lượt hàng đơn vị, hàng chục, hàng trăm; nhớ 1 nếu tổng ≥ 10.', example: '456 + 278 = 734', tip: 'Có thể nhớ ở cả hàng đơn vị và hàng chục.', visual: { type: 'column', op: '+', a: 456, b: 278 } },
      { title: 'Trừ số có ba chữ số', desc: 'Trừ lần lượt từ phải sang trái, mượn 1 khi cần.', example: '725 − 348 = 377', tip: 'Thử lại: 377 + 348 = 725.', visual: { type: 'column', op: '-', a: 725, b: 348 } },
      { title: 'Cộng trừ số tròn trăm', desc: 'Tính số trăm rồi viết thêm hai chữ số 0.', example: '300 + 500 = 800 (3 trăm + 5 trăm = 8 trăm)', tip: 'Tính nhẩm rất nhanh!' }
    ],
    poem: ['Ba hàng thẳng tắp như hàng quân,', 'Đơn vị, chục, trăm cứ tuần tự dần!'],
    pitfalls: [{ wrong: '456 + 278 = 624 (quên nhớ ở hàng chục)', right: '456 + 278 = 734', why: 'Hàng chục 5 + 7 + 1 = 13, viết 3 nhớ 1 sang hàng trăm.' }],
    examples: [{ q: 'Đặt tính rồi tính: 538 + 274', steps: V.columnSteps(538, 274, '+'), visual: { type: 'column', op: '+', a: 538, b: 274 } }],
    gens: [
      { level: 1, name: 'Tròn trăm', fn() { const a = R(1, 8), b = R(1, 9 - a); const add = R(0, 1); return add ? Q({ text: `Tính nhẩm: <b>${a * 100} + ${b * 100}</b>`, answer: (a + b) * 100, hint: `${a} trăm + ${b} trăm = ? trăm`, steps: [`${a} trăm + ${b} trăm = ${a + b} trăm = <b>${(a + b) * 100}</b>.`] }) : Q({ text: `Tính nhẩm: <b>${(a + b) * 100} − ${b * 100}</b>`, answer: a * 100, hint: `${a + b} trăm − ${b} trăm = ? trăm`, steps: [`${a + b} trăm − ${b} trăm = ${a} trăm = <b>${a * 100}</b>.`] }); } },
      { level: 1, name: 'Cộng không nhớ', fn() { const a = R(100, 600), b = R(100, 300); const ok = (a % 10 + b % 10 < 10) && (Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 < 10); if (!ok) return this.fn(); return Q({ text: `Đặt tính rồi tính: <b>${a} + ${b}</b>`, answer: a + b, hint: 'Cộng lần lượt từng hàng từ phải sang trái.', steps: V.columnSteps(a, b, '+'), solVisual: { type: 'column', op: '+', a, b } }); } },
      { level: 2, name: 'Cộng có nhớ', fn() { const a = R(105, 699), b = R(105, 999 - a); if (b < 105 || a % 10 + b % 10 < 10) return this.fn(); return Q({ text: `Đặt tính rồi tính: <b>${a} + ${b}</b>`, answer: a + b, hint: 'Hàng đơn vị có nhớ, đừng quên cộng 1 vào hàng chục.', steps: V.columnSteps(a, b, '+'), solVisual: { type: 'column', op: '+', a, b } }); } },
      { level: 2, name: 'Trừ có nhớ', fn() { const a = R(300, 999), b = R(105, a - 50); if (a % 10 >= b % 10) return this.fn(); return Q({ text: `Đặt tính rồi tính: <b>${a} − ${b}</b>`, answer: a - b, hint: 'Hàng đơn vị không trừ được thì mượn 1 chục.', steps: V.columnSteps(a, b, '-'), solVisual: { type: 'column', op: '-', a, b } }); } },
      { level: 2, name: 'Toán thực tế 1000', fn() { const a = R(250, 600), b = R(120, 380); return Q({ text: `Trường Kim Đồng có ${a} học sinh nam và ${b} học sinh nữ. Hỏi trường có tất cả bao nhiêu học sinh?`, answer: a + b, unit: 'học sinh', hint: '“Tất cả” → phép cộng.', steps: ['Số học sinh của trường là:', `${a} + ${b} = <b>${a + b}</b> (học sinh)`, `Đáp số: ${a + b} học sinh.`], solVisual: { type: 'bar', rows: [{ label: 'Trường', segs: [{ v: a, inner: 'Nam ' + a }, { v: b, inner: 'Nữ ' + b }] }], right: { text: '? học sinh', q: true } } }); } },
      { level: 3, name: 'Điền dấu biểu thức', fn() { const a = R(200, 500), b = R(100, 400), c = R(200, 500), d = a + b - c + pick([-1, 0, 1]) * R(0, 20); if (d < 0) return this.fn(); const l = a + b, r = c + d; const s = l > r ? '>' : l < r ? '<' : '='; return Q({ text: `Chọn dấu thích hợp: <b>${a} + ${b} ... ${c} + ${d}</b>`, answer: s, options: ['>', '<', '='], shuffle: false, hint: 'Tính giá trị từng vế rồi so sánh.', steps: [`Vế trái: ${a} + ${b} = ${l}.`, `Vế phải: ${c} + ${d} = ${r}.`, `${l} ${s} ${r}.`] }); } },
      { level: 3, name: 'Tìm số qua 2 bước', fn() { const a = R(100, 400), b = R(100, 300), c = R(50, 200); if (a + c - b < 20) return this.fn(); return Q({ text: `Một số cộng với ${b} rồi trừ đi ${c} thì được ${a}. Số đó là bao nhiêu?`, answer: a + c - b, hint: 'Tính ngược từ cuối: cộng đổi thành trừ, trừ đổi thành cộng.', steps: [`Trước khi trừ ${c}: ${a} + ${c} = ${a + c}.`, `Trước khi cộng ${b}: ${a + c} − ${b} = <b>${a + c - b}</b>.`], solVisual: { type: 'chain', items: ['?', '+' + b, '…', '−' + c, a], back: [a, '+' + c, a + c, '−' + b, a + c - b] } }); } }
    ]
  });

  // =====================================================================
  // 5. TÌM THÀNH PHẦN CHƯA BIẾT
  // =====================================================================
  topics.push({
    id: 'g2_findx', icon: '❓', title: 'Tìm thành phần chưa biết (tìm x)',
    tagline: 'Thuộc tên thành phần · Áp dụng thần chú · Tìm ra ẩn số',
    summary: 'Học sinh cần phân biệt x đang là Số hạng, Số bị trừ hay Số trừ, rồi áp dụng đúng quy tắc.',
    prereqs: ['g2_add', 'g2_sub'],
    rules: [
      { title: 'Dạng 1: Tìm số hạng', desc: 'Số hạng + Số hạng = Tổng. Muốn tìm số hạng chưa biết, lấy TỔNG trừ SỐ HẠNG ĐÃ BIẾT.', formula: 'x = Tổng − Số hạng đã biết', example: 'x + 28 = 72 → x = 72 − 28 → x = 44', tip: 'Tổng luôn là số lớn nhất trong phép cộng.', visual: { type: 'balance', left: ['x', '28'], right: ['72'] } },
      { title: 'Dạng 2: Tìm số bị trừ', desc: 'Muốn tìm số bị trừ, lấy HIỆU CỘNG SỐ TRỪ.', formula: 'x = Hiệu + Số trừ', example: 'x − 35 = 27 → x = 27 + 35 → x = 62', tip: 'x đứng đầu phép trừ là “anh cả” lớn nhất → làm phép CỘNG.', visual: { type: 'bar', rows: [{ label: 'x', segs: [{ v: 27, inner: 'Hiệu 27' }, { v: 35, inner: 'Số trừ 35' }] }], right: { text: 'x = ?', q: true } } },
      { title: 'Dạng 3: Tìm số trừ', desc: 'Muốn tìm số trừ, lấy SỐ BỊ TRỪ TRỪ ĐI HIỆU.', formula: 'x = Số bị trừ − Hiệu', example: '64 − x = 19 → x = 64 − 19 → x = 45', tip: 'x đứng sau dấu trừ: lấy số đầu trừ số cuối.' },
      { title: 'Dạng 4 (nâng cao): Hai bước', desc: 'Tính vế phải trước để đưa về dạng cơ bản.', formula: 'x + a = b + c → x + a = d → x = d − a', example: 'x + 16 = 30 + 24 → x + 16 = 54 → x = 38', tip: 'Bước 1 tính gọn vế phải; Bước 2 áp dụng quy tắc.' }
    ],
    poem: ['Muốn tìm SỐ HẠNG chưa hay,', 'Lấy TỔNG trừ bớt số này là ra!', 'Muốn tìm SỐ BỊ TRỪ to,', 'Lấy HIỆU CỘNG SỐ TRỪ cho ta liền!', 'Muốn tìm SỐ TRỪ ngoan hiền,', 'Lấy SỐ BỊ TRỪ trước, trừ liền HIỆU đi!'],
    pitfalls: [
      { wrong: '65 − x = 28 → x = 65 + 28 = 93', right: 'x = 65 − 28 = 37', why: 'x là số trừ, phải lấy số bị trừ trừ đi hiệu.' },
      { wrong: 'Viết các dấu = không thẳng hàng', right: 'Các dấu = thẳng một cột dọc', why: 'Trình bày thẳng hàng giúp không nhầm bước.' }
    ],
    examples: [
      { q: 'Tìm x: 75 − x = 38', steps: ['x là số trừ.', 'x = 75 − 38', 'x = <b>37</b>', 'Thử lại: 75 − 37 = 38 ✔'] },
      { q: 'Tìm x: x − 18 = 25 + 17', steps: ['Tính vế phải: x − 18 = 42', 'x là số bị trừ: x = 42 + 18', 'x = <b>60</b>'] }
    ],
    gens: [
      { level: 1, name: 'Tìm số hạng', fn() { const x = R(12, 69), a = R(8, 99 - x); const left = R(0, 1); const s = x + a; return Q({ text: `Tìm x, biết: <b>${left ? `x + ${a}` : `${a} + x`} = ${s}</b>`, answer: x, hint: 'x là số hạng → lấy Tổng trừ số hạng đã biết.', steps: [`x là số hạng chưa biết.`, `x = ${s} − ${a}`, `x = <b>${x}</b>`], visual: { type: 'balance', left: left ? ['x', String(a)] : [String(a), 'x'], right: [String(s)] } }); } },
      { level: 1, name: 'Chọn quy tắc', fn() { const T = [
        { t: 'Trong phép tính <b>x − 15 = 40</b>, x được gọi là:', a: 'Số bị trừ', o: ['Số bị trừ', 'Số trừ', 'Hiệu', 'Số hạng'] },
        { t: 'Trong phép tính <b>50 − x = 20</b>, x được gọi là:', a: 'Số trừ', o: ['Số bị trừ', 'Số trừ', 'Hiệu', 'Tổng'] },
        { t: 'Muốn tìm <b>số bị trừ</b>, ta lấy:', a: 'Hiệu cộng số trừ', o: ['Hiệu cộng số trừ', 'Hiệu trừ số trừ', 'Số trừ trừ hiệu', 'Tổng trừ số hạng'] },
        { t: 'Muốn tìm <b>số hạng chưa biết</b>, ta lấy:', a: 'Tổng trừ số hạng đã biết', o: ['Tổng trừ số hạng đã biết', 'Tổng cộng số hạng đã biết', 'Số hạng trừ tổng', 'Hiệu cộng số trừ'] },
        { t: 'Muốn tìm <b>số trừ</b>, ta lấy:', a: 'Số bị trừ trừ đi hiệu', o: ['Số bị trừ trừ đi hiệu', 'Hiệu cộng số trừ', 'Số bị trừ cộng hiệu', 'Hiệu trừ số bị trừ'] }
      ]; const o = pick(T); return Q({ text: o.t, answer: o.a, options: o.o, hint: 'Nhớ thần chú: Số bị trừ − Số trừ = Hiệu; Số hạng + Số hạng = Tổng.', steps: [`Đáp án đúng: <b>${o.a}</b>.`, 'Thần chú: Muốn tìm SBT lấy Hiệu + ST; muốn tìm ST lấy SBT − Hiệu.'] }); } },
      { level: 2, name: 'Tìm số bị trừ', fn() { const b = R(11, 49), d = R(11, 49); return Q({ text: `Tìm x, biết: <b>x − ${b} = ${d}</b>`, answer: b + d, wrongs: [Math.abs(d - b), b + d + 10, b + d - 10], hint: 'x là số bị trừ → lấy Hiệu cộng Số trừ.', steps: [`x = ${d} + ${b}`, `x = <b>${b + d}</b>`, `Thử lại: ${b + d} − ${b} = ${d} ✔`], solVisual: { type: 'bar', rows: [{ label: 'x', segs: [{ v: d, inner: d }, { v: b, inner: b }] }], right: { text: 'x = ?', q: true } } }); } },
      { level: 2, name: 'Tìm số trừ', fn() { const a = R(40, 99), d = R(11, a - 11); return Q({ text: `Tìm x, biết: <b>${a} − x = ${d}</b>`, answer: a - d, wrongs: [a + d, a - d + 10, a - d - 10], hint: 'x là số trừ → lấy Số bị trừ trừ đi Hiệu.', steps: [`x = ${a} − ${d}`, `x = <b>${a - d}</b>`, `Thử lại: ${a} − ${a - d} = ${d} ✔`], solVisual: { type: 'bar', rows: [{ label: String(a), segs: [{ v: a - d, inner: 'x', dashed: true }, { v: d, inner: d }] }] } }); } },
      { level: 3, name: 'Hai bước (vế phải)', fn() { const b = R(10, 40), c = R(10, 40), a = R(5, b + c - 5); const add = R(0, 1); if (add) return Q({ text: `Tìm x, biết: <b>x + ${a} = ${b} + ${c}</b>`, answer: b + c - a, hint: `Tính vế phải trước: ${b} + ${c} = ?`, steps: [`x + ${a} = ${b + c}`, `x = ${b + c} − ${a}`, `x = <b>${b + c - a}</b>`] }); return Q({ text: `Tìm x, biết: <b>x − ${a} = ${b} + ${c}</b>`, answer: b + c + a, hint: `Tính vế phải trước: ${b} + ${c} = ?`, steps: [`x − ${a} = ${b + c}`, `x = ${b + c} + ${a}`, `x = <b>${b + c + a}</b>`] }); } },
      { level: 3, name: 'Hai bước (trừ)', fn() { const a = R(60, 99), b = R(10, 30), c = R(30, 60); const rhs = a - b; if (c >= rhs) return this.fn(); return Q({ text: `Tìm x, biết: <b>${c} + x = ${a} − ${b}</b>`, answer: rhs - c, hint: `Tính vế phải: ${a} − ${b} = ?`, steps: [`${c} + x = ${rhs}`, `x = ${rhs} − ${c}`, `x = <b>${rhs - c}</b>`] }); } }
    ]
  });

  // =====================================================================
  // 6. PHÉP NHÂN, PHÉP CHIA
  // =====================================================================
  topics.push({
    id: 'g2_muldiv', icon: '✖️', title: 'Phép nhân, phép chia (bảng 2, bảng 5)',
    tagline: 'Nhân là cộng các số bằng nhau · Chia là chia đều',
    summary: 'Phép nhân là cách viết gọn của tổng các số hạng bằng nhau: 2 + 2 + 2 = 2 × 3. Phép chia là phép tính ngược của phép nhân: 6 : 2 = 3.',
    prereqs: ['g2_add'],
    rules: [
      { title: 'Ý nghĩa phép nhân', desc: '5 được lấy 3 lần: 5 + 5 + 5 = 5 × 3 = 15. Trong đó 5 và 3 là thừa số, 15 là tích.', formula: 'Thừa số × Thừa số = Tích', example: '2 × 4 = 8', tip: 'Đổi chỗ các thừa số thì tích không đổi: 2 × 5 = 5 × 2.', visual: { type: 'array', rows: 3, cols: 5, icon: '🍓' } },
      { title: 'Ý nghĩa phép chia', desc: 'Chia đều 10 cái kẹo cho 2 bạn, mỗi bạn được 10 : 2 = 5 cái.', formula: 'Số bị chia : Số chia = Thương', example: '15 : 5 = 3', tip: 'Từ 5 × 3 = 15 suy ra 15 : 5 = 3 và 15 : 3 = 5.', visual: { type: 'array', rows: 2, cols: 5, icon: '🍬', caption: '10 cái kẹo chia đều cho 2 bạn: 10 : 2 = 5' } },
      { title: 'Bảng nhân 2 và bảng nhân 5', desc: 'Bảng 2: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20. Bảng 5: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50.', example: '2 × 7 = 14; 5 × 6 = 30', tip: 'Bảng 5 luôn có tận cùng là 0 hoặc 5.' }
    ],
    poem: ['Hai nhân một là hai,', 'Thêm hai mỗi lần chẳng sai bao giờ!', 'Năm nhân đếm năm, mười, mười lăm,', 'Tận cùng không, năm nhớ chăm chỉ bài!'],
    pitfalls: [
      { wrong: '5 × 3 = 8 (nhầm sang phép cộng)', right: '5 × 3 = 5 + 5 + 5 = 15', why: 'Nhân là cộng nhiều lần cùng một số.' },
      { wrong: 'Mỗi con gà có 2 chân, 4 con gà: 2 + 4 = 6 chân', right: '2 × 4 = 8 (chân)', why: '2 chân được lấy 4 lần → phép nhân.' }
    ],
    examples: [{ q: 'Mỗi bàn có 2 bạn ngồi. Hỏi 8 bàn có bao nhiêu bạn?', steps: ['2 bạn được lấy 8 lần.', 'Số bạn là: 2 × 8 = <b>16</b> (bạn)', 'Đáp số: 16 bạn.'], visual: { type: 'array', rows: 8, cols: 2, icon: '🧒' } }],
    gens: [
      { level: 1, name: 'Bảng nhân', fn() { const a = pick([2, 5]), b = R(1, 10); return Q({ text: `Tính: <b>${a} × ${b}</b>`, answer: a * b, wrongs: [a + b, a * b + a, a * b - a], hint: `${a} được lấy ${b} lần.`, steps: [`${a} × ${b} = ${Array(b).fill(a).join(' + ')} = <b>${a * b}</b>.`], visual: b <= 10 ? { type: 'array', rows: b, cols: a, icon: a === 2 ? '🧦' : '🖐️' } : null }); } },
      { level: 1, name: 'Bảng chia', fn() { const a = pick([2, 5]), q = R(1, 10); return Q({ text: `Tính: <b>${a * q} : ${a}</b>`, answer: q, hint: `${a} nhân mấy bằng ${a * q}?`, steps: [`Vì ${a} × ${q} = ${a * q} nên ${a * q} : ${a} = <b>${q}</b>.`] }); } },
      { level: 1, name: 'Tổng thành tích', fn() { const a = R(2, 9), n = R(3, 5); return Q({ text: `Viết tổng thành phép nhân: <b>${Array(n).fill(a).join(' + ')}</b>`, answer: `${a} × ${n}`, options: [`${a} × ${n}`, `${a} × ${n + 1}`, `${a} + ${n}`, `${a} × ${n - 1}`], hint: `Số ${a} được lấy mấy lần?`, steps: [`Số ${a} được lấy ${n} lần → <b>${a} × ${n}</b> = ${a * n}.`] }); } },
      { level: 2, name: 'Toán đố nhân', fn() { const T = [['Mỗi con gà có 2 chân', 'con gà', 'chân', 2, '🐔'], ['Mỗi bàn tay có 5 ngón', 'bàn tay', 'ngón tay', 5, '🖐️'], ['Mỗi đôi đũa có 2 chiếc', 'đôi đũa', 'chiếc đũa', 2, '🥢'], ['Mỗi bông hoa có 5 cánh', 'bông hoa', 'cánh hoa', 5, '🌸'], ['Mỗi hộp có 5 cái bánh', 'hộp', 'cái bánh', 5, '📦']]; const t = pick(T), n = R(3, 9); return Q({ text: `${t[0]}. Hỏi ${n} ${t[1]} có bao nhiêu ${t[2]}?`, answer: t[3] * n, wrongs: [t[3] + n, t[3] * n + t[3], t[3] * (n - 1)], unit: t[2], hint: `${t[3]} ${t[2]} được lấy ${n} lần → phép nhân.`, steps: [`Số ${t[2]} là:`, `${t[3]} × ${n} = <b>${t[3] * n}</b> (${t[2]})`, `Đáp số: ${t[3] * n} ${t[2]}.`], solVisual: { type: 'array', rows: n, cols: t[3], icon: t[4] } }); } },
      { level: 2, name: 'Chia đều', fn() { const k = pick([2, 5]), q = R(2, 9); const it = pick(ITEMS); const byGroups = R(0, 1); return byGroups ? Q({ text: `Có ${k * q} ${it.n} chia đều cho ${k} bạn. Hỏi mỗi bạn được mấy ${it.u}?`, answer: q, unit: it.u, hint: '“Chia đều” → phép chia.', steps: [`Mỗi bạn được: ${k * q} : ${k} = <b>${q}</b> (${it.u})`], solVisual: { type: 'array', rows: k, cols: q, icon: it.i, caption: `${k * q} : ${k} = ${q}` } }) : Q({ text: `Có ${k * q} ${it.n}, xếp vào các túi, mỗi túi ${k} ${it.u}. Hỏi xếp được mấy túi?`, answer: q, unit: 'túi', hint: 'Mỗi túi có số lượng bằng nhau → phép chia.', steps: [`Số túi là: ${k * q} : ${k} = <b>${q}</b> (túi)`], solVisual: { type: 'array', rows: q, cols: k, icon: it.i, caption: `${q} túi, mỗi túi ${k}` } }); } },
      { level: 2, name: 'Thừa số – tích', fn() { const a = pick([2, 5]), b = R(2, 10); return Q({ text: `Trong phép nhân có hai thừa số là ${a} và ${b}. Tích là:`, answer: a * b, wrongs: [a + b, a * b + 1, a * (b + 1)], hint: 'Tích là kết quả của phép nhân.', steps: [`Tích = ${a} × ${b} = <b>${a * b}</b>.`] }); } },
      { level: 3, name: 'Biểu thức nhân cộng', fn() { const a = pick([2, 5]), b = R(2, 10), c = R(5, 40); const op = R(0, 1); const v = op ? a * b + c : a * b - c; if (v < 0) return this.fn(); return Q({ text: `Tính: <b>${a} × ${b} ${op ? '+' : '−'} ${c}</b>`, answer: v, wrongs: [op ? a * (b + c) : Math.abs(a * (b - c)), v + 10, v - a], hint: 'Nhân trước, cộng trừ sau.', steps: [`${a} × ${b} = ${a * b}.`, `${a * b} ${op ? '+' : '−'} ${c} = <b>${v}</b>.`] }); } },
      { level: 3, name: 'Đếm chân', fn() { const g = R(2, 6), d = R(1, 5); return Q({ text: `Trong sân có ${g} con gà và ${d} con chó. Hỏi có tất cả bao nhiêu cái chân?`, answer: g * 2 + d * 4, wrongs: [g + d, (g + d) * 2, (g + d) * 4], unit: 'chân', hint: 'Mỗi con gà có 2 chân, mỗi con chó có 4 chân.', steps: [`Chân gà: 2 × ${g} = ${g * 2}.`, `Chân chó: 4 × ${d} = ${d * 4}.`, `Tất cả: ${g * 2} + ${d * 4} = <b>${g * 2 + d * 4}</b> (chân).`], visual: { type: 'objects', groups: [{ icon: '🐔', count: g, label: g + ' con gà' }, { icon: '🐕', count: d, label: d + ' con chó' }] } }); } },
      { level: 3, name: 'Hàng và cột', fn() { const c = pick([2, 5]), r = R(2, c === 5 ? 8 : 9), add = R(0, 1), it = pick([['ghế', '🪑', 'xếp ghế'], ['cây', '🌳', 'trồng cây'], ['bàn', '🪵', 'kê bàn']]); const n = add ? r + 1 : r - 1; return Q({ text: `Cô ${it[2]} thành ${r} hàng, mỗi hàng ${c} ${it[0]}. Sau đó ${add ? `thêm ${c} ${it[0]} nữa` : `bớt đi ${c} ${it[0]}`}. Hỏi ${add ? 'có tất cả' : 'còn lại'} bao nhiêu ${it[0]}?`, answer: n * c, unit: it[0], hint: add ? `Thêm ${c} ${it[0]} tức là thêm 1 hàng nữa!` : `Bớt ${c} ${it[0]} tức là bớt đi 1 hàng!`, steps: [`${r} hàng: ${c} × ${r} = ${c * r} ${it[0]}.`, `${c * r} ${add ? '+' : '−'} ${c} = <b>${n * c}</b> (${it[0]}).`, `Cách nhanh: ${c} × ${n} = ${n * c}.`], solVisual: { type: 'array', rows: n, cols: c, icon: it[1] } }); } }
    ]
  });

  // =====================================================================
  // 7. ĐO LƯỜNG
  // =====================================================================
  const clockText = (h, m) => m === 0 ? `${h} giờ` : m === 30 ? `${h} giờ rưỡi` : `${h} giờ ${m} phút`;
  topics.push({
    id: 'g2_measure', icon: '📏', title: 'Đo lường: độ dài, khối lượng, dung tích, thời gian',
    tagline: 'cm · dm · m · km · kg · lít · giờ · ngày',
    summary: 'Học cách đổi đơn vị độ dài, tính với kg và lít, xem đồng hồ, xem lịch.',
    prereqs: ['g2_add', 'g2_sub'],
    rules: [
      { title: 'Đơn vị đo độ dài', desc: '1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m.', formula: '1 m = 10 dm = 100 cm', example: '3 dm = 30 cm; 2 m = 200 cm', tip: 'Gang tay của con dài khoảng 1 dm đấy!', visual: { type: 'ruler', max: 12, to: 10, label: '10 cm = 1 dm' } },
      { title: 'Ki-lô-gam và lít', desc: 'Tính các số như bình thường rồi ghi đơn vị kg hoặc l.', example: '25 kg + 18 kg = 43 kg; 10 l − 3 l = 7 l', tip: 'Không cộng kg với lít!', visual: { type: 'jugs', items: [{ l: 5 }, { l: 2 }, { l: 3 }] } },
      { title: 'Xem đồng hồ', desc: 'Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 3 là 15 phút, số 6 là 30 phút (rưỡi), số 9 là 45 phút.', example: '8 giờ 30 phút = 8 giờ rưỡi', tip: '1 giờ = 60 phút; 1 ngày = 24 giờ.', visual: { type: 'clock', h: 8, m: 30 } },
      { title: 'Ngày, tuần, tháng', desc: '1 tuần có 7 ngày. Cùng thứ ở tuần sau thì ngày tăng thêm 7.', example: 'Thứ Hai ngày 5 → thứ Hai tuần sau ngày 12.', tip: 'Tháng 2 có 28 hoặc 29 ngày.' }
    ],
    poem: ['Một mét bằng mười đề-xi,', 'Một trăm xăng-ti nhớ ghi trong lòng!'],
    pitfalls: [
      { wrong: '2 m 5 cm = 25 cm', right: '2 m 5 cm = 205 cm', why: '2 m = 200 cm, cộng thêm 5 cm.' },
      { wrong: 'Kim ngắn chỉ số 6 → 6 phút', right: 'Kim DÀI chỉ số 6 → 30 phút', why: 'Kim dài chỉ phút, mỗi số cách nhau 5 phút.' }
    ],
    examples: [{ q: 'Đổi: 4 dm 6 cm = ... cm', steps: ['4 dm = 40 cm.', '40 cm + 6 cm = <b>46 cm</b>.'] }],
    gens: [
      { level: 1, name: 'Đổi dm, m', fn() { const T = [['dm', 'cm', 10], ['m', 'dm', 10], ['m', 'cm', 100]]; const [a, b, k] = pick(T); const n = R(2, 9); return Q({ text: `Điền số: <b>${n} ${a} = ... ${b}</b>`, answer: n * k, wrongs: [n, n * k * 10, n + k], unit: b, hint: `1 ${a} = ${k} ${b}.`, steps: [`1 ${a} = ${k} ${b} nên ${n} ${a} = ${n} × ${k} = <b>${n * k} ${b}</b>.`] }); } },
      { level: 1, name: 'Xem đồng hồ', fn() { const h = R(1, 12), m = pick([0, 15, 30, 45]); const opts = shuffle([clockText(h, m), clockText(h, (m + 30) % 60), clockText(h % 12 + 1, m), clockText(h, (m + 15) % 60)]).filter((v, i, a) => a.indexOf(v) === i); return Q({ text: 'Đồng hồ chỉ mấy giờ?', visual: { type: 'clock', h, m }, answer: clockText(h, m), options: opts, hint: 'Kim ngắn chỉ giờ, kim dài chỉ phút (mỗi số = 5 phút).', steps: [`Kim ngắn chỉ ${m >= 30 ? `qua số ${h}` : `số ${h}`}${m ? '' : ''}, kim dài chỉ số ${m === 0 ? 12 : m / 5}.`, `Đồng hồ chỉ <b>${clockText(h, m)}</b>.`] }); } },
      { level: 1, name: 'Cộng trừ kg, lít', fn() { const u = pick(['kg', 'l']); const a = R(15, 60), b = R(5, 35); const add = R(0, 1); return Q({ text: `Tính: <b>${add ? a : a + b} ${u} ${add ? '+' : '−'} ${b} ${u}</b>`, answer: add ? a + b : a, unit: u, hint: 'Tính các số như bình thường, giữ nguyên đơn vị.', steps: [`${add ? `${a} + ${b} = ${a + b}` : `${a + b} − ${b} = ${a}`}, viết thêm đơn vị: <b>${add ? a + b : a} ${u}</b>.`] }); } },
      { level: 2, name: 'Đổi hỗn hợp', fn() { const m = R(1, 4), d = R(1, 9), c = R(1, 9); const k = R(0, 1); if (k) return Q({ text: `Điền số: <b>${d} dm ${c} cm = ... cm</b>`, answer: d * 10 + c, wrongs: [d + c, d * 100 + c, c * 10 + d], unit: 'cm', hint: `${d} dm = ${d * 10} cm.`, steps: [`${d} dm = ${d * 10} cm.`, `${d * 10} + ${c} = <b>${d * 10 + c} cm</b>.`] }); return Q({ text: `Điền số: <b>${m} m ${c} cm = ... cm</b>`, answer: m * 100 + c, wrongs: [m * 10 + c, m + c, m * 100 + c * 10], unit: 'cm', hint: `${m} m = ${m * 100} cm.`, steps: [`${m} m = ${m * 100} cm.`, `${m * 100} + ${c} = <b>${m * 100 + c} cm</b>.`] }); } },
      { level: 2, name: 'Bình nước', fn() { const a = R(10, 30), b = R(3, 9); return Q({ text: `Can thứ nhất đựng ${a} lít dầu, can thứ hai đựng ít hơn can thứ nhất ${b} lít. Hỏi can thứ hai đựng bao nhiêu lít dầu?`, answer: a - b, unit: 'l', hint: '“Ít hơn” → phép trừ.', steps: ['Số lít dầu can thứ hai đựng là:', `${a} − ${b} = <b>${a - b}</b> (l)`, `Đáp số: ${a - b} l dầu.`], visual: { type: 'jugs', items: [{ l: a, label: `${a} l` }, { l: a - b, label: '? l' }] } }); } },
      { level: 2, name: 'Xem lịch', fn() { const days = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy']; const di = R(1, 6), d = R(1, 20); const after = R(0, 1); const ans = after ? d + 7 : d; const q = after ? d : d + 7; return Q({ text: `Hôm nay là ${days[di]} ngày ${q}. ${after ? `Hỏi ${days[di]} tuần sau là ngày bao nhiêu?` : `Hỏi ${days[di]} tuần trước là ngày bao nhiêu?`}`, answer: ans, wrongs: [after ? d + 1 : q - 1, after ? d + 6 : q - 6, after ? d + 8 : q - 8], hint: '1 tuần có 7 ngày.', steps: [`Cùng thứ ở tuần ${after ? 'sau' : 'trước'} thì ${after ? 'cộng' : 'trừ'} 7 ngày.`, `${q} ${after ? '+' : '−'} 7 = <b>${ans}</b>.`] }); } },
      { level: 3, name: 'So sánh độ dài', fn() { const m = R(1, 5), x = R(5, 59), s = m * 10 > x ? '>' : m * 10 < x ? '<' : '='; return Q({ text: `Chọn dấu thích hợp: <b>${m} m ... ${x} dm</b>`, answer: s, options: ['>', '<', '='], shuffle: false, hint: 'Đổi về cùng một đơn vị rồi so sánh.', steps: [`${m} m = ${m * 10} dm.`, `${m * 10} dm ${s} ${x} dm.`] }); } },
      { level: 3, name: 'Tính thời gian', fn() { const h = R(6, 10), dh = R(1, 3); const m = pick([0, 30]); return Q({ text: `Bạn Nam bắt đầu học lúc ${clockText(h, m)}. Nam học trong ${dh} giờ. Hỏi Nam học xong lúc mấy giờ?`, answer: clockText(h + dh, m), options: shuffle([clockText(h + dh, m), clockText(h + dh + 1, m), clockText(h + dh - 1, m), clockText(h + dh, (m + 30) % 60)]), hint: 'Lấy giờ bắt đầu cộng thêm thời gian học.', steps: [`${h} + ${dh} = ${h + dh}.`, `Nam học xong lúc <b>${clockText(h + dh, m)}</b>.`], solVisual: { type: 'clock', h: h + dh, m } }); } },
      { level: 3, name: 'Đường đi', fn() { const a = R(12, 40), b = R(10, 30); return Q({ text: `Từ nhà Lan đến trường dài ${a} m, từ trường đến thư viện dài ${b} m. Lan đi từ nhà qua trường rồi đến thư viện, sau đó đi theo đường cũ về nhà. Hỏi Lan đi tất cả bao nhiêu mét?`, answer: (a + b) * 2, wrongs: [a + b, (a + b) * 2 + 10, a * 2 + b], unit: 'm', hint: 'Đi rồi lại về theo đường cũ → quãng đường gấp đôi.', steps: [`Lượt đi: ${a} + ${b} = ${a + b} (m).`, `Cả đi và về: ${a + b} + ${a + b} = <b>${(a + b) * 2}</b> (m).`] }); } }
    ]
  });

  // =====================================================================
  // 8. TIỀN VIỆT NAM
  // =====================================================================
  topics.push({
    id: 'g2_money', icon: '💵', title: 'Tiền Việt Nam',
    tagline: 'Nhận biết tờ tiền · Mua bán · Tiền trả lại',
    summary: 'Các tờ tiền thường gặp: 1 000, 2 000, 5 000, 10 000, 20 000, 50 000, 100 000 đồng. Khi mua hàng: Tiền trả lại = Tiền đưa − Tiền hàng.',
    prereqs: ['g2_1000'],
    rules: [
      { title: 'Cộng tiền', desc: 'Cộng giá trị các tờ tiền để biết tổng số tiền.', example: '10 000 + 5 000 + 2 000 = 17 000 đồng', tip: 'Tính số nghìn trước: 10 + 5 + 2 = 17 nghìn.', visual: { type: 'money', notes: [10000, 5000, 2000] } },
      { title: 'Tiền trả lại', desc: 'Đưa nhiều tiền hơn giá hàng thì được trả lại phần dư.', formula: 'Tiền thừa = Tiền đưa − Giá hàng', example: 'Mua bút 7 000 đồng, đưa 10 000 đồng → trả lại 3 000 đồng.', tip: 'Đếm thêm từ 7 nghìn lên 10 nghìn: 8, 9, 10 → 3 nghìn.' }
    ],
    poem: ['Tiền đưa trừ đi tiền hàng,', 'Ra ngay tiền thối rõ ràng chẳng sai!'],
    pitfalls: [{ wrong: 'Mua 6 000 đưa 10 000, được thối 16 000', right: '10 000 − 6 000 = 4 000 đồng', why: 'Tiền thừa luôn ít hơn tiền đưa.' }],
    examples: [{ q: 'Mẹ mua rau 8 000 đồng và thịt 20 000 đồng. Mẹ đưa 50 000 đồng. Hỏi được trả lại bao nhiêu?', steps: ['Tiền hàng: 8 000 + 20 000 = 28 000 (đồng).', 'Tiền trả lại: 50 000 − 28 000 = <b>22 000</b> (đồng).'] }],
    gens: [
      { level: 1, name: 'Đếm tiền', fn() { const notes = shuffle([1000, 2000, 5000, 10000, 20000]).slice(0, R(2, 3)); const s = notes.reduce((a, b) => a + b, 0); return Q({ text: 'Tổng số tiền trong hình là bao nhiêu đồng?', visual: { type: 'money', notes }, answer: s, wrongs: [s + 1000, s - 1000, s + 5000], unit: 'đồng', hint: 'Đổi ra số nghìn rồi cộng.', steps: [`${notes.map(fmt).join(' + ')} = <b>${fmt(s)}</b> đồng.`] }); } },
      { level: 2, name: 'Tiền trả lại', fn() { const price = R(2, 9) * 1000, pay = pick([10000, 20000]); return Q({ text: `Mua một quyển truyện giá ${fmt(price)} đồng, đưa cô bán hàng tờ ${fmt(pay)} đồng. Cô trả lại bao nhiêu tiền?`, answer: pay - price, wrongs: [pay + price, pay - price + 1000, price], unit: 'đồng', hint: 'Tiền thừa = Tiền đưa − Giá hàng.', steps: [`${fmt(pay)} − ${fmt(price)} = <b>${fmt(pay - price)}</b> (đồng).`] }); } },
      { level: 2, name: 'Đổi tiền', fn() { const B = [1000, 2000, 5000, 10000, 20000, 50000, 100000], S = [200, 500, 1000, 2000, 5000, 10000]; const pairs = []; B.forEach(b => S.forEach(s => { if (b > s && b % s === 0 && b / s <= 10) pairs.push([b, s]); })); const [big, small] = pick(pairs); const k = big / small; if (R(0, 1) || ![2, 5].includes(k)) return Q({ text: `Đổi 1 tờ ${fmt(big)} đồng được bao nhiêu tờ ${fmt(small)} đồng?`, answer: k, unit: 'tờ', hint: `${fmt(small)} lấy mấy lần thì được ${fmt(big)}?`, steps: [`${fmt(small)} × ${k} = ${fmt(big)}.`, `Vậy đổi được <b>${k}</b> tờ.`] }); const m = R(2, 4); return Q({ text: `Có ${m * k} tờ ${fmt(small)} đồng. Đổi được bao nhiêu tờ ${fmt(big)} đồng?`, answer: m, unit: 'tờ', hint: `Cứ ${k} tờ ${fmt(small)} đồng đổi được 1 tờ ${fmt(big)} đồng.`, steps: [`${k} tờ ${fmt(small)} đồng = 1 tờ ${fmt(big)} đồng.`, `${m * k} : ${k} = <b>${m}</b> (tờ).`] }); } },
      { level: 3, name: 'Mua nhiều món', fn() { const a = R(3, 9) * 1000, b = R(5, 15) * 1000, pay = 50000; return Q({ text: `Mai mua 1 hộp bút giá ${fmt(b)} đồng và 2 quyển vở, mỗi quyển giá ${fmt(a)} đồng. Mai đưa ${fmt(pay)} đồng. Hỏi được trả lại bao nhiêu?`, answer: pay - b - 2 * a, wrongs: [pay - b - a, pay - 2 * a, b + 2 * a], unit: 'đồng', hint: '2 quyển vở → nhân 2. Tính tổng tiền hàng trước.', steps: [`Tiền vở: ${fmt(a)} × 2 = ${fmt(2 * a)}.`, `Tổng: ${fmt(2 * a)} + ${fmt(b)} = ${fmt(2 * a + b)}.`, `Trả lại: ${fmt(pay)} − ${fmt(2 * a + b)} = <b>${fmt(pay - b - 2 * a)}</b> đồng.`] }); } }
    ]
  });

  // =====================================================================
  // 9. HÌNH HỌC
  // =====================================================================
  topics.push({
    id: 'g2_geometry', icon: '📐', title: 'Hình học: đường gấp khúc, hình phẳng, đếm hình',
    tagline: 'Điểm · Đoạn thẳng · Đường gấp khúc · Tứ giác · Đếm hình',
    summary: 'Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng. Nhận biết hình tam giác, tứ giác, hình chữ nhật, hình vuông, hình tròn; khối trụ, khối cầu, khối hộp.',
    prereqs: ['g2_add', 'g2_muldiv'],
    rules: [
      { title: 'Độ dài đường gấp khúc', desc: 'Cộng độ dài tất cả các đoạn thẳng tạo nên đường gấp khúc.', formula: 'Độ dài = đoạn 1 + đoạn 2 + đoạn 3 + …', example: 'AB = 3 cm, BC = 4 cm, CD = 5 cm → ABCD dài 12 cm', tip: 'Nếu các đoạn bằng nhau, dùng phép nhân cho nhanh.', visual: { type: 'shape', kind: 'polyline', segs: ['3 cm', '4 cm', '5 cm'] } },
      { title: 'Hình tứ giác', desc: 'Hình có 4 cạnh, 4 đỉnh. Hình chữ nhật và hình vuông đều là tứ giác.', example: 'Hình vuông có 4 cạnh bằng nhau.', tip: 'Đếm số cạnh để gọi tên hình.', visual: { type: 'shape', kind: 'rect', vnames: ['A', 'B', 'C', 'D'] } },
      { title: 'Đếm đoạn thẳng', desc: 'Trên một đường thẳng có n điểm, nối từng cặp điểm.', example: '3 điểm A, B, C → các đoạn AB, AC, BC: 3 đoạn', tip: 'Đếm có thứ tự: bắt đầu từ A nối với các điểm sau, rồi đến B…', visual: { type: 'shape', kind: 'segment', points: [{ x: 40, n: 'A' }, { x: 150, n: 'B' }, { x: 260, n: 'C' }] } }
    ],
    poem: ['Gấp khúc từng đoạn cộng vào,', 'Bằng nhau nhân lại thế nào cũng ra!'],
    pitfalls: [{ wrong: 'Đường gấp khúc 3 đoạn, mỗi đoạn 4 cm: 4 + 3 = 7 cm', right: '4 × 3 = 12 cm', why: '4 cm được lấy 3 lần.' }],
    examples: [{ q: 'Đường gấp khúc ABCD có AB = 5 cm, BC = 7 cm, CD = 6 cm. Tính độ dài.', steps: ['Độ dài đường gấp khúc ABCD là:', '5 + 7 + 6 = <b>18</b> (cm)'], visual: { type: 'shape', kind: 'polyline', segs: ['5 cm', '7 cm', '6 cm'] } }],
    gens: [
      { level: 1, name: 'Đường gấp khúc', fn() { const n = R(2, 4); const s = Array.from({ length: n }, () => R(2, 15)); const t = s.reduce((a, b) => a + b, 0); return Q({ text: `Tính độ dài đường gấp khúc ${'ABCDE'.slice(0, n + 1)} trong hình.`, visual: { type: 'shape', kind: 'polyline', segs: s.map(x => x + ' cm') }, answer: t, unit: 'cm', hint: 'Cộng độ dài tất cả các đoạn.', steps: [`${s.join(' + ')} = <b>${t}</b> (cm).`] }); } },
      { level: 1, name: 'Nhận dạng hình', fn() { const T = [['rect', 'Hình chữ nhật'], ['square', 'Hình vuông'], ['tri', 'Hình tam giác'], ['circle', 'Hình tròn'], ['para', 'Hình tứ giác']]; const t = pick(T); return Q({ text: 'Hình dưới đây là hình gì?', visual: { type: 'shape', kind: t[0] }, answer: t[1], options: T.map(x => x[1]).filter(x => x !== t[1]).slice(0, 3).concat([t[1]]), hint: 'Đếm số cạnh, xem các cạnh có bằng nhau không.', steps: [`Đó là <b>${t[1]}</b>.`] }); } },
      { level: 2, name: 'Gấp khúc bằng nhau', fn() { const n = R(3, 5), a = pick([2, 5]); return Q({ text: `Đường gấp khúc ${'ABCDEG'.slice(0, n + 1)} (hình dưới) gồm ${n} đoạn thẳng, mỗi đoạn dài ${a} cm. Độ dài đường gấp khúc là:`, answer: a * n, wrongs: [a + n, a * n + a, a * (n - 1)], unit: 'cm', hint: `${a} cm được lấy ${n} lần.`, steps: [`${a} × ${n} = <b>${a * n}</b> (cm).`], visual: { type: 'shape', kind: 'polyline', segs: Array(n).fill(a + ' cm'), names: 'ABCDEG'.slice(0, n + 1).split('') } }); } },
      { level: 2, name: 'Độ dài 3 cạnh', fn() { const a = R(3, 9), b = R(3, 9), c = R(3, 9); if (a + b <= c || a + c <= b || b + c <= a) return this.fn(); return Q({ text: `Hình tam giác có ba cạnh dài ${a} cm, ${b} cm, ${c} cm. Tổng độ dài các cạnh là:`, answer: a + b + c, unit: 'cm', visual: { type: 'shape', kind: 'tri', labels: { a: a + ' cm', b: b + ' cm', c: c + ' cm' } }, hint: 'Cộng độ dài 3 cạnh.', steps: [`${a} + ${b} + ${c} = <b>${a + b + c}</b> (cm).`] }); } },
      { level: 3, name: 'Đếm đoạn thẳng', fn() {
        const L = pick(['ABCDEF', 'MNPQRS', 'EGHIKL']); const n = R(3, 6); const ls = L.slice(0, n).split('');
        const pts = ls.map((c, i) => ({ x: 30 + i * (240 / (n - 1)), n: c })); const all = n * (n - 1) / 2; const kind = R(1, 3);
        if (kind === 2) { const c = pick(ls); return Q({ text: `Trên hình có ${n} điểm thẳng hàng ${ls.join(', ')}. Có bao nhiêu đoạn thẳng có một đầu là điểm <b>${c}</b>?`, visual: { type: 'shape', kind: 'segment', points: pts }, answer: n - 1, wrongs: [n, n - 2, all], unit: 'đoạn', hint: `Nối ${c} với từng điểm còn lại.`, steps: [`Các đoạn: ${ls.filter(x => x !== c).map(x => ls.indexOf(x) < ls.indexOf(c) ? x + c : c + x).join(', ')}.`, `Có <b>${n - 1}</b> đoạn.`] }); }
        if (kind === 3) { const c = pick(ls); const ans = all - (n - 1); return Q({ text: `Trên hình có ${n} điểm thẳng hàng ${ls.join(', ')}. Có bao nhiêu đoạn thẳng <b>không</b> có đầu nào là điểm ${c}?`, visual: { type: 'shape', kind: 'segment', points: pts }, answer: ans, wrongs: [all, n - 1, ans + 1], unit: 'đoạn', hint: 'Đếm tất cả các đoạn, rồi bớt đi các đoạn có đầu là ' + c + '.', steps: [`Tất cả: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = ${all} đoạn.`, `Có ${n - 1} đoạn có đầu là ${c}.`, `${all} − ${n - 1} = <b>${ans}</b> đoạn.`] }); }
        return Q({ text: `Trên hình có ${n} điểm thẳng hàng ${ls.join(', ')}. Có tất cả bao nhiêu đoạn thẳng?`, visual: { type: 'shape', kind: 'segment', points: pts }, answer: all, wrongs: [n - 1, n, all + 1], unit: 'đoạn', hint: `Đếm có thứ tự: các đoạn bắt đầu từ ${ls[0]}, rồi từ ${ls[1]}, …`, steps: Array.from({ length: n - 1 }, (_, i) => `Bắt đầu từ ${ls[i]}: ${n - 1 - i} đoạn (${ls.slice(i + 1).map(c => ls[i] + c).join(', ')}).`).concat([`Tổng: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = <b>${all}</b> đoạn.`]) });
      } },
      { level: 3, name: 'Đếm hình tam giác', fn() {
        const n = R(2, 6); const ans = n * (n + 1) / 2; const named = n <= 4 && R(0, 1);
        const base = ['B'].concat('MNP'.slice(0, n - 1).split(''), ['C']);
        const visual = MA.Vis.G.fanTri(n, named ? { names: base } : {});
        const list = []; if (named) for (let i = 0; i < base.length; i++) for (let j = i + 1; j < base.length; j++) list.push('A' + base[i] + base[j]);
        return Q({ text: 'Hình dưới đây có tất cả bao nhiêu hình tam giác?', visual, answer: ans, wrongs: [n, n + 1, ans + 1, ans - 1], unit: 'hình', hint: `Cạnh đáy được chia thành ${n} phần. Mỗi phần (hoặc mấy phần liền nhau ghép lại) cùng với đỉnh trên cùng tạo thành 1 hình tam giác.`, steps: [`Tam giác 1 phần: ${n}; ${Array.from({ length: n - 1 }, (_, i) => `ghép ${i + 2} phần: ${n - i - 1}`).join('; ')}.`].concat(named ? [`Đó là: ${list.join(', ')}.`] : []).concat([`Tổng: ${Array.from({ length: n }, (_, i) => n - i).join(' + ')} = <b>${ans}</b> hình tam giác.`]) });
      } }
    ]
  });

  // =====================================================================
  // 10. GIẢI TOÁN CÓ LỜI VĂN
  // =====================================================================
  topics.push({
    id: 'g2_word', icon: '📖', title: 'Giải toán có lời văn',
    tagline: 'Sơ đồ đoạn thẳng · Nhiều hơn · Ít hơn · Hai bước',
    summary: 'Đọc kĩ đề, tóm tắt bằng sơ đồ đoạn thẳng, chọn phép tính đúng, viết câu lời giải, phép tính kèm đơn vị và đáp số.',
    prereqs: ['g2_add', 'g2_sub'],
    rules: [
      { title: 'Quy trình 4 bước vàng', desc: '1) Đọc kĩ đề 2–3 lần. 2) Tóm tắt, vẽ sơ đồ. 3) Viết lời giải + phép tính + đơn vị. 4) Viết đáp số và thử lại.', example: 'Bài giải:\nSố quả cam còn lại là:\n45 − 18 = 27 (quả)\nĐáp số: 27 quả cam.', tip: 'Gạch chân từ khóa: “nhiều hơn”, “ít hơn”, “tất cả”, “còn lại”.' },
      { title: 'Bài toán “nhiều hơn”', desc: 'Đoạn của bạn nhiều hơn DÀI HƠN. Tìm số lớn → phép CỘNG.', formula: 'Số lớn = Số bé + Phần hơn', example: 'Lan có 28 quyển vở, Nam nhiều hơn Lan 15 quyển → Nam: 28 + 15 = 43 (quyển)', tip: 'Vẽ đoạn Nam dài hơn đoạn Lan một đoạn ứng với 15.', visual: { type: 'bar', rows: [{ label: 'Lan', segs: [{ v: 28, inner: '28' }] }, { label: 'Nam', segs: [{ v: 28, inner: '28' }, { v: 15, inner: '15', text: 'nhiều hơn' }] }], right: { text: '?', q: true } } },
      { title: 'Bài toán “ít hơn”', desc: 'Đoạn của bạn ít hơn NGẮN HƠN. Tìm số bé → phép TRỪ.', formula: 'Số bé = Số lớn − Phần kém', example: 'Thùng 1 có 65 l, thùng 2 ít hơn 18 l → thùng 2: 65 − 18 = 47 (l)', tip: 'Phải xác định AI nhiều, AI ít trước khi chọn phép tính!' }
    ],
    poem: ['Đọc đề cẩn thận ba lần,', 'Sơ đồ đoạn thẳng vẽ dần hiện ra!', 'Nhiều hơn làm phép CỘNG nha,', 'Ít hơn làm TRỪ mới là chuẩn nhanh!'],
    pitfalls: [
      { wrong: '“Hà có 35 viên bi, nhiều hơn An 10 viên. Hỏi An?” → 35 + 10 = 45', right: 'An ít hơn Hà → 35 − 10 = 25 (viên)', why: 'Thấy “nhiều hơn” chưa chắc là cộng — phải xem ai nhiều hơn ai.' },
      { wrong: 'Quên viết đơn vị hoặc đáp số', right: '35 + 28 = 63 (kg). Đáp số: 63 kg.', why: 'Thiếu đơn vị/đáp số sẽ bị trừ điểm.' }
    ],
    examples: [{ q: 'Cửa hàng có 54 quả bưởi, buổi sáng bán 27 quả. Hỏi còn lại bao nhiêu quả?', steps: ['Số quả bưởi còn lại là:', '54 − 27 = <b>27</b> (quả)', 'Đáp số: 27 quả bưởi.'], visual: { type: 'bar', rows: [{ label: 'Có', segs: [{ v: 27, inner: 'Đã bán 27' }, { v: 27, inner: 'Còn ?', dashed: true }] }], right: { text: '54 quả' } } }],
    gens: [
      { level: 1, name: 'Gộp – tất cả', fn() { const [a, b] = two(); const it = pick(ITEMS); const x = R(12, 50), y = R(8, 45); return Q({ text: `${a} có ${x} ${it.n}, ${b} có ${y} ${it.n}. Hỏi cả hai bạn có tất cả bao nhiêu ${it.n}?`, answer: x + y, unit: it.u, hint: '“Tất cả” → phép cộng.', steps: [`Cả hai bạn có số ${it.n} là:`, `${x} + ${y} = <b>${x + y}</b> (${it.u})`, `Đáp số: ${x + y} ${it.n}.`], solVisual: { type: 'bar', rows: [{ label: 'Cả hai', segs: [{ v: x, inner: `${a} ${x}` }, { v: y, inner: `${b} ${y}` }] }], right: { text: '?', q: true } } }); } },
      { level: 1, name: 'Còn lại', fn() { const it = pick(ITEMS); const a = R(30, 95), b = R(11, a - 8); const [n] = two(); return Q({ text: `${n} có ${a} ${it.n}, ${n} cho bạn ${b} ${it.u}. Hỏi ${n} còn lại bao nhiêu ${it.u}?`, answer: a - b, unit: it.u, hint: '“Cho bạn… còn lại” → phép trừ.', steps: [`Số ${it.n} ${n} còn lại là:`, `${a} − ${b} = <b>${a - b}</b> (${it.u})`, `Đáp số: ${a - b} ${it.n}.`], solVisual: { type: 'bar', rows: [{ label: 'Có', segs: [{ v: b, inner: 'Cho ' + b }, { v: a - b, inner: '?', dashed: true }] }], right: { text: a } } }); } },
      { level: 2, name: 'Nhiều hơn', fn() { const [a, b] = two(); const it = pick(ITEMS); const x = R(15, 50), d = R(5, 30); return Q({ text: `${a} có ${x} ${it.n}. ${b} có nhiều hơn ${a} ${d} ${it.u}. Hỏi ${b} có bao nhiêu ${it.n}?`, answer: x + d, wrongs: [x - d, x + d + 10, d], unit: it.u, hint: `${b} nhiều hơn → đoạn của ${b} dài hơn → phép cộng.`, steps: [`Số ${it.n} của ${b} là:`, `${x} + ${d} = <b>${x + d}</b> (${it.u})`, `Đáp số: ${x + d} ${it.n}.`], solVisual: { type: 'bar', rows: [{ label: a, segs: [{ v: x, inner: x }] }, { label: b, segs: [{ v: x, inner: x }, { v: d, inner: d, text: 'nhiều hơn' }] }], right: { text: '?', q: true } } }); } },
      { level: 2, name: 'Ít hơn', fn() { const [a, b] = two(); const it = pick(ITEMS); const x = R(30, 90), d = R(6, x - 10); return Q({ text: `${a} có ${x} ${it.n}. ${b} có ít hơn ${a} ${d} ${it.u}. Hỏi ${b} có bao nhiêu ${it.n}?`, answer: x - d, wrongs: [x + d, x - d - 10, d], unit: it.u, hint: `${b} ít hơn → đoạn của ${b} ngắn hơn → phép trừ.`, steps: [`Số ${it.n} của ${b} là:`, `${x} − ${d} = <b>${x - d}</b> (${it.u})`, `Đáp số: ${x - d} ${it.n}.`], solVisual: { type: 'bar', rows: [{ label: a, segs: [{ v: x - d, inner: '' }, { v: d, inner: d, text: 'ít hơn' }] }, { label: b, segs: [{ v: x - d, inner: '?' }] }] } }); } },
      { level: 2, name: 'Bẫy “nhiều hơn”', fn() { const [a, b] = two(); const it = pick(ITEMS); const x = R(30, 80), d = R(5, 20); return Q({ text: `${a} có ${x} ${it.n} và có <u>nhiều hơn</u> ${b} ${d} ${it.u}. Hỏi ${b} có bao nhiêu ${it.n}?`, answer: x - d, wrongs: [x + d, d, x], unit: it.u, hint: `Ai nhiều hơn? ${a} nhiều hơn → ${b} ít hơn → phép trừ!`, steps: [`${a} nhiều hơn ${b} nghĩa là ${b} ít hơn ${a} ${d} ${it.u}.`, `Số ${it.n} của ${b}: ${x} − ${d} = <b>${x - d}</b> (${it.u}).`], solVisual: { type: 'bar', rows: [{ label: a, segs: [{ v: x - d, inner: '' }, { v: d, inner: d, text: 'nhiều hơn' }] }, { label: b, segs: [{ v: x - d, inner: '?' }] }] } }); } },
      { level: 2, name: 'Hơn kém bao nhiêu', fn() { const [a, b] = two(); const it = pick(ITEMS); const x = R(40, 90), y = R(10, x - 5); return Q({ text: `${a} có ${x} ${it.n}, ${b} có ${y} ${it.n}. Hỏi ${a} có nhiều hơn ${b} bao nhiêu ${it.u}?`, answer: x - y, wrongs: [x + y, x - y + 10, y], unit: it.u, hint: 'Tìm phần hơn: lấy số lớn trừ số bé.', steps: [`${x} − ${y} = <b>${x - y}</b> (${it.u}).`], solVisual: { type: 'bar', rows: [{ label: a, segs: [{ v: y, inner: y }, { v: x - y, inner: '?', text: 'hơn', q: true }] }, { label: b, segs: [{ v: y, inner: y }] }] } }); } },
      { level: 3, name: 'Hai bước: cả hai', fn() { const [a, b] = two(); const it = pick(ITEMS); const x = R(15, 40), d = R(5, 15); const more = R(0, 1); const y = more ? x + d : x - d; return Q({ text: `${a} có ${x} ${it.n}. ${b} có ${more ? 'nhiều' : 'ít'} hơn ${a} ${d} ${it.u}. Hỏi cả hai bạn có bao nhiêu ${it.n}?`, answer: x + y, wrongs: [y, x + d, x + y + d], unit: it.u, hint: `Bước 1: tìm số ${it.n} của ${b}. Bước 2: cộng cả hai.`, steps: [`Số ${it.n} của ${b}: ${x} ${more ? '+' : '−'} ${d} = ${y} (${it.u}).`, `Cả hai bạn: ${x} + ${y} = <b>${x + y}</b> (${it.u}).`, `Đáp số: ${x + y} ${it.n}.`], solVisual: { type: 'bar', rows: [{ label: a, segs: [{ v: x, inner: x }] }, { label: b, segs: more ? [{ v: x, inner: '' }, { v: d, inner: d, text: 'hơn' }] : [{ v: y, inner: '' }] }], right: { text: '?', q: true } } }); } },
      { level: 3, name: 'Tuổi', fn() { const m = R(28, 40), c = R(5, 10), k = R(2, 6); const q = R(0, 1); return q ? Q({ text: `Năm nay mẹ ${m} tuổi, con ${c} tuổi. Hỏi sau ${k} năm nữa mẹ hơn con bao nhiêu tuổi?`, answer: m - c, wrongs: [m - c + k, m - c - k, m + c], unit: 'tuổi', hint: 'Mỗi năm mẹ và con đều thêm 1 tuổi → hiệu số tuổi KHÔNG ĐỔI!', steps: ['Hiệu số tuổi của hai người không thay đổi theo thời gian.', `Mẹ hơn con: ${m} − ${c} = <b>${m - c}</b> (tuổi).`] }) : Q({ text: `Năm nay con ${c} tuổi, mẹ hơn con ${m - c} tuổi. Hỏi ${k} năm nữa mẹ bao nhiêu tuổi?`, answer: m + k, wrongs: [m, m - k, m + k + 1], unit: 'tuổi', hint: 'Tìm tuổi mẹ năm nay trước.', steps: [`Tuổi mẹ năm nay: ${c} + ${m - c} = ${m} (tuổi).`, `${k} năm nữa: ${m} + ${k} = <b>${m + k}</b> (tuổi).`] }); } },
      { level: 3, name: 'Thêm bớt nhiều lần', fn() { const a = R(30, 60), b = R(10, 25), c = R(5, 20); const it = pick(ITEMS); return Q({ text: `Trong hộp có ${a} ${it.n}. Lan lấy ra ${b} ${it.u}, sau đó mẹ bỏ thêm vào ${c} ${it.u}. Hỏi trong hộp lúc này có bao nhiêu ${it.u}?`, answer: a - b + c, wrongs: [a + b + c, a - b - c, a + b - c], unit: it.u, hint: 'Lấy ra → trừ; bỏ thêm → cộng.', steps: [`Sau khi lấy ra: ${a} − ${b} = ${a - b}.`, `Sau khi bỏ thêm: ${a - b} + ${c} = <b>${a - b + c}</b> (${it.u}).`], solVisual: { type: 'chain', items: [a, '−' + b, a - b, '+' + c, '?'] } }); } }
    ]
  });

  // =====================================================================
  // 11. TƯ DUY NÂNG CAO
  // =====================================================================
  topics.push({
    id: 'g2_logic', icon: '🧠', title: 'Toán tư duy & nâng cao lớp 2',
    tagline: 'Quy luật dãy số · Tính ngược · Trồng cây · Suy luận',
    summary: 'Dành cho các bạn muốn thử thách bản thân, chuẩn bị cho các kì thi Toán tuổi thơ, Kangaroo, Timo.',
    prereqs: ['g2_add', 'g2_sub', 'g2_findx'],
    rules: [
      { title: '1. Quy luật dãy số', desc: 'Tìm “bước nhảy”: lấy số sau trừ số trước.', example: '3, 7, 11, 15, … → cộng 4 mỗi lần → số tiếp theo 19.', tip: 'Có dãy cộng, có dãy trừ, có dãy bước nhảy tăng dần.', visual: { type: 'sequence', items: [3, 7, 11, 15, '?'], steps: ['+4', '+4', '+4', '+4'] } },
      { title: '2. Tính ngược từ cuối', desc: 'Đi ngược lại: cộng đổi thành trừ, trừ đổi thành cộng.', example: 'Nghĩ một số, cộng 25 rồi trừ 14 được 41 → 41 + 14 = 55; 55 − 25 = 30.', tip: 'Giống như tua ngược cuốn phim!', visual: { type: 'chain', items: ['?', '+25', 55, '−14', 41], back: [41, '+14', 55, '−25', 30] } },
      { title: '3. Trồng cây', desc: 'Trồng ở cả hai đầu: Số cây = Số khoảng + 1. Chỉ một đầu: bằng nhau. Không trồng ở hai đầu: Số khoảng − 1.', example: 'Đường dài 20 m, cách 5 m trồng 1 cây (cả hai đầu): 20 : 5 = 4 khoảng → 5 cây.', tip: '5 ngón tay có 4 khe hở!', visual: { type: 'trees', gaps: 4, label: '5 m' } }
    ],
    poem: ['Gặp bài toán khó chớ lo,', 'Nhìn xem quy luật nhỏ to thế nào!', 'Tính ngược từ cuối ra mau,', 'Suy luận từng bước, đỉnh cao điểm mười!'],
    pitfalls: [{ wrong: 'Đường 4 khoảng, trồng cả 2 đầu → 4 cây', right: '4 + 1 = 5 cây', why: 'Luôn vẽ hình ra nháp để đếm.' }],
    examples: [{ q: 'Điền số tiếp theo: 2, 5, 8, 11, 14, …', steps: ['Bước nhảy: 5 − 2 = 3.', 'Số tiếp theo: 14 + 3 = <b>17</b>.'], visual: { type: 'sequence', items: [2, 5, 8, 11, 14, '?'], steps: ['+3', '+3', '+3', '+3', '+3'] } }],
    gens: [
      { level: 2, name: 'Dãy cách đều', fn() { const s = R(1, 20), d = R(2, 9), down = R(0, 1); const arr = Array.from({ length: 5 }, (_, i) => down ? s + d * 5 - i * d : s + i * d); const ans = down ? arr[4] - d : arr[4] + d; return Q({ text: `Tìm số tiếp theo của dãy: <b>${arr.join(', ')}, …</b>`, answer: ans, wrongs: [ans + 1, ans - 1, down ? ans - d : ans + d], hint: 'Lấy số thứ hai trừ số thứ nhất để tìm bước nhảy.', steps: [`Bước nhảy: ${down ? '−' : '+'}${d}.`, `${arr[4]} ${down ? '−' : '+'} ${d} = <b>${ans}</b>.`], solVisual: { type: 'sequence', items: arr.concat([ans]), steps: Array(5).fill((down ? '−' : '+') + d) } }); } },
      { level: 2, name: 'Số ở giữa dãy', fn() { const s = R(2, 30), d = R(2, 10); const arr = Array.from({ length: 6 }, (_, i) => s + i * d); const k = R(1, 4); const ans = arr[k]; const show = arr.map((x, i) => i === k ? '?' : x); return Q({ text: `Tìm số còn thiếu: <b>${show.join(', ')}</b>`, answer: ans, hint: 'Tìm bước nhảy từ hai số liền nhau đã biết.', steps: [`Bước nhảy: +${d}.`, `Số còn thiếu: ${arr[k - 1]} + ${d} = <b>${ans}</b>.`], visual: { type: 'sequence', items: show } }); } },
      { level: 3, name: 'Dãy bước nhảy tăng', fn() { const s = R(1, 10), d0 = R(1, 3); const arr = [s]; for (let i = 0; i < 4; i++) arr.push(arr[i] + d0 + i); const ans = arr[4] + d0 + 4; return Q({ text: `Tìm số tiếp theo: <b>${arr.join(', ')}, …</b>`, answer: ans, wrongs: [ans - 1, ans + 1, arr[4] + d0 + 3], hint: 'Xem các bước nhảy: chúng tăng dần thêm 1!', steps: [`Các bước nhảy: ${arr.slice(1).map((x, i) => '+' + (x - arr[i])).join(', ')}.`, `Bước tiếp theo: +${d0 + 4}.`, `${arr[4]} + ${d0 + 4} = <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Tính ngược', fn() { const x = R(10, 40), a = R(10, 30), b = R(5, x + a - 5); const r = x + a - b; return Q({ text: `Bạn Minh nghĩ một số. Lấy số đó cộng với ${a} rồi trừ đi ${b} thì được ${r}. Hỏi Minh nghĩ số nào?`, answer: x, wrongs: [r + a - b, r + a + b, x + 10], hint: 'Đi ngược từ cuối: cộng đổi thành trừ, trừ đổi thành cộng.', steps: [`Trước khi trừ ${b}: ${r} + ${b} = ${r + b}.`, `Trước khi cộng ${a}: ${r + b} − ${a} = <b>${x}</b>.`], solVisual: { type: 'chain', items: ['?', '+' + a, r + b, '−' + b, r], back: [r, '+' + b, r + b, '−' + a, x] } }); } },
      { level: 3, name: 'Trồng cây', fn() { const k = pick([2, 5]), gaps = R(3, 8), L = k * gaps; const mode = pick(['both', 'one', 'none']); const ans = mode === 'both' ? gaps + 1 : mode === 'one' ? gaps : gaps - 1; const txt = { both: 'trồng cả ở hai đầu đường', one: 'chỉ trồng ở một đầu đường', none: 'không trồng ở hai đầu đường' }[mode]; return Q({ text: `Một đoạn đường dài ${L} m. Người ta trồng cây cách đều nhau ${k} m (${txt}). Hỏi trồng được bao nhiêu cây?`, answer: ans, wrongs: [gaps, gaps + 1, gaps - 1, gaps + 2].filter(x => x !== ans), unit: 'cây', hint: `Số khoảng cách = ${L} : ${k}.`, steps: [`Số khoảng cách: ${L} : ${k} = ${gaps}.`, mode === 'both' ? `Trồng cả hai đầu: ${gaps} + 1 = <b>${ans}</b> cây.` : mode === 'one' ? `Một đầu: số cây = số khoảng = <b>${ans}</b> cây.` : `Không trồng hai đầu: ${gaps} − 1 = <b>${ans}</b> cây.`], solVisual: { type: 'trees', gaps, ends: mode, label: k + ' m' } }); } },
      { level: 3, name: 'Tổng chữ số', fn() { const s = R(5, 15); const big = R(0, 1); let ans; if (big) { for (let n = 99; n >= 10; n--) if (Math.floor(n / 10) + n % 10 === s) { ans = n; break; } } else { for (let n = 10; n < 100; n++) if (Math.floor(n / 10) + n % 10 === s) { ans = n; break; } } return Q({ text: `Tìm số ${big ? 'lớn nhất' : 'bé nhất'} có hai chữ số mà tổng hai chữ số bằng ${s}.`, answer: ans, hint: big ? 'Chọn chữ số hàng chục lớn nhất có thể.' : 'Chọn chữ số hàng chục bé nhất có thể (hàng đơn vị tối đa là 9).', steps: [`Hàng chục ${big ? 'lớn nhất' : 'bé nhất'} có thể là ${Math.floor(ans / 10)}, hàng đơn vị: ${s} − ${Math.floor(ans / 10)} = ${ans % 10}.`, `Số cần tìm: <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Bắt tay – đếm cặp', fn() { const n = R(3, 8); const ans = n * (n - 1) / 2; const C = pick([[`Có ${n} bạn gặp nhau, mỗi bạn bắt tay với từng bạn còn lại đúng một lần. Hỏi có tất cả bao nhiêu cái bắt tay?`], [`Có ${n} đội bóng thi đấu, mỗi đội gặp từng đội còn lại đúng một trận. Hỏi có tất cả bao nhiêu trận đấu?`], [`Nhóm có ${n} bạn, cứ hai bạn thì chụp chung đúng một tấm ảnh. Hỏi có tất cả bao nhiêu tấm ảnh?`]]); return Q({ text: C[0], answer: ans, wrongs: [n * (n - 1), n, ans + 1], hint: 'Bạn thứ nhất bắt tay với (n − 1) bạn, bạn thứ hai bắt thêm với (n − 2) bạn mới…', steps: [`Số cái bắt tay: ${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')} = <b>${ans}</b>.`] }); } },
      { level: 3, name: 'Cân thăng bằng', fn() { const a = R(2, 5), b = R(2, 4); return Q({ text: `Một quả dưa nặng bằng ${a} quả cam. Một quả cam nặng bằng ${b} quả mận. Hỏi một quả dưa nặng bằng bao nhiêu quả mận?`, answer: a * b, wrongs: [a + b, a * b + 1, a * b - 1], unit: 'quả mận', hint: `Thay mỗi quả cam bằng ${b} quả mận.`, steps: [`1 quả dưa = ${a} quả cam = ${b} × ${a} quả mận.`, `${b} × ${a} = <b>${a * b}</b> quả mận.`], visual: { type: 'balance', left: ['🍈'], right: Array(a).fill('🍊'), caption: `1 🍊 = ${b} quả mận` } }); } }
    ]
  });

  MA.Data.addGrade({ grade: 2, name: 'Lớp 2', color: '#f29f3d', emoji: '🐣', desc: 'Số đến 1000 · Cộng trừ có nhớ · Nhân chia bảng 2, 5 · Đo lường · Hình học · Toán có lời văn', topics });
})(window.MA);
