const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Team = require('./models/teams');
const Poll =  require('./models/polls');
const Message =  require('./models/message');
const nodemailer = require('nodemailer');
const methodOverride = require('method-override');
let n;
let te


const { google } = require("googleapis");
const { OAuth2 } = google.auth;

const OAuth2Client = new OAuth2(
    '853659705276-q9fco93vjg4suvf6usn9sol0t0upornp.apps.googleusercontent.com',
    'CqGl494eryOUsMfgzTpFgDC1',
    'http://localhost:3000/google'
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

let calendarEvent;

mongoose.connect('mongodb://localhost:27017/poll-booth', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))



app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/' ,(req,res)=>{
    res.redirect('/register')
})

app.get('/register', (req, res) => {
    try{
        res.render('register');
    }
    catch (err) {
        req.flash("error", "Unable to get register page");
        res.redirect("/register");
        console.log(err);
    }
});
app.post('/register' , async(req,res,next)=>{
    try{
    const { email, username, password , type , gender} = req.body;
    const user = new User({ email, username ,type , gender});
    const registeredUser = await User.register(user, password);
    // console.log(registeredUser);
    req.flash('success',"Successfully Registered");
    res.redirect('login'); 

    var transporter = nodemailer.createTransport({
        service: 'gmail',auth: {user: 'pollboothdeltatask@gmail.com',pass: 'Delta*003'}});
        
        var mailOptions = {
            from: 'pollboothdeltatask@gmail.com',
            to:`${user.email}`,
            subject: 'Registration confirmation from Poll Booth',
            text: `Welcome ${user.username},\n Greetings from Poll Booth! \n You have succesfully registered into our website \n Login and explore more`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
    });
    }
    catch(err){
        console.log(err);
    if (err.message == "A user with the given username is already registered") {
            req.flash("error", "Name is already in use");
    }
    else if (err.keyValue.email) {
      req.flash("error", "Email is already in use");
    } else if (err.keyValue.username) {
      req.flash("error", "Name is already in use");
    } else {
      req.flash("error", "Sorry! Unable to register");
    }
    res.redirect("/register");
  }   
})




app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', passport.authenticate('local', {failureFlash : true, failureRedirect: '/login'}), async (req, res) => { 
    n = req.user.username;
    if(req.user.type == "member")
    {
        req.flash('success',"Successfully Logged In!!!!!");
        res.redirect('dashboard');
    }
    else{
        req.flash('success',"Successfully Logged In!!!!!");
        res.redirect('dashboard1');
    }      
});




app.get('/CreateNewTeam' ,async(req,res)=>{
   
    try{
        if(!req.isAuthenticated()){
            res.redirect('login')
        }
        const use = await User.find({});
        res.render('newteam' , { use , n : req.user});
    }
    catch (err){
        req.flash("error", "Unable to show create team option");
        res.redirect("/dashboard");
        console.log(err);
    }
})
app.post('/CreateNewTeam' , async(req,res)=>{   
    try {
        if(!req.isAuthenticated()){
            res.redirect('login')
        }
        else{
            let mem ,mem1;
            const { name ,description, members ,invited } = req.body;
            const team = new Team({ name ,description, members ,invited});     
            await team.save();
            const filter1 = { _id:team.id };
        
            const d1 = await Team.findOneAndUpdate( filter1 , { $push: {members:req.user} }, {
                new: true
            });
            await d1.save()  
            const d2 = await Team.findOneAndUpdate( filter1 ,  {owner:req.user.username} , {
                new: true
            });
            await d2.save()  
            //console.log(d2);
            const team2 = await  Team.findOne(filter1)
            //console.log(team2);
            mem1 = await User.findById(team2.members[0]);
            
            for(let m = 0 ; m < team2.invited.length;m++){
                console.log(team2.invited[m]);
                mem = await User.findById(team2.invited[m]);
              
                console.log(mem);
                var transporter = nodemailer.createTransport({
                    service: 'gmail',auth: {user: 'pollboothdeltatask@gmail.com',pass: 'Delta*003'}});
                    
                    var mailOptions = {
                        from: 'pollboothdeltatask@gmail.com',
                        to:`${mem.email}`,
                        subject: 'Notification from Poll Booth',
                        text: `Hello ${mem.username},\n Greetings from Poll Booth! \n ${mem1.username} has invited you to join the team '${team2.name}' \n `
                    };
                    
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.log(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        }
                    });

            }

            req.flash('success',"Successfully Created a Team");
            res.redirect('allteams')
        }
    //res.redirect('dashboard1');   
    }
    catch (err){
        req.flash("error", "Unable to create team ");
        res.redirect("/dashboard");
        console.log(err);
    }  
})



