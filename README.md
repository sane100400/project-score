# PROJECT:SCORE

> IT 프로젝트 주제를 시작하기 전에, 이 아이디어가 정말 시작해도 될 만큼 준비됐는지 스스로 진단하는 **체스판 듀얼 트랙 자가진단**.

지금 보고 있는 버전은 **v3.0 — Dual Track White/Black**입니다. 점수 만점은 **♔ White 10점 / ♚ Black 10점**, 두 트랙은 서로 다른 질문·가중치·임계값으로 독립 채점됩니다. 정적 사이트로, 응답은 기본적으로 브라우저에만 머물고 사용자가 직접 "익명 통계 제출" 버튼을 눌러야 서버로 갑니다.

```
질문 21 (♔ 12 / ♚ 9)  ·  게이트 5 (♚)  ·  플래그 6 (R1, R2, R3, P1, P2, P3)  ·  필수체크 1 (맨먼스)
```

---

## 왜 만들었나

프로젝트 주제를 고를 때 가장 자주 저지르는 실수는 **"좋아 보인다"와 "할 수 있다"를 분리하지 못하는 것**입니다. 머릿속에서는 어떤 아이디어든 멋있게 들립니다. 문제가 시작되는 지점은 거의 항상 다음 둘 중 하나입니다.

- 주제 자체가 약함 — 이미 누가 했고, 차별점이 없고, 실제로 절실한 사람이 없거나, 깊이가 없습니다.
- 실행이 안 됨 — 범위가 비현실적이고, 산출물 기준이 없고, 검증 방법이 없고, 운영 자원이 안 잡혀 있습니다.

**이 둘은 다른 종류의 문제입니다.** "주제는 좋은데 실행이 안 된다"와 "실행은 되는데 주제가 약하다"는 처방이 서로 다릅니다. v3.0은 이 둘을 **체스판의 흑/백처럼 분리해서** 각 트랙이 자기 책임만 지도록 설계했습니다.

---

## 체스판 듀얼 트랙

### ♔ WHITE — 주제 진단 (10점)

이 주제 자체가 시작할 만한 주제인가? 가치·차별성·깊이·인상.

| 축 | 한국어 | 의미 | 질문 수 | 가중합 |
|---|---|---|---:|---:|
| V | 가치 (Value) | 중요성 · 시의성 | 3 | 21 |
| O | 독창성 (Originality) | 새로움 · 차별점 | 3 | 21 |
| X | 깊이 (Depth) | 세련됨 · 논리 | 3 | 20 |
| I | 영향력 (Impact) | 트렌드 · 인상 · 발전성 | 3 | 19 |

```
whiteScore = (whiteRaw / whiteMaxWeight) × 10
```

White 트랙은 가산식 단순 비율입니다. 게이트도 감점 플래그도 없고, 오직 **R1(튜토리얼 복제) 하드 리젝트**만 즉시 RETHINK로 만듭니다.

### ♚ BLACK — 실행 진단 (10점)

실제로 끝까지 갈 수 있는가? 계획·산출물·검증.

| 축 | 한국어 | 의미 | 질문 수 | 가중합 |
|---|---|---|---:|---:|
| S | 계획 (Planning) | 일정 · 자원 · 정의 | 3 | 21 |
| D | 산출물 (Deliverables) | 완성 기준 · 재현성 | 3 | 24 |
| E | 검증 (Validation) | 지표 · 반복 | 3 | 21 |

```
blackScore = max(0, (blackRaw / blackMaxWeight) × 8 + gateScore − penalties)
gateScore  = (passedGates / 5) × 2
```

Black 트랙은 질문 80%(8점) + 게이트 20%(2점) - 감점. 게이트 중 하나라도 실패하면 점수와 무관하게 **REVISE**, R2/R3 하드 리젝트는 즉시 RETHINK입니다.

### 진단 범위

사용자는 셋 중 하나를 고를 수 있습니다.

- **♔ 주제만** — 아이디어가 괜찮은지만 보고 싶을 때
- **♚ 실행만** — 주제는 정해졌고 준비도만 점검할 때
- **♔♚ 둘 다** (기본값) — 둘 다 진단

---

## 목적 모드 — 임계값 차등

같은 점수라도 목적이 다르면 **합격선이 달라야 합니다.** 학습용으로 5점이면 충분한 주제도, 공모전용으로는 부족합니다. 그래서 모드를 먼저 고르게 하고, 모드별로 ① 임계값 ② 일부 가중치 ③ 일부 플래그 활성 여부를 바꿉니다.

