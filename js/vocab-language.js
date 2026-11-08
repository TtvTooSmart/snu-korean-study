// Meanings travel with the book data; quizzes work offline in all four languages.
export const studyLanguages = ['en', 'vi', 'zh', 'ru'];
export function meaning(card, language = 'en') {
 return language === 'en' ? card.en : card.translations?.[language] || card.en;
}
export function hasMeaning(card, language) {
 return language === 'en' || !!card.translations?.[language]?.trim();
}
export function directionLabel(reverse, language = 'en') {
 const names = {
  en: ['Korean → English', 'English → Korean'],
  vi: ['Tiếng Hàn → Tiếng Việt', 'Tiếng Việt → Tiếng Hàn'],
  zh: ['韩语 → 中文', '中文 → 韩语'],
  ru: ['Корейский → Русский', 'Русский → Корейский']
 };
 return (names[language] || names.en)[Number(reverse)];
}
export function choicePrompt(reverse, language = 'en') {
 const labels = {
  en: ['Choose the correct English meaning', 'Choose the correct Korean word'],
  vi: ['Chọn nghĩa tiếng Việt đúng', 'Chọn từ tiếng Hàn đúng'],
  zh: ['选择正确的中文释义', '选择正确的韩语词语'],
  ru: ['Выберите правильное значение по-русски', 'Выберите правильное корейское слово']
 };
 return (labels[language] || labels.en)[Number(reverse)];
}
export const translationFallback = '<p class="banner">Translation unavailable for this card or its choices. English is shown.</p>';
