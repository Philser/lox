import fs from 'fs';
import readline from 'readline/promises';
import { Interpreter, RuntimeError } from './interpreter.js';
import { Parser } from './parser.js';
import { Scanner } from './scanner.js';
import { Stmt } from './stmt.js';
import { Token } from './token.js';
import { TokenType } from './tokenType.js';

export class Lox {
  // TODO: We could also jsut make run() return an optional error object
  static hadError = false;
  static hadRuntimeError = false;

  static runtimeError(e: RuntimeError) {
    console.log(
      `Error at Line ${e.token.line}: '${e.token.toString()}' ${e.message}`
    );
    this.hadRuntimeError = true;
  }

  public static main() {
    const args = process.argv;
    if (args.length > 3) {
      console.log('Usage: jslox [script]');
      process.exit(1);
    } else if (args.length == 3) {
      Lox.runFile(args[2]);
    } else {
      Lox.runPrompt()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
    }
  }

  static runFile(path: string) {
    const fileInput = fs.readFileSync(path).toString('utf-8');
    run(fileInput);

    if (Lox.hadError) {
      process.exit(65);
    }

    if (Lox.hadRuntimeError) {
      process.exit(70);
    }
  }

  static async runPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    while (true) {
      const line = await rl.question('> ');
      if (line === null) {
        rl.close();
        process.exit(0);
      }
      run(line);
      Lox.hadError = false;
    }
  }

  static error(message: string, line: number): void;
  static error(message: string, token: Token): void;
  static error(message: string, lineOrToken: number | Token) {
    if (typeof lineOrToken === 'number') {
      return Lox.report(lineOrToken, '', message);
    }

    if (lineOrToken.type === TokenType.EOF) {
      Lox.report(lineOrToken.line, ' at end', message);
    } else {
      Lox.report(lineOrToken.line, ' at "' + lineOrToken.lexeme + '"', message);
    }
  }

  static report(line: number, where: string, message: string) {
    console.log('[line ' + line + '] Error' + where + ': ' + message);
    Lox.hadError = true;
  }
}

function run(source: string) {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  const parser: Parser = new Parser(tokens);
  const statements: Stmt[] = parser.parse();

  // Stop if there was a syntax error.
  if (Lox.hadError) return;

  new Interpreter().interpret(statements);
}

Lox.main();
