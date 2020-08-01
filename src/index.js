const Discord = require('discord.js');
const ping = require('minecraft-server-util');
const axios = require('axios');

require('dotenv').config();

const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

// Set update interval time to 10 minute in production and 30 seconds for development
const interval = process.env.NODE_ENV === "production" ? 10 * 60 * 1000 : 30 * 1000;
let onlinePlayers = [];

client.once('ready', () => {
    console.log('Beep boop! I am ready!');
    // Check every minute to see if anyone is online
    update();
    setInterval(() => {
        update();
    }, interval);
});

async function getServerData() {
    return await ping(process.env.MINECRAFT_SERVER, 25565);
}

async function update() {
    const serverData = await getServerData();

    console.log('updating');

    // If no players are online, and no players were online on last check,
    //  then there is nothing to do
    if(serverData.onlinePlayers === 0 && onlinePlayers.length === 0) return;

    // Get an array of all players that are currently on the server
    let players = [];
    if (serverData.samplePlayers != null) {
        serverData.samplePlayers.forEach(player => {
            players.push(player.name);
        });
    }

    // If nobody has joined or left the server, dop nothing
    if (players === onlinePlayers) return;

    // If a player is online, but is not in the onlinePlayers, then
    //  that player has just joined
    players.forEach(player => {
        if(!onlinePlayers.includes(player)) addPlayer(player);
    });
}

// Handles adding a player to onlinePlayers array and sending player joined message
//  to discord server
function addPlayer(player) {
    onlinePlayers.push(player);;
    sendMessage(`${player} has hopped on the minecraft server`);
}

// Sends a message to channel specified in process.env.DISCORD_CHANNEL_NAME
async function sendMessage(message) {
    await client.channels.fetch('739174083228598343').then((channel) => {
        channel.send(message);
        console.log(`Sent message: "${message}"`)
    });
}

//