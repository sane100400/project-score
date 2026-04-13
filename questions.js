// PROJECT SCORE v1.2 — data module
// 모드, 축, 질문, 게이트, 플래그, 판정 라벨

export const MODES = {
  learn: {
    id: 'learn',
    emoji: '🎒',
    name: '배우려고',
    desc: '기술 익히기·연습용',
    example: '강의·책 따라 만들기도 OK · 포트폴리오 걱정 없음',
    thresholds: { pass: 5.5, conditional: 4.0, study: 2.5 },
    weightOverrides: { N1: 3, N2: 3, N3: 4 },
    disabledFlags: ['R1']
  },
  build: {
    id: 'build',
    emoji: '🛠',
    name: '만들어보려고',
    desc: '동아리·사이드 프로젝트',
    example: '쓸 만한 걸 하나 완성해보는 것이 목표',
    thresholds: { pass: 7.2, conditional: 5.8, study: 4.3 },
    weightOverrides: {},
    disabledFlags: []
  },
  showcase: {
    id: 'showcase',
    emoji: '🏆',
    name: '보여주려고',
    desc: '대회·공모전·포트폴리오',
    example: '심사 통과·수상·취업 어필이 목표',
    thresholds: { pass: 8.0, conditional: 6.5, study: 5.0 },
    weightOverrides: {},
    disabledFlags: []
  }
};

export const TYPES = {
  dev: {
    id: 'dev',
    name: '개발',
    desc: '앱·서비스·제품·도구 만들기'
  },
  research: {
    id: 'research',
    name: '연구',
    desc: '실험·분석·조사·논문'
  },
  security: {
    id: 'security',
    name: '보안',
    desc: '버그바운티·취약점 분석·CTF·침투테스트'
  },
  contrib: {
    id: 'contrib',
    name: '기여',
    desc: '오픈소스 PR·커뮤니티·생태계 기여'
  },
  content: {
    id: 'content',
    name: '콘텐츠',
    desc: '기술 글·강의·교재·튜토리얼'
  }
};

export const AXES = {
  I: { code: 'I', name: 'Impact',       ko: '왜 만드는가',    full: '왜 · 문제정의' },
  N: { code: 'N', name: 'Novelty',      ko: '뭐가 새로운가',  full: '차별성 · 새로움' },
  F: { code: 'F', name: 'Feasibility',  ko: '할 수 있는가',    full: '실행 가능성' },
  D: { code: 'D', name: 'Deliverables', ko: '뭘 내놓는가',    full: '결과물 · 완성 기준' },
  E: { code: 'E', name: 'Evidence',     ko: '진짜 되는가',    full: '검증 · 반복' }
};

