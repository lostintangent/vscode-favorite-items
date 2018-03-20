import * as nconf from "nconf";
import * as path from "path";
import * as vscode from "vscode";

import { getSingleRootPath, isMultiRoots } from "./util";

class ConfigMgr {
    public eventEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

    public get(key): string[] {
        const config = vscode.workspace.getConfiguration("favorites");
        const useSeparate = config.get("saveSeparated") as boolean;

        if (isMultiRoots() || !useSeparate) {
            return config.get(key) as string[];
        }

        nconf.file({ file: path.resolve(getSingleRootPath(), ".vscfavoriterc") });

        return nconf.get(key) || [];
    }

    public save(key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration("favorites");
        const useSeparate = config.get("saveSeparated") as boolean;

        if (isMultiRoots() || !useSeparate) {
            config.update(key, value, false);
            return Promise.resolve();
        }

        nconf.file({ file: path.resolve(getSingleRootPath(), ".vscfavoriterc") });

        nconf.set(key, value);

        return new Promise<void>((resolve, reject) => {
            nconf.save((err) => {
                if (err) {
                    return reject(err);
                }
                this.eventEmitter.fire();
                resolve();
            });
        });
    }

    get onConfigChange(): vscode.Event<void> {
        return this.eventEmitter.event;
    }
}

export default new ConfigMgr();
