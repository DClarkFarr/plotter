export type CharacterCustomAttributeDraft = {
  id: string;
  label: string;
  value: string;
};

export type CharacterListDraft = {
  id: string;
  label: string;
  items: string[];
  isDefault?: boolean;
};
