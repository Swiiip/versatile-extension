import * as path from 'path';
// VS Code extensibility API
import * as vscode from 'vscode';
import * as fs from 'fs' // file system

export function activate(context: vscode.ExtensionContext) {

    // The most simple completion item provider which
    // * registers for text files (`'plaintext'`), and
    // * only return the 'Hello World' completion
    console.log("Versatile language support loaded")
    fs.readFile(path.join(__dirname, "../../resources/completions.json"), "utf8", (err, data) => {
        // Retrieve function descriptions
        let functions: Object[] = JSON.parse(data).functions;

        // Create a CompletionList from the descriptions
        let functionCompletionList: vscode.CompletionList = buildFunctionCompletionItems(functions);

        // Register the function completion item provider
        vscode.languages.registerCompletionItemProvider('versatile', {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return functionCompletionList;
            }
        });

        // Register the function signature help provider
        vscode.languages.registerSignatureHelpProvider('versatile', {
            provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position) {
                let start = position.translate(0, -1)
                let end = position
                let text = document.getText(new vscode.Range(start, end));
                while (!text.match(/(\w)\s?\([\w\s,]*/g)) {
                    start = start.translate(0, -1)
                    text = document.getText(new vscode.Range(start, end));
                }
                let commaMatch = text.match(/,/g)
                let activeParam = commaMatch ? commaMatch.length : 0
                let functionName = document.getText(document.getWordRangeAtPosition(start))
                let f = functions[functionName]
                if (f) {
                    let signatureHelp = new vscode.SignatureHelp()
                    let signatureDef = generateDefinitionString(functionName, f.parameters)
                    let signatureInfo = new vscode.SignatureInformation(signatureDef, f.doc)
                    for (let index in f.parameters) {
                        let idx = Number(index)
                        let param = f.parameters[idx]
                        let signatureParam: string = ""
                        signatureParam += param.name
                        if (param.type)
                            signatureParam += ": " + param.type
                        signatureInfo.parameters.push(new vscode.ParameterInformation(signatureParam, param.description))
                    }
                    signatureHelp.signatures.push(signatureInfo)
                    signatureHelp.activeParameter = activeParam
                    signatureHelp.activeSignature = 0
                    return signatureHelp;
                } else {
                    return null;
                }
            }
        }, ",", "(");
    })
}

function buildFunctionCompletionItems(functions: Object): vscode.CompletionList {
    let completionList: vscode.CompletionList = new vscode.CompletionList()
    for (let name of Object.keys(functions)) {
        let f = functions[name]
        let item: vscode.CompletionItem = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function)
        item.insertText = f.pattern

        item.detail = generateDefinitionString(name, f.parameters)
            item.documentation = f.doc
        completionList.items.push(item)
    }
    return completionList;
}

function generateDefinitionString(functionName: string, params: any[]) {
    let concatenatedParams: string[] = []
    for (let param of params) {
        let p = param.name
        if (param.type && param.type !== "")
            p += ": " + param.type
        concatenatedParams.push(p)
    }
    return functionName + "(" + concatenatedParams.join(", ") + ")"
}