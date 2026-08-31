import type { Metadata } from "next";
import { TestRunner } from "@/features/test/TestRunner";

export const metadata: Metadata = {
  title: "테스트 진행중",
};

export default function TestPage() {
  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <TestRunner />
    </main>
  );
}
