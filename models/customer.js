const mongoose = require("mongoose");
const Joi = require("joi");

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    phone: { type: String, required: true },
    isGold: { type: Boolean, default: false },
  })
);

function validateCustomer(customer) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string().min(5).required(),
    isGold: Joi.boolean(),
  };

  return Joi.validate(customer, schema);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
