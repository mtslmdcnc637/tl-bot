const express = require("express");
const telegramBot = require("node-telegram-bot-api");
const { NlpManager } = require("node-nlp");
const { json } = require("express");
const app = express()
app.use(express.json())
require('dotenv').config()
const mongoose = require('mongoose');
const trainerModel = require('./models/trainerModel')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));
const router = express.Router();
const trainerRoutes = require('./src/routes/trainerRoutes')
app.set("view engine", "ejs");


async function conectDb() {
    const user = process.env.db_user
    const password = process.env.db_password
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(`mongodb+srv://${user}:${password}@chatbolt.tj78mfj.mongodb.net/?retryWrites=true&w=majority`)
        console.log("conectado ao banco de dados")
    }catch (error) {
        console.log("erro ao conectar ao banco de dados: "+error)
    }
}
conectDb()


async function trainer(){ //função que treina o bot com os dados do banco de dados
    const manager = new NlpManager({ languages: ["pt"], forceNER: true });
    const dataForTreinerQuest = await trainerModel.find({type: "quest"})
    const dataForTreinerAnswer = await trainerModel.find({type: "answer"})
    dataForTreinerQuest.forEach((element) => { //percorre o array de dados de treinamento
        manager.addDocument("pt", element.quest, element.category); //adiciona a pergunta e a intenção
    });
    dataForTreinerAnswer.forEach((element) => { //percorre o array de respostas
        manager.addAnswer("pt", element.category, element.answer); //adiciona a intenção e a resposta
    });
    await manager.train();
    manager.save();
    console.log(dataForTreinerQuest)
    console.log(" ----------------------------- treinamento concluido -----------------------------")
}

app.use('/', trainerRoutes)




//para telegram -----------------------------------------------------------
const token = process.env.token;
const bot = new telegramBot(token, {polling: true});








app.listen(3000, () => { // depois que o servidor for iniciado ele executa o codigo abaixo

async function responseMsg() {
    await trainer()
    bot.on("message", async msg => {
        if (msg.from.is_bot === false) {

            const msgText = msg.text.toLowerCase()
            const response = await manager.process("pt", msgText);
            if (response.answer && response.score > 0.8) {
                bot.sendMessage(msg.chat.id, response.answer);

                console.log(msgText)
            } else {
                bot.sendMessage("5258143401", "mensagem desconhecida: "+msgText);
            }

        }
        return true;
    });

} //termino da função assincrona que executa o treino do bot
responseMsg() //chamada da função assincrona que executa o treino do bot

   


    console.log("server running")
}
)



