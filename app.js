const express = require('express')
const exphbs = require('express-handlebars')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const session = require("express-session")
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


// 設定 express-session
app.use(session({
  secret: 'your-secret-key', // 替換為一個安全的密鑰
  resave: false,
  saveUninitialized: true,
}))

app.get('/', (req, res) => {
  console.log(req.session)
  console.log(req.sessionID)
  res.render('index')
})

// 處理 POST 請求，處理登入資料
app.post('/', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  accountLogin.findOne({ email: email })
    .lean()
    .then(user => {
      if (!user) {
        console.log('使用者不存在')
        return res.redirect('/')
      }

      if (user.password !== password) {
        console.log('密碼錯誤')
        return res.redirect('/')
      }

      // 登入成功，將用戶存入 session
      req.session.user = user.firstName
      // console.log(req.session.user)
      res.redirect('/login')
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Internal Server Error')
    })
})

// 驗證登入狀態
app.get('/login', (req, res) => {
  const userName = req.session.user
  if (req.session.user) {
    console.log('authenticated')
    return res.render('login', { username: req.session.user })
  } else {
    console.log('not authenticated')
    return res.redirect('/')
  }
})

app.listen(port, () => {
  console.log(`App is running on port http://localhost:${port}`)
})