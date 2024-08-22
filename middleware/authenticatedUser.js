const jwt = require("jsonwebtoken");

const authenticatedUser = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      res.status(401).send({
        message: "Authorization token is required",
      });
      return;
    }

    const strategyAndToken = req.headers.authorization.split(" ");
    // console.log(strategyAndToken);
    const strategy = strategyAndToken[0];
    const tokenItSelf = strategyAndToken[1];

    if (strategy !== "Bearer") {
      res.status(401).send({
        message: "Unauthorized",
      });
      return;
    }
    jwt.verify(tokenItSelf, process.env.AUTH_KEY, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.status(401).send({
            message: "Token has expired",
          });
          return;
        }
        res.status(401).send({
          message: "Unauthorized",
        });
        return;
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};

module.exports = authenticatedUser;
