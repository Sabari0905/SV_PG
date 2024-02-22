const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
 
 
const Schema = mongoose.Schema
 
 
const admin = new Schema({
 
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  password: {
    type: String,
  },
  company: {
    type: String,
  },
  job_title: {
    type: String,
  },
  email: {
    type: String,
  },
  no_of_emp: {
    type: String,
  },
  phone_num: {
    type: String,
  },
  country: {
    type: String,
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  modified_at: {
    type: Date,
    default: new Date(),
  },
  status: {
    type: String,
    default: "UnApproved"
  }
});
 
module.exports = mongoose.model('dd_admin', admin)