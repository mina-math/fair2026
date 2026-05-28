// ============================================================
// DATA
// ============================================================

// Google OAuth 2.0
const GOOGLE_CLIENT_ID = '406986442327-jq7snp4kk8aqm67vn9c0mh5icbinpt10.apps.googleusercontent.com';

// 역할 설정 — 슈퍼관리자 (변경 불가)
const SUPER_ADMIN_EMAILS = ['tivemin@gmail.com'];
// 기본 교사/학생관리자 (코드에서 지정, 관리자 패널에서 추가 가능)
const DEFAULT_TEACHERS = ['galois911@gmail.com'];
const DEFAULT_STUDENT_ADMINS = [];

// 박람회 날짜 (Phase 자동 전환 기준)
const FAIR_DATE = '2026-07-07';

// 구글폼 URL (배포 전 실제 URL로 교체하세요)
const GOOGLE_FORM_CONSULT = 'https://docs.google.com/forms/d/e/1FAIpQLSe4GFOuXYSWG3Kg3x1OIwJ9_kkijsn2WslM8ZeEv2WIyhRGEg/viewform?usp=publish-editor';  // 상담 신청 구글폼
const GOOGLE_FORM_FEEDBACK = 'https://docs.google.com/forms/d/e/1FAIpQLSfnNss0nKUIrwa2p0cIZgzAs5A5JSI38Y7nNDrwUQlALw9zmA/viewform?usp=dialog'; // 박람회 소감문 구글폼
const GOOGLE_FORM_MENTORING = 'https://docs.google.com/forms/d/e/1FAIpQLSf8HG16z6c8Ol5GHNHuwRM7K3EppNCmyJ6nv4WKXecMd7yeuQ/viewform'; // 멘토링/진로상담 신청
const GOOGLE_FORM_SATISFACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSdoG1YG8JXkrKRfMa9CjLtCkTUy93cAlQVk3OwenY1trPx9dg/viewform?usp=dialog'; // 만족도 설문

// 2022개정교육과정 과목 네비게이션 외부 사이트
const CURRICULUM_NAV_URL = 'https://jne.money3366.workers.dev/subject-navigation'; // 과목 네비게이션 사이트 주소

