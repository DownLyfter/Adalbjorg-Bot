const { SlashCommandBuilder, ModalBuilder } = require("@discordjs/builders");
const jsonfile = require('jsonfile');
stats = jsonfile.readFileSync('stats.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profie")
        .setDescription("shows your server level and xp"),
    async execute(interation) {
        const guildStats = stats[interation.guild.id]
        const userStats = guildStats[interation.user.id] 
        interation.reply( `<@${interation.user.id}> your level is ${userStats.level}, you have ${userStats.xp} xp, and have sent ${userStats.messages} messages in this server.`)     
    }
}