/* =========================================================
 * timo-core.js — NỀN TẢNG LUYỆN THI TIMO (dùng chung cho mọi lớp)
 *  - Ngôn ngữ đề: 'bi' song ngữ (mặc định) · 'vi' tiếng Việt · 'kw' tiếng Anh + từ khoá tiếng Việt · 'en' chỉ tiếng Anh
 *  - Từ điển thuật ngữ Anh–Việt (tự chú thích từ khoá ở chế độ 'kw')
 *  - Hình vẽ SVG: lưới ô vuông, tam giác chia quạt, điểm trên đoạn thẳng, khối lập phương xếp chồng…
 *  - Cấu hình 3 vòng thi thử (VIP)
 * Chủ đề TIMO là chủ đề thường (MA.Data) có thêm t.track = 'timo' → không hiện trong bản đồ SGK.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, shuffle, Q, stripHtml } = MA.U;

  // ---------- Từ điển thuật ngữ (theo phân môn) ----------
  const GLOSS = {
    logic: [['according to', 'dựa vào'], ['given', 'cho'], ['sequence', 'dãy'], ['pattern', 'quy luật'], ['term', 'số hạng'], ['next', 'tiếp theo'], ['figure', 'hình'], ['symbol', 'ký hiệu'], ['English letter', 'chữ cái tiếng Anh'],
      ['day of the week', 'thứ trong tuần'], ['today', 'hôm nay'], ['yesterday', 'hôm qua'], ['tomorrow', 'ngày mai'], ['the day before yesterday', 'hôm kia'], ['the day after tomorrow', 'ngày kia'], ['later', 'sau (nữa)'], ['ago', 'trước (đây)'], ['week', 'tuần'], ['month', 'tháng'], ['same year', 'cùng năm'],
      ['age', 'tuổi'], ['years old', 'tuổi'], ['equal to', 'bằng'], ['born', 'sinh ra'], ['mum', 'mẹ'], ['mother', 'mẹ'], ['father', 'bố'], ['brother', 'anh/em trai'], ['sister', 'chị/em gái'], ['children', 'các con / trẻ em'], ['classmates', 'bạn cùng lớp'], ['minutes', 'phút'], ['lap', 'vòng chạy'], ['rest', 'nghỉ'], ['piece', 'đoạn / mảnh'], ['guess', 'đoán'], ['correct', 'đúng'], ['wrong', 'sai'], ['now', 'bây giờ'],
      ['line up', 'xếp hàng'], ['in front of', 'phía trước'], ['behind', 'phía sau'], ['in the middle of', 'chính giữa'], ['between', 'ở giữa'], ['row', 'hàng'], ['column', 'hàng dọc'], ['position', 'vị trí'], ['leap year', 'năm nhuận'], ['times as old as', 'gấp … lần tuổi'], ['older', 'nhiều tuổi hơn'], ['balance', 'cái cân'], ['weighs the same as', 'nặng bằng'], ['legs', 'chân'], ['heads', 'đầu'], ['wheels', 'bánh xe'], ['altogether', 'tất cả'], ['times as many', 'gấp … lần'], ['trees', 'cây'], ['both ends', 'hai đầu'], ['strikes', 'đánh (chuông)'], ['floor', 'tầng'], ['average', 'trung bình cộng'], ['scores', 'điểm số'], ['speed', 'vận tốc'], ['km/h', 'km/giờ'], ['catch up', 'đuổi kịp'], ['towards each other', 'ngược chiều'], ['hour hand', 'kim giờ'], ['minute hand', 'kim phút'], ['work together', 'làm chung'], ['clues', 'gợi ý']],
    arith: [['find the value of', 'tính giá trị của'], ['calculate', 'tính'], ['sum', 'tổng'], ['multiplication', 'phép nhân'], ['equation', 'phép tính'], ['missing number', 'số còn thiếu'], ['stands for', 'thay cho'], ['covered by', 'bị che bởi'], ['value', 'giá trị'], ['1-digit number', 'số có 1 chữ số'], ['digit', 'chữ số'], ['blank', 'chỗ trống'], ['subtract', 'trừ đi'], ['add', 'cộng'], ['thinks of a number', 'nghĩ ra một số'], ['multiplies', 'nhân'], ['consecutive', 'liên tiếp'], ['fraction', 'phân số'], ['simplest form', 'tối giản'], ['discount', 'giảm giá'], ['ratio', 'tỉ số'], ['for any', 'với mọi'], ['letters', 'chữ cái']],
    numth: [['odd number', 'số lẻ'], ['even number', 'số chẵn'], ['odd', 'lẻ'], ['even', 'chẵn'], ['largest', 'lớn nhất'], ['smallest', 'nhỏ nhất'], ['greatest', 'lớn nhất'], ['arrange', 'sắp xếp'], ['descending order', 'thứ tự giảm dần'], ['ascending order', 'thứ tự tăng dần'],
      ['separate', 'chia'], ['equally', 'đều nhau'], ['equal groups', 'nhóm bằng nhau'], ['each other', 'nhau'], ['each', 'mỗi'], ['the same number', 'cùng số lượng'], ['move', 'chuyển'], ['originally', 'lúc đầu'], ['2-digit', 'có 2 chữ số'], ['3-digit', 'có 3 chữ số'], ['4-digit', 'có 4 chữ số'], ['divisible by', 'chia hết cho'], ['multiple', 'bội'], ['arithmetic sequence', 'dãy số cách đều'], ['unit digit', 'chữ số hàng đơn vị'], ['tens digit', 'chữ số hàng chục'], ['hundreds digit', 'chữ số hàng trăm'], ['pile', 'đống'], ['colour', 'màu'], ['without looking', 'không nhìn'], ['be sure', 'chắc chắn'], ['page', 'trang'], ['remainder', 'số dư'], ['divided by', 'chia cho'], ['factors', 'ước'], ['prime number', 'số nguyên tố'], ['last digit', 'chữ số tận cùng'], ['zeros', 'các chữ số 0'], ['product', 'tích'], ['digit sum', 'tổng các chữ số'], ['ribbons', 'sợi ruy băng'], ['as long as possible', 'dài nhất có thể'], ['left over', 'thừa ra'], ['van', 'xe'], ['boxes', 'hộp']],
    geo: [['count', 'đếm'], ['square', 'hình vuông'], ['triangle', 'hình tam giác'], ['line segment', 'đoạn thẳng'], ['point', 'điểm'], ['cube', 'hình lập phương'], ['stacked', 'xếp chồng'], ['face', 'mặt'], ['from the top', 'từ phía trên'], ['from the front', 'từ phía trước'], ['from the right', 'từ bên phải'], ['at least', 'ít nhất'], ['at most', 'nhiều nhất'], ['figure below', 'hình dưới đây'], ['side', 'cạnh'], ['edge', 'cạnh'], ['vertices', 'đỉnh'], ['vertex', 'đỉnh'], ['circle', 'hình tròn'], ['rectangle', 'hình chữ nhật'], ['prism', 'hình lăng trụ'], ['right angle', 'góc vuông'], ['obtuse angle', 'góc tù'], ['plane', 'mặt phẳng'], ['straight line', 'đường thẳng'], ['rectangles', 'hình chữ nhật'], ['perimeter', 'chu vi'], ['area', 'diện tích'], ['long', 'dài'], ['wide', 'rộng'], ['high', 'cao'], ['volume', 'thể tích'], ['radius', 'bán kính'], ['circumference', 'chu vi hình tròn'], ['base', 'đáy'], ['height', 'chiều cao'], ['trapezium', 'hình thang'], ['parallel sides', 'hai đáy'], ['isosceles triangle', 'tam giác cân'], ['interior angles', 'góc trong'], ['polygon', 'đa giác'], ['diagonals', 'đường chéo'], ['painted', 'được sơn'], ['matchsticks', 'que diêm'], ['surface area', 'diện tích toàn phần'], ['angle', 'góc']],
    comb: [['choose', 'chọn'], ['form', 'lập'], ['different', 'khác nhau'], ['without repetition', 'không lặp lại'], ['coin', 'đồng xu'], ['costs', 'có giá'], ['ways', 'cách'], ['buy', 'mua'], ['change', 'tiền trả lại'], ['have left', 'còn lại'], ['more money', 'nhiều tiền hơn'], ['difference', 'hiệu'], ['pick', 'chọn'], ['competitor', 'vận động viên'], ['flavour', 'vị'], ['identical', 'giống hệt nhau'], ['vase', 'lọ hoa'], ['empty', 'trống / rỗng'], ['for free', 'miễn phí'], ['contain', 'chứa'], ['appetizer', 'món khai vị'], ['dessert', 'món tráng miệng'], ['handshakes', 'cái bắt tay'], ['tournament', 'giải đấu'], ['matches', 'trận đấu'], ['knockout', 'loại trực tiếp'], ['in a row', 'thành một hàng'], ['shortest paths', 'đường đi ngắn nhất'], ['both', 'cả hai'], ['neither', 'không … nào'], ['socks', 'tất'], ['outfits', 'bộ trang phục'], ['roads', 'con đường'], ['empty bottles', 'vỏ chai rỗng'], ['toppings', 'loại nhân'], ['subsets', 'tập con'], ['pairs', 'cặp']]
  };
  const SUBJ = {
    logic: { icon: '🧠', en: 'Logical Thinking', vi: 'Tư duy logic' },
    arith: { icon: '➕', en: 'Arithmetic', vi: 'Số học' },
    numth: { icon: '🔢', en: 'Number Theory', vi: 'Lý thuyết số' },
    geo: { icon: '📐', en: 'Geometry', vi: 'Hình học' },
    comb: { icon: '🎲', en: 'Combinatorics', vi: 'Tổ hợp' }
  };
  const ALL = []; Object.keys(GLOSS).forEach(k => GLOSS[k].forEach(([en, vi]) => ALL.push({ en, vi, s: k })));
  const byLen = ALL.slice().sort((a, b) => b.en.length - a.en.length);
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const KW_RE = new RegExp('\\b(' + byLen.map(x => reEsc(x.en)).join('|') + ')(s|es)?\\b', 'gi');
  const KW_MAP = {}; byLen.forEach(x => { if (!KW_MAP[x.en.toLowerCase()]) KW_MAP[x.en.toLowerCase()] = x.vi; });

  // Chú thích từ khoá tiếng Việt ngay dưới từ tiếng Anh (mỗi từ chỉ chú thích lần đầu)
  function annotate(html) {
    const used = new Set();
    return String(html).split(/(<[^>]+>)/).map(part => part.startsWith('<') ? part : part.replace(KW_RE, (m, base) => {
      const k = base.toLowerCase(); if (used.has(k)) return m; used.add(k);
      return `<span class="kw">${m}<small>${KW_MAP[k]}</small></span>`;
    })).join('');
  }

  // Danh sách từ khoá xuất hiện trong đề (giống dòng chú thích dưới mỗi câu của đề vòng quốc gia)
  function keywords(html) {
    const out = [], seen = new Set(); String(html).split(/(<[^>]+>)/).forEach(part => { if (part.startsWith('<')) return; part.replace(KW_RE, (m, base) => { const k = base.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push([base.charAt(0).toUpperCase() + base.slice(1), KW_MAP[k]]); } return m; }); });
    return out;
  }
  const LANGS = { bi: '🇬🇧🇻🇳 Song ngữ', vi: '🇻🇳 Tiếng Việt', kw: '🇬🇧 English + từ khoá', en: '🇬🇧 English' };

  const Timo = {
    GLOSS, SUBJ, ALL, LANGS, annotate, keywords,
    force: null,   // ngôn ngữ ép buộc khi tạo đề thi thử
    lang() { if (this.force) return this.force; const s = MA.UI && MA.UI.settings && MA.UI.settings.timoLang; return LANGS[s] ? s : 'bi'; },
    // Ghép đề theo ngôn ngữ. show = phần hiển thị chung (dãy số, phép tính) đặt sau đề.
    compose(en, vi, show) {
      const L = this.lang();
      const E = `<div class="tm-en" lang="en">${en}</div>`, V = `<div class="tm-vi">${vi}</div>`;
      const kws = L === 'kw' ? keywords(en) : [];
      const K = kws.length ? `<div class="tm-kwl">${kws.map(([e, v]) => `<b>${e}</b>: ${v}`).join('; ')}.</div>` : '';
      const body = L === 'vi' ? V : L === 'bi' ? E + V : E + K;
      return `<div class="tm-q tm-${L}">${body}</div>${show ? `<div class="tm-show">${show}</div>` : ''}`;
    },
    // Nhãn lựa chọn theo ngôn ngữ
    label(en, vi) { const L = this.lang(); return L === 'vi' ? vi : L === 'bi' ? `${en} (${vi})` : en; },
    say(en, vi, show) {
      const L = this.lang(); const sh = show ? ' ' + stripHtml(show) : '';
      return { en: L === 'vi' ? '' : stripHtml(en) + sh, vi: L === 'en' || L === 'kw' ? '' : stripHtml(vi) + sh };
    },
    // Tạo câu hỏi TIMO. o = { en, vi, show, answer, choices: [[en, vi]...] + ans (chỉ số), ...các trường của Q }
    T(o) {
      const f = Object.assign({}, o); delete f.en; delete f.vi; delete f.show; delete f.choices; delete f.ans;
      f.text = this.compose(o.en, o.vi, o.show);
      if (o.choices) {
        const labels = o.choices.map(c => Array.isArray(c) ? this.label(c[0], c[1]) : String(c));
        f.answer = labels[o.ans]; f.options = labels; f.keepMc = true;
      }
      const q = Q(f); q.say = this.say(o.en, o.vi, o.show); q.timo = true; q.lang = this.lang();
      return q;
    },

    // ---------- Tiện ích ngôn ngữ ----------
    pl(n, w) { return `${n} ${w}${n === 1 ? '' : 's'}`; },
    ord(n) { const s = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'); return n + s; },
    NAMES: ['Tom', 'Anna', 'Peter', 'Mary', 'Jack', 'Lucy', 'Ben', 'Emma', 'David', 'Alice', 'Kevin', 'Nancy', 'Harry', 'Lily', 'Sam', 'Mia', 'Andy', 'Rosie'],
    names(k) { return shuffle(this.NAMES).slice(0, k); },
    DAYS_EN: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    DAYS_VI: ['thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy', 'Chủ nhật'],
    MONTHS_EN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    MDAYS: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    day(i) { i = ((i % 7) + 7) % 7; return [this.DAYS_EN[i], this.DAYS_VI[i]]; },
    // 4 lựa chọn thứ trong tuần quanh đáp án
    dayChoices(i) { const set = shuffle([0, 1, 2, -1, -2, 3].map(k => ((i + k) % 7 + 7) % 7).filter((x, k, a) => a.indexOf(x) === k)).slice(0, 4); if (!set.includes(((i % 7) + 7) % 7)) set[0] = ((i % 7) + 7) % 7; const arr = shuffle(set); return { choices: arr.map(x => this.day(x)), ans: arr.indexOf(((i % 7) + 7) % 7) }; },

    // ---------- Hình vẽ SVG ----------
    svg(w, h, body) { return `<svg class="vis-svg tm-svg" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px" role="img" xmlns="http://www.w3.org/2000/svg">${body}</svg>`; },
    vis(svg) { return { type: 'raw', svg }; },
    // lưới m hàng × n cột ô vuông
    gridSvg(m, n) {
      const s = Math.min(46, Math.floor(260 / Math.max(m, n))), W = n * s + 20, H = m * s + 20; let b = `<rect x="10" y="10" width="${n * s}" height="${m * s}" fill="#fff8e6" stroke="#2b3445" stroke-width="2.5"/>`;
      for (let i = 1; i < m; i++) b += `<line x1="10" y1="${10 + i * s}" x2="${10 + n * s}" y2="${10 + i * s}" stroke="#2b3445" stroke-width="2"/>`;
      for (let j = 1; j < n; j++) b += `<line x1="${10 + j * s}" y1="10" x2="${10 + j * s}" y2="${10 + m * s}" stroke="#2b3445" stroke-width="2"/>`;
      return this.svg(W, H, b);
    },
    // tam giác có k đường thẳng từ đỉnh xuống đáy và h đường cắt ngang
    fanSvg(k, h) {
      const A = [150, 14], B = [20, 196], C = [280, 196]; let b = `<polygon points="${A} ${B} ${C}" fill="#eaf2ff" stroke="#2b3445" stroke-width="2.5" stroke-linejoin="round"/>`;
      for (let i = 1; i <= k; i++) { const x = 20 + 260 * i / (k + 1); b += `<line x1="150" y1="14" x2="${x}" y2="196" stroke="#2b3445" stroke-width="2"/>`; }
      for (let j = 1; j <= h; j++) { const t = j / (h + 1), y = 14 + 182 * t, xl = 150 - 130 * t, xr = 150 + 130 * t; b += `<line x1="${xl}" y1="${y}" x2="${xr}" y2="${y}" stroke="#2b3445" stroke-width="2"/>`; }
      return this.svg(300, 210, b);
    },
    // n điểm trên một đoạn thẳng (có tên)
    pointsSvg(n) {
      const L = 'ABCDEFGHIK'; const xs = []; let x = 20; for (let i = 0; i < n; i++) { xs.push(x); x += 30 + R(0, 28); } const W = x - 30 + 40;
      let b = `<line x1="${xs[0]}" y1="40" x2="${xs[n - 1]}" y2="40" stroke="#2b3445" stroke-width="2.5"/>`;
      xs.forEach((p, i) => { b += `<circle cx="${p}" cy="40" r="4.5" fill="#e5534b"/><text x="${p}" y="68" font-size="15" text-anchor="middle" font-weight="800" fill="#2b3445">${L[i]}</text>`; });
      return this.svg(Math.max(W, 120), 80, b);
    },
    // đỉnh O nối với k điểm trên đáy
    fanPointsSvg(k) {
      let b = ''; const xs = []; for (let i = 0; i < k; i++) xs.push(30 + 240 * i / (k - 1));
      b += `<line x1="${xs[0]}" y1="170" x2="${xs[k - 1]}" y2="170" stroke="#2b3445" stroke-width="2.5"/>`;
      xs.forEach(x => { b += `<line x1="150" y1="20" x2="${x}" y2="170" stroke="#2b3445" stroke-width="2"/><circle cx="${x}" cy="170" r="4" fill="#e5534b"/>`; });
      b += `<circle cx="150" cy="20" r="4.5" fill="#e5534b"/>`;
      return this.svg(300, 185, b);
    },
    // khối lập phương xếp chồng — hm[d][c]: chiều cao cột ở hàng d (0 = hàng trước), cột c (trái → phải)
    cubesSvg(hm) {
      const D = hm.length, Cn = hm[0].length, s = 34, dx = 17, dy = 13; const maxH = Math.max(...hm.map(r => Math.max(...r)));
      const W = Cn * s + D * dx + 24, H = maxH * s + D * dy + 24, base = H - 12;
      let b = '';
      for (let d = D - 1; d >= 0; d--) for (let z = 0; z < maxH; z++) for (let c = 0; c < Cn; c++) {
        if (hm[d][c] <= z) continue;
        const x = 12 + c * s + d * dx, yb = base - z * s - d * dy;
        b += `<polygon points="${x},${yb - s} ${x + s},${yb - s} ${x + s + dx},${yb - s - dy} ${x + dx},${yb - s - dy}" fill="#ffe1a8" stroke="#2b3445" stroke-width="1.6" stroke-linejoin="round"/>`;
        b += `<polygon points="${x + s},${yb} ${x + s + dx},${yb - dy} ${x + s + dx},${yb - s - dy} ${x + s},${yb - s}" fill="#e8a94a" stroke="#2b3445" stroke-width="1.6" stroke-linejoin="round"/>`;
        b += `<rect x="${x}" y="${yb - s}" width="${s}" height="${s}" fill="#f6c343" stroke="#2b3445" stroke-width="1.6"/>`;
      }
      return this.svg(W, H, b);
    },
    // hình có quy luật: các hình k = 1..3 gồm số chấm tròn
    dotsSvg(counts) {
      const per = 5, r = 7, gap = 18; let b = '', x0 = 10; const H = Math.ceil(Math.max(...counts) / per) * gap + 40;
      counts.forEach((n, k) => { const cols = Math.min(n, per); for (let i = 0; i < n; i++) b += `<circle cx="${x0 + 10 + (i % per) * gap}" cy="${14 + Math.floor(i / per) * gap}" r="${r}" fill="#4a7bd8"/>`; b += `<text x="${x0 + 10 + (cols - 1) * gap / 2}" y="${H - 8}" font-size="13" text-anchor="middle" font-weight="700" fill="#2b3445">Figure ${k + 1}</text>`; x0 += cols * gap + 26; });
      return this.svg(x0, H, b);
    },
    // hai ô chứa đồ vật (bài chia đều)
    boxesSvg(a, b2, emo) {
      const box = (x, n) => { let s = `<rect x="${x}" y="8" width="150" height="104" rx="12" fill="#fff8e6" stroke="#2b3445" stroke-width="2"/>`; for (let i = 0; i < n; i++) s += `<text x="${x + 18 + (i % 6) * 23}" y="${30 + Math.floor(i / 6) * 24}" font-size="18" text-anchor="middle" dominant-baseline="middle">${emo}</text>`; return s; };
      return this.svg(330, 122, box(10, a) + box(170, b2));
    },

    // ---------- Thi thử 3 vòng (VIP) — theo cấu trúc đề chính thức (BTC TIMO Việt Nam) ----------
    // Vòng loại: 25 câu trắc nghiệm, 60 phút, song ngữ · Vòng quốc gia: 25 câu điền đáp án, 90 phút, tiếng Anh có trích thuật ngữ tiếng Việt
    // Vòng quốc tế: 30 câu điền đáp án (6/phân môn), 5 điểm/câu, 120 phút, tiếng Anh
    ROUNDS: [
      { id: 'prelim', icon: '🥉', name: 'Vòng loại', en: 'Preliminary Round', lang: 'bi', time: 60, mc: true, pts: 4, levels: [1, 1, 2, 2, 3], medals: null, desc: '25 câu trắc nghiệm · song ngữ Anh – Việt · 60 phút' },
      { id: 'national', icon: '🥈', name: 'Vòng quốc gia', en: 'Heat Round', lang: 'kw', time: 90, pts: 4, levels: [1, 2, 2, 3, 3], medals: [80, 60, 40, 20], desc: '25 câu điền đáp án · tiếng Anh, có trích thuật ngữ tiếng Việt · 90 phút' },
      { id: 'final', icon: '🥇', name: 'Vòng quốc tế', en: 'Final Round', lang: 'en', time: 120, pts: 5, levels: [1, 2, 2, 3, 3, 3], medals: [120, 90, 60, 30], desc: '30 câu điền đáp án · hoàn toàn tiếng Anh · 120 phút' }
    ],
    MEDAL_NAMES: [['🥇', 'Huy chương Vàng'], ['🥈', 'Huy chương Bạc'], ['🥉', 'Huy chương Đồng'], ['🎗️', 'Khuyến khích']],
    // mức giải theo điểm (mốc của BTC, có thể thay đổi theo từng năm)
    medal(round, points) { if (!round.medals) return null; const i = round.medals.findIndex(m => points >= m); return i < 0 ? null : this.MEDAL_NAMES[i]; },
    // đổi câu điền đáp án thành trắc nghiệm A–D (vòng loại)
    toMc(q) {
      if (q.type === 'mc') return q;
      let wr;
      if (typeof q.answer === 'number') { const a = q.answer; wr = shuffle([a + 1, a - 1, a + 2, a - 2, a + 10, a - 10, a * 2, a + 5].filter(x => x >= 0 && x !== a)); }
      else if (/^[A-Z]$/.test(q.answer)) { const c = q.answer.charCodeAt(0); wr = shuffle([1, -1, 2, -2, 3].map(k => c + k).filter(k => k >= 65 && k <= 90).map(k => String.fromCharCode(k))); }
      else return q;
      const m = MA.U.mcOptions(q.answer, wr.slice(0, 3)); q.type = 'mc'; q.options = m.options.map(o => typeof o === 'number' ? MA.U.fmt(o) : String(o)); q.correct = m.correct; q.keepMc = true;
      return q;
    },
    // Tạo đề thi thử: mỗi phân môn round.levels.length câu, khó dần
    buildExam(grade, round) {
      const ids = ['logic', 'arith', 'numth', 'geo', 'comb'].map(s => `tm${grade}_${s}`).filter(id => MA.Data.topic(id));
      const out = []; const seen = new Set(); const usedGen = {}; this.force = round.lang;
      try {
        ids.forEach(id => round.levels.forEach(lv => {
          // tránh lặp dạng bài trong cùng một phân môn
          let q = null; for (let k = 0; k < 12; k++) { const c = MA.Data.make(id, lv); if (!c || seen.has(c.text)) continue; q = c; if (!(usedGen[id] || []).includes(c.genName)) break; }
          if (q) { seen.add(q.text); (usedGen[id] = usedGen[id] || []).push(q.genName); q.subj = id.split('_')[1]; if (round.mc) this.toMc(q); out.push(q); }
        }));
      } finally { this.force = null; }
      return out;
    }
  };
  MA.Timo = Timo;

  // Đăng ký kiểu hình vẽ SVG thô cho MA.Vis
  if (MA.Vis && MA.Vis.add) MA.Vis.add('raw', (v) => v.svg);
  // Hàm sinh câu hỏi dùng nhanh
  Timo.pick = pick; Timo.R = R;
})(window.MA);
