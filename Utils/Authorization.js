const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const SECRET_KEY_TOKEN = fs.readFileSync(
    path.join(__dirname, "./PrivateKey.pem"),
    "utf8",
  );

const PUBLIC_KEY_TOKEN = fs.readFileSync(
  path.join(__dirname, "./PublicKey.pem"),
  "utf8",
);


const authenticationToken = async (data) => {
  console.log("Private_Key: ", SECRET_KEY_TOKEN);
  const result = jwt.sign(data, SECRET_KEY_TOKEN, {
    issuer: "voiid.com",
    subject: "voiid@gmail.com",
    audience: "https://www.voiid.com",
    // expiresIn: exp,
    algorithm: "RS256",
  });
  console.log("Token: ", result);
  return result;
};


const authorizationToken = async (req, res, next) => {
    console.log(req.headers)
    const cookie = req.headers.authorization;
    //remeber this
    // const cookie = req.headers.cookie;
    if (!cookie) {
      return res.status(403).send("Cookies not found!!");
    }
    let token = cookie.split(" ")[1];
    if (token) {
      const decodedToken = jwt.verify(token, PUBLIC_KEY_TOKEN, {
        issuer: "voiid.com",
        subject: "voiid@gmail.com",
        audience: "https://www.voiid.com",
        // expiresIn: exp,
        algorithm: "RS256",
      });
  
      console.log(decodedToken, "assas")
      req.user= decodedToken;
      
      next();
    } else {
      res.status(403).send("Login first to proceed!!");
    }
  };

  module.exports = {
    authenticationToken,
    authorizationToken,
  };