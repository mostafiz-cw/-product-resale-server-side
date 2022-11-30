const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  // console.log("token inside verifyjwt ", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
    if(err){
      return res.status(403).send({message: "forbiddeen access"})
    }
    req.decoded = decoded;
    next();
  })
}

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gk5zoez.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const catagories = client.db("allcategories").collection("catagory");
    const cards = client.db("catagories").collection("allcard");
    const myOrder = client.db("myorder").collection("orders");
    const userCollection = client.db("userCollection").collection("users");

    // get user specific order list
    app.get("/myorder", verifyJWT, async (req, res) => {
      // console.log(req.query);
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if(email !== decodedEmail){
        return res.status(403).send({message: "forbiddeen access"});
      }
      // console.log(email);
      const query = { email: email };
      const myOrderGet = await myOrder.find(query).toArray();
      res.send(myOrderGet);
    });

    app.get("/", async (req, res) => {
      const query = {};
      const options = await catagories.find(query).toArray();
      res.send(options);
    });

    // jwt tokent
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    // get catagory based data
    app.get("/:id", async (req, res) => {
      const id = req.params.id;
      const query = { userId: id };
      const cursor = cards.find(query);
      const allcard = await cursor.toArray();
      res.send(allcard);
      // console.log(id);
    });

    //

    // post my order details
    app.post("/myorder", async (req, res) => {
      const myOrderObj = req.body;
      console.log(myOrderObj);
      const result = await myOrder.insertOne(myOrderObj);
      res.send(result);
    });

    // post user info details
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
  } catch {}
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log("server is running on " + port);
});
