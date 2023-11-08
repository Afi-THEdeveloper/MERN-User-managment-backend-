const User = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    User.findOne({ email: email }).then((user) => {
      if (user && user.isAdmin) {
        bcrypt.compare(password, user.password, (err, decoded) => {
          if (decoded) {
            const token = jwt.sign({ email: user.email }, "afsalSecretKey", {
              expiresIn: "2d",
            });
            res.cookie("adminToken", token);
            return res.json({ success: "login successfull" });
          } else {
            return res.json({ error: "password is incorrect" });
          }
        });
      } else {
        return res.json({ error: "admin not exists" });
      }
    });
  } catch (error) {
    res.json(error);
  }
};

exports.checkAdminLogged = (req, res) => {
  res.json({ success: "you are logged user" });
};

exports.getUsers = async (req, res) => {
  try {
    await User.find({ isAdmin: false })
      .then((user) => res.json({ success: "ok", users: user }))
      .catch((err) => res.json({ error: "cannot fetch users from db" }));
  } catch (error) {
    res.json({ error: error });
  }
};

exports.updateUser = async (req, res) => {
  const { userid, name,email, mobile, verify } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      {email:email},
      {
        $set: {
          name,
          mobile,
          isVerified: verify,
        },
      },
      { new: true }
    );

    if (user) {
      return res.json({ success: "User updated successfully." });
    } else {
      return res.json({ error: "User not found or updation failed." });
    }
  } catch (error) {
    return res.json({ error: "Failed to update user."});
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.body;
  try {
    await User.findByIdAndDelete(id);
    const users = await User.find({ isAdmin: false });
    res.json({ success: "deleted user succesfully", users: users });
  } catch (error) {
    res.json({ error: error });
  }
};

exports.logoutAdmin = (req, res) => {
  const token = req.cookies.adminToken;
  if (token) {
    res.clearCookie("adminToken");
    return res.json({ success: "logout admin successfully" });
  } else {
    return res.json({ error: "no token found" });
  }
};
