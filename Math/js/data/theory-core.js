/* =========================================================
 * theory-core.js — KHO ÔN LÝ THUYẾT THEO SGK (dùng chung mọi lớp, 18/10/2026)
 *   MA.Theory.add({ grade, vol, book, series, icon, chapters: [{ id, title, color, map, practice, lessons: [...] }], extra })
 *   Mỗi bài (lesson): { id, no, title, page?, topic, key: [], f?: [], vis?, cards: [[hỏi, đáp]], tf: [[khẳng định, đúng?, giải thích]], mc: [[câu hỏi, đáp án, [3 sai], giải thích]] }
 *   Mỗi lớp có thể có nhiều tập (vol 1, 2). add() tự thêm dạng bài "📘 Lý thuyết SGK" vào chủ đề tương ứng.
 * Nạp SAU registry.js và các file gradeN.js; TRƯỚC các file *-lythuyet*.js.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { R, pick, Q, shuffle } = MA.U;
  const GEN = '📘 Lý thuyết SGK';
  const books = {}, lessons = {}, byTopic = {};
  MA.Theory = {
    GEN,
    add(book) {
      const g = book.grade; book.vol = book.vol || 1;
      books[g] = (books[g] || []).filter(b => b.vol !== book.vol).concat(book).sort((a, b) => a.vol - b.vol);
      const start = book.chapterStart || 1;
      book.chapters.forEach((c, ci) => { c.n = start + ci; c.book = book; c.lessons.forEach(l => { l.chapter = c; l.grade = g; l.book = book; lessons[l.id] = l; }); });
      // dạng bài lý thuyết cho từng chủ đề (một dạng / chủ đề, lấy câu từ mọi bài của chủ đề)
      this.all(g, book.vol).forEach(l => {
        if (!MA.Data.topic(l.topic)) return;
        if (!byTopic[l.topic]) { const ls = byTopic[l.topic] = []; MA.Data.extend(l.topic, [{ level: 1, name: GEN, theory: true, fn() { return MA.Theory.make(pick(ls)); } }]); }
        if (!byTopic[l.topic].includes(l)) byTopic[l.topic].push(l);
      });
    },
    books(g) { return books[g] || []; },
    book(g, vol) { const bs = books[g] || []; return bs.find(b => b.vol === +vol) || bs[0]; },
    grades() { return Object.keys(books).map(Number).sort((a, b) => a - b); },
    lesson(id) { return lessons[id]; },
    all(g, vol) { return (books[g] || []).filter(b => !vol || b.vol === +vol).reduce((a, b) => a.concat(b.chapters.reduce((x, c) => x.concat(c.lessons), [])), []); },
    ofTopic(tid) { return Object.values(lessons).filter(l => l.topic === tid).sort((a, b) => a.no - b.no); },
    count(l) { return (l.tf || []).length + (l.mc || []).length; },
    where(l) { return `Bài ${l.no}. ${l.title}` + (l.page ? ` (SGK ${l.book.short || ''}trang ${l.page})` : ''); },
    // Một câu hỏi lý thuyết (k: chỉ số trong danh sách tf + mc của bài)
    make(l, k) {
      const tf = l.tf || [], mc = l.mc || [];
      if (k == null) k = R(0, tf.length + mc.length - 1);
      const hint = `Xem lại phần “Cần nhớ” của ${this.where(l)}.`;
      let q;
      if (k < tf.length) {
        const [s, ok, why] = tf[k];
        q = Q({ text: `Đúng hay sai?<br><b>${s}</b>`, answer: ok ? 'Đúng' : 'Sai', options: ['Đúng', 'Sai'], shuffle: false, hint, steps: [`Khẳng định <b>${ok ? 'đúng' : 'sai'}</b>.${why ? ' ' + why : ''}`] });
      } else {
        const [text, ans, wrongs, why] = mc[k - tf.length];
        q = Q({ text, answer: ans, options: [ans].concat(wrongs), hint, steps: [`Đáp án: <b>${ans}</b>.${why ? ' ' + why : ''}`] });
      }
      return Object.assign(q, { keepMc: true, level: 1, topicId: l.topic, genName: GEN, theory: l.id, kicker: `Bài ${l.no}. ${l.title}` });
    },
    // Bộ n câu từ nhiều bài: xoay vòng các bài để phủ đều, không trùng câu
    set(ls, n) {
      const pools = shuffle(ls).map(l => ({ l, ks: shuffle([...Array(this.count(l)).keys()]) })).filter(p => p.ks.length);
      const out = []; let i = 0;
      while (out.length < n && pools.some(p => p.ks.length)) { const p = pools[i++ % pools.length]; if (p.ks.length) out.push(this.make(p.l, p.ks.pop())); }
      return out;
    }
  };
})(window.MA);
