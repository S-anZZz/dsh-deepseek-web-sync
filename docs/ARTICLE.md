# 让 API 与网页版坐在同一张桌子上

## 记一个 DeepSeek Harness 右侧栏插件的设计与实现

> **技术来源：ZCFE327**
>
> 本文介绍 `DeepSeek 网页版侧栏 · 同步` 的设计取舍、关键实现和边界。它不是一份“如何把网页塞进 iframe”的教程，而是一次把外部网页、Harness 主题、登录态和输入框桥接在一起的工程记录。

---

## 一、起点：两个 DeepSeek，隔着一条任务栏

DeepSeek Harness 的主对话由 DeepSeek API 驱动，适合让 Agent 读写文件、执行命令、处理工作区任务。DeepSeek 网页版则保留了另一种体验：完整的聊天历史、网页端交互、账号侧的会话记录，以及一些只存在于网页端的功能。

这两者并不冲突。真正的问题是它们被放在了两个窗口里。

用户经常要经历这样一条路径：

1. 在 Harness 里发现一个问题；
2. 切到浏览器，打开 `chat.deepseek.com`；
3. 把问题重新组织一遍，发给网页版；
4. 把网页版的答案复制回来；
5. 再切回 Harness，继续让 Agent 执行；
6. 如果 Harness 换了主题，网页版仍然是另一套颜色；
7. 下次启动，还要重新登录网页版。

每一个步骤都不难，但加在一起，工作流就被切碎了。

这个插件的目标不是“再做一个聊天窗口”，而是让两个 DeepSeek 看起来坐在同一张桌子上：Harness 的提问窗口在左，DeepSeek 网页版在右；主题一致、登录连续、问题可以顺手带过去。

---

## 二、五条设计约束

在动手之前，先确定了几条不能妥协的约束。

### 1. 必须是真正的网页版

不能用 DeepSeek API 仿造一个“网页版 UI”。网页版的价值就在于它自己的会话、登录和网页端能力。插件必须加载真实的 `chat.deepseek.com`。

### 2. 不能使用 iframe

DeepSeek 网页版返回了 `frame-ancestors 'none'` 一类的安全策略，普通 iframe 会被浏览器拒绝。即使绕过，第三方页面的 DOM 也无法从宿主页面读取，跨域限制会让“抓取提问”变成空谈。

### 3. 不能弹出外部链接

用户要的是“打开 Harness 时网页版也在”，不是“点一下跳浏览器”。插件不能把网页版导向系统浏览器，也不能让网页版的新窗口弹到桌面上。

### 4. 不能在网页里获得 Harness 权限

网页版是第三方内容。它不能拿到 Node、preload、Harness RPC 或文件系统权限。所有跨边界的数据都必须是最小化的纯文本。

### 5. 不能要求每次重新登录

网页登录是这条工作流里最烦的一步。插件必须把网页登录态保持下来，让下一次启动直接进入已登录状态。

这五条约束决定了技术路线：**Electron 隔离 webview + 右侧栏原生 Tab + 主题 token 桥 + 登录存储桥 + 文本抓取桥**。

---

## 三、为什么是 webview，而不是 iframe 或代理

### iframe：第一眼最像，实际最远

iframe 看起来最简单：一个 `<iframe src="https://chat.deepseek.com">` 就结束了。但现实是：

- DeepSeek 的响应头禁止被嵌入；
- 即使嵌入，宿主无法读取跨域 iframe 的 DOM；
- 宿主的 CSS 变量、主题和字体无法穿透 iframe；
- 第三方 Cookie、登录态和弹窗策略不可控；
- 用户会看到一个“框里的网页”，而不是 Harness 的一部分。

它解决的是“显示”，没有解决“连接”。

### 反向代理：能读 DOM，但代价太高

另一个方向是把 `chat.deepseek.com` 代理到 Harness 自己的 origin 下，再通过同源 iframe 注入桥接脚本。这样确实可以读 DOM、同步主题、保持 Cookie，但需要处理：

- HTML/CSS/JS 中的绝对 URL 重写；
- API、SSE、WebSocket、PoP 挑战；
- 登录、验证码、WAF 风控；
- Cookie 罐和会话隔离；
- 上游页面结构变化后的代理兼容性。

这会把一个右侧栏插件变成一个长期维护的浏览器代理项目，风险远大于收益。

### webview：在“真实页面”和“可控边界”之间

Electron 的 `webview` 是一个独立的 guest，有自己的进程、Cookie 和存储，却没有 Node、preload 或 Harness 权限。宿主可以通过 `webview.executeJavaScript()` 在 guest 页面里执行只读脚本，把结果作为纯文本拿回来。

