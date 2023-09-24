import Parser from "./frontend/parser.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

console.clear();
console.log("Run program (run) / Run repl (repl):");
const input = prompt(">>>");

if (input !== null) {
    if (input.toLowerCase() == "repl") {
        _repl()
    } else {
        _run("./test.ptl");
    }
}

async function _run(filename: string) {
    console.clear();
    const parser = new Parser();
    const env = createGlobalEnv();

    const input = await Deno.readTextFile(filename);
    const program = parser.produceAST(input);

    const _result = evaluate(program, env);
    // console.log(_result);
}

function _repl() {
    console.clear();
    const parser = new Parser();
    const env = createGlobalEnv();

    // INITIALIZE REPL
    console.log("Petal v0.1.0\n");

    // Continue Repl Until User Stops Or Types `exit`
    while (true) {
        const input = prompt(">>>");
        // Check for no user input or exit keyword.
        if (!input || input.includes("exit")) {
            Deno.exit(1);
        }

        // Produce AST From sourc-code
        const program = parser.produceAST(input);

        const _result = evaluate(program, env);
        // console.log(_result);
    }
}