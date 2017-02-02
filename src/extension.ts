import * as path from 'path';
// VS Code extensibility API
import * as vscode from 'vscode';
import { VersatileSignatureHelpProvider } from './VersatileSignatureHelpProvider'
import { versatile } from './VersatileFunction'
import { Parser } from './Parser'
import {generateDefinitionString, formatParameter} from './FormatHelper'
import * as fs from 'fs' // file system

export function activate(context: vscode.ExtensionContext) {

    // The most simple completion item provider which
    // * registers for text files (`'plaintext'`), and
    // * only return the 'Hello World' completion
    console.log("Versatile language support loaded")
    fs.readFile(path.join(__dirname, "../../resources/completions.json"), "utf8", (err, data) => {
        // Retrieve function descriptions
        let functionDict: { [name: string]: versatile.Function } = new Parser().getFunctionDictionnary(data);

        // Create a CompletionList from the descriptions
        let functionCompletionList: vscode.CompletionList = buildFunctionCompletionItems(functionDict);

        // Register the function completion item provider
        vscode.languages.registerCompletionItemProvider('versatile', {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return functionCompletionList;
            }
        });

        let versatileSignatureHelpProvider = new VersatileSignatureHelpProvider(functionDict)

        // Register the function signature help provider
        vscode.languages.registerSignatureHelpProvider('versatile', versatileSignatureHelpProvider, ",", "(");
    })
}

function buildFunctionCompletionItems(functionDict: { [name: string]: versatile.Function }): vscode.CompletionList {
    let completionList: vscode.CompletionList = new vscode.CompletionList()
    for (let name of Object.keys(functionDict)) {
        let f = functionDict[name]
        let item: vscode.CompletionItem = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function)
        item.insertText = f.pattern

        item.detail = generateDefinitionString(name, f.params)
        item.documentation = f.doc
        completionList.items.push(item)
    }
    return completionList;
}