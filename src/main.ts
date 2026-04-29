import { GM_getValue, GM_registerMenuCommand, GM_setValue, GM_unregisterMenuCommand } from '$';
import dayjs from 'dayjs';

type RelativeMode = 'none' | '7days' | 'all';

// ── 格式预设 ────────────────────────────────────────────────
const PRESETS: { label: string; format: string }[] = [
    { label: 'YYYY-MM-DD (2025-12-31)', format: 'YYYY-MM-DD' },
    { label: 'MM/DD/YYYY (12/31/2025)', format: 'MM/DD/YYYY' },
    { label: 'DD/MM/YYYY (31/12/2025)', format: 'DD/MM/YYYY' },
    { label: 'YYYY/MM/DD (2025/12/31)', format: 'YYYY/MM/DD' },
];

const FORMAT_KEY = 'dateFormat';
const RELATIVE_KEY = 'relativeMode';
const IGNORE_FILE_LIST_KEY = 'ignoreFileList';
const LANG_KEY = 'language';
const DEFAULT_FORMAT = 'YYYY-MM-DD';

type Lang = 'en' | 'zh';

function getLang(): Lang {
    const defaultLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    return GM_getValue(LANG_KEY, defaultLang) as Lang;
}

const I18N = {
    en: {
        customFormatMenu: '✏️ Custom Format',
        customFormatPrompt: 'Enter date format (placeholders: YYYY, MM, DD)\nExample: YYYY-MM-DD',
        relativeModeNone: 'Do not convert relative time (Default)',
        relativeMode7Days: 'Only convert relative time > 7 days',
        relativeModeAll: 'Convert all relative time',
        ignoreFileListMenu: '📁 Ignore repository file list dates',
        settingsChangedReload:
            'Settings changed. Some converted elements require a page reload to restore. Reload now?',
        settingsChangedSimple: 'Settings changed. Reload page now?',
        langToggleMenu: '🌐 Language / 语言: English',
    },
    zh: {
        customFormatMenu: '✏️ 自定义格式',
        customFormatPrompt: '请输入日期格式（可用占位符：YYYY 年、MM 月、DD 日）\n示例：YYYY年MM月DD日',
        relativeModeNone: '不转换相对时间（默认）',
        relativeMode7Days: '仅转换大于 7 天的相对时间',
        relativeModeAll: '转换所有相对时间',
        ignoreFileListMenu: '📁 忽略仓库文件列表中的日期',
        settingsChangedReload: '设置已更改。部分已转换的元素需要刷新页面才能还原，是否立即刷新？',
        settingsChangedSimple: '设置已更改。是否立即刷新页面？',
        langToggleMenu: '🌐 Language / 语言: 简体中文',
    },
};

function getRelativeMode(): RelativeMode {
    const val = GM_getValue(RELATIVE_KEY, 'none');
    return val as RelativeMode;
}

// ── 日期格式化 ───────────────────────────────────────────────
function formatDateObj(date: Date, format: string): string {
    return dayjs(date).format(format);
}

function formatDate(isoDatetime: string, format: string): string {
    const d = dayjs(isoDatetime);
    if (!d.isValid()) return '';
    return d.format(format);
}

// 匹配英文月份缩写，用于判断是绝对日期（Jan 12）还是相对时间（1 day ago）
const MONTH_PATTERN = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/;

// 匹配文本中的日期，如 "Apr 29, 2026" 或 "Apr 29"
const TEXT_DATE_PATTERN = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,\s+\d{4})?\b/g;

