import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCopyButton,
  getPullRequestTitle,
  isPullRequestPage,
  removeCopyButton,
  showCopyFeedback,
  showErrorFeedback,
} from './content';

// ClipboardItemをグローバルにモック
class MockClipboardItem {
  constructor(public data: Record<string, Blob>) {}
  static supports(_type: string): boolean {
    return true;
  }
}

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

function setLocation(href: string, pathname: string): void {
  Object.defineProperty(globalThis, 'location', {
    value: { href, pathname },
    writable: true,
    configurable: true,
  });
}

describe('isPullRequestPage', () => {
  beforeEach(() => {
    setLocation('https://github.com', '/');
  });

  it('プルリクエストページのURLの場合、trueを返す', () => {
    setLocation('https://github.com/owner/repo/pull/123', '/owner/repo/pull/123');
    expect(isPullRequestPage()).toBe(true);
  });

  it('プルリクエストページではない場合、falseを返す', () => {
    setLocation('https://github.com/owner/repo/issues/123', '/owner/repo/issues/123');
    expect(isPullRequestPage()).toBe(false);
  });

  it('ルートパスの場合、falseを返す', () => {
    setLocation('https://github.com/', '/');
    expect(isPullRequestPage()).toBe(false);
  });

  it('リポジトリのトップページの場合、falseを返す', () => {
    setLocation('https://github.com/owner/repo', '/owner/repo');
    expect(isPullRequestPage()).toBe(false);
  });

  it('複数桁のPR番号でも正しく動作する', () => {
    setLocation('https://github.com/facebook/react/pull/99999', '/facebook/react/pull/99999');
    expect(isPullRequestPage()).toBe(true);
  });
});

describe('getPullRequestTitle', () => {
  afterEach(() => {
    document.title = '';
  });

  it('GitHubのタイトル形式からPRタイトルを抽出する', () => {
    document.title = 'Fix button rendering · Pull Request #123 · owner/repo';
    expect(getPullRequestTitle()).toBe('Fix button rendering');
  });

  it('セパレータがない場合は document.title 全体を返す', () => {
    document.title = 'Just a title';
    expect(getPullRequestTitle()).toBe('Just a title');
  });

  it('前後の空白を取り除く', () => {
    document.title = '  Trimmed title  · Pull Request #1 · owner/repo';
    expect(getPullRequestTitle()).toBe('Trimmed title');
  });
});

describe('addCopyButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('ボタンがbodyに追加される', () => {
    addCopyButton();

    const button = document.querySelector('#pr-copy-button');
    expect(button).toBeTruthy();
    expect(button?.tagName).toBe('BUTTON');
    expect(button?.parentElement).toBe(document.body);
  });

  it('GitHubのDOM構造が変わってもボタンが追加される', () => {
    // タイトル用の要素が一切ない状態でも動くこと
    document.body.innerHTML = '<div id="totally-unrelated"></div>';

    addCopyButton();

    expect(document.querySelector('#pr-copy-button')).toBeTruthy();
  });

  it('既にボタンが存在する場合、重複して追加されない', () => {
    addCopyButton();
    addCopyButton();

    const buttons = document.querySelectorAll('#pr-copy-button');
    expect(buttons.length).toBe(1);
  });

  it('ボタンに正しい属性が設定される', () => {
    addCopyButton();

    const button = document.querySelector('#pr-copy-button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button?.type).toBe('button');
    expect(button?.title).toBe('Slack形式でタイトルとリンクをコピー');
    expect(button?.getAttribute('aria-label')).toBe('Slack形式でPRタイトルとリンクをコピー');
  });

  it('ボタンにSVGアイコンが含まれる', () => {
    addCopyButton();

    const svg = document.querySelector('#pr-copy-button svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('height')).toBe('16');
    expect(svg?.getAttribute('width')).toBe('16');
  });

  it('ボタンのクリックでClipboard APIが呼ばれ、document.titleからタイトルを取得する', async () => {
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

    setLocation('https://github.com/owner/repo/pull/123', '/owner/repo/pull/123');
    document.title = 'Fix button rendering · Pull Request #123 · owner/repo';

    addCopyButton();

    const button = document.querySelector('#pr-copy-button') as HTMLButtonElement;
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockClipboardWrite).toHaveBeenCalled();

    const clipboardItemData = mockClipboardWrite.mock.calls[0][0][0];
    expect(clipboardItemData).toBeInstanceOf(MockClipboardItem);
    // text/plain / text/html 両方の Blob が渡されていること
    const data = (clipboardItemData as MockClipboardItem).data;
    expect(data['text/plain']).toBeInstanceOf(Blob);
    expect(data['text/html']).toBeInstanceOf(Blob);
  });
});

describe('removeCopyButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('ボタンが存在する場合、取り除かれる', () => {
    addCopyButton();
    expect(document.querySelector('#pr-copy-button')).toBeTruthy();

    removeCopyButton();
    expect(document.querySelector('#pr-copy-button')).toBeNull();
  });

  it('ボタンが存在しない場合でもエラーにならない', () => {
    expect(() => removeCopyButton()).not.toThrow();
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

    expect(button.style.color).toBe('rgb(45, 164, 78)');
  });

  it('2秒後に元のHTMLに戻る', () => {
    const button = document.createElement('button');
    const originalHTML = '<svg>original</svg>';
    button.innerHTML = originalHTML;

    showCopyFeedback(button);

    expect(button.innerHTML).not.toBe(originalHTML);

    vi.advanceTimersByTime(2000);

    expect(button.innerHTML).toBe(originalHTML);
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

    expect(button.style.color).toBe('rgb(207, 34, 46)');
  });

  it('2秒後に元のHTMLに戻る', () => {
    const button = document.createElement('button');
    const originalHTML = '<svg>original</svg>';
    button.innerHTML = originalHTML;

    showErrorFeedback(button);

    expect(button.innerHTML).not.toBe(originalHTML);

    vi.advanceTimersByTime(2000);

    expect(button.innerHTML).toBe(originalHTML);
    expect(button.style.color).toBe('');
  });
});
