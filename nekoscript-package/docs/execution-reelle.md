# Exécution Réelle dans nekoScript

Ce document explique comment exécuter réellement du code nekoScript au lieu d'utiliser des simulations. L'interpréteur nekoScript peut désormais exécuter du vrai code et interagir avec des APIs externes.

## Table des matières

1. [Introduction](#introduction)
2. [Exécution de scripts simples](#exécution-de-scripts-simples)
3. [Exécution d'applications persistantes](#exécution-dapplications-persistantes)
4. [Bots Discord](#bots-discord)
5. [Applications Web](#applications-web)
6. [Jeux](#jeux)
7. [Dépannage](#dépannage)

## Introduction

nekoScript est maintenant capable d'exécuter réellement votre code au lieu de simplement simuler l'exécution. Cela signifie que vous pouvez créer des applications fonctionnelles comme:

- Des bots Discord qui interagissent avec de vrais serveurs
- Des applications web qui génèrent des pages HTML dynamiques
- Des jeux qui utilisent Canvas pour le rendu graphique

## Exécution de scripts simples

Pour exécuter un script nekoScript:

```bash
neko-script execute mon-script.neko
```

ou en utilisant la forme française:

```bash
neko-script exécuter mon-script.neko
```

## Exécution d'applications persistantes

Les applications comme les bots Discord, les serveurs web ou les jeux doivent continuer à fonctionner en arrière-plan. Pour démarrer une application persistante:

```bash
neko-script start mon-app.neko
```

ou en utilisant la forme française:

```bash
neko-script démarrer mon-app.neko
```

### Gestion des applications persistantes

Pour voir les applications en cours d'exécution:

```bash
neko-script processes
```

ou en français:

```bash
neko-script processus
```

Pour arrêter une application en cours d'exécution:

```bash
neko-script stop <id_processus>
```

ou en français:

```bash
neko-script arrêter <id_processus>
```

## Bots Discord

Pour créer un bot Discord fonctionnel avec nekoScript, vous devez:

1. Créer une application sur le [Portail Développeur Discord](https://discord.com/developers/applications)
2. Récupérer le token de votre bot
3. Créer un script nekoScript qui utilise ce token

Exemple:

```
// bot-discord.neko
nekModule MonBot {
  // Importer les packages nécessaires
  nekImporter Base;
  nekImporter Discord;
  
  // Configuration du bot
  nekVariable TOKEN = "VOTRE_TOKEN_DISCORD"; // Remplacer par votre token
  nekVariable PREFIX = "!";
  
  // Fonction principale
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du bot Discord...");
    
    // Créer le bot
    nekVariable bot = Discord.créerBot(TOKEN);
    
    // Configurer les événements
    bot.surMessage(message => {
      si (message.contenu === PREFIX + "ping") {
        message.répondre("Pong! 🏓");
      }
    });
    
    // Démarrer le bot
    bot.démarrer();
    
    nekRetourner "Bot démarré avec succès";
  }
}
```

Pour démarrer le bot:

```bash
neko-script démarrer bot-discord.neko
```

## Applications Web

nekoScript permet de créer des applications web avec une syntaxe simplifiée basée sur Express.js.

Exemple:

```
// web-app.neko
nekModule MonSite {
  // Importer les packages nécessaires
  nekImporter Base;
  nekImporter Web;
  
  // Configuration
  nekVariable PORT = 3000;
  
  // Fonction principale
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du serveur web...");
    
    // Créer le serveur
    nekVariable app = Web.créerServeur();
    
    // Configurer les routes
    app.créerRoute("accueil", "GET", "/", (requête, réponse) => {
      réponse.envoyerHTML("<h1>Bienvenue sur mon site nekoScript!</h1>");
    });
    
    app.créerRoute("api", "GET", "/api", (requête, réponse) => {
      réponse.envoyerJSON({ message: "Bonjour depuis l'API!" });
    });
    
    // Démarrer le serveur
    app.démarrer(PORT);
    
    nekRetourner "Serveur démarré sur le port " + PORT;
  }
}
```

Pour démarrer l'application web:

```bash
neko-script démarrer web-app.neko
```

## Jeux

nekoScript permet de créer des jeux simples avec Canvas.

Exemple:

```
// mon-jeu.neko
nekModule MonJeu {
  // Importer les packages nécessaires
  nekImporter Base;
  nekImporter NekoJeu;
  
  // Configuration
  nekVariable LARGEUR = 800;
  nekVariable HAUTEUR = 600;
  
  // Fonction principale
  nekFonction nekPrincipal() {
    nekAfficher("Initialisation du jeu...");
    
    // Créer le jeu
    nekVariable jeu = NekoJeu.créerJeu("Mon jeu", LARGEUR, HAUTEUR);
    
    // Variables du jeu
    nekVariable x = LARGEUR / 2;
    nekVariable y = HAUTEUR / 2;
    
    // Fonction de mise à jour
    nekFonction miseAJour(ctx) {
      // Effacer le canvas
      ctx.clearRect(0, 0, LARGEUR, HAUTEUR);
      
      // Dessiner un cercle
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Déplacer le cercle
      x += (Math.random() - 0.5) * 5;
      y += (Math.random() - 0.5) * 5;
      
      // Garder le cercle dans les limites
      x = Math.max(20, Math.min(x, LARGEUR - 20));
      y = Math.max(20, Math.min(y, HAUTEUR - 20));
    }
    
    // Démarrer le jeu
    jeu.démarrer(miseAJour);
    
    nekRetourner "Jeu démarré avec succès";
  }
}
```

Pour démarrer le jeu:

```bash
neko-script démarrer mon-jeu.neko
```

## Dépannage

Si vous rencontrez des problèmes avec l'exécution de votre code nekoScript:

1. **Vérifiez votre syntaxe**: Assurez-vous que votre code nekoScript est correctement formaté et ne contient pas d'erreurs de syntaxe.

2. **Vérifiez les dépendances**: Assurez-vous que vous avez importé tous les packages nécessaires.

3. **Tokens et clés API**: Pour les bots Discord ou les applications qui utilisent des APIs externes, assurez-vous d'avoir des tokens valides.

4. **Journaux d'erreurs**: Consultez les messages d'erreur affichés dans la console pour identifier les problèmes.

5. **Réinitialisation**: Si une application persiste en arrière-plan et ne répond plus, utilisez `neko-script arrêter <id>` pour l'arrêter.

Si vous avez besoin d'aide supplémentaire, consultez la documentation complète ou rejoignez notre communauté sur Discord pour obtenir de l'assistance.