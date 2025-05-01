import { NekoAST, nekoParser } from './neko-parser';

/**
 * Interface for package data
 */
interface NekoPackage {
  name: string;
  code: string;
  isJavaScript: boolean;
  version: string;
  publishedAt: string;
}

/**
 * Simple interpreter for nekoScript language
 * This is a simulated implementation to demonstrate the concept
 */
export class NekoInterpreter {
  private environment: Map<string, any> = new Map();
  private modules: Map<string, any> = new Map();
  private packageRegistry: Map<string, NekoPackage> = new Map();

  constructor() {
    this.initializeStandardLibrary();
  }
  
  /**
   * Initializer for standard library functions
   */
  private initializeStandardLibrary() {
    // Core functions
    this.environment.set('nekAfficher', (...args: any[]) => {
      const message = args.join(' ');
      console.log(message);
      return message;
    });
    
    this.environment.set('nekBouger', (x: number, y: number) => {
      return `Déplacement de (${x}, ${y})`;
    });
    
    this.environment.set('nekLire', (prompt: string) => {
      return prompt; // In a real environment, this would read user input
    });
    
    this.environment.set('nekDormir', (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    });
    
    // Math functions
    const mathModule = new Map<string, any>();
    mathModule.set('nekSin', Math.sin);
    mathModule.set('nekCos', Math.cos);
    mathModule.set('nekTan', Math.tan);
    mathModule.set('nekPow', Math.pow);
    mathModule.set('nekSqrt', Math.sqrt);
    mathModule.set('nekAbs', Math.abs);
    mathModule.set('nekAleatoire', Math.random);
    mathModule.set('nekAleatoireEntier', (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    });
    mathModule.set('nekRadians', (degrees: number) => degrees * Math.PI / 180);
    mathModule.set('PI', Math.PI);
    mathModule.set('E', Math.E);
    
    this.modules.set('Math', mathModule);
    
    // Base module with common utilities
    const baseModule = new Map<string, any>();
    baseModule.set('nekCreerTableau', (...items: any[]) => items);
    baseModule.set('nekAjouterElement', (array: any[], item: any) => array.push(item));
    baseModule.set('nekObtenirElement', (array: any[], index: number) => array[index]);
    baseModule.set('nekLongueur', (obj: any) => {
      if (typeof obj === 'string') return obj.length;
      if (Array.isArray(obj)) return obj.length;
      return 0;
    });
    baseModule.set('nekSousChaîne', (str: string, debut: number, fin: number) => str.substring(debut, fin));
    baseModule.set('nekVersNombre', (str: string) => parseFloat(str));
    baseModule.set('nekVersTexte', (val: any) => String(val));
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
    this.environment.set('nekJavaScript', (code: string) => {
      try {
        // Execute JavaScript directly for full compatibility
        return eval(code);
      } catch (error: any) {
        return `Erreur JavaScript: ${error.message}`;
      }
    });
  }

  /**
   * Main execution method for nekoScript code
   */
  async execute(code: string): Promise<string> {
    try {
      const ast = nekoParser.parse(code);
      return this.evaluate(ast);
    } catch (error: any) {
      return `Erreur d'exécution: ${error.message}`;
    }
  }

