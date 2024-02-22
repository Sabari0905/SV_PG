const Admin = require("../models/adminModel");
const UnApprovedUsers = require("../models/UnApprovedUsersModel");
const People = require("../models/peopleModel");
const config = require("../config/db.config.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const DB = require("../adaptor/createDB.js");
const sgMail = require("@sendgrid/mail");

const createToken = (_id) => {

  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });

}

// signup a user
const signupUser = async (req, res) => {
  const adminEmail = req.body.email;
  console.log("AdminEmail : " + adminEmail);
  console.log("body : ", req.body);
  const {
    firstname,
    lastname,
    password,
    company,
    job_title,
    email,
    no_of_emp,
    phone_num,
    country,
  } = req.body;
  // check company is exists
  //  {$or: [ {company: {$in: company.split(" ")}},{email: email} ]}
  //  console.log("req.body-->>",req.body,JSON.stringify(   {$or: [ {company: { $regex: "\\b(^|\\s|[^\\W])"+company+"(\\s|[^\\W]|$)\\b"}},{email: email} ]} ));
  let companyText = company.split(" ")[0];
  let emailTextDot = email.split("@")[1];
  let emailText = null;
  if (emailTextDot) {
    emailText = emailTextDot.split(".")[0];
  }
  console.log("split-->>", companyText, emailText);
  const userCompany = await UnApprovedUsers.findOne({ $text: { $search: companyText +" "+emailText  } });
  const useremail = await UnApprovedUsers.findOne({ email: email });
  // if(config.PUBLIC_DOMAIN.some(check => (check == emailText?.toLowerCase()))){
    if(Array.isArray(config.PUBLIC_DOMAIN) && config.PUBLIC_DOMAIN.some(check => (check == emailText?.toLowerCase()))){
  //  if(emailText?.toLowerCase() == "gmail" ||  emailText?.toLowerCase() == "yahoo"){
    res.status(400).json({
      status: "Failed",
      message: "Please registered with bussiness email ID",
    });
  } else if (userCompany == null && useremail == null ) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      // create a token
      const verifyToken = await createToken(company);
      const adminData = await UnApprovedUsers.create({
        firstname,
        lastname,
        password: hash,
        company,
        job_title,
        email,
        no_of_emp,
        phone_num,
        country,
        verifyToken,
      });

      // send email
      await sendApprovalmail(email, verifyToken, company);

      if (adminData) {
        // await sendmail(adminEmail);
        res
          .status(201)
          .json({ status: "Success", message: "Successfully Registered!" });
      } else {
        res
          .status(400)
          .json({ status: "Failed", message: "Failed to Register!" });
      }
    } catch (error) {
      console.log("error-->", error);
      res.status(400).json({ status: "Failed", message: error.message });
    }
  } else  {
    res.status(400).json({
      status: "Failed",
      message: "Company/email already registered Please check.",
    });
  }
};

//Approve/verify the company
const companyApproval = async (req, res) => {
  console.log("-->>companyApproval",req.params);
  const token = req.params.token;
  
  try {
    if (token) {
      const approveText = req.params.token.split(":")[1] == 1?"Approved":"Rejected";
      const approveToken = req.params.token.split(":")[0];
      const admin = await UnApprovedUsers.findOne({ verifyToken: approveToken });
      if (admin) {
        const updateAccount = await UnApprovedUsers.updateOne(
          {
            verifyToken: approveToken,
          },
          {
            $set: {
              status: approveText,
            },
          }
          );
          console.log("updateAccount-->>",updateAccount);
        

        if (updateAccount?.acknowledged) {
          console.log("updateAccount?.acknowledged-->>",admin,approveText);
          if(approveText == "Approved"){
            const {
              firstname,
              lastname,
              password,
              company,
              job_title,
              email,
              no_of_emp,
              phone_num,
              country } = admin;
            const adminApprovedUserData = await Admin.create({
              firstname,
              lastname,
              password: password,
              company,
              job_title,
              email,
              no_of_emp,
              phone_num,
              country,
              verifyToken: req.params.token.split(":")[0],
              status: approveText
            });
            if(no_of_emp == "Less Than 1000 Employees" || no_of_emp == "Less Than 10000 Employees"){

              const DBCreation = await DB.createDB(company);
            }
            // console.log("adminApprovedUserData-->>",adminApprovedUserData,DBCreation);
            if(adminApprovedUserData){
              res.status(200).json({
                status: "Success",
                message: "Account Approved and Updated",
              });
            }
          } else {
            res.status(200).json({
              status: "Success",
              message: "Account Rejected and Updated",
            });
          }
          
        } else {
          res.status(500).json({ status: "Error", message: "Account" });
        }
      } else {
        res.status(500).json({ status: "Error", message: "Account Not Found" });
      }
    } else {
      res.status(500).json({ status: "Error", message: "Invalid Token" })
    }
  } catch (error) {}
};


