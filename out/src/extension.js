"use strict";
// VS Code extensibility API
var vscode = require("vscode");
function activate(context) {
    // The most simple completion item provider which 
    // * registers for text files (`'plaintext'`), and
    // * only return the 'Hello World' completion
    console.log("Versatile language support loaded");
    vscode.languages.registerCompletionItemProvider('versatile', {
        provideCompletionItems: function (document, position) {
            var item = new vscode.CompletionItem('select', vscode.CompletionItemKind.Function);
            var item2 = new vscode.CompletionItem('?equal', vscode.CompletionItemKind.Function);
            var item3 = new vscode.CompletionItem('if', vscode.CompletionItemKind.Function);
            var item4 = new vscode.CompletionItem('ifelseif', vscode.CompletionItemKind.Function);
            var item5 = new vscode.CompletionItem('proposal', vscode.CompletionItemKind.Field);
            var item6 = new vscode.CompletionItem('slot', vscode.CompletionItemKind.Field);
            return [
                item, item2, item3, item4, item5, item6
            ];
        }
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map