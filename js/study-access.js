// The static textbook files remain public; study actions require an account.
export function studyRoute(requested, signedIn) {
 if (!signedIn) return requested === 'signup' ? 'signup' : 'signin';
 return requested || 'home';
}
