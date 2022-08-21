import { SpotifyLikedSongs } from "./SpotifyLikedSongs";

const plugins = {
    SpotifyLikedSongs: new SpotifyLikedSongs()
};

export function getPlugin(pluginName: keyof typeof plugins): typeof plugins[typeof pluginName]
{
    return plugins[pluginName];
}

export function getPlugins()
{
    return Object.values(plugins);
}

export async function executePlugin(pluginName: keyof typeof plugins): Promise<void>
{
    const plugin = getPlugin(pluginName);
    await plugin.execute();
}
