const admin = require('../models/adminModel');
const People = require('../models/peopleModel');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');


const getSinglePeopleData = async (req, res) => {

  let admin_id, people_id;

  if (req.user.admin_id) {
    // If req.user.admin_id is not empty
    admin_id = req.user.admin_id;
    people_id = req.user._id;
  } else {
    // If req.user.admin_id is empty
    admin_id = req.user._id;
    people_id = null;
  }

  const peopleName = req.body.first_name;

  try {
    const sPeopleData = await People.find({
      admin_id: admin_id,
      first_name: peopleName
    });

    if (sPeopleData.length === 0) {
      res.status(200).json({ status: "Data Not Found" });
    } else {
      res.status(200).json({ data: sPeopleData });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
};


const updateAccess = async (req, res) => {

  let admin_id, people_id;

  if (req.user.admin_id) {
    // If req.user.admin_id is not empty
    admin_id = req.user.admin_id;
    people_id = req.user._id;
  } else {
    // If req.user.admin_id is empty
    admin_id = req.user._id;
    people_id = null;
  }

  const { access, email, securityRole } = req.body;

  try {
    const peopleAccess = await People.updateOne(
      {
        admin_id: admin_id,
        email: email,
      },
      {
        $set: { access: access, securityRole: securityRole },
      }
    );

    if (peopleAccess) {
      // nModified > 0 indicates that the document was updated
      await sendmail(email, admin_id);
      res.status(200).json({ status: 'Success', message: 'People Updated' });
    } else {
      res.status(500).json({ status: 'Error', message: 'Unable to Update' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const updatePeoplePassword = async (req, res) => {

  let admin_id, people_id;

  if (req.user.admin_id) {
    // If req.user.admin_id is not empty
    admin_id = req.user.admin_id;
    people_id = req.user._id;
  } else {
    // If req.user.admin_id is empty
    admin_id = req.user._id;
    people_id = null;
  }

  const { email, password } = req.body;

  let pass;

  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      pass = hash;
    } else {
      pass = null; // or remove this line if your schema allows for undefined/null values
    }

    const peopleAccess = await People.updateOne(
      {
        admin_id: admin_id,
        email: email,
      },
      {
        $set: { password: pass },
      }
    );

    if (peopleAccess) {
      // nModified > 0 indicates that the document was updated
      res.status(200).json({ status: 'Success', message: 'Password Updated' });
    } else {
      res.status(500).json({ status: 'Error', message: 'Unable to Update Password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteAccess = async (req, res) => {

  let admin_id, people_id;

  if (req.user.admin_id) {
    // If req.user.admin_id is not empty
    admin_id = req.user.admin_id;
    people_id = req.user._id;
  } else {
    // If req.user.admin_id is empty
    admin_id = req.user._id;
    people_id = null;
  }

  const { email, access } = req.body;

  try {
    const removeAccess = await People.updateOne(
      {
        admin_id: admin_id,
        email: email,
      },
      {
        $set: { access: access }
      }
    );
    if (removeAccess) {
      res.status(200).json({ status: 'Success', message: 'Access Removed' });
    } else {
      res.status(500).json({ status: 'Error', message: 'Unable to Remove Access' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}


const sendmail = async (email, admin_id) => {

  API_KEY =
    "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";
  sgMail.setApiKey(API_KEY);

  const encodeEmail = encodeURIComponent(email);
  const adminid = encodeURIComponent(admin_id);

  const message = {

    to: email,
    from: process.env.EMAIL,
    subject: 'Set Your Password',
    text: 'Set Your Password',
    html: `<h1>Set Your Password'</h1>
      <p>Set Your Password. By Using Below Link </p>
      <button style = "background-color: #216c98; width: 500px; height: 50px;"><a href="https://www.devqa.dealdox.io/setpassword?emailContent=${encodeEmail}&admin_id=${adminid}">SET YOUR PASSWORD</a></button> To Set Your Password!.`
  };

  sgMail.send(message)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.log(error);
    });
};


module.exports = { getSinglePeopleData, updateAccess, deleteAccess, updatePeoplePassword }
