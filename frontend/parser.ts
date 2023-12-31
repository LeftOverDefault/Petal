// https://github.com/LeftOverDefault/Petal
// ------------------------------------------------------------
// -----------------          PARSER          -----------------
// ---  Receives inputs and breaks them up into attributes  ---
// ------------------------------------------------------------

import {
    AssignmentExpr,
    BinaryExpr,
    BooleanLiteral,
    CallExpr,
    Expr,
    FuncDeclaration,
    Identifier,
    IfStmt,
    MemberExpr,
    NumericLiteral,
    ObjectLiteral,
    Program,
    Property,
    Stmt,
    StringLiteral,
    VarDeclaration,
} from "./ast.ts";

import { Token, tokenize, TokenType } from "./lexer.ts";

/**
 * Frontend for producing a valid AST from sourcode
 */
export default class Parser {
    private tokens: Token[] = [];

    /*
     * Determines if the parsing is complete and the END OF FILE Is reached.
     */
    private not_eof(): boolean {
        return this.tokens[0].type != TokenType.EOF;
    }

    /**
     * Returns the currently available token
     */
    private at() {
        return this.tokens[0] as Token;
    }

    /**
     * Returns the previous token and then advances the tokens array to the next value.
    */
    private eat() {
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    /**
     * Returns the previous token and then advances the tokens array to the next value.
     *  Also checks the type of expected token and throws if the values dnot match.
    */
    // deno-lint-ignore no-explicit-any
    private expect(type: TokenType, err: any) {
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, "\n", prev, "- Expecting:", TokenType[type]);
            Deno.exit(1);
        }

