// プルリクエストページかどうかを確認
export function isPullRequestPage(): boolean {
  return window.location.pathname.match(/^\/[^/]+\/[^/]+\/pull\/\d+/) !== null;
}

// document.title から PR タイトルを取り出す
// GitHub のタイトル形式: "<タイトル> by <author> · Pull Request #<番号> · <owner>/<repo>"
// (古い GitHub では "by <author>" が付かない場合もあるため両対応する)
export function getPullRequestTitle(): string {
  const raw = document.title.trim();
  const separatorIndex = raw.indexOf(' · ');
  const head = separatorIndex > 0 ? raw.slice(0, separatorIndex) : raw;
  // 末尾の " by <username>" を取り除く (GitHubのusernameに空白は含まれない)
  return head.replace(/\s+by\s+\S+$/, '').trim();
}

const COPY_ICON_SVG = `
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon">
    <path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path>
    <path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path>
  </svg>
`;

const SUCCESS_ICON_SVG = `
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon">
    <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
  </svg>
`;

const ERROR_ICON_SVG = `
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon">
    <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>
  </svg>
`;

// フローティングコピーボタンを追加
export function addCopyButton(): void {
  if (document.querySelector('#pr-copy-button')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'pr-copy-button';
  button.type = 'button';
  button.title = 'Slack形式でタイトルとリンクをコピー';
  button.setAttribute('aria-label', 'Slack形式でPRタイトルとリンクをコピー');
  button.innerHTML = COPY_ICON_SVG;

  button.addEventListener('click', async () => {
    const title = getPullRequestTitle();
    const url = window.location.href.split('#')[0];
    const prNumber = url.match(/\/pull\/(\d+)/)?.[1];
    const titleWithNumber = prNumber ? `${title} #${prNumber}` : title;

    const slackFormat = `<${url}|${titleWithNumber}>`;
    const htmlFormat = `<a href="${url}">${titleWithNumber}</a>`;

    try {
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([slackFormat], { type: 'text/plain' }),
        'text/html': new Blob([htmlFormat], { type: 'text/html' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      showCopyFeedback(button);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      try {
        await navigator.clipboard.writeText(slackFormat);
        showCopyFeedback(button);
      } catch (fallbackErr) {
        console.error('フォールバックコピーも失敗しました:', fallbackErr);
        showErrorFeedback(button);
      }
    }
  });

  document.body.appendChild(button);
}

// ボタンを取り除く（PR以外のページに遷移した場合）
export function removeCopyButton(): void {
  document.querySelector('#pr-copy-button')?.remove();
}

export function showCopyFeedback(button: HTMLButtonElement): void {
  const originalHTML = button.innerHTML;
  button.innerHTML = SUCCESS_ICON_SVG;
  button.style.color = '#2da44e';

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.color = '';
  }, 2000);
}

export function showErrorFeedback(button: HTMLButtonElement): void {
  const originalHTML = button.innerHTML;
  button.innerHTML = ERROR_ICON_SVG;
  button.style.color = '#cf222e';

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.color = '';
  }, 2000);
}

function syncButton(): void {
  if (isPullRequestPage()) {
    addCopyButton();
  } else {
    removeCopyButton();
  }
}

syncButton();

// SPAナビゲーションに対応（GitHubはSPAなので、URL変化を監視してボタンを出し入れする）
if (typeof location !== 'undefined') {
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (typeof location === 'undefined') return;
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      syncButton();
    }
  }).observe(document, { subtree: true, childList: true });
}
