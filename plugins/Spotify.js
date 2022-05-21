// @ts-check

import express from "express";
import axios from "axios";

import BasePlugin from "./BasePlugin.js";

const CALLBACK_PORT = parseInt(process.env.SPOTIFY_CALLBACK_PORT, 10);
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const REDIRECT_ENDPOINT = "/spotify_callback";
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}${REDIRECT_ENDPOINT}`;
const SCOPE = "user-library-read";

const app = express();

function generateRandomString()
{
    const length = 16;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++)
    {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
};

function generateAuthorizeURL(state)
{
    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: SCOPE,
        redirect_uri: REDIRECT_URI,
        state
    });
    return `https://accounts.spotify.com/authorize?${params}`;
}

function waitForCallback()
{
    return new Promise((resolve, reject) =>
    {
        let httpServer;
        app.get(REDIRECT_ENDPOINT, (req, res) =>
        {
            resolve({
                code: req.query.code || null,
                state: req.query.state || null
            });

            res.end("<script>window.close()</script>");
            httpServer.close();
        })
        httpServer = app.listen(CALLBACK_PORT);
    });
}

async function getAccessToken(code)
{
    const url = "https://accounts.spotify.com/api/token";
    const authorization = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const body = new URLSearchParams({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code"
    });
    const response = await axios.post(url, body, {
        headers: {
            Authorization: `Basic ${authorization}`
        }
    });
    return response.data.access_token;
}

// https://developer.spotify.com/documentation/web-api/reference/#/operations/get-users-saved-tracks
async function getUsersSavedTracks(accessToken)
{
    const MAX_LIMIT = 50;
    let tracks = [];
    let url = `https://api.spotify.com/v1/me/tracks?limit=${MAX_LIMIT}`;

    while (url !== null)
    {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const { next, items } = response.data;

        // Keep only useful fields
        const formattedTracks = items.map((item) => {
            delete item.track.available_markets;
            delete item.track.album.available_markets;
            delete item.track.album.images;
            return item;
        });
        tracks = [...tracks, ...formattedTracks];
        url = next;
    }

    return tracks;
}

export default class Spotify extends BasePlugin
{
    constructor()
    {
        super("Spotify");
    }

    async execute()
    {
        const state = generateRandomString();
        const authorizeURL = generateAuthorizeURL(state);
        this._log(authorizeURL);
        const callbackResult = await waitForCallback();
        if (callbackResult.state === null || callbackResult.state !== state)
        {
            return this._log("Error : state_mismatch");
        }
        try
        {
            const accessToken = await getAccessToken(callbackResult.code);
            const tracks = await getUsersSavedTracks(accessToken);
            await this._writeFileUTF8("tracks.json", JSON.stringify(tracks));
            this._log(`${tracks.length} tracks saved`);
        }
        catch (error)
        {
            this._log(error);
        }
    }
}
