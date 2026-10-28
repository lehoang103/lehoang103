/* =========================================================
 * ui/views-home.js — Màn hình Đăng nhập (chỉ cần nhập tên) & Trang chủ
 * ========================================================= */
(function (MA) {
  'use strict';
  const { $, $$, esc } = MA.U;
  const UI = MA.UI;

  // ------------------------------ ĐĂNG NHẬP ------------------------------
  MA.Views.login = {
    render(app, params = []) {
      app.className = 'view view-login';
      const users = MA.User.all().filter(u => { const a = MA.Account.get(u.id); return !(a && a.locked) && !u._trim; }).sort((a, b) => ((MA.Account.get(b.id) || {}).lastLogin || 0) - ((MA.Account.get(a.id) || {}).lastLogin || 0)).slice(0, 12);
      let grade = 2, avatar = MA.User.AVATARS[0], tab = ['admin', 'vip'].includes(params[0]) ? params[0] : 'student';
      app.innerHTML = `
        <section class="login-hero">
          <div class="login-art"><img src="assets/hero.jpg" alt="Cô giáo dạy toán"><div class="bubble">“Học toán không khó khi con hiểu bản chất và luyện tập mỗi ngày!”</div></div>
          <div class="login-card card">
            <div class="seg big login-tabs"><button data-tab="student">🎒 Vào học</button><button data-tab="vip">👑 VIP</button>${tab === 'admin' ? '<button data-tab="admin">🛠️ Quản trị</button>' : ''}</div>
            <div id="tabStudent">
              <h1>Chào mừng đến <span class="brand">Toán Vui 1–6</span> 👋</h1>
              <p class="muted">Không cần đăng ký — nhập tên, số điện thoại của cha/mẹ và chọn lớp là học được ngay!</p>
              ${MA.Account.trialHours() > 0 ? `<p class="trial-note">🎁 Đăng ký bằng <b>số điện thoại cha/mẹ</b> được <b>dùng thử VIP ${MA.Account.trialLabel()}</b> miễn phí.</p>` : ''}
              <label class="fld"><span>Tên của con</span><input id="lgName" maxlength="24" placeholder="Ví dụ: Minh Anh" autocomplete="off"></label>
              <label class="fld"><span>Số điện thoại của cha/mẹ <small class="tag good">Khuyên dùng</small></span><input id="lgPhone" type="tel" inputmode="numeric" maxlength="14" placeholder="Ví dụ: 0912 345 678" autocomplete="off">
                <small class="muted">🔒 Chỉ dùng để nhận diện và đăng nhập lại; được mã hóa, không hiển thị ở bất cứ đâu. Nhiều anh chị em có thể dùng chung một số.</small></label>
              <div class="fld"><span>Con học lớp mấy?</span><div class="seg big" id="lgGrade">${[1, 2, 3, 4, 5, 6].map(g => `<button data-g="${g}" class="${g === grade ? 'on' : ''}">Lớp ${g}</button>`).join('')}</div></div>
              <details class="lg-more"><summary>🙂 Chọn hình đại diện (không bắt buộc)</summary><div class="fld"><div class="avatars" id="lgAv">${MA.User.AVATARS.map((a, i) => `<button data-a="${a}" class="${i === 0 ? 'on' : ''}">${a}</button>`).join('')}</div></div></details>
              <button class="btn big block" id="lgGo">Bắt đầu học 🚀</button>
              <div class="btn-row center"><button class="link" id="lgByPhone">📱 Đăng nhập lại bằng số điện thoại cha/mẹ</button></div>
              <p class="login-guide">Lần đầu dùng? <a href="huong-dan.html">📖 Xem hướng dẫn sử dụng</a> (có hình minh họa)</p>
              ${users.length ? `<div class="known"><h3>Hoặc chọn bạn đã học trên máy này:</h3><div class="known-list">${users.map(u => { const a = MA.Account.get(u.id) || {}; return `<button class="known-u" data-id="${u.id}"><span class="av">${MA.U.av(u.avatar)}</span><b>${esc(u.name)}${MA.Account.typeOf(a) === 'vip' ? ' 👑' : ''}</b><small>Lớp ${u.grade} · ${MA.User.rankOf(MA.User.gradeXp(u, u.grade)).icon} ${MA.User.gradeXp(u, u.grade)} XP${a.phoneHash ? ' · 🔒' : ''}</small></button>`; }).join('')}</div></div>` : ''}
            </div>
            <div id="tabVip">
              <h1>👑 Đăng nhập tài khoản VIP</h1>
              <p class="muted">Tài khoản VIP đăng nhập bằng <b>số điện thoại cha/mẹ</b> và <b>mật khẩu</b> (từ 6 kí tự).</p>
              <label class="fld"><span>Số điện thoại cha/mẹ</span><input id="vpPhone" type="tel" inputmode="numeric" maxlength="14" placeholder="09xx xxx xxx" autocomplete="username"></label>
              <label class="fld"><span>Mật khẩu</span><input id="vpPass" type="password" autocomplete="current-password"></label>
              <button class="btn big block" id="vpGo">Đăng nhập VIP 👑</button>
              <p class="muted small">Quên mật khẩu? Liên hệ thầy cô để được đặt lại.</p>
            </div>
            <div id="tabAdmin">
              <h1>🛠️ Đăng nhập quản trị</h1>
              <p class="muted">Dành cho thầy cô / quản trị viên: cấp quyền VIP, biên soạn câu hỏi, đề thi, xem thống kê và KPI học tập.</p>
              <label class="fld"><span>Tài khoản</span><input id="adUser" autocomplete="username" placeholder="admin"></label>
              <label class="fld"><span>Mật khẩu</span><input id="adPass" type="password" autocomplete="current-password"></label>
              <button class="btn big block" id="adGo">Vào Bảng quản trị</button>
            </div>
          </div>
        </section>
        <details class="features-d"><summary>✨ Toán Vui có những gì?</summary><section class="features">
          ${[['📚', 'Học bài', 'Kiến thức trọng tâm, sơ đồ, hình vẽ trực quan, thơ ghi nhớ.'], ['✏️', 'Luyện tập', 'Bộ đề vô hạn từ cơ bản đến nâng cao, tự điều chỉnh độ khó.'], ['💡', 'Gợi ý & lời giải', 'Gợi ý từng bước và lời giải mẫu kèm hình minh họa.'], ['🔁', 'Ôn bài cũ', 'Tự nhắc ôn kiến thức sắp quên, sổ lỗi sai, thẻ ghi nhớ.'], ['🏆', 'Xếp hạng theo lớp', 'Tích XP, lên hạng từ Mầm Non đến Thần Đồng Toán.'], ['👑', 'Tài khoản VIP', 'Mở khóa đề thi học sinh giỏi và bài tập nâng cao do thầy cô biên soạn.']].map(f => `<div class="feat"><span>${f[0]}</span><b>${f[1]}</b><p>${f[2]}</p></div>`).join('')}
        </section></details>`;
      const setTab = (t) => { tab = t; $$('.login-tabs button', app).forEach(b => b.classList.toggle('on', b.dataset.tab === t)); $('#tabStudent', app).hidden = t !== 'student'; $('#tabVip', app).hidden = t !== 'vip'; $('#tabAdmin', app).hidden = t !== 'admin'; };
      $$('.login-tabs button', app).forEach(b => b.onclick = () => setTab(b.dataset.tab)); setTab(tab);
      $$('#lgGrade button', app).forEach(b => b.onclick = () => { grade = +b.dataset.g; $$('#lgGrade button', app).forEach(x => x.classList.toggle('on', x === b)); });
      $$('#lgAv button', app).forEach(b => b.onclick = () => { avatar = b.dataset.a; $$('#lgAv button', app).forEach(x => x.classList.toggle('on', x === b)); });
      const welcome = (u) => { MA.Sound.complete(); UI.toast(`Chào ${esc(u.name)}! Cùng học thật vui nhé 🎉`, 'good'); UI.go('home'); };
      const go = () => {
        const name = $('#lgName', app).value.trim(), phone = $('#lgPhone', app).value.trim();
        if (name.length < 2) { UI.toast('Con hãy nhập tên (ít nhất 2 chữ cái) nhé!', 'bad'); $('#lgName', app).focus(); return; }
        const doLogin = async () => {
          if (phone && MA.Sync && MA.Sync.supported) {   // lấy hồ sơ của SĐT này từ máy chủ (học trên nhiều máy)
            const btn = $('#lgGo', app); btn.disabled = true; btn.textContent = '⏳ Đang kiểm tra…';
            const s = await MA.Sync.authPhone(phone); btn.disabled = false; btn.textContent = 'Bắt đầu học 🚀';
            if (s.error === 'rate') return UI.toast(s.msg, 'bad');
            if (s.needPassword) {
              const pre0 = MA.Account.resolve(name, phone);
              if (!pre0.error && !pre0.isNew && MA.Account.hasPassword(MA.Account.get(pre0.id))) return this.askPassword(pre0.id);
              setTab('vip'); $('#vpPhone', app).value = phone; $('#vpPass', app).focus();
              return UI.toast('👑 Số điện thoại này thuộc gói VIP — hãy nhập mật khẩu chung của gia đình.', 'bad');
            }
          }
          const pre = MA.Account.resolve(name, phone);
          if (!pre.error && !pre.isNew && MA.Account.hasPassword(MA.Account.get(pre.id))) return this.askPassword(pre.id);
          const r = MA.User.login(name, grade, avatar, phone); if (r.error) return UI.toast(r.error, 'bad'); welcome(r);
        };
        if (!phone) UI.confirm('Con chưa nhập số điện thoại của cha/mẹ. Không có số điện thoại thì khó đăng nhập lại và giữ kết quả học tập. Vẫn tiếp tục chỉ với tên?', doLogin);
        else doLogin();
      };
      $('#lgGo', app).onclick = go;
      [$('#lgName', app), $('#lgPhone', app)].forEach(i => i.onkeydown = (e) => { if (e.key === 'Enter') go(); });
      $('#lgByPhone', app).onclick = () => this.byPhone();
      $$('.known-u', app).forEach(b => b.onclick = () => {
        const id = b.dataset.id; const a = MA.Account.get(id);
        if (MA.Account.hasPassword(a)) return this.askPassword(id);
        if (a && a.phoneHash) return this.verify(id);
        const r = MA.User.loginId(id); if (r.error) return UI.toast(r.error, 'bad'); welcome(r);
      });
      const vpGo = async () => {
        const phone = $('#vpPhone', app).value, pw = $('#vpPass', app).value;
        if (MA.Sync && MA.Sync.supported) {   // mật khẩu được kiểm tra ở máy chủ
          const btn = $('#vpGo', app); btn.disabled = true;
          const s = await MA.Sync.authVip(phone, pw); btn.disabled = false;
          if (s.error && s.error !== 'no_vip') return UI.toast(s.msg || 'Không đăng nhập được.', 'bad');
        }
        const r = MA.Account.loginByPassword(phone, pw);
        if (r.error) return UI.toast(r.error, 'bad');
        const enter = (id) => { const u = MA.User.loginId(id); if (u.error) return UI.toast(u.error, 'bad'); welcome(u); };
        if (!r.family && r.list.length === 1) return enter(r.list[0].id);
        this.chooseProfile(r, enter);
      };
      $('#vpGo', app).onclick = vpGo; $('#vpPass', app).onkeydown = (e) => { if (e.key === 'Enter') vpGo(); };
      const adGo = async () => {
        const user = $('#adUser', app).value, pass = $('#adPass', app).value;
        if (MA.Sync && MA.Sync.supported) {   // có máy chủ: đăng nhập & tải dữ liệu toàn hệ thống
          const btn = $('#adGo', app); btn.disabled = true; btn.textContent = '⏳ Đang tải dữ liệu từ máy chủ…';
          const s = await MA.Sync.authAdmin(user, pass); btn.disabled = false; btn.textContent = 'Vào Bảng quản trị';
          if (s.ok) { UI.toast(s.mustChange ? '🔒 Vui lòng đổi mật khẩu mặc định trước khi tiếp tục.' : 'Đăng nhập quản trị thành công (đã nối máy chủ)', s.mustChange ? '' : 'good'); return UI.route(); }
          if (!s.offline) return UI.toast(s.msg || 'Sai tài khoản hoặc mật khẩu quản trị.', 'bad');
          UI.toast('⚠️ Không kết nối được máy chủ — đăng nhập chế độ ngoại tuyến.', 'bad');
        }
        if (MA.Account.adminLogin(user, pass)) { UI.toast('Đăng nhập quản trị thành công', 'good'); UI.route(); } else UI.toast('Sai tài khoản hoặc mật khẩu quản trị.', 'bad');
      };
      $('#adGo', app).onclick = adGo; $('#adPass', app).onkeydown = (e) => { if (e.key === 'Enter') adGo(); };
    },
    // Gói VIP gia đình: chọn hồ sơ học (tối đa 2 anh chị em) hoặc thêm hồ sơ mới
    chooseProfile(r, enter) {
      const f = r.family; const active = f && MA.Account.famActive(f);
      const slots = f ? (active ? MA.Account.MAX_MEMBERS - f.members.length : 1) : 0;   // gói hết hạn: vẫn tạo được hồ sơ thường
      const others = f ? MA.Account.all().filter(a => a.phoneHash === f.phoneHash && !f.members.includes(a.id)) : [];
      UI.modal(`<h2>👑 Chọn hồ sơ học</h2>${f ? `<p class="muted">Gói VIP gia đình gồm tối đa ${MA.Account.MAX_MEMBERS} hồ sơ học độc lập, dùng chung số điện thoại và mật khẩu. Kết quả của mỗi con được theo dõi riêng.</p>` : ''}
        <div class="known-list">${r.list.map(a => `<button class="known-u" data-id="${a.id}"><span class="av">${MA.U.av(a.avatar)}</span><b>${esc(a.name)}</b><small>Lớp ${a.grade} · ${MA.Account.typeOf(a) === 'vip' ? '👑 VIP' : '🎒 Thường'}</small></button>`).join('')}</div>
        ${slots > 0 ? `<div class="card soft add-prof"><h3>➕ Thêm hồ sơ cho anh/chị/em ${active ? `<small class="muted">(còn ${slots} suất)</small>` : ''}</h3>
          ${others.length ? `<p class="muted small">Hồ sơ đã có trên máy với số điện thoại này:</p><div class="known-list">${others.map(a => `<button class="known-u" data-add="${a.id}"><span class="av">${MA.U.av(a.avatar)}</span><b>${esc(a.name)}</b><small>Lớp ${a.grade} · thêm vào gói</small></button>`).join('')}</div><p class="muted small">Hoặc tạo hồ sơ mới:</p>` : ''}
          <div class="grid2"><label class="fld"><span>Tên của con</span><input id="apName" maxlength="24"></label><label class="fld"><span>Lớp</span><select id="apGrade">${[1, 2, 3, 4, 5, 6].map(g => `<option value="${g}">Lớp ${g}</option>`).join('')}</select></label></div>
          <div class="avatars" id="apAv">${MA.User.AVATARS.slice(0, 10).map((a, i) => `<button data-a="${a}" class="${i === 3 ? 'on' : ''}">${a}</button>`).join('')}</div>
          <div class="btn-row"><button class="btn" id="apAdd">Tạo hồ sơ & vào học</button></div></div>` : (f ? '<p class="muted small">Gói VIP đã đủ 2 hồ sơ.</p>' : '')}`, (b, close) => {
        let av = MA.User.AVATARS[3];
        $$('[data-id]', b).forEach(x => x.onclick = () => { close(); enter(x.dataset.id); });
        $$('#apAv button', b).forEach(x => x.onclick = () => { av = x.dataset.a; $$('#apAv button', b).forEach(y => y.classList.toggle('on', y === x)); });
        const add = (opts) => { const res = MA.Account.addMember(r.list[0].id, opts); if (res.error) return UI.toast(res.error, 'bad'); close(); UI.toast(active ? '✅ Đã thêm hồ sơ vào gói VIP' : '✅ Đã tạo hồ sơ', 'good'); enter(res.id); };
        $$('[data-add]', b).forEach(x => x.onclick = () => add({ existingId: x.dataset.add }));
        if ($('#apAdd', b)) $('#apAdd', b).onclick = () => add({ name: $('#apName', b).value, grade: +$('#apGrade', b).value, avatar: av });
      });
    },
    // Tài khoản có mật khẩu (VIP): bắt buộc nhập mật khẩu
    askPassword(id) {
      const a = MA.Account.get(id);
      UI.modal(`<h2>${MA.U.av(a.avatar)} ${esc(a.name)} ${MA.Account.typeOf(a) === 'vip' ? '<span class="tag vip">👑 VIP</span>' : ''}</h2><p>Tài khoản này được bảo vệ bằng mật khẩu.</p><input id="apPass" type="password" placeholder="Mật khẩu (từ 6 kí tự)"><div class="btn-row"><button class="btn" id="apGo">Vào học</button></div><p class="muted small">Quên mật khẩu? Liên hệ thầy cô để được đặt lại.</p>`, (b, close) => {
        const go = async () => {
          const pw = $('#apPass', b).value;
          if (MA.Sync && MA.Sync.supported && a.phoneHash) { const s = await MA.Sync.authVip(a.phoneHash, pw); if (s.error && s.error !== 'no_vip') return UI.toast(s.msg || 'Mật khẩu chưa đúng.', 'bad'); }
          if (!MA.Account.checkPassword(id, pw)) return UI.toast('Mật khẩu chưa đúng.', 'bad'); close(); const r = MA.User.loginId(id); if (r.error) return UI.toast(r.error, 'bad'); UI.go('home'); };
        $('#apGo', b).onclick = go; $('#apPass', b).onkeydown = (e) => { if (e.key === 'Enter') go(); }; setTimeout(() => $('#apPass', b).focus(), 50);
      });
    },
    // Xác nhận SĐT khi chọn tài khoản đã gắn số điện thoại
    verify(id) {
      const a = MA.Account.get(id);
      UI.modal(`<h2>${MA.U.av(a.avatar)} ${esc(a.name)}</h2><p>Nhập số điện thoại của cha/mẹ đã dùng khi đăng ký để vào học.</p><input id="vfPhone" type="tel" inputmode="numeric" placeholder="09xx xxx xxx"><div class="btn-row"><button class="btn" id="vfGo">Vào học</button></div>`, (b, close) => {
        const go = async () => { const ph = $('#vfPhone', b).value; if (!MA.Account.checkPhone(id, ph)) return UI.toast('Số điện thoại chưa đúng.', 'bad'); close();
          if (MA.Sync && MA.Sync.supported) { const s = await MA.Sync.authPhone(ph); if (s.needPassword) return this.askPassword(id); }
          const r = MA.User.loginId(id); if (r.error) return UI.toast(r.error, 'bad'); UI.go('home'); };
        $('#vfGo', b).onclick = go; $('#vfPhone', b).onkeydown = (e) => { if (e.key === 'Enter') go(); }; setTimeout(() => $('#vfPhone', b).focus(), 50);
      });
    },
    // Đăng nhập lại: nhập SĐT → chọn tên con
    byPhone() {
      UI.modal(`<h2>📱 Đăng nhập lại</h2><p class="muted">Nhập số điện thoại của cha/mẹ để tìm tài khoản của con trên máy này.</p><input id="bpPhone" type="tel" inputmode="numeric" placeholder="09xx xxx xxx"><div class="btn-row"><button class="btn" id="bpFind">Tìm tài khoản</button></div><div id="bpList"></div>`, (b, close) => {
        const find = async () => {
          const phone = $('#bpPhone', b).value; let s = {};
          if (MA.Sync && MA.Sync.supported) { $('#bpList', b).innerHTML = '<p class="muted">⏳ Đang tìm trên máy chủ…</p>'; s = await MA.Sync.authPhone(phone); }
          if (s.needPassword) { $('#bpList', b).innerHTML = `<p class="muted">👑 Số điện thoại này thuộc <b>gói VIP</b>. Hãy đăng nhập ở tab <b>VIP</b> bằng số điện thoại và mật khẩu chung.</p><div class="btn-row"><a class="btn" href="#/login/vip" id="bpVip">Đăng nhập VIP</a></div>`; $('#bpVip', b).onclick = () => close(); return; }
          const list = MA.Account.byPhone(phone).filter(a => !(MA.User.get(a.id) || {})._trim);
          $('#bpList', b).innerHTML = list.length ? `<div class="known-list">${list.map(a => `<button class="known-u" data-id="${a.id}"><span class="av">${MA.U.av(a.avatar)}</span><b>${esc(a.name)}</b><small>Lớp ${a.grade}${MA.Account.typeOf(a) === 'vip' ? ' · 👑 VIP' : ''}</small></button>`).join('')}</div>`
            : `<p class="muted">Không tìm thấy tài khoản nào với số này${MA.Sync && MA.Sync.supported && !s.offline ? '' : ' trên máy'}. Hãy nhập tên + số điện thoại ở màn hình trước để tạo hồ sơ.</p>`;
          $$('.known-u', b).forEach(x => x.onclick = () => { close(); if (MA.Account.hasPassword(MA.Account.get(x.dataset.id))) return this.askPassword(x.dataset.id); const r = MA.User.loginId(x.dataset.id); if (r.error) return UI.toast(r.error, 'bad'); UI.go('home'); });
        };
        $('#bpFind', b).onclick = find; $('#bpPhone', b).onkeydown = (e) => { if (e.key === 'Enter') find(); }; setTimeout(() => $('#bpPhone', b).focus(), 50);
      });
    }
  };

  // ------------------------------ TRANG CHỦ ------------------------------
  // Gọn: 1 việc chính mỗi ngày (Nhiệm vụ hôm nay), các lối tắt nhỏ, rồi danh sách chủ đề.
  MA.Views.home = {
    render(app) {
      const u = MA.User.current, g = MA.Data.grade(u.grade), topics = MA.Data.topics(u.grade), T = MA.Tutor;
      const xp = MA.User.gradeXp(), rk = MA.User.rankOf(xp);
      const acc = u.stats.answered ? Math.round(u.stats.correct / u.stats.answered * 100) : 0;
      const plan = T.missionPlan(u), mDone = T.missionDone(u), place = T.needsPlacement(u);
      const next = plan.topic;
      const mist = MA.User.mistakes(u.grade).length;
      const lb = MA.User.leaderboard(u.grade); const pos = lb.findIndex(r => r.u.id === u.id) + 1;
      const hour = new Date().getHours(); const hi = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
      const short = (t) => t.length > 34 ? t.slice(0, 32) + '…' : t;
      const main = place
        ? `<p>Lần đầu học ${g.name}? Làm <b>bài kiểm tra đầu vào 15 câu</b> để biết con nên bắt đầu từ đâu nhé!</p>
           <div class="btn-row"><a class="btn big" href="#/review/placement">🧭 Làm bài đầu vào</a>${next ? `<a class="btn big ghost" href="#/learn/${next.id}">📖 Học bài đầu tiên</a>` : ''}</div>`
        : `<p>${mDone ? '✔ Con đã xong <b>nhiệm vụ hôm nay</b>. Giỏi lắm! Có thể học thêm bài mới hoặc luyện tự do.' : 'Mỗi ngày một <b>nhiệm vụ khoảng 15 phút</b>: ôn đúng lúc bài sắp quên, sửa lỗi sai và học tiếp bài mới.'}</p>
           <div class="mission-chips"><span class="${plan.due.length ? '' : 'off'}">🔁 Ôn ${plan.due.length} dạng</span><span class="${plan.mist.length ? '' : 'off'}">📒 Sửa ${plan.mist.length} lỗi</span>${next ? `<span>✨ ${esc(short(next.title))}</span>` : ''}</div>
           <div class="btn-row"><a class="btn big" href="#/review/mission">${mDone ? '🎯 Làm thêm nhiệm vụ' : '🎯 Nhiệm vụ hôm nay'}</a>${next ? `<a class="btn big ghost" href="#/learn/${next.id}">📖 Học tiếp</a>` : ''}</div>`;

      app.innerHTML = `
        <section class="home-hero" style="--gc:${g.color}">
          <div class="hh-left">
            <div class="eyebrow">${g.emoji} ${g.name}</div>
            <h1>${hi}, ${esc(u.name)}! ${MA.U.av(u.avatar)}</h1>
            ${main}
          </div>
          <div class="hh-right rank-card" style="--rc:${rk.color}">
            <div class="rc-top"><span class="rc-icon">${rk.icon}</span><div><small>Hạng ${g.name}</small><b>${rk.name}</b></div><div class="rc-pos">${pos ? '#' + pos : ''}<small>${pos ? 'trên bảng' : ''}</small></div></div>
            <div class="rc-xp">${xp} XP ${rk.next ? `<small>· còn ${rk.next.min - xp} XP để lên ${rk.next.icon} ${rk.next.name}</small>` : '<small>· Hạng cao nhất!</small>'}</div>
            <div class="mbar"><i style="width:${rk.pct}%;background:var(--rc)"></i></div>
            <details class="rc-more" ${UI.settings.full ? 'open' : ''}><summary>📊 Thành tích</summary><div class="rc-stats"><div><b>🔥 ${u.streak.days}</b><small>ngày liên tiếp</small></div><div><b>✅ ${u.stats.correct}</b><small>câu đúng</small></div><div><b>🎯 ${acc}%</b><small>chính xác</small></div></div></details>
          </div>
        </section>

        ${(() => { const i = MA.Account.vipInfo(); return i && i.trial && i.hours > 0 && MA.Account.isVip() && MA.Store.get('hideTrial', '') !== MA.U.today() ? `<section class="card trial-bar"><span>🎁</span><div><b>Con đang dùng thử VIP</b> · còn <b>${i.hours} giờ</b><small class="muted"> (đến ${new Date(i.until).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })})</small></div><a class="btn small" href="#/vip">👑 Khám phá VIP</a><button class="btn ghost tiny" data-hide-trial aria-label="Ẩn hôm nay">✕</button></section>` : ''; })()}
        ${(() => { const hw = MA.Content.homework(MA.Account.current(), u).filter(h => !h.done); return hw.length ? `<section class="card hw-card"><h3>📌 Bài tập thầy cô giao (${hw.length})</h3>${hw.slice(0, 1).map(h => `<div class="acc-row"><span><b>${esc(h.title)}</b> · ${h.n} câu${h.due ? ` · hạn ${h.due.split('-').reverse().join('/')}` : ''}</span><a class="btn small" href="#/review/hw/${h.id}">Làm bài →</a></div>`).join('')}${hw.length > 1 ? `<p class="muted small">Còn ${hw.length - 1} bài tập khác — xong bài này sẽ hiện tiếp.</p>` : ''}</section>` : ''; })()}
        <section class="quick-row">
          <a class="quick ${MA.User.dailyDone() ? 'done' : ''}" href="#/review/daily"><span>🌟</span><b>Thử thách ngày</b><small>${MA.User.dailyDone() ? `✔ ${u.daily[MA.U.today() + '_' + u.grade]}/10 điểm` : '10 câu · +50 XP'}</small></a>
          <a class="quick" href="#/review/mistakes"><span>📒</span><b>Sổ lỗi sai</b><small>${mist ? `${mist} câu cần sửa` : 'Chưa có lỗi 🎉'}</small></a>
          ${UI.settings.full ? '<a class="quick" href="#/exam"><span>📝</span><b>Kiểm tra</b><small>15 câu · chấm thang 10</small></a><a class="quick" href="#/timo"><span>🌏</span><b>Luyện thi TIMO</b><small>Song ngữ · 5 phân môn</small></a>' : ''}
        </section>

        <section>
          <div class="sec-head"><h2>📚 Chủ đề ${g.name}</h2><a href="#/learn">Xem tất cả (${topics.length}) →</a></div>
          <div class="topic-grid">${(next ? [next].concat(topics.filter(t => t.id !== next.id)) : topics).slice(0, UI.settings.full ? 999 : 4).map(t => MA.Views.learn.topicCard(t)).join('')}</div>
        </section>`;
      const ht = $('[data-hide-trial]', app); if (ht) ht.onclick = () => { MA.Store.set('hideTrial', MA.U.today()); ht.closest('.trial-bar').remove(); };
    }
  };
})(window.MA);
