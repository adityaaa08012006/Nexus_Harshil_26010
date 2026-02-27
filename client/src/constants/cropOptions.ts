// ─── Shared Agricultural Constants ──────────────────────────────────────────
// Used across: RequirementUpload, Inventory BatchModal, AllocationRequest, FarmerManagement

export const CROP_OPTIONS = [
  "Rice",
  "Wheat",
  "Maize",
  "Barley",
  "Millet",
  "Tomato",
  "Onion",
  "Potato",
  "Cabbage",
  "Cauliflower",
  "Carrot",
  "Peas",
  "Mango",
  "Apple",
  "Banana",
  "Grapes",
  "Orange",
  "Papaya",
  "Guava",
  "Lentils",
  "Chickpeas",
  "Kidney Beans",
  "Black Gram",
  "Green Gram",
  "Groundnut",
  "Soybean",
  "Sunflower",
  "Mustard",
  "Turmeric",
  "Chili",
  "Coriander",
  "Cumin",
  "Ginger",
  "Garlic",
  "Cotton",
  "Sugarcane",
  "Tea",
  "Coffee",
  "Other",
] as const;

export const UNIT_OPTIONS = [
  "kg",
  "quintal",
  "tonne",
  "bags",
  "crates",
  "boxes",
  "pieces",
] as const;

export const GRADE_OPTIONS = [
  "Grade A",
  "Grade B",
  "Grade C",
  "Premium",
  "Standard",
  "Organic",
  "No specification",
] as const;

export type CropOption = (typeof CROP_OPTIONS)[number];
export type UnitOption = (typeof UNIT_OPTIONS)[number];
export type GradeOption = (typeof GRADE_OPTIONS)[number];