app.get('/myProfile',async(req,res)=>{
    try {
        if(!req.isAuthenticated()){
            res.redirect('login')
        }
        else{
            const t = await Team.find({}).populate('members')
            res.render('profile',{t,user : req.user})
        }
    }
    catch(err){
        req.flash("error", "Unable to load profile");
        res.redirect("/dashboard");
        console.log(err);
    }  
})
app.get('/profile/:id',async(req,res)=>{
    try{
        if(!req.isAuthenticated()){
            res.redirect('login')
        }
        else{
            const user = await User.findById(req.params.id).populate('members')
            const t = await Team.find({}).populate('members')
            res.render('otherprofile',{t, user , n:req.user })
        }
    }
    catch(err){
        req.flash("error", "Unable to load profile");
        res.redirect("/dashboard");
        console.log(err);
    }  
})



app.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success',"Successfully Logged Out");
    res.redirect('login');
})




app.get('/dashboard',async (req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
    else{
        const use = await User.find({});
        const t = await Team.find({}).populate('members').populate('invited')
        res.render('dashboard' , { use , t , n:req.user} );
       
    }
     
})
app.get('/dashboard1',async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
   
    else{

        const use = await User.find({});
        const t = await Team.find({}).populate('members').populate('invited')
        res.render('dashboard1' , { use , t , n:req.user});
    }
})
app.get('/accept/:id',async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
   else{
        const t = await Team.findById(req.params.id).populate('members').populate('invited')
        const filter1 = { _id:req.params.id };
    
        const d1 = await Team.findOneAndUpdate( filter1 , { $addToSet: {members:req.user} }, {
            new: true
        });
        await d1.save()  
    
        const d2 = await Team.findOneAndUpdate( filter1 , { $pull : {invited:req.user._id} }, { new : true });
            
        await d2.save()  
        
        const filter2 = { username: d2.owner};
        const update2 = {$push : { notification : req.user.username  + " has joined the team " + d2.name + " via invite link"} }
        const d3 = await User.findOneAndUpdate( filter2 , update2 , { new : true });
            
        await d3.save()  
        res.redirect(`/team/:${req.params.id}`);
    }
    //res.send({d2})
})
app.get('/decline/:id',async(req,res)=>{
    const filter1 = { _id:req.params.id };
    const d2 = await Team.findOneAndUpdate( filter1 , { $pull : {invited:req.user._id} }, { new : true });
        
    await d2.save()  
    
    if(req.user.type == 'admin'){
        res.redirect('/dashboard1')
    }
    else{
        res.redirect('/dashboard')
    }

//res.send("Declined the invite")   
})
app.get('/allteams',async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
   
    else{

        const use = await User.find({});
        const t = await Team.find({}).populate('members')
        res.render('allteams' , { use , t , n:req.user} );
    }
})




