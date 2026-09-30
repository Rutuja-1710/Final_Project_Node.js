// Role-based authorization. Use after auth:
//   router.patch('/x', auth, authorizeRoles('supervisor'), handler)
module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Requires role: ${roles.join(' or ')}` });
  }
  next();
};
