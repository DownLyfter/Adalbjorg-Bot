const {
    SlashCommandBuilder,
    ModalBuilder
} = require("@discordjs/builders");
const {
    MessageEmbed
} = require('discord.js');
const jsonfile = require('jsonfile');
stats = jsonfile.readFileSync('stats.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("voicestats")
        .setDescription("shows your voice channel stats!"),
    
        async execute(interation) {
        const guildStats = stats[interation.guild.id]
        const userStats = guildStats[interation.user.id]

        const exampleEmbed = new MessageEmbed()
            .setTitle(`${interation.user.username}'s, VoiceStats!`)
            .setAuthor({
                name: `${interation.user.username}'s, VoiceStats!`,
            })
            .setThumbnail(interation.user.displayAvatarURL())
            .addFields({
                name: 'VC\'s left',
                value: `${userStats.voice.ChannelLeaves}`,
                inline: true
            }, {
                name: 'Camera\'s enabled.',
                value: `${userStats.voice.ChannelCams}`,
                inline: true
            }, {
                name: 'Time\'s AFK',
                value: `${userStats.voice.ChannelAfks}`,
                inline: true
            }, {
                name: 'Times defened',
                value: `${userStats.voice.ChannelDefens}`,
                inline: true
            }, {
                name: 'Times muted',
                value: `${userStats.voice.ChannelMutes}`,
                inline: true
            }, {
                name: 'VC\'s joined',
                value: `${userStats.voice.ChannelJoines}`,
                inline: true
            }, {
                name: 'Minutes in voice channels',
                value: `${Math.floor((userStats.voice.ChannelTime*100)/60000)/100}`,
                inline: false
            }, )
            .setTimestamp()

        interation.reply({
            embeds: [exampleEmbed]
        })
    }
}