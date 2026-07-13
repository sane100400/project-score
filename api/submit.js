import { neon } from '@neondatabase/serverless';

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

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (isPlainObject(req.body)) return req.body;
  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
    return JSON.parse(String(req.body));
  }

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error('body_too_large');
  }
  return JSON.parse(raw);
}

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: 'invalid_json' });
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
    return sendJson(res, 400, { error: 'terms_not_accepted' });
  }

  const cleanTopic = clamp(topic, MAX_TOPIC).trim();
  if (!cleanTopic) {
    return sendJson(res, 400, { error: 'topic_required' });
  }

  if (!['learn', 'build', 'showcase'].includes(mode)) {
    return sendJson(res, 400, { error: 'invalid_mode' });
  }
  if (!Array.isArray(types) || types.some(t => typeof t !== 'string')) {
    return sendJson(res, 400, { error: 'invalid_types' });
  }
  if (!['white', 'black', 'both'].includes(track)) {
    return sendJson(res, 400, { error: 'invalid_track' });
  }
  if (!isPlainObject(answers) || !isPlainObject(gates) || !isPlainObject(flags)
      || !isPlainObject(inputs) || !isPlainObject(memos)) {
    return sendJson(res, 400, { error: 'invalid_state' });
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
    return sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error('submit_db_error', e);
    return sendJson(res, 500, { error: 'db_error' });
  }
}
