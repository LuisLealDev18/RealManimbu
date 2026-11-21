const { json, supabase, initialData } = require('../lib/server');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return json(res, 405, { error: 'Método não permitido.' });
  try {
    const rows = await supabase('GET');
    if (rows.length && rows[0].data) return json(res, 200, { data: rows[0].data });
    return json(res, 200, { data: initialData() });
  } catch (error) {
    return json(res, 500, { error: error.message || 'Falha ao carregar dados.' });
  }
};
