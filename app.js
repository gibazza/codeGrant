require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const session = require('express-session');

const scope = process.env.APP1_SCOPE.split(',');
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

// Use the OIDCStrategy within Passport
passport.use(new OIDCStrategy({
  identityMetadata: process.env.APP1_IDENTITY_METADATA,
  clientID: process.env.APP1_CLIENT_ID,
  responseType: process.env.APP1_RESPONSE_TYPE,
  responseMode: process.env.APP1_RESPONSE_MODE,
  redirectUrl: process.env.APP1_REDIRECT_URL,
  clientSecret: process.env.APP1_CLIENT_SECRET,
  scope: scope,
}, (issuer, sub, profile, accessToken, refreshToken, done) => {
  return done(null, profile);
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.get('/auth', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

app.get('/auth/callback', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }), (req, res) => {
  // Render user information with pretty JSON and a logout button
  res.send(`
    <html>
    <body>
      <h1>Authentication Successful</h1>
      <p>Welcome, ${req.user.displayName}!</p>
      <p>Email: ${req.user._json.email}</p>
      <p>Profile:</p>
      <pre>${JSON.stringify(req.user, null, 2)}</pre>
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
