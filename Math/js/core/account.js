/* =========================================================
 * account.js — QUẢN LÝ TÀI KHOẢN (định danh, phân loại, quản trị)
 *
 * Tách riêng khỏi dữ liệu học tập (user.js). Lưu ở khóa riêng 'accounts'.
 *  • Định danh bằng tên học sinh + SĐT cha/mẹ (khuyên dùng).
 *    SĐT chỉ lưu dạng mã băm + 3 số cuối, không hiển thị ở giao diện học sinh.
 *  • 2 loại tài khoản học sinh: 'normal' (thường) và 'vip'.
 *  • Tài khoản quản trị: khai báo trong js/config/accounts-config.js.
 *  • Mã kích hoạt VIP: quản trị tạo mã (máy chủ sinh ngẫu nhiên) cho (SĐT + tên), học sinh nhập mã trên máy của mình.
 *  • Dùng thử VIP: hồ sơ đăng ký bằng SĐT được 1 ngày VIP (mỗi SĐT 1 lần, máy chủ kiểm soát).
 *    Khi kích hoạt bắt buộc nhập SĐT + đặt mật khẩu → từ đó đăng nhập bằng SĐT + mật khẩu.
 *  • Nhật ký đăng nhập phục vụ đánh giá KPI.
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const S = MA.Store, { hash, slug } = MA.U;
  const CFG = () => MA.AccountsConfig || { admins: [], presetAccounts: [] };
  const TYPES = { normal: { name: 'Thường', icon: '🎒' }, vip: { name: 'VIP', icon: '👑' } };

  const load = () => S.get('accounts', {});
  const save = (a) => S.set('accounts', a);

  function normPhone(p) {
    let d = String(p || '').replace(/[^\d+]/g, '');
    if (d.startsWith('+84')) d = '0' + d.slice(3); else if (d.startsWith('84') && d.length === 11) d = '0' + d.slice(2);
    return /^0\d{9}$/.test(d) ? d : null;
  }
  const phoneHash = (p) => hash('toanvui-phone|' + p);
  const dayEnd = (s) => { const d = new Date(s + 'T23:59:59'); return isNaN(d) ? null : d.getTime(); };

  const Account = {
    TYPES, normPhone,
    all() { return Object.values(load()); },
    get(id) { return load()[id] || null; },
    update(id, patch) { const a = load(); if (!a[id]) return; Object.assign(a[id], patch); save(a); MA.User && MA.User.emit(); },
    remove(id) { const a = load(); delete a[id]; save(a); },

    // Tạo/tìm tài khoản theo tên + SĐT. Trả về { id, isNew } hoặc { error }
    resolve(name, phone) {
      const nm = name.trim(); const sl = slug(nm) || 'hs';
      const accs = load();
      if (phone) {
        const p = normPhone(phone); if (!p) return { error: 'Số điện thoại chưa đúng (cần 10 chữ số, bắt đầu bằng 0).' };
        const h = phoneHash(p);
        const found = Object.values(accs).find(a => a.phoneHash === h && slug(a.name) === sl);
        if (found) return { id: found.id, isNew: false };
        return { id: 'p' + h.slice(0, 6) + '-' + sl, isNew: true, phoneHash: h, phoneTail: p.slice(-3) };
      }
      const same = accs[sl];
      if ((same && same.phoneHash) || (!same && Object.values(accs).some(a => a.phoneHash && slug(a.name) === sl))) return { error: 'Tên này đã được gắn với số điện thoại cha/mẹ. Hãy nhập số điện thoại để đăng nhập lại.' };
      return { id: sl, isNew: !same };
    },
    // Đảm bảo có bản ghi tài khoản (gọi khi đăng nhập)
    ensure(id, info) {
      const a = load();
      if (!a[id]) a[id] = { id, name: info.name, avatar: info.avatar, grade: info.grade, type: 'normal', vipUntil: null, phoneHash: info.phoneHash || null, phoneTail: info.phoneTail || null, created: Date.now(), lastLogin: 0, logins: [], locked: false, note: '' };
      else Object.assign(a[id], { name: info.name || a[id].name, avatar: info.avatar || a[id].avatar, grade: info.grade || a[id].grade });
      save(a); return a[id];
    },
    byPhone(phone) { const p = normPhone(phone); if (!p) return []; const h = phoneHash(p); return this.all().filter(a => a.phoneHash === h); },
    checkPhone(id, phone) { const a = this.get(id); const p = normPhone(phone); return !!(a && p && a.phoneHash === phoneHash(p)); },
    linkPhone(id, phone) { const p = normPhone(phone); if (!p) return false; this.update(id, { phoneHash: phoneHash(p), phoneTail: p.slice(-3) }); return this.rekey(id) || id; },
    // Mã hồ sơ theo SĐT: 'p' + 6 kí tự mã băm SĐT + '-' + tên → cùng tên + cùng SĐT trên mọi máy = cùng một hồ sơ
    idFor(ph, name) { return 'p' + ph.slice(0, 6) + '-' + (slug(name) || 'hs'); },
    // Đổi mã hồ sơ cũ (đặt theo tên) sang mã theo SĐT để đồng bộ được lên máy chủ
    rekey(oldId) {
      const a = load(); const acc = a[oldId]; if (!acc || !acc.phoneHash) return null;
      const nid = this.idFor(acc.phoneHash, acc.name); if (nid === oldId || a[nid]) return null;
      acc.id = nid; a[nid] = acc; delete a[oldId]; save(a);
      const users = S.get('users', {}); if (users[oldId]) { users[nid] = users[oldId]; users[nid].id = nid; delete users[oldId]; S.set('users', users); }
      const fams = this.families(); let fch = false; Object.values(fams).forEach(f => { const i = (f.members || []).indexOf(oldId); if (i >= 0) { f.members[i] = nid; fch = true; } }); if (fch) S.set('families', fams);
      if (S.get('session') === oldId) S.set('session', nid);
      if (MA.User && MA.User.current && MA.User.current.id === oldId) MA.User.current = users[nid] || MA.User.current;
      return nid;
    },
    logLogin(id, force) {
      const a = load(); const acc = a[id]; if (!acc) return;
      const now = Date.now(); if (!force && now - (acc.lastLogin || 0) < 30 * 60 * 1000) return;
      acc.lastLogin = now; acc.logins = (acc.logins || []).concat(now).slice(-300); save(a);
    },

    // ---------- Phân loại ----------
    // Gói VIP gắn với SĐT cha/mẹ (gia đình): 1 mật khẩu chung, tối đa 2 hồ sơ học độc lập
    // (anh chị em), hiệu lực 1 năm kể từ ngày kích hoạt. Lưu ở khóa riêng 'families'.
    VIP_DAYS: 365, MAX_MEMBERS: 2,
    families() { return S.get('families', {}); },
    fam(ph) { return ph ? (this.families()[ph] || null) : null; },
    saveFam(f) { const all = this.families(); all[f.phoneHash] = f; S.set('families', all); MA.User && MA.User.emit(); },
    famOf(acc) { return acc && acc.phoneHash ? this.fam(acc.phoneHash) : null; },
    famActive(f) { return !!(f && f.vipUntil && f.vipUntil >= Date.now()); },
    current() { return MA.User && MA.User.current ? this.get(MA.User.current.id) : null; },
    isVip(acc) {
      if (this.isAdmin()) return true;
      return this.typeOf(acc || this.current()) === 'vip';
    },
    typeOf(acc) {
      if (!acc) return 'normal';
      const f = this.famOf(acc);
      if (f && f.members.includes(acc.id)) return this.famActive(f) ? 'vip' : 'normal';
      return acc.type === 'vip' && acc.vipUntil && acc.vipUntil >= Date.now() && !f ? 'vip' : 'normal';
    },
    // Thông tin gói VIP của tài khoản
    vipInfo(acc) {
      acc = acc || this.current(); const f = this.famOf(acc);
      if (f && f.members.includes(acc.id)) return { from: f.vipFrom, until: f.vipUntil, days: f.vipUntil ? Math.max(0, Math.ceil((f.vipUntil - Date.now()) / 864e5)) : 0, hours: f.vipUntil ? Math.max(0, Math.ceil((f.vipUntil - Date.now()) / 36e5)) : 0, trial: !!f.trial, trialAt: f.trialAt || null, members: f.members.map(id => this.get(id)).filter(Boolean), slots: this.MAX_MEMBERS - f.members.length, family: f };
      if (acc && acc.vipUntil) return { from: acc.vipFrom, until: acc.vipUntil, days: Math.max(0, Math.ceil((acc.vipUntil - Date.now()) / 864e5)), members: [acc], slots: 0, family: null };
      return null;
    },
    vipDaysLeft(acc) { const i = this.vipInfo(acc); return i ? i.days : 0; },
    newFam(ph, tail) { return { phoneHash: ph, phoneTail: tail || null, passHash: null, legacy: {}, vipFrom: null, vipUntil: null, members: [], codes: [], created: Date.now() }; },
    // Kích hoạt / gia hạn gói VIP cho tài khoản (thêm tài khoản vào gói gia đình)
    grantVip(id, opts = {}) {
      const acc = this.get(id); if (!acc) return { error: 'Không tìm thấy tài khoản.' };
      if (opts.phone) { const p = normPhone(opts.phone); if (!p) return { error: 'Số điện thoại chưa đúng.' }; if (!acc.phoneHash) { this.update(id, { phoneHash: phoneHash(p), phoneTail: p.slice(-3) }); acc.phoneHash = phoneHash(p); acc.phoneTail = p.slice(-3); } }
      if (!acc.phoneHash) return { error: 'Tài khoản VIP bắt buộc phải có số điện thoại cha/mẹ để đăng nhập.' };
      if (opts.password && String(opts.password).length < 6) return { error: 'Mật khẩu cần ít nhất 6 kí tự.' };
      const f = this.fam(acc.phoneHash) || this.newFam(acc.phoneHash, acc.phoneTail);
      if (!f.members.includes(id)) {
        if (f.members.length >= this.MAX_MEMBERS) return { error: `Gói VIP của số điện thoại này đã đủ ${this.MAX_MEMBERS} hồ sơ học (${f.members.map(m => (this.get(m) || {}).name).join(', ')}).` };
        f.members.push(id);
      }
      const now = Date.now(), active = this.famActive(f) && !f.trial;   // đang dùng thử → cấp VIP thật tính lại từ hôm nay
      f.trial = false;
      if (!active) { f.vipFrom = now; f.vipUntil = now + this.VIP_DAYS * 864e5; }
      else if (opts.extend) f.vipUntil += this.VIP_DAYS * 864e5;
      if (opts.password) f.passHash = this.famPw(f.phoneHash, opts.password);
      this.saveFam(f); this.update(id, { type: 'vip' });
      if (opts.password && MA.Sync) MA.Sync.op({ t: 'setPw', ph: f.phoneHash, pw: String(opts.password) });
      return { ok: true, until: f.vipUntil, family: f };
    },
    // Bỏ một hồ sơ khỏi gói VIP (gói hết thành viên thì kết thúc)
    revokeVip(id) {
      const acc = this.get(id); const f = this.famOf(acc);
      if (f) { f.members = f.members.filter(m => m !== id); if (!f.members.length) f.vipUntil = null; this.saveFam(f); }
      this.update(id, { type: 'normal', vipUntil: null });
    },
    setType(id, type) { if (type === 'vip') return this.grantVip(id); this.revokeVip(id); return { ok: true }; },
    // Thêm hồ sơ học thứ 2 (anh/chị/em) vào gói VIP của gia đình
    addMember(fromId, { name, grade, avatar, existingId }) {
      const acc = this.get(fromId); const f = this.famOf(acc);
      if (!f || !f.members.includes(fromId)) return { error: 'Chỉ tài khoản VIP mới thêm được hồ sơ.' };
      const active = this.famActive(f);   // gói hết hạn (vd. hết dùng thử) → vẫn tạo được hồ sơ thường dùng chung SĐT + mật khẩu
      if (active && f.members.length >= this.MAX_MEMBERS) return { error: `Gói VIP chỉ gồm tối đa ${this.MAX_MEMBERS} hồ sơ học.` };
      let id = existingId;
      if (!id) {
        const sl = slug(name || ''); if (sl.length < 2) return { error: 'Hãy nhập tên (ít nhất 2 chữ cái).' };
        if (this.all().some(a => a.phoneHash === f.phoneHash && slug(a.name) === sl)) return { error: 'Đã có hồ sơ tên này với số điện thoại này.' };
        id = 'p' + f.phoneHash.slice(0, 6) + '-' + sl;
        this.ensure(id, { name: name.trim(), grade: +grade || 2, avatar: avatar || '🐼', phoneHash: f.phoneHash, phoneTail: f.phoneTail });
        const users = S.get('users', {}); if (!users[id]) { users[id] = MA.User.blank(name.trim(), +grade || 2, avatar || '🐼', id); S.set('users', users); }
      } else { const ex = this.get(id); if (!ex || ex.phoneHash !== f.phoneHash) return { error: 'Hồ sơ không thuộc số điện thoại này.' }; }
      if (!active) return { ok: true, id };
      f.members.push(id); this.saveFam(f); this.update(id, { type: 'vip' });
      if (MA.Sync) MA.Sync.op({ t: 'addMember', ph: f.phoneHash, id });
      return { ok: true, id };
    },

    // ---------- Mật khẩu ----------
    // Tài khoản trong gói VIP dùng chung mật khẩu của gia đình (theo SĐT)
    famPw(ph, pw) { return hash('toanvui-fam|' + ph + '|' + pw); },
    pwHash(id, pw) { return hash('toanvui-pw|' + id + '|' + pw); },
    hasPassword(acc) { const f = this.famOf(acc); return !!(acc && ((f && f.members.includes(acc.id) && (f.passHash || Object.keys(f.legacy || {}).length)) || acc.passHash)); },
    setPassword(id, pw) {
      if (!pw || String(pw).length < 6) return { error: 'Mật khẩu cần ít nhất 6 kí tự.' };
      const acc = this.get(id); const f = this.famOf(acc);
      if (f && f.members.includes(id)) { f.passHash = this.famPw(f.phoneHash, pw); f.legacy = {}; this.saveFam(f); f.members.forEach(m => this.update(m, { passHash: null })); if (MA.Sync) MA.Sync.op({ t: 'setPw', ph: f.phoneHash, pw: String(pw) }); }
      else this.update(id, { passHash: this.pwHash(id, pw) });
      return { ok: true };
    },
    clearPassword(id) { const acc = this.get(id); const f = this.famOf(acc); if (f && f.members.includes(id)) { f.passHash = null; f.legacy = {}; this.saveFam(f); if (MA.Sync) MA.Sync.op({ t: 'clearPw', ph: f.phoneHash }); } this.update(id, { passHash: null }); },
    famCheck(f, pw) {
      if (!f) return false;
      if (f.passHash) return f.passHash === this.famPw(f.phoneHash, pw);
      const ok = Object.keys(f.legacy || {}).some(id => f.legacy[id] === this.pwHash(id, pw));
      if (ok) { f.passHash = this.famPw(f.phoneHash, pw); f.legacy = {}; this.saveFam(f); } // chuyển sang mật khẩu chung
      return ok;
    },
    checkPassword(id, pw) {
      const a = this.get(id); if (!a) return false; const f = this.famOf(a);
      if (f && f.members.includes(id)) return this.famCheck(f, pw);
      return !!(a.passHash && a.passHash === this.pwHash(id, pw));
    },
    // Tài khoản VIP chưa đủ thông tin đăng nhập (SĐT + mật khẩu) → bắt buộc bổ sung
    needsVipSetup(acc) { acc = acc || this.current(); return !!acc && this.typeOf(acc) === 'vip' && (!acc.phoneHash || !this.hasPassword(acc)); },
    // Đăng nhập VIP bằng SĐT + mật khẩu chung → danh sách hồ sơ trong gói
    loginByPassword(phone, pw) {
      const p = normPhone(phone); if (!p) return { error: 'Số điện thoại chưa đúng.' };
      const f = this.fam(phoneHash(p));
      if (f && f.members.length && this.hasPassword(this.get(f.members[0]))) {
        if (!this.famCheck(f, pw)) return { error: 'Mật khẩu chưa đúng.' };
        return { list: f.members.map(id => this.get(id)).filter(Boolean), family: f };
      }
      const list = this.byPhone(p); if (!list.length) return { error: 'Không tìm thấy tài khoản với số điện thoại này trên máy.' };
      const ok = list.filter(a => a.passHash && a.passHash === this.pwHash(a.id, pw));
      if (!ok.length) return { error: list.some(a => a.passHash) ? 'Mật khẩu chưa đúng.' : 'Số này chưa có tài khoản VIP/mật khẩu. Hãy đăng nhập bằng tên + số điện thoại.' };
      return { list: ok };
    },

    // ---------- Dùng thử VIP ----------
    // Hồ sơ đăng ký bằng SĐT cha/mẹ được dùng thử VIP (mặc định 24 giờ), mỗi SĐT 1 lần.
    // Kích hoạt: bắt buộc nhập lại SĐT + đặt mật khẩu chung → từ đó đăng nhập bằng SĐT + mật khẩu.
    TRIAL_HOURS: 24,
    trialHours() { const h = MA.Sync && MA.Sync.supported && MA.Sync.trialHours(); return typeof h === 'number' ? h : this.TRIAL_HOURS; },
    trialLabel(h) { h = h == null ? this.trialHours() : h; return h % 24 === 0 ? `${h / 24} ngày` : `${h} giờ`; },
    // Hồ sơ còn được dùng thử? (chưa từng VIP / dùng thử, SĐT chưa có mật khẩu)
    trialEligible(acc) {
      acc = acc || this.current(); if (!acc || acc.locked || this.trialHours() < 1) return false;
      if (this.typeOf(acc) === 'vip' || acc.vipUntil || acc.vipFrom) return false;
      if (!acc.phoneHash) return true;   // chưa có SĐT: liên kết SĐT ngay khi kích hoạt
      const f = this.fam(acc.phoneHash);
      if (f && (f.trialAt || f.vipFrom || f.passHash || Object.keys(f.legacy || {}).length)) return false;
      return !(MA.Sync && MA.Sync.supported && MA.Sync.trialOk(acc.phoneHash) === false);
    },
    // Hiện màn hình kích hoạt dùng thử ngay sau khi đăng ký / đăng nhập bằng SĐT (bỏ qua nếu đã bấm “Để sau”)
    trialOffer(acc) { acc = acc || this.current(); return !!(acc && acc.phoneHash && !acc.trialSkip && !this.isAdmin() && this.trialEligible(acc)); },
    async startTrial(phone, pw) {
      let acc = this.current(); if (!acc) return { error: 'Chưa đăng nhập.' };
      const p = normPhone(phone); if (!p) return { error: 'Số điện thoại chưa đúng (cần 10 chữ số, bắt đầu bằng 0).' };
      if (!pw || String(pw).length < 6) return { error: 'Mật khẩu cần ít nhất 6 kí tự.' };
      if (acc.phoneHash) { if (acc.phoneHash !== phoneHash(p)) return { error: 'Số điện thoại chưa khớp với số đã đăng ký cho hồ sơ này.' }; }
      else {
        if (this.byPhone(p).some(x => x.id !== acc.id && slug(x.name) === slug(acc.name))) return { error: 'Số này đã có một hồ sơ cùng tên. Hãy đăng nhập lại bằng số điện thoại.' };
        this.linkPhone(acc.id, p); acc = this.current();
      }
      if (!this.trialEligible(acc)) return { error: 'Số điện thoại này đã dùng thử hoặc đã có gói VIP.' };
      if (MA.Sync && MA.Sync.supported) {   // có máy chủ: máy chủ kiểm soát mỗi SĐT 1 lần
        const r = await MA.Sync.trial(acc, pw);
        if (r.offline) return { error: 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng rồi thử lại.' };
        if (!r.ok) return { error: r.msg || 'Không kích hoạt được dùng thử.' };
        this.update(acc.id, { type: 'vip', trialSkip: false });
        return { ok: true, until: r.family.vipUntil, hours: this.trialHours() };
      }
      // chạy không có máy chủ (mở file trực tiếp): kích hoạt trên máy này
      const f = this.fam(acc.phoneHash) || this.newFam(acc.phoneHash, acc.phoneTail);
      if (!f.members.includes(acc.id)) { if (f.members.length >= this.MAX_MEMBERS) return { error: 'Gói của số điện thoại này đã đủ hồ sơ.' }; f.members.push(acc.id); }
      const now = Date.now(); Object.assign(f, { vipFrom: now, vipUntil: now + this.TRIAL_HOURS * 36e5, trialAt: now, trial: true, passHash: this.famPw(f.phoneHash, pw), legacy: {} });
      this.saveFam(f); this.update(acc.id, { type: 'vip', trialSkip: false });
      return { ok: true, until: f.vipUntil, hours: this.TRIAL_HOURS };
    },

    // ---------- Mã kích hoạt VIP ----------
    // Mã do MÁY CHỦ sinh ngẫu nhiên (VIP-XXXXX-XXXXX), gắn với SĐT + tên, chỉ dùng 1 lần.
    // Không còn chuỗi bí mật nằm trong mã nguồn trình duyệt → không thể tự tạo mã giả.
    async makeVipCode(phone, name, deadlineStr) {
      if (!MA.Sync || !MA.Sync.isAdminLinked()) return { error: 'Tạo mã VIP cần kết nối máy chủ. Khi chạy không có máy chủ, hãy dùng “Cấp VIP” trực tiếp ở tab Tài khoản.' };
      const r = await MA.Sync.vipCode(phone, name, deadlineStr);
      if (r.offline) return { error: 'Không kết nối được máy chủ.' };
      return r.ok ? { code: r.code, exp: r.exp } : { error: r.msg || 'Không tạo được mã.' };
    },
    async redeemVip(code) {
      const acc = this.current(); if (!acc) return { error: 'Chưa đăng nhập.' };
      if (!acc.phoneHash) return { error: 'Hãy liên kết số điện thoại cha/mẹ trước khi kích hoạt VIP.' };
      const c = String(code).trim().toUpperCase();
      if (!/^VIP-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(c)) return { error: 'Mã không đúng định dạng (ví dụ: VIP-AB2CD-EF3GH).' };
      if (!MA.Sync || !MA.Sync.supported) return { error: 'Cần kết nối máy chủ để kích hoạt mã VIP. Vui lòng liên hệ thầy cô.' };
      const r = await MA.Sync.redeem(acc, c);
      if (r.offline) return { error: 'Không kết nối được máy chủ, vui lòng thử lại khi có mạng.' };
      if (!r.ok) return { error: r.msg || 'Mã không hợp lệ.' };
      this.update(acc.id, { type: 'vip' });
      return { ok: true, until: r.family.vipUntil, family: r.family };
    },
    // Chuyển dữ liệu VIP kiểu cũ (VIP theo từng tài khoản) sang gói VIP gia đình
    migrateFamilies() {
      const fams = this.families(); let ch = false;
      this.all().filter(a => a.type === 'vip' && a.phoneHash && a.vipUntil).forEach(a => {
        const f = fams[a.phoneHash] || (fams[a.phoneHash] = this.newFam(a.phoneHash, a.phoneTail));
        if (f.members.includes(a.id) || f.members.length >= this.MAX_MEMBERS) return;
        f.members.push(a.id); f.vipFrom = Math.min(f.vipFrom || a.vipFrom || Date.now(), a.vipFrom || Date.now()); f.vipUntil = Math.max(f.vipUntil || 0, a.vipUntil);
        if (a.passHash && !f.passHash) { f.legacy = f.legacy || {}; f.legacy[a.id] = a.passHash; }
        f.codes = (f.codes || []).concat(a.vipCodes || []); ch = true;
      });
      if (ch) S.set('families', fams);
    },

    // ---------- Quản trị ----------
    admins() { const over = S.get('admin_pass', {}); return CFG().admins.map(a => Object.assign({}, a, over[a.user] ? { passHash: over[a.user] } : {})); },
    isDefaultPass(user, pass) { return this.passHash(user, pass) === '1eb5c529ded480'; },   // mật khẩu mặc định của bản phát hành
    passHash(user, pass) { return hash('toanvui-admin|' + user + '|' + pass); },
    adminLogin(user, pass) {
      const a = this.admins().find(x => x.user === user.trim());
      if (!a || a.passHash !== this.passHash(user.trim(), pass)) return false;
      // mật khẩu mặc định ghi trong tài liệu → bắt buộc đổi ngay
      const mustChange = this.isDefaultPass(user.trim(), pass) || pass.length < 8;
      S.set('admin_session', { user: a.user, name: a.name, until: Date.now() + 8 * 3600 * 1000, mustChange });
      const log = S.get('admin_log', []); log.unshift({ user: a.user, at: Date.now() }); S.set('admin_log', log.slice(0, 100));
      return true;
    },
    adminSession() { const s = S.get('admin_session'); return s && s.until > Date.now() ? s : null; },
    isAdmin() { const s = this.adminSession(); return !!s && !s.mustChange; },
    adminMustChange() { const s = this.adminSession(); return !!(s && s.mustChange); },
    adminLogout() { S.remove('admin_session'); MA.Sync && MA.Sync.dropAdmin(); },
    // Trả về { ok } hoặc { error }. Có máy chủ: máy chủ kiểm tra mật khẩu cũ (bcrypt).
    async changeAdminPass(user, oldPass, newPass) {
      if (String(newPass).length < 8) return { error: 'Mật khẩu mới cần ít nhất 8 kí tự.' };
      if (newPass === oldPass || this.isDefaultPass(user, newPass)) return { error: 'Hãy chọn mật khẩu khác mật khẩu mặc định.' };
      const s = this.adminSession();
      if (s && s.server && MA.Sync) { const r = await MA.Sync.adminPass(oldPass, newPass); return r.ok ? { ok: true } : { error: r.offline ? 'Không kết nối được máy chủ.' : (r.msg || 'Không đổi được mật khẩu.') }; }
      const a = this.admins().find(x => x.user === user);
      if (!a || a.passHash !== this.passHash(user, oldPass)) return { error: 'Mật khẩu hiện tại chưa đúng.' };
      const over = S.get('admin_pass', {}); over[user] = this.passHash(user, newPass); S.set('admin_pass', over);
      if (s) { s.mustChange = false; S.set('admin_session', s); }
      return { ok: true };
    },
    configFileText() {
      const c = Object.assign({}, CFG(), { admins: this.admins() });
      return `/* accounts-config.js — xuất từ Admin Board ngày ${new Date().toLocaleString('vi-VN')}.\n * Chép đè file js/config/accounts-config.js trên website bằng file này. */\nwindow.MA = window.MA || {};\nMA.AccountsConfig = ${JSON.stringify(c, null, 2)};\n`;
    },
    // Tạo tài khoản từ quản trị (hoặc từ presetAccounts)
    create({ name, phone, grade, type, vipUntil, avatar, password }) {
      if (type === 'vip') { if (!normPhone(phone || '')) return { error: 'Tài khoản VIP bắt buộc có số điện thoại cha/mẹ hợp lệ.' }; if (!password || String(password).length < 6) return { error: 'Tài khoản VIP bắt buộc có mật khẩu từ 6 kí tự.' }; }
      const r = this.resolve(name, phone || ''); if (r.error) return r;
      const acc = this.ensure(r.id, { name: name.trim(), grade: +grade || 2, avatar: avatar || '🦉', phoneHash: r.phoneHash, phoneTail: r.phoneTail });
      if (type === 'vip') { const g = this.grantVip(acc.id, { password }); if (g.error) return g; }
      const users = S.get('users', {});
      if (!users[acc.id]) { users[acc.id] = MA.User.blank(acc.name, acc.grade, acc.avatar, acc.id); S.set('users', users); }
      return { id: acc.id, isNew: r.isNew };
    },

    // Đồng bộ: tài khoản cũ chưa có bản ghi + tài khoản tạo sẵn trong file cấu hình
    init() {
      const a = load(); const users = S.get('users', {}); let ch = false;
      Object.values(users).forEach(u => { if (!a[u.id]) { a[u.id] = { id: u.id, name: u.name, avatar: u.avatar, grade: u.grade, type: 'normal', vipUntil: null, phoneHash: null, phoneTail: null, created: u.created || Date.now(), lastLogin: 0, logins: [], locked: false, note: '' }; ch = true; } });
      if (ch) save(a);
      this.all().filter(x => x.phoneHash && !/^p[0-9a-f]{6}-/.test(x.id)).forEach(x => this.rekey(x.id));
      this.migrateFamilies();
      (CFG().presetAccounts || []).forEach(p => { try { const r = this.resolve(p.name, p.phone || ''); if (!r.error && r.isNew) this.create(p); } catch (e) { console.warn(e); } });
    }
  };

  MA.Account = Account;
})(window.MA);
