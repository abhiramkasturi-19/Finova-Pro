export const EXPENSE_CATEGORIES = [
  { id: 'food',      label: 'Food',      emoji: '🍜', color: '#ECA72C' },
  { id: 'petrol',    label: 'Petrol',    emoji: '⛽', color: '#B10F2E' },
  { id: 'shopping',  label: 'Shopping',  emoji: '🛍️', color: '#9984D4' },
  { id: 'books',     label: 'Books',     emoji: '📚', color: '#EDE580' },
  { id: 'transport', label: 'Transport', emoji: '🚇', color: '#B3C0A4' },
  { id: 'health',    label: 'Health',    emoji: '💊', color: '#98CE00' },
  { id: 'bills',     label: 'Bills',     emoji: '⚡', color: '#3993DD' },
  { id: 'others',    label: 'Others',    emoji: '📦', color: '#221E22' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary',    label: 'Salary',    emoji: '💼', color: '#A3BFA8' },
  { id: 'freelance', label: 'Freelance', emoji: '💻', color: '#9984D4' },
  { id: 'gift',      label: 'Gift',      emoji: '🎁', color: '#ECA72C' },
  { id: 'others',    label: 'Others',    emoji: '📦', color: '#3993DD' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const BASE_COLORS = [...new Set(ALL_CATEGORIES.map(c => c.color))];

export const getCat = (id) =>
  ALL_CATEGORIES.find((c) => c.id === id) || ALL_CATEGORIES[7];
