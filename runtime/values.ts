import { Stmt } from "../frontend/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "string" | "boolean" | "object" | "native-func" | "func";

export interface RuntimeVal {
    type: ValueType;
    // deno-lint-ignore no-explicit-any
    value: any;
}

/**
 * Defines a value of undefined meaning
 */
export interface NullVal extends RuntimeVal {
    type: "null";
    value: null;
}

export function MK_NULL() {
    return { type: "null", value: null } as NullVal;
}

export interface BooleanVal extends RuntimeVal {
    type: "boolean";
    value: boolean;
}

export function MK_BOOL(b = true) {
    return { type: "boolean", value: b } as BooleanVal;
}

/**
 * Runtime value that has access to the raw native javascript number.
 */
export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}

export function MK_NUMBER(n = 0) {
    return { type: "number", value: n } as NumberVal;
}

export interface StringVal extends RuntimeVal {
    type: "string";
    value: string;
}

/**
 * Runtime value that has access to the raw native javascript number.
 */
export interface ObjectVal extends RuntimeVal {
    type: "object";
    properties: Map<string, RuntimeVal>;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;

export interface NativeFuncValue extends RuntimeVal {
    type: "native-func";
    call: FunctionCall;
}

export function MK_NATIVE_FUNC(call: FunctionCall) {
    return { type: "native-func", call } as NativeFuncValue;
}

export interface FuncValue extends RuntimeVal {
    type: "func";
    name: string;
    parameters: string[];
    declarationEnv: Environment;
    body: Stmt[];
}