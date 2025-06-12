const { Client, GatewayIntentBits, ActivityType, messageLink, Guild, EmbedBuilder, ActionRowBuilder, ButtonStyle, ComponentType, ButtonBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus, getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const { token } = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});

const prefix = 'в!'

client.on('ready', readyClient => {
    client.user.setPresence({
        activities:[{
            name: "На смене",
            type: ActivityType.Watching,
        }],
        status: 'online'
    });
    console.log('logged on as', readyClient.user.tag);
});

client.on('guildCreate', (guild) => {
    guild.channels.cache.first().send("Здрасте, я короче тут у вас побуду, ок?");
});

//commands
client.on('messageCreate', async function(message){
    if (message.author == client.user) return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
    
    if (command === "вмн") {
        if (!message.member.permissions.any('BanMembers', true)) {
            return message.reply('У вас права нет чтобы высшую меру наказания прописать.');
        } else {
            let member = message.mentions.members.first();
            let arg = args[0];
            if (!member) return message.reply('Гражданина не указали!');
            if (!member == arg) return message.reply('Неправильно указано!');
            let reason = args.slice(1).join(" ");
            if (reason) { 
                member.ban({reason: reason});
                message.reply(`✅Гражданина <@${member.user.id}> успешно осудили. Причина: ${reason}.`); 
            } else {
                await member.ban({});
                message.reply(`✅Гражданина <@${member.user.id}> успешно осудили. Причина не указана.`);
            }
        }
    }
    if (command === "лебозер") {
        const channel = message.member?.voice.channel;
        if (!channel) {
            message.reply('https://tenor.com/view/swan-lake-pas-de-quatre-bolshoi-ballet-ballet-tutu-gif-16575242');
            return;
        }
        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            const resource = createAudioResource('lebedinoe.mp3');

            const player = createAudioPlayer();
        
            connection.subscribe(player);
            player.play(resource);

            player.on('stateChange', (oldState, newState) => {
                if (newState.status == AudioPlayerStatus.Idle) {
                    connection.disconnect();
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
    if (command === "депортация") {
        if (!message.member.permissions.any('KickMembers', true)) {
            return message.reply('У вас нет права на депортацию.');
        } else {
            let member = message.mentions.members.first();
            let arg = args[0];
            if (!member) return message.reply('Гражданина не указали!');
            if (!member == arg) return message.reply('Неправильно указано!');
            let reason = args.slice(1).join(" ");
            if (reason) {
                await member.kick(reason);
                message.reply(`✅Гражданин <@${member.user.id}> успешно депортирован. Причина: ${reason}`);
            } else {
                await member.kick(reason);
                message.reply(`✅Гражданин <@${member.user.id}> успешно депортирован. Причина не указана`);
            }
        }
    }
    if(command==="шарик") {
        const sharik = [
            'Сто процентов да',
            'Не знаю',
            'Нет'
        ]
        let rand = getRandomInt(1, 3);
        switch (rand) {
            case 1:
                message.reply(sharik[0]);
                break;
            case 2:
                message.reply(sharik[1]);
                break;
            case 3:
                message.reply(sharik[2]);
                break;
        }
    }
    if(command === "тихийчас") {
        if (!message.member.permissions.has("ModerateMembers")) {
            return message.reply('У вас нет прав на такое.');
        }

        let member = message.mentions.members.first();
        if (!member) return message.reply('Гражданина не указали!');
    
    // Get timeout duration (in minutes)
        let minutes = Number(args[1]);
        if (isNaN(minutes) || minutes <= 0) {
            return message.reply('Укажите корректное время в минутах!');
        }

    // Calculate timeout duration (max 28 days)
        const maxTimeout = 28 * 24 * 60; // 28 days in minutes
        minutes = Math.min(minutes, maxTimeout);
        const time = minutes * 60 * 1000; // Convert to milliseconds

    // Get reason (all arguments after time)
        let reason = args.slice(2).join(" ") || "Причина не указана";

        try {
            await member.timeout(time, reason);
            message.reply(`✅ Гражданин <@${member.id}> успешно отправлен на тихий час на ${minutes} минут. Причина: ${reason}`);
        } catch (error) {
            console.error('Ошибка при таймауте:', error);
            message.reply('Произошла ошибка при попытке отправить на тихий час.');
        }
    }
    if(command === "задержка") {
        if (!message.member.permissions.any("ManageChannels", true)) {
            return message.reply('У вас нет прав на такое.');
        }

        const time = parseInt(args[0]);
        if(isNaN(time) || time < 0 || time > 21600) {
            return message.reply('Слишком мало/много времени.');
        }

        try {
            message.channel.setRateLimitPerUser(time);

            if (time == 0) {
                message.reply('Задержка удалена.');
            } else {
                const minutes = Math.floor(time / 60);
                const seconds = minutes % 60;
                message.reply(`✅Установлен медленный режим в ${time} сек.`);
            }
        } catch(err) {
            console.error(err);
            message.reply('Ошибка произошла, галя отмена.');
        }
    }
    // for test
    if (command === "шконка") {
        if (!message.member.permissions.any("ModerateMembers", true)) {
            return message.reply('У вас нет прав на такое.');
        }

        let member = message.mentions.members.first();
        if (!member) return message.reply('Гражданина не указали!');

        const poligonRole = message.guild.roles.cache.find(role => role.name === "Подшконочный");

        if (!poligonRole) return message.reply('Роль не найдена почему то как так вообще.');

        if (!message.guild.members.me.permissions.has("ManageRoles")) {
            return message.reply('У меня прав на роли нет ужас какой.');
        }

        if (member.id === message.author.id) {
            return message.reply('❌ Нельзя отправить под шконку самого себя!');
        }
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply('❌ Нельзя применить к пользователю с равными или высшими правами!');
        }

        try {
            const originalRoles = member.roles.cache
            .filter(role => role.id !== message.guild.id) // Убираем @everyone
            .map(role => role.id)
            await member.roles.set([poligonRole.id]);
            message.reply(`✅<@${member.id}> был отправлен под шконку.`);
        } catch(err) {
            console.error(err);
        }
    }
    if (command === "блок") {
        if (!message.member.permissions.any("ManageChannels", true)) {
            return message.reply('У вас нет прав на такое.');
        }

        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false,
                SendMessagesInThreads: false,
                CreatePrivateThreads: false,
                CreatePublicThreads: false
            });
            message.reply('✅Канал заблокирован. Простой народ не сможет сюда писать.');
        } catch(err) {
            console.error(err);
        }
    }
    if (command === "разблок") {
        if (!message.member.permissions.any("ManageChannels", true)) {
            return message.reply('У вас нет прав на такое.');
        }

        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: true,
                SendMessagesInThreads: true,
                CreatePrivateThreads: true,
                CreatePublicThreads: true
            });
            message.reply('✅Канал разблокирован. Простой народ сможет сюда писать.');
        } catch(err) {
            console.error(err);
        }
    }
    if(command === "часики") {
        const channel = message.member?.voice.channel;
        if (!channel) {
            return message.reply("верифу юр клок⏲");
        }
        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            const resource = createAudioResource('chasiki.mp3');
            const player = createAudioPlayer();

            connection.subscribe(player);
            player.play(resource);

            player.on('stateChange', (oldState, newState) => {
                if (newState.status == AudioPlayerStatus.Idle) {
                    connection.disconnect();
                }
            });
        } catch (err) {
            console.error(err);
        }
    }
    if(command === "лелеле") {
        message.reply("лелеле https://images-ext-1.discordapp.net/external/2KhjFcfyBfiVx4GEn1tkeQ2aDKly0yOCpmPF8594cws/https/media.tenor.com/3rZ2FUebPfAAAAPo/%25D0%25BB%25D0%25B8%25D1%2582%25D0%25B2%25D0%25B8%25D0%25BD-vibe.mp4");
    }
    if(command === "помощь") {
        const embed = new EmbedBuilder()
            .setTitle('Помощь')
            .setDescription('Пособие для новичков по крутому боту который создал matveyuchik')
            .addFields(
                { name:"👨‍⚖️Модерация", value: "1. в!вмн - Высшая мера наказания. Формат в!вмн <пользователь> <причина (не обязательно)>\n2. в!депортация - кикнуть. Формат в!депортация <пользователь> <причина (не обязательно)>\n3. в!тихийчас - отправить в мут. Формат в!тихийчас <пользователь> <время в минутах> <причина (не обязательно)>\n4. в!блок - заблокировать канал.\n5. в!разблок - разблокировать канал.\n6. в!шконка - отправить под шконку. Формат в!шконка <пользователь> (НЕ ИСПОЛЬЗОВАТЬ НА ЮФ И ДРУГИХ СЕРВЕРАХ! БОТ СЛОМАЕТСЯ!)\n7. в!задержка - устанавливает кулдаун в канале. Формат в!задержка <время в секундах>", inline: true },
                { name:"🥳Весёлые штучки", value: "1. в!лебозер - отправляет лебединое озеро в чат.\n2. в!шарик - отвечает на ваш вопрос (РАНДОМНО!!). Формат в!шарик <вопрос>\n3. в!яцарь? - говорит вам, царь вы или нет.\n~~4. в!кнб - камень ножеце бугага.~~\n5. в!часики - ⏲.\n6. в!лелеле - лелеле", inline:true },
                { name:"🔨Другое", value:"1. в!отключись - отключает бота, если он в войсе (а он такое может 🕵️‍♂️)", inline:true }
            );
        await message.reply({ embeds: [embed] });
    }
    //if(command === "кнб") {
    //    const actionRow = new ActionRowBuilder()
    //        .addComponents(
    //            new ButtonBuilder()
    //                .setCustomId("rock")
    //                .setLabel("🥌Камень")
    //                .setStyle(ButtonStyle.Primary),
    //
    //            new ButtonBuilder()
    //                .setCustomId("scissors")
    //                .setLabel("✂Ножницы")
    //                .setStyle(ButtonStyle.Primary),
    //
    //            new ButtonBuilder()
    //                .setCustomId("paper")
    //                .setLabel("🧻Бумага")
    //                .setStyle(ButtonStyle.Primary),
    //        );
    //    await message.reply({
    //        content: "Играем в кнб",
    //        components: [actionRow]
    //    });
    //}
    if(command==="яцарь?") {
        if (message.member.user.username === "tsardnr" || message.member.user.username === "mrface11" || message.member.user.username === "pressm_2." || message.member.user.username === "matveyuchik") {
            message.reply('Вы Царь и это не обсуждается');
            return;
        }
        let random = getRandomInt(1, 2);
        if (random == 1) {
            message.reply('Вы царь!');
        } else {
            message.reply('Вы не царь.');
        }
        return;
    }
    if(command === "отключись") {
        const guildId = message.guild.id;
        const connection = getVoiceConnection(guildId);

        if (connection) {
            connection.disconnect();
        } else {
            message.reply('Я не в войсе.')
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const buttonId = interaction.customId;

    let random = getRandomInt(1, 3);
    if (buttonId === "rock" && random == 1) {
        await interaction.reply({
            content: "Ничья. У обоих камень.",
        });
    } else if (buttonId === "rock" && random == 2) {
        await interaction.reply({
            content: "Блин ты меня выиграл как так. У меня ножницы а у тебя камень."    
        });
    } else if (buttonId === "rock" && random == 3) {
        await interaction.reply({
            content: "Ахаха я тебя выиграл у меня бумага а у тебя камень"
        });
    }

    if (buttonId === "scissors" && random == 1) {
        await interaction.reply({
            content: "Ахаха я тебя выиграл у меня камень а у тебя ножницы"
        });
    } else if (buttonId === "scissors" && random == 2) {
        await interaction.reply({
            content: "Ничья. У обоих ножницы."
        });
    } else if(buttonId === "scissors" && random == 3) {
        await interaction.reply({
            content: "Блин ты меня выиграл как так. У меня бумага а у тебя ножницы."
        });
    }

    if (buttonId === "paper" && random == 1) {
        await interaction.reply({
            content: "Блин ты меня выиграл как так. У меня камень а у тебя бумага"
        });
    } else if(buttonId === "paper" && random == 2) {
        await interaction.reply({
            content: "Ахаха я тебя выиграл у меня ножницы а у тебя бумага"
        });
    } else if(buttonId === "paper" && random == 3) {
        await interaction.reply({
            content: "Ничья. У обоих бумага."
        });
    }
});

client.login(token);


function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}