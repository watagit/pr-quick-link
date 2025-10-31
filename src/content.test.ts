import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addCopyButton, isPullRequestPage, showCopyFeedback, showErrorFeedback } from './content';

// ClipboardItemをグローバルにモック
class MockClipboardItem {
  constructor(public data: Record<string, Blob>) {}
  static supports(_type: string): boolean {
    return true;
  }
}

// ClipboardItemの型定義を拡張
declare global {
  interface Window {
    ClipboardItem: typeof MockClipboardItem;
  }
}

globalThis.ClipboardItem = MockClipboardItem as unknown as typeof ClipboardItem;

// content.tsのグローバル実行を防ぐため、locationを先に設定
Object.defineProperty(globalThis, 'location', {
  value: {
    href: 'https://example.com',
    pathname: '/',
  },
  writable: true,
  configurable: true,
});

describe('isPullRequestPage', () => {
  beforeEach(() => {
    // locationをリセット
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'https://github.com',
        pathname: '/',
      },
      writable: true,
      configurable: true,
    });
  });

  it('プルリクエストページのURLの場合、trueを返す', () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'https://github.com/owner/repo/pull/123',
        pathname: '/owner/repo/pull/123',
      },
      writable: true,
      configurable: true,
    });
    expect(isPullRequestPage()).toBe(true);
  });

  it('プルリクエストページではない場合、falseを返す', () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'https://github.com/owner/repo/issues/123',
        pathname: '/owner/repo/issues/123',
      },
      writable: true,
      configurable: true,
    });
    expect(isPullRequestPage()).toBe(false);
  });

  it('ルートパスの場合、falseを返す', () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'https://github.com/',
        pathname: '/',
      },
      writable: true,
      configurable: true,
    });
    expect(isPullRequestPage()).toBe(false);
  });

  it('リポジトリのトップページの場合、falseを返す', () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'https://github.com/owner/repo',
        pathname: '/owner/repo',
      },
      writable: true,
      configurable: true,
    });
    expect(isPullRequestPage()).toBe(false);
  });

  it('複数桁のPR番号でも正しく動作する', () => {
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'https://github.com/facebook/react/pull/99999',
        pathname: '/facebook/react/pull/99999',
      },
      writable: true,
      configurable: true,
    });
    expect(isPullRequestPage()).toBe(true);
  });
});

describe('addCopyButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('タイトル要素が存在する場合、ボタンが追加される', () => {
    // GitHubのDOM構造をシミュレート
    document.body.innerHTML = `
      <div class="gh-header-title">
        <span class="js-issue-title">Test PR Title</span>
      </div>
    `;

    addCopyButton();

    const button = document.querySelector('#pr-copy-button');
    expect(button).toBeTruthy();
    expect(button?.tagName).toBe('BUTTON');
  });

  it('タイトル要素が存在しない場合、ボタンは追加されない', () => {
    document.body.innerHTML = '<div></div>';

    addCopyButton();

    const button = document.querySelector('#pr-copy-button');
    expect(button).toBeNull();
  });

  it('既にボタンが存在する場合、重複して追加されない', () => {
    document.body.innerHTML = `
      <div class="gh-header-title">
        <span class="js-issue-title">Test PR Title</span>
        <button id="pr-copy-button"></button>
      </div>
    `;

    addCopyButton();

    const buttons = document.querySelectorAll('#pr-copy-button');
    expect(buttons.length).toBe(1);
  });

  it('ボタンに正しい属性が設定される', () => {
    document.body.innerHTML = `
      <div class="gh-header-title">
        <span class="js-issue-title">Test PR Title</span>
      </div>
    `;

    addCopyButton();

    const button = document.querySelector('#pr-copy-button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button?.className).toBe('btn-octicon');
    expect(button?.type).toBe('button');
    expect(button?.title).toBe('Slack形式でタイトルとリンクをコピー');
  });

  it('ボタンにSVGアイコンが含まれる', () => {
    document.body.innerHTML = `
      <div class="gh-header-title">
        <span class="js-issue-title">Test PR Title</span>
      </div>
    `;

    addCopyButton();

    const button = document.querySelector('#pr-copy-button');
    const svg = button?.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('height')).toBe('16');
    expect(svg?.getAttribute('width')).toBe('16');
  });

  it('ボタンのクリックイベントが設定される', async () => {
    document.body.innerHTML = `
      <div class="gh-header-title">
        <span class="js-issue-title">Test PR Title</span>
      </div>
    `;

    // Clipboard APIをモック
    const mockClipboardWrite = vi.fn().mockResolvedValue(undefined);
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        write: mockClipboardWrite,
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });

    // locationをモック
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'https://github.com/owner/repo/pull/123',
        pathname: '/owner/repo/pull/123',
      },
      writable: true,
      configurable: true,
    });

    addCopyButton();

    const button = document.querySelector('#pr-copy-button') as HTMLButtonElement;
    expect(button).toBeTruthy();

    // ボタンをクリック
    button.click();

    // Clipboard APIが呼ばれるのを待つ
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockClipboardWrite).toHaveBeenCalled();

    // ClipboardItemの引数を確認
    const clipboardItemData = mockClipboardWrite.mock.calls[0][0][0];
    expect(clipboardItemData).toBeInstanceOf(MockClipboardItem);
  });
});

