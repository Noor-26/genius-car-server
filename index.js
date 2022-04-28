const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt =require('jsonwebtoken');
const app = express()

app.use(cors())
app.use(express.json())

function verifyCode(req,res,next){
  const authCode = req.headers.authorization;
  if(!authCode){
    return res.status(401).send({message:'who the hell are you'})
  }
  const token = authCode.split(' ')[1]
  jwt.verify(token,process.env.ACCESS_TOKEN,(err,decoded) => {
    if(err){
      return res.status(403).send({message : "go to your home"})
    }
    console.log("decoded message" , decoded);
    req.decoded = decoded
    next()
  })
}



const uri = `mongodb+srv://noor-26:${process.env.DB_PASS}@cluster0.tq1da.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
  try{
    await client.connect();

    const serviceCollection = client.db('Genius-car').collection('services');
    const orderCollection = client.db('Genius-car').collection('order');

    app.get('/service',async (req,res) =>{
      const query = {}
      const cursor = serviceCollection.find(query) 
      const services = await cursor.toArray()
      res.send(services)
    })
    app.get('/order',verifyCode,async (req,res) =>{
      const email = req.query.email;
      const decoded = req.decoded.email
      if(email === decoded){
        
      const query = {email:email}
      const cursor = orderCollection.find(query) 
      const services = await cursor.toArray()
      res.send(services)
      }
      else{
        res.status(403).send({message : 'just go home dude'})
      }
    })

    app.get('/service/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id:ObjectId(id)}
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })

    app.post('/login',async (req,res) =>{
      const user = req.body;
      const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN , {expiresIn:'1d'})
      res.send(accessToken)
    })


    app.post('/order',async (req,res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order)
      console.log(order)
      res.send(result)
    })

  }
  finally{

  }

}


run()

app.get('/',(req,res) => {
    res.send('Success the surver is running')
})

app.listen(port,() => {
    console.log('Connections to the port done'); 
})