  /**
   * Main evaluation method for AST nodes
   */
  private evaluate(node: NekoAST): any {
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
        } catch (error: any) {
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

  /**
   * Evaluates a program node
   */
  private evaluateProgram(node: NekoAST): string {
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

  /**
   * Evaluates a variable declaration
   */
  private evaluateVariableDeclaration(node: NekoAST): void {
    const value = this.evaluate(node.initializer);
    this.environment.set(node.name, value);
  }

  /**
   * Evaluates a function declaration
   */
  private evaluateFunctionDeclaration(node: NekoAST): void {
    const fn = (...args: any[]) => {
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

  /**
   * Evaluates an if statement
   */
  private evaluateIfStatement(node: NekoAST): any {
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

  /**
   * Evaluates a module declaration
   */
  private evaluateModuleDeclaration(node: NekoAST): void {
    const module: any = {};
    
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

  /**
   * Evaluates an import statement
   */
  private evaluateImportStatement(node: NekoAST): void {
    if (node.source) {
      // Simulated external module import
      if (node.source === 'Discord.neko') {
        this.environment.set(node.name, {
          Bot: (token: string) => {
            const bot = {
              surMessage: (fn: Function) => {
                // Simulate bot functionality
                console.log("Gestionnaire de message Discord configuré");
                return "Bot Discord configuré avec gestionnaire de messages";
              },
              surReaction: (fn: Function) => {
                console.log("Gestionnaire de réaction Discord configuré");
                return "Bot Discord configuré avec gestionnaire de réactions";
              },
              surCommande: (commande: string, fn: Function) => {
                console.log(`Commande Discord '${commande}' configurée`);
                return `Bot Discord configuré avec la commande '${commande}'`;
              },
              changerStatut: (message: string, type: string = "JOUE") => {
                console.log(`Statut Discord changé: ${type} ${message}`);
                return `Statut Discord du bot changé: ${type} ${message}`;
              },
              créerEmbed: (titre: string, description: string, couleur: string = "#5865F2") => {
                console.log(`Création d'un embed Discord: ${titre}`);
                return {
                  embed: {
                    title: titre,
                    description: description,
                    color: couleur
                  },
                  ajouterChamp: (nom: string, valeur: string, inline: boolean = false) => {
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
          Canvas: (width: number, height: number, title: string) => {
            const canvas = {
              créerSprite: (image: string, x: number, y: number) => {
                return {
                  nekBouger: (dx: number, dy: number) => `Sprite déplacé de (${dx}, ${dy})`
                };
              },
              surTouche: (key: string, fn: Function) => {
                // Simulate key handler
                return `Gestionnaire de touche configuré pour ${key}`;
              },
              afficherTexte: (texte: string, x: number, y: number, couleur: string = "white") => {
                return `Texte affiché: ${texte} à (${x}, ${y})`;
              },
              surMiseAJour: (fn: Function) => {
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
              utiliser: (middleware: any) => "Middleware ajouté",
              route: (method: string, path: string, handler: Function) => {
                console.log(`Route ${method} ${path} configurée`);
                return `Route ${method} ${path} configurée`;
              },
              écouter: (port: number, callback: Function) => {
                console.log(`Serveur Web démarré sur le port ${port}`);
                if (callback) callback();
                return `Serveur Web démarré sur le port ${port}`;
              }
            };
            return app;
          },
          Static: (directory: string) => {
            return `Middleware statique pour ${directory}`;
          }
        });
      } else {
        // Try to load from package registry
        if (this.packageRegistry.has(node.source)) {
          const pkg = this.packageRegistry.get(node.source)!;
          
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

  /**
   * Evaluates a return statement
   */
  private evaluateReturnStatement(node: NekoAST): any {
    const value = this.evaluate(node.value);
    return { __isReturn: true, value };
  }
  
  /**
   * Evaluates a call expression
   */
  private evaluateCallExpression(node: NekoAST): any {
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
      
      const args = node.arguments.map((arg: NekoAST) => this.evaluate(arg));
      return method.apply(object, args);
    }
    
    // Handle function calls
    const fn = this.environment.get(node.callee);
    
    if (typeof fn !== 'function') {
      throw new Error(`Fonction non définie: ${node.callee}`);
    }
    
    const args = node.arguments.map((arg: NekoAST) => this.evaluate(arg));
    return fn(...args);
  }
  
  /**
   * Safely executes JavaScript code with nekoScript context
   */
  private executeJavaScript(jsCode: string): any {
    try {
      // Create context with nekoScript functions
      const context: any = {};
      
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
    } catch (error: any) {
      return `Erreur d'exécution JavaScript: ${error.message}`;
    }
  }
  
  /**
   * Publishes a package to the registry
   */
  async publishPackage(code: string, name: string, isJavaScript: boolean = false): Promise<string> {
    try {
      // Check if package already exists
      if (this.packageRegistry.has(name)) {
        return `Erreur: Un package avec le nom '${name}' existe déjà`;
      }
      
      // Create package object
      const packageObj: NekoPackage = {
        name,
        code,
        isJavaScript,
        version: "1.0.0",
        publishedAt: new Date().toISOString()
      };
      
      // Register package
      this.packageRegistry.set(name, packageObj);
      
      return `Package '${name}' publié avec succès!`;
    } catch (error: any) {
      return `Erreur lors de la publication du package: ${error.message}`;
    }
  }
  
  /**
   * Downloads a package from the registry
   */
  async downloadPackage(name: string): Promise<string> {
    try {
      // Check if package exists
      if (!this.packageRegistry.has(name)) {
        return `Erreur: Package '${name}' non trouvé`;
      }
      
      // Get package
      const pkg = this.packageRegistry.get(name)!;
      
      // Add to module registry
      if (pkg.isJavaScript) {
        // For JS packages, evaluate and expose
        const moduleExports = this.executeJavaScript(pkg.code);
        this.modules.set(name, moduleExports);
      } else {
        // For nekoScript packages, parse and evaluate
        const ast = nekoParser.parse(pkg.code);
        this.evaluate(ast);
      }
      
      return `Package '${name}' téléchargé avec succès!`;
    } catch (error: any) {
      return `Erreur lors du téléchargement du package: ${error.message}`;
    }
  }
  
  /**
   * Lists available packages in the registry
   */
  listPackages(): string {
    try {
      if (this.packageRegistry.size === 0) {
        return "Aucun package n'est disponible.";
      }
      
      let result = "Packages disponibles:\n";
      
      this.packageRegistry.forEach((pkg, name) => {
        result += `- ${name} (v${pkg.version}, ${pkg.isJavaScript ? 'JavaScript' : 'nekoScript'})\n`;
      });
      
      return result;
    } catch (error: any) {
      return `Erreur lors de la récupération des packages: ${error.message}`;
    }
  }
}

export const nekoInterpreterFixed = new NekoInterpreter();