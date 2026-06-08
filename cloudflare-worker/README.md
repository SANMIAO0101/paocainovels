# Cloudflare Worker 防护版说明

本文件夹不用填写任何密钥后上传到 GitHub。真正的密钥必须在 Cloudflare Worker 的 Variables / Secrets 里设置。

## 需要创建并绑定的 KV

绑定名称必须与代码一致：

- CHAPTERS：保存章节正文
- USERS：保存会员账号
- RATE_LIMITS：接口限速计数
- TICKETS：一次性阅读票据

## Worker 环境变量

```text
ALLOWED_ORIGINS = https://sanmiao0101.github.io
READER_USERNAME = miao
READER_PASSWORD = 你的阅读密码
READER_LEVEL = vip
READER_EXPIRES_AT = 2027-12-31T23:59:59Z
ALLOWED_NOVELS = hunting-swallow
TOKEN_SECRET = 请换成很长的随机字符串
TURNSTILE_SECRET_KEY = 你的 Turnstile Secret Key
LOGIN_LIMIT = 20
LOGIN_WINDOW_SECONDS = 600
TICKET_LIMIT = 80
TICKET_WINDOW_SECONDS = 600
SEGMENT_LIMIT = 240
SEGMENT_WINDOW_SECONDS = 600
TICKET_TTL_SECONDS = 120
TICKET_TTL_MS = 120000
SESSION_TTL_MS = 7200000
BLOCKED_IPS =
ALLOWED_IPS =
```

## 章节正文 KV 示例

KV：CHAPTERS

key：

```text
chapter:hunting-swallow-1
```

value：参考 `kv-samples/chapter-hunting-swallow-1.json`。

## 会员账号 KV 示例

KV：USERS

key：

```text
user:testuser
```

value：参考 `kv-samples/user-testuser.json`。

## GitHub Pages 前端配置

打开根目录的 `protected-reader.html`，替换：

```js
const API_BASE="https://请替换为你的-worker-地址.workers.dev";
```

以及 Turnstile Site Key：

```html
data-sitekey="请替换为你的_Turnstile_Site_Key"
```

然后可以用：

```text
protected-reader.html?id=hunting-swallow-1&back=novels/hunting-swallow.html
```

测试受保护阅读页。
