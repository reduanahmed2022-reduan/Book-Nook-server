const verifySession = async (req, res, next) => {
  try {
    const cookie = req.headers.cookie;

    if (!cookie) {
      return res.status(401).json({
        message: 'Please login first.',
      });
    }

    const response = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/auth/get-session`,
      {
        method: 'GET',
        headers: {
          cookie,
        },
      }
    );

    if (!response.ok) {
      return res.status(401).json({
        message: 'Invalid session. Please login again.',
      });
    }

    const data = await response.json();

    if (!data?.user) {
      return res.status(401).json({
        message: 'Unauthorized user.',
      });
    }

    req.user = data.user;

    next();
  } catch (error) {
    console.error('Session verification error:', error);

    res.status(500).json({
      message: 'Session verification failed.',
    });
  }
};

export default verifySession;