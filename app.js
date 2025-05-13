require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const session = require('express-session');

const app = express();

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configuration for different enterprise apps
const enterpriseAppConfig = {
  app1: {
    identityMetadata: process.env.APP1_IDENTITY_METADATA,
    clientID: process.env.APP1_CLIENT_ID,
    responseType: process.env.APP1_RESPONSE_TYPE,
    responseMode: process.env.APP1_RESPONSE_MODE,
    redirectUrl: process.env.APP1_REDIRECT_URL,
    clientSecret: process.env.APP1_CLIENT_SECRET,
    scope: process.env.APP1_SCOPE.split(',')
  },
  app2: {
    identityMetadata: process.env.APP2_IDENTITY_METADATA,
    clientID: process.env.APP2_CLIENT_ID,
    responseType: process.env.APP2_RESPONSE_TYPE,
    responseMode: process.env.APP2_RESPONSE_MODE,
    redirectUrl: process.env.APP2_REDIRECT_URL,
    clientSecret: process.env.APP2_CLIENT_SECRET,
    scope: process.env.APP2_SCOPE.split(',')
  }
};

// Function to get the configuration based on the enterprise app
function getEnterpriseAppConfig(appName) {
  return enterpriseAppConfig[appName] || enterpriseAppConfig['app1'];
}

// Use the OIDCStrategy within Passport
passport.use(new OIDCStrategy(getEnterpriseAppConfig('app1'), (issuer, sub, profile, accessToken, refreshToken, done) => {
  // Store tokens and authorization code in the session
  profile.authorizationCode = sub;
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  return done(null, profile);
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Define routes

app.get('/', (req, res, next) => {
   const appName = req.query.app || 'app1'; // Determine the enterprise app from query parameter
   const config = getEnterpriseAppConfig(appName);
   console.log('Appname param value:', appName);
   passport.authenticate('azuread-openidconnect', { failureRedirect: '/', ...config })(req, res, next);
  });
  
  app.get('/auth/callback', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }), (req, res) => {
   const appInfo = req.session.appInfo; // Retrieve app information from session
   res.send(`
   <html>
   <body>
   <h1>Authentication Successful</h1>
   <p>Welcome, ${req.user.displayName}!</p>
   <p>Email: ${req.user._json.email}</p>
   <p>Profile:</p>
   <pre>${JSON.stringify(req.user, null, 2)}</pre>
   <h2>OAuth 2.0 Authorization Code Flow and Token Exchange</h2>
   <p><strong>Step 1:</strong> User is redirected to the authorization server's authorization endpoint.</p>
   <p><strong>Step 2:</strong> User authenticates and authorizes the client application.</p>
   <p><strong>Step 3:</strong> Authorization server redirects the user back to the client application with an authorization code.</p>
   <p><strong>Authorization Code:</strong> ${req.user.authorizationCode}</p>
   <p><strong>Step 4:</strong> Client application exchanges the authorization code for an access token and refresh token.</p>
   <p><strong>Access Token:</strong> ${req.user.accessToken}</p>
   <p><strong>Refresh Token:</strong> ${req.user.refreshToken}</p>
   <form action="/logout" method="post">
   <button type="submit">Logout</button>
   </form>
   </body>
   </html>
   `);
  });
  

app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      res.clearCookie('connect.sid');
      // Redirect to Entra logout endpoint
      res.redirect(`https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=https://localhost:3000/auth`);
    });
  });
});

const options = {
  key: fs.readFileSync(process.env.CERT_KEY_FILE),
  cert: fs.readFileSync(process.env.CERT_FILE),
  rejectUnauthorized: false // Add this line
};

https.createServer(options, app).listen(3000, () => {
  console.log('Server started on https://localhost:3000');
});
