const $ = (id) => document.getElementById(id);
let parsedChapters = [];
let currentText = "";
let currentFileName = "";

const defaultRules = [
  /^\s*第\s*[一二三四五六七八九十百千万零〇两\d]+\s*[章节卷回幕集部].{0,60}$/,
  /^\s*[一二三四五六七八九十百千万零〇两\d]+\s*[章节回幕集]\s+.{0,60}$/,
  /^\s*chapter\s*\d+\b.{0,80}$/i,
  /^\s*(prologue|epilogue|番外|外传|楔子|序章|尾声)\s*.{0,60}$/i,
  /^\s*(프롤로그|에필로그|외전|서장|종장)\s*.{0,60}$/,
  /^\s*제\s*\d+\s*화\b.{0,60}$/,
  /^\s*\d+\s*화\b.{0,60}$/,
  /^\s*\d{1,4}\s*[\.、]\s+.{1,60}$/
];

function slugify(input){
  const s = (input || "novel")
    .trim()
    .toLowerCase()
    .replace(/[《》「」『』“”‘’]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5\uac00-\ud7af]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "novel";
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readFileAsText(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsText(file, "UTF-8");
  });
}

function getRules(){
  const custom = $("customRules").value
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      try { return new RegExp(s); }
      catch { return null; }
    })
    .filter(Boolean);
  return [...custom, ...defaultRules];
}

function isChapterTitle(line, rules){
  const clean = line.trim();
  if (!clean || clean.length > 90) return false;
  return rules.some(rule => rule.test(clean));
}

function splitChapters(rawText){
  const text = rawText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n");
  const rules = getRules();
  const chapters = [];
  let current = null;
  let preface = [];

  for (const line of lines){
    if (isChapterTitle(line, rules)){
      if (current) chapters.push(current);
      else if (preface.join("\n").trim()){
        chapters.push({ title:"序章", body:preface.join("\n").trim() });
        preface = [];
      }
      current = { title:line.trim(), body:"" };
    } else {
      if (current) current.body += line + "\n";
      else preface.push(line);
    }
  }
  if (current) chapters.push({ title:current.title, body:current.body.trim() });
  else if (preface.join("\n").trim()) chapters.push({ title:"全文", body:preface.join("\n").trim() });

  return chapters.filter(ch => ch.body.trim() || ch.title.trim());
}

function bodyToHtml(body){
  const keepLineBreaks = $("keepLineBreaks").checked;
  const makeBilingual = $("makeBilingual").checked;
  const blocks = body
    .split(/\n\s*\n/g)
    .map(x => x.trim())
    .filter(Boolean);

  if (!blocks.length) return "<p></p>";

  return blocks.map((block, index) => {
    const safe = escapeHtml(block);
    const content = keepLineBreaks ? safe.replace(/\n/g, "<br>") : safe.replace(/\n+/g, " ");
    let cls = "";
    if (makeBilingual) cls = index % 2 === 0 ? " class=\"ko\"" : " class=\"zh\"";
    return `<p${cls}>${content}</p>`;
  }).join("\n");
}

function makeChapterHtml({ novelTitle, slug, chapter, index, total }){
  const num = String(index + 1).padStart(3, "0");
  const prev = index > 0 ? `chapter-${String(index).padStart(3, "0")}.html` : "../../stories.html";
  const next = index < total - 1 ? `chapter-${String(index + 2).padStart(3, "0")}.html` : `../../novels/${slug}.html`;
  const body = bodyToHtml(chapter.body);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(chapter.title)} - ${escapeHtml(novelTitle)}</title>
<link rel="stylesheet" href="../../assets/css/chapter.css">
</head>
<body>
<main class="chapter-page">
  <nav class="top-nav">
    <a href="../../index.html">Home</a>
    <a href="../../stories.html">Stories</a>
    <a href="../../search.html">搜索</a>
    <a href="../../novels/${slug}.html">返回目录</a>
  </nav>

  <article class="chapter-card">
    <p class="novel-title">${escapeHtml(novelTitle)}</p>
    <h1>${escapeHtml(chapter.title)}</h1>
    <div class="chapter-content">
${body}
    </div>
  </article>

  <nav class="chapter-nav">
    <a href="${prev}">上一章</a>
    <a href="../../novels/${slug}.html">目录</a>
    <a href="${next}">下一章</a>
  </nav>
</main>
</body>
</html>`;
}

function makeNovelIndexHtml({ novelTitle, slug, chapters }){
  const links = chapters.map((ch, i) => {
    const num = String(i + 1).padStart(3, "0");
    return `      <li><a href="../chapters/${slug}/chapter-${num}.html">${escapeHtml(ch.title)}</a></li>`;
  }).join("\n");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(novelTitle)} - 目录</title>
<link rel="stylesheet" href="../assets/css/novel.css">
</head>
<body>
<main class="novel-page">
  <nav class="top-nav">
    <a href="../index.html">Home</a>
    <a href="../stories.html">Stories</a>
    <a href="../search.html">搜索</a>
  </nav>
  <section class="novel-card">
    <h1>${escapeHtml(novelTitle)}</h1>
    <p>共 ${chapters.length} 章</p>
    <ol class="chapter-list">
${links}
    </ol>
  </section>
</main>
</body>
</html>`;
}

