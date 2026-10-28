/* =========================================================
 * content-config.js — FILE CẤU HÌNH NỘI DUNG (do Admin Board xuất ra)
 *
 * Quản trị viên chỉnh nội dung trong Admin Board (ẩn chủ đề, đặt VIP,
 * thêm câu hỏi, tạo đề thi…), sau đó vào tab “Cài đặt” → “Tải file
 * content-config.js” và chép đè file này lên website.
 * Như vậy mọi học sinh, trên mọi máy, đều nhận được nội dung mới.
 * ========================================================= */
window.MA = window.MA || {};
MA.ContentConfig = {
  version: 1,
  hiddenTopics: [],          // id chủ đề bị ẩn với học sinh
  vipTopics: [],             // id chủ đề chỉ dành cho VIP
  vipGens: [],               // 'idChủĐề::Tên dạng bài' chỉ dành cho VIP
  vipExams: ['hsg'],         // loại đề kiểm tra chỉ dành cho VIP (q15, q45, hsg)
  vipLevel3: false,          // true = mọi bài mức Nâng cao chỉ dành cho VIP
  customQuestions: [],       // câu hỏi do thầy cô biên soạn
  customExams: []            // đề thi / bài tập do thầy cô biên soạn
};
