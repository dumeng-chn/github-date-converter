import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
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
                    compatible: 'chrome, firefox, edge, safari',
                    'run-at': 'document-end',
                    license: 'MIT',
                    homepageURL: 'https://github.com/dumeng-chn/github-date-converter',
                    supportURL: 'https://github.com/dumeng-chn/github-date-converter/issues',
                    updateURL:
                        'https://raw.githubusercontent.com/dumeng-chn/github-date-converter/master/dist/github-date-converter.user.js',
                    downloadURL:
                        'https://raw.githubusercontent.com/dumeng-chn/github-date-converter/master/dist/github-date-converter.user.js',
                },
                build: {
                    fileName: `github-date-converter${isDev ? '.dev' : ''}.user.js`,
                    externalGlobals: {
                        dayjs: cdn.jsdelivr('dayjs', 'dayjs.min.js'),
                    },
                },
            }),
        ],
        build: {
            outDir: isDev ? 'dist-dev' : 'dist',
            emptyOutDir: true,
            minify: false,
        },
    };
});