describe('showCopyFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ボタンのHTMLが成功アイコンに変更される', () => {
    const button = document.createElement('button');
    button.innerHTML = '<svg>original</svg>';

    showCopyFeedback(button);

    expect(button.innerHTML).toContain('#2da44e');
    expect(button.style.color).toBe('rgb(45, 164, 78)');
  });

  it('2秒後に元のHTMLに戻る', () => {
    const button = document.createElement('button');
    const originalHTML = '<svg>original</svg>';
    button.innerHTML = originalHTML;

    showCopyFeedback(button);

    // 変更されていることを確認
    expect(button.innerHTML).not.toBe(originalHTML);

    // 2秒後
    vi.advanceTimersByTime(2000);

    expect(button.innerHTML).toBe(originalHTML);
    expect(button.style.color).toBe('');
  });

  it('タイムアウト中にボタンの色が緑色に設定される', () => {
    const button = document.createElement('button');
    button.innerHTML = '<svg>original</svg>';

    showCopyFeedback(button);

    expect(button.style.color).toBe('rgb(45, 164, 78)');

    vi.advanceTimersByTime(1000);
    expect(button.style.color).toBe('rgb(45, 164, 78)');

    vi.advanceTimersByTime(1000);
    expect(button.style.color).toBe('');
  });
});

describe('showErrorFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ボタンのHTMLがエラーアイコンに変更される', () => {
    const button = document.createElement('button');
    button.innerHTML = '<svg>original</svg>';

    showErrorFeedback(button);

    expect(button.innerHTML).toContain('#cf222e');
    expect(button.style.color).toBe('rgb(207, 34, 46)');
  });

  it('2秒後に元のHTMLに戻る', () => {
    const button = document.createElement('button');
    const originalHTML = '<svg>original</svg>';
    button.innerHTML = originalHTML;

    showErrorFeedback(button);

    // 変更されていることを確認
    expect(button.innerHTML).not.toBe(originalHTML);

    // 2秒後
    vi.advanceTimersByTime(2000);

    expect(button.innerHTML).toBe(originalHTML);
    expect(button.style.color).toBe('');
  });

  it('タイムアウト中にボタンの色が赤色に設定される', () => {
    const button = document.createElement('button');
    button.innerHTML = '<svg>original</svg>';

    showErrorFeedback(button);

    expect(button.style.color).toBe('rgb(207, 34, 46)');

    vi.advanceTimersByTime(1000);
    expect(button.style.color).toBe('rgb(207, 34, 46)');

    vi.advanceTimersByTime(1000);
    expect(button.style.color).toBe('');
  });
});
