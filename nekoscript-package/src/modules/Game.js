/**
 * Module Game.neko
 * Ce module permet de créer des jeux 2D en nekoScript
 */

"use strict";

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Crée un module Game pour nekoScript
 * @returns {Map} Module exposant les fonctionnalités de jeux
 */
function createGameModule() {
  const gameModule = new Map();
  
  // Classe de jeu 2D de base
  gameModule.set('créerJeu', (largeur = 800, hauteur = 600, titre = 'Jeu nekoScript') => {
    // Créer le canvas pour le rendu
    const canvas = createCanvas(largeur, hauteur);
    const ctx = canvas.getContext('2d');
    
    // État du jeu
    const état = {
      largeur,
      hauteur,
      titre,
      éléments: [],
      touches: new Set(),
      sourisX: 0,
      sourisY: 0,
      sourisCliquée: false,
      tempsActuel: 0,
      tempsDernier: 0,
      deltaTemps: 0,
      enPause: false,
      estTerminé: false
    };
    
    // Fonction pour sauvegarder le canvas dans un fichier
    const sauvegarderImage = (nomFichier) => {
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(nomFichier, buffer);
    };
    
    // Fonction pour charger une image
    const chargerImage = async (cheminImage) => {
      try {
        return await loadImage(path.resolve(cheminImage));
      } catch (error) {
        console.error(`Erreur lors du chargement de l'image: ${error.message}`);
        return null;
      }
    };
    
    // Fonction pour ajouter un élément au jeu
    const ajouterÉlément = (élément) => {
      état.éléments.push(élément);
      return élément;
    };
    
    // Fonction pour créer un rectangle
    const créerRectangle = (x, y, largeur, hauteur, couleur = '#8c52ff') => {
      const rectangle = {
        type: 'rectangle',
        x,
        y,
        largeur,
        hauteur,
        couleur,
        vitesseX: 0,
        vitesseY: 0,
        
        dessiner: () => {
          ctx.fillStyle = rectangle.couleur;
          ctx.fillRect(rectangle.x, rectangle.y, rectangle.largeur, rectangle.hauteur);
        },
        
        mettreÀJour: (dt) => {
          rectangle.x += rectangle.vitesseX * dt;
          rectangle.y += rectangle.vitesseY * dt;
        },
        
        collision: (autre) => {
          return rectangle.x < autre.x + autre.largeur &&
                 rectangle.x + rectangle.largeur > autre.x &&
                 rectangle.y < autre.y + autre.hauteur &&
                 rectangle.y + rectangle.hauteur > autre.y;
        }
      };
      
      ajouterÉlément(rectangle);
      return rectangle;
    };
    
    // Fonction pour créer un cercle
    const créerCercle = (x, y, rayon, couleur = '#8c52ff') => {
      const cercle = {
        type: 'cercle',
        x,
        y,
        rayon,
        couleur,
        vitesseX: 0,
        vitesseY: 0,
        
        dessiner: () => {
          ctx.fillStyle = cercle.couleur;
          ctx.beginPath();
          ctx.arc(cercle.x, cercle.y, cercle.rayon, 0, Math.PI * 2);
          ctx.fill();
        },
        
        mettreÀJour: (dt) => {
          cercle.x += cercle.vitesseX * dt;
          cercle.y += cercle.vitesseY * dt;
        },
        
        collision: (autre) => {
          if (autre.type === 'cercle') {
            const dx = cercle.x - autre.x;
            const dy = cercle.y - autre.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < cercle.rayon + autre.rayon;
          } else {
            // Détection approximative pour les autres formes
            return cercle.x - cercle.rayon < autre.x + autre.largeur &&
                   cercle.x + cercle.rayon > autre.x &&
                   cercle.y - cercle.rayon < autre.y + autre.hauteur &&
                   cercle.y + cercle.rayon > autre.y;
          }
        }
      };
      
      ajouterÉlément(cercle);
      return cercle;
    };
    
    // Fonction pour créer un sprite
    const créerSprite = async (x, y, cheminImage, échelle = 1) => {
      const image = await chargerImage(cheminImage);
      
      if (!image) {
        console.error(`Impossible de charger l'image: ${cheminImage}`);
        return null;
      }
      
      const sprite = {
        type: 'sprite',
        x,
        y,
        image,
        largeur: image.width * échelle,
        hauteur: image.height * échelle,
        échelle,
        vitesseX: 0,
        vitesseY: 0,
        rotation: 0,
        
        dessiner: () => {
          ctx.save();
          ctx.translate(sprite.x + sprite.largeur / 2, sprite.y + sprite.hauteur / 2);
          ctx.rotate(sprite.rotation);
          ctx.drawImage(
            sprite.image, 
            -sprite.largeur / 2, 
            -sprite.hauteur / 2, 
            sprite.largeur, 
            sprite.hauteur
          );
          ctx.restore();
        },
        
        mettreÀJour: (dt) => {
          sprite.x += sprite.vitesseX * dt;
          sprite.y += sprite.vitesseY * dt;
        },
        
        collision: (autre) => {
          return sprite.x < autre.x + autre.largeur &&
                 sprite.x + sprite.largeur > autre.x &&
                 sprite.y < autre.y + autre.hauteur &&
                 sprite.y + sprite.hauteur > autre.y;
        }
      };
      
      ajouterÉlément(sprite);
      return sprite;
    };
    
    // Fonction pour créer du texte
    const créerTexte = (x, y, texte, taille = 20, couleur = '#000000', police = 'Arial') => {
      const élémentTexte = {
        type: 'texte',
        x,
        y,
        texte,
        taille,
        couleur,
        police,
        
        dessiner: () => {
          ctx.font = `${élémentTexte.taille}px ${élémentTexte.police}`;
          ctx.fillStyle = élémentTexte.couleur;
          ctx.fillText(élémentTexte.texte, élémentTexte.x, élémentTexte.y);
        },
        
        mettreÀJour: () => {
          // Pas de mouvement par défaut pour le texte
        }
      };
      
      ajouterÉlément(élémentTexte);
      return élémentTexte;
    };
    
    // Fonction pour effacer le canvas
    const effacer = (couleur = '#ffffff') => {
      ctx.fillStyle = couleur;
      ctx.fillRect(0, 0, état.largeur, état.hauteur);
    };
    
    // Fonction pour dessiner tous les éléments
    const dessiner = () => {
      effacer();
      
      for (const élément of état.éléments) {
        if (élément.dessiner) {
          élément.dessiner();
        }
      }
    };
    
    // Fonction pour mettre à jour tous les éléments
    const mettreÀJour = () => {
      // Calcul du delta temps
      état.tempsActuel = Date.now();
      état.deltaTemps = (état.tempsActuel - état.tempsDernier) / 1000;
      état.tempsDernier = état.tempsActuel;
      
      // Limite du delta temps pour éviter les comportements étranges
      if (état.deltaTemps > 0.1) état.deltaTemps = 0.1;
      
      // Mise à jour de chaque élément
      for (const élément of état.éléments) {
        if (élément.mettreÀJour) {
          élément.mettreÀJour(état.deltaTemps);
        }
      }
    };
    
    // Fonction pour démarrer la boucle de jeu
    const démarrer = (fonctionMiseÀJour) => {
      état.tempsDernier = Date.now();
      
      const boucleJeu = () => {
        if (!état.enPause && !état.estTerminé) {
          mettreÀJour();
          
          if (fonctionMiseÀJour) {
            fonctionMiseÀJour(état);
          }
          
          dessiner();
        }
        
        if (!état.estTerminé) {
          setTimeout(boucleJeu, 16); // ~60 FPS
        }
      };
      
      boucleJeu();
    };
    
    // Fonction pour terminer le jeu
    const terminer = () => {
      état.estTerminé = true;
    };
    
    // Fonction pour mettre en pause
    const basculerPause = () => {
      état.enPause = !état.enPause;
      return état.enPause;
    };

    // Créer un fichier HTML pour exécuter le jeu
    const exporterHTML = (cheminFichier) => {
      const htmlTemplate = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${état.titre}</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f0f0;
    }
    canvas {
      border: 1px solid #333;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="${état.largeur}" height="${état.hauteur}"></canvas>
  <script>
    // Code du jeu
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Ici sera inséré le code exporté du jeu
    
  </script>
</body>
</html>`;
      
      fs.writeFileSync(cheminFichier, htmlTemplate);
      console.log(`Fichier HTML exporté: ${cheminFichier}`);
    };
    
    // Retourner l'API du jeu
    return {
      canvas,
      ctx,
      état,
      créerRectangle,
      créerCercle,
      créerSprite,
      créerTexte,
      effacer,
      dessiner,
      mettreÀJour,
      démarrer,
      terminer,
      basculerPause,
      sauvegarderImage,
      chargerImage,
      exporterHTML
    };
  });
  
  return gameModule;
}

module.exports = { createGameModule };