import { Lox } from './main';
import { Token } from './token';
import { TokenType } from './tokenType';

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  private scanToken() {
    const c: string = this.advance();
    switch (c) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '!':
        this.addToken(
          this.matchAndAdvance('=') ? TokenType.BANG_EQUAL : TokenType.BANG
        );
        break;
      case '=':
        this.addToken(
          this.matchAndAdvance('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case '<':
        this.addToken(
          this.matchAndAdvance('=') ? TokenType.LESS_EQUAL : TokenType.LESS
        );
        break;
      case '>':
        this.addToken(
          this.matchAndAdvance('=')
            ? TokenType.GREATER_EQUAL
            : TokenType.GREATER
        );
        break;
      case '/':
        if (this.matchAndAdvance('/')) {
          // A comment goes until the end of the line.
          while (this.peek() != '\n' && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;
      case '\n':
        this.line += 1;
        break;
      case '"':
        this.parseString();
        break;
      default:
        if (this.isDigit(c)) {
          this.parseNumber();
        } else {
          Lox.error(this.line, 'Unexpected character.');
        }
        break;
    }
  }

  private advance() {
    const c = this.source.charAt(this.current);
    this.current += 1;
    return c;
  }

  private addToken(type: TokenType) {
    this.addTokenLiteral(type, null);
  }

  private addTokenLiteral(type: TokenType, literal) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private matchAndAdvance(expectedCharacter: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) != expectedCharacter) {
      return false;
    }

    this.current += 1;

    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return '\0';
    }

    return this.source.charAt(this.current);
  }

  private parseString() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line += 1;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, 'Unterminated string.');
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addTokenLiteral(TokenType.STRING, value);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private parseNumber() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for a fractional part.
    if (this.peek() == '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addTokenLiteral(
      TokenType.NUMBER,
      parseFloat(this.source.substring(this.start, this.current))
    );
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return '\0';
    }

    return this.source.charAt(this.current + 1);
  }
}
