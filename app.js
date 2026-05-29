// ============================================================
// UTILS
// ============================================================
function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0;
    return (c==='x' ? r : (r&0x3|0x8)).toString(16);
  });
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return hash.toString(16);
}

// ============================================================
// STATE
// ============================================================
let S = {
  student: null,
  googleUser: null, // { email, name, picture }
  role: null,       // 'admin' | 'teacher' | 'studentAdmin' | 'student'
  stamps: {},
  quizResults: {},
  subjects: { g2:{}, g3:{} },
  gbEntries: [],
  mood: '\u{1F60A}',
};

// ============================================================
// PHASE MANAGEMENT
// ============================================================
function getPhase() {
  const override = localStorage.getItem('mgh_phase_override');
  if (override === 'before' || override === 'during') return override;
  const today = new Date().toISOString().slice(0, 10);
  if (today < FAIR_DATE) return 'before';
  return 'during';
}

function allQuizzesDone() {
  return BOOTHS.filter(b => !b.noStamp).every(b => S.stamps[b.id]);
}

function setPhaseOverride(phase) {
  localStorage.setItem('mgh_phase_override', phase);
  if (S.student) { updateHome(); }
  toast('Phase가 "' + {before:'박람회 전',during:'당일'}[phase] + '"(으)로 변경되었습니다');
  renderPhaseAdmin();
}

function clearPhaseOverride() {
  localStorage.removeItem('mgh_phase_override');
  if (S.student) { updateHome(); }
  toast('자동 모드로 전환되었습니다 (날짜 기반)');
  renderPhaseAdmin();
}

const PHASE_LABELS = { before: '박람회 전', during: '박람회 당일' };

// ============================================================
// ROLE MANAGEMENT
// ============================================================
const ROLES_KEY = 'mgh_roles';

function loadRoles() {
  let roles = { teachers: [], studentAdmins: [] };
  try {
    const saved = localStorage.getItem(ROLES_KEY);
    if (saved) roles = JSON.parse(saved);
  } catch(e) {}
  // 기본 역할 병합
  DEFAULT_TEACHERS.forEach(e => {
    if (!roles.teachers.map(x=>x.toLowerCase()).includes(e.toLowerCase())) roles.teachers.push(e);
  });
  DEFAULT_STUDENT_ADMINS.forEach(e => {
    if (!roles.studentAdmins.map(x=>x.toLowerCase()).includes(e.toLowerCase())) roles.studentAdmins.push(e);
  });
  return roles;
}

function saveRoles(roles) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

function getUserRole(email) {
  if (!email) return 'student';
  const e = email.toLowerCase();
  if (SUPER_ADMIN_EMAILS.map(x=>x.toLowerCase()).includes(e)) return 'admin';
  const roles = loadRoles();
  if (roles.teachers.map(x=>x.toLowerCase()).includes(e)) return 'teacher';
  if (roles.studentAdmins.map(x=>x.toLowerCase()).includes(e)) return 'studentAdmin';
  return 'student';
}

function isAdminLike(role) {
  return role === 'admin' || role === 'studentAdmin';
}

// ============================================================
// GOOGLE AUTH
// ============================================================
function initGoogleAuth() {
  if (typeof google === 'undefined' || !google.accounts) {
    setTimeout(initGoogleAuth, 200);
    return;
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: true,
  });
  google.accounts.id.renderButton(
    document.getElementById('google-signin-btn'),
    { theme: 'outline', size: 'large', width: 300, text: 'signin_with', locale: 'ko' }
  );
}

function decodeJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
  return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join('')));
}

function handleGoogleCredential(response) {
  const payload = decodeJwt(response.credential);
  const user = {
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || '',
  };

  S.googleUser = user;
  S.role = getUserRole(user.email);
  save();

  if (S.role === 'admin') {
    enterAdminMode();
  } else {
    showRoleSelect(user);
  }
}

function showRoleSelect(user) {
  document.getElementById('login-step-google').style.display = 'none';
  document.getElementById('login-step-role').style.display = '';
  document.getElementById('role-greeting').textContent = `👋 ${user.name}님, 환영합니다!`;
  document.getElementById('role-user-info').textContent = user.email;
}

function selectRole(role) {
  if (role === 'student') {
    showStudentForm(S.googleUser);
  } else {
    document.getElementById('login-step-role').style.display = 'none';
    document.getElementById('login-step-teacher').style.display = '';
  }
}

function backToRoleSelect() {
  document.getElementById('login-step-teacher').style.display = 'none';
  document.getElementById('login-step-role').style.display = '';
  document.getElementById('input-teacher-code').value = '';
}

const TEACHER_CODE = 'MOKPO2026';

function doTeacherLogin() {
  const code = document.getElementById('input-teacher-code').value.trim();
  if (!code) { toast('교사 코드를 입력하세요'); return; }
  const storedHash = localStorage.getItem(ADMIN_PW_KEY);
  const codeHash = simpleHash(code);
  if ((storedHash && codeHash === storedHash) || (!storedHash && code === TEACHER_CODE)) {
    S.role = 'teacher';
    S.student = { grade:0, cls:0, num:0, uuid:'teacher_' + S.googleUser.email, nickname: S.googleUser.name, label: S.googleUser.name + ' (교사)', isTeacher: true };
    S.stamps = {}; S.quizResults = {};
    S.subjects = { g2:{}, g3:{} };
    save();
    goTo('screen-home');
    updateHome();
  } else {
    toast('교사 코드가 맞지 않아요 🔒');
  }
}

function showStudentForm(user) {
  document.getElementById('login-step-google').style.display = 'none';
  document.getElementById('login-step-role').style.display = 'none';
  document.getElementById('login-step-student').style.display = '';
  document.getElementById('login-greeting').textContent = `👋 ${user.name}님, 환영합니다!`;
  document.getElementById('login-user-info').textContent = user.email;
}

function enterAdminMode() {
  document.getElementById('admin-user-name').textContent = S.googleUser.name;
  document.getElementById('admin-user-email').textContent = S.googleUser.email;
  const pic = document.getElementById('admin-user-pic');
  if (S.googleUser.picture) { pic.src = S.googleUser.picture; pic.style.display = ''; }
  else pic.style.display = 'none';

  const badge = document.getElementById('admin-role-badge');
  badge.textContent = S.role === 'admin' ? '관리자' : S.role === 'teacher' ? '교사' : '학생관리자';

  if (S.role === 'admin') {
    document.getElementById('admin-role-section').style.display = '';
    document.getElementById('admin-student-preview-section').style.display = '';
    renderRoleList();
  } else {
    document.getElementById('admin-role-section').style.display = 'none';
    document.getElementById('admin-student-preview-section').style.display = 'none';
  }

  renderPhaseAdmin();
  goTo('screen-admin');
}

function resetLoginSteps() {
  document.getElementById('login-step-google').style.display = '';
  document.getElementById('login-step-role').style.display = 'none';
  document.getElementById('login-step-teacher').style.display = 'none';
  document.getElementById('login-step-student').style.display = 'none';
  const codeInput = document.getElementById('input-teacher-code');
  if (codeInput) codeInput.value = '';
}

function googleLogout() {
  S.googleUser = null;
  S.role = null;
  localStorage.removeItem('mgh_fair26');
  resetLoginSteps();
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }
}

function backToRoleSelectFromStudent() {
  document.getElementById('login-step-student').style.display = 'none';
  document.getElementById('login-step-role').style.display = '';
}

function migrateSubjects(subj) {
  if (!subj || typeof subj !== 'object') return { g2:{}, g3:{} };
  return {
    g2: Array.isArray(subj.g2) ? {} : (subj.g2 || {}),
    g3: Array.isArray(subj.g3) ? {} : (subj.g3 || {}),
  };
}

let qState = { boothId: null, qIdx: 0, answers: [], answered: false };
let qrBoothId = null;

// ============================================================
// INIT
// ============================================================
function init() {
  try {
    cleanExpiredSessions();

    const global = localStorage.getItem('mgh_fair26_global');
    if (global) { const p = JSON.parse(global); S.gbEntries = p.gbEntries || []; }

    const saved = localStorage.getItem('mgh_fair26');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.googleUser) { S.googleUser = p.googleUser; S.role = p.role || getUserRole(p.googleUser.email); }
      if (p.student && p.student.uuid) {
        S.student = p.student;
        const sk = `mgh_session_${p.student.uuid}`;
        const sd = localStorage.getItem(sk);
        if (sd) {
          const d = JSON.parse(sd);
          if (d.expiry && Date.now() > d.expiry) {
            localStorage.removeItem(sk);
          } else if (d.data) {
            S.stamps = d.data.stamps || {};
            S.quizResults = d.data.quizResults || {};
            S.subjects = migrateSubjects(d.data.subjects);
          }
        }
      }
    }
  } catch(e) { console.error('[MoFair] Init error:', e); }

  initGoogleAuth();
  renderInfoTabs();
  renderDesignGroups();
  renderBoothList();

  if (S.student && S.googleUser) { goTo('screen-home'); updateHome(); }

  const params = new URLSearchParams(location.search);
  const bId = params.get('booth');
  if (bId && S.student) {
    qrBoothId = bId;
    if (!S.stamps[bId]) { goTo('screen-quiz'); startQuiz(bId); }
    else { goTo('screen-home'); toast(BOOTHS.find(b=>b.id===bId)?.name + ' \uD034\uC988 \uC774\uBBF8 \uC644\uB8CC! \u2705'); }
  }
}

