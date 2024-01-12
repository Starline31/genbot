const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const stock = require("./stock");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yardım")
    .setDescription("Komut listesini gösterir."),

  async execute(interaction) {
    const { commands } = interaction.client;

    const commandListEmbed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle("Yardım Paneli")
      .setImage(config.banner)
      .setThumbnail(
        interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }),
      ) // Set the bot's avatar as the thumbnail
      .addFields({
        name: `Komutlar`,
        value:
          "`/yardım`   **Botun yardım komutu.**\n\n`/servis-oluştur` **Yeni servis oluşturur. (Yönetici Komutu)**\n\n`/ücretsiz`  **Ücretsiz bir hesap oluşturur.**\n\n`/ekle`    **Stok ekler. (Yönetici Komutu)**\n\n`/stok`  **Stokları görüntüleyin.**\n\n`/premium` **Premium hesap oluşturur. (Boosterlara Özel.)**",
      })
      .setFooter(
        interaction.user.tag,
        interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
      )
      .setTimestamp()
      .addField(
        "Linkler",
        `[**Website**](${config.website})   [**Discord**](${config.discord})`,
      );

    await interaction.reply({ embeds: [commandListEmbed] });
  },
};
