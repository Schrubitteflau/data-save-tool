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

async function main()
{
    const answer = await inquirer.prompt({
        type: "directory",
        message: "Choose a folder to work in",
        name: "absolute-path",
        basePath: "."
    });
    const path = answer["absolute-path"];
    const isEmpty = await isFolderEmpty(path);

    /*if (!isEmpty)
    {
        console.log("The folder must be empty");
        return;
    }*/

    setConfig("workingFolder", path);

    await startPluginsLoop();
}

main();
