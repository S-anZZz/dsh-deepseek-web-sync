# 快速开始

在另一台电脑上安装 **DeepSeek 网页版侧栏 · 同步**，只需要三步：拿到插件目录、在 Harness Desktop 里从本地安装、首次登录一次 DeepSeek 网页版。

> 这是 DeepSeek Harness **Desktop** 插件。普通浏览器里的 Harness Web 没有隔离 `webview`，不能使用右侧网页版。
>
> 技术来源：ZCFE327

---

## 1. 准备插件目录

### 方式 A：下载 GitHub 仓库 ZIP（推荐）

1. 打开仓库：<https://github.com/S-anZZz/dsh-deepseek-web-sync>
2. 点 **Code → Download ZIP**。
3. 解压到一个**长期保留**的目录，例如：

   ```text
   C:\Users\<你的用户名>\Documents\dsh-plugins\dsh-deepseek-web-sync
   ```

4. 确认该目录下直接能看到：

   ```text
   package.json
   client.js
   index.js
   cordis.patch.yml
   locale/
   icon.svg
   ```

> 不要放在临时目录、下载缓存或会被清理的文件夹。Harness 会链接这个目录，移动或删除它会破坏插件。

### 方式 B：git clone

```bash
git clone https://github.com/S-anZZz/dsh-deepseek-web-sync.git
```

把仓库克隆到上面的长期目录，效果相同。

---

## 2. 在 Harness Desktop 中安装

1. 打开 DeepSeek Harness **Desktop**。
2. 进入 **插件 / Plugins** 页面（侧边栏的插件入口，或账号菜单 → 设置 → 插件）。
3. 选择 **添加插件 / Add plugin**。
4. 选择 **从本地目录安装 / Install from local path**。
5. 选中刚才解压的插件目录（包含 `package.json` 的那一层）。
6. 等待安装完成，确认插件处于启用状态。
7. 打开或刷新一个会话。右侧栏会自动出现 **DeepSeek 网页版**。

如果右侧栏没有自动出现：

- 点对话标题栏右侧的 **网页版** 按钮；
- 或点右侧栏标签条的 **+**，选择 **DeepSeek 网页版**。

> 插件必须在 Desktop 的 `desktop` profile 下安装；不要用普通 Web 版的安装方式。
>
> 插件市场收录正在准备中；在收录生效前，请使用上面的本地安装方式。

---

## 3. 首次登录

1. 在右侧网页里用你的 DeepSeek 账号登录一次。
2. 登录后插件会保存网页登录态，下次启动 Harness 自动恢复。
3. 在网页里选中提问，点顶部 **选区**，检查预览后点 **填入当前对话**。
4. 左侧 Harness 输入框会出现这段文字，可继续编辑或发送。

其他入口：

- **输入框**：抓取网页输入框中正在编辑的问题；
- **最近提问**：尝试读取网页消息列表中的最后一条用户提问；
- **网页版**：关闭标签后从对话标题栏重新打开。

---

## 每台电脑的登录态

登录令牌保存在当前电脑本机的 Harness 数据中，**不会随 GitHub 仓库同步**。所以：

- 换一台电脑安装后，需要在新电脑的网页版里再登录一次；
- 之后这台电脑也会自动保持登录；
- 如果在新电脑登录了相同 DeepSeek 账号，历史会话仍由 DeepSeek 网页版自己同步。

---

## 更新插件

1. 下载新版仓库 ZIP，或 `git pull`。
2. 覆盖原插件目录（保持路径不变）。
3. 回到 Harness 插件页面重新启用/重载插件。
4. 刷新页面或重启 Desktop。

如果插件页面提示需要重启，按提示重启 Harness Desktop。

---

## 卸载

1. 在 Harness 的插件页面禁用并移除 **DeepSeek 网页版侧栏 · 同步**。
2. 确认插件已移除后，再删除本地插件目录。
3. 如果只想暂时关闭，可以禁用插件；右侧栏标签会保留到下次启动重新组合时处理。

---

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 插件页面找不到本地安装入口 | 确认使用的是 **Desktop**，不是浏览器 Web；查看插件页的“添加/安装”菜单 |
| 右侧显示“仅桌面版” | 当前是普通 Web 环境，换 Desktop |
| 右侧没有自动打开 | 点标题栏 **网页版**，或右侧栏 **+ → DeepSeek 网页版** |
| 网页登录下一次又没了 | 确认没有清理 Harness 的站点数据；令牌保存在本机 localStorage，清理后会重新登录 |
| 主题没有同步 | 确认当前 Harness 已启用主题；切换一次主题触发 `theme/change`，或重载插件 |
| “最近提问”抓不到 | 改用 **选区**：在网页中选中问题后再点抓取 |
| 右侧标签显示空白 | 关闭标签后重新打开；或在插件页面重新启用插件 |
| 安装后提示缺少依赖/无法加载 | 确认解压目录完整，`package.json`、`client.js`、`cordis.patch.yml` 都在 |

---

## 安装完成检查清单

- [ ] Harness 是 Desktop 版
- [ ] 插件目录有 `package.json` 和 `cordis.patch.yml`
- [ ] 插件页面显示已启用
- [ ] 对话右侧出现 **DeepSeek 网页版**
- [ ] 网页里能看到 DeepSeek 登录页
- [ ] 登录后顶部状态显示 **已登录 · 保持中**
- [ ] 选中网页文字后点 **选区** 能出现预览
- [ ] **填入当前对话** 能把文字送进左侧输入框

全部完成后，就可以同时使用左侧 Harness API 对话和右侧 DeepSeek 网页版了。

---

技术来源：**ZCFE327** · [返回 README](README.md)
