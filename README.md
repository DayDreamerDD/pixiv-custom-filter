---
type: entrypoint
description: Install and use Pixiv Custom Filter in Simplified Chinese, English, and Japanese.
---

# Pixiv Custom Filter

[简体中文](#简体中文) | [English](#english) | [日本語](#日本語)

## 简体中文

用于在 Pixiv 小说搜索、标签搜索和小说收藏页面中，按关键词、作者、标签、字数范围及简介状态隐藏作品。

自动移除 Pixiv 页面中的部分推广和广告元素。

项目重写自 [Pixiv 小说自定义关键词屏蔽脚本](https://github.com/echo152/pixiv-custom-filter)。

由运行在 Codex 的 GPT 5.6 驱动。

### 安装

1. 在浏览器中安装 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开 [pixiv-custom-filter.user.js](https://raw.githubusercontent.com/DayDreamerDD/pixiv-custom-filter/main/pixiv-custom-filter.user.js)。
3. 在 Tampermonkey 安装页面确认安装，并确保脚本已启用。

脚本仅在以下 Pixiv 页面启用作品筛选和控制面板：

- 搜索页：`https://www.pixiv.net/search*`
- 标签页：`https://www.pixiv.net/tags/*`
- 设置语言的标签页：`https://www.pixiv.net/*/tags/*`
- 小说收藏页：`https://www.pixiv.net/users/*/bookmarks/novels*`
- 设置语言的小说收藏页：`https://www.pixiv.net/*/users/*/bookmarks/novels*`

**为了在全站移除指定的推广和广告元素，脚本本身会在所有 Pixiv 页面运行：`https://www.pixiv.net/*`。在上述筛选页面以外，控制面板和作品筛选保持停用。**

### 使用

仅在上述搜索页、标签页和小说收藏页，页面右侧会显示眼睛和齿轮两个按钮；其他 Pixiv 页面不显示控件，但仍会移除指定的推广和广告元素。

- 眼睛按钮用于启用或停用屏蔽。蓝色睁眼状态表示屏蔽已启用；灰色闭眼状态表示屏蔽未启用。
- 齿轮按钮用于打开设置。移动端显示全屏设置页；桌面端在按钮左侧显示固定宽度的设置面板。
- 设置页可分别填写内容、作者和标签关键词，每行一个关键词。最小字数和最大字数仅接受数字；若保存时最小值大于最大值，脚本会自动交换二者。保存后会立即重新应用筛选，关闭不会保存本次修改。
- 设置界面会跟随 Pixiv 的页面语言：简体中文、繁体中文和日语分别显示对应语言，其他语言显示英语，无需单独设置。

### 筛选规则

- 内容关键词仅匹配系列名称、标题和简介，不匹配作者、标签或卡片中的其他文字。
- 作者关键词匹配作者名称，标签关键词匹配作品标签。
- 关键词匹配不区分大小写，并会统一全角与半角字符及连续空白。
- 字数范围使用 Pixiv 页面显示的字符数或词数直接比较，不在不同单位之间换算；无法识别字数时，不会仅因字数上下限隐藏作品。
- 启用“隐藏无简介小说”后，没有独立简介的作品会被隐藏；标题或系列名称不会被当作简介。

### 许可

本项目采用 [MIT 许可证](LICENSE) 发布。保留版权和许可声明后，可以自由使用、复制、修改和分发。

## English

This userscript hides works on Pixiv novel search, tag search, and novel bookmarks pages based on keywords, author, tags, displayed length range, and description availability.

Automatically removes selected promotional and advertising elements from Pixiv pages.

Rewritten from [Pixiv Novel Custom Keyword Filter](https://github.com/echo152/pixiv-custom-filter).

Powered by GPT 5.6 running in Codex.

### Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open [pixiv-custom-filter.user.js](https://raw.githubusercontent.com/DayDreamerDD/pixiv-custom-filter/main/pixiv-custom-filter.user.js).
3. Confirm the installation on the Tampermonkey page and make sure the userscript is enabled.

The userscript enables work filtering and its controls only on these Pixiv pages:

- Search pages: `https://www.pixiv.net/search*`
- Tag pages: `https://www.pixiv.net/tags/*`
- Language-prefixed tag pages: `https://www.pixiv.net/*/tags/*`
- Novel bookmarks pages: `https://www.pixiv.net/users/*/bookmarks/novels*`
- Language-prefixed novel bookmarks pages: `https://www.pixiv.net/*/users/*/bookmarks/novels*`

**To remove selected promotional and advertising elements site-wide, the userscript itself runs on every Pixiv page: `https://www.pixiv.net/*`. Outside the filtering pages listed above, the controls and work filtering remain disabled.**

### Usage

On the search, tag, and novel bookmarks pages listed above, an eye and a gear appear on the right. Other Pixiv pages hide these controls while still removing the selected promotional and advertising elements.

- Use the eye button to enable or disable filtering. A blue open eye means filtering is enabled; a gray closed eye means it is disabled.
- Use the gear button to open settings. On mobile, settings fill the screen. On desktop, a fixed-width panel opens to the left of the buttons.
- Enter content, author, and tag keywords separately, one keyword per line. The minimum and maximum length fields accept digits only. If the minimum is greater than the maximum when saved, the userscript swaps them automatically. Saving reapplies filtering immediately; closing the panel discards unsaved changes.
- The settings language follows the Pixiv page language. Simplified Chinese, Traditional Chinese, and Japanese use their matching translations; all other languages use English. No separate language setting is required.

### Filtering Rules

- Content keywords match only the series name, title, and description. They do not match the author, tags, or other card text.
- Author keywords match the author name, and tag keywords match work tags.
- Keyword matching is case-insensitive, normalizes full-width and half-width forms, and collapses repeated whitespace.
- Length limits compare the character or word count displayed by Pixiv directly without converting between units. If no length can be recognized, length limits alone do not hide the work.
- When “Hide novels without a description” is enabled, works without an independent description are hidden. A title or series name is not treated as a description.

### License

This project is released under the [MIT License](LICENSE). You may use, copy, modify, and distribute it freely as long as the copyright and license notices are retained.

## 日本語

Pixiv の小説検索、タグ検索、小説ブックマークページで、キーワード、作者、タグ、文字数範囲、あらすじの有無に基づいて作品を非表示にするユーザースクリプトです。

Pixiv ページ上の一部のプロモーション要素や広告要素を自動的に削除します。

[Pixiv 小説カスタムキーワードフィルタースクリプト](https://github.com/echo152/pixiv-custom-filter)を基に全面的に書き直しています。

Codex 上で動作する GPT 5.6 により開発されています。

### インストール

1. ブラウザーに [Tampermonkey](https://www.tampermonkey.net/) をインストールします。
2. [pixiv-custom-filter.user.js](https://raw.githubusercontent.com/DayDreamerDD/pixiv-custom-filter/main/pixiv-custom-filter.user.js) を開きます。
3. Tampermonkey のインストール画面で確認し、ユーザースクリプトが有効になっていることを確認します。

このユーザースクリプトは、次の Pixiv ページでのみ作品フィルターと操作ボタンを有効にします。

- 検索ページ：`https://www.pixiv.net/search*`
- タグページ：`https://www.pixiv.net/tags/*`
- 言語指定のタグページ：`https://www.pixiv.net/*/tags/*`
- 小説ブックマークページ：`https://www.pixiv.net/users/*/bookmarks/novels*`
- 言語指定の小説ブックマークページ：`https://www.pixiv.net/*/users/*/bookmarks/novels*`

**指定したプロモーション要素や広告要素をサイト全体で削除するため、ユーザースクリプト自体はすべての Pixiv ページで動作します：`https://www.pixiv.net/*`。上記以外のページでは、操作ボタンと作品フィルターは無効のままです。**

### 使い方

上記の検索、タグ、小説ブックマークページでのみ、ページ右側に目と歯車の2つのボタンが表示されます。その他の Pixiv ページではボタンを非表示にし、指定されたプロモーション要素や広告要素の削除だけを継続します。

- 目のボタンでフィルターを有効または無効にします。青い開いた目は有効、灰色の閉じた目は無効を表します。
- 歯車のボタンで設定を開きます。モバイルでは設定が全画面で表示され、デスクトップではボタンの左側に固定幅のパネルが表示されます。
- コンテンツ、作者、タグのキーワードをそれぞれ1行に1つ入力します。最小文字数と最大文字数には数字のみ入力できます。保存時に最小値が最大値を上回っている場合は、自動的に入れ替えられます。保存するとフィルターがすぐに再適用され、パネルを閉じると未保存の変更は破棄されます。
- 設定画面の言語は Pixiv ページの言語に従います。簡体字中国語、繁体字中国語、日本語ではそれぞれの翻訳が表示され、その他の言語では英語が表示されます。言語を個別に設定する必要はありません。

### フィルタールール

- コンテンツキーワードはシリーズ名、タイトル、あらすじのみに一致し、作者、タグ、カード内のその他のテキストには一致しません。
- 作者キーワードは作者名に、タグキーワードは作品タグに一致します。
- キーワード照合では大文字と小文字を区別せず、全角・半角文字と連続する空白を正規化します。
- 文字数範囲は Pixiv に表示された文字数または単語数をそのまま比較し、単位間の換算は行いません。文字数を認識できない場合、文字数の上下限だけを理由に作品を非表示にはしません。
- 「あらすじのない小説を非表示」を有効にすると、独立したあらすじがない作品を非表示にします。タイトルやシリーズ名はあらすじとして扱いません。

### ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。著作権表示とライセンス表示を保持する限り、自由に使用、複製、変更、配布できます。
