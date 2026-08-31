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
    <main className="mx-auto min-h-screen max-w-md px-6 py-10">
      <h1 className="mb-1 text-2xl font-extrabold">궁합 보기</h1>
      <p className="mb-8 text-sm text-neutral-500">두 유형을 골라 궁합을 확인해보세요</p>

      <div className="flex flex-col gap-4">
        <TypeSelect label="내 유형" value={typeA} onChange={setTypeA} />
        <TypeSelect label="상대 유형" value={typeB} onChange={setTypeB} />

        <button
          onClick={handleSubmit}
          className="mt-4 min-h-11 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
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
    <label className="flex flex-col gap-1 text-sm text-neutral-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-xl border border-neutral-300 bg-white px-3 text-base text-neutral-900"
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
