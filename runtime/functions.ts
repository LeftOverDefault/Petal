import Environment from "./environment.ts";
import { MK_NUMBER, RuntimeVal } from "./values.ts";

export function timeFunction(_args: RuntimeVal[], _env: Environment) {
    return MK_NUMBER(Date.now());
}