import Spotify from "./Spotify.js";

const plugins = {
    Spotify
};

/**
 * @param {string} pluginName 
 * @returns {Promise<void>} 
 */
export async function callPlugin(pluginName)
{
    const pluginClass = plugins[pluginName];
    const pluginInstance = new pluginClass();
    await pluginInstance.execute();
}
