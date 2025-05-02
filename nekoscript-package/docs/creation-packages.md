# Guide de création de packages nekoScript

Ce guide explique comment créer, publier et utiliser vos propres packages nekoScript.

## Qu'est-ce qu'un package nekoScript?

Un package nekoScript est un ensemble de fonctions et de variables réutilisables que vous pouvez importer dans vos projets nekoScript. Les packages permettent de partager du code et des fonctionnalités entre différents projets.

## Structure d'un package

Un package nekoScript suit une structure spécifique:

```
// Définition du module
nekModule NomDuPackage {
  // Variables et fonctions du module
  nekVariable version = "1.0.0";
  
  nekFonction maFonction(param1, param2) {
    // Code de la fonction
    retourner "Résultat";
  }
  
  // Fonctions internes (non exportées)
  nekFonction _fonctionInterne() {
    // Les fonctions commençant par _ sont considérées comme privées
  }
}

// Configuration des exports
nekExporter NomDuPackage {
  // Liste des éléments à exporter
  version,
  maFonction
  // _fonctionInterne n'est pas exportée
}
```

## Créer un package avec le CLI

Le moyen le plus simple de créer un package est d'utiliser la commande CLI:

```bash
neko-script créer-package MonPackage
```

Cette commande crée un dossier `MonPackage` avec:
- `MonPackage.neko`: fichier principal du package
- `README.md`: documentation du package
- `exemples/`: dossier contenant des exemples d'utilisation

## Structure du fichier principal

Le fichier principal de votre package doit contenir:

1. Un module avec le même nom que votre package
2. Les fonctions et variables que vous souhaitez fournir
3. Un bloc `nekExporter` qui définit ce qui sera accessible

## Exemple de package

Voici un exemple de package qui fournit des fonctions utilitaires pour travailler avec des tableaux:

```
// NekoTableaux.neko
nekModule NekoTableaux {
  nekVariable version = "1.0.0";
  nekVariable auteur = "Votre Nom";
  
  // Fonction pour trouver le maximum d'un tableau
  nekFonction maximum(tableau) {
    nekVariable max = tableau[0];
    
    pour (nekVariable i = 1; i < tableau.length; i++) {
      si (tableau[i] > max) {
        max = tableau[i];
      }
    }
    
    retourner max;
  }
  
  // Fonction pour trouver le minimum d'un tableau
  nekFonction minimum(tableau) {
    nekVariable min = tableau[0];
    
    pour (nekVariable i = 1; i < tableau.length; i++) {
      si (tableau[i] < min) {
        min = tableau[i];
      }
    }
    
    retourner min;
  }
  
  // Fonction pour calculer la moyenne d'un tableau
  nekFonction moyenne(tableau) {
    nekVariable somme = 0;
    
    pour (nekVariable i = 0; i < tableau.length; i++) {
      somme += tableau[i];
    }
    
    retourner somme / tableau.length;
  }
  
  // Fonction interne pour valider un tableau (non exportée)
  nekFonction _validerTableau(tableau) {
    si (!tableau || tableau.length === 0) {
      lancer "Le tableau ne peut pas être vide";
    }
    
    retourner vrai;
  }
}

// Exports du module
nekExporter NekoTableaux {
  version,
  auteur,
  maximum,
  minimum,
  moyenne
  // _validerTableau n'est pas exporté car considéré comme privé
}
```

## Publier un package

Pour publier votre package sur le registre nekoScript:

```bash
neko-script publier MonPackage MonPackage/MonPackage.neko "Description de mon package"
```

## Packages JavaScript

Vous pouvez également créer des packages en JavaScript pur et les publier pour nekoScript. Cela permet d'utiliser toute la puissance de JavaScript et de Node.js dans vos packages.

Créez un fichier `.js` avec la structure suivante:

```javascript
// MonPackageJS.js
module.exports = {
  version: "1.0.0",
  
  maFonction: function(param1, param2) {
    // Code JavaScript
    return "Résultat";
  },
  
  autreExport: "Valeur"
};
```

Publiez-le comme un package nekoScript:

```bash
neko-script publier MonPackageJS MonPackageJS.js "Un package écrit en JavaScript"
```

## Utilisation d'un package

Une fois votre package publié, vous pouvez l'utiliser dans n'importe quel script nekoScript:

```
// Importer le package
nekImporter NekoTableaux;

// Utiliser ses fonctions
nekVariable nombres = [5, 3, 8, 2, 9, 1];
nekVariable max = NekoTableaux.maximum(nombres);
nekVariable min = NekoTableaux.minimum(nombres);
nekVariable moy = NekoTableaux.moyenne(nombres);

nekAfficher("Maximum: " + max);
nekAfficher("Minimum: " + min);
nekAfficher("Moyenne: " + moy);
```

## Bonnes pratiques

1. **Documentation**: Fournissez toujours un README.md clair et des exemples d'utilisation.
2. **Nommage**: Utilisez un nom unique et descriptif pour votre package.
3. **Tests**: Testez votre package avec différents cas d'utilisation avant de le publier.
4. **Versionnage**: Utilisez la sémantique de version (majeur.mineur.correctif).
5. **Fonctions privées**: Préfixez par `_` les fonctions internes non destinées à être utilisées directement.

## Support des différentes plateformes

Si votre package utilise des fonctionnalités spécifiques (Discord, Web, etc.), indiquez-le clairement dans la documentation et ajoutez des vérifications appropriées.

---

Ce guide vous a fourni les bases pour créer vos propres packages nekoScript. Explorez la documentation complète pour plus d'informations sur les fonctionnalités avancées.