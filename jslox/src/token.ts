import { TokenType } from './tokenType';

export class Token {
  public type: TokenType;
  public lexeme: string;
  public literal: {};
  public line: number;

  constructor(type: TokenType, lexeme: string, literal: {}, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  public toString(): string {
    return this.type + ' ' + this.lexeme + ' ' + this.literal;
  }
}
