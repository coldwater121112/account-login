const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const accountLogin = require("./models/accountLogin")
const app = express()
// 加入這段 code, 僅在非正式環境時, 使用 dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }) // 設定連線到 mongoDB

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(bodyParser.urlencoded({ extended: true }))


app.get('/', (req, res) => {
  res.render('index')
})

// 處理 POST 請求，處理登入資料
app.post('/', (req, res) => {
  // 在這裡處理登入邏輯，例如驗證帳號密碼等等
  const email = req.body.email
  const password = req.body.password
  console.log(email, password)
  // 執行登入邏輯，進行帳號密碼驗證等等
  accountLogin.findOne({ email: email })
    .lean()
    .then(user => {
      if (!user) {
        console.log('使用者不存在')
        return res.redirect('/')
      }
      // 檢查密碼是否正確
      if (user.password !== password) {
        console.log('密碼錯誤')
        return res.redirect('/')
      }
      else {
        res.render('login', { username: user.firstName })
      }
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Internal Server Error')
    })
})


app.listen(3000, () => {
  console.log('App is runnung on port http://localhost:3000')
})