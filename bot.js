const express = require("express");
const telegramBot = require("node-telegram-bot-api");
const { NlpManager } = require("node-nlp");
const { json } = require("express");
const app = express()
app.use(express.json())
require('dotenv').config()
const fs = require('fs')
const db_treiner = fs.readFileSync('/etc/secrets/treiner.json') //pegua o arquivo json com os dados de treinamento
const jsonDataForTreiner = JSON.parse(db_treiner) //transforma o arquivo json em um objeto javascript
const dataForTreiner = jsonDataForTreiner.for_treiner_quest //pega o array de dados de treinamento
const answer_collection = jsonDataForTreiner.answer //pega o array de respostas

//para telegram -----------------------------------------------------------
const token = process.env.token;
const bot = new telegramBot(token, {polling: true});
console.log( "------------------------------------ começo do código ----------------------------------------")

//rota para testar arquivo json -------------------------------------------
app.get('/teste', (req, res) => {
    res.send(dataForTreiner)
})

//rota para testar edição do arquivo json ----------------------------------
app.get('put', (req, res) => {
    // Adiciona um novo item ao array "for_treiner_quest"
dataForTreiner.push({ "quest": "ola!!!", "category": "SALUTATION" });

// Adiciona um novo item ao array "answer"
answer_collection.push({ "category": "NOVA_CATEGORIA", "answer": "nova resposta" });

// Atualiza o arquivo JSON com os dados atualizados
fs.writeFileSync('/etc/secrets/treiner.json', JSON.stringify(jsonDataForTreiner));

})

app.listen(3000, () => { // depois que o servidor for iniciado ele executa o codigo abaixo


// codigo no treinamento --------------------------------------------------
const manager = new NlpManager({ languages: ["pt"], forceNER: true });
// fim do codigo que instancia o treinemento ---------------------------


dataForTreiner.forEach((element) => { //percorre o array de dados de treinamento
    manager.addDocument("pt", element.quest, element.category); //adiciona a pergunta e a intenção
});

answer_collection.forEach((element) => { //percorre o array de respostas
    manager.addAnswer("pt", element.category, element.answer); //adiciona a intenção e a resposta
});


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

   


    console.log("server running")
}
)



