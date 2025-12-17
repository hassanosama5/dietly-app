app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://dietly-app-production.up.railway.app', // Your backend itself
      'https://*.netlify.app' // Will allow ANY Netlify subdomain
    ];
    
    // Check if the request origin is in the allowed list
    if (allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || 
             (allowedOrigin.includes('*') && origin.endsWith(allowedOrigin.split('*')[1]));
    })) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));