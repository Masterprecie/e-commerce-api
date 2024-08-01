const jwt = require("jsonwebtoken");

const authenticatedUser = (req, res, next) => {
  //   console.log(req.headers);
  try {
    const strategyAndToken = req.headers.authorization.split(" ");
    console.log(strategyAndToken);
    const strategy = strategyAndToken[0];
    const tokenItSelf = strategyAndToken[1];

    if (strategy == "Bearer") {
      const user = jwt.verify(tokenItSelf, process.env.AUTH_KEY);

      req.user = user;
      // console.log(user);
      if (user) {
        next();
      } else {
        res.status(403).send({
          message: "User details is empty for the token provided",
        });
      }
    } else {
      res.status(401).send({
        message: "Unauthorized",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      message: "Authorization token is required",
    });
  }
};

module.exports = authenticatedUser;
