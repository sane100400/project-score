# PROJECT:SCORE

> 프로젝트 주제를 시작하기 전에, 이게 정말 시작해도 되는 아이디어인지 한 페이지 안에서 마주하게 만드는 자가진단.

머릿속의 아이디어는 항상 멋있게 들립니다. 그게 문제입니다. 대부분의 주제는 (1) 이미 누가 비슷한 걸 했거나, (2) 실제로 불편한 사람이 없거나, (3) 기간 안에 도저히 못 끝내거나, (4) 끝나도 "끝"이 어딘지 본인도 모릅니다. PROJECT:SCORE는 이 네 가지가 무너지는 지점을, 시작 전에 먼저 보여주려고 만들었습니다.

지금 버전은 **v3.0 — Dual Track White/Black**입니다. 정적 사이트로 동작하고, 응답은 기본적으로 브라우저에만 머물며, "익명 통계 제출"을 직접 누른 경우에만 서버로 갑니다.

---

## 왜 트랙을 둘로 나눴는가

이전 버전(v1.2)은 단일 점수였습니다. 14개 질문을 한 통에 넣고 10점을 뽑았는데, 같은 7점이 두 가지 완전히 다른 상황에서 나왔습니다.

- **"주제는 좋은데 실행 준비가 0인" 7점** — 처방: 일정 짜고 산출물 정의하라
- **"실행은 매끈한데 주제가 약한" 7점** — 처방: 다른 주제 찾아라

같은 숫자에서 정반대 처방이 나오는 점수는 점수가 아닙니다. 그래서 v3.0에서는 체스판처럼 흑백을 갈랐습니다.

**♔ White** — *이 주제 자체가 시작할 만한가?* 가치(V), 독창성(O), 깊이(X), 영향력(I). 12개 질문, 10점.

**♚ Black** — *실제로 끝까지 갈 수 있는가?* 계획(S), 산출물(D), 검증(E). 9개 질문 + 5개 운영 게이트 + 3개 감점 플래그. 10점.

각 트랙은 자기 책임만 집니다. White가 9점이어도 Black이 4점이면 두 결과 모두 그대로 보여줍니다. 평균을 내거나 한쪽이 다른 쪽을 가려주는 일은 없습니다. 트랙 하나만 보고 싶으면 진단 범위에서 *주제만 / 실행만 / 둘 다*를 고르면 됩니다.

---

## 채점 방식

**White:** 답한 질문의 가중합을 가중치 합으로 나눠 10점 스케일로 환산. 추가 가감 없음.

```
whiteScore = (whiteRaw / whiteMaxWeight) × 10
```

White 트랙에서 점수와 무관하게 작동하는 것은 단 하나, 하드 리젝트 플래그 R1(*튜토리얼/강의를 거의 그대로 따라 만들었음*)뿐입니다. R1이 켜지면 White는 점수와 무관하게 RETHINK입니다.

**Black:** 질문이 8점, 운영 게이트가 2점, 감점 플래그가 차감.

```
blackScore = max(0, (blackRaw / blackMaxWeight) × 8 + (passedGates / 5) × 2 − penalties)
```

게이트 5개는 *시간 확보 / 피드백 줄 사람 / 기록 공간 / 마감과 점검 시점 / 중단 기준*입니다. 채점이 아니라 운영의 yes/no 체크포인트입니다. 하나라도 "아직"이면 점수와 무관하게 REVISE. R2(자원 미확보)나 R3(법·윤리 위험)가 켜지면 Black은 즉시 RETHINK입니다. 감점 플래그(P1 범위 과대 −1.0, P2 검증 불가 −1.5, P3 기록 없음 −1.0)는 점수에서 빠집니다.

목적 모드에 따라 합격선이 달라집니다. 학습용 4.0이 공모전에서는 부족하기 때문입니다.

| | 🎒 배우려고 | 🛠 만들어보려고 | 🏆 보여주려고 |
|---|---:|---:|---:|
| White PASS | 4.0 | 6.0 | 7.5 |
| Black PASS | 5.5 | 7.0 | 8.0 |

학습 모드에서는 R1(튜토리얼 복제)이 자동으로 비활성화됩니다. 같은 행동이 학습 목적에서는 정당한 선택이고 포트폴리오 목적에서는 감점이라는 사실을 점수기 자체가 인정해야 한다는 판단입니다.

---

## 점수는 제출 전까지 봉인됩니다

질문에 답하는 동안 화면의 점수와 판정 자리에는 `—`만 표시됩니다. "익명 통계 제출"을 눌러야 비로소 공개됩니다. 의도된 마찰입니다. 점수가 실시간으로 보이면 사람은 점수에 맞춰 답을 미세 조정합니다 — 솔직한 진단이 아니라 원하는 결과를 만드는 도구로 변합니다. 한 번에 끝까지 다 채워야 한다는 제약이 anchoring을 막습니다.

---

## 맨먼스가 따로 있는 이유

White 9점, Black 8점을 받고 *"좋은 주제다"* 라고 결론 내려도, 그 프로젝트가 4명 × 6개월 × 하루 8시간이라는 사실 앞에 서면 다른 질문이 됩니다. 점수는 *주제와 실행 계획의 품질*을 보지, *그 시간을 정말 쓸 만한가*는 묻지 않습니다.

그래서 제출 직전, 두 트랙 모두에서 인원·작업 기간(시작일~종료일)·하루 작업시간을 입력받고 — 평일만 자동 카운트해 — 총 환산 시간을 계산한 뒤, **"정말 약 NNN시간을 투자할 만한 프로젝트입니까?"** 라는 한 줄을 띄웁니다. 점수에는 들어가지 않지만 이 칸이 비어 있으면 제출되지 않습니다. 점수가 좋아도 시간 앞에서는 한 번 더 멈춰야 합니다.