        return prev;
    }


    public produceAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode);
        const program: Program = {
            kind: "Program",
            body: [],
        };


        // Parse until end of file
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }

        console.log(program);
        return program;
    }

    // Handle complex statement types
    private parse_stmt(): Stmt {
        // skip to parse_expr
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_var_declaration();
            case TokenType.Func:
                return this.parse_func_declaration();
            case TokenType.If:
                return this.parse_if_statement();
            default:
                return this.parse_expr();
        }
    }

    public ParseStatement() {
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_var_declaration();
            case TokenType.Func:
                return this.parse_func_declaration();
            case TokenType.If:
                return this.parse_if_statement();
            default:
                return this.parse_expr();
        }
    }

    parse_if_statement() {
        this.eat(); // move past if keyword
        this.expect(TokenType.OpenParen, "Must enclose condition in parentheses");
        if (this.at().type === TokenType.CloseParen) {
            throw "Missing conditional statement";
        }

        const condition = this.parse_expr();

        this.expect(TokenType.CloseParen, "Must enclose condition in parentheses");

        const ifBody = this.parse_block();
        // use this to store potential else if statements
        const elseIfBlocks = [];
        // stores the final else statement if it exists
        let elseBlock = null;

        // now we check for elseIf blocks
        while (this.not_eof() && this.at().type === TokenType.Elif) {
            this.eat(); // move past keyword

            // expect parentheses and an expression that evaluates to true/false
            this.expect(TokenType.OpenParen, "Must enclose condition in parentheses");

            // if no expression, throw error
            if (this.at().type === TokenType.CloseParen) {
                throw "Missing conditional statement";
            }

            // parse conditional
            const elseIfCondition = this.parse_expr();

            this.expect(TokenType.CloseParen, "Must enclose condition in parentheses");

            const elseIfBody = this.parse_block();
            elseIfBlocks.push({ condition: elseIfCondition, body: elseIfBody });
        }

        // check for else block
        if (this.at().type === TokenType.Else) {
            this.eat();
            elseBlock = this.parse_block();
        }

        return {
            kind: "IfStatement",
            condition,
            ifBody,
            elseIfBlocks,
            elseBlock,
        } as IfStmt;
    }

    // can be merged with the parseFuncBody. Will do that later
    parse_block() {
        this.expect(TokenType.OpenBrace, "Missing curly brace to define block body");

        if (this.at().type === TokenType.CloseBrace) {
            throw "Missing block body";
        }

        const statements = [];

        while (this.not_eof() && this.at().type !== TokenType.CloseBrace) {
            statements.push(this.parse_stmt());
        }
        this.expect(
            TokenType.CloseBrace,
            "Missing closing curly brace for block statement"
        );

        return statements;
    }

    parse_func_declaration(): Stmt {
        this.eat() // Eat func keyword
        const name = this.expect(TokenType.Identifier, "Expected function name following func declaration keyword").value;

        const args = this.parse_args()
        const params: string[] = [];
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                throw "Inside function declaration expected parameters to be of type string.";
            }

            params.push((arg as Identifier).symbol);
        }

        this.expect(TokenType.OpenBrace, "Expected function body following function declaration");

        const body: Stmt[] = [];

        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parse_stmt());
        }

        this.expect(TokenType.CloseBrace, "Closing brace expected inside function declaration");
        const func = { body, name, parameters: params, kind: "FuncDeclaration" } as FuncDeclaration;

        return func;
    }

    parse_var_declaration(): Stmt {
        const isConstant = this.eat().type == TokenType.Const;
        const identifier = this.expect(
            TokenType.Identifier,
            "Expected identifier name following let | const keywords.",
        ).value;

        let dataType = "";

        if (this.at().type == TokenType.Colon) {
            this.eat()
            dataType = this.eat().value;
        }

        if (this.at().type == TokenType.Semicolon) {
            this.eat(); // expect semicolon
            if (isConstant) {
                throw "Must assign value to constant expression. No value provided.";
            }

            return {
                kind: "VarDeclaration",
                identifier,
                constant: false,
            } as VarDeclaration;
        }
        this.expect(
            TokenType.Equals,
            "Expected equals token following identifier in var declaration.",
        );

        if (dataType == "string") {
            this.expect(TokenType.Quote, "Expected quotation token after asignment of string data type.");
            let resultString = "";
            while (this.at().type !== TokenType.Quote) {
                resultString += this.eat().value + " ";
            }
            resultString = resultString + "\b";
            const result = {
                kind: "StringLiteral",
                value: String(resultString),
            } as StringLiteral;
            const declaration = {
                kind: "VarDeclaration",
                value: result,
                identifier,
                constant: isConstant,
            } as VarDeclaration;
            this.eat();
            this.expect(TokenType.Semicolon, "Variable declaration statment must end with semicolon.");
            return declaration;
        } else if (dataType == "int") {
            const result = {
                kind: "NumericLiteral",
                value: parseFloat(this.eat().value),
            } as NumericLiteral;
            const declaration = {
                kind: "VarDeclaration",
                value: result,
                identifier,
                constant: isConstant,
            } as VarDeclaration;
            this.expect(TokenType.Semicolon, "Variable declaration statment must end with semicolon.");
            return declaration;
        } else if (dataType == "bool") {
            let resultValue = false;
            if (this.at().value !== "true" && this.at().value !== "false") {
                throw "Boolean value must be true or false.";
            } else {
                if (this.eat().value == "true") {
                    resultValue = true;
                } else {
                    resultValue = false;
                }
            }
            const result = {
                kind: "BooleanLiteral",
                value: resultValue,
            } as BooleanLiteral;
            const declaration = {
                kind: "VarDeclaration",
                value: result,
                identifier,
                constant: isConstant,
            } as VarDeclaration;
            this.expect(TokenType.Semicolon, "Variable declaration statment must end with semicolon.");
            return declaration;
        }

        const declaration = {
            kind: "VarDeclaration",
            value: this.parse_expr(),
            identifier,
            constant: isConstant,
        } as VarDeclaration;

        this.expect(TokenType.Semicolon, "Variable declaration statment must end with semicolon.");

        return declaration;
    }

    // Handle expressions
    private parse_expr(): Expr {
        return this.parse_assignment_expr();
    }

    private parse_assignment_expr(): Expr {
        const left = this.parse_object_expr();

        if (this.at().type == TokenType.Equals) {
            this.eat(); // advance past equals
            const value = this.parse_assignment_expr();
            return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
        }

        return left;
    }

    private parse_object_expr(): Expr {
        // { Prop[] }
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parse_additive_expr();
        }

        this.eat(); // advance past open brace.
        const properties = new Array<Property>();

        while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
            const key =
                this.expect(TokenType.Identifier, "Object literal key exprected").value;

            // Allows shorthand key: pair -> { key, }
            if (this.at().type == TokenType.Comma) {
                this.eat(); // advance past comma
                properties.push({ key, kind: "Property" } as Property);
                continue;
            } // Allows shorthand key: pair -> { key }
            else if (this.at().type == TokenType.CloseBrace) {
                properties.push({ key, kind: "Property" });
                continue;
            }

            // { key: val }
            this.expect(
                TokenType.Colon,
                "Missing colon following identifier in ObjectExpr",
            );
            const value = this.parse_expr();

            properties.push({ kind: "Property", value, key });
            if (this.at().type != TokenType.CloseBrace) {
                this.expect(
                    TokenType.Comma,
                    "Expected comma or closing bracket following property",
                );
            }
        }

        this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
        return { kind: "ObjectLiteral", properties } as ObjectLiteral;
    }

    // Handle Addition & Subtraction Operations
    private parse_additive_expr(): Expr {
        let left = this.parse_multiplicitave_expr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.eat().value;
            const right = this.parse_multiplicitave_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    // Handle Multiplication, Division & Modulo Operations
    private parse_multiplicitave_expr(): Expr {
        let left = this.parse_call_member_expr();

        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.eat().value;
            const right = this.parse_call_member_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }

    // foo.x()()
    private parse_call_member_expr(): Expr {
        const member = this.parse_member_expr();

        if (this.at().type == TokenType.OpenParen) {
            return this.parse_call_expr(member);
        }

        return member;
    }

    private parse_call_expr(caller: Expr): Expr {
        let call_expr: Expr = {
            kind: "CallExpr",
            caller,
            args: this.parse_args(),
        } as CallExpr;

        if (this.at().type == TokenType.OpenParen) {
            call_expr = this.parse_call_expr(call_expr);
        }

        return call_expr;
    }

    private parse_args(): Expr[] {
        this.expect(TokenType.OpenParen, "Expected open parenthesis");
        const args = this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();
        this.expect(
            TokenType.CloseParen,
            "Missing closing parenthesis inside arguments list",
        );
        return args;
    }

    private parse_arguments_list(): Expr[] {
        const args = [this.parse_assignment_expr()];

        while (this.at().type == TokenType.Comma && this.eat()) {
            args.push(this.parse_assignment_expr());
        }

        return args;
    }

    private parse_member_expr(): Expr {
        let object = this.parse_primary_expr();

        while (
            this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket
        ) {
            const operator = this.eat();
            let property: Expr;
            let computed: boolean;

            // non-computed values aka obj.expr
            if (operator.type == TokenType.Dot) {
                computed = false;
                // get identifier
                property = this.parse_primary_expr();
                if (property.kind != "Identifier") {
                    throw `Cannot use dot operator without right hand side being of type identifier`;
                }
            } else { // this allows obj[computedValue]
                computed = true;
                property = this.parse_expr();
                this.expect(
                    TokenType.CloseBracket,
                    "Missing closing bracket in computed value.",
                );
            }

            object = {
                kind: "MemberExpr",
                object,
                property,
                computed,
            } as MemberExpr;
        }

        return object;
    }

    // Parse Literal Values & Grouping Expressions
    private parse_primary_expr(): Expr {
        const tk = this.at().type;

        // Determine which token we are currently at and return literal value
        switch (tk) {
            // User defined values.
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value } as Identifier;

            // Constants and Numeric Constants
            case TokenType.Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.eat().value),
                } as NumericLiteral;

            case TokenType.Quote: {
                this.eat()

                if (this.at().value !== "\"") {
                    const result = {
                        kind: "StringLiteral",
                        value: String(this.eat().value),
                    } as StringLiteral;
                    this.eat();
                    return result;
                } else {
                    const result = {
                        kind: "StringLiteral",
                        value: "",
                    } as StringLiteral;
                    this.eat();
                    return result;
                }
            }

            // Grouping Expressions
            case TokenType.OpenParen: {
                this.eat(); // eat the opening paren
                const value = this.parse_expr();
                this.expect(
                    TokenType.CloseParen,
                    "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",
                ); // closing paren
                return value;
            }

            // Unidentified Tokens and Invalid Code Reached
            default:
                console.error("Unexpected token found during parsing!", this.at());
                Deno.exit(1);
        }
    }
}