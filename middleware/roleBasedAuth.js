const rolesAllowed = (roles) => {
  //   console.log(roles);
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res
        .status(403)
        .send({ message: "You are not authorized to view this routes" });
    }
  };
};

module.exports = rolesAllowed;
