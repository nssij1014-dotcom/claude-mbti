"use client";

import { useState } from "react";
import {
  copyLink,
  logShareEvent,
  shareKakao,
  shareToX,
  shareViaWebShare,
  type ShareContent,
} from "@/features/share/share";

interface ShareBarProps {
  testSessionId: string;
  title: string;
  description: string;
}

/**
 * 결과 페이지 하단에 항상 고정 노출되는 공유 바입니다 (PRD 5.3 C — 스크롤 중에도 접근 가능해야
 * 함, CLAUDE.md 4장 하드 제약). 카카오 SDK가 없거나 인앱 브라우저에서 API가 막혀 있어도
 * 항상 폴백 동작(Web Share API → 링크복사)이 있어야 합니다.
 *
 * url/imageUrl은 window.location을 써야 해서 클릭 시점(클라이언트 하이드레이션 이후)에만
 * 계산합니다 — 렌더 시점에 미리 계산하면 서버 렌더링 단계에서 window가 없어 오류가 납니다.
 */
export function ShareBar({ testSessionId, title, description }: ShareBarProps) {
  const [toast, setToast] = useState<string | null>(null);

  function buildContent(): ShareContent {
    return {
      title,
      description,
      url: window.location.href,
      imageUrl: `${window.location.origin}/api/og/${testSessionId}`,
    };
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }

  async function handleCopyLink() {
    const ok = await copyLink(buildContent().url);
    logShareEvent(testSessionId, "link_copy");
    showToast(ok ? "링크가 복사되었어요" : "복사에 실패했어요. 주소창을 길게 눌러 복사해 주세요");
  }

  async function handleKakao() {
    const content = buildContent();
    const ok = await shareKakao(content);
    logShareEvent(testSessionId, "kakao");
    if (ok) return;

    const webShareOk = await shareViaWebShare(content);
    if (webShareOk) return;

    await copyLink(content.url);
    showToast("카카오톡 공유를 사용할 수 없어 링크를 복사했어요");
  }

  async function handleInstagram() {
    const content = buildContent();
    const ok = await shareViaWebShare(content);
    logShareEvent(testSessionId, "instagram");
    if (ok) return;

    await copyLink(content.url);
    showToast("공유 대신 링크를 복사했어요. 인스타그램 스토리에 붙여넣어 주세요");
  }

  function handleX() {
    shareToX(buildContent());
    logShareEvent(testSessionId, "x");
  }

  function handleImageDownload() {
    logShareEvent(testSessionId, "image_download");
    window.open(buildContent().imageUrl, "_blank", "noopener,noreferrer");
    showToast("새 탭에 열린 이미지를 길게 눌러 저장해 주세요");
  }

  return (
    <div className="sticky bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
      {toast && (
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
      <div className="mx-auto flex max-w-md items-center justify-between gap-1">
        <ShareButton label="카카오톡" emoji="💬" onClick={handleKakao} />
        <ShareButton label="인스타" emoji="📸" onClick={handleInstagram} />
        <ShareButton label="X" emoji="✕" onClick={handleX} />
        <ShareButton label="링크복사" emoji="🔗" onClick={handleCopyLink} />
        <ShareButton label="이미지저장" emoji="⬇️" onClick={handleImageDownload} />
      </div>
    </div>
  );
}

function ShareButton({
  label,
  emoji,
  onClick,
}: {
  label: string;
  emoji: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex min-h-11 min-w-11 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-neutral-700 active:bg-neutral-100"
    >
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <span className="text-[11px]">{label}</span>
    </button>
  );
}
