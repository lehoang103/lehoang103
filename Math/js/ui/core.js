/* =========================================================
 * ui/core.js — Quản lý giao diện chung: điều hướng (router), khung trang,
 * thanh menu, thông báo (toast), hộp thoại (modal), pháo hoa chúc mừng,
 * cài đặt (âm thanh, cỡ chữ, giao diện sáng/tối).
 * ========================================================= */
window.MA = window.MA || {};
window.TV_BUILD = 27;   // phiên bản – đổi bằng tools/doi-phien-ban.js (boot.js so với ?v= để phát hiện tệp cũ)

(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  MA.Views = MA.Views || {};

  const NAV = [
    { id: 'home', icon: '🏠', label: 'Trang chủ' },
    { id: 'learn', icon: '📚', label: 'Học bài' },
    { id: 'practice', icon: '✏️', label: 'Luyện tập' },
    { id: 'review', icon: '🔁', label: 'Ôn tập' },
    { id: 'exam', icon: '📝', label: 'Kiểm tra' },
    { id: 'timo', icon: '🌏', label: 'TIMO' },
    { id: 'worksheet', icon: '🖨️', label: 'Phiếu in' },
    { id: 'rank', icon: '🏆', label: 'Xếp hạng' },
    { id: 'vip', icon: '👑', label: 'VIP' }
  ];

  // Mục chính hiện sẵn; các mục còn lại nằm trong menu "Thêm"
  const MAIN = ['home', 'learn', 'practice', 'review'];
  const MORE = ['exam', 'timo', 'rank', 'vip'];

  const UI = {
    NAV,
    settings: Object.assign({ sound: true, font: 1, theme: 'auto', warmup: true, typed: true, voice: '', voiceRate: 1, full: false }, MA.Store.get('settings', {})),
    // Đã bỏ tự đọc đề: cô chỉ đọc khi người học bấm nút 🔊 (giữ hàm để tương thích)
    autoRead() { return false; },
    saveSettings() { MA.Store.set('settings', this.settings); this.applySettings(); },
    applySettings() {
      const s = this.settings;
      MA.Sound.muted = !s.sound;
      document.documentElement.style.setProperty('--fs', ['15px', '17px', '19px', '21px'][s.font] || '17px');
      if (s.theme === 'auto') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', s.theme);
    },

    // ---------- Router ----------
    go(path) { if (MA.Nav.path() === path) this.route(); else MA.Nav.go(path); },
    route() {
      MA.Sound.stop();
      const hash = MA.Nav.path() || 'home';
      const [name, ...params] = hash.split('/');
      this.trackRead(name === 'learn' ? params[0] : null);
      const app = $('#app');
      if (name === 'admin') {
        app.innerHTML = ''; app.className = 'view view-admin';
        if (MA.Account.adminMustChange()) { this.renderAdminHeader(); MA.Views.adminpw.render(app); window.scrollTo(0, 0); return; }
        if (MA.Account.isAdmin()) { this.renderAdminHeader(); try { MA.Views.admin.render(app, params.map(decodeURIComponent)); } catch (e) { console.error(e); app.innerHTML = `<div class="card"><h2>Lỗi</h2><p>${esc(e.message)}</p></div>`; } }
        else { this.renderHeader(); MA.Views.login.render(app, ['admin']); }
        window.scrollTo(0, 0); return;
      }
      if (!MA.User.current && name !== 'login') { this.renderHeader(); return MA.Views.login.render(app); }
      // Tài khoản VIP bắt buộc bổ sung SĐT + mật khẩu trước khi học tiếp
      if (MA.User.current && MA.Account.needsVipSetup()) { this.renderHeader('vip'); app.className = 'view view-vipsetup'; return MA.Views.vipsetup.render(app); }
      // Hồ sơ đăng ký bằng SĐT: tự mời kích hoạt dùng thử VIP (nhập SĐT + đặt mật khẩu)
      if (MA.User.current && name !== 'login' && MA.Account.trialOffer()) { this.renderHeader('vip'); app.className = 'view view-vipsetup'; MA.Views.viptrial.render(app); window.scrollTo(0, 0); return; }
      const view = MA.Views[name] || MA.Views.home;
      this.renderHeader(name === 'theory' ? 'learn' : name);   // Ôn lý thuyết SGK thuộc mục Học bài
      app.innerHTML = '';
      app.className = 'view view-' + name;
      try { view.render(app, params.map(decodeURIComponent)); }
      catch (e) { console.error(e); app.innerHTML = `<div class="card"><h2>Ôi, có lỗi xảy ra 😢</h2><p>${esc(e.message)}</p><a class="btn" href="#/home">Về trang chủ</a></div>`; }
      window.scrollTo(0, 0);
    },

    // ---------- Header & điều hướng ----------
    renderAdminHeader() {
      document.body.dataset.view = 'admin';
      const s = MA.Account.adminSession();
      $('#topbar').innerHTML = `<div class="tb-inner"><a class="logo" href="#/admin"><img src="assets/mascot.jpg" alt=""><span>Toán Vui <b>Admin</b></span></a>
        <span class="admin-chip">🛠️ Bảng quản trị</span>
        <div class="tb-right"><span class="muted small">Xin chào, <b>${esc(s.name || s.user)}</b></span><button class="btn ghost small" id="admOut">Đăng xuất</button></div></div>`;
      $('#bottomnav').innerHTML = '';
      $('#admOut').onclick = () => { MA.Account.adminLogout(); this.toast('Đã đăng xuất quản trị.'); this.go(MA.User.current ? 'home' : 'login'); };
    },
    renderHeader(active) {
      document.body.dataset.view = active || 'login';
      const u = MA.User.current; const h = $('#topbar'); const bn = $('#bottomnav');
      if (!u) { h.innerHTML = `<div class="tb-inner"><a class="logo" href="#/login"><img src="assets/mascot.jpg" alt=""><span>Toán Vui <b>1–6</b></span></a></div>`; bn.innerHTML = ''; return; }
      const g = MA.Data.grade(u.grade) || { name: 'Lớp ' + u.grade };
      const xp = MA.User.gradeXp(); const rk = MA.User.rankOf(xp);
      const vip = MA.Account.isVip();
      const moreIds = MORE.filter(id => !(id === 'vip' && vip));
      const moreOn = moreIds.includes(active) || active === 'week';
      const item = (n, bottom) => `<a href="#/${n.id}" class="${active === n.id ? 'on' : ''}">${bottom ? `<span>${n.icon}</span>${n.label}` : `${n.icon} ${n.label}`}</a>`;
      const core = NAV.filter(n => MAIN.includes(n.id));
      h.innerHTML = `<div class="tb-inner">
        <a class="logo" href="#/home"><img src="assets/mascot.jpg" alt=""><span>Toán Vui <b>1–6</b></span></a>
        <button class="grade-chip" id="gradeBtn" title="Đổi lớp" style="--gc:${g.color || '#888'}">${g.emoji || '📘'} ${g.name} ▾</button>
        <nav class="topnav">${core.map(n => item(n)).join('')}<button class="more-btn ${moreOn ? 'on' : ''}" id="moreBtn">⋯ Thêm</button></nav>
        <div class="tb-right">
          ${MA.Sync && MA.Sync.supported ? `<button class="icon-btn sync-dot" id="syncDot" data-s="${MA.Sync.status}" title="Đồng bộ máy chủ" hidden>☁️</button>` : ''}
          <a class="rank-pill" href="#/rank" title="Hạng ${rk.name} – ${xp} XP" style="--rc:${rk.color}">${rk.icon}<span>${xp} XP</span></a>
          ${vip ? '<a class="vip-pill" href="#/rank/me" title="Tài khoản VIP">👑 VIP</a>' : ''}
          <button class="avatar-btn" id="userBtn" title="${esc(u.name)}">${MA.U.av(u.avatar)}<span>${esc(u.name)}</span></button>
        </div></div>`;
      bn.innerHTML = core.map(n => item(n, true)).join('') + `<button class="more-btn ${moreOn ? 'on' : ''}" id="moreBtn2"><span>⋯</span>Thêm</button>`;
      $('#gradeBtn').onclick = () => this.pickGrade();
      $$('#moreBtn, #moreBtn2').forEach(b => b.onclick = () => this.moreMenu());
      if ($('#syncDot')) { this.syncDot(); $('#syncDot').onclick = () => this.syncInfo(); }
      $('#userBtn').onclick = () => this.userMenu();
    },
    // ---------- Chế độ tập trung (toàn màn hình) khi làm bài tập / bài thi ----------
    // Ẩn thanh menu, chân trang; dùng toàn màn hình của trình duyệt nếu hỗ trợ
    // (iPhone/iPad không cho toàn màn hình trang web → vẫn ẩn menu để tập trung).
    focus: {
      on: false,
      native() { return document.fullscreenElement || document.webkitFullscreenElement || null; },
      enter() {
        this.on = true; document.body.classList.add('focus-mode');
        const d = document.documentElement, req = d.requestFullscreen || d.webkitRequestFullscreen;
        if (req && !this.native()) { try { const r = req.call(d, { navigationUI: 'hide' }); if (r && r.catch) r.catch(() => {}); } catch (e) { /* trình duyệt chặn */ } }
        this.sync();
      },
      exit() {
        this.on = false; document.body.classList.remove('focus-mode');
        if (this.native()) { this._leaving = true; const ex = document.exitFullscreen || document.webkitExitFullscreen; try { const r = ex.call(document); if (r && r.catch) r.catch(() => {}); } catch (e) { /* bỏ qua */ } }
        this.sync();
      },
      // bấm nút: bật/tắt và ghi nhớ cho các lần làm bài sau
      toggle() { this.on ? this.exit() : this.enter(); UI.settings.focus = this.on; UI.saveSettings(); },
      button() { return `<button class="btn ghost small fs-btn" type="button" aria-pressed="${this.on}" title="${this.on ? 'Thoát chế độ toàn màn hình (Esc)' : 'Toàn màn hình — ẩn menu để tập trung làm bài'}"><span class="fs-i" aria-hidden="true">${this.on ? '🗗' : '⛶'}</span><span class="fs-t">${this.on ? 'Thu nhỏ' : 'Toàn màn hình'}</span></button>`; },
      sync() { $$('.fs-btn').forEach(b => { b.outerHTML = this.button(); }); $$('.fs-btn').forEach(b => b.onclick = () => this.toggle()); }
    },
    // Đo thời gian đọc bài: bắt đầu khi mở trang bài học, cộng dồn khi rời trang / ẩn tab
    trackRead(id) {
      const now = Date.now();
      if (this._read) { MA.User.addReadTime(this._read.id, (now - this._read.t) / 1000); this._read = null; }
      if (id && MA.User.current && MA.Data.topic(decodeURIComponent(id))) this._read = { id: decodeURIComponent(id), t: now };
    },
    // Trạng thái đồng bộ máy chủ (biểu tượng đám mây trên thanh tiêu đề)
    syncDot() {
      const d = $('#syncDot'); if (!d || !MA.Sync) return; const s = MA.Sync.status;
      const acc = MA.Account.current(); const local = acc && !MA.Sync.syncable(acc);
      const t = local ? 'Hồ sơ chỉ lưu trên máy này (chưa có SĐT cha/mẹ)' : { ok: 'Đã đồng bộ với máy chủ', sync: 'Đang đồng bộ…', offline: 'Mất kết nối máy chủ — dữ liệu vẫn lưu trên máy, sẽ tự gửi khi có mạng', error: 'Lỗi đồng bộ', auth: 'Cần đăng nhập lại bằng mật khẩu VIP để đồng bộ', idle: 'Đồng bộ máy chủ' }[s] || '';
      d.hidden = !local && s === 'ok'; d.dataset.s = local ? 'local' : s; d.title = t; d.textContent = local ? '💾' : s === 'offline' || s === 'error' ? '⚠️' : s === 'auth' ? '🔑' : s === 'sync' ? '⏳' : '☁️';
    },
    syncInfo() {
      const i = MA.Sync.info(); const acc = MA.Account.current(); const local = acc && !MA.Sync.syncable(acc);
      this.modal(`<h2>☁️ Đồng bộ dữ liệu</h2>
        ${local ? `<p>Hồ sơ của con hiện <b>chỉ lưu trên máy này</b>. Liên kết số điện thoại cha/mẹ (Hồ sơ → Tài khoản) để lưu lên máy chủ và học tiếp trên máy khác.</p><div class="btn-row"><a class="btn" href="#/rank/me" data-x>👤 Mở hồ sơ</a></div>`
        : `<p>${{ ok: '✅ Kết quả học tập đã được lưu trên máy chủ.', sync: '⏳ Đang đồng bộ…', offline: '⚠️ Chưa kết nối được máy chủ. Con vẫn học bình thường — dữ liệu lưu trên máy và tự gửi lên khi có mạng.', error: '⚠️ ' + (MA.Sync.statusMsg || 'Lỗi đồng bộ'), auth: '🔑 ' + MA.Sync.statusMsg, idle: 'Sẵn sàng đồng bộ.' }[i.status] || ''}</p>
           <p class="muted small">Lần đồng bộ gần nhất: ${i.lastSync ? new Date(i.lastSync).toLocaleString('vi-VN') : 'chưa có'}${i.pending ? ` · ${i.pending} thao tác chờ gửi` : ''}</p>
           <div class="btn-row"><button class="btn" id="snNow">🔄 Đồng bộ ngay</button></div>`}`, (b, close) => {
        $$('[data-x]', b).forEach(x => x.onclick = () => close());
        if ($('#snNow', b)) $('#snNow', b).onclick = async () => { $('#snNow', b).disabled = true; await MA.Sync.now(); close(); this.toast(MA.Sync.status === 'ok' ? '☁️ Đã đồng bộ' : '⚠️ Chưa kết nối được máy chủ', MA.Sync.status === 'ok' ? 'good' : 'bad'); };
      });
    },
    moreMenu() {
      const vip = MA.Account.isVip();
      const items = [...MORE.filter(id => !(id === 'vip' && vip)).map(id => NAV.find(n => n.id === id)), NAV.find(n => n.id === 'worksheet'), { id: 'week', icon: '📊', label: 'Báo cáo tuần' }];
      this.modal(`<h2>⋯ Thêm</h2><div class="more-grid">${items.map(n => `<a class="more-item" href="#/${n.id}"><span>${n.icon}</span><b>${n.label}</b></a>`).join('')}</div>`,
        (box, close) => $$('a', box).forEach(a => a.addEventListener('click', close)));
    },
    pickGrade() {
      const u = MA.User.current;
      this.modal(`<h2>Chọn lớp học</h2><p class="muted">Điểm xếp hạng được tính riêng cho từng lớp.</p>
        <div class="grade-grid">${MA.Data.grades().map(g => `<button class="grade-card ${g.grade === u.grade ? 'on' : ''}" data-g="${g.grade}" style="--gc:${g.color || '#999'}"><span class="ge">${g.emoji || '📘'}</span><b>${g.name}</b><small>${g.topics.length ? g.topics.length + ' chủ đề' : 'Sắp ra mắt'}</small></button>`).join('')}</div>`,
        (box, close) => $$('.grade-card', box).forEach(b => b.onclick = () => { MA.User.setGrade(+b.dataset.g); close(); this.toast(`Đã chuyển sang ${MA.Data.grade(+b.dataset.g) ? MA.Data.grade(+b.dataset.g).name : 'Lớp ' + b.dataset.g}`); this.go('home'); }));
    },
    // Chọn giọng đọc tiếng Việt + tốc độ + nghe thử
    voicePicker(el) {
      const s = this.settings, S = MA.Sound;
      const draw = () => {
        if (!S.canSpeak()) { el.innerHTML = '<span class="muted small">Trình duyệt này chưa hỗ trợ đọc giọng nói.</span>'; return; }
        const list = S.voices(), cur = S.currentVoice();
        const label = (v) => v.name.replace(/^Microsoft\s+/i, '').replace(/\s*-\s*Vietnamese.*$/i, '').replace(/\s*\(Vietnam\)/i, '') + (/natural|neural|online/i.test(v.name) ? ' ⭐ tự nhiên' : /google/i.test(v.name) ? ' (Google)' : '');
        el.innerHTML = list.length ? `<div class="voice-box"><select id="vSel" aria-label="Chọn giọng đọc">${list.map(v => `<option value="${esc(v.voiceURI)}" ${cur && cur.voiceURI === v.voiceURI ? 'selected' : ''}>${esc(label(v))}</option>`).join('')}</select>
            <div class="seg" id="vRate">${[[0.8, 'Chậm'], [1, 'Vừa'], [1.15, 'Nhanh']].map(([r, t]) => `<button data-r="${r}" class="${(+s.voiceRate || 1) === r ? 'on' : ''}">${t}</button>`).join('')}</div>
            <button class="btn tiny ghost" id="vTest">▶️ Nghe thử</button></div>
            ${cur && !/natural|neural|online|google|linh|premium|enhanced/i.test(cur.name) ? '<p class="muted small voice-tip">💡 Giọng này hơi “máy”. Mở trang bằng <b>Microsoft Edge</b> để có giọng HoaiMy / NamMinh tự nhiên hơn.</p>' : ''}`
          : `<div class="voice-tip warn small"><b>Máy chưa có giọng tiếng Việt</b> nên cô không đọc được (đọc bằng giọng nước ngoài sẽ sai âm).<br>Cách khắc phục:<ul>
              <li>💻 Máy tính: mở trang bằng <b>Microsoft Edge</b> (giọng HoaiMy/NamMinh tự nhiên) — hoặc Windows: Cài đặt → Thời gian &amp; ngôn ngữ → Giọng nói → Thêm giọng → <b>Tiếng Việt</b>.</li>
              <li>📱 Android: Cài đặt → Chuyển văn bản thành giọng nói → Công cụ của Google → tải dữ liệu <b>Tiếng Việt</b>.</li>
              <li>🍎 iPhone/iPad/Mac: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → <b>Tiếng Việt (Linh)</b>.</li></ul>
              <button class="btn tiny ghost" id="vRetry">🔄 Kiểm tra lại</button></div>`;
        const sel = $('#vSel', el); if (sel) sel.onchange = () => { s.voice = sel.value; this.saveSettings(); draw(); S.speak('Chào con, cô sẽ đọc đề bài bằng giọng này nhé.'); };
        $$('#vRate button', el).forEach(b => b.onclick = () => { s.voiceRate = +b.dataset.r; this.saveSettings(); $$('#vRate button', el).forEach(x => x.classList.toggle('on', x === b)); S.speak('Tính: 25 cộng 17 bằng bao nhiêu?'); });
        if ($('#vTest', el)) $('#vTest', el).onclick = () => S.speak('Chào con! Tính: <b>1.250 + 375</b> = ? Hình vuông cạnh 8 cm có diện tích là 64 cm².');
        if ($('#vRetry', el)) $('#vRetry', el).onclick = draw;
      };
      draw();
      if (S.canSpeak() && !S.voices().length) setTimeout(draw, 700);   // một số trình duyệt tải danh sách giọng chậm
    },
    // v25: hộp chọn ảnh đại diện — chọn emoji hoặc tải ảnh từ máy (cắt vuông, thu nhỏ 160×160 ngay trên trình duyệt)
    avatarPicker(onDone) {
      const u = MA.User.current; if (!u) return;
      let pick = u.avatar;
      this.modal(`<h2>🖼️ Ảnh đại diện</h2>
        <div class="avp-top"><span class="big-avatar" id="avpPrev">${MA.U.av(pick)}</span><div>
          <label class="btn" id="avpUpL">📷 Chọn ảnh từ máy<input type="file" id="avpFile" accept="image/jpeg,image/png,image/webp,image/gif,image/*" hidden></label>
          <p class="muted small">Ảnh được cắt vuông ở giữa và thu nhỏ trước khi lưu. Ảnh chỉ hiện trên máy này và các máy đăng nhập cùng SĐT cha/mẹ; bảng xếp hạng chung vẫn hiện hình con vật để giữ riêng tư cho con.</p></div></div>
        <div class="fld"><span>Hoặc chọn hình con vật</span><div class="avatars" id="avpEmo">${MA.User.AVATARS.map(a => `<button data-a="${a}" class="${a === pick ? 'on' : ''}">${a}</button>`).join('')}</div></div>
        <div class="btn-row"><button class="btn" id="avpSave">💾 Lưu ảnh đại diện</button></div>`, (box, close) => {
        const show = () => { $('#avpPrev', box).innerHTML = MA.U.av(pick); $$('#avpEmo button', box).forEach(b => b.classList.toggle('on', b.dataset.a === pick)); };
        $$('#avpEmo button', box).forEach(b => b.onclick = () => { pick = b.dataset.a; show(); });
        $('#avpFile', box).onchange = async (e) => {
          const f = e.target.files[0]; e.target.value = ''; if (!f) return;
          const lab = $('#avpUpL', box); lab.classList.add('busy');
          try { pick = await MA.U.photoFromFile(f); show(); }
          catch (err) { this.toast(err && err.message === 'big' ? 'Ảnh lớn quá (trên 15 MB). Con chọn ảnh khác nhé!' : 'Không đọc được ảnh này. Con thử ảnh JPG hoặc PNG nhé!', 'bad'); }
          finally { lab.classList.remove('busy'); }
        };
        $('#avpSave', box).onclick = () => {
          if (!MA.User.setAvatar(pick)) return this.toast('Ảnh chưa hợp lệ, con thử lại nhé!', 'bad');
          close(); this.toast('✅ Đã đổi ảnh đại diện!', 'good'); if (onDone) onDone(); else this.route();
        };
      });
    },
    // v26: hộp nhập mã VIP — mở từ menu cá nhân (cài đặt) và trang Hồ sơ. Đang VIP thì mã mới GIA HẠN thêm 1 năm (máy chủ cộng dồn).
    // Chưa liên kết SĐT cha/mẹ thì nhập luôn SĐT ở đây (mã VIP được tạo theo tên + SĐT).
    vipCodeDialog() {
      const A = MA.Account, u = MA.User.current, a = A.current(); if (!u || !a) return;
      const vip = A.isVip(a), info = vip ? A.vipInfo(a) : null, renew = vip && info && !info.trial;
      this.modal(`<h2>👑 ${renew ? 'Gia hạn VIP bằng mã mới' : 'Nhập mã kích hoạt VIP'}</h2>
        ${renew ? `<p class="muted">Tài khoản đang là VIP đến <b>${new Date(info.until).toLocaleDateString('vi-VN')}</b>. Nhập mã mới để cộng thêm 1 năm.</p>` : `<p class="muted">VIP có hiệu lực <b>1 năm kể từ ngày kích hoạt</b>: tham gia tất cả kì thi, luyện chuyên sâu nâng cao, xem KPI và tư vấn sửa lỗi.</p>`}
        ${a.phoneHash ? '' : `<label class="fld"><span>Số điện thoại cha/mẹ (đã đăng kí với thầy cô)</span><input id="vcPhone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="09xx xxx xxx"></label>`}
        <label class="fld"><span>Mã kích hoạt</span><input id="vcCode" class="vc-code" placeholder="VIP-XXXXX-XXXXX" maxlength="15" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>
        <p class="muted small">Mã được tạo theo đúng <b>tên ${esc(u.name)}</b> + SĐT cha/mẹ. Sau khi kích hoạt cần đặt mật khẩu đăng nhập (≥ 6 kí tự).</p>
        <div class="btn-row"><button class="btn" id="vcGo">${renew ? '➕ Gia hạn' : '✨ Kích hoạt'}</button><a class="btn ghost" href="#/vip">Khu vực VIP</a></div>`, (box, close) => {
        const inp = $('#vcCode', box), go = $('#vcGo', box);
        inp.oninput = () => {   // tự viết hoa + tự thêm dấu gạch: vip ab2cd ef3gh → VIP-AB2CD-EF3GH
          let r = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (r.startsWith('VIP')) r = r.slice(3);
          r = r.slice(0, 10); inp.value = r ? 'VIP-' + r.slice(0, 5) + (r.length > 5 ? '-' + r.slice(5) : '') : '';
        };
        inp.onkeydown = (e) => { if (e.key === 'Enter') go.click(); };
        setTimeout(() => ($('#vcPhone', box) || inp).focus(), 50);
        $$('a', box).forEach(x => x.addEventListener('click', close));
        go.onclick = async () => {
          if (!/^VIP-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(inp.value)) return this.toast('Mã gồm 10 kí tự sau chữ VIP (ví dụ: VIP-AB2CD-EF3GH).', 'bad');
          go.disabled = true; go.classList.add('busy');
          try {
            const ph = $('#vcPhone', box);
            if (ph) {   // liên kết SĐT trước, rồi đăng nhập máy chủ theo SĐT để được phép kích hoạt
              if (A.byPhone(ph.value).some(x => MA.U.slug(x.name) === MA.U.slug(u.name) && x.id !== u.id)) return this.toast('Số này đã có một tài khoản cùng tên.', 'bad');
              if (!A.linkPhone(u.id, ph.value)) return this.toast('Số điện thoại chưa đúng.', 'bad');   // redeem tự đăng nhập máy chủ theo SĐT
            }
            const r = await A.redeemVip(inp.value);
            if (r.error) return this.toast(r.error, 'bad');
            close(); MA.Sound.levelUp();
            this.celebrate(renew ? '👑 Đã gia hạn VIP!' : '👑 Đã kích hoạt VIP!', 'Hiệu lực đến ' + new Date(r.until).toLocaleDateString('vi-VN'));
            this.go('vip');
          } finally { go.disabled = false; go.classList.remove('busy'); }
        };
      });
    },
    userMenu() {
      const s = this.settings, u = MA.User.current;
      this.modal(`<div class="um-head"><button class="big-avatar av-edit" id="umAv" title="Đổi ảnh đại diện">${MA.U.av(u.avatar)}<i>✏️</i></button><div><h2>${esc(u.name)}</h2><span class="muted">${MA.Data.grade(u.grade) ? MA.Data.grade(u.grade).name : ''} · 🔥 ${u.streak.days} ngày liên tiếp</span><div>${MA.Account.isVip() ? '<span class="tag vip">👑 Tài khoản VIP</span>' : '<span class="tag">🎒 Tài khoản thường</span>'} <button class="btn tiny ghost" id="umVip">👑 ${MA.Account.isVip() && !(MA.Account.vipInfo() || {}).trial ? 'Gia hạn VIP' : 'Nhập mã VIP'}</button></div></div></div>
        <div class="settings">
          <label class="set-row"><span>🔊 Âm thanh</span><input type="checkbox" id="setSound" ${s.sound ? 'checked' : ''}></label>
          <label class="set-row"><span>🔁 Khởi động bằng câu ôn bài cũ</span><input type="checkbox" id="setWarm" ${s.warmup ? 'checked' : ''}></label>
          <label class="set-row"><span>⌨️ Tự nhập đáp số (bớt trắc nghiệm)</span><input type="checkbox" id="setTyped" ${s.typed !== false ? 'checked' : ''}></label>
          <label class="set-row"><span>🧩 Hiện đầy đủ thông tin (tắt = giao diện gọn)</span><input type="checkbox" id="setFull" ${s.full ? 'checked' : ''}></label>
          <div class="set-row voice-row"><span>🗣️ Giọng cô đọc</span><div id="setVoice"></div></div>
          <div class="set-row"><span>🔠 Cỡ chữ</span><div class="seg">${['Nhỏ', 'Vừa', 'Lớn', 'Rất lớn'].map((t, i) => `<button data-f="${i}" class="${s.font === i ? 'on' : ''}">${t}</button>`).join('')}</div></div>
          <div class="set-row"><span>🌗 Giao diện</span><div class="seg">${[['auto', 'Tự động'], ['light', 'Sáng'], ['dark', 'Tối']].map(([k, t]) => `<button data-t="${k}" class="${s.theme === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
        </div>
        <div class="btn-row"><a class="btn ghost" href="#/rank/me">👤 Hồ sơ & huy hiệu</a><a class="btn ghost" href="#/worksheet">🖨️ Phiếu in</a><a class="btn ghost" href="#/week">📨 Báo cáo tuần</a><a class="btn ghost" href="huong-dan.html">📖 Hướng dẫn</a>${MA.Sync && MA.Sync.supported ? '<button class="btn ghost" id="umSync">☁️ Đồng bộ</button>' : ''}${MA.PWA && MA.PWA.canInstall() ? '<button class="btn ghost" id="pwaGo">📲 Cài ứng dụng</button>' : ''}<button class="btn ghost" id="swUser">🔄 Đổi người học</button></div>`,
        (box, close) => {
          $('#setSound', box).onchange = (e) => { s.sound = e.target.checked; this.saveSettings(); };
          $('#setWarm', box).onchange = (e) => { s.warmup = e.target.checked; this.saveSettings(); };
          $('#setFull', box).onchange = (e) => { s.full = e.target.checked; this.saveSettings(); this.toast(s.full ? 'Đã bật giao diện đầy đủ' : 'Đã bật giao diện gọn'); this.route(); };
          $('#setTyped', box).onchange = (e) => { s.typed = e.target.checked; this.saveSettings(); };
          this.voicePicker($('#setVoice', box));
          $$('[data-f]', box).forEach(b => b.onclick = () => { s.font = +b.dataset.f; this.saveSettings(); $$('[data-f]', box).forEach(x => x.classList.toggle('on', x === b)); });
          $$('[data-t]', box).forEach(b => b.onclick = () => { s.theme = b.dataset.t; this.saveSettings(); $$('[data-t]', box).forEach(x => x.classList.toggle('on', x === b)); });
          $('#umAv', box).onclick = () => { close(); this.avatarPicker(); };
          if ($('#umSync', box)) $('#umSync', box).onclick = () => { close(); this.syncInfo(); };
          $('#umVip', box).onclick = () => { close(); this.vipCodeDialog(); };
          $('#swUser', box).onclick = () => { close(); MA.User.logout(); this.go('login'); };
          if ($('#pwaGo', box)) $('#pwaGo', box).onclick = () => { close(); MA.PWA.install(); };
          $$('a', box).forEach(a => a.addEventListener('click', close));
        });
    },

    // ---------- Thông báo & hộp thoại ----------
    toast(msg, kind = '') {
      const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = msg;
      $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3100);
    },
    modal(html, onMount, opts = {}) {
      const wrap = document.createElement('div'); wrap.className = 'modal-wrap';
      wrap.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="modal-x" aria-label="Đóng">✕</button><div class="modal-body">${html}</div></div>`;
      document.body.appendChild(wrap);
      const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 200); MA.Sound.stop(); document.removeEventListener('keydown', esc_); };
      const esc_ = (e) => { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', esc_);
      wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
      $('.modal-x', wrap).onclick = close;
      if (onMount) onMount($('.modal-body', wrap), close);
      return close;
    },
    confirm(msg, yes) {
      this.modal(`<p style="font-size:1.1em">${msg}</p><div class="btn-row"><button class="btn" id="cfYes">Đồng ý</button><button class="btn ghost" id="cfNo">Hủy</button></div>`,
        (b, close) => { $('#cfYes', b).onclick = () => { close(); yes(); }; $('#cfNo', b).onclick = close; });
    },
    celebrate(title, sub) {
      this.confetti();
      const c = document.createElement('div'); c.className = 'celebrate';
      c.innerHTML = `<div class="cel-card"><div class="cel-title">${title}</div><div class="cel-sub">${sub || ''}</div></div>`;
      document.body.appendChild(c); setTimeout(() => c.classList.add('out'), 2200); setTimeout(() => c.remove(), 2700);
    },
    confetti(n = 80) {
      const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
      const W = cv.width = innerWidth, H = cv.height = innerHeight; const ctx = cv.getContext('2d');
      const cols = ['#f29f3d', '#4a7bd8', '#2fa36b', '#e35d9b', '#f6c343', '#8e6cd8'];
      const ps = Array.from({ length: n }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H / 3, vx: (Math.random() - .5) * 14, vy: -Math.random() * 12 - 4, s: Math.random() * 7 + 4, c: cols[Math.floor(Math.random() * cols.length)], r: Math.random() * 6 }));
      let f = 0;
      (function tick() {
        ctx.clearRect(0, 0, W, H);
        ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.r += 0.2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
        if (++f < 120) requestAnimationFrame(tick); else cv.remove();
      })();
    },

    // ---------- Thành phần tái sử dụng ----------
    masteryBar(m, small) {
      const col = m >= 85 ? 'var(--good)' : m >= 50 ? 'var(--accent)' : m > 0 ? 'var(--warn)' : 'var(--line)';
      return `<div class="mbar ${small ? 'sm' : ''}" title="Mức thành thạo ${m}%"><i style="width:${Math.max(m, 2)}%;background:${col}"></i></div>`;
    },
    levelTag(l) { return `<span class="lvl lvl${l}">${MA.Data.LEVELS[l]}</span>`; },
    // Hộp xem lại bài học (dùng trong khi làm bài: “Ôn lại kiến thức”)
    lessonPeek(topicId) {
      const t = MA.Data.topic(topicId); if (!t) return;
      this.modal(`<div class="peek"><h2>${t.icon} ${t.title}</h2><p>${t.summary}</p>
        ${t.rules.map(r => `<div class="rule mini"><h4>${r.title}</h4><p>${r.desc}</p>${r.formula ? `<div class="formula">${r.formula}</div>` : ''}${r.example ? `<div class="example">Ví dụ: ${r.example.replace(/\n/g, '<br>')}</div>` : ''}${MA.Vis.render(r.visual)}</div>`).join('')}
        ${t.poem ? `<div class="poem">${t.poem.map(l => `<div>${l}</div>`).join('')}</div>` : ''}
        <div class="btn-row"><a class="btn ghost" href="#/learn/${t.id}">Mở toàn bộ bài học →</a></div></div>`, (b, close) => $$('a', b).forEach(a => a.addEventListener('click', close)), { wide: true });
    },
    // Thông báo nội dung chỉ dành cho VIP
    vipModal(what) {
      this.modal(`<div class="vip-lock"><div class="big-emoji">👑</div><h2>Nội dung dành cho tài khoản VIP</h2><p>${what || 'Phần này chỉ dành cho học sinh có tài khoản VIP.'}</p>
        <p class="muted">Cách nâng cấp: cha/mẹ liên hệ thầy cô để nhận <b>mã kích hoạt VIP</b>, sau đó vào <b>Hồ sơ → Tài khoản</b> và nhập mã.</p>
        <div class="btn-row center"><a class="btn" href="#/rank/me">🔑 Nhập mã VIP</a></div></div>`, (b, close) => $$('a', b).forEach(a => a.addEventListener('click', close)));
    },
    vipTag() { return '<span class="tag vip">🔒 VIP</span>'; },
    fmtTime(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
    ago(ts) { if (!ts) return 'chưa học'; const d = Math.floor((Date.now() - ts) / 864e5); return d <= 0 ? 'hôm nay' : d === 1 ? 'hôm qua' : d + ' ngày trước'; }
  };

  MA.UI = UI;

  // ---------- Khởi động ứng dụng ----------
  window.addEventListener('hashchange', () => UI.route());
  // thoát toàn màn hình bằng phím Esc của trình duyệt → tắt luôn chế độ tập trung
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => {
    const F = UI.focus;
    if (F._leaving) {   // sự kiện do chính ứng dụng thoát toàn màn hình (chuyển trang) — không phải người dùng bấm Esc
      F._leaving = false;
      if (F.on && !F.native()) { const d = document.documentElement, req = d.requestFullscreen || d.webkitRequestFullscreen; try { const r = req && req.call(d); if (r && r.catch) r.catch(() => {}); } catch (e) { /* bỏ qua */ } }
      return;
    }
    if (!F.native() && F.on) { F.exit(); UI.settings.focus = false; UI.saveSettings(); }
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && UI.focus.on && !UI.focus.native() && !document.querySelector('.modal-wrap')) { UI.focus.exit(); UI.settings.focus = false; UI.saveSettings(); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    UI.applySettings();
    MA.Account.init();
    MA.Content.apply();
    MA.User.restore();
    MA.User.onChange(() => { const name = MA.Nav.view(); if (MA.User.current) UI.renderHeader(name); });
    MA.Scratchpad && MA.Scratchpad.init();
    if (!MA.Store.available) UI.toast('⚠️ Trình duyệt đang chặn lưu dữ liệu — tiến độ sẽ mất khi đóng trang.');
    UI.route();
    document.addEventListener('visibilitychange', () => {   // (đăng kí trước đồng bộ để thời gian đọc được gửi kèm)
      const r = (MA.Nav.path() || 'home').split('/');
      if (document.visibilityState === 'hidden') UI.trackRead(null); else if (r[0] === 'learn' && r[1]) UI.trackRead(r[1]);
    });
    if (MA.Sync) { MA.Sync.onStatus(() => UI.syncDot()); MA.Sync.start(); }
  });
})(window.MA);