function makeManifest({ novelTitle, slug, chapters }){
  return JSON.stringify({
    title: novelTitle,
    slug,
    total: chapters.length,
    sourceFile: currentFileName,
    generatedAt: new Date().toISOString(),
    chapters: chapters.map((ch, i) => ({
      order: i + 1,
      title: ch.title,
      path: `chapters/${slug}/chapter-${String(i + 1).padStart(3, "0")}.html`,
      chars: ch.body.length
    }))
  }, null, 2);
}

function renderPreview(chapters){
  const preview = $("preview");
  preview.innerHTML = "";
  chapters.slice(0, 120).forEach((ch, i) => {
    const row = document.createElement("div");
    row.className = "chapter-row";
    row.innerHTML = `<strong>#${String(i + 1).padStart(3, "0")}</strong><span>${escapeHtml(ch.title)}</span><small>${ch.body.length} 字</small>`;
    preview.appendChild(row);
  });
  if (chapters.length > 120){
    const more = document.createElement("p");
    more.className = "status";
    more.textContent = `预览只显示前 120 章，实际会生成 ${chapters.length} 章。`;
    preview.appendChild(more);
  }
}

// -------- ZIP builder: no compression, pure browser JS --------
function crc32(str){
  const bytes = new TextEncoder().encode(str);
  let crc = -1;
  for (let i = 0; i < bytes.length; i++){
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}
function u16(n){ return [n & 255, (n >>> 8) & 255]; }
function u32(n){ return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
function dosTimeDate(date = new Date()){
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const d = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date:d };
}
function makeZip(files){
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const dt = dosTimeDate();

  files.forEach(file => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(file.content);
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0),
      ...u16(dt.time), ...u16(dt.date), ...u32(crc), ...u32(dataBytes.length), ...u32(dataBytes.length),
      ...u16(nameBytes.length), ...u16(0)
    ]);
    chunks.push(local, nameBytes, dataBytes);

    const centralHeader = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0),
      ...u16(dt.time), ...u16(dt.date), ...u32(crc), ...u32(dataBytes.length), ...u32(dataBytes.length),
      ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)
    ]);
    central.push(centralHeader, nameBytes);
    offset += local.length + nameBytes.length + dataBytes.length;
  });

  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
    ...u32(centralSize), ...u32(offset), ...u16(0)
  ]);

  return new Blob([...chunks, ...central, end], { type:"application/zip" });
}

function downloadBlob(blob, filename){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function loadInputText(){
  const file = $("txtFile").files[0];
  if (!file) throw new Error("请先上传 TXT 文件。");
  currentFileName = file.name;
  currentText = await readFileAsText(file);
  if (!currentText.trim()) throw new Error("TXT 内容为空，请检查文件编码或内容。");
  return currentText;
}

$("previewBtn").addEventListener("click", async () => {
  const status = $("status");
  status.classList.remove("error");
  try{
    const text = await loadInputText();
    parsedChapters = splitChapters(text);
    if (!parsedChapters.length) throw new Error("没有识别到章节，请在高级设置里添加章节标题正则。");
    renderPreview(parsedChapters);
    status.textContent = `已识别 ${parsedChapters.length} 个章节。请检查预览标题是否正确。`;
    $("downloadBtn").disabled = false;
  } catch(err){
    parsedChapters = [];
    $("downloadBtn").disabled = true;
    $("preview").innerHTML = "";
    status.textContent = err.message;
    status.classList.add("error");
  }
});

$("downloadBtn").addEventListener("click", () => {
  const novelTitle = $("novelTitle").value.trim() || currentFileName.replace(/\.txt$/i, "") || "未命名小说";
  const slug = slugify($("novelSlug").value.trim() || novelTitle);
  const files = [];
  parsedChapters.forEach((chapter, index) => {
    const num = String(index + 1).padStart(3, "0");
    files.push({
      name:`chapters/${slug}/chapter-${num}.html`,
      content:makeChapterHtml({ novelTitle, slug, chapter, index, total:parsedChapters.length })
    });
  });
  files.push({ name:`novels/${slug}.html`, content:makeNovelIndexHtml({ novelTitle, slug, chapters:parsedChapters }) });
  files.push({ name:`data/${slug}.manifest.json`, content:makeManifest({ novelTitle, slug, chapters:parsedChapters }) });
  files.push({ name:`README-${slug}.txt`, content:`把 chapters、novels、data 这三个文件夹上传到网站根目录即可。\n章节目录：chapters/${slug}/\n小说目录页：novels/${slug}.html\n共 ${parsedChapters.length} 章。` });

  const blob = makeZip(files);
  downloadBlob(blob, `${slug}-html-chapters.zip`);
});