function cleanExpiredSessions() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mgh_session_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.expiry && Date.now() > d.expiry) localStorage.removeItem(key);
        }
      }
    }
  } catch(e) {}
}

function sessionKey() {
  if (!S.student?.uuid) return null;
  return `mgh_session_${S.student.uuid}`;
}

function save() {
  if (S.student?.uuid) {
    const sd = {
      data: { stamps: S.stamps, quizResults: S.quizResults, subjects: S.subjects, uuid: S.student.uuid },
      expiry: Date.now() + 24 * 60 * 60 * 1000
    };
    localStorage.setItem(sessionKey(), JSON.stringify(sd));
  }
  localStorage.setItem('mgh_fair26_global', JSON.stringify({ gbEntries: S.gbEntries }));
  localStorage.setItem('mgh_fair26', JSON.stringify({ student: S.student, googleUser: S.googleUser, role: S.role }));
}

// ============================================================
// NAVIGATION
// ============================================================
function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-home') updateHome();
  if (id === 'screen-booths') { renderBoothList(); renderPhaseNav('booths-nav', 'screen-booths'); }
  if (id === 'screen-info') renderPhaseNav('info-nav', 'screen-info');
  if (id === 'screen-design') { renderDesignGroups(); renderPhaseNav('design-nav', 'screen-design'); }
  if (id === 'screen-forms') { renderFormsContent(); renderPhaseNav('forms-nav', 'screen-forms'); }
  if (id === 'screen-curriculum') renderCurriculum();
  if (id === 'screen-login') resetLoginSteps();
}

// ============================================================
// LOGIN
// ============================================================
let selGrade = 0;
function selectGrade(g) {
  selGrade = g;
  document.getElementById('grade1-btn').classList.toggle('selected', g===1);
  document.getElementById('grade2-btn').classList.toggle('selected', g===2);
}

function doLogin() {
  if (!S.googleUser) { toast('Google \uB85C\uADF8\uC778\uC744 \uBA3C\uC800 \uD574\uC8FC\uC138\uC694'); return; }
  if (!selGrade) { toast('\uD559\uB144\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694'); return; }

  const cls = document.getElementById('input-class').value;
  const num = document.getElementById('input-number').value;
  const nickname = document.getElementById('input-nickname').value.trim() || S.googleUser.name || '\uC775\uBA85';

  if (!cls || cls<1 || cls>12) { toast('\uBC18\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694 (1~12)'); return; }
  if (!num || num<1 || num>40) { toast('\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694 (1~40)'); return; }

  const clsVal = +cls;
  const numVal = +num;

  // 같은 학년/반/번호 → 같은 UUID로 데이터 복원
  let uuid;
  const studentKey = `mgh_student_${selGrade}_${clsVal}_${numVal}`;
  const existingData = localStorage.getItem(studentKey);
  if (existingData) {
    try { const d = JSON.parse(existingData); uuid = d.uuid || generateUUID(); }
    catch(e) { uuid = generateUUID(); }
  } else { uuid = generateUUID(); }

  // 학번 → UUID 매핑 저장 (재입장 시 복원용)
  localStorage.setItem(studentKey, JSON.stringify({ uuid }));

  const label = `${selGrade}\uD559\uB144 ${clsVal}\uBC18 ${numVal}\uBC88`;
  S.student = { grade:selGrade, cls:clsVal, num:numVal, uuid, nickname, label };

  const sk = `mgh_session_${uuid}`;
  const sd = localStorage.getItem(sk);
  if (sd) {
    try {
      const d = JSON.parse(sd);
      if (d.data) {
        if (d.expiry && Date.now() > d.expiry) {
          localStorage.removeItem(sk);
          S.stamps = {}; S.quizResults = {}; S.subjects = {g2:{},g3:{}};
        } else {
          S.stamps = d.data.stamps || {};
          S.quizResults = d.data.quizResults || {};
          S.subjects = migrateSubjects(d.data.subjects);
          const cnt = Object.keys(S.stamps).length;
          if (cnt > 0) setTimeout(()=>toast(`\uC774\uC804 \uAE30\uB85D\uC744 \uBD88\uB7EC\uC654\uC5B4\uC694! \uD034\uC988 ${cnt}\uAC1C \uC644\uB8CC \u2705`), 400);
        }
      }
    } catch(e) { S.stamps={}; S.quizResults={}; S.subjects={g2:{},g3:{}}; }
  } else {
    S.stamps = {}; S.quizResults = {}; S.subjects = { g2:{}, g3:{} };
  }

  save();
  goTo('screen-home');
  updateHome();
}

// ============================================================
// HOME
// ============================================================
function updateHome() {
  if (!S.student) return;
  const phase = getPhase();
  document.getElementById('home-name').textContent = S.student.label;
  const adminBtn = document.getElementById('home-admin-btn');
  if (adminBtn) adminBtn.style.display = (isAdminLike(S.role) && !studentPreviewMode) ? '' : 'none';

  // phase badge
  const phaseBadge = document.getElementById('home-phase-badge');
  if (phaseBadge) {
    phaseBadge.textContent = PHASE_LABELS[phase];
    phaseBadge.className = 'phase-badge phase-' + phase;
  }

  // progress bar — only visible during phase
  const progressWrap = document.getElementById('home-progress-wrap');
  if (progressWrap) progressWrap.style.display = phase === 'during' ? '' : 'none';

  if (phase === 'during') {
    const earned = BOOTHS.filter(b=>!b.noStamp && S.stamps[b.id]).length;
    const total = BOOTHS.filter(b=>!b.noStamp).length;
    document.getElementById('progress-text').textContent = `퀴즈 참여 ${earned} / ${total}`;
    document.getElementById('progress-fill').style.width = Math.round(earned/total*100)+'%';
    const boothBadge = document.getElementById('booth-badge');
    if (boothBadge) boothBadge.textContent = `${earned}/${total}`;
  }

  renderHomeBody(phase);
  renderHomeNav(phase);
  if (phase === 'during') renderHomeStamps();
  updateChatFab();
}

function renderHomeStamps() {
  const g = document.getElementById('home-stamp-grid'); if (!g) return;
  const booths = BOOTHS.filter(b=>!b.noStamp);
  g.innerHTML = booths.map(b => {
    const earned = S.stamps[b.id];
    return `<div class="stamp-item">
      <div class="stamp-circle ${earned?'earned':''}" style="${earned?`border-color:${b.color};background:${b.bg};color:${b.color};`:''}">
        ${earned ? b.icon : '\u25CB'}
      </div>
      <div class="stamp-label">${b.name.replace('\uAD50\uACFC','').replace('\uC0C1\uB2F4','').trim()}</div>
    </div>`;
  }).join('');
}

// ============================================================
// BOOTHS
// ============================================================
function renderBoothList() {
  const el = document.getElementById('booth-list'); if (!el) return;
  el.innerHTML = BOOTHS.map(b => `
    <div class="booth-card ${S.stamps[b.id]?'completed':''}" onclick="${b.noStamp?'':'openQR(\''+b.id+'\')'}">
      <div class="booth-icon-wrap" style="background:${b.bg}">${b.icon}</div>
      <div class="booth-info">
        <div class="booth-name">${b.name}</div>
        <div class="booth-desc">${b.desc}</div>
        ${S.quizResults[b.id] ? `<div class="booth-quiz-score">\uD034\uC988: ${S.quizResults[b.id].score}/${S.quizResults[b.id].total}\uC810 \u2705</div>` : ''}
      </div>
      <div class="booth-status-icon">${b.noStamp?'\u2139\uFE0F':(S.stamps[b.id]?'\u2705':'\u25CB')}</div>
    </div>`
  ).join('');
}

function openQR(id) {
  if (S.stamps[id]) { toast(BOOTHS.find(b=>b.id===id).name + ' \uD034\uC988 \uC774\uBBF8 \uC644\uB8CC\uD588\uC5B4\uC694! \u2705'); return; }
  qrBoothId = id;
  document.getElementById('qr-title').textContent = BOOTHS.find(b=>b.id===id).name;
  document.getElementById('qr-input').value = '';
  goTo('screen-qr');
}

function verifyCode() {
  const code = document.getElementById('qr-input').value.trim().toUpperCase();
  const booth = BOOTHS.find(b=>b.id===qrBoothId);
  if (!booth) return;
  if (code === booth.code) {
    goTo('screen-quiz');
    startQuiz(qrBoothId);
  } else {
    const inp = document.getElementById('qr-input');
    inp.style.borderColor = 'var(--danger)';
    toast('\uCF54\uB4DC\uAC00 \uB9DE\uC9C0 \uC54A\uC544\uC694. \uBD80\uC2A4 \uC120\uC0DD\uB2D8\uAED8 \uD655\uC778\uD558\uC138\uC694!');
    setTimeout(()=>{ inp.style.borderColor=''; }, 2000);
  }
}

