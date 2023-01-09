function saveBannedWords() {
  jsonfile.writeFileSync('bannedwords.json', bannedWords)
}
function saveStats() {
  jsonfile.writeFileSync('stats.json', stats)
}
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min) // The maximum is inclusive and the minimum is inclusive
}
require("dotenv").config()
const {
  prefix,
  token,
  BotVersion,
} = require('./config.json');
const {
  Client,
  Intents,
  Collection
} = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]
});
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const jsonfile = require('jsonfile');
const fs = require('fs');
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))
const commands= []

client.commands = new Collection()

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
  client.commands.set(command.data.name, command)
}

if (fs.existsSync('bannedwords.json')) {
  bannedWords = jsonfile.readFileSync('bannedwords.json');
  console.log('Synced banned words')
  console.log(bannedWords)
} else console.log('No bannedwords.json file is found')

if (fs.existsSync('stats.json')) {
  stats = jsonfile.readFileSync('stats.json')
  console.log('Synced stats.json')
} else console.log('error no json file is found.')

client.once('ready', () => {
  console.log('Bot is online.');

  const CLIENT_ID = client.user.id

  const rest = new REST({
    version: "9"
  }).setToken(token)

    try {
      if (process.env.ENV === "production") {
         rest.put(Routes.applicationCommands(CLIENT_ID),{
          body: commands
        })
        console.log("Successfully registered commands globally.")
      } else {
         rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID),{
          body: commands
        })
        console.log("Successfully registered commands locally.")
      }
    } catch (err) {
      if (err) console.error(err)
    }
  
});
client.on("interactionCreate", async interaction => { //No clue found this on the internet
  if (!interaction.isCommand()) return

  const command = client.commands.get(interaction.commandName)

  if (!command) return
  try {
    await command.execute(interaction)
  } catch(err) {
    if (err) console.err(err)
    await interaction.reply({
      content: "An error occured while executing that command.",
      emphemeral: true
    })
  }
}) //this is the end of the internet magic codee.

client.on('guildMemberAdd', member => {
  if (!msg.guild.id in stats) {
    stats[member.guild.id] = {}
    saveStats()
  }
  console.log(member.guild.id) 
  const myGuild = client.guilds.cache.get('1060787815086051418');
  const joinRole = myGuild.roles.cache.find(role => role.name === 'Binner\'s');
  console.log('User ' + member.user.username + ' has join ther server!')
  member.roles.add(joinRole)
  member.setNickname(`Saint ${member.user.username}`)
});

client.on('messageCreate', async msg => {
  if (msg.author.bot === true) return //Bot check.

  let args2 = msg.content.split(/ +/); //We only use this to check if they are a banned word in thier message.
  let x = 0
  while (x < args2.length) {
    if (bannedWords.includes(args2[x]) === true) msg.delete()
    x++
  }

    if (msg.guild.id in stats === false) { //This is checks if guild id is in stats and if not adds it to stats.
    stats[msg.guild.id] = {}
    saveStats()
  }

  const guildStats = stats[msg.guild.id]
  
  if (msg.author.id in guildStats === false) {
    guildStats[msg.author.id] = {
      messages: 0,
      xp: 0,
      xpToNextLevel: 0,
      level: 0,
      lastVersionUsed: 1,
      lastMessageTime: Date.now()
    }
    saveStats()
  }
  
  const userStats = guildStats[msg.author.id]
  if (Date.now()-userStats.lastMessageTime >= 30000) {
    userStats.messages++
    userStats.xp += getRandomIntInclusive(5, 15)
    saveStats() 
  }
  
  if (msg.content.startsWith(prefix) === false) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  switch (command) {
    case ('profile'):
      msg.reply(`<@${msg.author.id}> your level is ${userStats.level}, you have ${userStats.xp} xp, and have sent ${userStats.messages} messages in this server.`)
      break;
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