---

## 질문은 어디서 왔는가

축과 질문은 한국 캡스톤·글로벌 학생대회·요구사항 표준 세 갈래의 교집합에서 뽑았습니다.

가치(V)와 영향력(I)에서 가장 큰 가중치를 준 건 LINC 3.0 캡스톤 경진대회 심사표가 *기대효과* 35점이라는 압도적 비중을 두기 때문이고, Google Solution Challenge가 Impact를 별도 항목으로 분리하기 때문입니다. 독창성(O)의 *"이미 누가 비슷한 걸 해놓은 건 아닌가요"* 와 R1 플래그는 OECD Frascati Manual 2015가 R&D를 *novel·creative·uncertain·systematic·transferable* 5요건으로 정의하면서 *copy/imitate*를 명시적으로 배제한 데서 옵니다. 깊이(X)의 *"한 겹 더 파고든 주제인가"* 는 Buck Institute의 Gold Standard PBL이 좋은 프로젝트의 첫 요소로 꼽는 *challenging problem & sustained inquiry*가 출처입니다.

산출물(D)의 *"이것만 되면 끝"의 한 문장* 은 ISO/IEC/IEEE 29148:2018이 좋은 요구사항을 *unambiguous·complete·feasible·verifiable*로 규정하고 INCOSE Requirements Guide가 acceptance criteria를 핵심으로 두는 점에서 직접 빌려왔습니다. NASA TRL이 단계별로 *증거 요구 수준*이 올라간다는 구조가 D2(*다른 사람이 따라할 수 있게 정리할 계획*)와 P3(*기록 안 남김*) 감점의 근거입니다.

검증(E)이 별도 축으로 있는 건, Google Solution Challenge와 Imagine Cup이 거의 항상 *Feedback / Testing / Iteration*을 별개의 큰 항목으로 두기 때문입니다 (Imagine Cup 2026 시즌 기준 사용자 검증·개선이 30점). PBL의 *critique & revision*도 같은 방향을 가리킵니다.

운영 게이트 5개는 점수 채점이 아니라 *yes/no* 컷오프인데, 이 구조 자체가 정부 R&D 사업 공고의 *사전검토 → 평가 → 컷오프* 흐름을 그대로 가져온 것입니다. 점수가 아무리 좋아도 *시간 / 리뷰어 / 기록 공간 / 마감 / 중단 기준*이 비어 있으면 운영이 안 됩니다. AAC&U Problem Solving VALUE Rubric이 *"최종 산출물만으로는 부족하며 과정 증거가 필요"* 하다고 못박은 것과 같은 입장입니다.

각 질문을 0(없음/모르겠음) / 1(부분) / 2(확실)의 3단으로 받는 것은 CVSS Base Score의 정량화 방식과 AAC&U VALUE Rubric의 4단(*Capstone–Milestone–Benchmark–Pre*)을 한 단 줄여 인지 부담을 낮춘 것이고, 만점을 100이 아닌 10으로 둔 것은 단일 숫자로 한 줄에 인용 가능해야 한다는 CVSS의 실용성 때문입니다.

자세한 인용은 `deep-research-report.md`에 있습니다. 거기 있는 출처를 한 줄로 추리면:

LINC 3.0 캡스톤 / Google Solution Challenge / Microsoft Imagine Cup / OECD Frascati Manual 2015 / NASA TRL / ISO/IEC/IEEE 29148:2018 / INCOSE Requirements Working Group / AAC&U Problem Solving VALUE Rubric / Buck Institute Gold Standard PBL / ACM·IEEE CS2023 / 정보통신산업진흥원 ICT멘토링·한이음 / 융합보안핵심인재양성 사업 공고.

---

## 데이터 흐름

`questions.md`가 단일 진실 원천(SoT)입니다. 사람이 마크다운으로 편집하고, `node build.cjs`가 sanitize·검증을 거쳐 `questions.js`를 만듭니다. `app.js`는 그것만 import합니다.

```
questions.md  ──build.cjs──►  questions.js  ──app.js──►  index.html
   (편집)                       (자동 생성, 직접 편집 금지)
```

빌드 스텝은 HTML/XSS 제거, ID·숫자 형식 검증, 축·플래그 cross-reference 체크, tone(`white`/`black`) · kind(`reject`/`penalty`) 화이트리스트 강제. 검증 실패 시 빌드가 멈춥니다.

```bash
node build.cjs           # questions.md → questions.js
python3 -m http.server   # http://localhost:8000
```

Vercel은 `vercel.json`의 `buildCommand: "node build.cjs"`로 푸시 시 자동 재빌드합니다. 익명 통계 제출 백엔드는 `api/` 아래 Vercel Functions + Neon Postgres + BotID 조합입니다.

---

## 파일

```
index.html        마크업
styles.css        다크 모노 + ♔ 트랙 elevated 톤
app.js            상태·듀얼 채점·렌더·동기화·export·제출
questions.md      ← 편집은 여기
questions.js      ← 자동 생성 (직접 편집 금지)
build.cjs         MD → JS 빌드
api/              익명 통계 제출 (Postgres + BotID)
vercel.json       buildCommand, CSP, 보안 헤더
deep-research-report.md   축과 임계값의 출처와 인용
guide.md          questions.md 작성 규칙
```

`app.js`와 `questions.js`를 분리한 건, 질문 문구·가중치·임계값을 튜닝하는 일과 로직을 고치는 일이 같은 파일에서 섞이지 않도록 하기 위해서입니다.

---

## 라이선스

MIT.
