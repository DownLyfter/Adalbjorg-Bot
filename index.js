function saveBannedWords() {
  jsonfile.writeFileSync('bannedwords.json', bannedWords)
}
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
const jsonfile = require('jsonfile');
const fs = require('fs')
if (fs.existsSync('bannedwords.json')) {
  bannedWords = jsonfile.readFileSync('bannedwords.json');
  console.log('Synced banned words')
  console.log(bannedWords)
}
client.on('guildMemberAdd', member => {
  const myGuild = client.guilds.cache.get('1060787815086051418');
  const joinRole = myGuild.roles.cache.find(role => role.name === 'Binner\'s');
  console.log('User ' + member.user.username + ' has join ther server!')
  member.roles.add(joinRole)
  member.setNickname(`Saint ${member.user.username}`)
});

client.on('messageCreate', async msg => {
  if (msg.author.bot === true) return
  let args2 = msg.content.split(/ +/); //We only use this to check if they are a banned word in thier message.
  let x = 0
  while (x < args2.length) {
    if (bannedWords.includes(args2[x]) === true) msg.delete()
    x++
  }
  if (msg.content.startsWith(prefix) === false) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  switch (command) {
    case ('add'):
      console.log(args)
      console.log(args.length)
      if (args[0] === 'bw') {
        if (msg.member.roles.cache.has('1060788443858337903') === false) return msg.channel.send(`<@${msg.author.id}>, you need administrator permissions to do that.`)
        if (args.length <= 1) return msg.channel.send(`<@${msg.author.id}>, you need to specify a word to add.`)
        if (bannedWords.includes(args[1])) return msg.channel.send(`<@${msg.author.id}>, ${args[1]} is already banned.`)
        bannedWords.push(args[1])
        msg.channel.send(`<@${msg.author.id}>, succesfully added ${args[1]} to the ban list.`)
        saveBannedWords()
      }
      break;
    case ('remove'): 
      if (args[0] === 'bw') {
        if (msg.member.roles.cache.has('1060788443858337903') === false) return msg.channel.send(`<@${msg.author.id}>, you need administrator permissions to do that.`)
        if (args.length <= 1) return msg.channel.send(`<@${msg.author.id}>, you need to specify a word to add.`)
        if (!bannedWords.includes(args[1])) return msg.channel.send(`<@${msg.author.id}>, ${args[1]} is not banned.`)
        let index = bannedWords.indexOf(args[1])
        bannedWords.splice(index, 1)
        msg.channel.send(`<@${msg.author.id}>, succesfully removed ${args[1]} from the ban list.`)
        saveBannedWords()
      }
      break;
    default:
      msg.channel.send(`<@${msg.author.id}> that is an unkown command.`)
      break;
  }
})
client.login(token);