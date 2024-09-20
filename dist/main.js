export class Lox {
    static main() {
        const args = '';
        if (args.length > 1) {
            console.log('Usage: jlox [script]');
            process.exit(1);
        }
        else if (args.length == 1) {
            runFile(args[0]);
        }
        else {
            runPrompt();
        }
    }
}
function runFile(path) { }
function runPrompt() { }
//# sourceMappingURL=main.js.map