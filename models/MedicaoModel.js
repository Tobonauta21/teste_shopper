//Import    
    import * as db from './con.js'

    const Measure = db.sequelize.define('measure',{
        customer_code:{type:db.Sequelize.STRING,allowNull:false},
        cod_measure:{type:db.Sequelize.STRING,allowNull:false},
        measure_type:{type:db.Sequelize.STRING,allowNull:false},
        measure_datetime:{type:db.Sequelize.STRING,allowNull:false},
    })

    Measure.sync()

    export default Measure