// ============================================================
// FAQ 챗봇 데이터
// ============================================================
const CHATBOT_FAQ = [
  {
    keywords: ['고교학점제','학점제','뭐야','뭔가요','무엇'],
    answer: '고교학점제는 학생이 진로·적성에 따라 과목을 직접 선택하고, 이수 기준을 충족한 과목에 대해 학점을 취득·누적하여 졸업하는 제도예요.\n\n핵심 3가지:\n✅ 과목 선택의 자유\n✅ 출석 2/3 이상 + 성취율 40% 이상이면 학점 인정\n✅ 3년간 192학점 이상 취득 시 졸업'
  },
  {
    keywords: ['졸업','학점','192','몇학점','최소'],
    answer: '고교학점제에서 졸업에 필요한 최소 학점은 192학점이에요. 3년간 균형 있게 이수해야 하며, 학점을 일찍 채워도 조기 졸업은 불가합니다.'
  },
  {
    keywords: ['이수','미이수','못 채우','기준','출석','성취율','40'],
    answer: '과목 이수 기준은 출석률 2/3 이상 + 성취율 40% 이상이에요.\n성취율 40% 미만이면 미이수가 되지만, 보충지도 프로그램을 통해 다시 이수할 기회가 주어져요. 포기하지 마세요!'
  },
  {
    keywords: ['과목 유형','일반선택','진로선택','융합선택','공통과목','종류','차이'],
    answer: '선택과목은 4가지 유형이 있어요:\n\n📌 공통과목 — 전교생 필수, 9등급+성취도\n📌 일반선택 — 교과별 핵심 내용, 9등급+성취도\n📌 진로선택 — 교과 심화·진로 관련, 성취도(A~E)만\n📌 융합선택 — 교과 간 융합·실생활, 성취도(A~E)만\n\n💡 진로·융합선택은 등급 없이 성취도만 기록되니 부담 없이 도전해보세요!'
  },
  {
    keywords: ['성적','등급','성취도','기록','생기부','내신','평가'],
    answer: '공통과목·일반선택은 9등급제 + 성취도가 기록돼요.\n진로선택·융합선택은 등급 없이 성취도(A~E)만 기록됩니다.\n\n성취도 기준:\nA(90%↑) B(80%↑) C(70%↑) D(60%↑) E(40%↑)\n\n모든 과목에 세부능력 및 특기사항(세특)이 함께 기재돼요.'
  },
  {
    keywords: ['대입','대학','입시','2028','전공','수시','정시'],
    answer: '2028학년도 대입부터 전공(계열) 관련 교과 이수 여부가 핵심 평가 기준이 돼요!\n\n단순히 등급만 좋은 과목보다, 진로와 연결된 과목을 체계적으로 이수한 것이 더 중요합니다.\n\n✅ 희망 대학·학과의 권장 이수 과목을 미리 확인하세요.'
  },
  {
    keywords: ['박람회','언제','날짜','일정','7월','당일'],
    answer: '📅 교육과정 박람회는 2026년 7월 7일(화)에 진행돼요!\n\n박람회 당일에는 각 교과 부스를 방문해서 과목에 대해 알아보고, 퀴즈에 참여할 수 있어요.'
  },
  {
    keywords: ['과목선택','수요조사','선택 일정','신청','언제까지'],
    answer: '📅 과목선택 일정:\n\n1️⃣ 1차 과목 수요조사: 6/17(수)~6/21(일)\n   → 희망 과목 수요 조사\n2️⃣ 2차 교육과정 선택: 7/13(월)~7/15(수)\n   → 학생 교육과정 선택\n3️⃣ 3차 교육과정 선택: 8/21(금)~8/25(화)\n   → 최종 교육과정 선택'
  },
  {
    keywords: ['편제표','편성표','어떤 과목','배우','개설','우리학교'],
    answer: '편제표는 학년별로 어떤 과목을 배우는지 한눈에 볼 수 있는 표예요.\n\n🏫 학교지정 과목(필수)과 ✏️ 학생선택 과목이 있어요.\n\n홈 화면에서 "우리학교 편제표" 버튼을 눌러 확인하거나, 하단 네비에서 "편제표"를 눌러보세요!'
  },
  {
    keywords: ['1학년','2학년 때','내년','2학년 과목'],
    answer: '현재 1학년은 2학년 때 학기당 31학점을 이수해요.\n\n🏫 학교지정(16학점): 국어(문학/화법과언어), 수학(대수/미적분Ⅰ), 영어(영어Ⅰ/Ⅱ), 체육, 예술\n\n✏️ 학생선택(15학점): 국·수·영 택1(3학점) + 사회·과학 택3(9학점) + 제2외국어 택1(3학점)\n\n편제표에서 자세히 확인해보세요!'
  },
  {
    keywords: ['2학년','3학년 때','3학년 과목'],
    answer: '현재 2학년은 3학년 때 진로·융합선택 과목을 집중 이수해요.\n\n1학기(30학점): 학교지정 13학점 + 학생선택 17학점\n2학기(26학점): 학교지정 3학점 + 학생선택 23학점\n\n3학년 선택과목이 대입에서 가장 중요하니 신중하게 선택하세요!'
  },
  {
    keywords: ['제2외국어','스페인어','중국어','일본어','외국어'],
    answer: '목포여고에서는 제2외국어로 스페인어, 중국어, 일본어 중 택1을 할 수 있어요.\n\n2학년 1학기에 기본 과목을, 2학기에 심화 과목을 수강합니다.\n3학년에는 문화/회화 과목도 선택할 수 있어요.'
  },
  {
    keywords: ['이과','자연','공학','IT','컴퓨터','프로그래밍'],
    answer: '🔬 자연과학·공학·IT 계열 추천 과목:\n\n수학: 미적분Ⅱ, 기하\n과학: 역학과 에너지, 전자기와 양자, 화학 반응의 세계\n정보: 인공지능 기초\n\n수학·과학 진로선택 과목을 체계적으로 이수하는 것이 중요해요!'
  },
  {
    keywords: ['의대','의료','보건','간호','생명','약대','약학'],
    answer: '🏥 의료·보건·생명 계열 추천 과목:\n\n과학: 생물의 유전, 세포와 물질대사, 물질과 에너지\n수학: 미적분Ⅱ\n교양: 보건, 인간과 심리\n\n생물·화학 관련 진로선택 과목 이수가 핵심이에요!'
  },
  {
    keywords: ['문과','인문','사회','법','경제','경영'],
    answer: '📚 인문·사회·법·경제 계열 추천 과목:\n\n국어: 주제 탐구 독서, 언어생활 탐구\n사회: 법과 사회, 윤리와 사상, 금융과 경제생활, 사회문제 탐구\n교양: 인간과 경제활동, 교육의 이해'
  },
  {
    keywords: ['국제','외국어','통번역','외교','글로벌'],
    answer: '🌍 국제·외국어 계열 추천 과목:\n\n영어: 심화 영어, 미디어 영어\n제2외국어: 중국 문화, 일본 문화\n사회: 동아시아 역사 기행, 역사로 탐구하는 현대 세계'
  },
  {
    keywords: ['예술','미술','음악','디자인','체육','예체능'],
    answer: '🎨 예술·체육·디자인 계열 추천 과목:\n\n예술: 미술 창작(2학년), 미술과 매체\n체육: 스포츠 생활1·2, 운동과 건강\n융합: 매체 의사소통'
  },
  {
    keywords: ['교육','심리','사회복지','상담','교사','선생님'],
    answer: '🌱 교육·심리·사회복지 계열 추천 과목:\n\n교양: 교육의 이해, 인간과 심리\n사회: 윤리와 사상, 사회문제 탐구\n과학: 기후변화와 환경생태, 생태와 환경'
  },
  {
    keywords: ['가이드북','안내서','책자','다운로드','pdf'],
    answer: '📗 과목선택 가이드북은 홈 화면에서 다운로드할 수 있어요!\n\n"책으로 보기"를 누르면 PDF가 다운로드되고, "웹으로 보기"를 누르면 과목 네비게이션 사이트로 이동해요.\n\n가이드북에는 고교학점제 개요, 과목 유형, 진로 탐색, 2028 대입 정보, 학업 설계 방법이 담겨 있어요.'
  },
  {
    keywords: ['과목설계','과목 설계','시간표','선택 연습','미리'],
    answer: '✏️ "과목 설계하기" 메뉴에서 내년에 수강 희망하는 과목을 미리 선택해볼 수 있어요!\n\n각 선택그룹에서 정해진 수만큼 과목을 고르면 되고, 선택 현황에서 학기별 학점도 확인할 수 있어요.\n\n홈 화면이나 하단 네비에서 "과목설계"를 눌러보세요!'
  },
  {
    keywords: ['멘토','상담','진로','선배','신청'],
    answer: '💬 멘토링·진로상담을 원하시면 아래 링크에서 신청해주세요!\n\n📋 신청하기: https://docs.google.com/forms/d/e/1FAIpQLSf8HG16z6c8Ol5GHNHuwRM7K3EppNCmyJ6nv4WKXecMd7yeuQ/viewform\n\n박람회 당일(7/7)에 선배 멘토나 진로상담 선생님과 1:1 상담을 받을 수 있어요.'
  },
  {
    keywords: ['부스','퀴즈','투어','방문'],
    answer: '🗺️ 박람회 당일(7/7)에는 9개 교과 부스를 방문할 수 있어요!\n\n국어, 수학, 영어, 사회, 과학, 체육·예술, 생활·교양 부스에서 퀴즈에 참여할 수 있고, 진로진학상담·멘토상담 부스는 별도 신청으로 운영돼요.'
  },
  {
    keywords: ['쉬운 과목','쉬운','추천','어떤 과목','뭘 들어야','고민','모르겠'],
    answer: '과목 선택이 고민되시나요? 😊\n\n과목 선택 3대 원칙을 참고하세요:\n① 진로 연계 — 희망 대학·학과의 권장 과목 확인\n② 위계 고려 — 공통→일반선택→진로선택 순서\n③ 균형 유지 — 쉬운 과목만 말고 도전적 과목에도 도전!\n\n더 구체적인 상담이 필요하면 박람회 당일 진로상담 부스를 방문하거나, 멘토링 신청을 해보세요!'
  },
];

// 과목선택 일정 (날짜 확정 후 교체하세요)
const SCHEDULE_ITEMS = [
  { label: '1차 과목 수요조사', date: '6/17(수)~6/21(일)', desc: '희망 과목 수요 조사' },
  { label: '2차 교육과정 선택', date: '7/13(월)~7/15(수)', desc: '학생 교육과정 선택' },
  { label: '3차 교육과정 선택', date: '8/21(금)~8/25(화)', desc: '최종 교육과정 선택' },
];

const BOOTHS = [
  { id:'korean',  name:'국어교과',      icon:'📖', color:'#1565C0', bg:'#E3F2FD', code:'KO01', desc:'국어 선택과목 소개 및 진로 연계 안내' },
  { id:'math',    name:'수학교과',      icon:'📐', color:'#0D47A1', bg:'#E3F2FD', code:'MA02', desc:'수학 선택과목 소개 및 계열별 추천 안내' },
  { id:'english', name:'영어교과',      icon:'🌍', color:'#1E88E5', bg:'#E3F2FD', code:'EN03', desc:'영어 선택과목 소개 및 활용 안내' },
  { id:'social',  name:'사회교과',      icon:'🌏', color:'#C62828', bg:'#FFEBEE', code:'SO04', desc:'사회·역사·도덕 교과 선택과목 안내' },
  { id:'science', name:'과학교과',      icon:'🔬', color:'#B71C1C', bg:'#FFEBEE', code:'SC05', desc:'과학 선택과목 소개 및 계열별 추천' },
  { id:'arts',    name:'체육·예술교과', icon:'🎨', color:'#D4A843', bg:'#FFF8E1', code:'AP06', desc:'체육·음악·미술 교과 선택과목 안내' },
  { id:'life',    name:'생활·교양교과', icon:'🌱', color:'#B8922E', bg:'#FFF8E1', code:'LI07', desc:'기술가정·정보·제2외국어·교양 안내' },
  { id:'career',  name:'진로진학상담',  icon:'🎯', color:'#0D47A1', bg:'#E3F2FD', code:'CA08', desc:'진로·진학·대입 정보 상담 (신청제)', noStamp:true },
  { id:'mentor',  name:'멘토상담',      icon:'💬', color:'#C62828', bg:'#FFEBEE', code:'ME09', desc:'선배 멘토와 함께하는 과목 선택 상담 (신청제)', noStamp:true },
  { id:'info',    name:'인포메이션',    icon:'ℹ️', color:'#717D7E', bg:'#F2F3F4', code:'IN00', desc:'전체 박람회 안내 데스크', noStamp:true },
];

