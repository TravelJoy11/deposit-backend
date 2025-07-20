
const express = require("express");
const app = express();
const Stripe = require("stripe");
const cors = require("cors");

require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
app.use(cors());
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency, name, room } = req.body;

  console.log("Received request:");
  console.log("Amount:", amount);
  console.log("Currency:", currency);
  console.log("Name:", name);
  console.log("Room:", room);

  if (!amount || !currency || !name || !room) {
    console.log("❌ Missing required field(s)");
    return res.status(400).json({ error: "Missing required field(s)" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      capture_method: "manual",
      metadata: { name, room }
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.log("❌ Stripe error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Stripe backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
