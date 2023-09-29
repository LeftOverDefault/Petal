import { FuncDeclaration, Program, VarDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { FuncValue, MK_NULL, RuntimeVal } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = MK_NULL();
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env);
    }
    return lastEvaluated;
}

export function eval_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
    const value = declaration.value
        ? evaluate(declaration.value, env)
        : MK_NULL();

    return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_func_declaration(declaration: FuncDeclaration, env: Environment): RuntimeVal {
    // Create new function scope
    const func = {
        type: "func",
        name: declaration.name,
        parameters: declaration.parameters,
        declarationEnv: env,
        body: declaration.body,
    } as FuncValue;

    return env.declareVar(declaration.name, func, true);
}