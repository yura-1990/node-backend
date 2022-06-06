require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

const router = require('./router/index.js')

const errorMiddleware = require('./middlewares/error-middleware')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use('/api', router)
app.use(errorMiddleware)


const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology:true,
    })
    app.listen(process.env.PORT,()=>console.log( `Server start on PORT ${process.env.PORT}`))
  }catch (e){
    console.log(e)
  }
}

start()