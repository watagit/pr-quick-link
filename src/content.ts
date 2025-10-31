// プルリクエストページかどうかを確認
export function isPullRequestPage(): boolean {
  return window.location.pathname.match(/^\/[^/]+\/[^/]+\/pull\/\d+/) !== null;
}

// コピーボタンを追加
export function addCopyButton(): void {
  // 既にボタンが追加されている場合はスキップ
  if (document.querySelector('#pr-copy-button')) {
    return;
  }

  // タイトル要素を探す（GitHubのDOM構造に依存）
  const titleElement = document.querySelector('.gh-header-title .js-issue-title');

  if (!titleElement) {
    return;
  }

  // ボタンを作成
  const button = document.createElement('button');
  button.id = 'pr-copy-button';
  button.className = 'btn-octicon';
  button.type = 'button';
  button.title = 'Slack形式でタイトルとリンクをコピー';
  button.innerHTML = `
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon">
      <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path>
      <path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
    </svg>
  `;

  // クリックイベント
  button.addEventListener('click', async () => {
    const title = titleElement.textContent?.trim() || '';
    const url = window.location.href.split('#')[0]; // ハッシュを除去

    // URLからPR番号を抽出
    const prNumber = url.match(/\/pull\/(\d+)/)?.[1];

    // タイトルにPR番号を追加
    const titleWithNumber = prNumber ? `${title} #${prNumber}` : title;

    const slackFormat = `<${url}|${titleWithNumber}>`;
    const htmlFormat = `<a href="${url}">${titleWithNumber}</a>`;

    try {
      // プレーンテキストとHTML形式の両方をクリップボードにコピー
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([slackFormat], { type: 'text/plain' }),
        'text/html': new Blob([htmlFormat], { type: 'text/html' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      showCopyFeedback(button);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      // フォールバック: プレーンテキストのみコピー
      try {
        await navigator.clipboard.writeText(slackFormat);
        showCopyFeedback(button);
      } catch (fallbackErr) {
        console.error('フォールバックコピーも失敗しました:', fallbackErr);
        showErrorFeedback(button);
      }
    }
  });

  // タイトルの親要素にボタンを追加
  const titleContainer = titleElement.closest('.gh-header-title') as HTMLElement | null;
  if (titleContainer) {
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.gap = '8px';
    titleContainer.appendChild(button);
  }
}

// コピー成功のフィードバックを表示
export function showCopyFeedback(button: HTMLButtonElement): void {
  const originalHTML = button.innerHTML;
  button.innerHTML = `
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon" style="color: #2da44e;">
      <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
    </svg>
  `;
  button.style.color = '#2da44e';

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.color = '';
  }, 2000);
}

// コピー失敗のフィードバックを表示
export function showErrorFeedback(button: HTMLButtonElement): void {
  const originalHTML = button.innerHTML;
  button.innerHTML = `
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon" style="color: #cf222e;">
      <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>
    </svg>
  `;
  button.style.color = '#cf222e';

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.color = '';
  }, 2000);
}

// ページ読み込み時とDOM変更時にボタンを追加
function init(): void {
  if (isPullRequestPage()) {
    // 少し待ってからボタンを追加（DOMが完全に読み込まれるのを待つ）
    setTimeout(addCopyButton, 1000);
  }
}

// 初期化
init();

// SPAナビゲーションに対応（GitHubはSPAなので、ページ遷移を監視）
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document, { subtree: true, childList: true });