function startCamera() {
  toast('\uBD80\uC2A4\uC5D0 \uC788\uB294 QR \uCF54\uB4DC\uB97C \uC2A4\uCE94\uD558\uAC70\uB098 \uCF54\uB4DC\uB97C \uC9C1\uC811 \uC785\uB825\uD558\uC138\uC694');
}

// ============================================================
// QUIZ
// ============================================================
function startQuiz(id) {
  const quiz = QUIZZES[id];
  if (!quiz) { toast('\uC774 \uBD80\uC2A4\uB294 \uD034\uC988\uAC00 \uC5C6\uC5B4\uC694'); return; }
  const booth = BOOTHS.find(b=>b.id===id);
  qState = { boothId:id, qIdx:0, answers:[], answered:false };
  document.getElementById('quiz-header').textContent = booth.name + ' \uD034\uC988';
  renderQ();
}

function renderQ() {
  const {boothId, qIdx} = qState;
  const quiz = QUIZZES[boothId];
  const booth = BOOTHS.find(b=>b.id===boothId);
  const q = quiz.questions[qIdx];
  const total = quiz.questions.length;
  qState.answered = false;

  document.getElementById('quiz-wrap').innerHTML = `
    <div class="quiz-body">
      <div class="quiz-booth-tag" style="background:${booth.bg};color:${booth.color}">${booth.icon} ${booth.name}</div>
      <div class="quiz-progress-row">
        <span class="quiz-progress-text">\uBB38\uC81C ${qIdx+1} / ${total}</span>
      </div>
      <div class="quiz-bar"><div class="quiz-bar-fill" style="width:${(qIdx+1)/total*100}%"></div></div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((o,i)=>`
          <button class="quiz-opt" id="qo${i}" onclick="pickOpt(${i})">
            <div class="opt-num">${['\u2460','\u2461','\u2462','\u2463'][i]}</div>
            <div>${o}</div>
          </button>`).join('')}
      </div>
    </div>
    <div class="quiz-action">
      <button class="btn btn-primary" id="quiz-next" onclick="nextQ()" disabled style="opacity:.45">
        ${qIdx < total-1 ? '\uB2E4\uC74C \uBB38\uC81C \u2192' : '\uACB0\uACFC \uBCF4\uAE30 \uD83C\uDFAF'}
      </button>
    </div>`;
}

function pickOpt(i) {
  if (qState.answered) return;
  qState.answered = true;
  const {boothId, qIdx} = qState;
  const ans = QUIZZES[boothId].questions[qIdx].ans;
  qState.answers.push({sel:i, ok:i===ans});

  document.querySelectorAll('.quiz-opt').forEach((el,j)=>{
    if (j===ans) el.classList.add('correct');
    else if (j===i && i!==ans) el.classList.add('wrong');
    else el.classList.add('dimmed');
  });

  const nb = document.getElementById('quiz-next');
  nb.disabled = false; nb.style.opacity = '1';
  toast(i===ans ? '\u2705 \uC815\uB2F5\uC774\uC5D0\uC694!' : `\u274C \uC815\uB2F5\uC740 "${QUIZZES[boothId].questions[qIdx].opts[ans]}"\uC774\uC5D0\uC694`);
}

function nextQ() {
  qState.qIdx++;
  if (qState.qIdx >= QUIZZES[qState.boothId].questions.length) showResult();
  else renderQ();
}

function showResult() {
  const {boothId, answers} = qState;
  const booth = BOOTHS.find(b=>b.id===boothId);
  const total = answers.length;
  const score = answers.filter(a=>a.ok).length;
  const pct = Math.round(score/total*100);

  S.quizResults[boothId] = {score, total};
  S.stamps[boothId] = true;
  save(); updateHome();

  const emoji = pct===100?'\uD83C\uDFC6':pct>=67?'\uD83C\uDF1F':'\uD83D\uDCDA';
  const msg = pct===100?'\uC644\uBCBD! \uBAA8\uB450 \uB9DE\uD600\uC5B4\uC694!':pct>=67?'\uD6CC\uB96D\uD574\uC694! \uAC70\uC758 \uB2E4 \uB9DE\uD600\uC5B4\uC694!':'\uC870\uAE08 \uB354 \uACF5\uBD80\uD574\uBD10\uC694!';

  const allDone = allQuizzesDone();
  document.getElementById('quiz-wrap').innerHTML = `
    <div class="quiz-result-wrap">
      <span class="result-big-emoji">${emoji}</span>
      <div class="result-title">${booth.name} \uD034\uC988 \uC644\uB8CC!</div>
      <div class="result-score">${score}/${total}</div>
      <div class="result-msg">${msg}</div>
      <div class="stamp-earned-box">
        <span class="stamp-earned-icon">${booth.icon}</span>
        <div class="stamp-earned-text">${booth.name} \uD034\uC988 \uC644\uB8CC! \uD83C\uDF89</div>
      </div>
      ${allDone ? `
      <div style="background:linear-gradient(135deg, #2ECC71, #27AE60); border-radius:16px; padding:16px; margin-bottom:14px; color:white; text-align:center;">
        <div style="font-size:24px; margin-bottom:4px;">\uD83C\uDF8A</div>
        <div style="font-size:15px; font-weight:700;">\uCD95\uD558\uD574\uC694! \uBAA8\uB4E0 \uD034\uC988\uB97C \uC644\uB8CC\uD588\uC5B4\uC694!</div>
        <div style="font-size:13px; opacity:0.9; margin-top:4px;">\uD648 \uD654\uBA74\uC5D0\uC11C \uC18C\uAC10\uBB38\uACFC \uB9CC\uC871\uB3C4 \uC124\uBB38\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694</div>
      </div>` : ''}
      <button class="btn btn-primary" style="margin-bottom:10px" onclick="goTo('screen-booths')">\uB2E4\uB978 \uBD80\uC2A4 \uBC29\uBB38\uD558\uAE30</button>
      <button class="btn btn-outline" onclick="goTo('screen-home')">\uD648\uC73C\uB85C</button>
    </div>`;
}

function exitQuiz() { goTo('screen-booths'); }

// ============================================================
// COURSE INFO
// ============================================================
function renderInfoTabs() {
  const bar = document.getElementById('info-tab-bar');
  const panels = document.getElementById('info-panels');
  if (!bar || !panels) return;
  bar.innerHTML = INFO_TABS.map((t,i)=>`<button class="info-tab ${i===0?'active':''}" onclick="switchInfoTab(${i})">${t}</button>`).join('');
  panels.innerHTML = INFO_HTML.map((h,i)=>`<div class="info-panel ${i===0?'active':''}" id="ipanel-${i}">${h}</div>`).join('');
}
function switchInfoTab(i) {
  document.querySelectorAll('.info-tab').forEach((t,j)=>t.classList.toggle('active',j===i));
  document.querySelectorAll('.info-panel').forEach((p,j)=>p.classList.toggle('active',j===i));
}

// ============================================================
// COURSE DESIGN
// ============================================================
function renderDesignGroups() {
  const el = document.getElementById('design-cats'); if (!el) return;
  const grade = S.student ? S.student.grade : -1;
  const isTeacher = S.student?.isTeacher;

  if (grade === -1) {
    document.getElementById('design-hint').textContent = '\uD83D\uDCCC \uB85C\uADF8\uC778 \uD6C4 \uB0B4 \uD559\uB144\uC5D0 \uB9DE\uB294 \uACFC\uBAA9\uC774 \uD45C\uC2DC\uB3FC\uC694';
    el.innerHTML = '<div class="empty-msg" style="padding:24px;text-align:center;">\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4 \uD83D\uDD12</div>';
    updateSummary(); return;
  }

  if (isTeacher) {
    const activeTab = el.dataset.designTab || '1';
    document.getElementById('design-hint').textContent = activeTab === '1'
      ? '\uD83D\uDCCC \uAD50\uC0AC \uBAA8\uB4DC \u2014 \uD604 1\uD559\uB144 \u2192 \uB0B4\uB144(2\uD559\uB144) \uC120\uD0DD\uACFC\uBAA9'
      : '\uD83D\uDCCC \uAD50\uC0AC \uBAA8\uB4DC \u2014 \uD604 2\uD559\uB144 \u2192 \uB0B4\uB144(3\uD559\uB144) \uC120\uD0DD\uACFC\uBAA9';
    let html = `
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button onclick="switchDesignTab('1')" style="flex:1; padding:10px; border-radius:10px; font-size:14px; font-weight:700; border:none; cursor:pointer;
          ${activeTab === '1' ? 'background:var(--primary); color:white;' : 'background:#f0f0f0; color:var(--text);'}">
          1\uD559\uB144 (2\uD559\uB144 \uD3B8\uC81C)
        </button>
        <button onclick="switchDesignTab('2')" style="flex:1; padding:10px; border-radius:10px; font-size:14px; font-weight:700; border:none; cursor:pointer;
          ${activeTab === '2' ? 'background:var(--primary); color:white;' : 'background:#f0f0f0; color:var(--text);'}">
          2\uD559\uB144 (3\uD559\uB144 \uD3B8\uC81C)
        </button>
      </div>`;
    html += activeTab === '1' ? renderDesignTable('g2', SUBJECTS_G2) : renderDesignTable('g3', SUBJECTS_G3);
    el.innerHTML = html;
    updateSummary(); return;
  }

  const isG1 = grade === 1;
  const gradeKey = isG1 ? 'g2' : 'g3';
  const semData  = isG1 ? SUBJECTS_G2 : SUBJECTS_G3;

  document.getElementById('design-hint').textContent = isG1
    ? '\uD83D\uDCCC \uD604 1\uD559\uB144 \u2014 \uB0B4\uB144(2\uD559\uB144) \uC120\uD0DD\uACFC\uBAA9 (2026\uC785\uD559 \uD3B8\uC81C\uD45C \uAE30\uC900)'
    : '\uD83D\uDCCC \uD604 2\uD559\uB144 \u2014 \uB0B4\uB144(3\uD559\uB144) \uC120\uD0DD\uACFC\uBAA9 (2025\uC785\uD559 \uD3B8\uC81C\uD45C \uAE30\uC900)';

  if (!S.subjects[gradeKey] || typeof S.subjects[gradeKey] !== 'object' || Array.isArray(S.subjects[gradeKey])) {
    S.subjects[gradeKey] = {};
  }

  el.innerHTML = renderDesignTable(gradeKey, semData);
  updateSummary();
}

