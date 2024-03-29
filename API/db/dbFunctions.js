const { pool } = require('./seed')
const { getMaxAwardForYear } = require('../db/seed')

async function getAllUnisForYearAndCategory(year, category, orderid, orderkey){

    const query = `SELECT DISTINCT ON (uni) *
                   FROM ranking
                   WHERE year = $1 and category = $2
                   ORDER BY uni, ABS(EXTRACT(epoch FROM (readingyear - NOW())))`

    let rows = (await pool.query(query, [year, category])).rows

    const unisAward = new Map();
    let maxAward = await getMaxAwardForYear(year-2, category, unisAward)

    for(let i in rows){
        
        rows[i].award = Math.sqrt(unisAward.get(rows[i].uni)/maxAward)*100;

        const aq1 = isNaN(rows[i].q1) ? 0 : rows[i].q1
        const acnci = isNaN(rows[i].cnci) ? 0 : rows[i].cnci
        const aic = isNaN(rows[i].ic) ? 0 : rows[i].ic
        const atop = isNaN(rows[i].top) ? 0 : rows[i].top
        const aaward = isNaN(rows[i].award) ? 0 : rows[i].award

        rows[i].total = aq1+acnci+aic*0.2+atop+aaward
        
        
    }

    
    rows.sort((a, b)=>{
        let result = 0;
        if(orderid != 'total'){
            let first = a[orderid];
            if(isNaN(first)) first = 0

            let second = b[orderid];
            if(isNaN(second)) second = 0

            //console.log(first+" "+second)
            result = first - second
        } else {
            const aq1 = isNaN(a.q1) ? 0 : a.q1
            const acnci = isNaN(a.cnci) ? 0 : a.cnci
            const aic = isNaN(a.ic) ? 0 : a.ic
            const atop = isNaN(a.top) ? 0 : a.top
            const aaward = isNaN(a.award) ? 0 : a.award
    
            const bq1 = isNaN(b.q1) ? 0 : b.q1
            const bcnci = isNaN(b.cnci) ? 0 : b.cnci
            const bic = isNaN(b.ic) ? 0 : b.ic
            const btop = isNaN(b.top) ? 0 : b.top
            const baward = isNaN(b.award) ? 0 : b.award
            result = (bq1+bcnci+bic*0.2+btop+baward) - (aq1+acnci+aic*0.2+atop+aaward)
        }

        
        if(orderkey == 'false'){
            return result
        }

        return -result
    });

    for(let i in rows){
        rows[i].position = parseInt(i) + parseInt(1) 
    }



    return rows
}

async function getDataForUniCurrentYear(category, uni){
    const currentYear = new Date().getFullYear();
    const query = `SELECT *
                   FROM ranking
                   WHERE year = $1 AND uni = $2 AND category = $3
                   ORDER BY readingyear asc`

    let rows = (await pool.query(query, [currentYear, uni, category])).rows

    const unisAward = new Map();
    let maxAward = await getMaxAwardForYear(currentYear-2, category, unisAward)

    const allUnis = await getAllUnisForYearAndCategory(currentYear, category, 'total', 'false')
    for(let i in rows){
        rows[i].award = Math.sqrt(unisAward.get(rows[i].uni)/maxAward)*100;
        const aq1 = isNaN(rows[i].q1) ? 0 : rows[i].q1
        const acnci = isNaN(rows[i].cnci) ? 0 : rows[i].cnci
        const aic = isNaN(rows[i].ic) ? 0 : rows[i].ic
        const atop = isNaN(rows[i].top) ? 0 : rows[i].top
        const aaward = isNaN(rows[i].award) ? 0 : rows[i].award
        rows[i].total = aq1+acnci+aic*0.2+atop+aaward
        for(let j in allUnis){
            if(allUnis[j].uni == rows[i].uni){
                rows[i].position = allUnis[j].position
            }
        }
    }
    return rows
                       
}

async function getRealRanking(uni, year, category){
    const query = `select * from rankingReal
                    where year = $1 and uni = $2 and category = $3`;
    
    let rows = (await pool.query(query, [year, uni, category])).rows
    return rows
}

module.exports = { getAllUnisForYearAndCategory, getDataForUniCurrentYear, getRealRanking }