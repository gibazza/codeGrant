
require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const session = require('express-session');
const axios = require('axios');
const qs = require('qs');

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
    identityMetadata : process.env.IDENTITY_METADATA,
    clientID: process.env.CLIENT_ID,
    responseType: process.env.RESPONSE_TYPE,
    responseMode: process.env.RESPONSE_MODE,
    redirectUrl: process.env.REDIRECT_URL,
    clientSecret: process.env.CLIENT_SECRET,
    scope: process.env.SCOPE.split(',')
};

// Configuration for different enterprise apps
const ApiConfig = {
    clientID: process.env.API_CLIENT_ID,
    clientSecret: process.env.API_CLIENT_SECRET,
    scope: process.env.API_SCOPE.split(',')
};

// Use the OIDCStrategy within Passport
passport.use(new OIDCStrategy(enterpriseAppConfig, (issuer, sub, profile, accessToken, refreshToken, done) => {
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
    const config = enterpriseAppConfig
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/', ...config })(req, res, next);
});

app.get('/auth/callback', passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }), (req, res) => {
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
        <p><strong>User Access Token:</strong> ${req.user.accessToken}</p>
        <p><strong>Refresh Token:</strong> ${req.user.refreshToken}</p>
        <button onclick="fetchUsers()">Fetch Users</button>
        <div id="users"></div>
        <script>
        async function fetchUsers() {
            const response = await fetch('/get-users');
            const data = await response.json();
            const usersDiv = document.getElementById('users');
            usersDiv.innerHTML = '<strong>API Access Token:</strong>' + data.accessToken;
            usersDiv.innerHTML += '<h1>Users in Entra Tenant</h1><ul>' + data.users.map(user => '<li>' + user.displayName + ' (' + user.mail + ')</li>').join('') + '</ul>';
        }
        </script>
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

// Route to fetch users using the access token from the session

app.get('/get-users', async (req, res) => {
  try {
    // Step 1: Fetch the OpenID Connect metadata
    const metadataResponse = await axios.get(process.env.IDENTITY_METADATA);
    const tokenEndpoint = metadataResponse.data.token_endpoint;

    // Step 2: Acquire token using client credentials flow
    const tokenResponse = await axios.post(
      tokenEndpoint,
      qs.stringify({
        client_id: ApiConfig.clientID,
        client_secret: ApiConfig.clientSecret,
        scope: ApiConfig.scope.join(' '),
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 3: Use the token to call Microsoft Graph
    const response = await axios.get('https://graph.microsoft.com/v1.0/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Step 4: Return users and access token
    res.json({
      accessToken,
      users: response.data.value
    });
  } catch (error) {
    console.error('Error getting users:', error.response?.data || error.message);
    res.status(500).send('Error getting users');
  }
});

const options = {
    key: fs.readFileSync(process.env.CERT_KEY_FILE),
    cert: fs.readFileSync(process.env.CERT_FILE),
    rejectUnauthorized: false // Add this line
};

https.createServer(options, app).listen(3002, () => {
    console.log('Server started on https://0.0.0.0:3002');
});
