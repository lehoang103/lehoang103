/* =========================================================
 * timo-g2-de.js — LỚP 2: DẠNG BÀI BỔ SUNG TỪ ĐỀ TIMO CŨ
 * Phân tích 10 đề (5 đề vòng loại, 5 đề vòng quốc gia 2016–2021): các dạng chưa có
 * trong tài liệu chuyên đề được bổ sung vào 5 phân môn bằng MA.Data.extend().
 * Đề do máy sinh ngẫu nhiên (đổi số, đổi tên), không chép đề gốc.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, shuffle, gcd } = MA.U;
  const X = MA.Timo; const T = (o) => X.T(o);
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const SEQ = (arr, tail = '') => `<b class="tm-seq">${arr.join(', ')}${tail}</b>`;
  const GIRLS = ['Amy', 'Anna', 'Lucy', 'Mary', 'Emma', 'Alice', 'Lily', 'Mia'], BOYS = ['Tom', 'Peter', 'Jack', 'Ben', 'David', 'Kevin', 'Harry', 'Sam', 'Michael'];
  const C2 = (n) => n * (n - 1) / 2, C3 = (n) => n * (n - 1) * (n - 2) / 6;
  const PAR4 = [['Odd', 'Số lẻ'], ['Even', 'Số chẵn'], ['Both odd and even', 'Vừa chẵn vừa lẻ'], ['Neither odd nor even', 'Không chẵn không lẻ']];
  const MVI = (i) => `tháng ${i + 1}`;

  // ---------------- Tư duy logic ----------------
  const logic = [
    { level: 1, name: 'Tháng – mấy tháng nữa', fn() {
      const v = R(0, 2), m0 = R(0, 11), n = R(3, 20), later = R(0, 3) > 0; const ref = (m0 + [0, -1, 1][v] + 12) % 12;
      const tgt = ((m0 + (later ? n : -n)) % 12 + 12) % 12; const set = shuffle([0, 1, -1, 2, 3, -2].map(k => (tgt + k + 12) % 12)).filter((x, i, a) => a.indexOf(x) === i).slice(0, 4); if (!set.includes(tgt)) set[0] = tgt;
      const opts = shuffle(set);
      const re = [`This month is <b>${X.MONTHS_EN[ref]}</b>.`, `Last month was <b>${X.MONTHS_EN[ref]}</b>.`, `Next month will be <b>${X.MONTHS_EN[ref]}</b>.`][v];
      const rv = [`Tháng này là <b>${MVI(ref)}</b>.`, `Tháng trước là <b>${MVI(ref)}</b>.`, `Tháng sau là <b>${MVI(ref)}</b>.`][v];
      return T({ en: `${re} Which month will it be ${later ? `<b>${n} months later</b>` : `<b>${n} months ago</b>`} (from now)?`, vi: `${rv} Hỏi ${later ? `<b>${n} tháng nữa</b>` : `<b>${n} tháng trước</b>`} (tính từ bây giờ) là tháng mấy?`, choices: opts.map(i => [X.MONTHS_EN[i], 'Tháng ' + (i + 1)]), ans: opts.indexOf(tgt),
        hint: 'Một năm có 12 tháng: sau 12 tháng lại về đúng tháng đó.', steps: [`Tháng hiện tại: tháng ${m0 + 1}.`, n >= 12 ? `${n} tháng = 12 tháng + ${n - 12} tháng.` : `${later ? 'Đếm tiến' : 'Đếm lùi'} ${n} tháng.`, `Kết quả: <b>tháng ${tgt + 1}</b> (${X.MONTHS_EN[tgt]}).`] });
    } },
    { level: 1, name: 'Gia đình, lớp học – đếm người', fn() {
      const v = R(0, 2);
      if (v === 0) { const g = pick(GIRLS), s = R(1, 4), b = R(1, 4);
        return T({ en: `${g} has ${X.pl(s, 'sister')} and ${X.pl(b, 'brother')}. How many children does ${g}'s mother have?`, vi: `${g} có ${s} chị em gái và ${b} anh em trai. Hỏi mẹ của ${g} có bao nhiêu người con?`, answer: s + b + 1, unit: 'người con',
          hint: 'Đừng quên tính cả chính bạn ấy.', steps: [`${s} + ${b} + 1 = <b>${s + b + 1}</b> (người con).`] }); }
      if (v === 1) { const g = pick(GIRLS.concat(BOYS)), n = R(3, 8);
        return T({ en: `${g}'s father has ${n} children. How many brothers and sisters does ${g} have?`, vi: `Bố của ${g} có ${n} người con. Hỏi ${g} có bao nhiêu anh chị em?`, answer: n - 1,
          hint: 'Anh chị em của bạn ấy không tính chính bạn ấy.', steps: [`${n} − 1 = <b>${n - 1}</b>.`] }); }
      const boy = R(0, 1); const nm = pick(boy ? BOYS : GIRLS), b = R(4, 15), gl = R(4, 15);
      return T({ en: `${nm}'s class has ${b} boys and ${gl} girls. How many classmates does ${nm} have?`, vi: `Lớp của ${nm} có ${b} bạn trai và ${gl} bạn gái. Hỏi ${nm} có bao nhiêu bạn cùng lớp?`, answer: b + gl - 1, unit: 'bạn',
        hint: `${nm} là ${boy ? 'bạn trai' : 'bạn gái'} trong lớp; bạn cùng lớp không tính chính mình.`, steps: [`Cả lớp: ${b} + ${gl} = ${b + gl} bạn.`, `Bạn cùng lớp của ${nm}: ${b + gl} − 1 = <b>${b + gl - 1}</b>.`] });
    } },
    { level: 2, name: 'Chạy vòng có nghỉ · cưa gỗ', fn() {
      if (R(0, 1)) { const [a] = X.names(1), t = R(5, 12), r = R(1, 3), n = R(3, 10); const ans = n * t + (n - 1) * r;
        return T({ en: `${a} needs ${t} minutes to finish a lap. After each lap, ${a} rests for ${X.pl(r, 'minute')} before the next lap. How many minutes does ${a} take to finish ${n} laps?`, vi: `${a} cần ${t} phút để chạy một vòng. Sau mỗi vòng, ${a} nghỉ ${r} phút rồi mới chạy vòng tiếp theo. Hỏi ${a} mất bao nhiêu phút để chạy xong ${n} vòng?`, answer: ans, unit: 'phút',
          hint: `Chạy ${n} vòng thì chỉ nghỉ ${n - 1} lần (sau vòng cuối không cần nghỉ).`, steps: [`Thời gian chạy: ${n} × ${t} = ${n * t} (phút).`, `Số lần nghỉ: ${n - 1} → ${n - 1} × ${r} = ${(n - 1) * r} (phút).`, `Tổng: <b>${ans}</b> phút.`] }); }
      const t = R(2, 6), k = R(3, 9); const ans = (k - 1) * t;
      return T({ en: `It takes ${t} minutes to saw a log into 2 pieces. How many minutes does it take to saw the same log into ${k} pieces?`, vi: `Cưa một khúc gỗ thành 2 đoạn mất ${t} phút. Hỏi cưa khúc gỗ đó thành ${k} đoạn mất bao nhiêu phút?`, answer: ans, unit: 'phút',
        hint: 'Cưa thành 2 đoạn chỉ cần 1 nhát cưa. Số nhát cưa = số đoạn − 1.', steps: [`Số nhát cưa: ${k} − 1 = ${k - 1}.`, `Thời gian: ${k - 1} × ${t} = <b>${ans}</b> (phút).`] });
    } },
    { level: 2, name: 'Xếp hàng – vị trí đếm từ phía sau', fn() {
      const [a] = X.names(1), N = R(12, 35); const v = R(0, 1); const k = R(2, N - 2);
      if (v) { const ans = N - k + 1;
        return T({ en: `${N} children form a row. ${a} is the <b>${X.ord(k)}</b> starting from the front. What is ${a}'s position counting from behind?`, vi: `${N} bạn nhỏ xếp thành một hàng. ${a} đứng thứ <b>${k}</b> tính từ phía trước. Hỏi tính từ phía sau, ${a} đứng thứ mấy?`, answer: ans,
          hint: 'Vị trí từ sau = Tổng − Vị trí từ trước + 1.', steps: [`Phía sau ${a} có: ${N} − ${k} = ${N - k} bạn.`, `Vị trí tính từ phía sau: ${N - k} + 1 = <b>${ans}</b>.`] }); }
      const f = k; const ans = N - f;
      return T({ en: `${N} children form a line. There are ${f} people in front of ${a}. What is ${a}'s position counting from behind?`, vi: `${N} bạn nhỏ xếp thành một hàng. Có ${f} người đứng trước ${a}. Hỏi tính từ phía sau, ${a} đứng thứ mấy?`, answer: ans,
        hint: 'Số người phía sau = Tổng − số người phía trước − 1.', steps: [`Phía sau ${a}: ${N} − ${f} − 1 = ${N - f - 1} người.`, `Vị trí từ phía sau: ${N - f - 1} + 1 = <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Đoán số (chữ số đúng – vị trí đúng)', fn() {
      const three = R(0, 2) === 0, L = three ? 3 : 2;
      const all = []; for (let n = three ? 102 : 10; n < (three ? 1000 : 100); n++) { const s = String(n); if (new Set(s).size === L) all.push(s); }
      const sec = pick(all); const fb = (g, s) => { let k = 0, p = 0; for (let i = 0; i < L; i++) { if (s.includes(g[i])) k++; if (g[i] === s[i]) p++; } return [k, p]; };
      const clues = []; let cand = all;
      for (let t = 0; t < 60 && cand.length > 1 && clues.length < 4; t++) {
        const g = pick(all); if (g === sec || clues.some(c => c.g === g)) continue; const f = fb(g, sec); if (!f[0]) continue;
        const nc = cand.filter(s => { const x = fb(g, s); return x[0] === f[0] && x[1] === f[1]; }); if (nc.length === cand.length) continue;
        clues.push({ g, f }); cand = nc;
      }
      if (cand.length !== 1) return this.fn();
      const say = (f) => { const [k, p] = f; const w = k - p;
        if (k === 1) return [p ? 'One digit is correct and it is in the correct position.' : 'One digit is correct but it is in the wrong position.', p ? 'Có 1 chữ số đúng và đúng vị trí.' : 'Có 1 chữ số đúng nhưng sai vị trí.'];
        return [`${k} digits are correct: ${p} in the correct position${p === 1 ? '' : 's'}, ${w} in the wrong position${w === 1 ? '' : 's'}.`, `Có ${k} chữ số đúng: ${p} chữ số đúng vị trí, ${w} chữ số sai vị trí.`]; };
      const list = (lang) => clues.map(c => `<li><b>${c.g}</b> → ${say(c.f)[lang]}</li>`).join('');
      return T({ en: `John wrote a ${L}-digit number with different digits and asked Peter to guess it. Peter's guesses and John's answers are below. What is the number?<ul class="tm-clue">${list(0)}</ul>`, vi: `John viết một số có ${L} chữ số khác nhau và nhờ Peter đoán. Các lần đoán và câu trả lời của John như dưới đây. Đó là số nào?<ul class="tm-clue">${list(1)}</ul>`, answer: +sec,
        hint: 'Xét từng gợi ý: chữ số nào có thể đúng, đứng ở vị trí nào. Loại dần các khả năng.', steps: clues.map(c => `Đoán ${c.g}: ${say(c.f)[1]}`).concat([`Chỉ có số <b>${sec}</b> thoả mãn tất cả các gợi ý.`]) });
    } }
  ];

  // ---------------- Số học ----------------
  const arith = [
    { level: 1, name: 'Biểu thức có phép chia', fn() {
      const t = () => { const d = R(2, 5), q = R(1, 10); return [d * q, d, q]; };
      const a = t(), b = t(), c = t(); if (a[2] + b[2] < c[2]) return this.fn(); const ans = a[2] + b[2] - c[2];
      const ex = `${a[0]} : ${a[1]} + ${b[0]} : ${b[1]} − ${c[0]} : ${c[1]}`;
      return T({ en: `Find the value of ${ex}.`, vi: `Tính giá trị của ${ex}.`, answer: ans, hint: 'Nhân, chia trước; cộng, trừ sau.', steps: [`= ${a[2]} + ${b[2]} − ${c[2]}`, `= <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Tổng dãy số cách đều', fn() {
      if (R(0, 3) === 0) { const k = R(4, 9); const t = []; for (let i = 1; i <= k; i++) t.push(i); for (let i = k - 1; i >= 1; i--) t.push(i);
        return T({ en: `Find the value of ${t.join(' + ')}.`, vi: `Tính giá trị của ${t.join(' + ')}.`, answer: k * k, hint: 'Ghép các số ở hai bên số lớn nhất thành từng cặp.', steps: [`Ghép (1 + ${k - 1}) + (2 + ${k - 2}) + … mỗi cặp bằng ${k}.`, `Kết quả: ${k} × ${k} = <b>${k * k}</b>.`] }); }
      const a = R(1, 20), d = R(1, 3), n = pick([5, 6, 8, 9, 10]); const t = []; for (let i = 0; i < n; i++) t.push(a + d * i); const s = sum(t);
      const ex = n >= 8 && R(0, 1) ? `${t.slice(0, 3).join(' + ')} + … + ${t.slice(-2).join(' + ')}` : t.join(' + ');
      return T({ en: `Find the value of ${ex}.`, vi: `Tính giá trị của ${ex}.`, answer: s, hint: 'Ghép số đầu với số cuối, số thứ hai với số áp cuối… các cặp có tổng bằng nhau.', steps: [`Dãy có ${n} số: ${t.join(', ')}.`, `Số đầu + số cuối = ${t[0]} + ${t[n - 1]} = ${t[0] + t[n - 1]}.`, n % 2 ? `Có ${(n - 1) / 2} cặp và số giữa ${t[(n - 1) / 2]}: ${(n - 1) / 2} × ${t[0] + t[n - 1]} + ${t[(n - 1) / 2]} = <b>${s}</b>.` : `Có ${n / 2} cặp: ${n / 2} × ${t[0] + t[n - 1]} = <b>${s}</b>.`] });
    } },
    { level: 1, name: 'Tìm số trong phép nhân, chia', fn() {
      const v = R(0, 2), a = R(2, 9), b = R(2, 10);
      if (v === 0) return T({ en: 'What number should be filled in the blank to make the equation correct?', vi: 'Cần điền số nào vào chỗ trống để được phép tính đúng?', show: `<b class="tm-seq">___ : ${a} = ${b}</b>`, answer: a * b, hint: 'Số bị chia = Thương × Số chia.', steps: [`___ = ${b} × ${a} = <b>${a * b}</b>.`] });
      if (v === 1) { const c = R(3, 20);
        return T({ en: 'What number should be filled in the blank to make the equation correct?', vi: 'Cần điền số nào vào chỗ trống để được phép tính đúng?', show: `<b class="tm-seq">___ × ${a} + ${c} = ${a * b + c}</b>`, answer: b, level: 2, hint: 'Tính ngược: bớt phần cộng thêm trước, rồi chia.', steps: [`___ × ${a} = ${a * b + c} − ${c} = ${a * b}.`, `___ = ${a * b} : ${a} = <b>${b}</b>.`] }); }
      const p = R(101, 199); return T({ en: 'What number should be filled in the blank?', vi: 'Số nào điền vào chỗ trống?', show: `<b class="tm-seq">${p} × ___ = ${p * a}</b>`, answer: a, level: 2, hint: 'Thử nhân hàng đơn vị trước để đoán thừa số.', steps: [`${p} × ${a} = ${p * a} → ___ = <b>${a}</b>.`] });
    } },
    { level: 2, name: 'Nghĩ ra một số (tính ngược)', fn() {
      const [a] = X.names(1); const tg = pick([[11, 'the smallest 2-digit odd number', 'số lẻ nhỏ nhất có hai chữ số'], [10, 'the smallest 2-digit even number', 'số chẵn nhỏ nhất có hai chữ số'], [9, 'the largest 1-digit number', 'số lớn nhất có một chữ số'], [99, 'the largest 2-digit number', 'số lớn nhất có hai chữ số'], [98, 'the largest 2-digit even number', 'số chẵn lớn nhất có hai chữ số']]);
      const p = R(10, 50), m = R(10, 50); const x = tg[0] - p + m; if (x < 1) return this.fn();
      return T({ en: `${a} thinks of a number, adds ${p} to it, then subtracts ${m} and gets ${tg[1]}. What is ${a}'s number?`, vi: `${a} nghĩ ra một số. Lấy số đó cộng ${p} rồi trừ đi ${m} thì được ${tg[2]}. Tìm số ${a} đã nghĩ.`, answer: x,
        hint: 'Đi ngược từ kết quả: phép cộng thành phép trừ, phép trừ thành phép cộng.', steps: [`Kết quả cuối: ${tg[0]}.`, `Trước khi trừ ${m}: ${tg[0]} + ${m} = ${tg[0] + m}.`, `Trước khi cộng ${p}: ${tg[0] + m} − ${p} = <b>${x}</b>.`] });
    } },
    { level: 2, name: 'Nhân – đổi chỗ thừa số chung', fn() {
      const k = R(2, 9); let c; do { c = [R(1, 15), R(1, 15), R(1, 15), R(1, 15)]; } while (sum(c) % 10 !== 0);
      const ex = c.map(x => R(0, 1) ? `${x} × ${k}` : `${k} × ${x}`).join(' + '); const ans = k * sum(c);
      return T({ en: `Calculate ${ex}.`, vi: `Tính ${ex}.`, answer: ans, hint: `Mọi tích đều có thừa số ${k}: đưa ${k} ra ngoài.`, steps: [`= ${k} × (${c.join(' + ')})`, `= ${k} × ${sum(c)} = <b>${ans}</b>.`] });
    } }
  ];

  // ---------------- Lý thuyết số ----------------
  const numth = [
    { level: 2, name: 'Cho để hơn / kém k', fn() {
      const [a, b] = X.names(2); const it = pick([['apples', 'quả táo'], ['pencils', 'cái bút chì'], ['marbles', 'viên bi'], ['candies', 'cái kẹo']]);
      const more = R(0, 1), k = R(1, 12); const y = R(5, 40); let d = R(k + 2, k + 40); if ((d + (more ? -k : k)) % 2) d++; const x = y + d; const ans = (d + (more ? -k : k)) / 2; if (ans < 1) return this.fn();
      return T({ en: `${a} has ${x} ${it[0]} and ${b} has ${y} ${it[0]}. How many ${it[0]} does ${a} have to give ${b} so that ${a} has ${k} ${more ? 'more' : 'fewer'} ${it[0]} than ${b}?`, vi: `${a} có ${x} ${it[1]}, ${b} có ${y} ${it[1]}. Hỏi ${a} phải cho ${b} bao nhiêu ${it[1]} để ${a} ${more ? 'nhiều hơn' : 'ít hơn'} ${b} ${k} ${it[1]}?`, answer: ans,
        hint: 'Mỗi khi cho đi 1, khoảng cách giữa hai bạn giảm 2.', steps: [`Lúc đầu ${a} hơn ${b}: ${x} − ${y} = ${d}.`, more ? `Muốn còn hơn ${k}: khoảng cách phải giảm ${d} − ${k} = ${d - k}.` : `Muốn kém ${k}: khoảng cách phải giảm ${d} + ${k} = ${d + k}.`, `Số cần cho: ${more ? d - k : d + k} : 2 = <b>${ans}</b>.`] });
    } },
    { level: 2, name: 'Đếm số theo điều kiện chữ số', fn() {
      const v = R(0, 3), k = R(2, 6);
      if (v === 0) return T({ en: `How many 2-digit numbers have the tens digit smaller than ${k}?`, vi: `Có bao nhiêu số có hai chữ số mà chữ số hàng chục nhỏ hơn ${k}?`, answer: (k - 1) * 10, hint: 'Chữ số hàng chục khác 0.', steps: [`Hàng chục: 1 → ${k - 1} (${k - 1} cách); hàng đơn vị: 0 → 9 (10 cách).`, `${k - 1} × 10 = <b>${(k - 1) * 10}</b> số.`] });
      if (v === 1) return T({ en: `How many 2-digit numbers have the unit digit smaller than ${k}?`, vi: `Có bao nhiêu số có hai chữ số mà chữ số hàng đơn vị nhỏ hơn ${k}?`, answer: 9 * k, hint: 'Hàng chục có 9 cách chọn (1 → 9).', steps: [`Hàng chục: 9 cách; hàng đơn vị: 0 → ${k - 1} (${k} cách).`, `9 × ${k} = <b>${9 * k}</b> số.`] });
      if (v === 2) return T({ en: `How many 3-digit numbers have the unit digit smaller than ${k}?`, vi: `Có bao nhiêu số có ba chữ số mà chữ số hàng đơn vị nhỏ hơn ${k}?`, answer: 90 * k, level: 3, hint: 'Hàng trăm 9 cách, hàng chục 10 cách.', steps: [`9 × 10 × ${k} = <b>${90 * k}</b> số.`] });
      const a = R(2, 9), b = R(20, 99);
      return T({ en: `From ${a} to ${b}, how many 2-digit numbers are there?`, vi: `Trong các số từ ${a} đến ${b}, có bao nhiêu số có hai chữ số?`, answer: b - 9, level: 1, hint: 'Số có hai chữ số nhỏ nhất là 10.', steps: [`Các số từ 10 đến ${b}: ${b} − 10 + 1 = <b>${b - 9}</b> số.`] });
    } },
    { level: 2, name: 'Điền dấu + và − cho đúng', fn() {
      const n = R(4, 5); const nums = []; while (nums.length < n) nums.push(R(1, 15));
      const vecs = []; for (let m = 0; m < 1 << (n - 1); m++) vecs.push([...Array(n - 1)].map((_, i) => (m >> i) & 1 ? '+' : '−'));
      const val = (s) => nums.slice(1).reduce((t, x, i) => s[i] === '+' ? t + x : t - x, nums[0]);
      const good = pick(vecs); const tg = val(good); if (tg < 0 || vecs.filter(s => val(s) === tg).length !== 1) return this.fn();
      const bad = shuffle(vecs.filter(s => val(s) !== tg)).slice(0, 3); const txt = (s) => nums.map((x, i) => (i ? ` ${s[i - 1]} ` : '') + x).join('') + ` = ${tg}`;
      const opts = shuffle([good].concat(bad)).map(txt);
      return T({ en: `Fill the lines with "+" and "−" to make the equation below correct. Which one is correct?`, vi: 'Điền dấu "+" hoặc "−" vào chỗ trống để được phép tính đúng. Phép tính nào đúng?', show: `<b class="tm-seq">${nums.join(' ___ ')} = ${tg}</b>`, choices: opts, ans: opts.indexOf(txt(good)),
        hint: 'Thử từng phương án, tính lần lượt từ trái sang phải.', steps: [`${txt(good).replace(/=.*/, '')} = ${tg} ✔`, `Đáp án: <b>${txt(good)}</b>.`] });
    } },
    { level: 2, name: 'Xếp vào trang / xe (làm tròn lên)', fn() {
      const [a, b] = X.names(2), x = R(8, 30), y = R(5, 25), k = R(4, 10); const tot = x + y, ans = Math.ceil(tot / k); if (tot % k === 0) return this.fn();
      return T({ en: `${a} collected ${x} stamps and ${b} collected ${y} stamps. One page of the album can hold no more than ${k} stamps. At least how many pages are needed to hold all their stamps?`, vi: `${a} sưu tầm được ${x} con tem, ${b} sưu tầm được ${y} con tem. Mỗi trang album chứa không quá ${k} con tem. Hỏi cần ít nhất bao nhiêu trang để chứa hết tem của hai bạn?`, answer: ans, unit: 'trang',
        hint: 'Trang cuối chưa đầy vẫn phải dùng thêm một trang.', steps: [`Tổng số tem: ${x} + ${y} = ${tot}.`, `${tot} = ${k} × ${Math.floor(tot / k)} + ${tot % k} → ${Math.floor(tot / k)} trang đầy, còn ${tot % k} tem cần thêm 1 trang.`, `Cần <b>${ans}</b> trang.`] });
    } },
    { level: 3, name: 'Chẵn lẻ – suy luận phần còn lại', fn() {
      const N = R(6, 16), o = R(1, N - 4), e = R(1, N - o - 2); const totOdd = R(0, 1); const rest = N - o - e;
      const remOdd = (totOdd + o) % 2 === 1;
      return T({ en: `${N} children have ${totOdd ? 'an odd' : 'an even'} number of stickers in total. ${o} children have an odd number of stickers each and ${e} children have an even number of stickers each. Is the total number of stickers of the remaining ${rest} children odd or even?`, vi: `${N} bạn có tổng số nhãn dán là số ${totOdd ? 'lẻ' : 'chẵn'}. ${o} bạn mỗi bạn có số nhãn dán lẻ, ${e} bạn mỗi bạn có số nhãn dán chẵn. Tổng số nhãn dán của ${rest} bạn còn lại là số lẻ hay chẵn?`, choices: PAR4, ans: remOdd ? 0 : 1,
        hint: 'Tổng của một số lẻ các số lẻ là số lẻ; số chẵn không làm đổi chẵn/lẻ của tổng.', steps: [`${o} số lẻ cộng lại được số ${o % 2 ? 'lẻ' : 'chẵn'}; các số chẵn không ảnh hưởng.`, `Tổng tất cả là số ${totOdd ? 'lẻ' : 'chẵn'} → phần còn lại là <b>số ${remOdd ? 'lẻ' : 'chẵn'}</b>.`] });
    } },
    { level: 3, name: 'Chia hết cho hai số · bội số', fn() {
      const v = R(0, 2); const [a, b] = pick([[4, 6], [3, 5], [2, 7], [3, 4], [4, 5], [2, 9], [6, 8], [7, 4], [3, 8], [5, 6]]); const L = a * b / gcd(a, b);
      if (v === 0) { const ans = Math.floor(99 / L) * L;
        return T({ en: `What is the largest 2-digit number that is divisible by ${a} and ${b}?`, vi: `Số lớn nhất có hai chữ số chia hết cho cả ${a} và ${b} là số nào?`, answer: ans, hint: `Số chia hết cho cả ${a} và ${b} là bội của ${L}.`, steps: [`Các số chia hết cho cả ${a} và ${b}: ${L}, ${2 * L}, ${3 * L}, …`, `Lớn nhất có hai chữ số: <b>${ans}</b>.`] }); }
      if (v === 1) { const ans = Math.ceil(100 / L) * L;
        return T({ en: `What is the smallest 3-digit number that is divisible by ${a} and ${b}?`, vi: `Số nhỏ nhất có ba chữ số chia hết cho cả ${a} và ${b} là số nào?`, answer: ans, hint: `Tìm bội của ${L} lớn hơn hoặc bằng 100.`, steps: [`Số chia hết cho cả ${a} và ${b} là bội của ${L}.`, `Bội nhỏ nhất có ba chữ số: <b>${ans}</b>.`] }); }
      const m = pick([3, 4, 5, 6]), odd = R(0, 1); let n = 0; for (let x = 10; x < 100; x++) if (x % m === 0 && x % 2 === (odd ? 1 : 0)) n++; if (!n) return this.fn();
      return T({ en: `How many 2-digit ${odd ? 'odd' : 'even'} numbers are multiples of ${m}?`, vi: `Có bao nhiêu số ${odd ? 'lẻ' : 'chẵn'} có hai chữ số là bội của ${m}?`, answer: n, hint: `Liệt kê các bội của ${m} có hai chữ số rồi chọn số ${odd ? 'lẻ' : 'chẵn'}.`, steps: [`Các số: ${[...Array(90)].map((_, i) => i + 10).filter(x => x % m === 0 && x % 2 === (odd ? 1 : 0)).join(', ')}.`, `Có <b>${n}</b> số.`] });
    } },
    { level: 3, name: 'Chia thành các phần khác nhau', fn() {
      const [a] = X.names(1), k = R(3, 4), n = R(k * (k + 1) / 2 + 3, 30); let m = k; while (k * m - k * (k - 1) / 2 < n) m++;
      return T({ en: `${a} has ${n} marbles and divides them into ${k} piles so that each pile has a different number of marbles. What is the smallest possible number of marbles in the biggest pile?`, vi: `${a} có ${n} viên bi, chia thành ${k} đống sao cho các đống có số bi khác nhau. Hỏi đống nhiều bi nhất có ít nhất bao nhiêu viên?`, answer: m,
        hint: 'Muốn đống lớn nhất nhỏ nhất thì các đống phải gần bằng nhau: m, m − 1, m − 2, …', steps: [`Nếu đống lớn nhất có ${m - 1} viên thì tối đa: ${[...Array(k)].map((_, i) => m - 1 - i).join(' + ')} = ${k * (m - 1) - k * (k - 1) / 2} < ${n}.`, `Với ${m} viên: tối đa ${[...Array(k)].map((_, i) => m - i).join(' + ')} = ${k * m - k * (k - 1) / 2} ≥ ${n} ✔.`, `Đáp số: <b>${m}</b>.`] });
    } },
    { level: 2, name: 'Bốc chắc chắn (nguyên lí Dirichlet)', fn() {
      const [a] = X.names(1); const cols = shuffle([['red', 'đỏ'], ['blue', 'xanh'], ['yellow', 'vàng'], ['green', 'lục'], ['white', 'trắng']]).slice(0, R(2, 4)); const cnt = cols.map(() => R(3, 9));
      const v = R(0, 1); const desc = (lang) => cols.map((c, i) => `${cnt[i]} ${c[lang]}`).join(', ');
      if (v === 0) { const ans = cols.length + 1;
        return T({ en: `A bag has ${desc(0)} marbles. Without looking, at least how many marbles must ${a} take out to be sure of getting 2 marbles of the same colour?`, vi: `Một túi có ${desc(1)} viên bi. Không nhìn, ${a} phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có 2 viên cùng màu?`, answer: ans,
          hint: 'Trường hợp xui nhất: mỗi màu lấy được 1 viên.', steps: [`Xui nhất: lấy ${cols.length} viên, mỗi màu 1 viên.`, `Lấy thêm 1 viên chắc chắn trùng màu: ${cols.length} + 1 = <b>${ans}</b>.`] }); }
      const i = R(0, cols.length - 1); const others = sum(cnt) - cnt[i]; const ans = others + 1;
      return T({ en: `A bag has ${desc(0)} marbles. Without looking, at least how many marbles must ${a} take out to be sure of getting 1 ${cols[i][0]} marble?`, vi: `Một túi có ${desc(1)} viên bi. Không nhìn, ${a} phải lấy ra ít nhất bao nhiêu viên để chắc chắn có 1 viên màu ${cols[i][1]}?`, answer: ans, level: 3,
        hint: 'Trường hợp xui nhất: lấy hết các viên không phải màu cần tìm.', steps: [`Xui nhất: lấy hết ${others} viên màu khác.`, `Lấy thêm 1 viên: ${others} + 1 = <b>${ans}</b>.`] });
    } },
    { level: 1, name: 'Số lớn nhất / nhỏ nhất trong các số nhiều chữ số', fn() {
      const big = R(0, 1); const base = R(1000, 9999); const L = []; while (L.length < 4) { const x = R(0, 2) ? base * 10000 + R(0, 9999) : base * 1000 + R(0, 999); if (!L.includes(x)) L.push(x); }
      const ans = big ? Math.max(...L) : Math.min(...L); const sh = shuffle(L);
      return T({ en: `Which number below is the ${big ? 'greatest' : 'smallest'}?`, vi: `Số nào dưới đây ${big ? 'lớn' : 'nhỏ'} nhất?`, choices: sh.map(String), ans: sh.indexOf(ans),
        hint: 'So sánh số chữ số trước; cùng số chữ số thì so sánh từ trái sang phải.', steps: [`Đáp án: <b>${ans}</b>.`] });
    } }
  ];

  // ---------------- Hình học ----------------
  const geo = [
    { level: 1, name: 'Kiến thức về hình (cạnh, đỉnh, góc)', fn() {
      const k = R(2, 4); const G = MA.Vis.G; const CIRC = { type: 'geo', P: { O: [0, 0] }, circles: [{ c: 'O', r: 1 }], show: [], maxW: 110, maxH: 110 }; const CUBE = { type: 'cuboid', cube: true };
      const F = pick([
        ['How many sides does a circle have?', 'Hình tròn có bao nhiêu cạnh?', 0, CIRC], ['How many sides does a rectangle have?', 'Hình chữ nhật có bao nhiêu cạnh?', 4, G.rect(1.8, 1, { marks: false })], ['How many sides does a triangle have?', 'Hình tam giác có bao nhiêu cạnh?', 3, { type: 'shape', kind: 'tri' }],
        [`How many vertices do ${k} separate triangles have in total?`, `${k} hình tam giác rời nhau có tất cả bao nhiêu đỉnh?`, 3 * k, { type: 'shapes', items: Array(k).fill(0).map(() => ({ k: 'tri' })), size: 54, gap: 18 }], [`How many vertices do ${k} separate squares have in total?`, `${k} hình vuông rời nhau có tất cả bao nhiêu đỉnh?`, 4 * k, { type: 'shapes', items: Array(k).fill(0).map(() => ({ k: 'square' })), size: 54, gap: 18 }],
        ['How many edges does a cube have?', 'Hình lập phương có bao nhiêu cạnh?', 12, CUBE], ['How many faces does a cube have?', 'Hình lập phương có bao nhiêu mặt?', 6, CUBE], ['How many vertices does a cube have?', 'Hình lập phương có bao nhiêu đỉnh?', 8, CUBE],
        ['At most how many right angles can a triangle contain?', 'Một hình tam giác có nhiều nhất bao nhiêu góc vuông?', 1, null], ['At most how many obtuse angles can a triangle contain?', 'Một hình tam giác có nhiều nhất bao nhiêu góc tù?', 1, null], ['How many right angles does a rectangle have?', 'Hình chữ nhật có bao nhiêu góc vuông?', 4, G.rect(1.8, 1, { marks: false })]]);
      return T({ en: F[0], vi: F[1], answer: F[2], visual: F[3], hint: F[3] ? 'Quan sát hình rồi đếm (với hình lập phương, đếm cả các cạnh khuất vẽ nét đứt).' : 'Hãy vẽ hình ra nháp rồi đếm.', steps: [`Đáp số: <b>${F[2]}</b>.`] });
    } },
    { level: 3, name: 'Hình lăng trụ – mặt, cạnh, đỉnh', fn() {
      const n = R(3, 12); const P = { faces: n + 2, edges: 3 * n, vertices: 2 * n }; const ks = shuffle(Object.keys(P)); const g = ks[0], ask = ks[1];
      const vi = { faces: 'mặt', edges: 'cạnh', vertices: 'đỉnh' };
      return T({ en: `A prism has ${P[g]} ${g}. How many ${ask} does it have?`, vi: `Một hình lăng trụ có ${P[g]} ${vi[g]}. Hỏi hình đó có bao nhiêu ${vi[ask]}?`, answer: P[ask],
        hint: 'Lăng trụ có đáy là hình n cạnh: số mặt = n + 2, số cạnh = 3 × n, số đỉnh = 2 × n.', steps: [`Từ ${P[g]} ${vi[g]} → đáy là hình có n = ${n} cạnh.`, `Số ${vi[ask]}: <b>${P[ask]}</b>.`] });
    } },
    { level: 2, name: 'Số đường thẳng qua n điểm', fn() {
      const n = R(3, 9); const ans = C2(n);
      return T({ en: `At most how many lines can be formed by using ${n} points on a plane?`, vi: `Có nhiều nhất bao nhiêu đường thẳng được tạo bởi ${n} điểm trên một mặt phẳng?`, answer: ans, visual: Object.assign(MA.Vis.G.scatter(n), { show: [], dots: 'ABCDEGHIKLMNPQ'.slice(0, n).split(''), caption: `${n} điểm, không có 3 điểm nào thẳng hàng` }),
        hint: 'Nhiều nhất khi không có 3 điểm nào thẳng hàng: mỗi cặp điểm cho một đường thẳng.', steps: [`Điểm thứ nhất nối với ${n - 1} điểm, điểm thứ hai nối thêm ${n - 2} điểm, …`, `${[...Array(n - 1)].map((_, i) => n - 1 - i).join(' + ')} = <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Cắt hình tròn bằng các đường thẳng', fn() {
      const n = R(1, 5); const ans = 1 + n * (n + 1) / 2;
      return T({ en: `At most how many pieces can be formed by using ${X.pl(n, 'straight line')} to cut a circle?`, vi: `Dùng ${n} đường thẳng cắt một hình tròn thì được nhiều nhất bao nhiêu mảnh?`, answer: ans,
        hint: 'Đường thẳng thứ k cắt tất cả các đường trước đó thì tạo thêm k mảnh.', steps: [`1 + 1 + 2 + … + ${n} = <b>${ans}</b> mảnh.`] });
    } }
  ];

  // ---------------- Tổ hợp ----------------
  const comb = [
    { level: 1, name: 'Quy tắc nhân (thực đơn, đường đi, quần áo)', fn() {
      const v = R(0, 2);
      if (v === 0) { const a = R(2, 4), b = R(2, 5), c = R(2, 4);
        return T({ en: `A restaurant has ${a} types of appetizers, ${b} types of main courses and ${c} types of desserts. How many ways can a customer order one appetizer, one main course and one dessert?`, vi: `Một nhà hàng có ${a} món khai vị, ${b} món chính và ${c} món tráng miệng. Có bao nhiêu cách gọi 1 món khai vị, 1 món chính và 1 món tráng miệng?`, answer: a * b * c, unit: 'cách',
          hint: 'Mỗi cách chọn món khai vị đi được với mọi cách chọn món chính và món tráng miệng.', steps: [`${a} × ${b} × ${c} = <b>${a * b * c}</b> cách.`] }); }
      if (v === 1) { const a = R(2, 5), b = R(2, 5), three = R(0, 1), c = R(2, 4); const ans = a * b * (three ? c : 1);
        return T({ en: `There are ${a} ways from the school to the train station and ${b} ways from the train station to ${three ? `the cinema, and ${c} ways from the cinema to ` : ''}the library. How many different ways are there from the school to the library through ${three ? 'the train station and the cinema' : 'the train station'}?`, vi: `Có ${a} đường từ trường đến ga tàu và ${b} đường từ ga tàu đến ${three ? `rạp chiếu phim, ${c} đường từ rạp chiếu phim đến ` : ''}thư viện. Có bao nhiêu cách đi từ trường đến thư viện qua ${three ? 'ga tàu và rạp chiếu phim' : 'ga tàu'}?`, answer: ans, unit: 'cách',
          hint: 'Nhân số cách đi của từng chặng.', steps: [`${a} × ${b}${three ? ' × ' + c : ''} = <b>${ans}</b> cách.`] }); }
      const g = pick(GIRLS), a = R(2, 5), b = R(2, 5);
      return T({ en: `${g} has ${a} different T-shirts and ${b} different pants. Each day she wears one T-shirt with one pair of pants. At most how many different sets of clothes can she make?`, vi: `${g} có ${a} áo phông khác nhau và ${b} quần khác nhau. Mỗi ngày bạn ấy mặc 1 áo với 1 quần. Có thể phối được nhiều nhất bao nhiêu bộ khác nhau?`, answer: a * b, unit: 'bộ',
        hint: 'Mỗi áo đi được với mọi quần.', steps: [`${a} × ${b} = <b>${a * b}</b> bộ.`] });
    } },
    { level: 2, name: 'Chọn 2 trong n · xếp giải nhất nhì ba', fn() {
      const v = R(0, 2);
      if (v === 0) { const n = R(4, 12); return T({ en: `Pick 2 from ${n} children to take part in a mathematics competition. How many different ways are there?`, vi: `Chọn 2 trong ${n} bạn để tham gia cuộc thi toán. Có bao nhiêu cách chọn khác nhau?`, answer: C2(n), unit: 'cách',
        hint: 'Giống bài bắt tay: mỗi cặp chỉ tính một lần.', steps: [`${[...Array(n - 1)].map((_, i) => n - 1 - i).join(' + ')} = <b>${C2(n)}</b> cách.`] }); }
      if (v === 1) { const n = R(4, 7); const ans = n * (n - 1) * (n - 2);
        return T({ en: `Pick 3 from ${n} competitors to get the gold, silver and bronze awards. How many different results are there?`, vi: `Chọn 3 trong ${n} vận động viên để trao huy chương vàng, bạc, đồng. Có bao nhiêu kết quả khác nhau?`, answer: ans, level: 3,
          hint: 'Vàng có n cách, bạc còn n − 1 cách, đồng còn n − 2 cách.', steps: [`${n} × ${n - 1} × ${n - 2} = <b>${ans}</b>.`] }); }
      const n = R(4, 6); return T({ en: `There are ${n} different flavours of ice-cream. Mixing 3 different flavours makes a 3-ball ice-cream (the order does not matter). How many different 3-ball ice-creams can be made?`, vi: `Có ${n} vị kem khác nhau. Kết hợp 3 vị khác nhau thành một cốc kem 3 viên (không tính thứ tự). Có bao nhiêu loại kem 3 viên khác nhau?`, answer: C3(n), level: 3,
        hint: 'Chọn 3 vị = bỏ đi các vị không chọn. Liệt kê có thứ tự để không trùng.', steps: [`Số cách chọn 3 trong ${n}: <b>${C3(n)}</b>.`] });
    } },
    { level: 1, name: 'Khuyến mại – tặng kèm', fn() {
      const [a] = X.names(1), k = R(2, 5), g = R(1, 3), n = R(k + 1, 30); const ans = Math.floor(n / k) * g;
      return T({ en: `For every ${k} pens bought, the store gives ${X.pl(g, 'eraser')} for free. If ${a} buys ${n} pens, how many erasers can ${a} get?`, vi: `Cứ mua ${k} cái bút thì cửa hàng tặng ${g} cục tẩy. Nếu ${a} mua ${n} cái bút thì được tặng bao nhiêu cục tẩy?`, answer: ans,
        hint: 'Đếm xem có bao nhiêu nhóm đủ ' + k + ' bút.', steps: [`${n} = ${k} × ${Math.floor(n / k)} + ${n % k} → ${Math.floor(n / k)} nhóm đủ.`, `Số tẩy: ${Math.floor(n / k)} × ${g} = <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Đếm số có chứa chữ số cho trước', fn() {
      const d = R(0, 9), N = R(30, 150); let n = 0; const L = []; for (let x = 1; x <= N; x++) if (String(x).includes(String(d))) { n++; L.push(x); }
      if (!n) return this.fn();
      return T({ en: `How many numbers from 1 to ${N} contain the digit "${d}"?`, vi: `Từ 1 đến ${N} có bao nhiêu số có chứa chữ số ${d}?`, answer: n,
        hint: 'Đếm theo hàng đơn vị, rồi theo hàng chục, cẩn thận các số bị đếm hai lần.', steps: [`Các số: ${L.join(', ')}.`, `Có <b>${n}</b> số.`] });
    } },
    { level: 3, name: 'Số chẵn / lẻ trong N số đầu của dãy', fn() {
      const odd = R(0, 1), N = R(12, 30);
      let t; if (R(0, 1)) { const a = R(1, 9), d = pick([3, 5, 7]); t = [...Array(N)].map((_, i) => a + d * i); }
      else { t = [1, 1]; while (t.length < N) t.push(t[t.length - 1] + t[t.length - 2]); }
      const n = t.filter(x => x % 2 === (odd ? 1 : 0)).length;
      return T({ en: `How many ${odd ? 'odd' : 'even'} numbers are there in the first ${N} numbers of the sequence below?`, vi: `Có bao nhiêu số ${odd ? 'lẻ' : 'chẵn'} trong ${N} số đầu tiên của dãy dưới đây?`, show: SEQ(t.slice(0, 6), ', …'), answer: n,
        hint: 'Không cần tính hết các số: chỉ cần tìm quy luật chẵn – lẻ lặp lại.', steps: [`Quy luật chẵn/lẻ: ${t.slice(0, 6).map(x => x % 2 ? 'L' : 'C').join(', ')}, … lặp lại.`, `Trong ${N} số đầu có <b>${n}</b> số ${odd ? 'lẻ' : 'chẵn'}.`] });
    } },
    { level: 3, name: 'Chia đồ vật giống nhau vào các hộp', fn() {
      const n = R(4, 10); const ans = C2(n - 1);
      return T({ en: `In how many ways can we put ${n} identical flowers into 3 different vases so that no vase is empty?`, vi: `Có bao nhiêu cách cắm ${n} bông hoa giống nhau vào 3 lọ hoa khác nhau sao cho lọ nào cũng có hoa?`, answer: ans, unit: 'cách',
        hint: 'Liệt kê theo số hoa ở lọ thứ nhất: 1, 2, 3, …', steps: [...Array(n - 2)].map((_, i) => `Lọ 1 có ${i + 1} bông: ${n - i - 2} cách chia cho 2 lọ còn lại.`).concat([`Tổng: ${[...Array(n - 2)].map((_, i) => n - i - 2).join(' + ')} = <b>${ans}</b> cách.`]) });
    } },
    { level: 3, name: 'Số giá trị trả được không cần thối', fn() {
      const [a] = X.names(1), c = [R(1, 5), R(1, 4), R(1, 3)]; const S = new Set();
      for (let x = 0; x <= c[0]; x++) for (let y = 0; y <= c[1]; y++) for (let z = 0; z <= c[2]; z++) if (x + y + z) S.add(x + 2 * y + 5 * z);
      return T({ en: `${a} has ${X.pl(c[0], '$1 coin')}, ${X.pl(c[1], '$2 coin')} and ${X.pl(c[2], '$5 coin')}. How many different prices can ${a} pay exactly without any change?`, vi: `${a} có ${c[0]} đồng 1 đô, ${c[1]} đồng 2 đô và ${c[2]} đồng 5 đô. Hỏi ${a} trả đúng được bao nhiêu mức giá khác nhau mà không cần tiền thối lại?`, answer: S.size,
        hint: 'Tổng số tiền là bao nhiêu? Mức giá nào từ 1 đến tổng đó không trả đúng được?', steps: [`Tổng tiền: ${c[0] + 2 * c[1] + 5 * c[2]} đô.`, `Các mức trả được: ${[...S].sort((p, q) => p - q).join(', ')}.`, `Có <b>${S.size}</b> mức giá.`] });
    } },
    { level: 2, name: 'Lập số chia hết · số chẵn có lặp chữ số', fn() {
      if (R(0, 1)) { const ds = shuffle([0, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)]); const big = R(0, 1);
        const rest = ds.filter(x => x).sort((p, q) => big ? q - p : p - q); const ans = +(rest.join('') + '0');
        return T({ en: `What is the ${big ? 'greatest' : 'smallest'} 4-digit number formed by using ${ds.join(', ')} that is divisible by 10? (Each digit can only be used once.)`, vi: `Số ${big ? 'lớn' : 'nhỏ'} nhất có 4 chữ số lập từ ${ds.join(', ')} và chia hết cho 10 là số nào? (Mỗi chữ số dùng một lần.)`, answer: ans,
          hint: 'Số chia hết cho 10 có chữ số tận cùng là 0.', steps: [`Hàng đơn vị là 0; các chữ số còn lại xếp ${big ? 'giảm' : 'tăng'} dần: <b>${ans}</b>.`] }); }
      const ds = [0, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, R(3, 4))].sort((p, q) => p - q); const nz = ds.filter(x => x).length, ev = ds.filter(x => x % 2 === 0).length; const ans = nz * ds.length * ev;
      return T({ en: `Choose 3 digits (repetition is allowed) from ${ds.join(', ')} to form 3-digit even numbers. How many different numbers can be formed?`, vi: `Chọn 3 chữ số (được lặp lại) từ ${ds.join(', ')} để lập các số chẵn có 3 chữ số. Lập được bao nhiêu số khác nhau?`, answer: ans, level: 3,
        hint: 'Hàng trăm khác 0; hàng đơn vị là chữ số chẵn.', steps: [`Hàng trăm: ${nz} cách; hàng chục: ${ds.length} cách; hàng đơn vị (chẵn): ${ev} cách.`, `${nz} × ${ds.length} × ${ev} = <b>${ans}</b>.`] });
    } },
    { level: 3, name: 'Số có ba chữ số – so sánh các chữ số', fn() {
      const rel = pick([['larger than', 'lớn hơn', (u, h) => u > h], ['smaller than', 'nhỏ hơn', (u, h) => u < h], ['equal to', 'bằng', (u, h) => u === h]]);
      const P = [['unit', 'hàng đơn vị', 0], ['tens', 'hàng chục', 1], ['hundreds', 'hàng trăm', 2]]; const [p1, p2] = shuffle(P).slice(0, 2); const free = P.find(p => p !== p1 && p !== p2);
      const dg = (x, k) => Math.floor(x / Math.pow(10, k)) % 10; let n = 0; for (let x = 100; x < 1000; x++) if (rel[2](dg(x, p1[2]), dg(x, p2[2]))) n++;
      const fc = free[2] === 2 ? 9 : 10;
      return T({ en: `How many 3-digit numbers have the ${p1[0]} digit ${rel[0]} the ${p2[0]} digit?`, vi: `Có bao nhiêu số có 3 chữ số mà chữ số ${p1[1]} ${rel[1]} chữ số ${p2[1]}?`, answer: n,
        hint: `Đếm các cặp (chữ số ${p1[1]}, chữ số ${p2[1]}) thoả mãn (nhớ hàng trăm khác 0), rồi nhân với số cách chọn chữ số ${free[1]}.`, steps: [`Số cặp thoả mãn: ${n / fc}.`, `Chữ số ${free[1]}: ${fc} cách → ${n / fc} × ${fc} = <b>${n}</b>.`] });
    } },
    { level: 1, name: 'Đếm kết quả là số có hai chữ số', fn() {
      const k = R(7, 9); const ex = []; let n = 0;
      for (let i = 0; i < k; i++) { const plus = R(0, 1); const a = R(2, 19), b = plus ? R(1, 15) : R(1, a); const v = plus ? a + b : a - b; ex.push(`${a} ${plus ? '+' : '−'} ${b}`); if (v >= 10 && v <= 99) n++; }
      return T({ en: 'According to the results of the following calculations, how many of them are 2-digit numbers?', vi: 'Trong các phép tính dưới đây, có bao nhiêu phép tính có kết quả là số có hai chữ số?', show: `<b class="tm-seq">${ex.join(' , ')}</b>`, answer: n,
        hint: 'Tính từng phép tính rồi đếm kết quả từ 10 đến 99.', steps: [ex.map(e => { const [a, op, b] = e.split(' '); return `${e} = ${op === '+' ? +a + +b : a - b}`; }).join('; ') + '.', `Có <b>${n}</b> kết quả là số có hai chữ số.`] });
    } }
  ];

  MA.Data.extend('tm2_logic', logic);
  MA.Data.extend('tm2_arith', arith);
  MA.Data.extend('tm2_numth', numth);
  MA.Data.extend('tm2_geo', geo);
  MA.Data.extend('tm2_comb', comb);
})(window.MA);
