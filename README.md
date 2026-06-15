# 泡菜小说坊 · GitHub Pages 静态网站版

这是一个可以直接上传到 GitHub Pages 的小说阅读网站。配色采用：

- 护眼米白：页面背景
- 鼠尾草绿：标题 / 按钮 / 导航重点色
- 淡紫色：标签 / 背景渐变
- 淡粉色：柔和点缀
- 暖纸白：章节正文阅读背景

## 上传到 GitHub

1. 解压压缩包。
2. 打开 `novel-site` 文件夹。
3. 把里面所有文件上传到 GitHub 仓库根目录。
4. Settings → Pages → Deploy from a branch。
5. Branch 选择 `main`，Folder 选择 `/root`，保存。

## 修改社交入口

全站社交入口在 `assets/js/main.js` 的 `socialBox()` 中：

- 微博：把 `https://weibo.com/` 替换成你的微博主页。
- 微信：把 `assets/images/icons/wechat-qr.svg` 替换成你的真实二维码图片，例如 `wechat-qr.png`。
- 小红书：把 `https://www.xiaohongshu.com/` 替换成你的小红书主页。

## 上传新小说

1. 小说封面放到：`assets/images/covers/`
2. Banner 放到：`assets/images/banners/`
3. 新建详情页：`novels/小说id.html`
4. 新建章节文件夹：`chapters/小说id/`
5. 修改 `data/novels.json` 和 `data/chapters.json`

## 免费阅读 + 后续购买

章节数据里的 `access` 支持：

- `free`：免费章节，直接显示正文。
- `order`：后续章节，页面会显示社交下单入口。

这是静态网站，不能自动收款或自动解锁。后期如需会员、自动下单、支付、自动发货，建议迁移 WordPress 或独立站。

## 本次更新

- 已将全站 Logo 替换为泡菜罐 PNG，并让 Logo 区域成为返回首页的有效按钮。
- 除首页外，所有页面底部都会显示“上一页 / 下一页”有效翻页按钮。
- 章节页第一章/最后一章的上一章、下一章也已改为有效链接，不再显示不可点击按钮。


## 本次版权提示更新

- 动态水印文字：泡菜小说坊自汉化，谢绝任何形式转载和商用
- 每章正文全部加载完成后，系统会自动在正文结尾追加：温馨提示：本站由泡菜小说坊整理，著作权归原作者所有。该翻译仅供学习交流，严禁任何形式的转载 、复制、摘编或用于商业盈利，请支持正版
- 小说详情页已预留“支持正版 / 原文链接”行。请在 `data/novels.json` 中把每本小说的 `originalUrl` 改成真实正版原文网页地址。
