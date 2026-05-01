#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'questions.md');
const DEST = path.join(__dirname, 'questions.js');

// ─── security helpers ───────────────────────────────────────

/** Strip any HTML/XML-like tags (complete or incomplete) to prevent XSS */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<\/?[^>]+(>|$)/g, '')   // <tag>, </tag>, <incomplete
    .replace(/javascript:/gi, '')      // javascript: protocol
    .replace(/on\w+\s*=/gi, '')        // onerror=, onclick=, etc.
    .trim();
}

/** ID must start with a letter, contain only A-Z a-z 0-9 _ */
function validateId(id, context) {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(id)) {
    fail(`${context}: ID "${id}" — 영문자로 시작, 영숫자·밑줄만 허용`);
  }
}

/** Strict numeric conversion — rejects NaN, Infinity, empty */
function toNum(val, context) {
  const n = Number(val);
  if (!Number.isFinite(n)) {
    fail(`${context}: "${val}"은 유효한 숫자가 아닙니다`);
  }
  return n;
}

let errorCount = 0;
function fail(msg) {
  console.error(`❌ ${msg}`);
  errorCount++;
}

// ─── parser ─────────────────────────────────────────────────

function splitByH2(text) {
  const map = {};
  for (const part of text.split(/^## /m)) {
    if (!part.trim()) continue;
    const nl = part.indexOf('\n');
    const title = (nl >= 0 ? part.slice(0, nl) : part).trim();
    const body  = nl >= 0 ? part.slice(nl + 1).trim() : '';
    map[title] = body;
  }
  return map;
}

function splitByH3(text) {
  const items = [];
  for (const part of text.split(/^### /m)) {
    if (!part.trim()) continue;
    const nl = part.indexOf('\n');
    const id   = (nl >= 0 ? part.slice(0, nl) : part).trim();
    const body = nl >= 0 ? part.slice(nl + 1).trim() : '';
    items.push({ id, body });
  }
  return items;
}

function splitByH4(text) {
  const map = {};
  for (const part of text.split(/^#### /m)) {
    if (!part.trim()) continue;
    const nl = part.indexOf('\n');
    const title = (nl >= 0 ? part.slice(0, nl) : part).trim();
    const body  = nl >= 0 ? part.slice(nl + 1).trim() : '';
    map[title] = body;
  }
  return map;
}

/** Parse `- key: value` lines */
function parseProps(text) {
  const props = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^- (\w+):\s*(.+)$/);
    if (m) props[m[1]] = m[2].trim();
  }
  return props;
}

/** Parse `key=val, key=val` into { key: number } */
function parseKV(str) {
  const out = {};
  if (!str) return out;
  for (const token of str.split(',')) {
    const eq = token.indexOf('=');
    if (eq < 0) continue;
    const k = token.slice(0, eq).trim();
    const v = token.slice(eq + 1).trim();
    validateId(k, 'key-value key');
    out[k] = toNum(v, `key "${k}"`);
  }
  return out;
}

/** Parse comma-separated list */
function parseCSV(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

/** Parse markdown table rows (skip header + separator) */
function parseTable(text) {
  const lines = text.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 3) return [];
  return lines.slice(2).map(row =>
    row.split('|').map(c => c.trim()).filter(Boolean)
  );
}

/** Parse `- key: value` list where keys are type IDs */
function parseTypedList(text) {
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^- (\w+):\s*(.+)$/);
    if (m) {
      validateId(m[1], '타입 키');
      out[m[1]] = sanitize(m[2]);
    }
  }
  return out;
}

// ─── build ──────────────────────────────────────────────────

const raw = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const sections = splitByH2(raw);

// — Modes —
const modes = {};
for (const item of splitByH3(sections['모드'] || '')) {
  validateId(item.id, '모드');
  const p = parseProps(item.body);
  if (!p.name) fail(`모드 ${item.id}: name 필수`);
  if (!p.whiteThresholds) fail(`모드 ${item.id}: whiteThresholds 필수`);
  if (!p.blackThresholds) fail(`모드 ${item.id}: blackThresholds 필수`);
  modes[item.id] = {
    id: item.id,
    emoji: sanitize(p.emoji || ''),
    name: sanitize(p.name || ''),
    desc: sanitize(p.desc || ''),
    example: sanitize(p.example || ''),
    whiteThresholds: parseKV(p.whiteThresholds),
    blackThresholds: parseKV(p.blackThresholds),
    weightOverrides: parseKV(p.weightOverrides),
    disabledFlags: parseCSV(p.disabledFlags)
  };
}

