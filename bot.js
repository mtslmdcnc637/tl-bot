const express = require("express");
const telegramBot = require("node-telegram-bot-api");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { google } = require("googleapis");
const credentials = require("./client_secret.json");
const docId = "1RJ6oS2MRL7JW5RGdc4pQCo3mOdxmD2WfQnNgc9cg8co";
const { promisify } = require("util");
const { NlpManager } = require("node-nlp");
const { json } = require("express");
const app = express()
app.use(express.json())
require('dotenv').config()

const Promise = require('bluebird');
Promise.config({
    cancellation: true
});

const token = process.env.token;
  const bot = new telegramBot(token, {polling: true});

console.log( "----------------------------------------------------------------------------")


// codigo no treinamento --------------------------------------------------
const manager = new NlpManager({ languages: ["pt"], forceNER: true });
// fim do codigo que instancia o treinemento ---------------------------

manager.addDocument("pt", "oi", "SALUTATION")
manager.addAnswer("pt", "SALUTATION", "Olá!!!!!!!!")

async function accessSpreadsheet() {
    const auth = new google.auth.GoogleAuth({
        keyFile: "/etc/secrets/client_secret.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    })

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    return {
        auth,
        client,
        googleSheets,
        docId
    }
}
async function getData() {
    const { googleSheets, auth } = await accessSpreadsheet();

    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: docId,
        range: "quest"
    })
    return getRows;
}
const getRows = getData();


getRows.then((result) => {
    const row = result.data.values
    row.forEach(async (quest) => {
        await manager.addDocument("pt", quest[0], quest[1])
    })



})

async function getAnswer() {

    const { googleSheets, auth } = await accessSpreadsheet();
    const getAnswer = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: docId,
        range: "answer"
    })
    return getAnswer;
}

const answer = getAnswer();

answer.then((result) => {
    const row = result.data.values
    console.log(row)
    row.forEach(async (answer) => {
        await manager.addAnswer("pt", answer[0], answer[1])
    })



})
console.log('intermediario')
async function responseMsg() {
    console.log("treino iniciado")
    await manager.train();
    manager.save();
    console.log("treinamento concluido")
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





