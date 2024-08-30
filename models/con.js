//Import
    import { Sequelize } from "sequelize"
    import dotenv from 'dotenv'
    
//Config
    dotenv.config()
    console.log(process.env.DB_URL)
    const sequelize = new Sequelize({
        dialect:'sqlite',
        storage:process.env.DB_URL
    })
    sequelize.authenticate().then(function(){
        console.log('Conectado ao banco com sucesso')
    }).catch(function(erro){
        console.log('Erro'+erro)
    })
    export {sequelize,Sequelize}