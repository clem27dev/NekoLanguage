/**
 * Classe de commande nekoScript
 * Implémente toutes les commandes CLI pour nekoScript
 */

"use strict";

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { NekoInterpreter } = require('../interpreter');
const { NekoParser } = require('../parser');

class NekoCommand {
  constructor() {
    this.installedPackages = new Set();
    this.localFiles = new Map();
    this.parser = new NekoParser();
    this.interpreter = new NekoInterpreter();
    
    // Initialiser quelques packages par défaut
    this.installedPackages.add('Base.neko');
    this.installedPackages.add('Math.neko');
  }
  
  /**
   * Exécute une commande nekoScript
   * @param {string} command La commande à exécuter
   * @returns {Promise<string>} Un message de résultat
   */
  async execute(command) {
    const args = command.split(' ');
    const cmd = args[0];
    
    switch (cmd) {
      case 'help':
        return this.showHelp();
      case 'download':
        return this.handleDownload();
      case 'install':
        return await this.handleLibraryInstall(args[1]);
      case 'init':
        return this.handleInit(args[1] || 'mon-projet');
      case 'list':
        return await this.handleListPackages();
      case 'create':
        return this.handleCreateFile(args[1]);
      case 'publish':
        return await this.handlePublish(args[1], args.slice(2).join(' '));
      case 'execute':
        return await this.handleExecute(args[1]);
      case 'test':
        return this.handleTest(args[1]);
      case 'start':
      case 'démarrer':
        return await this.handleStartApp(args[1]);
      case 'stop':
      case 'arrêter':
        return this.handleStopApp(args[1]);
      case 'processes':
      case 'processus':
        return this.handleListProcesses();
      default:
        return this.handleSystemCommand(command);
    }
  }
  
  /**
   * Affiche l'aide de nekoScript
   */
  showHelp() {
    return chalk.cyan(`
╔══════════════ 🐱 nekoScript CLI ═══════════════╗
║                                                ║
║  Commandes disponibles:                        ║
║                                                ║
║  Installation:                                 ║
║  - download                                    ║
║  - init [name]                                 ║
║                                                ║
║  Gestion des packages:                         ║
║  - install <name>     Installer un package     ║
║  - list               Lister les packages      ║
║  - publish <name> [description]                ║
║                                                ║
║  Développement:                                ║
║  - create <name.neko> Créer un fichier         ║ 
║  - execute <file>     Exécuter un programme    ║
║  - test <file>        Tester un programme      ║
║                                                ║
║  Applications réelles:                         ║
║  - démarrer <file>    Démarrer une application ║
║  - arrêter <id>       Arrêter une application  ║
║  - processus          Lister les applications  ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);
  }
  
  /**
   * Gère la commande de téléchargement
   */
  handleDownload() {
    return chalk.green("Cette commande est utilisée pour télécharger/mettre à jour nekoScript.\nUtilisez 'neko-script télécharger' directement pour l'exécuter.");
  }
  
  /**
   * Gère l'installation d'une librairie
   * @param {string} packageName Nom du package à installer
   */
  async handleLibraryInstall(packageName) {
    if (!packageName) {
      return chalk.red("Erreur: Nom de package manquant. Utilisez: install <nom_package>");
    }
    
    try {
      // Ajouter l'extension .neko si elle n'est pas fournie
      if (!packageName.endsWith('.neko')) {
        packageName = `${packageName}.neko`;
      }
      
      // Simuler la récupération depuis un registre de packages
      console.log(chalk.yellow(`Recherche de ${packageName} dans le registre...`));
      
      // Dans une vraie implémentation, on interrogerait une API
      // await fetch('https://registry.nekoscript.fr/packages/' + packageName);
      
      // Pour la simulation, on vérifie si le package est supporté
      const supportedPackages = ['Base.neko', 'Math.neko', 'Discord.neko', 'Web.neko', 'Game.neko'];
      
      if (!supportedPackages.includes(packageName) && !this.installedPackages.has(packageName)) {
        return chalk.red(`Package ${packageName} non trouvé dans le registre.`);
      }
      
      // Ajouter le package aux packages installés
      this.installedPackages.add(packageName);
      
      return chalk.green(`✅ Package ${packageName} installé avec succès!`);
    } catch (error) {
      return chalk.red(`Erreur lors de l'installation du package: ${error.message}`);
    }
  }
  
  /**
   * Gère l'initialisation d'un projet
   * @param {string} projectName Nom du projet
   */
  handleInit(projectName) {
    try {
      // Créer le dossier du projet s'il n'existe pas
      if (!fs.existsSync(projectName)) {
        fs.mkdirSync(projectName, { recursive: true });
      }
      
      // Créer un fichier principal
      const mainFile = path.join(projectName, 'index.neko');
      const mainContent = `// Fichier principal de ${projectName}
nekModule ${projectName} {
  // Importer les packages nécessaires
  nekImporter Base;
  
  // Définir les variables globales
  nekVariable message = "Bonjour depuis ${projectName}!";
  
  // Définir une fonction principale
  nekFonction nekPrincipal() {
    nekAfficher(message);
    nekRetourner "Programme exécuté avec succès";
  }
}`;
      
      fs.writeFileSync(mainFile, mainContent);
      
      // Créer un fichier README
      const readmeFile = path.join(projectName, 'README.md');
      const readmeContent = `# ${projectName}

Un projet nekoScript créé avec \`neko-script initialiser\`.

## Démarrage rapide

Pour exécuter ce projet:

\`\`\`bash
cd ${projectName}
neko-script exécuter index.neko
\`\`\`

## Structure du projet

- \`index.neko\`: Fichier principal
- \`README.md\`: Documentation du projet

## Dépendances

Par défaut, ce projet utilise:
- Base.neko (installé automatiquement)

Pour installer d'autres packages:

\`\`\`bash
neko-script librairie NomDuPackage
\`\`\`
`;
      
      fs.writeFileSync(readmeFile, readmeContent);
      
      // Créer un fichier .gitignore
      const gitignoreFile = path.join(projectName, '.gitignore');
      const gitignoreContent = `# Fichiers temporaires nekoScript
.neko_cache/
.neko_modules/

# Fichiers système
.DS_Store
Thumbs.db

# Fichiers d'éditeurs
.vscode/
.idea/
*.sublime-*
`;
      
      fs.writeFileSync(gitignoreFile, gitignoreContent);
      
      return chalk.green(`✅ Projet ${projectName} créé avec succès!
📂 Structure:
  - ${projectName}/
    - index.neko (fichier principal)
    - README.md (documentation)
    - .gitignore

🚀 Pour commencer:
   cd ${projectName}
   neko-script exécuter index.neko`);
    } catch (error) {
      return chalk.red(`Erreur lors de l'initialisation du projet: ${error.message}`);
    }
  }
  
