//Import
    import {GoogleGenerativeAI} from '@google/generative-ai'
    import {GoogleAIFileManager} from '@google/generative-ai/server'
    import dotenv from 'dotenv'    
    import Measure from '../models/MedicaoModel.js'

//Config
    dotenv.config()
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
        model:'gemini-1.5-pro'
    })
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY)

//Checando a medida
    export async function checkMeasure(measure_date,measure_code,customer_code,measure_type){
        const medicao = await Measure.findOne({where:{
            cod_measure:measure_code,
            measure_datetime:measure_date,
            customer_code:customer_code,
            measure_type:measure_type
            }
        })
        if(medicao){
            return true
        }else{
            return false
        }
    }

//Fazendo o request
    export const makeRequest = async (req,res)=>{
        const dados = req.body
        const erros = []

        if(!dados||dados.lenght<3){
            erros.push('Dados insuficientes')
        }

        if(!dados.measure_date){
            erros.push('Data inválida')
        }

        if(!dados.measure_type){
            erros.push('Tipo de medição inválida')
        }
        if(!dados.image){
            erros.push('Imagem inválida')
        }

        if(erros.length>0){
            res.render('medir',{erros:erros})
        }

        try{    
            const novaMedida = await checkMeasure(dados.measure_date,dados.measure_code,dados.customer_code,dados.measure_type)
            console.log(dados)
            if(novaMedida){
                return res.status(409).json({msg:'Medida desse mês já feita'});
            }

            const imgDir = process.env.IMG_DIR
            
            const uploadResponse = await fileManager.uploadFile(`${imgDir}/${dados.image}`, {
                mimeType: 'image/jpeg',
                displayName: 'Image'
            })

            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: uploadResponse.file.mimeType,
                        fileUri: uploadResponse.file.uri
                    }
                },
                {
                    text: 'Describe the measure in the image'
                }
            ])

            const resultado = result.response.candidates;
    
            if (resultado && resultado.length > 0) {
                const resposta = resultado[0]?.content?.parts[0]?.text || ''
                const resp = resposta.replace(/\D/g, '')
                console.log(resp)
    
                
                return res.status(200).render('medir',{resp:resp,dados:dados})
            } else {
                return res.status(400).json({ error: 'No candidates found in the response' })
            }
        }catch(err){
            console.error('Erro ao registrar a medida:', err);
            return res.status(500).json({ error: 'Ocorreu um erro ao processar a solicitação.' })
        }
    }

    //Salvando a medida no banco
        export const saveRequest = async(req,res)=>{
            const dados = req.body

        if(!dados){
            return res.status(400).json({msg:'invalid_data'})
        }

        try{
            await Measure.create({
                cod_measure:dados.measure_code,
                customer_code: dados.customer_code,
                measure_type: dados.measure_type,
                measure_datetime: dados.measure_date
            }).then(()=>{
                return res.status(200).json({success:'true'})
            }).catch((err)=>{
                console.log(err)
                return res.status(400).json({msg:'Measure not found'})
            })
        }catch(err){
                console.log(err)
                return res.status(400).json({msg:'Measure not found'})
        }
    }

    //Filtrando medidas dos clientes
        export const listMeasure = async(req,res)=>{

            if(!req.params){
                return res.status(400).json({msg:'Measure not found'})
            }

            try{
                await Measure.findAll({where:{customer_code:req.params.code,measure_type:req.params.m_type}}).then(measure=>{
                    return res.status(200).json(measure)
                }).catch(err=>{
                    console.log(err)
                    return res.status(400).json({msg:'Measure not found'})
                })
            }catch(err){
                console.log(err)
                return res.status(400).json({msg:'Measure not found'})
            }
        }

    