const QUIZZES = {
  korean: { questions:[
    { q:'2022 개정 교육과정에서 국어 교과의 공통과목을 모두 고르면?', opts:['공통국어1·공통국어2','화법과 언어·독서와 작문','문학·독서','주제탐구독서·문학'], ans:0 },
    { q:'다음 중 국어 교과 진로선택 과목인 것은?', opts:['화법과 언어','독서와 작문','문학과 영상','문학'], ans:2 },
    { q:'고교학점제에서 과목 이수 인정을 받기 위한 최소 출석률은?', opts:['1/2 이상','2/3 이상','3/4 이상','전부 출석'], ans:1 },
  ]},
  math: { questions:[
    { q:'수학 교과 공통과목이 아닌 것은?', opts:['공통수학1','공통수학2','대수','기본수학1'], ans:2 },
    { q:'고교학점제에서 3년간 취득해야 하는 최소 졸업 학점은?', opts:['180학점','192학점','204학점','216학점'], ans:1 },
    { q:'수학 교과 융합선택 과목이 아닌 것은?', opts:['수학과 문화','실용 통계','수학과제탐구','기하'], ans:3 },
  ]},
  english: { questions:[
    { q:'영어 교과의 일반선택 과목으로 바르게 묶인 것은?', opts:['영어Ⅰ·영어Ⅱ','심화영어·영미문학읽기','실생활영어회화·미디어영어','직무영어·영어발표와토론'], ans:0 },
    { q:'다음 중 영어 교과 융합선택 과목은?', opts:['영어Ⅰ','심화영어','실생활 영어 회화','영미 문학 읽기'], ans:2 },
    { q:'영어 공통과목의 수는 모두 몇 개인가요?', opts:['2개','3개','4개','5개'], ans:2 },
  ]},
  social: { questions:[
    { q:'사회 교과 공통과목에 포함되지 않는 것은?', opts:['한국사1','통합사회1','세계시민과 지리','한국사2'], ans:2 },
    { q:'2022 개정 사회 교과 융합선택 과목인 것은?', opts:['세계사','여행지리','동아시아 역사 기행','정치'], ans:1 },
    { q:'진로선택 과목의 성적 기록 방식은?', opts:['9등급+성취도','5등급+성취도','성취도(A~E)만','등급만'], ans:2 },
  ]},
  science: { questions:[
    { q:'과학 교과 공통과목이 아닌 것은?', opts:['통합과학1','과학탐구실험1','물리학','통합과학2'], ans:2 },
    { q:'과학 교과 융합선택 과목인 것은?', opts:['역학과 에너지','세포와 물질대사','과학의 역사와 문화','전자기와 양자'], ans:2 },
    { q:'물리학 관련 진로선택 과목은?', opts:['역학과 에너지','지구시스템과학','생물의 유전','반응의 세계'], ans:0 },
  ]},
  arts: { questions:[
    { q:'체육 교과 일반선택 과목은?', opts:['운동과 건강','체육1·체육2','스포츠 문화','스포츠 생활1'], ans:1 },
    { q:'예술 교과 공통과목이 아닌 것은?', opts:['음악','미술','연극','음악 연주와 창작'], ans:3 },
    { q:'다음 중 예술 교과 진로선택 과목인 것은?', opts:['음악','미술','미술 창작','연극'], ans:2 },
  ]},
  life: { questions:[
    { q:'정보 교과의 진로선택 과목은?', opts:['기술·가정','인공지능 기초','소프트웨어와 생활','데이터 과학'], ans:1 },
    { q:'교양 교과 일반선택 과목은?', opts:['철학','진로와 직업','인간과 심리','논술'], ans:1 },
    { q:'제2외국어 교과에 포함되지 않는 언어는?', opts:['일본어','베트남어','포르투갈어','아랍어'], ans:2 },
  ]},
  career: { questions:[
    { q:'고교학점제에서 학생이 직접 선택하지 않는 과목 유형은?', opts:['일반선택','진로선택','융합선택','공통과목'], ans:3 },
    { q:'2027학년도 대입에서 중요해지는 새로운 평가 요소는?', opts:['전공 관련 과목 이수 여부','영어 점수','수능 최저 등급','내신 1등급'], ans:0 },
    { q:'과목 선택 시 가장 중요하게 고려해야 할 것은?', opts:['친구가 듣는 과목','선생님 추천','나의 진로·적성','쉬운 과목'], ans:2 },
  ]},
  mentor: { questions:[
    { q:'선배 멘토에게 과목 선택 상담을 받을 때 가장 유익한 것은?', opts:['친구 따라가기','자신의 진로와 연결해 묻기','수능 점수만 보기','부모님 의견만 따르기'], ans:1 },
    { q:'3학년 때 수강한 과목이 대입에서 중요한 이유는?', opts:['학점이 많아서','전공 연계 과목 이수 여부 평가','수능 필수라서','내신에 미포함'], ans:1 },
    { q:'과목 선택 정보를 얻을 수 있는 방법으로 옳은 것은?', opts:['교육과정 박람회 참여','과목 안내 가이드북 읽기','선생님·선배 상담','위 모두'], ans:3 },
  ]},
};

// ※ 과목 데이터: 2026학년도 교육과정 편성표 기준
// ── 편제표 기반 선택 영역 ──────────────────────────────────────
// SUBJECTS_G2: 현 1학년(2026입학) → 2학년 선택과목
// SUBJECTS_G3: 현 2학년(2025입학) → 3학년 선택과목
// 각 group: { id, label, pick(최대선택수), credits, items:[{n,subj,t}] }
// S.subjects.g2 = { 그룹id: [선택된과목명...], ... }

