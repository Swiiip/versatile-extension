import * as vs from 'vscode'
import { versatile } from './VersatileFunction'
import { generateDefinitionString, formatParameter } from './SignatureHelper'

/**
 * Provide signature help for versaile functions
 */
export class VersatileSignatureHelpProvider implements vs.SignatureHelpProvider{
    constructor(private functionDict: { [name: string]: versatile.Function }) { }

    public provideSignatureHelp(document: vs.TextDocument, position: vs.Position): vs.SignatureHelp {
        let nameAndActiveParam = this.getCurrentFunctionNameAndActiveParam(document, position)
        let functionName = nameAndActiveParam.name
        let activeParam = nameAndActiveParam.activeParam

        let currentFunction = this.functionDict[functionName]

        if (currentFunction) {

            let signatureDef = generateDefinitionString(functionName, currentFunction.params)
            let signatureInfo = new vs.SignatureInformation(signatureDef, currentFunction.doc)
            for (let param of currentFunction.params) {
                let signatureParam = formatParameter(param)
                signatureInfo.parameters.push(new vs.ParameterInformation(signatureParam, param.description))
            }

            let signatureHelp = new vs.SignatureHelp()
            signatureHelp.signatures.push(signatureInfo)
            signatureHelp.activeParameter = activeParam
            signatureHelp.activeSignature = 0
            return signatureHelp;
        } else {
            return null
        }
    }

    private getCurrentFunctionNameAndActiveParam(document: vs.TextDocument, position: vs.Position): { name: string, activeParam: number } {
        let openedParenthesisCounter = 0
        let activeParameter = 0
        let currentPosition = position
        let currentChar = this.getCharBeforePosition(document, currentPosition)
        while (currentChar !== "(" || openedParenthesisCounter != 0) {
            if (currentChar === "(")
                openedParenthesisCounter++
            if (currentChar === ")")
                openedParenthesisCounter--
            if (currentChar === "," && openedParenthesisCounter == 0)
                activeParameter++

            // shift cursor to the left
            currentPosition = currentPosition.translate(0, -1)

            // get char before currentPosition
            currentChar = this.getCharBeforePosition(document, currentPosition)
        }

        currentPosition = currentPosition.translate(0, -1)
        if (this.getCharBeforePosition(document, currentPosition) == " ")
            currentPosition = currentPosition.translate(0, -1)

        return {
            name: document.getText(document.getWordRangeAtPosition(currentPosition)),
            activeParam: activeParameter
        }
    }

    private getCharBeforePosition(document: vs.TextDocument, cursorPos: vs.Position): string {
        let currentLine = document.lineAt(cursorPos.line)
        return document.getText(currentLine.range).charAt(cursorPos.translate(0, -1).character)
    }
}