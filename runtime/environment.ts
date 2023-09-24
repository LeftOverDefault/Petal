import {
    MK_BOOL,
    MK_NATIVE_FUNC,
    MK_NULL,
    RuntimeVal,
} from "./values.ts";

import { andFunc, nandFunc, norFunc, notFunc, orFunc, timeFunc, xnorFunc, xorFunc } from "./functions.ts";

export function createGlobalEnv() {
    const env = new Environment();
    // Create Default Global Enviornment
    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);

    // Define a native builtin method
    env.declareVar(
        "print", MK_NATIVE_FUNC((args, _scope) => {
            const result: string[] = [];
            for (let i = 0; i < args.length; i++) {
                result.push(String(args[i].value))
            }
            let newResult = "";
            for (let j = 0; j < args.length; j++) {
                newResult += result[j] + " ";
            }
            console.log(newResult);
            return MK_NULL();
        }), true
    );



    env.declareVar("time", MK_NATIVE_FUNC(timeFunc), true);

    // Boolean Logic Function
    env.declareVar("not", MK_NATIVE_FUNC((args, _scope) => { return notFunc(args, env); }), true);
    env.declareVar("or", MK_NATIVE_FUNC((args, _scope) => { return orFunc(args, env); }), true);
    env.declareVar("nor", MK_NATIVE_FUNC((args, _scope) => { return norFunc(args, env); }), true);
    env.declareVar("and", MK_NATIVE_FUNC((args, _scope) => { return andFunc(args, env); }), true);
    env.declareVar("nand", MK_NATIVE_FUNC((args, _scope) => { return nandFunc(args, env); }), true);
    env.declareVar("xor", MK_NATIVE_FUNC((args, _scope) => { return xorFunc(args, env); }), true);
    env.declareVar("xnor", MK_NATIVE_FUNC((args, _scope) => { return xnorFunc(args, env); }), true);

    return env;
}

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>;
    private constants: Set<string>;

    constructor(parentENV?: Environment) {
        // const global = parentENV ? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar(
        varname: string,
        value: RuntimeVal,
        constant: boolean
    ): RuntimeVal {
        if (this.variables.has(varname)) {
            throw `Cannot declare variable ${varname}. As it already is defined.`;
        }

        this.variables.set(varname, value);
        if (constant) {
            this.constants.add(varname);
        }
        return value;
    }

    public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
        const env = this.resolve(varname);

        // Cannot assign to constant
        if (env.constants.has(varname)) {
            throw `Cannot reasign to variable ${varname} as it was declared constant.`;
        }

        env.variables.set(varname, value);
        return value;
    }

    public lookupVar(varname: string): RuntimeVal {
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeVal;
    }

    public resolve(varname: string): Environment {
        if (this.variables.has(varname)) {
            return this;
        }

        if (this.parent == undefined) {
            throw `Cannot resolve '${varname}' as it does not exist.`;
        }

        return this.parent.resolve(varname);
    }
}