const User = require('../models/User');
const { comparePassword } = require('../middleware/bcrypt');
const { hashPassword } = require('../middleware/bcrypt');
const { generateToken, verifyToken } = require("../middleware/jwt");
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const dotenv = require("dotenv");

dotenv.config();

// ---------------------------------------------------------------------------------------------------------------------------------------
const signIn = async (req, res) => {
  console.log("entered signin POST form read");
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    
    if (user) {
      const isMatch = await comparePassword(password, user.pass);
      if (isMatch) {
        const token = generateToken(user._id.toString());
        res.cookie("id", token, {
            httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
              maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
          });
        
        res.json({ success: true, email: user.email });
      } 
      else {
        res.json({ success: false, message: 'Invalid password' });
      }
    } else {
      res.json({ success: false, message: "Can't find email" });
    }
  } catch (err) {
    console.error('Error during signin:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------
const logout = async (req, res) => {
  console.log("logout encountered");
  res.clearCookie("id", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
};

// ---------------------------------------------------------------------------------------------------------------------------------------
const user_exists = async (req, res) => {
  console.log("inside userExists route");
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      console.log("user exists");
      return res.status(400).json({ message: 'Email is already registered.' });
    }
    console.log("user not registered");
    return res.status(200).json({message:'continue'});
  }
  catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send('Internal Server Error');
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------
const generate_otp = async (req, res) => {
  console.log("inside generateotp route");
  const { email, text } = req.body;
  console.log("email is "+email);
  console.log("text is "+text);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.user,
      pass: process.env.pass, 
    },
  });

  function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  }

  const otp = generateOTP();
  
  console.log("otp is:" + otp);
  const otp_token = generateToken(otp);
  res.cookie("otp", otp_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 604800000
  });

  const mailOptions = {
    from: '"Kriya" <verify.kriya@gmail.com>',
    to: email,
    subject: 'OTP verification!',
    text: otp +"  "+text+"\n Do not share with any body",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("not success");
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    console.log("success");
    return res.status(200).json({ message: 'OTP sent successfully' });
  });
};

// ---------------------------------------------------------------------------------------------------------------------------------------
const verify_otp = (req,res) => {
  const otpval = req.body.otp;
  console.log('recieved otp is '+otpval);
  const otp_json = verifyToken(req.cookies.otp);
  console.log("cookies accept");
  console.log(otp_json.userId);
  if (!otp_json) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
  console.log(otp_json.userId);
  if(otp_json.userId == otpval){
    console.log("otp is correct");
    res.status(200).json({message : 'otp is correct'});
  }
  else {
    console.log("otp is not correct");
    res.status(400).json({message : 'The provided OTP is incorrect. Please try again.'});
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------
const signUp = async (req, res) => {
  console.log("in signup POST read");
  const { email, password } = req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ email: email, pass: hashedPassword });
    
    await newUser.save();
    const token = generateToken(user._id.toString());

    // Set db token cookie
    res.cookie("id", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });
    
    res.json({ email: newUser.email, message: 'Registration successful, please login' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send('Internal Server Error');
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------
const reset_password = async (req,res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({email});
    const hashedPassword = await hashPassword(password);
    user.pass = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).send('Internal Server Error');
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------
const is_Authenticated = async (req, res) => {
  console.log("inside isAuthenticated route");
  const token = req.cookies.id;
  
  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded) {
      res.json({ authenticated: true, userId: decoded.userId });
    } else {
      res.json({ authenticated: false });
    }
  } catch (err) {
    console.error('Error verifying token:', err);
    res.json({ authenticated: false });
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const google_signin = async (req, res) => {
  console.log("inside google signin");
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name, picture } = payload;
    let user = await User.findOne({ email });

    let hasPassword = false;

    if (!user) {
      // If user doesn't exist, create a new user record (excluding password)
      user = new User({ email });
      await user.save();
    } else {
      hasPassword = !!user.pass; // Check if password exists (not null/undefined/empty)
    }

    const token = generateToken(user._id.toString());

    // Set db token cookie
    res.cookie("id", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    });

    return res.status(200).json({
      success: true,
      token: credential,
      user: {
        _id: googleId,
        email,
        name,
        picture,
        pass: hasPassword,
      },
      message: "Google sign-in successful",
    });

  } catch (error) {
    console.error("Google authentication error:", error);
    return res.status(500).json({ success: false, message: "Server error during authentication" });
  }
};


module.exports = {
  signIn,
  signUp,
  logout,
  user_exists,
  generate_otp,
  verify_otp,
  reset_password,
  is_Authenticated,
  google_signin
}; 