const SUBJECTS_G2 = [
  {
    sem: '📅 2학년 1학기',
    groups: [
      { id:'s1A', label:'국어·수학·영어', pick:1, credits:3,
        items:[
          {n:'독서 토론과 글쓰기', subj:'국어', t:'fusion'},
          {n:'인공지능 수학',      subj:'수학', t:'career'},
          {n:'세계 문화와 영어',   subj:'영어', t:'fusion'},
        ]},
      { id:'s1B', label:'사회·과학', pick:3, credits:9,
        items:[
          {n:'사회와 문화',        subj:'사회', t:'general'},
          {n:'현대사회와 윤리',    subj:'사회', t:'general'},
          {n:'동아시아 역사 기행', subj:'사회', t:'career'},
          {n:'물리학',            subj:'과학', t:'general'},
          {n:'화학',              subj:'과학', t:'general'},
          {n:'생명과학',          subj:'과학', t:'general'},
          {n:'지구과학',          subj:'과학', t:'general'},
        ]},
      { id:'s1C', label:'제2외국어', pick:1, credits:3,
        items:[
          {n:'스페인어', subj:'제2외국어', t:'general'},
          {n:'중국어',   subj:'제2외국어', t:'general'},
          {n:'일본어',   subj:'제2외국어', t:'general'},
        ]},
    ]
  },
  {
    sem: '📅 2학년 2학기',
    groups: [
      { id:'s2D', label:'국어·수학·영어', pick:1, credits:3,
        items:[
          {n:'문학과 영상',       subj:'국어', t:'career'},
          {n:'기하',             subj:'수학', t:'career'},
          {n:'영어 발표와 토론', subj:'영어', t:'career'},
        ]},
      { id:'s2E', label:'사회·과학', pick:3, credits:9,
        items:[
          {n:'세계사',            subj:'사회', t:'general'},
          {n:'세계시민과 지리',   subj:'사회', t:'general'},
          {n:'법과 사회',         subj:'사회', t:'career'},
          {n:'역학과 에너지',     subj:'과학', t:'career'},
          {n:'물질과 에너지',     subj:'과학', t:'career'},
          {n:'세포와 물질대사',   subj:'과학', t:'career'},
          {n:'지구시스템과학',    subj:'과학', t:'career'},
        ]},
      { id:'s2F', label:'제2외국어 심화', pick:1, credits:3,
        items:[
          {n:'심화 스페인어', subj:'제2외국어', t:'fusion'},
          {n:'심화 중국어',   subj:'제2외국어', t:'fusion'},
          {n:'심화 일본어',   subj:'제2외국어', t:'fusion'},
        ]},
    ]
  }
];

const SUBJECTS_G3 = [
  {
    sem: '📅 3학년 1학기',
    groups: [
      { id:'s1A', label:'국어·수학·영어', pick:1, credits:3,
        items:[
          {n:'주제 탐구 독서',   subj:'국어', t:'career'},
          {n:'매체 의사소통',    subj:'국어', t:'fusion'},
          {n:'언어생활 탐구',    subj:'국어', t:'fusion'},
          {n:'미적분Ⅱ',         subj:'수학', t:'career'},
          {n:'수학과제 탐구',    subj:'수학', t:'fusion'},
          {n:'심화 영어',        subj:'영어', t:'career'},
          {n:'미디어 영어',      subj:'영어', t:'fusion'},
        ]},
      { id:'s1B', label:'사회·과학·기타', pick:4, credits:12,
        items:[
          {n:'도시의 미래 탐구',          subj:'사회', t:'career'},
          {n:'동아시아 역사 기행',        subj:'사회', t:'career'},
          {n:'법과 사회',                subj:'사회', t:'career'},
          {n:'윤리와 사상',              subj:'사회', t:'career'},
          {n:'금융과 경제생활',          subj:'사회', t:'fusion'},
          {n:'기후변화와 지속가능한 세계',subj:'사회', t:'fusion'},
          {n:'사회문제 탐구',            subj:'사회', t:'fusion'},
          {n:'여행지리',                subj:'사회', t:'fusion'},
          {n:'역사로 탐구하는 현대 세계',subj:'사회', t:'fusion'},
          {n:'물질과 에너지',            subj:'과학', t:'career'},
          {n:'전자기와 양자',            subj:'과학', t:'career'},
          {n:'역학과 에너지',            subj:'과학', t:'career'},
          {n:'화학 반응의 세계',         subj:'과학', t:'career'},
          {n:'생물의 유전',              subj:'과학', t:'career'},
          {n:'세포와 물질대사',          subj:'과학', t:'career'},
          {n:'지구시스템과학',           subj:'과학', t:'career'},
          {n:'행성우주과학',             subj:'과학', t:'career'},
          {n:'기후변화와 환경생태',      subj:'과학', t:'fusion'},
          {n:'생활과학 탐구',            subj:'기술·정보', t:'career'},
          {n:'인공지능 기초',            subj:'기술·정보', t:'career'},
          {n:'중국 문화',               subj:'제2외국어', t:'fusion'},
          {n:'일본 문화',               subj:'제2외국어', t:'fusion'},
        ]},
      { id:'s1C', label:'교양', pick:1, credits:2,
        items:[
          {n:'교육의 이해',      subj:'교양', t:'career'},
          {n:'보건',            subj:'교양', t:'career'},
          {n:'인간과 심리',      subj:'교양', t:'career'},
          {n:'생태와 환경',      subj:'교양', t:'general'},
          {n:'논술',            subj:'교양', t:'fusion'},
          {n:'인간과 경제활동', subj:'교양', t:'fusion'},
        ]},
    ]
  },
  {
    sem: '📅 3학년 2학기',
    groups: [
      { id:'s2D', label:'국어·수학·영어', pick:3, credits:9,
        items:[
          {n:'주제 탐구 독서',   subj:'국어', t:'career'},
          {n:'매체 의사소통',    subj:'국어', t:'fusion'},
          {n:'언어생활 탐구',    subj:'국어', t:'fusion'},
          {n:'미적분Ⅱ',         subj:'수학', t:'career'},
          {n:'수학과제 탐구',    subj:'수학', t:'fusion'},
          {n:'심화 영어',        subj:'영어', t:'career'},
          {n:'미디어 영어',      subj:'영어', t:'fusion'},
        ]},
      { id:'s2E', label:'사회·과학·기타', pick:4, credits:12,
        items:[
          {n:'도시의 미래 탐구',          subj:'사회', t:'career'},
          {n:'동아시아 역사 기행',        subj:'사회', t:'career'},
          {n:'법과 사회',                subj:'사회', t:'career'},
          {n:'윤리와 사상',              subj:'사회', t:'career'},
          {n:'금융과 경제생활',          subj:'사회', t:'fusion'},
          {n:'기후변화와 지속가능한 세계',subj:'사회', t:'fusion'},
          {n:'사회문제 탐구',            subj:'사회', t:'fusion'},
          {n:'여행지리',                subj:'사회', t:'fusion'},
          {n:'역사로 탐구하는 현대 세계',subj:'사회', t:'fusion'},
          {n:'물질과 에너지',            subj:'과학', t:'career'},
          {n:'전자기와 양자',            subj:'과학', t:'career'},
          {n:'역학과 에너지',            subj:'과학', t:'career'},
          {n:'화학 반응의 세계',         subj:'과학', t:'career'},
          {n:'생물의 유전',              subj:'과학', t:'career'},
          {n:'세포와 물질대사',          subj:'과학', t:'career'},
          {n:'지구시스템과학',           subj:'과학', t:'career'},
          {n:'행성우주과학',             subj:'과학', t:'career'},
          {n:'기후변화와 환경생태',      subj:'과학', t:'fusion'},
          {n:'생활과학 탐구',            subj:'기술·정보', t:'career'},
          {n:'인공지능 기초',            subj:'기술·정보', t:'career'},
          {n:'중국 문화',               subj:'제2외국어', t:'fusion'},
          {n:'일본 문화',               subj:'제2외국어', t:'fusion'},
        ]},
      { id:'s2F', label:'교양', pick:1, credits:2,
        items:[
          {n:'교육의 이해',      subj:'교양', t:'career'},
          {n:'보건',            subj:'교양', t:'career'},
          {n:'인간과 심리',      subj:'교양', t:'career'},
          {n:'생태와 환경',      subj:'교양', t:'general'},
          {n:'논술',            subj:'교양', t:'fusion'},
          {n:'인간과 경제활동', subj:'교양', t:'fusion'},
        ]},
    ]
  }
];

