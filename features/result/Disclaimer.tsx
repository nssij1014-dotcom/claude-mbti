/**
 * 결과/유형 상세 페이지에서 조건 없이 항상 렌더링해야 하는 면책 문구입니다 (PRD 1.6,
 * CLAUDE.md 6장). 이 컴포넌트를 조건부로 숨기지 마세요.
 */
export function Disclaimer() {
  return (
    <p className="px-6 py-8 text-center text-xs leading-relaxed text-neutral-400">
      본 테스트는 재미를 위한 자가진단 콘텐츠이며, 공식 심리검사를 대체하지 않습니다. 공식
      MBTI(Myers-Briggs Type Indicator®)와는 무관한 자체 제작 콘텐츠입니다.
    </p>
  );
}
