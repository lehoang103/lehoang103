/* =========================================================
 * interactive.js — DẠNG BÀI TƯƠNG TÁC (v2)
 * Học sinh thao tác trực tiếp thay vì chọn đáp án:
 *   • Bấm vào vạch đúng trên TIA SỐ (lớp 2, 5, 6)
 *   • TÔ MÀU một phần của hình (phân số lớp 3, 4, 6)
 * Đáp án vẫn là một số → chấm, thống kê, sổ lỗi sai, ôn tập ngắt quãng dùng chung như mọi dạng bài.
 * Các dạng này tự bị loại khỏi Phiếu in (giấy không bấm được).
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, Q, fmt, frac } = MA.U;
  const nl = (min, max, step, labels) => ({ kind: 'nline', min, max, step, labels: labels || [] });
  const add = (tid, gens) => { if (MA.Data.topic(tid)) MA.Data.extend(tid, gens.map(g => Object.assign({ interactive: true }, g))); };

  // ---------- TIA SỐ ----------
  add('g2_numbers', [
    { level: 1, name: '👆 Tìm số trên tia số', fn() { const a = R(1, 9) * 10 + pick([0, 100, 200, 300, 400, 500, 600, 700, 800]); const x = a + R(1, 9); return Q({ text: `Bấm vào vạch ứng với số <b>${x}</b> trên tia số.`, answer: x, input: nl(a, a + 10, 1, [a + 5]), hint: `Tia số bắt đầu từ ${a}, mỗi vạch tăng thêm 1. Đếm tiếp từ ${a}.`, steps: [`Vạch đầu là ${a}, vạch giữa là ${a + 5}.`, `Đếm thêm ${x - a} vạch từ ${a} được <b>${x}</b>.`] }); } },
    { level: 2, name: '👆 Tia số tròn chục', fn() { const h = R(1, 9) * 100; const x = h + R(1, 9) * 10; return Q({ text: `Mỗi vạch cách nhau 10 đơn vị. Bấm vào vạch ứng với số <b>${x}</b>.`, answer: x, input: nl(h, h + 100, 10, [h + 50]), hint: `Đếm thêm chục: ${h}, ${h + 10}, ${h + 20}, …`, steps: [`Từ ${h} đếm thêm ${(x - h) / 10} chục được <b>${x}</b>.`] }); } }
  ]);
  add('g5_dec', [
    { level: 1, name: '👆 Số thập phân trên tia số', fn() { const a = R(0, 5); const k = R(1, 9); const x = +(a + k / 10).toFixed(1); return Q({ text: `Mỗi vạch là 0,1. Bấm vào vạch ứng với số <b>${fmt(x)}</b>.`, answer: x, input: nl(a, a + 1, 0.1, [+(a + 0.5).toFixed(1)]), hint: `Từ ${a} đếm thêm từng 0,1: ${fmt(a + 0.1)}; ${fmt(a + 0.2)}; …`, steps: [`${fmt(x)} = ${a} + ${k} × 0,1.`, `Đếm ${k} vạch từ ${a} được <b>${fmt(x)}</b>.`] }); } },
    { level: 2, name: '👆 Làm tròn trên tia số', fn() { const a = R(1, 8); const x = +(a + R(1, 9) / 10).toFixed(1); const r = Math.round(x); return Q({ text: `Số <b>${fmt(x)}</b> làm tròn đến hàng đơn vị được số nào? Bấm vào vạch đó.`, answer: r, input: nl(a - 1, a + 2, 0.1, [a, a + 1]), hint: 'Xem số đó gần số tự nhiên nào hơn trên tia số (chữ số phần mười ≥ 5 thì làm tròn lên).', steps: [`Chữ số hàng phần mười là ${Math.round((x - Math.floor(x)) * 10)} ${x - Math.floor(x) >= 0.5 ? '≥ 5 → làm tròn lên' : '< 5 → giữ nguyên'}.`, `${fmt(x)} ≈ <b>${r}</b>.`] }); } }
  ]);
  add('g6_int', [
    { level: 1, name: '👆 Số nguyên trên trục số', fn() { const x = R(-7, 7) || -3; return Q({ text: `Bấm vào điểm biểu diễn số nguyên <b>${x < 0 ? '−' + (-x) : x}</b> trên trục số.`, answer: x, input: nl(-8, 8, 1, [0]), hint: 'Số âm nằm bên trái số 0, số dương nằm bên phải.', steps: [`${x < 0 ? 'Số âm: đếm sang trái' : 'Số dương: đếm sang phải'} ${Math.abs(x)} vạch từ 0.`, `Được điểm <b>${x < 0 ? '−' + (-x) : x}</b>.`] }); } },
    { level: 2, name: '👆 Cộng số nguyên trên trục số', fn() { let a, b; do { a = R(-6, 6); b = R(-6, 6); } while (!a || !b || Math.abs(a + b) > 8); const s = a + b; const sg = (n) => n < 0 ? `(−${-n})` : n; return Q({ text: `Tính <b>${sg(a)} + ${sg(b)}</b> bằng cách di chuyển trên trục số, rồi bấm vào kết quả.`, answer: s, input: nl(-8, 8, 1, [0]), hint: `Bắt đầu tại ${sg(a)}, ${b > 0 ? 'đi sang phải' : 'đi sang trái'} ${Math.abs(b)} vạch.`, steps: [`Từ ${sg(a)} ${b > 0 ? 'sang phải' : 'sang trái'} ${Math.abs(b)} đơn vị.`, `Kết quả: <b>${s < 0 ? '−' + (-s) : s}</b>.`] }); } }
  ]);

  // ---------- TÔ MÀU PHÂN SỐ ----------
  add('g3_frac', [
    { level: 1, name: '👆 Tô màu một phần mấy', fn() { const n = R(2, 6), k = pick([1, 1, 2, 3]); const d = n * k; if (d > 12) return this.fn(); return Q({ text: `Hình dưới đây được chia thành <b>${d}</b> phần bằng nhau. Hãy tô màu <b>${frac(1, n)}</b> hình.`, answer: k, input: { kind: 'shade', d }, hint: `Chia ${d} phần thành ${n} nhóm bằng nhau, tô 1 nhóm.`, steps: [`${frac(1, n)} của ${d} phần là ${d} : ${n} = <b>${k}</b> phần.`], solVisual: { type: 'fraction', n: k, d, shape: 'bar' } }); } }
  ]);
  add('g4_frac', [
    { level: 2, name: '👆 Tô màu phân số', fn() { const b = R(2, 6), a = R(1, b - 1), k = pick([1, 2]); const d = b * k; if (d > 12) return this.fn(); return Q({ text: `Hình được chia thành <b>${d}</b> phần bằng nhau. Hãy tô màu <b>${frac(a, b)}</b> hình.`, answer: a * k, input: { kind: 'shade', d }, hint: k > 1 ? `${frac(a, b)} = ${frac(a * k, d)}.` : `Tô ${a} phần trong ${b} phần.`, steps: [k > 1 ? `${frac(a, b)} = ${frac(a + ' × ' + k, b + ' × ' + k)} = ${frac(a * k, d)}.` : `Mẫu số ${b} là số phần bằng nhau, tử số ${a} là số phần được tô.`, `Cần tô <b>${a * k}</b> phần.`], solVisual: { type: 'fraction', n: a * k, d, shape: 'bar' } }); } }
  ]);
  add('g6_frac', [
    { level: 2, name: '👆 Tô màu phân số bằng nhau', fn() { const b = pick([2, 3, 4]), a = R(1, b - 1), k = pick([2, 3]); const d = b * k; return Q({ text: `Hình được chia thành <b>${d}</b> phần bằng nhau. Tô màu số phần để phần tô màu bằng <b>${frac(a, b)}</b> hình.`, answer: a * k, input: { kind: 'shade', d }, hint: `Tìm phân số bằng ${frac(a, b)} có mẫu số ${d}.`, steps: [`${frac(a, b)} = ${frac(a * k, d)} (nhân cả tử và mẫu với ${k}).`, `Tô <b>${a * k}</b> phần.`], solVisual: { type: 'fraction', n: a * k, d, shape: 'bar' } }); } }
  ]);
})(window.MA);
