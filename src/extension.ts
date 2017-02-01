import * as path from 'path';
// VS Code extensibility API
import * as vscode from 'vscode';
import * as fs from 'fs' // file system

export function activate(context: vscode.ExtensionContext) {

    // The most simple completion item provider which
    // * registers for text files (`'plaintext'`), and
    // * only return the 'Hello World' completion
    console.log("Versatile language support loaded")
    fs.readFile(path.join(__dirname, "../../resources/functions.json"), "utf8", (err, data) => {
        let items: vscode.CompletionItem[] = [];
        let functions: any = JSON.parse(data).functions;
        for (let f of functions) {
            let item: vscode.CompletionItem = new vscode.CompletionItem(f.name, vscode.CompletionItemKind.Function)
            item.insertText = f.pattern
            item.detail = f.detail
            item.documentation = f.doc
            items.push(item);
        }
        vscode.languages.registerCompletionItemProvider('versatile', {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                return items;
            }
        });
    })
}