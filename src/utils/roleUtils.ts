//src/utils/roleUtils.ts
const roles = {
  owner: 'Владелец',
  mentor: 'Наставник',
  editor: 'Редактор',
  member: 'Участник',
  guest: 'Гость'
};

export const translateRole = (role: keyof typeof roles): string => {
  return roles[role] || role;
};

export type UserRole = keyof typeof roles;