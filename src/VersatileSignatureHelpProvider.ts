import * as vs from 'vscode'
import { versatile } from './VersatileFunction'
import { generateDefinitionString, formatParameter } from './FormatHelper'


/**
 * Provide signature help for versatile functions
 */
export class VersatileSignatureHelpProvider implements vs.SignatureHelpProvider {
    constructor(private functionDict: { [name: string]: versatile.Function }) { }

    public provideSignatureHelp(document: vs.TextDocument, position: vs.Position): vs.SignatureHelp {
        let nameAndActiveParam = this.getCurrentFunctionNameAndActiveParam(document, position)
        let functionName = nameAndActiveParam.name
        let activeParam = nameAndActiveParam.activeParam

        // if we are out of the main function
        if (functionName === undefined && activeParam === undefined)
            return undefined

        let currentFunction = this.functionDict[functionName]

        // if we have an entry for the function
        if (currentFunction) {
            let signatureHelp = new vs.SignatureHelp()
            let signatureInfo = this.buildSignatureInfo(functionName, currentFunction)
            signatureHelp.signatures.push(signatureInfo)
            signatureHelp.activeParameter = activeParam
            signatureHelp.activeSignature = 0
            return signatureHelp;
        } else {
            return undefined
        }
    }

    /**
     * Get the name of the function for which we are providing definition helper,
     * along with the current active parameter
     */
    private getCurrentFunctionNameAndActiveParam(document: vs.TextDocument, position: vs.Position): { name: string, activeParam: number } {
        let definition = /\w+\s?\((?![\w\s,]*\))/g
        let lineBreak = /^\s*\)/g
        let start = position.translate(0, -1)
        let end = position

        let currentText = document.getText(new vs.Range(start, end))

        while (!currentText.match(definition)) {
            if (document.lineAt(start.line).text.match(lineBreak))
                return {
                    name: undefined,
                    activeParam: undefined
                }
            start = this.getPositionMovedBackward(document, start)
            currentText = document.getText(new vs.Range(start, end))
        }
        let activeParam = this.getActiveParam(document, start, end)
        return {
            name: document.getText(document.getWordRangeAtPosition(start)),
            activeParam: activeParam
        }
    }

    /**
     * Build a SignatureInfo to allow parameter hints and highlighting
     */
    private buildSignatureInfo(functionName: string, currentFunction: versatile.Function): vs.SignatureInformation {
        let signatureDef = generateDefinitionString(functionName, currentFunction.params)
        let signatureInfo = new vs.SignatureInformation(signatureDef, currentFunction.doc)
        for (let param of currentFunction.params) {
            let signatureParam = formatParameter(param)
            signatureInfo.parameters.push(new vs.ParameterInformation(signatureParam, param.description))
        }
        return signatureInfo
    }

    /**
     * Get the position one step back, following line breaks
     */
    private getPositionMovedBackward(document: vs.TextDocument, position: vs.Position): vs.Position {
        let charPos = position.character
        if (charPos > 1) {
            return position.translate(0, -1)
        } else {
            return position.with(position.line - 1, document.lineAt(position.line - 1).lineNumber)
        }
    }

    private getActiveParam(document: vs.TextDocument, start: vs.Position, end: vs.Position): number {
        let openParenthesis = 0
        let currentChar = this.getCharBeforePosition(document, end)
        let activeParam = 0
        let pos = end
        while (pos.compareTo(start) > 0) {
            if (currentChar == ")")
                openParenthesis++
            if (currentChar == "(")
                openParenthesis--
            if (currentChar == "," && openParenthesis == 0)
                activeParam++
            pos = this.getPositionMovedBackward(document, pos)
            currentChar = this.getCharBeforePosition(document, pos)
        }
        return activeParam
    }

    /**
     * Get the character before the current position
     * ex: He|llo -> returns e
     *       ^
     *    position
     */
    private getCharBeforePosition(document: vs.TextDocument, cursorPos: vs.Position): string {
        let currentLine = document.lineAt(cursorPos.line)
        return document.getText(currentLine.range).charAt(cursorPos.translate(0, -1).character)
    }
}