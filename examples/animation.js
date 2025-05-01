/**
 * Module nekoAnimation - Une bibliothèque d'animation pour nekoScript
 * Utilise JavaScript natif mais exporté comme un module nekoScript
 */

// Classe principale pour les animations
class NekoAnimation {
  constructor() {
    this.animations = {};
  }
  
  // Créer une animation de base
  creerAnimation(nom, duree, frames) {
    this.animations[nom] = {
      nom,
      duree,
      frames,
      jouer: (element, options = {}) => this.jouerAnimation(nom, element, options)
    };
    return this.animations[nom];
  }
  
  // Jouer une animation sur un élément DOM
  jouerAnimation(nom, element, options = {}) {
    const animation = this.animations[nom];
    if (!animation) {
      console.error(`Animation '${nom}' non trouvée`);
      return;
    }
    
    const { duree = animation.duree, repetitions = 1, surFin } = options;
    
    let frameIndex = 0;
    const frameCount = animation.frames.length;
    const frameInterval = duree / frameCount;
    let repetitionCount = 0;
    
    const animer = () => {
      if (!element) return;
      
      // Appliquer la frame courante
      const frame = animation.frames[frameIndex];
      Object.entries(frame).forEach(([prop, value]) => {
        element.style[prop] = value;
      });
      
      frameIndex++;
      
      // Vérifier si l'animation est terminée
      if (frameIndex >= frameCount) {
        repetitionCount++;
        
        // Vérifier si on doit répéter l'animation
        if (repetitionCount < repetitions || repetitions === -1) {
          frameIndex = 0;
          setTimeout(animer, frameInterval);
        } else if (surFin) {
          surFin(element);
        }
      } else {
        setTimeout(animer, frameInterval);
      }
    };
    
    // Démarrer l'animation
    animer();
  }
  
  // Animations prédéfinies
  
  // Animation de fondu
  fondu(element, options = {}) {
    const { duree = 1000, type = 'in', surFin } = options;
    
    const animation = type === 'in' ? 
      this.creerAnimation('fondu-in', duree, [
        { opacity: '0' },
        { opacity: '0.3' },
        { opacity: '0.7' },
        { opacity: '1' }
      ]) : 
      this.creerAnimation('fondu-out', duree, [
        { opacity: '1' },
        { opacity: '0.7' },
        { opacity: '0.3' },
        { opacity: '0' }
      ]);
    
    animation.jouer(element, { duree, surFin });
  }
  
  // Animation de déplacement
  deplacer(element, options = {}) {
    const { 
      duree = 1000, 
      depart = { x: 0, y: 0 }, 
      arrivee = { x: 100, y: 100 },
      surFin 
    } = options;
    
    // Créer les frames intermédiaires
    const frames = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const x = depart.x + (arrivee.x - depart.x) * ratio;
      const y = depart.y + (arrivee.y - depart.y) * ratio;
      
      frames.push({
        transform: `translate(${x}px, ${y}px)`
      });
    }
    
    const animation = this.creerAnimation('deplacer', duree, frames);
    animation.jouer(element, { duree, surFin });
  }
  
  // Animation de rebond
  rebond(element, options = {}) {
    const { duree = 1000, hauteur = 50, repetitions = 3, surFin } = options;
    
    const frames = [
      { transform: 'translateY(0)' },
      { transform: `translateY(-${hauteur}px)` },
      { transform: 'translateY(0)' },
      { transform: `translateY(-${hauteur * 0.6}px)` },
      { transform: 'translateY(0)' },
      { transform: `translateY(-${hauteur * 0.3}px)` },
      { transform: 'translateY(0)' }
    ];
    
    const animation = this.creerAnimation('rebond', duree, frames);
    animation.jouer(element, { duree, repetitions, surFin });
  }
}

// Exporter le module pour nekoScript
module.exports = new NekoAnimation();