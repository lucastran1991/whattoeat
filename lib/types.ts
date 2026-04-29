// Category union — 10 cuisine categories, used as discriminant on Dish
export type Category =
  | "vietnamese"
  | "seafood"
  | "street_food"
  | "indian"
  | "thai"
  | "lao"
  | "japanese"
  | "italian"
  | "western"
  | "mexican";

// Core domain type
export interface Dish {
  name: string;
  category: Category;
}

// Ordered list for iteration (wheel slices, filter chips, etc.)
export const CATEGORY_LIST: readonly Category[] = [
  "vietnamese",
  "seafood",
  "street_food",
  "indian",
  "thai",
  "lao",
  "japanese",
  "italian",
  "western",
  "mexican",
] as const;

// Human-readable labels for display
export const CATEGORY_LABELS: Record<Category, string> = {
  vietnamese: "Vietnamese",
  seafood: "Seafood",
  street_food: "Street Food",
  indian: "Indian",
  thai: "Thai",
  lao: "Lao",
  japanese: "Japanese",
  italian: "Italian",
  western: "Western",
  mexican: "Mexican",
};

// Mid-tone hex colors with good white-text contrast (WCAG AA ≥ 4.5:1 target)
// Tailwind 500-600 range provides ~4.5:1 against white for most hues
export const CATEGORY_COLORS: Record<Category, string> = {
  vietnamese: "#ef4444", // red-500
  seafood: "#0ea5e9", // sky-500
  street_food: "#f97316", // orange-500
  indian: "#ca8a04", // yellow-600 (yellow-500 fails contrast; 600 passes)
  thai: "#65a30d", // lime-600 (lime-500 fails contrast; 600 passes)
  lao: "#0d9488", // teal-600
  japanese: "#ec4899", // pink-500
  italian: "#16a34a", // green-600
  western: "#7c3aed", // violet-600
  mexican: "#f43f5e", // rose-500
};
