// @ts-check

import inquirer from "inquirer";
import inquirerSelectDirectory from "inquirer-select-directory";

import { callPlugin } from "./plugins/index.js";
import { setConfig } from "./config.js";
import { isFolderEmpty } from "./util.js";

inquirer.registerPrompt("directory", inquirerSelectDirectory);

async function promptPlugin()
{
    const answer = await inquirer.prompt([{
        choices: [ "Exit", "Spotify" ],
        type: "list",
        message: "Select a plugin, or exit",
        name: "plugin-name"
    }]);
    return answer["plugin-name"];
}

/**
 * @returns {Promise<"Save" | "Check">}
 */
async function promptMode()
{
    const answer = await inquirer.prompt([{
        choices: [ "Save", "Check" ],
        type: "list",
        message: "Choose if you want to create a save, or check the completeness of an existing one",
        name: "mode-name"
    }]);
    return answer["mode-name"];
}

/**
 * @returns {Promise<void>}
 */
async function startPluginsLoop()
{
    while (true)
    {
        const pluginName = await promptPlugin();
        if (pluginName === "Exit") break;

        await callPlugin(pluginName);
    }
}

/**
 * @returns {Promise<string>}
 */
async function promptWorkingFolder()
{
    const answer = await inquirer.prompt({
        type: "directory",
        message: "Choose a folder to work in",
        name: "absolute-path",
        basePath: "."
    });
    return answer["absolute-path"];
}

async function main()
{
    const mode = await promptMode();
    const workingFolder = await promptWorkingFolder();
    const isEmpty = await isFolderEmpty(workingFolder);

    setConfig("workingFolder", workingFolder);

    if (mode === "Save")
    {
        if (!isEmpty)
        {
            console.log("The folder must be empty");
            return;
        }
        await startPluginsLoop();
    }
    else if (mode === "Check")
    {
        console.log("Checking this folder...");
    }
}

main();
