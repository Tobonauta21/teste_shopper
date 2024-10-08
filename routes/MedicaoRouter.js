//Import
    import { Router } from "express"
    import * as Measure from '../controllers/MedicaoController.js'
//Config
    const router = new Router()

//Rotas
    router.get('/',(req,res)=>{
        res.render('medir')
    })

    router.post('/upload',Measure.makeRequest)
    
    router.post('/confirm',Measure.saveRequest)

    router.get('/:code/:m_type',Measure.listMeasure)
//Export
    export {router}