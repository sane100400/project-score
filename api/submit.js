import { neon } from '@neondatabase/serverless';
import { checkBotId } from 'botid/server';

const TERMS_VERSION = '2026-04-30';
const APP_VERSION = '3.1.0';

const MAX_TOPIC = 200;
const MAX_MEMO = 2000;
const MAX_INPUT = 500;

function clamp(s, max) {
  if (typeof s !== 'string') return '';
  return s.length > max ? s.slice(0, max) : s;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export const config = { runtime: 'nodejs' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405, headers: { 'content-type': 'application/json' }
    });
  }

  const verification = await checkBotId();
  if (verification.isBot) {
    return new Response(JSON.stringify({ error: 'bot_detected' }), {
      status: 403, headers: { 'content-type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }

  const {
    topic, estimatedHours, worthIt,
    mode, types, track,
    whiteScore, blackScore, whiteDecision, blackDecision,
    passedGates, penalties,
    answers, gates, flags, inputs, memos,
    vector, termsAccepted
  } = body || {};

  if (termsAccepted !== true) {
    return new Response(JSON.stringify({ error: 'terms_not_accepted' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }

  const cleanTopic = clamp(topic, MAX_TOPIC).trim();
  if (!cleanTopic) {
    return new Response(JSON.stringify({ error: 'topic_required' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }

  if (!['discover', 'build', 'compete'].includes(mode)) {
    return new Response(JSON.stringify({ error: 'invalid_mode' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }
  if (!Array.isArray(types) || types.some(t => typeof t !== 'string')) {
    return new Response(JSON.stringify({ error: 'invalid_types' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }
  if (!['white', 'black', 'both'].includes(track)) {
    return new Response(JSON.stringify({ error: 'invalid_track' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }
  if (!isPlainObject(answers) || !isPlainObject(gates) || !isPlainObject(flags)
      || !isPlainObject(inputs) || !isPlainObject(memos)) {
    return new Response(JSON.stringify({ error: 'invalid_state' }), {
      status: 400, headers: { 'content-type': 'application/json' }
    });
  }

  const cleanMemos = {};
  for (const [k, v] of Object.entries(memos)) {
    if (typeof v === 'string' && v.trim()) cleanMemos[String(k).slice(0, 16)] = clamp(v, MAX_MEMO);
  }
  const cleanInputs = {};
  for (const [k, v] of Object.entries(inputs)) {
    if (Array.isArray(v)) {
      cleanInputs[String(k).slice(0, 16)] = v.map(x => clamp(String(x ?? ''), MAX_INPUT));
    }
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      insert into submissions (
        topic, mode, types, track,
        white_score, black_score, white_decision, black_decision,
        passed_gates, penalties,
        answers, gates, flags, inputs, memos,
        vector, terms_version, app_version,
        estimated_hours, worth_it
      ) values (
        ${cleanTopic}, ${mode}, ${types.slice(0, 10)}, ${track},
        ${Number.isFinite(whiteScore) ? whiteScore : null},
        ${Number.isFinite(blackScore) ? blackScore : null},
        ${whiteDecision ?? null}, ${blackDecision ?? null},
        ${Number.isInteger(passedGates) ? passedGates : null},
        ${Number.isFinite(penalties) ? penalties : null},
        ${JSON.stringify(answers)}, ${JSON.stringify(gates)},
        ${JSON.stringify(flags)}, ${JSON.stringify(cleanInputs)},
        ${JSON.stringify(cleanMemos)},
        ${clamp(String(vector ?? ''), 4000)},
        ${TERMS_VERSION}, ${APP_VERSION},
        ${Number.isInteger(estimatedHours) && estimatedHours > 0 && estimatedHours <= 100000 ? estimatedHours : null},
        ${typeof worthIt === 'boolean' ? worthIt : null}
      )
    `;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('submit_db_error', e);
    return new Response(JSON.stringify({ error: 'db_error' }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
}