| 모드 | White: PASS / ALMOST / LEARN | Black: PASS / ALMOST / LEARN | 비고 |
|---|---|---|---|
| 🎒 배우려고 | 4.0 / 2.5 / 1.0 | 5.5 / 4.0 / 2.5 | R1(튜토리얼 복제) 자동 비활성화, O1–O2·I1–I3 가중치 감소 |
| 🛠 만들어보려고 | 6.0 / 4.5 / 3.0 | 7.0 / 5.5 / 4.0 | 기본값 |
| 🏆 보여주려고 | 7.5 / 6.0 / 4.5 | 8.0 / 6.5 / 5.0 | 가장 엄격 |

학습 모드에서 R1을 끄는 것은, **튜토리얼 복제가 학습 목적에서는 정당한 선택**이라는 판단입니다. 같은 행동이 컨텍스트에 따라 가점이 되기도 감점이 되기도 합니다.

---

## 프로젝트 성격(타입) — 질문 분기

IT 프로젝트는 "개발 vs 연구" 이분법이 아닙니다. 4종을 복수 선택할 수 있고, 단일 선택일 때만 일부 질문(D1·D2·D3·E1)의 문구가 해당 성격에 맞게 분기됩니다.

- `개발 (dev)` — 앱·서비스·제품·도구
- `연구 (research)` — 실험·분석·조사·논문
- `기여 (contrib)` — 오픈소스 PR·커뮤니티·생태계
- `콘텐츠 (content)` — 기술 글·강의·교재

가령 D1 "끝의 정의"는 `dev`에서는 *"핵심 기능이 돌아가면 끝"* 으로, `research`에서는 *"산출물의 형태와 분량"* 으로, `content`에서는 *"글자 수·시간"* 으로 표현이 바뀝니다.

---

## 필수체크 — 맨먼스 (점수 미반영)

제출 전 반드시 응답해야 하는 항목입니다. **점수에는 들어가지 않지만**, 두 트랙 모두에서 노출되며 비어 있으면 제출 버튼이 활성화되지 않습니다.

```
총 환산 시간 = 인원 × 평일 작업일수(시작일~종료일) × 하루 작업시간
```

날짜 범위 picker로 받은 시작/종료일에서 평일만 자동 카운트합니다. 시간이 계산되면 confirm 버튼이 *"정말 약 NNN시간을 투자할 만한 프로젝트입니까?"* 라는 문구로 바뀝니다. 이 질문은 점수가 아니라 **자기 인식**을 강제합니다 — 화려한 점수에 떠밀려 "그 정도면 됐다"고 넘어가는 패턴을 막는 장치입니다.

---

## 게이트 (♚ 전용, 5개)

채점이 아니라 **운영의 하드 체크포인트**입니다. 시간·리뷰어·기록 공간·일정·중단 기준. 하나라도 "아직"이면 점수 무관하게 REVISE.

| ID | 항목 |
|---|---|
| G1 | 시간 확보 (주당 몇 시간 이상) |
| G2 | 피드백 줄 사람 최소 1명 정해짐 |
| G3 | 진행 기록 공간 열려 있음 |
| G4 | 마감 + 중간 점검 시점 달력에 있음 |
| G5 | 중단 기준 정해져 있음 |

---

## 플래그 (6개)

| ID | 종류 | 트랙 | 의미 | 처리 |
|---|---|---|---|---|
| R1 | 리젝트 | ♔ | 튜토리얼/강의 그대로 복제 | White 즉시 RETHINK |
| R2 | 리젝트 | ♚ | 핵심 자원(데이터·API·장비) 확보 불가 | Black 즉시 RETHINK |
| R3 | 리젝트 | ♚ | 법·윤리 위험 (해결 계획 없음) | Black 즉시 RETHINK |
| P1 | 감점 | ♚ | 범위 과대 (기간 대비 완성 제품 수준) | −1.0 |
| P2 | 감점 | ♚ | 검증 방법 없음 | −1.5 |
| P3 | 감점 | ♚ | 기록 안 남김 (실행법·근거 문서화 없음) | −1.0 |

---

## 판정 (5종)

| 코드 | 라벨 | 의미 |
|---|---|---|
| `pass` | GO · 가시죠 | 시작해도 됨 |
| `conditional` | ALMOST · 조금만 더 다듬으시죠 | 약한 축부터 보강 |
| `study` | LEARN FIRST · 먼저 배우시죠 | 본 프로젝트 대신 스터디·프로토타입 |
| `revise` | REVISE · 다시 생각해보시죠 | 필수 항목 누락 (게이트) |
| `reject` | RETHINK · 주제를 다시 | 이 주제로는 어려움 (리젝트 플래그 또는 점수 부족) |