const INFO_TABS = ['고교학점제','과목 유형','성적 기록','계열 추천','가이드북'];
const INFO_HTML = [
  /* ===== 탭 1: 고교학점제 ===== */
  `<div class="info-card">
    <h3>🏫 고교학점제란?</h3>
    <div class="highlight-box">
      <p>학생이 기초 소양과 기본 학력을 바탕으로 <strong>진로·적성에 따라 과목을 선택</strong>하고,<br>이수 기준에 도달한 과목에 대해 <strong>학점을 취득·누적하여 졸업</strong>하는 제도</p>
    </div>

    <h4>📌 3가지 핵심 원리</h4>
    <p>✅ <strong>과목 선택의 자유</strong> — 자신의 흥미·적성·진로에 맞는 과목을 직접 골라요.<br>
    ✅ <strong>이수 기준 충족</strong> — 출석 2/3 이상 + 성취율 40% 이상이면 학점 인정!<br>
    ✅ <strong>192학점 취득 후 졸업</strong> — 3년간 192학점 이상 쌓아야 졸업할 수 있어요.</p>

    <h4>⚙️ 고교학점제 운영 7단계</h4>
    <div style="background:#E3F2FD;border-radius:10px;padding:12px;font-size:13px;line-height:2;">
      <b>1단계</b> 교육과정 편성 → <b>2단계</b> 진로·학업 설계 → <b>3단계</b> 수강신청<br>
      → <b>4단계</b> 수업 운영 → <b>5단계</b> 학생 평가 → <b>6단계</b> 학점 취득 → <b>7단계</b> 졸업
    </div>

    <h4>🔒 최소 성취수준 보장지도</h4>
    <p>과목 이수를 돕기 위해 <strong>예방지도</strong>(이수 기준 미달 예상 학생 사전 지도)와 <strong>보충지도</strong>(미달 학생 대상 이수 지도)가 함께 운영돼요.</p>

    <h4>❓ 자주 묻는 질문 Q&amp;A</h4>
    <div style="background:#fffbf0;border-left:3px solid #D4A843;padding:10px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;">
      <p><strong>Q. 192학점을 빨리 채우면 조기 졸업이 되나요?</strong></p>
      <p>아니요. 고등학교는 3년 과정을 균형 있게 이수해야 해요. 학점을 다 채워도 바로 졸업할 수 없어요.</p>
    </div>
    <div style="background:#fffbf0;border-left:3px solid #D4A843;padding:10px 12px;border-radius:0 8px 8px 0;margin-bottom:8px;">
      <p><strong>Q. 이수 기준을 못 채운 과목은 어떻게 되나요?</strong></p>
      <p>보충 학습(보충지도 프로그램)을 통해 다시 이수할 기회가 주어져요. 포기하지 마세요!</p>
    </div>
    <div style="background:#fffbf0;border-left:3px solid #D4A843;padding:10px 12px;border-radius:0 8px 8px 0;">
      <p><strong>Q. 2025년부터 창의적 체험활동도 이수 기준이 있나요?</strong></p>
      <p>네! 고등학교 3년 동안 운영된 수업 횟수의 2/3 이상 출석하면 학점을 인정받아요.</p>
    </div>
  </div>`,

  /* ===== 탭 2: 과목 유형 ===== */
  `<div class="info-card">
    <h3>📂 선택과목 유형 완전 정복</h3>
    <table class="info-table">
      <tr><th>유형</th><th>특징</th><th>성적 기록</th></tr>
      <tr>
        <td><span class="badge badge-common">공통과목</span></td>
        <td>기초 소양·기본 학력 함양.<br>전교생 필수 이수</td>
        <td>9등급 + 성취도</td>
      </tr>
      <tr>
        <td><span class="badge badge-general">일반선택</span></td>
        <td>교과별 학문 영역의<br>핵심 내용 이해·탐구</td>
        <td>9등급 + 성취도</td>
      </tr>
      <tr>
        <td><span class="badge badge-career">진로선택</span></td>
        <td>교과 심화 학습 및<br>진로 관련 과목</td>
        <td>성취도(A~E)만</td>
      </tr>
      <tr>
        <td><span class="badge badge-fusion">융합선택</span></td>
        <td>교과 내·교과 간 주제 융합<br>실생활 체험·응용</td>
        <td>성취도(A~E)만</td>
      </tr>
    </table>

    <div class="highlight-box" style="margin-top:14px;">
      <p>💡 <strong>진로선택·융합선택</strong>은 등급 없이 성취도(A~E)만 기록돼요!<br>
      등급 경쟁 부담 없이 도전하고 싶은 과목을 자유롭게 선택하세요 😊</p>
    </div>

    <h4>📊 성취도 기준 (A~E)</h4>
    <table class="info-table">
      <tr><th>성취도</th><th>성취율</th><th>의미</th></tr>
      <tr><td><b style="color:#1565C0">A</b></td><td>90% 이상</td><td>매우 우수</td></tr>
      <tr><td><b style="color:#0D47A1">B</b></td><td>80% 이상</td><td>우수</td></tr>
      <tr><td><b style="color:#2ECC71">C</b></td><td>70% 이상</td><td>보통</td></tr>
      <tr><td><b style="color:#D4A843">D</b></td><td>60% 이상</td><td>미흡</td></tr>
      <tr><td><b style="color:#FF4757">E</b></td><td>40% 이상</td><td>매우 미흡(이수 인정)</td></tr>
    </table>
    <p style="font-size:12px;color:#718096;margin-top:6px;">※ 성취율 40% 미만은 미이수 → 보충지도 대상</p>

    <h4>🏫 목포여고 교과 구조</h4>
    <p><strong>1학년</strong>: 국어·수학·영어·사회·과학 공통과목 중심<br>
    <strong>2학년</strong>: 일반선택 + 진로·융합선택 과목 본격 수강<br>
    <strong>3학년</strong>: 진로·융합선택 과목 집중 이수 + 대입 준비</p>
  </div>`,

  /* ===== 탭 3: 성적 기록 ===== */
  `<div class="info-card">
    <h3>📊 성적은 어떻게 산출되고 기록되나요?</h3>

    <h4>🔢 공통과목·일반선택 — 9등급제</h4>
    <table class="info-table">
      <tr><th>등급</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
      <tr><td>비율</td><td>4%</td><td>11%</td><td>23%</td><td>40%</td><td>60%</td></tr>
    </table>
    <p style="font-size:12px;color:#718096;margin-top:4px;">※ 1~5등급 누적 비율. 9등급까지 있으며 내신 성적에 반영돼요.</p>

    <h4>🎯 진로선택·융합선택 — 성취도만 기록</h4>
    <div class="highlight-box">
      <p>등급 없이 <strong>A / B / C / D / E</strong> 성취도만 기록!<br>
      학교생활기록부(생기부)에는 과목별 <strong>세부능력 및 특기사항(세특)</strong>이 함께 기재돼요.</p>
    </div>

    <h4>📋 학교생활기록부 기재 내용</h4>
    <p>✅ 수강한 모든 과목명과 학점<br>
    ✅ 공통·일반선택: 등급 + 성취도 + 원점수/평균/표준편차<br>
    ✅ 진로·융합선택: 성취도 + 원점수/평균<br>
    ✅ 모든 과목: <strong>세부능력 및 특기사항</strong> (수업 태도, 역량, 성장 기록)</p>

    <h4>⚠️ 대학 입시에서 주목하는 것</h4>
    <div style="background:#fff0f0;border-left:3px solid #FF4757;padding:10px 12px;border-radius:0 8px 8px 0;">
      <p>2028학년도 대입부터 <strong>전공(계열) 관련 교과 이수 여부</strong>가 중요한 평가 기준이 돼요!<br>
      단순히 등급만 좋은 과목보다, <strong>진로와 연결된 과목을 체계적으로 이수</strong>한 것이 더 중요해요.</p>
    </div>

    <h4>📌 과목 선택 3대 원칙</h4>
    <p>① <strong>진로 연계</strong> — 희망 대학·학과의 권장 이수 과목 미리 확인하기<br>
    ② <strong>위계 고려</strong> — 공통 → 일반선택 → 진로선택 순서로 쌓기<br>
    ③ <strong>균형 유지</strong> — 쉬운 과목만 피하고, 도전적 과목에도 도전하기</p>
  </div>`,

  /* ===== 탭 4: 계열별 추천 ===== */
  `<div class="info-card">
    <h3>✏️ 나의 진로·계열별 추천 과목</h3>
    <div class="highlight-box">
      <p>🎯 2028학년도 대입부터 <strong>전공 관련 과목 이수 여부</strong>가 핵심 평가 요소!<br>
      내가 원하는 계열에 맞는 과목을 미리 파악해 두세요.</p>
    </div>

    <h4>🔬 자연과학·공학·IT 계열</h4>
    <p>수학: <span class="badge badge-career">미적분Ⅱ</span> <span class="badge badge-career">기하</span><br>
    과학: <span class="badge badge-career">역학과 에너지</span> <span class="badge badge-career">전자기와 양자</span> <span class="badge badge-career">화학 반응의 세계</span> <span class="badge badge-career">지구시스템과학</span><br>
    정보: <span class="badge badge-career">인공지능 기초</span></p>

    <h4>🏥 의료·보건·생명 계열</h4>
    <p>과학: <span class="badge badge-career">생물의 유전</span> <span class="badge badge-career">세포와 물질대사</span> <span class="badge badge-career">물질과 에너지</span><br>
    수학: <span class="badge badge-career">미적분Ⅱ</span><br>
    교양: <span class="badge badge-career">보건</span> <span class="badge badge-career">인간과 심리</span></p>

    <h4>📚 인문·사회·법·경제 계열</h4>
    <p>국어: <span class="badge badge-career">주제 탐구 독서</span> <span class="badge badge-fusion">언어생활 탐구</span><br>
    사회: <span class="badge badge-career">법과 사회</span> <span class="badge badge-career">윤리와 사상</span> <span class="badge badge-fusion">금융과 경제생활</span> <span class="badge badge-fusion">사회문제 탐구</span><br>
    교양: <span class="badge badge-fusion">인간과 경제활동</span> <span class="badge badge-career">교육의 이해</span></p>

    <h4>🌍 국제·외국어 계열</h4>
    <p>영어: <span class="badge badge-career">심화 영어</span> <span class="badge badge-fusion">미디어 영어</span><br>
    제2외국어: <span class="badge badge-fusion">중국 문화</span> <span class="badge badge-fusion">일본 문화</span><br>
    사회: <span class="badge badge-career">동아시아 역사 기행</span> <span class="badge badge-fusion">역사로 탐구하는 현대 세계</span></p>

    <h4>🎨 예술·체육·디자인 계열</h4>
    <p>예술: <span class="badge badge-career">미술 창작(2학년)</span> <span class="badge badge-fusion">미술과 매체</span><br>
    체육: 스포츠 생활1·2, 운동과 건강<br>
    융합: <span class="badge badge-fusion">매체 의사소통</span></p>

    <h4>🌱 교육·심리·사회복지 계열</h4>
    <p>교양: <span class="badge badge-career">교육의 이해</span> <span class="badge badge-career">인간과 심리</span><br>
    사회: <span class="badge badge-career">윤리와 사상</span> <span class="badge badge-fusion">사회문제 탐구</span><br>
    과학: <span class="badge badge-fusion">기후변화와 환경생태</span> <span class="badge badge-career">생태와 환경</span></p>
  </div>`,

  /* ===== 탭 5: 가이드북 다운로드 ===== */
  `<div class="info-card">
    <h3>📥 과목선택 가이드북</h3>
    <div class="highlight-box">
      <p>교육부에서 제작한 <strong>2022 개정 교육과정 학업 설계 가이드북</strong>을 다운로드해서 읽어보세요!<br>
      고교학점제 개요, 과목 유형, 진로 탐색, 학업 설계 방법이 담겨 있어요 📖</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:14px;margin-top:16px;">
      <a href="2022 개정 교육과정 고등학교 과목선택 안내서(개정판).pdf" download style="
        display:flex;align-items:center;gap:14px;
        background:linear-gradient(135deg,#1565C0,#0D47A1);
        color:white;border-radius:14px;padding:16px 18px;
        text-decoration:none;box-shadow:0 4px 14px rgba(21,101,192,0.4);">
        <span style="font-size:36px;">📗</span>
        <div>
          <div style="font-size:16px;font-weight:700;">2022 개정 교육과정 학업 설계 가이드북</div>
          <div style="font-size:12px;opacity:0.85;margin-top:3px;">고교학점제 · 과목 유형 · 진로 탐색 · 학업 설계</div>
          <div style="font-size:11px;opacity:0.7;margin-top:2px;">📎 PDF 다운로드 (5.0MB)</div>
        </div>
      </a>
    </div>

    <div style="background:#E3F2FD;border-radius:10px;padding:12px 14px;margin-top:16px;font-size:13px;color:#0D47A1;">
      💡 <strong>다운로드 안 되는 경우</strong><br>
      가이드북 파일이 앱과 같은 폴더에 있어야 해요.<br>
      선생님께 파일을 받거나 진로진학상담 부스에서 문의해 주세요!
    </div>

    <h4 style="margin-top:18px;">📋 가이드북 주요 목차</h4>
    <p>Ⅰ. 고교학점제 이해하기<br>
    Ⅱ. 2022 개정 교육과정 알아보기<br>
    Ⅲ. 나의 진로 탐색하기<br>
    Ⅳ. 진학 정보 탐색하기 (2028 대입)<br>
    Ⅴ. 나의 학업 설계하기</p>
  </div>`,
];

