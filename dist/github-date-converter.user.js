// ==UserScript==
// @name            GitHub Date Converter
// @name:zh         GitHub 日期转换器
// @namespace       github-date-converter
// @version         0.3.0
// @author          dumeng
// @description     Convert GitHub dates to standard numerical formats, supports custom formats.
// @description:zh  将 GitHub 页面中的日期转换为标准的数字格式，支持自定义格式
// @license         MIT
// @icon            https://github.githubassets.com/favicons/favicon.svg
// @homepage        https://github.com/dumeng-chn/github-date-converter
// @homepageURL     https://github.com/dumeng-chn/github-date-converter
// @source          https://github.com/dumeng-chn/github-date-converter.git
// @supportURL      https://github.com/dumeng-chn/github-date-converter/issues
// @downloadURL     https://raw.githubusercontent.com/dumeng-chn/github-date-converter/main/dist/github-date-converter.user.js
// @updateURL       https://raw.githubusercontent.com/dumeng-chn/github-date-converter/main/dist/github-date-converter.user.js
// @match           https://github.com/*
// @require         https://cdn.jsdelivr.net/npm/dayjs@1.11.20/dayjs.min.js
// @grant           GM_getValue
// @grant           GM_registerMenuCommand
// @grant           GM_setValue
// @grant           GM_unregisterMenuCommand
// @run-at          document-end
// @compatible      chrome, firefox, edge, safari
// ==/UserScript==