function renderDesignTable(gradeKey, semData) {
  if (!S.subjects[gradeKey] || typeof S.subjects[gradeKey] !== 'object' || Array.isArray(S.subjects[gradeKey])) {
    S.subjects[gradeKey] = {};
  }
  let html = '';
  semData.forEach(semObj => {
    html += `<div class="sem-section-title">${semObj.sem}</div>`;
    html += '<table class="curriculum-table design-table"><thead><tr><th>\uAD50\uACFC</th><th>\uACFC\uBAA9\uBA85</th><th>\uC720\uD615</th><th>\uD559\uC810</th><th>\uC120\uD0DD\uADF8\uB8F9</th></tr></thead><tbody>';
    semObj.groups.forEach(grp => {
      const sel = S.subjects[gradeKey][grp.id] || [];
      const cnt = sel.length;
      const full = cnt >= grp.pick;
      const groupCls = cnt === grp.pick ? 'ct-group-full' : cnt > grp.pick ? 'ct-group-over' : '';
      const perCredit = grp.credits / grp.pick;
      grp.items.forEach((s, idx) => {
        const isSel = sel.includes(s.n);
        const disabled = !isSel && full;
        const rowCls = (isSel ? 'dt-selected' : '') + (disabled && !isSel ? ' dt-disabled' : '');
        const click = ` onclick="selectInGroup('${gradeKey}','${grp.id}','${s.n.replace(/'/g,"\\'")}',this)"`;
        const typeLabel = s.t === 'general' ? '\uC77C\uBC18' : s.t === 'career' ? '\uC9C4\uB85C' : '\uC735\uD569';
        html += `<tr class="${rowCls}"${click}>`;
        html += `<td>${s.subj}</td><td>${s.n}</td><td class="ct-${s.t}">${typeLabel}</td><td>${perCredit}</td>`;
        if (idx === 0) {
          html += `<td rowspan="${grp.items.length}" class="ct-group ${groupCls}">[${cnt}/${grp.pick}]<br><b>${grp.credits}\uD559\uC810</b></td>`;
        }
        html += '</tr>';
      });
    });
    html += '</tbody></table>';
  });
  return html;
}

function selectInGroup(gradeKey, groupId, name, el) {
  if (!S.subjects[gradeKey]) S.subjects[gradeKey] = {};
  const arr = S.subjects[gradeKey][groupId] || [];
  const semData = gradeKey === 'g2' ? SUBJECTS_G2 : SUBJECTS_G3;
  let pickLimit = 1;
  for (const sem of semData) {
    const grp = sem.groups.find(g => g.id === groupId);
    if (grp) { pickLimit = grp.pick; break; }
  }

  const idx = arr.indexOf(name);
  if (idx !== -1) { arr.splice(idx, 1); }
  else {
    if (arr.length >= pickLimit) { toast(`\uC774 \uC601\uC5ED\uC740 \uCD5C\uB300 ${pickLimit}\uACFC\uBAA9\uB9CC \uC120\uD0DD\uD560 \uC218 \uC788\uC5B4\uC694 \u270B`); return; }
    arr.push(name);
  }
  S.subjects[gradeKey][groupId] = arr;
  save();
  renderDesignGroups();
}

function updateSummary() {
  const grade = S.student ? S.student.grade : 0;
  const isTeacher = S.student?.isTeacher;
  const el = document.getElementById('selected-chips'); if (!el) return;

  if (isTeacher) {
    el.innerHTML = '<div class="empty-msg" style="padding:12px;text-align:center;font-size:13px;color:var(--text-light);">\uD83D\uDC69\u200D\uD83C\uDFEB \uAD50\uC0AC \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uC5F4\uB78C \uC804\uC6A9\uC785\uB2C8\uB2E4</div>';
    return;
  }

  const gradeKey = grade === 1 ? 'g2' : 'g3';
  const semData  = grade === 1 ? SUBJECTS_G2 : grade === 2 ? SUBJECTS_G3 : null;

  if (!semData || !S.subjects[gradeKey]) {
    el.innerHTML = '<div class="empty-msg">\uACFC\uBAA9\uC744 \uC120\uD0DD\uD558\uBA74 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB3FC\uC694</div>';
    return;
  }

  let totalCredits = 0, totalNeedCredits = 0;
  let semBlocks = '';

  semData.forEach(sem => {
    let semCredits = 0, semNeedCredits = 0;
    let groupRows = '';

    sem.groups.forEach(grp => {
      const sel = S.subjects[gradeKey][grp.id] || [];
      const perCredit = grp.credits / grp.pick;
      semCredits += sel.length * perCredit;
      semNeedCredits += grp.credits;

      const names = sel.length ? sel.map(n => `<span class="selected-chip">${n}</span>`).join('') : '<span style="font-size:12px;color:var(--text-light);">\uBBF8\uC120\uD0DD</span>';
      groupRows += `<div class="dt-summary-row" style="flex-direction:column;align-items:flex-start;gap:4px;">
        <span class="dt-summary-label">${grp.label} <span style="font-size:11px;">[\uD0DD${grp.pick}] ${grp.credits}\uD559\uC810</span></span>
        <div style="display:flex;flex-wrap:wrap;gap:5px;">${names}</div>
      </div>`;
    });

    totalCredits += semCredits;
    totalNeedCredits += semNeedCredits;

    semBlocks += `<div style="margin-bottom:12px;">
      <div style="font-size:13px;font-weight:700;color:var(--primary-dark);margin-bottom:6px;">${sem.sem}</div>
      ${groupRows}
      <div style="text-align:right;font-size:12px;font-weight:600;color:${semCredits===semNeedCredits?'#1e8449':'var(--text-light)'};margin-top:4px;">${semCredits}/${semNeedCredits}\uD559\uC810</div>
    </div>`;
  });

  const allDone = totalCredits === totalNeedCredits;
  el.innerHTML = `<div class="dt-summary">
    <div class="dt-summary-title">\uD83D\uDCCB \uB098\uC758 \uC120\uD0DD \uD604\uD669</div>
    ${semBlocks}
    <div class="dt-total"><span>\uCD1D \uD559\uC810</span><span style="color:${allDone ? '#1e8449' : '#c0392b'}">${totalCredits} / ${totalNeedCredits}\uD559\uC810</span></div>
  </div>`;
}

function saveDesign() {
  const grade = S.student ? S.student.grade : 0;
  const gradeKey = grade === 1 ? 'g2' : 'g3';
  const semData  = grade === 1 ? SUBJECTS_G2 : SUBJECTS_G3;
  if (!semData) { toast('\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD574\uC694'); return; }

  const allSelected = [];
  semData.forEach(sem => {
    sem.groups.forEach(grp => {
      const sel = S.subjects[gradeKey][grp.id] || [];
      sel.forEach(n => allSelected.push(n));
    });
  });
  if (!allSelected.length) { toast('\uC120\uD0DD\uD55C \uACFC\uBAA9\uC774 \uC5C6\uC5B4\uC694'); return; }

  save();
  toast('\uACFC\uBAA9 \uC124\uACC4 \uC800\uC7A5 \uC644\uB8CC! \uCEA1\uCC98\uD574\uC11C \uBCF4\uAD00\uD558\uC138\uC694 \uD83D\uDCF8');
}

