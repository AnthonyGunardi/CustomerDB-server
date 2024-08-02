function adminAuthorization (req, res, next) {
  const is_admin = req.user.is_admin
  if (is_admin == true) {
    next()
  } else {
    res.status(403).json({ message: "You are unauthorized to do this action!" })
  }
}

module.exports = adminAuthorization