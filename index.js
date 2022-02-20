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

// stripe secret
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// run funtion
async function run() {
    try {
        await client.connect();
        console.log('connected to time keeper')
        const database = client.db("data");
        const productsCollection = database.collection("productsCollection");
        const orderCollection = database.collection("allOrders")
        const reviewsCollection = database.collection("userReviews")
        const usersCollection = database.collection("usersCollection")

        // POST API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result)
        })

        // GET all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({})
            const result = await cursor.toArray();
            res.send(result)
        });

        // load review from database (get api all review)
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const result = await cursor.toArray();
            res.json(result)
        });

        // add a review (Post api insert one)
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        })

        // post a user
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })

        // upsert user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // make admin(update user role)
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })

        // book a new product
        app.post('/addOrder', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })

        // update payment status
        app.put('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: id }
            const updateDocs = {
                $set: {
                    payment: payment
                }
            }
            const result = await orderCollection.updateOne(filter, updateDocs)
            res.json(result)
        })

        // get my orders 
        app.get('/myOrders/:email', async (req, res) => {
            const result = await orderCollection.find({ email: req.params.email }).toArray();
            res.json(result)
        })

        // get order for payment
        app.get('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
            console.log(query)
            const result = await orderCollection.findOne(query);
            console.log(result)
            res.json(result)
        })

        // get an user data 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            console.log(query)
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // delete an order 
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
            const result = await orderCollection.deleteOne(query)
            res.json(result)
        })

        // cancelOrder
        app.delete('/cancelOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
            const result = await orderCollection.deleteOne(query)
            res.json(result)
        })


        // get all orders in order management section
        app.get('/allOrders', async (req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.send(result)
        })

        // update order status
        app.put('/updateOrder/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: id };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // stripe payment integation
        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            console.log(paymentInfo)
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            res.json({
                clientSecret: paymentIntent.client_secret,
            });
        })
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