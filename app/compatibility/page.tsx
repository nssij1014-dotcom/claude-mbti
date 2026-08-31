"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MBTI_TYPES } from "@/lib/data/mbtiTypes";

export default function CompatibilityPage() {
  const router = useRouter();
  const [typeA, setTypeA] = useState(MBTI_TYPES[0].code);
  const [typeB, setTypeB] = useState(MBTI_TYPES[1].code);

  function handleSubmit() {
    const pair = [typeA, typeB].sort().join("-").toLowerCase();
    router.push(`/compatibility/${pair}`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-paper px-6 py-14">
      <h1 className="reveal mb-2 text-4xl font-black tracking-tight text-ink">궁합 보기</h1>
      <p className="reveal mb-10 text-sm font-semibold text-ink-soft">
        두 유형을 골라 궁합을 확인해보세요
      </p>

      <div className="flex flex-col gap-5">
        <TypeSelect label="내 유형" value={typeA} onChange={setTypeA} />
        <TypeSelect label="상대 유형" value={typeB} onChange={setTypeB} />

        <button
          onClick={handleSubmit}
          className="mt-4 min-h-11 bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-accent hover:text-ink"
        >
          궁합 확인하기
        </button>
      </div>
    </main>
  );
}

function TypeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold tracking-[0.2em] text-ink-soft uppercase">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 border border-line bg-paper px-3 text-base font-semibold text-ink normal-case tracking-normal"
      >
        {MBTI_TYPES.map((type) => (
          <option key={type.code} value={type.code}>
            {type.code} · {type.nickname}
          </option>
        ))}
      </select>
    </label>
  );
}
