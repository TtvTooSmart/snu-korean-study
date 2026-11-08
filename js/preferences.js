// Keep older backups compatible while exposing four simple color choices.
export const themes = ['green', 'black', 'white', 'autumn'];
export function normalizeTheme(value) {
  return ({auto:'green', light:'white', dark:'black'})[value] || (themes.includes(value) ? value : 'green');
}
export function upgradePreferences(state) {
  const settings = {...state.settings, theme:normalizeTheme(state.settings?.theme)};
  // Apply the requested default once; later explicit choices remain the user's.
  if (!state.koreanDirectionDefault) settings.direction = 'ko';
  return {...state, settings, koreanDirectionDefault:true};
}
