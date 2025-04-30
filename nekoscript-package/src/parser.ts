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
    // Tokenize the code
    this.tokenize(code);
    this.current = 0;

    // Parse the tokens into an AST
    const program: NekoAST = {
      type: 'Program',
      body: []
    };

    while (!this.isAtEnd()) {
      program.body.push(this.parseStatement());
    }

    return program;
  }

  private tokenize(code: string): void {
    this.tokens = [];
    // Very basic tokenizer
    // In a real implementation, this would be much more sophisticated

    // Split by whitespace for simplicity
    const lines = code.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('//')) continue; // Skip comments

      // Check for keywords
      if (line.startsWith('nekModule')) {
        this.tokens.push({ type: 'MODULE', value: 'nekModule' });
        const name = line.match(/nekModule\s+(\w+)/)?.[1];
        if (name) {
          this.tokens.push({ type: 'IDENTIFIER', value: name });
        }
        if (line.includes('{')) {
          this.tokens.push({ type: 'LBRACE', value: '{' });
        }
      } 
      else if (line.startsWith('nekImporter')) {
        this.tokens.push({ type: 'IMPORT', value: 'nekImporter' });
        const name = line.match(/nekImporter\s+(\w+)/)?.[1];
        if (name) {
          this.tokens.push({ type: 'IDENTIFIER', value: name });
        }
        if (line.includes(';')) {
          this.tokens.push({ type: 'SEMICOLON', value: ';' });
        }
      }
      else if (line.startsWith('nekVariable')) {
        this.tokens.push({ type: 'VARIABLE', value: 'nekVariable' });
        const def = line.match(/nekVariable\s+(\w+)\s*=\s*(.+);/);
        if (def) {
          this.tokens.push({ type: 'IDENTIFIER', value: def[1] });
          this.tokens.push({ type: 'ASSIGN', value: '=' });
          this.tokens.push({ type: 'LITERAL', value: def[2] });
          this.tokens.push({ type: 'SEMICOLON', value: ';' });
        }
      }
      else if (line.startsWith('nekFonction')) {
        this.tokens.push({ type: 'FUNCTION', value: 'nekFonction' });
        const name = line.match(/nekFonction\s+(\w+)/)?.[1];
        if (name) {
          this.tokens.push({ type: 'IDENTIFIER', value: name });
        }
        if (line.includes('(')) {
          this.tokens.push({ type: 'LPAREN', value: '(' });
        }
        if (line.includes(')')) {
          this.tokens.push({ type: 'RPAREN', value: ')' });
        }
        if (line.includes('{')) {
          this.tokens.push({ type: 'LBRACE', value: '{' });
        }
      }
      else if (line.startsWith('nekSi')) {
        this.tokens.push({ type: 'IF', value: 'nekSi' });
        if (line.includes('(')) {
          this.tokens.push({ type: 'LPAREN', value: '(' });
        }
        const condition = line.match(/nekSi\s*\((.+)\)/)?.[1];
        if (condition) {
          this.tokens.push({ type: 'EXPRESSION', value: condition });
        }
        if (line.includes(')')) {
          this.tokens.push({ type: 'RPAREN', value: ')' });
        }
        if (line.includes('{')) {
          this.tokens.push({ type: 'LBRACE', value: '{' });
        }
      }
      else if (line.startsWith('nekRetourner')) {
        this.tokens.push({ type: 'RETURN', value: 'nekRetourner' });
        const value = line.match(/nekRetourner\s+(.+);/)?.[1];
        if (value) {
          this.tokens.push({ type: 'EXPRESSION', value });
        }
        if (line.includes(';')) {
          this.tokens.push({ type: 'SEMICOLON', value: ';' });
        }
      }
      else if (line.startsWith('nekAfficher')) {
        this.tokens.push({ type: 'PRINT', value: 'nekAfficher' });
        if (line.includes('(')) {
          this.tokens.push({ type: 'LPAREN', value: '(' });
        }
        const arg = line.match(/nekAfficher\s*\((.+)\)/)?.[1];
        if (arg) {
          this.tokens.push({ type: 'EXPRESSION', value: arg });
        }
        if (line.includes(')')) {
          this.tokens.push({ type: 'RPAREN', value: ')' });
        }
        if (line.includes(';')) {
          this.tokens.push({ type: 'SEMICOLON', value: ';' });
        }
      }
      else if (line === '}') {
        this.tokens.push({ type: 'RBRACE', value: '}' });
      }
      else if (line) {
        // Simple expression
        this.tokens.push({ type: 'EXPRESSION', value: line });
      }
    }

    this.tokens.push({ type: 'EOF', value: 'EOF' });
  }

  private parseStatement(): NekoAST {
    if (this.check('MODULE')) {
      return this.parseModuleDeclaration();
    }
    if (this.check('IMPORT')) {
      return this.parseImportStatement();
    }
    if (this.check('VARIABLE')) {
      return this.parseVariableDeclaration();
    }
    if (this.check('FUNCTION')) {
      return this.parseFunctionDeclaration();
    }
    if (this.check('IF')) {
      return this.parseIfStatement();
    }
    
    // For any other token, assume it's an expression statement
    return this.parseExpressionStatement();
  }

  private parseVariableDeclaration(): NekoAST {
    this.consume('VARIABLE', "Expected 'nekVariable'");
    const name = this.consume('IDENTIFIER', "Expected variable name").value;
    this.consume('ASSIGN', "Expected '='");
    const value = this.consume('LITERAL', "Expected variable value").value;
    this.consume('SEMICOLON', "Expected ';'");
    
    return {
      type: 'VariableDeclaration',
      name,
      value
    };
  }

  private parseFunctionDeclaration(): NekoAST {
    this.consume('FUNCTION', "Expected 'nekFonction'");
    const name = this.consume('IDENTIFIER', "Expected function name").value;
    this.consume('LPAREN', "Expected '('");
    
    // Parse parameters (simplified)
    const params: string[] = [];
    if (!this.check('RPAREN')) {
      // TODO: implement parameter parsing
    }
    
    this.consume('RPAREN', "Expected ')'");
    this.consume('LBRACE', "Expected '{'");
    
    // Parse function body (simplified)
    const body: NekoAST[] = [];
    while (!this.check('RBRACE') && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    
    this.consume('RBRACE', "Expected '}'");
    
    return {
      type: 'FunctionDeclaration',
      name,
      params,
      body
    };
  }

  private parseIfStatement(): NekoAST {
    this.consume('IF', "Expected 'nekSi'");
    this.consume('LPAREN', "Expected '('");
    const condition = this.consume('EXPRESSION', "Expected condition").value;
    this.consume('RPAREN', "Expected ')'");
    this.consume('LBRACE', "Expected '{'");
    
    // Parse if body
    const body: NekoAST[] = [];
    while (!this.check('RBRACE') && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    
    this.consume('RBRACE', "Expected '}'");
    
    return {
      type: 'IfStatement',
      condition,
      body
    };
  }

  private parseModuleDeclaration(): NekoAST {
    this.consume('MODULE', "Expected 'nekModule'");
    const name = this.consume('IDENTIFIER', "Expected module name").value;
    this.consume('LBRACE', "Expected '{'");
    
    // Parse module body
    const body: NekoAST[] = [];
    while (!this.check('RBRACE') && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    
    this.consume('RBRACE', "Expected '}'");
    
    return {
      type: 'ModuleDeclaration',
      name,
      body
    };
  }

  private parseImportStatement(): NekoAST {
    this.consume('IMPORT', "Expected 'nekImporter'");
    const moduleName = this.consume('IDENTIFIER', "Expected module name").value;
    this.consume('SEMICOLON', "Expected ';'");
    
    return {
      type: 'ImportStatement',
      moduleName
    };
  }

  private parseExpressionStatement(): NekoAST {
    if (this.check('PRINT')) {
      this.consume('PRINT', "Expected 'nekAfficher'");
      this.consume('LPAREN', "Expected '('");
      const expression = this.consume('EXPRESSION', "Expected expression").value;
      this.consume('RPAREN', "Expected ')'");
      if (this.check('SEMICOLON')) {
        this.consume('SEMICOLON', "Expected ';'");
      }
      
      return {
        type: 'PrintStatement',
        expression
      };
    }
    
    if (this.check('RETURN')) {
      this.consume('RETURN', "Expected 'nekRetourner'");
      const value = this.consume('EXPRESSION', "Expected expression").value;
      this.consume('SEMICOLON', "Expected ';'");
      
      return {
        type: 'ReturnStatement',
        value
      };
    }
    
    const expression = this.consume('EXPRESSION', "Expected expression").value;
    if (this.check('SEMICOLON')) {
      this.consume('SEMICOLON', "Expected ';'");
    }
    
    return {
      type: 'ExpressionStatement',
      expression
    };
  }

  private parseExpression(): NekoAST {
    // Very simplified expression parsing
    const value = this.consume('EXPRESSION', "Expected expression").value;
    
    return {
      type: 'Expression',
      value
    };
  }

  private consume(type: string, message: string): NekoToken {
    if (this.check(type)) {
      return this.advance();
    }
    
    throw new Error(`Parse error: ${message}, found ${this.peek().type}`);
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