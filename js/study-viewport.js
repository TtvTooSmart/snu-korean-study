// visualViewport also tracks the available space above the phone keyboard.
function updateStudyViewport() {
 const height = window.visualViewport?.height || window.innerHeight;
 document.documentElement.style.setProperty('--study-viewport', Math.round(height) + 'px');
}
window.addEventListener('resize', updateStudyViewport, {passive:true});
window.visualViewport?.addEventListener('resize', updateStudyViewport, {passive:true});
updateStudyViewport();