它同时满足了三件事：

1. 页面是真正的 `chat.deepseek.com`，不会被 `frame-ancestors` 拒绝；
2. 宿主可以读取页面上的选区、输入框和消息文本；
3. 第三方页面拿不到 Harness 的任何原生能力。

DeepSeek Harness Desktop 已经为右侧栏 Browser 提供了同一套隔离 guest 基础设施：`window.dshDesktop.browser.acquire()` 申请一个带 lease 的 guest，主进程在 `will-attach-webview` 中强制 `sandbox`、`contextIsolation`、`nodeIntegration: false` 和固定 partition。插件复用了这条路径，而不是自己创建不受控的 webview。

---

## 四、右侧栏不是“贴一个网页”

一个“能显示网页”的侧栏还不够。它需要成为 Harness 的一个真正的 Tab：能被标签条管理、能拖动、能分屏、能记住会话级布局、能在标题栏有一个回来的入口。

Harness 的右侧栏提供了两层扩展点：

1. **Tab 类型注册**：`ctx.get('sidebarRightTabs').register({ id, kind, title, keepMounted, guide })`；
2. **Tab 正文槽位**：`sidebar.right.pane.tab`，按类型 id 注册 React 组件。

插件注册的类型是：

```js
{
  id: 'dsh-deepseek-web-sync/panel',
  kind: 'deepseek-web',
  title: () => 'DeepSeek 网页版',
  keepMounted: true,
  guide: [{ id: 'deepseek-web', kind: 'deepseek-web', title, description }]
}
```

`keepMounted` 让用户切换 Tab、折叠侧栏或切换会话时，guest 不被销毁，登录态和页面状态得以保留。正文组件从槽位拿到标准属性，其中包括当前会话的 `inputActions`，这成为“把提问填入左侧”的关键。

此外，插件在 `conversation.session.header.utilities` 注册了一个“小网页版”按钮。用户关闭标签后，可以从对话标题栏把它叫回来，而不需要重新安装或回到插件管理页。

---

## 五、主题同步：利用两套 UI 共享的设计变量

这是整个插件里最有意思的一部分。

DeepSeek 网页版的 CSS 大量使用了 `--dsw-*` 变量，例如：

```css
body {
  --dsw-alias-bg-base: ...;
  --dsw-alias-label-primary: ...;
  --dsw-alias-brand-primary: ...;
}
body[data-ds-dark-theme] {
  --dsw-alias-bg-base: ...;
}
```

而 DeepSeek Harness 的 Web UI 也使用同一套命名。第三方主题插件通过 `ctx.theme.overrideTokens()` 覆盖的，正是这些 token 的子集。例如一个粉色主题可能只覆盖：

- `--dsw-alias-bg-base`
- `--dsw-alias-bg-layer-1/2`
- `--dsw-alias-border-l1/2`
- `--dsw-alias-brand-primary`
- `--dsw-alias-label-primary/secondary`
- `--dsw-specific-sidebar-fill`

这意味着不需要解析第三方主题的源码，也不需要知道它叫什么名字。只要读取 Harness 当前页面上这些变量的**计算值**，再写进 guest，网页就会跟着变色。

### 实现步骤

1. 从 `document.documentElement`、`body`、`#root` 和 `#root` 的第一个子元素读取 `getComputedStyle()`；
2. 扫描当前样式表，收集出现过的 `--dsw-*` 名称；
3. 只保留有值的 token；
4. 在 guest 的 `body` 上用 `style.setProperty(name, value, 'important')` 写入；
5. 根据 Harness `theme.getTheme().active.colorScheme` 设置 `body[data-ds-dark-theme]`；
6. 在 Harness 的 `theme/change` 和 `locale/change` 事件中重新执行。

为什么用 `!important` 的内联自定义属性？因为 DeepSeek 自己的 `body[data-ds-dark-theme]` 规则也会定义同名 token。内联 important 的优先级高于普通作者样式，可以稳定覆盖网页的亮/暗两套声明。

### 壁纸：只做加法，不重排页面

主题插件可能还会给 Harness 的 `body` 设置壁纸。插件读取 `background-image`，把它作为低透明度水印叠加到 guest 页面上：

```css
position: fixed;
inset: 0;
pointer-events: none;
z-index: 2147483000;
opacity: 0.05 ~ 0.065;
mix-blend-mode: multiply / screen;
```

