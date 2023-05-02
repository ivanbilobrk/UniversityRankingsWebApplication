const express = require('express');
const app = express();
require('dotenv').config({ path: __dirname + '/../.env'});
const cron = require('cron');
const { scheduledFunction } = require('./helpFunctions/scheduledFunction')
const { getAllUnisForYearAndCategory } = require('./db/dbFunctions');
const cookieParser = require('cookie-parser');
var cors = require('cors')


const job = new cron.CronJob('*/3 * * * *', async function() {
  await scheduledFunction(6, 2, 'ranking');
  await scheduledFunction(0, 0, 'rankingcurrentyeardata');
}, null, false, 'UTC');



app.use(cors({credentials: true, origin: true}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

  
app.use('/rankingsYear', require('./routes/getAllTest'))
app.use('/rankingUni', require('./routes/getRankingForUniAndYear'))
app.use('/uniCurrentYear', require('./routes/getUniCurrentYear'))

app.use((req, res)=>{
    res.status(404).json({error: 'Not found'});
})


app.listen(parseInt(process.env.PORT));