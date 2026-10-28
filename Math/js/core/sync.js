/* =========================================================
 * sync.js — ĐỒNG BỘ TÀI KHOẢN & DỮ LIỆU HỌC TẬP VỚI MÁY CHỦ (api/index.php)
 *
 * Nguyên tắc “ưu tiên trên máy” (local-first):
 *  • Mọi thao tác vẫn ghi ngay vào trình duyệt như bản offline → mất mạng vẫn học bình thường.
 *  • Lớp đồng bộ tự phát hiện hồ sơ thay đổi (so mã băm) rồi gửi lên máy chủ sau vài giây.
 *  • Mở trang / đăng nhập → tải bản mới nhất từ máy chủ về (học trên nhiều máy).
 *  • Hai máy cùng sửa một hồ sơ → gộp dữ liệu (lấy tiến độ lớn hơn, hợp nhất nhật ký theo ngày).
 *  • Chỉ đồng bộ hồ sơ CÓ SĐT cha/mẹ. Hồ sơ chỉ có tên vẫn chỉ nằm trên máy.
 *  • SĐT không gửi lên máy chủ (chỉ gửi mã băm). Mật khẩu VIP/quản trị kiểm tra ở máy chủ.
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const S = MA.Store, { hash, slug } = MA.U;
  const CFG = Object.assign({ api: 'api/index.php', enabled: true, timeout: 12000, debounce: 2500, pullEvery: 300000 }, MA.SyncConfig || {});
  const supported = !!CFG.enabled && /^https?:$/.test(location.protocol) && typeof fetch === 'function';
  const sig = (o) => hash(JSON.stringify(o === undefined ? null : o));
  const clone = (o) => o == null ? o : JSON.parse(JSON.stringify(o));
  const ID_RE = /^p([0-9a-f]{6})-[a-z0-9][a-z0-9-]*$/;

  let meta = S.get('sync_meta', null) || { p: {}, f: {}, c: { rev: 0, sig: '' }, since: 0, ignore: {} };
  let auth = S.get('sync_auth', null) || { ph: {}, admin: null };
  let ops = S.get('sync_ops', []);
  const saveMeta = () => S.set('sync_meta', meta), saveAuth = () => S.set('sync_auth', auth), saveOps = () => S.set('sync_ops', ops);
  let timer = null, busy = false, again = false, muted = 0;
  let lbCache = {}; const triedPh = {};
  const needPw = {}; let warned = false;   // SĐT có gói đã đặt mật khẩu mà máy này chưa đăng nhập VIP
  const trialState = {}; let trialHours = null;   // máy chủ báo SĐT nào còn được dùng thử VIP

  // ---------- đóng gói dữ liệu ----------
  function packAcc(acc) { const a = clone(acc); delete a.passHash; return a; }
  function packFam(f) { return { phoneTail: f.phoneTail || null, vipFrom: f.vipFrom || null, vipUntil: f.vipUntil || null, members: (f.members || []).slice(), codes: (f.codes || []).slice(), created: f.created || null, trialAt: f.trialAt || null, trial: !!f.trial }; }
  const profSig = (acc, user) => sig([packAcc(acc), user || null]);
  function syncable(acc) { const m = acc && acc.phoneHash && ID_RE.exec(acc.id); return !!(m && m[1] === acc.phoneHash.slice(0, 6)); }
  function authorized(ph) { return !!(auth.admin || auth.ph[ph]); }
  function tokens() { return Object.values(auth.ph).map(x => x.token).concat(auth.admin ? [auth.admin.token] : []); }
  function quiet(fn) { muted++; try { return fn(); } finally { muted--; } }

  // ---------- gọi máy chủ ----------
  async function call(a, data = {}, opts = {}) {
    if (!supported) throw new Error('sync_off');
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const to = setTimeout(() => ctl && ctl.abort(), opts.timeout || CFG.timeout);
    try {
      const res = await fetch(CFG.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ a }, data)), signal: ctl ? ctl.signal : undefined, keepalive: !!opts.keepalive, cache: 'no-store', credentials: 'same-origin' });
      let j = null; try { j = await res.json(); } catch (e) { /* không phải JSON */ }
      if (!j) throw new Error('bad_response');
      Sync.online = true; return j;
    } catch (e) { Sync.online = false; setStatus('offline'); throw e; } finally { clearTimeout(to); }
  }

  // ---------- trạng thái (hiện trên thanh tiêu đề) ----------
  function setStatus(s, msg) { Sync.status = s; Sync.statusMsg = msg || ''; Sync.listeners.forEach(f => { try { f(s); } catch (e) { /* bỏ qua */ } }); }

  // ---------- gộp dữ liệu khi 2 máy cùng sửa ----------
  function mergeUser(a, b) {
    if (!a) return b; if (!b) return a;
    const [base, other] = ((a.stats || {}).answered || 0) >= ((b.stats || {}).answered || 0) ? [a, b] : [b, a];
    const u = clone(base);
    u.xp = u.xp || {}; Object.entries(other.xp || {}).forEach(([g, v]) => { u.xp[g] = Math.max(u.xp[g] || 0, v); });
    if (other.week && u.week && other.week.id === u.week.id) Object.entries(other.week.xp || {}).forEach(([g, v]) => { u.week.xp[g] = Math.max(u.week.xp[g] || 0, v); });
    u.stats = u.stats || {}; Object.entries(other.stats || {}).forEach(([k, v]) => { u.stats[k] = Math.max(u.stats[k] || 0, v || 0); });
    u.activity = u.activity || {}; Object.entries(other.activity || {}).forEach(([d, v]) => { if (!u.activity[d] || (v.q || 0) > (u.activity[d].q || 0)) u.activity[d] = v; });
    u.topics = u.topics || {}; Object.entries(other.topics || {}).forEach(([k, v]) => { if (!u.topics[k] || (v.n || 0) > (u.topics[k].n || 0)) u.topics[k] = v; });
    u.gens = u.gens || {}; Object.entries(other.gens || {}).forEach(([k, v]) => { if (!u.gens[k] || (v.n || 0) > (u.gens[k].n || 0)) u.gens[k] = v; });
    u.daily = Object.assign({}, other.daily || {}, u.daily || {});
    // dữ liệu v2: lịch ôn tập ngắt quãng, nhiệm vụ hằng ngày, bài đầu vào, bài tập về nhà
    u.srs = u.srs || {}; Object.entries(other.srs || {}).forEach(([k, v]) => { if (!u.srs[k] || (v.last || 0) > (u.srs[k].last || 0)) u.srs[k] = v; });
    u.mission = Object.assign({}, other.mission || {}, u.mission || {});
    u.placement = Object.assign({}, other.placement || {}, u.placement || {});
    u.hw = u.hw || {}; Object.entries(other.hw || {}).forEach(([k, v]) => { if (!u.hw[k] || (v.score || 0) > (u.hw[k].score || 0)) u.hw[k] = v; });
    // cờ câu khó: hợp nhất theo key, cờ đã bỏ (del) thắng nếu bỏ sau lúc gắn
    if (u.flags || other.flags) {
      const fa = u.flags || {}, fb = other.flags || {}; const del = Object.assign({}, fa.del || {});
      Object.entries(fb.del || {}).forEach(([k, t]) => { if (!del[k] || t > del[k]) del[k] = t; });
      const items = {}; (fa.items || []).concat(fb.items || []).forEach(x => { const o = items[x.key]; if (!o || x.at > o.at || (!o.q && x.q && x.at === o.at)) items[x.key] = x; });
      u.flags = { items: Object.values(items).filter(x => !(del[x.key] >= x.at)).sort((x, y) => y.at - x.at).slice(0, 300), del, trial: Math.max(fa.trial || 0, fb.trial || 0) || undefined };
    }
    u.badges = Array.from(new Set((u.badges || []).concat(other.badges || [])));
    const seen = new Set((u.history || []).map(h => h.at)); u.history = (u.history || []).concat((other.history || []).filter(h => !seen.has(h.at))).sort((x, y) => y.at - x.at).slice(0, 60);
    if (other.streak && u.streak && (other.streak.last || '') > (u.streak.last || '')) u.streak = other.streak;
    delete u._trim; if (base._trim || other._trim) { if (base._trim && !other._trim) { u.mistakes = other.mistakes; u.errLog = other.errLog; } }
    return u;
  }
  function mergeAcc(local, server, isAdmin) {
    const a = isAdmin ? Object.assign({}, server, local) : Object.assign({}, local, pick(server, ['type', 'locked', 'note', 'vipUntil', 'vipFrom', 'vipCodes']));
    a.logins = Array.from(new Set((local.logins || []).concat(server.logins || []))).sort((x, y) => x - y).slice(-300);
    a.lastLogin = Math.max(local.lastLogin || 0, server.lastLogin || 0);
    a.created = Math.min(local.created || Date.now(), server.created || Date.now());
    if (local.passHash) a.passHash = local.passHash;
    return a;
  }
  const pick = (o, keys) => { const r = {}; keys.forEach(k => { if (o && k in o) r[k] = o[k]; }); return r; };

  // ---------- áp dữ liệu máy chủ vào máy ----------
  let touchedCurrent = false;
  function applyProfiles(list) {
    if (!list || !list.length) return;
    const accs = S.get('accounts', {}), users = S.get('users', {});
    list.forEach(p => {
      const id = p.id;
      if (meta.ignore && meta.ignore[id]) return;
      const acc = accs[id], user = users[id], m = meta.p[id];
      if (p.deleted) {
        if (acc || user) { Sync.changes++; delete accs[id]; delete users[id]; if (MA.User.current && MA.User.current.id === id) { S.remove('session'); MA.User.current = null; touchedCurrent = true; } }
        delete meta.p[id]; return;
      }
      const sAcc = typeof p.account === 'string' ? JSON.parse(p.account) : p.account;
      const sUser = typeof p.user === 'string' ? JSON.parse(p.user) : p.user;
      if (!sAcc) return;
      sAcc.avatar = MA.U.avOk(sAcc.avatar); if (sUser) sUser.avatar = MA.U.avOk(sUser.avatar);
      const upgrade = user && user._trim && sUser && !sUser._trim;  // máy đang giữ bản rút gọn, máy chủ gửi bản đầy đủ
      if (m && p.rev <= m.rev && !upgrade) return;                    // đã có bản này
      const dirty = acc && (!m || m.sig !== profSig(acc, user));
      if (acc && acc.passHash) sAcc.passHash = acc.passHash;
      if (!acc || !dirty || (upgrade && !dirty)) {
        accs[id] = sAcc; if (sUser) users[id] = sUser;
        meta.p[id] = { rev: p.rev, sig: profSig(sAcc, sUser || user || null) };
      } else {
        accs[id] = mergeAcc(acc, sAcc, !!auth.admin);
        users[id] = mergeUser(user, sUser);
        meta.p[id] = { rev: p.rev, sig: profSig(sAcc, sUser) };  // khác bản đã gộp → sẽ được gửi lại
        Sync.merged++;
      }
      if (MA.User.current && MA.User.current.id === id) { MA.User.current = users[id]; touchedCurrent = true; }
      Sync.changes++;
    });
    quiet(() => { S.set('accounts', accs); S.set('users', users); }); saveMeta();
  }
  function applyFamily(sf) {
    if (!sf || !sf.phoneHash) return;
    const all = S.get('families', {}); const loc = all[sf.phoneHash];
    let passHash = loc && loc.passHash ? loc.passHash : null;
    if (sf.hasPw && !passHash) passHash = '!srv';   // có mật khẩu trên máy chủ nhưng máy này chưa biết → bắt buộc nhập
    if (!sf.hasPw) passHash = null;
    const f = Object.assign({ phoneHash: sf.phoneHash, legacy: {} }, packFam(sf), { passHash });
    const changed = !loc || sig(packFam(loc)) !== sig(packFam(f)) || loc.passHash !== passHash;
    all[sf.phoneHash] = f; quiet(() => S.set('families', all)); if (changed) Sync.changes++;
    meta.f[sf.phoneHash] = { rev: sf.rev, sig: sig(packFam(f)) }; saveMeta();
    if (changed && MA.User.current) touchedCurrent = true;
  }
  function applyContent(rev, dataStr) {
    const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
    if (data == null) return false;
    quiet(() => S.set('content', data)); meta.c = { rev, sig: sig(S.get('content')) }; saveMeta();
    MA.Content.reload && MA.Content.reload(); return true;
  }
  function afterApply() {
    if (!touchedCurrent) return; touchedCurrent = false;
    MA.User.emit && MA.User.emit();
    const view = MA.Nav ? MA.Nav.view() : 'home';
    if (['home', 'login', 'rank', 'vip', 'admin', ''].includes(view) && !document.querySelector('.modal-wrap')) MA.UI && MA.UI.route();
  }

  const Sync = {
    supported, online: null, changes: 0, status: supported ? 'idle' : 'off', statusMsg: '', listeners: [], merged: 0, lastSync: S.get('sync_last', 0),
    onStatus(f) { this.listeners.push(f); },
    phoneKey(phone) { const p = MA.Account.normPhone(phone); return p ? hash('toanvui-phone|' + p) : null; },
    hasToken(ph) { return !!auth.ph[ph]; },
    isAdminLinked() { return !!auth.admin; },
    pending() { return ops.length; },

    // ---------- khởi động ----------
    async start() {
      if (!supported) { setStatus('off'); return; }
      S.onSet((key) => { if (!muted && ['users', 'accounts', 'families', 'content'].includes(key)) this.schedule(); });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this.flush({ keepalive: true }); else if (Date.now() - (this.lastPull || 0) > 60000) this.pull(); });
      window.addEventListener('online', () => this.sync());
      setInterval(() => { if (document.visibilityState === 'visible') this.sync(); }, CFG.pullEvery);
      await this.sync(true);
    },
    async sync(first) {
      if (!supported) return;
      try {
        await this.fetchContent();
        const cur = MA.Account.current();
        if (cur && cur.phoneHash && !auth.ph[cur.phoneHash] && !meta.ignore[cur.id]) await this.authPhoneHash(cur.phoneHash).catch(() => {});
        await this.pull(); await this.flush();
        const c2 = MA.Account.current();
        this.warnUnsent();
        if (c2 && this.syncable(c2) && !auth.ph[c2.phoneHash]) setStatus('auth', 'Gói VIP của gia đình đã có mật khẩu — hãy đăng xuất và đăng nhập lại ở tab VIP để tiếp tục lưu kết quả lên máy chủ.');
      } catch (e) { /* ngoại tuyến */ }
      if (first) afterApply();
    },
    async fetchContent() {
      // gửi kèm phiên đăng nhập: tài khoản VIP/quản trị nhận cả câu hỏi VIP của thầy cô, tài khoản thường thì không
      const r = await call('content.get', { rev: meta.c.rev, scope: meta.c.scope || '', tokens: tokens() });
      const scopeChanged = r.ok && r.scope && r.scope !== meta.c.scope;
      if (r.ok && !r.same && (r.rev > (meta.c.rev || 0) || scopeChanged) && r.data != null) {
        const localDirty = auth.admin && S.get('content') && sig(S.get('content')) !== meta.c.sig;
        if (!localDirty && applyContent(r.rev, r.data)) { meta.c.scope = r.scope; saveMeta(); touchedCurrent = true; }
      }
    },

    // ---------- đăng nhập ----------
    async authPhoneHash(ph) {
      const r = await call('auth.phone', { ph });
      if (!r.ok) return r;
      if (typeof r.trialOk === 'boolean') trialState[ph] = r.trialOk;
      if (typeof r.trialHours === 'number') trialHours = r.trialHours;
      if (r.needPassword) { trialState[ph] = false; needPw[ph] = 1; } else delete needPw[ph];
      if (r.family) applyFamily(r.family);
      if (r.needPassword) return r;
      auth.ph[ph] = { token: r.token, kind: r.kind }; saveAuth();
      applyProfiles(r.profiles); setStatus('ok'); return r;
    },
    // Trước khi đăng nhập bằng tên + SĐT: lấy hồ sơ của SĐT này từ máy chủ về máy
    async authPhone(phone) {
      if (!supported) return { offline: true };
      const ph = this.phoneKey(phone); if (!ph) return { error: 'bad_phone' };
      Object.keys(meta.ignore || {}).forEach(id => { if (id.slice(1, 7) === ph.slice(0, 6)) delete meta.ignore[id]; });
      try { return await this.authPhoneHash(ph); } catch (e) { return { offline: true }; }
    },
    // Đăng nhập VIP (SĐT + mật khẩu chung) — kiểm tra ở máy chủ
    async authVip(phoneOrPh, pw) {
      if (!supported) return { offline: true };
      const ph = /^[0-9a-f]{14}$/.test(phoneOrPh) ? phoneOrPh : this.phoneKey(phoneOrPh); if (!ph) return { error: 'bad_phone', msg: 'Số điện thoại chưa đúng.' };
      let r; try { r = await call('auth.vip', { ph, pw }); } catch (e) { return { offline: true }; }
      const all = S.get('families', {});
      if (!r.ok) {
        // máy chủ từ chối: vô hiệu mật khẩu cũ còn lưu trên máy (đã đổi ở máy khác)
        if (r.error === 'bad_password' && all[ph] && all[ph].passHash === MA.Account.famPw(ph, pw)) { all[ph].passHash = '!srv'; quiet(() => S.set('families', all)); }
        return r;
      }
      auth.ph[ph] = { token: r.token, kind: 'vip' }; saveAuth();
      Object.keys(meta.ignore || {}).forEach(id => { if (id.slice(1, 7) === ph.slice(0, 6)) delete meta.ignore[id]; });
      if (r.family) applyFamily(r.family);
      applyProfiles(r.profiles);
      const f = S.get('families', {}); if (f[ph]) { f[ph].passHash = MA.Account.famPw(ph, pw); f[ph].legacy = {}; quiet(() => S.set('families', f)); }
      setStatus('ok'); this.flush(); return r;
    },
    async authAdmin(user, pw) {
      if (!supported) return { offline: true };
      let r; try { r = await call('auth.admin', { user: String(user).trim(), pw }); } catch (e) { return { offline: true }; }
      if (!r.ok) return r;
      auth.admin = { token: r.token, user: r.user }; saveAuth();
      S.set('admin_session', { user: r.user, name: r.name, until: Date.now() + 8 * 3600 * 1000, server: true, mustChange: !!r.mustChange });
      if (r.mustChange) return r;   // chưa đổi mật khẩu mặc định → chưa tải dữ liệu toàn hệ thống
      const log = S.get('admin_log', []); log.unshift({ user: r.user, at: Date.now(), server: true }); S.set('admin_log', log.slice(0, 100));
      meta.since = 0; saveMeta();
      try { await this.pull(); await this.flush(); } catch (e) { /* bỏ qua */ }
      return r;
    },
    // Gọi API kèm các phiên đăng nhập trên máy (dùng cho thao tác cần phản hồi ngay)
    async api(a, data = {}) { if (!supported) return { offline: true }; try { return await call(a, Object.assign({ tokens: tokens() }, data)); } catch (e) { return { offline: true }; } },
    async adminPass(oldPw, newPw) {
      const r = await this.api('admin.pass', { old: oldPw, new: newPw });
      if (r.ok) { const s = S.get('admin_session'); if (s) { s.mustChange = false; S.set('admin_session', s); } meta.since = 0; saveMeta(); try { await this.pull(); await this.flush(); } catch (e) { /* bỏ qua */ } }
      return r;
    },
    async vipCode(phone, name, exp) {
      const ph = this.phoneKey(phone); if (!ph) return { error: 'bad_phone', msg: 'Mã VIP bắt buộc có SĐT cha/mẹ hợp lệ.' };
      return this.api('vip.code', { ph, slug: slug(name) || 'hs', exp: exp || '' });
    },
    async redeem(acc, code) {
      // v26: chưa có phiên đăng nhập máy chủ cho SĐT này (vừa liên kết SĐT, hoặc phiên cũ hết) → đăng nhập theo SĐT trước
      if (!authorized(acc.phoneHash)) {
        const a = await this.authPhoneHash(acc.phoneHash).catch(() => ({ offline: true }));
        if (a && a.offline) return { offline: true };
        if (!authorized(acc.phoneHash)) return { ok: false, msg: a && a.needPassword ? 'Gói VIP của số điện thoại này đã có mật khẩu — hãy đăng xuất, đăng nhập ở tab VIP rồi nhập mã.' : ((a && (a.msg || a.error)) || 'Chưa đăng nhập được máy chủ, vui lòng thử lại.') };
      }
      const r = await this.api('vip.redeem', { ph: acc.phoneHash, id: acc.id, code: String(code).trim().toUpperCase(), tail: acc.phoneTail });
      if (r.ok && r.family) { applyFamily(r.family); this.fetchContent().catch(() => {}); }
      return r;
    },
    // ---------- Dùng thử VIP (mỗi SĐT 1 lần, bắt buộc đặt mật khẩu) ----------
    trialOk(ph) { return ph in trialState ? trialState[ph] : null; },   // null = chưa biết
    trialHours() { return trialHours; },
    async trial(acc, pw) {
      if (!supported) return { offline: true };
      const ph = acc.phoneHash;
      const ensure = async (force) => {
        if (auth.ph[ph] && !force) return null;
        if (force) { delete auth.ph[ph]; saveAuth(); }
        let s; try { s = await this.authPhoneHash(ph); } catch (e) { return { offline: true }; }
        if (s.needPassword) return { error: 'used', msg: 'Số điện thoại này đã có mật khẩu (đã là VIP hoặc đã dùng thử). Hãy đăng nhập ở tab 👑 VIP.' };
        return s.ok ? null : s;
      };
      let e = await ensure(false); if (e) return e;
      const send = () => this.api('vip.trial', { ph, id: acc.id, pw: String(pw), tail: acc.phoneTail || null });
      let r = await send();
      if (r.error === 'auth') { e = await ensure(true); if (e) return e; r = await send(); }   // phiên cũ hết hạn → xin phiên mới rồi thử lại
      if (!r.ok) { if (r.error === 'used') trialState[ph] = false; return r; }
      auth.ph[ph] = { token: r.token, kind: 'vip' }; saveAuth();
      trialState[ph] = false; if (typeof r.trialHours === 'number') trialHours = r.trialHours;
      applyFamily(r.family);
      const f = S.get('families', {}); if (f[ph]) { f[ph].passHash = MA.Account.famPw(ph, pw); f[ph].legacy = {}; quiet(() => S.set('families', f)); }
      setStatus('ok'); this.fetchContent().catch(() => {}); this.flush();
      return r;
    },
    dropAdmin() { auth.admin = null; saveAuth(); },
    forget(id) { delete meta.p[id]; meta.ignore = meta.ignore || {}; meta.ignore[id] = 1; saveMeta(); },
    op(o) { if (!supported) return; o.qid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); ops.push(o); saveOps(); this.schedule(300); },

    // ---------- tải về ----------
    async pull() {
      if (!supported || !tokens().length) return;
      setStatus('sync'); const c0 = this.changes;
      const r = await call('pull', { tokens: tokens(), since: meta.since || 0 });
      this.lastPull = Date.now();
      this.dropInvalid(r.invalid);
      (r.families || []).forEach(f => { const m = meta.f[f.phoneHash]; const loc = S.get('families', {})[f.phoneHash]; if (!(auth.admin && m && loc && m.sig !== sig(packFam(loc)) && f.rev <= m.rev)) applyFamily(f); });
      applyProfiles(r.profiles);
      if (r.admin) { meta.since = r.time - 5000; saveMeta(); }
      this.lastSync = Date.now(); S.set('sync_last', this.lastSync); setStatus('ok');
      afterApply(); return this.changes - c0;
    },
    dropInvalid(list) {
      if (!list || !list.length) return;
      Object.keys(auth.ph).forEach(ph => { if (list.includes(auth.ph[ph].token)) delete auth.ph[ph]; });
      if (auth.admin && list.includes(auth.admin.token)) auth.admin = null;
      saveAuth();
    },

    // ---------- gửi lên ----------
    schedule(ms) { if (!supported) return; clearTimeout(timer); timer = setTimeout(() => this.flush(), ms == null ? CFG.debounce : ms); },
    buildPush() {
      const accs = S.get('accounts', {}), users = S.get('users', {}), fams = S.get('families', {});
      const body = { tokens: tokens(), profiles: [], families: [], ops: ops.slice() };
      const sent = {};
      Object.values(accs).forEach(acc => {
        if (!syncable(acc) || !authorized(acc.phoneHash) || (meta.ignore && meta.ignore[acc.id])) return;
        const u = users[acc.id] || null; const s = profSig(acc, u); const m = meta.p[acc.id];
        if (m && m.sig === s) return;
        if (m && m.skip === s) return;
        body.profiles.push({ id: acc.id, account: JSON.stringify(packAcc(acc)), user: u && !u._trim ? JSON.stringify(u) : null, baseRev: m ? m.rev : 0 });
        sent[acc.id] = s;
      });
      if (auth.admin) {
        Object.values(fams).forEach(f => {
          if (!f || !f.phoneHash) return; const pk = packFam(f); const s = sig(pk); const m = meta.f[f.phoneHash];
          if (m && m.sig === s) return;
          const item = { ph: f.phoneHash, data: pk, baseRev: m ? m.rev : 0 };
          if (!m && f.passHash && /^[0-9a-f]{14}$/.test(f.passHash)) item.legacyHash = f.passHash;   // mật khẩu tạo trước khi có máy chủ
          body.families.push(item); sent['f:' + f.phoneHash] = s;
        });
        const c = S.get('content'); if (c && sig(c) !== meta.c.sig) { body.content = { data: JSON.stringify(c), baseRev: meta.c.rev || 0 }; sent.content = sig(c); }
      }
      return { body, sent };
    },
    async flush(opts = {}) {
      if (!supported) return;
      if (busy) { again = true; return; }
      // hồ sơ đang học có SĐT nhưng máy chưa có phiên với máy chủ → xin phiên (1 lần mỗi lần mở trang)
      const cur = MA.Account.current();
      if (cur && cur.phoneHash && !auth.ph[cur.phoneHash] && !(meta.ignore || {})[cur.id] && !triedPh[cur.phoneHash] && !opts.keepalive) {
        triedPh[cur.phoneHash] = 1; try { await this.authPhoneHash(cur.phoneHash); } catch (e) { /* ngoại tuyến */ }
      }
      // v18.1: các hồ sơ KHÁC trên máy (anh/chị/em, bạn học chung máy) có kết quả chờ gửi nhưng mất phiên
      // (vd. gói gia đình vừa đặt mật khẩu VIP → phiên SĐT cũ bị máy chủ huỷ) → xin phiên lại, 1 lần mỗi lần mở trang.
      // Trước đây chỉ làm cho hồ sơ đang học → kết quả của các bạn còn lại nằm im trên máy, máy khác không thấy.
      if (!opts.keepalive) for (const a of this.unsent()) {
        if (triedPh[a.ph]) continue; triedPh[a.ph] = 1;
        try { await this.authPhoneHash(a.ph); } catch (e) { break; /* ngoại tuyến */ }
      }
      if (!tokens().length) { this.warnUnsent(); return; }
      const { body, sent } = this.buildPush();
      if (!body.profiles.length && !body.families.length && !body.ops.length && !body.content) return;
      busy = true; setStatus('sync');
      let r;
      try { r = await call('push', body, { keepalive: opts.keepalive && JSON.stringify(body).length < 60000 }); }
      catch (e) { busy = false; clearTimeout(timer); timer = setTimeout(() => this.flush(), 30000); return; }
      busy = false;
      if (!r || !r.ok) { setStatus('error', r && r.msg); return; }
      this.dropInvalid(r.invalid);
      (r.tokens || []).forEach(t => { auth.ph[t.ph] = { token: t.token, kind: t.kind }; }); saveAuth();
      let needPull = false, conflicts = [];
      (r.families || []).forEach(x => {
        if (x.ok) { applyFamily(x.family); meta.f[x.ph] = { rev: x.rev, sig: sent['f:' + x.ph] }; }
        else if (x.conflict) { applyFamily(x.server); conflicts.push('gói VIP'); }
      });
      const accs = () => S.get('accounts', {});
      (r.profiles || []).forEach(x => {
        if (x.ok) meta.p[x.id] = { rev: x.rev, sig: sent[x.id] };
        else if (x.conflict) applyProfiles([x.server]);
        else if (x.deleted) applyProfiles([{ id: x.id, deleted: true }]);
        else if (x.error) meta.p[x.id] = Object.assign({}, meta.p[x.id] || { rev: 0, sig: '' }, { skip: sent[x.id] });
      });
      saveMeta();
      const sentIds = new Set(body.ops.map(o => o.qid)); ops = ops.filter(o => !sentIds.has(o.qid)); saveOps();
      (r.ops || []).forEach(x => {
        if (x.family) applyFamily(x.family);
        if (x.error) { needPull = true; MA.UI && MA.UI.toast('☁️ Máy chủ: ' + x.error, 'bad'); }
      });
      if (r.content) {
        if (r.content.ok) { meta.c = { rev: r.content.rev, sig: sent.content }; saveMeta(); }
        else if (r.content.conflict) { applyContent(r.content.rev, r.content.data); conflicts.push('nội dung'); }
      }
      if (conflicts.length && MA.UI) MA.UI.toast('☁️ Dữ liệu ' + conflicts.join(', ') + ' vừa được cập nhật từ máy khác — đã tải bản mới nhất, vui lòng kiểm tra lại thao tác.', 'bad');
      this.lastSync = Date.now(); S.set('sync_last', this.lastSync); setStatus('ok'); this.warnUnsent();
      afterApply();
      if (needPull) await this.pull().catch(() => {});
      if (again || (r.profiles || []).some(x => x.conflict)) { again = false; this.schedule(500); }
    },
    // Đánh dấu toàn bộ dữ liệu trên máy là “cần gửi lại” (quản trị dùng khi chuyển dữ liệu cũ lên máy chủ)
    async pushAll() { Object.keys(meta.p).forEach(id => { meta.p[id] = { rev: meta.p[id].rev, sig: '' }; }); Object.keys(meta.f).forEach(ph => { meta.f[ph].sig = ''; }); meta.ignore = {}; saveMeta(); await this.flush(); },
    async now() { await this.sync(); return this.status; },

    // Hồ sơ trên máy có kết quả học CHƯA lưu lên máy chủ vì máy chưa có phiên với SĐT đó
    unsent() {
      if (!supported) return [];
      const accs = S.get('accounts', {}), users = S.get('users', {});
      return Object.values(accs).filter(acc => syncable(acc) && !(meta.ignore || {})[acc.id] && !authorized(acc.phoneHash)
        && (!meta.p[acc.id] || meta.p[acc.id].sig !== profSig(acc, users[acc.id] || null)))
        .map(acc => ({ id: acc.id, ph: acc.phoneHash, name: (users[acc.id] || acc).name || acc.name || 'Bạn nhỏ', needPw: !!needPw[acc.phoneHash] }));
    },
    warnUnsent() {
      const list = this.unsent().filter(x => x.needPw);
      if (!list.length) return;
      if (Sync.status !== 'offline') setStatus('auth', 'Kết quả học của ' + list.map(x => x.name).join(', ') + ' mới lưu trên máy này, CHƯA lên máy chủ (gói gia đình đã có mật khẩu VIP). Hãy đăng nhập lại ở tab 👑 VIP bằng SĐT + mật khẩu của gia đình đó để gửi lên — các máy khác và bảng xếp hạng mới thấy.');
      if (!warned && MA.UI) { warned = true; MA.UI.toast('🔑 Kết quả của ' + list.map(x => x.name).join(', ') + ' chưa lưu lên máy chủ — bấm biểu tượng 🔑 trên thanh tiêu đề để xem cách sửa.', 'bad'); }
    },

    // ---------- bảng xếp hạng chung ----------
    lbCached(grade) { return lbCache[grade] || null; },
    async leaderboard(grade) {
      if (!supported) return null;
      // 'mine' = hồ sơ đang có trên máy này. Máy chủ v18 vẫn trả các hồ sơ này (kèm id) để so với bản trên máy —
      // bản trên máy có thể đã cũ (vd. máy tính quản trị giữ bản sao của cả trường). 'exclude' để máy chủ bản cũ vẫn chạy đúng.
      const mine = MA.Account.all().filter(syncable).map(a => a.id);
      try { const r = await call('leaderboard', { grade, week: MA.User.weekId(), mine, exclude: mine }); if (r.ok) { lbCache[grade] = { all: r.all || [], week: r.week || [], v: r.v || 1, at: Date.now() }; return lbCache[grade]; } } catch (e) { /* ngoại tuyến */ }
      return null;
    },
    info() { return { supported, online: this.online, status: this.status, lastSync: this.lastSync, admin: auth.admin ? auth.admin.user : null, phones: Object.keys(auth.ph).length, synced: Object.keys(meta.p).length, pending: ops.length, api: CFG.api }; },
    syncable
  };

  MA.Sync = Sync;
})(window.MA);
