import inquirer from "inquirer";

import { callPlugin } from "./plugins/index.js";

async function main()
{
    const answer = await inquirer.prompt([{
        choices: [ "spotify" ],
        type: "list",
        message: "Select a plugin",
        name: "plugin-name"
    }]);

    callPlugin(answer["plugin-name"]);
}

main();
