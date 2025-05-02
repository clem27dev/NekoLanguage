# Exécution réelle des applications nekoScript

nekoScript permet de créer et d'exécuter des applications réelles comme:
- Des bots Discord
- Des applications web
- Des jeux

Ce guide vous explique comment utiliser ces fonctionnalités.

## Utilisation de la commande `démarrer`

Pour exécuter une application en mode persistant (qui continue à fonctionner après la fin du script), utilisez la commande `démarrer`:

```bash
neko-script démarrer mon-application.neko
```

Cette commande lance l'application et la maintient active en arrière-plan. Vous pouvez fermer votre terminal et l'application continuera à s'exécuter.

## Bots Discord avec nekoScript

### Exemple de bot Discord

Voici un exemple simple de bot Discord en nekoScript:

```
// bot-discord.neko
nekModule MonBot {
  // Importer le module Discord
  nekImporter Discord;
  
  // Configuration
  nekVariable TOKEN = "VOTRE_TOKEN_DISCORD"; // Remplacez par votre token Discord
  nekVariable PREFIX = "!"; // Préfixe pour les commandes
  
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du bot Discord...");
    
    // Créer le bot
    nekVariable bot = Discord.Bot(TOKEN);
    
    // Gérer les commandes avec un préfixe
    bot.surCommande(PREFIX, (commande) => {
      // Commande ping
      si (commande.nom === "ping") {
        commande.repondre("Pong! 🏓");
      }
      
      // Commande info
      si (commande.nom === "info") {
        commande.repondre(`Bonjour ${commande.auteur.nom}! Je suis un bot nekoScript.`);
      }
    });
    
    // Démarrer le bot
    bot.démarrer();
    nekAfficher("Bot démarré et connecté à Discord!");
  }
}
```

### Configuration et exécution

