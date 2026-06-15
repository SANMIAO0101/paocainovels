(function(){
  const qs=new URLSearchParams(location.search);
  const novel=qs.get('novel')||'hunting-swallow';
  const chapter=qs.get('chapter')||'1';
  const apiBase=(window.PAOCAI_CONFIG&&window.PAOCAI_CONFIG.apiBase)||'';
  const token=(window.PAOCAI_CONFIG&&window.PAOCAI_CONFIG.turnstileToken)||'demo-token';
  const content=document.getElementById('readerContent');
  const btn=document.getElementById('loadNextBtn');
  const statusEl=document.getElementById('readerStatus');
  const title=document.getElementById('chapterTitle');
  let sessionId='', cursor=0, finished=false;
  title.textContent=`${novel} / 第 ${chapter} 章`;
  const mark=()=>`泡菜小说坊自汉化｜${new Date().toLocaleString()}｜${sessionId.slice(0,8)||'未验证'}`;
  async function init(){
    statusEl.textContent='正在初始化阅读会话……';
    const res=await fetch(`${apiBase}/api/chapter/init`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({novel,chapter,turnstileToken:token})});
    if(!res.ok) throw new Error('初始化失败，请检查 Worker 地址、KV 绑定或 Turnstile 配置。');
    const data=await res.json(); sessionId=data.sessionId; cursor=data.cursor||0; statusEl.textContent='会话已建立，请点击加载下一段。';
  }
  async function next(){
    if(finished) return;
    btn.disabled=true; statusEl.textContent='正在加载下一段……';
    try{
      if(!sessionId) await init();
      const res=await fetch(`${apiBase}/api/chapter/next`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId,novel,chapter,cursor})});
      if(!res.ok) throw new Error(await res.text());
      const data=await res.json();
      const div=document.createElement('div'); div.className='reader-part'; div.dataset.mark=mark();
      div.textContent=data.text; content.appendChild(div);
      cursor=data.nextCursor; finished=!!data.finished;
      statusEl.textContent=finished?'本章已加载完毕。温馨提示：本站由泡菜小说坊整理，著作权归原作者所有。该翻译仅供学习交流，严禁任何形式转载、复制、摘编或用于商业盈利，请支持正版。':'已加载一段，可继续加载下一段。';
      btn.style.display=finished?'none':'inline-flex';
    }catch(err){ statusEl.textContent='加载失败：'+err.message; }
    finally{ btn.disabled=false; }
  }
  btn.addEventListener('click',next);
  init().catch(err=>{statusEl.textContent=err.message;});
})();
