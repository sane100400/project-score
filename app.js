// PROJECT SCORE v1.2 — Chessboard disciplined
import { MODES, TYPES, AXES, QUESTIONS, GATES, FLAGS, DECISIONS } from './questions.js';

const STORAGE_KEY = 'project-score-v1.2';

const state = {
  mode: 'build',
  types: [],
  answers: {},
  gates: {},
  flags: {}
};

function qTitle(q) {
  if (!q.titleByType) return q.title;
  if (state.types.length === 1 && q.titleByType[state.types[0]]) {
    return q.titleByType[state.types[0]];
  }
  return q.title;
}
function qHint(q) {
  if (!q.hintByType) return q.hint;
  if (state.types.length === 1 && q.hintByType[state.types[0]]) {
    return q.hintByType[state.types[0]];
  }
  return q.hint;
}

function currentMode() { return MODES[state.mode]; }
function weightFor(q) {
  const ov = currentMode().weightOverrides || {};
  return ov[q.id] ?? q.weight;
}
function isFlagDisabled(fid) {
  return (currentMode().disabledFlags || []).includes(fid);
}
function axisMaxFor(axisCode) {
  return QUESTIONS.filter(q => q.axis === axisCode).reduce((s, q) => s + weightFor(q), 0);
}
function totalMaxWeight() {
  return QUESTIONS.reduce((s, q) => s + weightFor(q), 0);
}

// ─── rendering ───────────────────────────────────────────────

function renderModes() {
  document.getElementById('modeGrid').innerHTML = Object.values(MODES).map(m => `
    <button type="button" class="mode" data-mode="${m.id}">
      <span class="mode__emoji">${m.emoji}</span>
      <span class="mode__name">${m.name}</span>
      <span class="mode__desc">${m.desc}</span>
      <span class="mode__example">${m.example}</span>
    </button>
  `).join('');
}

function renderTypes() {
  document.getElementById('typeGrid').innerHTML = Object.values(TYPES).map(t => `
    <button type="button" class="type-btn" data-type="${t.id}">
      <span class="type-btn__name">${t.name}</span>
      <span class="type-btn__desc">${t.desc}</span>
    </button>
  `).join('');
}

function renderAxisBars() {
  document.getElementById('axisBars').innerHTML = Object.values(AXES).map(a => `
    <div class="axis">
      <div class="axis__name">
        ${a.ko}
        <small>${a.name}</small>
      </div>
      <div class="axis__track">
        <div class="axis__fill" data-axis="${a.code}"></div>
      </div>
      <span class="axis__value" data-axis-value="${a.code}">0 / 0</span>
    </div>
  `).join('');
}

function renderGates() {
  document.getElementById('gatesList').innerHTML = GATES.map(g => `
    <div class="gate">
      <span class="gate__id">${g.id}</span>
      <div class="gate__text">${g.text}</div>
      <div class="gate__toggle">
        <button type="button" class="toggle-btn" data-gid="${g.id}" data-val="true">예</button>
        <button type="button" class="toggle-btn" data-gid="${g.id}" data-val="false">아직입니다</button>
      </div>
    </div>
  `).join('');
}

