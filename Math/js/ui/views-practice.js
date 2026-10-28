/* =========================================================
 * ui/views-practice.js — LUYỆN TẬP · ÔN TẬP · KIỂM TRA
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI;
  const levelNames = { 1: 'Cơ bản', 2: 'Vận dụng', 3: 'Nâng cao' };
  const availableGens = (t) => (t.gens || []).filter(gen => !MA.Content || MA.Content.genAllowed(t, gen));
  const hasLevel = (t, level) => availableGens(t).some(gen => gen.level === level);
  const topicGroup = (t) => {
    const g = MA.Data.grade(t.grade);
    return g && t.step != null && g.stepLabels && g.stepLabels[t.step] ? g.stepLabels[t.step] : 'Chủ đề';
  };
  const coverageTable = (ids, counts) => {
    const topics = ids.map(MA.Data.topic).filter(Boolean);
    const genStats = (t) => [1, 2, 3].map(l => availableGens(t).filter(gen => gen.level === l).length);
    const qCounts = counts || {};
    return `<p class="muted small">Số dạng bài có thể ra ở mỗi mức${counts ? '; số trong ngoặc là số câu trong đề vừa tạo' : ''}.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Chủ đề / giai đoạn</th><th>Dạng cơ bản</th><th>Dạng vận dụng</th><th>Dạng nâng cao</th>${counts ? '<th>Số câu</th>' : ''}</tr></thead><tbody>${topics.map(t => {
      const a = genStats(t), q = qCounts[t.id] || {};
      return `<tr><td>${t.icon} ${esc(t.title)}<small class="muted" style="display:block">${esc(topicGroup(t))}</small></td>${a.map((n, i) => `<td>${n}${counts ? ` <small class="muted">(${q[i + 1] || 0} câu)</small>` : ''}</td>`).join('')}${counts ? `<td><b>${q.total || 0}</b></td>` : ''}</tr>`;
    }).join('')}</tbody></table></div>`;
  };
  const questionCounts = (qs) => {
    const byTopic = {}, byLevel = { 1: 0, 2: 0, 3: 0 };
    qs.forEach(q => {
      const t = q.topicId || ''; const l = q.level || 1;
      byTopic[t] = byTopic[t] || { 1: 0, 2: 0, 3: 0, total: 0 };
      byTopic[t][l] = (byTopic[t][l] || 0) + 1; byTopic[t].total++;
      byLevel[l] = (byLevel[l] || 0) + 1;
    });
    return { byTopic, byLevel };
  };
  const makeExamSet = (ids, count, level) => level
    ? MA.Data.makeSet(ids, count, level)
    : MA.Data.makeSet(ids, count, 0, { progressive: true });
  const phaseTopics = (g, topics, phase) => {
    const labels = g.stepLabels || [];
    const steps = topics.map(t => t.step).filter(x => x != null);
    if (!steps.length) return topics;
    const first = Math.min.apply(null, steps), last = Math.max.apply(null, steps);
    const labelIndex = (needle) => labels.findIndex(x => String(x).toUpperCase().indexOf(needle) >= 0);
    const end1 = labelIndex('CUỐI HK1') >= 0 ? labelIndex('CUỐI HK1') : (labelIndex('HK2') >= 0 ? labelIndex('HK2') - 1 : Math.ceil((last + first) / 2));
    const start2 = labelIndex('HK2') >= 0 ? labelIndex('HK2') : Math.floor((last + first) / 2) + 1;
    const end2 = labelIndex('CUỐI HK2') >= 0 ? labelIndex('CUỐI HK2') : last;
    const inSteps = (from, to) => topics.filter(t => t.step != null && t.step >= from && t.step <= to);
    const firstHalf = (from, to) => {
      const available = topics.filter(t => t.step != null && t.step >= from && t.step <= to);
      const phaseSteps = Array.from(new Set(available.map(t => t.step))).sort((a, b) => a - b);
      if (!phaseSteps.length) return [];
      const cutoff = phaseSteps[Math.ceil(phaseSteps.length / 2) - 1];
      return available.filter(t => t.step <= cutoff);
    };
    if (phase === 'mid1') return firstHalf(first, Math.max(first, end1));
    if (phase === 'end1') return inSteps(first, Math.max(first, end1));
    if (phase === 'mid2') return firstHalf(Math.min(start2, last), Math.max(start2, end2));
    if (phase === 'end2') return inSteps(Math.min(start2, last), Math.max(start2, end2));
    return topics;
  };

  // ---------- Thuật toán "ôn tập thông minh" (lặp lại ngắt quãng) ----------
  // Ưu tiên bài: mức thành thạo thấp + lâu ngày chưa luyện
  MA.Review = {
    dueTopics(grade, n = 3) {
      return MA.Data.topics(grade).map(t => { const p = MA.User.topic(t.id); const days = p.last ? (Date.now() - p.last) / 864e5 : 0; return { t, m: p.m, last: p.last, n: p.n, score: (100 - p.m) + Math.min(days, 30) * 6 }; })
        .filter(x => x.n > 0 && (x.m < 85 || (Date.now() - x.last) / 864e5 > 3)).sort((a, b) => b.score - a.score).slice(0, n);
    }
  };

  // ------------------------------ LUYỆN TẬP ------------------------------
  MA.Views.practice = {
    render(app, params) {
      const u = MA.User.current; const topics = MA.Data.topics(u.grade);
      if (params[0]) {
        const t = MA.Data.topic(params[0]);
        if (t) {
          const gen = params[1] != null && params[1] !== '' ? +params[1] : null;
          if (MA.Content.topicLocked(t) || (gen != null && t.gens[gen] && !MA.Content.genAllowed(t, t.gens[gen]))) { UI.vipModal(`“${t.title}${gen != null && t.gens[gen] ? ' · ' + t.gens[gen].name : ''}” chỉ dành cho tài khoản VIP.`); return UI.go('learn/' + t.id); }
          return this.run(app, { topics: [t.id], level: 0, count: 10, gen });
        }
      }
      let sel = new Set(topics.filter(t => !MA.Content.topicLocked(t)).map(t => t.id)), level = 0, count = 10, speed = false;
      app.innerHTML = `<div class="page-head"><h1>✏️ Luyện tập</h1><p class="muted">Bộ câu hỏi được tạo mới mỗi lần — luyện bao nhiêu cũng không hết! Chế độ <b>Thích ứng</b> tự tăng độ khó khi con làm đúng liên tiếp.</p></div>
        <div class="card setup">
          <div class="fld"><span>1. Chọn chủ đề <button class="link" id="selAll">Chọn tất cả</button> · <button class="link" id="selNone">Bỏ chọn</button></span>
            <div class="chips" id="pTopics">${topics.map(t => MA.Content.topicLocked(t) ? `<button class="chip locked" data-lock="1">🔒 ${t.icon} ${t.title}<small>VIP</small></button>` : `<button class="chip on" data-id="${t.id}">${t.icon} ${t.title}<small>${MA.User.topic(t.id).m}%</small></button>`).join('')}</div></div>
          <div class="fld"><span>2. Mức độ</span><div class="seg" id="pLevel">${[[0, '🧭 Thích ứng'], [1, '🟢 Cơ bản'], [2, '🟡 Vận dụng'], [3, '🔴 Nâng cao'], [4, '🎲 Trộn']].map(([v, l]) => `<button data-v="${v}" class="${v === 0 ? 'on' : ''}">${l}</button>`).join('')}</div></div>
          <div class="fld"><span>3. Số câu</span><div class="seg" id="pCount">${[5, 10, 15, 20].map(v => `<button data-v="${v}" class="${v === 10 ? 'on' : ''}">${v} câu</button>`).join('')}</div></div>
          <div class="fld"><span>4. Chế độ</span><div class="seg" id="pMode"><button data-v="0" class="on">🐢 Thong thả</button><button data-v="1">⚡ Tốc độ (30 giây/câu, thưởng XP)</button></div></div>
          <div class="card soft" id="pCoverage"></div>
          <button class="btn big block" id="pGo">Bắt đầu luyện tập 🚀</button>
        </div>
        <p class="muted small center">🖨️ Muốn làm trên giấy? <a href="#/worksheet">Tạo phiếu bài tập in A4</a></p>`;
      const seg = (id, fn) => $$('#' + id + ' button', app).forEach(b => b.onclick = () => { $$('#' + id + ' button', app).forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.v); });
      const updateCoverage = () => {
        const ids = [...sel], levels = level === 0 ? 'Thích ứng · ưu tiên bài cần ôn và điều chỉnh theo kết quả' : level === 4 ? 'Trộn ngẫu nhiên các mức' : levelNames[level];
        $('#pCoverage', app).innerHTML = `<h3>📊 Nội dung bộ luyện tập</h3><p>${ids.length} chủ đề được chọn · ${count} câu · ${esc(levels)}${level === 0 || level === 4 ? '' : ` · ${count} câu mức ${levelNames[level]}`}</p>${ids.length ? coverageTable(ids) : '<p class="muted">Chưa chọn chủ đề.</p>'}`;
      };
      seg('pLevel', v => { level = v; updateCoverage(); }); seg('pCount', v => { count = v; updateCoverage(); }); seg('pMode', v => speed = !!v);
      $$('#pTopics [data-lock]', app).forEach(c => c.onclick = () => UI.vipModal('Chủ đề này chỉ dành cho tài khoản VIP.'));
      $$('#pTopics .chip[data-id]', app).forEach(c => c.onclick = () => { c.classList.toggle('on'); sel[c.classList.contains('on') ? 'add' : 'delete'](c.dataset.id); updateCoverage(); });
      $('#selAll', app).onclick = () => { $$('#pTopics .chip[data-id]', app).forEach(c => { c.classList.add('on'); sel.add(c.dataset.id); }); updateCoverage(); };
      $('#selNone', app).onclick = () => { $$('#pTopics .chip[data-id]', app).forEach(c => c.classList.remove('on')); sel.clear(); updateCoverage(); };
      $('#pGo', app).onclick = () => {
        if (!sel.size) return UI.toast('Con hãy chọn ít nhất một chủ đề nhé!', 'bad');
        if (level >= 1 && level <= 3) {
          const missing = [...sel].map(MA.Data.topic).filter(t => t && !hasLevel(t, level));
          if (missing.length) return UI.toast(`Không có dạng ${levelNames[level]} trong: ${missing.slice(0, 2).map(t => t.title).join(', ')}${missing.length > 2 ? '…' : ''}. Hãy bỏ chọn chủ đề đó hoặc chọn mức khác.`, 'bad');
        }
        this.run(app, { topics: [...sel], level, count, speed });
      };
      updateCoverage();
    },
    run(app, o) {
      const ids = o.topics; const one = ids.length === 1 ? MA.Data.topic(ids[0]) : null;
      const warm = [];
      if (one && UI.settings.warmup && o.gen == null && one.prereqs && one.prereqs.length) {
        MA.Data.makeSet(one.prereqs.filter(MA.Data.topic), 2, 1).forEach(q => { q.warm = true; warm.push(q); });
      }
      const order = MA.U.shuffle(ids); const seen = new Set();
      const next = (i) => {
        if (i < warm.length) return warm[i];
        const id = order[i % order.length];
        const lv = o.level === 0 ? MA.User.topic(id).lv || 1 : o.level === 4 ? MA.U.pick([1, 2, 3]) : o.level;
        let q, tries = 0;
        do { q = MA.Data.make(id, lv, o.gen); tries++; } while (q && seen.has(q.text) && tries < 6);
        if (q) seen.add(q.text);
        return q;
      };
      MA.Quiz.start(app, {
        kind: 'practice', kicker: o.speed ? '⚡ Luyện tốc độ' : (o.level === 0 ? '🧭 Luyện tập thích ứng' : '✏️ Luyện tập · ' + (MA.Data.LEVELS[o.level] || 'Trộn mức độ')),
        title: one ? `${one.icon} ${one.title}${o.gen != null ? ' · ' + one.gens[o.gen].name : ''}` : `Luyện tập ${ids.length} chủ đề`,
        count: o.count + warm.length, next, speed: o.speed, back: 'practice', restart: () => this.run(app, o)
      });
    }
  };

  // ------------------------------ ÔN TẬP ------------------------------
  MA.Views.review = {
    render(app, params) {
      const mode = params[0]; const u = MA.User.current; const g = MA.Data.grade(u.grade);
      if (mode === 'smart') return this.smart(app);
      if (mode === 'mission') return this.mission(app);
      if (mode === 'placement') return this.placement(app);
      if (mode === 'hw') return this.hw(app, params[1]);
      if (mode === 'daily') return this.daily(app);
      if (mode === 'mistakes') return this.mistakes(app);
      if (mode === 'flags') return this.flags(app);
      if (mode === 'cards') return this.cards(app, +params[1] || u.grade);
      if (mode === 'lower') return this.lower(app, +params[1]);
      const due = MA.Review.dueTopics(u.grade, 5); const mist = MA.User.mistakes(u.grade).length;
      app.innerHTML = `<div class="page-head"><h1>🔁 Ôn tập – ${g.name}</h1><p class="muted">“Học đi đôi với hành, ôn cũ để biết mới.” Chọn cách ôn phù hợp nhé!</p></div>
        <div class="grid2">
          <a class="card mode" href="#/practice"><span class="m-ic">🎯</span><h3>Ôn luyện theo nội dung</h3><p>Tự chọn chủ đề, mức cơ bản – vận dụng – nâng cao và số câu; xem trước ngân hàng dạng bài trước khi luyện.</p></a>
          <a class="card mode" href="#/review/smart"><span class="m-ic">🧠</span><h3>Ôn tập thông minh</h3><p>Tự chọn những bài con sắp quên hoặc còn hay sai để ôn lại.</p>${due.length ? `<div class="chips">${due.map(d => `<span class="chip">${d.t.icon} ${d.t.title} · ${d.m}%</span>`).join('')}</div>` : '<small class="muted">Luyện tập vài bài để hệ thống biết con cần ôn gì.</small>'}</a>
          <a class="card mode" href="#/review/daily"><span class="m-ic">🌟</span><h3>Thử thách hằng ngày</h3><p>10 câu trộn tất cả chủ đề, dễ đến khó. Mỗi ngày một đề mới, thưởng +50 XP.</p>${MA.User.dailyDone() ? '<span class="tag good">✔ Hôm nay đã làm</span>' : '<span class="tag new">Chưa làm hôm nay</span>'}</a>
          <a class="card mode" href="#/review/mistakes"><span class="m-ic">📒</span><h3>Sổ lỗi sai</h3><p>Làm lại những câu đã sai. Đúng thì câu được xóa khỏi sổ và cộng XP.</p><span class="tag ${mist ? 'warn' : 'good'}">${mist} câu cần sửa</span></a>
          <a class="card mode" href="#/review/flags"><span class="m-ic">🚩</span><h3>Cờ của con</h3><p>Những câu con gắn cờ “khó”, gom theo dạng bài để xem lại. VIP: luyện bổ trợ trọng tâm đúng dạng đó.</p><span class="tag ${MA.User.flags(u.grade).length ? 'warn' : 'good'}">${MA.User.flags(u.grade).length} câu đã gắn cờ</span></a>
          <a class="card mode" href="#/review/cards"><span class="m-ic">🃏</span><h3>Thẻ ghi nhớ công thức</h3><p>Lật thẻ để ôn nhanh quy tắc, công thức, mẹo của từng chủ đề.</p></a>
        </div>
        ${u.grade > 1 ? `<div class="card soft"><h3>🔙 Ôn kiến thức lớp dưới</h3><p class="muted">Làm 10 câu cơ bản – vận dụng của lớp dưới để củng cố nền tảng.</p><div class="btn-row">${MA.Data.grades().filter(x => x.grade < u.grade && x.topics.length).map(x => `<a class="btn ghost" href="#/review/lower/${x.grade}">${x.emoji} Ôn ${x.name}</a>`).join('')}</div></div>` : ''}
        <div class="card"><h3>📈 Mức thành thạo các chủ đề</h3><div class="mastery-list">${MA.Data.topics(g.grade).map(t => { const p = MA.User.topic(t.id); return `<a href="#/learn/${t.id}" class="ml-row"><span>${t.icon} ${t.title}</span>${UI.masteryBar(p.m)}<b>${p.m}%</b><small>${UI.ago(p.last)}</small></a>`; }).join('')}</div></div>`;
    },
    // ---------- Nhiệm vụ hôm nay: ôn đến hạn + sửa lỗi + bài mới (~15 phút) ----------
    mission(app) {
      const u = MA.User.current; const g = MA.Data.grade(u.grade); const T = MA.Tutor;
      const p = T.missionPlan(u); const done = T.missionDone(u);
      app.innerHTML = `<div class="card narrow mission-intro"><h1>🎯 Nhiệm vụ hôm nay</h1><p class="muted">${g.name} · khoảng 15 phút · ${done ? '✔ hôm nay con đã hoàn thành, làm thêm vẫn được luyện tập' : 'hoàn thành được thưởng <b>+30 XP</b>'}</p>
        <ol class="mission-steps">
          <li class="${p.due.length ? '' : 'skip'}"><b>🔁 Ôn đến hạn</b><span>${p.due.length ? `${p.due.length} dạng bài con sắp quên` : 'Hôm nay chưa có bài đến hạn ôn'}</span></li>
          <li class="${p.mist.length ? '' : 'skip'}"><b>📒 Sửa lỗi sai</b><span>${p.mist.length ? `${p.mist.length} câu làm sai gần đây` : 'Không có lỗi sai cần sửa 🎉'}</span></li>
          <li><b>✨ Học tiếp</b><span>${p.topic ? `${p.topic.icon} ${esc(p.topic.title)}` : '—'}</span></li>
        </ol>
        <div class="btn-row">${p.topic && !p.learned ? `<a class="btn big ghost" href="#/learn/${p.topic.id}">📖 Đọc bài mới trước</a>` : ''}<button class="btn big" id="msGo">Bắt đầu ▶</button></div></div>`;
      $('#msGo', app).onclick = () => {
        const { questions } = T.missionQuestions(u);
        if (!questions.length) return UI.toast('Chưa tạo được nhiệm vụ, con hãy luyện tập tự do nhé!', 'bad');
        MA.Quiz.start(app, { kind: 'mission', kicker: '🎯 Nhiệm vụ hôm nay', title: 'Nhiệm vụ hôm nay – ' + g.name, questions, back: 'home', restart: () => this.mission(app),
          onFinish: (res, score) => {
            const first = !T.missionDone(u); T.finishMission(u, score); MA.User.persist();
            const streak = u.streak && u.streak.days > 1 ? ` Con đã học <b>${u.streak.days} ngày liên tiếp</b> 🔥.` : '';
            return { xp: first ? 30 : 0, html: `<div class="card soft"><h3>🎯 Hoàn thành nhiệm vụ hôm nay!</h3><p>Ngày mai sẽ có nhiệm vụ mới với những bài con cần ôn đúng lúc.${streak}</p></div>` };
          } });
      };
    },
    // ---------- Bài tập về nhà thầy cô giao ----------
    hw(app, id) {
      const u = MA.User.current; const h = MA.Content.assignments().find(x => x.id === id);
      if (!h) { app.innerHTML = '<div class="card">Không tìm thấy bài tập (có thể thầy cô đã xóa).</div>'; return; }
      const ids = h.topicIds.filter(MA.Data.topic); if (!ids.length) { app.innerHTML = '<div class="card">Bài tập chưa có chủ đề hợp lệ.</div>'; return; }
      const run = () => MA.Quiz.start(app, { kind: 'hw', kicker: '📌 Bài tập về nhà', title: h.title, questions: MA.Data.makeSet(ids, h.n || 10, 0, { progressive: true }), back: 'home', restart: run,
        onFinish: (res, score) => { u.hw = u.hw || {}; const old = u.hw[h.id]; if (!old || score > old.score) u.hw[h.id] = { score, right: res.filter(r => r.correct).length, n: res.length, at: Date.now() }; MA.User.persist(); return { html: `<div class="card soft"><h3>📌 Đã nộp bài “${esc(h.title)}”</h3><p>Thầy cô sẽ xem được kết quả của con${old ? ' (lưu điểm cao nhất)' : ''}.</p></div>` }; } });
      run();
    },
    // ---------- Bài kiểm tra đầu vào: 15 câu, xác định chủ đề đã biết ----------
    placement(app) {
      const u = MA.User.current; const g = MA.Data.grade(u.grade);
      app.innerHTML = `<div class="card narrow"><h1>🧭 Bài kiểm tra đầu vào</h1><p>15 câu ngắn về các chủ đề ${g.name}. Không chấm điểm thi đua — chỉ để biết con <b>đã biết gì</b> và nên <b>bắt đầu từ đâu</b>. Câu nào chưa biết thì cứ bỏ qua nhé!</p>
        <div class="btn-row"><button class="btn big" id="plGo">Bắt đầu (khoảng 10 phút)</button><a class="btn big ghost" href="#/home" id="plSkip">Để sau</a></div></div>`;
      $('#plSkip', app).onclick = () => { u.placement = u.placement || {}; u.placement[u.grade] = { at: Date.now(), skipped: true }; MA.User.persist(); };
      $('#plGo', app).onclick = () => MA.Quiz.start(app, { kind: 'placement', kicker: '🧭 Kiểm tra đầu vào', title: 'Kiểm tra đầu vào – ' + g.name, questions: MA.Tutor.placementQuestions(u.grade), back: 'home', restart: () => this.placement(app),
        onFinish: (res) => {
          const known = MA.Tutor.applyPlacement(u, res); MA.User.persist(); const nx = MA.Tutor.nextTopic(u, u.grade);
          return { html: `<div class="card soft"><h3>🧭 Kết quả đầu vào</h3><p>Con đã nắm chắc <b>${known.length}</b> chủ đề${known.length ? ': ' + known.map(id => MA.Data.topic(id)).filter(Boolean).map(t => t.icon + ' ' + esc(t.title)).join(', ') : ''}.</p>${nx ? `<p>👉 Nên bắt đầu học: <b>${nx.icon} ${esc(nx.title)}</b></p><div class="btn-row"><a class="btn" href="#/learn/${nx.id}">📖 Học ngay</a></div>` : ''}</div>` };
        } });
    },
    smart(app) {
      const u = MA.User.current;
      // ưu tiên các dạng bài đến hạn ôn (lặp lại ngắt quãng); thiếu thì lấy chủ đề lâu chưa luyện / còn yếu
      const dueG = MA.Tutor ? MA.Tutor.dueGens(u, u.grade, 10) : [];
      if (dueG.length >= 3) {
        const run2 = () => MA.Quiz.start(app, { kind: 'smart', kicker: '🧠 Ôn tập thông minh', title: `Ôn ${dueG.length} dạng bài đến hạn`, count: Math.max(10, dueG.length), next: (i) => { const d = dueG[i % dueG.length]; return MA.Data.make(d.tid, null, d.gi); }, back: 'review', restart: run2 });
        return run2();
      }
      let due = MA.Review.dueTopics(u.grade, 4);
      if (!due.length) due = MA.U.shuffle(MA.Data.topics(u.grade)).slice(0, 3).map(t => ({ t }));
      const ids = due.map(d => d.t.id);
      const run = () => MA.Quiz.start(app, { kind: 'smart', kicker: '🧠 Ôn tập thông minh', title: 'Ôn: ' + due.map(d => d.t.icon).join(' ') + ' ' + due.map(d => d.t.title).slice(0, 2).join(', ') + (due.length > 2 ? '…' : ''), count: 10, next: (i) => { const id = ids[i % ids.length]; return MA.Data.make(id, Math.max(1, (MA.User.topic(id).lv || 1) - (i < 3 ? 1 : 0))); }, back: 'review', restart: run });
      run();
    },
    daily(app) {
      const u = MA.User.current; const ids = MA.Data.topics(u.grade).map(t => t.id);
      const qs = MA.U.withSeed(MA.U.hashStr(MA.U.today() + '#' + u.grade), () => MA.Data.makeSet(ids, 10, 0, { progressive: true }));
      MA.Quiz.start(app, { kind: 'daily', kicker: '🌟 Thử thách ngày ' + new Date().toLocaleDateString('vi-VN'), title: 'Thử thách hằng ngày – ' + MA.Data.grade(u.grade).name, questions: qs, timeLimit: 15 * 60, back: 'review', restart: () => this.daily(app) });
    },
    mistakes(app) {
      const u = MA.User.current; const list = MA.User.mistakes(u.grade);
      app.innerHTML = `<div class="page-head"><h1>📒 Sổ lỗi sai</h1><p class="muted">Mỗi lỗi sai là một bài học quý! Làm lại đúng thì câu sẽ được xóa khỏi sổ.</p></div>
        ${list.length ? `<div class="btn-row"><button class="btn big" id="mAll">🔄 Làm lại ${Math.min(list.length, 15)} câu</button><button class="btn ghost" id="mClear">🗑️ Xóa hết sổ</button></div>
        <div class="review-list">${list.map((q, i) => `<details class="rv no"><summary><span class="rv-mark">✘</span><span class="rv-q">${q.text}</span><small class="muted">${esc(q.topicTitle || '')} · ${UI.ago(q.at)}</small></summary><div class="rv-body">${MA.Vis.render(q.visual)}${q.type === 'mc' ? `<p>${q.options.map((o, k) => `<span class="chip ${k === q.correct ? 'on' : ''}">${'ABCD'[k]}. ${o}</span>`).join(' ')}</p>` : ''}${MA.Quiz.solutionHTML(q, true)}<button class="btn small ghost" data-del="${i}">Đã hiểu – xóa khỏi sổ</button></div></details>`).join('')}</div>`
        : `<div class="card empty"><div class="big-emoji">🎉</div><h2>Sổ lỗi sai đang trống!</h2><p>Con chưa có câu sai nào ở ${MA.Data.grade(u.grade).name}. Tiếp tục phát huy nhé!</p><a class="btn" href="#/practice">Luyện tập thêm</a></div>`}`;
      if (!list.length) return;
      $('#mAll', app).onclick = () => { const qs = list.slice(0, 15).map(q => JSON.parse(JSON.stringify(q))); MA.Quiz.start(app, { kind: 'mistakes', kicker: '📒 Sửa lỗi sai', title: 'Làm lại câu đã sai', questions: qs, back: 'review/mistakes', restart: () => this.mistakes(app) }); };
      $('#mClear', app).onclick = () => UI.confirm('Xóa toàn bộ sổ lỗi sai của lớp này?', () => { list.forEach(q => MA.User.removeMistake(q)); MA.User.persist(); this.mistakes(app); });
      $$('[data-del]', app).forEach(b => b.onclick = () => { MA.User.removeMistake(list[+b.dataset.del]); MA.User.persist(); this.mistakes(app); });
      $$('.peek', app).forEach(b => b.onclick = () => UI.lessonPeek(b.dataset.peek));
    },
    // ---------- Cờ của con: thống kê câu đã gắn cờ theo dạng bài (mọi tài khoản) + bổ trợ trọng tâm (VIP) ----------
    flags(app) {
      const u = MA.User.current; const vip = MA.Account.isVip(); const C = MA.Coach;
      const f = MA.User.flagStore(); const trialLeft = !vip && !f.trial;
      const groups = MA.User.flagGroups(u.grade);
      if (vip) { groups.forEach(gp => gp.p = C.flagPriority(u, gp)); groups.sort((a, b) => b.p - a.p); } else groups.sort((a, b) => b.n - a.n || b.last - a.last);
      const total = groups.reduce((s, gp) => s + gp.n, 0);
      const ansText = (x) => x.ok === true ? '<span class="tag good">lúc gắn: làm đúng</span>' : x.ok === false ? '<span class="tag warn">lúc gắn: làm sai</span>' : '<span class="tag">lúc gắn: chưa trả lời</span>';
      app.innerHTML = `<nav class="crumbs"><a href="#/review">🔁 Ôn tập</a> › <b>Cờ của con</b></nav>
        <div class="page-head"><h1>🚩 Cờ của con</h1><p class="muted">Gắn cờ những câu con thấy khó (kể cả khi làm đúng) bằng nút 🚩 trên mỗi câu hỏi. Cờ là của riêng con — chỉ con và cha mẹ thấy, không tính điểm, không xếp hạng.</p></div>
        ${!groups.length ? `<div class="card empty"><div class="big-emoji">🚩</div><h2>Chưa có câu nào được gắn cờ</h2><p>Khi làm bài, gặp câu khó hãy bấm nút <b>🚩</b> ở góc câu hỏi. Con cũng có thể gắn cờ các câu sai ở màn kết quả.</p><a class="btn" href="#/practice">Luyện tập ngay</a></div>` : `
        <div class="res-stats flag-stats"><div><b>${total}</b><small>câu đã gắn cờ</small></div><div><b>${groups.length}</b><small>dạng bài</small></div><div><b>${groups.filter(gp => gp.n >= 3).length}</b><small>dạng ≥ 3 cờ</small></div></div>
        ${vip ? '<div class="card soft"><p>👑 <b>VIP:</b> các dạng được xếp theo mức cần luyện (số cờ, độ chính xác, lỗi sai gần đây). Bấm <b>🎯 Luyện bổ trợ</b> để làm 8 câu trọng tâm: ôn nền → làm lại câu đã gắn cờ → câu mới cùng dạng → nâng mức.</p></div>'
          : `<div class="card soft"><p>📋 Con có thể xem lại và làm lại các câu đã gắn cờ. <b>👑 VIP</b> sẽ tự tạo <b>bài tập bổ trợ trọng tâm</b> cho đúng từng dạng con gặp khó.${trialLeft ? ' Con được <b>dùng thử 1 lần</b> miễn phí!' : ''}</p></div>`}
        <div class="flag-list">${groups.map((gp, i) => `<div class="card weak flag-group">
          <div class="weak-h"><span class="tc-icon">${gp.t.icon}</span><div><small>${esc(gp.t.title)}</small><h3>${esc(gp.gname || 'Câu hỏi khác')} ${gp.gi >= 0 ? UI.levelTag(gp.t.gens[gp.gi].level) : ''}</h3>
            <span class="muted small">🚩 ${gp.n} câu · gắn gần nhất ${UI.ago(gp.last)}${vip && gp.acc != null ? ` · đúng ${gp.s.c}/${gp.s.n} lần (${Math.round(gp.acc * 100)}%)` : ''}</span></div>
            <div class="flag-n ${gp.n >= 3 ? 'hot' : ''}">🚩 ${gp.n}</div></div>
          <div class="btn-row">
            ${vip ? `<button class="btn" data-rem="${i}">🎯 Luyện bổ trợ (8 câu)</button>` : trialLeft ? `<button class="btn" data-rem="${i}">🎁 Dùng thử luyện bổ trợ</button>` : `<button class="btn" data-lock="1">🎯 Luyện bổ trợ 👑</button>`}
            ${gp.items.some(x => x.q) ? `<button class="btn ghost" data-redo="${i}">🔁 Làm lại ${gp.items.filter(x => x.q).length} câu đã gắn</button>` : ''}
            <button class="btn ghost" data-peek="${gp.tid}">📖 Xem lại bài</button>${vip ? `<button class="btn ghost" data-clr="${i}">✅ Đã vững – bỏ cờ cả dạng</button>` : ''}</div>
          <details class="flag-items"><summary>Xem ${gp.n} câu đã gắn cờ</summary>
            <div class="review-list">${gp.items.map(x => x.q ? `<details class="rv"><summary><span class="rv-mark">🚩</span><span class="rv-q">${x.q.text}</span><small class="muted">${UI.ago(x.at)}</small></summary><div class="rv-body">${ansText(x)}${MA.Vis.render(x.q.visual)}${x.q.type === 'mc' ? `<p>${x.q.options.map((o, k) => `<span class="chip ${k === x.q.correct ? 'on' : ''}">${'ABCD'[k]}. ${o}</span>`).join(' ')}</p>` : ''}${MA.Quiz.solutionHTML(x.q, false)}<button class="btn small ghost" data-unf="${esc(x.key)}">Bỏ cờ câu này</button></div></details>`
              : `<div class="rv"><span class="rv-mark">🚩</span> <span class="muted small">Câu gắn ${UI.ago(x.at)} (đã lưu gọn, không còn nội dung)</span> <button class="btn small ghost" data-unf="${esc(x.key)}">Bỏ cờ</button></div>`).join('')}</div></details>
        </div>`).join('')}</div>`}`;
      $$('[data-peek]', app).forEach(b => b.onclick = () => UI.lessonPeek(b.dataset.peek));
      $$('.peek', app).forEach(b => b.onclick = () => UI.lessonPeek(b.dataset.peek));
      $$('[data-lock]', app).forEach(b => b.onclick = () => UI.vipModal('Bài tập bổ trợ trọng tâm từ các câu gắn cờ chỉ dành cho tài khoản VIP. Con vẫn xem lại và làm lại được các câu đã gắn cờ.'));
      $$('[data-unf]', app).forEach(b => b.onclick = () => { MA.User.unflag(b.dataset.unf); UI.toast('Đã bỏ cờ.'); this.flags(app); });
      $$('[data-clr]', app).forEach(b => b.onclick = () => { const gp = groups[+b.dataset.clr]; UI.confirm(`Bỏ cờ cả ${gp.n} câu của dạng “${esc(gp.gname)}”?`, () => { gp.items.forEach(x => MA.User.unflag(x.key)); UI.toast('✅ Đã bỏ cờ dạng này. Giỏi lắm!', 'good'); this.flags(app); }); });
      $$('[data-redo]', app).forEach(b => b.onclick = () => {
        const gp = groups[+b.dataset.redo]; const qs = gp.items.filter(x => x.q).slice(0, 10).map(x => Object.assign(JSON.parse(JSON.stringify(x.q)), { flagTag: '🚩 Câu đã gắn cờ' }));
        const run = () => MA.Quiz.start(app, { kind: 'flags', kicker: '🚩 Làm lại câu đã gắn cờ', title: `${gp.t.icon} ${gp.gname || gp.t.title}`, questions: qs.map(q => JSON.parse(JSON.stringify(q))), back: 'review/flags', restart: run });
        run();
      });
      $$('[data-rem]', app).forEach(b => b.onclick = () => {
        const gp = groups[+b.dataset.rem];
        const go = () => {
          const trial = !vip; if (trial) { f.trial = Date.now(); MA.User.persist(); }
          const qs = C.flagRemedial(gp); if (!qs.length) return UI.toast('Chưa tạo được câu hỏi cho dạng này.', 'bad');
          const run = () => MA.Quiz.start(app, { kind: 'flagcoach', kicker: trial ? '🎁 Dùng thử · Bổ trợ trọng tâm' : '🎯 Bổ trợ trọng tâm từ cờ', title: `${gp.t.icon} ${gp.gname || gp.t.title}`, questions: vip ? C.flagRemedial(gp) : qs, back: 'review/flags', restart: vip ? run : null,
            onFinish: (res) => C.flagSummary(gp, res, trial) });
          run();
        };
        if (!vip) UI.confirm('Con chỉ được <b>dùng thử 1 lần</b> bài bổ trợ trọng tâm. Bắt đầu với dạng này nhé?', go); else go();
      });
    },
    cards(app, grade) {
      const cards = []; MA.Data.topics(grade).forEach(t => t.rules.forEach(r => cards.push({ t, r })));
      let deck = MA.U.shuffle(cards), i = 0, known = 0;
      const draw = () => {
        if (i >= deck.length) { app.querySelector('#fcBox').innerHTML = `<div class="card empty"><div class="big-emoji">🏁</div><h2>Hết bộ thẻ!</h2><p>Con nhớ được ${known}/${deck.length} thẻ.</p><button class="btn" id="fcAgain">Ôn lại từ đầu</button></div>`; $('#fcAgain', app).onclick = () => { deck = MA.U.shuffle(cards); i = 0; known = 0; draw(); }; return; }
        const { t, r } = deck[i];
        app.querySelector('#fcBox').innerHTML = `<div class="fc-count">Thẻ ${i + 1}/${deck.length} · đã nhớ ${known}</div>
          <div class="flash" id="fc"><div class="fc-front"><small>${t.icon} ${t.title}</small><h2>${r.title}</h2><p class="muted">Con hãy nhớ lại quy tắc / công thức, rồi bấm để lật thẻ.</p><span class="fc-hint">👆 Bấm để lật</span></div>
          <div class="fc-back"><small>${t.icon} ${t.title}</small><h3>${r.title}</h3><p>${r.desc}</p>${r.formula ? `<div class="formula">${r.formula}</div>` : ''}${r.example ? `<div class="example">${r.example.replace(/\n/g, '<br>')}</div>` : ''}${MA.Vis.render(r.visual)}</div></div>
          <div class="btn-row center"><button class="btn ghost" id="fcNo">😅 Chưa nhớ</button><button class="btn" id="fcYes">😎 Đã nhớ</button></div>`;
        $('#fc', app).onclick = () => $('#fc', app).classList.toggle('flipped');
        $('#fcYes', app).onclick = () => { known++; i++; draw(); };
        $('#fcNo', app).onclick = () => { deck.push(deck[i]); i++; draw(); };
      };
      app.innerHTML = `<div class="page-head"><h1>🃏 Thẻ ghi nhớ công thức</h1><div class="seg">${MA.Data.grades().filter(g => g.topics.length).map(g => `<a href="#/review/cards/${g.grade}" class="${g.grade === grade ? 'on' : ''}">${g.name}</a>`).join('')}</div></div><div id="fcBox"></div>`;
      draw();
    },
    lower(app, grade) {
      const g = MA.Data.grade(grade); if (!g) return UI.go('review');
      const ids = MA.Data.topics(g.grade).map(t => t.id);
      MA.Quiz.start(app, { kind: 'lower', kicker: '🔙 Ôn kiến thức lớp dưới', title: 'Ôn tập ' + g.name, count: 10, next: () => MA.Data.make(MA.U.pick(ids), MA.U.pick([1, 1, 2])), back: 'review', restart: () => this.lower(app, grade) });
    }
  };

  // ------------------------------ KIỂM TRA ------------------------------
  MA.Views.exam = {
    TYPES: [
      { id: 'q15', icon: '⏱️', name: 'Kiểm tra nhanh 15 phút', n: 10, time: 15, desc: 'Phạm vi chủ đề do con chọn', phase: 'single' },
      { id: 'q45', icon: '📝', name: 'Kiểm tra 1 tiết', n: 20, time: 40, desc: 'Chọn các chủ đề vừa học', phase: 'single' },
      { id: 'mid1', icon: '📘', name: 'Giữa học kỳ I', n: 20, time: 45, desc: 'Gợi ý nửa đầu lộ trình học kỳ I', phase: 'mid1' },
      { id: 'end1', icon: '📗', name: 'Cuối học kỳ I', n: 25, time: 60, desc: 'Gợi ý toàn bộ nội dung học kỳ I', phase: 'end1' },
      { id: 'mid2', icon: '📙', name: 'Giữa học kỳ II', n: 20, time: 45, desc: 'Gợi ý nửa đầu lộ trình học kỳ II', phase: 'mid2' },
      { id: 'end2', icon: '📕', name: 'Cuối học kỳ II', n: 25, time: 60, desc: 'Gợi ý toàn bộ nội dung học kỳ II', phase: 'end2' },
      { id: 'year', icon: '🎓', name: 'Tổng kết môn học (cả năm)', n: 30, time: 90, desc: 'Gợi ý tổng hợp nội dung cả năm', phase: 'all' },
      { id: 'hsg', icon: '🏆', name: 'Đề thi học sinh giỏi', n: 10, time: 30, desc: 'Chỉ câu nâng cao, tư duy', phase: 'all', level: 3 }
    ],
    render(app) {
      const u = MA.User.current; const g = MA.Data.grade(u.grade); const topics = MA.Data.topics(u.grade).filter(t => !MA.Content.topicLocked(t));
      const TYPES = this.TYPES; const own = MA.Content.examsFor(u.grade);
      let type = TYPES[0], selected = new Set(topics.length ? [topics[0].id] : []), level = 0, count = type.n, prepared = null;
      const available = (t) => !MA.Content.topicLocked(t) && availableGens(t).length > 0;
      const defaults = (t) => {
        if (t.phase === 'single') return topics.length ? [topics[0].id] : [];
        return phaseTopics(g, topics, t.phase).filter(x => available(x) && (t.id !== 'hsg' || hasLevel(x, 3))).map(x => x.id);
      };
      app.innerHTML = `<div class="page-head"><h1>📝 Kiểm tra – ${g.name}</h1><p class="muted">Làm hết bài rồi mới nộp, có tính giờ và chấm điểm thang 10. Đạt từ 8 điểm được in giấy khen!</p></div>
        ${own.length ? `<div class="card"><h3>✍️ Đề thi & bài tập do thầy cô biên soạn</h3><div class="exam-types">${own.map(e => { const lk = e.vip && !MA.Account.isVip(); return `<button class="et ${lk ? 'locked' : ''}" data-own="${e.id}"><span>${e.vip ? '👑' : '📄'}</span><b>${esc(e.title)}</b><small>${e.n} câu · ${e.time} phút${e.vip ? ' · VIP' : ''}</small>${e.note ? `<small class="muted">${esc(e.note)}</small>` : ''}</button>`; }).join('')}</div></div>` : ''}
        <div class="card setup">
          <div class="fld"><span>Loại đề</span><div class="exam-types">${TYPES.map((t, i) => { const lk = MA.Content.examLocked(t.id); return `<button class="et ${i ? '' : 'on'} ${lk ? 'locked' : ''}" data-i="${i}"><span>${t.icon}</span><b>${t.name} ${MA.Content.examVip(t.id) ? '👑' : ''}</b><small>${t.desc} · ${t.n} câu · ${t.time} phút${lk ? ' · 🔒 Dành cho VIP' : ''}</small></button>`; }).join('')}</div></div>
          <div class="fld"><span>Phạm vi kiến thức <button class="link" id="eSelAll">Chọn tất cả</button> · <button class="link" id="eSelNone">Bỏ chọn</button></span><div class="chips" id="eTopics"></div></div>
          <div class="grid2"><div class="fld"><span>Số câu</span><select id="eCount">${[10, 15, 20, 25, 30].map(n => `<option value="${n}">${n} câu</option>`).join('')}</select></div>
          <div class="fld"><span>Mức độ</span><div class="seg" id="eLevel">${[[0, '🧭 Tăng dần'], [1, '🟢 Cơ bản'], [2, '🟡 Vận dụng'], [3, '🔴 Nâng cao']].map(([v, l]) => `<button data-v="${v}" class="${v === 0 ? 'on' : ''}">${l}</button>`).join('')}</div></div></div>
          <p class="muted small">Phạm vi học kỳ là gợi ý theo lộ trình trong ứng dụng, không thay thế ma trận đề của nhà trường. Con có thể tự chọn/bỏ chọn chủ đề để khớp phần đã học.</p>
          <div class="card soft" id="eCoverage"></div>
          <div class="btn-row"><button class="btn big block" id="ePreview">🎲 Tạo đề & xem thống kê</button></div>
          <div id="ePrepared"></div>
        </div>
        ${this.history()}`;
      const clearPrepared = () => { prepared = null; $('#ePrepared', app).innerHTML = ''; };
      const renderTopics = () => {
        $('#eTopics', app).innerHTML = topics.map(t => {
          const label = topicGroup(t);
          return `<button class="chip ${selected.has(t.id) ? 'on' : ''}" data-id="${t.id}">${t.icon} ${esc(t.title)}<small>${esc(label)}</small></button>`;
        }).join('');
        $$('#eTopics [data-id]', app).forEach(b => b.onclick = () => { selected.has(b.dataset.id) ? selected.delete(b.dataset.id) : selected.add(b.dataset.id); clearPrepared(); renderTopics(); updateCoverage(); });
      };
      const updateCoverage = () => {
        const ids = [...selected];
        $('#eCoverage', app).innerHTML = `<h3>📊 Nội dung đề đang chọn</h3><p>${ids.length} chủ đề · ${count} câu · ${level === 3 ? levelNames[3] : level === 0 ? 'Tăng dần: cơ bản → vận dụng → nâng cao' : levelNames[level]}</p>${ids.length ? coverageTable(ids) : '<p class="muted">Chưa chọn chủ đề.</p>'}`;
      };
      const applyType = (t) => {
        type = t; selected = new Set(defaults(t)); level = t.level || 0; count = t.n;
        $('#eCount', app).value = String(count);
        $$('#eLevel button', app).forEach(b => { b.classList.toggle('on', +b.dataset.v === level); b.disabled = t.id === 'hsg' && +b.dataset.v !== 3; });
        clearPrepared(); renderTopics(); updateCoverage();
      };
      $$('.et[data-i]', app).forEach(b => b.onclick = () => {
        const t = TYPES[+b.dataset.i];
        if (MA.Content.examLocked(t.id)) return UI.vipModal(`“${t.name}” chỉ dành cho tài khoản VIP.`);
        $$('.et[data-i]', app).forEach(x => x.classList.toggle('on', x === b)); applyType(t);
      });
      $$('.et[data-own]', app).forEach(b => b.onclick = () => { const e = own.find(x => x.id === b.dataset.own); if (e.vip && !MA.Account.isVip()) return UI.vipModal(`“${esc(e.title)}” chỉ dành cho tài khoản VIP.`); this.startOwn(app, e); });
      $('#eSelAll', app).onclick = () => { selected = new Set(topics.filter(available).map(t => t.id)); clearPrepared(); renderTopics(); updateCoverage(); };
      $('#eSelNone', app).onclick = () => { selected.clear(); clearPrepared(); renderTopics(); updateCoverage(); };
      $('#eCount', app).value = String(count);
      $('#eCount', app).onchange = (e) => { count = +e.target.value; clearPrepared(); updateCoverage(); };
      $$('#eLevel button', app).forEach(b => b.onclick = () => {
        if (type.id === 'hsg' && +b.dataset.v !== 3) return;
        level = +b.dataset.v;
        $$('#eLevel button', app).forEach(x => x.classList.toggle('on', x === b)); clearPrepared(); updateCoverage();
      });
      $('#ePreview', app).onclick = () => {
        const ids = [...selected].filter(id => { const t = MA.Data.topic(id); return t && available(t); });
        if (!ids.length) return UI.toast('Hãy chọn ít nhất một chủ đề có câu hỏi.', 'bad');
        const selectedLevel = type.id === 'hsg' ? 3 : level;
        if (selectedLevel >= 1 && selectedLevel <= 3) {
          const missing = ids.map(MA.Data.topic).filter(t => !hasLevel(t, selectedLevel));
          if (missing.length) return UI.toast(`Không có dạng ${levelNames[selectedLevel]} trong: ${missing.slice(0, 2).map(t => t.title).join(', ')}${missing.length > 2 ? '…' : ''}. Hãy bỏ chọn chủ đề đó hoặc chọn mức khác.`, 'bad');
        }
        const qs = makeExamSet(ids, count, selectedLevel);
        if (!qs.length) return UI.toast('Chưa tạo được câu hỏi phù hợp trong phạm vi đã chọn.', 'bad');
        prepared = { ids, qs, level: selectedLevel, counts: questionCounts(qs) };
        const topicIds = Array.from(new Set(qs.map(q => q.topicId)));
        const lvHtml = [1, 2, 3].map(l => `<span class="chip">${levelNames[l]}: ${prepared.counts.byLevel[l] || 0} câu</span>`).join('');
        $('#ePrepared', app).innerHTML = `<div class="card"><h3>✅ Thống kê đề vừa tạo</h3><p>${qs.length} câu · ${type.time} phút · mức độ thực tế:</p><div class="chips">${lvHtml}</div><h4>Nội dung thực tế trong đề</h4>${coverageTable(topicIds, prepared.counts.byTopic)}<div class="btn-row"><button class="btn big" id="eStart">Bắt đầu làm bài 📝</button><button class="btn ghost" id="eAnother">🎲 Tạo đề khác</button></div></div>`;
        $('#eStart', app).onclick = () => this.start(app, type, prepared.qs, prepared.ids, prepared.level);
        $('#eAnother', app).onclick = () => $('#ePreview', app).click();
      };
      renderTopics(); updateCoverage();
    },
    start(app, type, qs, ids, level) {
      const u = MA.User.current; const titleTopics = ids.map(MA.Data.topic).filter(Boolean).map(t => t.title);
      const title = `${type.name} – ${MA.Data.grade(u.grade).name}`;
      MA.Quiz.start(app, { kind: 'exam', kicker: `📝 ${type.name} · ${qs.length} câu · ${type.time} phút`, title: titleTopics.length <= 2 ? `${title}: ${titleTopics.join(', ')}` : `${title}: ${titleTopics.length} chủ đề`, questions: qs, timeLimit: type.time * 60, back: 'exam', restart: () => {
        const next = makeExamSet(ids, qs.length, level);
        this.start(app, type, next, ids, level);
      } });
    },
    startOwn(app, e) {
      const qs = MA.Content.buildExam(e);
      if (!qs.length) return UI.toast('Đề này chưa có câu hỏi. Vui lòng báo thầy cô.', 'bad');
      MA.Quiz.start(app, { kind: 'exam', kicker: `✍️ Đề của thầy cô · ${e.time} phút`, title: e.title, questions: qs, timeLimit: e.time * 60, back: 'exam', restart: () => this.startOwn(app, e) });
    },
    history() {
      const h = MA.User.current.history.filter(x => x.grade === MA.User.current.grade).slice(0, 10);
      if (!h.length) return '';
      return `<div class="card"><h3>🗂️ Lịch sử làm bài gần đây</h3><table class="tbl"><tr><th>Bài</th><th>Điểm</th><th>Đúng</th><th>Thời gian</th><th>Ngày</th></tr>${h.map(x => `<tr><td>${esc(x.title)}</td><td><b>${String(x.score).replace('.', ',')}</b></td><td>${x.right}/${x.total}</td><td>${UI.fmtTime(x.sec)}</td><td>${new Date(x.at).toLocaleDateString('vi-VN')}</td></tr>`).join('')}</table></div>`;
    }
  };
})(window.MA);