---

## 점수 표시 정책

점수와 판정은 **제출 전까지 봉인**되어 있습니다. 화면에 `—` 자리표시자로만 보이고, "익명 통계 제출"을 눌러 서버 저장이 끝나야 공개됩니다. 이는 사용자가 점수에 맞춰 답을 조정하는 anchoring 효과를 막기 위한 의도된 제약입니다.

---

## 질문 구성의 근거 (Reference Map)

각 축은 임의로 만든 것이 아니라, 국내·국제 평가 프레임워크에서 공통적으로 등장하는 주제를 뽑아 분류한 것입니다. 더 자세한 근거 표는 `deep-research-report.md`에 있습니다.

### ♔ White Track

| 축 | 정당화 근거 | 핵심 근거 인용 |
|---|---|---|
| **V (Value)** | 캡스톤·대회 심사기준에서 항상 가장 큰 비중을 차지하는 항목. "누가/무엇을/왜"의 명료성과 시의성·기대효과로 구성. | LINC 3.0 캡스톤 경진대회 "기대효과" 35점 비중, Google Solution Challenge "Impact" 항목, AAC&U Problem Solving VALUE Rubric "Define Problem". |
| **O (Originality)** | "이미 누가 했다 / 차별점이 무엇이다"를 R&D 정의 수준에서 강제. copy/imitate 배제. | OECD Frascati Manual 2015 §2 — R&D 5요건(novel, creative, uncertain, systematic, transferable). 단순 모방은 novelty 기준에서 배제. |
| **X (Depth)** | 표면적 아이디어가 아니라 "한 겹 더 파고든 주제"인가, 논리 흐름이 매끄러운가. PBL의 *sustained inquiry*와 ISO 요구사항의 *unambiguous·complete*에서 도출. | Gold Standard PBL "Challenging Problem & Sustained Inquiry", ISO/IEC/IEEE 29148:2018 좋은 요구사항 속성. |
| **I (Impact)** | 트렌드 정합성·청자 인상·발전 가능성. Imagine Cup의 시장성/혁신성, Google Solution Challenge의 *Scalability·Next Steps* 강조에서 추출. | Imagine Cup 2026 심사기준 "uniqueness/marketability(30)", Google Solution Challenge "Scalability". |

### ♚ Black Track

| 축 | 정당화 근거 | 핵심 근거 인용 |
|---|---|---|
| **S (Planning)** | 한 문장 정의·주 단위 일정·자원과 역량 격차. 정부 R&D 공고와 ICT멘토링 가이드의 "프로젝트 등록 필수 항목"이 직접 모델. | ICT멘토링 프로젝트 절차(2024) 기획 필수 항목, INCOSE Requirements Working Group 좋은 요구사항. |
| **D (Deliverables)** | "이것만 되면 끝"의 정의 + 재현 가능성 + 전체 구조도. 요구사항 공학의 *acceptance criteria*와 NASA TRL의 단계별 산출물에서 도출. | ISO/IEC/IEEE 29148:2018 요구사항 산출물 정의, NASA TRL Definitions 단계별 출구 기준, CS2023 Curriculum "design/develop/document/evaluate". |
| **E (Validation)** | 성공 숫자 기준 + 피드백 반복 루프 + 가장 위험한 가정 검증. 글로벌 학생대회가 항상 별도 항목으로 두는 *Feedback/Testing/Iteration*. | Google Solution Challenge "Feedback/Testing/Iteration" 항목, Imagine Cup "사용자 검증·개선(30)", Gold Standard PBL "Critique & Revision". |

### 게이트 5개

운영 가능성을 점수가 아니라 *yes/no*로 끊는 장치입니다. AAC&U *Problem Solving Rubric*이 "최종 산출물만으로는 부족하며 과정 증거가 필요"하다고 명시한 점, 그리고 정부 사업 공고의 사전검토→평가 컷오프 구조에서 차용했습니다. (참고: 융합보안핵심인재양성 사업 공고(2026) 절차)

### 플래그 6개

- **R1 (튜토리얼 복제)** ← Frascati Manual의 copy/imitate 배제
- **R2 (자원 미확보)** ← INCOSE 좋은 요구사항의 *feasible* 속성
- **R3 (법·윤리 위반 위험)** ← Imagine Cup·국내 대회 규정의 윤리·저작권 조항
- **P1 (스코프 과대)** ← TRL 단계 정합성 + LINC 3.0 "실현가능성"
- **P2 (검증 불가)** ← ISO 29148 *verifiable* 속성, Google SC *Feedback*
- **P3 (문서화 없음)** ← CS2023 "document", ISO 29148 정보 항목 정의

