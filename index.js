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
function newStatsCreate(msgID, guildID) {
  const guildStats = stats[guildID];
  if (msgID in guildStats === false) {
    guildStats[msgID] = {
      messages: 0,
      xp: 0,
      xpToNextLevel: 5,
      level: 0,
      lastVersionUsed: 1,
      lastMessageTime: Date.now(),
      gbp: 0,
      voiceJoinTime: 0,
      voiceChannelTime: 0,
      voiceChannelJoines: 0,
      voiceChannelLeaves: 0,
      voiceChannelDefens: 0,
      voiceChannelMutes: 0,
      voiceChannelAfks: 0
    }
    saveStats();
  };
  return;
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
  Collection,
  VoiceState
} = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]
});
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const jsonfile = require('jsonfile');
const fs = require('fs');

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))
const commands= []

const doubleXpWeekend = false
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

  const CLIENT_ID = client.user.id;

  const rest = new REST({
    version: "9"
  }).setToken(token);

    try {
      if (process.env.ENV === "production") {
         rest.put(Routes.applicationCommands(CLIENT_ID),{
          body: commands
        });
        console.log("Successfully registered commands globally.");
      } else {
         rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID),{
          body: commands
        });
        console.log("Successfully registered commands locally.");
      };
    } catch (err) {
      if (err) console.error(err);
    }
  
});


client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.member.user.bot) return; //bot Check

  const guildStats = stats[newState.guild.id];
  if (newState.member.id in guildStats === false) newStatsCreate(newState.member.id, newState.guild.id); //This is checking if the user has stats yet and if not creating them.
  const userStats = guildStats[newState.member.id];

  if (newState.channelId) { //Checks if user joins a vc
    if (!oldState.channelId) {  //Checks if user joined a voice channel or came from another one.
      userStats.voiceChannelJoines ++;
      userStats.voiceJoinTime = Date.now();
    } else return //if they came from another nothing is done untill they leave the voice channel.
  }
  if (!newState.channelId) { //checks if user leaves a voice channel.
    userStats.voiceChannelLeaves--;
    let loops = 0;
    let xpAddLoops = Math.floor((Date.now() - userStats.voiceJoinTime) / 1000);
    while (xpAddLoops >= loops) {
      userStats.xp += getRandomIntInclusive(5, 15);
      if (doubleXpWeekend === true) getRandomIntInclusive(5, 25);
      loops++
    };
  };
});

client.on("interactionCreate", async interaction => { //No clue found this on the internet
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;
  try {
    await command.execute(interaction);
  } catch(err) {
    if (err) console.err(err);
    await interaction.reply({
      content: "An error occured while executing that command.",
      emphemeral: true
    });
  };
}) //this is the end of the internet magic codee.

client.on('guildMemberAdd', member => {
  if (!member.guild.id in stats) {
  let id = member.author.id;
  newStatsCreate(id, member.guild.id)};
  console.log(member.guild.id);
  const myGuild = client.guilds.cache.get('1060787815086051418');
  const joinRole = myGuild.roles.cache.find(role => role.name === 'Binner\'s');
  console.log('User ' + member.user.username + ' has join ther server!');
  member.roles.add(joinRole);
  member.setNickname(`Saint ${member.user.username}`);
});

client.on('messageCreate', async msg => {
  if (msg.author.bot === true) return; //Bot check.

  let args2 = msg.content.split(/ +/); //We only use this to check if they are a banned word in thier message.
  let x = 0
  while (x < args2.length) {
    if (bannedWords.includes(args2[x]) === true) msg.delete();
    x++
  }
  const guildStats = stats[msg.guild.id];
  if (msg.author.id in guildStats === false) newStatsCreate(msg.author.id, msg.guild.id); //This is checking if the user has stats yet and if not creating them.
  const userStats = guildStats[msg.author.id];

  if (Date.now()-userStats.lastMessageTime >= 30000) {
    userStats.messages++;
    userStats.xp += getRandomIntInclusive(5, 15);
    if (doubleXpWeekend === true) getRandomIntInclusive(5, 15);
    userStats.gbp += getRandomIntInclusive(5, 20);
    if (doubleXpWeekend === true) userStats.gbp += getRandomIntInclusive(5, 20);
    saveStats();
  }

  var loop = 0;
  while (userStats.xp >= userStats.xpToNextLevel) {
    userStats.xp -= userStats.xpToNextLevel;
    userStats.level++;
    userStats.xpToNextLevel = Math.floor(123*userStats.level);
    loop++;
  } if (loop === 1) {
    msg.channel.send(`<@${msg.author.id}>, You leveled up! You are now level ${userStats.level}!`);
    saveStats();
  } else if(loop > 1){
    msg.channel.send(`<@${msg.author.id}>, You leveled up ${loop} times! You are now level ${userStats.level}!`);
    saveStats();
  }
  
  if (userStats.gbp === null) userStats.gbp = 0;
  if (msg.content.startsWith(prefix) === false) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  switch (command) {
    case ('profile'):
      msg.reply(`<@${msg.author.id}> your level is ${userStats.level}, you have ${userStats.xp} xp, you have ${userStats.gbp} good bin points, and have sent ${userStats.messages} messages in this server.`);
      break;
    case ('add'):
      console.log(args);
      console.log(args.length);
      if (args[0] === 'bw') {
        if (msg.member.roles.cache.has('1060788443858337903') === false) return msg.channel.send(`<@${msg.author.id}>, you need administrator permissions to do that.`);
        if (args.length <= 1) return msg.channel.send(`<@${msg.author.id}>, you need to specify a word to add.`);
        if (bannedWords.includes(args[1])) return msg.channel.send(`<@${msg.author.id}>, ${args[1]} is already banned.`);
        bannedWords.push(args[1]);
        msg.channel.send(`<@${msg.author.id}>, succesfully added ${args[1]} to the ban list.`);
        saveBannedWords();
      }
      break;
    case ('remove'): 
      if (args[0] === 'bw') {
        if (msg.member.roles.cache.has('1060788443858337903') === false) return msg.channel.send(`<@${msg.author.id}>, you need administrator permissions to do that.`);
        if (args.length <= 1) return msg.channel.send(`<@${msg.author.id}>, you need to specify a word to add.`);
        if (!bannedWords.includes(args[1])) return msg.channel.send(`<@${msg.author.id}>, ${args[1]} is not banned.`);
      let index = bannedWords.indexOf(args[1]);
        bannedWords.splice(index, 1);
        msg.channel.send(`<@${msg.author.id}>, succesfully removed ${args[1]} from the ban list.`);
        saveBannedWords();
      }
      break;
    default:
      msg.channel.send(`<@${msg.author.id}> that is an unkown command.`);
      break;
  }
})
client.login(token);