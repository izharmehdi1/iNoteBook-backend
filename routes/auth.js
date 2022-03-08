const express = require('express')
const User = require('../models/User');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');


const JWT_SECRET = 'Izharisagoodboy';






//Route 1: create a User using POST "/api/auth/createuser" Doesn't require auth
router.post('/createuser', [
    body('name','Enter A valid Name').isLength({ min: 3 }),
    body('email','Enter A valid Email').isEmail(),
    body('password', 'Password Must Be Atleast 5 Characters').isLength({ min: 5 }),
], async (req, res)=>{
    //if there are error return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    
    try {
    //CHECK WHEATHER THE EMAIL EXIST ALREADY    
    let user = await User.findOne({email:req.body.email});
    if(user){
        returnres.status(400).json({error: "sorry a user with the same email already exist"})
    }

    const salt= await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);


    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password:secPass,
        // password: req.body.password,
    });

    const data={
        user:{
            id:user.id
        }
    }

    const authtoken = jwt.sign(data, JWT_SECRET);
    // console.log(jwtData);

    // res.json(user)
    res.json({authtoken})

    } catch (error) {
            console.error(error.message);
            re.status(500).send('Internel server error')
    }
})


//Route 2:   using POST "/api/auth/login" authenticate the login
router.post('/login', [
    body('email','Enter A valid Email').isEmail(),
    body('password', 'Password can not be blank').exists(),
], async (req, res)=>{
    //if there are error return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });

    }
    const {email,password}=req.body;
    try {
        let user= await  User.findOne({email});
        if(!user){
            return res.status(400).json({error: "Please try to login with corret credentials"});
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "Please try to login with corret credentials"});
        }
        const data={
            user:{
                id:user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken})
    } catch (error) {
        console.error(error.message);
        re.status(500).send('Internel server error')
}
})



module.exports  = router
