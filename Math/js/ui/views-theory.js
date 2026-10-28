/* =========================================================
 * ui/views-theory.js — ÔN LUYỆN LÝ THUYẾT THEO SGK (17/10/2026)
 *   #/theory              : mục lục SGK theo chương → từng bài (Cần nhớ · Công thức · Thẻ hỏi – đáp · Kiểm tra nhanh)
 *   #/theory/<bài>        : mở thẳng một bài, vd. #/theory/g6b10
 *   #/theory/kt/all       : kiểm tra lý thuyết cả tập (20 câu)
 *   #/theory/kt/<ch>/<i>  : kiểm tra theo mục “Luyện tập chung” / “Bài tập cuối chương” (i) của chương <ch>
 *   #/theory/the          : lật thẻ ôn nhanh (ngẫu nhiên, lọc theo chương)
 * Dữ liệu: MA.Theory (js/data/grade6-lythuyet.js). Kết quả mỗi bài lưu ở u.theory[id] = { b, t, at }.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc, stripHtml, shuffle } = MA.U;
  const UI = MA.UI; const TH = () => MA.Theory;
  const B0 = (l) => l.book;
  // nhãn chương: SGK THCS dùng “Chương I, II…”, SGK tiểu học dùng “Chủ đề 1, 2…” (book.unit)
  const CH = (c) => c.book && c.book.unit ? `${c.book.unit} ${c.n}` : `Chương ${ROMAN[c.n]}`;
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  MA.Views.theory = {
    // lớp đang xem: lớp đã chọn trên trang này (nếu có nội dung) → lớp của học sinh → lớp gần nhất có nội dung
    grade() { const gs = TH().grades(); const pickG = +UI.settings.theoryGrade, g = MA.User.current.grade; if (gs.includes(pickG)) return pickG; if (gs.includes(g)) return g; return gs.reduce((a, x) => Math.abs(x - g) < Math.abs(a - g) ? x : a, gs[0]); },
    vol(g) { const bs = TH().books(g); const v = +UI.settings['theoryVol' + g]; return bs.some(b => b.vol === v) ? v : bs[0].vol; },
    setPref(k, v) { UI.settings[k] = v; UI.saveSettings(); },
    rec(id) { const u = MA.User.current; return (u.theory || {})[id]; },
    passed(id) { const r = this.rec(id); return !!(r && r.t && r.b / r.t >= 0.8); },
    save(id, right, total) {
      const u = MA.User.current; if (!u) return; u.theory = u.theory || {};
      const r = u.theory[id] || { b: 0, t: total }; if (right / total >= r.b / (r.t || 1)) { r.b = right; r.t = total; } r.at = Date.now(); r.n = (r.n || 0) + 1;
      u.theory[id] = r; MA.User.persist();
    },
    // các bài thuộc một mục luyện tập của chương (từ sau mục trước đến bài “upto”; không có upto = cả chương)
    pracLessons(ch, i) {
      const p = ch.practice[i]; if (!p || !p[2]) return ch.lessons;
      const prev = i > 0 && ch.practice[i - 1][2] ? ch.lessons.findIndex(l => l.id === ch.practice[i - 1][2]) + 1 : 0;
      const end = ch.lessons.findIndex(l => l.id === p[2]);
      return ch.lessons.slice(prev, end + 1);
    },
    range(ls) { return ls.length > 1 ? `Bài ${ls[0].no}–${ls[ls.length - 1].no}` : `Bài ${ls[0].no}`; },

    render(app, params) {
      if (!TH() || !TH().grades().length) { app.innerHTML = '<div class="card">Chưa có nội dung ôn lý thuyết.</div>'; return; }
      if (params[0] === 'lop' && TH().books(+params[1]).length) { this.setPref('theoryGrade', +params[1]); return UI.go('theory'); }
      if (params[0] === 'tap') { this.setPref('theoryVol' + this.grade(), +params[1]); return UI.go('theory'); }
      const l0 = params[0] && TH().lesson(params[0]);
      if (l0) { if (l0.grade !== this.grade()) this.setPref('theoryGrade', l0.grade); this.setPref('theoryVol' + l0.grade, l0.book.vol); }
      if (params[0] === 'kt') return this.quiz(app, params[1], params[2]);
      if (params[0] === 'the') return this.deck(app, params[1]);
      const u = MA.User.current, g = this.grade(), vol = this.vol(g), B = TH().book(g, vol), all = TH().all(g, vol), bs = TH().books(g), gs = TH().grades();
      const done = all.filter(l => this.passed(l.id)).length; const pct = Math.round(done / all.length * 100);
      app.innerHTML = `<nav class="crumbs"><a href="#/learn">📚 Học bài</a> › <b>Ôn lý thuyết SGK</b></nav>
        <div class="page-head"><h1>${B.icon} Ôn lý thuyết SGK – Toán ${g}</h1>
          ${gs.length > 1 ? `<div class="seg th-seg">${gs.map(x => `<a href="#/theory/lop/${x}" class="${x === g ? 'on' : ''}">Lớp ${x}</a>`).join('')}</div>` : ''}
          ${bs.length > 1 ? `<div class="seg big th-seg">${bs.map(b => `<a href="#/theory/tap/${b.vol}" class="${b.vol === vol ? 'on' : ''}">${b.icon} ${esc(b.book.replace(/^Toán \d+ – /, ''))}</a>`).join('')}</div>` : ''}
          <p class="muted"><b>${esc(B.book)}</b> · bám sát mục lục SGK <b>${esc(B.series)}</b> · ${B.chapters.length} chương · ${all.length} bài. Mỗi bài có: <b>Cần nhớ</b> · <b>Công thức</b> · <b>Thẻ hỏi – đáp</b> · <b>Kiểm tra nhanh</b>.</p>
          ${u.grade !== g ? `<div class="card soft small">📌 Hiện đã có phần ôn lý thuyết cho <b>Lớp ${g}</b>. Con vẫn có thể xem để ôn tập hoặc học trước.</div>` : ''}</div>
        <div class="card th-hero">
          <div class="th-prog"><b>${done}/${all.length}</b><small>bài đã ôn đạt (đúng ≥ 80%)</small>${UI.masteryBar(pct, true)}</div>
          <div class="btn-row"><a class="btn" href="#/theory/kt/all/${vol}">📝 Kiểm tra lý thuyết cả tập (20 câu)</a><a class="btn ghost" href="#/theory/the">🃏 Lật thẻ ôn nhanh</a></div>
        </div>
        <nav class="th-jump">${B.chapters.map(c => `<a role="button" tabindex="0" data-jump="th-${c.id}" style="--chc:${c.color}">${CH(c)}</a>`).join('')}${B.extra ? '<a role="button" tabindex="0" data-jump="th-extra">Trải nghiệm</a>' : ''}</nav>
        ${B.chapters.map(c => this.chapter(c)).join('')}
        ${B.extra ? `<section class="th-ch" id="th-extra" style="--chc:#22a4b5"><header class="th-chh"><span>HOẠT ĐỘNG</span><h2>${esc(B.extra.title)}</h2></header>
          <div class="th-extra">${B.extra.items.map(([ic, ti, pg, de, tid]) => `<div class="card th-x"><div class="th-xi">${ic}</div><div><b>${esc(ti)}</b>${pg ? ` <small class="muted">· tr. ${pg}</small>` : ''}<p class="muted small">${esc(de)}</p>${MA.Data.topic(tid) ? `<a class="chip" href="#/learn/${tid}">${MA.Data.topic(tid).icon} ${esc(MA.Data.topic(tid).title)}</a>` : ''}</div></div>`).join('')}</div></section>` : ''}
        <p class="muted small center">Nội dung tóm tắt theo SGK Toán ${g} (Chương trình GDPT 2018), bộ ${esc(B.series)}. ${all.some(l => l.page) ? `Số trang ghi theo ${esc(B.book)}.` : ''}</p>`;
      this.wire(app);
      // mở thẳng một bài: #/theory/g6b10
      const l = l0;
      if (l) { const d = $('#th-' + l.id, app); if (d) { d.open = true; this.fill(d, l); setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); } }
    },

    chapter(c) {
      const ls = c.lessons; const done = ls.filter(l => this.passed(l.id)).length;
      return `<section class="th-ch" id="th-${c.id}" style="--chc:${c.color}">
        <header class="th-chh"><span>${CH(c).toUpperCase()}</span><h2>${esc(c.title)}</h2><small>${this.range(ls)} · ${done}/${ls.length} bài đã ôn đạt</small></header>
        <details class="th-map card"><summary>🧠 Sơ đồ ghi nhớ ${CH(c)}</summary><ol>${c.map.map(x => `<li>${x}</li>`).join('')}</ol></details>
        ${ls.map(l => { const r = this.rec(l.id); return `<details class="th-lesson card" id="th-${l.id}" data-id="${l.id}">
          <summary><span class="th-no">Bài ${l.no}</span><span class="th-ti"><b>${esc(l.title)}</b><small>${l.page ? `SGK tr. ${l.page}` : esc(B0(l).book)}</small></span>${r ? `<span class="tag ${this.passed(l.id) ? 'good' : ''}">${this.passed(l.id) ? '✓ ' : ''}${r.b}/${r.t}</span>` : '<span class="tag new">Chưa ôn</span>'}</summary><div class="th-body"></div></details>`; }).join('')}
        <div class="th-prac">${c.practice.map((p, i) => { const pl = this.pracLessons(c, i); return `<a class="th-pr" href="#/theory/kt/${c.id}/${i}"><span>📝</span><span><span><b>${esc(p[0])}</b>${p[1] ? ` <small>· tr. ${p[1]}</small>` : ''}</span><small class="muted">Kiểm tra lý thuyết ${this.range(pl)} · ${p[2] ? 8 : 12} câu</small></span></a>`; }).join('')}</div>
      </section>`;
    },

    // nội dung một bài (vẽ khi mở lần đầu cho nhẹ trang)
    fill(d, l) {
      const body = $('.th-body', d); if (body.dataset.ok) return; body.dataset.ok = 1;
      const t = MA.Data.topic(l.topic);
      body.innerHTML = `<h4>📌 Cần nhớ</h4><ul class="th-key">${l.key.map(k => `<li>${k}</li>`).join('')}</ul>
        ${(l.f || []).map(f => `<div class="formula">📐 ${f}</div>`).join('')}
        ${l.vis ? `<div class="th-vis">${MA.Vis.render(l.vis)}</div>` : ''}
        ${l.cards && l.cards.length ? `<h4>🃏 Hỏi nhanh – đáp gọn <small class="muted">(bấm vào thẻ để xem đáp án)</small></h4>
          <div class="th-cards">${l.cards.map(([q, a]) => `<button class="th-flip" type="button"><span class="f">❓ ${q}</span><span class="b">💡 ${a}</span></button>`).join('')}</div>` : ''}
        <div class="btn-row"><button class="btn" data-q="${l.id}">✅ Kiểm tra nhanh (${Math.min(5, TH().count(l))} câu)</button>
          ${t ? `<a class="btn ghost" href="#/learn/${t.id}">${t.icon} Bài học chủ đề</a><a class="btn ghost" href="#/practice/${t.id}">✏️ Luyện bài tập</a>` : ''}
          <button class="btn ghost small" data-say="${l.id}" title="Nghe cô đọc phần Cần nhớ">🔊 Nghe</button></div>
        <div class="th-quiz"></div>`;
      $$('.th-flip', body).forEach(b => b.onclick = () => b.classList.toggle('on'));
      $('[data-say]', body).onclick = () => MA.Sound.speaking() ? MA.Sound.stop() : MA.Sound.speak([`Bài ${l.no}. ${l.title}`].concat(l.key.map(stripHtml)));
      $('[data-q]', body).onclick = (e) => {
        const box = $('.th-quiz', body); box.innerHTML = ''; e.target.disabled = true;
        const qs = TH().set([l], 5);
        MA.Quiz.inline(box, qs, { title: `Bài ${l.no}`, onDone: (right, total) => {
          this.save(l.id, right, total); e.target.disabled = false; e.target.textContent = '🔁 Làm lại (câu khác)';
          const tag = $('summary .tag', d); if (tag) { tag.className = 'tag' + (this.passed(l.id) ? ' good' : ''); const r = this.rec(l.id); tag.textContent = (this.passed(l.id) ? '✓ ' : '') + r.b + '/' + r.t; }
        } });
      };
    },

    wire(app) {
      $$('[data-jump]', app).forEach(a => a.onclick = () => { const s = $('#' + a.dataset.jump, app); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      $$('.th-lesson', app).forEach(d => d.addEventListener('toggle', () => { if (d.open) this.fill(d, TH().lesson(d.dataset.id)); }));
    },

    // ---------- Kiểm tra lý thuyết (cả tập / theo chương) ----------
    quiz(app, cid, idx) {
      const g = this.grade(), chs = TH().books(g).reduce((a, b) => a.concat(b.chapters), []);
      let ls, n, title;
      if (cid === 'all') { const B = TH().book(g, idx || this.vol(g)); ls = TH().all(g, B.vol); n = 20; title = `Kiểm tra lý thuyết – ${B.book}`; }
      else {
        const c = chs.find(x => x.id === cid); if (!c) return UI.go('theory');
        const i = +idx || 0; const p = c.practice[i] || ['Bài tập cuối chương']; ls = this.pracLessons(c, i); n = p[2] ? 8 : 12;
        title = `${p[0]} – ${CH(c)} (${this.range(ls)})`;
      }
      const qs = TH().set(ls, n);
      MA.Quiz.start(app, {
        kind: 'practice', kicker: `📘 Ôn lý thuyết SGK · ${qs.length} câu`, title, questions: qs, back: 'theory',
        restart: () => this.quiz(app, cid, idx),
        onFinish: (res) => {
          const by = {}; res.forEach(x => { const id = x.q.theory; if (!id) return; const b = by[id] || (by[id] = { n: 0, ok: 0 }); b.n++; if (x.correct) b.ok++; });
          const rows = Object.keys(by).map(id => TH().lesson(id)).sort((a, b) => a.no - b.no);
          const weak = rows.filter(l => by[l.id].ok < by[l.id].n);
          return { html: `<div class="card"><h3>📘 Kết quả theo từng bài</h3><table class="tbl"><tr><th>Bài</th><th>Đúng</th></tr>${rows.map(l => `<tr><td><a href="#/theory/${l.id}">Bài ${l.no}. ${esc(l.title)}</a></td><td><b>${by[l.id].ok}/${by[l.id].n}</b> ${by[l.id].ok === by[l.id].n ? '✅' : '⚠️'}</td></tr>`).join('')}</table>
            ${weak.length ? `<p>🎯 Nên đọc lại phần <b>Cần nhớ</b> của: ${weak.map(l => `<a href="#/theory/${l.id}">Bài ${l.no}</a>`).join(', ')}.</p>` : '<p>🌟 Con nắm chắc lý thuyết các bài này rồi!</p>'}</div>` };
        }
      });
    },

    // ---------- Lật thẻ ôn nhanh ----------
    deck(app, cid) {
      const g = this.grade(), chs = TH().books(g).reduce((a, b) => a.concat(b.chapters), []);
      const ch = chs.find(c => c.id === cid);
      const ls = ch ? ch.lessons : TH().all(g);
      const cards = shuffle(ls.reduce((a, l) => a.concat((l.cards || []).map(c => [l, c[0], c[1]])), []));
      let i = 0;
      app.innerHTML = `<nav class="crumbs"><a href="#/theory">📘 Ôn lý thuyết SGK</a> › <b>Lật thẻ ôn nhanh</b></nav>
        <div class="page-head"><h1>🃏 Lật thẻ ôn nhanh</h1><p class="muted">Đọc câu hỏi, tự trả lời trong đầu, rồi bấm vào thẻ để xem đáp án.</p>
          <div class="seg">${[['', 'Tất cả']].concat(chs.map(c => [c.id, CH(c)])).map(([id, lb]) => `<a href="#/theory/the${id ? '/' + id : ''}" class="${(cid || '') === id ? 'on' : ''}">${lb}</a>`).join('')}</div></div>
        <div class="th-deck"><div class="th-dk-n" id="dkN"></div><button class="th-flip big" type="button" id="dkCard"><span class="f"></span><span class="b"></span></button>
          <div class="btn-row center"><button class="btn ghost" id="dkPrev">← Thẻ trước</button><button class="btn" id="dkNext">Thẻ tiếp →</button></div>
          <p class="center small" id="dkFrom"></p></div>`;
      const card = $('#dkCard', app);
      const show = () => {
        const [l, q, a] = cards[i]; card.classList.remove('on');
        $('.f', card).innerHTML = '❓ ' + q; $('.b', card).innerHTML = '💡 ' + a;
        $('#dkN', app).textContent = `Thẻ ${i + 1}/${cards.length}`;
        $('#dkFrom', app).innerHTML = `<a href="#/theory/${l.id}">📖 ${esc(TH().where(l))}</a>`;
      };
      card.onclick = () => card.classList.toggle('on');
      $('#dkNext', app).onclick = () => { i = (i + 1) % cards.length; show(); };
      $('#dkPrev', app).onclick = () => { i = (i - 1 + cards.length) % cards.length; show(); };
      show();
    }
  };
})(window.MA);
