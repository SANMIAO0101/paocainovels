export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request, env) });
    }

    const ipCheck = checkIP(request, env);
    if (!ipCheck.ok) {
      return jsonResponse({ error: ipCheck.message }, 403, request, env);
    }

    try {
      if (path === "/login" && request.method === "POST") return handleLogin(request, env);
      if (path === "/chapter-ticket" && request.method === "POST") return handleChapterTicket(request, env);
      if (path === "/chapter-segment" && request.method === "GET") return handleChapterSegment(request, env);
      return jsonResponse({ error: "接口不存在" }, 404, request, env);
    } catch (error) {
      return jsonResponse({ error: "服务器错误", detail: String(error && error.message ? error.message : error) }, 500, request, env);
    }
  }
};

function corsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin") || "";
  const allowedOrigins = splitList(env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || "");
  let allowOrigin = "https://sanmiao0101.github.io";
  if (allowedOrigins.length > 0 && allowedOrigins.includes(requestOrigin)) allowOrigin = requestOrigin;
  else if (allowedOrigins.length > 0) allowOrigin = allowedOrigins[0];
  return { "Access-Control-Allow-Origin": allowOrigin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Cache-Control": "no-store" };
}
function jsonResponse(data, status, request, env) { return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders(request, env), "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store" } }); }
function getClientIP(request) { return request.headers.get("CF-Connecting-IP") || "0.0.0.0"; }
function checkIP(request, env) { const ip=getClientIP(request); const blocked=splitList(env.BLOCKED_IPS||""); const allowed=splitList(env.ALLOWED_IPS||""); if(blocked.includes(ip)) return {ok:false,message:"当前 IP 已被禁止访问。"}; if(allowed.length>0&&!allowed.includes(ip)) return {ok:false,message:"当前 IP 不在允许访问范围内。"}; return {ok:true}; }
async function enforceRateLimit(env,key,limit,windowSeconds){ const now=Math.floor(Date.now()/1000); const bucket=Math.floor(now/windowSeconds); const kvKey=`rate:${key}:${bucket}`; const currentValue=await env.RATE_LIMITS.get(kvKey); const current=currentValue?Number(currentValue):0; const next=current+1; await env.RATE_LIMITS.put(kvKey,String(next),{expirationTtl:windowSeconds+60}); if(next>limit) return {ok:false,retryAfter:windowSeconds}; return {ok:true}; }

