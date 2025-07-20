require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: "https://deposit.travel-and-joy.com" }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency, name, room } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      capture_method: "manual",
      metadata: { name, room },
    });

    // Odeslání emailu na recepci
    await transporter.sendMail({
      from: `"Key Deposit" <${process.env.EMAIL_USER}>`,
      to: "tjoyhostel@gmail.com",
      subject: "Key deposit authorized",
      text: `A deposit was successfully authorized.\n\nName: ${name}\nRoom: ${room}\nAmount: €${amount / 100}\n\nTime: ${new Date().toLocaleString()}`,
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Stripe or Email error:", error.message);
    res.status(400).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});