// ============================================================
// 편제표 HTML (교육과정 편성표) — 학교지정 + 학생선택 포함
// ============================================================

// ── 2026입학생(현 1학년)이 보는 2학년 편제 ──
const CURRICULUM_G2_HTML = `
<div class="info-card">
  <h3>📊 2026입학생 — 2학년 교육과정</h3>
  <div class="highlight-box"><p>현 1학년이 <strong>2학년</strong> 때 배우게 될 전체 교육과정입니다.</p></div>

  <h4>📅 2학년 1학기 (31학점)</h4>
  <div style="font-size:12px;font-weight:700;margin:8px 0 4px;">🏫 학교지정 (16학점)</div>
  <table class="curriculum-table"><thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th></tr></thead>
  <tbody>
    <tr><td>국어</td><td>문학</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>수학</td><td>대수</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>영어</td><td>영어Ⅰ</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>체육</td><td>스포츠 생활1</td><td class="ct-fusion">융합</td><td>2</td></tr>
    <tr><td>예술</td><td>미술 창작 / 음악 연주와 창작 <span style="font-size:10px;color:var(--text-light);">[택1]</span></td><td class="ct-career">진로</td><td>2</td></tr>
  </tbody></table>
  <div style="font-size:12px;font-weight:700;color:var(--primary-dark);margin:10px 0 4px;">✏️ 학생선택 (15학점)</div>
  <table class="curriculum-table">
    <thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th><th>선택그룹</th></tr></thead>
    <tbody>
      <tr><td>국어</td><td>독서 토론과 글쓰기</td><td class="ct-fusion">융합</td><td>3</td><td rowspan="3" class="ct-group">[택1]<br><b>3학점</b></td></tr>
      <tr><td>수학</td><td>인공지능 수학</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>영어</td><td>세계 문화와 영어</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>사회와 문화</td><td class="ct-general">일반</td><td>3</td><td rowspan="7" class="ct-group">[택3]<br><b>9학점</b></td></tr>
      <tr><td>사회</td><td>현대사회와 윤리</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>사회</td><td>동아시아 역사 기행</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>물리학</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>과학</td><td>화학</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>과학</td><td>생명과학</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>과학</td><td>지구과학</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>스페인어</td><td class="ct-general">일반</td><td>3</td><td rowspan="3" class="ct-group">[택1]<br><b>3학점</b></td></tr>
      <tr><td>제2외국어</td><td>중국어</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>일본어</td><td class="ct-general">일반</td><td>3</td></tr>
    </tbody>
  </table>

  <h4>📅 2학년 2학기 (31학점)</h4>
  <div style="font-size:12px;font-weight:700;margin:8px 0 4px;">🏫 학교지정 (16학점)</div>
  <table class="curriculum-table"><thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th></tr></thead>
  <tbody>
    <tr><td>국어</td><td>화법과 언어</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>수학</td><td>미적분Ⅰ</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>영어</td><td>영어Ⅱ</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>체육</td><td>스포츠 생활2</td><td class="ct-fusion">융합</td><td>2</td></tr>
    <tr><td>예술</td><td>미술 창작 / 음악 연주와 창작 <span style="font-size:10px;color:var(--text-light);">[택1]</span></td><td class="ct-career">진로</td><td>2</td></tr>
  </tbody></table>
  <div style="font-size:12px;font-weight:700;color:var(--primary-dark);margin:10px 0 4px;">✏️ 학생선택 (15학점)</div>
  <table class="curriculum-table">
    <thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th><th>선택그룹</th></tr></thead>
    <tbody>
      <tr><td>국어</td><td>문학과 영상</td><td class="ct-career">진로</td><td>3</td><td rowspan="3" class="ct-group">[택1]<br><b>3학점</b></td></tr>
      <tr><td>수학</td><td>기하</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>영어</td><td>영어 발표와 토론</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>세계사</td><td class="ct-general">일반</td><td>3</td><td rowspan="7" class="ct-group">[택3]<br><b>9학점</b></td></tr>
      <tr><td>사회</td><td>세계시민과 지리</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>사회</td><td>법과 사회</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>역학과 에너지</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>물질과 에너지</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>세포와 물질대사</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>지구시스템과학</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>심화 스페인어</td><td class="ct-fusion">융합</td><td>3</td><td rowspan="3" class="ct-group">[택1]<br><b>3학점</b></td></tr>
      <tr><td>제2외국어</td><td>심화 중국어</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>심화 일본어</td><td class="ct-fusion">융합</td><td>3</td></tr>
    </tbody>
  </table>

  <div style="font-size:11px; color:var(--text-light); padding:6px 0;">
    <span style="color:#1565C0;">■ 일반선택</span> &nbsp;
    <span style="color:#C62828;">■ 진로선택</span> &nbsp;
    <span style="color:#D4A843;">■ 융합선택</span>
  </div>
</div>`;

