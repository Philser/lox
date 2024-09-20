import fs from 'fs';
import readline from 'readline';
export class Lox {
    static main() {
        const args = process.argv;
        if (args.length > 3) {
            console.log('Usage: jslox [script]');
            process.exit(1);
        }
        else if (args.length == 3) {
            runFile(args[2]);
        }
        else {
            runPrompt();
        }
    }
}
function runFile(path) {
    const fileInput = fs.readFileSync(path).toString('utf-8');
    eval(fileInput);
}
function runPrompt() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question(`>`, (line) => {
        if (line === null) {
            rl.close();
            return;
        }
        eval(line);
    });
}
Lox.main();
//# sourceMappingURL=main.js.map