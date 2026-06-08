# 泡菜小说坊防护版说明

本版本是在 GitHub Pages 静态网站基础上增加的防护包。

## 已加入的 GitHub Pages 基础防护

- 根目录 `robots.txt`：提示搜索引擎不要抓取章节与受保护阅读页。
- 所有现有 `chapters/**/*.html`：已加入 `noindex, nofollow, noarchive`。
- 新增 `assets/css/protect.css`：正文不可选中、阅读水印。
- 新增 `assets/js/protect.js`：禁止右键、复制、拖拽、常见快捷键。

注意：这些只能降低普通复制，不能阻止技术用户查看 HTML 源码。

## 已加入的 Cloudflare Worker 进阶防护模板

- `cloudflare-worker/worker.js`：登录账号、Turnstile 人机验证、会员权限、接口限速、IP 限制、一次性 ticket、分段加载、水印。
- `protected-reader.html`：GitHub Pages 前端受保护阅读器。
- `cloudflare-worker/kv-samples/`：KV 示例数据。

## 上传到 GitHub

解压后，把本文件夹里的所有内容上传到仓库根目录，不要再多包一层文件夹。

## 重要

`protected-reader.html` 里的两个位置需要你自己替换：

```js
const API_BASE="https://请替换为你的-worker-地址.workers.dev";
```

```html
data-sitekey="请替换为你的_Turnstile_Site_Key"
```

Worker 的 Secret Key、登录密码、TOKEN_SECRET 不要写进 GitHub，必须放在 Cloudflare Worker 的环境变量里。
