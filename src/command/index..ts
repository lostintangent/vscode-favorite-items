import * as vscode from "vscode";
import { DataProvider } from "../class/dataProvider";
import { Resource } from "../class/resource";
import configMgr from "../helper/configMgr";
import { getSingleRootPath, isMultiRoots } from "../helper/util";

export function addToFavorites(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.addToFavorites", (fileUri?: vscode.Uri) => {
        if (!fileUri) {
            return vscode.window.showWarningMessage("You have to call this extension from explorer");
        }

        const fileName = fileUri.fsPath;

        const previousResources = configMgr.get("resources");
        const newResource = isMultiRoots() ? fileName : fileName.substr(getSingleRootPath().length + 1);

        if (previousResources.some((r) => r === newResource)) {
            return;
        }

        configMgr.save("resources", previousResources.concat([newResource])).catch(console.warn);
        dataProvider.refresh();
    });
}
export function collapse(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.collapse", (value: Resource) => {

        dataProvider.returnEmpty = true;
        dataProvider.refresh();

        setTimeout(() => {
            dataProvider.returnEmpty = false;
            dataProvider.refresh();

        }, 400);

    });
}
export function deleteFavorite(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.deleteFavorite", (value: Resource) => {
        const previousResources = configMgr.get("resources");

        configMgr.save("resources", previousResources.filter((r) => r !== value.value)).catch(console.warn);
        dataProvider.refresh();
    });
}
export function setSortAsc(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.nav.sort.az", (value: Resource) => {
        const config = vscode.workspace.getConfiguration("favorites");

        vscode.commands.executeCommand("setContext", "sort", "ASC");
        return config.update("sortDirection", "ASC", false);

    });
}
export function setSortDesc(dataProvider: DataProvider) {
    return vscode.commands.registerCommand("favorites.nav.sort.za", (value: Resource) => {
        const config = vscode.workspace.getConfiguration("favorites");

        vscode.commands.executeCommand("setContext", "sort", "DESC");
        config.update("sortDirection", "DESC", false);

    });
}
