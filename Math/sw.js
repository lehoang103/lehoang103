/* sw.js — Service Worker của Toán Vui: lưu sẵn ứng dụng để mở được khi mất mạng.
 * Đổi phiên bản bằng:  node tools/doi-phien-ban.js   (đổi VERSION ở đây + ?v= trong index.html)
 * Cách lấy tệp:
 *   • Trang, JS, CSS, cấu hình: ƯU TIÊN MẠNG (luôn chạy bản mới nhất, mọi trình duyệt như nhau);
 *     mạng chậm quá 4 giây hoặc mất mạng → dùng bản đã lưu.
 *   • Ảnh, phông chữ: dùng bản đã lưu (ít khi đổi), tải ngầm bản mới. */
const VERSION = 'toanvui-v27-kiem-tra-hoc-ky';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'huong-dan.html',
  'css/style.css',
  'assets/fonts/nunito-vietnamese-wght-normal.woff2',
  'assets/fonts/nunito-latin-wght-normal.woff2',
  'assets/fonts/nunito-latin-ext-wght-normal.woff2',
  'js/core/boot.js',
  'js/core/utils.js',
  'js/core/storage.js',
  'js/core/sound.js',
  'js/core/user.js',
  'js/core/account.js',
  'js/core/content.js',
  'js/core/bots.js',
  'js/core/analytics.js',
  'js/core/tutor.js',
  'js/core/visuals.js',
  'js/config/accounts-config.js',
  'js/config/content-config.js',
  'js/config/sync-config.js',
  'js/core/ga.js',
  'js/core/sync.js',
  'js/core/nav.js',
  'js/core/pwa.js',
  'js/data/registry.js',
  'js/data/grade1.js',
  'js/data/grade2.js',
  'js/data/grade2-more.js',
  'js/data/grade2-hsg.js',
  'js/data/grade2-tangcuong.js',
  'js/data/grade3.js',
  'js/data/grade4.js',
  'js/data/grade5.js',
  'js/data/grade6.js',
  'js/data/grade6-more.js',
  'js/data/grade6-hk2.js',
  'js/data/theory-core.js',
  'js/data/grade6-lythuyet.js',
  'js/data/grade6-lythuyet-t2.js',
  'js/data/grade1-sgk.js',
  'js/data/grade2-sgk.js',
  'js/data/grade3-sgk.js',
  'js/data/grade4-sgk.js',
  'js/data/grade5-sgk.js',
  'js/data/interactive.js',
  'js/data/curriculum.js',
  'js/data/timo-core.js',
  'js/data/timo-g2.js',
  'js/data/timo-g2-de.js',
  'js/data/timo-bank.js',
  'js/data/timo-bank2.js',
  'js/data/timo-grades.js',
  'js/ui/core.js',
  'js/ui/charts.js',
  'js/ui/quiz.js',
  'js/ui/views-home.js',
  'js/ui/views-learn.js',
  'js/ui/views-practice.js',
  'js/ui/views-tools.js',
  'js/ui/views-vip.js',
  'js/ui/views-timo.js',
  'js/ui/views-theory.js',
  'js/ui/report.js',
  'js/ui/views-admin.js',
  'assets/mascot.jpg',
  'assets/hero.jpg',
  'assets/award.jpg',
  'assets/icon-192.png'
];
const fresh = (req) => new Request(req.url.split('?')[0], { cache: 'reload', credentials: 'same-origin' });
self.addEventListener('install', (e) => {
  // tải thẳng từ máy chủ (bỏ qua bộ nhớ đệm HTTP) để không lưu nhầm bản cũ
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(fresh(new Request(u, { credentials: 'same-origin' }))).catch(() => null))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

const withTimeout = (p, ms) => new Promise((ok, no) => { const t = setTimeout(() => no(new Error('timeout')), ms); p.then(r => { clearTimeout(t); ok(r); }, err => { clearTimeout(t); no(err); }); });
async function networkFirst(req, fallbackUrl) {
  const c = await caches.open(VERSION);
  const net = fetch(req, { cache: 'no-cache' }).then(r => { if (r && r.ok && r.type === 'basic') c.put(req.url.split('?')[0], r.clone()); return r; });
  try { return await withTimeout(net, 4000); }
  catch (err) {
    const hit = await c.match(req, { ignoreSearch: true }) || (fallbackUrl && (await c.match(fallbackUrl, { ignoreSearch: true }) || await c.match('./')));
    if (hit) return hit;
    return net;   // chưa có bản lưu: chờ mạng tiếp
  }
}
async function cacheFirst(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req, { ignoreSearch: true });
  const net = fetch(req).then(r => { if (r && r.ok && r.type === 'basic') c.put(req.url.split('?')[0], r.clone()); return r; }).catch(() => hit);
  return hit || net;
}
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin || url.pathname.includes('/api/')) return;   // API: luôn đi mạng
  if (req.mode === 'navigate') return e.respondWith(networkFirst(req, 'index.html'));
  if (/\.(png|jpe?g|gif|svg|webp|ico|woff2?)$/i.test(url.pathname)) return e.respondWith(cacheFirst(req));
  e.respondWith(networkFirst(req));
});
