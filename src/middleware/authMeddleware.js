import jwt from 'jsonwebtoken';

const jwtAuth = (req, res, next) => {
  const token = req.Cookies?.token;
  const id = req.params.id;

  console.log("jwttoken",token);
  console.log("jwttoken",id);


  if (!process.env.SECRET_KEY) {
    return res.status(500).json({ error: 'Missing SECRET_KEY environment variable' });
  }

  if (!token) {
    console.log('No token found in cookies'); // Log missing token
    return res.status(200).json({ message: 'Please Login First and try again' });
  }

  try {
    // Verify the JWT token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    // Set req.userId from decodedToken
    req.userId = decodedToken?._id;

    // Check if id is provided and matches the userId in the token
    if (id && id !== decodedToken.userId) {
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
