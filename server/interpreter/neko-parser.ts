/**
 * Basic parser for nekoScript language
 * This is a simplified implementation to demonstrate the concept
 */

export interface NekoToken {
  type: string;
  value: string;
}

export interface NekoAST {
  type: string;
  [key: string]: any;
}

export class NekoParser {
  private tokens: NekoToken[] = [];
  private current = 0;

  constructor() {}

  parse(code: string): NekoAST {
    // Tokenize code
    this.tokenize(code);
    this.current = 0;

    // Create program AST
    const program: NekoAST = {
      type: 'Program',
      body: []
    };

    while (!this.isAtEnd()) {
      try {
        program.body.push(this.parseStatement());
      } catch (error) {
        console.error('Parsing error:', error);
        break;
      }
    }

    return program;
  }

  private tokenize(code: string): void {
    this.tokens = [];
    
    // Vérifier si c'est du JavaScript pur pour compatibilité
    if (code.trim().startsWith('//') && code.includes('JavaScript')) {
      this.tokens.push({ type: 'javascript', value: code });
      this.tokens.push({ type: 'EOF', value: '' });
      return;
    }
    
    // Enhanced tokenizer with support for more nekoScript syntax
    
    const keywords = [
      'nekVariable', 'nekFonction', 'nekSi', 'nekSinon', 'nekPour', 
      'nekTantQue', 'nekRetourner', 'nekImporter', 'nekModule', 'nekNouveau',
      'nekDepuis', 'importer', 'si', 'sinon', 'retourner', 'pour', 'tantque',
      'require', 'function', 'class', 'const', 'let', 'var', 'export', 'import',
      'nekExporter', 'nekRequire', 'nekRoute', 'nekServeur', 'nekBot', 'nekPackage'
    ];
    
    let current = 0;
    
    while (current < code.length) {
      let char = code[current];
      
      // Skip whitespace
      if (/\s/.test(char)) {
        current++;
        continue;
      }
      
      // Comments
      if (char === '/' && code[current + 1] === '/') {
        while (current < code.length && code[current] !== '\n') {
          current++;
        }
        continue;
      }
      
      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        let value = '';
        
        while (current < code.length && /[a-zA-Z0-9_.]/.test(code[current])) {
          value += code[current];
          current++;
        }
        
        // Check if it's a keyword
        if (keywords.includes(value)) {
          this.tokens.push({ type: 'keyword', value });
        } else {
          this.tokens.push({ type: 'identifier', value });
        }
        
        continue;
      }
      
      // Numbers
      if (/[0-9]/.test(char)) {
        let value = '';
        
        while (current < code.length && /[0-9.]/.test(code[current])) {
          value += code[current];
          current++;
        }
        
        this.tokens.push({ type: 'number', value });
        continue;
      }
      
      // Strings
      if (char === '"' || char === "'") {
        const quote = char;
        let value = '';
        current++; // Skip opening quote
        
        while (current < code.length && code[current] !== quote) {
          value += code[current];
          current++;
        }
        
        current++; // Skip closing quote
        this.tokens.push({ type: 'string', value });
        continue;
      }
      
      // Operators and punctuation
      if (/[=+\-*/%<>!&|^~?:.,;(){}[\]]/.test(char)) {
        let value = char;
        
        // Check for two-character operators
        const nextChar = code[current + 1];
        if (
          (char === '=' && nextChar === '=') ||
          (char === '!' && nextChar === '=') ||
          (char === '<' && nextChar === '=') ||
          (char === '>' && nextChar === '=') ||
          (char === '&' && nextChar === '&') ||
          (char === '|' && nextChar === '|')
        ) {
          value += nextChar;
          current++;
        }
        
        this.tokens.push({ type: 'operator', value });
        current++;
        continue;
      }
      
      // Unknown character - skip
      current++;
    }
    