async function handleLogin(request, env) {
  const ip=getClientIP(request);
  const rate=await enforceRateLimit(env,`login:${ip}`,Number(env.LOGIN_LIMIT||20),Number(env.LOGIN_WINDOW_SECONDS||600));
  if(!rate.ok) return jsonResponse({error:"登录尝试过于频繁，请稍后再试。"},429,request,env);
  const body=await request.json().catch(()=>null);
  if(!body) return jsonResponse({error:"请求格式错误。"},400,request,env);
  const username=String(body.username||"").trim(); const password=String(body.password||"").trim(); const turnstileToken=String(body.turnstileToken||"").trim();
  if(!username||!password) return jsonResponse({error:"请输入账号和密码。"},400,request,env);
  if(env.TURNSTILE_SECRET_KEY){ const ok=await verifyTurnstile(turnstileToken,ip,env.TURNSTILE_SECRET_KEY); if(!ok) return jsonResponse({error:"人机验证失败，请刷新页面后重试。"},403,request,env); }
  const user=await getUser(username,env);
  if(!user) return jsonResponse({error:"账号或密码错误。"},401,request,env);
  const passwordOK=await verifyPassword(password,user,env);
  if(!passwordOK) return jsonResponse({error:"账号或密码错误。"},401,request,env);
  if(user.expiresAt){ const expiresAt=new Date(user.expiresAt).getTime(); if(Number.isFinite(expiresAt)&&Date.now()>expiresAt) return jsonResponse({error:"会员权限已过期，请联系站主续期。"},403,request,env); }
  const sessionPayload={type:"session",username,level:user.level||"reader",allowedNovels:user.allowedNovels||[],allowedChapters:user.allowedChapters||[],exp:Date.now()+Number(env.SESSION_TTL_MS||1000*60*60*2)};
  const sessionToken=await createToken(sessionPayload,env.TOKEN_SECRET);
  return jsonResponse({ok:true,token:sessionToken,username,level:sessionPayload.level,expiresAt:user.expiresAt||null},200,request,env);
}
async function verifyTurnstile(token,ip,secretKey){ if(!token) return false; const formData=new FormData(); formData.append("secret",secretKey); formData.append("response",token); formData.append("remoteip",ip); const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:formData}); const data=await response.json().catch(()=>null); return Boolean(data&&data.success); }
async function getUser(username,env){ if(env.READER_USERNAME&&env.READER_PASSWORD&&username===env.READER_USERNAME){return {username:env.READER_USERNAME,password:env.READER_PASSWORD,level:env.READER_LEVEL||"vip",expiresAt:env.READER_EXPIRES_AT||"",allowedNovels:splitList(env.ALLOWED_NOVELS||"hunting-swallow"),allowedChapters:splitList(env.ALLOWED_CHAPTERS||"")};} return await env.USERS.get(`user:${username}`,{type:"json"}); }
async function verifyPassword(inputPassword,user,env){ if(user.password) return inputPassword===user.password; if(user.passwordHash){ const hash=await sha256Hex(`${env.PASSWORD_SALT||""}:${inputPassword}`); return safeEqual(hash,user.passwordHash);} return false; }
function getNovelSlugFromChapterId(chapterId){return chapterId.replace(/-\d+$/," ").trim();}
function hasChapterPermission(payload,chapterId){ const novelSlug=getNovelSlugFromChapterId(chapterId); if(payload.level==="admin") return true; const ac=payload.allowedChapters||[]; const an=payload.allowedNovels||[]; return ac.includes("*")||an.includes("*")||ac.includes(chapterId)||an.includes(novelSlug); }