// ============================================================
// PHASE-BASED HOME RENDERING
// ============================================================
function renderHomeBody(phase) {
  const el = document.getElementById('home-body-content');
  if (!el) return;

  const scheduleHtml = SCHEDULE_ITEMS.map((s, i) => `
    <div style="display:flex; align-items:center; gap:12px; padding:12px 0; ${i < SCHEDULE_ITEMS.length-1 ? 'border-bottom:1px solid var(--border);' : ''}">
      <div style="width:36px; height:36px; border-radius:50%; background:${['#1565C0','#C62828','#D4A843'][i]}; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0;">${i+1}</div>
      <div style="flex:1;">
        <div style="font-size:14px; font-weight:700; color:var(--text);">${s.label}</div>
        <div style="font-size:12px; color:var(--text-light); margin-top:2px;">${s.desc}</div>
      </div>
      <div style="font-size:13px; font-weight:600; color:${s.date === '일정 미정' ? 'var(--text-light)' : 'var(--primary)'}; white-space:nowrap;">${s.date}</div>
    </div>`).join('');

  if (phase === 'before') {
    el.innerHTML = `
      <!-- 1. 과목선택 일정 -->
      <div style="background:white; border-radius:16px; padding:16px; margin-bottom:14px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <div style="font-size:15px; font-weight:700; margin-bottom:10px;">📅 과목선택 일정</div>
        ${scheduleHtml}
      </div>

      <!-- 2. 과목선택 가이드북 (책/웹) -->
      <div style="background:white; border-radius:16px; padding:16px; margin-bottom:14px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <div style="font-size:15px; font-weight:700; margin-bottom:4px;">📗 과목선택 가이드북</div>
        <div style="font-size:12px; color:var(--text-light); margin-bottom:12px;">2022 개정교육과정과 교과목, 대학 및 학과 정보를 알아보세요.</div>
        <div style="display:flex; gap:10px;">
          <a href="2022 개정 교육과정 고등학교 과목선택 안내서(개정판).pdf" download style="flex:1; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg, #1565C0, #0D47A1); color:white; border-radius:12px; padding:14px 10px; font-size:14px; font-weight:700; box-shadow:0 3px 10px rgba(21,101,192,0.3);">
            📄 책으로 보기
          </a>
          <div onclick="openCurriculumNav()" style="flex:1; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg, #C62828, #B71C1C); color:white; border-radius:12px; padding:14px 10px; font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 3px 10px rgba(198,40,40,0.3);">
            🧭 웹으로 보기
          </div>
        </div>
      </div>

      <!-- 3. 편제표 -->
      <div onclick="goTo('screen-curriculum')" style="background:linear-gradient(135deg, #1565C0, #0D47A1); border-radius:16px; padding:18px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(21,101,192,0.3);">
        <span style="font-size:36px;">📊</span>
        <div>
          <div style="font-size:15px; font-weight:700;">우리학교 편제표</div>
          <div style="font-size:12px; opacity:0.85; margin-top:2px;">내년, 내후년에 어떤 과목을 배우는지 확인하세요</div>
        </div>
        <div style="margin-left:auto; font-size:20px;">›</div>
      </div>

      <!-- 4. 과목 설계 -->
      <div onclick="goTo('screen-design')" style="background:linear-gradient(135deg, #D4A843, #B8922E); border-radius:16px; padding:18px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(212,168,67,0.3);">
        <span style="font-size:36px;">✏️</span>
        <div>
          <div style="font-size:15px; font-weight:700;">2027학년도 나만의 과목 설계하기</div>
          <div style="font-size:12px; opacity:0.85; margin-top:2px;">내년에 어떤 과목을 어떻게 선택하면 좋을까요? 미리 연습해 보세요!</div>
        </div>
        <div style="margin-left:auto; font-size:20px;">›</div>
      </div>

      <!-- 6. 멘토링/상담 신청 -->
      <div onclick="openMentoringForm()" style="background:linear-gradient(135deg, #C62828, #9B1B1B); border-radius:16px; padding:18px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(198,40,40,0.3);">
        <span style="font-size:36px;">💬</span>
        <div>
          <div style="font-size:15px; font-weight:700;">멘토링 · 상담 신청</div>
          <div style="font-size:12px; opacity:0.85; margin-top:2px;">박람회 당일 선배/선생님과 1:1 상담을 미리 신청하세요</div>
        </div>
        <div style="margin-left:auto; font-size:20px;">›</div>
      </div>

      <div class="notice-card">
        <div class="notice-title">📢 교육과정 박람회 안내</div>
        <div class="notice-item">
          📅 박람회 날짜: <strong>2026년 7월 7일 (화)</strong><br>
          ✅ 가이드북과 편제표를 미리 살펴보세요<br>
          ✅ 과목 설계로 나만의 시간표를 연습해보세요<br>
          ✅ 멘토링/상담이 필요하면 미리 신청하세요
        </div>
      </div>`;
  } else {
    // during
    const done = allQuizzesDone();
    el.innerHTML = `
      <!-- 퀴즈 참여 현황 -->
      <div class="stamp-card">
        <div style="font-size:14px; font-weight:700; margin-bottom:10px;">📝 퀴즈 참여 현황</div>
        <div class="stamp-grid" id="home-stamp-grid"></div>
      </div>

      <!-- 부스 투어 -->
      <div onclick="goTo('screen-booths')" style="background:linear-gradient(135deg, var(--primary), #0D47A1); border-radius:16px; padding:20px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(21,101,192,0.3);">
        <span style="font-size:40px;">🗺️</span>
        <div>
          <div style="font-size:16px; font-weight:700;">부스 투어</div>
          <div style="font-size:12px; opacity:0.85; margin-top:4px;">각 교과 부스를 방문하고 과목에 대해 알아보세요</div>
        </div>
        <div style="margin-left:auto; font-size:20px;">›</div>
      </div>

      ${done ? `
      <!-- 전체 완료: 축하 + 소감문 + 만족도 설문 -->
      <div style="background:linear-gradient(135deg, #2ECC71, #27AE60); border-radius:16px; padding:16px; margin-bottom:14px; color:white; text-align:center;">
        <div style="font-size:32px; margin-bottom:6px;">🎉</div>
        <div style="font-size:16px; font-weight:700;">모든 퀴즈를 완료했어요!</div>
        <div style="font-size:13px; opacity:0.9; margin-top:4px;">아래 소감문과 만족도 설문을 작성해주세요</div>
      </div>
      <div onclick="openFeedbackForm()" style="background:linear-gradient(135deg, #1565C0, #0D47A1); border-radius:16px; padding:20px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(21,101,192,0.3);">
        <span style="font-size:40px;">✍️</span>
        <div>
          <div style="font-size:16px; font-weight:700;">박람회 소감문 작성</div>
          <div style="font-size:12px; opacity:0.85; margin-top:4px;">박람회에서 느낀 점을 소감문으로 남겨주세요</div>
        </div>
        <div style="margin-left:auto; font-size:20px;">›</div>
      </div>
      <div onclick="openSatisfactionForm()" style="background:linear-gradient(135deg, #D4A843, #B8922E); border-radius:16px; padding:20px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(212,168,67,0.3);">
        <span style="font-size:40px;">📊</span>
        <div>
          <div style="font-size:16px; font-weight:700;">만족도 설문조사</div>
          <div style="font-size:12px; opacity:0.85; margin-top:4px;">박람회에 대한 소중한 의견을 남겨주세요</div>
        </div>
        <div style="margin-left:auto; font-size:20px;">›</div>
      </div>` : `
      <!-- 미완료: 격려 -->
      <div style="background:white; border-radius:16px; padding:16px; margin-bottom:14px; box-shadow:0 2px 8px rgba(0,0,0,0.05); text-align:center;">
        <div style="font-size:28px; margin-bottom:6px;">💪</div>
        <div style="font-size:14px; font-weight:700; color:var(--text);">아직 방문하지 않은 부스가 있어요!</div>
        <div style="font-size:13px; color:var(--text-light); margin-top:4px;">모든 부스의 퀴즈를 완료하면<br>소감문과 만족도 설문을 작성할 수 있어요</div>
      </div>`}

      <div class="notice-card">
        <div class="notice-title">📢 오늘 박람회 이용 안내</div>
        <div class="notice-item">
          ✅ 각 부스를 방문하고 과목에 대해 알아보세요<br>
          ✅ 각 부스에서 퀴즈에 참여해주세요<br>
          ✅ 모든 퀴즈 완료 후 소감문과 만족도 설문을 작성해주세요
        </div>
      </div>`;
  }
}

function getPhaseNavItems(phase) {
  if (phase === 'before') {
    return [
      { id:'screen-home',       icon:'🏠', label:'홈' },
      { id:'screen-curriculum', icon:'📊', label:'편제표' },
      { id:'screen-design',    icon:'✏️', label:'과목설계' },
    ];
  } else if (phase === 'during') {
    return [
      { id:'screen-home',   icon:'🏠', label:'홈' },
      { id:'screen-booths', icon:'🗺️', label:'부스투어' },
      { id:'screen-design', icon:'✏️', label:'과목설계' },
      { id:'screen-forms',  icon:'📋', label:'신청·소감' },
    ];
  }
}

function renderPhaseNav(navId, activeScreen) {
  const nav = document.getElementById(navId);
  if (!nav) return;
  const items = getPhaseNavItems(getPhase());
  nav.innerHTML = items.map(it =>
    `<button class="nav-item${it.id===activeScreen?' active':''}" onclick="goTo('${it.id}')"><span class="nav-icon">${it.icon}</span>${it.label}</button>`
  ).join('');
}