app.get('/displaypolls/:id', async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
    else{
    const p = await Poll.findById(req.params.id).populate('team');
    const team1 = await Team.findById(p.team._id)
    // console.log(team1);
    res.render('displaypolls' ,{ p , n:req.user ,team1 })
    }
})
app.post('/displaypolls/:id',async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
    else{
    const p = await Poll.findById(req.params.id)
    const s = req.body.options
    //console.log(s);
    const filter1 = { _id:req.params.id };
    const update1 = {answers:s};
    const d1 = await Poll.findOneAndUpdate( filter1 , { $push: { answers:s} }, {
        new: true
    });
    await d1.save()
    const filter2 = { _id:req.params.id };
    const update2 = {answers:s};
    const d2 = await Poll.findOneAndUpdate( filter2 , { $push: { voted : req.user} }, {
        new: true
    });
    await d2.save()
    //console.log(d2);

    const use = await User.find({});
    const team1 = await Team.findOne({polls : req.params.id}).populate('polls').populate('members')
    const t = await Team.find({}).populate('members').populate('polls')
    const filter3 = { username: team1.owner};
    const update3 = {$push : { notification : req.user.username  + " has casted a vote in a poll in the team " + team1.name + " ( Question :" + d2.question + ")"} }
    const d3 = await User.findOneAndUpdate( filter3 , update3 , { new : true });
        
    await d3.save()
   
    const poll1 = await Poll.find({team : team1._id}).populate('team')
    res.render('showteams' , {team1  , poll1 , n:req.user} )
}

})

app.get('/chat/:id' , async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
    else{
    const team = await Team.findById(req.params.id).populate('chats').populate('sentBy');
    //console.log(team);
    const mes = await  Message.find({belong : req.params.id}).populate('sentBy').populate('belong');
    res.render('chat' , { team , n:req.user ,mes});
    }
})
app.post('/chat/:id' , async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
    else{
    const s = req.body.content;
    const { content } = req.body;
    const message1 = new Message({ content });     
    await message1.save();
   
    const filter2 = { content: s };

    const d2 = await Message.findOneAndUpdate( filter2 ,  { sentBy : req.user} , {
        new: true
    });
    await d2.save()
    const d4 = await Message.findOneAndUpdate( filter2 ,  { belong: req.params.id} , {
        new: true
    });
    await d4.save()
    const filter3 = { _id: req.params.id };

    const d3 = await Team.findOneAndUpdate( filter3 , {$push : { chats : d2._id} } , {
        new: true
    });
    await d3.save()

    const team = await  Team.findById(req.params.id).populate('chats').populate('sentBy');
    //console.log(team);
    const mes = await  Message.find({belong : req.params.id}).populate('sentBy').populate('belong');
    res.render('chat' , { team ,n:req.user ,mes });
    }
})
app.delete('/chat/:id' , async(req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('login')
    }
    else{
        console.log("hi")
        const query = {belong : req.params.id};
        const result = await Message.deleteMany(query);
        // const mes = await  Message.findAndDelete({belong : req.params.id});
        const sss = await Team.findOne({_id: req.params.id})
        sss.chats = [];
        await sss.save();
        
        res.redirect(`/chat/${req.params.id}`);
    }
})

app.get('/endpoll/:id' ,async(req,res)=>{
    const p = await  Poll.findById(req.params.id).populate('team')
    const filter1 = { _id:req.params.id };
    const d1 = await Poll.findOneAndUpdate( filter1 , {state : "inactive"} , {
        new: true
    });
    await d1.save()
    //console.log(d1);
    res.redirect(`/result/${p._id}`)
})


app.get('/result/:id',async(req,res)=>{
    const p = await  Poll.findById(req.params.id).populate('team')
    res.render('result' ,{p , n:req.user})
})




