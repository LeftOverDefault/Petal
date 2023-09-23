import Parser from "./frontend/parser.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

const input = prompt(">>>");

if (input !== null) {
    if (input.toLowerCase() == "repl") {
        _repl()
    } else {
        _run("./test.ptl");
    }
}

async function _run(filename: string) {
    const parser = new Parser();
    const env = createGlobalEnv();

    const input = await Deno.readTextFile(filename);
    const program = parser.produceAST(input);

    const _result = evaluate(program, env);
    // console.log(result);
}

function _repl() {
    const parser = new Parser();
    const env = createGlobalEnv();

    // INITIALIZE REPL
    console.log("\nRepl v0.1");

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
        // console.log(result);
    }
}