function renderHomeNav(phase) {
  renderPhaseNav('home-nav', 'screen-home');
}

// ============================================================
// GOOGLE FORM LINKS
// ============================================================
function openConsultForm() {
  if (GOOGLE_FORM_CONSULT === 'YOUR_GOOGLE_FORM_CONSULT_URL') {
    toast('\uC0C1\uB2F4 \uC2E0\uCCAD \uAD6C\uAE00\uD3FC URL\uC774 \uC544\uC9C1 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694');
    return;
  }
  window.open(GOOGLE_FORM_CONSULT, '_blank');
}

function openFeedbackForm() {
  if (GOOGLE_FORM_FEEDBACK === 'YOUR_GOOGLE_FORM_FEEDBACK_URL') {
    toast('\uC18C\uAC10\uBB38 \uAD6C\uAE00\uD3FC URL\uC774 \uC544\uC9C1 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694');
    return;
  }
  window.open(GOOGLE_FORM_FEEDBACK, '_blank');
}

function openCurriculumNav() {
  if (CURRICULUM_NAV_URL === 'YOUR_CURRICULUM_NAV_URL') {
    toast('과목 네비게이션 사이트 URL이 아직 설정되지 않았어요');
    return;
  }
  window.open(CURRICULUM_NAV_URL, '_blank');
}

// ============================================================
// CURRICULUM (편제표) — 학년별 표시
// ============================================================
function renderCurriculum() {
  const content = document.getElementById('curriculum-content');
  if (!content) return;
  const isTeacher = S.student && S.student.isTeacher;
  const grade = S.student ? S.student.grade : 0;

  if (isTeacher) {
    const activeTab = content.dataset.curTab || '1';
    content.innerHTML = `
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button onclick="switchCurrTab('1')" style="flex:1; padding:10px; border-radius:10px; font-size:14px; font-weight:700; border:none; cursor:pointer;
          ${activeTab === '1' ? 'background:var(--primary); color:white;' : 'background:#f0f0f0; color:var(--text);'}">
          1학년 (2학년 편제)
        </button>
        <button onclick="switchCurrTab('2')" style="flex:1; padding:10px; border-radius:10px; font-size:14px; font-weight:700; border:none; cursor:pointer;
          ${activeTab === '2' ? 'background:var(--primary); color:white;' : 'background:#f0f0f0; color:var(--text);'}">
          2학년 (3학년 편제)
        </button>
      </div>
      <div id="curr-tab-content">
        ${activeTab === '1' ? CURRICULUM_G2_HTML + CURRICULUM_G3_2026_HTML : CURRICULUM_G3_HTML}
      </div>`;
    return;
  }

  if (!grade) {
    content.innerHTML = '<div class="info-card" style="text-align:center;padding:32px 16px;"><p>로그인 후 내 학년에 맞는 편제표가 표시됩니다 🔒</p></div>';
    return;
  }
  if (grade === 1) {
    content.innerHTML = CURRICULUM_G2_HTML + CURRICULUM_G3_2026_HTML;
  } else {
    content.innerHTML = CURRICULUM_G3_HTML;
  }
}

function switchCurrTab(tab) {
  const content = document.getElementById('curriculum-content');
  if (!content) return;
  content.dataset.curTab = tab;
  renderCurriculum();
}

function switchDesignTab(tab) {
  const el = document.getElementById('design-cats');
  if (!el) return;
  el.dataset.designTab = tab;
  renderDesignGroups();
}

function openMentoringForm() {
  if (GOOGLE_FORM_MENTORING === 'YOUR_GOOGLE_FORM_MENTORING_URL') {
    toast('\uBA58\uD1A0\uB9C1 \uC2E0\uCCAD \uAD6C\uAE00\uD3FC URL\uC774 \uC544\uC9C1 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694');
    return;
  }
  window.open(GOOGLE_FORM_MENTORING, '_blank');
}

function openSatisfactionForm() {
  if (GOOGLE_FORM_SATISFACTION === 'YOUR_GOOGLE_FORM_SATISFACTION_URL') {
    toast('\uB9CC\uC871\uB3C4 \uC124\uBB38 \uAD6C\uAE00\uD3FC URL\uC774 \uC544\uC9C1 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC5B4\uC694');
    return;
  }
  window.open(GOOGLE_FORM_SATISFACTION, '_blank');
}

// ============================================================
// FORMS CONTENT (동적 렌더링)
// ============================================================
function renderFormsContent() {
  const el = document.getElementById('forms-content');
  if (!el) return;
  const done = allQuizzesDone();
  const earned = BOOTHS.filter(b=>!b.noStamp && S.stamps[b.id]).length;
  const total = BOOTHS.filter(b=>!b.noStamp).length;

  el.innerHTML = `
    ${done ? `
    <div onclick="openFeedbackForm()" style="background:linear-gradient(135deg, #C62828, #B71C1C); border-radius:16px; padding:20px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(198,40,40,0.3);">
      <span style="font-size:40px;">✍️</span>
      <div>
        <div style="font-size:16px; font-weight:700;">박람회 소감문 작성</div>
        <div style="font-size:12px; opacity:0.85; margin-top:4px;">오늘 박람회에서 느낀 점, 새롭게<br>알게 된 것을 소감문으로 남겨주세요</div>
      </div>
      <div style="margin-left:auto; font-size:20px;">›</div>
    </div>
    <div onclick="openSatisfactionForm()" style="background:linear-gradient(135deg, #D4A843, #B8922E); border-radius:16px; padding:20px; margin-bottom:14px; cursor:pointer; display:flex; align-items:center; gap:14px; color:white; box-shadow:0 4px 14px rgba(212,168,67,0.3);">
      <span style="font-size:40px;">📊</span>
      <div>
        <div style="font-size:16px; font-weight:700;">만족도 설문조사</div>
        <div style="font-size:12px; opacity:0.85; margin-top:4px;">박람회에 대한 소중한 의견을 남겨주세요</div>
      </div>
      <div style="margin-left:auto; font-size:20px;">›</div>
    </div>` : `
    <div style="background:white; border-radius:16px; padding:20px; margin-bottom:14px; box-shadow:0 2px 8px rgba(0,0,0,0.05); text-align:center;">
      <div style="font-size:36px; margin-bottom:8px;">🔒</div>
      <div style="font-size:15px; font-weight:700; color:var(--text);">소감문과 만족도 설문은<br>모든 퀴즈를 완료하면 열려요</div>
      <div style="font-size:13px; color:var(--text-light); margin-top:8px;">현재 ${earned} / ${total} 부스 퀴즈 완료</div>
    </div>`}`;

}

// ============================================================
// TOAST
// ============================================================
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'), 2600);
}

// ============================================================
// LOGOUT
// ============================================================
function confirmLogout() {
  if (studentPreviewMode) { exitPreviewMode(); return; }
  const earned = BOOTHS.filter(b=>!b.noStamp && S.stamps[b.id]).length;
  const msg = earned > 0
    ? `\uD604\uC7AC \uD034\uC988 ${earned}\uAC1C\uB97C \uC644\uB8CC\uD55C \uC0C1\uD0DC\uC608\uC694.\n\n\uB85C\uADF8\uC544\uC6C3\uD574\uB3C4 \uC774 \uAE30\uAE30\uC5D0 \uC9C4\uD589 \uB370\uC774\uD130\uAC00 \uC800\uC7A5\uB3FC\uC694.\n\uAC19\uC740 \uD559\uBC88\uC73C\uB85C \uB2E4\uC2DC \uC785\uC7A5\uD558\uBA74 \uC774\uC5B4\uC11C \uD560 \uC218 \uC788\uC5B4\uC694! \uD83D\uDE0A\n\n\uCC98\uC74C \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC08\uAE4C\uC694?`
    : '\uCC98\uC74C \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00\uC11C \uB2E4\uC2DC \uC785\uC7A5\uD560 \uC218 \uC788\uC5B4\uC694.\n\uACC4\uC18D\uD560\uAE4C\uC694?';
  if (confirm(msg)) doLogout();
}

function doLogout() {
  save();
  localStorage.setItem('mgh_fair26_global', JSON.stringify({ gbEntries: S.gbEntries }));
  localStorage.removeItem('mgh_fair26');

  S.student = null; S.googleUser = null; S.role = null;
  S.stamps = {}; S.quizResults = {};
  S.subjects = { g2:{}, g3:{} }; S.mood = '\u{1F60A}';
  if (typeof google !== 'undefined' && google.accounts) google.accounts.id.disableAutoSelect();

  selGrade = 0;
  document.getElementById('grade1-btn').classList.remove('selected');
  document.getElementById('grade2-btn').classList.remove('selected');
  document.getElementById('input-class').value = '';
  document.getElementById('input-number').value = '';
  document.getElementById('input-nickname').value = '';
  goTo('screen-login');
  updateChatFab();
  if (chatOpen) toggleChatbot();
  chatInited = false;
  toast('\uB85C\uADF8\uC544\uC6C3\uB410\uC5B4\uC694. \uB2E4\uC2DC \uC785\uC7A5\uD574\uC8FC\uC138\uC694 \uD83D\uDC4B');
}

