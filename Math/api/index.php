<?php
/* =========================================================
 * api/index.php — MÁY CHỦ ĐỒNG BỘ TÀI KHOẢN & DỮ LIỆU HỌC TẬP (Toán Vui)
 *
 * Một tệp duy nhất, không cần thư viện ngoài. Yêu cầu PHP ≥ 7.4 + PDO (mysql hoặc sqlite).
 * Trình duyệt gửi POST JSON { a: "<hành động>", tokens: [...], ... }.
 *
 *  Hành động công khai : ping · content.get · leaderboard · auth.phone · auth.vip · auth.admin
 *  Dùng thử VIP        : vip.trial (cần phiên auth.phone; mỗi SĐT 1 lần, bắt buộc đặt mật khẩu)
 *  Cần phiên đăng nhập  : pull · push (gồm hồ sơ, gói VIP gia đình, nội dung, thao tác)
 *
 * Bảo mật:
 *  • SĐT không bao giờ gửi lên máy chủ — chỉ gửi mã băm (ph) tính trên trình duyệt.
 *  • Mật khẩu VIP & quản trị lưu bằng password_hash (bcrypt), kiểm tra ở máy chủ.
 *  • Phiên đăng nhập là token ngẫu nhiên; máy chủ chỉ lưu SHA-256 của token.
 *  • Giới hạn số lần thử mật khẩu / truy vấn theo IP để chống dò.
 * ========================================================= */
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');

const API_VERSION = 1;
const VIP_DAYS = 365;
const MAX_MEMBERS = 2;
const DAY_MS = 86400000;
const TRIAL_PER_IP_DAY = 5;      // số lượt kích hoạt dùng thử tối đa / 1 địa chỉ IP / 24 giờ (chống tạo SĐT ảo)
const XP_PER_DAY = 3000;         // trần XP hợp lệ mỗi ngày (chặn gian lận bảng xếp hạng)
const AVATARS = ['🦉', '🐱', '🐶', '🐼', '🦊', '🐰', '🐯', '🐸', '🐵', '🦄', '🐧', '🐨', '🦁', '🐲', '🐙', '🚀'];

$CFG = require __DIR__ . '/config.php';
date_default_timezone_set($CFG['timezone'] ?? 'Asia/Ho_Chi_Minh');