// — Types —
const types = {};
for (const item of splitByH3(sections['타입'] || '')) {
  validateId(item.id, '타입');
  const p = parseProps(item.body);
  types[item.id] = {
    id: item.id,
    name: sanitize(p.name || ''),
    desc: sanitize(p.desc || '')
  };
}

// — Axes —
const VALID_TONES = new Set(['white', 'black']);
const axes = {};
for (const item of splitByH3(sections['축'] || '')) {
  validateId(item.id, '축');
  const p = parseProps(item.body);
  if (!VALID_TONES.has(p.tone)) fail(`축 ${item.id}: tone은 white 또는 black만 가능`);
  axes[item.id] = {
    code: item.id,
    name: sanitize(p.name || ''),
    ko: sanitize(p.ko || ''),
    tone: VALID_TONES.has(p.tone) ? p.tone : 'black',
    full: sanitize(p.full || '')
  };
}

// — Questions —
const questions = [];
for (const item of splitByH3(sections['질문'] || '')) {
  validateId(item.id, '질문');
  const p = parseProps(item.body);
  const subs = splitByH4(item.body);

  if (!p.axis || !axes[p.axis]) fail(`질문 ${item.id}: 유효하지 않은 axis "${p.axis}"`);
  if (!p.title) fail(`질문 ${item.id}: title 필수`);

  const q = {
    id: item.id,
    axis: p.axis || '',
    weight: toNum(p.weight || '0', `질문 ${item.id} weight`),
    title: sanitize(p.title || ''),
    hint: sanitize(p.hint || '')
  };

  if (subs['타입별 제목']) q.titleByType = parseTypedList(subs['타입별 제목']);
  if (subs['타입별 힌트']) q.hintByType  = parseTypedList(subs['타입별 힌트']);

  if (subs['선택지']) {
    const optText = subs['선택지'];
    const hasTable = optText.split('\n').some(l => l.trim().startsWith('|'));
    if (hasTable) {
      const rows = parseTable(optText);
      if (rows.length === 0) fail(`질문 ${item.id}: 선택지 테이블이 비어 있습니다`);
      q.options = rows.map(cells => ({
        v: toNum(cells[0], `질문 ${item.id} 선택지 점수`),
        label: sanitize(cells[1] || ''),
        detail: sanitize(cells[2] || '')
      }));
    } else {
      // List format: - 0: label | detail
      q.options = [];
      for (const line of optText.split('\n')) {
        const m = line.match(/^- (\d+):\s*(.+)$/);
        if (!m) continue;
        const parts = m[2].split('|').map(s => s.trim());
        q.options.push({
          v: toNum(m[1], `질문 ${item.id} 선택지 점수`),
          label: sanitize(parts[0] || ''),
          detail: sanitize(parts[1] || '')
        });
      }
      if (q.options.length === 0) fail(`질문 ${item.id}: 선택지가 비어 있습니다`);
    }
  } else {
    fail(`질문 ${item.id}: #### 선택지 섹션 필수`);
  }

  if (subs['입력']) {
    const validInputTypes = new Set(['number', 'link', 'text']);
    const inputText = subs['입력'];
    const hasTable = inputText.split('\n').some(l => l.trim().startsWith('|'));
    const inputRows = hasTable ? parseTable(inputText) : [];

    if (!hasTable) {
      // List format: - type: label | auto
      for (const line of inputText.split('\n')) {
        const m = line.match(/^- (\w+):\s*(.+)$/);
        if (!m) continue;
        const parts = m[2].split('|').map(s => s.trim());
        inputRows.push([m[1], parts[0], parts[1] || '']);
      }
    }

    q.inputs = inputRows.map(cells => {
      const type = (cells[0] || '').trim().toLowerCase();
      if (!validInputTypes.has(type)) fail(`질문 ${item.id}: 입력 타입 "${type}"은 number, link, text만 가능`);
      const input = { type, label: sanitize(cells[1] || '') };
      if (cells[2] && cells[2].trim()) {
        const rules = [];
        for (const token of cells[2].split(',')) {
          const m = token.trim().match(/^(\d+)\s*→\s*(\d+)$/);
          if (m) rules.push({ threshold: +m[1], score: +m[2] });
        }
        if (rules.length) input.auto = rules.sort((a, b) => b.threshold - a.threshold);
      }
      return input;
    });
  }

  questions.push(q);
}

