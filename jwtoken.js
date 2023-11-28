const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
app.use(express.json());

app.get('/', (req,res)=> {
res.send("Hello, express")
});

mongoose.connect('mongodb+srv://schaffy:Admin321@cluster0.fki5qgo.mongodb.net',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> console.log('MongoDB Connected'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = mongoose.model('user', userSchema);

app.post('/register', async (req,res)=> {
    try{
        const {username, password} = req.body;
        
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).send({error: 'Username already exists'});
        }


        const hasedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hasedPassword
        });
        await user.save();

        res.status(500).send({error: 'Internal Server Error'});
    }catch (error){
        console.log("User not register",error);
        res.status(500).send({error: "Internal Server Error"})
    }
});
//user login
app.post('/login', async (req,res)=>{
    const {username, password} = req.body;
    try{
        const user = await User.findOne({username});
        if(!user){
            console.log('User not found while trying to login')
            return res.status(401).send({error: 'invaild username or password'});
        }
        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).send({error: "Invaild username or password"})
        }
        //create a JWT token
        const token = jwt.sign({userId: user._id},'yourJWTSecret',{expiresIn: "1h"});
        res.send({token});
        
    }catch (error){
        res.status(500).send({error: "Internal Server Error"});
    }
});

const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => console.log(`Server running on port ->  ${PORT}`));