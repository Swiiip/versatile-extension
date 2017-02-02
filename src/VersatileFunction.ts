export namespace versatile {

    export class Function {
        constructor(public pattern: string, public params: FunctionParameter[], public doc: string) {}
    }

    export class FunctionParameter {
        constructor(public name: string, public type: string, public description: string) {}
    }
}