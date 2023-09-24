import Environment from "./environment.ts";
import { MK_BOOL, MK_NULL, MK_NUMBER, RuntimeVal } from "./values.ts";

export function printFunc(args: RuntimeVal[], _env: Environment) {
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
}

export function timeFunc(_args: RuntimeVal[], _env: Environment) {
    return MK_NUMBER(Date.now());
}

export function notFunc(args: RuntimeVal[], _env: Environment) {
    if (args[0].value == true) {
        return MK_BOOL(!args[0].value);
    } else if (args[0].value == false) {
        return MK_BOOL(!args[0].value);
    } else {
        throw `Cannot use a non boolean value in a logic gate`
    }
}

export function orFunc(args: RuntimeVal[], _env: Environment) {
    if (args.length > 2) {
        throw `Or function cannot take more than 2 boolean values`
    } else {
        const val1: boolean = args[0].value;
        const val2: boolean = args[1].value;
        if (val1 || val2) {
            return MK_BOOL(true);
        } else {
            return MK_BOOL(false);
        }
    }
}

export function andFunc(args: RuntimeVal[], _env: Environment) {
    if (args.length > 2) {
        throw `And function cannot take more than 2 boolean values`
    } else {
        const val1: boolean = args[0].value;
        const val2: boolean = args[1].value;
        if (val1 && val2) {
            return MK_BOOL(true);
        } else {
            return MK_BOOL(false);
        }
    }
}

export function xorFunc(args: RuntimeVal[], _env: Environment) {
    if (args.length > 2) {
        throw `Xor function cannot take more than 2 boolean values`
    } else {
        const val1: boolean = args[0].value;
        const val2: boolean = args[1].value;
        if (val1 && val2) {
            return MK_BOOL(false);
        } else if (val1 || val2) {
            return MK_BOOL(true);
        } else {
            return MK_BOOL(false);
        }
    }
}

export function nandFunc(args: RuntimeVal[], _env: Environment) {
    if (args.length > 2) {
        throw `Nand function cannot take more than 2 boolean values`
    } else {
        const val1: boolean = args[0].value;
        const val2: boolean = args[1].value;
        if (val1 && val2) {
            return MK_BOOL(false);
        } else {
            return MK_BOOL(true);
        }
    }
}

export function norFunc(args: RuntimeVal[], _env: Environment) {
    if (args.length > 2) {
        throw `Nor function cannot take more than 2 boolean values`
    } else {
        const val1: boolean = args[0].value;
        const val2: boolean = args[1].value;
        if (val1 || val2) {
            return MK_BOOL(false);
        } else {
            return MK_BOOL(true);
        }
    }
}

export function xnorFunc(args: RuntimeVal[], _env: Environment) {
    if (args.length > 2) {
        throw `Xor function cannot take more than 2 boolean values`
    } else {
        const val1: boolean = args[0].value;
        const val2: boolean = args[1].value;
        if (val1 && val2) {
            return MK_BOOL(true);
        } else if (val1 || val2) {
            return MK_BOOL(false);
        } else {
            return MK_BOOL(true);
        }
    }
}