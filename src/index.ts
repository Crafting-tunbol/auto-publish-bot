import { ActivityType, ChannelType, Client, ClientUser, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ] });

require('dotenv').config();

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    setStatus(client.user!);

    setInterval(() => {
        setStatus(client.user!);
    }, 1000 * 60);
});

client.on('messageCreate', async message => {
    if (!message.crosspostable) return;

    if (!message.guild) return;
    const channelId = message.channelId;

    const category = message.guild.channels.cache.find(category => category.type == ChannelType.GuildCategory && category.children.cache.find(channel => channel.id == channelId));
    if (!category) return;

    if (category.id != process.env.CATEGORY_ID) return;

    message.crosspost();
});

function setStatus(user: ClientUser) {
    user.setActivity({
        name: 'status',
        type: ActivityType.Watching
    });
};

client.login(process.env.TOKEN);