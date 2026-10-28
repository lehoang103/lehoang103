/* =========================================================
 * ui/views-tools.js — PHIẾU IN A4 · BẢNG XẾP HẠNG & HỒ SƠ · BẢNG NHÁP
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI;

  // ------------------------------ PHIẾU IN ------------------------------
  MA.Views.worksheet = {
    render(app) {
      const u = MA.User.current; const g = MA.Data.grade(u.grade);
      const st = { title: `PHIẾU ÔN TẬP TOÁN ${g.name.toUpperCase()}`, sel: new Set(MA.Data.topics(g.grade).filter(t => !MA.Content.topicLocked(t)).map(t => t.id)), n: 10, level: 0, key: true, vis: true, time: 40 };
      app.innerHTML = `<div class="page-head no-print"><h1>🖨️ Tạo phiếu bài tập in A4</h1><p class="muted">Tạo đề ngẫu nhiên kèm trang đáp án để cha mẹ / thầy cô in cho con làm trên giấy.</p></div>
        <div class="card setup no-print">
          <div class="grid2"><label class="fld"><span>Tiêu đề phiếu</span><input id="wTitle" value="${esc(st.title)}"></label>
          <label class="fld"><span>Thời gian làm bài (phút)</span><input id="wTime" type="number" min="5" max="120" value="${st.time}"></label></div>
          <div class="fld"><span>Chủ đề</span><div class="chips" id="wTopics">${MA.Data.topics(g.grade).filter(t => !MA.Content.topicLocked(t)).map(t => `<button class="chip on" data-id="${t.id}">${t.icon} ${t.title}</button>`).join('')}</div></div>
          <div class="grid2"><div class="fld"><span>Số câu</span><div class="seg" id="wN">${[10, 15, 20, 30].map(v => `<button data-v="${v}" class="${v === 10 ? 'on' : ''}">${v}</button>`).join('')}</div></div>
          <div class="fld"><span>Mức độ</span><div class="seg" id="wL">${[[0, 'Tăng dần'], [1, 'Cơ bản'], [2, 'Vận dụng'], [3, 'Nâng cao']].map(([v, l]) => `<button data-v="${v}" class="${v ? '' : 'on'}">${l}</button>`).join('')}</div></div></div>
          <div class="card soft" id="wCoverage"></div>
          <div class="btn-row"><label class="check"><input type="checkbox" id="wKey" checked> Kèm trang đáp án & lời giải</label><label class="check"><input type="checkbox" id="wVis" checked> In hình minh họa</label></div>
          <div class="btn-row"><button class="btn big" id="wGen">🎲 Tạo đề</button><button class="btn big ghost" id="wPrint">🖨️ In phiếu</button></div>
        </div>
        <div id="wsOut"></div>`;
      const seg = (id, fn) => $$('#' + id + ' button', app).forEach(b => b.onclick = () => { $$('#' + id + ' button', app).forEach(x => x.classList.toggle('on', x === b)); fn(+b.dataset.v); gen(); });
      seg('wN', v => st.n = v); seg('wL', v => st.level = v);
      const updateCoverage = () => {
        const selected = [...st.sel].map(MA.Data.topic).filter(Boolean);
        const counts = (t) => [1, 2, 3].map(l => (t.gens || []).filter(x => (!MA.Content || MA.Content.genAllowed(t, x)) && x.level === l).length);
        $('#wCoverage', app).innerHTML = `<h3>📊 Phạm vi phiếu ôn</h3><p>${selected.length} chủ đề · ${st.n} câu · ${st.level ? MA.Data.LEVELS[st.level] : 'Tăng dần'}</p><p class="muted small">Số dạng bài có thể ra ở mỗi mức. Thống kê chính xác của đề sẽ hiện sau khi tạo.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Chủ đề</th><th>Dạng cơ bản</th><th>Dạng vận dụng</th><th>Dạng nâng cao</th></tr></thead><tbody>${selected.map(t => `<tr><td>${t.icon} ${esc(t.title)}</td>${counts(t).map(n => `<td>${n}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      };
      $$('#wTopics .chip', app).forEach(c => c.onclick = () => { c.classList.toggle('on'); st.sel[c.classList.contains('on') ? 'add' : 'delete'](c.dataset.id); gen(); });
      const gen = () => {
        st.title = $('#wTitle', app).value; st.time = $('#wTime', app).value; st.key = $('#wKey', app).checked; st.vis = $('#wVis', app).checked;
        if (!st.sel.size) { updateCoverage(); $('#wsOut', app).innerHTML = ''; return UI.toast('Hãy chọn ít nhất một chủ đề', 'bad'); }
        if (st.level) {
          const missing = [...st.sel].map(MA.Data.topic).filter(t => t && !(t.gens || []).some(x => x.level === st.level && (!MA.Content || MA.Content.genAllowed(t, x))));
          if (missing.length) { updateCoverage(); $('#wsOut', app).innerHTML = ''; return UI.toast(`Không có dạng ${MA.Data.LEVELS[st.level]} trong: ${missing.slice(0, 2).map(t => t.title).join(', ')}${missing.length > 2 ? '…' : ''}. Hãy bỏ chọn chủ đề đó hoặc chọn mức khác.`, 'bad'); }
        }
        const qs = st.level ? MA.Data.makeSet([...st.sel], st.n, st.level, { paper: true }) : MA.Data.makeSet([...st.sel], st.n, 0, { progressive: true, paper: true });
        const byTopic = {}, byLevel = { 1: 0, 2: 0, 3: 0 };
        qs.forEach(q => { byTopic[q.topicId] = (byTopic[q.topicId] || 0) + 1; byLevel[q.level || 1] = (byLevel[q.level || 1] || 0) + 1; });
        const actualTopics = Array.from(new Set(qs.map(q => q.topicId))).map(MA.Data.topic).filter(Boolean);
        $('#wsOut', app).innerHTML = `<div class="card no-print"><h3>✅ Thống kê đề vừa tạo</h3><p>${qs.length} câu · ${st.level ? MA.Data.LEVELS[st.level] : 'Tăng dần'}</p><div class="chips">${[1, 2, 3].map(l => `<span class="chip">${['', 'Cơ bản', 'Vận dụng', 'Nâng cao'][l]}: ${byLevel[l] || 0} câu</span>`).join('')}</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nội dung trong đề</th><th>Số câu</th></tr></thead><tbody>${actualTopics.map(t => `<tr><td>${t.icon} ${esc(t.title)}</td><td><b>${byTopic[t.id] || 0}</b></td></tr>`).join('')}</tbody></table></div></div>${this.sheet(st, qs, g)}`;
        updateCoverage();
      };
      $('#wGen', app).onclick = gen;
      $('#wPrint', app).onclick = () => { document.body.classList.add('printing-ws'); window.print(); setTimeout(() => document.body.classList.remove('printing-ws'), 500); };
      gen();
    },
    sheet(st, qs, g) {
      const q2 = (q, i) => `<div class="ws-q"><div class="ws-qt"><b>Câu ${i + 1}</b> <span class="ws-lv">(${MA.Data.LEVELS[q.level]})</span>. ${q.text}</div>${st.vis ? MA.Vis.render(q.visual) : ''}
        ${q.type === 'mc' ? `<div class="ws-opts">${q.options.map((o, k) => `<span>${'ABCD'[k]}. ${o}</span>`).join('')}</div>` : (q.steps.length > 2 || /Hỏi/.test(q.text) ? '<div class="ws-lines"><div>Bài giải:</div><i></i><i></i><i></i></div>' : `<div class="ws-ans">Đáp số: ........................ ${q.unit || ''}</div>`)}</div>`;
      return `<div class="ws-sheet"><div class="ws-page">
        <div class="ws-head"><div>Trường: ..........................................<br>Họ và tên: ...................................... Lớp: ${g.grade}......</div><div class="ws-score">Điểm<br><br></div><div class="ws-comment">Lời nhận xét của thầy cô<br><br></div></div>
        <h1 class="ws-title">${esc(st.title)}</h1><p class="ws-sub">Thời gian làm bài: ${esc(st.time)} phút · ${qs.length} câu · Ngày ....../....../...........</p>
        ${qs.map(q2).join('')}</div>
        ${st.key ? `<div class="ws-page ws-key"><h2>ĐÁP ÁN & HƯỚNG DẪN GIẢI</h2>${qs.map((q, i) => `<div class="ws-k"><b>Câu ${i + 1}:</b> ${q.type === 'mc' ? 'ABCD'[q.correct] + '. ' + q.options[q.correct] : q.answerText + (q.unit ? ' ' + q.unit : '')}<div class="ws-ks">${q.steps.join(' ')}</div></div>`).join('')}</div>` : ''}</div>`;
    }
  };

  // ------------------------------ XẾP HẠNG & HỒ SƠ ------------------------------
  const botTag = (x) => x && x.bot ? ' <span class="bot-tag" title="Bạn ảo cùng đua – do thầy cô tạo để con có thêm đối thủ">🤖</span>' : '';
  MA.Views.rank = {
    render(app, params) {
      if (params[0] === 'me') return this.profile(app);
      const u = MA.User.current; let grade = u.grade, period = 'all';
      const draw = () => {
        const lb = MA.User.leaderboard(grade, period);
        $('#lbBox', app).innerHTML = lb.length ? `<div class="podium">${[1, 0, 2].map(k => lb[k] ? `<div class="pod p${k + 1}"><span class="pav">${MA.U.av(lb[k].u.avatar)}</span><b>${esc(lb[k].u.name)}${botTag(lb[k].u)}</b><small>${MA.User.rankOf(lb[k].u.xp[grade] || 0).icon} ${lb[k].xp} XP</small><div class="pbar">${['🥇', '🥈', '🥉'][k]}</div></div>` : '').join('')}</div>
          <table class="tbl lb"><tr><th>#</th><th>Học sinh</th><th>Hạng</th><th>XP ${period === 'week' ? 'tuần này' : ''}</th><th>Câu đúng</th></tr>
          ${lb.map((r, i) => { const rk = MA.User.rankOf(r.u.xp[grade] || 0); return `<tr class="${r.u.id === u.id ? 'me' : r.u.bot ? 'is-bot' : ''}"><td>${i + 1}</td><td>${MA.U.av(r.u.avatar)} ${esc(r.u.name)}${botTag(r.u)}${r.u.id === u.id ? ' <small>(con)</small>' : ''}</td><td><span class="rk" style="--rc:${rk.color}">${rk.icon} ${rk.name}</span></td><td><b>${r.xp}</b></td><td>${r.u.stats.correct}</td></tr>`; }).join('')}</table>`
          : `<div class="card empty"><div class="big-emoji">🏁</div><p>Chưa có ai trên bảng xếp hạng Lớp ${grade}${period === 'week' ? ' tuần này' : ''}. Hãy là người đầu tiên!</p></div>`;
      };
      const unsentNote = () => { const l = MA.Sync && MA.Sync.unsent ? MA.Sync.unsent() : []; return l.length ? `<p class="muted small">🔑 Kết quả mới của <b>${l.map(x => esc(x.name)).join(', ')}</b> mới lưu trên máy này, chưa lên máy chủ nên máy khác chưa thấy. ${l.some(x => x.needPw) ? 'Hãy đăng nhập lại ở tab 👑 VIP (SĐT + mật khẩu gia đình) trên máy này.' : 'Hãy mở mạng rồi bấm ☁️ → Đồng bộ ngay.'}</p>` : ''; };
      const load = () => { draw(); const n = $('#lbUnsent', app); if (n) n.innerHTML = unsentNote(); if (MA.Sync && MA.Sync.supported) { const g0 = grade; MA.Sync.leaderboard(g0).then(r => { if (r && g0 === grade && document.body.contains(app) && $('#lbBox', app)) draw(); }); } };
      const shared = MA.Sync && MA.Sync.supported;
      app.innerHTML = `<div class="page-head"><h1>🏆 Bảng xếp hạng theo lớp</h1><p class="muted">Điểm XP được cộng khi làm đúng (Cơ bản +10, Vận dụng +15, Nâng cao +25), thưởng khi làm nhanh, combo, thử thách ngày. ${shared ? 'Bảng xếp hạng gồm <b>tất cả các bạn đã lưu kết quả lên máy chủ</b> (hồ sơ có SĐT cha/mẹ) và các bạn học trên máy này.' : 'Bảng xếp hạng gồm các bạn học trên <b>cùng máy / trình duyệt này</b>.'}${MA.Bots && MA.Bots.enabled() ? ' Bạn có dấu <span class="bot-tag">🤖</span> là <b>bạn ảo</b> cùng đua – hãy cố vượt qua nhé!' : ''}</p></div>
        <div class="lb-tools"><div class="seg" id="lbG">${[1, 2, 3, 4, 5, 6].map(x => `<button data-v="${x}" class="${x === grade ? 'on' : ''}">Lớp ${x}</button>`).join('')}</div><div class="seg" id="lbP"><button data-v="all" class="on">Tất cả</button><button data-v="week">Tuần này</button></div><a class="btn ghost small" href="#/rank/me">👤 Hồ sơ của con</a></div><div id="lbUnsent"></div>
        <div id="lbBox"></div>
        <div class="card"><h3>🎖️ Các bậc xếp hạng</h3><div class="tiers">${MA.User.RANKS.map(r => `<div class="tier" style="--rc:${r.color}"><span>${r.icon}</span><b>${r.name}</b><small>${r.min}+ XP</small></div>`).join('')}</div></div>`;
      $$('#lbG button', app).forEach(b => b.onclick = () => { grade = +b.dataset.v; $$('#lbG button', app).forEach(x => x.classList.toggle('on', x === b)); load(); });
      $$('#lbP button', app).forEach(b => b.onclick = () => { period = b.dataset.v; $$('#lbP button', app).forEach(x => x.classList.toggle('on', x === b)); draw(); });
      load();
    },
    profile(app) {
      const u = MA.User.current; const acc = u.stats.answered ? Math.round(u.stats.correct / u.stats.answered * 100) : 0;
      app.innerHTML = `<div class="profile-head card"><button class="big-avatar av-edit" id="pfAv" title="Đổi ảnh đại diện">${MA.U.av(u.avatar)}<i>✏️</i></button><div><h1>${esc(u.name)}</h1><p class="muted">Tham gia từ ${new Date(u.created).toLocaleDateString('vi-VN')} · đang học Lớp ${u.grade}</p><button class="btn small ghost" id="pfAvBtn">🖼️ Đổi ảnh đại diện</button></div></div>
        ${(() => { const a = MA.Account.current() || {}; const vip = MA.Account.isVip(a); return `<div class="card acc-card ${vip ? 'is-vip' : ''}"><h3>🪪 Tài khoản</h3>
          <div class="acc-row"><span>Loại tài khoản</span><b>${vip ? '👑 VIP' : '🎒 Thường'}</b>${vip && MA.Account.vipInfo(a) ? (i => `<small class="muted">kích hoạt ${i.from ? new Date(i.from).toLocaleDateString('vi-VN') : '—'} · hết hạn ${new Date(i.until).toLocaleDateString('vi-VN')} (còn ${i.days} ngày)${i.family ? ` · gói gia đình ${i.members.length}/${MA.Account.MAX_MEMBERS} hồ sơ` : ''}</small> <a class="btn small ghost" href="#/vip">Khu vực VIP →</a>`)(MA.Account.vipInfo(a)) : ''}</div>
          ${MA.Account.hasPassword(a) ? '<div class="acc-row"><span>Đăng nhập</span><b>🔒 SĐT + mật khẩu chung</b></div>' : ''}
          <div class="acc-row"><span>Lớp học của thầy cô</span>${(() => { const cl = a.classId && MA.Content.classById(a.classId); return cl ? `<b>🏫 ${esc(cl.name)}</b><button class="btn small ghost" id="clOut">Rời lớp</button>` : `<input id="clCode" placeholder="Mã lớp (6 kí tự)" maxlength="8" style="max-width:170px"><button class="btn small" id="clJoin">Vào lớp</button>`; })()}</div>
          <div class="acc-row"><span>Số điện thoại cha/mẹ</span><b>${a.phoneHash ? '✔ Đã liên kết (ẩn)' : '✘ Chưa liên kết'}</b>${a.phoneHash ? '' : '<button class="btn small ghost" id="accLink">Liên kết ngay</button>'}</div>
          <div class="acc-row"><span>Mã kích hoạt VIP</span>${vip && !(MA.Account.vipInfo(a) || {}).trial ? '<small class="muted">Có mã mới? Nhập để cộng thêm 1 năm.</small><button class="btn small ghost" id="vipOpen">➕ Gia hạn bằng mã</button>' : '<button class="btn small" id="vipOpen">👑 Nhập mã VIP</button>'}</div>
        </div>`; })()}
        <div class="res-stats"><div><b>${u.stats.answered}</b><small>câu đã làm</small></div><div><b>${u.stats.correct}</b><small>câu đúng</small></div><div><b>${acc}%</b><small>chính xác</small></div><div><b>🔥 ${u.streak.days}</b><small>ngày liên tiếp</small></div><div><b>⚡ ${u.stats.bestCombo}</b><small>combo cao nhất</small></div></div>
        <div class="card"><h3>🏅 Huy hiệu (${u.badges.length}/${Object.keys(MA.User.BADGES).length})</h3><div class="badges">${Object.entries(MA.User.BADGES).map(([k, b]) => `<div class="badge ${u.badges.includes(k) ? 'got' : ''}" title="${b.desc}"><span>${b.icon}</span><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}</div></div>
        <div class="card"><h3>📊 Hạng & tiến độ theo lớp</h3>${MA.Data.grades().filter(g => g.topics.length).map(g => { const xp = u.xp[g.grade] || 0, rk = MA.User.rankOf(xp); return `<details ${g.grade === u.grade ? 'open' : ''}><summary><b>${g.emoji} ${g.name}</b> · ${rk.icon} ${rk.name} · ${xp} XP</summary><div class="mastery-list">${MA.Data.topics(g.grade).map(t => { const p = MA.User.topic(t.id); return `<a href="#/learn/${t.id}" class="ml-row"><span>${t.icon} ${t.title}</span>${UI.masteryBar(p.m)}<b>${p.m}%</b><small>${p.c}/${p.n} đúng</small></a>`; }).join('')}</div></details>`; }).join('')}</div>
        <div class="card"><h3>💾 Sao lưu & chuyển máy</h3><p class="muted">Dữ liệu được lưu trên trình duyệt này. Tải tệp sao lưu để chuyển sang máy khác hoặc phòng khi xóa lịch sử trình duyệt.</p>
          <div class="btn-row"><button class="btn ghost" id="bkOut">⬇️ Tải tệp sao lưu</button><label class="btn ghost">⬆️ Khôi phục từ tệp<input type="file" id="bkIn" accept=".json" hidden></label><button class="btn ghost danger" id="delMe">🗑️ Xóa hồ sơ này</button></div></div>`;
      $('#pfAv', app).onclick = $('#pfAvBtn', app).onclick = () => UI.avatarPicker();
      $('#vipOpen', app).onclick = () => UI.vipCodeDialog();
      if ($('#clJoin', app)) $('#clJoin', app).onclick = () => { const cl = MA.Content.classByCode($('#clCode', app).value); if (!cl) return UI.toast('Mã lớp chưa đúng. Con hỏi lại thầy cô nhé!', 'bad'); MA.Account.update(u.id, { classId: cl.id }); if (cl.grade && cl.grade !== u.grade) MA.User.setGrade(cl.grade); UI.toast(`✅ Đã vào lớp ${esc(cl.name)}`, 'good'); UI.route(); };
      if ($('#clOut', app)) $('#clOut', app).onclick = () => UI.confirm('Rời khỏi lớp học này?', () => { MA.Account.update(u.id, { classId: null }); UI.route(); });
      if ($('#accLink', app)) $('#accLink', app).onclick = () => UI.modal(`<h2>📱 Liên kết số điện thoại cha/mẹ</h2><p class="muted">Giúp đăng nhập lại và nhận mã VIP. Số điện thoại được mã hóa, không hiển thị.</p><input id="lkPhone" type="tel" inputmode="numeric" placeholder="09xx xxx xxx"><div class="btn-row"><button class="btn" id="lkGo">Liên kết</button></div>`, (b, close) => { $('#lkGo', b).onclick = () => { const p = $('#lkPhone', b).value; if (MA.Account.byPhone(p).some(x => MA.U.slug(x.name) === MA.U.slug(u.name) && x.id !== u.id)) return UI.toast('Số này đã có một tài khoản cùng tên.', 'bad'); if (!MA.Account.linkPhone(u.id, p)) return UI.toast('Số điện thoại chưa đúng.', 'bad'); close(); UI.toast('✅ Đã liên kết số điện thoại.', 'good'); UI.route(); MA.Sync && MA.Sync.sync(); }; });
      $('#bkOut', app).onclick = () => { const blob = new Blob([JSON.stringify(MA.Store.exportAll(), null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `toanvui-saoluu-${MA.U.today()}.json`; a.click(); URL.revokeObjectURL(a.href); };
      $('#bkIn', app).onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const data = JSON.parse(r.result); const cur = MA.User.all().reduce((m, x) => (m[x.id] = x, m), {}); if (data.users) data.users = Object.assign(cur, data.users); if (data.accounts) data.accounts = Object.assign(MA.Store.get('accounts', {}), data.accounts); ['admin_session', 'admin_pass', 'content'].forEach(k => delete data[k]); MA.Store.importAll(data); MA.User.restore(); UI.toast('✅ Đã khôi phục dữ liệu!', 'good'); UI.route(); } catch (err) { UI.toast('Tệp không hợp lệ', 'bad'); } }; r.readAsText(f); };
      $('#delMe', app).onclick = () => UI.confirm(`Xóa vĩnh viễn hồ sơ của <b>${esc(u.name)}</b> trên máy này?`, () => { MA.User.remove(u.id); UI.go('login'); });
    }
  };

  // ------------------------------ BẢNG NHÁP ------------------------------
  MA.Scratchpad = {
    init() {
      const el = document.createElement('div'); el.id = 'pad'; el.className = 'pad hidden';
      el.innerHTML = `<div class="pad-head"><b>✍️ Bảng nháp</b><div class="pad-tools">
          ${['#ffffff', '#ffd54f', '#80deea', '#ff8a80', '#a5d6a7'].map((c, i) => `<button class="pc ${i ? '' : 'on'}" data-c="${c}" style="background:${c}" title="Màu phấn"></button>`).join('')}
          <button data-w="3" class="pw on" title="Nét mảnh">•</button><button data-w="7" class="pw" title="Nét đậm">●</button>
          <button id="padEr" title="Tẩy">🧽</button><button id="padGrid" title="Kẻ ô li">▦</button><button id="padClr" title="Lau bảng">🗑️</button><button id="padBig" title="Phóng to">⤢</button><button id="padX" title="Đóng">✕</button></div></div>
        <canvas id="padCv"></canvas><div class="pad-foot">Dùng chuột hoặc ngón tay để đặt tính, vẽ sơ đồ nháp.</div>`;
      document.body.appendChild(el);
      const cv = $('#padCv', el); const ctx = cv.getContext('2d');
      let color = '#ffffff', w = 3, erase = false, drawing = false, last = null;
      const fit = () => { const r = cv.getBoundingClientRect(); const d = window.devicePixelRatio || 1; const img = cv.width ? ctx.getImageData(0, 0, cv.width, cv.height) : null; cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); ctx.lineCap = ctx.lineJoin = 'round'; if (img) ctx.putImageData(img, 0, 0); };
      this._fit = fit;
      const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      cv.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'; ctx.strokeStyle = color; ctx.lineWidth = erase ? 22 : w; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => cv.addEventListener(t, () => drawing = false));
      $$('.pc', el).forEach(b => b.onclick = () => { color = b.dataset.c; erase = false; $('#padEr', el).classList.remove('on'); $$('.pc', el).forEach(x => x.classList.toggle('on', x === b)); });
      $$('.pw', el).forEach(b => b.onclick = () => { w = +b.dataset.w; $$('.pw', el).forEach(x => x.classList.toggle('on', x === b)); });
      $('#padEr', el).onclick = (e) => { erase = !erase; e.currentTarget.classList.toggle('on', erase); };
      $('#padGrid', el).onclick = (e) => { el.classList.toggle('grid'); e.currentTarget.classList.toggle('on'); };
      $('#padClr', el).onclick = () => ctx.clearRect(0, 0, cv.width, cv.height);
      $('#padBig', el).onclick = () => { el.classList.toggle('big'); setTimeout(fit, 50); };
      $('#padX', el).onclick = () => this.close();
      window.addEventListener('resize', () => { if (!el.classList.contains('hidden')) fit(); });
      this.el = el;
    },
    open() { this.el.classList.remove('hidden'); setTimeout(this._fit, 30); },
    close() { this.el.classList.add('hidden'); },
    toggle() { this.el.classList.contains('hidden') ? this.open() : this.close(); }
  };

  // ------------------------------ BÁO CÁO TUẦN CHO CHA MẸ ------------------------------
  // Tóm tắt 7 ngày gần nhất: học mấy ngày, bao nhiêu câu, tiến bộ dạng bài nào, cần giúp con phần nào.
  // Có nút sao chép để gửi qua Zalo/Messenger, chia sẻ, in.
  MA.Views.week = {
    data(u) {
      const A = MA.Analytics, days = A.lastDays(7), prev = A.lastDays(14).slice(0, 7), act = u.activity || {};
      const sum = (ds, k) => ds.reduce((x, d) => x + ((act[d] || {})[k] || 0), 0);
      const q = sum(days, 'q'), c = sum(days, 'c'), sec = sum(days, 's') + sum(days, 'rs');
      const since = Date.now() - 7 * 864e5; const tids = new Set(MA.Data.topics(u.grade).map(t => t.id));
      const gens = Object.entries(u.gens || {}).map(([k, g]) => { const [tid, name] = k.split('::'); return { tid, name, g, m: g.m != null ? g.m : Math.round(g.c / g.n * 100) }; }).filter(x => x.g.last >= since && tids.has(x.tid) && MA.Data.topic(x.tid));
      const strong = gens.filter(x => x.m >= 80 && x.g.n >= 3).sort((a, b) => b.m - a.m).slice(0, 4);
      const weak = gens.filter(x => x.m < 60 && x.g.n >= 2).sort((a, b) => a.m - b.m).slice(0, 3);
      const errs = (u.errLog || []).filter(e => e.at >= since); const pat = {}; errs.forEach(e => { const k = MA.Tutor.classify(e); if (k !== 'other' && k !== 'skip') pat[k] = (pat[k] || 0) + 1; });
      const top = Object.entries(pat).sort((a, b) => b[1] - a[1])[0];
      const missions = Object.keys(u.mission || {}).filter(k => days.includes(k.slice(0, 10))).length;
      return { days, act, q, c, acc: q ? Math.round(c / q * 100) : 0, min: Math.round(sec / 60), active: days.filter(d => (act[d] || {}).q || (act[d] || {}).rs).length, qPrev: sum(prev, 'q'), xp: MA.User.weekXp(u, u.grade), strong, weak, top, missions };
    },
    text(u, r) {
      const g = MA.Data.grade(u.grade), fm = (d) => d.slice(8, 10) + '/' + d.slice(5, 7);
      const L = [`📨 BÁO CÁO TUẦN – ${u.name} (${g ? g.name : ''}) · ${fm(r.days[0])}–${fm(r.days[6])}`, `• Học ${r.active}/7 ngày · ${r.min} phút · ${r.q} câu (đúng ${r.acc}%)`, `• Hoàn thành nhiệm vụ hôm nay: ${r.missions} ngày`];
      if (r.strong.length) L.push('• Đã vững: ' + r.strong.map(x => x.name).join('; '));
      if (r.weak.length) L.push('• Cần luyện thêm: ' + r.weak.map(x => x.name).join('; '));
      if (r.top) L.push('• Lỗi hay gặp: ' + MA.Tutor.PATTERNS[r.top[0]].name + ' → ' + MA.Tutor.PATTERNS[r.top[0]].advice);
      L.push('— Toán Vui');
      return L.join('\n');
    },
    render(app) {
      const u = MA.User.current; const r = this.data(u); const g = MA.Data.grade(u.grade);
      const max = Math.max(1, ...r.days.map(d => (r.act[d] || {}).q || 0)); const fm = (d) => d.slice(8, 10) + '/' + d.slice(5, 7);
      const wd = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const delta = r.q - r.qPrev;
      app.innerHTML = `<div class="page-head"><h1>📨 Báo cáo tuần</h1><p class="muted">${esc(u.name)} · ${g ? g.name : ''} · 7 ngày gần nhất (${fm(r.days[0])} – ${fm(r.days[6])}). Dành cho cha mẹ theo dõi và động viên con.</p></div>
        <div class="res-stats"><div><b>${r.active}/7</b><small>ngày học</small></div><div><b>${r.min}</b><small>phút học</small></div><div><b>${r.q}</b><small>câu đã làm${r.qPrev || r.q ? ` · ${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)} so với tuần trước` : ''}</small></div><div><b>${r.acc}%</b><small>trả lời đúng</small></div></div>
        <div class="card"><h3>📅 Số câu mỗi ngày</h3><div class="wk-bars">${r.days.map(d => { const a = r.act[d] || {}; return `<div class="wk-b"><i style="height:${Math.round((a.q || 0) / max * 100)}%" title="${a.q || 0} câu"></i><b>${a.q || 0}</b><small>${wd[new Date(d + 'T12:00').getDay()]}</small></div>`; }).join('')}</div><p class="muted small">🎯 Hoàn thành <b>nhiệm vụ hôm nay</b>: ${r.missions}/7 ngày · ⭐ ${r.xp} XP tuần này</p></div>
        <div class="grid2">
          <div class="card"><h3>✅ Đã vững</h3>${r.strong.length ? `<ul>${r.strong.map(x => `<li>${esc(x.name)} <small class="muted">(${x.m}%)</small></li>`).join('')}</ul>` : '<p class="muted">Chưa có dạng bài nào đạt mức vững trong tuần.</p>'}</div>
          <div class="card"><h3>🎯 Cần giúp con</h3>${r.weak.length ? `<ul>${r.weak.map(x => `<li>${esc(x.name)} <small class="muted">(${x.m}%)</small> <a href="#/practice/${x.tid}/${MA.Data.topic(x.tid).gens.findIndex(gg => gg.name === x.name)}">Luyện</a></li>`).join('')}</ul>` : '<p class="muted">Không có dạng bài nào đáng lo. 👍</p>'}</div>
        </div>
        ${r.top ? `<div class="card soft"><h3>💡 Gợi ý cho cha mẹ</h3><p>Con hay mắc lỗi <b>${MA.Tutor.PATTERNS[r.top[0]].name.toLowerCase()}</b> (${r.top[1]} lần). ${MA.Tutor.PATTERNS[r.top[0]].advice}</p></div>` : ''}
        <div class="btn-row no-print"><button class="btn" id="wkCopy">📋 Sao chép để gửi Zalo</button>${navigator.share ? '<button class="btn ghost" id="wkShare">📤 Chia sẻ</button>' : ''}<button class="btn ghost" id="wkPrint">🖨️ In</button>${MA.Account.isVip() ? '<a class="btn ghost" href="#/vip">📈 Báo cáo chi tiết (VIP)</a>' : ''}</div>`;
      const txt = this.text(u, r);
      $('#wkCopy', app).onclick = () => { try { navigator.clipboard.writeText(txt).then(() => UI.toast('✅ Đã sao chép — dán vào Zalo để gửi nhé!', 'good')).catch(() => UI.modal(`<h2>Sao chép báo cáo</h2><textarea rows="9" style="width:100%">${esc(txt)}</textarea>`)); } catch (e) { UI.modal(`<h2>Sao chép báo cáo</h2><textarea rows="9" style="width:100%">${esc(txt)}</textarea>`); } };
      if ($('#wkShare', app)) $('#wkShare', app).onclick = () => navigator.share({ title: 'Báo cáo tuần – Toán Vui', text: txt }).catch(() => {});
      $('#wkPrint', app).onclick = () => window.print();
    }
  };
})(window.MA);
