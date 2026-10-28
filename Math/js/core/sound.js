/* =========================================================
 * sound.js — Hiệu ứng âm thanh (Web Audio) & Cô giáo đọc bài (Speech Synthesis)
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  let ctx = null;
  function ac() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tones(notes, type = 'sine', vol = 0.18) {
    if (MA.Sound.muted) return;
    try {
      const c = ac(); if (!c) return;
      let t = c.currentTime;
      notes.forEach(([f, d, gap]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d);
        t += gap == null ? d * 0.8 : gap;
      });
    } catch (e) { /* bỏ qua lỗi âm thanh */ }
  }

  // ---------- Giọng đọc tiếng Việt ----------
  // Chỉ dùng giọng có mã ngôn ngữ tiếng Việt (vi-VN). Nếu máy không có giọng Việt thì KHÔNG đọc
  // bằng giọng nước ngoài (sai âm) mà hướng dẫn cài giọng / dùng Microsoft Edge.
  let voices = [];
  function loadVoices() { if ('speechSynthesis' in window) voices = speechSynthesis.getVoices() || []; }
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  // Chấm điểm chất lượng: giọng tự nhiên (Neural) của Edge > Google > Apple > giọng cũ của Windows
  function score(v) {
    const n = v.name; let s = 0;
    if (/natural|neural|online/i.test(n)) s += 60;
    if (/hoaimy|hoài my/i.test(n)) s += 12; if (/namminh|nam minh/i.test(n)) s += 10;
    if (/google/i.test(n)) s += 40;
    if (/linh/i.test(n)) s += 25;                     // Apple (iPhone, iPad, Mac)
    if (/premium|enhanced|nâng cao/i.test(n)) s += 20;
    if (/microsoft an\b/i.test(n)) s += 5;            // giọng cũ của Windows, kém tự nhiên
    if (/^vi[-_]vn$/i.test(v.lang)) s += 3;
    return s;
  }
  function viVoices() {
    if (!voices.length) loadVoices();
    return voices.filter(v => /^vi([-_]|$)/i.test(v.lang)).sort((a, b) => score(b) - score(a));
  }
  function pickVoice() {
    const list = viVoices(); if (!list.length) return null;
    let want = ''; try { want = (MA.Store.get('settings', {}) || {}).voice || ''; } catch (e) { /* bỏ qua */ }
    return (want && list.find(v => v.voiceURI === want || v.name === want)) || list[0];
  }

  // ---------- Đọc số & kí hiệu toán theo cách nói của cô giáo ----------
  const DG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function read3(n, full) {               // 0..999; full: nhóm không đứng đầu (đọc "không trăm", "linh")
    const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, u = n % 10, out = [];
    if (h || full) out.push(DG[h], 'trăm');
    if (t === 0) { if (u && (h || full)) out.push('linh'); }
    else if (t === 1) out.push('mười');
    else out.push(DG[t], 'mươi');
    if (u) out.push(u === 1 && t > 1 ? 'mốt' : u === 4 && t > 1 ? 'tư' : u === 5 && t > 0 ? 'lăm' : DG[u]);
    return out.join(' ');
  }
  function readInt(n) {
    n = Math.floor(Math.abs(n)); if (n === 0) return 'không';
    if (n >= 1e9) { const hi = Math.floor(n / 1e9), lo = n % 1e9; return readInt(hi) + ' tỉ' + (lo ? ' ' + (lo < 1e8 ? readGroups(lo, true) : readInt(lo)) : ''); }
    return readGroups(n, false);
  }
  function readGroups(n, full) {
    const units = ['', ' nghìn', ' triệu'], parts = []; let i = 0, first = true;
    const g = []; while (n > 0 || i === 0) { g.push(n % 1000); n = Math.floor(n / 1000); i++; if (n === 0) break; }
    for (let k = g.length - 1; k >= 0; k--) {
      if (g[k] === 0) { first = false; continue; }
      parts.push(read3(g[k], !(first && !full)) + units[k]); first = false;
    }
    return parts.join(' ');
  }
  function readNum(str) {                 // "1.234,05" | "12,5" | "1 234"
    let s = str.replace(/[.\s](?=\d{3}(\D|$))/g, '');
    const neg = /^[-−]/.test(s); s = s.replace(/^[-−]/, '');
    const [ip, dp] = s.split(',');
    let r = readInt(+ip || 0);
    if (dp) r += ' phẩy ' + (dp.length <= 2 && dp[0] !== '0' ? readInt(+dp) : dp.split('').map(d => DG[+d]).join(' '));
    return (neg ? 'âm ' : '') + r;
  }
  const UNIT = { mm: 'mi-li-mét', cm: 'xăng-ti-mét', dm: 'đề-xi-mét', m: 'mét', km: 'ki-lô-mét', g: 'gam', kg: 'ki-lô-gam', mg: 'mi-li-gam', ml: 'mi-li-lít', l: 'lít', ha: 'héc-ta', dam: 'đề-ca-mét', hm: 'héc-tô-mét' };
  function mathToSpeech(raw) {
    let t = MA.U.stripHtml(raw)
      .replace(/&nbsp;/g, ' ').replace(/[“”"]/g, '')
      .replace(/km\s*\/\s*(giờ|h(?![a-z]))/g, 'ki-lô-mét trên giờ').replace(/m\s*\/\s*(giây|s(?![a-z]))/g, 'mét trên giây').replace(/m\s*\/\s*phút/g, 'mét trên phút')
      .replace(/tỉ lệ\s*(\d+)\s*:\s*/g, 'tỉ lệ $1 phần ')
      .replace(/(\d)\s*(mm|cm|dm|dam|hm|km|kg|mg|ml|ha|m|g|l)\s*([²³]|2(?=\s|$)|3(?=\s|$))?(?![a-zA-ZÀ-ỹ])/g, (m0, d, u, p) => d + ' ' + UNIT[u] + (p === '²' || p === '2' ? ' vuông' : p ? ' khối' : ''))
      .replace(/\b(mm|cm|dm|km|m)([²³])/g, (m0, u, p) => UNIT[u] + (p === '²' ? ' vuông' : ' khối'))
      .replace(/(^|[^a-zA-ZÀ-ỹ])(mm|cm|dm|km|kg|ml)(?![a-zA-ZÀ-ỹ])/g, (m0, p, u) => p + UNIT[u])
      .replace(/([(\s])\?(?=[\s)]|$)/g, '$1 bao nhiêu ')
      .replace(/(\d)\s*\/\s*(\d)/g, '$1 phần $2')
      .replace(/(\d)\s*%/g, '$1 phần trăm')
      .replace(/\(([^()]*[\d][^()]*[+−×:\-÷][^()]*)\)/g, ' mở ngoặc $1 đóng ngoặc ')
      .replace(/\s*≥\s*/g, ' lớn hơn hoặc bằng ').replace(/\s*≤\s*/g, ' bé hơn hoặc bằng ').replace(/\s*≠\s*/g, ' khác ')
      .replace(/\s*>\s*/g, ' lớn hơn ').replace(/\s*<\s*/g, ' bé hơn ')
      .replace(/=\s*(\?|…|\.\.\.+)/g, ' bằng bao nhiêu?').replace(/(\?|…|\.\.\.+)\s*=/g, ' bao nhiêu bằng ')
      .replace(/\s*=\s*/g, ' bằng ')
      .replace(/\s*\+\s*/g, ' cộng ').replace(/\s*[×✕]\s*/g, ' nhân ').replace(/(\d)\s*x\s*(\d)/g, '$1 nhân $2')
      .replace(/\s*÷\s*/g, ' chia ').replace(/(\S)\s+:\s+(\S)/g, '$1 chia $2')
      .replace(/(\d|\))\s*[−-]\s*(?=[\d(x])/g, '$1 trừ ').replace(/\s−\s/g, ' trừ ')
      .replace(/(^|[\s(])[−-](?=\d)/g, '$1âm ')
      .replace(/\.{3,}|…|_{2,}|□|\[\s*\]/g, ' bao nhiêu ')
      .replace(/(\d+(?:[.\s]\d{3})*(?:,\d+)?)/g, (m0) => ' ' + readNum(m0) + ' ');
    return t.replace(/\s+([,.;:!?])/g, '$1').replace(/\s+/g, ' ').trim();
  }
  // Tách câu dài (Chrome hay dừng đọc giữa chừng nếu một câu quá 15 giây)
  function chunks(text) {
    const out = []; (text.match(/[^.!?;]+[.!?;]*/g) || [text]).forEach(seg => {
      seg = seg.trim(); if (!seg) return;
      while (seg.length > 180) { let k = seg.lastIndexOf(',', 180); if (k < 60) k = seg.lastIndexOf(' ', 180); if (k < 1) k = 180; out.push(seg.slice(0, k + 1)); seg = seg.slice(k + 1).trim(); }
      if (seg) out.push(seg);
    });
    return out;
  }
  const HELP = 'Máy này chưa có giọng đọc tiếng Việt nên cô chưa đọc được. Cách khắc phục: mở trang bằng <b>Microsoft Edge</b> (có giọng HoaiMy/NamMinh rất tự nhiên) hoặc cài giọng Tiếng Việt cho máy (xem 👤 Tài khoản → Giọng cô đọc).';
  let timer = null;

  MA.Sound = {
    muted: false,
    correct() { tones([[523.25, .3, .08], [659.25, .3, .08], [783.99, .3, .08], [1046.5, .4]]); },
    wrong() { tones([[392, .3, .12], [329.63, .35]], 'triangle', .15); },
    click() { tones([[880, .06]], 'square', .04); },
    complete() { tones([[523.25, .12], [659.25, .12], [783.99, .12], [987.77, .18], [1046.5, .5]], 'sine', .2); },
    levelUp() { tones([[659.25, .12], [783.99, .12], [1046.5, .12], [1318.5, .5]], 'triangle', .18); },

    canSpeak() { return 'speechSynthesis' in window; },
    hasViVoice() { return !!pickVoice(); },
    voices() { return viVoices(); },
    currentVoice() { return pickVoice(); },
    HELP, mathToSpeech, readNum,
    speaking() { return 'speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending); },
    stop() { clearTimeout(timer); if ('speechSynthesis' in window) speechSynthesis.cancel(); },
    // Đọc tiếng Anh (đề TIMO) bằng giọng tiếng Anh của máy
    speakEn(text, opts = {}) {
      if (!('speechSynthesis' in window)) { MA.UI && MA.UI.toast('Trình duyệt chưa hỗ trợ đọc giọng nói.'); return; }
      this.stop(); loadVoices();
      const all = speechSynthesis.getVoices() || []; const v = all.find(x => /^en[-_](US|GB)/i.test(x.lang)) || all.find(x => /^en/i.test(x.lang));
      const t = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s*[×✕]\s*/g, ' times ').replace(/\s*[−-]\s+/g, ' minus ').replace(/\s*\+\s*/g, ' plus ').replace(/\s*=\s*/g, ' equals ').replace(/_{2,}|…|\.{3,}/g, ' blank ').replace(/\$(\d+)/g, '$1 dollars').replace(/\s+/g, ' ').trim();
      const parts = chunks(t);
      timer = setTimeout(() => parts.forEach((line, i) => { const u = new SpeechSynthesisUtterance(line); u.lang = (v && v.lang) || 'en-US'; if (v) u.voice = v; u.rate = 0.9; if (i === parts.length - 1 && opts.onend) u.onend = opts.onend; speechSynthesis.speak(u); }), 60);
    },
    // say = { en, vi }: đọc phần tiếng Anh (giọng Anh) rồi phần tiếng Việt (giọng Việt)
    speakSay(say, extra = []) {
      const ex = extra.length ? '. ' + extra.join('. ') : '';
      if (say.en && say.vi) this.speakEn(say.en, { onend: () => this.speak([say.vi].concat(extra)) });
      else if (say.en) this.speakEn(say.en + ex);
      else this.speak([say.vi].concat(extra));
    },
    // Đọc văn bản khi người học bấm nút (không tự đọc). lines là mảng => đọc ngắt nhịp (thơ / quy tắc)
    speak(text, opts = {}) {
      if (!('speechSynthesis' in window)) { MA.UI && MA.UI.toast('Trình duyệt chưa hỗ trợ đọc giọng nói.'); return; }
      this.stop(); loadVoices();
      const v = pickVoice();
      // Danh sách giọng đã tải mà không có giọng Việt → không đọc bằng giọng nước ngoài
      if (!v && voices.length) { MA.UI && MA.UI.toast(HELP, 'bad'); return; }
      let set = {}; try { set = MA.Store.get('settings', {}) || {}; } catch (e) { /* bỏ qua */ }
      const base = +set.voiceRate || 1;
      const lines = (Array.isArray(text) ? text : [text]).map(l => mathToSpeech(String(l || ''))).filter(Boolean);
      const parts = []; lines.forEach(l => chunks(l).forEach(c => parts.push(c)));
      // Chrome: cần chờ một nhịp sau cancel() rồi mới speak(), nếu không câu đầu dễ bị nuốt
      timer = setTimeout(() => {
        parts.forEach((line, i) => {
          const u = new SpeechSynthesisUtterance(line);
          u.lang = (v && v.lang) || 'vi-VN'; if (v) u.voice = v;
          u.rate = Math.max(0.5, Math.min(1.5, (opts.rate || 0.95) * base)); u.pitch = opts.pitch || 1;
          if (i === parts.length - 1 && opts.onend) u.onend = opts.onend;
          speechSynthesis.speak(u);
        });
      }, 60);
    }
  };
})(window.MA);

window.addEventListener('hashchange', () => { try { MA.Sound.stop(); } catch (e) { /* bỏ qua */ } });
