require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

console.log("Loaded Stripe key:", process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency, name, room } = req.body;

  console.log("Received request:");
  console.log("Amount:", amount);
  console.log("Currency:", currency);
  console.log("Name:", name);
  console.log("Room:", room);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      capture_method: "manual",
      metadata: { name, room },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Stripe error:", error.message);
    res.status(400).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});