// ── 元素处理逻辑 ─────────────────────────────────────────────
// 处理自定义时间元素（含 datetime 属性）
function processCustomElement(el: Element): void {
    const datetime = el.getAttribute('datetime');
    if (!datetime) return;

    // 获取当前真实的显示文本内容
    // 优先读取 shadowRoot (Web Component 实际渲染内容)，否则读取 Light DOM
    const shadow = el.shadowRoot;
    const currentText = (shadow ? shadow.textContent : el.textContent)?.trim() || '';

    // 获取目标格式
    const format: string = GM_getValue(FORMAT_KEY, DEFAULT_FORMAT);
    const formatted = formatDate(datetime, format);
    if (!formatted) return;

    // 如果已经是目标格式，直接跳过，避免死循环
    if (currentText === formatted) return;

    // 获取转换配置
    const relativeMode = getRelativeMode();
    const ignoreFileList = GM_getValue(IGNORE_FILE_LIST_KEY, true); // 默认忽略仓库文件列表

    // 检查是否在文件列表中
    if (ignoreFileList && el.closest('.react-directory-commit-age, td.age')) {
        // 如果是从我们之前转换过的状态被 GitHub 强制刷新，保留原样
        return;
    }

    // 严格依赖 GitHub 渲染出来的真实文本，如果包含月份说明是绝对日期，否则判定为相对日期
    const isAbsolute = MONTH_PATTERN.test(currentText);

    if (!isAbsolute) {
        if (relativeMode === 'none') {
            return;
        } else if (relativeMode === '7days') {
            const ageInDays = Math.abs(Date.now() - new Date(datetime).getTime()) / (1000 * 60 * 60 * 24);
            if (ageInDays <= 7) return;
        }
    }

    // 关键修正：为了不破坏 React 的 Hydration 和 Web Component 的内部状态，
    // 我们绝对不能使用 el.replaceWith() 替换整个节点。
    // 我们只需要修改 shadowRoot 的内容，这样用户视觉上能看到转换后的日期，
    // 同时框架（如 React）依然保有原本的 DOM 引用和状态。
    if (shadow) {
        shadow.textContent = formatted;
    } else {
        el.textContent = formatted;
    }
}

// 处理纯文本元素（如 Commit 标题）
function processTextElement(el: Element): void {
    // 如果包含子元素，则跳过（避免破坏复杂的 HTML 结构）
    if (el.children.length > 0) return;

    const originalText = el.getAttribute('data-ghd-original') || el.textContent || '';
    // 使用 match 来替代 test，避免 /g 模式带来的 lastIndex 状态问题
    if (!originalText || !originalText.match(TEXT_DATE_PATTERN)) return;

    // 保存原始文本用于切换格式
    if (!el.hasAttribute('data-ghd-original')) {
        el.setAttribute('data-ghd-original', originalText);
    }

    const format: string = GM_getValue(FORMAT_KEY, DEFAULT_FORMAT);
    const newText = originalText.replace(TEXT_DATE_PATTERN, (match) => {
        let dateStr = match;
        // 如果没有年份（如 "Apr 29"），补上当前年份，否则 JS 会默认解析为 2001 年
        if (!/\d{4}/.test(match)) {
            dateStr = `${match}, ${new Date().getFullYear()}`;
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return match;
        return formatDateObj(date, format);
    });

    if (newText !== el.textContent) {
        el.textContent = newText;
    }
}

// GitHub 使用的选择器
const TIME_SELECTORS = ['relative-time', 'time-ago', 'local-time'].join(',');
const TEXT_SELECTORS = [
    '[data-testid="commit-group-title"]', // Commit 时间线标题
    '.gh-header-meta .Label--secondary', // 某些元数据
    '.release-entry .Label--secondary', // Release 标签
].join(',');

function processAll(): void {
    document.querySelectorAll(TIME_SELECTORS).forEach(processCustomElement);
    document.querySelectorAll(TEXT_SELECTORS).forEach(processTextElement);
}

// ── 核心调度 ─────────────────────────────────────────────────
function reprocessAll(): void {
    processAll();
}

// ── MutationObserver 监听动态内容 ───────────────────────────
function startObserver(): void {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                // 1. 处理元素自身的内容更新（例如 React 或 Web Component 修改了 textContent）
                if (mutation.target.nodeType === Node.ELEMENT_NODE) {
                    const targetEl = mutation.target as Element;
                    if (targetEl.matches(TIME_SELECTORS)) processCustomElement(targetEl);
                    if (targetEl.matches(TEXT_SELECTORS)) processTextElement(targetEl);
                }

                // 2. 处理新插入的 DOM 树
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    const el = node as Element;
                    if (el.matches(TIME_SELECTORS)) processCustomElement(el);
                    if (el.matches(TEXT_SELECTORS)) processTextElement(el);

                    el.querySelectorAll?.(TIME_SELECTORS).forEach(processCustomElement);
                    el.querySelectorAll?.(TEXT_SELECTORS).forEach(processTextElement);
                });
            } else if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
                // 3. 处理 GitHub Web Component 初始化完成时设置 title 触发的属性变化
                // 这样可以确保它即使默默覆盖了 Shadow DOM，我们也能捕获到更新并重新转换
                if (mutation.target.nodeType === Node.ELEMENT_NODE) {
                    const targetEl = mutation.target as Element;
                    if (targetEl.matches(TIME_SELECTORS)) processCustomElement(targetEl);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['title'],
    });
}

