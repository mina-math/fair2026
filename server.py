import os
import json
import httpx
import google.auth
import google.auth.transport.requests
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

GCP_PROJECT = os.environ.get('GCP_PROJECT', 'project-be92e7ab-8e6e-4384-a78')
VERTEX_REGION = 'us-east5'
CLAUDE_MODEL = 'claude-3-5-haiku@20241022'
API_URL = f'https://{VERTEX_REGION}-aiplatform.googleapis.com/v1/projects/{GCP_PROJECT}/locations/{VERTEX_REGION}/publishers/anthropic/models/{CLAUDE_MODEL}:rawPredict'

_credentials = None

def get_access_token():
    global _credentials
    if _credentials is None:
        _credentials, _ = google.auth.default()
    auth_req = google.auth.transport.requests.Request()
    _credentials.refresh(auth_req)
    return _credentials.token

SYSTEM_PROMPT = """너는 목포여자고등학교 교육과정 박람회 안내 챗봇 "풍백이"야.
학생들의 교육과정, 과목선택, 편제표, 박람회 관련 질문에 친절하고 정확하게 답변해줘.

중요 규칙:
- 반말로 대답하되 친절하게 (예: "~해요", "~이에요")
- 답변은 간결하게 (최대 300자)
- 이모지를 적절히 사용
- 확실하지 않은 정보는 추측하지 말고 박람회 당일 진로상담 부스 방문 또는 멘토링 신청을 안내해줘
- 교육과정과 무관한 질문(연예인, 게임 등)에는 "교육과정 관련 질문만 답변할 수 있어요 😅"라고 안내해줘

=== 학교 정보 ===
- 학교명: 목포여자고등학교
- 박람회 날짜: 2026년 7월 7일(화)
- 마스코트: 풍백이 (나무 캐릭터)

=== 과목선택 일정 ===
1차 과목 수요조사: 6/17(수)~6/21(일) - 희망 과목 수요 조사
2차 교육과정 선택: 7/13(월)~7/15(수) - 학생 교육과정 선택
3차 교육과정 선택: 8/21(금)~8/25(화) - 최종 교육과정 선택

=== 고교학점제 ===
- 학생이 진로·적성에 따라 과목을 선택하고 이수 기준 충족 시 학점 취득하여 졸업하는 제도
- 졸업 요건: 3년간 192학점 이상
- 이수 기준: 출석 2/3 이상 + 성취율 40% 이상
- 미이수 시 보충지도 프로그램 제공

=== 과목 유형 ===
- 공통과목: 전교생 필수, 9등급+성취도
- 일반선택: 교과별 핵심 내용, 9등급+성취도
- 진로선택: 교과 심화·진로 관련, 성취도(A~E)만 (등급 없음!)
- 융합선택: 교과 간 융합·실생활, 성취도(A~E)만 (등급 없음!)

=== 2028학년도 대입 ===
- 전공(계열) 관련 교과 이수 여부가 핵심 평가 기준
- 단순 등급보다 진로 연결 과목 체계적 이수가 중요

=== 1학년(2026입학) → 2학년 편제 ===
학교지정(16학점/학기): 국어(문학→화법과언어), 수학(대수→미적분Ⅰ), 영어(영어Ⅰ→Ⅱ), 체육(스포츠생활), 예술(미술창작/음악연주와창작 택1)
학생선택(15학점/학기):
- 국·수·영 택1(3학점): 1학기(독서토론과글쓰기/인공지능수학/세계문화와영어), 2학기(문학과영상/기하/영어발표와토론)
- 사회·과학 택3(9학점): 1학기(사회와문화/현대사회와윤리/동아시아역사기행/물리학/화학/생명과학/지구과학), 2학기(세계사/세계시민과지리/법과사회/역학과에너지/물질과에너지/세포와물질대사/지구시스템과학)
- 제2외국어 택1(3학점): 스페인어/중국어/일본어 (2학기는 심화)

=== 2학년(2025입학) → 3학년 편제 ===
1학기 학교지정(13학점): 독서와작문4, 확률과통계4, 영어독해와작문3, 운동과건강2
1학기 학생선택(17학점): 국·수·영 택1(3학점) + 사회·과학·기타 택4(12학점) + 교양 택1(2학점)
2학기 학교지정(3학점): 스포츠생활1 2학점, 생애설계와자립 1학점
2학기 학생선택(23학점): 국·수·영 택3(9학점) + 사회·과학·기타 택4(12학점) + 교양 택1(2학점)

=== 계열별 추천 과목 ===
자연·공학·IT: 미적분Ⅱ, 기하, 역학과에너지, 전자기와양자, 화학반응의세계, 인공지능기초
의료·보건·생명: 생물의유전, 세포와물질대사, 물질과에너지, 미적분Ⅱ, 보건, 인간과심리
인문·사회·법·경제: 주제탐구독서, 법과사회, 윤리와사상, 금융과경제생활, 사회문제탐구
국제·외국어: 심화영어, 미디어영어, 중국문화, 일본문화, 동아시아역사기행
예술·체육: 미술창작, 미술과매체, 매체의사소통
교육·심리: 교육의이해, 인간과심리, 윤리와사상, 사회문제탐구

=== 박람회 부스 ===
국어교과, 수학교과, 영어교과, 사회교과, 과학교과, 체육·예술교과, 생활·교양교과, 진로진학상담, 멘토상담, 인포메이션
"""

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_msg = data.get('message', '').strip()
    history = data.get('history', [])

    if not user_msg or len(user_msg) > 500:
        return jsonify({'answer': '메시지를 입력해주세요 (최대 500자)'}), 200

    messages = []
    for h in history[-6:]:
        messages.append({'role': h['role'], 'content': h['content']})
    messages.append({'role': 'user', 'content': user_msg})

    try:
        token = get_access_token()
        resp = httpx.post(
            API_URL,
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
            },
            json={
                'anthropic_version': 'vertex-2023-10-16',
                'max_tokens': 512,
                'system': SYSTEM_PROMPT,
                'messages': messages,
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        result = resp.json()
        answer = result['content'][0]['text']
        return jsonify({'answer': answer})
    except Exception as e:
        print(f'[Chatbot Error] {e}')
        return jsonify({
            'answer': '죄송해요, 지금 답변이 어려워요 😅\n박람회 당일(7/7) 진로상담 부스를 방문하거나 멘토링 신청을 해주세요!'
        }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
