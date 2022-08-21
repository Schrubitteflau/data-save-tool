import path from "path";

import { getConfig } from "../config";
import { createTextFileUTF8, getTimestamp } from "../util";

export default abstract class BasePlugin
{
    protected abstract readonly _name: string;
    protected abstract readonly _description: string;
    protected abstract readonly _directory: string;

    private get _pluginFolder(): string
    {
        return path.join(getConfig("workingDirectory"), this._name);
    }

    protected _log(message: string): void
    {
        console.log(`[${this._name}] : ${message}`);
    }

    protected async _writeFileUTF8(fileName: string, content: string): Promise<void>
    {
        const realFileName = `${getTimestamp()}_${fileName}`;
        const fullPath = path.join(this._pluginFolder, realFileName);
        await createTextFileUTF8(fullPath, content);
    }

    public get name(): string
    {
        return this._name;
    }

    public get description(): string
    {
        return this._description;
    }

    public abstract getStatus(): boolean;
    public abstract execute(): Promise<void>;
}