// ---------------------------------------------------------------- tiện ích
function out(array $o, int $code = 200): void {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode($o, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function fail(string $msg, string $code = 'error', int $http = 200): void { out(['ok' => false, 'error' => $code, 'msg' => $msg], $http); }
function nowMs(): int { return (int) floor(microtime(true) * 1000); }
function jd($s) { if ($s === null || $s === '') return null; $v = json_decode((string) $s, true); return $v; }
function je($v): string { return json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); }
function isPh($ph): bool { return is_string($ph) && preg_match('/^[0-9a-f]{14}$/', $ph) === 1; }
function clientIp(): string { return substr((string) ($_SERVER['REMOTE_ADDR'] ?? '0'), 0, 45); }

// cyrb53 — giống hệt MA.U.hash trên trình duyệt (dùng cho mã VIP & mật khẩu cũ)
function u32(int $x): int { return $x & 0xFFFFFFFF; }
function imul(int $a, int $b): int {
  $a = u32($a); $b = u32($b);
  $ah = ($a >> 16) & 0xFFFF; $al = $a & 0xFFFF; $bh = ($b >> 16) & 0xFFFF; $bl = $b & 0xFFFF;
  return u32(($al * $bl) + (u32(($ah * $bl + $al * $bh) << 16)));
}
function cyrb53(string $str, int $seed = 0): string {
  $h1 = u32(0xdeadbeef ^ $seed); $h2 = u32(0x41c6ce57 ^ $seed);
  $u16 = function_exists('mb_convert_encoding') ? mb_convert_encoding($str, 'UTF-16BE', 'UTF-8') : $str;
  $units = function_exists('mb_convert_encoding') ? array_values(unpack('n*', $u16) ?: []) : array_map('ord', str_split($str));
  foreach ($units as $ch) { $h1 = imul($h1 ^ $ch, 2654435761); $h2 = imul($h2 ^ $ch, 1597334677); }
  $h1 = u32(imul($h1 ^ ($h1 >> 16), 2246822507) ^ imul($h2 ^ ($h2 >> 13), 3266489909));
  $h2 = u32(imul($h2 ^ ($h2 >> 16), 2246822507) ^ imul($h1 ^ ($h1 >> 13), 3266489909));
  $v = (($h2 & 2097151) * 4294967296) + $h1;
  return str_pad(dechex($v), 14, '0', STR_PAD_LEFT);
}

// ---------------------------------------------------------------- cơ sở dữ liệu
function db(): PDO {
  static $pdo = null; global $CFG;
  if ($pdo) return $pdo;
  $d = $CFG['db'];
  if (!empty($d['user'])) {
    $pdo = new PDO("mysql:host={$d['host']};port=" . (int) ($d['port'] ?? 3306) . ";dbname={$d['name']};charset=utf8mb4", $d['user'], $d['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
  } else {
    $dir = dirname($d['sqlite']); if (!is_dir($dir)) @mkdir($dir, 0775, true);
    $pdo = new PDO('sqlite:' . $d['sqlite'], null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA journal_mode=WAL'); $pdo->exec('PRAGMA busy_timeout=5000');
  }
  schema($pdo);
  return $pdo;
}
function isMysql(): bool { return db()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql'; }
function schema(PDO $pdo): void {
  $my = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
  $tail = $my ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : '';
  $text = $my ? 'MEDIUMTEXT' : 'TEXT';
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_profiles (id VARCHAR(80) NOT NULL PRIMARY KEY, ph VARCHAR(20) NOT NULL, name VARCHAR(100), grade INT, rev INT NOT NULL DEFAULT 0, deleted INT NOT NULL DEFAULT 0, account $text, user $text, lb TEXT, updated BIGINT NOT NULL DEFAULT 0)$tail");
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_families (ph VARCHAR(20) NOT NULL PRIMARY KEY, rev INT NOT NULL DEFAULT 0, data TEXT, pass_hash VARCHAR(255), legacy_hash VARCHAR(40), updated BIGINT NOT NULL DEFAULT 0)$tail");
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_kv (k VARCHAR(40) NOT NULL PRIMARY KEY, rev INT NOT NULL DEFAULT 0, v $text, updated BIGINT NOT NULL DEFAULT 0)$tail");
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_admins (user VARCHAR(40) NOT NULL PRIMARY KEY, name VARCHAR(100), pass_hash VARCHAR(255), updated BIGINT NOT NULL DEFAULT 0)$tail");
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_tokens (th CHAR(64) NOT NULL PRIMARY KEY, scope VARCHAR(60) NOT NULL, kind VARCHAR(10) NOT NULL, created BIGINT NOT NULL, expires BIGINT NOT NULL)$tail");
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_codes (code VARCHAR(30) NOT NULL PRIMARY KEY, ph VARCHAR(20), pid VARCHAR(80), at BIGINT)$tail");
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_vipcodes (code VARCHAR(30) NOT NULL PRIMARY KEY, ph VARCHAR(20) NOT NULL, slug VARCHAR(80) NOT NULL, exp BIGINT NOT NULL, created BIGINT NOT NULL, by_user VARCHAR(40), used_at BIGINT, used_pid VARCHAR(80))$tail");
  try { $pdo->exec('ALTER TABLE tv_admins ADD COLUMN must_change INT NOT NULL DEFAULT 0'); } catch (Throwable $e) { /* đã có */ }
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_attempts (k VARCHAR(80) NOT NULL, at BIGINT NOT NULL)$tail");
  $pdo->exec("CREATE TABLE IF NOT EXISTS tv_log (at BIGINT NOT NULL, who VARCHAR(80), act VARCHAR(40), info VARCHAR(255))$tail");
  foreach (['CREATE INDEX ix_tv_prof_ph ON tv_profiles(ph)', 'CREATE INDEX ix_tv_prof_upd ON tv_profiles(updated)', 'CREATE INDEX ix_tv_att_k ON tv_attempts(k)', 'CREATE INDEX ix_tv_fam_upd ON tv_families(updated)'] as $ix) {
    try { $pdo->exec($ix); } catch (Throwable $e) { /* đã có */ }
  }
}
function q(string $sql, array $p = []): PDOStatement { $s = db()->prepare($sql); $s->execute($p); return $s; }
function one(string $sql, array $p = []) { $r = q($sql, $p)->fetch(); return $r ?: null; }
function logAct(string $who, string $act, string $info = ''): void { try { q('INSERT INTO tv_log (at, who, act, info) VALUES (?,?,?,?)', [nowMs(), $who, $act, mb_substr($info, 0, 250)]); } catch (Throwable $e) {} }

// ---------------------------------------------------------------- chống dò
function tooMany(string $k, int $max, int $windowSec): bool {
  $since = nowMs() - $windowSec * 1000;
  if (mt_rand(1, 50) === 1) q('DELETE FROM tv_attempts WHERE at < ?', [nowMs() - 86400000]);
  $n = (int) (one('SELECT COUNT(*) AS n FROM tv_attempts WHERE k = ? AND at > ?', [$k, $since])['n'] ?? 0);
  return $n >= $max;
}
function hit(string $k): void { q('INSERT INTO tv_attempts (k, at) VALUES (?, ?)', [$k, nowMs()]); }

// ---------------------------------------------------------------- phiên đăng nhập
function newToken(string $scope, string $kind): string {
  global $CFG;
  $t = bin2hex(random_bytes(24));
  q('INSERT INTO tv_tokens (th, scope, kind, created, expires) VALUES (?,?,?,?,?)', [hash('sha256', $t), $scope, $kind, nowMs(), nowMs() + (int) $CFG['token_days'] * DAY_MS]);
  if (mt_rand(1, 30) === 1) q('DELETE FROM tv_tokens WHERE expires < ?', [nowMs()]);
  return $t;
}
// Trả về quyền của các token gửi kèm: ['admin'=>user|null, 'ph'=>[ph=>kind], 'invalid'=>[...], 'tok'=>[ph=>token]]
function scopes($tokens): array {
  $r = ['admin' => null, 'adminPending' => null, 'ph' => [], 'invalid' => [], 'tok' => []];
  if (!is_array($tokens)) return $r;
  foreach (array_slice($tokens, 0, 20) as $t) {
    if (!is_string($t) || strlen($t) < 20) continue;
    $row = one('SELECT * FROM tv_tokens WHERE th = ? AND expires > ?', [hash('sha256', $t), nowMs()]);
    if (!$row) { $r['invalid'][] = $t; continue; }
    if ($row['kind'] === 'admin') {
      $u = substr($row['scope'], 6); $a = one('SELECT user, must_change FROM tv_admins WHERE user = ?', [$u]);
      if (!$a) { $r['invalid'][] = $t; continue; }
      // còn dùng mật khẩu mặc định → chỉ được phép đổi mật khẩu, chưa có quyền quản trị
      if ((int) $a['must_change'] === 1) $r['adminPending'] = $u; else $r['admin'] = $u;
      continue;
    }
    $ph = $row['scope'];
    if ($row['kind'] === 'phone' && famHasPw(getFam($ph))) { $r['invalid'][] = $t; continue; } // gói đã đặt mật khẩu → phải đăng nhập bằng mật khẩu
    $r['ph'][$ph] = $row['kind']; $r['tok'][$ph] = $t;
  }
  return $r;
}
function canPh(array $sc, string $ph): bool { return $sc['admin'] !== null || isset($sc['ph'][$ph]); }

// ---------------------------------------------------------------- dữ liệu
function getFam(string $ph) { return one('SELECT * FROM tv_families WHERE ph = ?', [$ph]); }
function famHasPw($f): bool { return $f && (!empty($f['pass_hash']) || !empty($f['legacy_hash'])); }
function famOut($row): ?array {
  if (!$row) return null;
  $d = jd($row['data']) ?: [];
  $d['phoneHash'] = $row['ph']; $d['rev'] = (int) $row['rev']; $d['hasPw'] = famHasPw($row);
  $d['members'] = array_values($d['members'] ?? []); $d['codes'] = array_values($d['codes'] ?? []);
  return $d;
}
function saveFam(string $ph, array $data, $row): array {
  $clean = [
    'phoneTail' => isset($data['phoneTail']) ? substr((string) $data['phoneTail'], 0, 4) : null,
    'vipFrom' => isset($data['vipFrom']) ? (int) $data['vipFrom'] : null,
    'vipUntil' => isset($data['vipUntil']) ? (int) $data['vipUntil'] : null,
    'members' => array_values(array_slice(array_filter((array) ($data['members'] ?? []), 'is_string'), 0, MAX_MEMBERS)),
    'codes' => array_values(array_slice(array_filter((array) ($data['codes'] ?? []), 'is_string'), -50)),
    'created' => (int) ($data['created'] ?? nowMs()),
    'trialAt' => isset($data['trialAt']) ? (int) $data['trialAt'] : null,   // thời điểm đã dùng thử VIP (mỗi SĐT 1 lần)
    'trial' => !empty($data['trial']),                                       // gói hiện tại là gói dùng thử
  ];
  if (!$clean['trialAt'] && $row) { $old = jd($row['data']) ?: []; if (!empty($old['trialAt'])) $clean['trialAt'] = (int) $old['trialAt']; }  // không xoá được dấu đã dùng thử
  if ($row) q('UPDATE tv_families SET data = ?, rev = rev + 1, updated = ? WHERE ph = ?', [je($clean), nowMs(), $ph]);
  else q('INSERT INTO tv_families (ph, rev, data, updated) VALUES (?, 1, ?, ?)', [$ph, je($clean), nowMs()]);
  return famOut(getFam($ph));
}
function famActive(array $d): bool { return !empty($d['vipUntil']) && (int) $d['vipUntil'] >= nowMs(); }
// Dữ liệu hồ sơ được giữ NGUYÊN chuỗi JSON do trình duyệt gửi (không giải mã/mã hóa lại → không sai lệch {} / []).
function trimUser(?string $s): ?string {   // bản rút gọn cho Admin Board (bỏ bản sao câu hỏi trong sổ lỗi sai)
  if ($s === null) return null; $u = json_decode($s); if (!is_object($u)) return $s;
  unset($u->mistakes); $u->_trim = true; return je($u);   // giữ errLog để báo cáo kiểu lỗi
}
function profOut(array $row, bool $trim = false): array {
  return ['id' => $row['id'], 'ph' => $row['ph'], 'rev' => (int) $row['rev'], 'deleted' => (int) $row['deleted'] === 1,
    'account' => $row['account'], 'user' => $trim ? trimUser($row['user']) : $row['user'], 'updated' => (int) $row['updated']];
}
// v25: ảnh đại diện có thể là ảnh tải từ máy (data URL JPEG/PNG/WebP chỉ gồm kí tự base64, ≤ 40 KB).
// safeEmoji dùng cho bảng xếp hạng CÔNG KHAI → không lộ ảnh thật của trẻ cho người lạ.
function safeEmoji($a): string { return in_array($a, AVATARS, true) ? $a : '🦉'; }
function safeAvatar($a): string {
  if (is_string($a) && strlen($a) <= 40000 && preg_match('#^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$#', $a)) return $a;
  return safeEmoji($a);
}
function cleanName($n): string { return trim(mb_substr(preg_replace('/[<>"\'&`\\\\]/u', '', strip_tags((string) $n)), 0, 40)); }
// Tên hiển thị công khai trên bảng xếp hạng: "Nguyễn Minh Anh" → "N.M. Anh" (bảo vệ quyền riêng tư của trẻ)
function shortName($n): string {
  $w = preg_split('/\s+/u', cleanName($n), -1, PREG_SPLIT_NO_EMPTY); if (!$w) return 'Bạn nhỏ';
  $last = array_pop($w); $ini = '';
  foreach ($w as $x) $ini .= mb_strtoupper(mb_substr($x, 0, 1)) . '.';
  return ($ini ? $ini . ' ' : '') . mb_convert_case(mb_substr($last, 0, 1), MB_CASE_UPPER) . mb_substr($last, 1);
}
// Làm sạch JSON tài khoản / dữ liệu học trước khi lưu (chặn chèn mã HTML qua tên, ảnh đại diện)
function cleanObj(?string $s, bool $isAcc) {
  if ($s === null) return null; $o = json_decode($s); if (!is_object($o)) return null;
  if (property_exists($o, 'avatar')) $o->avatar = safeAvatar($o->avatar);
  if (property_exists($o, 'name')) $o->name = cleanName($o->name);
  if ($isAcc && property_exists($o, 'note')) $o->note = mb_substr(strip_tags((string) $o->note), 0, 300);
  return $o;
}
// Số liệu bảng xếp hạng do MÁY CHỦ tính lại: XP tăng thêm bị giới hạn theo thời gian thực đã trôi qua
// (tối đa XP_PER_DAY mỗi ngày) → không thể sửa trình duyệt để đẩy hàng chục nghìn XP lên bảng.
function lbOf($u, ?string $prevLb, int $prevAt, bool $catchUp = false): string {
  if (!is_object($u)) return je(null);
  $prev = $prevLb ? json_decode($prevLb, true) : null; $first = !is_array($prev);
  if ($first) { $days = is_object($u->activity ?? null) ? count((array) $u->activity) : 1; $allow = XP_PER_DAY * min(400, max(1, $days)); }
  else { if (!empty($prev['at'])) $prevAt = (int) $prev['at']; $sec = max(0, (nowMs() - $prevAt) / 1000); $allow = (int) min(XP_PER_DAY * max(1, ceil($sec / 86400)), ($catchUp ? 0 : 60) + $sec * 12); }
  $xp = []; $claimed = (array) ($u->xp ?? []);
  foreach ($claimed as $g => $v) { $g = (string) (int) $g; $old = $first ? 0 : (int) ($prev['xp'][$g] ?? 0); $v = max(0, (int) $v); $xp[$g] = $v <= $old ? $v : min($v, $old + $allow); }
  $wk = null;
  if (is_object($u->week ?? null) && is_string($u->week->id ?? null)) {
    $sameWk = !$first && (($prev['week']['id'] ?? '') === $u->week->id); $wx = [];
    foreach ((array) ($u->week->xp ?? []) as $g => $v) { $g = (string) (int) $g; $old = $sameWk ? (int) ($prev['week']['xp'][$g] ?? 0) : 0; $v = max(0, (int) $v); $cap = $sameWk ? $old + $allow : min($allow, XP_PER_DAY * 7); $wx[$g] = min($v, $cap, $xp[$g] ?? 0); }
    $wk = ['id' => substr($u->week->id, 0, 10), 'xp' => $wx ?: new stdClass()];
  }
  // cap = có phần XP bị giữ lại → bảng xếp hạng sẽ tự tính bù dần theo thời gian (xem lbCatchUp) kể cả khi máy không gửi gì thêm
  $cap = false; foreach ($claimed as $g => $v) if ((int) $v > ($xp[(string) (int) $g] ?? 0)) $cap = true;
  if ($wk) foreach ((array) ($u->week->xp ?? []) as $g => $v) if (min((int) $v, $xp[(string) (int) $g] ?? 0) > ($wk['xp'][(string) (int) $g] ?? 0)) $cap = true;
  return je(['avatar' => safeEmoji($u->avatar ?? ''), 'grade' => (int) ($u->grade ?? 0), 'xp' => $xp ?: new stdClass(), 'week' => $wk, 'correct' => (int) ($u->stats->correct ?? 0), 'at' => nowMs(), 'cap' => $cap]);
}
// v20: XP bị giữ lại ở lần gửi CUỐI của buổi học trước đây nằm im mãi (không còn lần gửi nào để bù) → bảng xếp hạng thấp hơn thật.
// Khi xem bảng xếp hạng: hồ sơ còn phần bị giữ (cap) hoặc bản lb cũ (chưa có 'at') → tính lại từ dữ liệu học đã lưu, vẫn theo trần XP/ngày.
function lbCatchUp(array $r): ?array {
  $lb = jd($r['lb']); if (!$lb) return $lb;
  if (isset($lb['at']) && (empty($lb['cap']) || nowMs() - (int) $lb['at'] < 60000)) return $lb;   // tính bù tối đa 1 lần/phút, chỉ theo thời gian thực
  $row = one('SELECT user, updated FROM tv_profiles WHERE id = ?', [$r['id']]); if (!$row || $row['user'] === null) return $lb;
  $new = lbOf(json_decode((string) $row['user']), $r['lb'], (int) $row['updated'], true);
  q('UPDATE tv_profiles SET lb = ? WHERE id = ?', [$new, $r['id']]);   // không đổi rev/updated → không gây xung đột đồng bộ
  return jd($new);
}
// Quyền nội dung: VIP còn hạn hoặc quản trị → nhận đủ câu hỏi/đề VIP do thầy cô soạn
function vipScope(array $sc): bool {
  if ($sc['admin'] !== null) return true;
  foreach ($sc['ph'] as $ph => $kind) { $f = getFam($ph); if ($f && famActive(famOut($f))) return true; }
  return false;
}
// Đổi mật khẩu quản trị: trả về chuỗi lỗi hoặc '' khi thành công
function adminPass(string $u, string $old, string $new): string {
  global $CFG;
  $row = one('SELECT * FROM tv_admins WHERE user = ?', [$u]);
  if (!$row || !password_verify($old, $row['pass_hash'])) return 'Mật khẩu hiện tại chưa đúng.';
  if (mb_strlen($new) < 8) return 'Mật khẩu mới cần ít nhất 8 kí tự.';
  if ($new === $old || hash_equals((string) ($CFG['default_admin']['pass'] ?? ''), $new)) return 'Hãy chọn mật khẩu mới khác mật khẩu mặc định.';
  q('UPDATE tv_admins SET pass_hash = ?, must_change = 0, updated = ? WHERE user = ?', [password_hash($new, PASSWORD_DEFAULT), nowMs(), $u]);
  logAct('admin:' . $u, 'adminPass'); return '';
}
function genCode(): string { $a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; $s = ''; for ($i = 0; $i < 10; $i++) $s .= $a[random_int(0, strlen($a) - 1)]; return 'VIP-' . substr($s, 0, 5) . '-' . substr($s, 5); }
// Nhập mã kích hoạt VIP: mã ngẫu nhiên do máy chủ sinh, gắn với SĐT (mã băm) + tên, chỉ dùng 1 lần
function redeemCode(array $sc, string $ph, string $pid, string $code, $tail): array {
  $code = strtoupper(trim($code));
  if (!isPh($ph) || !canPh($sc, $ph) || !idMatchesPh($pid, $ph)) return ['error' => 'Không có quyền.'];
  $k = 'code:' . clientIp();
  if (tooMany($k, 10, 900)) return ['error' => 'Nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.'];
  $c = preg_match('/^VIP-[A-Z0-9]{5}-[A-Z0-9]{5}$/', $code) ? one('SELECT * FROM tv_vipcodes WHERE code = ?', [$code]) : null;
  if (!$c || $c['ph'] !== $ph || $c['slug'] !== substr($pid, 8)) { hit($k); return ['error' => 'Mã không hợp lệ với tài khoản này (kiểm tra lại tên và SĐT đã đăng kí với thầy cô).']; }
  if (!empty($c['used_at'])) return ['error' => 'Mã này đã được sử dụng.'];
  if ((int) $c['exp'] < nowMs()) return ['error' => 'Mã đã quá hạn kích hoạt. Vui lòng xin mã mới.'];
  $row = getFam($ph); $d = $row ? famOut($row) : ['members' => [], 'codes' => [], 'created' => nowMs(), 'phoneTail' => $tail];
  if (!in_array($pid, $d['members'], true)) { if (count($d['members']) >= MAX_MEMBERS) return ['error' => 'Gói VIP của số điện thoại này đã đủ ' . MAX_MEMBERS . ' hồ sơ học.']; $d['members'][] = $pid; }
  if (famActive($d) && empty($d['trial'])) $d['vipUntil'] = (int) $d['vipUntil'] + VIP_DAYS * DAY_MS; else { $d['vipFrom'] = nowMs(); $d['vipUntil'] = nowMs() + VIP_DAYS * DAY_MS; }
  $d['trial'] = false; $d['codes'][] = $code;
  $u = q('UPDATE tv_vipcodes SET used_at = ?, used_pid = ? WHERE code = ? AND used_at IS NULL', [nowMs(), $pid, $code]);
  if ($u->rowCount() !== 1) return ['error' => 'Mã này đã được sử dụng.'];
  $fam = saveFam($ph, $d, $row); logAct('ph:' . $ph, 'redeem', $code);
  return ['ok' => true, 'family' => $fam];
}
// Dùng thử VIP: mỗi SĐT được 1 lần, bắt buộc đặt mật khẩu chung (từ đó đăng nhập bằng SĐT + mật khẩu).
// Chỉ cấp cho SĐT chưa từng là VIP, chưa từng dùng thử và chưa có mật khẩu.
function trialHours(): int { global $CFG; return max(0, min(24 * 30, (int) ($CFG['trial_hours'] ?? 24))); }   // 0 = tắt dùng thử
function startTrial(array $sc, string $ph, string $pid, string $pw, $tail): array {
  if (!isPh($ph) || !idMatchesPh($pid, $ph) || !isset($sc['ph'][$ph])) return ['error' => 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại bằng tên + số điện thoại.', 'code' => 'auth'];
  if (trialHours() < 1) return ['error' => 'Chương trình dùng thử VIP hiện đang tạm dừng.', 'code' => 'off'];
  if (mb_strlen($pw) < 6) return ['error' => 'Mật khẩu cần ít nhất 6 kí tự.', 'code' => 'bad_password'];
  $row = getFam($ph); $d = $row ? famOut($row) : ['members' => [], 'codes' => [], 'created' => nowMs(), 'phoneTail' => is_string($tail) ? substr($tail, 0, 4) : null];
  if (!empty($d['trialAt'])) return ['error' => 'Số điện thoại này đã dùng thử VIP rồi. Liên hệ thầy cô để nhận mã VIP.', 'code' => 'used'];
  if (!empty($d['vipFrom']) || famActive($d)) return ['error' => 'Số điện thoại này đã từng có gói VIP nên không áp dụng dùng thử.', 'code' => 'used'];
  if (famHasPw($row)) return ['error' => 'Số điện thoại này đã có mật khẩu. Hãy đăng nhập ở tab VIP.', 'code' => 'used'];
  $k = 'trial:' . clientIp();
  if (tooMany($k, TRIAL_PER_IP_DAY, 86400)) return ['error' => 'Thiết bị/mạng này đã kích hoạt dùng thử quá nhiều lần hôm nay.', 'code' => 'rate'];
  if (!in_array($pid, $d['members'], true)) { if (count($d['members']) >= MAX_MEMBERS) return ['error' => 'Gói của số điện thoại này đã đủ ' . MAX_MEMBERS . ' hồ sơ học.', 'code' => 'full']; $d['members'][] = $pid; }
  $now = nowMs(); $d['vipFrom'] = $now; $d['vipUntil'] = $now + trialHours() * 3600000; $d['trialAt'] = $now; $d['trial'] = true;
  hit($k);
  saveFam($ph, $d, $row);
  q('UPDATE tv_families SET pass_hash = ?, legacy_hash = NULL, rev = rev + 1, updated = ? WHERE ph = ?', [password_hash($pw, PASSWORD_DEFAULT), nowMs(), $ph]);
  q("DELETE FROM tv_tokens WHERE scope = ? AND kind = 'phone'", [$ph]);   // từ nay đăng nhập bằng SĐT + mật khẩu
  logAct('ph:' . $ph, 'trial', $pid);
  return ['ok' => true, 'token' => newToken($ph, 'vip'), 'family' => famOut(getFam($ph))];
}
function profilesOfPh(string $ph): array { return array_map(fn($r) => profOut($r), q('SELECT * FROM tv_profiles WHERE ph = ? AND deleted = 0', [$ph])->fetchAll()); }
function idMatchesPh(string $id, string $ph): bool { return preg_match('/^p([0-9a-f]{6})-[a-z0-9][a-z0-9-]{0,70}$/', $id, $m) === 1 && $m[1] === substr($ph, 0, 6); }

function seedAdmin(): void {
  global $CFG;
  if (!one('SELECT user FROM tv_admins LIMIT 1')) {
    $a = $CFG['default_admin'];
    q('INSERT INTO tv_admins (user, name, pass_hash, updated) VALUES (?,?,?,?)', [$a['user'], $a['name'], password_hash($a['pass'], PASSWORD_DEFAULT), nowMs()]);
  }
}
function kvGet(string $k) { $r = one('SELECT * FROM tv_kv WHERE k = ?', [$k]); return $r ? ['rev' => (int) $r['rev'], 'data' => $r['v'], 'updated' => (int) $r['updated']] : ['rev' => 0, 'data' => null, 'updated' => 0]; }

// ---------------------------------------------------------------- CORS & đầu vào
if (!empty($CFG['allow_origin'])) {
  header('Access-Control-Allow-Origin: ' . $CFG['allow_origin']);
  header('Access-Control-Allow-Headers: Content-Type');
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
  if (isset($_GET['check'])) {
    header('Content-Type: text/plain; charset=utf-8');
    echo "KIỂM TRA MÁY CHỦ ĐỒNG BỘ TOÁN VUI\n==================================\n";
    echo 'PHP: ' . PHP_VERSION . (version_compare(PHP_VERSION, '7.4', '>=') ? "  ✔\n" : "  ✘ cần ≥ 7.4\n");
    echo 'PDO drivers: ' . implode(', ', PDO::getAvailableDrivers()) . "\n";
    echo 'mbstring: ' . (function_exists('mb_convert_encoding') ? '✔' : '✘ (nên bật)') . "\n";
    try { db(); seedAdmin(); echo 'Cơ sở dữ liệu: ✔ kết nối được (' . (isMysql() ? 'MySQL' : 'SQLite') . ")\n";
      echo 'Số hồ sơ học: ' . (one('SELECT COUNT(*) AS n FROM tv_profiles WHERE deleted = 0')['n'] ?? 0) . "\n";
      echo 'Số gói VIP: ' . (one('SELECT COUNT(*) AS n FROM tv_families')['n'] ?? 0) . "\n";
      echo 'Dùng thử VIP: ' . (trialHours() ? trialHours() . ' giờ / SĐT' : 'đang tắt') . " (sửa 'trial_hours' trong config.php)\n";
    } catch (Throwable $e) { echo 'Cơ sở dữ liệu: ✘ ' . $e->getMessage() . "\n"; }
    echo 'Kiểm tra mã băm: ' . (cyrb53('toanvui') === cyrb53('toanvui') && strlen(cyrb53('abc')) === 14 ? '✔' : '✘') . "\n";
    exit;
  }
  out(['ok' => true, 'app' => 'toanvui', 'v' => API_VERSION, 'time' => nowMs()]);
}

$raw = file_get_contents('php://input') ?: '';
if (strlen($raw) > 12 * 1024 * 1024) fail('Dữ liệu gửi lên quá lớn.', 'too_large', 413);
$in = json_decode($raw, true);
if (!is_array($in)) fail('Yêu cầu không hợp lệ.', 'bad_request', 400);
$a = (string) ($in['a'] ?? '');

try {
  db();
  switch ($a) {
    // ============================================================ công khai
    case 'ping':
      out(['ok' => true, 'v' => API_VERSION, 'time' => nowMs()]);

    case 'content.get':
      $sc = scopes($in['tokens'] ?? []); $c = kvGet('content');
      $scope = $sc['admin'] !== null ? 'admin' : (vipScope($sc) ? 'vip' : 'pub');
      if ((int) ($in['rev'] ?? -1) === $c['rev'] && (string) ($in['scope'] ?? '') === $scope) out(['ok' => true, 'rev' => $c['rev'], 'scope' => $scope, 'same' => true]);
      $data = $c['data'];
      if ($scope !== 'admin' && $data !== null) {
        $o = json_decode($data);
        if (is_object($o)) {
          // học sinh thường: không gửi câu hỏi VIP của thầy cô
          if ($scope === 'pub' && isset($o->customQuestions) && is_array($o->customQuestions)) $o->customQuestions = array_values(array_filter($o->customQuestions, fn($q) => !is_object($q) || empty($q->vip)));
          // mã lớp gốc chỉ quản trị mới thấy (học sinh so khớp bằng mã băm)
          if (isset($o->classes) && is_array($o->classes)) foreach ($o->classes as $cl) if (is_object($cl)) unset($cl->code);
          $data = je($o);
        }
      }
      out(['ok' => true, 'rev' => $c['rev'], 'scope' => $scope, 'data' => $data]);

    case 'leaderboard':
      $g = (int) ($in['grade'] ?? 0); $wk = (string) ($in['week'] ?? '');
      // v18: máy gửi 'mine' (hồ sơ đang lưu trên máy đó) → KHÔNG loại khỏi bảng mà gắn id để máy tự so với bản trên máy
      //      (trước đây loại hẳn → máy giữ bản cũ của nhiều hồ sơ, vd. máy tính quản trị, thấy bảng thiếu/sai). Bản cũ gửi 'exclude'.
      $v2 = isset($in['mine']);
      $mine = array_flip(array_filter((array) ($in['mine'] ?? []), 'is_string'));
      $ex = $v2 ? [] : array_flip(array_filter((array) ($in['exclude'] ?? []), 'is_string'));
      $all = []; $week = [];
      foreach (q('SELECT id, name, lb FROM tv_profiles WHERE deleted = 0')->fetchAll() as $r) {
        if (isset($ex[$r['id']])) continue;
        $lb = lbCatchUp($r); if (!$lb) continue;
        $xp = (int) (($lb['xp'][(string) $g] ?? 0)); $wx = (($lb['week']['id'] ?? '') === $wk) ? (int) ($lb['week']['xp'][(string) $g] ?? 0) : 0;
        $e = ['name' => shortName($r['name']), 'avatar' => safeEmoji($lb['avatar'] ?? ''), 'grade' => $lb['grade'] ?? null, 'xp' => $xp, 'wxp' => $wx, 'correct' => (int) ($lb['correct'] ?? 0)];
        if (isset($mine[$r['id']])) $e['id'] = $r['id'];
        if ($xp > 0) $all[] = $e; if ($wx > 0) $week[] = $e;
      }
      usort($all, fn($x, $y) => $y['xp'] <=> $x['xp']); usort($week, fn($x, $y) => $y['wxp'] <=> $x['wxp']);
      out(['ok' => true, 'v' => $v2 ? 2 : 1, 'grade' => $g, 'all' => array_slice($all, 0, 50), 'week' => array_slice($week, 0, 50)]);

    // Đăng nhập bằng SĐT (tài khoản thường). Gói VIP đã có mật khẩu → yêu cầu mật khẩu.
    case 'auth.phone':
      $ph = $in['ph'] ?? ''; if (!isPh($ph)) fail('Số điện thoại không hợp lệ.', 'bad_phone');
      $ip = 'ip:' . clientIp();
      if (tooMany($ip, 120, 600)) fail('Thao tác quá nhanh, vui lòng thử lại sau ít phút.', 'rate', 429);
      hit($ip);
      $f = getFam($ph);
      if (famHasPw($f)) out(['ok' => true, 'needPassword' => true, 'family' => famOut($f)]);
      $t = newToken($ph, 'phone'); $fd = famOut($f);
      $trialOk = trialHours() > 0 && (!$fd || (empty($fd['trialAt']) && empty($fd['vipFrom'])));
      out(['ok' => true, 'token' => $t, 'kind' => 'phone', 'ph' => $ph, 'profiles' => profilesOfPh($ph), 'family' => $fd, 'trialOk' => $trialOk, 'trialHours' => trialHours(), 'time' => nowMs()]);

    // Đăng nhập VIP: SĐT + mật khẩu chung của gói gia đình
    case 'auth.vip':
      $ph = $in['ph'] ?? ''; $pw = (string) ($in['pw'] ?? '');
      if (!isPh($ph)) fail('Số điện thoại không hợp lệ.', 'bad_phone');
      $k = 'vip:' . $ph;
      if (tooMany($k, 8, 900) || tooMany('ip:' . clientIp(), 120, 600)) fail('Nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.', 'rate', 429);
      $f = getFam($ph);
      if (!famHasPw($f)) { hit('ip:' . clientIp()); fail('Số điện thoại này chưa có tài khoản VIP/mật khẩu trên hệ thống.', 'no_vip'); }
      $ok = false;
      if (!empty($f['pass_hash'])) $ok = password_verify($pw, $f['pass_hash']);
      elseif (!empty($f['legacy_hash'])) {   // mật khẩu tạo từ trước khi có máy chủ → nâng cấp sang bcrypt
        $ok = hash_equals($f['legacy_hash'], cyrb53('toanvui-fam|' . $ph . '|' . $pw));
        if ($ok) q('UPDATE tv_families SET pass_hash = ?, legacy_hash = NULL, rev = rev + 1, updated = ? WHERE ph = ?', [password_hash($pw, PASSWORD_DEFAULT), nowMs(), $ph]);
      }
      if (!$ok) { hit($k); fail('Mật khẩu chưa đúng.', 'bad_password'); }
      $t = newToken($ph, 'vip');
      out(['ok' => true, 'token' => $t, 'kind' => 'vip', 'ph' => $ph, 'profiles' => profilesOfPh($ph), 'family' => famOut(getFam($ph)), 'time' => nowMs()]);

    case 'auth.admin':
      seedAdmin();
      $u = trim((string) ($in['user'] ?? '')); $pw = (string) ($in['pw'] ?? '');
      $k = 'adm:' . clientIp();
      if (tooMany($k, 10, 900)) fail('Nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.', 'rate', 429);
      $row = one('SELECT * FROM tv_admins WHERE user = ?', [$u]);
      if (!$row || !password_verify($pw, $row['pass_hash'])) { hit($k); fail('Sai tài khoản hoặc mật khẩu quản trị.', 'bad_password'); }
      // Vẫn dùng mật khẩu mặc định (ghi trong config.php) → bắt buộc đổi trước khi dùng Bảng quản trị
      $must = hash_equals((string) ($CFG['default_admin']['pass'] ?? ''), $pw) || (int) ($row['must_change'] ?? 0) === 1;
      if ($must) q('UPDATE tv_admins SET must_change = 1 WHERE user = ?', [$u]);
      logAct('admin:' . $u, 'login');
      out(['ok' => true, 'token' => newToken('admin:' . $u, 'admin'), 'kind' => 'admin', 'user' => $u, 'name' => $row['name'], 'mustChange' => $must, 'time' => nowMs()]);

    // Quản trị tạo mã kích hoạt VIP (ngẫu nhiên, lưu trên máy chủ, dùng 1 lần)
    case 'vip.code':
      $sc = scopes($in['tokens'] ?? []);
      if ($sc['admin'] === null) fail('Chỉ quản trị viên (đã đổi mật khẩu mặc định) mới tạo được mã.', 'forbidden', 403);
      $ph = (string) ($in['ph'] ?? ''); $slug = (string) ($in['slug'] ?? '');
      if (!isPh($ph) || !preg_match('/^[a-z0-9][a-z0-9-]{0,70}$/', $slug)) fail('Thiếu SĐT hoặc tên học sinh hợp lệ.', 'bad_request');
      $exp = strtotime((string) ($in['exp'] ?? '') . ' 23:59:59'); if (!$exp || $exp * 1000 < nowMs()) $exp = time() + 30 * 86400;
      do { $code = genCode(); } while (one('SELECT code FROM tv_vipcodes WHERE code = ?', [$code]));
      q('INSERT INTO tv_vipcodes (code, ph, slug, exp, created, by_user) VALUES (?,?,?,?,?,?)', [$code, $ph, $slug, $exp * 1000, nowMs(), $sc['admin']]);
      logAct('admin:' . $sc['admin'], 'vipCode', $code);
      out(['ok' => true, 'code' => $code, 'exp' => $exp * 1000]);

    case 'admin.pass':
      $sc = scopes($in['tokens'] ?? []); $au = $sc['admin'] ?? $sc['adminPending'];
      if ($au === null) fail('Phiên quản trị đã hết hạn, vui lòng đăng nhập lại.', 'auth', 403);
      if (tooMany('admpw:' . clientIp(), 10, 900)) fail('Thử quá nhiều lần. Vui lòng thử lại sau 15 phút.', 'rate', 429);
      $err = adminPass($au, (string) ($in['old'] ?? ''), (string) ($in['new'] ?? ''));
      if ($err) { hit('admpw:' . clientIp()); fail($err, 'bad_password'); }
      out(['ok' => true]);

    case 'vip.trial':
      $sc = scopes($in['tokens'] ?? []); $ph = (string) ($in['ph'] ?? '');
      $r = startTrial($sc, $ph, (string) ($in['id'] ?? ''), (string) ($in['pw'] ?? ''), $in['tail'] ?? null);
      if (!empty($r['error'])) fail($r['error'], $r['code'] ?? 'error');
      out(['ok' => true, 'token' => $r['token'], 'kind' => 'vip', 'ph' => $ph, 'family' => $r['family'], 'trialHours' => trialHours(), 'time' => nowMs()]);

    case 'vip.redeem':
      $sc = scopes($in['tokens'] ?? []);
      $r = redeemCode($sc, (string) ($in['ph'] ?? ''), (string) ($in['id'] ?? ''), (string) ($in['code'] ?? ''), $in['tail'] ?? null);
      if (!empty($r['error'])) fail($r['error'], 'bad_code');
      out(['ok' => true, 'family' => $r['family']]);

    // ============================================================ cần phiên
    case 'pull':
      $sc = scopes($in['tokens'] ?? []);
      $res = ['ok' => true, 'time' => nowMs(), 'profiles' => [], 'families' => [], 'invalid' => $sc['invalid']];
      if ($sc['admin'] !== null) {
        $since = (int) ($in['since'] ?? 0);
        foreach (q('SELECT * FROM tv_profiles WHERE updated > ?', [$since])->fetchAll() as $r) $res['profiles'][] = profOut($r, !isset($sc['ph'][$r['ph']]));
        foreach (q('SELECT * FROM tv_families WHERE updated > ?', [$since])->fetchAll() as $r) $res['families'][] = famOut($r);
        $res['admin'] = $sc['admin'];
      }
      foreach ($sc['ph'] as $ph => $kind) {
        foreach (q('SELECT * FROM tv_profiles WHERE ph = ?', [$ph])->fetchAll() as $r) $res['profiles'][] = profOut($r);
        if ($f = getFam($ph)) $res['families'][] = famOut($f);
      }
      out($res);

    case 'push':
      $sc = scopes($in['tokens'] ?? []);
      $admin = $sc['admin'] !== null;
      $res = ['ok' => true, 'time' => nowMs(), 'profiles' => [], 'families' => [], 'ops' => [], 'invalid' => $sc['invalid'], 'tokens' => []];
      $maxB = (int) ($CFG['max_profile_kb'] ?? 2048) * 1024;

      // 1) Gói VIP gia đình — chỉ quản trị gửi bản ghi đầy đủ
      foreach ((array) ($in['families'] ?? []) as $fr) {
        $ph = $fr['ph'] ?? ''; if (!isPh($ph)) continue;
        if (!$admin) { $res['families'][] = ['ph' => $ph, 'error' => 'forbidden']; continue; }
        $row = getFam($ph);
        if ($row && (int) $row['rev'] !== (int) ($fr['baseRev'] ?? 0)) { $res['families'][] = ['ph' => $ph, 'conflict' => true, 'server' => famOut($row)]; continue; }
        $f = saveFam($ph, (array) ($fr['data'] ?? []), $row);
        if (!empty($fr['legacyHash']) && preg_match('/^[0-9a-f]{14}$/', (string) $fr['legacyHash']) && !famHasPw(getFam($ph)))
          { q('UPDATE tv_families SET legacy_hash = ? WHERE ph = ?', [$fr['legacyHash'], $ph]); $f['hasPw'] = true; }
        $res['families'][] = ['ph' => $ph, 'ok' => true, 'rev' => $f['rev'], 'family' => $f];
      }

      // 2) Hồ sơ học (tài khoản + dữ liệu học tập)
      foreach ((array) ($in['profiles'] ?? []) as $p) {
        $id = (string) ($p['id'] ?? ''); $accObj = cleanObj(is_string($p['account'] ?? null) ? $p['account'] : null, true); $ph = $accObj ? (string) ($accObj->phoneHash ?? '') : '';
        if (!isPh($ph) || !idMatchesPh($id, $ph)) { $res['profiles'][] = ['id' => $id, 'error' => 'bad_id']; continue; }
        if (!canPh($sc, $ph)) { $res['profiles'][] = ['id' => $id, 'error' => 'auth']; continue; }
        $row = one('SELECT * FROM tv_profiles WHERE id = ?', [$id]);
        if ($row && $row['ph'] !== $ph && !$admin) { $res['profiles'][] = ['id' => $id, 'error' => 'forbidden']; continue; }
        if ($row && (int) $row['deleted'] === 1 && !$admin) { $res['profiles'][] = ['id' => $id, 'deleted' => true]; continue; }
        if ($row && (int) $row['rev'] !== (int) ($p['baseRev'] ?? 0)) { $res['profiles'][] = ['id' => $id, 'conflict' => true, 'server' => profOut($row, !isset($sc['ph'][$ph]))]; continue; }
        $user = $p['user'] ?? null;
        $userObj = is_string($user) ? cleanObj($user, false) : null;
        $userJson = $userObj ? je($userObj) : ($row['user'] ?? null);
        if ($userJson !== null && strlen($userJson) > $maxB) { $res['profiles'][] = ['id' => $id, 'error' => 'too_large']; continue; }
        if (!$admin) {   // học sinh không tự đặt được loại tài khoản / hạn VIP / khóa: lấy theo dữ liệu máy chủ
          $fd = ($fr0 = getFam($ph)) ? famOut($fr0) : null; $isVip = $fd && famActive($fd) && in_array($id, $fd['members'], true);
          $accObj->type = $isVip ? 'vip' : 'normal'; $accObj->vipUntil = $isVip ? $fd['vipUntil'] : null; $accObj->vipFrom = $isVip ? ($fd['vipFrom'] ?? null) : null;
          $old = $row ? json_decode((string) $row['account']) : null;
          $accObj->locked = is_object($old) ? (bool) ($old->locked ?? false) : false; $accObj->note = is_object($old) ? (string) ($old->note ?? '') : '';
        }
        $accStr = je($accObj);
        $lb = lbOf($userObj ?: ($userJson !== null ? json_decode($userJson) : null), $row['lb'] ?? null, (int) ($row['updated'] ?? 0));
        $name = cleanName($accObj->name ?? ''); $grade = (int) ($accObj->grade ?? 0);
        if ($row) q('UPDATE tv_profiles SET ph = ?, name = ?, grade = ?, rev = rev + 1, deleted = 0, account = ?, user = ?, lb = ?, updated = ? WHERE id = ?', [$ph, $name, $grade, $accStr, $userJson, $lb, nowMs(), $id]);
        else q('INSERT INTO tv_profiles (id, ph, name, grade, rev, deleted, account, user, lb, updated) VALUES (?,?,?,?,1,0,?,?,?,?)', [$id, $ph, $name, $grade, $accStr, $userJson, $lb, nowMs()]);
        $res['profiles'][] = ['id' => $id, 'ok' => true, 'rev' => (int) one('SELECT rev FROM tv_profiles WHERE id = ?', [$id])['rev']];
      }

      // 3) Thao tác đặc biệt
      foreach (array_values((array) ($in['ops'] ?? [])) as $i => $op) {
        $t = (string) ($op['t'] ?? ''); $ph = (string) ($op['ph'] ?? ''); $r = ['i' => $i, 't' => $t, 'qid' => $op['qid'] ?? null];
        try {
          switch ($t) {
            case 'setPw': // đặt/đổi mật khẩu chung của gói VIP
              $pw = (string) ($op['pw'] ?? ''); $row = isPh($ph) ? getFam($ph) : null;
              if (!$row) { $r['error'] = 'Chưa có gói VIP cho số điện thoại này trên máy chủ.'; break; }
              if (mb_strlen($pw) < 6) { $r['error'] = 'Mật khẩu cần ít nhất 6 kí tự.'; break; }
              $kind = $sc['ph'][$ph] ?? null;
              if (!$admin && $kind !== 'vip' && !($kind === 'phone' && !famHasPw($row))) { $r['error'] = 'Không có quyền đổi mật khẩu.'; break; }
              q('UPDATE tv_families SET pass_hash = ?, legacy_hash = NULL, rev = rev + 1, updated = ? WHERE ph = ?', [password_hash($pw, PASSWORD_DEFAULT), nowMs(), $ph]);
              q("DELETE FROM tv_tokens WHERE scope = ? AND kind = 'phone'", [$ph]);
              if (!$admin || isset($sc['ph'][$ph])) $res['tokens'][] = ['ph' => $ph, 'kind' => 'vip', 'token' => newToken($ph, 'vip')];
              $r['ok'] = true; $r['family'] = famOut(getFam($ph));
              logAct($admin ? 'admin:' . $sc['admin'] : 'ph:' . $ph, 'setPw', $ph);
              break;
            case 'clearPw':
              if (!$admin) { $r['error'] = 'Chỉ quản trị viên.'; break; }
              q('UPDATE tv_families SET pass_hash = NULL, legacy_hash = NULL, rev = rev + 1, updated = ? WHERE ph = ?', [nowMs(), $ph]);
              q('DELETE FROM tv_tokens WHERE scope = ?', [$ph]);
              $r['ok'] = true; $r['family'] = famOut(getFam($ph)); logAct('admin:' . $sc['admin'], 'clearPw', $ph);
              break;
            case 'redeem': // nhập mã kích hoạt VIP (mã do máy chủ sinh)
              $rr = redeemCode($sc, $ph, (string) ($op['id'] ?? ''), (string) ($op['code'] ?? ''), $op['tail'] ?? null);
              if (!empty($rr['error'])) $r['error'] = $rr['error']; else { $r['ok'] = true; $r['family'] = $rr['family']; }
              break;
            case 'addMember': // thêm hồ sơ anh/chị/em vào gói VIP
              $pid = (string) ($op['id'] ?? ''); $row = isPh($ph) ? getFam($ph) : null;
              $kind = $sc['ph'][$ph] ?? null;
              if (!$row) { $r['error'] = 'Chưa có gói VIP.'; break; }
              if (!$admin && !($kind === 'vip' || ($kind === 'phone' && !famHasPw($row)))) { $r['error'] = 'Không có quyền.'; break; }
              $d = famOut($row);
              if (!famActive($d)) { $r['error'] = 'Gói VIP đã hết hạn.'; break; }
              if (!idMatchesPh($pid, $ph) || !one('SELECT id FROM tv_profiles WHERE id = ? AND deleted = 0', [$pid])) { $r['error'] = 'Hồ sơ không thuộc số điện thoại này.'; break; }
              if (!in_array($pid, $d['members'], true)) { if (count($d['members']) >= MAX_MEMBERS) { $r['error'] = 'Gói VIP chỉ gồm tối đa ' . MAX_MEMBERS . ' hồ sơ học.'; break; } $d['members'][] = $pid; }
              $r['family'] = saveFam($ph, $d, $row); $r['ok'] = true;
              break;
            case 'delete': // quản trị xóa hồ sơ
              if (!$admin) { $r['error'] = 'Chỉ quản trị viên.'; break; }
              $pid = (string) ($op['id'] ?? '');
              q('UPDATE tv_profiles SET deleted = 1, rev = rev + 1, user = NULL, lb = NULL, updated = ? WHERE id = ?', [nowMs(), $pid]);
              foreach (q('SELECT * FROM tv_families')->fetchAll() as $fr) { $d = famOut($fr); if (in_array($pid, $d['members'], true)) { $d['members'] = array_values(array_diff($d['members'], [$pid])); if (!$d['members']) $d['vipUntil'] = null; saveFam($fr['ph'], $d, $fr); } }
              $r['ok'] = true; logAct('admin:' . $sc['admin'], 'delete', $pid);
              break;
            case 'adminPass':
              $au = $sc['admin'] ?? $sc['adminPending'];
              if ($au === null) { $r['error'] = 'Chỉ quản trị viên.'; break; }
              $r['error'] = adminPass($au, (string) ($op['old'] ?? ''), (string) ($op['new'] ?? '')) ?: null; if (!$r['error']) $r['ok'] = true;
              break;
            default: $r['error'] = 'Thao tác không hỗ trợ.';
          }
        } catch (Throwable $e) { $r['error'] = 'Lỗi máy chủ.'; error_log('[toanvui] op ' . $t . ': ' . $e->getMessage()); }
        $res['ops'][] = $r;
      }

      // 4) Nội dung (câu hỏi, đề thi, phân quyền VIP) — chỉ quản trị
      if (isset($in['content']) && $admin) {
        $c = kvGet('content');
        if ($c['rev'] !== (int) ($in['content']['baseRev'] ?? 0)) $res['content'] = ['conflict' => true, 'rev' => $c['rev'], 'data' => $c['data']];
        else {
          $v = (string) ($in['content']['data'] ?? 'null'); if (json_decode($v) === null && $v !== 'null') { $res['content'] = ['error' => 'bad']; out($res); }
          if ($c['rev'] === 0 && !one('SELECT k FROM tv_kv WHERE k = ?', ['content'])) q('INSERT INTO tv_kv (k, rev, v, updated) VALUES (?,1,?,?)', ['content', $v, nowMs()]);
          else q('UPDATE tv_kv SET v = ?, rev = rev + 1, updated = ? WHERE k = ?', [$v, nowMs(), 'content']);
          $res['content'] = ['ok' => true, 'rev' => kvGet('content')['rev']];
          logAct('admin:' . $sc['admin'], 'content');
        }
      }
      out($res);

    default:
      fail('Hành động không hỗ trợ.', 'unknown_action', 400);
  }
} catch (Throwable $e) {
  error_log('[toanvui] ' . $e->getMessage() . ' @' . $e->getLine());
  fail('Máy chủ gặp lỗi, vui lòng thử lại sau.', 'server', 500);
}
