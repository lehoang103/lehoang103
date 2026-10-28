/* =========================================================
 * tools/kiem-tra-trang.js — MỞ THỬ MỌI TRANG TRÊN MÁY TÍNH + ĐIỆN THOẠI (tuỳ chọn)
 *   Cần: Node.js + Playwright (npm i -D playwright && npx playwright install chromium)
 *   Chạy web thử: php -S 127.0.0.1:8080 (trong thư mục gốc), rồi:
 *        node tools/kiem-tra-trang.js http://127.0.0.1:8080/
 * Báo: lỗi JavaScript, trang báo lỗi, tràn ngang trên điện thoại, phông chữ chưa nạp, làm thử 5 câu mỗi lớp.
 * ========================================================= */
const { chromium } = require('playwright');
const BASE = (process.argv[2] || 'http://127.0.0.1:8080/').replace(/\/?$/, '/');
const ROUTES = ['home', 'learn', 'practice', 'review', 'review/flags', 'exam', 'worksheet', 'rank', 'vip', 'week', 'timo', 'timo/vocab', 'learn/tm2_geo', 'practice/tm2_logic'];
(async () => {
  const b = await chromium.launch(); let fail = 0;
  for (const [label, vp, mob] of [['Máy tính', { width: 1280, height: 850 }, false], ['Điện thoại', { width: 390, height: 844 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.evaluate(() => MA.User.login('Kiểm Tra', 3, '🦉', '0900000001'));
    for (let g = 1; g <= 6; g++) {
      await p.evaluate((g) => MA.User.setGrade(g), g);
      const tids = await p.evaluate((g) => MA.Data.topics(g).map(t => t.id), g);
      for (const r of (g === 3 ? ROUTES : []).concat(['learn/' + tids[0], 'practice/' + tids[tids.length - 1]])) {
        await p.goto(BASE + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(250);
        const i = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - document.documentElement.clientWidth, crash: /có lỗi xảy ra|Không tìm thấy/.test(document.querySelector('#app').innerText), font: document.fonts.check('700 16px Nunito') && [...document.fonts].some(f => f.family.replace(/"/g, '') === 'Nunito' && f.status === 'loaded') }));
        const bad = [i.over > 2 && `tràn ngang ${i.over}px`, i.crash && 'trang báo lỗi', !i.font && 'chưa nạp phông Nunito'].filter(Boolean);
        if (bad.length) { fail++; console.log(`✘ [${label}] lớp ${g} /${r}: ${bad.join(', ')}`); }
      }
      // làm thử 5 câu
      for (let k = 0; k < 5; k++) {
        const opt = await p.$('#app .opt, #app .options button'); if (opt) await opt.click(); else { const inp = await p.$('#app input[type="text"], #app input[inputmode]'); if (inp) { await inp.fill('1'); await p.keyboard.press('Enter'); } }
        await p.waitForTimeout(250); const nx = await p.$('#app button:has-text("Câu tiếp"), #app button:has-text("Tiếp")'); if (nx) await nx.click(); await p.waitForTimeout(150);
      }
    }
    const e2 = [...new Set(errs)].filter(e => !/ERR_TUNNEL|ERR_NAME|net::/.test(e));
    if (e2.length) { fail++; console.log(`✘ [${label}] lỗi JavaScript:\n  ` + e2.join('\n  ')); }
    console.log(`${e2.length ? '✘' : '✔'} [${label}] đã mở ${ROUTES.length + 12} trang, làm thử 30 câu.`);
    await ctx.close();
  }
  await b.close(); if (fail) { console.log(`\n✘ Có ${fail} vấn đề.`); process.exit(1); } console.log('\n✔ Không có lỗi.');
})();
