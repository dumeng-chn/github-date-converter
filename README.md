# GitHub Date Converter (GitHub 日期转换器)

A Tampermonkey script that converts GitHub's textual dates (e.g., "Jan 1, 2026") or relative dates (e.g., "3 days ago") into your preferred standard numerical format (e.g., "2026-01-01").

一个 Tampermonkey 脚本，旨在将 GitHub 页面中的英文文本日期（如“Jan 1, 2026”）或相对日期（如“3 天前”）转换为你偏好的标准数字格式（如“2026-01-01”）。

## Features (功能特性)

- **Custom Format (自定义格式)**: Supports user-defined date formats using placeholders like `YYYY`, `MM`, `DD`.
- **Non-Destructive (非侵入式)**: Modifies text content and Shadow DOM directly without replacing original elements. This ensures full compatibility with GitHub's React hydration and Web Component lifecycle, avoiding UI breakage.
- **Bilingual Support (双语支持)**: Automatically detects browser language and provides a bilingual settings menu (English and Chinese).
- **Flexible Relative Time (灵活的相对时间转换)**: 
  - **None**: Only convert absolute dates.
  - **> 7 Days**: Keep recent relative dates (like "2 hours ago") but convert older ones.
  - **All**: Convert every date found.
- **Context Awareness (上下文感知)**: Option to specifically ignore repository file list dates to maintain a native browsing experience.

## Special Thanks (特别致敬)

This project was inspired by and learned from the non-destructive DOM handling strategies used in [github-chinese](https://github.com/maboloshi/github-chinese). Special thanks to [maboloshi](https://github.com/maboloshi) for the excellent work on GitHub localization.

本项目在非侵入式 DOM 处理策略上参考并学习了 [github-chinese](https://github.com/maboloshi/github-chinese) 的优秀实现。特别感谢 [maboloshi](https://github.com/maboloshi) 在 GitHub 本地化和脚本稳定性方面提供的技术启发。

## Installation (安装)

1. Install a Userscript manager like [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script from [GitHub](https://raw.githubusercontent.com/dumeng-chn/github-date-converter/main/dist/github-date-converter.user.js).

## Usage (使用说明)

Open the Tampermonkey menu on any GitHub page to access the settings:
- **🌐 Language**: Toggle between English and Chinese.
- **📅 Date Format**: Select a preset or set a custom pattern.
- **⏳ Relative Mode**: Choose how to handle relative time strings.
- **📁 File List**: Toggle whether to process dates in repository file tables.

在任何 GitHub 页面打开 Tampermonkey 菜单即可进行设置：
- **🌐 语言切换**：在英文和简体中文之间切换。
- **📅 日期格式**：选择预设格式或输入自定义占位符。
- **⏳ 相对时间**：选择如何处理相对时间字符串。
- **📁 忽略列表**：选择是否转换仓库文件列表中的日期。

## License (授权)

MIT License
