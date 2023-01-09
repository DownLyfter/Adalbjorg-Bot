const { SlashCommandBuilder, ModalBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong"),
    async execute(interation) {
        interation.reply("Pong!")
    }
}