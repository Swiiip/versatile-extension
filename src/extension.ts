// VS Code extensibility API
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    // The most simple completion item provider which 
    // * registers for text files (`'plaintext'`), and
    // * only return the 'Hello World' completion
    console.log("Versatile language support loaded")
    vscode.languages.registerCompletionItemProvider('versatile', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            let item: vscode.CompletionItem = new vscode.CompletionItem('select', vscode.CompletionItemKind.Function);
            let item2: vscode.CompletionItem = new vscode.CompletionItem('?equal', vscode.CompletionItemKind.Function);
            let item3: vscode.CompletionItem = new vscode.CompletionItem('if', vscode.CompletionItemKind.Function);
            let item4: vscode.CompletionItem = new vscode.CompletionItem('ifelseif', vscode.CompletionItemKind.Function);
            let item5: vscode.CompletionItem = new vscode.CompletionItem('proposal', vscode.CompletionItemKind.Field);
            let item6: vscode.CompletionItem = new vscode.CompletionItem('slot', vscode.CompletionItemKind.Field);
            return [
                item, item2, item3, item4, item5, item6
            ];
        }
    });
}