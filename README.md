<p align="center">
  <img src="https://github.githubassets.com/favicons/favicon.svg" width="100" />
</p>

<h1 align="center">GitHub Date Converter</h1>
<p align="center"><b>GitHub 日期转换器</b></p>

<p align="center">
  <a href="https://github.com/dumeng-chn/github-date-converter/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/dumeng-chn/github-date-converter?style=flat-square" alt="license" />
  </a>
  <a href="https://github.com/dumeng-chn/github-date-converter">
    <img src="https://img.shields.io/github/stars/dumeng-chn/github-date-converter?style=flat-square" alt="stars" />
  </a>
  <a href="https://greasyfork.org/zh-CN/scripts/575860-github-date-converter">
    <img src="https://img.shields.io/greasyfork/dt/575860?style=flat-square&color=black" alt="installs" />
  </a>
</p>

<p align="center">
  A Tampermonkey script that converts GitHub's textual dates or relative dates into your preferred standard numerical format.<br/>
  一个 Tampermonkey 脚本，旨在将 GitHub 页面中的英文文本日期或相对日期转换为你偏好的标准数字格式。
</p>

<p align="center">
  <b>Example:</b> <code>Jan 12</code> → <code>2026-01-12</code> &nbsp; | &nbsp; <code>3 days ago</code> → <code>2026-04-26</code>
</p>

---

## Features (功能特性)

- **📅 Custom Format (自定义格式)**: Select from presets or use `YYYY`, `MM`, `DD` placeholders to define your own pattern.  
  支持选择预设或使用 `YYYY`, `MM`, `DD` 等占位符灵活配置你喜好的日期显示格式。
- **⏳ Relative Time Control (相对时间控制)**: Multiple modes to handle strings like "3 days ago" (None, > 7 Days, or All).  
  支持多种转换模式：不转换相对时间、仅转换 7 天前的旧日期、或全部转换。
- **📁 File List Toggle (忽略文件列表)**: Option to skip dates in repository file tables to maintain a native experience.  
  支持针对仓库文件列表设置忽略，保持原生的文件浏览体验。
- **🌐 Bilingual UI (双语界面)**: Automatically detects browser language and provides a settings menu in English and Chinese.  
  自动识别浏览器语言，提供中英文双语交互菜单。
- **⚡ Non-Destructive (非侵入式修改)**: Modifies text nodes directly without replacing elements. Ensures compatibility with GitHub's React hydration.  
  直接修改文本节点和 Shadow DOM，不破坏原始 DOM 结构。完美兼容 GitHub 的 React 水合逻辑和页面交互。

## Installation (安装)

1. Install a Userscript manager like [Tampermonkey](https://www.tampermonkey.net/).  
   安装脚本管理器，例如 [Tampermonkey](https://www.tampermonkey.net/)。
2. Install the script from your preferred source:  
   从你偏好的渠道安装脚本：
   - **[GreasyFork](https://greasyfork.org/zh-CN/scripts/575860-github-date-converter)** (Recommended / 推荐)
   - **[GitHub](https://raw.githubusercontent.com/dumeng-chn/github-date-converter/main/dist/github-date-converter.user.js)** (Direct / 直接安装)

## Usage (使用说明)

Open the Tampermonkey menu on any GitHub page to access the settings and customize the script's behavior.  
在任何 GitHub 页面打开 Tampermonkey 菜单即可访问设置并自定义脚本行为。
