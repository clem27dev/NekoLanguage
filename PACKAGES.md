# Guide de création et publication de packages nekoScript

Ce guide vous explique comment créer et publier vos propres packages nekoScript pour les réutiliser dans vos projets ou les partager avec la communauté.

## Qu'est-ce qu'un package nekoScript ?

Un package nekoScript est un module réutilisable qui fournit des fonctionnalités prêtes à l'emploi pour vos projets nekoScript. Les packages peuvent être écrits en nekoScript ou en JavaScript standard.

## Types de packages

Vous pouvez créer deux types de packages :

1. **Packages nekoScript natifs** (.neko) - Écrits en langage nekoScript pur
2. **Packages JavaScript** (.js) - Écrits en JavaScript standard mais utilisables en nekoScript

## Comment créer un package nekoScript natif ?

### Étape 1: Créer un fichier .neko

Créez un fichier avec l'extension `.neko` qui servira de base à votre package. Par exemple `monpackage.neko` :

```
// Module personnalisé en nekoScript
nekModule MonModule {
  // Variables exportées
  nekVariable VERSION = "1.0.0";
  
  // Fonctions exportées
  nekFonction maFonction(parametres) {
    // Votre code ici
    retourner resultat;
  }
  
  nekFonction autreFunction() {
    // Autre code
  }
}
```

### Étape 2: Publier le package

Utilisez la commande `neko-script publish package` pour publier votre package :

```
neko-script publish package monpackage.neko MonPackage
```

Où :
- `monpackage.neko` est le chemin vers votre fichier nekoScript
- `MonPackage` est le nom que vous souhaitez donner à votre package dans le registre

## Comment créer un package JavaScript ?

### Étape 1: Créer un fichier .js

Créez un fichier JavaScript standard qui expose des fonctionnalités pour nekoScript :

```javascript
/**
 * Module JavaScript pour nekoScript
 */

// Classe ou fonctions à exposer
class MonModule {
  constructor() {
    this.version = "1.0.0";
  }
  
  maFonction(parametres) {
    // Votre code ici
    return resultat;
  }
}

// Exporter le module pour nekoScript
module.exports = new MonModule();
// OU
module.exports = {
  version: "1.0.0",
  maFonction: function(parametres) {
    // Code
  }
};
```

### Étape 2: Publier le package JavaScript

Utilisez la même commande que pour les packages nekoScript, mais avec un fichier .js :

```
neko-script publish package monmodule.js MonModule
```

## Comment utiliser un package ?

### Étape 1: Télécharger le package

Avant d'utiliser un package, vous devez le télécharger :

```
neko-script télécharger MonPackage
```

### Étape 2: Importer le package dans votre code

```
// Importer le package
importer MonPackage;

// Utiliser les fonctionnalités
MonPackage.maFonction(parametres);
```

## Commandes disponibles pour la gestion des packages

- **Publier un package** :
  ```
  neko-script publish package <fichier> <nom>
  ```

- **Télécharger un package** :
  ```
  neko-script télécharger <nom-package>
  ```

- **Lister les packages disponibles** :
  ```
  neko-script lister
  ```

- **Exécuter un script nekoScript** :
  ```
  neko-script run <fichier>
  ```

## Exemples de packages

Consultez le dossier `examples/` pour voir des exemples de packages prêts à l'emploi :

- `utils.neko` - Un module d'utilitaires en nekoScript pur
- `animation.js` - Un module d'animation en JavaScript
- `utilisation-package.neko` - Un exemple d'utilisation de packages

## Bonnes pratiques

1. **Documentation** : Documentez votre package avec des commentaires clairs
2. **Tests** : Testez votre package avant de le publier
3. **Versionnement** : Utilisez un système de versionnement semantique (X.Y.Z)
4. **Compatibilité** : Assurez-vous que votre package est compatible avec nekoScript
5. **Nommage** : Utilisez des noms clairs et descriptifs pour vos packages et fonctions