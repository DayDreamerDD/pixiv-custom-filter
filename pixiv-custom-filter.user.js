// ==UserScript==
// @name         Pixiv小说自定义屏蔽
// @namespace    http://tampermonkey.net/
// @version      2026.8.15.2
// @description  自适应移动端与桌面端的小说筛选按钮和设置界面
// @author       echo
// @match        https://www.pixiv.net/search*
// @match        https://www.pixiv.net/tag*
// @match        https://www.pixiv.net/novel/bookmarks.php*
// @grant        GM_addStyle
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/echo152/pixiv-custom-filter/main/pixiv-custom-filter.user.js
// @updateURL    https://raw.githubusercontent.com/echo152/pixiv-custom-filter/main/pixiv-custom-filter.user.js
// ==/UserScript==

(function () {
    'use strict';

    /* ================= 配置 ================= */
    const defaultConfig = {
        contentKeywords: ['无限制ai', 'ai风月', 'ai网站'],
        authorKeywords: ['（', '('],
        tagKeywords: ['语c', '男同', 'BL'],
        minTextLength: 0,
        maxTextLength: 100000,
        hideNoDescription: true
    };

    function getConfig() {
        try {
            return { ...defaultConfig, ...JSON.parse(localStorage.getItem('pixivFilterConfig') || '{}') };
        } catch {
            return { ...defaultConfig };
        }
    }

    function saveConfig(config) {
        localStorage.setItem('pixivFilterConfig', JSON.stringify(config));
    }

    let config = getConfig();
    let isHidden = false;
    let elements = [];

    /* ================= UI样式 ================= */
    GM_addStyle(`
        #pixivFilterControls {
            position: fixed !important;
            z-index: 2147483647 !important;
            display: flex !important;
            gap: 8px;
            padding: 6px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.86);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 24px rgba(20, 29, 43, 0.22);
        }
        #pixivFilterControls button,
        #pixivConfigPanel button,
        #pixivConfigPanel input,
        #pixivConfigPanel textarea {
            box-sizing: border-box;
            font: inherit;
        }
        #pixivFilterBtn, #pixivConfigBtn {
            all: unset;
            width: 44px;
            height: 44px;
            display: grid;
            place-items: center;
            border-radius: 10px;
            color: #fff;
            cursor: pointer;
            touch-action: manipulation;
            transition: background-color 160ms ease, transform 160ms ease;
        }
        #pixivFilterBtn { background: #596579; }
        #pixivFilterBtn.is-active { background: #0096fa; }
        #pixivConfigBtn { background: #27303f; }
        #pixivFilterBtn:hover, #pixivConfigBtn:hover { transform: translateY(-1px); }
        #pixivFilterBtn svg, #pixivConfigBtn svg { width: 23px; height: 23px; }
        #pixivFilterBtn:focus-visible,
        #pixivConfigBtn:focus-visible,
        #pixivConfigPanel button:focus-visible,
        #pixivConfigPanel input:focus-visible,
        #pixivConfigPanel textarea:focus-visible {
            outline: 3px solid #ffd54a;
            outline-offset: 2px;
        }
        .hidden-by-ai-toggle { display: none !important; }

        #pixivConfigPanel[hidden] { display: none !important; }
        #pixivConfigPanel {
            position: fixed;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            background: #fff;
            color: #27303f;
            box-shadow: 0 18px 48px rgba(20, 29, 43, 0.28);
            transition: opacity 160ms ease, transform 160ms ease;
        }
        .pixiv-filter-panel__header,
        .pixiv-filter-panel__footer {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px 20px;
            border-color: #dfe5ec;
        }
        .pixiv-filter-panel__header { border-bottom: 1px solid #dfe5ec; }
        .pixiv-filter-panel__header h2 { margin: 0; font-size: 18px; }
        .pixiv-filter-panel__body { flex: 1 1 auto; overflow: auto; padding: 20px; }
        .pixiv-filter-panel__field { display: grid; gap: 6px; margin-bottom: 16px; font-size: 14px; font-weight: 600; }
        .pixiv-filter-panel__field textarea,
        .pixiv-filter-panel__field .pixiv-filter-length-input {
            width: 100%;
            border: 1px solid #b9c4d0;
            border-radius: 8px;
            padding: 10px;
            color: #27303f;
            background: #fff;
            font-weight: 400;
        }
        .pixiv-filter-panel__field textarea { min-height: 78px; resize: vertical; }
        .pixiv-filter-panel__field .pixiv-filter-length-input { min-height: 44px; }
        .pixiv-filter-panel__description {
            margin: 0;
            color: #657184;
            font-size: 12px;
            font-weight: 400;
            line-height: 1.45;
        }
        .pixiv-filter-lengths { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .pixiv-filter-panel__check {
            display: flex;
            align-items: center;
            min-height: 44px;
            gap: 8px;
            margin-bottom: 16px;
            padding: 0 2px;
            font-size: 14px;
        }
        .pixiv-filter-panel__error { min-height: 20px; margin: 0; color: #c0272d; font-size: 13px; }
        .pixiv-filter-panel__footer { justify-content: flex-end; border-top: 1px solid #dfe5ec; }
        .pixiv-filter-panel__action {
            min-height: 44px;
            border: 0;
            border-radius: 8px;
            padding: 10px 14px;
            cursor: pointer;
            touch-action: manipulation;
        }
        .pixiv-filter-panel__action--icon {
            width: 44px;
            height: 44px;
            display: grid;
            place-items: center;
            padding: 0;
        }
        .pixiv-filter-panel__action--icon svg { width: 21px; height: 21px; }
        .pixiv-filter-panel__action--primary { background: #0096fa; color: #fff; }
        .pixiv-filter-panel__action--secondary { background: #edf1f5; color: #27303f; }

        @media (max-width: 767px) {
            #pixivFilterControls {
                right: 12px !important;
                bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
                flex-direction: row;
            }
            #pixivConfigPanel {
                inset: 0;
                width: 100%;
                height: 100vh;
                height: 100dvh;
                border-radius: 0;
            }
            .pixiv-filter-panel__footer { padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
            html.pixiv-filter-settings-open,
            html.pixiv-filter-settings-open body { overflow: hidden; }
        }

        @media (min-width: 768px) {
            #pixivFilterControls {
                right: 16px !important;
                top: 50% !important;
                transform: translateY(-50%);
                flex-direction: column;
            }
            #pixivConfigPanel {
                right: 82px;
                top: 50%;
                width: 420px;
                max-height: calc(100dvh - 32px);
                transform: translateY(-50%);
                border-radius: 14px;
                overflow: hidden;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            #pixivFilterControls,
            #pixivFilterBtn,
            #pixivConfigBtn,
            #pixivConfigPanel { transition: none !important; }
        }
    `);

    const filterIcons = {
        active: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
        inactive: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.2A11.8 11.8 0 0 1 12 4c6.5 0 10 8 10 8a17.7 17.7 0 0 1-2.1 3.2"/><path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 5.4-1.4"/></svg>'
    };
    const settingsIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/></svg>';

    const translations = {
        zhCN: {
            settingsTitle: '筛选设置', openSettings: '打开设置', closeSettings: '关闭设置', saveSettings: '保存设置',
            enableFiltering: '启用屏蔽', disableFiltering: '停用屏蔽',
            contentLabel: '内容关键词', contentDescription: '每行一个；匹配系列名称、标题或简介。',
            authorLabel: '作者关键词', authorDescription: '每行一个；匹配作者名称。',
            tagLabel: '标签关键词', tagDescription: '每行一个；匹配作品标签。',
            minLabel: '最小字数', minDescription: '隐藏少于此字数的作品。',
            maxLabel: '最大字数', maxDescription: '隐藏超过此字数的作品。',
            hideNoDescription: '隐藏无简介小说'
        },
        zhTW: {
            settingsTitle: '篩選設定', openSettings: '開啟設定', closeSettings: '關閉設定', saveSettings: '儲存設定',
            enableFiltering: '啟用屏蔽', disableFiltering: '停用屏蔽',
            contentLabel: '內容關鍵詞', contentDescription: '每行一個；比對系列名稱、標題或簡介。',
            authorLabel: '作者關鍵詞', authorDescription: '每行一個；比對作者名稱。',
            tagLabel: '標籤關鍵詞', tagDescription: '每行一個；比對作品標籤。',
            minLabel: '最小字數', minDescription: '隱藏少於此字數的作品。',
            maxLabel: '最大字數', maxDescription: '隱藏超過此字數的作品。',
            hideNoDescription: '隱藏無簡介小說'
        },
        ja: {
            settingsTitle: 'フィルター設定', openSettings: '設定を開く', closeSettings: '設定を閉じる', saveSettings: '設定を保存',
            enableFiltering: 'フィルターを有効にする', disableFiltering: 'フィルターを無効にする',
            contentLabel: 'コンテンツキーワード', contentDescription: '1行に1つ。シリーズ名、タイトル、あらすじに一致します。',
            authorLabel: '作者キーワード', authorDescription: '1行に1つ。作者名に一致します。',
            tagLabel: 'タグキーワード', tagDescription: '1行に1つ。作品タグに一致します。',
            minLabel: '最小文字数', minDescription: 'この文字数未満の作品を非表示にします。',
            maxLabel: '最大文字数', maxDescription: 'この文字数を超える作品を非表示にします。',
            hideNoDescription: 'あらすじのない小説を非表示'
        },
        en: {
            settingsTitle: 'Filter settings', openSettings: 'Open settings', closeSettings: 'Close settings', saveSettings: 'Save settings',
            enableFiltering: 'Enable filtering', disableFiltering: 'Disable filtering',
            contentLabel: 'Content keywords', contentDescription: 'One per line; matches series names, titles, or descriptions.',
            authorLabel: 'Author keywords', authorDescription: 'One per line; matches author names.',
            tagLabel: 'Tag keywords', tagDescription: 'One per line; matches work tags.',
            minLabel: 'Minimum length', minDescription: 'Hide works below this character count.',
            maxLabel: 'Maximum length', maxDescription: 'Hide works above this character count.',
            hideNoDescription: 'Hide novels without a description'
        }
    };

    function resolveLocale() {
        const browserLanguage = typeof navigator === 'undefined' ? '' : navigator.language;
        const locale = (document.documentElement.lang || browserLanguage || '').toLowerCase().replace(/_/g, '-');
        if (/^zh-(tw|hant|hk|mo)(?:-|$)/.test(locale)) return 'zhTW';
        if (locale.startsWith('zh')) return 'zhCN';
        if (locale.startsWith('ja')) return 'ja';
        return 'en';
    }

    const controls = document.createElement('div');
    controls.id = 'pixivFilterControls';
    const btn = document.createElement('button');
    btn.id = 'pixivFilterBtn';
    btn.type = 'button';
    btn.innerHTML = filterIcons.inactive;
    const cfgBtn = document.createElement('button');
    cfgBtn.id = 'pixivConfigBtn';
    cfgBtn.type = 'button';
    cfgBtn.innerHTML = settingsIcon;
    cfgBtn.setAttribute('aria-controls', 'pixivConfigPanel');
    cfgBtn.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('section');
    panel.id = 'pixivConfigPanel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'pixivFilterPanelTitle');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
<header class="pixiv-filter-panel__header">
    <h2 id="pixivFilterPanelTitle"></h2>
    <button id="close" class="pixiv-filter-panel__action pixiv-filter-panel__action--secondary pixiv-filter-panel__action--icon" type="button">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
</header>
<div class="pixiv-filter-panel__body">
    <label class="pixiv-filter-panel__field"><span id="contentLabel"></span><textarea id="c" aria-describedby="contentDescription"></textarea><span id="contentDescription" class="pixiv-filter-panel__description"></span></label>
    <label class="pixiv-filter-panel__field"><span id="authorLabel"></span><textarea id="a" aria-describedby="authorDescription"></textarea><span id="authorDescription" class="pixiv-filter-panel__description"></span></label>
    <label class="pixiv-filter-panel__field"><span id="tagLabel"></span><textarea id="t" aria-describedby="tagDescription"></textarea><span id="tagDescription" class="pixiv-filter-panel__description"></span></label>
    <div class="pixiv-filter-lengths">
        <label class="pixiv-filter-panel__field"><span id="minLabel"></span><input class="pixiv-filter-length-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" id="min" aria-describedby="minDescription"><span id="minDescription" class="pixiv-filter-panel__description"></span></label>
        <label class="pixiv-filter-panel__field"><span id="maxLabel"></span><input class="pixiv-filter-length-input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" id="max" aria-describedby="maxDescription"><span id="maxDescription" class="pixiv-filter-panel__description"></span></label>
    </div>
    <label class="pixiv-filter-panel__check"><input type="checkbox" id="no"><span id="hideNoDescriptionLabel"></span></label>
    <p id="settingsError" class="pixiv-filter-panel__error" role="alert" aria-live="polite"></p>
</div>
<footer class="pixiv-filter-panel__footer">
    <button id="save" class="pixiv-filter-panel__action pixiv-filter-panel__action--primary pixiv-filter-panel__action--icon" type="button">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.8L15.2 3Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
    </button>
</footer>`;

    function mountUI() {
        if (!document.body || document.getElementById('pixivFilterControls')) return;
        controls.appendChild(btn);
        controls.appendChild(cfgBtn);
        document.body.appendChild(controls);
        document.body.appendChild(panel);
    }

    /* ================= 广告屏蔽逻辑 (优化版) ================= */
    function removePremiumAds() {
        // 1. 删除嵌入的广告 iframe
        document.querySelectorAll('iframe[src*="premium_lp"]').forEach(iframe => iframe.remove());

        // 2. 精确匹配并删除会员宣传大横幅（匹配跳转链接为 premium/lead/lp 的容器）
        document.querySelectorAll('a[href*="/premium/lead/lp"]').forEach(link => {
            const container = link.closest('.mx-auto') || link.closest('.relative') || link.parentElement;
            if (container) {
                container.remove();
            }
        });

        // 3. 清除其他包含会员推广文案的提示组件（限定范围，防止误删分类导航和筛选条件栏）
        document.querySelectorAll('aside, div').forEach(el => {
            if (el.children.length <= 6) {
                const text = el.textContent || '';
                if (
                    (text.includes('成为pixiv高级会员') || text.includes('开通pixiv高级会员')) &&
                    (text.includes('使用相关功能') || text.includes('使用收藏内搜索')) &&
                    !el.querySelector('nav') &&
                    !el.querySelector('button[data-ga4-label]')
                ) {
                    const target = el.closest('.mx-auto') || el;
                    target.remove();
                }
            }
        });
    }

    /* ================= 工具 ================= */
    const contains = (text, keys) => {
        if (!text) return [];
        text = text.toLowerCase();
        return keys.filter(k => k && text.includes(k.toLowerCase()));
    };

    function findItems() {
        return document.querySelectorAll('[data-ga4-label="thumbnail"]');
    }

    /* ================= 作者提取 ================= */
    function getAuthor(li) {
        const titleEl = li.querySelector('.gtm-novel-searchpage-result-title');
        const seriesEl = li.querySelector('.gtm-novel-searchpage-result-series-title');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const series = seriesEl ? seriesEl.textContent.trim() : '';

        let authorEl = li.querySelector('.gtm-novel-searchpage-result-user');
        if (authorEl) {
            let name = (authorEl.textContent || '').trim();
            if (name && name !== title && name !== series && name.length < 30) return name;
        }

        authorEl = li.querySelector('a[href^="/users/"]');
        if (authorEl) {
            let name = (authorEl.textContent || '').trim();
            if (name && name !== title && name !== series && name.length < 30) return name;
        }

        const userLinks = li.querySelectorAll('a[href^="/users/"], a.gtm-novel-searchpage-result-user');
        for (let link of userLinks) {
            let name = (link.textContent || '').trim();
            if (name && name.length > 1 && name.length < 25 && name !== title && name !== series) return name;
        }
        return '';
    }

    /* ================= 简介判断 ================= */
    function hasValidDesc(li) {
        const titleEl = li.querySelector('.gtm-novel-searchpage-result-title');
        const seriesEl = li.querySelector('.gtm-novel-searchpage-result-series-title');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const seriesTitle = seriesEl ? seriesEl.textContent.trim() : '';

        const textBlocks = li.querySelectorAll('.charcoal-text-ellipsis, [data-line-limit]');

        for (let block of textBlocks) {
            let text = (block.textContent || '').trim();
            if (!text || text === title || text === seriesTitle || text.startsWith(title)) continue;
            if (text.length >= 8) return true;
        }
        return false;
    }

    /*
     * Pixiv 的 CSS module class 会随版本变化，不能用 class 定位字数。
     * 直接识别卡片中的“数字 + 单位”语义文本，避免持续维护 class 名。
     */
    const textLengthPattern = /^([\d\s,，]+)\s*(?:字|文字|character\(s\))$/iu;

    function parseTextLength(value) {
        const match = String(value || '').normalize('NFKC').trim().match(textLengthPattern);
        if (!match) return null;

        const length = Number(match[1].replace(/[\s,，]/g, ''));
        return Number.isSafeInteger(length) ? length : null;
    }

    function getTextLength(li) {
        const candidates = [];
        const nodes = li.querySelectorAll('*');

        for (const node of nodes) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') continue;
            if (node.closest('.charcoal-text-ellipsis')) continue;

            const values = [node.textContent, node.getAttribute('aria-label'), node.getAttribute('title')];
            for (const value of values) {
                const length = parseTextLength(value);
                if (length !== null) candidates.push(length);
            }
        }

        // 同一字段可能同时出现在文本和 aria-label 中，取第一个即可。
        return candidates.length ? candidates[0] : 0;
    }


    /* ================= 核心逻辑 ================= */
    function run() {
        // 执行原本的屏蔽逻辑
        elements.forEach(li => {
            const titleEl = li.querySelector('.gtm-novel-searchpage-result-title');
            const seriesEl = li.querySelector('.gtm-novel-searchpage-result-series-title');
            const title = titleEl ? titleEl.textContent.trim() : '';
            const series = seriesEl ? seriesEl.textContent.trim() : '';
            const author = getAuthor(li);
            const tags = Array.from(li.querySelectorAll('a[href*="tags/"], a.gtm-novel-searchpage-result-tag')).map(a => (a.textContent || '').trim());
            const textLength = getTextLength(li);

            const desc = (() => {
                for (let b of li.querySelectorAll('.charcoal-text-ellipsis, [data-line-limit]')) {
                    let t = (b.textContent || '').trim();
                    if (t.length > 8 && t !== title && t !== series) return t.replace(/[\s\n\r\u3000]+/g, ' ').trim();
                }
                return '';
            })();

            let reasons = [];
            if (contains(series, config.contentKeywords).length) reasons.push(`系列`+contains(series, config.contentKeywords));
            if (contains(title, config.contentKeywords).length) reasons.push(`标题`+contains(title, config.contentKeywords));
            if (contains(desc, config.contentKeywords).length) reasons.push(`简介`+contains(desc, config.contentKeywords));
            if (reasons.length === 0 && contains(li.textContent || '', config.contentKeywords).length) reasons.push('全文关键词'+contains(li.textContent || '', config.contentKeywords));
            if (author && contains(author, config.authorKeywords).length) reasons.push(`作者: ${author}`);
            if (contains(tags.join(' '), config.tagKeywords).length) reasons.push(`标签`+contains(tags.join(' '), config.tagKeywords));
            if (textLength < config.minTextLength) reasons.push(`太少(${textLength})`);
            if (textLength > config.maxTextLength) reasons.push(`太多(${textLength})`);
            if (config.hideNoDescription && !hasValidDesc(li)) reasons.push('无简介');

            const shouldHide = isHidden && reasons.length > 0;
            li.classList.toggle('hidden-by-ai-toggle', shouldHide);
        });

        // 强制移除广告元素
        removePremiumAds();
    }

    function init() {
        elements = Array.from(findItems());
        run();
    }

    /* ================= 事件 ================= */
    function splitKeywords(value) {
        return value.split('\n').map(keyword => keyword.trim()).filter(Boolean);
    }

    function sanitizeLengthInput(input) {
        input.value = input.value.replace(/\D/g, '');
    }

    function restrictLengthKey(event) {
        const hasShortcutModifier = event.ctrlKey || event.metaKey || event.altKey;
        if (!hasShortcutModifier && event.key.length === 1 && !/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    }

    function syncFilterButton() {
        btn.classList.toggle('is-active', isHidden);
        btn.innerHTML = isHidden ? filterIcons.active : filterIcons.inactive;
        const strings = translations[resolveLocale()];
        const nextAction = isHidden ? strings.disableFiltering : strings.enableFiltering;
        btn.setAttribute('aria-label', nextAction);
        btn.setAttribute('title', nextAction);
        btn.setAttribute('aria-pressed', String(isHidden));
    }

    function syncTranslations() {
        const strings = translations[resolveLocale()];
        const textTargets = {
            pixivFilterPanelTitle: 'settingsTitle',
            contentLabel: 'contentLabel',
            contentDescription: 'contentDescription',
            authorLabel: 'authorLabel',
            authorDescription: 'authorDescription',
            tagLabel: 'tagLabel',
            tagDescription: 'tagDescription',
            minLabel: 'minLabel',
            minDescription: 'minDescription',
            maxLabel: 'maxLabel',
            maxDescription: 'maxDescription',
            hideNoDescriptionLabel: 'hideNoDescription'
        };

        for (const [id, key] of Object.entries(textTargets)) {
            panel.querySelector(`#${id}`).textContent = strings[key];
        }

        for (const [element, key] of [
            [cfgBtn, 'openSettings'],
            [panel.querySelector('#close'), 'closeSettings'],
            [panel.querySelector('#save'), 'saveSettings']
        ]) {
            element.setAttribute('aria-label', strings[key]);
            element.setAttribute('title', strings[key]);
        }
        syncFilterButton();
    }

    function syncSettingsForm() {
        panel.querySelector('#c').value = config.contentKeywords.join('\n');
        panel.querySelector('#a').value = config.authorKeywords.join('\n');
        panel.querySelector('#t').value = config.tagKeywords.join('\n');
        panel.querySelector('#min').value = String(config.minTextLength);
        panel.querySelector('#max').value = String(config.maxTextLength);
        panel.querySelector('#no').checked = config.hideNoDescription;
        panel.querySelector('#settingsError').textContent = '';
    }

    function setSettingsOpen(open) {
        if (open) {
            syncTranslations();
            syncSettingsForm();
        }
        panel.hidden = !open;
        panel.setAttribute('aria-hidden', String(!open));
        cfgBtn.setAttribute('aria-expanded', String(open));
        document.documentElement.classList.toggle('pixiv-filter-settings-open', open);

        if (open) {
            requestAnimationFrame(() => panel.querySelector('#c').focus());
        } else {
            cfgBtn.focus();
        }
    }

    function readLengthBounds() {
        const minInput = panel.querySelector('#min');
        const maxInput = panel.querySelector('#max');
        sanitizeLengthInput(minInput);
        sanitizeLengthInput(maxInput);
        return {
            min: Number(minInput.value || 0),
            max: Number(maxInput.value || 0)
        };
    }

    function saveSettings() {
        let { min, max } = readLengthBounds();
        if (min > max) [min, max] = [max, min];

        config = {
            contentKeywords: splitKeywords(panel.querySelector('#c').value),
            authorKeywords: splitKeywords(panel.querySelector('#a').value),
            tagKeywords: splitKeywords(panel.querySelector('#t').value),
            minTextLength: min,
            maxTextLength: max,
            hideNoDescription: panel.querySelector('#no').checked
        };
        saveConfig(config);
        init();
        setSettingsOpen(false);
    }

    btn.onclick = () => {
        isHidden = !isHidden;
        syncFilterButton();
        run();
    };
    for (const input of [panel.querySelector('#min'), panel.querySelector('#max')]) {
        input.onkeydown = restrictLengthKey;
        input.oninput = () => sanitizeLengthInput(input);
    }
    cfgBtn.onclick = () => setSettingsOpen(panel.hidden);
    panel.querySelector('#save').onclick = saveSettings;
    panel.querySelector('#close').onclick = () => setSettingsOpen(false);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !panel.hidden && window.matchMedia('(min-width: 768px)').matches) {
            setSettingsOpen(false);
        }
    });
    syncTranslations();

    new MutationObserver(records => {
        if (records.some(record => record.type === 'attributes' && record.attributeName === 'lang')) {
            syncTranslations();
        }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    // 持续监控与初始化
    setInterval(() => {
        mountUI();
        removePremiumAds(); // 每2秒强查一次广告
    }, 2000);

    new MutationObserver(() => {
        setTimeout(() => {
            init();
            removePremiumAds();
        }, 300);
    }).observe(document.body, { childList: true, subtree: true });

    mountUI();
    setTimeout(init, 1000);

    console.log('✅ Pixiv小说屏蔽脚本已启动');
})();