async function handleChapterTicket(request,env){
  const ip=getClientIP(request); const rate=await enforceRateLimit(env,`ticket:${ip}`,Number(env.TICKET_LIMIT||80),Number(env.TICKET_WINDOW_SECONDS||600));
  if(!rate.ok) return jsonResponse({error:"请求过于频繁，请稍后再试。"},429,request,env);
  const session=await requireSession(request,env); if(!session.ok) return jsonResponse({error:session.error},401,request,env);
  const body=await request.json().catch(()=>null); if(!body) return jsonResponse({error:"请求格式错误。"},400,request,env);
  const chapterId=String(body.chapterId||"").trim(); const segmentIndex=Number(body.segmentIndex);
  if(!chapterId||!Number.isInteger(segmentIndex)||segmentIndex<0) return jsonResponse({error:"章节参数错误。"},400,request,env);
  if(!hasChapterPermission(session.payload,chapterId)) return jsonResponse({error:"当前账号没有阅读本章节的权限。"},403,request,env);
  const ticketId=crypto.randomUUID(); const ticket={username:session.payload.username,chapterId,segmentIndex,ip,exp:Date.now()+Number(env.TICKET_TTL_MS||1000*60*2)};
  await env.TICKETS.put(`ticket:${ticketId}`,JSON.stringify(ticket),{expirationTtl:Number(env.TICKET_TTL_SECONDS||120)});
  return jsonResponse({ok:true,ticket:ticketId,expiresIn:Number(env.TICKET_TTL_SECONDS||120)},200,request,env);
}
async function handleChapterSegment(request,env){
  const ip=getClientIP(request); const rate=await enforceRateLimit(env,`segment:${ip}`,Number(env.SEGMENT_LIMIT||240),Number(env.SEGMENT_WINDOW_SECONDS||600));
  if(!rate.ok) return jsonResponse({error:"阅读请求过于频繁，请稍后再试。"},429,request,env);
  const url=new URL(request.url); const chapterId=String(url.searchParams.get("id")||"").trim(); const segmentIndex=Number(url.searchParams.get("part")); const ticketId=String(url.searchParams.get("ticket")||"").trim();
  if(!chapterId||!Number.isInteger(segmentIndex)||segmentIndex<0||!ticketId) return jsonResponse({error:"缺少阅读参数。"},400,request,env);
  const ticketKey=`ticket:${ticketId}`; const ticket=await env.TICKETS.get(ticketKey,{type:"json"});
  if(!ticket) return jsonResponse({error:"阅读票据已失效，请重新加载。"},403,request,env);
  await env.TICKETS.delete(ticketKey);
  if(ticket.chapterId!==chapterId||Number(ticket.segmentIndex)!==segmentIndex||ticket.ip!==ip||Date.now()>Number(ticket.exp)) return jsonResponse({error:"阅读票据无效。"},403,request,env);
  const chapter=await env.CHAPTERS.get(`chapter:${chapterId}`,{type:"json"}); if(!chapter) return jsonResponse({error:"章节不存在。"},404,request,env);
  const segments=chapter.segments||[]; if(!segments[segmentIndex]) return jsonResponse({error:"章节分段不存在。"},404,request,env);
  const watermark=makeWatermark(ticket.username,ip);
  return jsonResponse({ok:true,novelTitle:chapter.novelTitle,chapterTitle:chapter.chapterTitle,segmentIndex,totalSegments:segments.length,segment:segments[segmentIndex],watermark},200,request,env);
}
function makeWatermark(username,ip){const time=new Date().toLocaleString("zh-CN",{timeZone:"Asia/Shanghai"}); return `泡菜小说坊 · ${username} · ${ip} · ${time} · 禁止转载`;}
async function requireSession(request,env){ const authHeader=request.headers.get("Authorization")||""; const token=authHeader.replace("Bearer ","").trim(); if(!token) return {ok:false,error:"请先登录。"}; const result=await verifyToken(token,env.TOKEN_SECRET); if(!result.ok) return {ok:false,error:"登录状态已失效，请重新登录。"}; if(result.payload.type!=="session") return {ok:false,error:"登录凭证无效。"}; return result; }
async function createToken(payload,secret){ const payloadText=JSON.stringify(payload); const payloadBase64=base64urlEncodeString(payloadText); const signature=await sign(payloadBase64,secret); return `${payloadBase64}.${signature}`; }
async function verifyToken(token,secret){ if(!token||!token.includes(".")) return {ok:false}; const parts=token.split("."); if(parts.length!==2) return {ok:false}; const [payloadBase64,signature]=parts; const expected=await sign(payloadBase64,secret); if(!safeEqual(signature,expected)) return {ok:false}; let payload; try{payload=JSON.parse(base64urlDecodeString(payloadBase64));}catch{return {ok:false};} if(!payload.exp||Date.now()>Number(payload.exp)) return {ok:false}; return {ok:true,payload}; }
async function sign(data,secret){ const encoder=new TextEncoder(); const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]); const signature=await crypto.subtle.sign("HMAC",key,encoder.encode(data)); return base64urlEncodeBytes(new Uint8Array(signature)); }
async function sha256Hex(text){ const encoder=new TextEncoder(); const digest=await crypto.subtle.digest("SHA-256",encoder.encode(text)); return Array.from(new Uint8Array(digest)).map(byte=>byte.toString(16).padStart(2,"0")).join(""); }
function base64urlEncodeString(text){return base64urlEncodeBytes(new TextEncoder().encode(text));}
function base64urlDecodeString(base64url){ const base64=base64url.replace(/-/g,"+").replace(/_/g,"/"); const padded=base64.padEnd(base64.length+(4-base64.length%4)%4,"="); const binary=atob(padded); const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0)); return new TextDecoder().decode(bytes); }
function base64urlEncodeBytes(bytes){ let binary=""; for(const byte of bytes) binary+=String.fromCharCode(byte); return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
function safeEqual(a,b){ const aa=String(a),bb=String(b); if(aa.length!==bb.length) return false; let result=0; for(let i=0;i<aa.length;i++) result|=aa.charCodeAt(i)^bb.charCodeAt(i); return result===0; }
function splitList(value){ return String(value||"").split(",").map(item=>item.trim()).filter(Boolean); }
