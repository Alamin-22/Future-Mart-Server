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
        // users //
        app.get("/all-users",  async (req, res) => {
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




        //  bookings

        app.get("/all-bookings",  async (req, res) => {
            console.log(req.query.email);
            // console.log("tu tu token", req.cookies.Token);
            console.log("Valid User Information:", req.user)

            if (req.query.email !== req.user.email) {
                return res.status(403).send({ message: "Forbidden Access" })
            }

            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await BookingCollection.find(query).toArray();
            res.send(result);
        })

        app.patch("/patch-bookings/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            console.log(updatedBooking);

            const updatedDOC = {
                $set: {
                    status: updatedBooking.status,
                }
            };

            const result = await BookingCollection.updateOne(filter, updatedDOC);
            res.send(result);


        })

        app.post("/post-bookings", async (req, res) => {
            const booking = req.body;
            // console.log(booking);
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
        // post banner
        app.patch("/patch-banner/:id", async (req, res) => {
            const isActive = req.body.isActive;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    isActive: isActive,
                }
            }
            // console.log("lineno-63",isActive, filter, updatedDoc)
            const result = await Page1Collection.updateOne(filter, updatedDoc)
            res.send(result);
        })
        // Delete Banner
        app.delete(`/delete-banner/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await Page1Collection.deleteOne(query);
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