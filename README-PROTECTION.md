# 泡菜小说坊：当前免费章节保护阅读说明

本版本按你的最新规则调整：

- 网站当前提供的章节暂时都是免费阅读。
- 但所有章节正文都不直接放在 GitHub HTML / data JSON 里。
- 读者打开章节后，进入 `protected-reader.html`。
- 读者完成 Cloudflare Turnstile 人机验证后，才能逐段加载正文。
- 页面不提供“加载全文”，只提供“加载下一段”。
- 每段正文通过一次性 ticket 请求，并带免费阅读 / IP / 时间动态水印。
- 后续付费内容不上传到 GitHub，也不上传到 Cloudflare KV；页面只引导到微博 / 微信 / 小红书社交入口联系购买。

## 上传到 GitHub 的文件

可以上传：

```text
assets/
authors/
chapters/
data/
novels/
status/
tags/
.nojekyll
index.html
protected-reader.html
robots.txt
search.html
stories.html
README.md
README-PROTECTION.md
```

不要上传到 GitHub：

```text
cloudflare-worker/
```

`cloudflare-worker/` 里面是 Worker 后端代码和 KV 示例章节正文，只用于复制到 Cloudflare 后台，不适合公开上传。

## 完整章节正文放哪里

当前免费章节正文放到 Cloudflare KV 的 `CHAPTERS` 命名空间里。

key 格式：

```text
chapter:hunting-swallow-1
chapter:hunting-swallow-2
chapter:liuan-1
chapter:fanzuoyong-1
```

value 格式可以是韩中双语：

```json
{
  "novelTitle": "猎捕燕子",
  "chapterTitle": "第1章",
  "segments": [
    {
      "blocks": [
        {
          "ko": "这里放韩文原文。",
          "cn": "这里放中文翻译。"
        }
      ]
    }
  ]
}
```

也可以是普通单语正文：

```json
{
  "novelTitle": "柳安",
  "chapterTitle": "第1章 雨夜旧信",
  "segments": [
    {
      "blocks": [
        {
          "text": "这里放普通章节正文。"
        }
      ]
    }
  ]
}
```

## Worker 需要绑定的 KV

```text
CHAPTERS
RATE_LIMITS
TICKETS
```

`USERS` 现在不是必须，因为当前章节是免费保护阅读，不需要会员账号登录。

## Worker 需要设置的变量

普通变量：

```text
ALLOWED_ORIGINS = https://sanmiao0101.github.io
FREE_NOVELS = *
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

Secret：

```text
TOKEN_SECRET = 一串很长的随机密钥
TURNSTILE_SECRET_KEY = Turnstile Secret Key
```

## GitHub 页面需要替换的位置

打开 `protected-reader.html`，替换：

```js
const API_BASE="https://请替换为你的-worker-地址.workers.dev";
```

以及：

```html
data-sitekey="请替换为你的_Turnstile_Site_Key"
```

## 注意

这套方案可以降低 WebToEpub、普通爬虫、直接查看源码复制正文的风险；但不能 100% 防止已通过验证的用户截图、拍屏或手动摘录。动态水印用于追踪和劝阻二次传播。


## 本次版权提示更新

- 动态水印文字：泡菜小说坊自汉化，谢绝任何形式转载和商用
- 每章正文全部加载完成后，系统会自动在正文结尾追加：温馨提示：本站由泡菜小说坊整理，著作权归原作者所有。该翻译仅供学习交流，严禁任何形式的转载 、复制、摘编或用于商业盈利，请支持正版
- 小说详情页已预留“支持正版 / 原文链接”行。请在 `data/novels.json` 中把每本小说的 `originalUrl` 改成真实正版原文网页地址。