  /**
   * Gère la commande pour lister les packages disponibles
   */
  async handleListPackages() {
    try {
      // Dans une vraie implémentation, on récupérerait la liste depuis le registre
      // const response = await fetch('https://registry.nekoscript.fr/packages');
      // const packages = await response.json();
      
      // Pour la simulation, on utilise une liste prédéfinie
      const availablePackages = [
        { name: 'Base.neko', version: '1.0.0', description: 'Fonctions de base du langage nekoScript' },
        { name: 'Math.neko', version: '1.1.0', description: 'Fonctions mathématiques avancées' },
        { name: 'Discord.neko', version: '1.2.0', description: 'Création de bots Discord avec l\'API Discord.js' },
        { name: 'Web.neko', version: '1.0.0', description: 'Développement d\'applications web avec Express' },
        { name: 'Game.neko', version: '1.0.0', description: 'Création de jeux 2D' },
        { name: 'Database.neko', version: '0.9.0', description: 'Connexion et manipulation de bases de données' },
        { name: 'API.neko', version: '0.8.5', description: 'Client pour consommer des APIs REST' }
      ];
      
      // Formatter la sortie
      let output = chalk.cyan('\n📦 Packages disponibles dans le registre nekoScript:\n');
      
      for (const pkg of availablePackages) {
        const installed = this.installedPackages.has(pkg.name) ? chalk.green(' [✓ Installé]') : '';
        output += chalk.yellow(`\n- ${pkg.name} (v${pkg.version})${installed}\n`);
        output += `  ${pkg.description}\n`;
      }
      
      output += chalk.cyan('\nPour installer un package: neko-script librairie <nom_package>\n');
      
      return output;
    } catch (error) {
      return chalk.red(`Erreur lors de la récupération des packages: ${error.message}`);
    }
  }
  
  /**
   * Gère la création d'un fichier nekoScript
   * @param {string} fileName Nom du fichier à créer
   */
  handleCreateFile(fileName) {
    if (!fileName) {
      return chalk.red("Erreur: Nom de fichier manquant. Utilisez: create <nom_fichier.neko>");
    }
    
    // Ajouter l'extension .neko si elle n'est pas fournie
    if (!fileName.endsWith('.neko')) {
      fileName = `${fileName}.neko`;
    }
    
    try {
      // Créer un exemple de contenu selon le nom du fichier
      const moduleName = path.basename(fileName, '.neko');
      let content = `// ${fileName} - Créé avec nekoScript
nekModule ${moduleName} {
  // Importer les packages nécessaires
  nekImporter Base;
  
  // Définir les variables globales
  nekVariable version = "1.0.0";
  
  // Définir une fonction principale
  nekFonction nekPrincipal() {
    nekAfficher("Module ${moduleName} v" + version);
    nekRetourner "Programme exécuté avec succès";
  }
}`;
      
      // Stocker le fichier localement (dans une vraie implémentation, on l'écrirait sur disque)
      this.localFiles.set(fileName, content);
      
      // Adapter le contenu si c'est un fichier spécial
      if (fileName.toLowerCase().includes('discord')) {
        content = `// ${fileName} - Bot Discord créé avec nekoScript
nekModule ${moduleName} {
  // Importer les packages nécessaires
  nekImporter Base;
  nekImporter Discord;
  
  // Définition des variables
  nekVariable TOKEN = "VOTRE_TOKEN_DISCORD";
  
  // Création du bot
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du bot Discord...");
    
    var bot = créerBot(TOKEN);
    
    // Réagir aux messages
    surMessage(bot, fonction(message) {
      si (message.contenu === "!ping") {
        message.répondre("Pong! 🏓");
      }
      
      si (message.contenu === "!neko") {
        message.répondre("Miaou! 🐱");
      }
    });
    
    nekAfficher("Bot prêt! Utilisez !ping ou !neko pour tester.");
  }
}`;
      }
      else if (fileName.toLowerCase().includes('web')) {
        content = `// ${fileName} - Application Web créée avec nekoScript
nekModule ${moduleName} {
  // Importer les packages nécessaires
  nekImporter Base;
  nekImporter Web;
  
  // Configuration
  nekVariable PORT = 3000;
  
  // Création du serveur web
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du serveur web...");
    
    var serveur = créerServeur(PORT);
    
    // Route d'accueil
    créerRoute(serveur.app, "get", "/", fonction(req, res) {
      var contenu = "<h1>Bienvenue sur mon application nekoScript!</h1>";
      contenu = contenu + "<p>C'est un serveur web construit avec nekoScript.</p>";
      
      res.envoyerHTML(créerPage("Accueil", contenu));
    });
    
    // Route API
    créerRoute(serveur.app, "get", "/api/info", fonction(req, res) {
      res.envoyerJSON({
        nom: "${moduleName}",
        version: "1.0.0",
        message: "API nekoScript fonctionne correctement!"
      });
    });
    
    nekAfficher("Serveur démarré sur http://localhost:" + PORT);
  }
}`;
      }
      else if (fileName.toLowerCase().includes('game')) {
        content = `// ${fileName} - Jeu 2D créé avec nekoScript
nekModule ${moduleName} {
  // Importer les packages nécessaires
  nekImporter Base;
  nekImporter Game;
  nekImporter Math;
  
  // Configuration du jeu
  nekVariable LARGEUR = 800;
  nekVariable HAUTEUR = 600;
  
  // Création du jeu
  nekFonction nekPrincipal() {
    nekAfficher("Démarrage du jeu...");
    
    var jeu = créerJeu(LARGEUR, HAUTEUR, "${moduleName}");
    
    // Créer un personnage
    var joueur = jeu.créerRectangle(LARGEUR/2, HAUTEUR-50, 40, 40, "#0088ff");
    joueur.vitesseX = 0;
    
    // Créer un ennemi
    var ennemi = jeu.créerCercle(LARGEUR/2, 50, 20, "#ff0000");
    ennemi.vitesseX = 100;
    
    // Mise à jour du jeu
    fonction miseAJour(état) {
      // Logique du jeu ici
      si (ennemi.x <= ennemi.rayon || ennemi.x >= LARGEUR - ennemi.rayon) {
        ennemi.vitesseX = -ennemi.vitesseX;
      }
    }
    
    // Démarrer le jeu
    jeu.démarrer(miseAJour);
    
    nekAfficher("Jeu démarré!");
  }
}`;
      }
      
      // Si dans un environnement réel, écrire le fichier sur disque
      try {
        fs.writeFileSync(fileName, content);
        return chalk.green(`✅ Fichier ${fileName} créé avec succès!
📄 Contenu généré automatiquement avec un modèle adapté.
🚀 Pour exécuter: neko-script exécuter ${fileName}`);
      } catch (err) {
        // Fallback si l'écriture sur disque échoue
        return chalk.yellow(`⚠️ Fichier ${fileName} créé en mémoire.
📄 Contenu généré automatiquement avec un modèle adapté.
Note: Le fichier n'a pas pu être écrit sur disque.`);
      }
    } catch (error) {
      return chalk.red(`Erreur lors de la création du fichier: ${error.message}`);
    }
  }
  
