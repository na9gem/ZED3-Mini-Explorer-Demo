(() => {
  'use strict';
  const api = ZED3, app = document.getElementById('app');
  let data;
  try { data = api.validate(globalThis.ZED3_DATA); }
  catch (error) { const p=document.createElement('p'); p.textContent='Dataset unavailable: synthetic data validation failed.'; app.replaceChildren(p); return; }
  let state = api.defaults();
  const el = (tag, text, cls) => { const n=document.createElement(tag); if(text !== undefined)n.textContent=text; if(cls)n.className=cls; return n; };
  function go(hash) { if(location.hash === hash) render(); else location.hash=hash; }
  function form() {
    const f=el('form'), label=el('label','Search records'), input=el('input');
    input.type='search'; input.name='query'; input.value=state.query; input.placeholder='ID, title, description or keyword'; label.append(input);
    const catLabel=el('label','Category'), select=el('select'); select.name='category';
    for(const category of ['All',...new Set(data.map(r=>r.category))]) {const o=el('option',category);o.value=category;select.append(o);} select.value=state.category;catLabel.append(select);
    const submit=el('button','Search'), reset=el('button','Reset','secondary');submit.type='submit';reset.type='button';
    reset.onclick=()=>{state=api.defaults();go('#search');};
    f.onsubmit=e=>{e.preventDefault();state={query:input.value,category:select.value};go('#search');};
    f.append(label,catLabel,submit,reset);const panel=el('section',undefined,'panel');panel.append(f);return panel;
  }
  function render() {
    app.replaceChildren(); const hash=location.hash || '#home';
    if(hash.startsWith('#detail/')) {
      const back=el('a','← Back to results','back');back.href='#search';app.append(back);
      let id;try{id=decodeURIComponent(hash.slice(8));}catch{id='';}
      const r=api.detail(data,id);
      if(!r){app.append(el('h1','Not Found'),el('p','No record exists for this exact ID.'));return;}
      app.append(el('div',r.category.toUpperCase(),'eyebrow'),el('h1',r.title));
      const panel=el('section',undefined,'panel'), dl=el('dl');
      for(const key of api.fields){dl.append(el('dt',key),el('dd',key==='source_ref'?api.sourceLabel(r):Array.isArray(r[key])?r[key].join(', '):r[key]));}panel.append(dl);app.append(panel);return;
    }
    if(hash!=='#search'){
      app.append(el('div','SYNTHETIC INFORMATION EXPLORER','eyebrow'),el('h1','Explore the building blocks.'),el('p','Browse 18 synthetic examples across six engineering categories. Search and inspect records in this standalone, read-only demonstration.'));
      const link=el('a','Browse all records →','button');link.href='#search';app.append(link,form());return;
    }
    app.append(el('div','RECORD EXPLORER','eyebrow'),el('h1','Search results'),form());
    const results=api.search(data,state.query,state.category), status=api.resultState(data,results);
    const count=el('div',undefined,'count');count.setAttribute('role','status');count.append(el('strong',`${results.length} results`),el('span','Sorted by title, then ID · ascending'));app.append(count);
    if(status!=='RESULTS'){const box=el('section',undefined,'panel empty');box.append(el('h2',status==='EMPTY_STATE'?'Dataset is empty':'No results found'),el('p',status==='EMPTY_STATE'?'No synthetic records are available.':'Try another query or reset the filters.'));app.append(box);return;}
    const list=el('div',undefined,'results');
    for(const r of results){const card=el('article',undefined,'card'),heading=el('h2'),link=el('a',r.title);link.href='#detail/'+encodeURIComponent(r.id);heading.append(link);card.append(el('small',r.category),heading,el('div',r.id,'record-id'),el('p',r.description));list.append(card);}app.append(list);
  }
  window.addEventListener('hashchange',render);render();
})();