// — Checks (필수체크: 점수 미반영, 제출 전 필수 확인) —
const checks = [];
for (const item of splitByH3(sections['필수체크'] || '')) {
  validateId(item.id, '필수체크');
  const p = parseProps(item.body);
  if (!p.title) fail(`필수체크 ${item.id}: title 필수`);
  checks.push({
    id: item.id,
    title: sanitize(p.title || ''),
    hint: sanitize(p.hint || ''),
    peopleLabel: sanitize(p.peopleLabel || '투입 인원'),
    peopleUnit: sanitize(p.peopleUnit || '명'),
    monthsLabel: sanitize(p.monthsLabel || '기간'),
    monthsUnit: sanitize(p.monthsUnit || '개월'),
    hoursPerDayLabel: sanitize(p.hoursPerDayLabel || '하루 작업시간'),
    hoursPerDayUnit: sanitize(p.hoursPerDayUnit || '시간/일'),
    confirmLabel: sanitize(p.confirmLabel || '이 규모가 현실적이라고 판단합니다')
  });
}

// — Gates —
const gates = [];
for (const item of splitByH3(sections['게이트'] || '')) {
  validateId(item.id, '게이트');
  const p = parseProps(item.body);
  const text = p.text || item.body;
  if (!text.trim()) fail(`게이트 ${item.id}: text 필수`);
  gates.push({ id: item.id, text: sanitize(text) });
}

// — Flags —
const VALID_KINDS = new Set(['reject', 'penalty']);
const flags = [];
for (const item of splitByH3(sections['플래그'] || '')) {
  validateId(item.id, '플래그');
  const p = parseProps(item.body);
  if (!VALID_KINDS.has(p.kind)) fail(`플래그 ${item.id}: kind는 reject 또는 penalty만 가능`);
  if (!VALID_TONES.has(p.tone)) fail(`플래그 ${item.id}: tone은 white 또는 black만 가능`);

  const flag = {
    id: item.id,
    kind: VALID_KINDS.has(p.kind) ? p.kind : 'penalty',
    tone: VALID_TONES.has(p.tone) ? p.tone : 'black',
    title: sanitize(p.title || ''),
    desc: sanitize(p.desc || '')
  };
  if (p.penalty !== undefined) {
    flag.penalty = toNum(p.penalty, `플래그 ${item.id} penalty`);
  }
  flags.push(flag);
}

// — Decisions —
const decisions = {};
for (const item of splitByH3(sections['판정'] || '')) {
  validateId(item.id, '판정');
  const p = parseProps(item.body);
  decisions[item.id] = {
    label: sanitize(p.label || ''),
    ko: sanitize(p.ko || ''),
    desc: sanitize(p.desc || ''),
    tone: sanitize(p.tone || '')
  };
}

// ─── structural validation ──────────────────────────────────

if (Object.keys(modes).length === 0)     fail('모드가 하나도 없습니다');
if (Object.keys(axes).length === 0)      fail('축이 하나도 없습니다');
if (questions.length === 0)              fail('질문이 하나도 없습니다');
if (gates.length === 0)                  fail('게이트가 하나도 없습니다');
if (flags.length === 0)                  fail('플래그가 하나도 없습니다');
if (Object.keys(decisions).length === 0) fail('판정이 하나도 없습니다');

// Cross-reference: question axes must exist
for (const q of questions) {
  if (!axes[q.axis]) fail(`질문 ${q.id}: axis "${q.axis}"는 축 섹션에 없습니다`);
}

// Cross-reference: disabled flags must exist
for (const [mId, mode] of Object.entries(modes)) {
  for (const fid of mode.disabledFlags) {
    if (!flags.find(f => f.id === fid)) fail(`모드 ${mId}: disabledFlags의 "${fid}"는 플래그에 없습니다`);
  }
}

if (errorCount > 0) {
  console.error(`\n빌드 실패: ${errorCount}개 오류`);
  process.exit(1);
}

// ─── output ─────────────────────────────────────────────────

const js = [
  '// AUTO-GENERATED from questions.md — do not edit directly',
  '// Run: node build.js',
  '// PROJECT SCORE v3.0 — Dual Track White/Black',
  '',
  `export const MODES = ${JSON.stringify(modes, null, 2)};`,
  '',
  `export const TYPES = ${JSON.stringify(types, null, 2)};`,
  '',
  `export const AXES = ${JSON.stringify(axes, null, 2)};`,
  '',
  `export const QUESTIONS = ${JSON.stringify(questions, null, 2)};`,
  '',
  `export const CHECKS = ${JSON.stringify(checks, null, 2)};`,
  '',
  `export const GATES = ${JSON.stringify(gates, null, 2)};`,
  '',
  `export const FLAGS = ${JSON.stringify(flags, null, 2)};`,
  '',
  `export const DECISIONS = ${JSON.stringify(decisions, null, 2)};`,
  ''
].join('\n');

fs.writeFileSync(DEST, js, 'utf8');
console.log(`✓ questions.js 생성 완료 (질문 ${questions.length}개, 게이트 ${gates.length}개, 필수체크 ${checks.length}개, 플래그 ${flags.length}개)`);
