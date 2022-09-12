import os from "os";

import inquirer from "inquirer";
import inquirerSelectDirectory from "inquirer-select-directory";

import { setConfig } from "./config";
import { getPlugin, getPlugins } from "./plugins";
import { walkDir } from "./util";

inquirer.registerPrompt("directory", inquirerSelectDirectory);

async function promptDirectory(): Promise<string>
{
    const answer = await inquirer.prompt({
        type: "directory",
        message: "Choose a folder to work in",
        name: "absolute-path",
        basePath: os.homedir()
    } as any);
    return answer["absolute-path"];
}

async function selectPlugin()
{
    const plugins = getPlugins();
    const choices = [];
    
    for (const plugin of plugins)
    {
        choices.push({
            name: `${plugin.getStatus()} Plugin ${plugin.name} => ${plugin.description}`,
            value: plugin
        });
    }

    const answer = await inquirer.prompt([{
        choices,
        type: "list",
        message: "Select a plugin",
        name: "plugin"
    }]);
    return answer["plugin"];
}

async function main()
{
    let i = 0;
    for await (const p of walkDir('/path/to/folder'))
    {
        i++
        console.log(p);
    }
    console.log(i)
    return

    const plugin = await selectPlugin();
    console.log(plugin);
    return;

    const workingDirectory: string = await promptDirectory();

    setConfig("workingDirectory", workingDirectory);

    console.log(`Now working inside ${workingDirectory}`);
}

main();

