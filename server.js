if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  const mongoose =require('mongoose')
  const url='mongodb://127.0.0.1:27017/userData'
  const User=require('./models/user_model')
  const express = require('express')
  const app = express()
  const bcrypt = require('bcrypt')
  const passport = require('passport')
  const flash = require('express-flash')
  const session = require('express-session')
  const methodOverride = require('method-override')
  const initializePassport = require('./passport-config')

  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology : true 
    })
  const db = mongoose.connection
  db.on("connected",()=>{
    console.log("connected to mongodb")
  })
  db.on("error",()=>{
    console.log("Error")
  })
  
 
  initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
  )
  
  const users = []
  
  app.set('view-engine', 'ejs')
  app.use(express.urlencoded({ extended: false }))
  app.use(flash())
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(methodOverride('_method'))
  const path = require('path')
  app.use( express.static(path.join(__dirname, 'public')))
  
  
  app.get('/', checkLoggedIn, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })
  
  app.get('/login', checkNotLoggedIn, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', checkNotLoggedIn, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))
  
  app.get('/register', checkNotLoggedIn, (req, res) => {
    res.render('register.ejs')
  })
  
  app.post('/register', checkNotLoggedIn, async (req, res) => {
    try {
      const data = req.body
      const user = new User(data)
      const name = user.name
      const password = user.password
      const email = user.email
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      })
      
        User.findOne({email:user.email})
        .then((savedUser)=>{
        if(savedUser){
                console.log("User already exists with that email")
                return ;
        }
        const newuser=new User({
          password:hashedPassword,
          name,
          email
         
      })
      newuser.save()
        .then((newuser)=>{
            console.log(newuser.email)
            console.log(newuser.name)
            console.log(newuser.password)
            
        })
        .catch((err)=>{
            console.log(err)
        })
    })
    .catch((err)=>{
        console.log(err)
    }) 
    

    
      res.redirect('/login')
    } catch {
      res.redirect('/register')

    }
  })
  
  app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
  })
  
  function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  
  app.listen(3000)