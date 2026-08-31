import type { ShareChannel } from "@/lib/types";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

const KAKAO_SDK_URL = "https://developers.kakao.com/sdk/js/kakao.min.js";

/**
 * 카카오 JS 키가 설정된 경우에만 SDK를 로드합니다. 키가 없으면(로컬 개발 기본값) 아무 것도
 * 하지 않고, 호출부는 카카오 공유 버튼을 Web Share API/링크복사 폴백으로 처리합니다
 * (CLAUDE.md 4장 — 인앱 브라우저/키 미설정 상황에도 항상 폴백 UX 제공).
 */
export function loadKakaoSdk(): Promise<boolean> {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!key) return Promise.resolve(false);
  if (window.Kakao?.isInitialized()) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${KAKAO_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(initKakao(key)));
      return;
    }
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.onload = () => resolve(initKakao(key));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function initKakao(key: string): boolean {
  if (!window.Kakao) return false;
  if (!window.Kakao.isInitialized()) window.Kakao.init(key);
  return window.Kakao.isInitialized();
}

export interface ShareContent {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export async function shareKakao(content: ShareContent) {
  const ready = await loadKakaoSdk();
  if (!ready || !window.Kakao) return false;

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: content.title,
      description: content.description,
      imageUrl: content.imageUrl,
      link: { mobileWebUrl: content.url, webUrl: content.url },
    },
    buttons: [
      {
        title: "나도 테스트 해보기",
        link: { mobileWebUrl: content.url, webUrl: content.url },
      },
    ],
  });
  return true;
}

/** 인스타그램 등 네이티브 공유 시트를 여는 표준 Web Share API. 인앱 브라우저 호환성이 좋다. */
export async function shareViaWebShare(content: ShareContent) {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    await navigator.share({ title: content.title, text: content.description, url: content.url });
    return true;
  } catch {
    // 사용자가 공유를 취소한 경우 등 — 에러로 취급하지 않음
    return false;
  }
}

export function shareToX(content: ShareContent) {
  const text = `${content.title} - ${content.description}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(content.url)}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

/**
 * 클립보드 API가 막혀 있는 인앱 브라우저(WebView)를 위한 폴백까지 포함합니다
 * (CLAUDE.md 4장 — 인앱 브라우저 클립보드 API 미동작 대비).
 */
export async function copyLink(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // fall through to legacy fallback
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export function logShareEvent(testSessionId: string, channel: ShareChannel) {
  // 실패해도 공유 자체는 이미 끝났으므로 사용자에게 노출하지 않는다 (best-effort 로깅)
  void fetch("/api/share-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testSessionId, channel }),
  }).catch(() => undefined);
}
