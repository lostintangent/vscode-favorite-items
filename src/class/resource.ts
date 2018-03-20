import * as vscode from "vscode";

export class Resource extends vscode.TreeItem {
    public resourceUri: vscode.Uri;

    constructor(
        public label: string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public value: string,
        public contextValue: string,
        public command?: vscode.Command,
    ) {
        super(label, collapsibleState);

        this.resourceUri = vscode.Uri.file(value);
        this.tooltip = value;
    }
}
