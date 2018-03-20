import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

import { FileStat } from "../enum";
import configMgr from "../helper/configMgr";
import { isMultiRoots } from "../helper/util";
import { Item } from "../model";
import { Resource } from "./resource";

export class DataProvider implements vscode.TreeDataProvider<Resource> {
    public onDidChangeTreeDataEmmiter = new vscode.EventEmitter<Resource | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<Resource | undefined> = this.onDidChangeTreeDataEmmiter.event;
    public returnEmpty: boolean = false;

    public refresh(): void {
        this.onDidChangeTreeDataEmmiter.fire();
    }
    public getTreeItem(element: Resource): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: Resource): Thenable<Resource[]> {
        return this.getSortedFavoriteResources().then((resources) => {
            if (this.returnEmpty) {
                return [];
            }

            if (!resources || !resources.length) {
                return [];
            }

            if (!element) {
                return Promise.all(resources.map((r) => this.getResourceStat(r)))
                    .then((data: Item[]) => {
                        return data.filter((i) => i.stat !== FileStat.NEITHER);
                    })
                    .then((data: Item[]) => this.data2Resource(data, "resource"));
            }

            return this.getChildrenResources(element.value);
        });
    }

    private getChildrenResources(filePath: string): Thenable<Resource[]> {
        const sort = vscode.workspace.getConfiguration("favorites").get("sortDirection") as string;

        return new Promise<Resource[]>((resolve, reject) => {
            fs.readdir(pathResolve(filePath), (err, files) => {
                if (err) {
                    return resolve([]);
                }

                this.sortResources(files.map((f) => path.join(filePath, f)), sort)
                    .then((data) => this.data2Resource(data, "resourceChild"))
                    .then(resolve);
            });
        });
    }

    private getSortedFavoriteResources(): Thenable<string[]> {
        const resources = configMgr.get("resources");
        const sort = vscode.workspace.getConfiguration("favorites").get("sortDirection") as string;

        return this.sortResources(resources, sort).then((res) => res.map((r) => r.filePath));
    }

    private sortResources(resources: string[], sort: string): Thenable<Item[]> {
        return Promise.all(resources.map((r) => this.getResourceStat(r))).then((resourceStats) => {
            const isAsc = sort === "ASC";

            const dirs = resourceStats.filter((i) => i.stat === FileStat.DIRECTORY);
            const files = resourceStats.filter((i) => i.stat === FileStat.FILE);

            const dirsAZ = dirs.sort((a, b) => {
                const aBasename = path.basename(a.filePath).toLocaleLowerCase();
                const bBasename = path.basename(b.filePath).toLocaleLowerCase();
                if (aBasename < bBasename) { return -1; }
                if (aBasename === bBasename) { return 0; }
                if (aBasename > bBasename) { return 1; }
            });

            const filesAZ = files.sort((a, b) => {
                const aBasename = path.basename(a.filePath).toLocaleLowerCase();
                const bBasename = path.basename(b.filePath).toLocaleLowerCase();
                if (aBasename < bBasename) { return -1; }
                if (aBasename === bBasename) { return 0; }
                if (aBasename > bBasename) { return 1; }

            });

            if (isAsc) {
                return dirsAZ.concat(filesAZ);
            } else {
                return dirsAZ.reverse().concat(filesAZ.reverse());
            }

        });
    }

    private getResourceStat(filePath: string): Thenable<Item> {
        return new Promise((resolve) => {
            fs.stat(pathResolve(filePath), (err, stat: fs.Stats) => {
                if (err) {
                    return resolve({
                        filePath,
                        stat: FileStat.NEITHER,
                    });
                }
                if (stat.isDirectory()) {
                    return resolve({
                        filePath,
                        stat: FileStat.DIRECTORY,
                    });
                }
                if (stat.isFile()) {
                    return resolve({
                        filePath,
                        stat: FileStat.FILE,
                    });
                }
                return resolve({
                    filePath,
                    stat: FileStat.NEITHER,
                });
            });
        });
    }

    private data2Resource(data: Item[], contextValue: string): Resource[] {
        const enablePreview = vscode.workspace.getConfiguration("workbench.editor").get("enablePreview") as boolean;

        return data.map((i) => {
            let uri = vscode.Uri.parse(`file://${pathResolve(i.filePath)}`);
            if (os.platform().startsWith("win")) {
                uri = vscode.Uri.parse(`file:///${pathResolve(i.filePath)}`.replace(/\\/g, "/"));
            }
            if (i.stat === FileStat.DIRECTORY) {
                return new Resource(
                    path.basename(i.filePath),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    i.filePath,
                    contextValue,
                );
            }

            return new Resource(
                path.basename(i.filePath),
                vscode.TreeItemCollapsibleState.None,
                i.filePath,
                contextValue,
                {
                    command: "vscode.open",
                    title: "",
                    arguments: [uri, { preview: enablePreview }],
                },
            );
        });
    }
}

function pathResolve(filePath: string) {
    if (isMultiRoots()) {
        return filePath;
    }
    return path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, filePath);
}
