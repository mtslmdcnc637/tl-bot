const router = require('express').Router();
const trainerModel = require('../../models/trainerModel');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));



//rota para testar arquivo json -------------------------------------------
router.get('/', async (req, res) => {
    
    const dataForTreinerQuest = await trainerModel.find({type: "quest"})
    res.send(dataForTreinerQuest)
})



router.post('/put', (req, res) => { //abre a rota de adição de dados ao banco de dados	
    const { text, category, type } = req.body
    console.log(text)
    console.log(category)
    const inputTrainer = ({
        quest: text,
        category: category,
        userId: "teste",
        type: type
    })

    trainerModel.create(inputTrainer, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log(data)
        }
        res.redirect("/put")
    })
    
})



//rota para testar edição do arquivo json ----------------------------------
router.get('/put', (req, res) => {
    //cria uma nova entrada no banco de dados
    res.render('insert.ejs')

})




module.exports = router;