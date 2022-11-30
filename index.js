const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

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

    app.get("/", async (req, res) => {
      const query = {};
      const options = await catagories.find(query).toArray();
      res.send(options);
    });

    // get catagory based data
    app.get("/:id", async (req, res) => {
      const id = req.params.id;
      const query = { userId: id };
      const cursor = cards.find(query);
      const allcard = await cursor.toArray();
      res.send(allcard);
      console.log(id);
    });

    // post my order details
    app.post("/myorder", async (req, res) => {
      const myOrderObj = req.body;
      const result = await myOrder.insertOne(myOrderObj);
      res.send(result);
    });

    // get my order details
    app.get("/myorder", async (req,res) => {
      const email = req.query.email;
      const query = {email : email};
      const myOrderGet = await myOrder.find(query).toArray();
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log("server is running on " + port);
});