// ── 2025입학생(현 2학년)이 보는 3학년 편제 ──
const CURRICULUM_G3_HTML = `
<div class="info-card">
  <h3>📊 2025입학생 — 3학년 교육과정</h3>
  <div class="highlight-box"><p>현 2학년이 <strong>3학년</strong> 때 배우게 될 전체 교육과정입니다.</p></div>

  <h4>📅 3학년 1학기 (30학점)</h4>
  <div style="font-size:12px;font-weight:700;margin:8px 0 4px;">🏫 학교지정 (13학점)</div>
  <table class="curriculum-table"><thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th></tr></thead>
  <tbody>
    <tr><td>국어</td><td>독서와 작문</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>수학</td><td>확률과 통계</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>영어</td><td>영어 독해와 작문</td><td class="ct-general">일반</td><td>3</td></tr>
    <tr><td>체육</td><td>운동과 건강</td><td class="ct-career">진로</td><td>2</td></tr>
  </tbody></table>
  <div style="font-size:12px;font-weight:700;color:var(--primary-dark);margin:10px 0 4px;">✏️ 학생선택 (17학점)</div>
  <table class="curriculum-table">
    <thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th><th>선택그룹</th></tr></thead>
    <tbody>
      <tr><td>국어</td><td>주제 탐구 독서</td><td class="ct-career">진로</td><td>3</td><td rowspan="7" class="ct-group">[택1]<br><b>3학점</b></td></tr>
      <tr><td>국어</td><td>매체 의사소통</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>국어</td><td>언어생활 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>수학</td><td>미적분Ⅱ</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>수학</td><td>수학과제 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>영어</td><td>심화 영어</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>영어</td><td>미디어 영어</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>도시의 미래 탐구</td><td class="ct-career">진로</td><td>3</td><td rowspan="22" class="ct-group">[택4]<br><b>12학점</b></td></tr>
      <tr><td>사회</td><td>동아시아 역사 기행</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>법과 사회</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>윤리와 사상</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>금융과 경제생활</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>기후변화와 지속가능한 세계</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>사회문제 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>여행지리</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>역사로 탐구하는 현대 세계</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>과학</td><td>물질과 에너지</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>전자기와 양자</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>역학과 에너지</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>화학 반응의 세계</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>생물의 유전</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>세포와 물질대사</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>지구시스템과학</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>행성우주과학</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>기후변화와 환경생태</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>기술·정보</td><td>생활과학 탐구</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>기술·정보</td><td>인공지능 기초</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>중국 문화</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>일본 문화</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>교양</td><td>교육의 이해</td><td class="ct-career">진로</td><td>2</td><td rowspan="6" class="ct-group">[택1]<br><b>2학점</b></td></tr>
      <tr><td>교양</td><td>보건</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>인간과 심리</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>생태와 환경</td><td class="ct-general">일반</td><td>2</td></tr>
      <tr><td>교양</td><td>논술</td><td class="ct-fusion">융합</td><td>2</td></tr>
      <tr><td>교양</td><td>인간과 경제활동</td><td class="ct-fusion">융합</td><td>2</td></tr>
    </tbody>
  </table>

  <h4>📅 3학년 2학기 (26학점)</h4>
  <div style="font-size:12px;font-weight:700;margin:8px 0 4px;">🏫 학교지정 (3학점)</div>
  <table class="curriculum-table"><thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th></tr></thead>
  <tbody>
    <tr><td>체육</td><td>스포츠 생활1</td><td class="ct-career">진로</td><td>2</td></tr>
    <tr><td>기술·정보</td><td>생애 설계와 자립</td><td class="ct-general">일반</td><td>1</td></tr>
  </tbody></table>
  <div style="font-size:12px;font-weight:700;color:var(--primary-dark);margin:10px 0 4px;">✏️ 학생선택 (23학점)</div>
  <table class="curriculum-table">
    <thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th><th>선택그룹</th></tr></thead>
    <tbody>
      <tr><td>국어</td><td>주제 탐구 독서</td><td class="ct-career">진로</td><td>3</td><td rowspan="7" class="ct-group">[택3]<br><b>9학점</b></td></tr>
      <tr><td>국어</td><td>매체 의사소통</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>국어</td><td>언어생활 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>수학</td><td>미적분Ⅱ</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>수학</td><td>수학과제 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>영어</td><td>심화 영어</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>영어</td><td>미디어 영어</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>도시의 미래 탐구</td><td class="ct-career">진로</td><td>3</td><td rowspan="22" class="ct-group">[택4]<br><b>12학점</b></td></tr>
      <tr><td>사회</td><td>동아시아 역사 기행</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>법과 사회</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>윤리와 사상</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>금융과 경제생활</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>기후변화와 지속가능한 세계</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>사회문제 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>여행지리</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>역사로 탐구하는 현대 세계</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>과학</td><td>물질과 에너지</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>전자기와 양자</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>역학과 에너지</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>화학 반응의 세계</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>생물의 유전</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>세포와 물질대사</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>지구시스템과학</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>행성우주과학</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>기후변화와 환경생태</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>기술·정보</td><td>생활과학 탐구</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>기술·정보</td><td>인공지능 기초</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>중국 문화</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>일본 문화</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>교양</td><td>교육의 이해</td><td class="ct-career">진로</td><td>2</td><td rowspan="6" class="ct-group">[택1]<br><b>2학점</b></td></tr>
      <tr><td>교양</td><td>보건</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>인간과 심리</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>생태와 환경</td><td class="ct-general">일반</td><td>2</td></tr>
      <tr><td>교양</td><td>논술</td><td class="ct-fusion">융합</td><td>2</td></tr>
      <tr><td>교양</td><td>인간과 경제활동</td><td class="ct-fusion">융합</td><td>2</td></tr>
    </tbody>
  </table>

  <div style="font-size:11px; color:var(--text-light); padding:6px 0;">
    <span style="color:#1565C0;">■ 일반선택</span> &nbsp;
    <span style="color:#C62828;">■ 진로선택</span> &nbsp;
    <span style="color:#D4A843;">■ 융합선택</span>
  </div>
</div>`;

