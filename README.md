# pr-quick-link

GitHubのプルリクエストのタイトルとリンクを素早くコピーできるChrome拡張機能です。Slack、Notion、Google Docsなど、様々なツールで使用できます。

## 機能

- GitHubのプルリクエストのタイトル横にコピーボタンを表示
- ボタンをクリックすると、リッチテキスト形式でクリップボードにコピー
- 以下のツールで**リンク付きテキスト**として貼り付け可能：
  - **Slack**: `<URL|タイトル #番号>` 形式
  - **Notion**: リンク付きテキストとして挿入
  - **Google Docs**: リンク付きテキストとして挿入
  - **Microsoft Word**: リンク付きテキストとして挿入
  - **Gmail / Outlook**: リンク付きテキストとして挿入
  - その他多くのリッチテキストエディタ

## インストール方法

1. このリポジトリをクローンまたはダウンロード
   ```bash
   git clone https://github.com/yourusername/pr-quick-link.git
   cd pr-quick-link
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
3. ボタンをクリックすると、リッチテキスト形式でクリップボードにコピーされます
4. お好きなツール（Slack、Notion、Google Docsなど）に貼り付けると、リンク付きテキストとして表示されます

例：
```
コピーされる内容:
- プレーンテキスト: <https://github.com/user/repo/pull/123|プルリクエストのタイトル #123>
- HTML: <a href="https://github.com/user/repo/pull/123">プルリクエストのタイトル #123</a>

各ツールでの表示:
- Slack: プルリクエストのタイトル #123（リンク付き）
- Notion: プルリクエストのタイトル #123（リンク付き）
- Google Docs: プルリクエストのタイトル #123（リンク付き）
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
- Vitest（テストフレームワーク）
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

### テスト

```bash
# テストの実行（watch モード）
pnpm test

# テストの実行（1回のみ）
pnpm test:run

# テストカバレッジの確認
pnpm test:coverage

# テストUIの起動
pnpm test:ui
```

プロジェクトは [Vitest](https://vitest.dev/) を使用してテストしています。

### ディレクトリ構造

```
pr-quick-link/
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
