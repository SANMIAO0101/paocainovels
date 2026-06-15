(function(){
  const books=[{title:"猎捕燕子",url:"novels/hunting-swallow.html",tag:"BL",status:"连载中",desc:"示例作品，正文由 Worker / KV 分段加载。"}];
  const input=document.getElementById('searchInput');
  const results=document.getElementById('searchResults');
  if(input&&results){
    const render=(kw='')=>{results.innerHTML='';books.filter(b=>!kw||JSON.stringify(b).includes(kw)).forEach(b=>{results.insertAdjacentHTML('beforeend',`<article class="book-card"><div class="cover placeholder">${b.title}</div><div class="book-body"><span class="pill">${b.tag}</span><span class="status">${b.status}</span><h3><a href="${b.url}">${b.title}</a></h3><p>${b.desc}</p></div></article>`)});};
    render(); input.addEventListener('input',()=>render(input.value.trim()));
  }
  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if((e.ctrlKey||e.metaKey)&&['c','x','s','p','u','a'].includes(k)) e.preventDefault();
    if(k==='f12') e.preventDefault();
  });
})();
