"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { stock, customers } = require("./data/promo");
express()
  .use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  })
  .use(morgan("tiny"))
  .use(express.static("public"))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .set("view engine", "ejs")

  // endpoints
  .post("/order", (req, res) => {
    const email = customers.find((customer) => {
      if (
        customer.email === req.body.email ||
        customer.givenName === req.body.givenName ||
        customer.address === req.body.address
      ) {
        return customer;
      }
    });
    if (email) {
      return res.json({ status: "error", error: "repeat-customer" });
    }

    if (req.body.country !== "Canada") {
      return res.json({ status: "error", error: "undeliverable" });
    }
    if (
      req.body.order === "undefined" ||
      (req.body.order === "shirt" && req.body.size === "undefined")
    ) {
      return res.json({ status: "error", error: "missing-data" });
    }
    const orderItem = stock[req.body.order];
    const shirts = orderItem[req.body.size];
    if (orderItem === "0" || shirts === "0") {
      return res.json({ status: "error", error: "unavailable" });
    }

    return res.json({ status: "success" });
  })

  .get("*", (req, res) => res.send("Dang. 404."))
  .listen(8000, () => console.log(`Listening on port 8000`));
