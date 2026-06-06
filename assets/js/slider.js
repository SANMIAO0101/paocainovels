
(function(){
  async function init(){const el=document.getElementById('hero-slider'); if(!el||!window.Site) return; const novels=await Site.json('data/novels.json'); const slides=novels.filter(n=>n.featured); let index=0;
    function draw(){const n=slides[index%slides.length]; el.innerHTML=`<div class="banner-slide"><div><img class="banner-cover" src="${Site.path(n.cover)}" alt="${escapeHTML(n.title)}封面"></div><div><p class="kicker">Featured Story</p><h1 class="hero-title">${escapeHTML(n.title)}</h1><p class="hero-subtitle">${escapeHTML(n.subtitle)}</p><div class="tag-row">${Site.tags(n.tags)}</div><p>${escapeHTML(n.intro)}</p><div class="hero-actions"><a class="primary-btn" href="${Site.path(n.chapters[0].file)}">立即阅读</a><a class="outline-btn" href="${Site.path('novels/'+n.id+'.html')}">查看详情</a></div></div></div>`}
    draw(); setInterval(()=>{index++; draw()},5200);
  }
  document.addEventListener('DOMContentLoaded',init);
})();
