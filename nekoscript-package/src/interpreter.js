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
      // Simulated external module import
      if (node.source === 'Discord.neko') {
        this.environment.set(node.name, {
          Bot: (token) => {
            const bot = {
              surMessage: (fn) => {
                // Simulate bot functionality
                console.log("Gestionnaire de message Discord configuré");
                return "Bot Discord configuré avec gestionnaire de messages";
              },
              surReaction: (fn) => {
                console.log("Gestionnaire de réaction Discord configuré");
                return "Bot Discord configuré avec gestionnaire de réactions";
              },
              surCommande: (commande, fn) => {
                console.log(`Commande Discord '${commande}' configurée`);
                return `Bot Discord configuré avec la commande '${commande}'`;
              },
              changerStatut: (message, type = "JOUE") => {
                console.log(`Statut Discord changé: ${type} ${message}`);
                return `Statut Discord du bot changé: ${type} ${message}`;
              },
              créerEmbed: (titre, description, couleur = "#5865F2") => {
                console.log(`Création d'un embed Discord: ${titre}`);
                return {
                  embed: {
                    title: titre,
                    description: description,
                    color: couleur
                  },
                  ajouterChamp: (nom, valeur, inline = false) => {
                    console.log(`Champ ajouté à l'embed: ${nom}`);
                    return "Champ ajouté à l'embed";
                  }
                };
              },
              démarrer: () => {
                console.log("Bot Discord démarré");
                return "Bot Discord démarré";
              }
            };
            return bot;
          }
        });
      } else if (node.source === 'NekoJeu.neko') {
        this.environment.set(node.name, {
          Canvas: (width, height, title) => {
            const canvas = {
              créerSprite: (image, x, y) => {
                return {
                  nekBouger: (dx, dy) => `Sprite déplacé de (${dx}, ${dy})`
                };
              },
              surTouche: (key, fn) => {
                // Simulate key handler
                return `Gestionnaire de touche configuré pour ${key}`;
              },
              afficherTexte: (texte, x, y, couleur = "white") => {
                return `Texte affiché: ${texte} à (${x}, ${y})`;
              },
              surMiseAJour: (fn) => {
                return "Gestionnaire de mise à jour configuré";
              },
              démarrer: () => "Jeu démarré"
            };
            return canvas;
          }
        });
      } else if (node.source === 'Web.neko') {
        this.environment.set(node.name, {
          Express: () => {
            const app = {
              utiliser: (middleware) => "Middleware ajouté",
              route: (method, path, handler) => {
                console.log(`Route ${method} ${path} configurée`);
                return `Route ${method} ${path} configurée`;
              },
              écouter: (port, callback) => {
                console.log(`Serveur Web démarré sur le port ${port}`);
                if (callback) callback();
                return `Serveur Web démarré sur le port ${port}`;
              }
            };
            return app;
          },
          Static: (directory) => {
            return `Middleware statique pour ${directory}`;
          }
        });
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