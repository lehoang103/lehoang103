/* =========================================================
 * ui/views-learn.js — HỌC BÀI: danh sách chủ đề & trang bài học chi tiết
 * (Ôn kiến thức cũ → Kiến thức trọng tâm + hình minh họa → Thơ ghi nhớ →
 *  Lỗi sai thường gặp → Ví dụ mẫu từng bước → Thử ngay → Luyện tập)
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI;

  MA.Views.learn = {
    topicCard(t) {
      const p = MA.User.topic(t.id);
      const locked = MA.Content.topicLocked(t);
      const gs = MA.Tutor ? MA.Tutor.topicGens(MA.User.current, t) : { total: t.gens.length, done: 0, tried: 0 };
      const status = locked ? UI.vipTag() : p.m >= 85 ? '<span class="tag good">Thành thạo</span>' : p.placed && !p.n ? '<span class="tag good">Đã biết</span>' : p.n ? `<span class="tag">Đang luyện</span>` : p.learned ? '<span class="tag">Đã học</span>' : '<span class="tag new">Mới</span>';
      return `<a class="topic-card" href="#/learn/${t.id}">
        <div class="tc-icon">${t.icon}</div>
        <div class="tc-body"><small>Chủ đề ${t.order}</small><b>${t.title}</b><span class="muted">${t.tagline}</span>${UI.masteryBar(p.m, true)}</div>
        <div class="tc-meta">${status}<small title="Số dạng bài đã vững (đúng ≥ 80%)">${gs.tried ? `${gs.done}/${gs.total} dạng vững` : `${gs.total} dạng bài`}</small></div></a>`;
    },
    render(app, params) {
      if (params[0]) return this.lesson(app, params[0]);
      const u = MA.User.current; const g = MA.Data.grade(u.grade);
      const mode = UI.settings.learnView || 'map';
      const list = () => `<div class="topic-grid">${MA.Data.topics(g.grade).map(t => this.topicCard(t)).join('')}</div>`;
      // Bản đồ lỗi trên trình duyệt nào đó → vẫn hiện danh sách chủ đề, không để trang trắng
      let body, mapOk = mode === 'map';
      if (mapOk) { try { body = this.map(u, g); } catch (e) { console.error('Không vẽ được Bản đồ', e); mapOk = false; body = `<div class="card soft small">🗺️ Trình duyệt này chưa hiện được Bản đồ – con xem chủ đề theo danh sách nhé (đúng thứ tự học trên lớp).</div>` + list(); } }
      else body = list();
      app.innerHTML = `<div class="page-head"><h1>📚 Học bài – ${g.name}</h1><p class="muted">${g.desc}</p>
          <div class="seg" id="lvSeg"><button data-v="map" class="${mode === 'map' ? 'on' : ''}">🗺️ Bản đồ</button><button data-v="list" class="${mode === 'list' ? 'on' : ''}">☰ Danh sách</button></div></div>
        ${MA.Theory && MA.Theory.book(g.grade) ? (() => { const bs = MA.Theory.books(g.grade), B = bs[0], n = MA.Theory.all(g.grade).length, nc = bs.reduce((a, b) => a + b.chapters.length, 0); return `<a class="card th-banner" href="#/theory"><span class="th-bi">${B.icon}</span><span><b>Ôn lý thuyết theo SGK – ${bs.map(b => esc(b.book)).join(' · ')}</b><small class="muted">${nc} chương · ${n} bài theo đúng mục lục sách ${esc(B.series)}: Cần nhớ · Công thức · Thẻ hỏi – đáp · Kiểm tra nhanh</small></span><span class="btn small">Mở →</span></a>`; })() : ''}
        ${body}
        ${u.grade > 1 ? `<div class="card soft"><h3>🔙 Ôn kiến thức lớp dưới</h3><p class="muted">Nền tảng vững thì học lớp trên mới dễ. Chọn một lớp để xem lại bài học:</p><div class="btn-row">${MA.Data.grades().filter(x => x.grade < u.grade && x.topics.length).map(x => `<button class="btn ghost" data-g="${x.grade}">${x.emoji} ${x.name}</button>`).join('')}</div><div id="lowerList"></div></div>` : ''}`;
      if (mapOk) { try { this.wireMap(app); } catch (e) { console.error('Không nối được dây Bản đồ', e); } }
      $$('#lvSeg button', app).forEach(b => b.onclick = () => { UI.settings.learnView = b.dataset.v; UI.saveSettings(); this.render(app, []); });
      $$('[data-g]', app).forEach(b => b.onclick = () => { $('#lowerList', app).innerHTML = `<div class="topic-grid">${MA.Data.topics(+b.dataset.g).map(t => this.topicCard(t)).join('')}</div>`; });
    },

    // Bản đồ học tập dạng "mạng nơ-ron": mỗi chủ đề là một nút, dây nối = bài nền tảng → bài sau.
    // Cột = bước học (độ sâu trong cây kiến thức). Vòng quanh icon = % thành thạo, sao = mức đạt.
    map(u, g) {
      const ts = MA.Data.topics(g.grade); const next = MA.Tutor ? MA.Tutor.nextTopic(u, g.grade) : ts[0];
      const stars = (m) => m >= 85 ? 3 : m >= 70 ? 2 : m >= 50 ? 1 : 0;
      const ids = new Set(ts.map(t => t.id)); const byId = {}; ts.forEach(t => byId[t.id] = t);
      const par = {}; ts.forEach(t => par[t.id] = [...new Set((t.prereqs || []).filter(id => ids.has(id) && id !== t.id))]);
      // tổ tiên (để bỏ dây thừa: A→C khi đã có A→B→C)
      const anc = {}; const ancOf = (id, seen = new Set()) => {
        if (anc[id]) return anc[id]; if (seen.has(id)) return new Set(); seen.add(id);
        const out = new Set(); par[id].forEach(p => { out.add(p); ancOf(p, seen).forEach(x => out.add(x)); });
        return (anc[id] = out);
      };
      ts.forEach(t => ancOf(t.id));
      const red = {}; ts.forEach(t => red[t.id] = par[t.id].filter(p => !par[t.id].some(q => q !== p && anc[q].has(p))));
      // độ sâu = đường dài nhất từ gốc
      const dep = {}; const depth = (id, seen = new Set()) => {
        if (dep[id] != null) return dep[id]; if (seen.has(id)) return 0; seen.add(id);
        return (dep[id] = red[id].length ? 1 + Math.max(...red[id].map(p => depth(p, seen))) : 0);
      };
      ts.forEach(t => depth(t.id));
      // Cột = bước học theo chương trình (curriculum.js: t.step); nếu lớp chưa khai báo thì dùng độ sâu cây kiến thức.
      const byStep = ts.length && ts.every(t => t.step != null);
      let cols = []; const colLabel = [];
      if (byStep) {
        ts.forEach(t => (cols[t.step] = cols[t.step] || []).push(t));
        (g.stepLabels || []).forEach((l, i) => colLabel[i] = l);
        const keep = cols.map((c, i) => c ? i : -1).filter(i => i >= 0);   // bỏ cột trống (chủ đề bị ẩn)
        cols = keep.map(i => cols[i].sort((a, b) => a.order - b.order));
        keep.forEach((i, k) => colLabel[k] = (g.stepLabels || [])[i] || '');
        colLabel.length = cols.length;
      } else {
        ts.forEach(t => (cols[dep[t.id]] = cols[dep[t.id]] || []).push(t));
        // xếp nút trong cột theo vị trí trung bình của bài nền tảng → ít dây chéo
        const pos = {};
        cols.forEach((c, ci) => {
          if (ci) c.sort((a, b) => { const avg = t => red[t.id].length ? red[t.id].reduce((s, p) => s + (pos[p] || 0), 0) / red[t.id].length : 0; return avg(a) - avg(b) || a.order - b.order; });
          c.forEach((t, i) => pos[t.id] = (i + .5) / c.length);
        });
      }
      const ready = (id) => { const q = MA.User.topic(id); return q.m >= 60 || q.placed; };
      const edges = []; ts.forEach(t => red[t.id].forEach(p => edges.push([p, t.id, (ready(p) ? 'ok' : '') + (next && next.id === t.id ? ' flow' : '')])));
      const node = (t) => {
        const p = MA.User.topic(t.id); const m = p.placed && !p.n ? Math.max(p.m, 70) : p.m; const st = stars(m);
        const locked = MA.Content.topicLocked(t); const pre = par[t.id].map(id => byId[id]);
        const isReady = pre.every(x => ready(x.id)); const here = next && next.id === t.id;
        const cls = [here ? 'here' : '', st === 3 ? 'done' : st ? 'part' : '', !isReady && !st ? 'later' : '', locked ? 'locked' : ''].join(' ');
        return `<a class="nm-node ${cls}" data-id="${t.id}" href="#/learn/${t.id}" style="--m:${m}" title="${esc(!isReady && !st ? 'Nên học trước: ' + pre.map(x => x.title).join(', ') : t.title)}">
          <span class="nm-ring"><span class="nm-ico">${t.icon}</span>${here ? `<em class="nm-me">${MA.U.av(u.avatar)}</em>` : ''}</span>
          <span class="nm-txt"><small>Trạm ${t.order}${locked ? ' · 👑' : ''}</small><b>${t.title}</b><span class="lm-stars">${'★'.repeat(st)}<i>${'★'.repeat(3 - st)}</i></span></span></a>`;
      };
      return `<div class="nm-wrap">${next ? `<div class="nm-here-tip">${MA.U.av(u.avatar)} Con đang ở <a href="#/learn/${next.id}"><b>${next.icon} ${next.title}</b></a></div>` : ''}
        <div class="nm-scroll"><div class="nmap" style="--cols:${cols.length}" data-edges='${esc(JSON.stringify(edges))}'><svg class="nm-edges" aria-hidden="true"></svg>
          ${cols.map((c, i) => `<div class="nm-col"><div class="nm-step">Bước ${i + 1}${colLabel[i] ? `<small>${colLabel[i]}</small>` : ''}</div><div class="nm-nodes">${c.map(node).join('')}</div></div>`).join('')}
        </div></div>
        <p class="muted small center">Các bước xếp theo thứ tự học trên lớp (SGK Kết nối tri thức, GDPT 2018) · Dây nối: bài nền tảng → bài học tiếp theo · Vòng màu quanh icon = mức thành thạo · ★ 50% · ★★ 70% · ★★★ ≥ 85% · Nút mờ: nên học bài nền tảng trước. Di chuột vào một trạm để xem cả nhánh kiến thức của nó.</p></div>`;
    },

    // Vẽ dây nối (SVG) theo vị trí thật của các nút; tự vẽ lại khi đổi kích thước.
    wireMap(root) {
      const box = $('.nmap', root); if (this._ro) { this._ro.disconnect(); this._ro = null; }
      if (!box) return;
      const svg = $('.nm-edges', box); let edges = [];
      try { edges = JSON.parse(box.dataset.edges || '[]'); } catch (e) { }
      const el = {}; $$('.nm-node', box).forEach(n => el[n.dataset.id] = n);
      const draw = () => {
        const B = box.getBoundingClientRect(); if (!B.width) return;
        const vert = getComputedStyle(box).getPropertyValue('--vert').trim() === '1';
        svg.setAttribute('width', B.width); svg.setAttribute('height', B.height); svg.setAttribute('viewBox', `0 0 ${B.width} ${B.height}`);
        svg.innerHTML = edges.map(([a, b, cls]) => {
          if (!el[a] || !el[b]) return '';
          const A = $('.nm-ring', el[a]).getBoundingClientRect(), C = $('.nm-ring', el[b]).getBoundingClientRect();
          const RA = el[a].getBoundingClientRect(), RC = el[b].getBoundingClientRect();
          let d;
          if (vert) {   // trên → dưới (điện thoại)
            const x1 = A.left + A.width / 2 - B.left, y1 = RA.bottom - B.top, x2 = C.left + C.width / 2 - B.left, y2 = RC.top - B.top, dy = Math.max(24, (y2 - y1) * .5);
            d = [`M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`, x2, y2];
          } else {      // trái → phải
            const x1 = RA.right - B.left, y1 = A.top + A.height / 2 - B.top, x2 = RC.left - B.left, y2 = C.top + C.height / 2 - B.top, dx = Math.max(30, (x2 - x1) * .5);
            d = [`M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`, x2, y2];
          }
          return `<path class="nm-e ${cls}" data-a="${a}" data-b="${b}" d="${d[0]}"/><circle class="nm-pt ${cls}" data-a="${a}" data-b="${b}" cx="${d[1]}" cy="${d[2]}" r="3.5"/>`;
        }).join('');
      };
      draw(); requestAnimationFrame(draw);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
      if (window.ResizeObserver) { this._ro = new ResizeObserver(draw); this._ro.observe(box); } else { window.removeEventListener('resize', this._rs || draw); this._rs = draw; window.addEventListener('resize', draw); }
      // Di chuột / chạm giữ vào một trạm: sáng cả nhánh trước và sau nó
      const up = {}, down = {}; edges.forEach(([a, b]) => { (up[b] = up[b] || []).push(a); (down[a] = down[a] || []).push(b); });
      const walk = (id, m, acc) => (m[id] || []).forEach(x => { if (!acc.has(x)) { acc.add(x); walk(x, m, acc); } });
      const focus = (id) => {
        const set = new Set([id]); walk(id, up, set); walk(id, down, set);
        box.classList.add('focus');
        Object.keys(el).forEach(k => el[k].classList.toggle('hl', set.has(k)));
        $$('.nm-e, .nm-pt', svg).forEach(p => p.classList.toggle('hl', set.has(p.dataset.a) && set.has(p.dataset.b)));
      };
      const blur = () => { box.classList.remove('focus'); $$('.hl', box).forEach(x => x.classList.remove('hl')); };
      Object.values(el).forEach(n => { n.addEventListener('mouseenter', () => focus(n.dataset.id)); n.addEventListener('mouseleave', blur); n.addEventListener('focus', () => focus(n.dataset.id)); n.addEventListener('blur', blur); });
      const here = $('.nm-node.here', box); const sc = $('.nm-scroll', root);
      if (here && sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = Math.max(0, here.offsetLeft - sc.clientWidth / 2 + here.offsetWidth / 2);
    },

    lesson(app, id) {
      const t = MA.Data.topic(id);
      if (!t) { app.innerHTML = '<div class="card">Không tìm thấy bài học.</div>'; return; }
      if (MA.Content.topicLocked(t)) {
        app.innerHTML = `<nav class="crumbs"><a href="#/learn">📚 Học bài</a> › <b>${t.title}</b></nav><header class="lesson-head"><div class="lh-icon">${t.icon}</div><div class="lh-main"><small>Chủ đề ${t.order} · Lớp ${t.grade}</small><h1>${t.title}</h1><p>${t.tagline}</p></div></header>
          <div class="card vip-lock"><div class="big-emoji">👑</div><h2>Chủ đề dành cho tài khoản VIP</h2><p>${t.summary}</p><p class="muted">Cha/mẹ liên hệ thầy cô để nhận mã kích hoạt VIP, rồi nhập mã tại <b>Hồ sơ → Tài khoản</b>.</p><div class="btn-row center"><a class="btn" href="#/rank/me">🔑 Nhập mã VIP</a><a class="btn ghost" href="#/learn">← Chủ đề khác</a></div></div>`;
        return;
      }
      MA.User.markLearned(t.id);
      const p = MA.User.topic(t.id); const u = MA.User.current;
      const pre = (t.prereqs || []).map(MA.Data.topic).filter(Boolean);
      const byLevel = [1, 2, 3].map(l => ({ l, gens: t.gens.map((g, i) => Object.assign({ i }, g)).filter(g => g.level === l) })).filter(x => x.gens.length);
      const topics = t.track ? MA.Data.track(t.track, t.grade) : MA.Data.topics(t.grade); const idx = topics.indexOf(t);
      const sgk = MA.Theory ? MA.Theory.ofTopic(t.id) : [];   // các bài SGK thuộc chủ đề (ôn lý thuyết)
      const crumb = t.track === 'timo' ? '<a href="#/timo">🌏 Luyện thi TIMO</a>' : '<a href="#/learn">📚 Học bài</a>';

      app.innerHTML = `
        <nav class="crumbs">${crumb} › <span>Lớp ${t.grade}</span> › <b>${t.title}</b></nav>
        <header class="lesson-head">
          <div class="lh-icon">${t.icon}</div>
          <div class="lh-main"><small>${t.track === 'timo' ? 'TIMO' : 'Chủ đề ' + t.order} · Lớp ${t.grade}</small><h1>${t.title}</h1><p>${t.tagline}</p>
            <div class="lh-mastery">Mức thành thạo: <b>${p.m}%</b> ${UI.masteryBar(p.m)} <small>${p.n ? `${p.c}/${p.n} câu đúng · luyện ${UI.ago(p.last)}` : 'Chưa luyện tập'}</small></div></div>
          <div class="lh-actions"><a class="btn" href="#/practice/${t.id}">✏️ Luyện tập</a><button class="btn ghost" id="readAll">🔊 Cô đọc bài</button></div>
        </header>

        <nav class="lesson-toc">${[pre.length ? ['pre', '🔙 Ôn bài cũ'] : null, ['core', '💡 Kiến thức'], sgk.length ? ['sgk', '📘 Theo SGK'] : null, t.poem ? ['poem', '🎵 Ghi nhớ'] : null, ['pit', '⚠️ Lỗi sai'], ['ex', '🧩 Ví dụ'], ['try', '🎯 Thử ngay'], ['forms', '🗂️ Dạng bài']].filter(Boolean).map(([k, l]) => `<a role="button" tabindex="0" data-sec="${k}">${l}</a>`).join('')}</nav>

        ${pre.length ? `<section class="card soft" id="sec-pre"><h2>🔙 Ôn lại kiến thức cũ trước khi học</h2><p class="muted">Bài này cần dùng kiến thức của các bài sau. Bấm để xem lại nhanh, hoặc làm 3 câu khởi động:</p>
          <div class="pre-list">${pre.map(x => { const px = MA.User.topic(x.id); return `<button class="pre-item" data-peek="${x.id}"><span>${x.icon}</span><div><b>${x.title}</b><small>Lớp ${x.grade} · ${px.m}% thành thạo</small>${UI.masteryBar(px.m, true)}</div></button>`; }).join('')}</div>
          <button class="btn ghost" id="warmBtn">⚡ Khởi động: 3 câu ôn bài cũ</button><div id="warmBox"></div></section>` : ''}

        <section id="sec-core"><h2>💡 Kiến thức trọng tâm</h2><p class="lead">${t.summary}</p>
          <div class="rules">${t.rules.map((r, i) => `<article class="rule card"><div class="rule-n">${i + 1}</div><h3>${r.title}</h3><p>${r.desc}</p>
            ${r.formula ? `<div class="formula">📐 ${r.formula}</div>` : ''}${MA.Vis.render(r.visual)}
            ${r.example ? `<div class="example"><b>Ví dụ:</b> ${r.example.replace(/\n/g, '<br>')}</div>` : ''}
            ${r.tip ? `<div class="tip">🦉 <b>Cô dặn:</b> ${r.tip}</div>` : ''}<button class="speak" data-say="${i}" title="Nghe cô giảng">🔊</button></article>`).join('')}</div></section>

        ${sgk.length ? `<section class="card soft" id="sec-sgk"><h2>📘 Ôn lý thuyết theo SGK</h2><p class="muted">Chủ đề này ứng với các bài sau trong SGK ${esc(sgk[0].book.book)} (${esc(sgk[0].book.series)}). Mỗi bài có phần Cần nhớ, thẻ hỏi – đáp và 5 câu kiểm tra nhanh:</p>
          <div class="th-sgk">${sgk.map(l => `<a class="chip" href="#/theory/${l.id}">Bài ${l.no}. ${esc(l.title)}${l.page ? ` <small>tr. ${l.page}</small>` : ''}</a>`).join('')}</div></section>` : ''}

        ${t.poem ? `<section class="card poem-card" id="sec-poem"><h2>🎵 Thơ ghi nhớ</h2><div class="poem">${t.poem.map(l => `<div>${l}</div>`).join('')}</div><button class="btn ghost" id="poemBtn">🔊 Đọc thơ</button></section>` : ''}

        <section id="sec-pit"><h2>⚠️ Lỗi sai thường gặp</h2><div class="pitfalls">${t.pitfalls.map(x => `<div class="pit card"><div class="pit-wrong">❌ ${x.wrong}</div><div class="pit-right">✅ ${x.right}</div><p class="muted">${x.why}</p></div>`).join('')}</div></section>

        <section id="sec-ex"><h2>🧩 Ví dụ mẫu – giải từng bước</h2>${t.examples.map((e, i) => `<div class="card worked" data-ex="${i}"><h3>Ví dụ ${i + 1}: ${e.q}</h3>${MA.Vis.render(e.visual)}<ol class="steps">${e.steps.map((s, k) => `<li class="${k ? 'hidden' : ''}">${s}</li>`).join('')}</ol>${e.steps.length > 1 ? `<button class="btn ghost small nextStep">Bước tiếp theo ▸</button>` : ''}</div>`).join('')}</section>

        <section id="sec-try"><h2>🎯 Thử ngay</h2><p class="muted">3 câu từ dễ đến khó để kiểm tra con đã hiểu bài chưa:</p><div id="tryBox"></div></section>

        <section id="sec-forms" class="card"><h2>🗂️ Các dạng bài trong chủ đề</h2><p class="muted">Bấm vào một dạng để luyện riêng dạng đó.</p>
          ${byLevel.map(b => `<div class="forms"><div>${UI.levelTag(b.l)}</div><div class="form-list">${b.gens.map(g => MA.Content.genAllowed(t, g) ? (() => { const m = MA.Tutor ? MA.Tutor.genMastery(u, t.id, g.name) : null; const cls = m == null ? '' : m >= 80 ? 'gm-good' : m >= 50 ? 'gm-mid' : 'gm-low'; return `<a class="chip ${g.custom ? 'on' : ''} ${cls}" href="#/practice/${t.id}/${g.i}" title="${m == null ? 'Chưa luyện' : 'Mức thành thạo ' + m + '%'}">${g.name}${MA.Content.genVip(t, g) ? ' 👑' : ''}${m == null ? '' : `<small>${m}%</small>`}</a>`; })() : `<button class="chip locked" data-vip="1">🔒 ${g.name}</button>`).join('')}</div></div>`).join('')}
        </section>

        <div class="lesson-nav">${idx > 0 ? `<a class="btn ghost" href="#/learn/${topics[idx - 1].id}">← ${topics[idx - 1].title}</a>` : '<span></span>'}<a class="btn big" href="#/practice/${t.id}">Luyện tập chủ đề này ✏️</a>${idx < topics.length - 1 ? `<a class="btn ghost" href="#/learn/${topics[idx + 1].id}">${topics[idx + 1].title} →</a>` : '<span></span>'}</div>`;

      // ---- Sự kiện ----
      $$('[data-sec]', app).forEach(a => a.onclick = () => { const s = $('#sec-' + a.dataset.sec, app); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      $$('[data-peek]', app).forEach(b => b.onclick = () => UI.lessonPeek(b.dataset.peek));
      $$('[data-vip]', app).forEach(b => b.onclick = () => UI.vipModal('Dạng bài này chỉ dành cho tài khoản VIP.'));
      $$('.speak', app).forEach(b => b.onclick = () => { const r = t.rules[+b.dataset.say]; MA.Sound.speak([r.title, r.desc, r.formula || '', r.example ? 'Ví dụ: ' + r.example : '', r.tip ? 'Cô dặn: ' + r.tip : ''].filter(Boolean)); });
      $('#readAll', app).onclick = () => MA.Sound.speaking() ? MA.Sound.stop() : MA.Sound.speak([t.title, t.summary].concat(t.rules.map(r => r.title + '. ' + r.desc)));
      if ($('#poemBtn', app)) $('#poemBtn', app).onclick = () => MA.Sound.speak(t.poem, { rate: 0.85 });
      $$('.worked', app).forEach(w => { const btn = $('.nextStep', w); if (!btn) return; btn.onclick = () => { const h = $('li.hidden', w); if (h) h.classList.remove('hidden'); if (!$('li.hidden', w)) btn.remove(); }; });
      if ($('#warmBtn', app)) $('#warmBtn', app).onclick = () => {
        const qs = MA.Data.makeSet(pre.map(x => x.id), 3, 1);
        MA.Quiz.inline($('#warmBox', app), qs, { title: 'Khởi động ôn bài cũ' }); $('#warmBtn', app).remove();
      };
      MA.Quiz.inline($('#tryBox', app), [1, 2, 3].map(l => MA.Data.make(t.id, l)).filter(Boolean), { title: 'Thử ngay' });
    }
  };
})(window.MA);
