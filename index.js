
const {
  prefix,
  token,
  BotVersion,
} = require('./config.json');
const {
  Client,
  Intents
} = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]
});
client.once('ready', () => {
  console.log('Bot is online.');

});
client.on('guildMemberAdd', member => {
  const myGuild = client.guilds.cache.get('1060787815086051418');
  const joinRole = myGuild.roles.cache.find(role => role.name === 'Binner\'s');
  console.log('User ' + member.user.username + ' has join ther server!')
  member.roles.add(joinRole)
  member.setNickname(`Saint ${member.user.username}`)
});
client.on('messageCreate', async msg => {
    console.log(msg.content)
    if(msg.content === "ping") {
      msg.channel.send(`<@${msg.author.id}>, Pong!`)
    }  
  }
  )
client.login(token);