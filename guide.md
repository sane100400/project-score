# 작성 매뉴얼

이 파일은 `questions.md`의 작성 규칙을 설명합니다.
`questions.md`를 수정할 때 참고하세요.

## 파일 구조

```
# PROJECT:SCORE 설정           ← H1 제목 (무시됨)
## 모드                        ← H2 섹션 (7종: 모드, 타입, 축, 질문, 게이트, 플래그, 판정)
### learn                      ← H3 항목 (ID)
- key: value                   ← 속성
#### 선택지                    ← H4 하위 섹션
- 0: 첫 번째 선택지 | 설명
- 1: 두 번째 선택지 | 설명
```

**섹션 순서**: `## 모드` → `## 타입` → `## 축` → `## 질문` → `## 게이트` → `## 플래그` → `## 판정`
순서를 바꿔도 빌드는 되지만, 가독성을 위해 이 순서를 유지해 주세요.

## ID 규칙

- 영문자로 시작, **영문자·숫자·밑줄**만 허용 (`/^[A-Za-z][A-Za-z0-9_]*$/`)
- 좋은 예: `V1`, `learn`, `G3`, `P2_extra`
- 나쁜 예: `1번`, `V-1`, `질문1`, `my question`

## 속성 문법

모든 속성은 `- key: value` 형식입니다. 콜론 뒤 공백 필수.

```markdown
- name: 배우려고
- weight: 8
- tone: white
```

### 특수 값 형식

| 형식 | 예시 | 사용처 |
|------|------|--------|
| **숫자** | `8`, `1.5`, `0` | weight, penalty |
| **key=val 쌍** | `pass=4.0, conditional=2.5, study=1.0` | whiteThresholds, blackThresholds, weightOverrides |
| **쉼표 리스트** | `R1, R2` | disabledFlags |
| **tone 값** | `white` 또는 `black` (이 둘만 허용) | 축, 플래그의 tone |
| **kind 값** | `reject` 또는 `penalty` (이 둘만 허용) | 플래그의 kind |

## 섹션별 상세

### `## 모드` — 진단 모드 (최소 1개)

```markdown
### modeId
- emoji: 이모지 (선택)
- name: 모드 이름 (필수)
- desc: 한 줄 설명 (선택)
- example: 예시 문구 (선택)
- whiteThresholds: pass=7.5, conditional=6.0, study=4.5 (필수)
- blackThresholds: pass=8.0, conditional=6.5, study=5.0 (필수)
- weightOverrides: O1=4, O2=3 (선택 — 특정 질문의 가중치를 이 모드에서만 변경)
- disabledFlags: R1 (선택 — 이 모드에서 비활성화할 플래그 ID, 쉼표 구분)
```

- `whiteThresholds` / `blackThresholds`의 key는 `## 판정`의 ID와 대응합니다.
- 값이 높을수록 해당 판정을 받기 어렵습니다.

### `## 타입` — 프로젝트 유형 (0개 이상)

```markdown
### typeId
- name: 유형 이름 (필수 아님, 권장)
- desc: 한 줄 설명 (선택)
```

타입은 질문의 `#### 타입별 제목` / `#### 타입별 힌트`에서 참조됩니다.

### `## 축` — 점수 축 (최소 1개)

```markdown
### axisCode
- name: 영문 이름 (선택)
- ko: 한글 이름 (선택)
- tone: white 또는 black (필수)
- full: 축 설명 (선택)
```

- `tone: white` → 이 축의 질문은 ♔ White 탭에 표시
- `tone: black` → 이 축의 질문은 ♚ Black 탭에 표시

### `## 질문` — 진단 질문 (최소 1개)

```markdown
### questionId
- axis: 축 ID (필수 — ## 축에 정의된 ID여야 함)
- weight: 가중치 숫자 (필수)
- title: 질문 제목 (필수)
- hint: 힌트 문구 (선택)

#### 타입별 제목 (선택 — 타입마다 다른 질문 문구)
- dev: 개발자용 질문 문구
- research: 연구자용 질문 문구

#### 타입별 힌트 (선택 — 타입마다 다른 힌트)
- dev: 개발자용 힌트
- research: 연구자용 힌트

#### 선택지 (필수)
- 0: 첫 번째 선택지 | 설명
- 1: 두 번째 선택지 | 설명
- 2: 세 번째 선택지 | 설명

#### 입력 (선택)
- text: 라벨
- number: 라벨 | 10→2, 5→1
```

- `#### 선택지`는 **필수**입니다. 없으면 빌드 실패.
- 점수(v)는 숫자, 보통 0/1/2 사용.
- `#### 타입별 제목` / `#### 타입별 힌트`의 key는 `## 타입`의 ID와 대응합니다.
- 입력의 자동판정 규칙: `threshold→score` 쌍을 쉼표로 구분 (예: `10→2, 5→1`)

### `## 게이트` — 실행 전제 조건 (최소 1개)

```markdown
### gateId
- text: 게이트 문구 (필수)
```

게이트는 ♚ Black 탭에서 체크박스로 표시됩니다.
통과한 게이트 비율에 따라 Black 점수에 0~2점이 가산됩니다.

### `## 플래그` — 경고·감점 (최소 1개)

```markdown
### flagId
- kind: reject 또는 penalty (필수)
- tone: white 또는 black (필수)
- title: 플래그 이름 (선택)
- desc: 설명 (선택)
- penalty: 감점 수치 (kind=penalty일 때만, 숫자)
```

- `kind: reject` → 해당 tone의 판정을 RETHINK로 강제
- `kind: penalty` → 해당 tone의 점수에서 penalty만큼 감점
- `tone: white` → ♔ White 점수에 영향
- `tone: black` → ♚ Black 점수에 영향

### `## 판정` — 결과 판정 등급 (최소 1개)

```markdown
### decisionId
- label: 영문 라벨 (선택)
- ko: 한글 라벨 (선택)
- desc: 설명 (선택)
- tone: good, warn, bad 중 택 1 (선택 — UI 색상용)
```

판정 ID는 모드의 `whiteThresholds` / `blackThresholds`에서 key로 사용됩니다.

## 빌드 오류 대처

`node build.js` 실행 시 오류가 나면 `❌` 표시와 함께 원인이 출력됩니다.

| 오류 | 원인 | 해결 |
|------|------|------|
| `ID "1번" — 영문자로 시작` | ID에 한글·특수문자 사용 | 영문자로 시작하는 ID로 변경 |
| `유효하지 않은 axis "Z"` | 질문의 axis가 축에 없음 | `## 축`에 해당 ID 추가하거나 오타 수정 |
| `선택지가 비어 있습니다` | `#### 선택지` 아래 항목 없음 | 선택지 항목 추가 |
| `whiteThresholds 필수` | 모드에 필수 속성 누락 | 해당 속성 추가 |
| `disabledFlags의 "XX"는 플래그에 없습니다` | 비활성화할 플래그 ID 오타 | `## 플래그`의 ID와 맞춰 수정 |

## 보안 주의사항

- 모든 텍스트에서 HTML 태그, `javascript:`, 이벤트 핸들러(`onclick=` 등)는 자동 제거됩니다.
- ID에는 영문자·숫자·밑줄만 허용됩니다.
- 숫자 필드에 문자를 넣으면 빌드가 실패합니다.
- `questions.js`를 직접 수정하지 마세요 — 다음 빌드에서 덮어씁니다.
