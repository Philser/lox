import fs from 'fs';
import readline from 'readline';
import { Scanner } from './scanner';

export class Lox {
  // TODO: We could also jsut make run() return an optional error object
  static hadError = false;

  public static main() {
    const args = process.argv;
    if (args.length > 3) {
      console.log('Usage: jslox [script]');
      process.exit(1);
    } else if (args.length == 3) {
      Lox.runFile(args[2]);
    } else {
      Lox.runPrompt();
    }
  }

  static runFile(path: string) {
    const fileInput = fs.readFileSync(path).toString('utf-8');
    run(fileInput);

    if (Lox.hadError) {
      process.exit(65);
    }
  }

  static runPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`>`, (line) => {
      if (line === null) {
        rl.close();
        return;
      }
      run(line);
      Lox.hadError = false;
    });
  }

  static error(line: number, message: string) {
    Lox.report(line, '', message);
  }

  static report(line: number, where: string, message: string) {
    console.log('[line ' + line + '] Error' + where + ': ' + message);
    Lox.hadError = true;
  }
}

function run(source: string) {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  for (const token of tokens) {
    console.log(token);
  }
}

Lox.main();