(function (dayjs) {
  'use strict';

  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_registerMenuCommand = (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_unregisterMenuCommand = (() => typeof GM_unregisterMenuCommand != "undefined" ? GM_unregisterMenuCommand : void 0)();
  const PRESETS = [
    { label: "YYYY-MM-DD (2025-12-31)", format: "YYYY-MM-DD" },
    { label: "MM/DD/YYYY (12/31/2025)", format: "MM/DD/YYYY" },
    { label: "DD/MM/YYYY (31/12/2025)", format: "DD/MM/YYYY" },
    { label: "YYYY/MM/DD (2025/12/31)", format: "YYYY/MM/DD" }
  ];
  const FORMAT_KEY = "dateFormat";
  const RELATIVE_KEY = "relativeMode";
  const IGNORE_FILE_LIST_KEY = "ignoreFileList";
  const LANG_KEY = "language";
  const DEFAULT_FORMAT = "YYYY-MM-DD";
  function getLang() {
    const defaultLang = navigator.language.startsWith("zh") ? "zh" : "en";
    return _GM_getValue(LANG_KEY, defaultLang);
  }
  const I18N = {
    en: {
      customFormatMenu: "✏️ Custom Format",
      customFormatPrompt: "Enter date format (placeholders: YYYY, MM, DD)\nExample: YYYY-MM-DD",
      relativeModeNone: "Do not convert relative time (Default)",
      relativeMode7Days: "Only convert relative time > 7 days",
      relativeModeAll: "Convert all relative time",
      ignoreFileListMenu: "📁 Ignore repository file list dates",
      settingsChangedReload: "Settings changed. Some converted elements require a page reload to restore. Reload now?",
      settingsChangedSimple: "Settings changed. Reload page now?",
      langToggleMenu: "🌐 Language / 语言: English"
    },
    zh: {
      customFormatMenu: "✏️ 自定义格式",
      customFormatPrompt: "请输入日期格式（可用占位符：YYYY 年、MM 月、DD 日）\n示例：YYYY年MM月DD日",
      relativeModeNone: "不转换相对时间（默认）",
      relativeMode7Days: "仅转换大于 7 天的相对时间",
      relativeModeAll: "转换所有相对时间",
      ignoreFileListMenu: "📁 忽略仓库文件列表中的日期",
      settingsChangedReload: "设置已更改。部分已转换的元素需要刷新页面才能还原，是否立即刷新？",
      settingsChangedSimple: "设置已更改。是否立即刷新页面？",
      langToggleMenu: "🌐 Language / 语言: 简体中文"
    }
  };
  function getRelativeMode() {
    const val = _GM_getValue(RELATIVE_KEY, "none");
    return val;
  }
  function formatDateObj(date, format) {
    return dayjs(date).format(format);
  }
  function formatDate(isoDatetime, format) {
    const d = dayjs(isoDatetime);
    if (!d.isValid()) return "";
    return d.format(format);
  }
  const MONTH_PATTERN = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/;
  const TEXT_DATE_PATTERN = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,\s+\d{4})?\b/g;
  function processCustomElement(el) {
    const datetime = el.getAttribute("datetime");
    if (!datetime) return;
    const shadow = el.shadowRoot;
    const currentText = (shadow ? shadow.textContent : el.textContent)?.trim() || "";
    const format = _GM_getValue(FORMAT_KEY, DEFAULT_FORMAT);
    const formatted = formatDate(datetime, format);
    if (!formatted) return;
    if (currentText === formatted) return;
    const relativeMode = getRelativeMode();
    const ignoreFileList = _GM_getValue(IGNORE_FILE_LIST_KEY, true);
    if (ignoreFileList && el.closest(".react-directory-commit-age, td.age")) {
      return;
    }
    const isAbsolute = MONTH_PATTERN.test(currentText);
    if (!isAbsolute) {
      if (relativeMode === "none") {
        return;
      } else if (relativeMode === "7days") {
        const ageInDays = Math.abs(Date.now() - new Date(datetime).getTime()) / (1e3 * 60 * 60 * 24);
        if (ageInDays <= 7) return;
      }
    }
    if (shadow) {
      shadow.textContent = formatted;
    } else {
      el.textContent = formatted;
    }
  }
  function processTextElement(el) {
    if (el.children.length > 0) return;
    const originalText = el.getAttribute("data-ghd-original") || el.textContent || "";
    if (!originalText || !originalText.match(TEXT_DATE_PATTERN)) return;
    if (!el.hasAttribute("data-ghd-original")) {
      el.setAttribute("data-ghd-original", originalText);
    }
    const format = _GM_getValue(FORMAT_KEY, DEFAULT_FORMAT);
    const newText = originalText.replace(TEXT_DATE_PATTERN, (match) => {
      let dateStr = match;
      if (!/\d{4}/.test(match)) {
        dateStr = `${match}, ${( new Date()).getFullYear()}`;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return match;
      return formatDateObj(date, format);
    });
    if (newText !== el.textContent) {
      el.textContent = newText;
    }
  }
  const TIME_SELECTORS = ["relative-time", "time-ago", "local-time"].join(",");
  const TEXT_SELECTORS = [
    '[data-testid="commit-group-title"]',
".gh-header-meta .Label--secondary",
".release-entry .Label--secondary"
].join(",");
  function processAll() {
    document.querySelectorAll(TIME_SELECTORS).forEach(processCustomElement);
    document.querySelectorAll(TEXT_SELECTORS).forEach(processTextElement);
  }
  function reprocessAll() {
    processAll();
  }
  function startObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            const targetEl = mutation.target;
            if (targetEl.matches(TIME_SELECTORS)) processCustomElement(targetEl);
            if (targetEl.matches(TEXT_SELECTORS)) processTextElement(targetEl);
          }
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const el = node;
            if (el.matches(TIME_SELECTORS)) processCustomElement(el);
            if (el.matches(TEXT_SELECTORS)) processTextElement(el);
            el.querySelectorAll?.(TIME_SELECTORS).forEach(processCustomElement);
            el.querySelectorAll?.(TEXT_SELECTORS).forEach(processTextElement);
          });
        } else if (mutation.type === "attributes" && mutation.attributeName === "title") {
          if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            const targetEl = mutation.target;
            if (targetEl.matches(TIME_SELECTORS)) processCustomElement(targetEl);
          }
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["title"]
    });
  }
  let menuIds = [];
  function registerMenuCommands() {
    menuIds.forEach((id) => _GM_unregisterMenuCommand(id));
    menuIds = [];
    const currentFormat = _GM_getValue(FORMAT_KEY, DEFAULT_FORMAT);
    const isCustomFormat = !PRESETS.some((p) => p.format === currentFormat);
    const lang = getLang();
    const t = I18N[lang];
    let separatorCount = 0;
    const addSeparator = () => {
      const spaces = " ".repeat(separatorCount++);
      menuIds.push(_GM_registerMenuCommand("┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈" + spaces, () => {
      }));
    };
    menuIds.push(
      _GM_registerMenuCommand(t.langToggleMenu, () => {
        _GM_setValue(LANG_KEY, lang === "en" ? "zh" : "en");
        registerMenuCommands();
      })
    );
    addSeparator();
    PRESETS.forEach(({ label, format }) => {
      const check = format === currentFormat ? "✅" : "⬛";
      const id = _GM_registerMenuCommand(`${check} 📅 ${label}`, () => {
        _GM_setValue(FORMAT_KEY, format);
        reprocessAll();
        registerMenuCommands();
      });
      menuIds.push(id);
    });
    const customCheck = isCustomFormat ? "✅" : "⬛";
    const customLabel = isCustomFormat ? `${t.customFormatMenu.replace("...", "")} (${currentFormat})` : t.customFormatMenu;
    menuIds.push(
      _GM_registerMenuCommand(`${customCheck} ${customLabel}`, () => {
        const custom = prompt(t.customFormatPrompt, currentFormat);
        if (custom && custom.trim()) {
          _GM_setValue(FORMAT_KEY, custom.trim());
          reprocessAll();
          registerMenuCommands();
        }
      })
    );
    addSeparator();
    const relativeMode = getRelativeMode();
    const relativeOptions = [
      { label: t.relativeModeNone, value: "none" },
      { label: t.relativeMode7Days, value: "7days" },
      { label: t.relativeModeAll, value: "all" }
    ];
    relativeOptions.forEach(({ label, value }) => {
      const check = value === relativeMode ? "✅" : "⬛";
      const id = _GM_registerMenuCommand(`${check} ⏳ ${label}`, () => {
        _GM_setValue(RELATIVE_KEY, value);
        if (confirm(t.settingsChangedReload)) {
          location.reload();
        } else {
          reprocessAll();
          registerMenuCommands();
        }
      });
      menuIds.push(id);
    });
    addSeparator();
    const ignoreFileList = _GM_getValue(IGNORE_FILE_LIST_KEY, true);
    const checkIgnore = ignoreFileList ? "✅" : "⬛";
    menuIds.push(
      _GM_registerMenuCommand(`${checkIgnore} ${t.ignoreFileListMenu}`, () => {
        _GM_setValue(IGNORE_FILE_LIST_KEY, !ignoreFileList);
        if (confirm(t.settingsChangedSimple)) {
          location.reload();
        } else {
          reprocessAll();
          registerMenuCommands();
        }
      })
    );
  }
  processAll();
  startObserver();
  registerMenuCommands();
  document.addEventListener("turbo:load", () => {
    reprocessAll();
  });
  document.addEventListener("pjax:end", () => {
    reprocessAll();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      reprocessAll();
    }
  });

})(dayjs);