export const QUESTIONS = [
  // ── 왜 만드는가 ────────────────────────────────
  { id: 'I1', axis: 'I', weight: 8,
    title: '이 프로젝트, 한 줄로 설명하실 수 있나요?',
    hint: '"누구를 위해 / 무엇을 만들고 / 왜 만드는지"가 한 문장에 다 나와야 합니다.',
    options: [
      { v: 0, label: '아직 없습니다',       detail: '막연한 아이디어 단계' },
      { v: 1, label: '있긴 한데 막연합니다', detail: '한 문장은 되지만 구체성 부족' },
      { v: 2, label: '명확합니다',          detail: '누가/무엇/왜가 분명함' }
    ]},
  { id: 'I2', axis: 'I', weight: 6,
    title: '풀 만한 가치가 있는 문제인가요?',
    hint: '근거가 있나요, 아니면 "있을 것 같아서"로 시작한 건가요?',
    titleByType: {
      dev:      '진짜 불편한 사람이 있긴 한가요?',
      research: '풀 만한 가치가 있는 연구 질문인가요?',
      security: '실제 공격 가능성과 피해 범위가 있는 대상인가요?',
      contrib:  '이 기여를 실제로 필요로 하는 사용자·메인테이너가 있나요?',
      content:  '이 내용을 찾아 읽을 사람이 실제로 있나요?'
    },
    hintByType: {
      dev:      '주변에 물어보셨나요? 아니면 "있을 것 같아서"로 시작한 건가요?',
      research: '선행 연구를 확인하셨나요? 학계·현장에서 이 질문이 왜 중요한지 근거가 있나요?',
      security: '대상의 공격 표면·사용자 수·영향도를 확인하셨나요? 보고할 채널이 있나요?',
      contrib:  '이슈 트래커·PR 논의·메인테이너 반응을 확인하셨나요?',
      content:  '검색량·질문 빈도·기존 자료 부족을 확인하셨나요?'
    },
    options: [
      { v: 0, label: '확인 안 했습니다',   detail: '개인 느낌·추측' },
      { v: 1, label: '약한 근거 정도',     detail: '간단히 훑어본 수준' },
      { v: 2, label: '실제로 확인했습니다', detail: '구체 근거·데이터 있음' }
    ]},
  { id: 'I3', axis: 'I', weight: 6,
    title: '무엇이 되면 "성공"이라고 말할 수 있나요?',
    hint: '숫자든 느낌이든 기준이 있어야 나중에 성공/실패를 판단할 수 있습니다.',
    options: [
      { v: 0, label: '생각 안 해봤습니다' },
      { v: 1, label: '대충 느낌은 있습니다', detail: '"좋아하면 성공" 같은 정성 기준' },
      { v: 2, label: '측정 가능한 목표',     detail: '예: "10명이 매일 사용"' }
    ]},
  { id: 'I4', axis: 'I', weight: 5,
    title: '이 결과물이 어디서 어떻게 쓰일지 그려지시나요?',
    hint: '구체적인 사용·활용 장면이 머리에 선명해야 합니다.',
    titleByType: {
      dev:      '누가 언제 어떻게 사용하는지 그려지시나요?',
      research: '이 연구 결과가 어디서 어떻게 쓰일지 그려지시나요?',
      security: '이 발견이 누구를 어떻게 보호하거나 어떤 위협을 막는지 그려지시나요?',
      contrib:  '이 기여로 누가 어떤 이득을 보는지 그려지시나요?',
      content:  '누가 어떤 상황에서 이 자료를 찾고 읽을지 그려지시나요?'
    },
    hintByType: {
      dev:      '"아침 등굣길에 혼자 앱을 열어서..." 이런 장면이 머리에 그려져야 합니다.',
      research: '"이 결과를 본 연구자·실무자가 어떤 결정을 다르게 내릴지" 구체적으로 그려져야 합니다.',
      security: '"이 취약점이 악용되면 누가 어떤 피해를 입고, 패치·대응은 누가 할지" 그려져야 합니다.',
      contrib:  '"이 PR·기능이 머지되면 누가 어떻게 덕 볼지" 구체적이어야 합니다.',
      content:  '"어떤 검색어·상황에서 이 글에 도달할지" 그려져야 합니다.'
    },
    options: [
      { v: 0, label: '불명확합니다' },
      { v: 1, label: '일부만 구체적입니다' },
      { v: 2, label: '장면이 선명합니다' }
    ]},

  // ── 뭐가 새로운가 ──────────────────────────────
  { id: 'N1', axis: 'N', weight: 8,
    title: '이미 비슷한 것이 있는지 찾아보셨나요?',
    hint: '최소 3개는 비교해 보세요. 서비스·오픈소스·논문 무엇이든 좋습니다.',
    options: [
      { v: 0, label: '안 찾아봤습니다' },
      { v: 1, label: '몇 개는 봤습니다', detail: '나열만 했거나 차이가 모호' },
      { v: 2, label: '비교 + 차별점',    detail: '무엇이 다른지 적어두었음' }
    ]},
  { id: 'N2', axis: 'N', weight: 6,
    title: '고민할 거리가 있는 주제인가요?',
    hint: '설계·알고리즘·트레이드오프... 선택할 것이 없으면 그냥 따라 만드는 것입니다.',
    options: [
      { v: 0, label: '거의 없습니다' },
      { v: 1, label: '조금 있습니다' },
      { v: 2, label: '중요한 결정이 많습니다' }
    ]},
  { id: 'N3', axis: 'N', weight: 6,
    title: '새로 배우거나 만들 것이 있나요?',
    hint: '다 아는 걸로 만드는 것은 연습입니다. 무언가 새로운 것이 있어야 프로젝트입니다.',
    options: [
      { v: 0, label: '다 아는 것들입니다' },
      { v: 1, label: '기술 스택만 새롭습니다' },
      { v: 2, label: '방법·접근이 새롭습니다' }
    ]},

  // ── 할 수 있는가 ───────────────────────────────
  { id: 'F1', axis: 'F', weight: 8,
    title: '기간 안에 진짜 끝낼 수 있나요?',
    hint: '언제까지 무엇을 만들지 단계별로 쪼개 보셨나요? 너무 욕심내지는 않으셨나요?',
    options: [
      { v: 0, label: '범위가 무한합니다' },
      { v: 1, label: '일부만 정해졌습니다' },
      { v: 2, label: '단계가 명확합니다' }
    ]},
  { id: 'F2', axis: 'F', weight: 6,
    title: '필요한 건 다 구할 수 있나요?',
    hint: '데이터·API·장비·권한... 안 되면 대안이 있나요?',
    options: [
      { v: 0, label: '안 알아봤습니다' },
      { v: 1, label: '확인만 했습니다', detail: '대안은 없음' },
      { v: 2, label: '대안까지 준비했습니다' }
    ]},
  { id: 'F3', axis: 'F', weight: 6,
    title: '누가 무엇을 할지 정해졌나요?',
    hint: '역할만 나누지 말고, 못하는 것은 어떻게 배울지도 정해야 합니다.',
    options: [
      { v: 0, label: '아직 모호합니다' },
      { v: 1, label: '역할만 나눴습니다' },
      { v: 2, label: '역할 + 학습 계획까지 있습니다' }
    ]},

  // ── 뭘 내놓는가 ────────────────────────────────
  { id: 'D1', axis: 'D', weight: 10,
    title: '최종 산출물로 무엇을 내놓으실 건가요?',
    hint: '어떤 상태가 되면 "끝났다"고 말할 수 있는지 정해야 합니다.',
    titleByType: {
      dev:      '작동하는 시스템·도구로 무엇을 내놓으실 건가요?',
      research: '연구 산출물로 무엇을 내놓으실 건가요?',
      security: '보안 산출물로 무엇을 내놓으실 건가요?',
      contrib:  '기여 산출물로 무엇을 내놓으실 건가요?',
      content:  '콘텐츠 산출물로 무엇을 내놓으실 건가요?'
    },
    hintByType: {
      dev:      '작동 앱·서비스·도구 — 어느 기능까지 구현되면 "끝"인지 정해야 합니다.',
      research: '보고서·논문·데이터셋·분석 결과 — 어떤 형태로 어디까지 낼지 정해야 합니다.',
      security: '취약점 리포트·PoC 코드·공식 CVE·패치 제안 — 어디까지 낼지 정해야 합니다.',
      contrib:  '머지된 PR·릴리즈 포함·이슈 해결·문서 업데이트 — 어디까지 낼지 정해야 합니다.',
      content:  '공개된 글·영상·강의 자료·예제 레포 — 어떤 분량·형식으로 낼지 정해야 합니다.'
    },
    options: [
      { v: 0, label: '생각 안 해봤습니다' },
      { v: 1, label: '산출물 목록만 있습니다' },
      { v: 2, label: '완성 기준까지 명확합니다' }
    ]},
  { id: 'D2', axis: 'D', weight: 10,
    title: '다른 사람이 따라 해 볼 수 있을 만큼 설명되어 있나요?',
    hint: '재현·검증·학습에 필요한 정보가 공개되어야 합니다.',
    titleByType: {
      dev:      '다른 사람이 따라 실행해 볼 수 있을 만큼 설명되어 있나요?',
      research: '다른 사람이 분석·실험을 재현해 볼 수 있을 만큼 설명되어 있나요?',
      security: '다른 사람이 PoC를 재현해 볼 수 있을 만큼 설명되어 있나요?',
      contrib:  '다른 사람이 로컬에서 빌드·테스트해 볼 수 있을 만큼 설명되어 있나요?',
      content:  '독자가 예제를 직접 따라 해 볼 수 있을 만큼 설명되어 있나요?'
    },
    hintByType: {
      dev:      '구조·실행법·테스트 계획이 있어야 "재현 가능"합니다.',
      research: '데이터·방법론·분석 절차가 공개되어야 "재현 가능"합니다.',
      security: '환경·단계·페이로드·책임 공개 정책까지 정리되어야 합니다.',
      contrib:  'README·실행법·기여 가이드·테스트 방법이 있어야 합니다.',
      content:  '예제 코드·샘플 데이터·단계별 설명이 있어야 합니다.'
    },
    options: [
      { v: 0, label: '없습니다' },
      { v: 1, label: '일부 스케치만 있습니다' },
      { v: 2, label: '재현 가능합니다' }
    ]},

  // ── 진짜 되는가 ────────────────────────────────
  { id: 'E1', axis: 'E', weight: 8,
    title: '진짜 되는지 어떻게 확인하실 건가요?',
    hint: '구체적인 검증 방법이 지표·증거와 연결되어야 합니다.',
    titleByType: {
      dev:      '진짜 작동·유용한지 어떻게 확인하실 건가요?',
      research: '가설을 어떻게 검증하실 건가요?',
      security: '이 취약점·공격 벡터가 실제 유효한지 어떻게 입증하실 건가요?',
      contrib:  '이 기여가 실제 가치가 있는지 어떻게 확인하실 건가요?',
      content:  '이 콘텐츠가 실제로 도움이 되는지 어떻게 확인하실 건가요?'
    },
    hintByType: {
      dev:      '사용자 테스트·실험·측정이 지표와 연결되어야 합니다.',
      research: '실험 설계·통계 방법·비교 대조군이 구체적이어야 합니다.',
      security: 'PoC 시연·영향 범위 확인·책임 공개 절차가 있어야 합니다.',
      contrib:  '머지 여부·리뷰 반응·벤치마크·이슈 해결 확인까지 있어야 합니다.',
      content:  '조회수·완독률·피드백·후속 질문 같은 지표가 있어야 합니다.'
    },
    options: [
      { v: 0, label: '계획 없음' },
      { v: 1, label: '막연한 계획' },
      { v: 2, label: '지표와 연결됨' }
    ]},
  { id: 'E2', axis: 'E', weight: 7,
    title: '피드백 받고 고칠 생각이 있나요?',
    hint: '한 번 만들고 끝인가요? 아니면 계속 다듬을 계획인가요?',
    options: [
      { v: 0, label: '한 번에 끝' },
      { v: 1, label: '계획만 있습니다' },
      { v: 2, label: '반복 + 기록 루프까지 있습니다' }
    ]}
];

