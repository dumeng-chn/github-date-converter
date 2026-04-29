import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: {
                    '': 'GitHub Date Converter',
                    zh: 'GitHub 日期转换器',
                },
                namespace: 'github-date-converter',
                description: {
                    '': 'Convert GitHub dates to standard numerical formats, supports custom formats.',
                    zh: '将 GitHub 页面中的日期转换为标准的数字格式，支持自定义格式',
                },
                icon: 'https://github.githubassets.com/favicons/favicon.svg',
                match: ['https://github.com/*'],
                grant: ['GM_getValue', 'GM_setValue', 'GM_registerMenuCommand', 'GM_unregisterMenuCommand'],
                'run-at': 'document-end',
                license: 'MIT',
                homepageURL: 'https://github.com/dumeng-chn/github-date-converter',
                supportURL: 'https://github.com/dumeng-chn/github-date-converter/issues',
                updateURL:
                    'https://raw.githubusercontent.com/dumeng-chn/github-date-converter/master/dist/github-date-converter.user.js',
                downloadURL:
                    'https://raw.githubusercontent.com/dumeng-chn/github-date-converter/master/dist/github-date-converter.user.js',
            },
        }),
    ],
});
