import fs from "fs/promises";
import path from "path";

export function getTimestamp(): number
{
    return Math.floor(Date.now() / 1000);
}

export async function isFolderEmpty(path: string): Promise<boolean>
{
    try
    {
        const files: Array<string> = await fs.readdir(path);
        return (files.length === 0);
    }
    catch (error)
    {
        console.log(error);
        return false;
    }
}

export async function createFolder(path: string): Promise<void>
{
    return void fs.mkdir(path, {
        recursive: true
    });
}

export async function createTextFileUTF8(fullPath: string, content: string): Promise<void>
{
    const directory: string = path.dirname(fullPath);
    await createFolder(directory);
    return fs.writeFile(fullPath, content, {
        encoding: "utf-8"
    });
}