    // Add EOF token
    this.tokens.push({ type: 'EOF', value: '' });
  }

  private parseStatement(): NekoAST {
    const token = this.peek();
    
    switch (token.type) {
      case 'keyword':
        switch (token.value) {
          case 'nekVariable':
            return this.parseVariableDeclaration();
          case 'nekFonction':
            return this.parseFunctionDeclaration();
          case 'nekSi':
          case 'si':
            return this.parseIfStatement();
          case 'nekModule':
            return this.parseModuleDeclaration();
          case 'nekImporter':
          case 'importer':
            return this.parseImportStatement();
          case 'retourner':
          case 'nekRetourner':
            return this.parseReturnStatement();
          default:
            this.advance(); // Skip unknown keyword
            return {
              type: 'UnknownStatement',
              keyword: token.value
            };
        }
      
      case 'identifier':
        return this.parseExpressionStatement();
      
      default:
        this.advance(); // Skip unknown token
        return {
          type: 'UnknownStatement',
          tokenType: token.type,
          tokenValue: token.value
        };
    }
  }

  private parseVariableDeclaration(): NekoAST {
    this.consume('keyword', 'nekVariable');
    const name = this.consume('identifier', 'Expected variable name').value;
    this.consume('operator', '=');
    const initializer = this.parseExpression();
    
    // Rendre le point-virgule optionnel
    if (this.check('operator') && this.peek().value === ';') {
      this.advance(); // Consommer le point-virgule si présent
    }
    
    return {
      type: 'VariableDeclaration',
      name,
      initializer
    };
  }

  private parseFunctionDeclaration(): NekoAST {
    this.consume('keyword', 'nekFonction');
    const name = this.consume('identifier', 'Expected function name').value;
    
    this.consume('operator', '(');
    const params = [];
    
    if (this.peek().value !== ')') {
      do {
        const param = this.consume('identifier', 'Expected parameter name').value;
        params.push(param);
        
        if (this.peek().value !== ',') break;
        this.advance(); // Skip comma
      } while (true);
    }
    
    this.consume('operator', ')');
    
    // Parse function body
    this.consume('operator', '{');
    const body = [];
    
    while (this.peek().value !== '}' && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    
    this.consume('operator', '}');
    
    return {
      type: 'FunctionDeclaration',
      name,
      params,
      body
    };
  }

  private parseIfStatement(): NekoAST {
    const keyword = this.peek().value;
    this.advance(); // Skip 'nekSi' or 'si'
    
    let condition;
    
    // Gestion du cas où la condition est entre parenthèses
    if (this.peek().value === '(') {
      this.advance(); // Skip '('
      condition = this.parseExpression();
      
      // Gérer le cas où il manque la parenthèse fermante
      if (this.peek().value === ')') {
        this.advance(); // Skip ')'
      }
    } else {
      // Condition sans parenthèses (style pseudocode)
      condition = this.parseExpression();
    }
    
    // Bloc de code 'then'
    let thenBranch = [];
    
    // Vérifier si le bloc commence par une accolade
    if (this.peek().value === '{') {
      this.advance(); // Skip '{'
      
      while (this.peek().value !== '}' && !this.isAtEnd()) {
        thenBranch.push(this.parseStatement());
      }
      
      // Gérer le cas où il manque l'accolade fermante
      if (this.peek().value === '}') {
        this.advance(); // Skip '}'
      }
    } else {
      // Code sans accolades, un seul statement
      thenBranch.push(this.parseStatement());
    }
    
    // Bloc 'else' optionnel
    let elseBranch = null;
    
    if (this.peek().value === 'nekSinon' || this.peek().value === 'sinon') {
      this.advance(); // Skip 'nekSinon' or 'sinon'
      
      // Vérifier si le bloc else commence par une accolade
      if (this.peek().value === '{') {
        this.advance(); // Skip '{'
        elseBranch = [];
        
        while (this.peek().value !== '}' && !this.isAtEnd()) {
          elseBranch.push(this.parseStatement());
        }
        
        // Gérer le cas où il manque l'accolade fermante
        if (this.peek().value === '}') {
          this.advance(); // Skip '}'
        }
      } else {
        // Code sans accolades, un seul statement
        elseBranch = [this.parseStatement()];
      }
    }
    
    return {
      type: 'IfStatement',
      condition,
      thenBranch,
      elseBranch
    };
  }

  private parseModuleDeclaration(): NekoAST {
    this.advance(); // Skip 'nekModule'
    
    let name = '';
    if (this.peek().type === 'identifier') {
      name = this.advance().value;
    } else {
      console.warn("Warning: Module name missing");
      name = 'AnonymeModule';
    }
    
    // Vérifier si le bloc commence par une accolade
    const body = [];
    
    if (this.peek().value === '{') {
      this.advance(); // Skip '{'
      
      while (this.peek().value !== '}' && !this.isAtEnd()) {
        try {
          body.push(this.parseStatement());
        } catch (error) {
          console.warn("Warning in module body parsing:", error);
          // Skip problematic statement
          this.advance();
        }
      }
      
      // Gérer le cas où il manque l'accolade fermante
      if (this.peek().value === '}') {
        this.advance(); // Skip '}'
      }
    }
    
    return {
      type: 'ModuleDeclaration',
      name,
      body
    };
  }

  private parseImportStatement(): NekoAST {
    const keyword = this.peek().value;
    this.advance(); // Skip 'nekImporter' or 'importer'
    
    // Handle different import syntax styles
    if (keyword === 'importer') {
      const name = this.consume('identifier', 'Expected import name').value;
      // Rendre le point-virgule optionnel
      if (this.check('operator') && this.peek().value === ';') {
        this.advance(); // Consommer le point-virgule si présent
      }
      
      return {
        type: 'ImportStatement',
        name,
        source: null
      };
    } else {
      const name = this.consume('identifier', 'Expected import name').value;
      
      let source = null;
      
      if (this.peek().value === 'nekDepuis') {
        this.advance(); // Skip 'nekDepuis'
        source = this.consume('string', 'Expected import source').value;
      }
      
      // Rendre le point-virgule optionnel
      if (this.check('operator') && this.peek().value === ';') {
        this.advance(); // Consommer le point-virgule si présent
      }
      
      return {
        type: 'ImportStatement',
        name,
        source: name // Si source est null, utiliser le nom comme source
      };
    }
  }
  
  private parseReturnStatement(): NekoAST {
    const keyword = this.peek().value;
    this.advance(); // Skip 'retourner' or 'nekRetourner'
    
    const value = this.parseExpression();
    
    // Rendre le point-virgule optionnel
    if (this.check('operator') && this.peek().value === ';') {
      this.advance(); // Consommer le point-virgule si présent
    }
    
    return {
      type: 'ReturnStatement',
      value
    };
  }

  private parseExpressionStatement(): NekoAST {
    const expr = this.parseExpression();
    
    // Rendre le point-virgule optionnel
    if (this.check('operator') && this.peek().value === ';') {
      this.advance(); // Consommer le point-virgule si présent
    }
    
    return {
      type: 'ExpressionStatement',
      expression: expr
    };
  }

  private parseExpression(): NekoAST {
    // Analyse d'expression améliorée
    const token = this.peek();
    
    if (token.type === 'string') {
      this.advance();
      return {
        type: 'StringLiteral',
        value: token.value
      };
    } else if (token.type === 'number') {
      this.advance();
      return {
        type: 'NumberLiteral',
        value: parseFloat(token.value)
      };
    } else if (token.type === 'identifier') {
      this.advance();
      
      // Vérifier les expressions composées comme "obj.methode"
      let identifier = token.value;
      
      // Gestion des appels de méthodes (obj.method)
      while (this.peek().value === '.') {
        this.advance(); // Skip '.'
        
        if (this.peek().type === 'identifier') {
          identifier += '.' + this.advance().value;
        } else {
          break;
        }
      }
      
      // Vérifier si c'est un appel de fonction/méthode
      if (this.peek().value === '(') {
        this.advance(); // Skip '('
        
        const args = [];
        
        if (this.peek().value !== ')') {
          do {
            // Permettre les expressions vides (comme dans obj.method(,))
            if (this.peek().value === ',') {
              this.advance(); // Skip la virgule
              continue;
            }
            
            args.push(this.parseExpression());
            
            if (this.peek().value !== ',') break;
            this.advance(); // Skip comma
          } while (true);
        }
        
        // Être plus permissif avec la parenthèse fermante
        if (this.peek().value === ')') {
          this.advance(); // Skip ')'
        }
        
        return {
          type: 'CallExpression',
          callee: identifier,
          arguments: args
        };
      }
      
      // Simple identifier
      return {
        type: 'Identifier',
        name: identifier
      };
    } else {
      this.advance(); // Skip unknown token in expression
      return {
        type: 'UnknownExpression',
        tokenType: token.type,
        tokenValue: token.value
      };
    }
  }

  private consume(type: string, message: string): NekoToken {
    if (this.check(type)) {
      return this.advance();
    }
    
    throw new Error(message);
  }

  private check(type: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): NekoToken {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private peek(): NekoToken {
    return this.tokens[this.current];
  }

  private previous(): NekoToken {
    return this.tokens[this.current - 1];
  }
}

export const nekoParser = new NekoParser();
