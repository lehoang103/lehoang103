/* =========================================================
 * ui/views-admin.js — ADMIN BOARD (BẢNG QUẢN TRỊ)
 * Tab: Tổng quan · Tài khoản · KPI & đối chứng · Thống kê học tập ·
 *      Ngân hàng câu hỏi · Đề thi & VIP · Bạn ảo đua rank · Cài đặt
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI, A = MA.Account, C = MA.Content, K = MA.Analytics, CH = MA.Charts;
  const TABS = [['overview', '📊', 'Tổng quan'], ['accounts', '👥', 'Tài khoản'], ['kpi', '🎯', 'KPI & đối chứng'], ['report', '📑', 'Báo cáo từng học sinh'], ['classes', '🏫', 'Lớp học & bài tập'], ['bots', '🤖', 'Bạn ảo đua rank'], ['stats', '📈', 'Thống kê học tập'], ['content', '🗂️', 'Ngân hàng câu hỏi'], ['exams', '📝', 'Đề thi & VIP'], ['settings', '⚙️', 'Cài đặt']];
  let compareIds = [];
  const fmtD = (t) => t ? new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const typeTag = (t) => t === 'vip' ? '<span class="tag vip">👑 VIP</span>' : '<span class="tag">🎒 Thường</span>';
  const gradeOpts = (sel, all = true) => (all ? `<option value="">Tất cả lớp</option>` : '') + [1, 2, 3, 4, 5, 6].map(g => `<option value="${g}" ${+sel === g ? 'selected' : ''}>Lớp ${g}</option>`).join('');

  // Biểu đồ cột đơn giản (HTML)
  function colChart(items, opts = {}) {
    const max = Math.max(1, ...items.map(i => i.v));
    return `<div class="cchart">${items.map(i => `<div class="cc-col" title="${esc(i.title || i.l)}: ${i.v}"><span class="cc-v">${i.v || ''}</span><i style="height:${Math.round(i.v / max * 100)}%;background:${i.c || opts.color || 'var(--accent)'}"></i><span class="cc-l">${i.l}</span></div>`).join('')}</div>`;
  }
  function hbar(v, max, col) { return `<div class="hbar"><i style="width:${Math.max(2, Math.round(v / (max || 1) * 100))}%;background:${col || 'var(--accent)'}"></i></div>`; }

  MA.Views.admin = {
    render(app, params) {
      const tab = TABS.some(t => t[0] === params[0]) ? params[0] : 'overview';
      app.innerHTML = `<div class="admin">
        <aside class="adm-nav">${TABS.map(t => `<a href="#/admin/${t[0]}" class="${t[0] === tab ? 'on' : ''}"><span>${t[1]}</span>${t[2]}</a>`).join('')}
          <div class="adm-note">${MA.Sync && MA.Sync.isAdminLinked() ? '☁️ Đã nối máy chủ: mọi chỉnh sửa (tài khoản, VIP, câu hỏi, đề thi) tự phát hành cho tất cả các máy.' : C.get().localEdited ? '⚠️ Có chỉnh sửa nội dung chưa phát hành. Vào <a href="#/admin/settings">Cài đặt</a> để tải file content-config.js.' : '✔ Nội dung đang theo file cấu hình.'}</div></aside>
        <section class="adm-main" id="admMain"></section></div>`;
      this[tab]($('#admMain', app), params.slice(1));
      // nối máy chủ: tải dữ liệu mới nhất của mọi máy (tối đa 20 giây/lần) rồi vẽ lại
      const SY = MA.Sync;
      if (SY && SY.isAdminLinked() && Date.now() - (SY.lastPull || 0) > 20000 && !this._pulling) {
        this._pulling = true;
        SY.pull().then(n => { this._pulling = false; if (n > 0 && document.body.contains(app) && !document.querySelector('.modal-wrap')) this.render(app, params); }).catch(() => { this._pulling = false; });
      }
    },

    // ============================ TỔNG QUAN ============================
    overview(el) {
      const ks = K.all(); const accs = A.all();
      const vip = ks.filter(k => k.type === 'vip').length;
      const active7 = ks.filter(k => { const u = MA.User.get(k.id); return K.lastDays(7).some(d => u.activity && u.activity[d] && u.activity[d].q); }).length;
      const totQ = ks.reduce((s, k) => s + k.answered, 0), totC = ks.reduce((s, k) => s + k.correct, 0);
      const daily = K.daily(14), logins = K.loginsDaily(14);
      const byGrade = [1, 2, 3, 4, 5, 6].map(g => ({ g, n: ks.filter(k => +k.grade === g).length, v: ks.filter(k => +k.grade === g && k.type === 'vip').length }));
      const top = ks.slice().sort((a, b) => b.score - a.score).slice(0, 5);
      const idle = ks.filter(k => k.lastLogin && Date.now() - k.lastLogin > 7 * 864e5).slice(0, 8);
      el.innerHTML = `<h1>📊 Tổng quan hệ thống</h1>
        <div class="kcards">
          <div class="kc"><b>${accs.length}</b><small>Tài khoản học sinh</small></div>
          <div class="kc vip"><b>${vip}</b><small>Tài khoản VIP</small></div>
          <div class="kc"><b>${active7}</b><small>Học trong 7 ngày qua</small></div>
          <div class="kc"><b>${MA.U.fmt(totQ)}</b><small>Câu đã làm</small></div>
          <div class="kc"><b>${totQ ? Math.round(totC / totQ * 100) : 0}%</b><small>Tỉ lệ đúng chung</small></div>
          <div class="kc"><b>${C.get().customQuestions.length} / ${C.get().customExams.length}</b><small>Câu hỏi / đề tự soạn</small></div>
        </div>
        <div class="grid2">
          <div class="card"><h3>✏️ Số câu làm mỗi ngày (14 ngày)</h3>${CH.cols(daily.map(d => ({ label: d.d.slice(8), title: d.d.split('-').reverse().join('/'), vals: [d.c, d.q - d.c] })), [{ name: 'Đúng', c: 'var(--s3)' }, { name: 'Sai', c: 'var(--s5)' }], { w: 440, aria: 'Số câu làm mỗi ngày' })}</div>
          <div class="card"><h3>🔑 Lượt đăng nhập mỗi ngày (14 ngày)</h3>${CH.cols(logins.map(d => ({ label: d.d.slice(8), title: d.d.split('-').reverse().join('/'), vals: [d.n] })), [{ name: 'Lượt đăng nhập', c: 'var(--s1)' }], { w: 440, aria: 'Lượt đăng nhập mỗi ngày' })}</div>
        </div>
        <div class="grid2">
          <div class="card"><h3>🏫 Học sinh theo lớp</h3>${CH.cols(byGrade.map(r => ({ label: 'Lớp ' + r.g, title: 'Lớp ' + r.g, vals: [r.v, r.n - r.v] })), [{ name: '👑 VIP', c: 'var(--s2)' }, { name: '🎒 Thường', c: 'var(--s1)' }], { w: 440, h: 200, bw: 34, labelAll: true, aria: 'Học sinh theo lớp' })}</div>
          <div class="card"><h3>🏆 Top 5 KPI</h3>${top.length ? `<div class="rp-legend"><span><i style="background:var(--s2)"></i>👑 VIP</span><span><i style="background:var(--s1)"></i>🎒 Thường</span></div>${CH.rank(top.map(k => ({ label: `${MA.U.av(k.avatar)} ${esc(k.name)}`, sub: 'L' + k.grade, v: k.score, c: k.type === 'vip' ? 'var(--s2)' : 'var(--s1)', badge: K.rating(k.score).i })), { name: 'KPI' })}<p class="small"><a class="link" href="#/admin/kpi">Xem toàn bộ KPI ›</a></p>` : '<p class="muted">Chưa có dữ liệu.</p>'}
            ${idle.length ? `<h3 style="margin-top:14px">💤 Lâu không đăng nhập (> 7 ngày)</h3><p>${idle.map(k => `<span class="chip">${MA.U.av(k.avatar)} ${esc(k.name)} · ${UI.ago(k.lastLogin)}</span>`).join(' ')}</p>` : ''}</div>
        </div>`;
      CH.bind(el);
    },

    // ============================ TÀI KHOẢN ============================
    accounts(el) {
      const st = { q: '', grade: '', type: '' };
      el.innerHTML = `<h1>👥 Quản lý tài khoản</h1>
        <div class="adm-tools"><input id="acQ" placeholder="🔍 Tìm theo tên…"><select id="acG">${gradeOpts('')}</select><select id="acT"><option value="">Mọi loại</option><option value="vip">VIP</option><option value="normal">Thường</option></select>
          <button class="btn small" id="acNew">➕ Tạo tài khoản</button><button class="btn small ghost" id="acCmp">🎯 So sánh KPI (<span id="acN">${compareIds.length}</span>)</button><button class="btn small ghost" id="acCsv">⬇️ Xuất CSV</button></div>
        <div id="acList"></div>`;
      const draw = () => {
        const list = A.all().map(a => ({ a, u: MA.User.get(a.id) })).filter(x => x.u)
          .filter(x => (!st.q || MA.U.slug(x.a.name).includes(MA.U.slug(st.q))) && (!st.grade || +x.a.grade === +st.grade) && (!st.type || A.typeOf(x.a) === st.type))
          .sort((x, y) => (y.a.lastLogin || 0) - (x.a.lastLogin || 0));
        $('#acList', el).innerHTML = list.length ? `<div class="tbl-wrap"><table class="tbl adm-tbl"><tr><th></th><th>Học sinh</th><th>Lớp</th><th>Loại</th><th>SĐT</th><th>XP</th><th>Câu · % đúng</th><th>KPI</th><th>Đăng nhập gần nhất</th><th>Thao tác</th></tr>
          ${list.map(({ a, u }) => { const k = K.kpi(u, a); const vip = A.typeOf(a) === 'vip'; return `<tr class="${a.locked ? 'locked-row' : ''}"><td><input type="checkbox" data-cmp="${a.id}" ${compareIds.includes(a.id) ? 'checked' : ''}></td>
            <td><button class="link" data-detail="${a.id}">${MA.U.av(a.avatar)} ${esc(a.name)}</button>${a.locked ? ' <span class="tag warn">Khóa</span>' : ''}</td><td>${a.grade}</td>
            <td>${typeTag(A.typeOf(a))}${(() => { const i = A.vipInfo(a); return i && i.trial ? ` <small class="tag warn">🎁 dùng thử</small>` : i && i.trialAt && !vip ? ` <small class="muted">· đã dùng thử</small>` : ''; })()}${(() => { const i = vip && A.vipInfo(a); return i ? `<br><small class="muted">${i.from ? new Date(i.from).toLocaleDateString('vi-VN') : ''} → ${new Date(i.until).toLocaleDateString('vi-VN')}</small>${i.family ? `<br><small class="muted">👪 gói ${i.members.length}/${A.MAX_MEMBERS}: ${i.members.map(m => esc(m.name)).join(', ')}</small>` : ''}` : ''; })()}${A.hasPassword(a) ? '<br><small class="muted">🔒 có mật khẩu</small>' : vip ? '<br><small class="tag warn">chưa đặt mật khẩu</small>' : ''}</td>
            <td>${a.phoneTail ? '•••••••' + a.phoneTail.slice(-3) : '<span class="muted">—</span>'}</td><td>${k.xp}</td><td>${k.answered} · ${k.acc}%</td><td><b>${k.score}</b></td><td><small>${fmtD(a.lastLogin)}</small></td>
            <td class="acts"><a class="btn small ghost" href="#/admin/report/${encodeURIComponent(a.id)}" title="Báo cáo học tập chi tiết">📈</a><button class="btn small" data-vip="${a.id}">${vip ? '⏩ Gia hạn' : '👑 Cấp VIP'}</button>${vip ? `<button class="btn small ghost" data-unvip="${a.id}">Hủy VIP</button>` : ''}<button class="btn small ghost" data-pw="${a.id}" title="Đặt lại mật khẩu">🔑</button><button class="btn small ghost" data-lock="${a.id}">${a.locked ? '🔓 Mở' : '🔒 Khóa'}</button><button class="btn small ghost danger" data-del="${a.id}">🗑</button></td></tr>`; }).join('')}</table></div>`
          : '<div class="card empty"><p>Không có tài khoản phù hợp.</p></div>';
        $$('[data-cmp]', el).forEach(c => c.onchange = () => { const id = c.dataset.cmp; compareIds = c.checked ? [...new Set(compareIds.concat(id))].slice(-6) : compareIds.filter(x => x !== id); $('#acN', el).textContent = compareIds.length; });
        $$('[data-detail]', el).forEach(b => b.onclick = () => this.detail(b.dataset.detail, draw));
        $$('[data-vip]', el).forEach(b => b.onclick = () => this.grantVip(b.dataset.vip, draw));
        $$('[data-unvip]', el).forEach(b => b.onclick = () => UI.confirm('Hủy quyền VIP của tài khoản này?', () => { A.revokeVip(b.dataset.unvip); UI.toast('Đã chuyển về tài khoản thường'); draw(); }));
        $$('[data-pw]', el).forEach(b => b.onclick = () => this.resetPw(b.dataset.pw, draw));
        $$('[data-lock]', el).forEach(b => b.onclick = () => { const a = A.get(b.dataset.lock); A.update(a.id, { locked: !a.locked }); draw(); });
        $$('[data-del]', el).forEach(b => b.onclick = () => { const a = A.get(b.dataset.del); UI.confirm(`Xóa vĩnh viễn tài khoản <b>${esc(a.name)}</b> và toàn bộ dữ liệu học tập?`, () => { MA.User.remove(a.id, { server: true }); A.remove(a.id); draw(); }); });
      };
      $('#acQ', el).oninput = (e) => { st.q = e.target.value; draw(); };
      $('#acG', el).onchange = (e) => { st.grade = e.target.value; draw(); };
      $('#acT', el).onchange = (e) => { st.type = e.target.value; draw(); };
      $('#acNew', el).onclick = () => this.newAccount(draw);
      $('#acCmp', el).onclick = () => compareIds.length ? UI.go('admin/kpi') : UI.toast('Hãy tích chọn ít nhất 1 tài khoản để so sánh.');
      $('#acCsv', el).onclick = () => MA.U.download(`kpi-hoc-sinh-${MA.U.today()}.csv`, K.toCSV(K.all({ grade: st.grade, type: st.type })), 'text/csv');
      draw();
    },
    grantVip(id, done) {
      const a = A.get(id); const isVip = A.typeOf(a) === 'vip'; const info = A.vipInfo(a); const fam = A.famOf(a);
      const until = new Date(Date.now() + A.VIP_DAYS * 864e5).toLocaleDateString('vi-VN');
      UI.modal(`<h2>👑 ${isVip ? 'Gia hạn' : 'Cấp'} VIP cho ${MA.U.av(a.avatar)} ${esc(a.name)}</h2>
        <p>VIP có hiệu lực <b>1 năm</b> kể từ ngày kích hoạt${isVip ? ` (gia hạn: cộng thêm 1 năm vào hạn hiện tại ${new Date(info.until).toLocaleDateString('vi-VN')})` : ` – từ hôm nay đến <b>${until}</b>`}.</p>
        <p class="muted small">Gói VIP gắn với SĐT cha/mẹ: 1 mật khẩu chung (≥ 6 kí tự), tối đa ${A.MAX_MEMBERS} hồ sơ học độc lập cho anh chị em.${fam && fam.members.length ? ` Gói hiện có: ${fam.members.map(m => esc((A.get(m) || {}).name)).join(', ')}${A.famActive(fam) && !fam.members.includes(id) ? ' → hồ sơ này sẽ dùng chung thời hạn gói.' : ''}` : ''}</p>
        ${a.phoneHash ? `<div class="acc-row"><span>SĐT cha/mẹ</span><b>✔ đã liên kết (•••${esc((a.phoneTail || '').slice(-3))})</b></div>` : `<label class="fld"><span>SĐT cha/mẹ (bắt buộc)</span><input id="gvP" type="tel"></label>`}
        ${A.hasPassword(a) || (fam && (fam.passHash || Object.keys(fam.legacy || {}).length)) ? '<div class="acc-row"><span>Mật khẩu chung</span><b>✔ đã có</b></div>' : `<label class="fld"><span>Mật khẩu ban đầu (≥ 6 kí tự, có thể để trống – học sinh sẽ bắt buộc tự đặt ở lần vào học tới)</span><input id="gvW" type="text" autocomplete="off"></label>`}
        <div class="btn-row"><button class="btn" id="gvGo">${isVip ? 'Gia hạn thêm 1 năm' : 'Kích hoạt VIP 1 năm'}</button></div>`, (b, close) => {
        $('#gvGo', b).onclick = () => {
          const pw = $('#gvW', b) ? $('#gvW', b).value.trim() : '';
          if (pw && pw.length < 6) return UI.toast('Mật khẩu cần ít nhất 6 kí tự', 'bad');
          const r = A.grantVip(id, { phone: $('#gvP', b) ? $('#gvP', b).value : '', password: pw || undefined, extend: isVip });
          if (r.error) return UI.toast(r.error, 'bad');
          close(); UI.toast('✅ VIP hiệu lực đến ' + new Date(r.until).toLocaleDateString('vi-VN'), 'good'); done && done();
        };
      });
    },
    resetPw(id, done) {
      const a = A.get(id);
      const fm = A.famOf(a) && A.famOf(a).members.includes(id) ? A.famOf(a) : null;
      UI.modal(`<h2>🔑 Mật khẩu của ${MA.U.av(a.avatar)} ${esc(a.name)}</h2>${fm ? `<p class="muted small">Đây là mật khẩu chung của gói VIP gia đình (${fm.members.map(m => esc((A.get(m) || {}).name)).join(', ')}).</p>` : ''}<label class="fld"><span>Mật khẩu mới (≥ 6 kí tự)</span><input id="rpW" type="text" autocomplete="off"></label>
        <div class="btn-row"><button class="btn" id="rpGo">Đặt mật khẩu</button>${A.hasPassword(a) ? '<button class="btn ghost" id="rpClr">Xóa mật khẩu (học sinh tự đặt lại)</button>' : ''}</div>`, (b, close) => {
        $('#rpGo', b).onclick = () => { const r = A.setPassword(id, $('#rpW', b).value.trim()); if (r.error) return UI.toast(r.error, 'bad'); close(); UI.toast('✅ Đã đặt mật khẩu mới', 'good'); done && done(); };
        if ($('#rpClr', b)) $('#rpClr', b).onclick = () => { A.clearPassword(id); close(); UI.toast('Đã xóa mật khẩu. Nếu là VIP, học sinh sẽ phải đặt lại khi vào học.', 'good'); done && done(); };
      });
    },
    newAccount(done) {
      UI.modal(`<h2>➕ Tạo tài khoản học sinh</h2>
        <label class="fld"><span>Tên học sinh</span><input id="naName"></label>
        <label class="fld"><span>SĐT cha/mẹ (khuyên dùng)</span><input id="naPhone" type="tel"></label>
        <div class="grid2"><label class="fld"><span>Lớp</span><select id="naGrade">${gradeOpts(2, false)}</select></label>
        <label class="fld"><span>Loại</span><select id="naType"><option value="normal">Thường</option><option value="vip">VIP</option></select></label></div>
        <label class="fld"><span>Mật khẩu (bắt buộc với VIP, ≥ 6 kí tự)</span><input id="naPw" type="text" autocomplete="off"></label>
        <p class="muted small">VIP có hiệu lực 1 năm kể từ hôm nay; đăng nhập bằng SĐT + mật khẩu.</p>
        <div class="btn-row"><button class="btn" id="naGo">Tạo</button></div><p class="muted small">${MA.Sync && MA.Sync.isAdminLinked() ? 'Tài khoản có SĐT được lưu lên máy chủ — học sinh đăng nhập ở bất kỳ máy nào bằng tên + SĐT (VIP: SĐT + mật khẩu).' : 'Lưu ý: tài khoản tạo ở đây nằm trên máy này.'} Để học sinh dùng trên máy khác, hãy gửi <b>mã kích hoạt VIP</b> (tab Cài đặt) hoặc thêm vào <code>presetAccounts</code> trong file accounts-config.js.</p>`, (b, close) => {
        $('#naGo', b).onclick = () => {
          const name = $('#naName', b).value.trim(); if (name.length < 2) return UI.toast('Nhập tên học sinh', 'bad');
          const r = A.create({ name, phone: $('#naPhone', b).value, grade: +$('#naGrade', b).value, type: $('#naType', b).value, password: $('#naPw', b).value.trim() || undefined });
          if (r.error) return UI.toast(r.error, 'bad');
          close(); UI.toast(r.isNew ? '✅ Đã tạo tài khoản' : 'Tài khoản đã tồn tại – đã cập nhật', 'good'); done && done();
        };
      });
    },
    detail(id, done) {
      const a = A.get(id), u = MA.User.get(id); if (!u) return;
      const k = K.kpi(u, a), rt = K.rating(k.score);
      const days = K.lastDays(14).map(d => ({ l: d.slice(8), v: (u.activity && u.activity[d] && u.activity[d].q) || 0, title: d }));
      const ts = MA.Data.allTopics(u.grade).map(t => ({ t, p: u.topics[t.id] })).filter(x => x.p && x.p.n);
      UI.modal(`<div class="um-head"><span class="big-avatar">${MA.U.av(a.avatar)}</span><div><h2>${esc(a.name)}</h2><span class="muted">Lớp ${a.grade} · tạo ngày ${new Date(a.created).toLocaleDateString('vi-VN')} · ${a.phoneHash ? 'đã liên kết SĐT' : 'chưa liên kết SĐT'}</span><div>${typeTag(A.typeOf(a))} <span class="tag ${rt.c}">${rt.i} KPI ${k.score} – ${rt.t}</span></div></div></div>
        <div class="kcards sm">${['logins30', 'activeDays30', 'q30', 'acc', 'examAvg', 'mastery', 'hard', 'secPerQ'].map(key => { const m = K.METRICS.find(x => x.k === key); return `<div class="kc"><b>${k[key]}${m.unit && m.unit.length < 4 ? m.unit : ''}</b><small>${m.name}</small></div>`; }).join('')}</div>
        <h3>Thành phần KPI</h3>${[['chuyenCan', 'Chuyên cần (25%)'], ['khoiLuong', 'Khối lượng (20%)'], ['chinhXac', 'Chính xác (25%)'], ['ketQua', 'Kết quả KT (20%)'], ['thuThach', 'Thử thách (10%)']].map(([p, n]) => `<div class="kpart"><span>${n}</span>${hbar(k.parts[p], 100, 'var(--good)')}<b>${Math.round(k.parts[p])}</b></div>`).join('')}
        <h3>Hoạt động 14 ngày (số câu)</h3>${colChart(days)}
        <h3>Mức thành thạo theo chủ đề</h3>${ts.length ? `<div class="mastery-list">${ts.map(x => `<div class="ml-row"><span>${x.t.icon} ${x.t.title}</span>${UI.masteryBar(x.p.m)}<b>${x.p.m}%</b><small>${x.p.c}/${x.p.n}</small></div>`).join('')}</div>` : '<p class="muted">Chưa luyện chủ đề nào.</p>'}
        <h3>Nhật ký đăng nhập (20 lần gần nhất)</h3><p class="small">${(a.logins || []).slice(-20).reverse().map(t => `<span class="chip">${fmtD(t)}</span>`).join(' ') || '<span class="muted">Chưa có.</span>'}</p>
        <h3>Ghi chú của quản trị</h3><textarea id="dtNote" rows="2" style="width:100%">${esc(a.note || '')}</textarea>
        <div class="btn-row"><button class="btn" id="dtSave">Lưu ghi chú</button><button class="btn ghost" id="dtCmp">🎯 Thêm vào so sánh</button></div>`, (b, close) => {
        $('#dtSave', b).onclick = () => { A.update(id, { note: $('#dtNote', b).value }); UI.toast('Đã lưu'); };
        $('#dtCmp', b).onclick = () => { compareIds = [...new Set(compareIds.concat(id))].slice(-6); close(); UI.go('admin/kpi'); };
      }, { wide: true });
    },

    // ============================ KPI & ĐỐI CHỨNG ============================
    kpi(el) {
      let grade = '', showAll = false;
      const CH = MA.Charts;
      const PARTS = [['chuyenCan', 'Chuyên cần'], ['khoiLuong', 'Khối lượng'], ['chinhXac', 'Chính xác'], ['ketQua', 'Kết quả KT'], ['thuThach', 'Thử thách']];
      const GV = { name: '👑 VIP', c: 'var(--s2)' }, GN = { name: '🎒 Thường', c: 'var(--s1)' };
      const RATE = [['Xuất sắc', '🏆', 85, 'var(--s3)'], ['Tốt', '🌟', 70, 'var(--s1)'], ['Đạt', '👍', 50, 'var(--s4)'], ['Cần cố gắng', '💪', 0, 'var(--s5)']];
      const unit = (m) => m.unit && m.unit.length < 4 ? m.unit : '';
      el.innerHTML = `<div class="page-head"><h1>🎯 KPI & so sánh đối chứng</h1>
        <p class="muted small">KPI (0–100) = Chuyên cần 25% · Khối lượng 20% · Chính xác 25% · Kết quả KT 20% · Thử thách 10% — tính trên 30 ngày gần nhất.</p></div>
        <div class="adm-tools"><select id="kG">${gradeOpts('')}</select></div>
        <div class="kpi-tiles" id="kTiles"></div>
        <div class="grid2">
          <div class="card"><h3>🕸️ Thành phần KPI: VIP và Thường</h3><p class="muted small ch-sub">Điểm trung bình từng thành phần (0–100).</p><div id="kRadar"></div></div>
          <div class="card"><h3>🏅 Phân bố xếp loại</h3><p class="muted small ch-sub">Số học sinh theo mức KPI.</p><div id="kDist"></div></div>
        </div>
        <div class="card"><h3>⚖️ Đối chứng chỉ số: VIP và Thường</h3><p class="muted small ch-sub">Mỗi chỉ số: thanh trên là nhóm VIP, thanh dưới là nhóm Thường; ▲▼ là chênh lệch VIP so với Thường.</p><div id="kGroup"></div></div>
        <div class="card"><h3>👥 So sánh từng học sinh</h3><p class="muted small ch-sub">Chọn tối đa 6 học sinh (hoặc tích chọn ở tab Tài khoản).</p><div class="chips" id="kPick"></div><div id="kCmp"></div></div>
        <div class="grid2">
          <div class="card"><h3>🏆 Bảng xếp hạng KPI</h3><div id="kRank"></div></div>
          <div class="card"><h3>🔑 Lượt đăng nhập (30 ngày)</h3><div id="kLog"></div></div>
        </div>`;
      const draw = () => {
        const all = K.all({ grade });
        const vipL = all.filter(k => k.type === 'vip'), norL = all.filter(k => k.type === 'normal');
        const gv = K.groupAvg(vipL), gn = K.groupAvg(norL), ga = K.groupAvg(all);
        const pAvg = (list) => PARTS.map(([p]) => list.length ? list.reduce((a, k) => a + k.parts[p], 0) / list.length : 0);
        // Ô số tổng hợp
        const d = Math.round((gv.score - gn.score) * 10) / 10;
        const good = all.filter(k => k.score >= 70).length;
        $('#kTiles', el).innerHTML = [
          ['Học sinh', all.length, `${vipL.length} VIP · ${norL.length} Thường`],
          ['KPI trung bình', ga.score, 'toàn bộ học sinh'],
          ['KPI nhóm VIP', gv.score, gv.n && gn.n ? `<span class="${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲ +' : '▼ '}${d}</span> so với nhóm Thường` : 'cần có cả 2 nhóm'],
          ['KPI nhóm Thường', gn.score, `${gn.n} học sinh`],
          ['Đạt Tốt trở lên', all.length ? Math.round(good / all.length * 100) + '%' : '—', `${good}/${all.length} học sinh`]
        ].map(([l, v, sub]) => `<div class="rp-tile"><span>${l}</span><b>${v}</b><small>${sub}</small></div>`).join('');
        // Radar nhóm
        $('#kRadar', el).innerHTML = all.length ? CH.radar(PARTS.map(p => p[1]), [Object.assign({ vals: pAvg(vipL) }, GV), Object.assign({ vals: pAvg(norL) }, GN)], { aria: 'Thành phần KPI trung bình nhóm VIP và nhóm Thường' }) : '<p class="muted">Chưa có dữ liệu.</p>';
        // Phân bố xếp loại
        const band = (k) => RATE.findIndex(r => k.score >= r[2]);
        $('#kDist', el).innerHTML = CH.donut(RATE.map((r, i) => ({ name: r[0], icon: r[1], c: r[3], v: all.filter(k => band(k) === i).length })), { unit: 'học sinh', aria: 'Phân bố xếp loại KPI' })
          + (all.length ? CH.cols(RATE.map((r, i) => ({ label: r[1] + ' ' + r[0], title: r[0], vals: [vipL.filter(k => band(k) === i).length, norL.filter(k => band(k) === i).length] })), [GV, GN], { w: 420, h: 160, bw: 34, labelAll: true, aria: 'Xếp loại theo nhóm' }) : '');
        // Đối chứng chỉ số
        $('#kGroup', el).innerHTML = CH.pairs(K.METRICS.map(m => ({ label: m.name, vals: [gv[m.k], gn[m.k]], unit: unit(m), best: m.best })), [Object.assign({}, GV, { name: `👑 VIP (${gv.n})` }), Object.assign({}, GN, { name: `🎒 Thường (${gn.n})` })])
          + CH.table(['Chỉ số (trung bình)', `VIP (${gv.n})`, `Thường (${gn.n})`, 'Chênh lệch'], K.METRICS.map(m => { const dd = Math.round((gv[m.k] - gn[m.k]) * 10) / 10; return [m.name, gv[m.k], gn[m.k], (dd > 0 ? '+' : '') + dd]; }))
          + (gv.n && gn.n ? '' : '<p class="muted small">Cần có học sinh ở cả hai nhóm để so sánh đối chứng.</p>');
        // Chọn học sinh
        $('#kPick', el).innerHTML = all.slice().sort((a, b) => b.score - a.score).map(k => { const i = compareIds.indexOf(k.id); return `<button class="chip ${i >= 0 ? 'on' : ''}" data-id="${k.id}">${i >= 0 ? `<i class="dot" style="background:${CH.PAL[i]}"></i>` : ''}${MA.U.av(k.avatar)} ${esc(k.name)} <small>L${k.grade}</small></button>`; }).join('') || '<span class="muted">Chưa có học sinh.</span>';
        $$('#kPick .chip', el).forEach(c => c.onclick = () => { const id = c.dataset.id; compareIds = compareIds.includes(id) ? compareIds.filter(x => x !== id) : compareIds.concat(id).slice(-6); draw(); });
        const sel = compareIds.map(id => MA.User.get(id)).filter(Boolean).map(u => K.kpi(u));
        const ser = sel.map((k, i) => ({ name: k.name, c: CH.PAL[i], vals: PARTS.map(([p]) => k.parts[p]) }));
        const KEYS = ['score', 'activeDays30', 'q30', 'acc', 'examAvg', 'mastery', 'hard', 'streak'];
        $('#kCmp', el).innerHTML = sel.length ? `<div class="cmp-grid"><div><h4>Thành phần KPI</h4>${CH.radar(PARTS.map(p => p[1]), ser, { aria: 'So sánh thành phần KPI' })}</div>
            <div><h4>Chỉ số chính</h4>${CH.pairs(KEYS.map(key => { const m = K.METRICS.find(x => x.k === key); return { label: m.name, vals: sel.map(k => k[key]), unit: unit(m), best: m.best }; }), ser, { cols: 1, delta: false })}</div></div>
          ${CH.table(['Chỉ số'].concat(sel.map(k => esc(k.name))), K.METRICS.map(m => [m.name].concat(sel.map(k => k[m.k] + unit(m)))).concat([['Xếp loại'].concat(sel.map(k => { const r = K.rating(k.score); return `${r.i} ${r.t}`; }))]), 'Xem bảng đầy đủ 15 chỉ số')}` : '<p class="muted">Chưa chọn học sinh nào — bấm vào tên ở trên để so sánh.</p>';
        // Xếp hạng
        const rk = all.slice().sort((a, b) => b.score - a.score); const LIM = 10;
        const rows = (showAll ? rk : rk.slice(0, LIM)).map(k => { const r = K.rating(k.score); return { label: `${MA.U.av(k.avatar)} ${esc(k.name)}`, sub: `L${k.grade}`, v: k.score, c: k.type === 'vip' ? GV.c : GN.c, badge: r.i, extra: [{ v: r.t, n: 'xếp loại' }, { v: k.activeDays30 + ' ngày', n: 'học / 30 ngày' }, { v: k.q30 + ' câu', n: '30 ngày' }, { v: k.acc + '%', n: 'đúng' }, { v: String(k.examAvg || '—'), n: 'điểm KT TB' }] }; });
        $('#kRank', el).innerHTML = rk.length ? `<div class="rp-legend"><span><i style="background:${GV.c}"></i>${GV.name}</span><span><i style="background:${GN.c}"></i>${GN.name}</span></div>${CH.rank(rows, { name: 'KPI' })}
          ${rk.length > LIM ? `<button class="btn tiny ghost ch-more" id="kMore">${showAll ? 'Thu gọn' : `Xem tất cả ${rk.length} học sinh`}</button>` : ''}
          ${CH.table(['#', 'Học sinh', 'Lớp', 'Loại', 'KPI', 'Xếp loại', 'Ngày học/30', 'Câu/30', '% đúng', 'Điểm KT'], rk.map((k, i) => { const r = K.rating(k.score); return [i + 1, esc(k.name), k.grade, k.type === 'vip' ? 'VIP' : 'Thường', `<b>${k.score}</b>`, `${r.i} ${r.t}`, k.activeDays30, k.q30, k.acc + '%', k.examAvg || '—']; }), 'Xem bảng xếp hạng đầy đủ')}` : '<p class="muted">Chưa có dữ liệu.</p>';
        if ($('#kMore', el)) $('#kMore', el).onclick = () => { showAll = !showAll; draw(); };
        // Đăng nhập
        const accs = A.all().filter(a => !grade || +a.grade === +grade);
        const days = K.lastDays(30); const cnt = {}; days.forEach(dd => cnt[dd] = [0, 0]);
        const logs = []; accs.forEach(a => { const vi = A.typeOf(a) === 'vip' ? 0 : 1; (a.logins || []).forEach(t => { logs.push({ a, t }); const dd = K.dstr(t); if (cnt[dd]) cnt[dd][vi]++; }); });
        logs.sort((x, y) => y.t - x.t);
        $('#kLog', el).innerHTML = logs.length ? CH.cols(days.map(dd => ({ label: dd.slice(8) + '/' + dd.slice(5, 7), title: dd.split('-').reverse().join('/'), vals: cnt[dd] })), [GV, GN], { w: 420, h: 220, aria: 'Lượt đăng nhập theo ngày' })
          + `<details class="rp-data"><summary>📋 30 lượt đăng nhập gần nhất</summary><div class="log-list">${logs.slice(0, 30).map(l => `<div><span class="muted">${fmtD(l.t)}</span><span>${MA.U.av(l.a.avatar)} ${esc(l.a.name)} <small class="muted">L${l.a.grade}</small></span>${A.typeOf(l.a) === 'vip' ? '👑' : '🎒'}</div>`).join('')}</div></details>` : '<p class="muted">Chưa có lượt đăng nhập.</p>';
        CH.bind(el);
      };
      $('#kG', el).onchange = (e) => { grade = e.target.value; draw(); };
      draw();
    },

    // ============================ THỐNG KÊ HỌC TẬP ============================
    stats(el) {
      let grade = 2;
      el.innerHTML = `<h1>📈 Thống kê dữ liệu học tập</h1><div class="adm-tools"><select id="sG">${gradeOpts(2, false)}</select></div><div id="sBody"></div>`;
      const draw = () => {
        const rows = K.topics(grade); const daily = K.daily(14, grade);
        const mist = {}; MA.User.all().forEach(u => (u.mistakes || []).forEach(m => { if (+m.grade === +grade) mist[m.topicId] = (mist[m.topicId] || 0) + 1; }));
        const exams = []; MA.User.all().forEach(u => (u.history || []).filter(h => +h.grade === +grade).forEach(h => exams.push({ u, h })));
        exams.sort((a, b) => b.h.at - a.h.at);
        const weak = rows.filter(r => r.n >= 5).sort((a, b) => a.acc - b.acc).slice(0, 3);
        $('#sBody', el).innerHTML = `
          <div class="card"><h3>✏️ Hoạt động 14 ngày – Lớp ${grade}</h3>${colChart(daily.map(d => ({ l: d.d.slice(8), v: d.q, title: `${d.d}: ${d.q} câu, ${d.act} học sinh` })))}</div>
          ${weak.length ? `<div class="card soft"><h3>⚠️ Chủ đề học sinh còn yếu</h3><p>${weak.map(r => `<span class="chip">${r.t.icon} ${r.t.title} · ${r.acc}% đúng</span>`).join(' ')}</p><p class="muted small">Gợi ý: bổ sung câu hỏi/bài tập ở các chủ đề này trong tab Ngân hàng câu hỏi.</p></div>` : ''}
          <div class="card"><h3>📚 Kết quả theo chủ đề</h3><div class="tbl-wrap"><table class="tbl"><tr><th>Chủ đề</th><th>Học sinh đã luyện</th><th>Lượt trả lời</th><th>% đúng</th><th>Thành thạo TB</th><th>Câu trong sổ lỗi</th></tr>
            ${rows.map(r => `<tr><td>${r.t.icon} ${r.t.title}${C.topicVip(r.t) ? ' 👑' : ''}</td><td>${r.students}</td><td>${r.n}</td><td>${r.n ? r.acc + '%' : '—'}</td><td style="min-width:120px">${UI.masteryBar(r.mastery)}</td><td>${mist[r.t.id] || 0}</td></tr>`).join('')}</table></div></div>
          <div class="card"><h3>📝 Bài kiểm tra gần đây</h3>${exams.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Thời gian</th><th>Học sinh</th><th>Bài</th><th>Điểm</th><th>Đúng</th></tr>${exams.slice(0, 25).map(x => `<tr><td>${fmtD(x.h.at)}</td><td>${MA.U.av(x.u.avatar)} ${esc(x.u.name)}</td><td>${esc(x.h.title)}</td><td><b>${String(x.h.score).replace('.', ',')}</b></td><td>${x.h.right}/${x.h.total}</td></tr>`).join('')}</table></div>` : '<p class="muted">Chưa có bài kiểm tra.</p>'}</div>`;
      };
      $('#sG', el).onchange = (e) => { grade = +e.target.value; draw(); };
      draw();
    },

    // ============================ NGÂN HÀNG CÂU HỎI ============================
    content(el) {
      let grade = 2;
      el.innerHTML = `<h1>🗂️ Ngân hàng câu hỏi & phân quyền</h1>
        <p class="muted">Ẩn/hiện chủ đề, đặt chủ đề hoặc từng dạng bài chỉ dành cho VIP, và biên soạn câu hỏi riêng. Thay đổi có hiệu lực ngay trên máy này; tải file <b>content-config.js</b> ở tab Cài đặt để phát hành cho mọi máy.</p>
        <div class="adm-tools"><select id="cG">${gradeOpts(2, false)}</select><label class="check"><input type="checkbox" id="cL3" ${C.get().vipLevel3 ? 'checked' : ''}> Mọi bài mức <b>Nâng cao</b> chỉ dành cho VIP</label><button class="btn small" id="cNew">➕ Thêm câu hỏi</button></div>
        <div id="cBody"></div>`;
      const draw = () => {
        const s = C.get(); const topics = MA.Data.allTopics(grade);
        const cqs = s.customQuestions.filter(q => +q.grade === +grade);
        $('#cBody', el).innerHTML = `<div class="ctopics">${topics.map(t => { const hid = s.hiddenTopics.includes(t.id), vip = s.vipTopics.includes(t.id); const n = cqs.filter(q => q.topicId === t.id).length; return `<details class="card ctopic ${hid ? 'hid' : ''}"><summary><span>${t.icon} <b>${t.title}</b> <small class="muted">${t.gens.filter(g => !g.custom).length} dạng · ${n} câu tự soạn</small></span>
            <span class="ct-tg"><label class="check"><input type="checkbox" data-hide="${t.id}" ${hid ? 'checked' : ''}> Ẩn</label><label class="check"><input type="checkbox" data-vipt="${t.id}" ${vip ? 'checked' : ''}> 👑 VIP</label><button class="btn small ghost" data-add="${t.id}">➕ Câu hỏi</button></span></summary>
            <div class="gen-list">${t.gens.filter(g => !g.custom).map(g => { const key = C.genKey(t, g); return `<label class="gen-row"><input type="checkbox" data-vipg="${esc(key)}" ${s.vipGens.includes(key) ? 'checked' : ''} ${vip ? 'disabled' : ''}> ${UI.levelTag(g.level)} ${g.name} ${vip || (s.vipLevel3 && g.level === 3) ? '<small class="muted">(VIP)</small>' : ''}</label>`; }).join('')}<p class="muted small">Tích ô để đặt dạng bài chỉ dành cho VIP.</p></div></details>`; }).join('')}</div>
          <div class="card"><h3>✍️ Câu hỏi tự soạn – Lớp ${grade} (${cqs.length})</h3>${cqs.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Câu hỏi</th><th>Chủ đề</th><th>Mức</th><th>Dạng</th><th>VIP</th><th></th></tr>${cqs.map(q => { const t = MA.Data.topic(q.topicId); return `<tr><td>${C.rich(q.text).slice(0, 140)}</td><td>${t ? t.icon + ' ' + t.title : q.topicId}</td><td>${UI.levelTag(+q.level || 1)}</td><td>${q.type === 'mc' ? 'Trắc nghiệm' : 'Điền đáp số'}</td><td>${q.vip ? '👑' : ''}</td><td class="acts"><button class="btn small ghost" data-pv="${q.id}">👀</button><button class="btn small ghost" data-ed="${q.id}">✏️</button><button class="btn small ghost danger" data-rm="${q.id}">🗑</button></td></tr>`; }).join('')}</table></div>` : '<p class="muted">Chưa có câu hỏi tự soạn cho lớp này.</p>'}</div>`;
        $$('[data-hide]', el).forEach(c => c.onchange = () => { C.toggle('hiddenTopics', c.dataset.hide, c.checked); draw(); });
        $$('[data-vipt]', el).forEach(c => c.onchange = () => { C.toggle('vipTopics', c.dataset.vipt, c.checked); draw(); });
        $$('[data-vipg]', el).forEach(c => c.onchange = () => C.toggle('vipGens', c.dataset.vipg, c.checked));
        $$('[data-add]', el).forEach(b => b.onclick = (e) => { e.preventDefault(); this.editQ({ grade, topicId: b.dataset.add }, draw); });
        $$('[data-ed]', el).forEach(b => b.onclick = () => this.editQ(C.get().customQuestions.find(q => q.id === b.dataset.ed), draw));
        $$('[data-pv]', el).forEach(b => b.onclick = () => this.preview(C.get().customQuestions.find(q => q.id === b.dataset.pv)));
        $$('[data-rm]', el).forEach(b => b.onclick = () => UI.confirm('Xóa câu hỏi này?', () => { C.removeQuestion(b.dataset.rm); draw(); }));
      };
      $('#cG', el).onchange = (e) => { grade = +e.target.value; draw(); };
      $('#cL3', el).onchange = (e) => { C.get().vipLevel3 = e.target.checked; C.save(); draw(); };
      $('#cNew', el).onclick = () => this.editQ({ grade }, draw);
      draw();
    },
    editQ(q, done) {
      q = JSON.parse(JSON.stringify(Object.assign({ type: 'mc', level: 1, options: ['', '', '', ''], correct: 0, answer: '', accept: '', unit: '', text: '', hint: '', steps: '', vip: false }, q || {})));
      const topicOpts = (g) => MA.Data.allTopics(g).map(t => `<option value="${t.id}" ${t.id === q.topicId ? 'selected' : ''}>${t.icon} ${t.title}</option>`).join('');
      UI.modal(`<h2>${q.id ? '✏️ Sửa câu hỏi' : '➕ Thêm câu hỏi'}</h2>
        <div class="grid2"><label class="fld"><span>Lớp</span><select id="qG">${gradeOpts(q.grade || 2, false)}</select></label><label class="fld"><span>Chủ đề</span><select id="qT">${topicOpts(q.grade || 2)}</select></label></div>
        <div class="grid2"><label class="fld"><span>Mức độ</span><select id="qL"><option value="1">Cơ bản</option><option value="2">Vận dụng</option><option value="3">Nâng cao</option></select></label><label class="fld"><span>Dạng câu hỏi</span><select id="qY"><option value="mc">Trắc nghiệm (A, B, C, D)</option><option value="num">Điền đáp số</option></select></label></div>
        <label class="fld"><span>Nội dung câu hỏi</span><textarea id="qX" rows="3" style="width:100%" placeholder="Ví dụ: Tính **25 + 37**. (dùng **chữ đậm**, 2^3 cho số mũ, [3/4] cho phân số)">${esc(q.text)}</textarea></label>
        <div id="qMc"><span class="fld-l">Các phương án (chọn ô tròn ở đáp án đúng)</span>${[0, 1, 2, 3].map(i => `<div class="opt-row"><input type="radio" name="qC" value="${i}" ${+q.correct === i ? 'checked' : ''}><b>${'ABCD'[i]}</b><input data-o="${i}" value="${esc(q.options[i] || '')}" placeholder="Phương án ${'ABCD'[i]}${i > 1 ? ' (có thể bỏ trống)' : ''}"></div>`).join('')}</div>
        <div id="qNum" class="grid2"><label class="fld"><span>Đáp số đúng</span><input id="qA" value="${esc(q.answer)}" placeholder="Ví dụ: 62 hoặc 3/4 hoặc 2,5"></label><label class="fld"><span>Đơn vị (nếu có)</span><input id="qU" value="${esc(q.unit)}" placeholder="cm, kg, quả…"></label><label class="fld"><span>Đáp án chấp nhận thêm (ngăn cách bằng ;)</span><input id="qAc" value="${esc(q.accept)}"></label></div>
        <label class="fld"><span>Gợi ý</span><input id="qH" value="${esc(q.hint)}"></label>
        <label class="fld"><span>Lời giải từng bước (mỗi dòng một bước)</span><textarea id="qS" rows="3" style="width:100%">${esc(q.steps)}</textarea></label>
        <label class="check"><input type="checkbox" id="qV" ${q.vip ? 'checked' : ''}> 👑 Chỉ dành cho tài khoản VIP</label>
        <div class="btn-row"><button class="btn" id="qSave">💾 Lưu</button><button class="btn ghost" id="qPv">👀 Xem thử</button></div>`, (b, close) => {
        $('#qL', b).value = q.level; $('#qY', b).value = q.type;
        const sw = () => { const mc = $('#qY', b).value === 'mc'; $('#qMc', b).hidden = !mc; $('#qNum', b).hidden = mc; }; sw();
        $('#qY', b).onchange = sw;
        $('#qG', b).onchange = () => { $('#qT', b).innerHTML = topicOpts(+$('#qG', b).value); };
        const read = () => Object.assign(q, { grade: +$('#qG', b).value, topicId: $('#qT', b).value, level: +$('#qL', b).value, type: $('#qY', b).value, text: $('#qX', b).value.trim(), options: [0, 1, 2, 3].map(i => $(`[data-o="${i}"]`, b).value.trim()), correct: +(($('input[name=qC]:checked', b) || {}).value || 0), answer: $('#qA', b).value.trim(), unit: $('#qU', b).value.trim(), accept: $('#qAc', b).value.trim(), hint: $('#qH', b).value.trim(), steps: $('#qS', b).value.trim(), vip: $('#qV', b).checked });
        const valid = () => { if (!q.text) return 'Chưa nhập nội dung câu hỏi.'; if (q.type === 'mc') { if (q.options.filter(Boolean).length < 2) return 'Cần ít nhất 2 phương án.'; if (!q.options[q.correct]) return 'Phương án đúng đang để trống.'; } else if (!q.answer) return 'Chưa nhập đáp số đúng.'; return ''; };
        $('#qSave', b).onclick = () => { read(); const err = valid(); if (err) return UI.toast(err, 'bad'); C.upsertQuestion(q); close(); UI.toast('✅ Đã lưu câu hỏi', 'good'); done && done(); };
        $('#qPv', b).onclick = () => { read(); const err = valid(); if (err) return UI.toast(err, 'bad'); this.preview(q); };
      }, { wide: true });
    },
    preview(cq) {
      const q = C.wrap(cq);
      UI.modal('<h2>👀 Xem thử câu hỏi</h2><div id="pvBox"></div>', (b) => MA.Quiz.mount($('#pvBox', b), q, { no: 1, total: 1, onAnswer: () => 0 }), { wide: true });
    },

    // ============================ ĐỀ THI & VIP ============================
    exams(el) {
      const draw = () => {
        const s = C.get();
        el.innerHTML = `<h1>📝 Đề thi, bài tập & quyền VIP</h1>
          <div class="card"><h3>Loại đề có sẵn</h3><p class="muted small">Tích để đặt loại đề chỉ dành cho tài khoản VIP.</p>${MA.Views.exam.TYPES.map(t => `<label class="check" style="margin-right:18px"><input type="checkbox" data-vx="${t.id}" ${s.vipExams.includes(t.id) ? 'checked' : ''}> ${t.icon} ${t.name}</label>`).join('')}</div>
          <div class="card"><div class="sec-head"><h3>✍️ Đề thi / bài tập do thầy cô biên soạn (${s.customExams.length})</h3><button class="btn small" id="exNew">➕ Tạo đề</button></div>
          ${s.customExams.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Tên đề</th><th>Lớp</th><th>Số câu</th><th>Thời gian</th><th>Nguồn câu hỏi</th><th>VIP</th><th></th></tr>${s.customExams.map(e => `<tr><td><b>${esc(e.title)}</b>${e.note ? `<br><small class="muted">${esc(e.note)}</small>` : ''}</td><td>${e.grade}</td><td>${e.n}</td><td>${e.time} phút</td><td>${e.source === 'custom' ? 'Câu hỏi tự soạn' : 'Ngân hàng tự sinh' + (e.level ? ' · ' + MA.Data.LEVELS[e.level] : ' · tăng dần')}</td><td>${e.vip ? '👑' : ''}</td><td class="acts"><button class="btn small ghost" data-ee="${e.id}">✏️</button><button class="btn small ghost danger" data-er="${e.id}">🗑</button></td></tr>`).join('')}</table></div>` : '<p class="muted">Chưa có đề nào.</p>'}</div>`;
        $$('[data-vx]', el).forEach(c => c.onchange = () => C.toggle('vipExams', c.dataset.vx, c.checked));
        $('#exNew', el).onclick = () => this.editExam(null, draw);
        $$('[data-ee]', el).forEach(b => b.onclick = () => this.editExam(C.get().customExams.find(x => x.id === b.dataset.ee), draw));
        $$('[data-er]', el).forEach(b => b.onclick = () => UI.confirm('Xóa đề này?', () => { C.removeExam(b.dataset.er); draw(); }));
      };
      draw();
    },
    editExam(e, done) {
      e = JSON.parse(JSON.stringify(Object.assign({ title: '', grade: 2, topicIds: [], n: 10, time: 20, level: 0, source: 'mixed', vip: true, note: '' }, e || {})));
      const tps = (g) => MA.Data.allTopics(g).map(t => `<label class="check"><input type="checkbox" data-tp="${t.id}" ${e.topicIds.includes(t.id) ? 'checked' : ''}> ${t.icon} ${t.title}</label>`).join('');
      UI.modal(`<h2>${e.id ? '✏️ Sửa đề' : '➕ Tạo đề thi / bài tập'}</h2>
        <label class="fld"><span>Tên đề</span><input id="eT" value="${esc(e.title)}" placeholder="Ví dụ: Đề luyện thi HSG số 1"></label>
        <div class="grid2"><label class="fld"><span>Lớp</span><select id="eG">${gradeOpts(e.grade, false)}</select></label><label class="fld"><span>Nguồn câu hỏi</span><select id="eS"><option value="mixed">Ngân hàng tự sinh (vô hạn)</option><option value="custom">Chỉ câu hỏi tự soạn</option></select></label></div>
        <div class="fld"><span>Chủ đề</span><div class="tp-list" id="eTp">${tps(e.grade)}</div></div>
        <div class="grid2"><label class="fld"><span>Số câu</span><input id="eN" type="number" min="1" max="50" value="${e.n}"></label><label class="fld"><span>Thời gian (phút)</span><input id="eM" type="number" min="1" max="180" value="${e.time}"></label></div>
        <label class="fld"><span>Mức độ (với ngân hàng tự sinh)</span><select id="eL"><option value="0">Tăng dần (cơ bản → nâng cao)</option><option value="1">Cơ bản</option><option value="2">Vận dụng</option><option value="3">Nâng cao</option></select></label>
        <label class="fld"><span>Ghi chú cho học sinh</span><input id="eNo" value="${esc(e.note)}"></label>
        <label class="check"><input type="checkbox" id="eV" ${e.vip ? 'checked' : ''}> 👑 Chỉ dành cho tài khoản VIP</label>
        <div class="btn-row"><button class="btn" id="eSave">💾 Lưu đề</button></div>`, (b, close) => {
        $('#eS', b).value = e.source; $('#eL', b).value = e.level;
        $('#eG', b).onchange = () => { $('#eTp', b).innerHTML = tps(+$('#eG', b).value); };
        $('#eSave', b).onclick = () => {
          Object.assign(e, { title: $('#eT', b).value.trim(), grade: +$('#eG', b).value, source: $('#eS', b).value, topicIds: $$('[data-tp]', b).filter(x => x.checked).map(x => x.dataset.tp), n: Math.max(1, +$('#eN', b).value || 10), time: Math.max(1, +$('#eM', b).value || 20), level: +$('#eL', b).value, note: $('#eNo', b).value.trim(), vip: $('#eV', b).checked });
          if (!e.title) return UI.toast('Nhập tên đề', 'bad'); if (!e.topicIds.length) return UI.toast('Chọn ít nhất một chủ đề', 'bad');
          if (e.source === 'custom' && !C.get().customQuestions.some(q => e.topicIds.includes(q.topicId))) return UI.toast('Các chủ đề đã chọn chưa có câu hỏi tự soạn.', 'bad');
          C.upsertExam(e); close(); UI.toast('✅ Đã lưu đề', 'good'); done && done();
        };
      }, { wide: true });
    },

    // ============================ BÁO CÁO TỪNG HỌC SINH ============================
    report(el, params) {
      const id = params[0], u = id && MA.User.get(id);
      if (u) {
        el.innerHTML = '<div class="no-print"><a class="link" href="#/admin/report">‹ Chọn học sinh khác</a></div><div id="rpBox"></div>';
        const base = 'admin/report/' + encodeURIComponent(id);
        return params[1] ? MA.Report.topic($('#rpBox', el), u, params[1], { admin: true, base }) : MA.Report.render($('#rpBox', el), u, { admin: true, base });
      }
      const list = A.all().map(a => ({ a, u: MA.User.get(a.id), vip: A.typeOf(a) === 'vip' })).filter(x => x.u)
        .sort((x, y) => (y.vip - x.vip) || ((y.a.lastLogin || 0) - (x.a.lastLogin || 0)));
      el.innerHTML = `<h1>📑 Báo cáo học tập từng học sinh</h1>
        <p class="muted">Thống kê chi tiết đến từng bài học: bài đã học, thời gian đọc bài & luyện tập, kết quả, dạng bài yếu, lỗi sai, bài liên quan — kèm biểu đồ, xuất CSV và in.</p>
        <div class="card"><div class="grid3"><label class="fld"><span>Tìm học sinh</span><input id="rsQ" placeholder="Tên học sinh…"></label><label class="fld"><span>Loại</span><select id="rsT"><option value="">Tất cả</option><option value="vip">👑 VIP</option><option value="normal">Thường</option></select></label><label class="fld"><span>Lớp</span><select id="rsG"><option value="">Tất cả</option>${[1, 2, 3, 4, 5, 6].map(g => `<option>${g}</option>`).join('')}</select></label></div>
        <div class="tbl-wrap" id="rsList"></div></div>`;
      const draw = () => {
        const q = MA.U.slug($('#rsQ', el).value), ty = $('#rsT', el).value, g = +$('#rsG', el).value;
        const rows = list.filter(x => (!q || MA.U.slug(x.a.name).includes(q)) && (!ty || (ty === 'vip') === x.vip) && (!g || x.u.grade === g));
        $('#rsList', el).innerHTML = rows.length ? `<table class="tbl"><tr><th>Học sinh</th><th>Lớp</th><th>Loại</th><th>Bài đã học</th><th>Câu đã làm</th><th>% đúng</th><th>Học gần nhất</th><th></th></tr>${rows.map(x => { const ts = MA.Data.topics(x.u.grade); const learned = ts.filter(t => MA.Report.statusOf((x.u.topics || {})[t.id]) !== 'new').length; const s = x.u.stats || {}; return `<tr><td>${MA.U.av(x.u.avatar)} ${esc(x.a.name)}</td><td>${x.u.grade}</td><td>${x.vip ? '<span class="tag vip">👑 VIP</span>' : 'Thường'}</td><td>${learned}/${ts.length}</td><td>${s.answered || 0}</td><td>${s.answered ? Math.round(s.correct / s.answered * 100) + '%' : '—'}</td><td><small>${fmtD(x.a.lastLogin)}</small></td><td><a class="btn small" href="#/admin/report/${encodeURIComponent(x.a.id)}">📈 Xem báo cáo</a></td></tr>`; }).join('')}</table>` : '<p class="muted">Không có học sinh phù hợp.</p>';
      };
      ['#rsQ', '#rsT', '#rsG'].forEach(s => $(s, el).oninput = draw); draw();
    },

    // ============================ CÀI ĐẶT ============================
    // ============================ LỚP HỌC & BÀI TẬP VỀ NHÀ ============================
    // Thầy cô tạo lớp (có mã), học sinh nhập mã ở Hồ sơ → Tài khoản để vào lớp.
    // Giao bài: chọn chủ đề + số câu + hạn nộp → hiện ngay trên trang chủ của học sinh trong lớp.
    classes(el, params) {
      const cls = C.classes(); const cur = params[0] ? C.classById(params[0]) : null;
      if (cur) return this.classReport(el, cur);
      const members = (id) => A.all().filter(a => a.classId === id);
      el.innerHTML = `<div class="adm-head"><h1>🏫 Lớp học & bài tập về nhà</h1><p class="muted">Tạo lớp, đưa <b>mã lớp</b> cho học sinh (nhập tại Hồ sơ → Tài khoản), rồi giao bài và theo dõi kết quả cả lớp.</p></div>
        <div class="card"><h3>➕ Tạo lớp mới</h3><div class="grid3"><label class="fld"><span>Tên lớp</span><input id="clN" placeholder="Ví dụ: 3A – cô Hoa"></label><label class="fld"><span>Khối lớp</span><select id="clG">${gradeOpts(3, false)}</select></label><div class="fld"><span>&nbsp;</span><button class="btn" id="clGo">Tạo lớp</button></div></div></div>
        ${cls.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Lớp</th><th>Mã lớp</th><th>Học sinh</th><th>Bài đã giao</th><th></th></tr>${cls.map(c => `<tr><td><b>${esc(c.name)}</b><br><small class="muted">Lớp ${c.grade}</small></td><td><code class="code-out">${esc(c.code || '—')}</code></td><td>${members(c.id).length}</td><td>${C.assignments(c.id).length}</td><td><a class="btn small" href="#/admin/classes/${c.id}">📊 Mở lớp</a> <button class="btn small ghost danger" data-del="${c.id}">Xóa</button></td></tr>`).join('')}</table></div>` : '<p class="muted">Chưa có lớp nào.</p>'}`;
      $('#clGo', el).onclick = () => { const n = $('#clN', el).value.trim(); if (n.length < 2) return UI.toast('Nhập tên lớp', 'bad'); const c = C.upsertClass({ name: n, grade: +$('#clG', el).value }); UI.toast(`✅ Đã tạo lớp. Mã lớp: ${c.code}`, 'good'); UI.route(); };
      $$('[data-del]', el).forEach(b => b.onclick = () => UI.confirm('Xóa lớp này và các bài tập đã giao? (Kết quả học của học sinh vẫn giữ nguyên)', () => { C.removeClass(b.dataset.del); UI.route(); }));
    },
    classReport(el, c) {
      const accs = A.all().filter(a => a.classId === c.id); const users = accs.map(a => ({ a, u: MA.User.get(a.id) || {} }));
      const hws = C.assignments(c.id); const ts = MA.Data.topics(c.grade);
      const cell = (m, n) => n ? `<td class="hm" style="--h:${Math.max(0, Math.min(100, m))}" title="${m}% · ${n} câu">${m}</td>` : '<td class="hm none">·</td>';
      const avg = ts.map(t => { const v = users.map(x => (x.u.topics || {})[t.id]).filter(p => p && p.n); return { t, n: v.length, m: v.length ? Math.round(v.reduce((s, p) => s + p.m, 0) / v.length) : null }; });
      const weakest = avg.filter(x => x.n >= Math.max(1, users.length / 3) && x.m != null).sort((a, b) => a.m - b.m).slice(0, 3);
      el.innerHTML = `<div class="adm-head"><a href="#/admin/classes">← Các lớp</a><h1>🏫 ${esc(c.name)}</h1><p class="muted">Lớp ${c.grade} · mã lớp <code class="code-out">${esc(c.code || '')}</code> · ${accs.length} học sinh</p></div>
        <div class="card"><h3>📌 Giao bài mới</h3>
          <div class="grid3"><label class="fld"><span>Tên bài</span><input id="hwT" placeholder="Ví dụ: Luyện bảng nhân 6, 7"></label><label class="fld"><span>Số câu</span><select id="hwN">${[5, 10, 15, 20].map(n => `<option ${n === 10 ? 'selected' : ''}>${n}</option>`).join('')}</select></label><label class="fld"><span>Hạn nộp</span><input id="hwD" type="date"></label></div>
          <div class="fld"><span>Chủ đề</span><div class="chips" id="hwTp">${ts.map(t => `<button class="chip" data-id="${t.id}">${t.icon} ${esc(t.title)}</button>`).join('')}</div></div>
          <div class="btn-row"><button class="btn" id="hwGo">Giao bài cho cả lớp</button></div></div>
        ${weakest.length ? `<div class="card soft"><h3>🔎 Chủ đề cả lớp còn yếu</h3><p>${weakest.map(x => `${x.t.icon} <b>${esc(x.t.title)}</b> (TB ${x.m}%)`).join(' · ')}</p><p class="muted small">Gợi ý: giao bài tập cho các chủ đề này, hoặc ôn lại trên lớp.</p></div>` : ''}
        <div class="card"><h3>📋 Kết quả bài tập</h3>${hws.length && users.length ? `<div class="tbl-wrap"><table class="tbl small"><tr><th>Học sinh</th>${hws.map(h => `<th title="${esc(h.title)}">${esc(h.title.length > 18 ? h.title.slice(0, 17) + '…' : h.title)}<br><small>${h.due ? 'hạn ' + h.due.split('-').reverse().join('/') : ''}</small> <button class="link danger" data-rmhw="${h.id}" title="Xóa bài">✕</button></th>`).join('')}</tr>${users.map(x => `<tr><td>${MA.U.av(x.a.avatar)} ${esc(x.a.name)}</td>${hws.map(h => { const d = (x.u.hw || {})[h.id]; return d ? `<td class="${d.score >= 8 ? 'up' : d.score < 5 ? 'down' : ''}">${String(d.score).replace('.', ',')}</td>` : '<td class="muted">—</td>'; }).join('')}</tr>`).join('')}<tr><th>Đã nộp</th>${hws.map(h => `<th>${users.filter(x => (x.u.hw || {})[h.id]).length}/${users.length}</th>`).join('')}</tr></table></div>` : `<p class="muted">${users.length ? 'Chưa giao bài nào.' : 'Chưa có học sinh nào vào lớp. Đưa mã lớp cho học sinh nhập tại Hồ sơ → Tài khoản.'}</p>`}</div>
        ${users.length ? `<div class="card"><h3>🌡️ Bản đồ nhiệt mức thành thạo (%)</h3><div class="tbl-wrap"><table class="tbl small heat"><tr><th>Học sinh</th>${ts.map(t => `<th title="${esc(t.title)}">${t.icon}</th>`).join('')}</tr>${users.map(x => `<tr><td>${esc(x.a.name)}</td>${ts.map(t => { const p = (x.u.topics || {})[t.id]; return cell(p ? p.m : 0, p ? p.n : 0); }).join('')}</tr>`).join('')}<tr><th>Cả lớp</th>${avg.map(x => x.m == null ? '<td class="hm none">·</td>' : cell(x.m, x.n)).join('')}</tr></table></div><p class="muted small">Đỏ: dưới 50% · vàng: 50–79% · xanh: từ 80%. Rê chuột lên ô để xem số câu đã làm.</p></div>` : ''}`;
      const sel = new Set();
      $$('#hwTp .chip', el).forEach(b => b.onclick = () => { b.classList.toggle('on'); sel[b.classList.contains('on') ? 'add' : 'delete'](b.dataset.id); });
      $('#hwGo', el).onclick = () => { const t = $('#hwT', el).value.trim() || 'Bài tập về nhà'; if (!sel.size) return UI.toast('Chọn ít nhất một chủ đề', 'bad'); C.upsertAssignment({ classId: c.id, title: t, topicIds: [...sel], n: +$('#hwN', el).value, due: $('#hwD', el).value || '' }); UI.toast('✅ Đã giao bài cho lớp', 'good'); UI.route(); };
      $$('[data-rmhw]', el).forEach(b => b.onclick = () => UI.confirm('Xóa bài tập này?', () => { C.removeAssignment(b.dataset.rmhw); UI.route(); }));
    },

    // ============================ BẠN ẢO ĐUA RANK ============================
    // Nhóm tài khoản ảo cho từng lớp: XP tự tăng mỗi ngày (tính từ hạt giống, giống nhau trên mọi máy),
    // luôn có dấu 🤖 trên bảng xếp hạng, không tính vào KPI / thống kê.
    bots(el) {
      const B = MA.Bots, L = B.LEVELS, gs = B.groups().slice().sort((a, b) => a.grade - b.grade || a.created - b.created);
      const lvOpts = (sel, short) => Object.keys(L).map(k => `<option value="${k}" ${k === sel ? 'selected' : ''}>${L[k].icon} ${L[k].name}${short ? '' : ` (~${L[k].base} XP/ngày học)`}</option>`).join('');
      const realTop = (g) => { const r = MA.User.leaderboard(g).filter(x => !x.u.bot); return r.length ? r[0].xp : 0; };
      const grades = [...new Set(gs.map(g => +g.grade))];
      const linked = MA.Sync && MA.Sync.isAdminLinked();
      el.innerHTML = `<div class="adm-head"><h1>🤖 Bạn ảo đua rank</h1><p class="muted">Tạo các <b>bạn ảo</b> cho từng lớp để bảng xếp hạng luôn có đối thủ, giúp con có động lực học. XP của bạn ảo <b>tự tăng mỗi ngày</b> theo tốc độ đã chọn (có ngày nghỉ, ngày chăm; trong ngày tăng dần từ 7h đến 21h), giống nhau trên mọi máy. Bạn ảo luôn có dấu <span class="bot-tag">🤖</span> và <b>không</b> được tính vào KPI, thống kê hay báo cáo.</p></div>
        <div class="card"><h3>➕ Tạo nhóm bạn ảo</h3>
          <div class="grid3"><label class="fld"><span>Lớp</span><select id="btG">${gradeOpts(MA.User.current ? MA.User.current.grade : 3, false)}</select></label>
            <label class="fld"><span>Số bạn ảo (1–${B.MAX_N})</span><input id="btN" type="number" min="1" max="${B.MAX_N}" value="8"></label>
            <label class="fld"><span>Tốc độ học</span><select id="btL">${lvOpts('mid')}</select></label></div>
          <div class="grid3"><label class="fld"><span>XP khởi đầu</span><select id="btW">${B.WARM.map(([d, t]) => `<option value="${d}" ${d === 7 ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <div class="fld"><span>&nbsp;</span><button class="btn" id="btGo">🤖 Tạo bạn ảo</button></div></div>
          <p class="muted small">Gợi ý: mỗi lớp nên có 1 nhóm <b>Vừa</b> (8–10 bạn) và 1 nhóm <b>Nhanh</b> (2–3 bạn) để con luôn có người sát nút và người để phấn đấu. Mỗi bạn ảo có mức chăm chỉ riêng (0,55–1,45 lần tốc độ nhóm). ${linked ? 'Đã nối máy chủ: thay đổi tự phát hành cho mọi máy.' : 'Nhớ tải file <b>content-config.js</b> ở tab Cài đặt để phát hành cho mọi máy.'}</p></div>
        ${grades.length ? grades.map(gr => { const all = B.list(gr, { all: true }); const on = all.filter(b => b.on); const top = realTop(gr);
          return `<div class="card"><h3>Lớp ${gr} <small class="muted">· ${on.length} bạn ảo đang đua · XP bạn ảo ${on.length ? Math.min(...on.map(b => b.xp)) + '–' + Math.max(...on.map(b => b.xp)) : '—'} · học sinh thật cao nhất ${top} XP</small></h3>
            <div class="tbl-wrap"><table class="tbl"><tr><th>Nhóm</th><th>Tốc độ</th><th>Số bạn</th><th>Bắt đầu</th><th></th></tr>
            ${gs.filter(g => +g.grade === gr).map(g => { const mem = all.filter(b => b.gid === g.id).sort((a, b) => b.xp - a.xp);
              return `<tr class="${g.on === false ? 'bot-off' : ''}"><td><b>${g.on === false ? '⏸️ Đang tắt' : '▶️ Đang đua'}</b><div class="bot-list">${mem.map(b => `<span title="Tuần này: ${b.wxp} XP">${MA.U.av(b.avatar)} ${esc(b.name)} · <b>${b.xp}</b></span>`).join('')}</div></td>
                <td><select data-lv="${g.id}">${lvOpts(g.level, true)}</select></td>
                <td><input data-n="${g.id}" type="number" min="1" max="${B.MAX_N}" value="${g.n}" style="max-width:80px"></td>
                <td><small>${B.dayStr(g.start).split('-').reverse().join('/')}${g.warm ? `<br>(+${g.warm} ngày trước)` : ''}</small></td>
                <td><button class="btn small ghost" data-tg="${g.id}">${g.on === false ? '▶️ Bật' : '⏸️ Tắt'}</button> <button class="btn small ghost" data-rs="${g.id}" title="Đổi tên, ảnh và điểm của cả nhóm">🎲 Đổi bạn</button> <button class="btn small ghost danger" data-rm="${g.id}">Xóa</button></td></tr>`; }).join('')}</table></div></div>`; }).join('')
        : '<div class="card empty"><div class="big-emoji">🤖</div><p>Chưa có bạn ảo nào. Tạo nhóm đầu tiên ở trên nhé!</p></div>'}`;
      $('#btGo', el).onclick = () => {
        const n = +$('#btN', el).value; if (!(n >= 1 && n <= B.MAX_N)) return UI.toast(`Số bạn ảo từ 1 đến ${B.MAX_N}`, 'bad');
        const g = B.add({ grade: +$('#btG', el).value, n, level: $('#btL', el).value, warm: +$('#btW', el).value });
        UI.toast(`✅ Đã tạo ${g.n} bạn ảo cho Lớp ${g.grade}`, 'good'); UI.route();
      };
      $$('[data-lv]', el).forEach(s => s.onchange = () => { B.update(s.dataset.lv, { level: s.value }); UI.route(); });
      $$('[data-n]', el).forEach(i => i.onchange = () => { B.update(i.dataset.n, { n: +i.value }); UI.route(); });
      $$('[data-tg]', el).forEach(b => b.onclick = () => { const g = B.groups().find(x => x.id === b.dataset.tg); B.update(g.id, { on: g.on === false }); UI.route(); });
      $$('[data-rs]', el).forEach(b => b.onclick = () => UI.confirm('Đổi toàn bộ tên, ảnh đại diện và điểm của nhóm bạn ảo này?', () => { B.reseed(b.dataset.rs); UI.route(); }));
      $$('[data-rm]', el).forEach(b => b.onclick = () => UI.confirm('Xóa nhóm bạn ảo này khỏi bảng xếp hạng?', () => { B.remove(b.dataset.rm); UI.route(); }));
    },

    settings(el) {
      const s = A.adminSession(); const logs = MA.Store.get('admin_log', []);
      const SY = MA.Sync, si = SY ? SY.info() : { supported: false };
      const localOnly = A.all().filter(a => !(SY && SY.syncable(a)));
      el.innerHTML = `<h1>⚙️ Cài đặt & phát hành</h1>
        <div class="card"><h3>☁️ Máy chủ đồng bộ (hosting)</h3>
          ${!si.supported ? `<p class="muted">Đang chạy <b>không có máy chủ</b> (mở trực tiếp file, hoặc đã tắt trong <code>js/config/sync-config.js</code>). Dữ liệu chỉ nằm trên trình duyệt từng máy.</p>`
          : `<table class="tbl"><tr><td>Địa chỉ API</td><td><code>${esc(si.api)}</code></td></tr>
              <tr><td>Kết nối</td><td>${si.online === false ? '⚠️ Không kết nối được' : si.online ? '✅ Đang kết nối' : '…'}</td></tr>
              <tr><td>Phiên quản trị máy chủ</td><td>${si.admin ? '✅ ' + esc(si.admin) : '⚠️ Chưa — hãy đăng xuất và đăng nhập lại khi có mạng để quản lý dữ liệu toàn hệ thống'}</td></tr>
              <tr><td>Hồ sơ đã đồng bộ</td><td>${si.synced}</td></tr>
              <tr><td>Hồ sơ chỉ trên máy này (không có SĐT)</td><td>${localOnly.length}${localOnly.length ? ' — ' + localOnly.slice(0, 6).map(a => esc(a.name)).join(', ') + (localOnly.length > 6 ? '…' : '') : ''}</td></tr>
              <tr><td>Lần đồng bộ gần nhất</td><td>${si.lastSync ? fmtD(si.lastSync) : 'chưa có'}${si.pending ? ` · ${si.pending} thao tác chờ gửi` : ''}</td></tr></table>
            <div class="btn-row"><button class="btn" id="syNow">🔄 Đồng bộ ngay</button>${si.admin ? '<button class="btn ghost" id="syAll">⬆️ Đẩy lại toàn bộ dữ liệu trên máy này lên máy chủ</button>' : ''}</div>
            <p class="muted small">Đăng nhập quản trị khi có mạng → toàn bộ hồ sơ, gói VIP, câu hỏi và đề thi được tải về để thống kê & KPI. Chỉnh sửa trên Admin Board tự gửi lên máy chủ và áp dụng cho mọi máy, <b>không cần chép đè file cấu hình</b>. Dữ liệu học sinh từng học trước khi có máy chủ: mở trang trên máy đó và đăng nhập quản trị một lần, hệ thống sẽ đẩy lên.</p>`}
        </div>
        <div class="card"><h3>🔑 Tạo mã kích hoạt VIP</h3><p class="muted small">Mã do máy chủ sinh ngẫu nhiên, <b>chỉ dùng 1 lần</b> (cần nối máy chủ). Mã gắn với đúng <b>tên + SĐT cha/mẹ</b> học sinh đã dùng khi đăng nhập. Học sinh nhập mã tại Hồ sơ → Tài khoản; VIP có hiệu lực <b>1 năm kể từ ngày nhập mã</b>, sau đó học sinh bắt buộc đặt mật khẩu đăng nhập.</p>
          <div class="grid3"><label class="fld"><span>Tên học sinh</span><input id="vcN"></label><label class="fld"><span>SĐT cha/mẹ (bắt buộc)</span><input id="vcP" type="tel"></label><label class="fld"><span>Hạn cuối nhập mã (trống = 30 ngày)</span><input id="vcU" type="date"></label></div>
          <div class="btn-row"><button class="btn" id="vcGo">Tạo mã</button><code id="vcOut" class="code-out"></code></div></div>
        <div class="card"><h3>📦 Phát hành nội dung cho mọi máy</h3><p class="muted small">${SY && SY.isAdminLinked() ? '☁️ Đang nối máy chủ: chỉnh sửa được phát hành <b>tự động</b>. Tải file chỉ để sao lưu, hoặc dùng cho bản chạy không có máy chủ.' : 'Sau khi chỉnh câu hỏi, đề thi, quyền VIP: tải file và chép đè vào <code>js/config/content-config.js</code> trên website.'}</p>
          <div class="btn-row"><button class="btn" id="stCfg">⬇️ Tải file content-config.js</button><label class="btn ghost">⬆️ Nhập nội dung từ file<input type="file" id="stImp" accept=".js,.json" hidden></label><button class="btn ghost danger" id="stReset">↩️ Bỏ chỉnh sửa, dùng lại file gốc</button></div></div>
        <div class="card"><h3>🔒 Đổi mật khẩu quản trị (${esc(s.user)})</h3><div class="grid3"><label class="fld"><span>Mật khẩu hiện tại</span><input id="pwO" type="password"></label><label class="fld"><span>Mật khẩu mới</span><input id="pwN" type="password"></label><label class="fld"><span>Nhập lại</span><input id="pwR" type="password"></label></div>
          <div class="btn-row"><button class="btn" id="pwGo">Đổi mật khẩu</button><button class="btn ghost" id="pwDl">⬇️ Tải file accounts-config.js</button></div><p class="muted small">${SY && SY.isAdminLinked() ? '☁️ Mật khẩu được đổi trên máy chủ, áp dụng cho mọi máy (file accounts-config.js chỉ dùng khi chạy không có máy chủ).' : 'Mật khẩu mới có hiệu lực trên máy này ngay. Để áp dụng cho mọi máy, tải file accounts-config.js và chép đè vào <code>js/config/</code>.'}</p></div>
        <div class="card"><h3>💾 Sao lưu toàn bộ tài khoản & dữ liệu học tập</h3><div class="btn-row"><button class="btn ghost" id="bkAll">⬇️ Tải file tài khoản (accounts.json)</button><label class="btn ghost">⬆️ Gộp dữ liệu từ file<input type="file" id="bkIn" accept=".json" hidden></label></div>
          <p class="muted small">Dùng để gom dữ liệu học sinh từ nhiều máy về một máy quản trị (dữ liệu được gộp, không ghi đè tài khoản đang có).</p></div>
        <div class="card"><h3>🕘 Nhật ký đăng nhập quản trị</h3>${logs.length ? `<table class="tbl">${logs.slice(0, 15).map(l => `<tr><td>${fmtD(l.at)}</td><td>${esc(l.user)}</td></tr>`).join('')}</table>` : '<p class="muted">Chưa có.</p>'}</div>`;
      if ($('#syNow', el)) $('#syNow', el).onclick = async () => { $('#syNow', el).disabled = true; await SY.now(); UI.toast(SY.status === 'ok' ? '☁️ Đã đồng bộ' : '⚠️ Chưa kết nối được máy chủ', SY.status === 'ok' ? 'good' : 'bad'); UI.route(); };
      if ($('#syAll', el)) $('#syAll', el).onclick = () => UI.confirm('Gửi lại toàn bộ hồ sơ (có SĐT) và gói VIP trên máy này lên máy chủ? Dữ liệu trùng sẽ được gộp, không mất kết quả học.', async () => { await SY.pushAll(); UI.toast('☁️ Đã gửi xong', 'good'); UI.route(); });
      $('#vcGo', el).onclick = async () => { const n = $('#vcN', el).value.trim(); if (n.length < 2) return UI.toast('Nhập tên học sinh', 'bad'); const b = $('#vcGo', el); b.disabled = true; const r = await A.makeVipCode($('#vcP', el).value.trim(), n, $('#vcU', el).value); b.disabled = false; if (r.error) return UI.toast(r.error, 'bad'); $('#vcOut', el).textContent = r.code + ' · nhập trước ' + new Date(r.exp).toLocaleDateString('vi-VN'); try { navigator.clipboard.writeText(r.code).then(() => UI.toast('Đã sao chép mã: ' + r.code, 'good')).catch(() => {}); } catch (e) { /* bỏ qua */ } };
      $('#stCfg', el).onclick = () => MA.U.download('content-config.js', C.fileText(), 'text/javascript');
      $('#stReset', el).onclick = () => UI.confirm('Bỏ mọi chỉnh sửa nội dung trên máy này và dùng lại file content-config.js gốc?', () => { C.resetToFile(); UI.route(); });
      $('#stImp', el).onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { let t = String(r.result); if (/=\s*\{/.test(t)) t = t.slice(t.indexOf('{', t.indexOf('ContentConfig')), t.lastIndexOf('}') + 1); const obj = JSON.parse(t); MA.Store.set('content', obj); location.reload(); } catch (err) { UI.toast('File không hợp lệ', 'bad'); } }; r.readAsText(f); };
      $('#pwGo', el).onclick = async () => { const o = $('#pwO', el).value, n = $('#pwN', el).value; if (n !== $('#pwR', el).value) return UI.toast('Nhập lại chưa khớp', 'bad'); const r = await A.changeAdminPass(s.user, o, n); if (r.error) return UI.toast(r.error, 'bad'); ['#pwO', '#pwN', '#pwR'].forEach(x => $(x, el).value = ''); UI.toast(SY && SY.isAdminLinked() ? '✅ Đã đổi mật khẩu trên máy chủ (áp dụng cho mọi máy).' : '✅ Đã đổi mật khẩu. Nhớ tải file accounts-config.js để áp dụng cho mọi máy.', 'good'); };
      $('#pwDl', el).onclick = () => MA.U.download('accounts-config.js', A.configFileText(), 'text/javascript');
      $('#bkAll', el).onclick = () => MA.U.download(`accounts-${MA.U.today()}.json`, JSON.stringify({ accounts: MA.Store.get('accounts', {}), users: MA.Store.get('users', {}) }, null, 1));
      $('#bkIn', el).onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); const acc = MA.Store.get('accounts', {}), us = MA.Store.get('users', {}); let n = 0; Object.keys(d.accounts || {}).forEach(id => { if (!acc[id]) { acc[id] = d.accounts[id]; n++; } }); Object.keys(d.users || {}).forEach(id => { if (!us[id]) us[id] = d.users[id]; }); MA.Store.set('accounts', acc); MA.Store.set('users', us); UI.toast(`✅ Đã gộp ${n} tài khoản mới`, 'good'); } catch (err) { UI.toast('File không hợp lệ', 'bad'); } }; r.readAsText(f); };
    }
  };

  // ------------------------------ BẮT BUỘC ĐỔI MẬT KHẨU MẶC ĐỊNH ------------------------------
  MA.Views.adminpw = {
    render(app) {
      const s = MA.Account.adminSession(); const { $ } = MA.U;
      app.innerHTML = `<div class="card narrow"><h1>🔒 Đổi mật khẩu quản trị</h1>
        <p class="muted">Tài khoản <b>${MA.U.esc(s.user)}</b> đang dùng mật khẩu mặc định (đã ghi trong tài liệu phát hành). Để bảo vệ dữ liệu học sinh, hãy đặt mật khẩu mới trước khi vào Bảng quản trị.</p>
        <label class="fld"><span>Mật khẩu hiện tại</span><input id="fpO" type="password" autocomplete="current-password"></label>
        <label class="fld"><span>Mật khẩu mới (ít nhất 8 kí tự)</span><input id="fpN" type="password" autocomplete="new-password"></label>
        <label class="fld"><span>Nhập lại mật khẩu mới</span><input id="fpR" type="password" autocomplete="new-password"></label>
        <div class="btn-row"><button class="btn big" id="fpGo">Lưu mật khẩu mới</button></div></div>`;
      const go = async () => {
        const o = $('#fpO', app).value, n = $('#fpN', app).value;
        if (n !== $('#fpR', app).value) return MA.UI.toast('Nhập lại chưa khớp', 'bad');
        const b = $('#fpGo', app); b.disabled = true; const r = await MA.Account.changeAdminPass(s.user, o, n); b.disabled = false;
        if (r.error) return MA.UI.toast(r.error, 'bad');
        MA.UI.toast('✅ Đã đổi mật khẩu. Chào mừng đến Bảng quản trị!', 'good'); MA.UI.route();
      };
      $('#fpGo', app).onclick = go; $('#fpR', app).onkeydown = (e) => { if (e.key === 'Enter') go(); };
    }
  };
})(window.MA);
