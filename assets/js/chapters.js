
(function(){
  function updateProgress(){const bar=document.querySelector('.read-progress'); if(!bar) return; const h=document.documentElement; const sc=h.scrollTop||document.body.scrollTop; const max=h.scrollHeight-h.clientHeight; bar.style.width=(max?sc/max*100:0)+'%';}
  document.addEventListener('click',e=>{const reader=document.querySelector('.reader-content'); if(e.target.matches('[data-bottom]')) window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'}); if(e.target.matches('[data-font="plus"]')&&reader){const v=parseFloat(getComputedStyle(reader).fontSize)||19; reader.style.fontSize=Math.min(v+1,26)+'px'} if(e.target.matches('[data-font="minus"]')&&reader){const v=parseFloat(getComputedStyle(reader).fontSize)||19; reader.style.fontSize=Math.max(v-1,16)+'px'}});
  window.addEventListener('scroll',updateProgress); document.addEventListener('DOMContentLoaded',updateProgress);
})();
