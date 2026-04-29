// Home page — server component, no interactivity here.
// FoodWheel is a client component that owns all spin state.
// Metadata is declared in layout.tsx; no override needed here.

import { FoodWheel } from "@/components/food-wheel";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6 gap-6 bg-gray-50">
      <div className="text-center pt-6">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          What To Eat?
        </h1>
        <p className="mt-2 text-gray-500 text-base">
          Can&apos;t decide? Let the wheel pick your next meal.
        </p>
      </div>

      <FoodWheel />
    </main>
  );
}