// ============================================================
// ADMIN MODE
// ============================================================
const ADMIN_PW_KEY = 'mgh_admin_pw';
const CUSTOM_QUIZ_KEY = 'mgh_custom_quizzes';

function loadCustomQuizzes() {
  try {
    const saved = localStorage.getItem(CUSTOM_QUIZ_KEY);
    if (saved) {
      const custom = JSON.parse(saved);
      Object.keys(custom).forEach(id => { if (QUIZZES[id]) QUIZZES[id] = custom[id]; });
    }
  } catch(e) { console.error('[MoFair] Quiz load error:', e); }
}

function goToAdmin() {
  if (!S.googleUser || !isAdminLike(S.role)) {
    toast('\uAD00\uB9AC\uC790 \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4');
    return;
  }
  enterAdminMode();
}

function changeAdminPW() {
  const pw = document.getElementById('new-pw').value.trim();
  if (pw.length < 4) { toast('\uBE44\uBC00\uBC88\uD638\uB294 4\uC790\uB9AC \uC774\uC0C1 \uC785\uB825\uD558\uC138\uC694'); return; }
  localStorage.setItem(ADMIN_PW_KEY, simpleHash(pw));
  document.getElementById('new-pw').value = '';
  toast('\uBE44\uBC00\uBC88\uD638\uAC00 \uBCC0\uACBD\uB410\uC5B4\uC694 \u2705');
}

function adminLogout() {
  if (S.student) { goTo('screen-home'); }
  else { goTo('screen-login'); }
}

let studentPreviewMode = false;
function previewStudentMode() {
  studentPreviewMode = true;
  if (!S.student) {
    S.student = { grade:1, cls:1, num:0, uuid:'preview_admin', nickname:'미리보기', label:'관리자 미리보기' };
    S.stamps = {}; S.quizResults = {}; S.subjects = { g2:{}, g3:{} };
  }
  goTo('screen-home');
  updateHome();
  document.getElementById('home-admin-btn').style.display = 'none';
  showPreviewBanner();
}

function showPreviewBanner() {
  let banner = document.getElementById('preview-back-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'preview-back-banner';
    banner.style.cssText = 'position:fixed; top:0; left:0; right:0; z-index:9999; background:linear-gradient(135deg,#43A047,#2E7D32); color:white; display:flex; align-items:center; justify-content:center; gap:12px; padding:10px 16px; font-size:14px; font-weight:600; box-shadow:0 2px 12px rgba(0,0,0,0.3);';
    banner.innerHTML = '<span>👁️ 학생 화면 미리보기 중</span><button onclick="exitPreviewMode()" style="background:white; color:#2E7D32; border:none; border-radius:8px; padding:6px 14px; font-size:13px; font-weight:700; cursor:pointer;">관리자로 돌아가기</button>';
    document.body.appendChild(banner);
  }
  banner.style.display = 'flex';
}

function exitPreviewMode() {
  studentPreviewMode = false;
  const banner = document.getElementById('preview-back-banner');
  if (banner) banner.style.display = 'none';
  if (S.student?.uuid === 'preview_admin') {
    S.student = null;
    S.stamps = {}; S.quizResults = {}; S.subjects = { g2:{}, g3:{} };
  }
  enterAdminMode();
}


function renderAdminBoothList() {
  const el = document.getElementById('admin-booth-list'); if (!el) return;
  const quizBooths = BOOTHS.filter(b => !b.noStamp && QUIZZES[b.id]);
  el.innerHTML = quizBooths.map(b => `
    <div class="admin-booth-card" onclick="openQuizEdit('${b.id}')">
      <div class="booth-icon-wrap" style="background:${b.bg}; width:46px; height:46px; font-size:22px;">${b.icon}</div>
      <div class="admin-booth-info">
        <div class="admin-booth-name">${b.name}</div>
        <div class="admin-booth-qcount">\uD034\uC988 ${QUIZZES[b.id].questions.length}\uBB38\uC81C \u00B7 \uD0ED\uD574\uC11C \uD3B8\uC9D1</div>
      </div>
      <div style="font-size:20px; color:var(--text-light);">\u203A</div>
    </div>`).join('');
}

let editingBoothId = null;
let editDraft = [];

function openQuizEdit(boothId) {
  editingBoothId = boothId;
  const booth = BOOTHS.find(b => b.id === boothId);
  editDraft = JSON.parse(JSON.stringify(QUIZZES[boothId].questions));
  document.getElementById('edit-sheet-title').textContent = booth.icon + ' ' + booth.name + ' \uD034\uC988 \uD3B8\uC9D1';
  renderEditQuestions();
  document.getElementById('edit-overlay').classList.add('open');
}

function renderEditQuestions() {
  const wrap = document.getElementById('edit-questions-wrap');
  wrap.innerHTML = editDraft.map((q, qi) => `
    <div class="edit-q-block" id="eq-${qi}">
      <div class="edit-q-num">
        <span>\uBB38\uC81C ${qi + 1}</span>
        ${editDraft.length > 1 ? `<button onclick="removeEditQ(${qi})" style="border:none;background:none;color:var(--danger);font-size:13px;cursor:pointer;font-weight:700;">\uC0AD\uC81C</button>` : ''}
      </div>
      <div class="edit-label">\uBB38\uC81C \uB0B4\uC6A9</div>
      <textarea class="edit-input" id="eq-q-${qi}" rows="2" style="resize:vertical;">${q.q}</textarea>
      <div class="edit-label">\uBCF4\uAE30 (\uC815\uB2F5\uC5D0 \uD574\uB2F9\uD558\uB294 \uAC83\uC744 \uC544\uB798\uC11C \uC120\uD0DD)</div>
      <div class="edit-opts-grid">
        ${q.opts.map((o, oi) => `
          <div class="edit-opt-wrap">
            <span class="edit-opt-label">${['\u2460','\u2461','\u2462','\u2463'][oi]}</span>
            <input type="text" class="edit-opt-input ${q.ans === oi ? 'is-answer' : ''}"
                   id="eq-o-${qi}-${oi}" value="${o}"
                   oninput="highlightAns(${qi})">
          </div>`).join('')}
      </div>
      <div class="edit-answer-row">
        <span class="edit-answer-label">\uC815\uB2F5:</span>
        ${q.opts.map((_, oi) => `
          <button class="ans-btn ${q.ans === oi ? 'selected' : ''}"
                  id="eans-${qi}-${oi}"
                  onclick="setAns(${qi}, ${oi})">
            ${['\u2460','\u2461','\u2462','\u2463'][oi]}
          </button>`).join('')}
      </div>
    </div>`).join('');
}

function highlightAns(qi) {
  const ans = editDraft[qi].ans;
  [0,1,2,3].forEach(oi => {
    const el = document.getElementById(`eq-o-${qi}-${oi}`);
    if (el) el.classList.toggle('is-answer', oi === ans);
  });
}

function setAns(qi, oi) {
  editDraft[qi].ans = oi;
  [0,1,2,3].forEach(j => {
    const btn = document.getElementById(`eans-${qi}-${j}`);
    if (btn) btn.classList.toggle('selected', j === oi);
    const inp = document.getElementById(`eq-o-${qi}-${j}`);
    if (inp) inp.classList.toggle('is-answer', j === oi);
  });
}

function addEditQ() {
  editDraft.push({ q:'\uC0C8 \uBB38\uC81C\uB97C \uC785\uB825\uD558\uC138\uC694', opts:['\uBCF4\uAE301','\uBCF4\uAE302','\uBCF4\uAE303','\uBCF4\uAE304'], ans:0 });
  renderEditQuestions();
  setTimeout(() => {
    const last = document.getElementById(`eq-${editDraft.length - 1}`);
    if (last) last.scrollIntoView({ behavior:'smooth' });
  }, 100);
}

function removeEditQ(qi) {
  if (editDraft.length <= 1) { toast('\uBB38\uC81C\uB294 \uCD5C\uC18C 1\uAC1C \uC774\uC0C1\uC774\uC5B4\uC57C \uD574\uC694'); return; }
  editDraft.splice(qi, 1);
  renderEditQuestions();
}

function saveEditQuiz() {
  const questions = editDraft.map((q, qi) => {
    const qText = document.getElementById(`eq-q-${qi}`)?.value.trim() || q.q;
    const opts = [0,1,2,3].map(oi => document.getElementById(`eq-o-${qi}-${oi}`)?.value.trim() || q.opts[oi]);
    return { q: qText, opts, ans: q.ans };
  });

  for (let i = 0; i < questions.length; i++) {
    if (!questions[i].q) { toast(`\uBB38\uC81C ${i+1}\uC758 \uB0B4\uC6A9\uC744 \uC785\uB825\uD558\uC138\uC694`); return; }
    if (questions[i].opts.some(o => !o)) { toast(`\uBB38\uC81C ${i+1}\uC758 \uBAA8\uB4E0 \uBCF4\uAE30\uB97C \uC785\uB825\uD558\uC138\uC694`); return; }
  }

  QUIZZES[editingBoothId].questions = questions;
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_QUIZ_KEY) || '{}');
    saved[editingBoothId] = { questions };
    localStorage.setItem(CUSTOM_QUIZ_KEY, JSON.stringify(saved));
  } catch(e) { console.error('[MoFair] Quiz save error:', e); }

  closeEditOverlay();
  renderAdminBoothList();
  toast('\uD034\uC988\uAC00 \uC800\uC7A5\uB410\uC5B4\uC694! \u2705');
}

