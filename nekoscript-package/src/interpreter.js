/**
 * Simple interpreter for nekoScript language
 * This is a simulated implementation to demonstrate the concept
 */

"use strict";

class NekoInterpreter {
  constructor() {
    this.environment = new Map();
    this.modules = new Map();
    
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
      };
      
      // Fusionner les options par défaut avec celles fournies
      const execOptions = { ...defaultOptions, ...options };
      
      // Parse the code if it's a string, or use it directly if it's already an AST
      let ast;
      if (typeof code === 'string') {
        try {
          if (execOptions.verbose) {
            console.log('[NekoInterpreter] Parsing code...');
          }
          
          // Essayer de parser comme JSON d'abord
          try {
            ast = JSON.parse(code);
          } catch {
            // Si ce n'est pas du JSON, c'est probablement du code nekoScript
            // Utiliser le parser ici (nécessite l'initialisation du parser)
            ast = code; // Pour l'instant, on suppose que c'est déjà un AST
          }
        } catch (parseError) {
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
    switch (node.type) {
      case 'Program':
        return this.evaluateProgram(node);
      case 'ModuleDeclaration':
        return this.evaluateModuleDeclaration(node);
      case 'ImportStatement':
        return this.evaluateImportStatement(node);
      case 'VariableDeclaration':
        return this.evaluateVariableDeclaration(node);
      case 'FunctionDeclaration':
        return this.evaluateFunctionDeclaration(node);
      case 'PrintStatement':
        return console.log(this.evaluate(node.expression));
      case 'ReturnStatement':
        return this.evaluate(node.value);
      case 'IfStatement':
        return this.evaluateIfStatement(node);
      case 'ExpressionStatement':
        return this.evaluate(node.expression);
      case 'Expression':
        // Simple expression evaluation
        return this.evaluateSimpleExpression(node.value);
      default:
        throw new Error(`Type de nœud inconnu: ${node.type}`);
    }
  }

  evaluateProgram(node) {
    let lastValue;
    for (const statement of node.body) {
      lastValue = this.evaluate(statement);
    }
    return lastValue ?? "Programme exécuté avec succès";
  }

  evaluateVariableDeclaration(node) {
    const value = this.evaluateSimpleExpression(node.value);
    this.environment.set(node.name, value);
    return value;
  }

  evaluateFunctionDeclaration(node) {
    // Store the function in the environment
    this.environment.set(node.name, (...args) => {
      // Create a new scope
      const previousEnv = new Map(this.environment);
      
      // Bind parameters
      for (let i = 0; i < node.params.length; i++) {
        this.environment.set(node.params[i], args[i]);
      }
      
      // Execute the function body
      let result;
      for (const statement of node.body) {
        if (statement.type === 'ReturnStatement') {
          result = this.evaluate(statement);
          break;
        } else {
          result = this.evaluate(statement);
        }
      }
      
      // Restore previous scope
      this.environment = previousEnv;
      
      return result;
    });
  }

  evaluateIfStatement(node) {
    console.log("[NekoScript] Évaluation d'une structure conditionnelle");
    
    try {
      // Évaluer la condition
      const condition = this.evaluateSimpleExpression(node.condition);
      console.log(`[NekoScript] Résultat de la condition: ${condition}`);
      
      let result;
      
      // Exécuter le bloc if si la condition est vraie
      if (condition) {
        console.log("[NekoScript] Exécution du bloc 'if'");
        for (const statement of node.body) {
          result = this.evaluate(statement);
        }
      } 
      // Sinon, exécuter le bloc else si disponible
      else if (node.elseBody && node.elseBody.length > 0) {
        console.log("[NekoScript] Exécution du bloc 'else'");
        for (const statement of node.elseBody) {
          result = this.evaluate(statement);
        }
      } else {
        console.log("[NekoScript] Pas de bloc 'else', condition non satisfaite");
      }
      
      return result;
    } catch (error) {
      console.error(`[NekoScript] Erreur dans l'évaluation d'une condition: ${error.message}`);
      throw error;
    }
  }

  evaluateModuleDeclaration(node) {
    // Create a new module environment
    const moduleEnv = new Map();
    
    // Store the current environment
    const previousEnv = this.environment;
    
    // Set the module environment as the current environment
    this.environment = moduleEnv;
    
    // Evaluate the module body
    for (const statement of node.body) {
      this.evaluate(statement);
    }
    
    // Store the module
    this.modules.set(node.name, moduleEnv);
    
    // Restore the previous environment
    this.environment = previousEnv;
  }

  evaluateImportStatement(node) {
    const moduleName = node.moduleName;
    
    // Check if the module exists
    if (!this.modules.has(moduleName)) {
      try {
        // Try to load module from our modules directory
        if (moduleName === 'Base') {
          // Base module is loaded separately in the constructor
          const { createBaseModule } = require('./modules/Base');
          this.modules.set('Base', createBaseModule());
        } 
        else if (moduleName === 'Math') {
          const { createMathModule } = require('./modules/Math');
          this.modules.set('Math', createMathModule());
        } 
        else if (moduleName === 'Web') {
          const { createWebModule } = require('./modules/Web');
          this.modules.set('Web', createWebModule());
        } 
        else if (moduleName === 'Discord') {
          const { createDiscordModule } = require('./modules/Discord');
          this.modules.set('Discord', createDiscordModule());
        } 
        else if (moduleName === 'Game') {
          const { createGameModule } = require('./modules/Game');
          this.modules.set('Game', createGameModule());
        } 
        else {
          // Try to load custom user modules
          try {
            // Check in local node_modules first
            const customModule = require(`nekoscript-${moduleName.toLowerCase()}`);
            if (customModule && typeof customModule.createModule === 'function') {
              this.modules.set(moduleName, customModule.createModule());
            } else {
              throw new Error(`Le module ${moduleName} ne contient pas de méthode createModule()`);
            }
          } catch (moduleError) {
            // Try in user's local directory
            try {
              const path = require('path');
              const customModulePath = path.resolve(process.cwd(), `${moduleName}.neko`);
              const fs = require('fs');
              
              if (fs.existsSync(customModulePath)) {
                console.log(`Chargement du module local ${moduleName} depuis ${customModulePath}`);
                const moduleCode = fs.readFileSync(customModulePath, 'utf-8');
                // Parse and evaluate the module code
                const moduleAST = this.parser.parse(moduleCode);
                this.evaluate(moduleAST);
              } else {
                throw new Error(`Module ${moduleName} introuvable`);
              }
            } catch (localError) {
              console.error(`Erreur lors du chargement du module ${moduleName}: ${localError.message}`);
              throw new Error(`Module ${moduleName} introuvable. Assurez-vous de l'installer avec 'neko-script librairie ${moduleName}'`);
            }
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du module ${moduleName}: ${error.message}`);
        
        // Fallback to basic modules if loading fails
        if (moduleName === 'Base') {
          // Create a basic Base module
          const baseModule = new Map();
          baseModule.set('nekAfficher', (message) => {
            console.log(message);
            return message;
          });
          this.modules.set('Base', baseModule);
        } 
        else if (moduleName === 'Math') {
          // Create a basic Math module
          const mathModule = new Map();
          mathModule.set('PI', Math.PI);
          mathModule.set('cos', Math.cos);
          mathModule.set('sin', Math.sin);
          mathModule.set('tan', Math.tan);
          mathModule.set('sqrt', Math.sqrt);
          mathModule.set('pow', Math.pow);
          mathModule.set('random', Math.random);
          this.modules.set('Math', mathModule);
        } 
        else if (moduleName === 'Web') {
          // Create a basic Web module
          const webModule = new Map();
          webModule.set('fetcher', async (url) => {
            return `Données récupérées de ${url} (simulation)`;
          });
          webModule.set('créerPage', (titre, contenu) => {
            return `Page créée: ${titre}\\n${contenu}`;
          });
          this.modules.set('Web', webModule);
        } 
        else if (moduleName === 'Discord') {
          // Create a basic Discord module
          const discordModule = new Map();
          discordModule.set('créerBot', (token) => {
            return `Bot Discord simulé créé avec le token ${token}`;
          });
          discordModule.set('surMessage', (fn) => {
            console.log("Événement de message configuré (simulation)");
            setTimeout(() => {
              fn({ contenu: "Bonjour, je suis un message simulé !", auteur: "Utilisateur" });
            }, 100);
          });
          this.modules.set('Discord', discordModule);
        } 
        else if (moduleName === 'Game') {
          // Create a basic Game module
          const gameModule = new Map();
          gameModule.set('créerJeu', (largeur, hauteur) => {
            return {
              démarrer: () => console.log(`Jeu simulé démarré (${largeur}x${hauteur})`)
            };
          });
          this.modules.set('Game', gameModule);
        } 
        else {
          throw new Error(`Module ${moduleName} introuvable et impossible à simuler`);
        }
      }
    }
    
    // Import the module
    const moduleEnv = this.modules.get(moduleName);
    for (const [key, value] of moduleEnv) {
      this.environment.set(key, value);
    }
  }

  evaluateCallExpression(node) {
    const callee = this.environment.get(node.callee);
    if (!callee) {
      throw new Error(`Fonction ${node.callee} non définie`);
    }
    
    const args = node.arguments.map(arg => this.evaluate(arg));
    return callee(...args);
  }

  evaluateSimpleExpression(expression) {
    // This is a very simplified expression evaluator
    // In a real interpreter, this would be much more complex
    
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1);
    }
    
    if (expression === 'true') return true;
    if (expression === 'false') return false;
    
    if (!isNaN(Number(expression))) {
      return Number(expression);
    }
    
    // Check if it's a variable
    if (this.environment.has(expression)) {
      return this.environment.get(expression);
    }
    
    // Check for string concatenation
    if (expression.includes('+')) {
      const parts = expression.split('+').map(part => part.trim());
      return parts.map(part => this.evaluateSimpleExpression(part)).join('');
    }
    
    // Check for function calls
    const functionCallMatch = expression.match(/(\w+)\((.*)\)/);
    if (functionCallMatch) {
      const functionName = functionCallMatch[1];
      const argsStr = functionCallMatch[2];
      
      // Extract the arguments
      const args = argsStr ? argsStr.split(',').map(arg => {
        const trimmed = arg.trim();
        return this.evaluateSimpleExpression(trimmed);
      }) : [];
      
      // Call the function
      const fn = this.environment.get(functionName);
      if (!fn) {
        throw new Error(`Fonction ${functionName} non définie`);
      }
      
      return fn(...args);
    }
    
    // Default: return the expression itself
    return expression;
  }

  // Set up standard library functions
  initializeStandardLibrary() {
    // Base module
    const baseModule = new Map();
    
    baseModule.set('nekAfficher', (message) => {
      console.log(message);
      return message;
    });
    
    baseModule.set('nekLire', (prompt) => {
      return prompt; // In a real environment, this would read user input
    });
    
    baseModule.set('nekDormir', (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    });
    
    this.modules.set('Base', baseModule);
    
    // Add base functions to the global environment
    for (const [key, value] of baseModule) {
      this.environment.set(key, value);
    }
  }
}

module.exports = { NekoInterpreter };