function renderQuestions() {
  const multi = state.types.length > 1;
  const tagBar = multi
    ? `<div class="question__tags">${state.types.map(t => `<span class="q-tag">${TYPES[t].name}</span>`).join('')}<span class="q-tag-note">관점 모두 고려</span></div>`
    : '';
  document.getElementById('questionsList').innerHTML = QUESTIONS.map((q, i) => `
    <div class="question">
      <div class="question__meta">
        <span class="question__num">Q${String(i + 1).padStart(2, '0')}</span>
        <span class="question__axis">${q.id} · ${AXES[q.axis].ko}</span>
      </div>
      <h3 class="question__title">${qTitle(q)}</h3>
      ${q.hintByType && multi ? tagBar : ''}
      <div class="question__hint">${qHint(q)}</div>
      <div class="question__options">
        ${q.options.map(o => `
          <button type="button" class="opt" data-qid="${q.id}" data-val="${o.v}">
            <span class="opt__val">${o.v} POINT</span>
            <span class="opt__label">${o.label}</span>
            ${o.detail ? `<span class="opt__detail">${o.detail}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderFlags() {
  document.getElementById('flagsList').innerHTML = FLAGS.map(f => `
    <div class="flag ${f.kind}" data-fid="${f.id}">
      <div class="flag__check"></div>
      <span class="flag__kind">${f.kind === 'reject' ? 'HARD · RETHINK' : `−${f.penalty.toFixed(1)} 감점`}</span>
      <div class="flag__title">${f.id} · ${f.title}</div>
      <div class="flag__desc">${f.desc}</div>
    </div>
  `).join('');
}

// ─── scoring ─────────────────────────────────────────────────

function compute() {
  const mode = currentMode();
  const axisPoints = { I: 0, N: 0, F: 0, D: 0, E: 0 };
  let rawTotal = 0;

  for (const q of QUESTIONS) {
    const v = state.answers[q.id];
    if (v === undefined) continue;
    const w = weightFor(q);
    const pts = w * (v / 2);
    axisPoints[q.axis] += pts;
    rawTotal += pts;
  }

  const maxW = totalMaxWeight();
  const questionScore = (rawTotal / maxW) * 8;

  const passedGates = GATES.filter(g => state.gates[g.id] === true).length;
  const gateScore = (passedGates / GATES.length) * 2;

  const scaled = questionScore + gateScore;

  const penalties = FLAGS
    .filter(f => f.kind === 'penalty' && state.flags[f.id])
    .reduce((s, f) => s + f.penalty, 0);

  const total = Math.max(0, scaled - penalties);

  const hardReject = FLAGS.some(f =>
    f.kind === 'reject' && state.flags[f.id] && !isFlagDisabled(f.id)
  );
  const failedGates = GATES.filter(g => state.gates[g.id] === false).map(g => g.id);
  const answeredGates = GATES.filter(g => state.gates[g.id] !== undefined).length;
  const answeredQuestions = QUESTIONS.filter(q => state.answers[q.id] !== undefined).length;

  const th = mode.thresholds;

  let decision;
  if (hardReject) decision = 'reject';
  else if (failedGates.length > 0) decision = 'revise';
  else if (answeredGates < GATES.length || answeredQuestions < QUESTIONS.length) decision = null;
  else if (total >= th.pass) decision = 'pass';
  else if (total >= th.conditional) decision = 'conditional';
  else if (total >= th.study) decision = 'study';
  else decision = 'reject';

  return { total, scaled, axisPoints, penalties, decision, hardReject, failedGates, answeredGates, answeredQuestions };
}

function buildMarkdown() {
  const r = compute();
  const now = new Date();
  const stamp = now.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
  const mode = MODES[state.mode];
  const typeNames = state.types.length
    ? state.types.map(t => TYPES[t].name).join(' + ')
    : '(선택 없음)';
  const decisionText = r.decision
    ? `**${DECISIONS[r.decision].label}** — ${DECISIONS[r.decision].ko} (${DECISIONS[r.decision].desc})`
    : '_아직 판정 불가 (남은 항목에 답해주세요)_';

  const lines = [];
  lines.push(`# PROJECT SCORE 결과`);
  lines.push('');
  lines.push(`- **작성 시각**: ${stamp}`);
  lines.push(`- **목적 모드**: ${mode.emoji} ${mode.name} — ${mode.desc}`);
  lines.push(`- **프로젝트 성격**: ${typeNames}`);
  lines.push('');
  lines.push(`## 총점`);
  lines.push('');
  lines.push(`> ## ${r.total.toFixed(1)} / 10`);
  lines.push('');
  lines.push(`- 원점수(페널티 전): ${r.scaled.toFixed(1)} / 10`);
  if (r.penalties > 0) lines.push(`- 플래그 감점: −${r.penalties.toFixed(1)}`);
  lines.push(`- **판정**: ${decisionText}`);
  if (r.hardReject) lines.push(`- ⚠️ 하드 리젝트 플래그 감지`);
  if (r.failedGates.length) lines.push(`- ⚠️ 실패한 게이트: ${r.failedGates.join(', ')}`);
  lines.push('');

  lines.push(`## 축별 점수`);
  lines.push('');
  lines.push(`| 축 | 한국어 | 점수 | 최대 |`);
  lines.push(`|---|---|---:|---:|`);
  for (const a of Object.values(AXES)) {
    const pts = r.axisPoints[a.code];
    const max = axisMaxFor(a.code);
    lines.push(`| ${a.code} | ${a.ko} (${a.name}) | ${pts.toFixed(1)} | ${max} |`);
  }
  lines.push('');

  lines.push(`## 필수 게이트`);
  lines.push('');
  for (const g of GATES) {
    const v = state.gates[g.id];
    const mark = v === true ? '✅ 예' : v === false ? '❌ 아직입니다' : '➖ 미응답';
    lines.push(`- **${g.id}** · ${mark}`);
    lines.push(`  - ${g.text}`);
  }
  lines.push('');

  lines.push(`## 14개 질문`);
  lines.push('');
  QUESTIONS.forEach((q, i) => {
    const v = state.answers[q.id];
    const chosen = v !== undefined ? q.options.find(o => o.v === v) : null;
    const answerText = chosen
      ? `**${v}점** — ${chosen.label}${chosen.detail ? ` (${chosen.detail})` : ''}`
      : '_미응답_';
    lines.push(`### Q${String(i + 1).padStart(2, '0')}. ${qTitle(q)}`);
    lines.push('');
    lines.push(`- **축**: ${q.id} · ${AXES[q.axis].ko} (가중치 ${weightFor(q)})`);
    lines.push(`- **답변**: ${answerText}`);
    lines.push(`- _${qHint(q).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}_`);
    lines.push('');
  });

  const active = FLAGS.filter(f => state.flags[f.id] && !isFlagDisabled(f.id));
  if (active.length) {
    lines.push(`## 체크된 플래그`);
    lines.push('');
    for (const f of active) {
      const head = f.kind === 'reject'
        ? `🛑 **${f.id} · ${f.title}** (HARD · RETHINK)`
        : `⚠️ **${f.id} · ${f.title}** (−${f.penalty.toFixed(1)})`;
      lines.push(`- ${head}`);
      lines.push(`  - ${f.desc}`);
    }
    lines.push('');
  }

  lines.push(`---`);
  lines.push(`_PROJECT SCORE v1.2 · Chessboard monochrome self-diagnostic_`);
  lines.push(`_결과 벡터_: \`${buildVector()}\``);
  return lines.join('\n');
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildVector() {
  const parts = [`PS:1.2`, `MODE:${state.mode}`];
  for (const q of QUESTIONS) parts.push(`${q.id}:${state.answers[q.id] ?? '-'}`);
  for (const g of GATES) {
    const v = state.gates[g.id];
    parts.push(`${g.id}:${v === true ? 'Y' : v === false ? 'N' : '-'}`);
  }
  const activeFlags = FLAGS.filter(f => state.flags[f.id] && !isFlagDisabled(f.id)).map(f => f.id);
  if (activeFlags.length) parts.push(`FL:${activeFlags.join(',')}`);
  return parts.join('/');
}

// ─── UI update ───────────────────────────────────────────────

function updateUI() {
  document.querySelectorAll('.mode').forEach(c => {
    c.classList.toggle('selected', c.dataset.mode === state.mode);
  });
  document.querySelectorAll('.type-btn').forEach(c => {
    c.classList.toggle('selected', state.types.includes(c.dataset.type));
  });

  document.querySelectorAll('.opt').forEach(b => {
    b.classList.toggle('selected', state.answers[b.dataset.qid] === +b.dataset.val);
  });

  document.querySelectorAll('.toggle-btn[data-gid]').forEach(b => {
    const gid = b.dataset.gid;
    const target = b.dataset.val === 'true';
    b.classList.remove('selected-yes', 'selected-no');
    if (state.gates[gid] === target) {
      b.classList.add(target ? 'selected-yes' : 'selected-no');
    }
  });

  document.querySelectorAll('.flag').forEach(f => {
    const fid = f.dataset.fid;
    f.classList.toggle('selected', !!state.flags[fid]);
    f.classList.toggle('disabled', isFlagDisabled(fid));
  });

  const r = compute();
  document.getElementById('scoreValue').textContent = r.total.toFixed(1);
  document.getElementById('scoreFabVal').textContent = r.total.toFixed(1);

  const answeredTotal = r.answeredQuestions + r.answeredGates;
  const totalItems = QUESTIONS.length + GATES.length;
  const progressPct = (answeredTotal / totalItems) * 100;
  document.getElementById('progressFill').style.width = `${progressPct}%`;
  document.getElementById('scoreSublabel').textContent =
    `답변 ${r.answeredQuestions} / ${QUESTIONS.length} · 게이트 ${r.answeredGates} / ${GATES.length}`;
  document.getElementById('scorePctLabel').textContent = `${Math.round(progressPct)}%`;

  const badge = document.getElementById('decisionBadge');
  if (r.decision) {
    const d = DECISIONS[r.decision];
    badge.className = `decision ${r.decision}`;
    badge.innerHTML = `
      <span class="decision__tag">${d.label}</span>
      <div class="decision__ko">${d.ko}</div>
      <span class="decision__desc">${d.desc}</span>
    `;
  } else {
    badge.className = 'decision';
    badge.innerHTML = `
      <span class="decision__tag">Waiting</span>
      <div class="decision__ko">아직입니다</div>
      <span class="decision__desc">남은 질문에 답하시면 결과가 나옵니다</span>
    `;
  }

  for (const a of Object.values(AXES)) {
    const pts = r.axisPoints[a.code];
    const max = axisMaxFor(a.code);
    const pct = max > 0 ? Math.min(100, (pts / max) * 100) : 0;
    const fill = document.querySelector(`.axis__fill[data-axis="${a.code}"]`);
    const val  = document.querySelector(`[data-axis-value="${a.code}"]`);
    if (fill) fill.style.width = `${pct}%`;
    if (val)  val.textContent  = `${pts.toFixed(1)} / ${max}`;
  }
}

// ─── state setters ───────────────────────────────────────────

function setMode(mode) {
  if (!MODES[mode]) return;
  state.mode = mode;
  updateUI(); save();
}
function toggleType(type) {
  if (!TYPES[type]) return;
  const idx = state.types.indexOf(type);
  if (idx >= 0) state.types.splice(idx, 1);
  else state.types.push(type);
  renderQuestions();
  updateUI(); save();
}
function setAnswer(qid, v) {
  if (state.answers[qid] === v) delete state.answers[qid];
  else state.answers[qid] = v;
  updateUI(); save();
}
function setGate(gid, val) {
  if (state.gates[gid] === val) delete state.gates[gid];
  else state.gates[gid] = val;
  updateUI(); save();
}
function toggleFlag(fid) {
  if (isFlagDisabled(fid)) return;
  state.flags[fid] = !state.flags[fid];
  updateUI(); save();
}

// ─── persistence ─────────────────────────────────────────────

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
}

// ─── events ──────────────────────────────────────────────────

function bind() {
  document.addEventListener('click', (e) => {
    const mode = e.target.closest('.mode');
    if (mode) { setMode(mode.dataset.mode); return; }

    const typeBtn = e.target.closest('.type-btn');
    if (typeBtn) { toggleType(typeBtn.dataset.type); return; }

    const opt = e.target.closest('.opt');
    if (opt) { setAnswer(opt.dataset.qid, +opt.dataset.val); return; }

    const chip = e.target.closest('.toggle-btn[data-gid]');
    if (chip) { setGate(chip.dataset.gid, chip.dataset.val === 'true'); return; }

    const flag = e.target.closest('.flag');
    if (flag) { toggleFlag(flag.dataset.fid); return; }
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('모든 응답을 초기화합니다. 계속하시겠습니까?')) return;
    state.answers = {}; state.gates = {}; state.flags = {};
    save(); updateUI();
  });

  const fab = document.getElementById('scoreFab');
  fab.addEventListener('click', () => {
    document.getElementById('scorePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const scorePanel = document.getElementById('scorePanel');
  const onScroll = () => {
    const rect = scorePanel.getBoundingClientRect();
    const offScreen = rect.bottom < 80;
    fab.classList.toggle('visible', offScreen);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('exportMdBtn').addEventListener('click', () => {
    const md = buildMarkdown();
    downloadFile(`project-score-${Date.now()}.md`, md, 'text/markdown');
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const r = compute();
    const out = {
      version: '1.2',
      timestamp: new Date().toISOString(),
      mode: state.mode,
      vector: buildVector(),
      state,
      result: {
        total: +r.total.toFixed(2),
        scaled: +r.scaled.toFixed(2),
        penalties: r.penalties,
        decision: r.decision,
        decisionLabel: r.decision ? DECISIONS[r.decision].ko : null,
        hardReject: r.hardReject,
        failedGates: r.failedGates,
        axisScores: Object.fromEntries(
          Object.values(AXES).map(a => [a.code, +r.axisPoints[a.code].toFixed(2)])
        )
      }
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-score-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

// ─── init ────────────────────────────────────────────────────

renderModes();
renderTypes();
renderAxisBars();
renderGates();
try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
renderQuestions();
renderFlags();
bind();
updateUI();
