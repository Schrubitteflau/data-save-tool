import spotify from "./spotify.js";

const plugins = {
    spotify
};

export function callPlugin(pluginName)
{
    const plugin = plugins[pluginName];
    console.log(plugin);
}
