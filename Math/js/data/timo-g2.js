/* =========================================================
 * timo-g2.js — LUYỆN THI TIMO LỚP 2 (Primary 2)
 * 5 phân môn theo cấu trúc đề TIMO + 1 chủ đề từ vựng. Dạng bài được xây theo
 * tài liệu ôn luyện chuyên đề (22 bài); đề do máy sinh ngẫu nhiên, KHÔNG chép đề gốc.
 * Mỗi đề có tiếng Anh + tiếng Việt; hiển thị theo MA.Timo.lang() (song ngữ mặc định).
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, shuffle } = MA.U;
  const X = MA.Timo; const T = (o) => X.T(o);
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const SEQ = (arr, tail = ', ...') => `<b class="tm-seq">${arr.join(', ')}${tail}</b>`;

  // =====================================================================
  // 1. LOGICAL THINKING — Tư duy logic
  // =====================================================================
  const SYMS = ['★', '●', '▲', '■', '♥', '◆', '☀', '☾', '♣', '✿'];
  const logic = [
    { level: 1, name: 'Dãy số cách đều – số tiếp theo', fn() {
      const d = R(2, 9), down = R(0, 2) === 0; const a = down ? R(5 * d + 5, 99) : R(1, 40);
      const t = [0, 1, 2, 3, 4].map(i => a + (down ? -1 : 1) * d * i); const ans = t[4] + (down ? -d : d);
      return T({ en: 'According to the pattern below, find the next term in the sequence.', vi: 'Dựa vào quy luật dưới đây, tìm số tiếp theo trong dãy.', show: SEQ(t), answer: ans,
        hint: 'Xét hiệu hai số liên tiếp.', steps: [`Quy luật: số liền sau ${down ? 'kém' : 'hơn'} số liền trước ${d} đơn vị (${down ? '−' : '+'}${d}).`, `Số tiếp theo: ${t[4]} ${down ? '−' : '+'} ${d} = <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Dãy số cách đều – số hạng thứ n', fn() {
      const d = R(2, 6), a = R(1, 20), n = R(8, 15), down = R(0, 3) === 0;
      const A = down ? R(d * (n - 1) + 2, d * (n - 1) + 40) : a; const sgn = down ? -1 : 1;
      const t = [0, 1, 2, 3, 4].map(i => A + sgn * d * i); const ans = A + sgn * d * (n - 1);
      return T({ en: `Given the sequence with the pattern below, find the <b>${X.ord(n)}</b> term in the sequence.`, vi: `Cho dãy số có quy luật dưới đây, tìm số hạng thứ <b>${n}</b> của dãy.`, show: SEQ(t), answer: ans,
        hint: `Từ số thứ nhất đến số thứ ${n} có ${n - 1} lần ${down ? 'trừ' : 'cộng'} ${d}.`, steps: [`Quy luật: ${down ? '−' : '+'}${d}.`, `Số thứ ${n} = ${A} ${down ? '−' : '+'} ${n - 1} × ${d} = ${A} ${down ? '−' : '+'} ${(n - 1) * d} = <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Hai dãy đan xen', fn() {
      const a = R(1, 9), da = R(1, 3), b = R(40, 90), db = R(1, 4); const len = R(6, 7); const t = [];
      for (let i = 0; i < len; i++) t.push(i % 2 === 0 ? a + da * (i / 2) : b - db * ((i - 1) / 2));
      const i = len; const ans = i % 2 === 0 ? a + da * (i / 2) : b - db * ((i - 1) / 2);
      return T({ en: 'Given the sequence with the pattern below, find the next term in the sequence.', vi: 'Cho dãy số có quy luật dưới đây, tìm số tiếp theo trong dãy.', show: SEQ(t), answer: ans,
        hint: 'Tách thành hai dãy: các số ở vị trí lẻ và các số ở vị trí chẵn.', steps: [`Dãy thứ nhất (vị trí 1, 3, 5, …): ${a}, ${a + da}, ${a + 2 * da}, … (+${da}).`, `Dãy thứ hai (vị trí 2, 4, 6, …): ${b}, ${b - db}, ${b - 2 * db}, … (−${db}).`, `Số tiếp theo thuộc dãy thứ ${len % 2 === 0 ? 'nhất' : 'hai'}: <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Dãy có hiệu tăng dần / Fibonacci', fn() {
      if (R(0, 1)) {
        const a = R(1, 15), d0 = R(1, 4), k = R(1, 3); const t = [a]; for (let i = 0; i < 5; i++) t.push(t[i] + d0 + k * i); const ans = t[5] + d0 + k * 5;
        return T({ en: 'According to the pattern below, what is the number in the blank?', vi: 'Dựa vào quy luật dưới đây, tìm số thích hợp điền vào chỗ trống.', show: SEQ(t, ', ___'), answer: ans,
          hint: 'Xét hiệu hai số liên tiếp: các hiệu cũng tạo thành một dãy có quy luật.', steps: [`Các hiệu: ${t.slice(1).map((x, i) => x - t[i]).join(', ')} — mỗi lần tăng thêm ${k}.`, `Hiệu tiếp theo: ${d0 + k * 5}. Số cần tìm: ${t[5]} + ${d0 + k * 5} = <b>${ans}</b>.`] });
      }
      const a = R(1, 4), b = R(a, a + 4); const t = [a, b]; for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]); const ans = t[4] + t[5];
      return T({ en: 'According to the pattern below, find the next term in the sequence.', vi: 'Dựa vào quy luật dưới đây, tìm số tiếp theo trong dãy.', show: SEQ(t), answer: ans,
        hint: 'Xét tổng hai số liên tiếp.', steps: [`Quy luật: mỗi số (từ số thứ ba) bằng tổng hai số đứng liền trước: ${t[0]} + ${t[1]} = ${t[2]}, ${t[1]} + ${t[2]} = ${t[3]}, …`, `Số tiếp theo: ${t[4]} + ${t[5]} = <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Dãy chữ cái tiếng Anh', fn() {
      const AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; const st = R(2, 4), back = R(0, 2) === 0; const n = 5;
      const s0 = back ? R(st * n, 25) : R(0, 25 - st * n); const t = []; for (let i = 0; i < n; i++) t.push(AB[s0 + (back ? -1 : 1) * st * i]);
      const ans = AB[s0 + (back ? -1 : 1) * st * n];
      return T({ en: 'According to the pattern below, what is the English letter in the space?', vi: 'Dựa vào quy luật dưới đây, tìm chữ cái tiếng Anh điền vào chỗ trống.', show: `<b class="tm-seq">${t.join(', ')}, ___</b>`, answer: ans, accept: [ans.toLowerCase()], textOnly: true,
        hint: 'Viết bảng chữ cái A, B, C, … rồi khoanh các chữ có trong dãy.', steps: [`Bảng chữ cái: ${AB.split('').join(' ')}.`, `Hai chữ liên tiếp trong dãy cách nhau ${st - 1} chữ cái (${back ? 'đi ngược' : 'đi xuôi'} ${st} bước).`, `Chữ cần điền: <b>${ans}</b>.`] });
    } },
    { level: 1, name: 'Dãy hình lặp lại – hình tiếp theo', fn() {
      const L = R(2, 4); const sy = shuffle(SYMS).slice(0, R(2, Math.min(3, L))); const unit = []; for (let i = 0; i < L; i++) unit.push(i < sy.length ? sy[i] : pick(sy));
      const shown = R(L * 2 + 1, L * 3); const seq = []; for (let i = 0; i < shown; i++) seq.push(unit[i % L]); const ans = unit[shown % L];
      const opts = shuffle(sy.concat(shuffle(SYMS.filter(x => !sy.includes(x))).slice(0, 4 - sy.length)));
      return T({ en: 'Given the sequence below, find the next figure.', vi: 'Cho dãy hình dưới đây, tìm hình tiếp theo.', show: `<b class="tm-seq tm-sym">${seq.join(' ')} …</b>`, choices: opts, ans: opts.indexOf(ans),
        hint: 'Tìm nhóm hình lặp lại.', steps: [`Nhóm lặp lại: ${unit.join(' ')} (${L} hình).`, `Hình tiếp theo là hình thứ ${shown + 1}: <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Dãy hình lặp lại – đếm / hình thứ n', fn() {
      const L = R(3, 5); const sy = shuffle(SYMS).slice(0, 3); const unit = sy.slice(); while (unit.length < L) unit.push(pick(sy)); const u = shuffle(unit);
      const seq = []; for (let i = 0; i < L * 2 + 2; i++) seq.push(u[i % L]);
      const show = `<b class="tm-seq tm-sym">${seq.join(' ')} …</b>`;
      if (R(0, 1)) {
        const N = R(15, 30), s = pick(sy); const per = u.filter(x => x === s).length, full = Math.floor(N / L), rem = N % L; const ans = full * per + u.slice(0, rem).filter(x => x === s).length;
        return T({ en: `Given the pattern below, how many <b>${s}</b> are there from the 1st figure to the ${X.ord(N)} figure?`, vi: `Theo quy luật dưới đây, có bao nhiêu hình <b>${s}</b> trong ${N} hình đầu tiên?`, show, answer: ans,
          hint: 'Chia thành các nhóm lặp lại, đếm số hình trong mỗi nhóm.', steps: [`Mỗi nhóm ${L} hình (${u.join(' ')}) có ${per} hình ${s}.`, `${N} = ${L} × ${full} + ${rem} → ${full} nhóm đủ và ${rem} hình lẻ.`, `Số hình ${s}: ${full} × ${per} + ${ans - full * per} = <b>${ans}</b>.`] });
      }
      const N = R(13, 40); const ans = u[(N - 1) % L]; const opts = shuffle(sy.concat([pick(SYMS.filter(x => !sy.includes(x)))]));
      return T({ en: `According to the pattern below, what is the <b>${X.ord(N)}</b> figure counting from the left?`, vi: `Theo quy luật dưới đây, hình thứ <b>${N}</b> tính từ trái sang là hình nào?`, show, choices: opts, ans: opts.indexOf(ans),
        hint: 'Mỗi nhóm lặp lại có bao nhiêu hình? Lấy N chia cho số đó, xem số dư.', steps: [`Nhóm lặp lại có ${L} hình: ${u.join(' ')}.`, `${N} : ${L} = ${Math.floor(N / L)} dư ${N % L}.`, N % L ? `Dư ${N % L} → hình thứ ${N % L} trong nhóm: <b>${ans}</b>.` : `Không dư → hình cuối của nhóm: <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Hình có quy luật – số chấm ở hình thứ n', fn() {
      const a = R(1, 4), d = R(1, 3), n = R(6, 12); const c = [a, a + d, a + 2 * d]; const ans = a + d * (n - 1);
      return T({ en: `Look at the pattern below. How many circles are there in Figure ${n}?`, vi: `Quan sát quy luật dưới đây. Hình thứ ${n} có bao nhiêu hình tròn?`, visual: X.vis(X.dotsSvg(c)), answer: ans,
        hint: 'Đếm số hình tròn ở mỗi hình, xem mỗi lần tăng bao nhiêu.', steps: [`Hình 1: ${c[0]}, hình 2: ${c[1]}, hình 3: ${c[2]} → mỗi hình sau nhiều hơn ${d} hình tròn.`, `Hình ${n}: ${a} + ${n - 1} × ${d} = <b>${ans}</b>.`] });
    } },
    { level: 1, name: 'Thứ trong tuần – mấy ngày nữa / trước', fn() {
      const v = R(0, 3), t0 = R(0, 6), n = R(2, 12), later = R(0, 1) === 1;
      const off = [0, -1, 1, 2][v]; const ref = X.day(t0 + off);
      const ref1 = [`Today is <b>${ref[0]}</b>.`, `Yesterday was <b>${ref[0]}</b>.`, `Tomorrow will be <b>${ref[0]}</b>.`, `The day after tomorrow will be <b>${ref[0]}</b>.`][v];
      const ref2 = [`Hôm nay là <b>${ref[1]}</b>.`, `Hôm qua là <b>${ref[1]}</b>.`, `Ngày mai là <b>${ref[1]}</b>.`, `Ngày kia là <b>${ref[1]}</b>.`][v];
      const tgt = t0 + (later ? n : -n); const c = X.dayChoices(tgt);
      return T({ en: `${ref1} Which day of the week ${later ? `will it be <b>${n} days later</b>` : `was it <b>${n} days ago</b>`} (from today)?`, vi: `${ref2} Hỏi ${later ? `<b>${n} ngày nữa</b>` : `<b>${n} ngày trước</b>`} (tính từ hôm nay) là thứ mấy?`, choices: c.choices, ans: c.ans,
        hint: 'Xác định hôm nay là thứ mấy trước. Cứ 7 ngày thì thứ lặp lại.', steps: [v ? `Vậy hôm nay là ${X.day(t0)[1]}.` : `Hôm nay là ${X.day(t0)[1]}.`, n >= 7 ? `${n} ngày = 7 ngày + ${n - 7} ngày; sau 7 ngày thứ không đổi.` : `Đếm ${later ? 'tiến' : 'lùi'} ${n} ngày.`, `Kết quả: <b>${X.day(tgt)[1]}</b> (${X.day(tgt)[0]}).`] });
    } },
    { level: 3, name: 'Thứ của một ngày trong tháng', fn() {
      const m = R(0, 11), md = X.MDAYS[m], d = R(3, md - 2), t0 = R(0, 6); const v = R(0, 2); let m2 = m, d2, diff;
      if (v === 0) { d2 = R(d + 5, Math.min(md, d + 20)); if (d2 <= d + 4) return this.fn(); diff = d2 - d; }
      else if (v === 1) { d2 = R(Math.max(1, d - 20), d - 3); if (d2 >= d) return this.fn(); diff = d2 - d; }
      else { m2 = (m + 1) % 12; d2 = R(1, 12); diff = md - d + d2; }
      const tgt = t0 + diff; const c = X.dayChoices(tgt); const td = X.day(t0);
      return T({ en: `Today is <b>${td[0]}, ${X.MONTHS_EN[m]} ${X.ord(d)}</b>. Which day of the week is <b>${X.MONTHS_EN[m2]} ${X.ord(d2)}</b>${m2 < m ? ' of the next year' : ' of the same year'}?`, vi: `Hôm nay là <b>${td[1]}, ngày ${d} tháng ${m + 1}</b>. Hỏi ngày <b>${d2} tháng ${m2 + 1}</b>${m2 < m ? ' năm sau' : ' cùng năm'} là thứ mấy?`, choices: c.choices, ans: c.ans,
        hint: 'Tính số ngày chênh lệch, bớt đi các tuần (bội của 7), số ngày còn lại mới làm đổi thứ.', steps: [v === 2 ? `Tháng ${m + 1} có ${md} ngày. Từ ngày ${d}/${m + 1} đến ngày ${d2}/${m2 + 1}: ${md - d} + ${d2} = ${diff} ngày.` : `Chênh lệch: ${Math.abs(diff)} ngày ${diff > 0 ? 'sau' : 'trước'}.`, `${Math.abs(diff)} = 7 × ${Math.floor(Math.abs(diff) / 7)} + ${Math.abs(diff) % 7} → ${diff > 0 ? 'tiến' : 'lùi'} ${Math.abs(diff) % 7} thứ.`, `Kết quả: <b>${X.day(tgt)[1]}</b> (${X.day(tgt)[0]}).`] });
    } },
    { level: 1, name: 'Tuổi – trước, sau, khi sinh ra', fn() {
      const [a] = X.names(1); const v = R(0, 2);
      if (v === 0) { const x = R(2, 9), age = R(x + 5, 15), y = R(1, age - x - 1); const ans = age - x - y;
        return T({ en: `After ${x} years, ${a} will be ${age} years old. How old was ${a} ${y} years ago?`, vi: `Sau ${x} năm nữa, ${a} sẽ ${age} tuổi. Hỏi ${y} năm trước ${a} bao nhiêu tuổi?`, answer: ans, unit: 'tuổi',
          hint: 'Tìm tuổi hiện nay trước.', steps: [`Tuổi ${a} hiện nay: ${age} − ${x} = ${age - x} (tuổi).`, `${y} năm trước: ${age - x} − ${y} = <b>${ans}</b> (tuổi).`] }); }
      if (v === 1) { const m = R(24, 36), k = R(3, 16); const ans = m + k;
        return T({ en: `When ${a} was born, ${a}'s mum was ${m} years old. When ${a} is ${k} years old, how old will ${a}'s mum be?`, vi: `Khi ${a} sinh ra, mẹ ${m} tuổi. Hỏi khi ${a} ${k} tuổi thì mẹ bao nhiêu tuổi?`, answer: ans, unit: 'tuổi',
          hint: 'Mẹ luôn hơn con đúng bằng số tuổi của mẹ khi con sinh ra.', steps: [`Mẹ hơn ${a}: ${m} tuổi (không đổi).`, `Khi ${a} ${k} tuổi, mẹ: ${k} + ${m} = <b>${ans}</b> (tuổi).`] }); }
      const b = R(5, 12), x = R(2, 9);
      return T({ en: `${a} celebrated a ${X.ord(b)} birthday ${X.pl(x, 'year')} ago. How old is ${a} now?`, vi: `${a} tổ chức sinh nhật ${b} tuổi vào ${x} năm trước. Hỏi hiện nay ${a} bao nhiêu tuổi?`, answer: b + x, unit: 'tuổi',
        hint: 'Sinh nhật lần thứ b nghĩa là lúc đó tròn b tuổi.', steps: [`${x} năm trước ${a} ${b} tuổi.`, `Hiện nay: ${b} + ${x} = <b>${b + x}</b> (tuổi).`] });
    } },
    { level: 2, name: 'Tuổi – A lúc này bằng B lúc khác', fn() {
      const [a, b] = X.names(2); const x = R(1, 10), y = R(1, 10); const ax = R(0, 1), by = R(0, 1); // 1 = later, 0 = ago
      if (x === y && ax === by) return this.fn();
      const B = R(12, 35); const sx = ax ? x : -x, sy = by ? y : -y; const A = B + sy - sx;
      if (A < 3 || A - (ax ? 0 : x) < 1 || B - (by ? 0 : y) < 1) return this.fn();
      const tw = (k, l) => `${X.pl(k, 'year')} ${l ? 'later' : 'ago'}`, tv = (k, l) => `${k} năm ${l ? 'sau' : 'trước'}`;
      return T({ en: `The age of ${a} ${tw(x, ax)} is equal to the age of ${b} ${tw(y, by)}. Given that ${b} is ${B} years old now, how old is ${a} now?`, vi: `Tuổi của ${a} ${tv(x, ax)} bằng tuổi của ${b} ${tv(y, by)}. Biết năm nay ${b} ${B} tuổi, hỏi năm nay ${a} bao nhiêu tuổi?`, answer: A, unit: 'tuổi',
        hint: 'Tính tuổi của người đã biết ở đúng thời điểm đề cho, rồi suy ra người kia.', steps: [`Tuổi ${b} ${tv(y, by)}: ${B} ${by ? '+' : '−'} ${y} = ${B + sy} (tuổi).`, `Đó cũng là tuổi ${a} ${tv(x, ax)}.`, `Tuổi ${a} hiện nay: ${B + sy} ${ax ? '−' : '+'} ${x} = <b>${A}</b> (tuổi).`] });
    } },
    { level: 3, name: 'Tuổi – mẹ và hai anh em', fn() {
      const [a] = X.names(1); const m = R(24, 32), g = R(1, 4), M = R(m + g + 3, m + g + 20); const ans = M - m - g;
      return T({ en: `When ${a} was born, mum was ${m} years old. ${a}'s brother was born ${X.pl(g, 'year')} later. When mum is ${M} years old, how old will the brother be?`, vi: `Khi ${a} sinh ra, mẹ ${m} tuổi. Em trai của ${a} sinh sau ${a} ${g} năm. Hỏi khi mẹ ${M} tuổi thì em trai bao nhiêu tuổi?`, answer: ans, unit: 'tuổi',
        hint: 'Mẹ hơn em trai bao nhiêu tuổi?', steps: [`Khi em trai sinh ra, mẹ: ${m} + ${g} = ${m + g} (tuổi) → mẹ hơn em ${m + g} tuổi.`, `Khi mẹ ${M} tuổi, em trai: ${M} − ${m + g} = <b>${ans}</b> (tuổi).`] });
    } },
    { level: 1, name: 'Xếp hàng – đếm số người', fn() {
      const [a] = X.names(1); const v = R(0, 1);
      if (v === 0) { const f = R(2, 15), b = R(2, 15); const ans = f + b + 1;
        return T({ en: `In a line, there are ${f} people in front of ${a} and ${b} people behind ${a}. How many people are there in the line?`, vi: `Trong một hàng dọc, phía trước ${a} có ${f} người, phía sau ${a} có ${b} người. Hỏi cả hàng có bao nhiêu người?`, answer: ans, unit: 'người',
          hint: 'Đừng quên tính cả chính bạn ấy!', steps: [`Số người: ${f} + 1 + ${b} = <b>${ans}</b> (người).`] }); }
      const p = R(3, 15), b = R(2, 12); const ans = p + b;
      return T({ en: `In a row, ${a}'s position is <b>${X.ord(p)}</b> and there are ${b} people behind ${a}. How many people are in the row?`, vi: `Trong một hàng, ${a} đứng ở vị trí thứ <b>${p}</b>. Có ${b} người đứng sau ${a}. Hỏi hàng có bao nhiêu người?`, answer: ans, unit: 'người',
        hint: 'Vị trí thứ p nghĩa là tính cả bạn ấy, từ đầu hàng có p người.', steps: [`Từ đầu hàng đến ${a}: ${p} người.`, `Cả hàng: ${p} + ${b} = <b>${ans}</b> (người).`] });
    } },
    { level: 2, name: 'Xếp hàng – vị trí, ở giữa', fn() {
      const [a, b] = X.names(2); const v = R(0, 3);
      if (v === 0) { const N = R(12, 30), bh = R(2, N - 3); const ans = N - bh - 1;
        return T({ en: `${N} children form a column. There are ${bh} children behind ${a}. How many children are in front of ${a}?`, vi: `${N} bạn nhỏ xếp thành một hàng dọc. Có ${bh} bạn đứng sau ${a}. Hỏi có bao nhiêu bạn đứng trước ${a}?`, answer: ans, unit: 'bạn',
          hint: 'Số đứng trước = Tổng − số đứng sau − 1 (chính bạn ấy).', steps: [`${N} − ${bh} − 1 = <b>${ans}</b> (bạn).`] }); }
      if (v === 1) { const p = R(1, 8), q = p + R(3, 12); const ans = q - p - 1;
        return T({ en: `In a row, ${a} is in <b>${X.ord(p)}</b> place and ${b} is in <b>${X.ord(q)}</b> place. How many people are between ${a} and ${b}?`, vi: `Trong một hàng dọc, ${a} đứng thứ <b>${p}</b>, ${b} đứng thứ <b>${q}</b>. Hỏi có bao nhiêu người đứng giữa ${a} và ${b}?`, answer: ans, unit: 'người',
          hint: 'Số người ở giữa = Vị trí lớn − Vị trí nhỏ − 1.', steps: [`${q} − ${p} − 1 = <b>${ans}</b> (người).`] }); }
      if (v === 2) { const k = R(4, 15); const ans = 2 * k - 1;
        return T({ en: `${a} stands in the middle of the line and ${a}'s position is <b>${X.ord(k)}</b>. How many people are there in the line?`, vi: `${a} đứng chính giữa hàng và ở vị trí thứ <b>${k}</b>. Hỏi hàng có bao nhiêu người?`, answer: ans, unit: 'người',
          hint: 'Đứng chính giữa: số người phía trước bằng số người phía sau.', steps: [`Phía trước ${a}: ${k - 1} người, phía sau cũng ${k - 1} người.`, `Cả hàng: ${k - 1} + 1 + ${k - 1} = <b>${ans}</b> (người).`] }); }
      const N = R(15, 30), f = R(1, 6), bh = R(1, 6); const pa = f + 1, pb = N - bh; if (pb - pa < 2) return this.fn(); const ans = pb - pa - 1;
      return T({ en: `${N} people line up in a row. There are ${f} people in front of ${a}. There are ${bh} people behind ${b}. How many people are between ${a} and ${b}?`, vi: `Có ${N} người xếp thành một hàng. Phía trước ${a} có ${f} người. Phía sau ${b} có ${bh} người. Hỏi có bao nhiêu người đứng giữa ${a} và ${b}?`, answer: ans, unit: 'người',
        hint: 'Tìm vị trí của từng bạn trước.', steps: [`Vị trí của ${a}: ${f} + 1 = ${pa}.`, `Vị trí của ${b}: ${N} − ${bh} = ${pb}.`, `Ở giữa: ${pb} − ${pa} − 1 = <b>${ans}</b> (người).`] });
    } },
    { level: 3, name: 'Xếp hàng – trước bằng sau', fn() {
      const [a, b] = X.names(2); const v = R(0, 1);
      if (v === 0) { const p = R(2, 8), q = p + R(2, 10); const ans = q + p - 1;
        return T({ en: `In a line, ${a} is in <b>${X.ord(p)}</b> place and ${b} is in <b>${X.ord(q)}</b> place. The number of people in front of ${a} equals the number of people behind ${b}. How many people are in the line?`, vi: `Trong một hàng dọc, ${a} đứng thứ <b>${p}</b>, ${b} đứng thứ <b>${q}</b>. Số người đứng trước ${a} bằng số người đứng sau ${b}. Hỏi cả hàng có bao nhiêu người?`, answer: ans, unit: 'người',
          hint: 'Đứng trước bạn thứ p có p − 1 người.', steps: [`Trước ${a}: ${p} − 1 = ${p - 1} người → sau ${b} cũng có ${p - 1} người.`, `Cả hàng: ${q} + ${p - 1} = <b>${ans}</b> (người).`] }); }
      const p = R(2, 6), g = R(2, 8); const q = p + g + 1; const ans = q + R(1, 6); const after = ans - q;
      return T({ en: `${a} is at the <b>${X.ord(p)}</b> position in a straight row. There are ${g} people between ${a} and ${b}, and ${b} stands behind ${a}. There are ${after} people behind ${b}. How many people are in the row?`, vi: `${a} đứng ở vị trí thứ <b>${p}</b> trong một hàng. Có ${g} người đứng giữa ${a} và ${b}, ${b} đứng sau ${a}. Phía sau ${b} có ${after} người. Hỏi hàng có bao nhiêu người?`, answer: ans, unit: 'người',
        hint: 'Vị trí của bạn thứ hai = vị trí bạn thứ nhất + số người ở giữa + 1.', steps: [`Vị trí của ${b}: ${p} + ${g} + 1 = ${q}.`, `Cả hàng: ${q} + ${after} = <b>${ans}</b> (người).`] });
    } }
  ];

  // =====================================================================
  // 2. ARITHMETIC — Số học
  // =====================================================================
  const SYMB = ['✈️', '✉️', '⏰', '🌸', '⭐', '🍎', '🎈', '🐟'];
  // Bài toán mật mã: tạo mẫu, thử mọi cách gán chữ số, chỉ nhận khi đáp án duy nhất
  function crypt() {
    const tpl = pick([
      { rows: ['aX', 'Xb'], ask: 'X', q: 'X' },
      { rows: ['AB', 'BA'], ask: 'A+B', q: 'A + B', cond: (s) => s.A < s.B },
      { rows: ['AB', 'A'], ask: 'B', q: 'B' },
      { rows: ['AB', 'B'], ask: 'A', q: 'A' },
      { rows: ['AA', 'B'], ask: 'B', q: 'B' },
      { rows: ['XY', 'XY'], ask: 'X+Y', q: 'X + Y' }
    ]);
    const fixed = { a: R(1, 8), b: R(1, 9) }; const letters = [...new Set(tpl.rows.join('').replace(/[ab0-9]/g, '').split(''))];
    const val = (row, s) => Number(row.split('').map(ch => /[ab]/.test(ch) ? fixed[ch] : s[ch]).join(''));
    const lead = (s) => tpl.rows.every(row => { const ch = row[0]; return /[ab]/.test(ch) || s[ch] !== 0; });
    // chọn nghiệm thật
    let s0; for (let k = 0; k < 50; k++) { const s = {}; letters.forEach(l => s[l] = R(0, 9)); if (lead(s) && (!tpl.cond || tpl.cond(s))) { s0 = s; break; } } if (!s0) return null;
    const total = tpl.rows.reduce((t, r) => t + val(r, s0), 0);
    const askV = (s) => tpl.ask.split('+').reduce((t, l) => t + s[l], 0);
    const vals = new Set();
    const rec = (i, s) => { if (i === letters.length) { if (lead(s) && (!tpl.cond || tpl.cond(s)) && tpl.rows.reduce((t, r) => t + val(r, s), 0) === total) vals.add(askV(s)); return; } for (let d = 0; d <= 9; d++) { s[letters[i]] = d; rec(i + 1, s); } };
    rec(0, {}); if (vals.size !== 1) return null;
    const ans = askV(s0);
    const disp = (row) => row.split('').map(ch => /[ab]/.test(ch) ? fixed[ch] : `<i>${ch}</i>`).join('');
    const w = String(total).length + 1;
    const pad = (h, n) => '<span class="sp"></span>'.repeat(Math.max(0, w - n)) + h;
    const col = `<div class="tm-col">${tpl.rows.map((r, i) => `<div>${i ? '+' : '<span class="sp"></span>'}${pad(disp(r).replace(/(<i>.<\/i>|\d)/g, '<span>$1</span>'), r.length)}</div>`).join('')}<div class="ln"></div><div><span class="sp"></span>${pad(String(total).split('').map(c => `<span>${c}</span>`).join(''), String(total).length)}</div></div>`;
    const same = letters.length > 1 ? ' (A and B are 1-digit numbers)' : '';
    return { tpl, letters, total, ans, col, same, s0 };
  }
  const arith = [
    { level: 1, name: 'Ghép cặp tròn chục – tính tổng', fn() {
      const k = R(2, 3); const nums = []; let tot = 0; const tens = R(0, 1) ? 10 : 100;
      for (let i = 0; i < k; i++) { const T0 = tens === 10 ? pick([30, 40, 50, 60, 70, 80]) : pick([200, 300, 400, 500]); const a = tens === 10 ? R(11, T0 - 11) : R(101, T0 - 101); if (a % 10 === 0) return this.fn(); nums.push(a, T0 - a); tot += T0; }
      if (R(0, 1)) { const e = tens === 10 ? R(2, 30) : R(20, 99); nums.push(e); tot += e; }
      const sh = shuffle(nums);
      return T({ en: `Find the value of ${sh.join(' + ')}.`, vi: `Tính giá trị của ${sh.join(' + ')}.`, answer: tot,
        hint: `Ghép các cặp số có tổng tròn ${tens === 10 ? 'chục' : 'trăm'} (hàng đơn vị: 1 với 9, 2 với 8, 3 với 7, 4 với 6, 5 với 5).`, steps: [`Ghép cặp: ${nums.slice(0, 2 * k).reduce((o, x, i) => i % 2 ? o : o.concat(`(${x} + ${nums[i + 1]})`), []).join(' + ')}${nums.length > 2 * k ? ' + ' + nums[2 * k] : ''}.`, `= ${nums.slice(0, 2 * k).reduce((o, x, i) => i % 2 ? o : o.concat(x + nums[i + 1]), []).concat(nums.slice(2 * k)).join(' + ')} = <b>${tot}</b>.`] });
    } },
    { level: 2, name: 'Cộng trừ – đổi chỗ để triệt tiêu', fn() {
      if (R(0, 1)) { const a = R(20, 60), b = R(5, 30), c = R(a + b + 1, a + b + 40), d = R(c - a + 1, c - a + 60); const ans = a - c + d;
        return T({ en: `Find the value of ${a} + ${b} − ${c} − ${b} + ${d}.`, vi: `Tính giá trị của ${a} + ${b} − ${c} − ${b} + ${d}.`, answer: ans,
          hint: 'Cộng một số rồi trừ đúng số đó thì như không cộng không trừ. Được đổi chỗ các số (giữ dấu đứng trước).', steps: [`+ ${b} và − ${b} triệt tiêu nhau.`, `${a} + ${d} − ${c} = ${a + d} − ${c} = <b>${ans}</b>.`] }); }
      const a = R(11, 40), b = R(a + 3, a + 30), c = R(b - a + 2, b - a + 40); const ans = a - b + c;
      return T({ en: `Calculate ${a} − ${b} + ${c}.`, vi: `Tính ${a} − ${b} + ${c}.`, answer: ans,
        hint: 'Đổi chỗ: cộng trước rồi trừ sau (giữ nguyên dấu đứng trước mỗi số).', steps: [`${a} − ${b} + ${c} = ${a} + ${c} − ${b}.`, `= ${a + c} − ${b} = <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Dãy cộng trừ xen kẽ', fn() {
      const a = R(1, 10), d = R(2, 5), n = pick([5, 7, 9, 11]); const t = []; for (let i = 0; i < n; i++) t.push(a + d * i);
      const ex = t.map((x, i) => (i === 0 ? '' : i % 2 ? ' − ' : ' + ') + x).join(''); const ans = a + d * (n - 1) / 2;
      return T({ en: `Find the value of ${ex}.`, vi: `Tính giá trị của ${ex}.`, answer: ans,
        hint: 'Ghép từng cặp (+ số sau − số trước) hoặc tách số đầu ra.', steps: [`Giữ ${t[0]}, ghép từng cặp phía sau: (${t[2]} − ${t[1]}) + (${t[4]} − ${t[3]}) + … mỗi cặp bằng ${d}.`, `Có ${(n - 1) / 2} cặp → ${t[0]} + ${(n - 1) / 2} × ${d} = <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Tính chất phân phối của phép nhân', fn() {
      const k = R(11, 49); let a, b, c; do { a = R(2, 15); b = R(1, 9); c = R(1, a + b - 1); } while (a + b - c !== 10 && a + b - c !== 20);
      const ans = k * (a + b - c);
      return T({ en: `Find the value of ${k} × ${a} + ${k} × ${b} − ${k} × ${c}.`, vi: `Tính giá trị của ${k} × ${a} + ${k} × ${b} − ${k} × ${c}.`, answer: ans,
        hint: `Có thừa số chung là ${k}: a × b + a × c = a × (b + c).`, steps: [`= ${k} × (${a} + ${b} − ${c})`, `= ${k} × ${a + b - c} = <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Nhân với thừa số chung (nhiều số hạng)', fn() {
      const k = R(12, 250); if (R(0, 1)) { const ex = [1, 2, 3, 4].map(i => `${i} × ${k}`).join(' + '); const ans = 10 * k;
        return T({ en: `Find the value of ${ex}.`, vi: `Tính giá trị của ${ex}.`, answer: ans, hint: 'Đưa thừa số chung ra ngoài.', steps: [`= (1 + 2 + 3 + 4) × ${k} = 10 × ${k} = <b>${ans}</b>.`] }); }
      let c; do { c = [R(2, 15), R(1, 9), R(1, 9), R(1, 9)]; } while (c[0] + c[3] - c[1] - c[2] !== 10 || c[0] < c[1] + c[2] - c[3]);
      const signs = ['', ' − ', ' − ', ' + ']; const ex = c.map((x, i) => signs[i] + (i % 2 ? `${k} × ${x}` : `${x} × ${k}`)).join(''); const ans = 10 * k;
      return T({ en: `Find the value of ${ex}.`, vi: `Tính giá trị của ${ex}.`, answer: ans, hint: 'Phép nhân có tính giao hoán: đổi chỗ để thấy thừa số chung.', steps: [`= ${k} × (${c[0]} − ${c[1]} − ${c[2]} + ${c[3]})`, `= ${k} × 10 = <b>${ans}</b>.`] });
    } },
    { level: 1, name: 'Cân bằng phép tính – tìm số bị che', fn() {
      const s = pick(SYMB); const v = R(0, 2); let left, right, ans, steps;
      if (v === 0) { const a = R(2, 20), b = R(2, 20), c = R(2, 15); if (b + c <= a) return this.fn(); ans = b + c - a; left = `${a} + ${s}`; right = `${b} + ${c}`; steps = [`${b} + ${c} = ${b + c}.`, `${a} + ${s} = ${b + c} → ${s} = ${b + c} − ${a} = <b>${ans}</b>.`]; }
      else if (v === 1) { const a = R(2, 15), b = R(5, 20), c = R(1, b - 1); ans = b - c + a; left = `${s} − ${a}`; right = `${b} − ${c}`; steps = [`${b} − ${c} = ${b - c}.`, `${s} − ${a} = ${b - c} → ${s} = ${b - c} + ${a} = <b>${ans}</b>.`]; }
      else { const b = R(2, 15), c = R(2, 15), a = R(b + c + 1, b + c + 20); ans = a - b - c; left = `${a} − ${s}`; right = `${b} + ${c}`; steps = [`${b} + ${c} = ${b + c}.`, `${a} − ${s} = ${b + c} → ${s} = ${a} − ${b + c} = <b>${ans}</b>.`]; }
      return T({ en: `Find the number covered by the ${s} in the equation below.`, vi: `Tìm số bị che bởi ${s} trong phép tính dưới đây.`, show: `<b class="tm-seq">${left} = ${right}</b>`, answer: ans,
        hint: 'Tính vế không có hình trước, rồi tìm thành phần chưa biết.', steps });
    } },
    { level: 2, name: 'Cân bằng phép tính – hình lặp lại', fn() {
      const s = pick(SYMB); const k = R(2, 3); const x = R(2, 12); const a = R(1, 15); const neg = R(0, 1) && k * x > a;
      const L = k * x + (neg ? -a : a); const b = R(1, L - 1), c = L - b;
      const left = Array(k).fill(s).join(' + ') + (neg ? ` − ${a}` : ` + ${a}`);
      return T({ en: `Find the number that the ${s} stands for (each ${s} stands for the same number).`, vi: `Mỗi ${s} thay cho cùng một số. Tìm số đó.`, show: `<b class="tm-seq">${left} = ${b} + ${c}</b>`, answer: x, level: k === 3 ? 3 : 2,
        hint: `${Array(k).fill(s).join(' + ')} nghĩa là ${k} lần ${s}.`, steps: [`${b} + ${c} = ${L}.`, `${k} × ${s} = ${L} ${neg ? '+' : '−'} ${a} = ${k * x}.`, `${s} = ${k * x} : ${k} = <b>${x}</b>.`] });
    } },
    { level: 3, name: 'Bài toán mật mã (phép cộng)', fn() {
      const c = crypt(); if (!c) return this.fn();
      return T({ en: `In the addition below, each letter stands for a 1-digit number${c.letters.length > 1 ? ' (the same letter is the same digit)' : ''}. Find the value of <b>${c.tpl.q}</b>.`, vi: `Trong phép cộng dưới đây, mỗi chữ cái thay cho một chữ số${c.letters.length > 1 ? ' (cùng chữ cái là cùng chữ số)' : ''}. Tìm <b>${c.tpl.q}</b>.`, show: c.col, answer: c.ans,
        hint: 'Đặt tính theo cột, xét hàng đơn vị trước: có nhớ hay không nhớ?', steps: [`Xét lần lượt hàng đơn vị rồi hàng chục (chú ý số nhớ).`, `Tìm được ${c.letters.map(l => `${l} = ${c.s0[l]}`).join(', ')}.`, `${c.tpl.q} = <b>${c.ans}</b>.`] });
    } }
  ];

  // =====================================================================
  // 3. NUMBER THEORY — Lý thuyết số
  // =====================================================================
  const EMO = ['🥭', '🍬', '🐦', '🚗', '🍪', '🍎', '⭐'];
  const numth = [
    { level: 1, name: 'Số chẵn, số lẻ lớn nhất / nhỏ nhất', fn() {
      const k = R(1, 3), big = k === 1 ? 1 : R(0, 1), odd = R(0, 1); const lo = k === 1 ? 0 : Math.pow(10, k - 1), hi = Math.pow(10, k) - 1;
      let ans; if (big) { ans = hi; if ((ans % 2 === 1) !== !!odd) ans--; } else { ans = lo; if ((ans % 2 === 1) !== !!odd) ans++; }
      const kw = ['', '1-digit', '2-digit', '3-digit'][k];
      return T({ en: `What is the ${big ? 'largest' : 'smallest'} ${kw} ${odd ? 'odd' : 'even'} number?`, vi: `Số ${odd ? 'lẻ' : 'chẵn'} ${big ? 'lớn' : 'nhỏ'} nhất có ${k} chữ số là số nào?`, answer: ans,
        hint: 'Số chẵn tận cùng 0, 2, 4, 6, 8. Số lẻ tận cùng 1, 3, 5, 7, 9.', steps: [`Số ${big ? 'lớn' : 'nhỏ'} nhất có ${k} chữ số: ${big ? hi : lo}.`, `Số ${odd ? 'lẻ' : 'chẵn'} ${big ? 'lớn' : 'nhỏ'} nhất có ${k} chữ số: <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Đếm số chẵn / lẻ từ a đến b', fn() {
      const a = R(10, 70), b = a + R(8, 30), odd = R(0, 1); let n = 0; for (let i = a; i <= b; i++) if (i % 2 === (odd ? 1 : 0)) n++;
      const f = a % 2 === (odd ? 1 : 0) ? a : a + 1, l = b % 2 === (odd ? 1 : 0) ? b : b - 1;
      return T({ en: `How many ${odd ? 'odd' : 'even'} numbers are there from ${a} to ${b}?`, vi: `Có bao nhiêu số ${odd ? 'lẻ' : 'chẵn'} từ ${a} đến ${b}?`, answer: n, unit: 'số',
        hint: 'Các số chẵn (lẻ) liên tiếp cách nhau 2 đơn vị.', steps: [`Số ${odd ? 'lẻ' : 'chẵn'} đầu tiên: ${f}, cuối cùng: ${l}.`, `Số lượng: (${l} − ${f}) : 2 + 1 = <b>${n}</b>.`] });
    } },
    { level: 1, name: 'Đếm số chẵn / lẻ trong dãy cho trước', fn() {
      const L = []; const k = R(6, 8); for (let i = 0; i < k; i++) L.push(pick([R(1, 9), R(10, 99), R(100, 999)])); const odd = R(0, 1); const n = L.filter(x => x % 2 === (odd ? 1 : 0)).length;
      return T({ en: `How many ${odd ? 'odd' : 'even'} numbers are there among the following numbers?`, vi: `Có bao nhiêu số ${odd ? 'lẻ' : 'chẵn'} trong các số sau?`, show: `<b class="tm-seq">${L.join(', ')}</b>`, answer: n,
        hint: 'Chỉ cần nhìn chữ số tận cùng.', steps: [`Các số ${odd ? 'lẻ' : 'chẵn'}: ${L.filter(x => x % 2 === (odd ? 1 : 0)).join(', ') || 'không có'}.`, `Có <b>${n}</b> số.`] });
    } },
    { level: 2, name: 'Tổng / biểu thức là số chẵn hay lẻ', fn() {
      const odd = [['Odd', 'Số lẻ'], ['Even', 'Số chẵn']];
      if (R(0, 1)) { const a = R(1, 9), d = pick([2, 4]), n = R(5, 9); const t = []; for (let i = 0; i < n; i++) t.push(a + d * i); const s = sum(t); const isOdd = s % 2 === 1;
        return T({ en: `Is the result of ${t.join(' + ')} odd or even?`, vi: `Kết quả của phép tính ${t.join(' + ')} là số lẻ hay số chẵn?`, choices: odd, ans: isOdd ? 0 : 1, level: 2,
          hint: 'Đếm số các số lẻ: chẵn số lẻ cộng lại được số chẵn, lẻ số lẻ cộng lại được số lẻ.', steps: [`Có ${a % 2 ? n : 0} số lẻ trong tổng.`, `${a % 2 ? (n % 2 ? 'Lẻ số số lẻ → tổng lẻ' : 'Chẵn số số lẻ → tổng chẵn') : 'Toàn số chẵn → tổng chẵn'}: <b>${isOdd ? 'số lẻ' : 'số chẵn'}</b>.`] }); }
      const p = [[R(2, 9), R(2, 9)], [R(2, 9), R(2, 9)], [R(1, 5), R(1, 5)]]; const v = p[0][0] * p[0][1] + p[1][0] * p[1][1] - p[2][0] * p[2][1]; if (v <= 0) return this.fn(); const isOdd = v % 2 === 1;
      return T({ en: `Is the result of ${p[0][0]} × ${p[0][1]} + ${p[1][0]} × ${p[1][1]} − ${p[2][0]} × ${p[2][1]} odd or even?`, vi: `Kết quả của ${p[0][0]} × ${p[0][1]} + ${p[1][0]} × ${p[1][1]} − ${p[2][0]} × ${p[2][1]} là số lẻ hay số chẵn?`, choices: odd, ans: isOdd ? 0 : 1, level: 3,
        hint: 'Tích là số lẻ chỉ khi cả hai thừa số đều lẻ.', steps: [`Các tích: ${p.map(x => x[0] * x[1]).join(', ')}.`, `${p[0][0] * p[0][1]} + ${p[1][0] * p[1][1]} − ${p[2][0] * p[2][1]} = ${v} → <b>${isOdd ? 'số lẻ' : 'số chẵn'}</b>.`] });
    } },
    { level: 1, name: 'Sắp xếp – số lớn / nhỏ thứ k', fn() {
      const n = R(7, 11); const s = new Set(); while (s.size < n) s.add(pick([R(1, 9), R(10, 99), R(10, 99), R(100, 450)])); const L = [...s];
      const desc = R(0, 1), k = R(2, 5); const sorted = L.slice().sort((a, b) => desc ? b - a : a - b); const ans = sorted[k - 1];
      return T({ en: `Arrange these numbers in ${desc ? 'descending' : 'ascending'} order to find the <b>${X.ord(k)} ${desc ? 'largest' : 'smallest'}</b> number.`, vi: `Sắp xếp các số sau theo thứ tự ${desc ? 'từ lớn đến bé' : 'từ bé đến lớn'} để tìm số ${desc ? 'lớn' : 'nhỏ'} thứ <b>${k}</b>.`, show: `<b class="tm-seq">${L.join(', ')}</b>`, answer: ans,
        hint: 'Chia nhóm theo số chữ số trước, rồi so sánh từng hàng từ trái sang phải.', steps: [`Sắp xếp: ${sorted.join(', ')}.`, `Số ${desc ? 'lớn' : 'nhỏ'} thứ ${k}: <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Sắp xếp – số chẵn lớn nhất / lẻ nhỏ nhất', fn() {
      const n = R(8, 11); const s = new Set(); while (s.size < n) s.add(pick([R(1, 9), R(10, 99), R(100, 650)])); const L = [...s];
      const big = R(0, 1), odd = R(0, 1); const f = L.filter(x => x % 2 === (odd ? 1 : 0)); if (!f.length) return this.fn(); const ans = big ? Math.max(...f) : Math.min(...f);
      return T({ en: `Arrange these numbers in ${big ? 'descending' : 'ascending'} order and find the ${big ? 'largest' : 'smallest'} ${odd ? 'odd' : 'even'} number.`, vi: `Sắp xếp các số sau theo thứ tự ${big ? 'từ lớn đến bé' : 'từ bé đến lớn'} và tìm số ${odd ? 'lẻ' : 'chẵn'} ${big ? 'lớn' : 'nhỏ'} nhất.`, show: `<b class="tm-seq">${L.join(', ')}</b>`, answer: ans,
        hint: 'Sắp xếp xong, đi lần lượt từ đầu dãy, bỏ qua các số không đúng loại chẵn/lẻ.', steps: [`Sắp xếp: ${L.slice().sort((a, b) => big ? b - a : a - b).join(', ')}.`, `Số ${odd ? 'lẻ' : 'chẵn'} ${big ? 'lớn' : 'nhỏ'} nhất: <b>${ans}</b>.`] });
    } },
    { level: 1, name: 'Chia đều đồ vật', fn() {
      const e = pick(EMO);
      if (R(0, 1)) { const b = R(1, 8), d = R(1, 4) * 2; const a = b + d; if (a > 18) return this.fn(); const ans = d / 2;
        return T({ en: `How many ${e} must be moved from the left box to the right box to make the number of ${e} in both boxes equal?`, vi: `Cần chuyển bao nhiêu ${e} từ ô bên trái sang ô bên phải để số ${e} ở hai ô bằng nhau?`, visual: X.vis(X.boxesSvg(a, b, e)), answer: ans,
          hint: 'Chuyển đi một nửa số chênh lệch.', steps: [`Bên trái ${a}, bên phải ${b} → hơn nhau ${d}.`, `Chuyển ${d} : 2 = <b>${ans}</b>.`] }); }
      const k = R(2, 6), m = R(2, 6); const n = k * m;
      return T({ en: `Separate ${n} ${e} equally into ${k} groups. How many ${e} are there in each group?`, vi: `Chia đều ${n} ${e} thành ${k} nhóm. Mỗi nhóm có bao nhiêu ${e}?`, answer: m,
        hint: 'Chia đều: số nào cộng với chính nó (k lần) bằng tổng?', steps: [`${Array(k).fill(m).join(' + ')} = ${n}.`, `Mỗi nhóm: <b>${m}</b>.`] });
    } },
    { level: 2, name: 'Cho bớt để bằng nhau', fn() {
      const [a, b] = X.names(2); const it = pick([['notebooks', 'quyển vở'], ['apples', 'quả táo'], ['candies', 'cái kẹo'], ['stickers', 'nhãn dán']]);
      const y = R(2, 15), d = R(1, 8) * 2; const x = y + d; const ans = d / 2;
      return T({ en: `${a} has ${x} ${it[0]} and ${b} has ${y} ${it[0]}. How many ${it[0]} does ${a} have to give ${b} so that they have the same number of ${it[0]}?`, vi: `${a} có ${x} ${it[1]}, ${b} có ${y} ${it[1]}. Hỏi ${a} phải cho ${b} bao nhiêu ${it[1]} để hai bạn có số ${it[1]} bằng nhau?`, answer: ans,
        hint: 'Cách 1: tính tổng rồi chia đôi. Cách 2: lấy hiệu chia đôi.', steps: [`Tổng: ${x} + ${y} = ${x + y} → mỗi bạn ${(x + y) / 2}.`, `${a} cho đi: ${x} − ${(x + y) / 2} = <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Chia đều cho ba bạn', fn() {
      const [a, b, c] = X.names(3);
      if (R(0, 1)) { const y = R(3, 10), t = R(1, 5); const x = y + 3 * t;
        return T({ en: `${a} has ${x} candies, ${b} and ${c} have ${y} candies each. How many candies does ${a} have to give each of them so that the three children have the same number of candies?`, vi: `${a} có ${x} cái kẹo, ${b} và ${c} mỗi bạn có ${y} cái kẹo. Hỏi ${a} phải cho mỗi bạn bao nhiêu cái kẹo để ba bạn có số kẹo bằng nhau?`, answer: t,
          hint: 'Tính tổng số kẹo rồi chia đều cho 3 bạn.', steps: [`Tổng: ${x} + ${y} + ${y} = ${x + 2 * y} → mỗi bạn ${(x + 2 * y) / 3}.`, `${a} cho mỗi bạn: ${(x + 2 * y) / 3} − ${y} = <b>${t}</b>.`] }); }
      const p = R(1, 6), q = R(1, 6); const ans = 2 * p + q;
      return T({ en: `${a} gave ${c} ${p} cookies. ${b} gave ${c} ${q} cookies. Then they all had the same number of cookies. How many more cookies did ${a} have than ${c} originally?`, vi: `${a} cho ${c} ${p} cái bánh quy. ${b} cho ${c} ${q} cái bánh quy. Sau đó ba bạn có số bánh bằng nhau. Hỏi lúc đầu ${a} có nhiều hơn ${c} bao nhiêu cái bánh?`, answer: ans,
        hint: 'Gọi số bánh lúc sau của mỗi bạn là một "phần", tính ngược lại lúc đầu.', steps: [`Lúc đầu ${a} có: (phần) + ${p}.`, `Lúc đầu ${c} có: (phần) − ${p} − ${q}.`, `${a} hơn ${c}: ${p} + ${p} + ${q} = <b>${ans}</b> (cái).`] });
    } }
  ];

  // =====================================================================
  // 4. GEOMETRY — Hình học
  // =====================================================================
  function sqCount(m, n) { let s = 0; for (let k = 1; k <= Math.min(m, n); k++) s += (m - k + 1) * (n - k + 1); return s; }
  // hm[0] = hàng trước, hm[D-1] = hàng sau cùng; hàng trước không cao hơn hàng sau (để mọi chồng đều nhìn thấy)
  function heightmap(level) {
    const D = level >= 3 ? 2 : R(1, 2), C = R(2, level >= 3 ? 4 : 3), maxH = level >= 3 ? 3 : 2;
    const back = []; for (let c = 0; c < C; c++) back.push(R(1, maxH));
    const hm = [back]; for (let d = 1; d < D; d++) hm.unshift(hm[0].map(h => R(0, h)));
    return hm;
  }
  const geo = [
    { level: 1, name: 'Đếm hình vuông trong lưới', fn() {
      const m = R(1, 3), n = R(2, 4); const ans = sqCount(m, n); const L = m * n <= 6 ? 1 : 2;
      return T({ en: 'How many squares are there in the figure below?', vi: 'Hình dưới đây có bao nhiêu hình vuông?', visual: X.vis(X.gridSvg(m, n)), answer: ans, level: L,
        hint: 'Đếm hình vuông nhỏ, rồi đếm hình vuông ghép từ 4, 9 ô nhỏ.', steps: [...Array(Math.min(m, n)).fill(0).map((_, i) => `Hình vuông cạnh ${i + 1} ô: ${(m - i) * (n - i)}.`), `Tổng: <b>${ans}</b> hình vuông.`] });
    } },
    { level: 3, name: 'Đếm hình vuông (lưới lớn)', fn() {
      const m = R(3, 4), n = R(3, 5); const ans = sqCount(m, n);
      return T({ en: 'How many squares are there in the figure below?', vi: 'Hình dưới đây có bao nhiêu hình vuông?', visual: X.vis(X.gridSvg(m, n)), answer: ans,
        hint: 'Đếm theo kích thước: 1×1, 2×2, 3×3, …', steps: [...Array(Math.min(m, n)).fill(0).map((_, i) => `Hình vuông ${i + 1}×${i + 1}: ${m - i} × ${n - i} = ${(m - i) * (n - i)}.`), `Tổng: <b>${ans}</b> hình vuông.`] });
    } },
    { level: 2, name: 'Đếm hình tam giác', fn() {
      const k = R(1, 4), h = R(0, k >= 3 ? 1 : 2); const seg = k + 1; const one = seg * (seg + 1) / 2; const ans = one * (h + 1);
      return T({ en: 'How many triangles are there in the figure below?', vi: 'Hình dưới đây có bao nhiêu hình tam giác?', visual: X.vis(X.fanSvg(k, h)), answer: ans, level: h ? 3 : 2,
        hint: 'Đánh số các tam giác nhỏ (đơn), rồi đếm tam giác ghép từ 2, 3, … tam giác đơn.', steps: [`Ở mỗi "tầng" đáy được chia thành ${seg} phần → ${Array(seg).fill(0).map((_, i) => seg - i).join(' + ')} = ${one} tam giác.`, h ? `Có ${h + 1} đáy (cạnh đáy và ${h} đường ngang) → ${one} × ${h + 1} = <b>${ans}</b>.` : `Tổng: <b>${ans}</b> hình tam giác.`] });
    } },
    { level: 1, name: 'Đếm đoạn thẳng', fn() {
      if (R(0, 2)) { const n = R(3, 6); const ans = n * (n - 1) / 2;
        return T({ en: 'How many line segments are there in the figure below?', vi: 'Hình dưới đây có bao nhiêu đoạn thẳng?', visual: X.vis(X.pointsSvg(n)), answer: ans,
          hint: 'Đếm đoạn không có điểm ở giữa, rồi đoạn có 1 điểm ở giữa, 2 điểm ở giữa…', steps: [`${Array(n - 1).fill(0).map((_, i) => n - 1 - i).join(' + ')} = <b>${ans}</b> đoạn thẳng.`] }); }
      const k = R(3, 5); const ans = k + k * (k - 1) / 2;
      return T({ en: 'How many line segments are there in the figure below?', vi: 'Hình dưới đây có bao nhiêu đoạn thẳng?', visual: X.vis(X.fanPointsSvg(k)), answer: ans, level: 2,
        hint: 'Đếm riêng các đoạn đi từ đỉnh trên và các đoạn nằm trên đường đáy.', steps: [`Từ đỉnh trên: ${k} đoạn.`, `Trên đáy có ${k} điểm: ${Array(k - 1).fill(0).map((_, i) => k - 1 - i).join(' + ')} = ${k * (k - 1) / 2} đoạn.`, `Tổng: ${k} + ${k * (k - 1) / 2} = <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Đếm khối lập phương xếp chồng', fn() {
      const lv = R(2, 3); const hm = heightmap(lv); const ans = sum(hm.map(sum)); if (ans < 3) return this.fn();
      return T({ en: 'Some identical cubes are stacked on each other to make the figure below. Every cube stands on the table or on another cube. How many cubes are there in total?', vi: 'Các khối lập phương giống hệt nhau được xếp chồng lên nhau như hình dưới. Mỗi khối đều đặt trên mặt bàn hoặc trên một khối khác. Hỏi có tất cả bao nhiêu khối lập phương?', visual: X.vis(X.cubesSvg(hm)), answer: ans, level: lv,
        hint: 'Đếm theo từng cột (từng chồng), nhớ cả các khối bị che ở phía dưới.', steps: hm.length > 1 ? [`Hàng sau: ${hm[1].join(' + ')} = ${sum(hm[1])} khối.`, `Hàng trước: ${hm[0].join(' + ')} = ${sum(hm[0])} khối.`, `Tổng: ${sum(hm[1])} + ${sum(hm[0])} = <b>${ans}</b> khối.`] : [`Các chồng: ${hm[0].join(' + ')} = <b>${ans}</b> khối.`] });
    } },
    { level: 3, name: 'Góc nhìn 3D – thấy bao nhiêu hình vuông', fn() {
      const hm = heightmap(3); const D = hm.length, C = hm[0].length; const dir = R(0, 2);
      const top = hm.reduce((s, r) => s + r.filter(x => x > 0).length, 0);
      const front = [...Array(C)].reduce((s, _, c) => s + Math.max(...hm.map(r => r[c])), 0);
      const right = hm.reduce((s, r) => s + Math.max(...r), 0);
      const ans = [top, front, right][dir]; const de = ['from the top', 'from the front', 'from the right'][dir], dv = ['từ phía trên', 'từ phía trước', 'từ bên phải'][dir];
      return T({ en: `The cubes below are stacked on each other. At least how many small squares can be seen if viewing the figure ${de}?`, vi: `Các khối lập phương dưới đây được xếp chồng lên nhau. Nhìn hình ${dv} thì thấy được ít nhất bao nhiêu hình vuông nhỏ?`, visual: X.vis(X.cubesSvg(hm)), answer: ans,
        hint: dir === 0 ? 'Nhìn từ trên: mỗi chồng khối cho đúng 1 hình vuông.' : dir === 1 ? 'Nhìn từ trước: mỗi cột (trái → phải) thấy được số hình vuông bằng chồng cao nhất của cột đó.' : 'Nhìn từ bên phải: mỗi hàng (trước → sau) thấy được số hình vuông bằng chồng cao nhất của hàng đó.',
        steps: [dir === 0 ? `Có ${top} chồng khối → thấy ${top} hình vuông.` : dir === 1 ? `Chồng cao nhất mỗi cột: ${[...Array(C)].map((_, c) => Math.max(...hm.map(r => r[c]))).join(' + ')}.` : `Chồng cao nhất mỗi hàng: ${hm.map(r => Math.max(...r)).join(' + ')}.`, `Thấy được <b>${ans}</b> hình vuông.`] });
    } }
  ];

  // =====================================================================
  // 5. COMBINATORICS — Tổ hợp
  // =====================================================================
  const twoDigits = (ds) => { const o = []; ds.forEach(a => ds.forEach(b => { if (a !== b && a !== 0) o.push(a * 10 + b); })); return [...new Set(o)]; };
  const digitSet = (k, zero) => { const s = new Set(zero ? [0] : []); while (s.size < k) s.add(R(1, 9)); return [...s].sort((a, b) => a - b); };
  function perms4(ds) { const o = []; const rec = (cur, rest) => { if (cur.length === 4) { if (cur[0] !== 0) o.push(+cur.join('')); return; } rest.forEach((d, i) => rec(cur.concat(d), rest.filter((_, j) => j !== i))); }; rec([], ds); return o; }
  // mọi cặp hai số có hai chữ số dùng đủ 4 chữ số (không lặp lại)
  function pairs22(ds) { const o = []; const seen = new Set(); ds.forEach((a, i) => ds.forEach((b, j) => ds.forEach((c, k) => ds.forEach((d, l) => { if (new Set([i, j, k, l]).size === 4 && a && c) { const key = [a * 10 + b, c * 10 + d].sort().join(); if (!seen.has(key)) { seen.add(key); o.push([a * 10 + b, c * 10 + d]); } } })))); return o; }
  const comb = [
    { level: 1, name: 'Lập số có hai chữ số – lớn nhất / nhỏ nhất', fn() {
      const [a] = X.names(1); const ds = digitSet(R(4, 6), R(0, 1)); const all = twoDigits(ds);
      const v = R(0, 5); const f = [[x => true, 'smallest', 'nhỏ nhất', 0], [x => true, 'largest', 'lớn nhất', 1], [x => x % 2 === 0, 'smallest even', 'chẵn nhỏ nhất', 0], [x => x % 2 === 1, 'smallest odd', 'lẻ nhỏ nhất', 0], [x => x % 2 === 0, 'largest even', 'chẵn lớn nhất', 1], [x => x % 2 === 1, 'largest odd', 'lẻ lớn nhất', 1]][v];
      const L = all.filter(f[0]); if (!L.length) return this.fn(); const ans = f[3] ? Math.max(...L) : Math.min(...L);
      return T({ en: `${a} chooses 2 different digits from ${ds.join(', ')} to form a 2-digit number. What is the ${f[1]} number ${a} can form?`, vi: `${a} chọn 2 chữ số khác nhau từ ${ds.join(', ')} để lập số có hai chữ số. Số ${f[2]} ${a} lập được là số nào?`, answer: ans, level: v < 2 ? 1 : 2,
        hint: 'Số lớn (nhỏ) nhất: ưu tiên chọn chữ số hàng chục trước. Số chẵn/lẻ: chọn chữ số hàng đơn vị trước. Hàng chục không được là 0.', steps: [`Số ${f[2]} lập được: <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Đếm số lập được (chẵn, lẻ)', fn() {
      const ds = digitSet(R(3, 5), R(0, 1)); const all = twoDigits(ds); const v = R(0, 2); const L = all.filter([x => true, x => x % 2 === 0, x => x % 2 === 1][v]);
      const w = ['', ' even', ' odd'][v], wv = ['', ' chẵn', ' lẻ'][v];
      return T({ en: `Choose 2 digits, without repetition, from ${ds.join(', ')} to form 2-digit numbers. How many${w} numbers can be formed?`, vi: `Chọn 2 chữ số không lặp lại từ ${ds.join(', ')} để lập các số có hai chữ số. Lập được bao nhiêu số${wv}?`, answer: L.length,
        hint: 'Liệt kê theo chữ số hàng chục để không sót, không trùng.', steps: [`Các số: ${L.join(', ') || 'không có'}.`, `Có <b>${L.length}</b> số.`] });
    } },
    { level: 3, name: 'Lập số có bốn chữ số', fn() {
      const ds = digitSet(5, R(0, 2) > 0); const all = perms4(ds); const v = R(0, 3);
      const f = [[x => true, 'smallest', 'nhỏ nhất', 0], [x => x % 2 === 0, 'greatest even', 'chẵn lớn nhất', 1], [x => x % 2 === 1, 'greatest odd', 'lẻ lớn nhất', 1], [x => x % 2 === 1, 'smallest odd', 'lẻ nhỏ nhất', 0]][v];
      const L = all.filter(f[0]); if (!L.length) return this.fn(); const ans = f[3] ? Math.max(...L) : Math.min(...L);
      return T({ en: `What is the ${f[1]} 4-digit number formed by using ${ds.join(', ')}? (Each digit can only be used once.)`, vi: `Số ${f[2]} có 4 chữ số được lập từ ${ds.join(', ')} là số nào? (Mỗi chữ số chỉ dùng một lần.)`, answer: ans,
        hint: 'Chọn hàng đơn vị trước nếu đề hỏi chẵn/lẻ, rồi chọn từ trái sang phải. Hàng nghìn khác 0.', steps: [`Số ${f[2]}: <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Tổng lớn nhất / nhỏ nhất của hai số', fn() {
      const ds = digitSet(4, R(0, 2) === 0); const big = R(0, 1); const P = pairs22(ds); if (!P.length) return this.fn();
      const best = P.reduce((b, p) => { const s = p[0] + p[1]; return !b || (big ? s > b.s : s < b.s) ? { s, p } : b; }, null);
      return T({ en: `Given 4 digits ${ds.join(', ')}. Find the ${big ? 'greatest' : 'smallest'} sum of two 2-digit numbers formed by those digits without repetition.`, vi: `Cho 4 chữ số ${ds.join(', ')}. Tìm tổng ${big ? 'lớn' : 'nhỏ'} nhất của hai số có hai chữ số lập từ các chữ số đó (không lặp lại).`, answer: best.s,
        hint: big ? 'Hai chữ số lớn nhất làm hàng chục, hai chữ số còn lại làm hàng đơn vị.' : 'Hai chữ số nhỏ nhất (khác 0) làm hàng chục, hai chữ số còn lại làm hàng đơn vị.', steps: [`Ví dụ: ${best.p[0]} + ${best.p[1]} = <b>${best.s}</b>.`] });
    } },
    { level: 3, name: 'Hiệu lớn nhất / nhỏ nhất của hai số', fn() {
      const ds = digitSet(4, R(0, 2) === 0); const big = R(0, 1); const P = pairs22(ds); if (!P.length) return this.fn();
      const best = P.reduce((b, p) => { const s = Math.abs(p[0] - p[1]); return !b || (big ? s > b.s : s < b.s) ? { s, p: p.slice().sort((x, y) => y - x) } : b; }, null);
      return T({ en: `Given 4 digits ${ds.join(', ')}. Find the ${big ? 'greatest' : 'smallest'} difference of two 2-digit numbers formed by those digits without repetition.`, vi: `Cho 4 chữ số ${ds.join(', ')}. Tìm hiệu ${big ? 'lớn' : 'nhỏ'} nhất của hai số có hai chữ số lập từ các chữ số đó (không lặp lại).`, answer: best.s,
        hint: big ? 'Số bị trừ lớn nhất, số trừ nhỏ nhất có thể.' : 'Chọn hai chữ số hàng chục gần nhau nhất; số lớn lấy hàng đơn vị nhỏ nhất, số bé lấy hàng đơn vị lớn nhất.', steps: [`${best.p[0]} − ${best.p[1]} = <b>${best.s}</b>.`] });
    } },
    { level: 1, name: 'Tiền – còn lại / ai nhiều tiền hơn', fn() {
      const [a, b] = X.names(2);
      if (R(0, 1)) { const n2 = R(2, 8), n5 = R(1, 4); const tot = 2 * n2 + 5 * n5; const p = R(2, 6), k = R(1, 3); if (p * k > tot) return this.fn(); const ans = tot - p * k;
        return T({ en: `${a} has ${X.pl(n2, '$2 coin')} and ${X.pl(n5, '$5 coin')}. ${a} buys ${X.pl(k, 'book')}. Each book costs $${p}. How many dollars does ${a} have left?`, vi: `${a} có ${n2} đồng xu 2 đô và ${n5} đồng xu 5 đô. ${a} mua ${k} cuốn sách, mỗi cuốn giá ${p} đô. Hỏi ${a} còn lại bao nhiêu đô?`, answer: ans, unit: 'đô',
          hint: 'Tính tổng số tiền trước.', steps: [`Tổng: ${n2} × 2 + ${n5} × 5 = ${tot} (đô).`, `Tiền sách: ${k} × ${p} = ${p * k} (đô).`, `Còn lại: ${tot} − ${p * k} = <b>${ans}</b> (đô).`] }); }
      const A = [R(2, 8), R(0, 3)], B = [R(1, 5), R(0, 2)]; const ta = A[0] + 5 * A[1], tb = 2 * B[0] + 10 * B[1]; if (ta === tb) return this.fn();
      return T({ en: `${a} has ${X.pl(A[0], '$1 coin')} and ${X.pl(A[1], '$5 coin')}. ${b} has ${X.pl(B[0], '$2 coin')} and ${X.pl(B[1], '$10 coin')}. Who has more money?`, vi: `${a} có ${A[0]} đồng 1 đô và ${A[1]} đồng 5 đô. ${b} có ${B[0]} đồng 2 đô và ${B[1]} đồng 10 đô. Ai có nhiều tiền hơn?`, choices: [a, b], ans: ta > tb ? 0 : 1,
        hint: 'Tính tổng tiền của từng bạn.', steps: [`${a}: ${A[0]} + ${A[1]} × 5 = ${ta} (đô).`, `${b}: ${B[0]} × 2 + ${B[1]} × 10 = ${tb} (đô).`, `<b>${ta > tb ? a : b}</b> có nhiều tiền hơn.`] });
    } },
    { level: 2, name: 'Tiền – mua được nhiều nhất', fn() {
      const [a] = X.names(1); const c = [R(1, 8), R(1, 4), R(1, 4)]; const tot = c[0] + 2 * c[1] + 5 * c[2]; const p = R(3, 7); const ans = Math.floor(tot / p); if (!ans) return this.fn();
      return T({ en: `${a} has ${X.pl(c[0], '$1 coin')}, ${X.pl(c[1], '$2 coin')} and ${X.pl(c[2], '$5 coin')}. ${a} pays for all the toys together. At most how many toys can ${a} buy if each toy costs $${p}?`, vi: `${a} có ${c[0]} đồng xu 1 đô, ${c[1]} đồng xu 2 đô và ${c[2]} đồng xu 5 đô. ${a} trả tiền tất cả đồ chơi cùng một lúc. Hỏi ${a} mua được nhiều nhất bao nhiêu món đồ chơi, biết mỗi món giá ${p} đô?`, answer: ans,
        hint: 'Tính tổng số tiền, rồi cộng dần giá mỗi món cho đến khi không đủ tiền.', steps: [`Tổng: ${c[0]} × 1 + ${c[1]} × 2 + ${c[2]} × 5 = ${tot} (đô).`, `${Array(ans).fill(p).join(' + ')} = ${ans * p} ≤ ${tot}${tot - ans * p ? `, còn thừa ${tot - ans * p} đô (không đủ mua thêm)` : ''}.`, `Mua được nhiều nhất <b>${ans}</b> món.`] });
    } },
    { level: 3, name: 'Tiền – số cách trả không cần thối', fn() {
      const [a] = X.names(1); const c = [R(3, 8), R(1, 3), R(1, 2)]; const N = R(6, 10); const ways = [];
      for (let z = 0; z <= c[2]; z++) for (let y = 0; y <= c[1]; y++) { const x = N - 5 * z - 2 * y; if (x >= 0 && x <= c[0]) ways.push([x, y, z]); }
      if (ways.length < 2 || ways.length > 8) return this.fn();
      return T({ en: `${a} has ${X.pl(c[0], '$1 coin')}, ${X.pl(c[1], '$2 coin')} and ${X.pl(c[2], '$5 coin')}. How many ways can ${a} pay for a $${N} souvenir without any change?`, vi: `${a} có ${c[0]} đồng xu 1 đô, ${c[1]} đồng xu 2 đô và ${c[2]} đồng xu 5 đô. Hỏi ${a} có bao nhiêu cách trả đúng ${N} đô cho món quà lưu niệm mà không cần nhận tiền thối?`, answer: ways.length, unit: 'cách',
        hint: 'Liệt kê theo số đồng 5 đô, rồi số đồng 2 đô; phần còn lại trả bằng đồng 1 đô (đủ số đồng không?).', steps: ways.map(w => `${N} = ${[...Array(w[2]).fill(5), ...Array(w[1]).fill(2), ...Array(w[0]).fill(1)].join(' + ')}`).concat([`Có <b>${ways.length}</b> cách.`]) });
    } }
  ];

  // =====================================================================
  // 6. VOCABULARY — Từ vựng
  // =====================================================================
  const vocab = [
    { level: 1, name: 'Từ tiếng Anh → nghĩa tiếng Việt', fn() {
      const w = pick(X.ALL); const others = shuffle(X.ALL.filter(x => x.vi !== w.vi)).slice(0, 3).map(x => x.vi);
      return MA.U.Q({ text: `<div class="tm-q"><div class="tm-en" lang="en">What does “<b>${w.en}</b>” mean?</div><div class="tm-vi">Từ “<b>${w.en}</b>” nghĩa là gì?</div></div>`, answer: w.vi, options: [w.vi].concat(others), keepMc: true, say: { en: w.en, vi: '' },
        hint: `Phân môn: ${X.SUBJ[w.s].vi}.`, steps: [`${w.en} = <b>${w.vi}</b>.`] });
    } },
    { level: 1, name: 'Nghĩa tiếng Việt → từ tiếng Anh', fn() {
      const w = pick(X.ALL); const others = shuffle(X.ALL.filter(x => x.vi !== w.vi && x.en !== w.en)).slice(0, 3).map(x => x.en);
      return MA.U.Q({ text: `<div class="tm-q"><div class="tm-vi">Từ tiếng Anh nào có nghĩa là “<b>${w.vi}</b>”?</div></div>`, answer: w.en, options: [w.en].concat(others), keepMc: true, say: { en: '', vi: `Từ tiếng Anh nào có nghĩa là ${w.vi}?` },
        hint: `Phân môn: ${X.SUBJ[w.s].vi}.`, steps: [`${w.vi} = <b>${w.en}</b>.`] });
    } }
  ];

  // =====================================================================
  // Đăng ký chủ đề (track 'timo', lớp 2)
  // =====================================================================
  const voc = (s) => X.GLOSS[s].slice(0, 8).map(([e, v]) => `${e} = ${v}`).join(' · ');
  const mk = (id, s, tagline, summary, rules, pitfalls, examples, gens) => ({ id, track: 'timo', subj: s, icon: X.SUBJ[s].icon, title: `${X.SUBJ[s].vi} · ${X.SUBJ[s].en}`, tagline, summary, prereqs: [], rules, pitfalls, examples, gens: gens.sort((a, b) => a.level - b.level) });
  MA.Data.addTopics(2, [
    mk('tm2_logic', 'logic', 'Dãy số – dãy chữ – dãy hình · Thứ ngày tháng · Tính tuổi · Xếp hàng',
      'Phân môn Tư duy logic (Logical Thinking) gồm 5 dạng: dãy số và dãy chữ có quy luật, dãy hình có quy luật, thứ – ngày – tháng, bài toán tính tuổi và bài toán xếp hàng.',
      [{ title: 'Dãy số, dãy chữ có quy luật', desc: 'Tìm quy luật bằng cách: xét hiệu hai số liên tiếp; xét tổng hai số liên tiếp; tách thành hai dãy đan xen. Dãy chữ cái: viết bảng chữ cái rồi khoanh các chữ có trong dãy.', formula: 'Sequence = dãy · Pattern = quy luật · Term = số hạng · Next = tiếp theo', example: '2, 5, 8, 11, … (+3) → số thứ 8: 2 + 7 × 3 = 23.' },
       { title: 'Dãy hình có quy luật', desc: 'Tìm nhóm hình lặp lại. Hình thứ N: lấy N chia cho số hình trong nhóm, xem số dư.', formula: 'Figure = hình · Symbol = ký hiệu', example: 'Nhóm ★●● (3 hình). Hình thứ 14: 14 = 3 × 4 + 2 → hình thứ 2 của nhóm: ●.' },
       { title: 'Thứ – ngày – tháng', desc: 'Cứ 7 ngày thì thứ lặp lại. Hôm kia ← hôm qua ← hôm nay → ngày mai → ngày kia. Đề hỏi "ago/before" là lùi, "later/after" là tiến.', formula: 'Today = hôm nay · Yesterday = hôm qua · Tomorrow = ngày mai · Later = sau · Ago = trước', tip: 'Tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày; tháng 4, 6, 9, 11 có 30 ngày; tháng 2 có 28 hoặc 29 ngày.' },
       { title: 'Bài toán tính tuổi', desc: 'Hiệu số tuổi của hai người không đổi theo thời gian. Quy về tuổi của từng người ở đúng thời điểm đề cho.', formula: 'Age = tuổi · Years old = tuổi · Equal to = bằng · Born = sinh ra', example: 'Tuổi Amy 7 năm sau = tuổi John 3 năm sau; John 25 tuổi → John 3 năm sau 28 tuổi → Amy hiện nay 28 − 7 = 21 tuổi.' },
       { title: 'Bài toán xếp hàng', desc: 'Vị trí = số người đứng trước + 1 = Tổng − số người đứng sau. Số người ở giữa = Vị trí lớn − Vị trí nhỏ − 1.', formula: 'In front of = phía trước · Behind = phía sau · Between = ở giữa · Position = vị trí' }],
      [{ wrong: 'Phía trước có 4 người, phía sau có 5 người → hàng có 9 người', right: '4 + 1 + 5 = 10 người', why: 'Phải tính cả chính bạn đó.' },
       { wrong: 'Đứng thứ 3 và thứ 9 → ở giữa có 6 người', right: '9 − 3 − 1 = 5 người', why: 'Không tính hai bạn ở hai đầu.' }],
      [{ q: 'According to the pattern, find the next term: 1, 20, 2, 19, 3, 18, 4, …', steps: ['Tách hai dãy: 1, 2, 3, 4, … và 20, 19, 18, …', 'Số tiếp theo thuộc dãy thứ hai: 18 − 1 = <b>17</b>.'] },
       { q: 'Tomorrow will be Friday. Which day of the week was it 3 days ago?', steps: ['Ngày mai thứ Sáu → hôm nay thứ Năm.', 'Lùi 3 ngày: thứ Tư, thứ Ba, thứ Hai → <b>Monday</b>.'] }],
      logic),
    mk('tm2_arith', 'arith', 'Ghép cặp hợp lý · Tính chất phân phối · Cân bằng phép tính · Bài toán mật mã',
      'Phân môn Số học (Arithmetic) gồm: tính nhanh bằng cách ghép cặp, tính chất phân phối và giao hoán của phép nhân, cân bằng phép tính (tìm số bị che) và bài toán mật mã.',
      [{ title: 'Ghép cặp hợp lý', desc: 'Ghép các số có hàng đơn vị cộng lại tròn chục: (1 và 9), (2 và 8), (3 và 7), (4 và 6), (5 và 5). Trong dãy chỉ có cộng, trừ: được đổi chỗ các số, giữ nguyên dấu đứng trước số đó.', formula: 'Find the value of = tính giá trị của · Sum = tổng', example: '24 + 62 + 16 + 29 + 8 = (24 + 16) + (62 + 8) + 29 = 40 + 70 + 29 = 139.' },
       { title: 'Tính chất phân phối của phép nhân', desc: 'a × b + a × c = a × (b + c);  a × b − a × c = a × (b − c). Phép nhân có tính giao hoán: 113 × 2 = 2 × 113.', formula: 'Multiplication = phép nhân · Calculate = tính', example: '15 × 12 + 15 × 3 − 15 × 5 = 15 × (12 + 3 − 5) = 15 × 10 = 150.' },
       { title: 'Cân bằng phép tính', desc: 'Hai vế của dấu bằng có giá trị bằng nhau. Tính vế đã biết, rồi tìm số hạng / số bị trừ / số trừ chưa biết.', formula: 'Equation = phép tính · Equal sign = dấu bằng · Covered by = bị che bởi', example: '5 + ? = 3 + 4 → 5 + ? = 7 → ? = 2.' },
       { title: 'Bài toán mật mã', desc: 'Đặt tính theo hàng dọc. Xét từng hàng từ phải sang trái, chia trường hợp có nhớ và không nhớ. Chữ số hàng đầu không thể là 0.', formula: 'Digit = chữ số · Value = giá trị', tip: 'AB + BA = 11 × (A + B).' }],
      [{ wrong: '23 − 37 + 20 không tính được vì 23 < 37', right: '23 + 20 − 37 = 6', why: 'Được đổi chỗ các số, giữ nguyên dấu đứng trước.' }],
      [{ q: 'Find the value of 703 + 34 + 321 + 679 + 966 + 1297.', steps: ['(703 + 1297) + (34 + 966) + (321 + 679)', '= 2000 + 1000 + 1000 = <b>4000</b>.'] },
       { q: '●+● − 11 = 3 + 4. Find ●.', steps: ['3 + 4 = 7 → ● + ● = 7 + 11 = 18.', '● = 18 : 2 = <b>9</b>.'] }],
      arith),
    mk('tm2_numth', 'numth', 'Số chẵn – số lẻ · Sắp xếp các số · Chia đều đồ vật',
      'Phân môn Lý thuyết số (Number Theory) gồm: số chẵn và số lẻ, sắp xếp các số theo thứ tự, chia đều đồ vật (cho – nhận để bằng nhau).',
      [{ title: 'Số chẵn và số lẻ', desc: 'Chỉ cần xem chữ số tận cùng: 0, 2, 4, 6, 8 → số chẵn; 1, 3, 5, 7, 9 → số lẻ. Tổng có lẻ số số lẻ thì là số lẻ.', formula: 'Odd = lẻ · Even = chẵn · Largest = lớn nhất · Smallest = nhỏ nhất', example: 'Số lẻ lớn nhất có 3 chữ số: 999. Số chẵn nhỏ nhất có 2 chữ số: 10.' },
       { title: 'Sắp xếp các số', desc: 'Chia nhóm theo số chữ số; trong mỗi nhóm so sánh từ hàng cao nhất. Thứ tự giảm dần = lớn đến bé; tăng dần = bé đến lớn.', formula: 'Arrange = sắp xếp · Descending = giảm dần · Ascending = tăng dần', example: '12, 39, 5, 101 → tăng dần: 5, 12, 39, 101.' },
       { title: 'Chia đều đồ vật', desc: 'Chia đều = các phần bằng nhau. Muốn hai bạn bằng nhau: bạn nhiều hơn cho đi một nửa số chênh lệch (hoặc tính tổng rồi chia đôi).', formula: 'Separate / Divide = chia · Equally = đều nhau · Each = mỗi · The same = giống nhau', example: 'Teddy 12 táo, John 4 táo → hơn 8 → Teddy cho John 8 : 2 = 4 quả.' }],
      [{ wrong: 'Teddy hơn John 8 quả → cho John 8 quả', right: 'Cho 4 quả', why: 'Cho đi thì người cho giảm, người nhận tăng: chênh lệch giảm 2 lần số cho.' }],
      [{ q: 'How many even numbers are there among 21, 32, 45, 9, 10?', steps: ['Tận cùng chẵn: 32, 10.', 'Có <b>2</b> số chẵn.'] }],
      numth),
    mk('tm2_geo', 'geo', 'Đếm hình vuông · Đếm tam giác · Đếm đoạn thẳng · Khối lập phương · Góc nhìn 3D',
      'Phân môn Hình học (Geometry) lớp 2 chủ yếu là các bài đếm hình: hình vuông, hình tam giác, đoạn thẳng, khối lập phương xếp chồng và số hình vuông nhìn thấy từ các phía.',
      [{ title: 'Đếm hình vuông', desc: 'Đếm hình vuông nhỏ, rồi đếm các hình vuông lớn ghép bởi 4, 9, 16, … hình vuông nhỏ.', formula: 'Count = đếm · Square = hình vuông · The number of = số lượng', example: 'Lưới 2 × 2: 4 hình nhỏ + 1 hình lớn = 5 hình vuông.' },
       { title: 'Đếm hình tam giác', desc: 'Đánh số các tam giác đơn; đếm lần lượt tam giác ghép từ 1, 2, 3, … tam giác đơn. Tam giác chia bởi k đường từ đỉnh: đáy có k + 1 phần → 1 + 2 + … + (k + 1) tam giác.', formula: 'Triangle = hình tam giác' },
       { title: 'Đếm đoạn thẳng', desc: 'Đếm đoạn không có điểm ở giữa, rồi đoạn có 1 điểm, 2 điểm ở giữa… n điểm trên một đường: (n − 1) + (n − 2) + … + 1.', formula: 'Line segment = đoạn thẳng · Point = điểm', example: '4 điểm: 3 + 2 + 1 = 6 đoạn.' },
       { title: 'Khối lập phương và góc nhìn 3D', desc: 'Đếm theo từng chồng, nhớ các khối bị che ở dưới. Nhìn từ trên: mỗi chồng 1 hình vuông. Nhìn từ trước: mỗi cột thấy số hình bằng chồng cao nhất. Nhìn từ phải: mỗi hàng thấy số hình bằng chồng cao nhất.', formula: 'Cube = hình lập phương · Stack = xếp chồng · Face = mặt · At least = ít nhất', tip: 'Số mặt trước = số mặt sau; số mặt trái = số mặt phải; số mặt trên = số mặt dưới.' }],
      [{ wrong: 'Lưới 2 × 2 có 4 hình vuông', right: '5 hình vuông', why: 'Quên hình vuông lớn ghép từ 4 ô nhỏ.' }],
      [{ q: 'How many triangles are there in a square with its two diagonals?', steps: ['4 tam giác đơn.', 'Tam giác ghép từ 2 tam giác đơn: 4.', 'Tổng: 4 + 4 = <b>8</b>.'] }],
      geo),
    mk('tm2_comb', 'comb', 'Thành lập số · Tổng lớn nhất – nhỏ nhất · Hiệu lớn nhất – nhỏ nhất · Bài toán về tiền',
      'Phân môn Tổ hợp (Combinatorics) gồm: lập số từ các chữ số cho trước, tìm tổng/hiệu lớn nhất – nhỏ nhất của hai số, và các bài toán về tiền (số cách trả, mua được nhiều nhất).',
      [{ title: 'Thành lập số', desc: 'Muốn số lớn nhất (nhỏ nhất): chọn từ trái sang phải. Muốn số chẵn (lẻ): chọn chữ số hàng đơn vị trước. Chữ số đầu tiên phải khác 0.', formula: 'Digit = chữ số · Form = lập · Without repetition = không lặp lại', example: 'Từ 1, 3, 4, 5, 8: số chẵn nhỏ nhất có hai chữ số là 14.' },
       { title: 'Tổng lớn nhất / nhỏ nhất', desc: 'Tổng lớn nhất: hai chữ số lớn nhất làm hàng chục, hai chữ số tiếp theo làm hàng đơn vị. Tổng nhỏ nhất: làm ngược lại (hàng chục khác 0).', formula: 'Sum = tổng · Greatest = lớn nhất', example: 'Từ 1, 2, 3, 4, 5: tổng lớn nhất 53 + 42 = 95 (không phải 54 + 32 = 86).' },
       { title: 'Hiệu lớn nhất / nhỏ nhất', desc: 'Hiệu lớn nhất = số lớn nhất − số nhỏ nhất. Hiệu nhỏ nhất: hai chữ số hàng chục gần nhau nhất; số lớn lấy hàng đơn vị nhỏ nhất, số bé lấy hàng đơn vị lớn nhất.', formula: 'Difference = hiệu' },
       { title: 'Bài toán về tiền', desc: 'Liệt kê có thứ tự (từ đồng tiền lớn nhất) để không sót cách trả. Mua nhiều nhất: tính tổng tiền rồi chia cho giá.', formula: 'Coin = đồng xu · Cost = giá · Ways = cách · Change = tiền thối lại', example: '7 = 5 + 2 = 5 + 1 + 1 = 2 + 2 + 1 + 1 + 1 = …' }],
      [{ wrong: 'Tổng lớn nhất: 54 + 32 = 86', right: '53 + 42 = 95', why: 'Hai chữ số lớn nhất phải cùng nằm ở hàng chục.' }],
      [{ q: 'Tom chooses 2 different digits from 1, 4, 7 to form 2-digit numbers. How many odd numbers are there?', steps: ['14, 17, 41, 47, 71, 74.', 'Số lẻ: 17, 41, 47, 71 → <b>4</b> số.'] }],
      comb),
    { id: 'tm2_vocab', track: 'timo', subj: 'vocab', icon: '🔤', title: 'Từ vựng TIMO · Vocabulary', tagline: 'Thuật ngữ toán tiếng Anh theo 5 phân môn', summary: 'Đề TIMO viết bằng tiếng Anh. Thuộc các từ khoá giúp con hiểu đề nhanh và chính xác.', prereqs: [],
      rules: Object.keys(X.SUBJ).map(s => ({ title: `${X.SUBJ[s].icon} ${X.SUBJ[s].en} – ${X.SUBJ[s].vi}`, desc: voc(s) })),
      pitfalls: [{ wrong: 'Odd = chẵn', right: 'Odd = lẻ, Even = chẵn', why: 'Hai từ hay bị nhầm nhất!' }],
      examples: [{ q: 'Descending order nghĩa là gì?', steps: ['Descending = đi xuống → <b>thứ tự giảm dần</b> (từ lớn đến bé).'] }],
      gens: vocab }
  ]);
})(window.MA);
