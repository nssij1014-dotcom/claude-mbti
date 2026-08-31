"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DIMENSIONS, NEGATIVE_LETTER, POSITIVE_LETTER, type Dimension } from "@/lib/types";

interface RatioChartProps {
  ratios: Record<Dimension, number>;
}

const DIMENSION_LABEL: Record<Dimension, string> = {
  EI: "외향 · 내향",
  SN: "감각 · 직관",
  TF: "사고 · 감정",
  JP: "판단 · 인식",
};

const INK = "#17150f";
const LINE = "#e4dfcf";

/** 지표별 성향 비율을 가로 막대로 시각화합니다 (PRD 3.2). */
export function RatioChart({ ratios }: RatioChartProps) {
  const data = DIMENSIONS.map((dimension) => ({
    dimension,
    label: DIMENSION_LABEL[dimension],
    positive: ratios[dimension],
    negative: 100 - ratios[dimension],
    positiveLetter: POSITIVE_LETTER[dimension],
    negativeLetter: NEGATIVE_LETTER[dimension],
  }));

  return (
    <div className="flex flex-col gap-4">
      {data.map((row) => (
        <div key={row.dimension}>
          <div className="mb-1.5 flex justify-between text-sm font-semibold text-ink-soft">
            <span>{row.label}</span>
            <span>
              {row.positiveLetter} {row.positive}% · {row.negativeLetter} {row.negative}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={28}>
            <BarChart
              layout="vertical"
              data={[row]}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="dimension" hide />
              <Bar dataKey="positive" stackId="ratio" isAnimationActive={false}>
                <Cell fill={INK} />
                <LabelList
                  dataKey="positiveLetter"
                  position="insideLeft"
                  fill="#f7f4ec"
                  fontSize={12}
                  fontWeight={700}
                />
              </Bar>
              <Bar dataKey="negative" stackId="ratio" isAnimationActive={false}>
                <Cell fill={LINE} />
                <LabelList
                  dataKey="negativeLetter"
                  position="insideRight"
                  fill="#5b5646"
                  fontSize={12}
                  fontWeight={700}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