export const GATES = [
  { id: 'G1', text: '이 프로젝트에 쓸 수 있는 시간이 현실적으로 확보되어 있습니다 (주당 최소 몇 시간)' },
  { id: 'G2', text: '피드백을 줄 사람(멘토·동료·사용자)이 최소 1명은 정해져 있습니다' },
  { id: 'G3', text: '진행 과정을 기록할 공간(깃 레포·노션·문서)이 이미 열려 있습니다' },
  { id: 'G4', text: '최종 마감일과 중간 점검 시점이 달력에 들어가 있습니다' },
  { id: 'G5', text: '언제 이 주제를 포기하거나 피벗할지, 중단 기준이 정해져 있습니다' }
];

export const FLAGS = [
  { id: 'R1', kind: 'reject', title: '튜토리얼 그대로 복제',
    desc: '강의·책을 거의 그대로 따라 만든 수준입니다 (차별점·변형 없음)' },
  { id: 'R2', kind: 'reject', title: '못 구하는 자원',
    desc: '꼭 필요한 데이터·API·장비를 현실적으로 구할 방법이 없습니다' },
  { id: 'R3', kind: 'reject', title: '법·윤리 위험',
    desc: '개인정보·저작권 문제가 있고, 해결할 계획이 없습니다' },
  { id: 'P1', kind: 'penalty', penalty: 1.0, title: '범위가 너무 큼',
    desc: 'MVP가 기간 대비 "완성 제품" 수준으로 과도합니다' },
  { id: 'P2', kind: 'penalty', penalty: 1.5, title: '검증 방법 없음',
    desc: '성공했는지 실패했는지 판단할 방법이 아예 없습니다' },
  { id: 'P3', kind: 'penalty', penalty: 1.0, title: '기록 안 남김',
    desc: '실행법·설계 근거·실험 결과를 문서로 남기지 않습니다' }
];

export const DECISIONS = {
  pass: {
    label: 'GO',
    ko: '가시죠',
    desc: '지금 시작하셔도 됩니다. 계획대로 밀어붙이세요.',
    tone: 'good'
  },
  conditional: {
    label: 'ALMOST',
    ko: '거의 다 왔습니다',
    desc: '빈칸 몇 개만 채우시면 시작할 수 있습니다.',
    tone: 'warn'
  },
  study: {
    label: 'LEARN FIRST',
    ko: '먼저 배우시죠',
    desc: '본 프로젝트보다 스터디·프로토타입으로 전환하시는 게 낫습니다.',
    tone: 'warn'
  },
  revise: {
    label: 'REVISE',
    ko: '다시 생각해보시죠',
    desc: '필수 항목이 비어 있습니다. 보완부터 하시고 다시 오세요.',
    tone: 'warn'
  },
  reject: {
    label: 'RETHINK',
    ko: '주제를 다시',
    desc: '이 주제로는 어렵습니다. 다른 주제를 찾으시는 게 낫습니다.',
    tone: 'bad'
  }
};
