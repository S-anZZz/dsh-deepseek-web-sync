/**
 * DeepSeek Web Sidebar — browser half.
 *
 * 技术来源 / Author: ZCFE327
 *
 * The right Sidebar hosts DeepSeek Web in an isolated Electron webview guest.
 * Text captured from that guest is editable here, then inserted through the
 * current Session's public composer actions. The guest never receives Node,
 * preload, or Harness privileges; only text results cross the boundary.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-deepseek-web-sync3',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'deepseekWebSync3';
    const KIND = 'deepseek-web';
    const TYPE_ID = '@local/dsh-deepseek-web-sync3/panel';
    const START_URL = 'https://chat.deepseek.com/';
    const AUTO_PREFIX = 'dsh.deepseek-web-sync3.auto.';
    const AUTH_KEY = 'dsh.deepseek-web-sync3.auth.v1';
    const MAX_CAPTURE = 20000;
    const AUTH_POLL_MS = 4000;

    const EN = {
      'tab.title': 'DeepSeek Web',
      'panel.title': 'DeepSeek Web',
      'status.starting': 'Starting',
      'status.loading': 'Loading',
      'status.ready': 'Loaded',
      'status.error': 'Not loaded',
      'status.unsupported': 'Desktop only',
      'auth.saved': 'Signed in · kept',
      'auth.restoring': 'Restoring sign-in',
      'auth.loginOnce': 'Sign in once',
      'auth.hint': 'First run: sign in with the same DeepSeek account once; Harness restores this web session next time. The Harness API credential and the web login stay separate.',
      'capture.label': 'Capture',
      'action.selection': 'Selection',
      'action.composer': 'Composer',
      'action.recent': 'Last ask',
      'action.refresh': 'Reload page',
      'action.insert': 'Insert into chat',
      'action.copy': 'Copy',
      'action.clear': 'Clear',
      'action.dismiss': 'Dismiss',
      'source.selection': 'Selected text',
      'source.composer': 'Composer text',
      'source.recent': 'Last question',
      'notice.selectionEmpty': 'No selected text. Select the question in the page first.',
      'notice.composerEmpty': 'The DeepSeek composer is empty.',
      'notice.recentEmpty': 'Could not find the last question. Select it in the page and use Selection.',
      'notice.captured': 'Captured',
      'notice.truncated': 'Captured text was truncated to 20,000 characters.',
      'notice.captureFailed': 'Could not read the page. Wait for it to finish loading and try again.',
      'notice.inserted': 'Inserted into the current Harness composer.',
      'notice.insertFailed': 'The Harness composer is busy. Try again.',
      'notice.composerUnavailable': 'No active Harness composer is available for this chat.',
      'notice.copied': 'Copied.',
      'notice.copyFailed': 'Copy failed. Select the preview text and copy it manually.',
      'notice.loadFailed': 'DeepSeek Web could not be loaded. Check the network and reload.',
      'notice.crashed': 'The embedded page stopped. Reload it.',
      'notice.guestFailed': 'Could not start the embedded browser guest.',
      'unsupported.title': 'Available in DeepSeek Harness Desktop',
      'unsupported.body': 'Embedding DeepSeek Web and reading text from its page needs the Desktop app\'s isolated webview. Open this Sidebar tab from the Desktop app.',
      'open.title': 'Open DeepSeek Web in the right Sidebar',
      'open.short': 'Web',
      'guide.description': 'Ask in the web app and move the question into this chat.',
      'preview.label': 'Captured text, editable before inserting',
      'composer.busy': 'Waiting for the page',
    };

    const ZH = {
      'tab.title': 'DeepSeek 网页版',
      'panel.title': 'DeepSeek 网页版',
      'status.starting': '正在启动',
      'status.loading': '加载中',
      'status.ready': '已加载',
      'status.error': '未加载',
      'status.unsupported': '仅桌面版',
      'auth.saved': '已登录 · 保持中',
      'auth.restoring': '正在恢复登录',
      'auth.loginOnce': '登录一次即可保持',
      'auth.hint': '首次使用：用同一个 DeepSeek 账号登录一次，之后会随 Harness 自动恢复。Harness API 凭据与网页登录保持独立。',
      'capture.label': '抓取',
      'action.selection': '选区',
      'action.composer': '输入框',
      'action.recent': '最近提问',
      'action.refresh': '重新加载网页',
      'action.insert': '填入当前对话',
      'action.copy': '复制',
      'action.clear': '清空',
      'action.dismiss': '关闭提示',
      'source.selection': '网页选中文本',
      'source.composer': '网页输入框',
      'source.recent': '最近一次提问',
      'notice.selectionEmpty': '没有选中文字。请先在网页中选中要带过来的提问。',
      'notice.composerEmpty': 'DeepSeek 网页版输入框是空的。',
      'notice.recentEmpty': '没有找到最近提问。请在网页中选中问题后点“选区”。',
      'notice.captured': '已抓取',
      'notice.truncated': '抓取内容超过 20,000 字符，已截断。',
      'notice.captureFailed': '读取网页失败。请等页面加载完成后重试。',
      'notice.inserted': '已填入当前 Harness 输入框，可继续编辑或发送。',
      'notice.insertFailed': 'Harness 输入框正忙，请稍后重试。',
      'notice.composerUnavailable': '当前对话没有可用的 Harness 输入框。',
      'notice.copied': '已复制。',
      'notice.copyFailed': '复制失败，请选中预览文字手动复制。',
      'notice.loadFailed': 'DeepSeek 网页版加载失败。请检查网络后重新加载。',
      'notice.crashed': '内嵌网页进程已停止，请重新加载。',
      'notice.guestFailed': '无法启动内嵌浏览器。',
      'unsupported.title': '请在 DeepSeek Harness 桌面版中使用',
      'unsupported.body': '内嵌 DeepSeek 网页版并读取页面文字，需要桌面版提供的隔离 webview。请从桌面版打开此侧栏标签。',
      'open.title': '在右侧栏打开 DeepSeek 网页版',
      'open.short': '网页版',
      'guide.description': '在网页版提问，再把问题带进当前对话。',
      'preview.label': '抓取到的文字，可编辑后填入',
      'composer.busy': '等待网页就绪',
    };

    const PANEL_CSS = [
      '.dswv-root{height:100%;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.45}',
      '.dswv-strip{flex:none;height:3px;background-color:var(--dsw-alias-brand-primary);background-repeat:repeat;background-size:cover,430px auto;opacity:.72}',
      '.dswv-bar{flex:none;display:flex;align-items:center;gap:6px;height:34px;padding:0 8px;border-bottom:.5px solid var(--dsw-alias-border-l1)}',
      '.dswv-dot{width:7px;height:7px;border-radius:50%;flex:none;background:var(--dsw-alias-state-idle-primary)}',
      '.dswv-dot[data-tone="ok"]{background:var(--dsw-alias-state-success-primary)}',
      '.dswv-dot[data-tone="err"]{background:var(--dsw-alias-state-error-primary)}',
      '.dswv-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:46%}',
      '.dswv-status{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dswv-grow{flex:1;min-width:0}',
      '.dswv-icon{width:26px;height:26px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.dswv-icon:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.dswv-icon:disabled{color:var(--dsw-alias-state-idle-primary);cursor:default}',
      '.dswv-icon svg{width:15px;height:15px;display:block}',
      '.dswv-capturebar{flex:none;display:flex;align-items:center;gap:3px;padding:3px 6px 5px;border-bottom:.5px solid var(--dsw-alias-border-l1)}',
      '.dswv-capturelabel{padding:0 3px 0 2px;color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}',
      '.dswv-chip{flex:1;min-width:0;height:25px;padding:0 6px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}',
      '.dswv-chip:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.dswv-chip:disabled{color:var(--dsw-alias-state-idle-primary);cursor:default}',
      '.dswv-notice{flex:none;display:flex;align-items:flex-start;gap:6px;padding:5px 8px;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dswv-notice span{flex:1;min-width:0}',
      '.dswv-notice button{flex:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;padding:0 2px}',
      '.dswv-notice svg{width:12px;height:12px;display:block}',
      '.dswv-authhint{flex:none;padding:5px 9px;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}',
      '.dswv-capture{flex:none;display:flex;flex-direction:column;gap:5px;padding:6px 8px 8px;border-bottom:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}',
      '.dswv-capturehead{display:flex;align-items:center;gap:4px;min-width:0}',
      '.dswv-capturemeta{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px}',
      '.dswv-small{flex:none;height:24px;padding:0 7px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer}',
      '.dswv-small:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.dswv-small[data-primary]{color:var(--dsw-alias-brand-primary);font-weight:600}',
      '.dswv-small[data-primary]:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary)}',
      '.dswv-preview{box-sizing:border-box;width:100%;min-height:56px;max-height:112px;resize:vertical;padding:6px 8px;border:.5px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;line-height:1.5}',
      '.dswv-stage{position:relative;flex:1;min-height:0;background:var(--dsw-alias-bg-base)}',
      '.dswv-host{position:absolute;inset:0;display:flex;min-width:0;min-height:0}',
      '.dswv-webview{display:flex;width:100%;height:100%;min-width:0;min-height:0;background:var(--dsw-alias-bg-base)}',
      '.dswv-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;text-align:center;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary)}',
      '.dswv-cover strong{color:var(--dsw-alias-label-primary);font-size:13px}',
      '.dswv-cover p{max-width:300px;margin:0;font-size:12px;line-height:1.6}',
      '.dswv-cover code{font:inherit;color:var(--dsw-alias-label-primary);word-break:break-all}',
      '.dswv-cover svg{width:28px;height:28px;display:block;color:var(--dsw-alias-label-secondary)}',
      '.dswv-cover button{height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-brand-primary);border-radius:6px;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:12px;cursor:pointer}',
      '.dswv-spinner{width:16px;height:16px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:dswv-spin .8s linear infinite}',
      '@keyframes dswv-spin{to{transform:rotate(360deg)}}',
    ].join('');

    const HEADER_CSS = [
      '.dswv-open{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}',
      '.dswv-open:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.dswv-open svg{width:15px;height:15px;display:block;flex:none}',
      '.dswv-open span{white-space:nowrap}',
    ].join('');

    let rootCtx = null;

    function translator(key) {
      let active = '';
      try {
        active = String((rootCtx && rootCtx.locale && rootCtx.locale.getLocale().active) || '');
      } catch (error) {
        active = '';
      }
      const dict = active.toLowerCase().indexOf('zh') === 0 ? ZH : EN;
      return dict[key] || EN[key] || key;
    }

    /** Current locale dictionary binding, re-rendering when the host language changes. */
    function useT() {
      const locale = rootCtx && rootCtx.locale;
      const subscribe = React.useCallback((listener) => {
        if (!locale || typeof locale.subscribe !== 'function') return () => {};
        return locale.subscribe(listener);
      }, [locale]);
      const getSnapshot = React.useCallback(() => (locale ? locale.getSnapshot() : null), [locale]);
      React.useSyncExternalStore(subscribe, getSnapshot);
      if (!locale || typeof locale.bind !== 'function') return translator;
      const bound = locale.bind(NS);
      return (key) => {
        try {
          const value = bound(key);
          if (typeof value === 'string' && value !== '' && value !== key) return value;
        } catch (error) {
          /* fall back to the packaged dictionary */
        }
        return translator(key);
      };
    }

    const themeListeners = new Set();
    let cachedTokenNames = null;

    const CORE_THEME_TOKENS = [
      '--dsw-alias-bg-base',
      '--dsw-alias-bg-layer-1',
      '--dsw-alias-bg-layer-2',
      '--dsw-alias-bg-layer-3',
      '--dsw-alias-bg-overlay',
      '--dsw-alias-bg-skeleton',
      '--dsw-alias-border-l1',
      '--dsw-alias-border-l2',
      '--dsw-alias-border-l3',
      '--dsw-alias-brand-primary',
      '--dsw-alias-brand-text',
      '--dsw-alias-label-primary',
      '--dsw-alias-label-secondary',
      '--dsw-alias-label-tertiary',
      '--dsw-alias-state-error-primary',
      '--dsw-alias-state-success-primary',
      '--dsw-alias-state-warn-primary',
      '--dsw-alias-state-idle-primary',
      '--dsw-alias-interactive-bg-hover',
      '--dsw-alias-markdown-code-block',
      '--dsw-alias-markdown-inline-code',
      '--dsw-alias-scrollbar-bg-l2',
      '--dsw-alias-scrollbar-hover-l2',
      '--dsw-specific-sidebar-fill',
      '--dsw-specific-bubble',
      '--dsw-font-family',
      '--dsw-font-xxs-12',
      '--dsw-font-xs-13',
      '--dsw-font-s-14',
      '--dsw-font-s-strong-14',
      '--dsw-font-base-16',
      '--dsw-font-markdown-base',
      '--dsw-font-markdown-code',
    ];

    /** Collect every --dsw token the loaded stylesheets mention, so a third-party theme travels with the page. */
    function themeTokenNames() {
      if (cachedTokenNames !== null) return cachedTokenNames;
      const names = new Set(CORE_THEME_TOKENS);
      try {
        for (const sheet of Array.from(document.styleSheets)) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch (error) {
            continue;
          }
          const walk = (list) => {
            for (const rule of Array.from(list || [])) {
              const text = rule && rule.cssText ? rule.cssText : '';
              const matches = text.match(/--dsw-[a-zA-Z0-9_-]+/g);
              if (matches) for (const match of matches) names.add(match);
              if (rule && rule.cssRules) {
                try {
                  walk(rule.cssRules);
                } catch (error) {
                  /* an opaque nested sheet */
                }
              }
            }
          };
          walk(rules);
        }
      } catch (error) {
        /* the core tokens still cover the palette */
      }
      cachedTokenNames = Array.from(names);
      return cachedTokenNames;
    }

    /** Snapshot the active Harness theme, including a custom theme's wallpaper. */
    function collectThemeSnapshot() {
      let colorScheme = 'light';
      try {
        const theme = rootCtx && rootCtx.get ? rootCtx.get('theme') : null;
        const active = theme && typeof theme.getTheme === 'function' ? theme.getTheme().active : null;
        if (active && active.colorScheme === 'dark') colorScheme = 'dark';
      } catch (error) {
        colorScheme = 'light';
      }

      const root = document.getElementById('root');
      const nodes = [document.documentElement, document.body, root, root && root.firstElementChild].filter(Boolean);
      const styles = nodes.map((node) => getComputedStyle(node));
      const tokens = {};
      for (const name of themeTokenNames()) {
        let value = '';
        for (const style of styles) {
          const next = style.getPropertyValue(name).trim();
          if (next) value = next;
        }
        if (value) tokens[name] = value;
      }

      let wallpaper = { image: 'none', size: '', position: '', repeat: '', attachment: '', blend: '' };
      try {
        const bodyStyle = getComputedStyle(document.body);
        const htmlStyle = getComputedStyle(document.documentElement);
        const source = bodyStyle.backgroundImage !== 'none' ? bodyStyle : htmlStyle;
        wallpaper = {
          image: source.backgroundImage,
          size: source.backgroundSize,
          position: source.backgroundPosition,
          repeat: source.backgroundRepeat,
          attachment: source.backgroundAttachment,
          blend: source.backgroundBlendMode,
        };
      } catch (error) {
        /* wallpaper is optional */
      }

      return { colorScheme, tokens, wallpaper };
    }

    /**
     * Runs in the guest page. Applies the Harness palette as important inline
     * custom properties on the page body, switches DeepSeek's own dark/light
     * attribute, and paints the active theme wallpaper as a faint watermark.
     */
    function applyGuestTheme(payload) {
      const body = document.body;
      if (!body) return false;
      const dark = payload && payload.colorScheme === 'dark';
      const tokens = (payload && payload.tokens) || {};
      if (dark) body.setAttribute('data-ds-dark-theme', '');
      else body.removeAttribute('data-ds-dark-theme');
      window.__dshDeepSeekSyncDesiredDark = dark;
      if (!window.__dshDeepSeekSyncThemeObserver) {
        window.__dshDeepSeekSyncThemeObserver = true;
        try {
          new MutationObserver(() => {
            const wanted = window.__dshDeepSeekSyncDesiredDark;
            const current = document.body;
            if (!current || typeof wanted !== 'boolean') return;
            if (wanted && !current.hasAttribute('data-ds-dark-theme')) current.setAttribute('data-ds-dark-theme', '');
            if (!wanted && current.hasAttribute('data-ds-dark-theme')) current.removeAttribute('data-ds-dark-theme');
          }).observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
        } catch (error) {
          /* the attribute is still applied once */
        }
      }
      document.documentElement.style.setProperty('color-scheme', dark ? 'dark' : 'light', 'important');

      for (const name of Object.keys(tokens)) {
        if (name.indexOf('--dsw-') !== 0) continue;
        try {
          body.style.setProperty(name, tokens[name], 'important');
        } catch (error) {
          /* one unsupported token must not stop the rest */
        }
      }

      const background = tokens['--dsw-alias-bg-base'];
      const foreground = tokens['--dsw-alias-label-primary'];
      if (background) body.style.setProperty('background-color', background, 'important');
      if (foreground) body.style.setProperty('color', foreground, 'important');

      let style = document.getElementById('dsh-deepseek-web-sync-theme');
      if (!style) {
        style = document.createElement('style');
        style.id = 'dsh-deepseek-web-sync-theme';
        (document.head || document.documentElement).appendChild(style);
      }
      style.textContent = [
        'html{color-scheme:' + (dark ? 'dark' : 'light') + ';}',
        background ? 'html{background:' + background + ' !important;}' : '',
        'body{font-family:var(--dsw-font-family) !important;}',
        '::-webkit-scrollbar{width:10px;height:10px;background:transparent;}',
        '::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2);border-radius:999px;border:2px solid transparent;background-clip:content-box;}',
        '::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2);border-radius:999px;border:2px solid transparent;background-clip:content-box;}',
        '::selection{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-inverted);}',
      ].join('\n');

      let layer = document.getElementById('dsh-deepseek-web-sync-wallpaper');
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'dsh-deepseek-web-sync-wallpaper';
        (document.body || document.documentElement).appendChild(layer);
      }
      layer.style.position = 'fixed';
      layer.style.inset = '0';
      layer.style.zIndex = '2147483000';
      layer.style.pointerEvents = 'none';
      layer.style.backgroundRepeat = 'repeat';
      layer.style.backgroundAttachment = 'fixed';
      layer.style.opacity = dark ? '0.05' : '0.065';
      layer.style.mixBlendMode = dark ? 'screen' : 'multiply';

      const wallpaper = (payload && payload.wallpaper) || {};
      if (wallpaper.image && wallpaper.image !== 'none') {
        layer.style.display = 'block';
        layer.style.backgroundImage = wallpaper.image;
        layer.style.backgroundSize = wallpaper.size || 'cover';
        layer.style.backgroundPosition = wallpaper.position || '0 0';
        layer.style.backgroundRepeat = wallpaper.repeat || 'repeat';
        layer.style.backgroundAttachment = wallpaper.attachment || 'fixed';
        layer.style.backgroundBlendMode = wallpaper.blend || 'normal';
      } else {
        layer.style.display = 'none';
        layer.style.backgroundImage = 'none';
      }
      return true;
    }

    async function applyThemeToView(view) {
      if (!view) return;
      try {
        const source = '(' + applyGuestTheme.toString() + ')(' + JSON.stringify(collectThemeSnapshot()) + ')';
        await view.executeJavaScript(source, false);
      } catch (error) {
        /* a navigation can invalidate the document mid-sync */
      }
    }

    function readChromeTheme() {
      try {
        const bodyStyle = getComputedStyle(document.body);
        const htmlStyle = getComputedStyle(document.documentElement);
        const source = bodyStyle.backgroundImage !== 'none' ? bodyStyle : htmlStyle;
        return {
          image: source.backgroundImage,
          size: source.backgroundSize,
          position: source.backgroundPosition,
          repeat: source.backgroundRepeat,
          accent: getComputedStyle(document.body).getPropertyValue('--dsw-alias-brand-primary').trim(),
        };
      } catch (error) {
        return { image: 'none', size: '', position: '', repeat: '', accent: '' };
      }
    }

    function useChromeTheme() {
      const [revision, setRevision] = React.useState(0);
      React.useEffect(() => {
        const listener = () => setRevision((value) => value + 1);
        themeListeners.add(listener);
        return () => themeListeners.delete(listener);
      }, []);
      return React.useMemo(readChromeTheme, [revision]);
    }

    function readSavedAuth() {
      try {
        const raw = localStorage.getItem(AUTH_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw);
        const token = value && typeof value.token === 'string' ? value.token.trim() : '';
        if (!token || token === 'null' || token.startsWith('{') || token.indexOf('"__version"') !== -1) {
          localStorage.removeItem(AUTH_KEY);
          return null;
        }
        return {
          token,
          tokenVersion: value.tokenVersion ? String(value.tokenVersion) : '0',
          info: typeof value.info === 'string' && value.info !== '' ? value.info : null,
          infoVersion: value.infoVersion ? String(value.infoVersion) : '0',
        };
      } catch (error) {
        return null;
      }
    }

    function writeSavedAuth(token, tokenVersion, info, infoVersion) {
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          token,
          tokenVersion: String(tokenVersion || '0'),
          info: info || null,
          infoVersion: String(infoVersion || '0'),
          savedAt: Date.now(),
        }));
        return true;
      } catch (error) {
        return false;
      }
    }

    function clearSavedAuth() {
      try {
        localStorage.removeItem(AUTH_KEY);
      } catch (error) {
        /* storage may be unavailable */
      }
    }

    /**
     * Runs in the guest: read the logical values inside DeepSeek's versioned
     * storage wrappers (`{ value, __version }`), not the wrapper text itself.
     */
    function readAuthInPage() {
      const parse = (raw) => {
        if (raw == null) return { value: null, version: '0' };
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.prototype.hasOwnProperty.call(parsed, 'value')) {
            return {
              value: parsed.value,
              version: parsed.__version == null ? '0' : String(parsed.__version),
            };
          }
        } catch (error) {
          /* an older plain-string format */
        }
        return { value: raw, version: '0' };
      };
      try {
        const token = parse(localStorage.getItem('userToken'));
        const info = parse(localStorage.getItem('__appKit_userInfo'));
        return {
          token: typeof token.value === 'string' ? token.value : null,
          tokenVersion: token.version,
          info: info.value == null ? null : localStorage.getItem('__appKit_userInfo'),
          infoVersion: info.version,
        };
      } catch (error) {
        return { token: null, tokenVersion: '0', info: null, infoVersion: '0' };
      }
    }

    /** Runs in the guest: put a previous one-time login back before the app restarts. */
    function restoreAuthInPage(payload) {
      const parse = (raw) => {
        if (raw == null) return { value: null, version: '0' };
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.prototype.hasOwnProperty.call(parsed, 'value')) {
            return {
              value: parsed.value,
              version: parsed.__version == null ? '0' : String(parsed.__version),
            };
          }
        } catch (error) {
          /* an older plain-string format */
        }
        return { value: raw, version: '0' };
      };
      const wrap = (value, version) => JSON.stringify({ value, __version: String(version || '0') });
      try {
        const current = parse(localStorage.getItem('userToken'));
        if (payload && payload.token && (!current.value || current.value === 'null')) {
          localStorage.setItem('userToken', wrap(payload.token, payload.tokenVersion));
        }
        const currentInfo = parse(localStorage.getItem('__appKit_userInfo'));
        const infoEmpty = currentInfo.value == null
          || (typeof currentInfo.value === 'object' && currentInfo.value.id == null);
        if (payload && payload.info && infoEmpty) {
          localStorage.setItem('__appKit_userInfo', payload.info);
        }
        return true;
      } catch (error) {
        return false;
      }
    }

    /** Notify this Sidebar as soon as DeepSeek writes or removes its login token. */
    function watchAuthInPage() {
      try {
        if (window.__dshDeepSeekSyncAuthWatch) return;
        window.__dshDeepSeekSyncAuthWatch = true;
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function setItem(key, value) {
          const result = original.call(this, key, value);
          if (key === 'userToken' || key === '__appKit_userInfo') {
            try {
              console.info('[dsh-deepseek-web-sync] auth-changed');
            } catch (error) {
              /* console is best effort */
            }
          }
          return result;
        };
      } catch (error) {
        /* fall back to polling */
      }
    }

    const READ_AUTH_SOURCE = '(' + readAuthInPage.toString() + ')()';
    const WATCH_AUTH_SOURCE = '(' + watchAuthInPage.toString() + ')()';
    const restoreAuthSource = (payload) => '(' + restoreAuthInPage.toString() + ')(' + JSON.stringify(payload) + ')';

    function icon(path, extra) {
      return h('svg', {
        viewBox: '0 0 24 24',
        'aria-hidden': true,
        focusable: 'false',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }, path.map((d, index) => h('path', { key: index, d, ...(extra && extra[index] ? extra[index] : null) })));
    }

    const ICONS = {
      refresh: () => icon(['M20 11a8 8 0 1 0-2.3 6.7', 'M20 5v6h-6']),
      external: () => icon(['M14 4h6v6', 'M20 4l-8 8', 'M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5']),
      open: () => icon(['M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5z', 'M8 8h8', 'M8 12h5']),
      close: () => icon(['M6 6l12 12', 'M18 6 6 18']),
    };

    /**
     * Runs in the guest page. It only reads the page: current selection,
     * composer text, and the last user message in DeepSeek's message list.
     * Keep this function self-contained; it is serialized across the boundary.
     */
    function captureInPage() {
      const norm = (value) => String(value == null ? '' : value).replace(/\r\n/g, '\n').trim();
      const visible = (element) => {
        try {
          if (!element || !element.isConnected) return false;
          const rect = element.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) return false;
          const style = window.getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0;
        } catch (error) {
          return false;
        }
      };
      const textOf = (element) => norm(element ? (element.innerText || element.textContent || '') : '');
      const tidy = (value) => norm(value).replace(/\s*(?:编辑|复制|重新生成|Edit|Copy|Regenerate)\s*$/g, '').trim();
      const result = {
        selection: '',
        composer: '',
        lastQuestion: '',
        debug: { groups: 0, assistants: 0, users: 0 },
      };

      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          result.selection = norm(selection.toString());
        }
        if (!result.selection && window.__dshDeepSeekLastSelection) {
          result.selection = norm(window.__dshDeepSeekLastSelection);
        }
      } catch (error) {
        /* selection is optional */
      }

      try {
        const editables = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]')).filter(visible);
        editables.sort((left, right) => {
          const a = left.getBoundingClientRect();
          const b = right.getBoundingClientRect();
          return a.width * a.height - b.width * b.height;
        });
        const composer = editables.length === 0 ? null : editables[editables.length - 1];
        if (composer) {
          const tag = String(composer.tagName || '').toUpperCase();
          result.composer = tag === 'TEXTAREA' || tag === 'INPUT' ? norm(composer.value) : textOf(composer);
        }
      } catch (error) {
        /* composer is optional */
      }

      try {
        const groups = Array.from(document.querySelectorAll('.ds-message')).filter(visible);
        result.debug.groups = groups.length;
        if (groups.length > 0) {
          let group = groups[groups.length - 1];
          if (/assistant/i.test(String(group.className || ''))) {
            group = null;
            for (let index = groups.length - 2; index >= 0; index -= 1) {
              if (!/assistant/i.test(String(groups[index].className || ''))) {
                group = groups[index];
                break;
              }
            }
            if (group) result.lastQuestion = tidy(textOf(group));
          } else {
            const children = Array.from(group.children || []).filter(visible);
            let assistant = null;
            for (const child of children) {
              if (/assistant/i.test(String(child.className || '')) || child.querySelector('[class*="assistant" i]')) {
                assistant = child;
              }
            }
            for (const child of children) {
              if (child === assistant) continue;
              if (child.querySelector('.ds-markdown, .markdown, .prose')) continue;
              const text = tidy(textOf(child));
              if (text.length > 1) {
                result.lastQuestion = text;
                break;
              }
            }
          }
        }
      } catch (error) {
        /* message extraction is optional */
      }

      try {
        if (!result.lastQuestion) {
          const assistants = Array.from(document.querySelectorAll('[class*="assistant" i]')).filter(visible);
          result.debug.assistants = assistants.length;
          const lastAssistant = assistants.length === 0 ? null : assistants[assistants.length - 1];
          if (lastAssistant) {
            let node = lastAssistant;
            for (let hop = 0; node && hop < 6 && !result.lastQuestion; hop += 1) {
              let sibling = node.previousElementSibling;
              for (let step = 0; sibling && step < 10; step += 1) {
                if (visible(sibling)) {
                  const text = tidy(textOf(sibling));
                  if (text.length > 1) {
                    result.lastQuestion = text;
                    break;
                  }
                }
                sibling = sibling.previousElementSibling;
              }
              node = node.parentElement;
            }
          }
        }
      } catch (error) {
        /* fallback is optional */
      }

      try {
        if (!result.lastQuestion) {
          const users = Array.from(document.querySelectorAll('[class*="user" i]')).filter(visible);
          result.debug.users = users.length;
          for (let index = users.length - 1; index >= 0; index -= 1) {
            const element = users[index];
            if (element.querySelector('[class*="assistant" i]')) continue;
            const text = tidy(textOf(element));
            if (text.length > 1 && text.length < 6000) {
              result.lastQuestion = text;
              break;
            }
          }
        }
      } catch (error) {
        /* fallback is optional */
      }

      return result;
    }

    /** Keep the last non-empty selection because clicking this toolbar moves focus out of the guest. */
    function installSelectionMonitor() {
      if (window.__dshDeepSeekSelectionMonitor) return;
      window.__dshDeepSeekSelectionMonitor = true;
      window.__dshDeepSeekLastSelection = '';
      document.addEventListener('selectionchange', () => {
        try {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const text = String(selection).trim();
            if (text) window.__dshDeepSeekLastSelection = text;
          }
        } catch (error) {
          /* best effort */
        }
      }, true);
    }

    const CAPTURE_SOURCE = '(' + captureInPage.toString() + ')()';
    const MONITOR_SOURCE = '(' + installSelectionMonitor.toString() + ')()';

    function statusTone(phase, authState) {
      if (phase === 'ready') return authState === 'saved' || authState === 'restoring' ? 'ok' : 'wait';
      if (phase === 'error' || phase === 'unsupported') return 'err';
      return 'wait';
    }

    function DeepSeekPanel(props) {
      const t = useT();
      const chromeTheme = useChromeTheme();
      const hostRef = React.useRef(null);
      const viewRef = React.useRef(null);
      const previewRef = React.useRef(null);
      const mountedRef = React.useRef(true);
      const emptyAuthPolls = React.useRef(0);
      const [phase, setPhase] = React.useState('starting');
      const [authState, setAuthState] = React.useState('checking');
      const [captured, setCaptured] = React.useState('');
      const [source, setSource] = React.useState('');
      const [notice, setNotice] = React.useState('');
      const [busy, setBusy] = React.useState(false);

      const updateAuth = React.useCallback(async (target) => {
        if (!mountedRef.current || !target) return null;
        try {
          const raw = await target.executeJavaScript(READ_AUTH_SOURCE, false);
          if (!mountedRef.current) return null;
          const token = raw && typeof raw.token === 'string' && raw.token !== '' && raw.token !== 'null' ? raw.token : '';
          if (token) {
            emptyAuthPolls.current = 0;
            const saved = readSavedAuth();
            if (!saved
              || saved.token !== token
              || saved.tokenVersion !== String(raw.tokenVersion || '0')
              || (saved.info || null) !== (raw.info || null)) {
              writeSavedAuth(token, raw.tokenVersion || '0', raw.info || null, raw.infoVersion || '0');
            }
            setAuthState('saved');
            return { token, info: raw.info || null };
          }
          emptyAuthPolls.current += 1;
          if (emptyAuthPolls.current >= 3) {
            clearSavedAuth();
            setAuthState('none');
          }
          return { token: '', info: raw ? raw.info || null : null };
        } catch (error) {
          return null;
        }
      }, []);

      React.useEffect(() => {
        const host = hostRef.current;
        const bridge = window.dshDesktop && window.dshDesktop.browser;
        if (!host) return undefined;
        if (!bridge || typeof bridge.acquire !== 'function' || typeof bridge.release !== 'function') {
          setPhase('unsupported');
          return undefined;
        }

        mountedRef.current = true;
        let disposed = false;
        let view = null;
        let lease = null;
        let pageRequested = false;
        let tokenRestored = false;
        let poll = null;

        const afterPageLoad = async () => {
          if (!view || disposed) return;
          await applyThemeToView(view);
          view.executeJavaScript(WATCH_AUTH_SOURCE, false).catch(() => {});
          const saved = readSavedAuth();
          let auth = null;
          try {
            auth = await view.executeJavaScript(READ_AUTH_SOURCE, false);
          } catch (error) {
            auth = null;
          }
          if (disposed) return;
          const hasToken = auth && typeof auth.token === 'string' && auth.token !== '' && auth.token !== 'null';
          if (!tokenRestored) {
            tokenRestored = true;
            if (saved && saved.token && !hasToken) {
              setAuthState('restoring');
              emptyAuthPolls.current = 0;
              let restored = false;
              try {
                restored = await view.executeJavaScript(restoreAuthSource(saved), false);
              } catch (error) {
                restored = false;
              }
              if (restored && !disposed) {
                try {
                  view.reload();
                } catch (error) {
                  clearSavedAuth();
                  setAuthState('none');
                }
                return;
              }
              clearSavedAuth();
              setAuthState('none');
            }
          }
          const current = await updateAuth(view);
          if (!current || !current.token) {
            if (!saved) setAuthState('none');
            else if (tokenRestored && !hasToken) {
              /* Keep the restoring label briefly; the poll clears an invalid saved login. */
            }
          }
        };

        const syncGuestTheme = () => {
          if (!disposed && view) void applyThemeToView(view);
        };
        themeListeners.add(syncGuestTheme);

        const load = async () => {
          setPhase('starting');
          try {
            const reservation = await bridge.acquire('dsh-deepseek-web-sync');
            if (disposed) {
              bridge.release(reservation.lease).catch(() => {});
              return;
            }
            lease = reservation.lease;
            view = document.createElement('webview');
            view.className = 'dswv-webview';
            view.setAttribute('name', reservation.lease);
            view.setAttribute('partition', reservation.partition);
            view.setAttribute('src', 'about:blank#' + reservation.lease);
            view.dataset.deepseekWebFrame = 'webview';
            viewRef.current = view;

            view.addEventListener('dom-ready', () => {
              if (disposed || pageRequested) return;
              pageRequested = true;
              setPhase('loading');
              view.loadURL(START_URL).catch((error) => {
                if (disposed) return;
                if (error && error.code === 'ERR_ABORTED') return;
                console.error('[deepseek-web-sync] loadURL failed', error);
                setPhase('error');
                setNotice(t('notice.loadFailed'));
              });
            });

            view.addEventListener('did-finish-load', () => {
              if (disposed || !pageRequested) return;
              let url = '';
              try {
                url = String(view.getURL() || '');
              } catch (error) {
                url = '';
              }
              if (!/^https?:/i.test(url)) return;
              setPhase('ready');
              setNotice('');
              view.executeJavaScript(MONITOR_SOURCE, false).catch(() => {});
              void afterPageLoad();
            });

            view.addEventListener('did-fail-load', (event) => {
              if (disposed) return;
              if (event && (event.errorCode === -3 || event.isMainFrame === false)) return;
              setPhase('error');
              setNotice(t('notice.loadFailed'));
            });

            view.addEventListener('render-process-gone', () => {
              if (disposed) return;
              setPhase('error');
              setNotice(t('notice.crashed'));
            });

            view.addEventListener('console-message', (event, level, message) => {
              const text = event && typeof event === 'object' && typeof event.message === 'string' ? event.message : message;
              if (text === '[dsh-deepseek-web-sync] auth-changed') void updateAuth(view);
            });

            host.replaceChildren(view);

            poll = setInterval(() => {
              if (!disposed && pageRequested && view) void updateAuth(view);
            }, AUTH_POLL_MS);
          } catch (error) {
            console.error('[deepseek-web-sync] guest mount failed', error);
            if (!disposed) {
              setPhase('error');
              setNotice(t('notice.guestFailed'));
            }
          }
        };

        load();

        return () => {
          disposed = true;
          mountedRef.current = false;
          themeListeners.delete(syncGuestTheme);
          if (poll !== null) clearInterval(poll);
          const element = view;
          viewRef.current = null;
          if (element) {
            try {
              element.remove();
            } catch (error) {
              /* already gone */
            }
          }
          if (lease) bridge.release(lease).catch(() => {});
        };
        // The guest belongs to this mounted occurrence, not to a changing translator.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const refresh = React.useCallback(() => {
        const view = viewRef.current;
        if (!view) return;
        setNotice('');
        setPhase('loading');
        try {
          view.reload();
        } catch (error) {
          console.error('[deepseek-web-sync] reload failed', error);
          setPhase('error');
          setNotice(t('notice.loadFailed'));
        }
      }, [t]);

      const capture = React.useCallback(async (kind) => {
        const view = viewRef.current;
        if (!view) return;
        setBusy(true);
        setNotice('');
        try {
          const raw = await view.executeJavaScript(CAPTURE_SOURCE, true);
          const data = raw && typeof raw === 'object' ? raw : {};
          let value = '';
          if (kind === 'selection') value = data.selection || '';
          else if (kind === 'composer') value = data.composer || '';
          else value = data.lastQuestion || '';
          value = String(value).replace(/\r\n/g, '\n').trim();
          if (!value) {
            setNotice(t(kind === 'selection' ? 'notice.selectionEmpty' : kind === 'composer' ? 'notice.composerEmpty' : 'notice.recentEmpty'));
            return;
          }
          let truncated = false;
          if (value.length > MAX_CAPTURE) {
            value = value.slice(0, MAX_CAPTURE);
            truncated = true;
          }
          setCaptured(value);
          setSource(kind);
          setNotice((truncated ? t('notice.truncated') + ' ' : '') + t('notice.captured'));
        } catch (error) {
          console.error('[deepseek-web-sync] capture failed', error);
          setNotice(t('notice.captureFailed'));
        } finally {
          setBusy(false);
        }
      }, [t]);

      const insert = React.useCallback(() => {
        const text = captured.trim();
        if (!text) return;
        const actions = props.inputActions;
        if (!actions || typeof actions.captureInsertion !== 'function' || typeof actions.insertText !== 'function') {
          setNotice(t('notice.composerUnavailable'));
          return;
        }
        const payload = text.endsWith('\n') ? text : text + '\n';
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const span = actions.captureInsertion();
            if (span && actions.insertText(payload, span)) {
              setNotice(t('notice.inserted'));
              setCaptured('');
              setSource('');
              return;
            }
          } catch (error) {
            console.warn('[deepseek-web-sync] insert failed', error);
            break;
          }
        }
        setNotice(t('notice.insertFailed'));
      }, [captured, props.inputActions, t]);

      const copy = React.useCallback(async () => {
        if (!captured) return;
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(captured);
            setNotice(t('notice.copied'));
            return;
          }
        } catch (error) {
          /* fall through to the textarea path */
        }
        const area = previewRef.current;
        if (area) {
          area.focus();
          area.select();
          try {
            if (document.execCommand('copy')) {
              setNotice(t('notice.copied'));
              return;
            }
          } catch (error) {
            /* fall through */
          }
        }
        setNotice(t('notice.copyFailed'));
      }, [captured, t]);

      const ready = phase === 'ready';
      const sourceLabel = source ? t('source.' + source) : '';
      const authText = authState === 'saved' ? t('auth.saved') : authState === 'restoring' ? t('auth.restoring') : t('auth.loginOnce');
      const statusText = phase === 'ready' ? authText : t('status.' + phase);
      const stripStyle = chromeTheme.image && chromeTheme.image !== 'none'
        ? {
            backgroundImage: chromeTheme.image,
            backgroundSize: chromeTheme.size || 'cover',
            backgroundPosition: chromeTheme.position || '0 0',
            backgroundRepeat: chromeTheme.repeat || 'repeat',
          }
        : {
            backgroundColor: chromeTheme.accent || 'var(--dsw-alias-brand-primary)',
            backgroundImage: 'none',
          };

      return h('div', { className: 'dswv-root' },
        h('style', null, PANEL_CSS),
        h('div', { className: 'dswv-strip', 'aria-hidden': true, style: stripStyle }),
        h('div', { className: 'dswv-bar' },
          h('span', { className: 'dswv-dot', 'data-tone': statusTone(phase, authState) }),
          h('span', { className: 'dswv-title' }, t('panel.title')),
          h('span', { className: 'dswv-status', title: statusText }, statusText),
          h('span', { className: 'dswv-grow' }),
          h('button', {
            type: 'button',
            className: 'dswv-icon',
            title: t('action.refresh'),
            'aria-label': t('action.refresh'),
            disabled: !ready,
            onClick: refresh,
          }, ICONS.refresh()),
        ),
        h('div', { className: 'dswv-capturebar' },
          h('span', { className: 'dswv-capturelabel' }, t('capture.label')),
          h('button', {
            type: 'button',
            className: 'dswv-chip',
            disabled: !ready || busy,
            title: t('source.selection'),
            onClick: () => { void capture('selection'); },
          }, t('action.selection')),
          h('button', {
            type: 'button',
            className: 'dswv-chip',
            disabled: !ready || busy,
            title: t('source.composer'),
            onClick: () => { void capture('composer'); },
          }, t('action.composer')),
          h('button', {
            type: 'button',
            className: 'dswv-chip',
            disabled: !ready || busy,
            title: t('source.recent'),
            onClick: () => { void capture('recent'); },
          }, t('action.recent')),
        ),
        ready && authState === 'none' ? h('div', { className: 'dswv-authhint' }, t('auth.hint')) : null,
        notice ? h('div', { className: 'dswv-notice' },
          h('span', null, notice),
          h('button', {
            type: 'button',
            title: t('action.dismiss'),
            'aria-label': t('action.dismiss'),
            onClick: () => setNotice(''),
          }, ICONS.close()),
        ) : null,
        captured ? h('div', { className: 'dswv-capture' },
          h('div', { className: 'dswv-capturehead' },
            h('span', { className: 'dswv-capturemeta', title: sourceLabel + ' · ' + captured.length },
              sourceLabel + ' · ' + captured.length),
            h('button', {
              type: 'button',
              className: 'dswv-small',
              title: t('action.copy'),
              onClick: () => { void copy(); },
            }, t('action.copy')),
            h('button', {
              type: 'button',
              className: 'dswv-small',
              title: t('action.clear'),
              onClick: () => { setCaptured(''); setSource(''); },
            }, t('action.clear')),
            h('button', {
              type: 'button',
              className: 'dswv-small',
              'data-primary': '',
              title: t('action.insert'),
              onClick: insert,
            }, t('action.insert')),
          ),
          h('textarea', {
            ref: previewRef,
            className: 'dswv-preview',
            value: captured,
            rows: 3,
            spellCheck: false,
            'aria-label': t('preview.label'),
            onChange: (event) => setCaptured(event.currentTarget.value),
          }),
        ) : null,
        h('div', { className: 'dswv-stage' },
          h('div', { className: 'dswv-host', ref: hostRef }),
          phase === 'unsupported' ? h('div', { className: 'dswv-cover' },
            ICONS.open(),
            h('strong', null, t('unsupported.title')),
            h('p', null, t('unsupported.body')),
          ) : null,
          phase === 'starting' || phase === 'loading' ? h('div', { className: 'dswv-cover' },
            h('span', { className: 'dswv-spinner' }),
            h('strong', null, phase === 'starting' ? t('status.starting') : t('status.loading')),
            h('p', null, 'chat.deepseek.com'),
          ) : null,
          phase === 'error' ? h('div', { className: 'dswv-cover' },
            h('strong', null, t('status.error')),
            h('p', null, t('notice.loadFailed')),
            h('button', {
              type: 'button',
              onClick: refresh,
            }, t('action.refresh')),
          ) : null,
        ),
      );
    }

    function OpenButton() {
      const t = useT();
      const sidebar = rootCtx && rootCtx.get ? rootCtx.get('sidebarRight') : null;
      const open = () => {
        if (!sidebar || typeof sidebar.openTab !== 'function') return;
        try {
          sidebar.openTab(KIND);
        } catch (error) {
          console.warn('[deepseek-web-sync] openTab failed', error);
        }
      };
      return h(React.Fragment, null,
        h('style', null, HEADER_CSS),
        h('button', {
          type: 'button',
          className: 'dswv-open',
          title: t('open.title'),
          'aria-label': t('open.title'),
          onClick: open,
        }, ICONS.open(), h('span', null, t('open.short'))),
      );
    }

    function armAutoOpen(ctx, sidebar) {
      let disposed = false;
      let attempts = 0;
      let lastSession = '';
      let timer = null;
      let unsubscribe = null;
      const done = new Set();

      const attempt = () => {
        if (disposed) return;
        const sessionId = sidebar.mounted.getSnapshot();
        if (!sessionId) return;
        if (sessionId !== lastSession) {
          lastSession = sessionId;
          attempts = 0;
        }
        if (done.has(sessionId)) return;
        let alreadyDone = false;
        try {
          alreadyDone = sessionStorage.getItem(AUTO_PREFIX + sessionId) === '1';
        } catch (error) {
          alreadyDone = false;
        }
        if (alreadyDone) {
          done.add(sessionId);
          return;
        }
        try {
          sidebar.openTab(KIND);
          done.add(sessionId);
          try {
            sessionStorage.setItem(AUTO_PREFIX + sessionId, '1');
          } catch (error) {
            /* this run still remembers it in `done` */
          }
          attempts = 0;
          return;
        } catch (error) {
          if (attempts >= 20) {
            console.warn('[deepseek-web-sync] auto-open failed', error);
            return;
          }
          attempts += 1;
          timer = setTimeout(attempt, 250);
        }
      };

      unsubscribe = sidebar.mounted.subscribe(attempt);
      attempt();
      ctx.effect(() => () => {
        disposed = true;
        if (timer !== null) clearTimeout(timer);
        if (unsubscribe) unsubscribe();
      }, 'deepseek-web-sync: auto open');
    }

    return {
      inject: ['slots', 'locale', 'theme'],
      apply(ctx) {
        rootCtx = ctx;
        const tabs = ctx.get('sidebarRightTabs');
        const sidebar = ctx.get('sidebarRight');
        if (!tabs || !sidebar) {
          console.error('[deepseek-web-sync] right Sidebar services are unavailable');
          return;
        }

        ctx.effect(() => ctx.locale.register(NS, { en: EN, zh: ZH }), 'deepseek-web-sync: locale');

        ctx.effect(() => {
          const broadcast = () => {
            cachedTokenNames = null;
            for (const listener of Array.from(themeListeners)) {
              try {
                listener();
              } catch (error) {
                /* one listener must not stop the rest */
              }
            }
          };
          const offTheme = ctx.on('theme/change', broadcast);
          const offLocale = ctx.on('locale/change', broadcast);
          return () => {
            if (typeof offTheme === 'function') offTheme();
            if (typeof offLocale === 'function') offLocale();
          };
        }, 'deepseek-web-sync: theme bridge');

        const bound = ctx.locale.bind(NS);
        const t = (key) => {
          try {
            const value = bound(key);
            if (typeof value === 'string' && value !== '' && value !== key) return value;
          } catch (error) {
            /* packaged fallback */
          }
          return translator(key);
        };

        ctx.effect(() => tabs.register({
          id: TYPE_ID,
          kind: KIND,
          priority: 'extension',
          title: () => t('tab.title'),
          guide: [{
            id: 'deepseek-web',
            kind: KIND,
            title: t('tab.title'),
            description: t('guide.description'),
            order: 20,
          }],
          keepMounted: true,
        }), 'deepseek-web-sync: tab type');

        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: TYPE_ID,
        }, DeepSeekPanel));

        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: 'deepseek-web.open',
          order: 40,
        }, OpenButton));

        if (window.dshDesktop && window.dshDesktop.browser) armAutoOpen(ctx, sidebar);
      },
    };
  },
});