它不改变网页的布局、字号和可读性，只是让右侧网页在视觉上保留当前主题的纹理。同时，插件标签顶部有一条 3px 的同款纹理细条，像书脊一样把两栏接起来。

### 明暗模式

DeepSeek 的暗色规则挂在 `body[data-ds-dark-theme]` 上。插件根据 Harness 主题的 `colorScheme` 设置或移除这个属性，并用一个轻量 `MutationObserver` 防止页面脚本在初始化时把它改回去。

这样，用户切换 Harness 的明暗模式时，右侧网页也会一起切换，而不是继续停留在另一套配色里。

---

## 六、登录一次：读懂 DeepSeek 的版本化存储

“登录一次就可以保持”听起来像 Cookie 问题，实际上 DeepSeek 网页版把 token 存在 localStorage 里。

它的存储不是裸字符串，而是带版本的包装：

```json
{
  "value": "<token>",
  "__version": "0"
}
```

未登录时，包装里是 `value: null`。登录后，页面把真实 token 写进 `value`。这带来两个关键点：

1. **不能把整个包装当成 token**。插件的存储里必须保存 `value` 里的逻辑值，否则恢复时会把 `{"value":null,...}` 当成登录态。
2. **恢复时要还原包装格式**。直接 `localStorage.setItem('userToken', token)` 页面读取时会解析失败，或者按旧版纯字符串迁移，导致登录态丢失。

插件的做法是：

- 登录后读取 `userToken` 包装，解析出 `value` 和 `__version`；
- 把逻辑 token、版本、`__appKit_userInfo` 的原始包装一起保存到 Harness 本机 localStorage；
- 下次页面加载完成时，如果 guest 还没有 token，就把 token 写回同样的 `{ value, __version }` 包装，再刷新一次页面；
- 用一个 `Storage.prototype.setItem` 钩子监听登录/退出写入，配合 4 秒轮询兜底；
- 连续多次轮询确认没有 token 后，清除本地保存的登录，避免过期 token 反复恢复。

这带来一个真实的体验提升：用户只要在网页里登录一次，后续启动 Harness 时页面会自动恢复登录，不需要重复扫码或输入密码。

### 为什么不是 Harness 账号 SSO

DeepSeek Harness 的账号授权签发的是 Platform/API 使用的 `x-dsh-auth-token`，`chat.deepseek.com` 使用的是网页版自己的 `userToken`。两者属于不同的凭证域，当前没有公开的兑换接口。

因此插件没有读取、转发或伪造 Harness 的账号凭据，而是让用户用**同一个 DeepSeek 账号**在网页里登录一次，然后由插件保持网页登录。这是在“不泄露 Harness 凭证”和“不要求每次登录”之间更安全的折中。

如果未来 DeepSeek 提供网页 token 的官方兑换，或者 Harness 暴露受控的账号桥接，这个模块可以替换成真正的静默 SSO；在此之前，静默注入 Platform token 既无法通过网页校验，也会突破安全边界。

---

## 七、把提问带进 Harness

“抓取提问”听起来简单，但网页版的 DOM 没有对第三方承诺的稳定接口。插件实现了三条路径，按稳定性排序。

### 1. 选区：最稳定

用户在网页中选中提问，点 **选区**。插件执行：

```js
window.getSelection().toString()
```

但这里有一个细节：用户点击插件的按钮时，焦点已经离开 guest，页面里的选区可能已经折叠。为了让“先选中、再点按钮”可靠，插件在页面加载后注入一个 `selectionchange` 监听器，把最后一次非空选区缓存到 guest 的全局变量里；抓取时先读当前选区，再回退到缓存。

### 2. 输入框：读取正在编辑的问题

插件在 guest 中寻找可见的 `textarea`、`[contenteditable="true"]` 或 `[role="textbox"]`，按面积取最大的一个，读取它的 `value` 或 `innerText`。这样用户在网页版输入框里还没发送的问题，也可以先带入 Harness 继续加工。

### 3. 最近提问：读取消息列表里的最后一条用户消息

DeepSeek 的消息容器使用 `.ds-message` 类。插件读取最后一组消息：

- 找到最后一条 `.ds-message`；
- 在子节点里排除带 `assistant` 标记或包含 Markdown 内容的节点；
- 取第一个有文本的用户节点；
- 如果结构不匹配，再回退到 assistant 元素的前置兄弟节点，或者带 `user` 类名的元素；
- 清理末尾的“编辑 / 复制 / 重新生成”等操作文字。

它不是一套永久可靠的爬虫，而是一个带降级路径的启发式读取器。真正稳定的路径始终是“选中 → 选区”。

