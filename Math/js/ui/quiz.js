/* =========================================================
 * ui/quiz.js — BỘ MÁY LÀM BÀI dùng chung cho: Luyện tập, Ôn tập, Thử thách
 * hằng ngày, Sổ lỗi sai, Kiểm tra, Thử ngay trong bài học.
 *  - Chế độ "practice": chấm ngay từng câu, có gợi ý, lời giải + hình minh họa
 *  - Chế độ "exam": làm hết rồi nộp bài, có đếm giờ, chấm thang điểm 10
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI;
  const LETTERS = 'ABCD';

  // ---------------- Lời giải chi tiết ----------------
  function solutionHTML(q, open = true) {
    return `<details class="solution" ${open ? 'open' : ''}><summary>📘 Cách giải chi tiết</summary>
      ${q.hint ? `<div class="tip">🦉 <b>Mẹo:</b> ${q.hint}</div>` : ''}
      <ol class="steps">${(q.steps || []).map(s => `<li>${s}</li>`).join('')}</ol>
      ${MA.Vis.render(q.solVisual)}
      <div class="sol-foot"><span>Đáp án: <b>${q.type === 'mc' ? q.options[q.correct] : q.answerText}${q.unit && q.type !== 'mc' ? ' ' + q.unit : ''}</b></span>
      ${q.topicId ? `<button class="link peek" data-peek="${q.topicId}">📖 Ôn lại bài “${esc(MA.Data.topic(q.topicId) ? MA.Data.topic(q.topicId).title : '')}”</button>` : ''}</div></details>`;
  }

  // ---------------- Câu hỏi tương tác: bấm vào tia số / tô màu hình ----------------
  // q.input = { kind: 'nline', min, max, step, labels? } | { kind: 'shade', d }   (q.type vẫn là 'num', đáp án là số)
  function widgetHTML(q) {
    const w = q.input;
    if (w.kind === 'nline') {
      const n = Math.round((w.max - w.min) / w.step); let t = '';
      for (let i = 0; i <= n; i++) { const v = +(w.min + i * w.step).toFixed(6); const lab = i === 0 || i === n || (w.labels || []).includes(v) ? MA.U.fmt(v) : ''; t += `<button type="button" class="nl-t" data-v="${v}" aria-label="Vạch ${i + 1}"><i></i><span>${lab}</span></button>`; }
      return `<div class="iw nline">${t}</div><div class="muted small">👆 Bấm vào vạch đúng trên tia số.</div>`;
    }
    let c = ''; for (let i = 0; i < w.d; i++) c += `<button type="button" class="sh-c" data-i="${i}" aria-label="Phần ${i + 1}"></button>`;
    return `<div class="iw shade" style="--d:${w.d}">${c}</div><div class="muted small">👆 Bấm vào các phần để tô màu · Đã tô: <b class="sh-n">0</b>/${w.d} phần</div>`;
  }
  function bindWidget(card, q, init, onChange) {
    const w = q.input; const locked = () => card.classList.contains('answered');
    if (w.kind === 'nline') {
      const bs = $$('.nl-t', card); const sel = (v) => bs.forEach(b => b.classList.toggle('on', b.dataset.v === String(v)));
      if (init != null && init !== '') sel(init);
      bs.forEach(b => b.onclick = () => { if (locked()) return; sel(b.dataset.v); MA.Sound.click(); onChange(b.dataset.v); });
      return { reveal() { bs.forEach(b => { if (Math.abs(+b.dataset.v - q.answer) < 1e-9) b.classList.add('right'); }); } };
    }
    const cs = $$('.sh-c', card); const nEl = $('.sh-n', card);
    const count = () => cs.filter(c => c.classList.contains('on')).length;
    if (+init > 0) cs.slice(0, +init).forEach(c => c.classList.add('on'));
    nEl.textContent = count();
    cs.forEach(c => c.onclick = () => { if (locked()) return; c.classList.toggle('on'); MA.Sound.click(); nEl.textContent = count(); onChange(String(count())); });
    return { reveal() {} };
  }

  // ---------------- Nút gắn cờ câu khó ----------------
  function flagBtn(q) {
    const on = MA.User.isFlagged(q); const kid = !!(MA.User.current && MA.User.current.grade <= 3);
    return `<button class="icon-btn flag-btn ${kid ? 'wide' : ''} ${on ? 'on' : ''}" data-act="flag" aria-pressed="${on}" title="Gắn cờ: câu này khó, cần luyện thêm">🚩${kid ? '<span>Câu này khó</span>' : ''}</button>`;
  }

  // ---------------- Hiển thị 1 câu hỏi ----------------
  // opts: { mode, no, total, label, state:{value, done}, onAnswer(correct, meta), exam }
  function mount(el, q, opts = {}) {
    const st = opts.state || {};
    const isFrac = q.type !== 'mc' && /\//.test(String(q.answer));
    const kid = !!(MA.User.current && MA.User.current.grade <= 2) && typeof q.answer === 'number' && !q.input;   // lớp 1–2: bàn phím số to trên màn hình
    el.innerHTML = `<div class="qcard ${opts.exam ? 'exam' : ''}">
      <div class="q-meta"><span class="q-no">${opts.label ? `<span class="tag warm">${opts.label}</span>` : ''}Câu ${opts.no || 1}${opts.total ? '/' + opts.total : ''}</span>${UI.levelTag(q.level || 1)}<span class="q-topic">${esc(q.topicTitle || '')}</span>
        <span class="q-tools-top">${flagBtn(q)}<button class="icon-btn" data-act="read" title="Cô đọc đề">🔊</button><button class="icon-btn" data-act="pad" title="Bảng nháp">✍️</button>${!opts.exam ? '<button class="icon-btn" data-act="peek" title="Xem lại bài học">📖</button>' : ''}</span></div>
      <div class="q-text">${q.text}</div>
      ${MA.Vis.render(q.visual)}
      ${q.type === 'mc'
        ? `<div class="opts ${q.options.length <= 3 && q.options.every(o => o.length <= 3) ? 'compact' : ''}">${q.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="ol">${LETTERS[i]}</span><span class="ot">${o}</span></button>`).join('')}</div>`
        : q.input ? `${widgetHTML(q)}<div class="ans-row"><input class="ans" type="hidden">${!opts.exam ? '<button class="btn check">Kiểm tra</button>' : ''}</div>`
        : `<div class="ans-row"><input class="ans" type="text" inputmode="${isFrac ? 'text' : 'decimal'}" autocomplete="off" placeholder="${isFrac ? 'Nhập dạng a/b' : 'Nhập đáp số'}" aria-label="Đáp số">${q.unit ? `<span class="unit">${q.unit}</span>` : ''}${!opts.exam ? '<button class="btn check">Kiểm tra</button>' : ''}</div>
           ${kid && !isFrac ? `<div class="kp">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button type="button" data-k="${d}">${d}</button>`).join('')}<button type="button" data-k="del" aria-label="Xóa">⌫</button></div>` : `<div class="muted small">${isFrac ? 'Viết phân số tối giản, ví dụ 3/4 hoặc −2/5' : (MA.User.current && MA.User.current.grade >= 4 ? 'Số thập phân có thể dùng dấu phẩy, ví dụ 2,5' : '')}</div>`}`}
      ${!opts.exam ? `<div class="q-help"><button class="btn ghost small" data-act="hint">💡 Gợi ý</button><button class="btn ghost small" data-act="show">👀 Xem lời giải</button></div><div class="hint-box"></div>` : ''}
      <div class="feedback"></div></div>`;
    const card = $('.qcard', el);
    let widget = null;
    $$('.kp button', card).forEach(b => b.onclick = () => { if (card.classList.contains('answered')) return; const inp = $('.ans', card); inp.value = b.dataset.k === 'del' ? inp.value.slice(0, -1) : (inp.value + b.dataset.k).slice(0, 7); inp.dispatchEvent(new Event('input')); MA.Sound.click(); });
    if (q.input) widget = bindWidget(card, q, st.value, (v) => { $('.ans', card).value = v; if (opts.exam && opts.onPick) opts.onPick(v); });
    let done = false, hint = false, lastOk = null; const t0 = Date.now();
    const fl = $('[data-act=flag]', card);
    fl.onclick = () => {
      const on = MA.User.toggleFlag(q, { src: opts.src || (opts.exam ? 'exam' : 'practice'), ok: done ? lastOk : null });
      fl.classList.toggle('on', on); fl.setAttribute('aria-pressed', on);
      if (!opts.exam) { MA.Sound.click(); UI.toast(on ? '🚩 Đã ghi lại! Mình sẽ cùng luyện dạng này nhé.' : 'Đã bỏ cờ câu này.', on ? 'good' : ''); }
    };

    const finish = (val) => {
      if (done) return; done = true;
      const correct = MA.U.checkAnswer(q, val); lastOk = correct;
      card.classList.add('answered', correct ? 'right' : 'wrong');
      if (widget) widget.reveal();
      if (q.type === 'mc') $$('.opt', card).forEach((b, i) => { b.disabled = true; if (i === q.correct) b.classList.add('correct'); if (i === Number(val) && !correct) b.classList.add('chosen-wrong'); });
      else { const inp = $('.ans', card); inp.disabled = true; inp.classList.add(correct ? 'ok' : 'no'); const cb = $('.check', card); if (cb) cb.remove(); }
      $$('[data-act=hint],[data-act=show]', card).forEach(b => b.remove());
      const sec = (Date.now() - t0) / 1000;
      const gained = opts.onAnswer ? opts.onAnswer(correct, { hint, sec, value: val }) : 0;
      const fb = $('.feedback', card);
      if (correct) { MA.Sound.correct(); fb.innerHTML = `<div class="fb good">🎉 <b>${MA.U.pick(['Chính xác!', 'Giỏi quá!', 'Tuyệt vời!', 'Đúng rồi!', 'Xuất sắc!'])}</b>${gained ? ` <span class="xp">+${gained} XP</span>` : ''}</div>${solutionHTML(q, false)}`; }
      else { MA.Sound.wrong(); fb.innerHTML = `<div class="fb bad">💪 <b>Chưa đúng rồi!</b> Đáp án đúng là <b>${q.type === 'mc' ? q.options[q.correct] : q.answerText + (q.unit ? ' ' + q.unit : '')}</b>. Con xem cách giải nhé:</div>${solutionHTML(q, true)}`; }
      if (!correct && val !== '\u0000' && MA.Tutor) { const dg = MA.Tutor.diagnose(q, val); const fbb = $('.fb.bad', fb); if (dg && fbb) fbb.insertAdjacentHTML('afterend', `<div class="tip diag">${dg.icon} ${dg.text}</div>`); }
      $$('.peek', fb).forEach(b => b.onclick = () => UI.lessonPeek(b.dataset.peek));
      if (opts.afterFeedback) opts.afterFeedback(fb, correct);
    };

    // Chế độ kiểm tra: chỉ lưu lựa chọn
    if (opts.exam) {
      if (q.type === 'mc') {
        $$('.opt', card).forEach(b => { if (String(st.value) === b.dataset.i) b.classList.add('picked'); b.onclick = () => { $$('.opt', card).forEach(x => x.classList.remove('picked')); b.classList.add('picked'); MA.Sound.click(); opts.onPick && opts.onPick(b.dataset.i); }; });
      } else { const inp = $('.ans', card); inp.value = st.value || ''; inp.oninput = () => opts.onPick && opts.onPick(inp.value); if (!q.input) setTimeout(() => inp.focus(), 50); }
    } else {
      if (q.type === 'mc') $$('.opt', card).forEach(b => b.onclick = () => finish(b.dataset.i));
      else {
        const inp = $('.ans', card); if (!q.input) setTimeout(() => inp.focus({ preventScroll: true }), 50);
        const go = () => { if (!inp.value.trim()) { UI.toast('Con hãy nhập đáp số trước nhé!'); inp.focus(); return; } finish(inp.value); };
        $('.check', card).onclick = go; inp.onkeydown = (e) => { if (e.key === 'Enter') go(); };
      }
      const hb = $('.hint-box', card);
      $('[data-act=hint]', card).onclick = (e) => { hint = true; hb.innerHTML = `<div class="tip">💡 <b>Gợi ý:</b> ${q.hint || 'Đọc kĩ đề và xác định dạng bài nhé!'}${q.steps && q.steps.length > 1 ? `<div class="muted small">Bước đầu tiên: ${q.steps[0]}</div>` : ''}</div>`; e.target.remove(); };
      $('[data-act=show]', card).onclick = () => UI.confirm('Xem lời giải thì câu này sẽ được tính là chưa đúng. Con chắc chắn chứ?', () => finish('\u0000'));
    }
    $('[data-act=read]', card).onclick = () => { if (MA.Sound.speaking()) return MA.Sound.stop(); const opts = q.type === 'mc' ? q.options.map((o, i) => `${LETTERS[i]}: ${o}`) : [];
      if (q.say && MA.Sound.speakSay) MA.Sound.speakSay(q.say, opts); else MA.Sound.speak([q.text].concat(opts)); };   // đề TIMO: đọc tiếng Anh bằng giọng Anh
    $('[data-act=pad]', card).onclick = () => MA.Scratchpad.open();
    const pk = $('[data-act=peek]', card); if (pk) pk.onclick = () => UI.lessonPeek(q.topicId);
    // Không tự đọc đề: cô chỉ đọc khi con bấm nút 🔊
    return { finish, card };
  }

  // ---------------- Câu hỏi nhúng trong bài học ----------------
  function inline(el, qs, opts = {}) {
    let i = 0, right = 0;
    const step = () => {
      if (i >= qs.length) { el.insertAdjacentHTML('beforeend', `<div class="fb ${right === qs.length ? 'good' : ''}">Kết quả ${opts.title || ''}: <b>${right}/${qs.length}</b> câu đúng. ${right === qs.length ? 'Con đã nắm chắc bài! 🌟' : 'Hãy luyện tập thêm nhé! 💪'}</div>`); if (opts.onDone) opts.onDone(right, qs.length); return; }
      const box = document.createElement('div'); el.appendChild(box);
      mount(box, qs[i], { no: i + 1, total: qs.length, src: 'lesson', onAnswer: (c, m) => { if (c) right++; return MA.User.record(qs[i], c, { hint: m.hint, sec: m.sec, value: m.value }); },
        afterFeedback: (fb) => { const b = document.createElement('button'); b.className = 'btn small'; b.textContent = i < qs.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'; fb.appendChild(b); b.onclick = () => { b.remove(); i++; step(); }; } });
    };
    step();
  }

  // ---------------- Phiên làm bài ----------------
  // cfg: { title, kind: practice|exam|daily|smart|mistakes|lower, questions?, next?(i) , count, timeLimit, speed, back, warmup? }
  function start(app, cfg) {
    const S = { i: 0, list: [], res: [], combo: 0, xp: 0, t0: Date.now(), timer: null, picks: {} };
    const exam = cfg.kind === 'exam' || cfg.kind === 'daily' || cfg.kind === 'placement';
    if (cfg.questions) S.list = cfg.questions.slice();
    const total = cfg.questions ? cfg.questions.length : cfg.count;
    const getQ = (i) => { if (!S.list[i] && cfg.next) S.list[i] = cfg.next(i); return S.list[i]; };
    const stop = () => { clearInterval(S.timer); S.timer = null; };
    window.addEventListener('hashchange', stop, { once: true });
    // rời màn hình làm bài → thoát chế độ tập trung (vẫn nhớ lựa chọn cho lần sau)
    window.addEventListener('hashchange', () => { if (UI.focus.on) { UI.focus.exit(); } }, { once: true });

    app.innerHTML = `<div class="quiz">
      <div class="quiz-head"><div><small>${cfg.kicker || ''}</small><h2>${cfg.title}</h2></div>
        <div class="qh-stats">${exam ? `<span class="timer" id="qTimer">⏱ --:--</span>` : `<span id="qCombo" class="combo">🔥 0</span><span id="qXp" class="xp">+0 XP</span>${cfg.speed ? '<span class="timer" id="qTimer">⏱ 30</span>' : ''}`}
        ${UI.focus.button()}<button class="btn ghost small" id="qQuit">✕ Thoát</button></div></div>
      <div class="progress"><i id="qProg"></i></div>
      ${exam ? '<div class="navgrid" id="qNav"></div>' : ''}
      <div id="qBox"></div>
      <div class="quiz-foot" id="qFoot"></div></div>`;
    const box = $('#qBox', app), foot = $('#qFoot', app);
    if (UI.settings.focus && !UI.focus.on) UI.focus.enter(); else UI.focus.sync();
    $('#qQuit', app).onclick = () => UI.confirm(exam ? 'Thoát bây giờ thì bài kiểm tra sẽ không được chấm. Con muốn thoát?' : 'Con muốn dừng luyện tập? Kết quả các câu đã làm vẫn được lưu.', () => { stop(); if (!exam && S.res.length) showResult(); else UI.go(cfg.back || 'home'); });
    const prog = () => { $('#qProg', app).style.width = ((exam ? Object.keys(S.picks).length : S.res.length) / total * 100) + '%'; };

    // ---- Chế độ luyện tập: từng câu, chấm ngay ----
    function showPractice() {
      prog();
      if (S.i >= total) return showResult();
      const q = getQ(S.i); if (!q) { S.i++; return showPractice(); }
      let remain = 30;
      const api = mount(box, q, {
        no: S.i + 1, total, label: q.warm ? '🔙 Ôn bài cũ' : (q.flagTag || q.mtag || ''), src: cfg.kind,
        onAnswer: (correct, m) => {
          stop(); S.combo = correct ? S.combo + 1 : 0;
          const fast = cfg.speed && m.sec < 12;
          const g = MA.User.record(q, correct, { hint: m.hint, fast, sec: m.sec, value: m.value, combo: S.combo, fromMistakes: cfg.kind === 'mistakes' || !!q.fromMistake });
          S.xp += g; S.res.push({ q, correct, value: m.value, hint: m.hint });
          $('#qCombo', app).textContent = '🔥 ' + S.combo; $('#qXp', app).textContent = '+' + S.xp + ' XP';
          if (S.combo && S.combo % 5 === 0) UI.toast(`🔥 Combo ${S.combo} câu đúng liên tiếp! +5 XP thưởng`, 'good');
          prog(); return g;
        },
        afterFeedback: (fb) => {
          foot.innerHTML = `<button class="btn big" id="qNext">${S.i < total - 1 ? 'Câu tiếp theo →' : 'Xem kết quả 🏁'}</button>`;
          const nx = $('#qNext', foot); nx.focus({ preventScroll: true });
          nx.onclick = () => { foot.innerHTML = ''; S.i++; showPractice(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        }
      });
      if (cfg.speed) {
        const tEl = $('#qTimer', app); tEl.textContent = '⏱ 30'; tEl.classList.remove('low');
        S.timer = setInterval(() => { remain--; tEl.textContent = '⏱ ' + remain; tEl.classList.toggle('low', remain <= 5); if (remain <= 0) { stop(); UI.toast('⏰ Hết giờ cho câu này!'); api.finish('\u0000'); } }, 1000);
      }
    }

    // ---- Chế độ kiểm tra: làm hết rồi nộp ----
    function showExam() {
      for (let i = 0; i < total; i++) getQ(i);
      const nav = $('#qNav', app);
      const drawNav = () => { nav.innerHTML = S.list.map((q, i) => `<button class="${i === S.i ? 'cur' : ''} ${S.picks[i] != null && S.picks[i] !== '' ? 'done' : ''}" data-i="${i}">${i + 1}</button>`).join(''); $$('button', nav).forEach(b => b.onclick = () => { S.i = +b.dataset.i; drawQ(); }); };
      const drawQ = () => {
        mount(box, S.list[S.i], { exam: true, src: cfg.kind, no: S.i + 1, total, state: { value: S.picks[S.i] }, onPick: (v) => { S.picks[S.i] = v; drawNav(); prog(); } });
        foot.innerHTML = `<button class="btn ghost" id="ePrev" ${S.i ? '' : 'disabled'}>← Câu trước</button><button class="btn" id="eNext">${S.i < total - 1 ? 'Câu sau →' : 'Nộp bài 📤'}</button>`;
        $('#ePrev', foot).onclick = () => { S.i--; drawQ(); };
        $('#eNext', foot).onclick = () => { if (S.i < total - 1) { S.i++; drawQ(); } else submit(); };
        drawNav();
      };
      const submit = (force) => {
        const left = total - Object.keys(S.picks).filter(k => S.picks[k] !== '').length;
        const doIt = () => {
          stop();
          S.list.forEach((q, i) => { const v = S.picks[i]; const c = v != null && v !== '' && MA.U.checkAnswer(q, v); S.res.push({ q, correct: c, value: v }); S.xp += MA.User.record(q, c, { sec: (Date.now() - S.t0) / 1000 / total, value: v, noMistake: cfg.kind === 'placement' }); });
          showResult();
        };
        if (force || !left) doIt(); else UI.confirm(`Con còn <b>${left}</b> câu chưa làm. Vẫn nộp bài chứ?`, doIt);
      };
      if (cfg.timeLimit) {
        const end = Date.now() + cfg.timeLimit * 1000; const tEl = $('#qTimer', app);
        const tick = () => { const r = (end - Date.now()) / 1000; tEl.textContent = '⏱ ' + UI.fmtTime(r); tEl.classList.toggle('low', r < 60); if (r <= 0) { UI.toast('⏰ Hết giờ! Bài được nộp tự động.'); submit(true); } };
        tick(); S.timer = setInterval(tick, 1000);
      } else $('#qTimer', app).textContent = '';
      drawQ();
    }

    // ---- Kết quả ----
    function showResult() {
      stop(); MA.Sound.stop();
      const n = S.res.length, right = S.res.filter(r => r.correct).length;
      const score = n ? Math.round(right / n * 100) / 10 : 0;
      const sec = (Date.now() - S.t0) / 1000;
      let bonus = 0;
      if (cfg.kind === 'daily' && !MA.User.dailyDone()) bonus = 50;
      MA.User.addHistory({ kind: cfg.kind, title: cfg.title, score, right, total: n, sec });
      if (bonus) { S.xp += MA.User.addXp(bonus); }
      const fin = cfg.onFinish ? (cfg.onFinish(S.res, score) || {}) : {};
      if (fin.xp) { S.xp += MA.User.addXp(fin.xp); bonus += fin.xp; }
      const msg = score >= 9 ? ['🏆', 'Xuất sắc!', 'Con làm bài rất tuyệt vời!'] : score >= 7 ? ['🌟', 'Giỏi lắm!', 'Chỉ cần cẩn thận thêm một chút nữa thôi!'] : score >= 5 ? ['👍', 'Khá tốt!', 'Xem lại các câu sai và ôn bài nhé!'] : ['💪', 'Cố gắng lên!', 'Con hãy ôn lại bài học rồi luyện tập thêm nhé!'];
      if (score >= 8) { MA.Sound.complete(); UI.confetti(); }
      const weak = {}; S.res.filter(r => !r.correct).forEach(r => weak[r.q.topicId] = (weak[r.q.topicId] || 0) + 1);
      const weakT = Object.keys(weak).map(MA.Data.topic).filter(Boolean);
      app.innerHTML = `<div class="result">
        <div class="res-head card"><div class="res-emoji">${msg[0]}</div><div><h1>${msg[1]}</h1><p>${msg[2]}</p></div>
          <div class="res-score"><b>${String(score).replace('.', ',')}</b><small>/ 10 điểm</small></div></div>
        <div class="res-stats"><div><b>${right}/${n}</b><small>câu đúng</small></div><div><b>${UI.fmtTime(sec)}</b><small>thời gian</small></div><div><b>+${S.xp}</b><small>XP${bonus ? ` (gồm +${bonus} thưởng)` : ''}</small></div><div><b>${MA.User.rankOf(MA.User.gradeXp()).icon} ${MA.User.gradeXp()}</b><small>XP ${MA.Data.grade(MA.User.current.grade).name}</small></div></div>
        ${fin.html || ''}
        ${weakT.length ? `<div class="card soft"><h3>🔁 Nên ôn lại</h3><div class="btn-row">${weakT.map(t => `<button class="btn ghost" data-peek="${t.id}">${t.icon} ${t.title} (${weak[t.id]} câu sai)</button>`).join('')}</div></div>` : ''}
        <div class="btn-row center">
          <button class="btn big" id="rAgain">🔄 Làm bộ khác</button>
          ${S.res.some(r => !r.correct) ? '<a class="btn big ghost" href="#/review/mistakes">📒 Sửa lỗi sai</a><button class="btn big ghost" id="rFlagAll">🚩 Gắn cờ tất cả câu sai</button>' : ''}
          <a class="btn big ghost" href="#/review/flags">🚩 Cờ của con</a>
          ${score >= 8 && n >= 10 ? '<button class="btn big ghost" id="rCert">🎖️ In giấy khen</button>' : ''}
          <a class="btn big ghost" href="#/home">🏠 Trang chủ</a></div>
        <h2>Xem lại bài làm</h2>
        <div class="review-list">${S.res.map((r, i) => `<details class="rv ${r.correct ? 'ok' : 'no'}"><summary><span class="rv-mark">${r.correct ? '✔' : '✘'}</span><span class="rv-q">Câu ${i + 1}: ${r.q.text}</span></summary>
          <div class="rv-body">${MA.Vis.render(r.q.visual)}<p>Con trả lời: <b>${r.value == null || r.value === '' || r.value === '\u0000' ? '(bỏ trống / xem lời giải)' : r.q.type === 'mc' ? (r.q.options[+r.value] || '') : esc(r.value)}</b></p>${solutionHTML(r.q, !r.correct)}<button class="btn small ghost flag-tg" data-fl="${i}"></button></div></details>`).join('')}</div></div>`;
      $$('[data-peek]', app).forEach(b => b.onclick = () => UI.lessonPeek(b.dataset.peek));
      $('#rAgain', app).onclick = () => cfg.restart ? cfg.restart() : UI.route();
      // gắn cờ ở màn kết quả (từng câu hoặc tất cả câu sai)
      const flSet = (b) => { const on = MA.User.isFlagged(S.res[+b.dataset.fl].q); b.classList.toggle('on', on); b.textContent = on ? '🚩 Đã gắn cờ · bấm để bỏ' : '🚩 Gắn cờ câu này'; };
      $$('[data-fl]', app).forEach(b => { flSet(b); b.onclick = () => { const r = S.res[+b.dataset.fl]; MA.User.toggleFlag(r.q, { src: cfg.kind, ok: r.correct }); flSet(b); }; });
      const fa = $('#rFlagAll', app); if (fa) fa.onclick = () => { let k = 0; S.res.forEach(r => { if (!r.correct && !MA.User.isFlagged(r.q)) { MA.User.flag(r.q, { src: cfg.kind, ok: false }); k++; } }); $$('[data-fl]', app).forEach(flSet); UI.toast(k ? `🚩 Đã gắn cờ ${k} câu sai` : 'Các câu sai đều đã được gắn cờ rồi', 'good'); };
      const cb = $('#rCert', app); if (cb) cb.onclick = () => certificate(cfg.title, score, right, n);
      window.scrollTo(0, 0);
    }

    if (exam) showExam(); else showPractice();
  }

  // ---------------- Giấy khen ----------------
  function certificate(title, score, right, n) {
    const u = MA.User.current; const g = MA.Data.grade(u.grade);
    const w = document.getElementById('printArea');
    w.innerHTML = `<div class="cert"><div class="cert-in"><img src="assets/award.jpg" alt=""><h1>GIẤY KHEN</h1><p class="c-sub">Toán Vui 1–6 trân trọng khen ngợi</p>
      <div class="c-name">${MA.U.av(u.avatar)} ${esc(u.name)}</div><p>Học sinh ${g.name} đã hoàn thành xuất sắc</p><h2>${esc(title)}</h2>
      <p>với kết quả <b>${right}/${n}</b> câu đúng – đạt <b>${String(score).replace('.', ',')} điểm</b></p>
      <p class="c-date">Ngày ${new Date().toLocaleDateString('vi-VN')}</p><div class="c-sign">Cô giáo Cú Thông Thái 🦉</div></div></div>`;
    // Ép khổ A4 ngang chỉ trong lúc in giấy khen (phiếu bài tập vẫn A4 dọc)
    let st = document.getElementById('certPage');
    if (!st) { st = document.createElement('style'); st.id = 'certPage'; document.head.appendChild(st); }
    st.textContent = '@page { size: A4 landscape; size: 297mm 210mm; margin: 0; }';
    const root = document.documentElement; let done = false;
    const cleanup = () => { if (done) return; done = true; document.body.classList.remove('printing-cert'); root.classList.remove('printing-cert'); st.textContent = ''; window.removeEventListener('afterprint', cleanup); };
    root.classList.add('printing-cert'); document.body.classList.add('printing-cert');
    window.addEventListener('afterprint', cleanup);
    // Đợi ảnh và phông tải xong rồi mới in (tránh giấy khen thiếu hình / sai cỡ chữ)
    const img = w.querySelector('img');
    const imgReady = img && !img.complete ? new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 2000); }) : Promise.resolve();
    const fontReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.all([imgReady, fontReady]).then(() => requestAnimationFrame(() => { window.print(); setTimeout(() => { if (!window.matchMedia('print').matches) cleanup(); }, 60000); }));
  }

  MA.Quiz = { mount, inline, start, solutionHTML, certificate };
})(window.MA);
