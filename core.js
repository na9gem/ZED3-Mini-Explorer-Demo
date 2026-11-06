(function (root) {
  'use strict';
  const fields = ['id','category','title','description','keywords','source_ref','version_label','data_status'];
  const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  function validate(data) {
    if (!Array.isArray(data)) throw new Error('Dataset must be an array');
    const ids = new Set();
    for (const r of data) {
      if (!r || fields.some(k => k === 'keywords' ? !Array.isArray(r[k]) || !r[k].length || r[k].some(v => typeof v !== 'string' || !v.trim()) : typeof r[k] !== 'string' || !r[k].trim()) || r.data_status !== 'SYNTHETIC' || !r.source_ref.startsWith('SYNTHETIC-') || ids.has(r.id)) throw new Error('Invalid synthetic dataset');
      ids.add(r.id);
    }
    return data;
  }
  function search(data, query = '', category = 'All') {
    const q = query.trim().toLowerCase();
    return data.filter(r => (category === 'All' || r.category === category) && [r.id,r.title,r.description,...r.keywords].some(v => v.toLowerCase().includes(q)))
      .sort((a,b) => compare(a.title,b.title) || compare(a.id,b.id));
  }
  const detail = (data,id) => data.find(r => r.id === id) || null;
  const sourceLabel = r => typeof r.source_ref === 'string' && r.source_ref.trim() ? r.source_ref : 'Source not provided';
  const resultState = (data, results) => !data.length ? 'EMPTY_STATE' : !results.length ? 'NO_RESULTS_STATE' : 'RESULTS';
  const defaults = () => ({query:'', category:'All'});
  const api = {fields,validate,search,detail,sourceLabel,resultState,defaults};
  root.ZED3 = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
