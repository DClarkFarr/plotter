export type CharacteristicKey =
  | "description"
  | "history"
  | "height"
  | "weight"
  | "age"
  | "hair"
  | "eyeColor"
  | "mantra"
  | "skinColor"
  | "build";

export const CHARACTERISTIC_LABELS: Record<CharacteristicKey, string> = {
  description: "Description",
  history: "History",
  height: "Height",
  weight: "Weight",
  age: "Age",
  hair: "Hair",
  eyeColor: "Eye Color",
  mantra: "Mantra",
  skinColor: "Skin Color",
  build: "Build",
};

export const DEFAULT_CHARACTERISTIC_ORDER: CharacteristicKey[] = [
  "description",
  "history",
  "height",
  "weight",
  "age",
  "hair",
  "eyeColor",
  "mantra",
  "skinColor",
  "build",
];

export const CHARACTERISTIC_TEXTAREA_KEYS: CharacteristicKey[] = [
  "description",
  "history",
];

export const CHARACTERISTIC_TEXT_KEYS: CharacteristicKey[] = [
  "height",
  "weight",
  "age",
  "hair",
  "eyeColor",
  "mantra",
  "skinColor",
  "build",
];

export const DEFAULT_CHARACTER_LIST_LABELS = [
  "strengths",
  "weaknesses",
] as const;

export type CharacterListLabel = (typeof DEFAULT_CHARACTER_LIST_LABELS)[number];
