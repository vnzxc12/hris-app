const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("Authorization Header:", authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT verify error:", err);
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log("Decoded JWT payload:", user);
    req.user = user;
    next();
  });
}


module.exports = authenticateToken; 
