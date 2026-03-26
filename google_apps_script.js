// ============================================================
// 목포여고 2026 교육과정 박람회 - Google Apps Script
// 이 코드를 Google Apps Script에 붙여넣고 웹 앱으로 배포하세요
// ============================================================

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // 구글 시트 ID로 교체

// 스프레드시트 인젝션 방지
function sanitizeForSheet(val) {
  if (typeof val !== 'string') return val;
  if (/^[=+\-@\t\r]/.test(val)) return "'" + val;
  return val.substring(0, 1000); // 길이 제한
}

// 입력 검증
function validateGrade(g) { return [1, 2].includes(Number(g)); }
function validateText(t, maxLen) { return typeof t === 'string' && t.length <= (maxLen || 1000); }

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // type 화이트리스트 검증
    const validTypes = ['stamp', 'design', 'guestbook', 'verify'];
    if (!validTypes.includes(data.type)) {
      return jsonResponse({ success: false, error: 'Invalid type' });
    }

    // grade 검증 (verify 제외)
    if (data.type !== 'verify' && data.grade && !validateGrade(data.grade)) {
      return jsonResponse({ success: false, error: 'Invalid grade' });
    }

    if (data.type === 'stamp') {
      writeStamp(ss, data);
    } else if (data.type === 'design') {
      writeDesign(ss, data);
    } else if (data.type === 'guestbook') {
      writeGuestbook(ss, data);
    } else if (data.type === 'verify') {
      writeVerification(ss, data);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: 'Server error' });
  }
}

function doGet(e) {
  const action = e?.parameter?.action;

  if (action === 'verify') {
    return handleVerifyLookup(e);
  }

  return ContentService
    .createTextOutput('박람회 서버 정상 작동 중')
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- 스탬프/퀴즈 기록 (익명) ---
function writeStamp(ss, data) {
  let sheet = ss.getSheetByName('스탬프_퀴즈');
  if (!sheet) {
    sheet = ss.insertSheet('스탬프_퀴즈');
    sheet.appendRow(['시간', 'UUID', '학년', '부스명', '부스ID', '퀴즈점수', '전체문항']);
    sheet.getRange(1,1,1,7).setFontWeight('bold').setBackground('#2DC7C0').setFontColor('white');
  }
  sheet.appendRow([
    new Date(data.ts),
    sanitizeForSheet(data.uuid),
    data.grade,
    sanitizeForSheet(data.booth),
    sanitizeForSheet(data.boothId),
    Number(data.score) || 0,
    Number(data.total) || 0
  ]);
}

// --- 과목 설계 기록 (익명) ---
function writeDesign(ss, data) {
  let sheet = ss.getSheetByName('과목설계');
  if (!sheet) {
    sheet = ss.insertSheet('과목설계');
    sheet.appendRow(['시간', 'UUID', '학년', '선택과목']);
    sheet.getRange(1,1,1,4).setFontWeight('bold').setBackground('#5B6AF0').setFontColor('white');
  }
  sheet.appendRow([
    new Date(data.ts),
    sanitizeForSheet(data.uuid),
    data.grade,
    sanitizeForSheet(data.subjects)
  ]);
}

// --- 방명록 기록 (익명) ---
function writeGuestbook(ss, data) {
  let sheet = ss.getSheetByName('방명록');
  if (!sheet) {
    sheet = ss.insertSheet('방명록');
    sheet.appendRow(['시간', 'UUID', '학년', '닉네임', '기분', '소감']);
    sheet.getRange(1,1,1,6).setFontWeight('bold').setBackground('#FFB800').setFontColor('#333');
  }
  if (!validateText(data.text, 500)) return;
  sheet.appendRow([
    new Date(data.ts),
    sanitizeForSheet(data.uuid),
    data.grade,
    sanitizeForSheet(data.nickname || '익명'),
    sanitizeForSheet(data.mood),
    sanitizeForSheet(data.text)
  ]);
}

// --- 참여 확인 기록 ---
function writeVerification(ss, data) {
  let sheet = ss.getSheetByName('참여확인');
  if (!sheet) {
    sheet = ss.insertSheet('참여확인');
    sheet.appendRow(['시간', 'UUID', '확인상태']);
    sheet.getRange(1,1,1,3).setFontWeight('bold').setBackground('#2ECC71').setFontColor('white');
  }
  sheet.appendRow([
    new Date(data.ts),
    sanitizeForSheet(data.uuid),
    '확인완료'
  ]);
}

// --- 참여 확인 조회 (doGet) ---
function handleVerifyLookup(e) {
  try {
    const uuid = e.parameter.uuid;
    if (!uuid) return jsonResponse({ success: false, error: 'UUID required' });

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const result = { success: true, grade: null, stamps: [], quizzes: [], hasDesign: false, hasGuestbook: false, verified: false };

    // 스탬프 시트 조회
    const stampSheet = ss.getSheetByName('스탬프_퀴즈');
    if (stampSheet) {
      const data = stampSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === uuid) {
          if (!result.grade) result.grade = data[i][2];
          result.stamps.push(data[i][3]); // 부스명
          result.quizzes.push({ booth: data[i][3], score: data[i][5], total: data[i][6] });
        }
      }
    }

    // 과목설계 시트 조회
    const designSheet = ss.getSheetByName('과목설계');
    if (designSheet) {
      const data = designSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === uuid) {
          result.hasDesign = true;
          if (!result.grade) result.grade = data[i][2];
          break;
        }
      }
    }

    // 방명록 시트 조회
    const gbSheet = ss.getSheetByName('방명록');
    if (gbSheet) {
      const data = gbSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === uuid) {
          result.hasGuestbook = true;
          if (!result.grade) result.grade = data[i][2];
          break;
        }
      }
    }

    // 확인 여부 조회
    const verifySheet = ss.getSheetByName('참여확인');
    if (verifySheet) {
      const data = verifySheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === uuid) {
          result.verified = true;
          result.verifiedAt = data[i][0] ? Utilities.formatDate(new Date(data[i][0]), 'Asia/Seoul', 'HH:mm') : '';
          break;
        }
      }
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: 'Lookup failed' });
  }
}
