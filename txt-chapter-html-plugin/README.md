# TXT章节切割 HTML生成器

这是一个本地网页工具：打开 `index.html`，上传整本 TXT 小说，自动切割章节并导出 HTML ZIP。

## 支持识别的章节格式

- 第1章 / 第一章 / 第001章
- 第1回 / 第1节 / 第1卷
- Chapter 1
- 序章 / 楔子 / 尾声 / 番外
- 프롤로그 / 에필로그 / 외전
- 제1화 / 1화
- 1. 标题 / 1、标题

## 输出结构

```text
chapters/小说slug/chapter-001.html
chapters/小说slug/chapter-002.html
novels/小说slug.html
data/小说slug.manifest.json
```

## 上传到 GitHub Pages

把 ZIP 解压后，将 `chapters`、`novels`、`data` 文件夹拖进你的 GitHub 仓库根目录，提交即可。

## 自定义章节规则

在“高级设置”中添加正则，每行一个。例如：

```regex
^第[一二三四五六七八九十百千万\d]+[章节回].*$
^\d+화.*$
```
