/**
 * Enhanced interpreter for nekoScript language
 * Includes support for Discord bots, Web applications, and JavaScript integration
 */

"use strict";

const { nekoParser } = require('./parser');

/**
 * Interface for package data
 */
class NekoPackage {
  constructor(name, code, isJavaScript, version, publishedAt) {
    this.name = name;
    this.code = code;
    this.isJavaScript = isJavaScript;
    this.version = version || "1.0.0";
    this.publishedAt = publishedAt || new Date().toISOString();
  }
}

class NekoInterpreter {
  constructor() {
    this.environment = new Map();
    this.modules = new Map();
    this.packageRegistry = new Map();
    
    // Initialize with basic modules and functions
    this.initializeStandardLibrary();
  }

  async execute(code, options = {}) {
    try {
      // Options par défaut
      const defaultOptions = {
        realExecution: true,     // Exécution réelle (vs simulation)
        verbose: false,          // Mode verbeux pour le débogage
        envVars: {},             // Variables d'environnement
        workingDir: process.cwd(), // Répertoire de travail
        parseOnly: false,        // Uniquement analyser sans exécuter
        debugInfo: false,        // Afficher des infos de débogage supplémentaires
        rawJavaScript: false,    // Le code est-il du JavaScript pur?
      };
      
      // Fusionner les options par défaut avec celles fournies
      const execOptions = { ...defaultOptions, ...options };
      
      // Si le code est du JavaScript pur, l'exécuter directement
      if (execOptions.rawJavaScript && typeof code === 'string') {
        try {
          if (execOptions.verbose) {
            console.log('[NekoInterpreter] Exécution de JavaScript pur...');
          }
          
          // Exécuter le code JavaScript directement en utilisant Function pour éviter eval
          const func = new Function('require', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'process', code);
          const result = func(require, console, setTimeout, clearTimeout, setInterval, clearInterval, process);
          
          if (execOptions.debugInfo) {
            return {
              success: true,
              result: result !== undefined ? String(result) : "Code JavaScript exécuté avec succès",
              environment: Object.fromEntries(this.environment)
            };
          }
          
          return result;
        } catch (jsError) {
          console.error(`[NekoInterpreter] Erreur d'exécution JavaScript: ${jsError.message}`);
          throw jsError;
        }
      }
      
      // Parse the code if it's a string, or use it directly if it's already an AST
      let ast;
      if (typeof code === 'string') {
        try {
          if (execOptions.verbose) {
            console.log('[NekoInterpreter] Parsing code...');
          }
          
          // Détecter si c'est du JavaScript
          if (code.includes('require(') || code.includes('function(') || 
              code.includes('const ') || code.includes('let ') ||
              code.includes('var ') || code.includes('if (') ||
              code.includes('for (') || code.includes('while (')) {
            
            if (execOptions.verbose) {
              console.log('[NekoInterpreter] Le code ressemble à du JavaScript. Exécution directe...');
            }
            
            return await this.execute(code, { ...options, rawJavaScript: true });
          }
          
          // Utiliser notre parser amélioré
          ast = nekoParser.parse(code);
          
        } catch (parseError) {
          console.error(`[NekoInterpreter] Erreur de parsing: ${parseError.message}`);
          throw new Error(`Erreur de parsing: ${parseError.message}`);
        }
      } else {
        ast = code;
      }
      
      // Si on veut seulement parser sans exécuter
      if (execOptions.parseOnly) {
        return { success: true, ast };
      }
      
      // Définir les variables d'environnement
      for (const [key, value] of Object.entries(execOptions.envVars)) {
        process.env[key] = value;
        
        // Ajouter aussi à l'environnement nekoScript
        this.environment.set(key, value);
      }
      
      // Changer le répertoire de travail si nécessaire
      const originalDir = process.cwd();
      if (execOptions.workingDir !== originalDir) {
        process.chdir(execOptions.workingDir);
      }
      
      if (execOptions.verbose) {
        console.log('[NekoInterpreter] Executing code...');
      }
      
      // Exécution réelle
      const result = await this.evaluate(ast);
      
      // Restaurer le répertoire de travail si nécessaire
      if (execOptions.workingDir !== originalDir) {
        process.chdir(originalDir);
      }
      
      if (execOptions.debugInfo) {
        return {
          success: true,
          result: result !== undefined ? String(result) : "Programme exécuté avec succès",
          environment: Object.fromEntries(this.environment),
          modules: Array.from(this.modules.keys())
        };
      }
      
      return result !== undefined ? String(result) : "Programme exécuté avec succès";
    } catch (error) {
      if (options.debugInfo) {
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
      return `Erreur d'exécution: ${error.message}`;
    }
  }

  evaluate(node) {
    // Handle pure JavaScript code
    if (node.type === 'Program' && node.body.length > 0) {
      // Check if first token is JavaScript type
      if (node.body[0].type === 'javascript' || 
          (node.body[0].type === 'ExpressionStatement' && 
           node.body[0].expression && 
           node.body[0].expression.type === 'StringLiteral' && 
           node.body[0].expression.value.trim().startsWith('// JavaScript'))) {
        
        // Extract and execute JavaScript code
        let jsCode = '';
        if (node.body[0].type === 'javascript') {
          jsCode = node.body[0].value;
        } else {
          jsCode = node.body[0].expression.value;
        }
        
        try {
          // Execute in safe mode with nekoScript context
          return this.executeJavaScript(jsCode);
        } catch (error) {
          return `Erreur JavaScript: ${error.message}`;
        }
      }
    }
    
    // Normal nekoScript evaluation
    switch (node.type) {
      case 'Program':
        return this.evaluateProgram(node);
      
      case 'VariableDeclaration':
        return this.evaluateVariableDeclaration(node);
      
      case 'FunctionDeclaration':
        return this.evaluateFunctionDeclaration(node);
      
      case 'IfStatement':
        return this.evaluateIfStatement(node);
      
      case 'ModuleDeclaration':
        return this.evaluateModuleDeclaration(node);
      
      case 'ImportStatement':
        return this.evaluateImportStatement(node);
      
      case 'ReturnStatement':
        return this.evaluateReturnStatement(node);
      
      case 'ExpressionStatement':
        return this.evaluate(node.expression);
      
      case 'CallExpression':
        return this.evaluateCallExpression(node);
      
      case 'StringLiteral':
        return node.value;
      
      case 'NumberLiteral':
        return node.value;
      
      case 'Identifier':
        if (this.environment.has(node.name)) {
          return this.environment.get(node.name);
        }
        throw new Error(`Variable non définie: ${node.name}`);
      
      default:
        return `Type non supporté: ${node.type}`;
    }
  }

  evaluateProgram(node) {
    let result = '';
    
    for (const statement of node.body) {
      const statementResult = this.evaluate(statement);
      if (statementResult !== undefined && statementResult !== null) {
        if (typeof statementResult === 'string') {
          result += statementResult + '\n';
        } else {
          result += JSON.stringify(statementResult) + '\n';
        }
      }
    }
    
    return result.trim();
  }

  evaluateVariableDeclaration(node) {
    const value = this.evaluate(node.initializer);
    this.environment.set(node.name, value);
  }

  evaluateFunctionDeclaration(node) {
    const fn = (...args) => {
      // Create new scope
      const previousEnv = new Map(this.environment);
      
      // Bind parameters
      for (let i = 0; i < node.params.length; i++) {
        this.environment.set(node.params[i], args[i]);
      }
      
      let result;
      
      // Evaluate function body
      for (const statement of node.body) {
        result = this.evaluate(statement);
        
        // Handle return statements (simplified)
        if (result && result.__isReturn) {
          result = result.value;
          break;
        }
      }
      
      // Restore previous scope
      this.environment = previousEnv;
      
      return result;
    };
    
    this.environment.set(node.name, fn);
  }

  evaluateIfStatement(node) {
    const condition = this.evaluate(node.condition);
    
    if (condition) {
      for (const statement of node.thenBranch) {
        const result = this.evaluate(statement);
        if (result && result.__isReturn) return result;
      }
    } else if (node.elseBranch) {
      for (const statement of node.elseBranch) {
        const result = this.evaluate(statement);
        if (result && result.__isReturn) return result;
      }
    }
  }

  evaluateModuleDeclaration(node) {
    const module = {};
    
    // Create module scope
    const previousEnv = new Map(this.environment);
    this.environment = new Map(previousEnv);
    
    // Evaluate module body
    for (const statement of node.body) {
      this.evaluate(statement);
    }
    
    // Collect exported values
    this.environment.forEach((value, key) => {
      if (key !== 'nekAfficher' && key !== 'nekBouger') {
        module[key] = value;
      }
    });
    
    // Restore previous scope
    this.environment = previousEnv;
    
    // Register module
    this.modules.set(node.name, module);
  }

  evaluateImportStatement(node) {
    if (node.source) {
      // Intégration RÉELLE avec modules externes
      if (node.source === 'Discord.neko') {
        try {
          // Utiliser Discord.js réel pour les bots Discord
          const Discord = require('discord.js');
          
          this.environment.set(node.name, {
            Bot: (token) => {
              try {
                // Créer un client Discord.js réel avec les intents nécessaires
                const client = new Discord.Client({ 
                  intents: [
                    Discord.GatewayIntentBits.Guilds,
                    Discord.GatewayIntentBits.GuildMessages, 
                    Discord.GatewayIntentBits.MessageContent,
                    Discord.GatewayIntentBits.GuildMessageReactions
                  ] 
                });

                // Indiquer lorsque le bot est prêt
                client.once('ready', () => {
                  console.log(`Bot Discord connecté en tant que ${client.user.tag}`);
                });

                const bot = {
                  surMessage: (fn) => {
                    // Gestionnaire réel de messages
                    client.on('messageCreate', (message) => {
                      if (message.author.bot) return; // Ignorer les messages des bots
                      
                      // Créer un objet message adapté pour nekoScript
                      const nekoMessage = {
                        contenu: message.content,
                        auteur: {
                          nom: message.author.username,
                          id: message.author.id,
                          avatar: message.author.displayAvatarURL()
                        },
                        canal: {
                          nom: message.channel.name,
                          id: message.channel.id,
                          envoyer: (texte) => message.channel.send(texte)
                        },
                        repondre: (texte) => message.reply(texte),
                        reagir: (emoji) => message.react(emoji)
                      };
                      
                      // Appeler la fonction utilisateur avec notre objet message
                      fn(nekoMessage);
                    });
                    
                    console.log("Gestionnaire de message Discord configuré (RÉEL)");
                    return "Bot Discord configuré avec gestionnaire de messages";
                  },
                  
                  surReaction: (fn) => {
                    // Gestionnaire réel de réactions
                    client.on('messageReactionAdd', (reaction, user) => {
                      if (user.bot) return; // Ignorer les réactions des bots
                      
                      const nekoReaction = {
                        emoji: reaction.emoji.name,
                        utilisateur: {
                          nom: user.username,
                          id: user.id
                        },
                        message: {
                          id: reaction.message.id,
                          contenu: reaction.message.content,
                          auteur: {
                            nom: reaction.message.author.username,
                            id: reaction.message.author.id
                          }
                        }
                      };
                      
                      fn(nekoReaction);
                    });
                    
                    console.log("Gestionnaire de réaction Discord configuré (RÉEL)");
                    return "Bot Discord configuré avec gestionnaire de réactions";
                  },
                  
                  surCommande: (prefixe, fn) => {
                    // Gestionnaire réel de commandes
                    client.on('messageCreate', (message) => {
                      if (message.author.bot) return; // Ignorer les messages des bots
                      if (!message.content.startsWith(prefixe)) return; // Vérifier le préfixe
                      
                      const args = message.content.slice(prefixe.length).trim().split(/ +/);
                      const commande = args.shift().toLowerCase();
                      
                      // Créer un objet commande adapté pour nekoScript
                      const nekoCommande = {
                        nom: commande,
                        arguments: args,
                        auteur: {
                          nom: message.author.username,
                          id: message.author.id
                        },
                        canal: {
                          nom: message.channel.name,
                          id: message.channel.id,
                          envoyer: (texte) => message.channel.send(texte)
                        },
                        repondre: (texte) => message.reply(texte),
                        reagir: (emoji) => message.react(emoji)
                      };
                      
                      // Appeler la fonction utilisateur avec notre objet commande
                      fn(nekoCommande);
                    });
                    
                    console.log(`Commande Discord '${prefixe}' configurée (RÉEL)`);
                    return `Bot Discord configuré avec le préfixe de commande '${prefixe}'`;
                  },
                  
                  changerStatut: (message, type = "PLAYING") => {
                    // Changer réellement le statut du bot
                    const types = {
                      "JOUE": "PLAYING",
                      "REGARDE": "WATCHING",
                      "ÉCOUTE": "LISTENING",
                      "EN_STREAM": "STREAMING"
                    };
                    
                    const activityType = types[type] || type;
                    
                    client.user?.setActivity(message, { type: Discord.ActivityType[activityType] });
                    console.log(`Statut Discord changé: ${type} ${message} (RÉEL)`);
                    return `Statut Discord du bot changé: ${type} ${message}`;
                  },
                  
                  créerEmbed: (titre, description, couleur = "#5865F2") => {
                    // Créer un embed Discord réel
                    const embed = new Discord.EmbedBuilder()
                      .setTitle(titre)
                      .setDescription(description)
                      .setColor(couleur);
                    
                    console.log(`Création d'un embed Discord: ${titre} (RÉEL)`);
                    
                    return {
                      embed: embed,
                      ajouterChamp: (nom, valeur, inline = false) => {
                        embed.addFields({ name: nom, value: valeur, inline: inline });
                        console.log(`Champ ajouté à l'embed: ${nom} (RÉEL)`);
                        return embed;
                      },
                      définirAuteur: (nom, iconURL) => {
                        embed.setAuthor({ name: nom, iconURL: iconURL });
                        return embed;
                      },
                      définirImage: (url) => {
                        embed.setImage(url);
                        return embed;
                      },
                      définirCouleur: (couleur) => {
                        embed.setColor(couleur);
                        return embed;
                      },
                      définirTimestamp: () => {
                        embed.setTimestamp();
                        return embed;
                      }
                    };
                  },
                  
                  démarrer: () => {
                    // Connexion réelle à Discord
                    client.login(token).catch(err => {
                      console.error("Erreur de connexion Discord:", err);
                      throw new Error(`Erreur de connexion Discord: ${err.message}`);
                    });
                    
                    console.log("Bot Discord démarré (RÉEL)");
                    return "Bot Discord démarré avec une connexion réelle à l'API Discord";
                  }
                };
                
                return bot;
              } catch (error) {
                console.error("Erreur lors de la création du bot Discord:", error);
                throw new Error(`Erreur lors de la création du bot Discord: ${error.message}`);
              }
            }
          });
        } catch (error) {
          console.error("Impossible de charger discord.js:", error);
          throw new Error(`Pour utiliser Discord.neko, installez discord.js avec: npm install discord.js`);
        }
      } else if (node.source === 'NekoJeu.neko') {
        try {
          // Utiliser des bibliothèques réelles pour les jeux
          let canvas;
          try {
            // Tenter de charger canvas pour le rendu
            canvas = require('canvas');
          } catch (error) {
            console.warn("Module canvas non disponible. Installation requise pour NekoJeu réel.");
            console.warn("npm install canvas");
          }
          
          this.environment.set(node.name, {
            Canvas: (width, height, title) => {
              // Si canvas est disponible, créer un canevas réel
              let gameCanvas, ctx;
              let realCanvas = false;
              
              if (canvas) {
                gameCanvas = canvas.createCanvas(width, height);
                ctx = gameCanvas.getContext('2d');
                realCanvas = true;
                console.log("Canvas réel créé avec canvas.js");
              } else {
                console.log("Utilisation du mode de simulation pour NekoJeu");
              }
              
              // Objets de jeu
              const sprites = [];
              const keyHandlers = {};
              const keyStates = {};
              let updateHandler = null;
              let running = false;
              
              // Boucle de jeu
              const gameLoop = () => {
                if (!running) return;
                
                if (realCanvas) {
                  ctx.clearRect(0, 0, width, height);
                  
                  // Mise à jour et dessin des sprites
                  sprites.forEach(sprite => {
                    if (sprite.update) sprite.update();
                    ctx.drawImage(sprite.image, sprite.x, sprite.y, sprite.width, sprite.height);
                  });
                }
                
                // Appel du gestionnaire de mise à jour
                if (updateHandler) updateHandler();
                
                // Continuer la boucle
                if (typeof window !== 'undefined') {
                  window.requestAnimationFrame(gameLoop);
                } else {
                  setTimeout(gameLoop, 1000 / 60); // ~60 FPS
                }
              };
              
              // Configurer les écouteurs de clavier si dans un navigateur
              if (typeof window !== 'undefined') {
                window.addEventListener('keydown', (event) => {
                  keyStates[event.key] = true;
                  if (keyHandlers[event.key]) keyHandlers[event.key](true);
                });
                
                window.addEventListener('keyup', (event) => {
                  keyStates[event.key] = false;
                  if (keyHandlers[event.key]) keyHandlers[event.key](false);
                });
              }
              
              return {
                créerSprite: async (image, x, y, width = 32, height = 32) => {
                  let spriteImage;
                  
                  if (realCanvas) {
                    try {
                      // Charger l'image avec canvas
                      spriteImage = await canvas.loadImage(image);
                    } catch (error) {
                      console.error(`Erreur de chargement d'image: ${image}`, error);
                      // Image de remplacement (rectangle coloré)
                      spriteImage = { width, height };
                    }
                  } else {
                    // En mode simulation, utiliser un objet factice
                    spriteImage = { width, height };
                  }
                  
                  const sprite = {
                    x, y, 
                    width: width || spriteImage.width || 32, 
                    height: height || spriteImage.height || 32,
                    image: spriteImage,
                    vitesseX: 0,
                    vitesseY: 0,
                    
                    // Méthodes du sprite
                    nekBouger: (dx, dy) => {
                      sprite.x += dx;
                      sprite.y += dy;
                      return `Sprite déplacé de (${dx}, ${dy})`;
                    },
                    définirVitesse: (vx, vy) => {
                      sprite.vitesseX = vx;
                      sprite.vitesseY = vy;
                    },
                    collision: (autreSprite) => {
                      // Vérification de collision simple par boîtes englobantes
                      return !(
                        sprite.x + sprite.width < autreSprite.x ||
                        sprite.x > autreSprite.x + autreSprite.width ||
                        sprite.y + sprite.height < autreSprite.y ||
                        sprite.y > autreSprite.y + autreSprite.height
                      );
                    },
                    update: () => {
                      // Mettre à jour la position en fonction de la vitesse
                      sprite.x += sprite.vitesseX;
                      sprite.y += sprite.vitesseY;
                    }
                  };
                  
                  sprites.push(sprite);
                  return sprite;
                },
                
                surTouche: (key, fn) => {
                  keyHandlers[key] = fn;
                  console.log(`Gestionnaire de touche configuré pour ${key} (RÉEL si dans navigateur)`);
                  return `Gestionnaire de touche configuré pour ${key}`;
                },
                
                verifierTouche: (key) => {
                  return keyStates[key] || false;
                },
                
                afficherTexte: (texte, x, y, couleur = "white", taille = "16px") => {
                  if (realCanvas) {
                    ctx.fillStyle = couleur;
                    ctx.font = `${taille} Arial`;
                    ctx.fillText(texte, x, y);
                  }
                  console.log(`Texte affiché: ${texte} à (${x}, ${y})`);
                  return `Texte affiché: ${texte} à (${x}, ${y})`;
                },
                
                dessinerRectangle: (x, y, largeur, hauteur, couleur = "red") => {
                  if (realCanvas) {
                    ctx.fillStyle = couleur;
                    ctx.fillRect(x, y, largeur, hauteur);
                  }
                  return `Rectangle dessiné à (${x}, ${y})`;
                },
                
                surMiseAJour: (fn) => {
                  updateHandler = fn;
                  console.log("Gestionnaire de mise à jour configuré (RÉEL)");
                  return "Gestionnaire de mise à jour configuré";
                },
                
                démarrer: () => {
                  running = true;
                  gameLoop();
                  console.log("Jeu démarré (RÉEL)");
                  return "Jeu démarré";
                },
                
                arrêter: () => {
                  running = false;
                  console.log("Jeu arrêté");
                  return "Jeu arrêté";
                }
              };
            }
          });
        } catch (error) {
          console.error("Erreur lors de l'initialisation de NekoJeu:", error);
          throw new Error(`Erreur d'initialisation de NekoJeu: ${error.message}`);
        }
      } else if (node.source === 'Web.neko') {
        try {
          // Utiliser Express réel pour les applications web
          const express = require('express');
          
          this.environment.set(node.name, {
            Express: () => {
              try {
                // Créer une application Express réelle
                const app = express();
                
                // Configurer les middlewares de base
                app.use(express.json());
                app.use(express.urlencoded({ extended: true }));
                
                // Server HTTP
                let server = null;
                
                return {
                  utiliser: (middleware) => {
                    if (typeof middleware === 'function') {
                      app.use(middleware);
                    } else if (typeof middleware === 'string') {
                      // Si c'est un chemin vers un répertoire statique
                      app.use(express.static(middleware));
                    }
                    console.log("Middleware ajouté (RÉEL)");
                    return "Middleware ajouté";
                  },
                  
                  route: (method, path, handler) => {
                    // Normaliser la méthode HTTP
                    method = method.toLowerCase();
                    
                    if (!app[method]) {
                      throw new Error(`Méthode HTTP non supportée: ${method}`);
                    }
                    
                    // Configurer la route avec Express
                    app[method](path, (req, res) => {
                      // Adapter req/res pour nekoScript
                      const nekoReq = {
                        corps: req.body,
                        params: req.params,
                        query: req.query,
                        headers: req.headers,
                        cookies: req.cookies,
                        methode: req.method,
                        chemin: req.path,
                        url: req.url
                      };
                      
                      const nekoRes = {
                        envoyer: (data) => res.send(data),
                        json: (data) => res.json(data),
                        statut: (code) => {
                          res.status(code);
                          return nekoRes; // Pour chaîner les appels
                        },
                        rediriger: (url) => res.redirect(url),
                        définirHeader: (nom, valeur) => {
                          res.setHeader(nom, valeur);
                          return nekoRes;
                        },
                        définirCookie: (nom, valeur, options) => {
                          res.cookie(nom, valeur, options);
                          return nekoRes;
                        }
                      };
                      
                      // Exécuter le gestionnaire nekoScript
                      handler(nekoReq, nekoRes);
                    });
                    
                    console.log(`Route ${method.toUpperCase()} ${path} configurée (RÉEL)`);
                    return `Route ${method.toUpperCase()} ${path} configurée`;
                  },
                  
                  écouter: (port, callback) => {
                    // Démarrer le serveur HTTP réel
                    server = app.listen(port, () => {
                      console.log(`Serveur Web démarré sur le port ${port} (RÉEL)`);
                      if (callback) callback();
                    });
                    
                    return `Serveur Web démarré sur le port ${port}`;
                  },
                  
                  arrêter: () => {
                    if (server) {
                      server.close();
                      console.log("Serveur Web arrêté");
                      return "Serveur Web arrêté";
                    }
                    return "Aucun serveur n'est en cours d'exécution";
                  }
                };
              } catch (error) {
                console.error("Erreur lors de la création du serveur Express:", error);
                throw new Error(`Erreur de création du serveur Express: ${error.message}`);
              }
            },
            
            Static: (directory) => {
              // Wrapper pour express.static
              return express.static(directory);
            }
          });
        } catch (error) {
          console.error("Impossible de charger express:", error);
          throw new Error(`Pour utiliser Web.neko, installez express avec: npm install express`);
        }
      } else {
        // Try to load from package registry
        if (this.packageRegistry.has(node.source)) {
          const pkg = this.packageRegistry.get(node.source);
          
          if (pkg.isJavaScript) {
            // For JS packages
            const moduleExports = this.executeJavaScript(pkg.code);
            this.environment.set(node.name, moduleExports);
          } else {
            // For nekoScript packages
            const ast = nekoParser.parse(pkg.code);
            this.evaluate(ast);
            // If module is defined, use it
            if (this.modules.has(node.name)) {
              this.environment.set(node.name, this.modules.get(node.name));
            }
          }
        } else {
          throw new Error(`Module non trouvé: ${node.source}`);
        }
      }
    } else if (this.modules.has(node.name)) {
      // Import local module
      this.environment.set(node.name, this.modules.get(node.name));
    } else {
      throw new Error(`Module non trouvé: ${node.name}`);
    }
  }

  evaluateReturnStatement(node) {
    const value = this.evaluate(node.value);
    return { __isReturn: true, value };
  }
  
  evaluateCallExpression(node) {
    // Handle method calls (e.g., obj.method())
    if (node.callee.includes('.')) {
      const parts = node.callee.split('.');
      let object = this.environment.get(parts[0]);
      
      if (!object) {
        throw new Error(`Objet non défini: ${parts[0]}`);
      }
      
      for (let i = 1; i < parts.length - 1; i++) {
        object = object[parts[i]];
        if (!object) {
          throw new Error(`Propriété non définie: ${parts[i]}`);
        }
      }
      
      const method = object[parts[parts.length - 1]];
      
      if (typeof method !== 'function') {
        throw new Error(`Méthode non définie: ${parts[parts.length - 1]}`);
      }
      
      const args = node.arguments.map((arg) => this.evaluate(arg));
      return method.apply(object, args);
    }
    
    // Handle function calls
    const fn = this.environment.get(node.callee);
    
    if (typeof fn !== 'function') {
      throw new Error(`Fonction non définie: ${node.callee}`);
    }
    
    const args = node.arguments.map((arg) => this.evaluate(arg));
    return fn(...args);
  }
  
  executeJavaScript(jsCode) {
    try {
      // Create context with nekoScript functions
      const context = {};
      
      // Add nekoScript environment functions
      this.environment.forEach((value, key) => {
        context[key] = value;
      });
      
      // Add aliases for JavaScript <-> nekoScript
      context.console = console;
      context.require = require;
      context.nekAfficher = console.log;
      context.nekRequire = require;
      
      // Execute in context
      const result = eval(`
        (function() {
          ${jsCode}
        })()
      `);
      
      return result;
    } catch (error) {
      throw new Error(`Erreur JavaScript: ${error.message}`);
    }
  }

  /**
   * Publishes a package to the registry
   */
  async publishPackage(code, name, isJavaScript = false) {
    const version = "1.0.0";
    
    const packageObj = new NekoPackage(
      name,
      code,
      isJavaScript,
      version,
      new Date().toISOString()
    );
    
    this.packageRegistry.set(name, packageObj);
    
    return `Package '${name}' publié avec succès!`;
  }

  /**
   * Downloads a package from the registry
   */
  async downloadPackage(name) {
    if (this.packageRegistry.has(name)) {
      const pkg = this.packageRegistry.get(name);
      return `Package '${name}' v${pkg.version} téléchargé avec succès!`;
    } else {
      throw new Error(`Package '${name}' introuvable dans le registre.`);
    }
  }

  /**
   * Lists available packages in the registry
   */
  listPackages() {
    if (this.packageRegistry.size === 0) {
      return "Aucun package disponible dans le registre.";
    }
    
    let result = "Packages disponibles:\n";
    
    this.packageRegistry.forEach((pkg, name) => {
      result += `- ${name} (v${pkg.version}, ${pkg.isJavaScript ? 'JavaScript' : 'nekoScript'})\n`;
    });
    
    return result;
  }

  initializeStandardLibrary() {
    // Core functions
    this.environment.set('nekAfficher', (...args) => {
      const message = args.join(' ');
      console.log(message);
      return message;
    });
    
    this.environment.set('nekBouger', (x, y) => {
      return `Déplacement de (${x}, ${y})`;
    });
    
    this.environment.set('nekLire', (prompt) => {
      return prompt; // In a real environment, this would read user input
    });
    
    this.environment.set('nekDormir', (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    });
    
    // Math functions
    const mathModule = new Map();
    mathModule.set('nekSin', Math.sin);
    mathModule.set('nekCos', Math.cos);
    mathModule.set('nekTan', Math.tan);
    mathModule.set('nekPow', Math.pow);
    mathModule.set('nekSqrt', Math.sqrt);
    mathModule.set('nekAbs', Math.abs);
    mathModule.set('nekAleatoire', Math.random);
    mathModule.set('nekAleatoireEntier', (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    });
    mathModule.set('nekRadians', (degrees) => degrees * Math.PI / 180);
    mathModule.set('PI', Math.PI);
    mathModule.set('E', Math.E);
    
    this.modules.set('Math', mathModule);
    
    // Base module with common utilities
    const baseModule = new Map();
    baseModule.set('nekCreerTableau', (...items) => items);
    baseModule.set('nekAjouterElement', (array, item) => array.push(item));
    baseModule.set('nekObtenirElement', (array, index) => array[index]);
    baseModule.set('nekLongueur', (obj) => {
      if (typeof obj === 'string') return obj.length;
      if (Array.isArray(obj)) return obj.length;
      return 0;
    });
    baseModule.set('nekSousChaîne', (str, debut, fin) => str.substring(debut, fin));
    baseModule.set('nekVersNombre', (str) => parseFloat(str));
    baseModule.set('nekVersTexte', (val) => String(val));
    baseModule.set('nekDate', () => new Date().toLocaleString());
    
    this.modules.set('Base', baseModule);
    
    // Add base functions to global environment for easy access
    baseModule.forEach((value, key) => {
      this.environment.set(key, value);
    });
    
    // Add math functions to global environment
    mathModule.forEach((value, key) => {
      this.environment.set(key, value);
    });
    
    // Handle direct JavaScript execution for compatibility
    this.environment.set('nekJavaScript', (code) => {
      try {
        // Execute JavaScript directly for full compatibility
        return eval(code);
      } catch (error) {
        return `Erreur JavaScript: ${error.message}`;
      }
    });
  }
}

// Créer une instance par défaut
const nekoInterpreter = new NekoInterpreter();

module.exports = { NekoInterpreter, nekoInterpreter };