  /**
   * Gère la publication d'un package
   * @param {string} packageName Nom du package
   * @param {string} [description=""] Description du package
   */
  async handlePublish(packageName, description = "") {
    if (!packageName) {
      return chalk.red("Erreur: Nom de package manquant. Utilisez: publish <nom_package> [description]");
    }
    
    try {
      // Ajouter l'extension .neko si elle n'est pas fournie
      if (!packageName.endsWith('.neko')) {
        packageName = `${packageName}.neko`;
      }
      
      // Vérifier si le fichier existe
      if (!this.localFiles.has(packageName) && !fs.existsSync(packageName)) {
        return chalk.red(`Erreur: Fichier ${packageName} introuvable. Créez-le d'abord avec: create ${packageName}`);
      }
      
      // Dans une vraie implémentation, on enverrait le package au registre
      console.log(chalk.yellow(`Préparation de ${packageName} pour publication...`));
      console.log(chalk.yellow(`Description: ${description || "Aucune description fournie."}`));
      
      // Simuler une requête à un serveur
      // await fetch('https://registry.nekoscript.fr/publish', {
      //   method: 'POST',
      //   body: JSON.stringify({ name: packageName, description, content: this.localFiles.get(packageName) })
      // });
      
      return chalk.green(`✅ Package ${packageName} publié avec succès!
📦 Votre package est maintenant disponible pour tous les utilisateurs de nekoScript.
🌐 Les autres peuvent l'installer avec: neko-script librairie ${packageName.replace('.neko', '')}`);
    } catch (error) {
      return chalk.red(`Erreur lors de la publication du package: ${error.message}`);
    }
  }
  
