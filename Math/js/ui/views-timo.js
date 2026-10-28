/* =========================================================
 * ui/views-timo.js — LUYỆN THI TIMO
 *   #/timo          : trang chính (chọn ngôn ngữ đề, 5 phân môn, từ vựng, thi thử)
 *   #/timo/vocab    : từ điển thuật ngữ Anh – Việt (thẻ lật)
 *   #/timo/thi/<id> : thi thử 25 câu theo vòng (VIP): prelim | national | final
 * Luyện tập từng phân môn: miễn phí, dùng #/learn/<id> và #/practice/<id>.
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI; const X = MA.Timo;
  const GRADES = [1, 2, 3, 4, 5, 6];   // các lớp đã có nội dung TIMO

  MA.Views.timo = {
    // lớp TIMO đang luyện: mặc định theo lớp của học sinh, có thể chọn lớp khác ở trang TIMO
    grade() { const s = MA.UI.settings.timoGrade; if (GRADES.includes(s)) return s; const g = MA.User.current.grade; return GRADES.includes(g) ? g : GRADES[0]; },
    render(app, params) {
      if (params[0] === 'vocab') return this.vocab(app);
      if (params[0] === 'thi') return this.exam(app, params[1]);
      const u = MA.User.current, g = this.grade(); const ts = MA.Data.track('timo', g); const subj = ts.filter(t => t.subj !== 'vocab'); const voc = ts.find(t => t.subj === 'vocab');
      const lang = X.lang(); const vip = MA.Account.isVip();
      const hist = (u.history || []).filter(h => /^TIMO /.test(h.title || '')).slice(0, 6);
      app.innerHTML = `<div class="page-head"><h1>🌏 Luyện thi TIMO – Lớp ${g}</h1>
          <p class="muted">Đề TIMO chia đều <b>5 phân môn</b>: Tư duy logic · Số học · Lý thuyết số · Hình học · Tổ hợp. Vòng loại 25 câu trắc nghiệm; vòng quốc gia 25 câu và vòng quốc tế 30 câu điền đáp án.</p>
          <div class="seg tm-grade" id="tmGrade">${GRADES.map(x => `<button data-g="${x}" class="${x === g ? 'on' : ''}">Lớp ${x}${x === u.grade ? ' ⭐' : ''}</button>`).join('')}</div></div>
        <div class="card tm-lang"><b>🗣️ Ngôn ngữ đề khi luyện tập</b><div class="seg" id="tmLang">${Object.keys(X.LANGS).map(k => `<button data-v="${k}" class="${k === lang ? 'on' : ''}">${X.LANGS[k]}</button>`).join('')}</div>
          <small class="muted">Mặc định song ngữ. Khi đã quen, con thử "English + từ khoá" rồi "English" để chuẩn bị cho vòng quốc gia và vòng quốc tế.</small></div>
        <h2>📚 Ôn luyện theo phân môn <span class="tag good">Miễn phí</span></h2>
        <div class="tm-grid">${subj.map(t => this.card(t)).join('')}
          ${voc ? `<div class="tm-card"><div class="tm-ic">${voc.icon}</div><div><b>${voc.title}</b><small class="muted">${X.ALL.length} thuật ngữ thường gặp trong đề TIMO</small>${UI.masteryBar(MA.User.topic(voc.id).m, true)}</div><div class="btn-row"><a class="btn small ghost" href="#/timo/vocab">🃏 Thẻ từ</a><a class="btn small" href="#/practice/${voc.id}">✏️ Kiểm tra từ</a></div></div>` : ''}</div>
        <h2>🏁 Thi thử TIMO 3 vòng ${vip ? '' : UI.vipTag()}</h2>
        <p class="muted">Mô phỏng đúng cấu trúc đề thật: 5 phân môn, mỗi phân môn khó dần; tính giờ, chấm điểm theo phân môn và ước tính mức giải theo mốc điểm của Ban tổ chức.</p>
        <div class="tm-rounds">${X.ROUNDS.map(r => `<button class="tm-round ${vip ? '' : 'locked'}" data-r="${r.id}"><span class="tm-ri">${r.icon}</span><b>${r.name}</b><small>${r.en}</small><small class="muted">${r.desc}</small>${vip ? '' : '<small>🔒 Dành cho VIP</small>'}</button>`).join('')}</div>
        ${hist.length ? `<div class="card"><h3>🗂️ Kết quả thi thử gần đây</h3><table class="tbl"><tr><th>Đề</th><th>Đúng</th><th>Thời gian</th><th>Ngày</th></tr>${hist.map(h => `<tr><td>${esc(h.title)}</td><td><b>${h.right}/${h.total}</b></td><td>${UI.fmtTime(h.sec)}</td><td>${new Date(h.at).toLocaleDateString('vi-VN')}</td></tr>`).join('')}</table></div>` : ''}
        <p class="muted small center">Dạng bài được xây dựng theo tài liệu ôn luyện chuyên đề; đề do máy tạo mới mỗi lần, không trùng đề thi thật. Mức giải chỉ mang tính tham khảo.</p>`;
      $$('#tmGrade button', app).forEach(b => b.onclick = () => { const x = +b.dataset.g; UI.settings.timoGrade = x === u.grade ? null : x; UI.saveSettings(); this.render(app, []); });
      $$('#tmLang button', app).forEach(b => b.onclick = () => { UI.settings.timoLang = b.dataset.v; UI.saveSettings(); $$('#tmLang button', app).forEach(x => x.classList.toggle('on', x === b)); UI.toast('Đã đổi ngôn ngữ đề: ' + X.LANGS[b.dataset.v]); });
      $$('.tm-round', app).forEach(b => b.onclick = () => { if (!MA.Account.isVip()) return UI.vipModal('Thi thử TIMO 3 vòng (vòng loại · vòng quốc gia · vòng quốc tế) dành cho tài khoản VIP.'); UI.go('timo/thi/' + b.dataset.r); });
    },
    card(t) {
      const p = MA.User.topic(t.id); const s = X.SUBJ[t.subj];
      return `<div class="tm-card"><div class="tm-ic">${t.icon}</div><div><b>${s.vi}</b> <small class="muted">${s.en}</small><small class="muted">${t.tagline}</small>${UI.masteryBar(p.m, true)}<small class="muted">${t.gens.length} dạng bài${p.n ? ` · ${p.c}/${p.n} câu đúng` : ''}</small></div>
        <div class="btn-row"><a class="btn small ghost" href="#/learn/${t.id}">📖 Học</a><a class="btn small" href="#/practice/${t.id}">✏️ Luyện</a></div></div>`;
    },

    // ---------- Từ điển thẻ lật ----------
    vocab(app) {
      const subj = Object.keys(X.GLOSS); let cur = subj[0];
      const draw = () => {
        $('#tmVoc', app).innerHTML = X.GLOSS[cur].map(([en, vi]) => `<button class="tm-flip" type="button"><span class="f">${esc(en)}</span><span class="b">${esc(vi)}</span></button>`).join('');
        $$('.tm-flip', app).forEach(b => b.onclick = () => { b.classList.toggle('on'); if (b.classList.contains('on')) return; MA.Sound.speakEn && MA.Sound.speakEn($('.f', b).textContent); });
      };
      app.innerHTML = `<nav class="crumbs"><a href="#/timo">🌏 Luyện thi TIMO</a> › <b>Từ vựng</b></nav>
        <div class="page-head"><h1>🔤 Từ vựng TIMO</h1><p class="muted">Bấm vào thẻ để lật xem nghĩa tiếng Việt; bấm lần nữa để nghe đọc tiếng Anh.</p></div>
        <div class="seg" id="tmSub">${subj.map(k => `<button data-v="${k}" class="${k === cur ? 'on' : ''}">${X.SUBJ[k].icon} ${X.SUBJ[k].vi}</button>`).join('')}</div>
        <div class="tm-vocab" id="tmVoc"></div>
        <div class="btn-row center"><a class="btn big" href="#/practice/tm${this.grade()}_vocab">✏️ Kiểm tra từ vựng</a><a class="btn big ghost" href="#/timo">← Về trang TIMO</a></div>`;
      $$('#tmSub button', app).forEach(b => b.onclick = () => { cur = b.dataset.v; $$('#tmSub button', app).forEach(x => x.classList.toggle('on', x === b)); draw(); });
      draw();
    },

    // ---------- Thi thử theo vòng (VIP) ----------
    exam(app, rid) {
      const r = X.ROUNDS.find(x => x.id === (rid === 'heat' ? 'prelim' : rid));
      if (!r) return UI.go('timo');
      if (!MA.Account.isVip()) { UI.vipModal('Thi thử TIMO dành cho tài khoản VIP.'); return UI.go('timo'); }
      const g = this.grade(); const qs = X.buildExam(g, r);
      if (!qs.length) { UI.toast('Chưa có câu hỏi TIMO cho lớp này.', 'bad'); return UI.go('timo'); }
      MA.Quiz.start(app, {
        kind: 'exam', kicker: `🌏 TIMO · ${r.en} · ${X.LANGS[r.lang]} · ${qs.length} câu · ${r.time} phút`, title: `TIMO ${r.name} – Lớp ${g}`, questions: qs, timeLimit: r.time * 60, back: 'timo',
        restart: () => this.exam(app, rid),
        onFinish: (res) => {
          const by = {}; Object.keys(X.SUBJ).forEach(k => by[k] = { n: 0, ok: 0 });
          res.forEach(x => { const k = x.q.subj; if (by[k]) { by[k].n++; if (x.correct) by[k].ok++; } });
          const right = res.filter(x => x.correct).length; const pts = right * r.pts, maxPts = res.length * r.pts; const m = X.medal(r, pts);
          const weak = Object.keys(by).filter(k => by[k].n).sort((a, b) => by[a].ok / by[a].n - by[b].ok / by[b].n)[0];
          const html = `<div class="card tm-res"><h3>🌏 Kết quả TIMO ${esc(r.name)}</h3>
            <div class="tm-medal"><span>${m ? m[0] : r.medals ? '💪' : '📋'}</span><div><b>${pts}/${maxPts} điểm</b><small class="muted">${right}/${res.length} câu đúng × ${r.pts} điểm</small>${m ? `<b>${m[1]} (ước tính)</b>` : r.medals ? `<small>Chưa đạt mức giải · cần ${r.medals[3]} điểm để đạt Khuyến khích</small>` : '<small class="muted">Vòng loại không xét huy chương — kết quả dùng để xét vào vòng quốc gia.</small>'}</div></div>
            <table class="tbl"><tr><th>Phân môn</th><th>Đúng</th><th></th></tr>${Object.keys(by).filter(k => by[k].n).map(k => `<tr><td>${X.SUBJ[k].icon} ${X.SUBJ[k].vi} <small class="muted">${X.SUBJ[k].en}</small></td><td><b>${by[k].ok}/${by[k].n}</b></td><td>${UI.masteryBar(Math.round(by[k].ok / by[k].n * 100), true)}</td></tr>`).join('')}</table>
            ${weak && by[weak].ok < by[weak].n ? `<p>🎯 Nên luyện thêm: <a href="#/learn/tm${g}_${weak}"><b>${X.SUBJ[weak].vi}</b></a></p>` : ''}
            ${r.medals ? `<p class="muted small">Mốc giải ${esc(r.name)} (theo BTC, có thể thay đổi theo năm): Vàng ≥ ${r.medals[0]} · Bạc ≥ ${r.medals[1]} · Đồng ≥ ${r.medals[2]} · Khuyến khích ≥ ${r.medals[3]} điểm.</p>` : ''}</div>`;
          return { html };
        }
      });
    }
  };
})(window.MA);
