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
   cd copy-pull-request-title-with-link
   ```

2. 依存関係をインストールしてビルド
   ```bash
   pnpm install
   pnpm build
   ```

3. Chromeで `chrome://extensions/` を開く

4. 右上の「デベロッパーモード」をONにする

5. 「パッケージ化されていない拡張機能を読み込む」をクリック

6. プロジェクトの `dist` フォルダを選択

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
- TypeScript 5.x
- @types/chrome（Chrome API の型定義）
- pnpm（パッケージマネージャー）
- CSS3

## 開発

### 必要な環境

- Node.js (推奨: v18以上)
- pnpm (推奨: v8以上)

### ビルド

```bash
# 依存関係のインストール
pnpm install

# ビルド（TypeScript → JavaScript）
pnpm build

# ファイル変更の監視（開発時）
pnpm watch

# ビルド成果物のクリーンアップ
pnpm clean
```

### ディレクトリ構造

```
copy-pull-request-title-with-link/
├── src/                    # ソースコード
│   ├── content.ts         # コンテンツスクリプト (TypeScript)
│   ├── manifest.json      # 拡張機能のマニフェスト
│   └── styles.css         # スタイルシート
├── dist/                   # ビルド後の出力（Chrome拡張として読み込むディレクトリ）
│   ├── content.js         # コンパイル後のJavaScript
│   ├── manifest.json      # コピーされたマニフェスト
│   └── styles.css         # コピーされたスタイルシート
├── package.json           # プロジェクト設定
├── tsconfig.json          # TypeScript設定
└── pnpm-lock.yaml         # 依存関係のロックファイル
```

## ライセンス

MIT

## 貢献

プルリクエストやIssueは大歓迎です！

## 注意事項

- この拡張機能はGitHubのDOM構造に依存しています
- GitHubのUIが更新された場合、動作しなくなる可能性があります
- その場合は、Issueで報告していただけると助かります
