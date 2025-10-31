# Copy PR Title with Link

GitHubのプルリクエストページで、タイトルとリンクをSlack形式でコピーできるChrome拡張機能です。

## 機能

- GitHubのプルリクエストのタイトル横にコピーボタンを表示
- ボタンをクリックすると、Slack形式 `<URL|タイトル>` でクリップボードにコピー
- Slackにペーストすると、タイトルテキストにリンクが埋め込まれた状態で表示されます

## インストール方法

1. このリポジトリをクローンまたはダウンロード
   ```bash
   git clone https://github.com/yourusername/copy-pull-request-title-with-link.git
   ```

2. Chromeで `chrome://extensions/` を開く

3. 右上の「デベロッパーモード」をONにする

4. 「パッケージ化されていない拡張機能を読み込む」をクリック

5. ダウンロードしたフォルダを選択

## 使い方

1. GitHubのプルリクエストページを開く
2. タイトルの横にコピーボタン（📋アイコン）が表示されます
3. ボタンをクリックすると、Slack形式でクリップボードにコピーされます
4. Slackに貼り付けると、タイトルテキストにリンクが埋め込まれた状態で表示されます

例：
```
コピーされる形式: <https://github.com/user/repo/pull/123|プルリクエストのタイトル>
Slackでの表示: プルリクエストのタイトル（リンク付き）
```

## コピー成功の確認

- コピー成功時：ボタンがチェックマーク（✓）に変わり、緑色に変化します
- コピー失敗時：ボタンがバツマーク（×）に変わり、赤色に変化します
- 2秒後に元のアイコンに戻ります

## 動作環境

- Google Chrome（推奨）
- Microsoft Edge（Chromiumベース）
- その他Chromiumベースのブラウザ

## 対応ページ

- GitHub プルリクエストページ: `https://github.com/*/*/pull/*`

## 技術スタック

- Manifest V3
- Vanilla JavaScript
- CSS3

## ライセンス

MIT

## 貢献

プルリクエストやIssueは大歓迎です！

## 注意事項

- この拡張機能はGitHubのDOM構造に依存しています
- GitHubのUIが更新された場合、動作しなくなる可能性があります
- その場合は、Issueで報告していただけると助かります
