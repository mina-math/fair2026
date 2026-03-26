// ============================================================
// 목포여고 2026 교육과정 박람회 - Google Apps Script
// 이 코드를 Google Apps Script에 붙여넣고 웹 앱으로 배포하세요
// ============================================================

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // 구글 시트 ID로 교체

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (data.type === 'stamp') {
      writeStamp(ss, data);
    } else if (data.type === 'design') {
      writeDesign(ss, data);
    } else if (data.type === 'guestbook') {
      writeGuestbook(ss, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('박람회 서버 정상 작동 중')
    .setMimeType(ContentService.MimeType.TEXT);
}

// --- 스탬프/퀴즈 기록 ---
function writeStamp(ss, data) {
  let sheet = ss.getSheetByName('스탬프_퀴즈');
  if (!sheet) {
    sheet = ss.insertSheet('스탬프_퀴즈');
    sheet.appendRow(['시간', '학년', '반', '번호', '학생', '부스명', '부스ID', '퀴즈점수', '전체문항']);
    sheet.getRange(1,1,1,9).setFontWeight('bold').setBackground('#2DC7C0').setFontColor('white');
  }
  sheet.appendRow([
    new Date(data.ts), data.grade, data.cls, data.num, data.student,
    data.booth, data.boothId, data.score, data.total
  ]);
}

// --- 과목 설계 기록 ---
function writeDesign(ss, data) {
  let sheet = ss.getSheetByName('과목설계');
  if (!sheet) {
    sheet = ss.insertSheet('과목설계');
    sheet.appendRow(['시간', '학년', '반', '번호', '학생', '2학년_선택과목', '3학년_선택과목']);
    sheet.getRange(1,1,1,7).setFontWeight('bold').setBackground('#5B6AF0').setFontColor('white');
  }
  sheet.appendRow([
    new Date(data.ts), data.grade, data.cls, data.num, data.student,
    data.subjects_2, data.subjects_3
  ]);
}

// --- 방명록 기록 ---
function writeGuestbook(ss, data) {
  let sheet = ss.getSheetByName('방명록');
  if (!sheet) {
    sheet = ss.insertSheet('방명록');
    sheet.appendRow(['시간', '학년', '반', '번호', '학생', '기분', '소감']);
    sheet.getRange(1,1,1,7).setFontWeight('bold').setBackground('#FFB800').setFontColor('#333');
  }
  sheet.appendRow([
    new Date(data.ts), data.grade, data.cls, data.num, data.student,
    data.mood, data.text
  ]);
}
