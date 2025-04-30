import { NekoAST } from "./neko-parser";
import { nekoParser } from "./neko-parser";

/**
 * Simple interpreter for nekoScript language
 * This is a simulated implementation to demonstrate the concept
 */
export class NekoInterpreter {
  private environment: Map<string, any> = new Map();
  private modules: Map<string, any> = new Map();

  constructor() {
    // Initialize built-in functions
    this.environment.set('nekAfficher', (...args: any[]) => {
      return args.join(' ');
    });
    
    this.environment.set('nekBouger', (x: number, y: number) => {
      return `Déplacement de (${x}, ${y})`;
    });
  }

  async execute(code: string): Promise<string> {
    try {
      const ast = nekoParser.parse(code);
      return this.evaluate(ast);
    } catch (error: any) {
      return `Erreur d'exécution: ${error.message}`;
    }
  }

  private evaluate(node: NekoAST): any {
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

  private evaluateVariableDeclaration(node: NekoAST): void {
    const value = this.evaluate(node.initializer);
    this.environment.set(node.name, value);
  }

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
    for (const [key, value] of this.environment.entries()) {
      if (key !== 'nekAfficher' && key !== 'nekBouger') {
        module[key] = value;
      }
    }
    
    // Restore previous scope
    this.environment = previousEnv;
    
    // Register module
    this.modules.set(node.name, module);
  }

  private evaluateImportStatement(node: NekoAST): void {
    if (node.source) {
      // Simulated external module import
      if (node.source === 'Discord.neko') {
        this.environment.set(node.name, {
          Bot: (token: string) => {
            const bot = {
              surMessage: (fn: Function) => {
                // Simulate bot functionality
                return "Bot Discord configuré avec gestionnaire de messages";
              },
              démarrer: () => "Bot Discord démarré"
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
              démarrer: () => "Jeu démarré"
            };
            return canvas;
          }
        });
      } else {
        throw new Error(`Module non trouvé: ${node.source}`);
      }
    } else if (this.modules.has(node.name)) {
      // Import local module
      this.environment.set(node.name, this.modules.get(node.name));
    } else {
      throw new Error(`Module non trouvé: ${node.name}`);
    }
  }

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
      
      const args = node.arguments.map(arg => this.evaluate(arg));
      return method.apply(object, args);
    }
    
    // Handle function calls
    const fn = this.environment.get(node.callee);
    
    if (typeof fn !== 'function') {
      throw new Error(`Fonction non définie: ${node.callee}`);
    }
    
    const args = node.arguments.map(arg => this.evaluate(arg));
    return fn(...args);
  }
}

export const nekoInterpreter = new NekoInterpreter();
