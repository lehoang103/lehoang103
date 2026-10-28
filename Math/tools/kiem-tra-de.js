/* =========================================================
 * tools/kiem-tra-de.js — KIỂM TRA TỰ ĐỘNG TOÀN BỘ DẠNG BÀI (chạy trước mỗi lần cập nhật)
 *   Cách chạy (cần Node.js ≥ 16):   node tools/kiem-tra-de.js
 *   Tuỳ chọn: node tools/kiem-tra-de.js 300   (số lần sinh đề mỗi dạng, mặc định 200)
 * Kiểm tra mỗi dạng bài: không lỗi, không NaN/undefined, câu trắc nghiệm có đúng 1 đáp án đúng
 * nằm trong các lựa chọn và không trùng lựa chọn, số đề khác nhau đủ nhiều.
 * Không cần tải lên hosting.
 * ========================================================= */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const N = +process.argv[2] || 200, MIN_VARIETY = 5;
const ctx = { console, Math, Date, JSON, Set, Map, Array, Object, String, Number, isFinite, parseInt, parseFloat };
ctx.window = ctx; ctx.document = { querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style: {} }) };
ctx.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; ctx.navigator = { userAgent: 'node' };
vm.createContext(ctx);
const files = ['js/core/utils.js', 'js/core/visuals.js', 'js/data/registry.js', 'js/data/grade1.js', 'js/data/grade2.js', 'js/data/grade2-more.js', 'js/data/grade2-hsg.js', 'js/data/grade2-tangcuong.js', 'js/data/grade3.js', 'js/data/grade4.js', 'js/data/grade5.js', 'js/data/grade6.js', 'js/data/grade6-more.js', 'js/data/grade6-hk2.js', 'js/data/theory-core.js', 'js/data/grade6-lythuyet.js', 'js/data/grade6-lythuyet-t2.js', 'js/data/grade1-sgk.js', 'js/data/grade2-sgk.js', 'js/data/grade3-sgk.js', 'js/data/grade4-sgk.js', 'js/data/grade5-sgk.js', 'js/data/interactive.js', 'js/data/curriculum.js', 'js/data/timo-core.js', 'js/data/timo-g2.js', 'js/data/timo-g2-de.js', 'js/data/timo-bank.js', 'js/data/timo-bank2.js', 'js/data/timo-grades.js'];
for (const f of files) { try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f }); } catch (e) { console.error('✘ Không nạp được', f, '—', e.message); process.exit(1); } }
const MA = ctx.MA; let total = 0; const bad = [], low = [];
for (const g of MA.Data.grades()) for (const t of g.topics) (t.gens || []).forEach((gen, i) => {
  total++; const id = `${t.id}#${i} «${gen.name}»`; const seen = new Set();
  for (let k = 0; k < N; k++) {
    let q; try { q = gen.fn(); } catch (e) { bad.push(`${id}: lỗi ${e.message}`); return; }
    const all = [q.text, q.answerText, ...(q.options || [])].join(' ');
    if (/NaN|undefined|Infinity|\[object Object\]/.test(all)) { bad.push(`${id}: có NaN/undefined → ${String(q.text).slice(0, 80)} | ${q.answerText}`); return; }
    if (q.type === 'mc') {
      if (!(q.correct >= 0)) { bad.push(`${id}: đáp án không nằm trong lựa chọn → ${q.answerText} / ${q.options}`); return; }
      if (new Set(q.options).size !== q.options.length) { bad.push(`${id}: lựa chọn bị trùng → ${q.options}`); return; }
      if (q.options.length < 2) { bad.push(`${id}: chỉ có ${q.options.length} lựa chọn`); return; }
    }
    seen.add(q.text + '|' + q.answerText + '|' + JSON.stringify(q.visual || ''));
  }
  if (seen.size < MIN_VARIETY) low.push(`${id}: chỉ ${seen.size} đề khác nhau`);
});
// Thứ tự chương trình (curriculum.js): bài nền tảng phải tồn tại và nằm ở bước trước trên Bản đồ
for (const g of MA.Data.grades()) for (const t of g.topics) (t.prereqs || []).forEach(p => {
  const q = MA.Data.topic(p);
  if (!q) bad.push(`${t.id}: bài nền tảng «${p}» không tồn tại`);
  else if (q.grade === t.grade && t.step != null && !(q.step < t.step)) bad.push(`${t.id}: bài nền tảng «${p}» phải ở bước trước trên Bản đồ (curriculum.js)`);
});
console.log(`Đã kiểm tra ${total} dạng bài × ${N} lần.`);
if (low.length) console.log(`\n⚠ ${low.length} dạng bài ít biến thể (< ${MIN_VARIETY}):\n  ` + low.join('\n  '));
if (bad.length) { console.log(`\n✘ ${bad.length} dạng bài lỗi:\n  ` + bad.join('\n  ')); process.exit(1); }
console.log('\n✔ Không có lỗi.');
