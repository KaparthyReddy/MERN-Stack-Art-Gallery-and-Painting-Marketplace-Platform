import express from "express";
import userModel from "../models/userModel.js";
import { getToken } from "../utils.js";
import { isAuth } from "../utils.js";

const router = express.Router();

// Signin route: Authenticate user and generate a token
router.post("/signin", async (req, res) => {
  console.log("User POST /signin");

  const signinUser = await userModel.findOne({
    email: req.body.email,
  });
  if (signinUser) {
    if (signinUser.password === req.body.password) {  // Simple password comparison
      res.send({
        _id: signinUser.id,
        name: signinUser.name,
        email: signinUser.email,
        isAdmin: signinUser.isAdmin,
        token: getToken(signinUser),
      });
      return;
    }
  }
  res.status(401).send({ msg: "Invalid Email or Password." });
});

// Register route: Create a new user (no admin access by default)
router.post("/register", async (req, res) => {
  console.log("User POST /register");
  try {
    // Set isAdmin to false by default for all new users (no admin access)
    const user = new userModel({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,  // Store password directly (not hashed)
      isAdmin: false,  // Make the user a regular user (no admin access)
    });

    const newUser = await user.save();
    if (newUser) {
      res.send({
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        token: getToken(newUser),
      });
    } else {
      res.status(401).send({ msg: "Invalid User Data." });
    }
  } catch (error) {
    res.status(401).send({ msg: error.message });
  }
});

// Create admin route: Pre-create an admin user (hardcoded example)
router.get("/createadmin", async (req, res) => {
  console.log("User GET /createadmin");
  try {
    const user = new userModel({
      name: "dhanusha",
      email: "dhanusha@gmail.com",
      password: "1234",  // Store password directly (not hashed)
      isAdmin: true,  // Make this specific user an admin
    });

    const newUser = await user.save();
    res.send(newUser);
  } catch (error) {
    res.send({ msg: error.message });
  }
});

// Get user by ID route
router.get("/:id", async (req, res) => {
  console.log("User GET /:id");
  console.log("req.params.id", req.params.id);
  const user = await userModel.findById(req.params.id);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ msg: "User Not Found" });
  }
});

// Update user profile route: Allow logged-in users to update their profile
router.put("/profile", isAuth, async (req, res) => {
  console.log("User PUT /profile");
  const user = await userModel.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;  // Store new password directly (not hashed)
    }
    const updatedUser = await user.save();
    res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: getToken(updatedUser),
    });
  } else {
    res.status(404).send({ msg: "User Not Found" });
  }
});

export default router;
