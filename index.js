const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(
    cors({
        origin: ['http://localhost:5173', 'https://asktask-ff69d.web.app'],
        credentials: true,
    }),
  );
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.umpxykt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const createAskTaskCollection = client.db('createAskTaskDB').collection('createTask');

        // createTask related apis
        app.get('/tasks', async (req, res) => {
            const cursor = createAskTaskCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/tasks', async (req, res) => {
            const taskItem = req.body;
            const result = await createAskTaskCollection.insertOne(taskItem);
            res.send(result);
        })
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await createAskTaskCollection.deleteOne(query);
            res.send(result);
        })
        app.patch('/tasks/:id/ongoing', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: 'ongoing'
                }
            }
            const result = await createAskTaskCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })
        app.patch('/tasks/:id/done', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: 'done'
                }
            }
            const result = await createAskTaskCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })
        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedTask = req.body;
            const task = {
              $set: {
                title: updatedTask.title,
                priority: updatedTask.priority,
                description: updatedTask.description,
                startDate: updatedTask.startDate
              }
            }
            const result = await createAskTaskCollection.updateOne(filter, task, options);
            res.send(result);
          })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('AskTask is running')
})
app.listen(port, () => {
    console.log(`AskTask is running on port: ${port}`);
})