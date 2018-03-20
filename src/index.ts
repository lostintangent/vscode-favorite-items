// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { DataProvider } from "./class/dataProvider";
import { addToFavorites, collapse, deleteFavorite, setSortAsc, setSortDesc } from "./command/index.";
import configMgr from "./helper/configMgr";

declare var global: any;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const config = vscode.workspace.getConfiguration("favorites");
    const configSort = config.get("sortDirection") as string;

    const sort = (configSort === "DESC" || configSort === "ASC") ? configSort : "ASC";

    vscode.commands.executeCommand("setContext", "sort", sort);
    config.update("sortDirection", sort, false);

    global.vscode = vscode;
    global.commands = [];

    vscode.commands.getCommands(false)
        .then((l) => global.commands = l);

    configMgr.onConfigChange(() => {
        provider.refresh();
    });

    const provider = new DataProvider();

    vscode.window.registerTreeDataProvider("favorites", provider);

    vscode.workspace.onDidChangeConfiguration(() => {
        provider.refresh();
    }, this, context.subscriptions,
    );

    context.subscriptions.push(addToFavorites(provider));
    context.subscriptions.push(deleteFavorite(provider));
    context.subscriptions.push(setSortAsc(provider));
    context.subscriptions.push(setSortDesc(provider));
    context.subscriptions.push(collapse(provider));
}

// this method is called when your extension is deactivated
export function deactivate() {
    //
}
