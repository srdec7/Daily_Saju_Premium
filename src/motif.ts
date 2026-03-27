export const motifs: Record<string, string> = {
  // 木 Wood — bamboo stalks with nodes
  wood: `<svg viewBox="0 0 100 100" class="svg-motif">
    <line x1="35" y1="90" x2="35" y2="10"/>
    <line x1="50" y1="90" x2="50" y2="10"/>
    <line x1="65" y1="90" x2="65" y2="10"/>
    <line x1="28" y1="70" x2="42" y2="70"/>
    <line x1="43" y1="50" x2="57" y2="50"/>
    <line x1="58" y1="30" x2="72" y2="30"/>
    <line x1="28" y1="40" x2="42" y2="40"/>
    <line x1="43" y1="75" x2="57" y2="75"/>
    <line x1="20" y1="85" x2="80" y2="85"/>
  </svg>`,

  // 火 Fire — triple-flame rising
  fire: `<svg viewBox="0 0 100 100" class="svg-motif">
    <path d="M50 90 Q30 72 32 55 Q36 40 50 35 Q45 48 52 52 Q58 40 54 22 Q70 40 68 57 Q66 72 50 90Z"/>
    <path d="M50 75 Q42 62 44 52 Q48 44 50 40 Q52 44 56 52 Q58 62 50 75Z"/>
    <line x1="25" y1="92" x2="75" y2="92"/>
  </svg>`,

  // 土 Earth — three-tier mountain
  earth: `<svg viewBox="0 0 100 100" class="svg-motif">
    <path d="M50 15 L72 50 L28 50Z"/>
    <path d="M50 42 L80 75 L20 75Z"/>
    <line x1="15" y1="85" x2="85" y2="85"/>
    <line x1="30" y1="85" x2="30" y2="75"/>
    <line x1="70" y1="85" x2="70" y2="75"/>
  </svg>`,

  // 金 Metal — concentric rings with cardinal lines
  metal: `<svg viewBox="0 0 100 100" class="svg-motif">
    <circle cx="50" cy="50" r="34"/>
    <circle cx="50" cy="50" r="22"/>
    <circle cx="50" cy="50" r="8"/>
    <line x1="50" y1="10" x2="50" y2="28"/>
    <line x1="50" y1="72" x2="50" y2="90"/>
    <line x1="10" y1="50" x2="28" y2="50"/>
    <line x1="72" y1="50" x2="90" y2="50"/>
  </svg>`,

  // 水 Water — three flowing arcs with drop
  water: `<svg viewBox="0 0 100 100" class="svg-motif">
    <path d="M15 42 Q32 28 50 42 Q68 56 85 42" fill="none"/>
    <path d="M15 57 Q32 43 50 57 Q68 71 85 57" fill="none"/>
    <path d="M15 72 Q32 58 50 72 Q68 86 85 72" fill="none"/>
    <path d="M50 10 Q56 20 56 26 Q56 33 50 33 Q44 33 44 26 Q44 20 50 10Z"/>
  </svg>`,
};

export function injectMotif(container: HTMLElement, element: string) {
  const motifSVG = motifs[element] || motifs['wood'];

  const wrapper = document.createElement('div');
  wrapper.className = 'motif-wrapper fade-hidden';
  wrapper.innerHTML = motifSVG;

  container.innerHTML = '';
  container.appendChild(wrapper);

  setTimeout(() => {
    wrapper.classList.add('fade-in');
    const pathEls = wrapper.querySelectorAll('path, circle, line');
    pathEls.forEach((el, i) => {
      (el as SVGElement).style.animation = `draw 2.4s ${i * 0.3}s ease-in-out forwards`;
    });
  }, 300);
}
