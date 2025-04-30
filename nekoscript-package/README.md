# 🐱 nekoScript

Un langage de programmation en français conçu pour rendre le code plus accessible et intuitif pour les développeurs francophones.

![Logo nekoScript](https://github.com/clem27dev/NekoLanguage/raw/main/logo.png)

## Caractéristiques

- **Syntaxe française** : Programmez avec des mots-clés en français
- **Facile à apprendre** : Idéal pour les débutants et les étudiants
- **Polyvalent** : Créez des sites web, des jeux et des bots Discord
- **Extensible** : Ajoutez vos propres bibliothèques et partagez-les avec la communauté

## Installation

Vous pouvez installer nekoScript de plusieurs façons :

### Via npm (recommandé)

```bash
npm install -g nekoscript
```

### Via script d'installation

```bash
curl -fsSL https://get.nekoscript.fr | sh
```

### Manuellement depuis GitHub

```bash
git clone https://github.com/clem27dev/NekoLanguage.git
cd NekoLanguage
npm install
npm link
```

## Utilisation rapide

### Créer un nouveau projet

```bash
neko-script initialiser mon-projet
cd mon-projet
```

### Installer une bibliothèque

```bash
neko-script librairie Web
```

### Exécuter un programme

```bash
neko-script exécuter index.neko
```

## Exemples de code

### Exemple simple

```javascript
// hello.neko
nekModule MonPremierModule {
  nekImporter Base;
  
  nekVariable message = "Bonjour, monde!";
  
  nekFonction nekPrincipal() {
    nekAfficher(message);
    nekRetourner "Programme exécuté avec succès";
  }
}
```

### Bot Discord

```javascript
// discordbot.neko
nekModule MonBot {
  nekImporter Base;
  nekImporter Discord;
  
  nekVariable token = "mon-token-secret";
  
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du bot...");
    
    // Créer un bot Discord
    const bot = créerBot(token);
    
    // Réagir aux messages
    surMessage(message => {
      nekAfficher("Message reçu: " + message.contenu);
      
      // Répondre aux commandes
      nekSi (message.contenu == "!bonjour") {
        nekAfficher("Bonjour " + message.auteur + "!");
      }
    });
    
    nekRetourner "Bot démarré avec succès";
  }
}
```

## Documentation complète

Pour une documentation complète, visitez [https://docs.nekoscript.fr](https://docs.nekoscript.fr)

## Créer et publier vos propres packages

Vous pouvez créer vos propres packages pour nekoScript et les partager avec la communauté :

```bash
# Créer un fichier pour votre package
neko-script créer MonPackage.neko

# Éditer le fichier à votre convenance
# ...

# Publier le package
neko-script publier MonPackage "Description de mon package"
```

## Contribuer

Nous accueillons avec plaisir les contributions à nekoScript ! Consultez notre [guide de contribution](https://github.com/clem27dev/NekoLanguage/blob/main/CONTRIBUTING.md) pour plus d'informations.

## Licence

nekoScript est sous licence MIT. Voir le fichier [LICENSE](https://github.com/clem27dev/NekoLanguage/blob/main/LICENSE) pour plus de détails.