// 保存已注册的菜单项 ID
let menuIds: Array<string | number> = [];

// ── 注册 Tampermonkey 菜单命令 ───────────────────────────────
function registerMenuCommands(): void {
    // 清理旧菜单项，防止重复叠加
    menuIds.forEach((id) => GM_unregisterMenuCommand(id));
    menuIds = [];

    const currentFormat: string = GM_getValue(FORMAT_KEY, DEFAULT_FORMAT);
    const isCustomFormat = !PRESETS.some((p) => p.format === currentFormat);
    const lang = getLang();
    const t = I18N[lang];

    let separatorCount = 0;
    const addSeparator = () => {
        const spaces = ' '.repeat(separatorCount++);
        menuIds.push(GM_registerMenuCommand('┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈' + spaces, () => {}));
    };

    // 1. 语言切换
    menuIds.push(
        GM_registerMenuCommand(t.langToggleMenu, () => {
            GM_setValue(LANG_KEY, lang === 'en' ? 'zh' : 'en');
            registerMenuCommands();
        }),
    );

    addSeparator();

    // 2. 格式预设
    PRESETS.forEach(({ label, format }) => {
        const check = format === currentFormat ? '✅' : '⬛';
        const id = GM_registerMenuCommand(`${check} 📅 ${label}`, () => {
            GM_setValue(FORMAT_KEY, format);
            reprocessAll();
            registerMenuCommands();
        });
        menuIds.push(id);
    });

    // 自定义格式
    const customCheck = isCustomFormat ? '✅' : '⬛';
    const customLabel = isCustomFormat
        ? `${t.customFormatMenu.replace('...', '')} (${currentFormat})`
        : t.customFormatMenu;

    menuIds.push(
        GM_registerMenuCommand(`${customCheck} ${customLabel}`, () => {
            const custom = prompt(t.customFormatPrompt, currentFormat);
            if (custom && custom.trim()) {
                GM_setValue(FORMAT_KEY, custom.trim());
                reprocessAll();
                registerMenuCommands();
            }
        }),
    );

    addSeparator();

    // 3. 相对时间转换模式
    const relativeMode = getRelativeMode();
    const relativeOptions: { label: string; value: RelativeMode }[] = [
        { label: t.relativeModeNone, value: 'none' },
        { label: t.relativeMode7Days, value: '7days' },
        { label: t.relativeModeAll, value: 'all' },
    ];

    relativeOptions.forEach(({ label, value }) => {
        const check = value === relativeMode ? '✅' : '⬛';
        const id = GM_registerMenuCommand(`${check} ⏳ ${label}`, () => {
            GM_setValue(RELATIVE_KEY, value);
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

    // 4. 忽略仓库文件列表开关
    const ignoreFileList = GM_getValue(IGNORE_FILE_LIST_KEY, true);
    const checkIgnore = ignoreFileList ? '✅' : '⬛';

    menuIds.push(
        GM_registerMenuCommand(`${checkIgnore} ${t.ignoreFileListMenu}`, () => {
            GM_setValue(IGNORE_FILE_LIST_KEY, !ignoreFileList);
            if (confirm(t.settingsChangedSimple)) {
                location.reload();
            } else {
                reprocessAll();
                registerMenuCommands();
            }
        }),
    );
}

// ── 入口 ─────────────────────────────────────────────────────
processAll();
startObserver();
registerMenuCommands();
