// VS Code extensibility API
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    // The most simple completion item provider which 
    // * registers for text files (`'plaintext'`), and
    // * only return the 'Hello World' completion
    console.log("Versatile language support loaded")
    vscode.languages.registerCompletionItemProvider('versatile', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            let item: vscode.CompletionItem = new vscode.CompletionItem('if', vscode.CompletionItemKind.Function)
            let range: vscode.Range = document.getWordRangeAtPosition(position)
            item.detail = "Details on the select method"
            item.textEdit = vscode.TextEdit.replace(range, 'if ({{element}}, {{ifExists}}, {{ifNot}})')
            return [
                item
            ];
        }
    });
}