app.get('/poll/:id',async(req,res)=>{     
    const team1 = await Team.findById(req.params.id)
    res.render('poll', { team1 , n:req.user})
})
app.post('/poll/:id',async(req,res)=>{
    const { question , options ,deadline} = req.body;
    const poll = new Poll({ question , options , deadline }); 
    await poll.save();
    const update = { team : req.params.id };
    
    const filter = { question : question };
    let doc = await Poll.findOneAndUpdate( filter ,update, {
    new: true
    });
    await doc.save()
    const te = await Poll.findOne({question : question}).populate('team')   
    const update1 = { polls : te._id };
    
    const filter1 = { _id:req.params.id };
    let d = await Team.findOneAndUpdate( filter1 ,{$push: {polls: te._id }}, {
        new: true
    });
    await d.save()
    const team1 = await Team.findById(req.params.id).populate('members').populate('polls')
    const poll1 = await Poll.find({team : team1._id}).populate('team')
    res.render('showteams' , { team1 , poll1 , n:req.user })
    //res.redirect('/displaypolls' , { team1 , te , d , poll1 , n:req.user })

})



app.get('/team/:id',async(req,res)=>{
    if(!req.isAuthenticated()){
        res.render('login')
    }
    else{
        const { id } = req.params;
        var s1 = id ;
        var s2 = s1.substring(1); 
        const team1 = await  Team.findById(s2).populate('members').populate('polls')
        const poll1 = await Poll.find({team : team1._id}).populate('team')
        res.render('showteams' , { team1 , n:req.user , poll1})
    }

})

app.get('/notifications' ,async(req ,res)=>{
    if(!req.isAuthenticated()){
        res.render('login')
    }
    else{
        const use = await User.find({});
        const t = await Team.find({}).populate('members').populate('invited')
       res.render('notification' ,{ use , t, n : req.user})
    }

})


app.get("/pollcal/:id",  async (req, res) => {
    const filter1 = { _id:req.params.id };
    //const up = {}
    let d = await Poll.findOneAndUpdate( filter1 ,{$push: {calAdd : req.user.username} }, {
        new: true
    });
    await d.save()
    console.log("got")
    const event = await Poll.findOne({ _id: req.params.id });
    
    if (!event) {
      req.flash("error_msg", "unable to find the requested event");
      if(req.user.type == "admin")
        {
            res.redirect('/dashboard1')
        }
        else{
            res.redirect('/dashboard')
        }
      //res.redirect("/dashboard");
      return;
    }
  
    let eventEndTime = new Date(event.deadline);
    eventEndTime.setHours(eventEndTime.getHours() -1);
  
    calendarEvent = {
      summary: "Poll",
      location: "",
      description: "Poll ends",
      start: {
        dateTime: eventEndTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: event.deadline,
        timeZone: "Asia/Kolkata",
      },
    };
  
    const authUrl = OAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    res.redirect(authUrl);
  });
  
  app.get("/google",  (req, res) => {
    OAuth2Client.getToken(req.query.code, async (err, token) => {
      if (err) {
        req.flash("error_msg", "Error retrieving access token");
        if(req.user.type == "admin")
        {
            res.redirect('/dashboard1')
        }
        else{
            res.redirect('/dashboard')
        }
      
        return console.error("Error retrieving access token", err);
      }
      OAuth2Client.setCredentials(token);
      await start(req, res);
    });
  });
  
  const calendar = google.calendar({
    version: "v3",
    auth: OAuth2Client,
  });
  
  //to create event
  function start(req, res) {
    calendar.events.insert(
      {
        auth: OAuth2Client,
        calendarId: "primary",
        resource: calendarEvent,
      },
      function (err, event) {
        if (err) {
          req.flash(
            "error_msg",
            "There was an error contacting the Calendar service"
          );
          if(req.user.type == "admin")
            {
                res.redirect('/dashboard1')
            }
            else{
                res.redirect('/dashboard')
            }
         
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return;
        }
        req.flash("success_msg", "event added to google calendar successfully");
        if(req.user.type == "admin")
        {
            res.redirect('/dashboard1')
        }
        else{
            res.redirect('/dashboard')
        }
        //res.redirect("/dashboard");
      }
    );
  }
 
app.listen(3000, () => {
    console.log('Listening on port 3000')
})