//login for user and people
const loginUser = async (req, res) => {
  console.log("re-->>>",req.subdomains);
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res
        .status(200)
        .json({ status: "Failed", message: "All Fields must be filled!" });
      return; // Make sure to return after sending the response to avoid further execution
    }

    const unApprovedUser = await UnApprovedUsers.findOne({ email: email });
    const peopleUser = await People.aggregate([{ $match: { email: email, access: 'granted'} },
      {
        $lookup: {
          from: "dd_admins",
          localField: "admin_id",
          foreignField: "_id",
          as: "admin_status"
        }
      },
      { $unwind: "$admin_status"}
    ]);
    
    // {access: 'granted'}
    console.log(peopleUser[0]?.admin_status.status);
    if(unApprovedUser?.status == 'Approved' || peopleUser[0]?.admin_status.status == 'Approved' ) {
      const admin = await Admin.findOne({ email: email });

      if (!admin) {
        if (!peopleUser[0]) {
          res.status(200).json({ status: "Failed", message: "Incorrect email" });
          return; // Make sure to return after sending the response
        } else {
          const match = await bcrypt.compare(password, peopleUser[0].password);
          if (!match) {
            res
              .status(200)
              .json({ status: "Failed", message: "Incorrect Password" });
          }  else {
            // create a token
            const token = createToken(peopleUser[0]._id);
  
            res.status(200).json({
              status: "Success",
              message: "Successfully Loggedin!",
              email,
              token,
              people : peopleUser[0],
            });
          }
        }
      } 
      if (admin) {
        const match = await bcrypt.compare(password, admin.password);
  
        if (!match) {
          res
            .status(200)
            .json({ status: "Failed", message: "Incorrect Password" });
        } else {
          // create a token
          const token = createToken(admin._id);
          console.log("created a token", token);
          res.status(200).json({
            status: "Success",
            message: "Successfully Loggedin!",
            email,
            token,
            admin,
          });
        }
      }
    } else {
      res.status(200).json({status: "Failed", message: "Email is not approved. or Please Check your Access"});
    }

    
  } catch (error) {
    console.log(error);
    res
      .status(200)
      .json({ status: "Failed", message: "Please try after sometime! " });
  }
};



//API to Scan Authenticator APP
const generatedSecrets = {}; // Store generated secrets for users
const generateQrcode = async (req, res) => {
  const userId = req.query.userId; // You need to pass the user's unique identifier here
  console.log(userId);
  if (!generatedSecrets[userId]) {
    generatedSecrets[userId] = speakeasy.generateSecret({
      name: 'DEALDOX',
    });
  }

  const secret = generatedSecrets[userId];
  qrcode.toDataURL(secret.otpauth_url, function (error, data) {
    res.json({ data, secret });
  });
};

//API to verify the OTP
const validate = async (req, res) => {
  const userId = req.query.userId;
  const { otp, secret } = req.body;
  console.log(req.body);
  var verified = speakeasy.totp.verify({
    secret: secret,
    encoding: 'ascii',
    token: otp
  });

  console.log(verified);
  if (verified) {
    res.json({ message: 'OTP validated successfully and secret updated' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }

};
// forgot Password
const forgotPassword = async (req, res) => {

  const { email } = req.body;
  console.log(email);
  try {
    const forgot = await Admin.findOne({
      email: email,
    });
    if (forgot) {
      await sendmail(email);
      res.status(200).json({ status: "success", message: "mail Sent", email });
    } else {
      res.status(400).json({ status: "Failed", message: "failed" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const passwordreset = async (req, res) => {
  const { email, password } = req.body;
  console.log("email-----", email);
  console.log("password------------", password);

  try {
    if (!email || !password) {
      res.status(400).json({ status: "Failed", message: "All fields must be filled!" });
      return;
    }

    const admin = await Admin.findOne({ email: email });

    if (admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Update the password in the database
      await Admin.findOneAndUpdate({ email: email }, { $set: { password: hash} });
      res.status(200).json({ status: "Success", message: "Password updated successfully." });
    } else {
      res.status(404).json({ status: "Failed", message: "Admin not found." });
    }
  } catch (error) {
    console.error("Error in passwordreset:", error);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};


const sendApprovalmail = async (email, verifyToken, company) => {
  API_KEY =
  "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";

sgMail.setApiKey(API_KEY);
  const message = {
    to: process.env.APPROVER_MAIL,
    from: "info@dealdox.io",
    subject: `Approval Confirm for ${company}`,
    text: "Welcome To DealDox",
    html: `<h1>Welcome to DealDox</h1>
    <p>Your DealDox account is ready. Use the link below to Approve/Reject.</p>
    <a href="${process.env.PROTOCOL}://${process.env.HOST}/api/admin/companyApproval/${verifyToken}:1" style = "text-decoration: none;"><button style = "background-color: #216c98; width: 200px; height: 50px;color: white;cursor: pointer !important;">Approve</button></a>
    <a href="${process.env.PROTOCOL}://${process.env.HOST}/api/admin/companyApproval/${verifyToken}:0" style = "text-decoration: none;"><button style = "background-color: #216c98; width: 200px; height: 50px;color: white;cursor: pointer !important;">Rejected</button> </a> <br> ${company} Account!.`,
  };

  await sgMail
    .send(message)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.log(error);
    });
};




const sendmail = async (email) => {

  API_KEY =
  "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";
  sgMail.setApiKey(API_KEY);

  const encodedEmail = encodeURIComponent(email);

  const message = {

    to: email,
    from: process.env.EMAIL,
    subject: 'Registration Confirm Page',
    text: 'Welcome To DealDox',
    html: `<h1>Welcome to DealDox</h1>
    <p>Your DealDox account is ready. Use the link below to log in.</p>
    <button style = "background-color: #216c98; width: 500px; height: 50px;"><a href="https://www.devqa.dealdox.io/resetpassword?email=${encodedEmail}" style = "text-decoration: none;">Reset Password</a></button> <br> to Verify Your Account!.`
};

sgMail.send(message)
.then(() => {
  console.log('Email sent');
})
.catch((error) => {
  console.log(error);
});
};

module.exports = {  signupUser,
  loginUser,
  generateQrcode,
  validate,
  companyApproval,
  forgotPassword,
  passwordreset}
