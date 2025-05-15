# OAuth2 Authentication Application

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Download and install from the [official Node.js website](https://nodejs.org/).
- Alternatively, install Node.js using Windows Package Manager:
    ```bash
    winget install OpenJS.NodeJS
    ```
- **npm**: Node.js comes with npm (Node Package Manager).
- **OpenSSL**: Required to generate self-signed certificates. [Download OpenSSL for Windows](https://slproweb.com/products/Win32OpenSSL.html) or install via package manager.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```plaintext
IDENTITY_METADATA=<your-identity-metadata-url>
CLIENT_ID=<your-client-id>
REDIRECT_URL=https://localhost:3002/auth/callback
RESPONSE_TYPE=code
RESPONSE_MODE=query
CLIENT_SECRET=<your-client-secret>
SCOPE=openid,profile,email,offline_access
CERT_KEY_FILE=./certs/server.key
CERT_FILE=./certs/server.cert
API_CLIENT_ID=<your-api-client-id>
API_CLIENT_SECRET=<your-api-client-secret>
API_SCOPE=https://graph.microsoft.com/.default
```

- Replace the placeholder values with your actual configuration.
- Ensure your certificate files are correctly placed and the paths are specified in the `.env` file.

## Creating Self-Signed Certificates

To run the application over HTTPS locally, you need self-signed certificates.  
Follow these steps to generate them using OpenSSL:

1. Open a terminal and navigate to your project directory.
2. Run the following command to create a new private key and certificate:

    ```bash
    mkdir certs
    openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.cert -days 365 -nodes -subj "/CN=localhost"
    ```

    - This will create `server.key` (private key) and `server.cert` (certificate) in the `certs` directory.
    - The `-subj "/CN=localhost"` part sets the certificate common name to `localhost` for local development.

3. **Do not commit your private key or certificate to source control.**  
   The `.gitignore` is already set up to exclude the `certs/` directory.

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

## Running the Application

1. Start the server:
    ```bash
    node app.js
    ```

2. Open your browser and navigate to:
    ```
    https://localhost:3002
    ```

## Usage

- **Authentication**: Go to `/` to start the authentication process.
- **Callback**: After successful authentication, you will be redirected to `/auth/callback` where user information will be displayed.
- **Fetch Users**: On the callback page, click "Fetch Users" to retrieve users from Microsoft Graph using the client credentials flow.

## Features

- OAuth2 Authorization Code flow using Azure AD (OIDC).
- Secure HTTPS server with custom certificates.
- Fetch users from Microsoft Graph API using client credentials.
- Session management with express-session.
- Logout functionality with redirect to Microsoft logout endpoint.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Express](https://expressjs.com/)
- [Passport](http://www.passportjs.org/)
- [passport-azure-ad](https://www.npmjs.com/package/passport-azure-ad)
- [Microsoft Graph](https://docs.microsoft.com/en-us/graph/overview)