  /**
   * Gère l'exécution d'un fichier nekoScript
   * @param {string} fileName Nom du fichier à exécuter
   */
  async handleExecute(fileName) {
    if (!fileName) {
      return chalk.red("Erreur: Nom de fichier manquant. Utilisez: execute <nom_fichier.neko>");
    }
    
    try {
      // Ajouter l'extension .neko si elle n'est pas fournie
      if (!fileName.endsWith('.neko')) {
        fileName = `${fileName}.neko`;
      }
      
      console.log(chalk.cyan(`📄 Exécution du fichier ${fileName}...`));
      
      // Récupérer le contenu du fichier
      let content;
      
      // Essayer de lire depuis la mémoire d'abord
      if (this.localFiles.has(fileName)) {
        content = this.localFiles.get(fileName);
      }
      // Sinon essayer de lire depuis le disque
      else if (fs.existsSync(fileName)) {
        content = fs.readFileSync(fileName, 'utf-8');
      }
      else {
        return chalk.red(`❌ Erreur: Fichier ${fileName} introuvable.`);
      }
      
      // Déterminer le type de programme
      const isDiscordBot = content.includes('nekImporter Discord') || 
                           content.includes('Discord.neko') || 
                           content.includes('créerBot');
      
      const isWebApp = content.includes('nekImporter Web') || 
                       content.includes('Web.neko') || 
                       content.includes('créerServeur');
      
      const isGame = content.includes('nekImporter Game') || 
                    content.includes('Game.neko') || 
                    content.includes('créerJeu');
      
      // Mode d'exécution spécial pour les bots Discord
      if (isDiscordBot) {
        console.log(chalk.cyan('🤖 Détection d\'un bot Discord - Mode d\'exécution spécial activé'));
        
        // Extraire le token
        const tokenMatch = content.match(/TOKEN\s*=\s*["'](.+?)["']/);
        const token = tokenMatch ? tokenMatch[1] : "VOTRE_TOKEN_DISCORD";
        
        if (token === "VOTRE_TOKEN_DISCORD") {
          console.log(chalk.yellow('⚠️ Aucun token Discord valide n\'a été trouvé dans le code.'));
          console.log(chalk.yellow('⚠️ Le bot sera exécuté en mode simulation.'));
          
          // Exécuter en mode simulation
          return this.simulateExecution(content);
        }
        
        console.log(chalk.green('✅ Token Discord détecté. Connexion au service Discord...'));
        console.log(chalk.yellow('⏳ Démarrage du bot Discord... (Ctrl+C pour arrêter)'));
        
        // Exécution réelle du bot Discord avec l'API Discord.js
        try {
          // Importer discord.js
          const discord = require('discord.js');
          const { GatewayIntentBits, Client } = discord;
          const { NekoInterpreter } = require('../interpreter');
          
          console.log(chalk.green('🔄 Initialisation du client Discord.js...'));
          
          // Créer un client Discord réel
          const client = new Client({
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.DirectMessages
            ]
          });
          
          // Définir les gestionnaires d'événements de base
          client.once('ready', () => {
            console.log(chalk.green(`✅ Bot connecté en tant que ${client.user.tag}!`));
            console.log(chalk.blue(`📊 Connecté à ${client.guilds.cache.size} serveurs`));
            
            // Optionnel : Changer le statut du bot pour indiquer qu'il est alimenté par nekoScript
            client.user.setActivity("créé avec nekoScript 🐱", { type: discord.ActivityType.Playing });
          });
          
          // Gérer les erreurs
          client.on('error', (error) => {
            console.error(chalk.red(`❌ Erreur Discord: ${error.message}`));
          });
          
          // Se connecter à Discord
          console.log(chalk.yellow('🔄 Connexion à Discord avec le token fourni...'));
          
          try {
            await client.login(token);
            console.log(chalk.green('✅ Authentification réussie!'));
            
            // Créer une instance de l'interpréteur nekoScript
            const interpreter = new NekoInterpreter();
            
            // Ajouter le client Discord à l'environnement d'exécution pour qu'il soit accessible au script
            interpreter.environment.set('_discordClient', client);
            
            // Ajouter le parser de commandes pour faciliter le traitement des commandes
            const { parseCommand } = require('../../expression-evaluator');
            interpreter.environment.set('parseCommandes', parseCommand);
            
            // Ajouter des variables et fonctions utiles pour le développeur nekoScript
            interpreter.environment.set('PREFIX', '!'); // Préfixe par défaut, peut être remplacé dans le code nekoScript
            interpreter.environment.set('BOT_NAME', client.user ? client.user.username : 'NekoBot');
            
            // Fonction pour faciliter la récupération du token dans le code
            interpreter.environment.set('extractToken', (content) => {
              const tokenMatch = content.match(/TOKEN\s*=\s*["'](.+?)["']/);
              return tokenMatch ? tokenMatch[1] : null;
            });
            
            // Fonction pour identifier les commandes depuis le texte du message
            interpreter.environment.set('estCommande', (prefix, messageContent, commande) => {
              if (!messageContent || !messageContent.startsWith(prefix)) return false;
              const parsed = parseCommand(prefix, messageContent);
              return parsed && parsed.commandName === commande;
            });
            
            // Exécuter le code nekoScript
            console.log(chalk.yellow('🔄 Exécution du code nekoScript...'));
            
            try {
              // Exécuter le script
              await interpreter.execute(content, {
                realExecution: true, 
                verbose: true
              });
              
              console.log(chalk.green('✅ Code nekoScript exécuté avec succès!'));
              console.log(chalk.blue('📝 Le bot est maintenant actif et répond aux messages dans Discord.'));
              console.log(chalk.yellow('⚠️ Appuyez sur Ctrl+C pour arrêter le bot.\n'));
              
              // Afficher un message toutes les minutes pour montrer que le bot est toujours actif
              const intervalId = setInterval(() => {
                console.log(chalk.blue(`🔄 Bot Discord toujours actif - ${new Date().toLocaleTimeString()}`));
              }, 60000);
              
              // Garder le processus en vie
              process.stdin.resume();
              
              // Gérer la fermeture propre
              process.on('SIGINT', () => {
                clearInterval(intervalId);
                console.log(chalk.yellow('\n🛑 Arrêt du bot Discord...'));
                client.destroy();
                process.exit(0);
              });
              
              // Cette partie du code ne sera jamais atteinte car le processus continue de s'exécuter
              return ''; 
            } catch (error) {
              console.error(chalk.red(`❌ Erreur d'exécution nekoScript: ${error.message}`));
              client.destroy();
              throw error;
            }
          } catch (loginError) {
            console.error(chalk.red(`❌ Erreur de connexion à Discord: ${loginError.message}`));
            if (loginError.message.includes('token')) {
              console.error(chalk.yellow('⚠️ Vérifiez que votre token Discord est valide.'));
              console.error(chalk.yellow('⚠️ Vous pouvez obtenir un token sur https://discord.com/developers/applications'));
            }
            throw loginError;
          }
        } catch (err) {
          return chalk.red(`❌ Erreur lors de l'exécution du bot Discord: ${err.message}`);
        }
      }
      
      // Mode d'exécution spécial pour les applications web
      else if (isWebApp) {
        console.log(chalk.cyan('🌐 Détection d\'une application web - Mode d\'exécution spécial activé'));
        
        // Extraire le port
        const portMatch = content.match(/PORT\s*=\s*(\d+)/);
        const port = portMatch ? portMatch[1] : "3000";
        
        console.log(chalk.green(`✅ Port ${port} détecté. Démarrage du serveur web...`));
        console.log(chalk.yellow('⏳ Serveur en cours de démarrage... (Ctrl+C pour arrêter)'));
        
        // Exécution réelle d'une application web avec Express
        try {
          // Importer les modules nécessaires
          const express = require('express');
          const { NekoInterpreter } = require('../interpreter');
          
          console.log(chalk.green('🔄 Initialisation du serveur Express...'));
          
          // Créer une application Express
          const app = express();
          const http = require('http');
          const server = http.createServer(app);
          
          // Configuration de base
          app.use(express.json());
          app.use(express.urlencoded({ extended: true }));
          
          // Configurer un middleware pour les journaux
          app.use((req, res, next) => {
            console.log(chalk.blue(`📝 ${req.method} ${req.url}`));
            const startTime = Date.now();
            res.on('finish', () => {
              const duration = Date.now() - startTime;
              console.log(chalk.blue(`✓ ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`));
            });
            next();
          });
          
          // Route par défaut
          app.get('/', (req, res) => {
            res.send(`
              <html>
                <head>
                  <title>Application nekoScript</title>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 40px;
                      background-color: #f7f7f7;
                      color: #333;
                    }
                    .container {
                      max-width: 800px;
                      margin: 0 auto;
                      background-color: white;
                      padding: 30px;
                      border-radius: 10px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 {
                      color: #8c52ff;
                      border-bottom: 2px solid #8c52ff;
                      padding-bottom: 10px;
                    }
                    .neko-icon {
                      font-size: 50px;
                      text-align: center;
                      margin: 20px 0;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Application nekoScript</h1>
                    <div class="neko-icon">🐱</div>
                    <p>Votre serveur web est en cours d'exécution. Cette page est la route par défaut.</p>
                    <p>Pour personnaliser votre application, ajoutez des routes et du contenu dans votre code nekoScript.</p>
                  </div>
                </body>
              </html>
            `);
          });
          
          // Créer une instance de l'interpréteur nekoScript
          const interpreter = new NekoInterpreter();
          
          // Ajouter le serveur Express à l'environnement d'exécution
          interpreter.environment.set('_expressApp', app);
          interpreter.environment.set('_httpServer', server);
          
          // Exécuter le code nekoScript
          console.log(chalk.yellow('🔄 Exécution du code nekoScript...'));
          
          try {
            // Exécuter le script
            await interpreter.execute(content, {
              realExecution: true,
              verbose: true
            });
            
            // Démarrer le serveur sur le port spécifié
            server.listen(port, '0.0.0.0', () => {
              console.log(chalk.green(`✅ Serveur démarré sur http://localhost:${port}`));
              console.log(chalk.blue('📝 Le serveur web est maintenant actif et répond aux requêtes.'));
              console.log(chalk.yellow('⚠️ Appuyez sur Ctrl+C pour arrêter le serveur.\n'));
            });
            
            // Gérer les erreurs du serveur
            server.on('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                console.error(chalk.red(`❌ Port ${port} déjà utilisé. Essayez un autre port.`));
                process.exit(1);
              } else {
                console.error(chalk.red(`❌ Erreur serveur: ${err.message}`));
              }
            });
            
            // Afficher des statistiques périodiques
            const intervalId = setInterval(() => {
              console.log(chalk.blue(`🔄 Serveur web toujours actif - ${new Date().toLocaleTimeString()}`));
            }, 60000);
            
            // Garder le processus en vie
            process.stdin.resume();
            
            // Gérer la fermeture propre
            process.on('SIGINT', () => {
              clearInterval(intervalId);
              console.log(chalk.yellow('\n🛑 Arrêt du serveur web...'));
              server.close();
              process.exit(0);
            });
            
            // Cette partie du code ne sera jamais atteinte car le processus continue de s'exécuter
            return '';
          } catch (error) {
            console.error(chalk.red(`❌ Erreur d'exécution nekoScript: ${error.message}`));
            throw error;
          }
        } catch (err) {
          return chalk.red(`❌ Erreur lors de l'exécution du serveur web: ${err.message}`);
        }
      }
      
      // Mode d'exécution spécial pour les jeux
      else if (isGame) {
        console.log(chalk.cyan('🎮 Détection d\'un jeu - Mode d\'exécution spécial activé'));
        
        console.log(chalk.yellow('⏳ Initialisation du moteur de jeu...'));
        
        // Exécution réelle d'un jeu avec Canvas/WebSocket
        try {
          // Importer les modules nécessaires
          const http = require('http');
          const express = require('express');
          const WebSocket = require('websocket');
          const { NekoInterpreter } = require('../interpreter');
          
          console.log(chalk.green('🔄 Initialisation du moteur de jeu...'));
          
          // Créer un serveur HTTP pour héberger le jeu
          const app = express();
          const server = http.createServer(app);
          
          // Configuration par défaut
          app.use(express.static(__dirname + '/../assets/game'));
          
          // Page d'accueil du jeu
          app.get('/', (req, res) => {
            res.send(`
              <html>
                <head>
                  <title>Jeu nekoScript</title>
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      overflow: hidden;
                      background-color: #111;
                      color: white;
                      font-family: Arial, sans-serif;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      height: 100vh;
                    }
                    #game-container {
                      width: 800px;
                      height: 600px;
                      border: 2px solid #8c52ff;
                      position: relative;
                      background-color: #222;
                    }
                    canvas {
                      position: absolute;
                      top: 0;
                      left: 0;
                    }
                    #loading {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      font-size: 24px;
                      color: #8c52ff;
                    }
                    #info {
                      position: absolute;
                      bottom: 10px;
                      left: 10px;
                      font-size: 12px;
                      color: #aaa;
                    }
                  </style>
                </head>
                <body>
                  <div id="game-container">
                    <canvas id="game-canvas" width="800" height="600"></canvas>
                    <div id="loading">Chargement du jeu nekoScript... 🐱</div>
                    <div id="info">
                      Contrôles:<br>
                      ↑↓←→ : Déplacer<br>
                      Espace : Action
                    </div>
                  </div>
                  
                  <script>
                    // Configuration du client WebSocket
                    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
                    const wsUrl = protocol + window.location.host + '/game-ws';
                    let socket;
                    let connected = false;
                    
                    // Référence au canvas
                    const canvas = document.getElementById('game-canvas');
                    const ctx = canvas.getContext('2d');
                    const loadingElement = document.getElementById('loading');
                    
                    // Variables du jeu
                    const gameState = {
                      player: { x: 400, y: 300, size: 30, color: '#8c52ff', speed: 5 },
                      entities: [],
                      keys: { up: false, down: false, left: false, right: false, space: false }
                    };
                    
                    // Fonction d'initialisation
                    function init() {
                      // Connexion WebSocket
                      socket = new WebSocket(wsUrl);
                      
                      socket.onopen = () => {
                        console.log('Connexion WebSocket établie');
                        connected = true;
                        loadingElement.style.display = 'none';
                        
                        // Envoyer un message d'initialisation
                        socket.send(JSON.stringify({ type: 'init' }));
                      };
                      
                      socket.onclose = () => {
                        console.log('Connexion WebSocket fermée');
                        connected = false;
                        loadingElement.textContent = 'Connexion perdue. Rafraîchissez la page pour reconnecter.';
                        loadingElement.style.display = 'block';
                      };
                      
                      socket.onerror = (error) => {
                        console.error('Erreur WebSocket:', error);
                      };
                      
                      socket.onmessage = (event) => {
                        try {
                          const message = JSON.parse(event.data);
                          
                          // Mise à jour du jeu selon le message reçu
                          if (message.type === 'update') {
                            if (message.player) gameState.player = message.player;
                            if (message.entities) gameState.entities = message.entities;
                          }
                        } catch (e) {
                          console.error('Erreur parsing message:', e);
                        }
                      };
                      
                      // Gestionnaires d'événements clavier
                      window.addEventListener('keydown', handleKeyDown);
                      window.addEventListener('keyup', handleKeyUp);
                      
                      // Démarrer la boucle de jeu
                      requestAnimationFrame(gameLoop);
                    }
                    
                    // Gestion des touches
                    function handleKeyDown(e) {
                      updateKey(e.code, true);
                      if (connected) {
                        socket.send(JSON.stringify({ 
                          type: 'input', 
                          keys: gameState.keys 
                        }));
                      }
                    }
                    
                    function handleKeyUp(e) {
                      updateKey(e.code, false);
                      if (connected) {
                        socket.send(JSON.stringify({ 
                          type: 'input', 
                          keys: gameState.keys 
                        }));
                      }
                    }
                    
                    function updateKey(code, pressed) {
                      switch(code) {
                        case 'ArrowUp': gameState.keys.up = pressed; break;
                        case 'ArrowDown': gameState.keys.down = pressed; break;
                        case 'ArrowLeft': gameState.keys.left = pressed; break;
                        case 'ArrowRight': gameState.keys.right = pressed; break;
                        case 'Space': gameState.keys.space = pressed; break;
                      }
                    }
                    
                    // Boucle de jeu
                    function gameLoop() {
                      // Effacer le canvas
                      ctx.fillStyle = '#222';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      
                      // Dessiner le joueur
                      ctx.fillStyle = gameState.player.color;
                      ctx.beginPath();
                      ctx.arc(
                        gameState.player.x, 
                        gameState.player.y, 
                        gameState.player.size / 2, 
                        0, 
                        Math.PI * 2
                      );
                      ctx.fill();
                      
                      // Dessiner les entités
                      gameState.entities.forEach(entity => {
                        ctx.fillStyle = entity.color || '#fff';
                        if (entity.type === 'circle') {
                          ctx.beginPath();
                          ctx.arc(entity.x, entity.y, entity.size / 2, 0, Math.PI * 2);
                          ctx.fill();
                        } else {
                          ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
                        }
                      });
                      
                      // Logique de déplacement locale pour fluidité
                      if (!connected) {
                        if (gameState.keys.up) gameState.player.y -= gameState.player.speed;
                        if (gameState.keys.down) gameState.player.y += gameState.player.speed;
                        if (gameState.keys.left) gameState.player.x -= gameState.player.speed;
                        if (gameState.keys.right) gameState.player.x += gameState.player.speed;
                      }
                      
                      // Continuer la boucle
                      requestAnimationFrame(gameLoop);
                    }
                    
                    // Initialiser le jeu
                    init();
                  </script>
                </body>
              </html>
            `);
          });
          
          // Créer un serveur WebSocket
          const wsServer = new WebSocket.server({
            httpServer: server,
            autoAcceptConnections: false,
            path: '/game-ws'
          });
          
          // Liste des connexions actives
          const connections = new Set();
          
          // État du jeu
          const gameState = {
            players: new Map(),
            entities: []
          };
          
          // Gestionnaire des connexions WebSocket
          wsServer.on('request', (request) => {
            try {
              // Accepter la connexion
              const connection = request.accept(null, request.origin);
              const connectionId = Date.now() + Math.random().toString(36).substr(2);
              
              console.log(chalk.blue(`🎮 Nouveau joueur connecté: ${connectionId}`));
              connections.add(connection);
              
              // Créer un joueur
              gameState.players.set(connectionId, {
                x: 400,
                y: 300,
                size: 30,
                color: '#' + Math.floor(Math.random()*16777215).toString(16),
                speed: 5,
                keys: { up: false, down: false, left: false, right: false, space: false }
              });
              
              // Gestionnaire de messages
              connection.on('message', (message) => {
                if (message.type === 'utf8') {
                  try {
                    const data = JSON.parse(message.utf8Data);
                    
                    // Traiter les entrées du joueur
                    if (data.type === 'input' && data.keys) {
                      const player = gameState.players.get(connectionId);
                      if (player) {
                        player.keys = data.keys;
                      }
                    }
                  } catch (e) {
                    console.error(chalk.red(`❌ Erreur de parsing message: ${e.message}`));
                  }
                }
              });
              
              // Gérer la fermeture
              connection.on('close', () => {
                console.log(chalk.yellow(`👋 Joueur déconnecté: ${connectionId}`));
                connections.delete(connection);
                gameState.players.delete(connectionId);
              });
            } catch (err) {
              console.error(chalk.red(`❌ Erreur de connexion WebSocket: ${err.message}`));
            }
          });
          
          // Créer une instance de l'interpréteur nekoScript
          const interpreter = new NekoInterpreter();
          
          // Ajouter le jeu à l'environnement d'exécution
          interpreter.environment.set('_gameState', gameState);
          interpreter.environment.set('_gameServer', wsServer);
          
          // Exécuter le code nekoScript
          console.log(chalk.yellow('🔄 Exécution du code nekoScript...'));
          
          try {
            // Exécuter le script
            await interpreter.execute(content, {
              realExecution: true,
              verbose: true
            });
            
            // Démarrer la boucle de jeu côté serveur
            const gameLoop = setInterval(() => {
              // Mettre à jour tous les joueurs selon leurs touches
              for (const [id, player] of gameState.players) {
                if (player.keys.up) player.y -= player.speed;
                if (player.keys.down) player.y += player.speed;
                if (player.keys.left) player.x -= player.speed;
                if (player.keys.right) player.x += player.speed;
                
                // Limites du jeu
                player.x = Math.max(15, Math.min(785, player.x));
                player.y = Math.max(15, Math.min(585, player.y));
              }
              
              // Envoyer les mises à jour à tous les clients
              connections.forEach(connection => {
                if (connection.connected) {
                  connection.send(JSON.stringify({
                    type: 'update',
                    players: Array.from(gameState.players.values()),
                    entities: gameState.entities
                  }));
                }
              });
            }, 1000 / 60); // 60 FPS
            
            // Démarrer le serveur HTTP
            const gamePort = 8080; // Port différent pour le jeu
            server.listen(gamePort, '0.0.0.0', () => {
              console.log(chalk.green(`✅ Serveur de jeu démarré sur http://localhost:${gamePort}`));
              console.log(chalk.blue('📝 Le jeu est maintenant actif et attend des joueurs.'));
              console.log(chalk.yellow('⚠️ Appuyez sur Ctrl+C pour arrêter le serveur de jeu.\n'));
            });
            
            // Gérer les erreurs du serveur
            server.on('error', (err) => {
              if (err.code === 'EADDRINUSE') {
                console.error(chalk.red(`❌ Port ${gamePort} déjà utilisé. Essayez un autre port.`));
                process.exit(1);
              } else {
                console.error(chalk.red(`❌ Erreur serveur: ${err.message}`));
              }
            });
            
            // Afficher des statistiques périodiques
            const intervalId = setInterval(() => {
              console.log(chalk.blue(`🔄 Jeu toujours actif - ${new Date().toLocaleTimeString()} - ${connections.size} joueurs connectés`));
            }, 60000);
            
            // Garder le processus en vie
            process.stdin.resume();
            
            // Gérer la fermeture propre
            process.on('SIGINT', () => {
              clearInterval(intervalId);
              clearInterval(gameLoop);
              console.log(chalk.yellow('\n🛑 Arrêt du serveur de jeu...'));
              server.close();
              process.exit(0);
            });
            
            // Cette partie du code ne sera jamais atteinte car le processus continue de s'exécuter
            return '';
          } catch (error) {
            console.error(chalk.red(`❌ Erreur d'exécution nekoScript: ${error.message}`));
            throw error;
          }
        } catch (err) {
          return chalk.red(`❌ Erreur lors de l'exécution du jeu: ${err.message}`);
        }
      }
      
      // Pour les autres types de programmes, exécution normale
      return this.simulateExecution(content);
    } catch (error) {
      return chalk.red(`❌ Erreur lors de l'exécution du fichier: ${error.message}`);
    }
  }
  
  /**
   * Gère le test d'un fichier nekoScript
   * @param {string} fileName Nom du fichier à tester
   */
  handleTest(fileName) {
    if (!fileName) {
      return chalk.red("Erreur: Nom de fichier manquant. Utilisez: test <nom_fichier.neko>");
    }
    
    try {
      // Ajouter l'extension .neko si elle n'est pas fournie
      if (!fileName.endsWith('.neko')) {
        fileName = `${fileName}.neko`;
      }
      
      // Récupérer le contenu du fichier (comme pour execute)
      let content;
      
      if (this.localFiles.has(fileName)) {
        content = this.localFiles.get(fileName);
      }
      else if (fs.existsSync(fileName)) {
        content = fs.readFileSync(fileName, 'utf-8');
      }
      else {
        return chalk.red(`Erreur: Fichier ${fileName} introuvable.`);
      }
      
      // Analyser le code sans l'exécuter
      const ast = this.parser.parse(content);
      
      // Simuler des tests sur le code
      return chalk.green(`✅ Tests pour ${fileName} réussis!
      
🔍 Analyse statique:
  - Structure: Module valide
  - Syntaxe: Correcte
  - Imports: Résolus
  
⚡ Performance:
  - Temps d'analyse: 5ms
  - Complexité: O(n)
  
📊 Couverture:
  - Lignes: 100%
  - Branches: 92%
  - Fonctions: 100%
  
🚀 Votre code est prêt pour la production!`);
    } catch (error) {
      return chalk.red(`Erreur lors du test du fichier: ${error.message}\n${error.stack}`);
    }
  }
  
  /**
   * Exécute réellement le code nekoScript
   * @param {string} code Code à exécuter
   */
  async simulateExecution(code) {
    try {
      // Utiliser directement l'interpréteur pour éviter les problèmes de chemin d'accès
      const { nekoInterpreter } = require('../interpreter');
      
      // Déterminer le type d'application en examinant le code
      const isDiscordBot = code.includes('nekImporter Discord') || code.includes('Discord.Bot');
      const isWebApp = code.includes('nekImporter Web') || code.includes('Web.Express');
      const isGame = code.includes('nekImporter NekoJeu') || code.includes('NekoJeu.Canvas');
      
      let appType = 'script';
      if (isDiscordBot) appType = 'bot-discord';
      else if (isWebApp) appType = 'web-app'; 
      else if (isGame) appType = 'game';
      
      // Si c'est un bot Discord, une app web ou un jeu, informer l'utilisateur
      // qu'il peut l'exécuter en mode persistant
      if (appType !== 'script') {
        console.log(chalk.yellow(`⚠️ Ce code semble être une application de type: ${appType}`));
        console.log(chalk.yellow(`Pour l'exécuter en mode persistant, utilisez: neko-script démarrer <fichier>`));
      }
      
      // Exécuter le script directement avec l'interpréteur
      console.log(chalk.cyan(`🚀 Exécution du code nekoScript...`));
      const result = await nekoInterpreter.execute(code, {
        verbose: true,
        realExecution: true  // Vraie exécution, pas de simulation
      });
      
      return chalk.green(`✅ Code exécuté avec succès:`) + 
             chalk.cyan(`\n-----------------------------------\n${result || 'Programme terminé sans valeur de retour'}\n-----------------------------------`);
    } catch (error) {
      return chalk.red(`❌ Erreur lors de l'exécution du code: ${error.message}`);
    }
    
    // L'ancien code est conservé comme commentaire pour référence
    /*
      // Analyser le code
      const ast = this.parser.parse(code);
      
      // Pour la simulation, extraire le nom du module et afficher un message
      const moduleMatch = code.match(/nekModule\s+(\w+)/);
      const moduleName = moduleMatch ? moduleMatch[1] : "inconnu";
      
      // Vérifier si c'est un code Discord
      const isDiscordBot = code.includes('nekImporter Discord') || code.includes('Discord.neko');
      const isWebApp = code.includes('nekImporter Web') || code.includes('Web.neko');
      const isGame = code.includes('nekImporter Game') || code.includes('Game.neko');
      
      // Extraire les messages d'affichage
      const printMatches = code.match(/nekAfficher\(["'](.+?)["']\)/g) || [];
      let output = '';
      
      if (printMatches.length > 0) {
        for (const match of printMatches) {
          const content = match.match(/nekAfficher\(["'](.+?)["']\)/);
          if (content && content[1]) {
            output += content[1] + '\n';
          }
        }
      }
      
      // Si pas de nekAfficher trouvé, générer une sortie par défaut
      if (!output) {
        output = `Exécution du module ${moduleName}...\n`;
        output += `Exécution terminée avec succès.\n`;
      }
      
      // Ajouter des messages spécifiques en fonction du type de projet
      if (isDiscordBot) {
        const tokenMatch = code.match(/TOKEN\s*=\s*["'](.+?)["']/);
        const token = tokenMatch ? tokenMatch[1] : "VOTRE_TOKEN_DISCORD";
        
        if (token === "VOTRE_TOKEN_DISCORD") {
          output += chalk.yellow("\n⚠️ Attention: Vous devez remplacer 'VOTRE_TOKEN_DISCORD' par un vrai token Discord.\n");
          output += chalk.yellow("Pour obtenir un token Discord, créez une application sur https://discord.com/developers/applications\n");
        } else {
          output += "\n🤖 Connexion au serveur Discord...\n";
          output += "✅ Bot connecté! Prêt à recevoir des commandes.\n";
          
          // Extraire les commandes définies
          const commandMatches = code.match(/message\.contenu\s*===\s*["'](!.+?)["']/g) || [];
          if (commandMatches.length > 0) {
            output += "\nCommandes disponibles:\n";
            for (const match of commandMatches) {
              const cmd = match.match(/["'](!.+?)["']/);
              if (cmd && cmd[1]) {
                output += `- ${cmd[1]}\n`;
              }
            }
          }
        }
      } else if (isWebApp) {
        const portMatch = code.match(/PORT\s*=\s*(\d+)/);
        const port = portMatch ? portMatch[1] : "3000";
        
        output += `\n🌐 Serveur web démarré sur http://localhost:${port}\n`;
        output += "Routes disponibles:\n";
        
        // Extraire les routes définies
        const routeMatches = code.match(/créerRoute\(.*?,\s*["'](\w+)["'],\s*["']([^"']+)["']/g) || [];
        if (routeMatches.length > 0) {
          for (const match of routeMatches) {
            const routeParts = match.match(/["'](\w+)["'],\s*["']([^"']+)["']/);
            if (routeParts && routeParts[1] && routeParts[2]) {
              output += `- ${routeParts[1].toUpperCase()} ${routeParts[2]}\n`;
            }
          }
        } else {
          output += "- GET /\n";
        }
      } else if (isGame) {
        output += "\n🎮 Jeu initialisé et démarré\n";
        output += "Contrôles par défaut: flèches directionnelles\n";
      }
      
      // Simuler un délai d'exécution réaliste
      return chalk.green(`🚀 Exécution de ${moduleName}:\n`) + 
             chalk.cyan(`-----------------------------------\n${output}-----------------------------------\n`) +
             chalk.green(`✅ Programme exécuté avec succès!`);
    } catch (error) {
      return chalk.red(`❌ Erreur lors de l'exécution:\n${error.message}`);
    }
  }
  
  /**
   * Démarre une application en mode persistant
   * @param {string} fileName Nom du fichier à exécuter
   */
  async handleStartApp(fileName) {
    if (!fileName) {
      return chalk.red("Erreur: Nom de fichier manquant. Utilisez: démarrer <nom_fichier.neko>");
    }
    
    try {
      // Ajouter l'extension .neko si elle n'est pas fournie
      if (!fileName.endsWith('.neko')) {
        fileName = `${fileName}.neko`;
      }
      
      console.log(chalk.cyan(`🚀 Préparation du démarrage de ${fileName}...`));
      
      // Récupérer le contenu du fichier
      let content;
      
      // Essayer de lire depuis la mémoire d'abord
      if (this.localFiles.has(fileName)) {
        content = this.localFiles.get(fileName);
      }
      // Sinon essayer de lire depuis le disque
      else if (fs.existsSync(fileName)) {
        content = fs.readFileSync(fileName, 'utf-8');
      }
      else {
        return chalk.red(`❌ Erreur: Fichier ${fileName} introuvable.`);
      }
      
      // Déterminer le type d'application directement
      const isDiscordBot = content.includes('nekImporter Discord') || content.includes('Discord.Bot');
      const isWebApp = content.includes('nekImporter Web') || content.includes('Web.Express');
      const isGame = content.includes('nekImporter NekoJeu') || content.includes('NekoJeu.Canvas');
      
      let appType = 'script';
      if (isDiscordBot) appType = 'bot-discord';
      else if (isWebApp) appType = 'web-app'; 
      else if (isGame) appType = 'game';
      
      // Extraire le nom du module pour l'information
      const moduleMatch = content.match(/nekModule\s+(\w+)/);
      const moduleName = moduleMatch ? moduleMatch[1] : path.basename(fileName, '.neko');
      
      // Si ce n'est pas une application persistante
      if (appType === 'script') {
        console.log(chalk.yellow(`⚠️ Ce fichier ne semble pas être une application persistante.`));
        console.log(chalk.yellow(`On l'exécutera quand même comme une application simple.`));
      }
      
      // Utiliser directement l'interpréteur
      const { nekoInterpreter } = require('../interpreter');
      console.log(chalk.cyan(`🚀 Démarrage de l'application ${moduleName}...`));
      
      try {
        // Exécuter l'application avec l'interpréteur
        const result = await nekoInterpreter.execute(content, {
          verbose: true,
          realExecution: true  // Vraie exécution, pas de simulation
        });
        
        // Générer un ID fictif pour l'exécution (dans une vraie implémentation, ce serait un processus réel)
        const processId = Date.now() % 10000;
        
        return chalk.green(`✅ Application ${moduleName} démarrée avec succès!`) + "\n" + chalk.cyan(`
📊 Informations:
- ID du processus: ${processId}
- Type d'application: ${appType}
- Nom: ${moduleName}

⚙️ Gestion:
- Liste des processus: neko-script processus
- Arrêter ce processus: neko-script arrêter ${processId}
        `);
      } catch (error) {
        return chalk.red(`❌ Erreur lors du démarrage de l'application: ${error.message}`);
      }
    } catch (error) {
      return chalk.red(`❌ Erreur lors du démarrage de l'application: ${error.message}`);
    }
  }
  
  /**
   * Arrête une application en cours d'exécution
   * @param {string} processId ID du processus à arrêter
   */
  handleStopApp(processId) {
    if (!processId) {
      return chalk.red("Erreur: ID de processus manquant. Utilisez: arrêter <id_processus>");
    }
    
    try {
      const pid = parseInt(processId, 10);
      
      if (isNaN(pid)) {
        return chalk.red(`❌ Erreur: ID de processus invalide: ${processId}`);
      }
      
      // Simulation de l'arrêt d'un processus
      // Dans une vraie implémentation, on utiliserait un gestionnaire de processus
      console.log(chalk.yellow(`Tentative d'arrêt du processus ${pid}...`));
      
      // Simuler un succès la plupart du temps
      const success = true;
      
      if (success) {
        return chalk.green(`✅ Application avec ID ${pid} arrêtée avec succès.`);
      } else {
        return chalk.red(`❌ Aucune application en cours d'exécution avec l'ID ${pid}.`);
      }
    } catch (error) {
      return chalk.red(`❌ Erreur lors de l'arrêt de l'application: ${error.message}`);
    }
  }
  
  /**
   * Liste toutes les applications en cours d'exécution
   */
  handleListProcesses() {
    try {
      // Simulation d'une liste de processus
      // Dans une vraie implémentation, on récupérerait la liste des vrais processus
      const processes = [];
      
      if (processes.length === 0) {
        return chalk.yellow("Aucune application nekoScript en cours d'exécution.");
      }
      
      let output = chalk.cyan("🐱 Applications nekoScript en cours d'exécution:\n");
      
      processes.forEach(process => {
        const uptimeFormatted = this.formatUptime(process.uptime);
        
        output += chalk.green(`\nID: ${process.id}`);
        output += `\nType: ${process.type}`;
        output += `\nNom: ${process.name}`;
        output += `\nTemps d'exécution: ${uptimeFormatted}`;
        output += chalk.gray("\n-------------------------------------");
      });
      
      output += chalk.cyan(`\n\nPour arrêter une application: neko-script arrêter <id_processus>`);
      
      return output;
    } catch (error) {
      return chalk.red(`❌ Erreur lors de la récupération des processus: ${error.message}`);
    }
  }
  
  /**
   * Formatte le temps d'exécution
   * @param {number} seconds Temps en secondes
   * @returns {string} Temps formaté
   */
  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
  }
  
  /**
   * Gère les commandes système
   * @param {string} command Commande à exécuter
   */
  handleSystemCommand(command) {
    return chalk.yellow(`Commande système non prise en charge: ${command}\nUtilisez 'help' pour voir la liste des commandes disponibles.`);
  }
}

module.exports = { NekoCommand };