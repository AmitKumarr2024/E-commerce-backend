import jwt from 'jsonwebtoken';

const jwtAuth = (req, res, next) => {
  // Ensure the cookie-parser middleware is used in your app
  const token = req.cookies?.token; // Corrected to lowercase 'cookies'
  const id = req.params.id;

  console.log("JWT Token:", token);
  console.log("ID:", id);

  if (!process.env.SECRET_KEY) {
    return res.status(500).json({ error: 'Missing SECRET_KEY environment variable' });
  }

  if (!token) {
    console.log('No token found in cookies');
    return res.status(401).json({ message: 'Please Login First and try again' });
  }

  try {
    // Verify the JWT token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    // Set req.userId from decodedToken
    req.userId = decodedToken?._id;

    // Check if id is provided and matches the userId in the token
    if (id && id !== decodedToken._id) {
      return res.status(400).json({ msg: 'Access Denied' });
    }

    // Call next middleware
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid Token' });
    } else {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export default jwtAuth;
