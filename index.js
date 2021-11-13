const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// midleware
app.use(cors())
app.use(express.json())

// connection uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yw3x3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// run funtion
async function run() {
    try {
        await client.connect();
        console.log('connected to time keeper')
        const database = client.db("data");
        const productsCollection = database.collection("productsCollection");
        const orderCollection = database.collection("orders")

        // // POST API
        // app.post('/products', async (req, res) => {
        //     const service = req.body;
        //     const result = await productsCollection.insertOne(service);
        //     res.json(result)
        // })

        // GET all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const result = await cursor.toArray();
            console.log(result)
            res.send(result)
        });

        // // get single products
        // app.get('/products/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await productsCollection.findOne(query);
        //     res.json(result)
        // })


        // // book a new product
        // app.post('/addOrder', async (req, res) => {
        //     const order = req.body;
        //     const result = await orderCollection.insertOne(order);
        //     res.json(result)
        // })

        // // get my orders 
        // app.get('/myOrders/:email', async (req, res) => {
        //     const result = await orderCollection.find({ email: req.params.email }).toArray();
        //     res.send(result)
        // })

        // // get all orders in order management section
        // app.get('/allOrders', async (req, res) => {
        //     const result = await orderCollection.find({}).toArray();
        //     console.log('this is all order', result)
        //     res.send(result)
        // })

        // // update order status
        // app.put('/updateOrder/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updatedOrder = req.body;
        //     const filter = { _id: id };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             status: updatedOrder.status
        //         },
        //     };
        //     const result = await orderCollection.updateOne(filter, updateDoc, options)
        //     res.json(result)
        // })

        // // delete an order 
        // app.delete('/deleteProduct/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: id }
        //     const result = await orderCollection.deleteOne(query)
        //     res.json(result)
        // })

    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello time keeper')
})

app.listen(port, () => {
    console.log(`Time keeper new site, ${port}`)
})