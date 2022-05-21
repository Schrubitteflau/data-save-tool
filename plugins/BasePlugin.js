// @ts-check

import path from "path";

import { getConfig } from "../config.js";
import { createFileUTF8 } from "../util.js";

export default class BasePlugin
{
    /**
     * @param {string} name 
     */
    constructor(name)
    {
        this.name = name;
    }

    /**
     * @returns {string}
     */
    get _pluginFolder()
    {
        return path.join(getConfig("workingFolder"), this.name);
    }

    /**
     * @returns {number}
     */
    get _timestamp()
    {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * @param {string} message 
     */
    _log(message)
    {
        console.log(`[${this.name}] : ${message}`);
    }

    /**
     * @param {string} fileName 
     * @param {string} content 
     * @returns {Promise<void>}
     */
    async _writeFileUTF8(fileName, content)
    {
        const realFileName = `${this._timestamp}_${fileName}`;
        const fullPath = path.join(this._pluginFolder, realFileName);
        await createFileUTF8(fullPath, content);
    }

    /**
     * @abstract
     */
    execute()
    {
        throw new Error("Not implemented");
    }
}
