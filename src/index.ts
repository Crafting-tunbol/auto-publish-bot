import { ActivityType, ChannelType, Client, ClientUser, EmbedBuilder, GatewayIntentBits, TextBasedChannel } from 'discord.js';
import 'dotenv/config';
import md5 from 'md5';
import { AccesLog, Cloudflare } from './cloudflare';

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ] });
const cloudflare = new Cloudflare(process.env.CLOUDFLARE_TOKEN!, process.env.CLOUDFLARE_ACCOUNT_ID!);

require('dotenv').config();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    setStatus(client.user!);
    checkLogs();

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

function checkLogs() {
    let lastCheck = new Date();

    setInterval(async () => {
        const logs = await cloudflare.checkAccessLogs(lastCheck, process.env.CLOUDFLARE_ACCOUNT_ID!, process.env.CLOUDFLARE_APP_UID!);
        logs.forEach(log => {
            sendLog(log);
        });
        
        lastCheck = new Date();
    }, 1000 * 10);
}

async function sendLog(log: AccesLog) {
    const channel = client.channels.cache.get(process.env.CONNECTIONS_CHANNEL_ID!) as TextBasedChannel;
    const timestamp = new Date(log.created_at).getTime() / 1000;

    const exampleEmbed = new EmbedBuilder()
        .setColor(log.allowed ? 'Green' : 'DarkRed')
        .setTitle(log.allowed ? '✅・Access granted' : '⛔・Access denied')
        .setFooter({ text: `Connection on ${log.connection}`, iconURL: log.connection == "github" ? 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' : 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Cloudflare_Logo.png/1024px-Cloudflare_Logo.png'})
        .setThumbnail(getUserAvatar(log.user_email))
        .addFields(
            { name: 'User Email : ', value: log.user_email },
            { name: 'User Id : ', value: log.user_id },
            { name: 'Ip Address : ', value: log.ip_address },
            { name: 'Country : ', value: log.country },
            { name: 'Connection at ', value: `<t:${timestamp}:F> on \`${log.app_domain}\` (from ${log.app_name} service)`},
            { name: 'Ray Id ', value: log.ray_id}
        );
    
    channel.send({ embeds: [exampleEmbed] });
}

function getUserAvatar(email: string) {
    return `https://www.gravatar.com/avatar/` + md5(email);
}

function setStatus(user: ClientUser) {
    user.setActivity({
        name: 'status',
        type: ActivityType.Watching
    });
};

client.login(process.env.TOKEN);