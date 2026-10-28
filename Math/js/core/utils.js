/* =========================================================
 * utils.js — Hàm tiện ích dùng chung (số ngẫu nhiên, định dạng, đáp án)
 * Mọi module khác đều dựa vào window.MA (Math App namespace)
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';

  // ---------- Bộ sinh số ngẫu nhiên (có thể gieo hạt cho "Thử thách hằng ngày") ----------
  let _rng = Math.random;
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function withSeed(seed, fn) {
    const old = _rng; _rng = seeded(seed);
    try { return fn(); } finally { _rng = old; }
  }
  const rnd = () => _rng();
  const R = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;          // số nguyên trong [a,b]
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, n); }

  // ---------- Số học ----------
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  function factorize(n) { const f = []; let d = 2; while (n > 1) { while (n % d === 0) { f.push(d); n /= d; } d++; } return f; }
  function factorStr(n) {
    const f = factorize(n), m = {};
    f.forEach(p => m[p] = (m[p] || 0) + 1);
    return Object.keys(m).map(p => m[p] > 1 ? `${p}<sup>${m[p]}</sup>` : p).join(' · ');
  }
  function divisors(n) { const d = []; for (let i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
  const round = (x, d = 2) => Math.round(x * Math.pow(10, d)) / Math.pow(10, d);

  // ---------- Định dạng kiểu Việt Nam ----------
  // 12345.6 -> "12 345,6" ; số thập phân dùng dấu phẩy
  function fmt(n) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    const neg = n < 0; n = Math.abs(n);
    let [i, d] = String(round(n, 6)).split('.');
    i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '−' : '') + i + (d ? ',' + d : '');
  }
  function fmtInt(n) { return n < 0 ? '(' + fmt(n) + ')' : fmt(n); } // số âm trong ngoặc khi nằm giữa biểu thức
  function frac(a, b) { // HTML phân số dọc
    return `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  }
  function simplify(a, b) { const g = gcd(a, b) || 1; let s = b < 0 ? -1 : 1; return [s * a / g, s * b / g]; }
  function fracStr(a, b) { const [x, y] = simplify(a, b); return y === 1 ? String(x) : `${x}/${y}`; }
  function fracHtml(a, b) { const [x, y] = simplify(a, b); return y === 1 ? String(x) : (x < 0 ? '−' + frac(-x, y) : frac(x, y)); }

  // ---------- Đáp án ----------
  // Chuẩn hoá chuỗi đáp án người dùng nhập để so sánh
  function norm(s) {
    return String(s).trim().toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, '');
  }
  function parseNum(s) {
    s = norm(s);
    // dấu chấm ngăn cách hàng nghìn kiểu VN: 1.250 hoặc 12.345,5 (nhưng 0.125 vẫn là số thập phân)
    if (/^-?[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '');
    if (/^-?\d+\/-?\d+$/.test(s)) { const [a, b] = s.split('/').map(Number); return b ? a / b : NaN; }
    s = s.replace(',', '.');
    if (/^-?\d*\.?\d+$/.test(s)) return Number(s);
    return NaN;
  }
  // So sánh đáp án: hỗ trợ số, số thập phân phẩy/chấm, phân số (yêu cầu tối giản nếu q.simplest)
  function checkAnswer(q, input) {
    if (q.type === 'mc') return Number(input) === q.correct;
    const raw = [q.answer].concat(q.accept || []); const accept = raw.map(String);
    const ni = norm(input);
    if (!ni) return false;
    if (accept.some(a => norm(a) === ni)) return true;
    if (q.textOnly) return false;
    const v = parseNum(input);
    const v2 = Number(ni.replace(',', '.')); // cách hiểu thứ hai: dấu chấm là dấu thập phân
    if (isNaN(v) && isNaN(v2)) return false;
    if (q.simplest && ni.includes('/')) {
      const [a, b] = ni.split('/').map(Number);
      if (gcd(a, b) !== 1) return false;
    }
    // đáp án lưu dạng SỐ thì so sánh trực tiếp (tránh hiểu nhầm 6.509 là “sáu nghìn năm trăm linh chín”)
    return raw.some(a => { const av = typeof a === 'number' ? a : parseNum(String(a)); return !isNaN(av) && (Math.abs(av - v) < 1e-9 || Math.abs(av - v2) < 1e-9); });
  }

  // Tạo câu trắc nghiệm từ đáp án đúng + các phương án nhiễu (loại trùng, tự bổ sung nếu thiếu)
  function mcOptions(correct, wrongs, opts = {}) {
    const n = opts.n || 4;
    const key = (x) => typeof x === 'number' ? String(round(x, 6)) : String(x);
    if (typeof correct === 'number') correct = round(correct, 6);
    wrongs = wrongs.map(w => typeof w === 'number' ? round(w, 6) : w);
    const seen = new Set([key(correct)]);
    const list = [];
    wrongs.forEach(w => { if (w === undefined || w === null) return; if (typeof w === 'number' && (!isFinite(w) || (opts.positive !== false && w < 0))) return; if (!seen.has(key(w))) { seen.add(key(w)); list.push(w); } });
    let guard = 0;
    while (list.length < n - 1 && typeof correct === 'number' && guard++ < 50) {
      const step = opts.step || (!Number.isInteger(correct) ? 0.1 : Math.abs(correct) >= 100 ? Math.pow(10, Math.floor(Math.log10(Math.abs(correct))) - 1) : 1);
      const w = round(correct + (R(0, 1) ? 1 : -1) * step * R(1, 3), 6);
      if ((opts.positive === false || w >= 0) && !seen.has(key(w))) { seen.add(key(w)); list.push(w); }
    }
    const options = shuffle([correct].concat(list.slice(0, n - 1)));
    return { options, correct: options.findIndex(o => key(o) === key(correct)) };
  }

  // Tạo một câu hỏi chuẩn hoá. Mỗi generator trả về object qua hàm này.
  // fields: text, answer, wrongs (=> trắc nghiệm), hint, steps, visual, unit, level ...
  function Q(fields) {
    const q = Object.assign({ type: 'num', steps: [], hint: '' }, fields);
    if (fields.wrongs || fields.options) {
      q.type = 'mc';
      if (fields.options) { // tự cung cấp sẵn options + đáp án
        const uniq = fields.options.filter((o, i, a) => a.map(String).indexOf(String(o)) === i);
        if (!uniq.map(String).includes(String(fields.answer))) uniq.unshift(fields.answer);
        const opts = fields.shuffle === false ? uniq : shuffle(uniq);
        q.options = opts; q.correct = opts.findIndex(o => String(o) === String(fields.answer));
      } else {
        const r = mcOptions(fields.answer, fields.wrongs, fields.mcOpts || {});
        q.options = r.options; q.correct = r.correct;
      }
      q.options = q.options.map(o => typeof o === 'number' ? fmt(o) : String(o));
    }
    q.answerText = fields.answerText || (typeof q.answer === 'number' ? fmt(q.answer) : String(q.answer));
    return q;
  }

  // ---------- DOM nhỏ gọn ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stripHtml = (s) => String(s).replace(/<sup>(\d+)<\/sup>/g, ' mũ $1').replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1 phần $2').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // Đọc số bằng chữ (0 – 999 999)
  const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function read3(n, full) {
    const h = Math.floor(n / 100), t = Math.floor(n % 100 / 10), u = n % 10; const p = [];
    if (h || full) p.push(DIG[h] + ' trăm');
    if (t === 0) { if (u && (h || full)) p.push('linh'); }
    else if (t === 1) p.push('mười'); else p.push(DIG[t] + ' mươi');
    if (u) p.push(u === 1 && t > 1 ? 'mốt' : u === 5 && t > 0 ? 'lăm' : u === 4 && t > 1 ? 'tư' : DIG[u]);
    return p.join(' ');
  }
  function readVi(n) {
    if (n === 0) return 'không';
    const th = Math.floor(n / 1000), r = n % 1000;
    let s = th ? read3(th, false) + ' nghìn' : '';
    if (r) s += (s ? ' ' : '') + read3(r, !!th);
    return s;
  }

  // Băm chuỗi (dùng để lưu SĐT ẩn danh, mật khẩu quản trị, mã VIP) — cyrb53, trả về chuỗi hex 14 kí tự
  function hash(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
  }
  // Ảnh đại diện: 1 trong các emoji có sẵn HOẶC ảnh tải từ máy (v25) — data URL JPEG/PNG/WebP chỉ gồm kí tự base64,
  // ≤ 40 KB (đã thu nhỏ 160×160 khi chọn) → không thể chèn mã HTML qua dữ liệu đồng bộ.
  const AVATARS = ['🦉', '🐱', '🐶', '🐼', '🦊', '🐰', '🐯', '🐸', '🐵', '🦄', '🐧', '🐨', '🦁', '🐲', '🐙', '🚀'];
  const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
  const isPhoto = (a) => typeof a === 'string' && a.length <= 40000 && PHOTO_RE.test(a);
  const avOk = (a) => AVATARS.includes(a) || isPhoto(a) ? a : '🦉';            // giá trị hợp lệ để LƯU
  const av = (a) => isPhoto(a) ? `<img class="av-img" src="${a}" alt="">` : (AVATARS.includes(a) ? a : '🦉');   // HTML để HIỂN THỊ
  // Đọc ảnh người dùng chọn → cắt vuông giữa ảnh, thu về 160×160, nén JPEG → data URL (~6–12 KB)
  function photoFromFile(file, size = 160) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('type'));
      if (file.size > 15 * 1024 * 1024) return reject(new Error('big'));
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        try {
          const s = Math.min(img.naturalWidth, img.naturalHeight); if (!s) throw new Error('empty');
          const cv = document.createElement('canvas'); cv.width = cv.height = size; const ctx = cv.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
          let q = 0.85, out = cv.toDataURL('image/jpeg', q);
          while (out.length > 38000 && q > 0.4) { q -= 0.15; out = cv.toDataURL('image/jpeg', q); }
          URL.revokeObjectURL(url); isPhoto(out) ? resolve(out) : reject(new Error('encode'));
        } catch (e) { URL.revokeObjectURL(url); reject(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }
  const slug = (s) => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function download(filename, text, type = 'application/json') {
    const blob = new Blob([text], { type }); const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  MA.U = { AVATARS, av, avOk, isPhoto, photoFromFile, hash, slug, download, readVi, rnd, R, pick, shuffle, sample, seeded, withSeed, gcd, lcm, isPrime, factorize, factorStr, divisors, round,
    fmt, fmtInt, frac, simplify, fracStr, fracHtml, norm, parseNum, checkAnswer, mcOptions, Q, $, $$, esc, stripHtml, today, hashStr };
})(window.MA);
