// @ts-check

export const config = {
    workingFolder: null
};

/**
 * @param {keyof config} key 
 * @param {string} value 
 */
export function setConfig(key, value)
{
    config[key] = value;
}

/**
 * @param {keyof config} key 
 * @returns {string} 
 */
export function getConfig(key)
{
    return config[key];
}
