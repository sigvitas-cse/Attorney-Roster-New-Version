const express = require("express");
const LoginModel = require("../models/Login");
const NewUsersLoginModel = require("../models/NewUsers");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const router = express.Router();


// Login Route
router.post("/check-login", async (req, res) => {
  console.log("Inside check-login route");

  const { userId, password, userType } = req.body;

  try {
    const user = await LoginModel.findOne({ userId, userType });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Check if the stored password is in plain text
    if (user.password === password) {
      return res.status(200).json({ message: "Login successful", user });
    }

    // 🔐 If the password is hashed, compare with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return res.status(200).json({ message: "Login successful", user });
    } else {
      console.log("Incorrect password");
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred", details: err });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'darshan@sigvitas.com',
    pass: 'nkpt ixhc gsgo yzyh', // App password generated for Gmail
  },
});

router.post('/save-employee-details', async (req, res) => {
  const { email } = req.body;
  console.log('Now, in save-employee-details section with email:', email);

  if (!email) {
    console.error("Error: Email is missing from request body.");
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Fetch employee details from NewUsersLoginModel
    const employee = await NewUsersLoginModel.findOne({ email });

    if (!employee) {
      console.warn(`Employee not found for email: ${email}`);
      return res.status(404).json({ message: "Employee not found" });
    }

    const { firstName, lastName, password, userId, userType } = employee;
    
    // Save employee data into LoginModel
    const newEmployee = new LoginModel({
      name: `${firstName} ${lastName}`,
      email,
      userId,
      userType,
      password,
    });

    await newEmployee.save();
    console.log(`Employee saved successfully: ${email}`);

    // Send email notification
    const mailOptions = {
      from: 'darshan@sigvitas.com',
      to: email,
      subject: 'Employee Account Created',
      text: `Hi ${firstName} ${lastName},\n\nYour account has been created successfully!\n\nThank You`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: "Employee saved, but email failed to send." });
      }

      console.log(`Email sent successfully to: ${email}`);
      return res.status(200).json({ message: "Employee details saved and email sent successfully.", user: newEmployee });
    });

  } catch (err) {
    console.error('Error processing request:', err);
    return res.status(500).json({ message: "An error occurred while processing the request." });
  }
});

router.post('/save-new-employee-details', async (req, res) => {
  const { firstName, lastName, email, contact, userType, password } = req.body;
  console.log('Now, in save-new-employee-details section');
  console.log('userType:', userType);
  
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new employee document
    const newEmployee = new NewUsersLoginModel({
      firstName,
      lastName,
      email,
      userId: email,
      contact,
      userType,
      password: hashPassword,
    });
    
    await newEmployee.save();

    // Save to MongoDB
    await newEmployee.save();

    const mailToUser = {
      from: 'darshan@sigvitas.com',
      to: email, // New user's email
      subject: 'Employee Account Created',
      text: `Hi ${firstName},\n\nYour account has been created successfully!\n\nYour userId is: ${email}\n\nYou will receive a confirmation email shortly.\n\nThank You.`,
    };

    transporter.sendMail(mailToUser, (error, info) => {
      if (error) {
        console.error('Error sending email to user:', error);
      } else {
        console.log('Email sent to user:', info.response);
      }
    });

    // Send email notification to Darshan
    const mailToAdmin = {
      from: 'darshan@sigvitas.com',
      to: 'darshan@sigvitas.com', // Darshan's email
      subject: 'New User Added',
      text: `A new user has been added to the database.\n\nDetails:\nName: ${firstName} ${lastName}\nEmail: ${email}\nContact: ${contact}\nUser Type: ${userType}`,
    };

    transporter.sendMail(mailToAdmin, (error, info) => {
      if (error) {
        console.error('Error sending email to Darshan:', error);
      } else {
        console.log('Email sent to Darshan:', info.response);
      }
    });
    // Send response to frontend
    // res.status(200).json({ message: 'Employee details saved and email sent successfully.' });
    res.status(200).json({
      message: 'Employee details saved and email sent successfully.',
      user: newEmployee, // Return the new employee object
    });
  } catch (err) {
    console.error('Error saving employee or sending email:', err);
    res.status(500).json({ message: 'An error occurred while saving the employee.' });
  }
});

module.exports = router;