### 점수 0–2 스케일

각 질문을 0(없음/모르겠음) / 1(부분/일부) / 2(확실/근거 포함)로 받는 것은 CVSS 스타일 정량화 + AAC&U VALUE 루브릭의 4단계 *Capstone–Milestone–Benchmark–Pre*를 단순화한 것입니다. 0–2점은 한 번에 응답 가능한 인지 부담을 유지하면서, 가중치 곱셈으로 충분한 분해능을 만듭니다.

### 만점 10 + 분리 채점

CVSS Base Score가 0–10인 점, 그리고 이 시스템이 *해석 가능한* 단일 숫자(예: "7.5")를 한 줄에 쓸 수 있어야 한다는 점에서 동일 스케일을 채택했습니다. 단, 단일 점수의 단점(서로 다른 약점이 같은 점수를 만드는 문제)을 줄이기 위해 **트랙을 분리**하고 **축별 막대**를 항상 함께 표시합니다.

---

## 1차 출처 목록

자세한 인용·매핑은 `deep-research-report.md`에 정리되어 있습니다.

- LINC 3.0 캡스톤디자인 경진대회 심사 기준 (2023)
- Google Solution Challenge Official Rules (2024)
- Microsoft Imagine Cup Official Rules (2026 시즌)
- OECD Frascati Manual 2015 — R&D 정의
- NASA Technology Readiness Levels (TRL)
- ISO/IEC/IEEE 29148:2018 — Requirements Engineering
- INCOSE Requirements Working Group — Guide for Writing Requirements
- AAC&U Problem Solving VALUE Rubric
- Buck Institute — Gold Standard PBL: Essential Project Design Elements
- ACM/IEEE CS2023 Curriculum Guidelines
- 정보통신산업진흥원 ICT멘토링 / 한이음 드림업 사업 가이드 (2024–2026)
- 융합보안핵심인재양성 사업 공고 (2026) — 평가 절차 구조 참고
- 캡스톤 디자인 교과 평가 루브릭 개발 연구 (2024) — 다중 산출물 루브릭
- 캡스톤 기반 학습성과 평가 사례 (2010) — 기준 사전 공개의 효과

---

## 데이터 흐름 / 빌드

`questions.md`가 단일 진실 원천(SoT)이고, `node build.cjs`로 검증·sanitize 후 `questions.js`를 생성합니다.

```
questions.md  ──build.cjs──►  questions.js  ──app.js──►  index.html
   (사람이 편집)              (자동 생성, 직접 편집 금지)        (정적 마크업)
```

빌드 단계가 하는 것:
- HTML/XSS sanitization
- ID·숫자 형식 검증 (실패 시 빌드 중단)
- 축·플래그 cross-reference 체크
- tone(`white`/`black`) · kind(`reject`/`penalty`) 화이트리스트

```bash
node build.cjs           # questions.md → questions.js
python3 -m http.server   # http://localhost:8000
```

Vercel은 `vercel.json`의 `buildCommand: "node build.cjs"`로 푸시 시 자동 재빌드합니다.

---

## 파일 구조

```
.
├── index.html                # 마크업: 헤더·히어로·모드·탭바·♔♚ 두 패널·플래그·제출
├── styles.css                # 다크 모노 + ♔ 트랙 elevated 톤, 8px 그리드, 3단 반응형
├── app.js                    # 상태·듀얼 채점·렌더·동기화·결과 export·서버 제출
├── questions.md              # 단일 진실 원천 (사람 편집)
├── questions.js              # 자동 생성 (직접 편집 금지)
├── build.cjs                 # MD → JS 빌드 + 검증
├── api/                      # 익명 통계 제출 백엔드 (Neon Postgres + BotID)
├── vercel.json               # buildCommand, CSP, 보안 헤더
├── deep-research-report.md   # 축·문항·임계값의 출처와 인용
├── guide.md                  # questions.md 작성 규칙
└── README.md                 # 이 문서
```

---

## 버전 이력

- **v3.0** — 듀얼 트랙(♔ White / ♚ Black), 21질문, 5게이트, 6플래그, 4타입, 모드별 임계값/가중치 차등, 익명 통계 제출, 결과 봉인(제출 후 공개), 맨먼스 필수체크
- v1.2 — 체스판 모노 리빌드, 10점 만점 전환, 5타입 다중 선택, Markdown 내보내기 (단일 트랙)
- v1.1 — Material 3 다크 테마, 목적 모드 도입 (폐기)
- v1.0 — 초기 흑백 프로토타입

---

## 라이선스

MIT.
