---
type: entrypoint
description: Install, use, and verify the responsive Pixiv novel filtering userscript.
---

# Pixiv 小说自定义屏蔽

用于在 Pixiv 小说搜索、标签搜索和小说收藏页面中，按关键词、作者、标签、字数范围及简介状态隐藏作品。

项目重写自 [Pixiv 小说自定义关键词屏蔽脚本](https://github.com/echo152/pixiv-custom-filter)。

由 Codex 驱动。

## 安装

1. 在浏览器中安装 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开 [pixiv-custom-filter.user.js](https://raw.githubusercontent.com/URARUA/pixiv-custom-filter/main/pixiv-custom-filter.user.js)。
3. 在 Tampermonkey 安装页面确认安装，并确保脚本已启用。

脚本支持以下 Pixiv 页面：

- 搜索页：`https://www.pixiv.net/search*`
- 标签页：`https://www.pixiv.net/tag*`
- 小说收藏页：`https://www.pixiv.net/novel/bookmarks.php*`

## 使用

页面右侧显示眼睛和齿轮两个按钮。

- 眼睛按钮用于启用或停用屏蔽。蓝色睁眼状态表示屏蔽已启用；中性灰色闭眼状态表示屏蔽未启用。
- 齿轮按钮用于打开设置。移动端显示全屏设置页；桌面端在按钮左侧显示固定宽度的设置面板。

设置页可分别填写内容、作者和标签关键词，每行一个关键词。最小字数和最大字数仅接受键盘输入的数字，不显示步进箭头；若保存时最小值大于最大值，脚本会自动交换二者。保存后会立即重新应用筛选，取消或关闭不会保存本次修改。
