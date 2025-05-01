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
    
    // Enhanced tokenizer with support for more nekoScript syntax
    
    const keywords = [
      'nekVariable', 'nekFonction', 'nekSi', 'nekSinon', 'nekPour', 
      'nekTantQue', 'nekRetourner', 'nekImporter', 'nekModule', 'nekNouveau',
      'nekDepuis', 'importer', 'si', 'sinon', 'retourner', 'pour', 'tantque'
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
    this.consume('operator', ';');
    
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
    
    this.consume('operator', '(');
    const condition = this.parseExpression();
    this.consume('operator', ')');
    
    this.consume('operator', '{');
    const thenBranch = [];
    
    while (this.peek().value !== '}' && !this.isAtEnd()) {
      thenBranch.push(this.parseStatement());
    }
    
    this.consume('operator', '}');
    
    let elseBranch = null;
    
    if (this.peek().value === 'nekSinon' || this.peek().value === 'sinon') {
      this.advance(); // Skip 'nekSinon' or 'sinon'
      
      this.consume('operator', '{');
      elseBranch = [];
      
      while (this.peek().value !== '}' && !this.isAtEnd()) {
        elseBranch.push(this.parseStatement());
      }
      
      this.consume('operator', '}');
    }
    
    return {
      type: 'IfStatement',
      condition,
      thenBranch,
      elseBranch
    };
  }

  private parseModuleDeclaration(): NekoAST {
    this.consume('keyword', 'nekModule');
    const name = this.consume('identifier', 'Expected module name').value;
    
    this.consume('operator', '{');
    const body = [];
    
    while (this.peek().value !== '}' && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    
    this.consume('operator', '}');
    
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
      this.consume('operator', ';');
      
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
      
      this.consume('operator', ';');
      
      return {
        type: 'ImportStatement',
        name,
        source
      };
    }
  }
  
  private parseReturnStatement(): NekoAST {
    const keyword = this.peek().value;
    this.advance(); // Skip 'retourner' or 'nekRetourner'
    
    const value = this.parseExpression();
    this.consume('operator', ';');
    
    return {
      type: 'ReturnStatement',
      value
    };
  }

  private parseExpressionStatement(): NekoAST {
    const expr = this.parseExpression();
    this.consume('operator', ';');
    
    return {
      type: 'ExpressionStatement',
      expression: expr
    };
  }

  private parseExpression(): NekoAST {
    // Very simplified expression parsing
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
      
      // Check for function call
      if (this.peek().value === '(') {
        this.advance(); // Skip '('
        
        const args = [];
        
        if (this.peek().value !== ')') {
          do {
            args.push(this.parseExpression());
            
            if (this.peek().value !== ',') break;
            this.advance(); // Skip comma
          } while (true);
        }
        
        this.consume('operator', ')');
        
        return {
          type: 'CallExpression',
          callee: token.value,
          arguments: args
        };
      }
      
      // Simple identifier
      return {
        type: 'Identifier',
        name: token.value
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
