/* =========================================================
 * analytics.js — THỐNG KÊ HỌC TẬP & CHỈ SỐ KPI TỪNG TÀI KHOẢN
 *
 * KPI tổng hợp (0–100) gồm 5 thành phần:
 *   Chuyên cần 25%  : số ngày học trong 30 ngày (20 ngày = tối đa)
 *   Khối lượng 20%  : số câu làm trong 30 ngày (300 câu = tối đa)
 *   Chính xác 25%   : tỉ lệ trả lời đúng
 *   Kết quả KT 20%  : điểm trung bình bài kiểm tra / thử thách (thang 10)
 *   Thử thách 10%   : số câu Nâng cao làm đúng (50 câu = tối đa)
 * ========================================================= */
window.MA = window.MA || {};

(function (MA) {
  'use strict';
  const DAY = 864e5;
  const dstr = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const lastDays = (n) => Array.from({ length: n }, (_, i) => dstr(Date.now() - (n - 1 - i) * DAY));
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const r1 = (x) => Math.round(x * 10) / 10;

  const METRICS = [
    { k: 'score', name: 'KPI tổng hợp', unit: '/100', best: 'max' },
    { k: 'logins30', name: 'Lượt đăng nhập (30 ngày)', best: 'max' },
    { k: 'activeDays30', name: 'Số ngày học (30 ngày)', best: 'max' },
    { k: 'q30', name: 'Số câu đã làm (30 ngày)', best: 'max' },
    { k: 'answered', name: 'Tổng số câu đã làm', best: 'max' },
    { k: 'acc', name: 'Tỉ lệ đúng', unit: '%', best: 'max' },
    { k: 'examAvg', name: 'Điểm TB kiểm tra', unit: '/10', best: 'max' },
    { k: 'examCount', name: 'Số bài kiểm tra', best: 'max' },
    { k: 'mastery', name: 'Mức thành thạo TB', unit: '%', best: 'max' },
    { k: 'topics', name: 'Số chủ đề đã luyện', best: 'max' },
    { k: 'hard', name: 'Câu nâng cao đúng', best: 'max' },
    { k: 'fixed', name: 'Lỗi sai đã sửa', best: 'max' },
    { k: 'xp', name: 'Tổng XP', best: 'max' },
    { k: 'streak', name: 'Chuỗi ngày học', best: 'max' },
    { k: 'secPerQ', name: 'Thời gian TB / câu', unit: 'giây', best: 'min' }
  ];

  const Analytics = {
    METRICS, lastDays, dstr,
    rating(score) { return score >= 85 ? { t: 'Xuất sắc', c: 'good', i: '🏆' } : score >= 70 ? { t: 'Tốt', c: 'good', i: '🌟' } : score >= 50 ? { t: 'Đạt', c: '', i: '👍' } : { t: 'Cần cố gắng', c: 'warn', i: '💪' }; },
    kpi(u, acc) {
      acc = acc || MA.Account.get(u.id) || {};
      const days = lastDays(30); const act = u.activity || {};
      const q30 = days.reduce((s, d) => s + ((act[d] && act[d].q) || 0), 0);
      const activeDays30 = days.filter(d => act[d] && act[d].q > 0).length;
      const totQ = Object.values(act).reduce((s, a) => s + a.q, 0), totS = Object.values(act).reduce((s, a) => s + a.s, 0);
      const exams = (u.history || []).filter(h => h.kind === 'exam' || h.kind === 'daily');
      const ts = Object.values(u.topics || {}).filter(t => t.n > 0);
      const logins30 = (acc.logins || []).filter(t => t > Date.now() - 30 * DAY).length;
      const k = {
        id: u.id, name: u.name, avatar: u.avatar, grade: u.grade, type: MA.Account.typeOf(acc),
        logins30, activeDays30, q30, answered: u.stats.answered, correct: u.stats.correct,
        acc: u.stats.answered ? Math.round(u.stats.correct / u.stats.answered * 100) : 0,
        examAvg: r1(avg(exams.map(e => e.score))), examCount: exams.length,
        mastery: Math.round(avg(ts.map(t => t.m))), topics: ts.length,
        hard: u.stats.hard, fixed: u.stats.fixed, xp: Object.values(u.xp || {}).reduce((a, b) => a + b, 0),
        streak: (u.streak && u.streak.days) || 0, secPerQ: totQ ? r1(totS / totQ) : 0,
        lastLogin: acc.lastLogin || 0
      };
      const parts = {
        chuyenCan: Math.min(activeDays30 / 20, 1) * 100,
        khoiLuong: Math.min(q30 / 300, 1) * 100,
        chinhXac: k.acc,
        ketQua: exams.length ? k.examAvg * 10 : k.acc * 0.8,
        thuThach: Math.min(k.hard / 50, 1) * 100
      };
      k.parts = parts;
      k.score = Math.round(parts.chuyenCan * 0.25 + parts.khoiLuong * 0.2 + parts.chinhXac * 0.25 + parts.ketQua * 0.2 + parts.thuThach * 0.1);
      return k;
    },
    all(filter = {}) {
      return MA.User.all().map(u => this.kpi(u)).filter(k => (!filter.grade || +k.grade === +filter.grade) && (!filter.type || k.type === filter.type));
    },
    // Trung bình KPI của một nhóm (phục vụ so sánh đối chứng VIP / Thường)
    groupAvg(list) {
      const o = { n: list.length };
      METRICS.forEach(m => o[m.k] = r1(avg(list.map(x => x[m.k]))));
      return o;
    },
    // Hoạt động toàn hệ thống theo ngày
    daily(n = 14, grade) {
      const days = lastDays(n); const users = MA.User.all().filter(u => !grade || +u.grade === +grade);
      return days.map(d => { let q = 0, c = 0, act = 0; users.forEach(u => { const a = u.activity && u.activity[d]; if (a && a.q) { q += a.q; c += a.c; act++; } }); return { d, q, c, act }; });
    },
    loginsDaily(n = 14) {
      const days = lastDays(n); const cnt = {}; days.forEach(d => cnt[d] = 0);
      MA.Account.all().forEach(a => (a.logins || []).forEach(t => { const d = dstr(t); if (d in cnt) cnt[d]++; }));
      return days.map(d => ({ d, n: cnt[d] }));
    },
    // Thống kê theo chủ đề của một lớp
    topics(grade) {
      const users = MA.User.all();
      return MA.Data.allTopics(grade).map(t => {
        const rows = users.map(u => u.topics && u.topics[t.id]).filter(x => x && x.n > 0);
        const n = rows.reduce((s, r) => s + r.n, 0), c = rows.reduce((s, r) => s + r.c, 0);
        return { t, students: rows.length, n, acc: n ? Math.round(c / n * 100) : 0, mastery: Math.round(avg(rows.map(r => r.m))) };
      });
    },
    toCSV(list) {
      const cols = ['name', 'grade', 'type'].concat(METRICS.map(m => m.k));
      const head = ['Tên', 'Lớp', 'Loại'].concat(METRICS.map(m => m.name));
      const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
      return '﻿' + [head.map(q).join(',')].concat(list.map(k => cols.map(c => q(c === 'type' ? (k.type === 'vip' ? 'VIP' : 'Thường') : k[c])).join(','))).join('\n');
    }
  };
  MA.Analytics = Analytics;
})(window.MA);
