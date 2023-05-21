const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.msnuvxp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("toysMaker");
    const toysCollection = db.collection("toys");

    const indexKeyes = { toyname: 1, category: 1 };
    const indexOptions = { name: "nameCategory" };
    const result = await toysCollection.createIndex(indexKeyes, indexOptions);

    app.get("/toysSearchBytitle/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection
        .find({
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { category: { $regex: searchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.get("/alltoys", async (req, res) => {
      const result = await toysCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/mytoys/:email", async (req, res) => {
      const email = req.params.email;
      const result = await toysCollection.find({ salleEmail: email }).toArray();
      res.send(result);
    });

    app.post("/add-toys", async (req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: body.title,
          rating: body.rating,
          category: body.category,
          sallerName: body.sallerName,
          price: body.price,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/toydelete/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };

      const result = await toysCollection.deleteOne(query);
      res.send(result)
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toys maker is running");
});

app.listen(port, () => {
  console.log(`Toys maker Server is running on port ${port}`);
});