// ── 2026입학생(현 1학년)이 보는 3학년 편제 ──
const CURRICULUM_G3_2026_HTML = `
<div class="info-card" style="margin-top:18px;">
  <h3>📊 2026입학생 — 3학년 교육과정</h3>
  <div class="highlight-box"><p>현 1학년이 <strong>3학년</strong> 때 배우게 될 전체 교육과정입니다.</p></div>

  <h4>📅 3학년 1학기 (26학점)</h4>
  <div style="font-size:12px;font-weight:700;margin:8px 0 4px;">🏫 학교지정 (6학점)</div>
  <table class="curriculum-table"><thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th></tr></thead>
  <tbody>
    <tr><td>수학</td><td>확률과 통계</td><td class="ct-general">일반</td><td>4</td></tr>
    <tr><td>체육</td><td>체육1</td><td class="ct-general">일반</td><td>2</td></tr>
  </tbody></table>
  <div style="font-size:12px;font-weight:700;color:var(--primary-dark);margin:10px 0 4px;">✏️ 학생선택 (20학점)</div>
  <table class="curriculum-table">
    <thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th><th>선택그룹</th></tr></thead>
    <tbody>
      <tr><td>국어</td><td>독서와 작문</td><td class="ct-general">일반</td><td>3</td><td rowspan="16" class="ct-group">[택6]<br><b>18학점</b></td></tr>
      <tr><td>국어</td><td>주제탐구독서</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>수학</td><td>미적분Ⅱ</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>영어</td><td>영어 독해와 작문</td><td class="ct-general">일반</td><td>3</td></tr>
      <tr><td>영어</td><td>심화 영어 독해와 작문</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>도시의 미래 탐구</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>윤리와 사상</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>사회</td><td>정치</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>전자기와 양자</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>화학 반응의 세계</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>생물의 유전</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>과학</td><td>행성우주과학</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>스페인 문화</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>중국 문화</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>일본 문화</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>기술·정보</td><td>인공지능 기초</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>교양</td><td>생태와 환경</td><td class="ct-general">일반</td><td>2</td><td rowspan="7" class="ct-group">[택1]<br><b>2학점</b></td></tr>
      <tr><td>교양</td><td>교육의 이해</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>보건</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>인간과 철학</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>인간과 심리</td><td class="ct-career">진로</td><td>2</td></tr>
      <tr><td>교양</td><td>인간과 경제활동</td><td class="ct-fusion">융합</td><td>2</td></tr>
      <tr><td>교양</td><td>논술</td><td class="ct-fusion">융합</td><td>2</td></tr>
    </tbody>
  </table>

  <h4>📅 3학년 2학기 (26학점)</h4>
  <div style="font-size:12px;font-weight:700;margin:8px 0 4px;">🏫 학교지정 (2학점)</div>
  <table class="curriculum-table"><thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th></tr></thead>
  <tbody>
    <tr><td>체육</td><td>체육2</td><td class="ct-general">일반</td><td>2</td></tr>
  </tbody></table>
  <div style="font-size:12px;font-weight:700;color:var(--primary-dark);margin:10px 0 4px;">✏️ 학생선택 (24학점)</div>
  <table class="curriculum-table">
    <thead><tr><th>교과</th><th>과목명</th><th>유형</th><th>학점</th><th>선택그룹</th></tr></thead>
    <tbody>
      <tr><td>기술·정보</td><td>생활과학 탐구</td><td class="ct-career">진로</td><td>3</td><td rowspan="17" class="ct-group">[택8]<br><b>24학점</b></td></tr>
      <tr><td>과학</td><td>융합과학 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>국어</td><td>언어생활 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>국어</td><td>매체 의사소통</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>수학</td><td>수학과제 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>영어</td><td>심화 영어</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>영어</td><td>미디어 영어</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>사회문제 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>여행지리</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>역사로 탐구하는 현대 세계</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>사회</td><td>윤리문제 탐구</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>과학</td><td>과학의 역사와 문화</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>과학</td><td>기후변화와 환경생태</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>기술·정보</td><td>소프트웨어와 생활</td><td class="ct-fusion">융합</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>스페인어 회화</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>중국어 회화</td><td class="ct-career">진로</td><td>3</td></tr>
      <tr><td>제2외국어</td><td>일본어 회화</td><td class="ct-career">진로</td><td>3</td></tr>
    </tbody>
  </table>

  <div style="font-size:11px; color:var(--text-light); padding:6px 0;">
    <span style="color:#1565C0;">■ 일반선택</span> &nbsp;
    <span style="color:#C62828;">■ 진로선택</span> &nbsp;
    <span style="color:#D4A843;">■ 융합선택</span>
  </div>
</div>`;
