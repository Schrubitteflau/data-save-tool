// @ts-check

interface Config {
    workingDirectory: string;
}

const config: Config = {
    workingDirectory: ""
};

export function setConfig(key: keyof Config, value: Config[typeof key]): void
{
    config[key] = value;
}

export function getConfig(key: keyof Config): Config[typeof key]
{
    return config[key];
}
