const { json, env, sign } = require('../lib/server');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  try {
    const { user, password } = req.body || {};
    const userOk = user === env('ADMIN_USER');
    const passOk = typeof password === 'string' && password.length === env('ADMIN_PASSWORD').length && require('crypto').timingSafeEqual(Buffer.from(password), Buffer.from(env('ADMIN_PASSWORD')));
    if (!userOk || !passOk) return json(res, 401, { error: 'Usuário ou senha incorretos.' });
    const token = sign({ admin: true, exp: Date.now() + 8 * 60 * 60 * 1000 });
    return json(res, 200, { token });
  } catch (error) { return json(res, 500, { error: error.message || 'Erro no login.' }); }
};
