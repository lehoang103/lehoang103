/* =========================================================
 * grade6-lythuyet-t2.js — ÔN LÝ THUYẾT TOÁN 6 – TẬP HAI (18/10/2026)
 * SGK "Kết nối tri thức với cuộc sống":
 *   Chương VI   Phân số                              (Bài 23 – 27)
 *   Chương VII  Số thập phân                         (Bài 28 – 31)
 *   Chương VIII Những hình hình học cơ bản           (Bài 32 – 37)
 *   Chương IX   Dữ liệu và xác suất thực nghiệm      (Bài 38 – 43)
 * Số trang chỉ ghi cho các mục Luyện tập chung / Bài tập cuối chương (đã đối chiếu).
 * Nạp SAU theory-core.js và grade6-hk2.js.
 * ========================================================= */
(function (MA) {
  'use strict';
  const F = MA.U.frac;
  const mF = (a, b) => '−' + F(a, b);

  MA.Theory.add({
    grade: 6, vol: 2, short: 'Tập hai, ', book: 'Toán 6 – Tập hai', series: 'Kết nối tri thức với cuộc sống', icon: '📗', chapterStart: 6,
    chapters: [
      // ------------------------------------------------------------------
      {
        id: 'c6', title: 'Phân số', color: '#e35d9b',
        map: ['Phân số a/b (a, b ∈ ℤ, b ≠ 0); a/b = c/d ⇔ ad = bc', 'Tính chất cơ bản, rút gọn, quy đồng; so sánh; hỗn số dương', 'Cộng, trừ, số đối; nhân, chia, số nghịch đảo; tính chất phép tính', 'Hai bài toán: giá trị phân số của một số; tìm một số biết giá trị phân số của nó'],
        practice: [['Luyện tập chung', 13, 'g6b24'], ['Luyện tập chung', 25, 'g6b27'], ['Bài tập cuối chương VI', 27]],
        lessons: [
          {
            id: 'g6b23', no: 23, title: 'Mở rộng phân số. Phân số bằng nhau', topic: 'g6_frac',
            key: [`Với a, b ∈ ℤ, b ≠ 0, ta gọi ${F('a', 'b')} là một <b>phân số</b>; a là tử số, b là mẫu số. Mọi số nguyên a đều viết được thành phân số ${F('a', 1)}.`, `Hai phân số ${F('a', 'b')} và ${F('c', 'd')} <b>bằng nhau</b> nếu <b>a · d = b · c</b>.`, '<b>Tính chất cơ bản</b>: nhân (hoặc chia) cả tử và mẫu với cùng một số nguyên khác 0 (là ước chung khi chia) thì được phân số bằng phân số đã cho.', `Mọi phân số đều viết được dưới dạng phân số có mẫu dương: ${F('a', '−b')} = ${F('−a', 'b')}.`, '<b>Rút gọn</b>: chia cả tử và mẫu cho một ước chung khác 1 và −1. Phân số <b>tối giản</b> khi tử và mẫu chỉ có ước chung là 1 và −1.'],
            f: [`${F('a', 'b')} = ${F('c', 'd')} ⇔ a · d = b · c`, `${F('a', 'b')} = ${F('a · m', 'b · m')} (m ∈ ℤ, m ≠ 0)`],
            vis: { type: 'fraction', items: [{ n: 1, d: 2, label: '1/2' }, { n: 2, d: 4, label: '2/4' }, { n: 3, d: 6, label: '3/6' }] },
            cards: [['Điều kiện để a/b là phân số?', 'a, b là số nguyên và b ≠ 0.'], ['Khi nào a/b = c/d?', 'Khi a · d = b · c.'], [`Viết ${F(3, -5)} thành phân số có mẫu dương.`, `${F(-3, 5)} (nhân cả tử và mẫu với −1).`], ['Phân số tối giản là gì?', 'Tử và mẫu chỉ có ước chung là 1 và −1.']],
            tf: [[`${F(-3, 4)} = ${F(6, -8)}`, true, '(−3) · (−8) = 24 = 4 · 6.'], [`${F(5, 0)} là một phân số.`, false, 'Mẫu số phải khác 0.'], ['Mọi số nguyên đều viết được dưới dạng phân số.', true, 'a = a/1.'], [`${F(2, 3)} = ${F(4, 5)}`, false, '2 · 5 = 10 ≠ 3 · 4 = 12.'], [`${F(-12, 18)} rút gọn về tối giản là ${F(-2, 3)}.`, true], ['Nhân cả tử và mẫu của một phân số với 0 thì được phân số bằng nó.', false, 'Phải nhân với số nguyên khác 0.']],
            mc: [[`Phân số nào bằng phân số ${F(2, -7)}?`, F(-2, 7), [F(2, 7), F(7, -2), F(-7, 2)]], [`Tìm x biết ${F('x', 15)} = ${F(2, 5)}`, '6', ['3', '10', '30']], [`Phân số tối giản của ${F(-20, 36)} là:`, F(-5, 9), [F(-10, 18), F(5, 9), F(-4, 9)]]]
          },
          {
            id: 'g6b24', no: 24, title: 'So sánh phân số. Hỗn số dương', topic: 'g6_frac',
            key: ['<b>Quy đồng mẫu</b> nhiều phân số: đưa về mẫu dương, tìm BCNN của các mẫu làm mẫu chung, tìm thừa số phụ rồi nhân cả tử và mẫu với thừa số phụ.', 'Hai phân số <b>cùng mẫu dương</b>: phân số nào có tử lớn hơn thì lớn hơn.', 'Hai phân số <b>khác mẫu</b>: viết chúng về cùng một mẫu dương rồi so sánh tử.', 'Phân số có tử và mẫu cùng dấu là phân số <b>dương</b> (lớn hơn 0); khác dấu là phân số <b>âm</b> (nhỏ hơn 0).', `Phân số dương lớn hơn 1 viết được dưới dạng <b>hỗn số dương</b>: ${F(7, 3)} = 2${F(1, 3)} (7 : 3 = 2 dư 1).`],
            f: [`a < b, m > 0 ⇒ ${F('a', 'm')} < ${F('b', 'm')}`, `${F(17, 5)} = 3${F(2, 5)}`],
            cards: [['So sánh hai phân số khác mẫu thế nào?', 'Quy đồng về cùng một mẫu dương rồi so sánh tử.'], ['Mẫu chung nhỏ nhất của các phân số là gì?', 'BCNN của các mẫu (dương).'], [`Viết 2${F(1, 4)} thành phân số.`, `${F(9, 4)} (2 · 4 + 1 = 9).`], ['Phân số âm và phân số dương, số nào lớn hơn?', 'Phân số dương luôn lớn hơn phân số âm.']],
            tf: [[`${F(-3, 5)} < ${F(1, 5)}`, true], [`${F(2, 3)} < ${F(3, 5)}`, false, `${F(10, 15)} > ${F(9, 15)}.`], [`${F(-1, 2)} > ${F(-1, 3)}`, false, `${F(-3, 6)} < ${F(-2, 6)}.`], [`${F(11, 4)} = 2${F(3, 4)}`, true], ['Phân số có tử và mẫu khác dấu là phân số âm.', true], [`Hỗn số 3${F(1, 2)} bằng ${F(4, 2)}.`, false, `3${F(1, 2)} = ${F(7, 2)}.`]],
            mc: [[`Mẫu chung nhỏ nhất của ${F(1, 4)}, ${F(5, 6)}, ${F(3, 8)} là:`, '24', ['48', '192', '12']], [`Viết ${F(23, 5)} dưới dạng hỗn số:`, `4${F(3, 5)}`, [`3${F(4, 5)}`, `4${F(2, 5)}`, `5${F(3, 5)}`]], [`Sắp xếp tăng dần: ${F(1, 2)}; ${F(-2, 3)}; ${F(3, 4)}`, `${F(-2, 3)}; ${F(1, 2)}; ${F(3, 4)}`, [`${F(1, 2)}; ${F(-2, 3)}; ${F(3, 4)}`, `${F(3, 4)}; ${F(1, 2)}; ${F(-2, 3)}`, `${F(-2, 3)}; ${F(3, 4)}; ${F(1, 2)}`]]]
          },
          {
            id: 'g6b25', no: 25, title: 'Phép cộng và phép trừ phân số', topic: 'g6_fracops',
            key: ['Cộng hai phân số <b>cùng mẫu</b>: cộng các tử, giữ nguyên mẫu. <b>Khác mẫu</b>: quy đồng rồi cộng.', 'Tính chất phép cộng phân số: giao hoán, kết hợp, cộng với 0.', `Hai phân số có tổng bằng 0 là hai <b>số đối</b> nhau. Số đối của ${F('a', 'b')} là −${F('a', 'b')} = ${F('−a', 'b')} = ${F('a', '−b')}.`, `<b>Phép trừ</b>: ${F('a', 'b')} − ${F('c', 'd')} = ${F('a', 'b')} + (−${F('c', 'd')}).`, 'Quy tắc dấu ngoặc áp dụng cho phân số như với số nguyên.'],
            f: [`${F('a', 'm')} + ${F('b', 'm')} = ${F('a + b', 'm')}`, `${F('a', 'b')} + (−${F('a', 'b')}) = 0`],
            cards: [['Cộng hai phân số khác mẫu làm thế nào?', 'Quy đồng mẫu rồi cộng các tử, giữ mẫu chung.'], [`Số đối của ${F(-3, 7)}?`, F(3, 7)], ['Trừ một phân số là làm gì?', 'Cộng với số đối của phân số đó.'], [`${F(1, 2)} + ${F(1, 3)} = ?`, F(5, 6)]],
            tf: [[`${F(1, 2)} + ${F(1, 3)} = ${F(2, 5)}`, false, `Phải quy đồng: ${F(3, 6)} + ${F(2, 6)} = ${F(5, 6)}.`], [`Số đối của ${F(2, 5)} là ${F(5, 2)}.`, false, `Số đối là ${mF(2, 5)}; ${F(5, 2)} là số nghịch đảo.`], [`${F(3, 4)} − ${F(1, 4)} = ${F(1, 2)}`, true], ['Phép cộng phân số có tính chất giao hoán và kết hợp.', true], [`${F(-2, 9)} + ${F(2, 9)} = 0`, true]],
            mc: [[`${F(5, 6)} − ${F(1, 4)} =`, F(7, 12), [F(4, 2), F(1, 3), F(13, 12)]], [`Số đối của ${F(4, -9)} là:`, F(4, 9), [F(-4, 9), F(9, 4), F(-9, 4)]], [`${F(-3, 8)} + ${F(5, 8)} =`, F(1, 4), [F(-1, 4), F(2, 16), F(1, 8)]]]
          },
          {
            id: 'g6b26', no: 26, title: 'Phép nhân và phép chia phân số', topic: 'g6_fracops',
            key: [`<b>Nhân</b> hai phân số: tử nhân tử, mẫu nhân mẫu: ${F('a', 'b')} · ${F('c', 'd')} = ${F('a · c', 'b · d')}.`, 'Tính chất phép nhân phân số: giao hoán, kết hợp, nhân với 1, phân phối đối với phép cộng và phép trừ.', `Hai số gọi là <b>nghịch đảo</b> của nhau nếu tích của chúng bằng 1. Số nghịch đảo của ${F('a', 'b')} (a ≠ 0) là ${F('b', 'a')}.`, `<b>Chia</b> một phân số cho một phân số khác 0: nhân số bị chia với số nghịch đảo của số chia: ${F('a', 'b')} : ${F('c', 'd')} = ${F('a', 'b')} · ${F('d', 'c')}.`, 'Số 0 không có số nghịch đảo.'],
            f: [`${F('a', 'b')} · ${F('c', 'd')} = ${F('ac', 'bd')}`, `${F('a', 'b')} : ${F('c', 'd')} = ${F('a', 'b')} · ${F('d', 'c')}`],
            cards: [['Số nghịch đảo của −3?', `${F(-1, 3)} (vì (−3) · ${F(-1, 3)} = 1).`], ['Chia hai phân số làm thế nào?', 'Nhân phân số thứ nhất với số nghịch đảo của phân số thứ hai.'], ['Số nào không có số nghịch đảo?', 'Số 0.'], [`${F(2, 3)} · ${F(9, 4)} = ?`, `${F(18, 12)} = ${F(3, 2)}.`]],
            tf: [[`Số nghịch đảo của ${F(-2, 3)} là ${F(3, 2)}.`, false, `Là ${F(-3, 2)} (tích phải bằng 1).`], [`${F(2, 3)} : ${F(4, 5)} = ${F(5, 6)}`, true], ['Số 0 có số nghịch đảo là 0.', false, 'Số 0 không có số nghịch đảo.'], [`${F(3, 4)} · ${F(4, 3)} = 1`, true], [`${F(1, 2)} · ${F(1, 3)} = ${F(2, 6)}`, false, `= ${F(1, 6)}.`]],
            mc: [[`${F(3, 5)} : ${F(9, 10)} =`, F(2, 3), [F(27, 50), F(3, 2), F(1, 3)]], [`Số nghịch đảo của ${F(-5, 7)} là:`, F(-7, 5), [F(7, 5), F(5, 7), F(-5, 7)]], [`Tính nhanh: ${F(5, 9)} · ${F(7, 13)} + ${F(5, 9)} · ${F(6, 13)}`, F(5, 9), [F(65, 117), '1', F(5, 13)]]]
          },
          {
            id: 'g6b27', no: 27, title: 'Hai bài toán về phân số', topic: 'g6_fracword',
            key: [`<b>Tìm giá trị phân số của một số</b>: muốn tìm ${F('m', 'n')} của số a, ta tính a · ${F('m', 'n')}.`, `<b>Tìm một số biết giá trị phân số của số đó</b>: muốn tìm một số biết ${F('m', 'n')} của nó bằng a, ta tính a : ${F('m', 'n')}.`, 'Mẹo: đề hỏi “… của một số” → nhân; đề cho “… của nó bằng” → chia.', 'Bài có “số còn lại”: phân số được tính trên phần còn lại.'],
            f: [`${F('m', 'n')} của a = a · ${F('m', 'n')}`, `Số cần tìm = a : ${F('m', 'n')}`],
            cards: [[`${F(3, 4)} của 40 là bao nhiêu?`, '40 · 3/4 = 30.'], [`${F(2, 5)} của một số là 12. Số đó?`, `12 : ${F(2, 5)} = 30.`], [`${F(3, 4)} giờ bằng bao nhiêu phút?`, '60 · 3/4 = 45 phút.']],
            tf: [[`${F(2, 3)} của 18 là 12.`, true], [`${F(3, 5)} của một số là 15 thì số đó là 9.`, false, `Số đó là 15 : ${F(3, 5)} = 25.`], ['Muốn tìm giá trị phân số của một số, ta nhân số đó với phân số.', true], ['Muốn tìm một số biết giá trị phân số của nó, ta nhân giá trị đó với phân số.', false, 'Ta chia giá trị đó cho phân số.']],
            mc: [[`Lớp 6A có 40 học sinh, ${F(3, 8)} số học sinh thích bóng đá. Số bạn thích bóng đá là:`, '15', ['24', '25', '107']], [`${F(4, 7)} quãng đường là 20 km. Quãng đường dài:`, '35 km', ['11,4 km', '28 km', '80 km']], [`${F(2, 5)} kg bằng:`, '400 g', ['250 g', '40 g', '2,5 g']]]
          }
        ]
      },
      // ------------------------------------------------------------------
      {
        id: 'c7', title: 'Số thập phân', color: '#22a4b5',
        map: ['Phân số thập phân, số thập phân (cả số âm), số đối, so sánh', 'Cộng, trừ, nhân, chia số thập phân', 'Làm tròn số, ước lượng kết quả', 'Tỉ số, tỉ số phần trăm; hai bài toán về tỉ số %; tỉ lệ bản đồ'],
        practice: [['Luyện tập chung', 41, 'g6b31'], ['Bài tập cuối chương VII', 42]],
        lessons: [
          {
            id: 'g6b28', no: 28, title: 'Số thập phân', topic: 'g6_dec',
            key: ['<b>Phân số thập phân</b> là phân số có mẫu là lũy thừa của 10 (10; 100; 1000…). Phân số thập phân (kể cả âm) viết được dưới dạng <b>số thập phân</b>: ' + F(-7, 10) + ' = −0,7.', 'Số thập phân gồm <b>phần nguyên</b> (bên trái dấu phẩy) và <b>phần thập phân</b> (bên phải dấu phẩy).', 'Số đối của số thập phân a là −a: số đối của 1,5 là −1,5.', 'So sánh: số âm < 0 < số dương. Hai số thập phân dương: so sánh phần nguyên, nếu bằng thì so sánh lần lượt từng hàng thập phân. Hai số âm: số nào có số đối lớn hơn thì nhỏ hơn.'],
            f: [`${F(25, 100)} = 0,25`, '−3,7 < −3,15 vì 3,7 > 3,15'],
            cards: [['Phân số thập phân là gì?', 'Phân số có mẫu là lũy thừa của 10.'], ['Số đối của −2,35?', '2,35.'], ['So sánh −0,5 và −0,49.', '−0,5 < −0,49 (vì 0,5 > 0,49).'], [`Viết ${F(-13, 100)} dưới dạng số thập phân.`, '−0,13.']],
            tf: [['−2,5 > −2,1', false, '2,5 > 2,1 nên −2,5 < −2,1.'], [`${F(3, 100)} = 0,03`, true], ['Số thập phân 7,08 có phần nguyên là 7.', true], ['0,5 = 0,50', true], [`${F(7, 25)} là phân số thập phân.`, false, 'Mẫu 25 không phải lũy thừa của 10 (nhưng viết được thành 28/100).']],
            mc: [['Số thập phân −0,125 viết dưới dạng phân số thập phân là:', F(-125, 1000), [F(-125, 100), F(-1, 8000), F(125, 1000)]], ['Số nào lớn nhất: −1,2; 0,07; −0,9; 0,1?', '0,1', ['0,07', '−0,9', '−1,2']], ['Số đối của 0,6 là:', '−0,6', ['6', '0,06', F(1, 6)]]]
          },
          {
            id: 'g6b29', no: 29, title: 'Tính toán với số thập phân', topic: 'g6_dec',
            key: ['Cộng, trừ, nhân, chia số thập phân <b>dương</b>: như đã học ở Tiểu học (đặt dấu phẩy thẳng cột khi cộng, trừ).', 'Với số thập phân <b>âm</b>: áp dụng quy tắc dấu như số nguyên. Ví dụ (−2,5) + 1,2 = −1,3; (−0,5) · (−4) = 2.', 'Nhân hai số thập phân: nhân như số tự nhiên rồi đếm tổng số chữ số ở phần thập phân của hai thừa số để đặt dấu phẩy.', 'Các tính chất của phép cộng, phép nhân và quy tắc dấu ngoặc, thứ tự thực hiện phép tính áp dụng như với số nguyên.'],
            cards: [['(−2,5) + 1,2 = ?', '−1,3.'], ['0,5 · 0,3 = ?', '0,15 (tổng 2 chữ số thập phân).'], ['(−1,2) · (−5) = ?', '6.'], ['Chia cho 0,1 tức là gì?', 'Nhân với 10.']],
            tf: [['0,5 · 0,3 = 1,5', false, '0,5 · 0,3 = 0,15.'], ['(−3,2) + (−1,8) = −5', true], ['(−0,4) · 2,5 = 1', false, 'Khác dấu → âm: −1.'], ['Số thập phân âm cũng tuân theo quy tắc dấu như số nguyên.', true], ['4,8 : 1,2 = 4', true]],
            mc: [['(−6,3) + 2,8 =', '−3,5', ['3,5', '−9,1', '9,1']], ['1,25 · (−0,8) =', '−1', ['1', '−0,1', '−10']], ['Tính nhanh: 2,5 · 7,3 · 4', '73', ['7,3', '730', '29,2']]]
          },
          {
            id: 'g6b30', no: 30, title: 'Làm tròn và ước lượng', topic: 'g6_dec',
            key: ['<b>Làm tròn</b> số thập phân đến một hàng nào đó: xét chữ số ngay bên phải hàng làm tròn. Nếu chữ số đó <b>≥ 5</b> thì cộng thêm 1 vào chữ số của hàng làm tròn; nếu <b>< 5</b> thì giữ nguyên. Bỏ các chữ số sau hàng làm tròn (với phần thập phân) hoặc thay bằng 0 (với phần nguyên).', 'Làm tròn số nguyên đến hàng chục, trăm, nghìn… cũng theo quy tắc trên.', '<b>Ước lượng</b>: làm tròn các số trong phép tính để tính nhanh kết quả gần đúng, giúp kiểm tra kết quả hoặc dự tính trong thực tế.'],
            f: ['3,146 ≈ 3,15 (hàng phần trăm)', '12 345 ≈ 12 000 (hàng nghìn)'],
            cards: [['Làm tròn 3,146 đến hàng phần trăm.', '3,15 (chữ số 6 ≥ 5).'], ['Làm tròn 72 498 đến hàng nghìn.', '72 000 (chữ số 4 < 5).'], ['Ước lượng 19,8 · 5,1.', '≈ 20 · 5 = 100.']],
            tf: [['Làm tròn 2,349 đến hàng phần mười được 2,4.', false, 'Chữ số hàng phần trăm là 4 < 5 → 2,3.'], ['Làm tròn 6,95 đến hàng phần mười được 7,0.', true], ['Ước lượng giúp phát hiện nhanh kết quả sai.', true], ['Làm tròn 1 450 đến hàng trăm được 1 400.', false, 'Chữ số hàng chục là 5 → 1 500.']],
            mc: [['Làm tròn 15,372 đến hàng phần mười được:', '15,4', ['15,3', '15,37', '15']], ['Làm tròn 248 615 đến hàng nghìn được:', '249 000', ['248 000', '250 000', '248 600']], ['Ước lượng tích 31,2 · 9,8 (làm tròn đến hàng đơn vị):', '310', ['300', '3 100', '40']]]
          },
          {
            id: 'g6b31', no: 31, title: 'Một số bài toán về tỉ số và tỉ số phần trăm', topic: 'g6_pct',
            key: [`<b>Tỉ số</b> của a và b (b ≠ 0) là thương a : b, kí hiệu ${F('a', 'b')}. Tỉ số của hai đại lượng cùng loại phải đổi về <b>cùng đơn vị đo</b>.`, '<b>Tỉ số phần trăm</b> của a và b: a : b · 100%.', '<b>Tìm giá trị phần trăm của một số</b>: m% của b là b · m : 100.', '<b>Tìm một số biết giá trị phần trăm của nó</b>: biết m% của một số là a thì số đó là a : m · 100.', '<b>Tỉ lệ bản đồ</b> 1 : n: 1 đơn vị độ dài trên bản đồ ứng với n đơn vị ngoài thực tế.'],
            f: ['Tỉ số % = a : b · 100%', 'm% của b = b · m : 100', 'Số cần tìm = a : m · 100'],
            vis: { type: 'grid', w: 10, h: 10, fill: 25, caption: '25 ô trên 100 ô = 25%' },
            cards: [['Tỉ số của 30 cm và 2 m?', `30 : 200 = ${F(3, 20)}.`], ['Tỉ số % của 15 và 60?', '15 : 60 · 100% = 25%.'], ['20% của 150?', '150 · 20 : 100 = 30.'], ['25% của một số là 40. Số đó?', '40 : 25 · 100 = 160.']],
            tf: [['Tỉ số của 30 cm và 2 m là 15.', false, `Phải đổi cùng đơn vị: 30 : 200 = ${F(3, 20)}.`], ['Tỉ số phần trăm của 3 và 4 là 75%.', true], ['Giảm giá 20% rồi tăng 20% thì trở về giá ban đầu.', false, '100 → 80 → 96.'], ['Trên bản đồ tỉ lệ 1 : 100 000, 1 cm ứng với 1 km thực tế.', true]],
            mc: [['Một áo giá 200 000 đồng, giảm 15%. Giá sau khi giảm là:', '170 000 đồng', ['185 000 đồng', '30 000 đồng', '230 000 đồng']], ['40% của một số là 24. Số đó là:', '60', ['9,6', '96', '16']], ['Tỉ số phần trăm của 45 phút và 1 giờ là:', '75%', ['45%', '25%', '133%']]]
          }
        ]
      },
      // ------------------------------------------------------------------
      {
        id: 'c8', title: 'Những hình hình học cơ bản', color: '#4a7bd8',
        map: ['Điểm thuộc / không thuộc đường thẳng; ba điểm thẳng hàng', 'Hai đường thẳng cắt nhau, song song', 'Điểm nằm giữa hai điểm; tia; hai tia đối nhau, trùng nhau', 'Đoạn thẳng, độ dài; trung điểm', 'Góc, điểm trong góc; số đo góc; góc nhọn, vuông, tù, bẹt'],
        practice: [['Luyện tập chung', 57, 'g6b35'], ['Luyện tập chung', 65, 'g6b37'], ['Bài tập cuối chương VIII', 67]],
        lessons: [
          {
            id: 'g6b32', no: 32, title: 'Điểm và đường thẳng', topic: 'g6_lines',
            key: ['Điểm: kí hiệu bằng chữ in hoa (A, B, C…). Đường thẳng: chữ thường (a, b, d…) hoặc tên hai điểm thuộc nó (đường thẳng AB).', '<b>A ∈ d</b>: điểm A thuộc đường thẳng d; <b>B ∉ d</b>: B không thuộc d.', 'Có <b>một và chỉ một</b> đường thẳng đi qua hai điểm phân biệt.', 'Ba điểm cùng thuộc một đường thẳng là ba điểm <b>thẳng hàng</b>; ngược lại là ba điểm không thẳng hàng.', 'Hai đường thẳng phân biệt: hoặc <b>cắt nhau</b> (có đúng một điểm chung – giao điểm), hoặc <b>song song</b> (không có điểm chung).'],
            cards: [['Qua hai điểm phân biệt có bao nhiêu đường thẳng?', 'Một và chỉ một.'], ['Thế nào là ba điểm thẳng hàng?', 'Ba điểm cùng thuộc một đường thẳng.'], ['Hai đường thẳng song song có bao nhiêu điểm chung?', 'Không có điểm chung.'], ['Kí hiệu “M không thuộc a”?', 'M ∉ a.']],
            tf: [['Qua hai điểm phân biệt có vô số đường thẳng.', false, 'Có một và chỉ một.'], ['Hai đường thẳng cắt nhau có đúng một điểm chung.', true], ['Hai đường thẳng phân biệt có thể có hai điểm chung.', false], ['Ba điểm cùng nằm trên một đường thẳng là ba điểm thẳng hàng.', true], ['Đường thẳng bị giới hạn ở hai đầu.', false, 'Đường thẳng không bị giới hạn về hai phía.']],
            mc: [['Cách viết nào đúng khi điểm A nằm trên đường thẳng d?', 'A ∈ d', ['A ∉ d', 'd ∈ A', 'A ⊂ d']], ['Hai đường thẳng không có điểm chung gọi là hai đường thẳng:', 'Song song', ['Cắt nhau', 'Trùng nhau', 'Vuông góc']], ['Cho 4 điểm, không có 3 điểm nào thẳng hàng. Số đường thẳng đi qua hai trong 4 điểm đó là:', '6', ['4', '8', '12']]]
          },
          {
            id: 'g6b33', no: 33, title: 'Điểm nằm giữa hai điểm. Tia', topic: 'g6_lines',
            key: ['Trong ba điểm thẳng hàng, có <b>một và chỉ một</b> điểm nằm giữa hai điểm còn lại.', 'Điểm O trên đường thẳng xy chia đường thẳng thành hai phần; mỗi phần cùng với O là một <b>tia gốc O</b>. Tên tia: gốc viết trước (tia Ox).', 'Hai tia chung gốc tạo thành một đường thẳng là hai <b>tia đối nhau</b>.', 'Nếu O nằm giữa A và B thì OA và OB là hai tia đối nhau; A nằm giữa O và B thì tia OA và tia OB <b>trùng nhau</b>.'],
            cards: [['Trong ba điểm thẳng hàng có mấy điểm nằm giữa hai điểm còn lại?', 'Một và chỉ một điểm.'], ['Hai tia đối nhau là gì?', 'Hai tia chung gốc tạo thành một đường thẳng.'], ['Đọc tên tia gốc O đi qua A?', 'Tia OA (gốc viết trước).']],
            tf: [['Tia Ox và tia xO là một.', false, 'Tên tia viết gốc trước; “xO” không phải tên tia gốc O.'], ['Trong ba điểm thẳng hàng có một và chỉ một điểm nằm giữa hai điểm còn lại.', true], ['Hai tia chung gốc luôn là hai tia đối nhau.', false, 'Phải tạo thành một đường thẳng.'], ['A nằm giữa O và B thì tia OA và tia OB trùng nhau.', true]],
            mc: [['Điểm O nằm trên đường thẳng xy. Hai tia Ox, Oy là:', 'Hai tia đối nhau', ['Hai tia trùng nhau', 'Hai đường thẳng song song', 'Hai đoạn thẳng']], ['M nằm giữa A và B. Hai tia nào trùng nhau?', 'AM và AB', ['MA và MB', 'AM và BM', 'MA và AB']], ['Ba điểm A, B, C thẳng hàng, B nằm giữa. Khẳng định nào đúng?', 'BA và BC là hai tia đối nhau', ['AB và CB là hai tia đối nhau', 'A nằm giữa B và C', 'BA và BC trùng nhau']]]
          },
          {
            id: 'g6b34', no: 34, title: 'Đoạn thẳng. Độ dài đoạn thẳng', topic: 'g6_lines',
            key: ['<b>Đoạn thẳng AB</b> là hình gồm hai điểm A, B và tất cả các điểm nằm giữa A và B. A, B là hai đầu mút.', 'Mỗi đoạn thẳng có một độ dài (là số dương). Độ dài đoạn thẳng AB là khoảng cách giữa hai điểm A và B, kí hiệu AB.', 'So sánh hai đoạn thẳng bằng cách so sánh độ dài của chúng.', 'Nếu M nằm giữa A và B thì <b>AM + MB = AB</b>.'],
            f: ['M nằm giữa A, B ⇒ AM + MB = AB'],
            cards: [['Đoạn thẳng AB gồm những điểm nào?', 'Hai điểm A, B và tất cả các điểm nằm giữa A và B.'], ['M nằm giữa A và B, AM = 3 cm, MB = 5 cm. AB = ?', '8 cm.'], ['Độ dài đoạn thẳng có thể bằng 0 hoặc âm không?', 'Không, độ dài luôn là số dương.']],
            tf: [['Đoạn thẳng AB và đoạn thẳng BA là một.', true], ['Nếu M nằm giữa A và B thì AM + MB = AB.', true], ['Độ dài đoạn thẳng có thể là số âm.', false], ['Đoạn thẳng AB là hình gồm chỉ hai điểm A và B.', false, 'Gồm cả các điểm nằm giữa A và B.']],
            mc: [['Trên tia Ox lấy A, B với OA = 3 cm, OB = 7 cm. Độ dài AB là:', '4 cm', ['10 cm', '3 cm', '7 cm']], ['Trên một đường thẳng có 5 điểm phân biệt. Số đoạn thẳng có hai đầu mút là hai trong 5 điểm đó:', '10', ['5', '20', '4']]]
          },
          {
            id: 'g6b35', no: 35, title: 'Trung điểm của đoạn thẳng', topic: 'g6_lines',
            key: ['<b>Trung điểm</b> M của đoạn thẳng AB là điểm nằm giữa A, B và cách đều A, B: <b>MA = MB</b>.', 'Khi đó MA = MB = AB : 2.', 'Mỗi đoạn thẳng có <b>đúng một</b> trung điểm.', 'Muốn kiểm tra M là trung điểm của AB cần đủ hai điều kiện: M nằm giữa A, B và MA = MB.'],
            f: ['MA = MB = AB : 2'],
            cards: [['Trung điểm của đoạn thẳng là gì?', 'Điểm nằm giữa và cách đều hai đầu mút.'], ['AB = 10 cm, M là trung điểm. MA = ?', '5 cm.'], ['MA = MB thì M có chắc là trung điểm AB không?', 'Chưa chắc – M còn phải nằm giữa A và B (thẳng hàng).']],
            tf: [['Nếu MA = MB thì M là trung điểm của AB.', false, 'Còn cần M nằm giữa A và B.'], ['Mỗi đoạn thẳng có đúng một trung điểm.', true], ['M là trung điểm của AB, AB = 8 cm thì AM = 4 cm.', true], ['Trung điểm của đoạn thẳng có thể nằm ngoài đoạn thẳng đó.', false]],
            mc: [['M là trung điểm của AB, AM = 6 cm. Độ dài AB là:', '12 cm', ['6 cm', '3 cm', '18 cm']], ['AB = 12 cm, M là trung điểm AB, N là trung điểm AM. Độ dài NB là:', '9 cm', ['3 cm', '6 cm', '12 cm']]]
          },
          {
            id: 'g6b36', no: 36, title: 'Góc', topic: 'g6_angle',
            key: ['<b>Góc</b> là hình gồm hai tia chung gốc. Gốc chung là <b>đỉnh</b>, hai tia là hai <b>cạnh</b> của góc.', 'Góc xOy kí hiệu ∠xOy (hoặc ∠yOx, ∠O); chữ chỉ đỉnh viết ở giữa.', 'Hai tia đối nhau tạo thành <b>góc bẹt</b>.', 'Điểm M nằm <b>trong góc</b> xOy (không phải góc bẹt) nếu M không thuộc hai cạnh và tia OM nằm giữa Ox và Oy.'],
            vis: { type: 'angle', deg: 55 },
            cards: [['Góc là gì?', 'Hình gồm hai tia chung gốc.'], ['Trong kí hiệu ∠xOy, đỉnh là điểm nào?', 'O – chữ ở giữa.'], ['Hai tia đối nhau tạo thành góc gì?', 'Góc bẹt.']],
            tf: [['Góc là hình gồm hai tia chung gốc.', true], ['∠xOy và ∠yOx là hai góc khác nhau.', false, 'Cùng một góc.'], ['Hai tia đối nhau tạo thành góc bẹt.', true], ['Đỉnh của ∠ABC là điểm A.', false, 'Đỉnh là B.']],
            mc: [['Góc có đỉnh M, hai cạnh Mx và My kí hiệu là:', '∠xMy', ['∠Mxy', '∠xyM', '∠yxM']], ['Vẽ 4 tia chung gốc O (không có hai tia trùng nhau). Số góc đỉnh O là:', '6', ['4', '8', '12']]]
          },
          {
            id: 'g6b37', no: 37, title: 'Số đo góc', topic: 'g6_angle',
            key: ['Mỗi góc có một số đo; đơn vị là <b>độ</b> (°). Dùng <b>thước đo góc</b>: đặt tâm thước trùng đỉnh, một cạnh đi qua vạch 0.', 'Góc bẹt có số đo <b>180°</b>.', 'Phân loại: góc <b>nhọn</b> (< 90°), góc <b>vuông</b> (= 90°), góc <b>tù</b> (lớn hơn 90° và nhỏ hơn 180°), góc <b>bẹt</b> (= 180°).', 'Hai góc bằng nhau nếu số đo bằng nhau; góc có số đo lớn hơn thì lớn hơn.'],
            vis: { type: 'angle', deg: 120 },
            cards: [['Góc vuông có số đo bao nhiêu?', '90°.'], ['Góc 135° là góc gì?', 'Góc tù.'], ['Đo góc bằng dụng cụ gì?', 'Thước đo góc.'], ['Lúc 3 giờ, kim giờ và kim phút tạo góc bao nhiêu?', '90°.']],
            tf: [['Góc 90° là góc nhọn.', false, 'Là góc vuông.'], ['Góc bẹt có số đo 180°.', true], ['Góc tù có số đo lớn hơn 90° và nhỏ hơn 180°.', true], ['Góc 89° lớn hơn góc vuông.', false]],
            mc: [['Góc có số đo 45° là:', 'Góc nhọn', ['Góc vuông', 'Góc tù', 'Góc bẹt']], ['Lúc 4 giờ, góc tạo bởi kim giờ và kim phút là:', '120°', ['90°', '60°', '150°']], ['Góc nào lớn nhất: 89°, góc vuông, 100°, góc bẹt?', 'Góc bẹt', ['100°', 'Góc vuông', '89°']]]
          }
        ]
      },
      // ------------------------------------------------------------------
      {
        id: 'c9', title: 'Dữ liệu và xác suất thực nghiệm', color: '#2fa36b',
        map: ['Dữ liệu (số liệu / không phải số liệu), thu thập, tính hợp lí', 'Bảng thống kê, biểu đồ tranh', 'Biểu đồ cột, biểu đồ cột kép', 'Kết quả có thể, sự kiện', 'Xác suất thực nghiệm = số lần xảy ra : tổng số lần'],
        practice: [['Luyện tập chung', 87, 'g6b41'], ['Luyện tập chung', 97, 'g6b43'], ['Bài tập cuối chương IX', 99]],
        lessons: [
          {
            id: 'g6b38', no: 38, title: 'Dữ liệu và thu thập dữ liệu', topic: 'g6_stats',
            key: ['Dữ liệu là những thông tin thu thập được: <b>số liệu</b> (dữ liệu là số) hoặc <b>không phải số liệu</b> (tên, màu sắc, ý kiến…).', 'Cách thu thập: quan sát, làm thí nghiệm, lập phiếu hỏi, phỏng vấn, tra cứu tài liệu, internet…', 'Có thể dùng <b>bảng kiểm đếm</b> để ghi lại dữ liệu khi thu thập.', 'Cần kiểm tra <b>tính hợp lí</b> của dữ liệu: loại bỏ dữ liệu không đúng định dạng hoặc vô lí.'],
            cards: [['“Màu sắc yêu thích” là số liệu hay không phải số liệu?', 'Không phải số liệu.'], ['Kể hai cách thu thập dữ liệu.', 'Quan sát, lập phiếu hỏi (hoặc phỏng vấn, thí nghiệm…).'], ['Chiều cao học sinh lớp 6 là 15 m – hợp lí không?', 'Không hợp lí.']],
            tf: [['Danh sách tên các bạn trong lớp là số liệu.', false, 'Tên không phải số liệu.'], ['Cân nặng (kg) của các bạn là số liệu.', true], ['Lập phiếu hỏi là một cách thu thập dữ liệu.', true], ['Mọi dữ liệu thu thập được đều hợp lí.', false]],
            mc: [['Dữ liệu nào sau đây là số liệu?', 'Số anh chị em của các bạn trong lớp', ['Môn học yêu thích', 'Tên các loài hoa', 'Màu áo các bạn mặc']], ['Điểm kiểm tra (thang 10): 7; 8; 12; 9. Giá trị không hợp lí là:', '12', ['7', '8', '9']]]
          },
          {
            id: 'g6b39', no: 39, title: 'Bảng thống kê và biểu đồ tranh', topic: 'g6_stats',
            key: ['<b>Bảng thống kê</b> trình bày dữ liệu dưới dạng bảng gồm các hàng và cột, giúp dễ đọc, dễ so sánh.', '<b>Biểu đồ tranh</b> dùng biểu tượng (hình ảnh) để biểu diễn số lượng; mỗi biểu tượng ứng với một số đối tượng ghi ở chú thích.', 'Có thể dùng một phần biểu tượng để biểu diễn số lượng nhỏ hơn.', 'Đọc biểu đồ tranh: đếm số biểu tượng rồi nhân với giá trị mỗi biểu tượng.'],
            vis: { type: 'pictograph', data: [{ label: 'Thứ Hai', value: 20 }, { label: 'Thứ Ba', value: 15 }], icon: '⭐', per: 5, unit: 'bạn' },
            cards: [['Mỗi ⭐ = 5 bạn, có 4 ⭐. Bao nhiêu bạn?', '20 bạn.'], ['Đọc biểu đồ tranh cần xem gì đầu tiên?', 'Chú thích: mỗi biểu tượng ứng với bao nhiêu.']],
            tf: [['Mỗi ⭐ = 10 cây, 3 ⭐ biểu diễn 3 cây.', false, '3 · 10 = 30 cây.'], ['Bảng thống kê giúp trình bày dữ liệu gọn và dễ so sánh.', true], ['Trong biểu đồ tranh, mỗi biểu tượng luôn biểu diễn 1 đối tượng.', false, 'Xem chú thích.']],
            mc: [['Mỗi 🌳 = 4 cây. Lớp 6A có 5 🌳 và nửa 🌳. Lớp 6A trồng được:', '22 cây', ['20 cây', '24 cây', '5,5 cây']], ['Mỗi 📘 = 10 quyển. Muốn biểu diễn 35 quyển cần:', '3 📘 và nửa 📘', ['35 📘', '3 📘', '4 📘']]]
          },
          {
            id: 'g6b40', no: 40, title: 'Biểu đồ cột', topic: 'g6_stats',
            key: ['<b>Biểu đồ cột</b>: trục ngang ghi các đối tượng, trục đứng ghi số liệu (có chia thang); mỗi đối tượng là một cột, chiều cao cột biểu thị số liệu.', 'Vẽ biểu đồ cột: vẽ hai trục, chọn thang đo, vẽ các cột cách đều, cùng độ rộng; ghi tên biểu đồ, chú thích.', 'Đọc biểu đồ cột: xác định đối tượng có số liệu lớn nhất, nhỏ nhất; so sánh, tính tổng, hiệu.'],
            vis: { type: 'barchart', data: [{ label: 'Toán', value: 12 }, { label: 'Văn', value: 8 }, { label: 'Anh', value: 10 }] },
            cards: [['Trên biểu đồ cột, chiều cao cột biểu thị gì?', 'Số liệu của đối tượng đó.'], ['Cột cao nhất cho biết điều gì?', 'Đối tượng có số liệu lớn nhất.']],
            tf: [['Trong biểu đồ cột, các cột có độ rộng bằng nhau.', true], ['Cột thấp nhất ứng với số liệu lớn nhất.', false], ['Biểu đồ cột cần có thang chia trên trục đứng.', true]],
            mc: [['Trong biểu đồ cột, trục đứng thường biểu diễn:', 'Số liệu', ['Tên các đối tượng', 'Tên biểu đồ', 'Chú thích màu']]]
          },
          {
            id: 'g6b41', no: 41, title: 'Biểu đồ cột kép', topic: 'g6_stats',
            key: ['<b>Biểu đồ cột kép</b> dùng để so sánh <b>hai bộ dữ liệu</b> cùng loại: mỗi đối tượng có hai cột đặt cạnh nhau, hai màu khác nhau.', 'Chú thích cho biết mỗi màu ứng với bộ dữ liệu nào (vd. Nam – Nữ, Năm 2023 – Năm 2024).', 'Đọc biểu đồ cột kép: so sánh hai cột trong từng đối tượng và so sánh giữa các đối tượng.'],
            vis: { type: 'bar2', names: ['Nam', 'Nữ'], data: [{ label: '6A', a: 18, b: 20 }, { label: '6B', a: 22, b: 17 }, { label: '6C', a: 15, b: 19 }] },
            cards: [['Biểu đồ cột kép dùng để làm gì?', 'So sánh hai bộ dữ liệu cùng loại.'], ['Cần xem gì để biết cột nào là bộ dữ liệu nào?', 'Chú thích màu.']],
            tf: [['Biểu đồ cột kép biểu diễn hai bộ dữ liệu trên cùng một biểu đồ.', true], ['Trong biểu đồ cột kép, hai cột của cùng một đối tượng có cùng màu.', false, 'Hai cột khác màu để phân biệt hai bộ dữ liệu.'], ['Biểu đồ cột kép giúp so sánh nhanh hai bộ dữ liệu.', true]],
            mc: [['Để so sánh số học sinh nam và nữ của các lớp, nên dùng:', 'Biểu đồ cột kép', ['Biểu đồ tranh', 'Biểu đồ cột đơn', 'Bảng kiểm đếm']]]
          },
          {
            id: 'g6b42', no: 42, title: 'Kết quả có thể và sự kiện trong trò chơi, thí nghiệm', topic: 'g6_prob',
            key: ['Khi thực hiện một trò chơi, thí nghiệm, những gì có thể xảy ra gọi là các <b>kết quả có thể</b>. Tung đồng xu: 2 kết quả (sấp, ngửa); gieo xúc xắc: 6 kết quả.', '<b>Sự kiện</b> là điều có thể xảy ra hoặc không xảy ra tùy theo kết quả.', 'Sự kiện <b>chắc chắn</b> xảy ra; <b>không thể</b> xảy ra; <b>có thể</b> xảy ra.'],
            cards: [['Gieo xúc xắc có bao nhiêu kết quả có thể?', '6 kết quả: 1, 2, 3, 4, 5, 6 chấm.'], ['“Gieo được số chấm bằng 7” là sự kiện gì?', 'Không thể xảy ra.'], ['“Gieo được số chấm nhỏ hơn 7” là sự kiện gì?', 'Chắc chắn xảy ra.']],
            tf: [['Tung một đồng xu có 2 kết quả có thể.', true], ['“Gieo xúc xắc được mặt 6 chấm” là sự kiện không thể.', false, 'Là sự kiện có thể xảy ra.'], ['“Gieo xúc xắc được số chấm lớn hơn 0” là sự kiện chắc chắn.', true]],
            mc: [['Rút một thẻ trong hộp 5 thẻ đánh số 1 đến 5. Số kết quả có thể là:', '5', ['4', '6', '10']], ['Sự kiện “gieo xúc xắc được số chấm là số chẵn” là:', 'Có thể xảy ra', ['Chắc chắn xảy ra', 'Không thể xảy ra', 'Luôn xảy ra hai lần']]]
          },
          {
            id: 'g6b43', no: 43, title: 'Xác suất thực nghiệm', topic: 'g6_prob',
            key: ['Thực hiện lặp đi lặp lại một trò chơi, thí nghiệm n lần; sự kiện A xảy ra k lần.', `<b>Xác suất thực nghiệm</b> của sự kiện A là ${F('k', 'n')} = Số lần A xảy ra : Tổng số lần thực hiện.`, 'Xác suất thực nghiệm luôn nằm trong khoảng từ 0 đến 1; có thể viết dưới dạng phân số, số thập phân hoặc tỉ số phần trăm.', 'Dùng xác suất thực nghiệm để dự đoán khả năng xảy ra của sự kiện.'],
            f: [`P(A) = ${F('số lần A xảy ra', 'tổng số lần thực hiện')}`],
            cards: [['Tung đồng xu 50 lần, 22 lần ngửa. Xác suất thực nghiệm mặt ngửa?', `${F(22, 50)} = ${F(11, 25)}.`], ['Xác suất thực nghiệm có thể lớn hơn 1 không?', 'Không, luôn từ 0 đến 1.']],
            tf: [[`Gieo xúc xắc 40 lần, 8 lần ra mặt 6 chấm. Xác suất thực nghiệm mặt 6 chấm là ${F(1, 5)}.`, true], ['Xác suất thực nghiệm có thể bằng 1,5.', false], ['Tung đồng xu 20 lần, 9 lần ngửa thì xác suất thực nghiệm mặt sấp là 9/20.', false, 'Mặt sấp: 11 lần → 11/20.']],
            mc: [['Tung đồng xu 30 lần, 12 lần sấp. Xác suất thực nghiệm mặt ngửa là:', F(3, 5), [F(2, 5), F(12, 30), F(1, 2)]], ['Lấy bóng (có trả lại) 50 lần, 20 lần được bóng đỏ. Xác suất thực nghiệm lấy được bóng đỏ là:', '40%', ['20%', '60%', '2,5%']]]
          }
        ]
      }
    ],
    extra: {
      title: 'Hoạt động thực hành trải nghiệm',
      items: [
        ['💰', 'Kế hoạch chi tiêu cá nhân và gia đình', null, 'Lập bảng thu – chi, tính tỉ số phần trăm các khoản chi; dùng biểu đồ để trình bày.', 'g6_pct'],
        ['🏊', 'Hoạt động thể thao nào được yêu thích nhất trong hè?', null, 'Thu thập dữ liệu bằng phiếu hỏi, lập bảng thống kê, vẽ biểu đồ cột và rút ra nhận xét.', 'g6_stats'],
        ['🖥️', 'Vẽ hình đơn giản với phần mềm GeoGebra', null, 'Vẽ điểm, đường thẳng, tia, đoạn thẳng, trung điểm, góc và đo góc bằng phần mềm.', 'g6_angle']
      ]
    }
  });
})(window.MA);
