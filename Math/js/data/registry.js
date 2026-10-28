/* =========================================================
 * registry.js — Kho kiến thức & bộ câu hỏi theo lớp.
 * Mỗi file gradeN.js gọi MA.Data.addGrade({...}) để đăng ký nội dung.
 *
 * Cấu trúc một chủ đề (topic):
 * {
 *   id, title, icon, tagline, summary,
 *   prereqs: ['id chủ đề cũ cần ôn lại'],
 *   rules: [{ title, desc, formula, example, tip, visual }],
 *   poem: ['câu thơ ghi nhớ'],
 *   pitfalls: [{ wrong, right, why }],
 *   examples: [{ q, steps: [], visual }],      // ví dụ mẫu có lời giải từng bước
 *   gens: [{ level: 1|2|3, name, fn: () => MA.U.Q({...}) }]  // bộ sinh câu hỏi vô hạn
 * }
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const LEVELS = { 1: 'Cơ bản', 2: 'Vận dụng', 3: 'Nâng cao' };
  const grades = {};
  const topicIndex = {};

  MA.Data = {
    LEVELS,
    addGrade(def) {
      grades[def.grade] = def;
      def.topics.forEach((t, i) => { t.grade = def.grade; t.order = i + 1; topicIndex[t.id] = t; });
    },
    // Bổ sung dạng bài cho chủ đề đã có: MA.Data.extend('g2_add', [{level, name, fn}, ...])
    extend(topicId, gens) {
      const t = topicIndex[topicId]; if (!t) { console.warn('Không có chủ đề', topicId); return; }
      t.gens = t.gens.concat(gens).sort((a, b) => a.level - b.level);
    },
    // Thêm chủ đề mới vào một lớp đã đăng ký
    addTopics(grade, topics) {
      const def = grades[grade]; if (!def) return;
      topics.forEach(t => { t.grade = grade; def.topics.push(t); t.order = def.topics.length; topicIndex[t.id] = t; });
    },
    // Sắp xếp lại thứ tự chủ đề theo trình tự học (và cập nhật mô tả lớp).
    // ids: mảng id phẳng, HOẶC mảng các cột [[id, id], [id], …] = các bước trên bản đồ
    // (theo thời gian trong năm học); stepLabels: nhãn từng cột, vd 'Đầu HK1'.
    arrange(grade, ids, desc, stepLabels) {
      const def = grades[grade]; if (!def) return;
      const nested = ids.some(Array.isArray);
      const flat = nested ? ids.reduce((a, c) => a.concat(c), []) : ids;   // không dùng .flat() để chạy cả trình duyệt cũ
      def.topics.sort((a, b) => (flat.indexOf(a.id) + 1 || 99) - (flat.indexOf(b.id) + 1 || 99));
      def.topics.forEach((t, i) => { t.order = i + 1; delete t.step; });
      if (nested) {
        ids.forEach((col, ci) => [].concat(col).forEach(id => { const t = topicIndex[id]; if (t && t.grade === grade) t.step = ci; }));
        // chủ đề không có trong danh sách (vd. chủ đề mới thêm) → cột cuối
        def.topics.forEach(t => { if (t.step == null) t.step = ids.length - 1; });
        def.stepLabels = stepLabels || null;
      } else def.stepLabels = null;
      if (desc) def.desc = desc;
    },
    grade(g) { return grades[g]; },
    grades() { return [1, 2, 3, 4, 5, 6].map(g => grades[g] || { grade: g, name: 'Lớp ' + g, topics: [], soon: true }); },
    topic(id) { return topicIndex[id]; },
    allTopics(g) { return (grades[g] && grades[g].topics) || []; },
    // Danh sách chủ đề học sinh được thấy (đã lọc chủ đề bị quản trị ẩn)
    // (chủ đề có t.track — vd. 'timo' — thuộc khu riêng, không hiện trong bản đồ / danh sách SGK)
    topics(g) { return this.allTopics(g).filter(t => !t.track && (!MA.Content || MA.Content.topicVisible(t))); },
    // Chủ đề của một khu riêng (vd. MA.Data.track('timo', 2))
    track(name, g) { return this.allTopics(g).filter(t => t.track === name && (!MA.Content || MA.Content.topicVisible(t))); },

    // Tạo 1 câu hỏi cho chủ đề ở mức độ (nếu không có đúng mức thì lấy mức gần nhất)
    make(topicId, level, genIndex, opts = {}) {
      const t = topicIndex[topicId]; if (!t || !t.gens || !t.gens.length) return null;
      // chỉ dùng các dạng bài tài khoản hiện tại được phép (VIP)
      const allowed = t.gens.filter(g => (!MA.Content || MA.Content.genAllowed(t, g)) && !(opts.paper && g.interactive));   // phiếu in: bỏ câu tương tác
      if (!allowed.length) return null;
      let pool = genIndex != null && t.gens[genIndex] ? [t.gens[genIndex]].filter(g => allowed.includes(g)) : allowed.filter(g => !level || g.level === level);
      if (!pool.length) {
        const lv = allowed.map(g => g.level).sort((a, b) => Math.abs(a - level) - Math.abs(b - level))[0];
        pool = allowed.filter(g => g.level === lv);
      }
      const gen = MA.Tutor ? MA.Tutor.pickGen(t, pool) : MA.U.pick(pool);
      for (let tries = 0; tries < 5; tries++) {
        try {
          const q = gen.fn();
          q.topicId = t.id; q.level = q.level || gen.level; q.genName = gen.name; q.topicTitle = t.title;
          return MA.Tutor ? MA.Tutor.toTyped(q) : q;
        } catch (e) { console.error('Lỗi sinh câu hỏi', t.id, gen.name, e); }
      }
      return null;
    },
    // Tạo bộ câu hỏi: topics = mảng id, level = 0 (trộn) | 1 | 2 | 3
    makeSet(topicIds, n, level, opts = {}) {
      const out = []; const seen = new Set(); let guard = 0;
      const order = MA.U.shuffle(topicIds);
      while (out.length < n && guard++ < n * 20) {
        // xoay vòng các chủ đề để bộ đề phủ đều kiến thức
        const id = order[guard % order.length];
        let lv = level;
        if (!lv) lv = opts.progressive ? (out.length < n * 0.4 ? 1 : out.length < n * 0.8 ? 2 : 3) : MA.U.pick([1, 1, 2, 2, 3]);
        const q = this.make(id, lv, null, opts); if (!q) continue;
        const key = q.text + '|' + (q.options || []).join();
        if (seen.has(key)) continue; seen.add(key); out.push(q);
      }
      if (opts.progressive) out.sort((a, b) => a.level - b.level);
      return out;
    }
  };
})(window.MA);
