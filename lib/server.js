const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}
function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ${name} não configurada na Vercel.`);
  return value;
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', env('TOKEN_SECRET')).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verify(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const expected = crypto.createHmac('sha256', env('TOKEN_SECRET')).update(body).digest();
  let actual;
  try { actual = Buffer.from(sig, 'base64url'); } catch { return false; }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.admin === true && payload.exp > Date.now();
  } catch { return false; }
}
async function supabase(method, body) {
  const url = env('SUPABASE_URL').replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const response = await fetch(`${url}/rest/v1/tournament_data${method === 'GET' ? '?id=eq.main&select=data' : ''}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(method === 'POST' ? { Prefer: 'resolution=merge-duplicates,return=minimal' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!response.ok) throw new Error(`Banco de dados respondeu ${response.status}: ${await response.text()}`);
  return method === 'GET' ? response.json() : null;
}
function initialData() {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data.json'), 'utf8'));
}
module.exports = { json, env, sign, verify, supabase, initialData };
