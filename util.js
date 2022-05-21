import fs from "fs/promises";
import path from "path";

/**
 * @param {string} path 
 * @returns {Promise<boolean>} 
 */
export async function isFolderEmpty(path)
{
    try
    {
        const files = await fs.readdir(path);
        return (files.length === 0);
    }
    catch (error)
    {
        console.log(error);
        return false;
    }
}

/**
 * @param {string} path
 * @returns {Promise<void>} 
 */
export async function createFolder(path)
{
    return fs.mkdir(path, {
        recursive: true
    });
}

/**
 * @param {string} fullPath 
 * @param {string} content 
 * @returns {Promise<void>}
 */
export async function createFileUTF8(fullPath, content)
{
    const directory = path.dirname(fullPath);
    await createFolder(directory);
    return fs.writeFile(fullPath, content, {
        encoding: "utf-8"
    });
}