1. Créez une application sur le [Portail des développeurs Discord](https://discord.com/developers/applications).
2. Créez un bot et copiez son token.
3. Remplacez `VOTRE_TOKEN_DISCORD` dans le code par votre token réel.
4. Exécutez le bot avec:
   ```bash
   neko-script démarrer bot-discord.neko
   ```

### Fonctionnalités supportées

- `bot.surMessage(fn)`: Réagir à tous les messages
- `bot.surCommande(prefix, fn)`: Réagir aux commandes avec un préfixe
- `bot.surReaction(fn)`: Réagir aux réactions d'emoji
- `bot.changerStatut(message, type)`: Changer le statut du bot
- `bot.créerEmbed(titre, description, couleur)`: Créer un message embed
- `bot.démarrer()`: Connecter le bot à Discord

## Applications Web avec nekoScript

### Exemple d'application web

Voici un exemple d'application web en nekoScript:

```
// web-app.neko
nekModule MonSite {
  // Importer le module Web
  nekImporter Web;
  
  // Configuration
  nekVariable PORT = 3000;
  
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du serveur web...");
    
    // Créer l'application Express
    nekVariable app = Web.Express();
    
    // Servir des fichiers statiques
    app.utiliser(Web.Static("./public"));
    
    // Route principale
    app.route("GET", "/", (req, res) => {
      res.envoyer(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Mon Site nekoScript</title>
          <style>
            body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Bienvenue sur mon site nekoScript!</h1>
          <p>Cette page est servie par un vrai serveur Express via nekoScript.</p>
        </body>
        </html>
      `);
    });
    
    // API JSON
    app.route("GET", "/api/info", (req, res) => {
      res.json({
        nom: "Mon API nekoScript",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      });
    });
    
    // Démarrer le serveur
    app.écouter(PORT, () => {
      nekAfficher(`Serveur démarré sur http://localhost:${PORT}`);
    });
  }
}
```

### Configuration et exécution

1. Assurez-vous que la dépendance Express est installée:
   ```bash
   npm install express
   ```
2. Créez un dossier `public` pour les fichiers statiques si nécessaire.
3. Démarrez l'application web:
   ```bash
   neko-script démarrer web-app.neko
   ```

### Fonctionnalités supportées

- `app.route(méthode, chemin, gestionnaire)`: Définir une route avec une méthode HTTP
- `app.utiliser(middleware)`: Utiliser un middleware Express
- `app.écouter(port, callback)`: Démarrer le serveur sur un port
- `Web.Static(chemin)`: Servir des fichiers statiques depuis un dossier

## Jeux avec nekoScript

### Exemple de jeu

Voici un exemple de jeu simple en nekoScript:

```
// jeu.neko
nekModule MonJeu {
  // Importer le module de jeu
  nekImporter NekoJeu;
  
  // Configuration
  nekVariable LARGEUR = 800;
  nekVariable HAUTEUR = 600;
  nekVariable TITRE = "Mon Jeu nekoScript";
  
  nekFonction nekPrincipal() {
    nekAfficher("Initialisation du jeu...");
    
    // Créer le canvas de jeu
    nekVariable jeu = NekoJeu.Canvas(LARGEUR, HAUTEUR, TITRE);
    
    // Variables du jeu
    nekVariable score = 0;
    nekVariable joueurX = LARGEUR / 2;
    nekVariable joueurY = HAUTEUR - 50;
    
    // Créer le joueur (sera représenté selon la disponibilité de canvas)
    nekVariable joueur = jeu.créerSprite("joueur.png", joueurX, joueurY, 50, 50);
    
    // Gestion des touches
    jeu.surTouche("ArrowLeft", (estAppuyée) => {
      si (estAppuyée) {
        joueurX = Math.max(0, joueurX - 5);
        joueur.nekBouger(joueurX - joueur.x, 0);
      }
    });
    
    jeu.surTouche("ArrowRight", (estAppuyée) => {
      si (estAppuyée) {
        joueurX = Math.min(LARGEUR - 50, joueurX + 5);
        joueur.nekBouger(joueurX - joueur.x, 0);
      }
    });
    
    // Boucle de jeu
    jeu.surMiseAJour(() => {
      // Afficher le score
      jeu.afficherTexte("Score: " + score, 10, 30, "white");
      
      // Incrémenter le score
      score += 1;
    });
    
    // Démarrer le jeu
    jeu.démarrer();
    nekAfficher("Jeu démarré!");
  }
}
```

### Configuration et exécution

1. Assurez-vous que la dépendance Canvas est installée pour de meilleurs résultats:
   ```bash
   npm install canvas
   ```
2. Préparez vos assets (images) si nécessaire.
3. Démarrez le jeu:
   ```bash
   neko-script démarrer jeu.neko
   ```

### Fonctionnalités supportées

- `jeu.créerSprite(image, x, y, largeur, hauteur)`: Créer un sprite
- `jeu.surTouche(touche, gestionnaire)`: Réagir aux touches du clavier
- `jeu.afficherTexte(texte, x, y, couleur)`: Afficher du texte
- `jeu.dessinerRectangle(x, y, largeur, hauteur, couleur)`: Dessiner un rectangle
- `jeu.surMiseAJour(fn)`: Définir la fonction de boucle de jeu
- `jeu.démarrer()`: Démarrer le jeu

## Gestion des processus

### Lister les applications en cours d'exécution

Pour voir toutes les applications nekoScript actives:

```bash
neko-script processus
```

Cela affiche une liste de toutes les applications avec leur ID, type, et temps d'exécution.

### Arrêter une application

Pour arrêter une application en cours d'exécution:

```bash
neko-script arrêter <id>
```

Remplacez `<id>` par l'ID de l'application que vous souhaitez arrêter.

## Dépendances et prérequis

Pour les fonctionnalités avancées, assurez-vous d'avoir les dépendances appropriées:

- Bots Discord: `npm install discord.js`
- Applications web: `npm install express`
- Jeux: `npm install canvas`

nekoScript vérifiera automatiquement ces dépendances et vous avertira si elles sont manquantes.

## Utilisation de .env pour les secrets

Pour les tokens et autres secrets, nous vous recommandons d'utiliser un fichier `.env`:

```
# .env
DISCORD_TOKEN=votre_token_discord
API_KEY=votre_clé_api
```

Puis dans votre code nekoScript:

```
nekVariable TOKEN = process.env.DISCORD_TOKEN;
```

## Conclusion

Avec nekoScript, vous pouvez maintenant créer de véritables applications qui communiquent avec le monde extérieur. Explorez ces fonctionnalités et créez des bots, des sites web et des jeux en français avec une syntaxe simple et intuitive!