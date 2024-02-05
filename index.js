const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4hda1bm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        const UserCollection = client.db("FutureMart").collection("Users");
        const Page1Collection = client.db("FutureMart").collection("Page1");
        const BookingCollection = client.db("FutureMart").collection("Bookings");


        // ***********User Related APis***********///

        // get admin

        app.get("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            console.log("admin check", email)


            const query = { email: email };
            const user = await UserCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === "admin"
            }
            res.send({ admin });
        })


        // users //
        app.get("/all-users", async (req, res) => {
            const result = await UserCollection.find().toArray();
            res.send(result);
        })
        // post User
        app.post(`/post-user`, async (req, res) => {
            const NewUser = req.body;
            console.log(NewUser);

            // Check google user

            const query = { email: NewUser.email }
            const existingUser = await UserCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: "User Already Exists", insertedId: null })
            }

            const result = await UserCollection.insertOne(NewUser);
            res.send(result);
        })

        // make admin
        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: "admin"
                }
            }
            const result = await UserCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Delete User
        app.delete(`/delete-user/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await UserCollection.deleteOne(query);
            res.send(result);
        })





        /****************************** End Of JWT ********************************************** */




        //  Product

        app.get("/page1-product", async (req, res) => {

            const result = await Page1Collection.find().toArray();
            res.send(result);
        })

        app.patch("/patch-product/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedProduct = req.body;
            console.log("form patch line", updatedProduct);

            const updatedDOC = {
                $set: {
                    Name: updatedProduct.Name,
                    YtLink: updatedProduct.YtLink,
                    ProductId: updatedProduct.ProductId,
                    img1: updatedProduct.img1,
                    img2: updatedProduct.img2,
                    img3: updatedProduct.img3,
                    img4: updatedProduct.img4,
                    PriceBDT: updatedProduct.PriceBDT,
                }
            };

            const result = await Page1Collection.updateOne(filter, updatedDOC);
            res.send(result);
        })

        // booking collection

        app.get("/page1-booking", async (req, res) => {

            const result = await BookingCollection.find().toArray();
            res.send(result);
        })

        app.post("/post-booking", async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await BookingCollection.insertOne(booking);
            res.send(result);
        })

        app.delete("/delete-bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await BookingCollection.deleteOne(query);
            res.send(result);
        })

        // get Banner
        app.get("/banner", async (req, res) => {
            const result = await Page1Collection.find().toArray();
            res.send(result);
        })
        // post banner
        app.post(`/post-banner`, async (req, res) => {
            const NewBanner = req.body;
            console.log(NewBanner);
            const result = await Page1Collection.insertOne(NewBanner);
            res.send(result);
        })





        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('FutureMart Server is Running')
})

app.listen(port, () => {
    console.log(`FutureMart Server is Running on port ${port}`);
})