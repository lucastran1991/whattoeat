// Static dish list — single source of truth for all 40 dishes
// Edit this file to add/remove dishes; category must be a valid Category value
import type { Dish } from "@/lib/types";

export const DISHES: readonly Dish[] = [
  // Vietnamese (8)
  { name: "Mì Quảng", category: "vietnamese" },
  { name: "Bún mắm nêm", category: "vietnamese" },
  { name: "Bún bò Huế", category: "vietnamese" },
  { name: "Bánh canh", category: "vietnamese" },
  { name: "Cơm gà Đà Nẵng", category: "vietnamese" },
  { name: "Bánh tráng cuốn thịt heo", category: "vietnamese" },
  { name: "Bê thui", category: "vietnamese" },
  { name: "Bún thịt nướng", category: "vietnamese" },

  // Seafood (4)
  { name: "Hải sản nướng", category: "seafood" },
  { name: "Ốc hút", category: "seafood" },
  { name: "Ghẹ hấp", category: "seafood" },
  { name: "Mực nướng", category: "seafood" },

  // Street food (6)
  { name: "Bún đậu mắm tôm", category: "street_food" },
  { name: "Bánh nậm", category: "street_food" },
  { name: "Bánh bột lọc", category: "street_food" },
  { name: "Bánh xèo", category: "street_food" },
  { name: "Nem lụi", category: "street_food" },
  { name: "Bánh tráng kẹp", category: "street_food" },

  // Indian (4)
  { name: "Butter chicken", category: "indian" },
  { name: "Chicken tikka masala", category: "indian" },
  { name: "Biryani", category: "indian" },
  { name: "Naan", category: "indian" },

  // Thai (4)
  { name: "Tom yum", category: "thai" },
  { name: "Pad Thai", category: "thai" },
  { name: "Som tam", category: "thai" },
  { name: "Moo ping", category: "thai" },

  // Lao (2)
  { name: "Larb", category: "lao" },
  { name: "Sticky rice", category: "lao" },

  // Japanese (5)
  { name: "Sushi", category: "japanese" },
  { name: "Sashimi", category: "japanese" },
  { name: "Ramen", category: "japanese" },
  { name: "Udon", category: "japanese" },
  { name: "Donburi", category: "japanese" },

  // Italian (3)
  { name: "Pizza", category: "italian" },
  { name: "Pasta", category: "italian" },
  { name: "Lasagna", category: "italian" },

  // Western (3)
  { name: "Burger", category: "western" },
  { name: "Steak", category: "western" },
  { name: "BBQ", category: "western" },

  // Mexican (1)
  { name: "Taco", category: "mexican" },
] as const;
