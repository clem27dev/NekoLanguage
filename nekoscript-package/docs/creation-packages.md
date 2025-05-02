# Création de Packages nekoScript

Ce document explique comment créer et publier vos propres packages pour nekoScript. Les packages permettent de partager du code réutilisable avec d'autres développeurs.

## Table des matières

1. [Introduction](#introduction)
2. [Anatomie d'un package](#anatomie-dun-package)
3. [Création d'un package](#création-dun-package)
4. [Publication d'un package](#publication-dun-package)
5. [Utilisation des packages](#utilisation-des-packages)
6. [Packages JavaScript vs nekoScript](#packages-javascript-vs-nekoscript)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Exemples](#exemples)

## Introduction

Les packages nekoScript permettent aux développeurs de partager des fonctionnalités réutilisables. Vous pouvez créer des packages pour:

- Des fonctions utilitaires (mathématiques, manipulation de chaînes, etc.)
- Des composants d'interface utilisateur pour applications web
- Des modules pour la création de bots Discord
- Des bibliothèques pour le développement de jeux
- Et bien plus encore!

## Anatomie d'un package

Un package nekoScript est composé de:

- Un module principal qui exporte des fonctions et des classes
- Des dépendances (autres packages nécessaires)
- Des métadonnées (nom, version, description, etc.)

## Création d'un package

### 1. Créer un fichier .neko

Commencez par créer un fichier avec l'extension `.neko`:

```bash
neko-script create mon-package.neko
```

### 2. Définir un module

Votre package doit contenir un module principal:

```
nekModule MonPackage {
  // Importer les dépendances nécessaires
  nekImporter Base;
  
  // Variables exportées
  nekVariable VERSION = "1.0.0";
  
  // Fonctions exportées
  nekFonction maFonction(param) {
    // Implémentation
    nekRetourner param * 2;
  }
  
  // Classes exportées
  nekClasse MaClasse {
    constructor() {
      this.valeur = 42;
    }
    
    méthode() {
      nekRetourner this.valeur;
    }
  }
}
```

### 3. Tester votre package

Avant de publier votre package, testez-le localement:

```bash
neko-script execute mon-package.neko
```

## Publication d'un package

Pour publier votre package et le rendre disponible pour d'autres développeurs:

```bash
neko-script publish mon-package.neko nom-package
```

Par exemple:

```bash
neko-script publish math-utils.neko MathUtils
```

Le nom du package est ce que les autres développeurs utiliseront pour l'importer, il est donc recommandé d'utiliser un nom descriptif et unique.

## Utilisation des packages

Pour utiliser un package publié dans votre code:

```
nekModule MonApplication {
  // Importer le package
  nekImporter NomPackage;
  
  nekFonction nekPrincipal() {
    // Utiliser les fonctionnalités du package
    nekVariable resultat = NomPackage.maFonction(21);
    nekAfficher(resultat); // Affiche 42
    
    nekVariable instance = new NomPackage.MaClasse();
    nekAfficher(instance.méthode()); // Affiche 42
  }
}
```

## Packages JavaScript vs nekoScript

Vous pouvez publier des packages écrits en JavaScript ou en nekoScript:

### Package nekoScript (.neko)

Les packages nekoScript sont écrits dans la syntaxe nekoScript et sont plus intuitifs pour les développeurs nekoScript.

### Package JavaScript (.js)

Les packages JavaScript vous permettent d'utiliser toute la puissance de JavaScript et d'intégrer des bibliothèques externes:

```javascript
// math-utils.js
module.exports = {
  VERSION: "1.0.0",
  
  doubler: function(x) {
    return x * 2;
  },
  
  MathClass: class {
    constructor() {
      this.value = 42;
    }
    
    getValue() {
      return this.value;
    }
  }
};
```

Pour publier un package JavaScript:

```bash
neko-script publish math-utils.js MathUtils
```

## Bonnes pratiques

- **Nommez clairement vos fonctions et classes**: Utilisez des noms descriptifs qui reflètent ce que fait votre code.
- **Ajoutez une documentation**: Commentez votre code pour expliquer comment l'utiliser.
- **Testez exhaustivement**: Assurez-vous que votre package fonctionne correctement avant de le publier.
- **Respectez les conventions**: Utilisez le préfixe `nek` pour les fonctions principales.
- **Gestion des versions**: Mettez à jour la variable VERSION lorsque vous apportez des modifications.

## Exemples

### Exemple 1: Package utilitaire pour les chaînes de caractères

```
nekModule StringUtils {
  nekImporter Base;
  
  nekVariable VERSION = "1.0.0";
  
  // Fonction pour inverser une chaîne
  nekFonction nekInverser(texte) {
    nekRetourner texte.split('').reverse().join('');
  }
  
  // Fonction pour mettre en majuscules
  nekFonction nekMajuscules(texte) {
    nekRetourner texte.toUpperCase();
  }
  
  // Fonction pour mettre en minuscules
  nekFonction nekMinuscules(texte) {
    nekRetourner texte.toLowerCase();
  }
}
```

### Exemple 2: Package pour l'animation

```
nekModule Animation {
  nekImporter Base;
  
  nekVariable VERSION = "1.0.0";
  
  // Classe pour gérer les animations
  nekClasse Animation {
    constructor(durée, fonctionTemps = t => t) {
      this.durée = durée;
      this.fonctionTemps = fonctionTemps;
      this.démarré = false;
      this.tempsÉcoulé = 0;
      this.progression = 0;
    }
    
    démarrer() {
      this.démarré = true;
      this.tempsÉcoulé = 0;
      this.dernierTemps = Date.now();
    }
    
    mettreÀJour() {
      if (!this.démarré) nekRetourner 0;
      
      const maintenant = Date.now();
      this.tempsÉcoulé += maintenant - this.dernierTemps;
      this.dernierTemps = maintenant;
      
      if (this.tempsÉcoulé >= this.durée) {
        this.tempsÉcoulé = this.durée;
        this.démarré = false;
      }
      
      this.progression = this.fonctionTemps(this.tempsÉcoulé / this.durée);
      nekRetourner this.progression;
    }
    
    estTerminé() {
      nekRetourner !this.démarré && this.tempsÉcoulé > 0;
    }
  }
  
  // Fonctions d'interpolation
  nekVariable Interpolation = {
    linéaire: t => t,
    quadratique: t => t * t,
    cubique: t => t * t * t,
    sinusoïdale: t => 1 - Math.cos(t * Math.PI / 2)
  };
}
```

Pour publier ces packages:

```bash
neko-script publish string-utils.neko StringUtils
neko-script publish animation.neko Animation
```

Pour les utiliser:

```
nekModule MonApplication {
  nekImporter StringUtils;
  nekImporter Animation;
  
  nekFonction nekPrincipal() {
    // Utiliser StringUtils
    nekVariable texte = "Bonjour nekoScript!";
    nekAfficher(StringUtils.nekInverser(texte)); // "!tpircSoken ruojnoB"
    
    // Utiliser Animation
    nekVariable anim = new Animation.Animation(1000, Animation.Interpolation.sinusoïdale);
    anim.démarrer();
    // Puis utiliser anim.mettreÀJour() dans une boucle d'animation
  }
}
```