function closeEditOverlay(e) {
  if (e && e.target !== document.getElementById('edit-overlay')) return;
  document.getElementById('edit-overlay').classList.remove('open');
  editingBoothId = null;
  editDraft = [];
}

// ============================================================

// ============================================================

// ============================================================
// ROLE MANAGEMENT UI (admin only)
// ============================================================
function renderRoleList() {
  const roles = loadRoles();
  renderRoleGroup('role-teacher-list', roles.teachers, 'teacher');
  renderRoleGroup('role-studentadmin-list', roles.studentAdmins, 'studentAdmin');
}

function renderRoleGroup(elId, emails, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!emails.length) {
    el.innerHTML = '<div style="font-size:12px; color:var(--text-light); padding:4px 0;">등록된 사용자가 없습니다</div>';
    return;
  }
  el.innerHTML = emails.map(e =>
    `<div style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:var(--bg); border-radius:8px; margin-bottom:4px; font-size:13px;">
      <span>${sanitizeHtml(e)}</span>
      <button onclick="removeRole('${type}','${e.replace(/'/g,"\\'")}')" style="border:none; background:none; color:var(--danger); cursor:pointer; font-size:16px; padding:0 4px;">×</button>
    </div>`
  ).join('');
}

function addRole(type) {
  const inputId = type === 'teacher' ? 'role-teacher-input' : 'role-studentadmin-input';
  const email = document.getElementById(inputId).value.trim().toLowerCase();
  if (!email || !email.includes('@')) { toast('유효한 이메일을 입력하세요'); return; }
  if (SUPER_ADMIN_EMAILS.map(x=>x.toLowerCase()).includes(email)) { toast('슈퍼관리자는 변경할 수 없습니다'); return; }

  const roles = loadRoles();
  const key = type === 'teacher' ? 'teachers' : 'studentAdmins';
  if (roles[key].map(x=>x.toLowerCase()).includes(email)) { toast('이미 등록된 이메일입니다'); return; }

  // 중복 역할 제거
  roles.teachers = roles.teachers.filter(e => e.toLowerCase() !== email);
  roles.studentAdmins = roles.studentAdmins.filter(e => e.toLowerCase() !== email);
  roles[key].push(email);

  saveRoles(roles);
  document.getElementById(inputId).value = '';
  renderRoleList();
  toast('역할이 추가되었습니다 ✅');
}

function removeRole(type, email) {
  const roles = loadRoles();
  const key = type === 'teacher' ? 'teachers' : 'studentAdmins';
  roles[key] = roles[key].filter(e => e.toLowerCase() !== email.toLowerCase());
  saveRoles(roles);
  renderRoleList();
  toast('역할이 제거되었습니다');
}

// ============================================================
// ADMIN PHASE OVERRIDE UI
// ============================================================
function renderPhaseAdmin() {
  const el = document.getElementById('admin-phase-section');
  if (!el) return;
  if (S.role !== 'admin') { el.parentElement.style.display = 'none'; return; }
  el.parentElement.style.display = '';
  const phase = getPhase();
  const override = localStorage.getItem('mgh_phase_override');
  el.innerHTML = `
    <div style="font-size:14px; font-weight:700; margin-bottom:10px;">📅 Phase 설정</div>
    <div style="font-size:12px; color:var(--text-light); margin-bottom:10px;">
      현재: <strong>${PHASE_LABELS[phase]}</strong> ${override ? '(수동)' : `(자동 — ${FAIR_DATE} 기준)`}
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px;">
      <button class="phase-btn ${!override ? 'active' : ''}" onclick="clearPhaseOverride()">🔄 자동</button>
      <button class="phase-btn ${override==='before' ? 'active' : ''}" onclick="setPhaseOverride('before')">박람회 전</button>
      <button class="phase-btn ${override==='during' ? 'active' : ''}" onclick="setPhaseOverride('during')">당일</button>
    </div>`;
}

// ============================================================
// CHATBOT (FAQ 키워드 매칭)
// ============================================================
let chatOpen = false;
let chatInited = false;
let chatHistory = [];
let chatSending = false;

function toggleChatbot() {
  chatOpen = !chatOpen;
  document.getElementById('chat-panel').classList.toggle('open', chatOpen);
  document.getElementById('chat-overlay').classList.toggle('open', chatOpen);
  if (chatOpen && !chatInited) {
    chatInited = true;
    initChatbot();
  }
  if (chatOpen) {
    setTimeout(() => document.getElementById('chat-input').focus(), 300);
  }
}

function initChatbot() {
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML = '';
  chatHistory = [];
  addBotMessage('안녕하세요! 저는 풍백이예요 🌳\n교육과정, 편제표, 과목선택, 박람회 일정 등 궁금한 것을 자유롭게 물어보세요!');
  renderSuggestions(['고교학점제가 뭐야?','과목 유형 알려줘','과목선택 일정','편제표 보고 싶어','내 진로에 맞는 과목은?']);
}

function linkify(text) {
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return escaped
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#1565C0; text-decoration:underline; word-break:break-all;">바로가기 🔗</a>')
    .replace(/\n/g, '<br>');
}

function addBotMessage(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = linkify(text);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTypingIndicator() {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'chat-typing';
  div.textContent = '풍백이가 생각 중...';
  div.style.opacity = '0.6';
  div.style.fontStyle = 'italic';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('chat-typing');
  if (el) el.remove();
}

function renderSuggestions(items) {
  const el = document.getElementById('chat-suggestions');
  el.innerHTML = items.map(s =>
    `<button class="chat-suggest-btn" onclick="askSuggestion('${s.replace(/'/g,"\\'")}')">${s}</button>`
  ).join('');
}

function askSuggestion(text) {
  document.getElementById('chat-input').value = text;
  sendChat();
}

async function sendChat() {
  if (chatSending) return;
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  chatSending = true;

  addUserMessage(text);
  chatHistory.push({ role: 'user', content: text });
  addTypingIndicator();
  renderSuggestions([]);

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: chatHistory.slice(-6) }),
    });
    const data = await resp.json();
    removeTypingIndicator();
    addBotMessage(data.answer);
    chatHistory.push({ role: 'assistant', content: data.answer });
    renderSuggestions(pickFollowUps());
  } catch (e) {
    removeTypingIndicator();
    const fallback = matchFAQ(text);
    addBotMessage(fallback.answer);
    chatHistory.push({ role: 'assistant', content: fallback.answer });
    renderSuggestions(fallback.followUp);
  }
  chatSending = false;
}

function matchFAQ(input) {
  const normalized = input.toLowerCase().replace(/[?！!.,\s]+/g, ' ').trim();
  const tokens = normalized.split(' ').filter(t => t.length > 0);
  let bestMatch = null, bestScore = 0;
  for (const faq of CHATBOT_FAQ) {
    let score = 0;
    for (const kw of faq.keywords) {
      const kwLow = kw.toLowerCase();
      if (normalized.includes(kwLow)) score += kwLow.length;
      else for (const token of tokens) {
        if (kwLow.includes(token) || token.includes(kwLow)) score += Math.min(token.length, kwLow.length) * 0.5;
      }
    }
    if (score > bestScore) { bestScore = score; bestMatch = faq; }
  }
  if (bestMatch && bestScore >= 2) return { answer: bestMatch.answer, followUp: pickFollowUps() };
  return {
    answer: '죄송해요, 지금 답변이 어려워요 😅\n박람회 당일(7/7) 진로상담 부스를 방문하거나 멘토링 신청을 해주세요!',
    followUp: ['고교학점제가 뭐야?','과목선택 일정','편제표 보고 싶어','멘토링 신청하고 싶어']
  };
}

function pickFollowUps() {
  const topics = ['고교학점제가 뭐야?','과목 유형 알려줘','성적은 어떻게 기록돼?','대입에서 뭐가 중요해?',
    '박람회 언제야?','과목선택 일정','편제표 보고 싶어','이과 추천 과목','의대 가려면?','문과 추천 과목',
    '과목설계 해보고 싶어','멘토링 신청하고 싶어','제2외국어 뭐가 있어?','1학년은 내년에 뭘 배워?'];
  return topics.sort(() => Math.random() - 0.5).slice(0, 4);
}

function updateChatFab() {
  const fab = document.getElementById('chat-fab');
  if (!fab) return;
  const phase = getPhase();
  const onHome = document.getElementById('screen-home')?.classList.contains('active');
  fab.style.display = (S.student && phase === 'before' && onHome) ? '' : 'none';
}

// ============================================================
// BOOT
// ============================================================
window.addEventListener('load', () => {
  loadCustomQuizzes();
  init();
});
