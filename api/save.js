const { json, verify, supabase } = require('../lib/server');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
  try {
    if (!verify(req)) return json(res, 401, { error: 'Sessão inválida ou expirada. Entre novamente.' });
    const data = req.body && req.body.data;
    if (!data || !Array.isArray(data.categories)) return json(res, 400, { error: 'Dados do torneio inválidos.' });
    await supabase('POST', { id: 'main', data, updated_at: new Date().toISOString() });
    return json(res, 200, { ok: true });
  } catch (error) { return json(res, 500, { error: error.message || 'Não foi possível salvar.' }); }
};
