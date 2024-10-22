import { Binary, Expr, Grouping, Literal, Unary } from './expr.js';
import { Lox } from './main.js';
import { Expression, Print, Stmt } from './stmt.js';
import { Token } from './token.js';
import { TokenType } from './tokenType.js';

export class ParseError extends Error {}

/**
 *
 * program        → declaration* EOF ;
 * declaration    → varDecl
                   | statement ;
 * varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;
 * statement      → exprStmt
 *                 | printStmt ;
 * exprStmt       → expression ";" ;
 * printStmt      → "print" expression ";" ;
 *
 * expression     → equality ;
 * equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 * term           → factor ( ( "-" | "+" ) factor )* ;
 * factor         → unary ( ( "/" | "*" ) unary )* ;
 * unary          → ( "!" | "-" ) unary
 *                  | primary ;
 * primary        → NUMBER | STRING | "true" | "false" | "nil"
 *                  | "(" expression ")" 
 *                  | IDENTIFIER ;
 */

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.statement());
    }

    return statements;
  }

  private statement(): Stmt {
    if (this.matchCurr([TokenType.PRINT])) {
      return this.printStatement();
    }

    return this.expressionStatement();
  }

  private printStatement(): Print {
    const value: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");

    return new Print(value);
  }

  private expressionStatement(): Expression {
    const value: Expr = this.expression();

    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");

    return new Expression(value);
  }

  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.matchCurr([TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL])) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    while (
      this.matchCurr([
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      ])
    ) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.matchCurr([TokenType.PLUS, TokenType.MINUS])) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.matchCurr([TokenType.STAR, TokenType.SLASH])) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.matchCurr([TokenType.BANG, TokenType.MINUS])) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  primary(): Expr {
    if (this.matchCurr([TokenType.FALSE])) {
      return new Literal(false);
    }
    if (this.matchCurr([TokenType.TRUE])) {
      return new Literal(true);
    }
    if (this.matchCurr([TokenType.NIL])) {
      return new Literal(null);
    }

    if (this.matchCurr([TokenType.NUMBER, TokenType.STRING])) {
      return new Literal(this.previous().literal);
    }

    if (this.matchCurr([TokenType.LEFT_PAREN])) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), 'Expected expression.');
  }

  private matchCurr(types: TokenType[]) {
    for (const type of types) {
      if (this.checkType(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private checkType(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    return this.peek().type == type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current += 1;
    }

    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type == TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.checkType(type)) {
      return this.advance();
    }

    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParseError {
    Lox.error(message, token);
    return new ParseError();
  }

  // Uncomment once we have statements
  // private synchronize() {
  //   this.advance();

  //   while (!this.isAtEnd()) {
  //     if (this.previous().type == SEMICOLON) return;

  //     switch (peek().type) {
  //       case CLASS:
  //       case FUN:
  //       case VAR:
  //       case FOR:
  //       case IF:
  //       case WHILE:
  //       case PRINT:
  //       case RETURN:
  //         return;
  //     }

  //     this.advance();
  //   }
  // }
}