### 4. 预览与填入

抓取结果不会直接发送。它先进入一个可编辑的 textarea，用户可以修改、删除或补充上下文，然后点 **填入当前对话**。

填入使用 Harness 公开的输入框动作：

```js
const span = inputActions.captureInsertion();
inputActions.insertText(payload, span);
```

如果 draft revision 在两次尝试之间变化，插件会重新捕获插入点，避免把文字写进旧位置。文字进入 Harness 输入框后，用户仍然可以继续编辑或按 Enter 发送。插件不会替用户按下发送键。

---

## 八、自动打开与无弹窗

### 自动打开

右侧栏控制器提供了 `openTab(kind)`。插件监听 `sidebar.mounted`（当前屏幕上显示的 Session），在每个 Session 第一次出现时打开网页版，并用 `sessionStorage` 记录“本次运行已自动打开”。

这带来三个行为：

- 刚启动 Harness，右侧网页版自动出现；
- 切换到一个新 Session，第一次也会自动打开；
- 用户手动关闭标签后，当前运行期间不会被反复拉起；下次启动会重新打开。

`sessionStorage` 而不是 `localStorage` 是有意的：它只描述“本次运行”，不会把用户的一次关闭永久固化成“以后都不要打开”。

### 无弹窗

插件的 webview 不设置 `allowpopups`，也不注册 `onOpenRequested` 跳转。网页里触发的 `window.open` 会被 Electron 主进程拒绝，宿主不会打开系统浏览器，也不会创建第二个窗口。

这牺牲了少数第三方登录/文档弹窗，但换来了一个明确的承诺：**网页版只在这个右侧栏里出现**。

---

## 九、安全边界

这是插件最需要克制的地方。

- Guest 没有 Node、preload、Harness RPC 或文件系统权限；主进程在挂载时强制 sandbox 与 context isolation。
- 插件不把 Harness 的 API 凭证、Session 内容或文件系统路径注入网页。
- 抓取只在用户点击时发生；脚本返回的是纯文本对象，不注入 DOM 事件或表单提交。
- 主题同步只写 CSS 自定义属性和一个水印层，不读取网页聊天内容。
- 登录 token 保存在 Harness 本机 localStorage，只用于恢复 `chat.deepseek.com` 的登录态，不上传到任何服务器。
- 不代理页面、不抓取整页 HTML、不记录网络请求。

它不是一个“浏览器自动化”插件，也不是一个“网页抓取器”。它只做一条很窄的桥：**用户主动选择的文本，从左到右；主题和登录状态，从右到左。**

---

## 十、限制与后续

这个插件仍然有几个明确的边界：

1. **仅桌面版**：依赖 Electron guest 和 Desktop preload；普通浏览器没有等价能力。
2. **账号不是真正的 SSO**：网页 token 与 Harness API token 属于不同凭证域，当前只能做到“同账号登录一次 + 自动保持”。
3. **网页结构会变化**：`最近提问` 的启发式可能随 DeepSeek 前端更新失效；选区路径更稳。
4. **登录 token 是本机持久化**：这是“登录一次”的代价；退出登录后插件会清除保存值。
5. **视觉同步是 token 级**：不会复制第三方主题的插画或组件，只同步调色板、字体、壁纸纹理和明暗模式。

如果后续有更稳定的网页端接口，这个插件可以进一步演化：

- 用官方账号桥接替代 token 持久化；
- 用网页端事件替代 DOM 启发式；
- 支持把网页回答也带回 Harness，而不仅是提问；
- 支持更细粒度的主题映射和字体同步。

---

## 十一、结语

把两个产品“放在一起”很容易，把它们的主题、账号和输入框“接起来”很难。这个插件选择了一条相对克制的路线：不重写 DeepSeek 网页版，不代理聊天内容，不把 Harness 的权限交给第三方页面；只在右侧栏的边界上，搭一条足够窄、足够清楚的桥。

它让用户打开 Harness 时，网页版就在旁边；切换主题时，网页也跟着变；登录一次后，不必反复扫码；选中一句提问，就能把它带进左侧的输入框。

这就是“融为一体”比较实际的样子：不是把两个界面强行合成一个，而是让它们之间的动作不再需要用户来回搬运。

---

**技术来源：ZCFE327**

仓库：[S-anZZz/dsh-deepseek-web-sync](https://github.com/S-anZZz/dsh-deepseek-web-sync)

本文与插件代码由 ZCFE327 设计与实现。DeepSeek、DeepSeek Harness 及相关商标归各自权利人所有。

License: [MIT](../LICENSE)
