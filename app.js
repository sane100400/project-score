// PROJECT SCORE v3.0 — Dual Track White/Black
import { MODES, TYPES, AXES, QUESTIONS, GATES, FLAGS, DECISIONS } from './questions.js';

const STORAGE_KEY = 'project-score-v3.0';

const state = {
  mode: 'build',
  types: ['dev'],
  track: 'both',   // 'white' | 'black' | 'both'
  answers: {},
  gates: {},
  flags: {},
  inputs: {},
  memos: {}
};
let activeTab = 'white';

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
function toneMaxWeight(tone) {
  return QUESTIONS.filter(q => AXES[q.axis].tone === tone).reduce((s, q) => s + weightFor(q), 0);
}

const whiteQuestions = QUESTIONS.filter(q => AXES[q.axis].tone === 'white');
const blackQuestions = QUESTIONS.filter(q => AXES[q.axis].tone === 'black');

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
  const whiteAxes = Object.values(AXES).filter(a => a.tone === 'white');
  const blackAxes = Object.values(AXES).filter(a => a.tone === 'black');

  const axisHTML = axes => axes.map(a => `
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

  document.getElementById('whiteAxisBars').innerHTML = axisHTML(whiteAxes);
  document.getElementById('blackAxisBars').innerHTML = axisHTML(blackAxes);
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

function renderQuestionHTML(questions) {
  const multi = state.types.length > 1;
  const tagBar = multi
    ? `<div class="question__tags">${state.types.map(t => `<span class="q-tag">${TYPES[t].name}</span>`).join('')}<span class="q-tag-note">관점 모두 고려</span></div>`
    : '';

  return questions.map(q => `
    <div class="question">
      <div class="question__meta">
        <span class="question__num">${q.id}</span>
        <span class="question__axis">${AXES[q.axis].ko} · ${AXES[q.axis].name}</span>
      </div>
      <h3 class="question__title">${qTitle(q)}</h3>
      ${q.hintByType && multi ? tagBar : ''}
      <div class="question__hint">${qHint(q)}</div>
      <div class="question__memo">
        <textarea class="memo-field" data-qid="${q.id}" placeholder="내 상황을 적어 보세요" rows="2">${state.memos[q.id] || ''}</textarea>
      </div>
      ${q.inputs ? `<div class="question__inputs">${q.inputs.map((inp, idx) => `
        <div class="input-row">
          <span class="input-row__label">${inp.label}</span>
          <input type="${inp.type === 'number' ? 'number' : inp.type === 'link' ? 'url' : 'text'}"
            class="input-row__field input-row__field--${inp.type}"
            data-qid="${q.id}" data-input-idx="${idx}"
            ${inp.type === 'number' ? 'min="0"' : ''}
            placeholder="${inp.type === 'number' ? '0' : inp.type === 'link' ? 'https://' : '입력...'}"
            value="${((state.inputs[q.id] || [])[idx]) || ''}"
          >
        </div>
      `).join('')}</div>` : ''}
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

function renderQuestions() {
  document.getElementById('whiteQuestionsList').innerHTML = renderQuestionHTML(whiteQuestions);
  document.getElementById('blackQuestionsList').innerHTML = renderQuestionHTML(blackQuestions);
}

function visibleFlags() {
  if (state.track === 'both') return FLAGS;
  return FLAGS.filter(f => f.tone === state.track);
}

function renderFlags() {
  const visible = visibleFlags();
  document.getElementById('flagsList').innerHTML = visible.map(f => `
    <div class="flag ${f.kind}" data-fid="${f.id}">
      <div class="flag__check"></div>
      <span class="flag__kind">${f.tone === 'white' ? '♔' : '♚'} ${f.kind === 'reject' ? 'HARD · RETHINK' : `−${f.penalty.toFixed(1)} 감점`}</span>
      <div class="flag__title">${f.id} · ${f.title}</div>
      <div class="flag__desc">${f.desc}</div>
    </div>
  `).join('');
  // Hide flags section entirely if no flags visible
  const section = document.getElementById('flagsSection');
  if (section) section.style.display = visible.length > 0 ? '' : 'none';
}

// ─── scoring ─────────────────────────────────────────────────

function compute() {
  const mode = currentMode();
  const axisPoints = {};
  for (const a of Object.values(AXES)) axisPoints[a.code] = 0;

  let whiteRaw = 0, blackRaw = 0;
  let whiteAnswered = 0, blackAnswered = 0;

  for (const q of QUESTIONS) {
    const v = state.answers[q.id];
    if (v === undefined) continue;
    const w = weightFor(q);
    const pts = w * (v / 2);
    axisPoints[q.axis] += pts;
    if (AXES[q.axis].tone === 'white') { whiteRaw += pts; whiteAnswered++; }
    else { blackRaw += pts; blackAnswered++; }
  }

  const whiteMax = toneMaxWeight('white');
  const blackMax = toneMaxWeight('black');

  // ♔ White: pure question score (0–10)
  const whiteScore = whiteMax > 0 ? (whiteRaw / whiteMax) * 10 : 0;

  // ♚ Black: questions (0–8) + gates (0–2) − penalties
  const passedGates = GATES.filter(g => state.gates[g.id] === true).length;
  const answeredGates = GATES.filter(g => state.gates[g.id] !== undefined).length;
  const gateScore = (passedGates / GATES.length) * 2;

  const penalties = FLAGS
    .filter(f => f.kind === 'penalty' && state.flags[f.id] && !isFlagDisabled(f.id))
    .reduce((s, f) => s + f.penalty, 0);

  const blackScoreRaw = (blackMax > 0 ? (blackRaw / blackMax) * 8 : 0) + gateScore;
  const blackScore = Math.max(0, blackScoreRaw - penalties);

  // ♔ White decision
  const whiteReject = FLAGS.some(f =>
    f.kind === 'reject' && f.tone === 'white' && state.flags[f.id] && !isFlagDisabled(f.id)
  );
  const wt = mode.whiteThresholds;
  let whiteDecision;
  if (whiteReject) whiteDecision = 'reject';
  else if (whiteAnswered < whiteQuestions.length) whiteDecision = null;
  else if (whiteScore >= wt.pass) whiteDecision = 'pass';
  else if (whiteScore >= wt.conditional) whiteDecision = 'conditional';
  else if (whiteScore >= wt.study) whiteDecision = 'study';
  else whiteDecision = 'reject';

  // ♚ Black decision
  const blackReject = FLAGS.some(f =>
    f.kind === 'reject' && f.tone === 'black' && state.flags[f.id] && !isFlagDisabled(f.id)
  );
  const failedGates = GATES.filter(g => state.gates[g.id] === false).map(g => g.id);
  const bt = mode.blackThresholds;
  let blackDecision;
  if (blackReject) blackDecision = 'reject';
  else if (failedGates.length > 0) blackDecision = 'revise';
  else if (blackAnswered < blackQuestions.length || answeredGates < GATES.length) blackDecision = null;
  else if (blackScore >= bt.pass) blackDecision = 'pass';
  else if (blackScore >= bt.conditional) blackDecision = 'conditional';
  else if (blackScore >= bt.study) blackDecision = 'study';
  else blackDecision = 'reject';

  return {
    whiteScore, blackScore,
    whiteDecision, blackDecision,
    whiteReject, blackReject,
    axisPoints, gateScore, penalties,
    whiteAnswered, blackAnswered,
    answeredGates, failedGates,
    passedGates
  };
}

function buildMarkdown() {
  const r = compute();
  const now = new Date();
  const stamp = now.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
  const mode = MODES[state.mode];
  const typeNames = state.types.length
    ? state.types.map(t => TYPES[t].name).join(' + ')
    : '(선택 없음)';

  const decisionText = (d) => d
    ? `**${DECISIONS[d].label}** — ${DECISIONS[d].ko} (${DECISIONS[d].desc})`
    : '_아직 판정 불가 (남은 항목에 답해 보세요)_';

  const lines = [];
  const trackLabel = state.track === 'white' ? '♔ WHITE 주제 진단'
    : state.track === 'black' ? '♚ BLACK 실행 진단'
    : '♔♚ DUAL TRACK';

  lines.push(`# PROJECT SCORE 결과`);
  lines.push('');
  lines.push(`- **작성 시각**: ${stamp}`);
  lines.push(`- **목적 모드**: ${mode.emoji} ${mode.name} — ${mode.desc}`);
  lines.push(`- **프로젝트 성격**: ${typeNames}`);
  lines.push(`- **진단 범위**: ${trackLabel}`);
  lines.push('');

  const renderQBlock = (qs) => {
    for (const q of qs) {
      const v = state.answers[q.id];
      const chosen = v !== undefined ? q.options.find(o => o.v === v) : null;
      const answerText = chosen
        ? `**${v}점** — ${chosen.label}${chosen.detail ? ` (${chosen.detail})` : ''}`
        : '_미응답_';
      lines.push(`### ${q.id}. ${qTitle(q)}`);
      lines.push('');
      lines.push(`- **축**: ${q.id} · ${AXES[q.axis].ko} (가중치 ${weightFor(q)})`);
      lines.push(`- **답변**: ${answerText}`);
      if (state.memos[q.id]) lines.push(`- **메모**: ${state.memos[q.id].replace(/\n/g, ' ')}`);
      if (q.inputs && state.inputs[q.id]) {
        for (let i = 0; i < q.inputs.length; i++) {
          const val = state.inputs[q.id][i];
          if (val) lines.push(`- **${q.inputs[i].label}**: ${val}`);
        }
      }
      lines.push(`- _${qHint(q).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}_`);
      lines.push('');
    }
  };

  // ♔ White
  if (state.track !== 'black') {
    lines.push(`## ♔ WHITE — 주제 진단`);
    lines.push('');
    lines.push(`> ## ${r.whiteScore.toFixed(1)} / 10`);
    lines.push('');
    lines.push(`- **판정**: ${decisionText(r.whiteDecision)}`);
    if (r.whiteReject) lines.push(`- ⚠️ 하드 리젝트 플래그 감지`);
    lines.push('');
    lines.push(`| 축 | 한국어 | 점수 | 최대 |`);
    lines.push(`|---|---|---:|---:|`);
    for (const a of Object.values(AXES).filter(a => a.tone === 'white')) {
      const pts = r.axisPoints[a.code];
      const max = axisMaxFor(a.code);
      lines.push(`| ${a.code} | ${a.ko} (${a.name}) | ${pts.toFixed(1)} | ${max} |`);
    }
    lines.push('');
    renderQBlock(whiteQuestions);
  }

  // ♚ Black
  if (state.track !== 'white') {
    lines.push(`## ♚ BLACK — 실행 진단`);
    lines.push('');
    lines.push(`> ## ${r.blackScore.toFixed(1)} / 10`);
    lines.push('');
    lines.push(`- Gate: ${r.gateScore.toFixed(1)} / 2.0`);
    if (r.penalties > 0) lines.push(`- 감점: −${r.penalties.toFixed(1)}`);
    lines.push(`- **판정**: ${decisionText(r.blackDecision)}`);
    if (r.blackReject) lines.push(`- ⚠️ 하드 리젝트 플래그 감지`);
    if (r.failedGates.length) lines.push(`- ⚠️ 실패한 게이트: ${r.failedGates.join(', ')}`);
    lines.push('');
    lines.push(`| 축 | 한국어 | 점수 | 최대 |`);
    lines.push(`|---|---|---:|---:|`);
    for (const a of Object.values(AXES).filter(a => a.tone === 'black')) {
      const pts = r.axisPoints[a.code];
      const max = axisMaxFor(a.code);
      lines.push(`| ${a.code} | ${a.ko} (${a.name}) | ${pts.toFixed(1)} | ${max} |`);
    }
    lines.push('');

    lines.push(`### 필수 게이트`);
    lines.push('');
    for (const g of GATES) {
      const v = state.gates[g.id];
      const mark = v === true ? '✅ 예' : v === false ? '❌ 아직입니다' : '➖ 미응답';
      lines.push(`- **${g.id}** · ${mark}`);
      lines.push(`  - ${g.text}`);
    }
    lines.push('');
    renderQBlock(blackQuestions);
  }

  // Flags
  const active = FLAGS.filter(f => state.flags[f.id] && !isFlagDisabled(f.id));
  if (active.length) {
    lines.push(`## 체크된 플래그`);
    lines.push('');
    for (const f of active) {
      const toneIcon = f.tone === 'white' ? '♔' : '♚';
      const head = f.kind === 'reject'
        ? `🛑 **${f.id} · ${f.title}** (${toneIcon} HARD · RETHINK)`
        : `⚠️ **${f.id} · ${f.title}** (${toneIcon} −${f.penalty.toFixed(1)})`;
      lines.push(`- ${head}`);
      lines.push(`  - ${f.desc}`);
    }
    lines.push('');
  }

  lines.push(`---`);
  lines.push(`_PROJECT SCORE v3.0 · Dual Track White/Black self-diagnostic_`);
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
  const parts = [`PS:3.0`, `MODE:${state.mode}`];
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

function setTrack(track) {
  if (!['white', 'black', 'both'].includes(track)) return;
  state.track = track;

  // Show/hide tab bar
  const tabBar = document.getElementById('tabBar');
  tabBar.style.display = track === 'both' ? '' : 'none';

  // When single track, show that panel directly; when both, follow activeTab
  if (track === 'both') {
    setTab(activeTab);
  } else {
    activeTab = track;
    document.getElementById('whitePanel').classList.toggle('active', track === 'white');
    document.getElementById('blackPanel').classList.toggle('active', track === 'black');
    // Style single-panel top edge
    document.getElementById('whitePanel').classList.toggle('single-track', track === 'white');
    document.getElementById('blackPanel').classList.toggle('single-track', track === 'black');
  }

  // Update track selector buttons
  document.querySelectorAll('.track-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.track === track);
  });

  // Filter flags by selected track
  renderFlags();
  updateUI();
  save();
}

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    const isActive = t.dataset.tab === tab;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive);
  });
  document.getElementById('whitePanel').classList.toggle('active', tab === 'white');
  document.getElementById('blackPanel').classList.toggle('active', tab === 'black');
  document.getElementById('whitePanel').classList.remove('single-track');
  document.getElementById('blackPanel').classList.remove('single-track');
}

