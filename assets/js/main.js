
(function(){
  const $=(s,scope=document)=>scope.querySelector(s); const $$=(s,scope=document)=>Array.from(scope.querySelectorAll(s));
  const escapeHTML=(v="")=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const Site={
    base(){return window.SITE_BASE||""}, path(p){return this.base()+p},
    async json(p){const r=await fetch(this.path(p)); if(!r.ok) throw new Error('无法读取 '+p); return r.json()},
    date(d){const x=new Date(d+'T00:00:00'); return isNaN(x)?d:x.toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'})},
    tagName(id){const m={bg:'女频',bl:'耽美',modern:'现代',ancient:'古代',western:'西幻',suspense:'悬疑'}; return m[id]||id},
    socialBox(){return `<div class="social-box">
      <a class="social-link" href="https://weibo.com/" target="_blank" rel="noopener"><strong>微博</strong><span>更新公告 / 番外预告 / 下单咨询</span></a>
      <a class="social-link" href="${Site.path('assets/images/icons/wechat-qr.svg')}" target="_blank" rel="noopener"><strong>微信</strong><span>打开二维码，添加账号后联系购买后续章节</span></a>
      <a class="social-link" href="https://www.xiaohongshu.com/" target="_blank" rel="noopener"><strong>小红书</strong><span>封面灵感 / 角色碎片 / 下单入口</span></a>
    </div>`},
    tags(tags=[]){return tags.map(t=>`<a class="tag" href="${Site.path('tags/'+t+'.html')}">#${escapeHTML(Site.tagName(t))}</a>`).join('')},
    card(n){const first=n.chapters?.[0]; const latest=n.chapters?.[n.chapters.length-1]; return `<article class="card">
      <a href="${Site.path('novels/'+n.id+'.html')}"><img class="card-cover" src="${Site.path(n.cover)}" alt="${escapeHTML(n.title)}封面"></a>
      <div class="card-body"><h3 class="card-title"><a href="${Site.path('novels/'+n.id+'.html')}">${escapeHTML(n.title)}</a></h3>
      <p class="card-meta"><a href="${Site.path('authors/'+n.authorId+'.html')}">${escapeHTML(n.authorName)}</a> · <span class="status">${escapeHTML(n.status)}</span></p>
      <div class="tag-row">${Site.tags(n.tags)}</div><p class="card-intro">${escapeHTML(n.intro)}</p>
      <div class="hero-actions"><a class="primary-btn" href="${Site.path(first.file)}">立即阅读</a><a class="outline-btn" href="${Site.path('novels/'+n.id+'.html')}">查看详情</a></div>
      ${latest?.access==='order'?'<p class="chapter-note">后续章节可通过社交入口联系下单。</p>':''}</div></article>`},
    update(n){const c=n.chapters[n.chapters.length-1]; const badge=c.access==='order'?'<span class="access-badge">社交购买</span>':'<span class="access-badge">免费</span>'; return `<a class="update-item" href="${Site.path(c.file)}"><strong>${escapeHTML(n.title)}</strong><span>${escapeHTML(c.title)} ${badge}</span><span class="muted">${Site.date(c.date)}</span></a>`}
  };
  window.Site=Site; window.escapeHTML=escapeHTML;

  function initTheme(){const saved=localStorage.getItem('pcxf-theme'); if(saved) document.documentElement.dataset.theme=saved; $$('.theme-toggle').forEach(btn=>btn.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark'; document.documentElement.dataset.theme=next; localStorage.setItem('pcxf-theme',next)}));}
  function sortLatest(arr){return [...arr].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt))}

  function initPageTurns(){
    const pages=[
      {path:'index.html',title:'首页'},
      {path:'stories.html',title:'小说总列表'},
      {path:'search.html',title:'搜索页'},
      {path:'novels/liuan.html',title:'柳安详情'},
      {path:'chapters/liuan/chapter-1.html',title:'柳安 第1章'},
      {path:'chapters/liuan/chapter-2.html',title:'柳安 第2章'},
      {path:'chapters/liuan/chapter-3.html',title:'柳安 后续入口'},
      {path:'novels/fanzuoyong.html',title:'反作用定律详情'},
      {path:'chapters/fanzuoyong/chapter-1.html',title:'反作用定律 第1章'},
      {path:'chapters/fanzuoyong/chapter-2.html',title:'反作用定律 第2章'},
      {path:'chapters/fanzuoyong/chapter-3.html',title:'反作用定律 后续入口'},
      {path:'novels/huimeng.html',title:'回梦旧巷详情'},
      {path:'chapters/huimeng/chapter-1.html',title:'回梦旧巷 第1章'},
      {path:'chapters/huimeng/chapter-2.html',title:'回梦旧巷 第2章'},
      {path:'chapters/huimeng/chapter-3.html',title:'回梦旧巷 后续入口'},
      {path:'novels/yuese.html',title:'月色邮差详情'},
      {path:'chapters/yuese/chapter-1.html',title:'月色邮差 第1章'},
      {path:'chapters/yuese/chapter-2.html',title:'月色邮差 第2章'},
      {path:'chapters/yuese/chapter-3.html',title:'月色邮差 后续入口'},

      {path:'novels/hunting-swallow.html',title:'猎捕燕子详情'},
      {path:'chapters/hunting-swallow/chapter-1.html',title:'猎捕燕子 第1章'},
      {path:'chapters/hunting-swallow/chapter-2.html',title:'猎捕燕子 第2章'},
      {path:'chapters/hunting-swallow/chapter-3.html',title:'猎捕燕子 第3章'},
      {path:'chapters/hunting-swallow/chapter-4.html',title:'猎捕燕子 第4章'},
      {path:'chapters/hunting-swallow/chapter-5.html',title:'猎捕燕子 第5章'},
      {path:'chapters/hunting-swallow/chapter-6.html',title:'猎捕燕子 第6章'},
      {path:'chapters/hunting-swallow/chapter-7.html',title:'猎捕燕子 第7章'},
      {path:'chapters/hunting-swallow/chapter-8.html',title:'猎捕燕子 第8章'},
      {path:'chapters/hunting-swallow/chapter-9.html',title:'猎捕燕子 第9章'},
      {path:'chapters/hunting-swallow/chapter-10.html',title:'猎捕燕子 第10章'},
      {path:'tags/bg.html',title:'女频标签'},
      {path:'tags/bl.html',title:'耽美标签'},
      {path:'tags/modern.html',title:'现代标签'},
      {path:'tags/ancient.html',title:'古代标签'},
      {path:'tags/western.html',title:'西幻标签'},
      {path:'tags/suspense.html',title:'悬疑标签'},
      {path:'authors/author-1.html',title:'作者页一'},
      {path:'authors/author-2.html',title:'作者页二'},
      {path:'authors/author-3.html',title:'作者页三'}
    ];
    let current=location.pathname.replace(/\/+/g,'/');
    if(current.endsWith('/')) current+='index.html';
    const i=pages.findIndex(p=>current.endsWith('/'+p.path)||current.endsWith(p.path));
    if(i<=0) return; // 首页不显示；找不到页面也不误插入
    const prev=pages[(i-1+pages.length)%pages.length];
    const next=pages[(i+1)%pages.length];
    const nav=document.createElement('nav');
    nav.className='page-turn-nav container';
    nav.setAttribute('aria-label','页面翻页');
    nav.innerHTML=`<a class="page-turn-btn page-prev" href="${Site.path(prev.path)}" title="上一页：${escapeHTML(prev.title)}"><span>← 上一页</span><strong>${escapeHTML(prev.title)}</strong></a><a class="page-turn-btn page-next" href="${Site.path(next.path)}" title="下一页：${escapeHTML(next.title)}"><span>下一页 →</span><strong>${escapeHTML(next.title)}</strong></a>`;
    const footer=document.querySelector('.footer');
    if(footer) footer.parentNode.insertBefore(nav,footer); else document.body.appendChild(nav);
  }


  async function renderHome(){if(!$('#featured-grid')) return; const novels=await Site.json('data/novels.json'); const featured=novels.filter(n=>n.featured); $('#featured-grid').innerHTML=featured.map(Site.card).join(''); $('#latest-grid').innerHTML=sortLatest(novels).map(Site.card).join(''); $('#updates-list').innerHTML=sortLatest(novels).map(Site.update).join(''); const social=$('#social-render'); if(social) social.innerHTML=Site.socialBox();}

  async function renderStories(){const root=$('#stories-grid'); if(!root) return; const novels=await Site.json('data/novels.json'); const q=$('#story-q'), cat=$('#story-cat'), tag=$('#story-tag'), status=$('#story-status'), count=$('#story-count');
    const render=()=>{const kw=(q.value||'').trim().toLowerCase(); const list=novels.filter(n=>{
      const text=(n.title+n.authorName+n.category+n.status+n.intro+n.tags.join(' ')).toLowerCase();
      return (!kw||text.includes(kw)) && (!cat.value||n.category===cat.value) && (!tag.value||n.tags.includes(tag.value)) && (!status.value||n.status===status.value)
    }); root.innerHTML=list.length?list.map(Site.card).join(''):'<div class="empty">没有找到符合条件的小说。</div>'; count.textContent=`共 ${list.length} 本小说`;};
    [q,cat,tag,status].forEach(el=>el.addEventListener('input',render)); render();
  }

  async function renderSearch(){const root=$('#search-results'); if(!root) return; const novels=await Site.json('data/novels.json'); const params=new URLSearchParams(location.search); const q=$('#search-q'), tag=$('#search-tag'), author=$('#search-author'); q.value=params.get('q')||''; tag.value=params.get('tag')||''; author.value=params.get('author')||'';
    const authorOptions=[...new Map(novels.map(n=>[n.authorId,n.authorName]))].map(([id,name])=>`<option value="${id}">${escapeHTML(name)}</option>`).join(''); author.insertAdjacentHTML('beforeend',authorOptions);
    const render=()=>{const kw=(q.value||'').trim().toLowerCase(); const list=novels.filter(n=>{const text=(n.title+n.authorName+n.intro+n.subtitle+n.tags.join(' ')).toLowerCase(); return (!kw||text.includes(kw)) && (!tag.value||n.tags.includes(tag.value)) && (!author.value||n.authorId===author.value)});
      root.innerHTML=list.length?list.map(n=>`<article class="result-item"><a href="${Site.path('novels/'+n.id+'.html')}"><img src="${Site.path(n.cover)}" alt="${escapeHTML(n.title)}封面"></a><div><h3 class="result-title"><a href="${Site.path('novels/'+n.id+'.html')}">${escapeHTML(n.title)}</a></h3><p class="muted">${escapeHTML(n.authorName)} · ${escapeHTML(n.category)} · ${escapeHTML(n.status)}</p><div class="tag-row">${Site.tags(n.tags)}</div><p>${escapeHTML(n.intro)}</p><a class="primary-btn" href="${Site.path(n.chapters[0].file)}">立即阅读</a></div></article>`).join(''):'<div class="empty">没有搜索结果。</div>'};
    [q,tag,author].forEach(el=>el.addEventListener('input',render)); $('#search-form')?.addEventListener('submit',e=>{e.preventDefault(); render();}); render();
  }

  async function renderNovel(){const root=$('.novel-render'); if(!root) return; const id=document.body.dataset.novelId; const novels=await Site.json('data/novels.json'); const n=novels.find(x=>x.id===id); if(!n){root.innerHTML='<div class="empty">没有找到这本小说。</div>';return;} document.title=n.title+'｜泡菜小说坊';
    const chapters=n.chapters.map((c,i)=>`<a class="chapter-row" href="${Site.path(c.file)}"><strong>${escapeHTML(c.title)}</strong><span class="chapter-note">${escapeHTML(c.summary||'')}</span><span class="muted">${Site.date(c.date)}</span><span class="access-badge">${c.access==='order'?'社交购买':'免费'}</span></a>`).join('');
    const rec=novels.filter(x=>x.id!==n.id && x.tags.some(t=>n.tags.includes(t))).slice(0,2).map(Site.card).join('')||'<div class="empty">暂无同类推荐。</div>';
    const favKey='pcxf-fav-'+n.id;
    root.innerHTML=`<section class="page-hero"><div class="breadcrumb"><a href="${Site.path('index.html')}">首页</a> / <a href="${Site.path('stories.html')}">Stories</a> / ${escapeHTML(n.title)}</div><div class="novel-box"><img class="novel-cover" src="${Site.path(n.cover)}" alt="${escapeHTML(n.title)}封面"><div><p class="kicker">${escapeHTML(n.category)} · ${escapeHTML(n.status)}</p><h1 class="novel-title">${escapeHTML(n.title)}</h1><p class="hero-subtitle">${escapeHTML(n.subtitle)}</p><p class="muted">作者：<a href="${Site.path('authors/'+n.authorId+'.html')}"><strong>${escapeHTML(n.authorName)}</strong></a> · 最近更新：${Site.date(n.updatedAt)}</p><div class="tag-row">${Site.tags(n.tags)}</div><p>${escapeHTML(n.intro)}</p><div class="novel-actions"><a class="primary-btn" href="${Site.path(n.chapters[0].file)}">立即阅读</a><button id="fav-btn" class="outline-btn" type="button">♡ 收藏</button><a class="soft-btn" href="#order">后续购买</a></div></div></div></section>
    <section class="section"><div class="section-head"><div><h2 class="section-title">主角介绍</h2><p class="section-desc">用于放人设、关系张力和读者入坑点。</p></div></div><div class="character-grid"><div class="character-card"><h3>女主 / 主角A</h3><p>${escapeHTML(n.heroine)}</p></div><div class="character-card"><h3>男主 / 主角B</h3><p>${escapeHTML(n.hero)}</p></div></div></section>
    <section class="section"><div class="section-head"><div><h2 class="section-title">章节列表</h2><p class="section-desc">免费章节可直接阅读；后续章节可跳转到社交入口联系购买。</p></div></div><div class="chapter-list">${chapters}</div></section>
    <section class="section" id="order"><div class="section-head"><div><h2 class="section-title">社交讨论 / 下单入口</h2><p class="section-desc">前期免费阅读，后续章节可以通过微博、微信、小红书添加账号咨询购买。</p></div></div>${Site.socialBox()}</section>
    <section class="section"><div class="section-head"><div><h2 class="section-title">推荐小说</h2></div></div><div class="recommend-grid">${rec}</div></section>`;
    const btn=$('#fav-btn'); const set=()=>{const on=localStorage.getItem(favKey)==='1'; btn.textContent=on?'♥ 已收藏':'♡ 收藏'; btn.classList.toggle('fav-active',on)}; btn.addEventListener('click',()=>{localStorage.setItem(favKey,localStorage.getItem(favKey)==='1'?'0':'1'); set();}); set();
  }

  async function renderChapter(){const root=$('.chapter-render'); if(!root) return; const novelId=document.body.dataset.novelId, chapterId=document.body.dataset.chapterId; const novels=await Site.json('data/novels.json'); const n=novels.find(x=>x.id===novelId); if(!n){root.innerHTML='<div class="empty">未找到小说。</div>';return;} const idx=n.chapters.findIndex(c=>c.id===chapterId); const c=n.chapters[idx]; if(!c){root.innerHTML='<div class="empty">未找到章节。</div>';return;} document.title=`${n.title} ${c.title}｜泡菜小说坊`; const prev=n.chapters[idx-1], next=n.chapters[idx+1];
    const body=c.access==='order'?`<div class="reader-locked"><p class="kicker">后续章节</p><h1 class="chapter-title">${escapeHTML(c.title)}</h1><p>${escapeHTML(c.summary||'本章为后续内容。')}</p><p class="muted">前期章节可免费观看。后续章节可通过下方社交入口添加账号，咨询下单购买。</p><div class="hero-actions" style="justify-content:center"> <a class="primary-btn" href="${Site.path('assets/images/icons/wechat-qr.svg')}" target="_blank" rel="noopener">微信二维码</a><a class="outline-btn" href="https://weibo.com/" target="_blank" rel="noopener">微博咨询</a><a class="soft-btn" href="https://www.xiaohongshu.com/" target="_blank" rel="noopener">小红书入口</a></div></div>`:`<article class="reader-card"><div class="reader-content">${(c.content||[]).map(p=>`<p>${escapeHTML(p)}</p>`).join('')}</div></article>`;
    root.innerHTML=`<section class="chapter-header"><div class="breadcrumb"><a href="${Site.path('index.html')}">首页</a> / <a href="${Site.path('novels/'+n.id+'.html')}">${escapeHTML(n.title)}</a> / ${escapeHTML(c.title)}</div><p class="kicker">${escapeHTML(n.authorName)} · ${Site.date(c.date)}</p><h1 class="chapter-title">${escapeHTML(c.title)}</h1><div class="reader-toolbar"><button type="button" data-font="minus">A-</button><button type="button" data-font="plus">A+</button><button type="button" data-bottom>返回底部</button></div></section>${body}<nav class="chapter-nav"><a class="outline-btn" href="${Site.path('novels/'+n.id+'.html')}">目录</a>${prev?`<a class="outline-btn" href="${Site.path(prev.file)}">上一章</a>`:`<a class="outline-btn" href="${Site.path('novels/'+n.id+'.html')}">上一章</a>`}${next?`<a class="primary-btn" href="${Site.path(next.file)}">下一章</a>`:`<a class="primary-btn" href="#order-social">下一章</a>`}<a class="soft-btn" href="#order-social">社交入口</a></nav><section class="section" id="order-social"><div class="container"><div class="section-head"><div><h2 class="section-title">社交入口</h2><p class="section-desc">可添加账号追更、讨论或购买后续章节。</p></div></div>${Site.socialBox()}</div></section>`;
  }

  async function renderTag(){const root=$('.tag-render'); if(!root) return; const tagId=document.body.dataset.tagId; const [tags,novels]=await Promise.all([Site.json('data/tags.json'),Site.json('data/novels.json')]); const tag=tags.find(t=>t.id===tagId); const list=novels.filter(n=>n.tags.includes(tagId)); document.title=(tag?.name||tagId)+'｜泡菜小说坊'; root.innerHTML=`<section class="page-hero"><div class="breadcrumb"><a href="${Site.path('index.html')}">首页</a> / 标签 / ${escapeHTML(tag?.name||tagId)}</div><h1 class="novel-title">${escapeHTML(tag?.name||tagId)}</h1><p class="hero-subtitle">${escapeHTML(tag?.desc||'标签分类页')}</p><div class="tag-cloud">${tags.map(t=>`<a class="tag" href="${Site.path('tags/'+t.id+'.html')}">#${escapeHTML(t.name)}</a>`).join('')}</div></section><section class="section"><div class="grid">${list.map(Site.card).join('')||'<div class="empty">这个标签下暂无小说。</div>'}</div></section>`;}

  async function renderAuthor(){const root=$('.author-render'); if(!root) return; const id=document.body.dataset.authorId; const [authors,novels]=await Promise.all([Site.json('data/authors.json'),Site.json('data/novels.json')]); const a=authors.find(x=>x.id===id); if(!a){root.innerHTML='<div class="empty">未找到作者。</div>';return;} const works=novels.filter(n=>n.authorId===id); document.title=a.name+'｜泡菜小说坊'; root.innerHTML=`<section class="page-hero"><div class="breadcrumb"><a href="${Site.path('index.html')}">首页</a> / 作者 / ${escapeHTML(a.name)}</div><div class="novel-box"><img class="novel-cover" src="${Site.path(a.avatar)}" alt="${escapeHTML(a.name)}头像"><div><p class="kicker">Author</p><h1 class="novel-title">${escapeHTML(a.name)}</h1><p>${escapeHTML(a.bio)}</p><div class="hero-actions"><a class="outline-btn" href="https://weibo.com/" target="_blank" rel="noopener">微博</a><a class="outline-btn" href="${Site.path('assets/images/icons/wechat-qr.svg')}" target="_blank" rel="noopener">微信</a><a class="outline-btn" href="https://www.xiaohongshu.com/" target="_blank" rel="noopener">小红书</a></div></div></div></section><section class="section"><div class="section-head"><div><h2 class="section-title">作者全部小说</h2></div></div><div class="grid">${works.map(Site.card).join('')}</div></section>`;}

  document.addEventListener('DOMContentLoaded',()=>{initTheme(); renderHome(); renderStories(); renderSearch(); renderNovel(); renderChapter(); renderTag(); renderAuthor(); initPageTurns();});
})();
