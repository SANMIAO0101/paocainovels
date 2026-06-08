# 泡菜小说坊：试读章节 + 完整章节保护阅读调整版

本版本按照以下策略调整：

## 1. 普通试读章节

试读章节可以继续放在 GitHub Pages 的 HTML 里，例如：

```text
chapters/hunting-swallow/chapter-1.html
```

已加入：

```text
noindex / nofollow / noarchive
robots.txt 禁止抓取 chapters
基础防复制
右键限制
阅读水印
```

注意：静态 HTML 只能防普通复制，不能 100% 防技术爬取。

## 2. 完整章节

完整章节不要直接放在 GitHub HTML 里。

本包已把《猎捕燕子》第 2～10 章改成跳转页，不再存放完整正文：

```text
chapters/hunting-swallow/chapter-2.html
...
chapters/hunting-swallow/chapter-10.html
```

这些页面会跳转到：

```text
protected-reader.html?id=hunting-swallow-2
protected-reader.html?id=hunting-swallow-3
...
```

正文需要放到 Cloudflare KV / R2，再通过 Worker 分段读取。

## 3. protected-reader.html 已调整

已删除“加载全文”。

现在只保留：

```text
加载下一段
朗读已加载内容
停止朗读
退出登录
```

每次只请求一小段正文，并且每段都需要：

```text
登录 session token
一次性 ticket
接口限速
会员权限验证
IP 检查
动态阅读水印
```

## 4. Cloudflare Worker

Worker 文件在：

```text
cloudflare-worker/worker.js
```

已包含：

```text
登录账号
会员权限
Turnstile 人机验证
接口限速
IP 限制
一次性 token / ticket
分段加载
阅读水印
BLOCKED_IPS 黑名单
```

## 5. 你需要在 protected-reader.html 替换两个位置

```js
const API_BASE="https://请替换为你的-worker-地址.workers.dev";
```

把它换成你的 Worker 地址。

再把：

```html
data-sitekey="请替换为你的_Turnstile_Site_Key"
```

换成你的 Turnstile Site Key。

Secret Key、阅读密码、TOKEN_SECRET 不要放到 GitHub，只能放在 Cloudflare Worker 的 Variables and Secrets 里。

## 6. Cloudflare KV 章节 key

第2章正文建议放：

```text
chapter:hunting-swallow-2
```

第3章正文：

```text
chapter:hunting-swallow-3
```

格式参考：

```text
cloudflare-worker/kv-samples/chapter-hunting-swallow-2.json
```