function updateDecisionBadge(el, decision) {
  if (decision) {
    const d = DECISIONS[decision];
    el.className = `decision ${decision}`;
    el.innerHTML = `
      <span class="decision__tag">${d.label}</span>
      <div class="decision__ko">${d.ko}</div>
      <span class="decision__desc">${d.desc}</span>
    `;
  } else {
    el.className = 'decision';
    el.innerHTML = `
      <span class="decision__tag">Waiting</span>
      <div class="decision__ko">아직입니다</div>
      <span class="decision__desc">남은 질문에 답하면 결과가 여기에 표시됩니다</span>
    `;
  }
}

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

  // ♔ White score panel
  document.getElementById('whiteScoreValue').textContent = r.whiteScore.toFixed(1);
  const whitePct = (r.whiteAnswered / whiteQuestions.length) * 100;
  document.getElementById('whiteProgressFill').style.width = `${whitePct}%`;
  document.getElementById('whiteSublabel').textContent = `답변 ${r.whiteAnswered} / ${whiteQuestions.length}`;
  document.getElementById('whitePctLabel').textContent = `${Math.round(whitePct)}%`;
  updateDecisionBadge(document.getElementById('whiteDecisionBadge'), r.whiteDecision);

  // ♚ Black score panel
  document.getElementById('blackScoreValue').textContent = r.blackScore.toFixed(1);
  const blackTotal = blackQuestions.length + GATES.length;
  const blackDone = r.blackAnswered + r.answeredGates;
  const blackPct = (blackDone / blackTotal) * 100;
  document.getElementById('blackProgressFill').style.width = `${blackPct}%`;
  document.getElementById('blackSublabel').textContent =
    `답변 ${r.blackAnswered} / ${blackQuestions.length} · 게이트 ${r.answeredGates} / ${GATES.length}`;
  document.getElementById('blackPctLabel').textContent = `${Math.round(blackPct)}%`;
  document.getElementById('gateScoreVal').textContent = `${r.gateScore.toFixed(1)} / 2.0`;
  updateDecisionBadge(document.getElementById('blackDecisionBadge'), r.blackDecision);

  // Tab bar scores
  document.getElementById('whiteTabScore').textContent = r.whiteScore.toFixed(1);
  document.getElementById('blackTabScore').textContent = r.blackScore.toFixed(1);

  // FAB scores — show only relevant track(s)
  const fabWhite = document.getElementById('scoreFabWhite');
  const fabBlack = document.getElementById('scoreFabBlack');
  const fabSep   = document.getElementById('scoreFabSep');
  if (fabWhite) fabWhite.style.display = (state.track === 'black') ? 'none' : '';
  if (fabBlack) fabBlack.style.display = (state.track === 'white') ? 'none' : '';
  if (fabSep)   fabSep.style.display   = (state.track === 'both')  ? ''     : 'none';
  document.getElementById('scoreFabWhiteVal').textContent = r.whiteScore.toFixed(1);
  document.getElementById('scoreFabBlackVal').textContent = r.blackScore.toFixed(1);

  // Axis bars
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
function setInput(qid, idx, value) {
  if (!state.inputs[qid]) state.inputs[qid] = [];
  state.inputs[qid][idx] = value;
  const q = QUESTIONS.find(q => q.id === qid);
  if (q && q.inputs) {
    const inp = q.inputs[idx];
    if (inp && inp.auto && inp.type === 'number') {
      const val = Number(value) || 0;
      for (const rule of inp.auto) {
        if (val >= rule.threshold) {
          state.answers[qid] = rule.score;
          break;
        }
      }
    }
  }
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

    const tab = e.target.closest('.tab');
    if (tab) { setTab(tab.dataset.tab); return; }

    const opt = e.target.closest('.opt');
    if (opt) { setAnswer(opt.dataset.qid, +opt.dataset.val); return; }

    const chip = e.target.closest('.toggle-btn[data-gid]');
    if (chip) { setGate(chip.dataset.gid, chip.dataset.val === 'true'); return; }

    const trackBtn = e.target.closest('.track-btn');
    if (trackBtn) { setTrack(trackBtn.dataset.track); return; }

    const flag = e.target.closest('.flag');
    if (flag) { toggleFlag(flag.dataset.fid); return; }
  });

  document.addEventListener('input', (e) => {
    const field = e.target.closest('.input-row__field');
    if (field) { setInput(field.dataset.qid, +field.dataset.inputIdx, field.value); return; }

    const memo = e.target.closest('.memo-field');
    if (memo) { state.memos[memo.dataset.qid] = memo.value; save(); }
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('모든 응답을 초기화합니다. 계속할까요?')) return;
    state.answers = {}; state.gates = {}; state.flags = {}; state.inputs = {}; state.memos = {};
    renderQuestions(); save(); updateUI();
  });

  const fab = document.getElementById('scoreFab');
  fab.addEventListener('click', () => {
    let target;
    if (state.track === 'both') {
      target = document.getElementById('tabBar');
    } else if (state.track === 'white') {
      target = document.getElementById('whiteScorePanel');
    } else {
      target = document.getElementById('blackScorePanel');
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const onScroll = () => {
    let anchor;
    if (state.track === 'both') {
      anchor = document.getElementById('tabBar');
    } else if (state.track === 'white') {
      anchor = document.getElementById('whiteScorePanel');
    } else {
      anchor = document.getElementById('blackScorePanel');
    }
    const rect = anchor.getBoundingClientRect();
    fab.classList.toggle('visible', rect.bottom < 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('exportMdBtn').addEventListener('click', () => {
    if (!confirm('결과를 Markdown 파일로 다운로드할까요?')) return;
    const md = buildMarkdown();
    downloadFile(`project-score-${Date.now()}.md`, md, 'text/markdown');
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    if (!confirm('결과를 JSON 파일로 다운로드할까요?')) return;
    const r = compute();
    const result = {};
    if (state.track !== 'black') {
      result.white = {
        score: +r.whiteScore.toFixed(2),
        decision: r.whiteDecision,
        decisionLabel: r.whiteDecision ? DECISIONS[r.whiteDecision].ko : null,
        hardReject: r.whiteReject,
        axisScores: Object.fromEntries(
          Object.values(AXES).filter(a => a.tone === 'white')
            .map(a => [a.code, +r.axisPoints[a.code].toFixed(2)])
        )
      };
    }
    if (state.track !== 'white') {
      result.black = {
        score: +r.blackScore.toFixed(2),
        gateScore: +r.gateScore.toFixed(2),
        penalties: r.penalties,
        decision: r.blackDecision,
        decisionLabel: r.blackDecision ? DECISIONS[r.blackDecision].ko : null,
        hardReject: r.blackReject,
        failedGates: r.failedGates,
        axisScores: Object.fromEntries(
          Object.values(AXES).filter(a => a.tone === 'black')
            .map(a => [a.code, +r.axisPoints[a.code].toFixed(2)])
        )
      };
    }
    const out = {
      version: '3.0',
      timestamp: new Date().toISOString(),
      mode: state.mode,
      track: state.track,
      vector: buildVector(),
      state,
      result
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
