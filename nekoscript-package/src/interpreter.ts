/**
 * Simple interpreter for nekoScript language
 * This is a simulated implementation to demonstrate the concept
 */
import { NekoAST } from './parser';

export class NekoInterpreter {
  private environment: Map<string, any> = new Map();
  private modules: Map<string, any> = new Map();

  constructor() {
    // Initialize with basic modules and functions
    this.initializeStandardLibrary();
  }

  async execute(code: string): Promise<string> {
    try {
      // Parse the code if it's a string, or use it directly if it's already an AST
      let ast: NekoAST;
      if (typeof code === 'string') {
        try {
          ast = JSON.parse(code);
        } catch {
          // If we can't parse as JSON, assume it's already an AST object
          ast = code as any;
        }
      } else {
        ast = code as any;
      }

      // Evaluate the AST
      const result = this.evaluate(ast);
      
      return result !== undefined ? String(result) : "Programme exécuté avec succès";
    } catch (error) {
      return `Erreur d'exécution: ${error.message}`;
    }
  }

  private evaluate(node: NekoAST): any {
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

  private evaluateProgram(node: NekoAST): string {
    let lastValue: any;
    for (const statement of node.body) {
      lastValue = this.evaluate(statement);
    }
    return lastValue ?? "Programme exécuté avec succès";
  }

  private evaluateVariableDeclaration(node: NekoAST): void {
    const value = this.evaluateSimpleExpression(node.value);
    this.environment.set(node.name, value);
    return value;
  }

  private evaluateFunctionDeclaration(node: NekoAST): void {
    // Store the function in the environment
    this.environment.set(node.name, (...args: any[]) => {
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

  private evaluateIfStatement(node: NekoAST): any {
    const condition = this.evaluateSimpleExpression(node.condition);
    
    if (condition) {
      for (const statement of node.body) {
        this.evaluate(statement);
      }
    }
  }

  private evaluateModuleDeclaration(node: NekoAST): void {
    // Create a new module environment
    const moduleEnv = new Map<string, any>();
    
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

  private evaluateImportStatement(node: NekoAST): void {
    const moduleName = node.moduleName;
    
    // Check if the module exists
    if (!this.modules.has(moduleName)) {
      // If the module doesn't exist, try to load a standard library module
      if (moduleName === 'Base') {
        // Base module is already loaded in the constructor
      } else if (moduleName === 'Math') {
        this.modules.set('Math', new Map([
          ['PI', Math.PI],
          ['cos', Math.cos],
          ['sin', Math.sin],
          ['tan', Math.tan],
          ['sqrt', Math.sqrt],
          ['pow', Math.pow],
          ['random', Math.random]
        ]));
      } else if (moduleName === 'Web') {
        // Simulate web module
        this.modules.set('Web', new Map([
          ['fetcher', async (url: string) => {
            try {
              return `Données récupérées de ${url}`;
            } catch (error) {
              return `Erreur: ${error.message}`;
            }
          }],
          ['créerPage', (titre: string, contenu: string) => {
            return `Page créée: ${titre}\\n${contenu}`;
          }]
        ]));
      } else if (moduleName === 'Discord') {
        // Simulate Discord module
        this.modules.set('Discord', new Map([
          ['créerBot', (token: string) => {
            return `Bot Discord créé avec le token ${token}`;
          }],
          ['surMessage', (fn: Function) => {
            console.log("Événement de message configuré");
            // Simulate a message event
            setTimeout(() => {
              fn({ contenu: "Bonjour, je suis un message !", auteur: "Utilisateur" });
            }, 100);
          }],
          ['surTouche', (key: string, fn: Function) => {
            console.log(`Événement de touche configuré pour ${key}`);
          }]
        ]));
      } else {
        throw new Error(`Module ${moduleName} introuvable`);
      }
    }
    
    // Import the module
    const moduleEnv = this.modules.get(moduleName);
    for (const [key, value] of moduleEnv) {
      this.environment.set(key, value);
    }
  }

  private evaluateCallExpression(node: NekoAST): any {
    const callee = this.environment.get(node.callee);
    if (!callee) {
      throw new Error(`Fonction ${node.callee} non définie`);
    }
    
    const args = node.arguments.map(arg => this.evaluate(arg));
    return callee(...args);
  }

  private evaluateSimpleExpression(expression: string): any {
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
  private initializeStandardLibrary() {
    // Base module
    const baseModule = new Map<string, any>([
      ['nekAfficher', (message: any) => {
        console.log(message);
        return message;
      }],
      ['nekLire', (prompt: string) => {
        return prompt; // In a real environment, this would read user input
      }],
      ['nekDormir', (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
      }]
    ]);
    
    this.modules.set('Base', baseModule);
    
    // Add base functions to the global environment
    for (const [key, value] of baseModule) {
      this.environment.set(key, value);
    }
  }
}