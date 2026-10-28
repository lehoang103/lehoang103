/* =========================================================
 * content.js — QUẢN LÝ NỘI DUNG & PHÂN QUYỀN VIP
 *  • Ẩn chủ đề, đặt chủ đề / dạng bài / loại đề chỉ dành cho VIP
 *  • Ngân hàng câu hỏi do thầy cô biên soạn (thêm, sửa, xóa)
 *  • Đề thi / bài tập do thầy cô biên soạn (có thể chỉ dành cho VIP)
 * Dữ liệu gốc: js/config/content-config.js (dùng chung mọi máy).
 * Khi quản trị chỉnh sửa: lưu tạm trên máy quản trị (khóa 'content'),
 * rồi “Tải file content-config.js” để phát hành cho mọi học sinh.
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const S = MA.Store, { esc, Q, pick } = MA.U;
  const DEF = { version: 1, hiddenTopics: [], vipTopics: [], vipGens: [], vipExams: ['hsg'], vipLevel3: false, customQuestions: [], customExams: [], classes: [], assignments: [], bots: [] };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let state = null;

  // Định dạng đơn giản cho câu hỏi tự soạn: **đậm**, a^2 (mũ), [3/4] (phân số), xuống dòng
  function rich(s) {
    return esc(s || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[(-?\d+)\/(\d+)\]/g, (m, a, b) => MA.U.frac(a, b))
      .replace(/\^(\d+)/g, '<sup>$1</sup>').replace(/\n/g, '<br>');
  }

  const Content = {
    rich,
    get() {
      if (!state) { const local = S.get('content'); state = Object.assign(clone(DEF), clone(MA.ContentConfig || {}), local || {}); state.localEdited = !!local; }
      return state;
    },
    save() { const s = this.get(); s.updated = Date.now(); s.localEdited = true; const copy = clone(s); delete copy.localEdited; S.set('content', copy); this.apply(); },
    reload() { state = null; this.apply(); },
    resetToFile() {
      // đang nối máy chủ: phát hành lại nội dung gốc trong file cho mọi máy
      if (MA.Sync && MA.Sync.isAdminLinked()) { state = null; S.set('content', Object.assign(clone(DEF), clone(MA.ContentConfig || {}))); state = null; return this.apply(); }
      S.remove('content'); state = null; this.apply();
    },
    fileText() {
      const c = clone(this.get()); delete c.localEdited;
      return `/* content-config.js — xuất từ Admin Board ngày ${new Date().toLocaleString('vi-VN')}.\n * Chép đè file js/config/content-config.js trên website bằng file này. */\nwindow.MA = window.MA || {};\nMA.ContentConfig = ${JSON.stringify(c, null, 1)};\n`;
    },

    // ---------- Quyền truy cập ----------
    admin() { return MA.Account && MA.Account.isAdmin(); },
    vip() { return MA.Account && MA.Account.isVip(); },
    genKey(t, g) { return t.id + '::' + g.name; },
    topicVisible(t) { return this.admin() || !this.get().hiddenTopics.includes(t.id); },
    topicVip(t) { return this.get().vipTopics.includes(t.id); },
    topicLocked(t) { return this.topicVip(t) && !this.vip(); },
    genVip(t, g) { const s = this.get(); return !!g.vip || s.vipGens.includes(this.genKey(t, g)) || (s.vipLevel3 && g.level === 3) || this.topicVip(t); },
    genAllowed(t, g) { return !this.genVip(t, g) || this.vip(); },
    examVip(id) { return this.get().vipExams.includes(id); },
    examLocked(id) { return this.examVip(id) && !this.vip(); },
    toggle(list, key, on) { const s = this.get(); const i = s[list].indexOf(key); if (on && i < 0) s[list].push(key); if (!on && i >= 0) s[list].splice(i, 1); this.save(); },

    // ---------- Câu hỏi tự soạn ----------
    toQuestion(cq) {
      const steps = (cq.steps || '').split('\n').map(x => x.trim()).filter(Boolean).map(rich);
      const base = { text: rich(cq.text), hint: rich(cq.hint || ''), steps: steps.length ? steps : ['Đáp án: <b>' + esc(cq.type === 'mc' ? cq.options[cq.correct] : cq.answer) + '</b>.'], custom: true, cqId: cq.id };
      if (cq.type === 'mc') { const opts = cq.options.filter(o => o !== ''); return Q(Object.assign(base, { options: opts.map(rich), answer: rich(cq.options[cq.correct]) })); }
      const num = MA.U.parseNum(cq.answer);
      return Q(Object.assign(base, { answer: isNaN(num) ? cq.answer : cq.answer, accept: (cq.accept || '').split(';').map(x => x.trim()).filter(Boolean), unit: cq.unit || '', textOnly: isNaN(num), answerText: cq.answer }));
    },
    upsertQuestion(cq) { const s = this.get(); if (!cq.id) { cq.id = 'cq' + Date.now().toString(36); cq.created = Date.now(); s.customQuestions.push(cq); } else { const i = s.customQuestions.findIndex(x => x.id === cq.id); if (i >= 0) s.customQuestions[i] = cq; else s.customQuestions.push(cq); } this.save(); return cq; },
    removeQuestion(id) { const s = this.get(); s.customQuestions = s.customQuestions.filter(x => x.id !== id); this.save(); },

    // ---------- Đề thi tự soạn ----------
    upsertExam(ex) { const s = this.get(); if (!ex.id) { ex.id = 'ex' + Date.now().toString(36); ex.created = Date.now(); s.customExams.push(ex); } else { const i = s.customExams.findIndex(x => x.id === ex.id); if (i >= 0) s.customExams[i] = ex; } this.save(); return ex; },
    removeExam(id) { const s = this.get(); s.customExams = s.customExams.filter(x => x.id !== id); this.save(); },
    examsFor(grade) { return this.get().customExams.filter(e => +e.grade === +grade); },
    buildExam(ex) {
      const all = this.get().customQuestions.filter(q => ex.topicIds.includes(q.topicId) && (this.vip() || !q.vip || ex.vip));
      if (ex.source === 'custom') return MA.U.shuffle(all).slice(0, ex.n).map(cq => this.wrap(cq));
      const qs = ex.level ? MA.Data.makeSet(ex.topicIds, ex.n, +ex.level) : MA.Data.makeSet(ex.topicIds, ex.n, 0, { progressive: true });
      return qs;
    },
    wrap(cq) { const t = MA.Data.topic(cq.topicId); const q = this.toQuestion(cq); q.topicId = cq.topicId; q.level = +cq.level || 1; q.topicTitle = t ? t.title : ''; return q; },

    // ---------- Lớp học & bài tập về nhà (thầy cô giao) ----------
    // Mã lớp chỉ lưu dạng mã băm ở phía học sinh (máy chủ không gửi mã gốc cho học sinh).
    codeHash(code) { return MA.U.hash('toanvui-class|' + String(code || '').trim().toUpperCase()); },
    newCode() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; },
    classes() { return this.get().classes || []; },
    classById(id) { return this.classes().find(c => c.id === id) || null; },
    classByCode(code) { const h = this.codeHash(code); return this.classes().find(c => c.codeHash === h) || null; },
    upsertClass(c) { const s = this.get(); s.classes = s.classes || []; if (!c.id) { c.id = 'cl' + Date.now().toString(36); c.created = Date.now(); c.code = c.code || this.newCode(); s.classes.push(c); } else { const i = s.classes.findIndex(x => x.id === c.id); if (i >= 0) s.classes[i] = c; } c.codeHash = this.codeHash(c.code); this.save(); return c; },
    removeClass(id) { const s = this.get(); s.classes = (s.classes || []).filter(c => c.id !== id); s.assignments = (s.assignments || []).filter(a => a.classId !== id); this.save(); },
    assignments(classId) { return (this.get().assignments || []).filter(a => !classId || a.classId === classId).sort((a, b) => (b.created || 0) - (a.created || 0)); },
    upsertAssignment(a) { const s = this.get(); s.assignments = s.assignments || []; if (!a.id) { a.id = 'hw' + Date.now().toString(36); a.created = Date.now(); s.assignments.push(a); } else { const i = s.assignments.findIndex(x => x.id === a.id); if (i >= 0) s.assignments[i] = a; } this.save(); return a; },
    removeAssignment(id) { const s = this.get(); s.assignments = (s.assignments || []).filter(a => a.id !== id); this.save(); },
    // bài tập đang mở của học sinh (theo lớp đã tham gia)
    homework(acc, u) { if (!acc || !acc.classId) return []; const today = MA.U.today(); return this.assignments(acc.classId).filter(a => !a.due || a.due >= today).map(a => Object.assign({ done: u && u.hw && u.hw[a.id] }, a)); },

    // Gắn câu hỏi tự soạn vào bộ sinh câu hỏi của từng chủ đề
    apply() {
      if (!MA.Data) return;
      const s = this.get();
      [1, 2, 3, 4, 5, 6].forEach(g => MA.Data.allTopics(g).forEach(t => { t.gens = t.gens.filter(x => !x.custom); }));
      const groups = {};
      s.customQuestions.forEach(cq => { const k = cq.topicId + '|' + (+cq.level || 1) + '|' + (cq.vip ? 1 : 0); (groups[k] = groups[k] || []).push(cq); });
      Object.keys(groups).forEach(k => {
        const [tid, lv, vip] = k.split('|'); const list = groups[k];
        if (!MA.Data.topic(tid)) return;
        MA.Data.extend(tid, [{ level: +lv, custom: true, vip: vip === '1', name: (vip === '1' ? '👑 Câu hỏi VIP của thầy cô' : '✍️ Câu hỏi của thầy cô') + (+lv > 1 ? ` (mức ${lv})` : ''), fn: () => Content.toQuestion(pick(list)) }]);
      });
    }
  };

  MA.Content = Content;
})(window.MA);
