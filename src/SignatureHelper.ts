import { DocumentFormattingEditProvider } from 'vscode';
import {versatile} from './VersatileFunction'

export function generateDefinitionString(functionName: string, params: versatile.FunctionParameter[]): string {
    let concatenatedParams: string[] = []
    params.forEach(param => concatenatedParams.push(formatParameter(param)))
    return functionName + "(" + concatenatedParams.join(", ") + ")"
}

export function formatParameter(param: versatile.FunctionParameter): string {
    let formattedParam = param.name
    if (param.type && param.type != "")
        formattedParam += ": " + param.type
    return formattedParam
}