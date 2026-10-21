# DeepSeek 网页版侧栏 · 同步

<p align="center">
  <img src="./icon.svg" width="96" height="96" alt="DeepSeek 网页版侧栏图标">
</p>

<p align="center">
  把 DeepSeek 网页版常驻在 DeepSeek Harness 主对话右侧。<br>
  左边用 Harness 的 DeepSeek API 对话，右边用 DeepSeek 网页版；主题、登录和提问都尽量连在一起。
</p>

> **技术来源 / Author：ZCFE327**
>
> 一个面向 DeepSeek Harness Desktop 的右侧栏插件：不使用 iframe、不弹外部链接、不代理聊天内容，用 Electron 隔离 `webview` 承载真实网页版，并把主题、登录态和提问文本接入 Harness。

[GitHub 仓库](https://github.com/S-anZZz/dsh-deepseek-web-sync) · [快速开始](QUICKSTART.md) · [详细设计文章](docs/ARTICLE.md)

---

## 目录

- [为什么做这个插件](#为什么做这个插件)
- [功能一览](#功能一览)
- [安装](#安装)
- [使用](#使用)
- [同步机制](#同步机制)
- [架构](#架构)
- [安全边界](#安全边界)
- [已知限制](#已知限制)
- [开发](#开发)
- [技术来源](#技术来源)

---

## 为什么做这个插件

DeepSeek API 适合在 Harness 里执行任务，DeepSeek 网页版则保留了完整的聊天体验、历史会话和网页端能力。过去要在两者之间切换，通常需要：

- 在 Harness 和浏览器之间来回切窗口；
- 把网页里的问题复制出来，再粘贴到 Harness；
- 手动把 Harness 的深色模式、主题色和网页版对齐；
- 每次启动重新登录网页版；
- 处理网页的 `X-Frame-Options`、弹窗和外部浏览器跳转。

这个插件把上述动作收进一个右侧栏标签：打开 Harness 时网页版自动出现，主题跟随 Harness，网页登录只需一次，选中的提问可以直接进入 Harness 输入框。

## 功能一览

| 能力 | 行为 |
| --- | --- |
| 右侧栏常驻 | 注册为右侧栏原生 Tab，不占用主对话，不覆盖 Harness 自带面板 |
| 自动打开 | 每个会话第一次进入时自动打开；手动关闭后当前运行期间不反复打扰，下次启动再次打开 |
| 真实网页版 | 使用 Electron 隔离 `webview` 加载 `chat.deepseek.com`，不是仿制 UI，也不是 iframe |
| 不弹链接 | 不申请 guest 弹窗权限，不提供“在浏览器中打开”入口，新窗口请求被忽略 |
| 主题同步 | 读取 Harness 当前 `--dsw-*` token，覆盖网页配色、字体、明暗模式和强调色 |
| 美化插件同步 | 第三方主题通过 `theme.overrideTokens` 写入的 token 会自动进入同步范围 |
| 壁纸同步 | Harness 页面壁纸作为浅水印进入网页，顶部还有一条同款纹理细条 |
| 登录保持 | 捕获 DeepSeek 网页版自己的版本化登录存储，下次启动自动恢复 |
| 提问带入 | 抓取网页选区、输入框文本或最近一条提问，编辑后填入当前 Harness 输入框 |
| 纯文本桥 | 只有用户主动抓取的文本越过 guest 边界，不上传页面内容，不注入 Node 权限 |

## 安装

> 换电脑安装、首次登录和常见问题，见 [QUICKSTART.md](QUICKSTART.md)。

### 环境

- DeepSeek Harness **Desktop**（Electron 外壳）；
- 已启用右侧栏和 Web Client；
- 建议使用与插件开发时相同或更新的 DSH Desktop。

> 普通浏览器中的 Harness Web 没有隔离 `webview` 能力。插件会在面板里说明“仅桌面版”，不会偷偷打开外部浏览器。

### 从本地目录安装

1. 下载或克隆本仓库到本地目录：

   ```bash
   git clone https://github.com/S-anZZz/dsh-deepseek-web-sync.git
   ```
2. 在 Harness 的 **插件管理** 中选择从本地目录安装，或调用：

   ```text
   plugin_manager install_bundle <本仓库绝对路径>
   ```

3. 安装完成后插件会自动启用；每个会话第一次打开时，右侧栏会出现 **DeepSeek 网页版**。
4. 若标签被手动关闭，点对话标题栏右侧的 **网页版** 按钮，或在右侧栏标签条的 **+** 中选择 **DeepSeek 网页版**。

本插件没有构建步骤，也没有 npm 运行时依赖；`package.json` 直接声明 `dsh.bundle.patch` 和 `dsh.client`。

## 使用

1. **首次登录**：在右侧网页中用你平时使用的 DeepSeek 账号登录一次。
2. **正常提问**：右侧网页版可以像浏览器一样使用；左侧 Harness 继续使用 DeepSeek API。
3. **抓取提问**：
   - 在网页中选中文字 → 顶部 **选区**；
   - 或点 **输入框** 抓取网页输入框里的内容；
   - 或点 **最近提问** 尝试读取最后一条用户消息。
4. **检查并带入**：抓取结果进入可编辑预览，确认后点 **填入当前对话**。文字会进入左侧 Harness 输入框，不会自动发送。
5. **再次打开**：关闭标签后，点标题栏 **网页版**，或右侧栏 **+** → **DeepSeek 网页版**。

## 同步机制

### 1. 主题 token 同步

DeepSeek 网页版和 Harness 使用同一套 `--dsw-*` 设计变量命名。插件在 Harness 侧读取当前 `:root`、`body`、`#root` 上的实际计算值，并把它们以内联 `!important` 自定义属性写入 guest 的 `<body>`：

- 背景、层级背景、边框、文字、品牌色、状态色、滚动条；
- 字体族、字号、行高；
- `--dsw-specific-*` 之类的页面专用 token。

同时根据 Harness 当前主题的 `colorScheme` 切换网页自己的 `body[data-ds-dark-theme]` 属性，并监听 `theme/change` 事件。切换主题、切换明暗模式或启用/禁用美化插件时，网页会重新同步。

### 2. 壁纸与视觉衔接

Harness 的美化插件可能通过 `shell.overlay` 给 `body` 设置壁纸。插件读取当前页面的 `background-image`，将其以低透明度水印叠加到 guest 页面，并在插件标签顶部绘制一条同款纹理细条。它不改变网页布局，也不牺牲正文可读性。

### 3. 登录保持

DeepSeek 网页版把登录态存在自己的版本化 localStorage 包装里：

```json
{ "value": "<token>", "__version": "0" }
```

插件只读取包装里的逻辑值，不保存包装文本本身。登录后把 token 和账号信息写入 Harness 本机数据；下次打开页面时，如果 guest 还没有登录态，就把 token 写回同样的版本化包装并刷新一次页面。登录、退出和账号切换通过 `Storage.prototype.setItem` 钩子与轮询共同感知。

### 4. 自动打开与无弹窗

- 插件通过右侧栏控制器的 `openTab('deepseek-web')` 打开标签；
- 当前会话用 `sessionStorage` 标记“本次运行已自动打开”，因此手动关闭不会被反复拉起；
- 不设置 `allowpopups`，不注册外部打开入口；网页的新窗口请求被忽略，右侧视图保持不变。

## 架构

```text
┌──────────────────────────── Harness Desktop ────────────────────────────┐
│                                                                          │
│  ┌──────────────┐      ┌────────────────────────────┐                   │
│  │ Conversation │      │ Right Sidebar              │                   │
│  │  (API chat)  │      │  ┌──────────────────────┐  │                   │
│  │              │      │  │ DeepSeek Web tab     │  │                   │
│  │  composer ◄──┼──────┼──┤ capture preview      │  │                   │
│  │              │ text │  │ isolated <webview> ──┼──┼──► chat.deepseek  │
│  └──────────────┘      │  └──────────────────────┘  │      .com         │
│         ▲              └────────────────────────────┘                   │
│         │ theme/change + tokens         ▲ auth token restore             │
│  ┌──────┴───────┐              ┌────────┴─────────┐                      │
│  │ Theme service│              │ local auth store │                      │
│  └──────────────┘              └──────────────────┘                      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 组成

- **Host 半部** `index.js`
  - 只导出空 `apply()`；本插件不需要 Host 资源、模型工具或额外服务。
- **Client 半部** `client.js`
  - 注册右侧栏 tab 类型 `deepseek-web`；
  - 在 `sidebar.right.pane.tab` 注册面板组件；
  - 通过 `window.dshDesktop.browser.acquire()` 获取隔离 guest lease；
  - 管理主题桥、登录保持、抓取、预览和 `inputActions` 插入；
  - 在会话标题栏 utilities 注册“网页版”入口。

### 关键接入点

| 能力 | 使用到的 Harness 接口 |
| --- | --- |
| 右侧栏标签 | `ctx.get('sidebarRightTabs').register(...)` |
| 打开/聚焦标签 | `ctx.get('sidebarRight').openTab('deepseek-web')` |
| 标签正文 | `sidebar.right.pane.tab` 槽位，按类型 id 注册 |
| 标题栏入口 | `conversation.session.header.utilities` |
| 隔离网页 | `window.dshDesktop.browser.acquire/release` + `<webview>` |
| 主题 | `ctx.get('theme').getTheme()` + `theme/change` |
| 填入输入框 | 槽位标准属性 `inputActions.captureInsertion()` / `insertText()` |

## 安全边界

- guest 由 Desktop 主进程强制为 `nodeIntegration: false`、`contextIsolation: true`、`sandbox: true`；
- 插件页面不能读取 guest 的 DOM，只有 `executeJavaScript` 返回的纯文本/JSON 进入 Harness renderer；
- 不注入 preload，不把 Harness 的 Node 能力暴露给 `chat.deepseek.com`；
- 不代理、不转发整页内容；抓取只发生在用户点击按钮时；
- 不把 Harness 的 API 凭证写入网页；
- 不启用 guest 弹窗，不打开系统浏览器；
- 登录 token 只写入本机 Harness localStorage，并只在恢复 `chat.deepseek.com` 登录态时使用。

## 已知限制

1. **仅 Desktop**：依赖 Electron 的隔离 `webview` 和 Desktop preload 桥；普通 Web 页面无法使用。
2. **账号体系独立**：Harness 的 API 授权与 `chat.deepseek.com` 的网页登录不是同一套 token。插件不会读取或转发 Harness 账号凭据；实际体验是“同一个 DeepSeek 账号在网页里登录一次，之后自动保持”。真正的静默 SSO 需要 DeepSeek 提供网页 token 兑换接口。
3. **网页结构可能变化**：DeepSeek 调整 DOM 或登录存储格式后，“最近提问”可能失效；**选区**抓取是最稳定的路径。
4. **登录令牌保存在本机**：这是“登录一次”的代价。若在网页里退出登录，插件会在轮询确认后清除保存的令牌；如果令牌过期，重新登录一次即可。
5. **视觉同步是 token/壁纸级别**：它不会复制 Harness 的 React 组件或第三方主题专属插画；网页仍保留 DeepSeek 自己的信息架构。

## 开发

```text
.
├── client.js           # 浏览器半部：标签、webview、主题、登录、抓取
├── index.js            # Host 半部：空实现
├── cordis.patch.yml    # bundle patch
├── locale/en.json      # 插件显示英文
├── locale/zh.json      # 插件显示中文
├── icon.svg            # 插件图标
└── docs/ARTICLE.md     # 详细设计与实现文章
```

没有构建步骤。修改 `client.js` 后：

1. 用 `node --check client.js` 做语法检查；
2. 通过插件管理重新安装/重载 bundle；
3. 在 Desktop 里确认右侧栏标签、主题同步、抓取和填入输入框。

## 技术来源

**技术来源：ZCFE327**

本项目由 ZCFE327 设计与实现。插件建立在 DeepSeek Harness 公开的 Cordis 插件体系、右侧栏 Tab 域、槽位系统和 Electron 隔离 `webview` 桥之上；DeepSeek 网页版、Harness 及其相关商标归各自权利人所有。
