const { SlashCommandBuilder, ModalBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require('discord.js');
const jsonfile = require('jsonfile');
stats = jsonfile.readFileSync('stats.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profie")
        .setDescription("shows your server level and xp"),
    async execute(interation) {
        const guildStats = stats[interation.guild.id]
        const userStats = guildStats[interation.user.id] 

        const exampleEmbed = new MessageEmbed()
      .setTitle( `${interation.user.username}'s, Profile!`)
      .setAuthor({ name: `${interation.user.username}'s, Profile!`, iconURL: interation.user.displayAvatarURL()})
      .setThumbnail(interation.user.displayAvatarURL())
      .addFields(
        { name: 'Level', value: `${userStats.level}`, inline: true },
        { name: 'Xp', value: `${userStats.xp}`, inline: true },
        { name: 'GBP', value: `${userStats.gbp}`, inline: true },
        { name: 'Messages', value: `${userStats.messages}`, inline: true },
        { name: 'Minutes in voice channels', value: `${Math.floor((userStats.voice.ChannelTime*100)/60000)/100}`, inline: false },
      )
	    .setTimestamp()

        interation.reply({ embeds: [exampleEmbed] })     
    }
}