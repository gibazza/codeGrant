# OAuth2 Authentication Application

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Download and install from the [official Node.js website](https://nodejs.org/).
- Alternatively, install Node.js using Windows Package Manager:
    ```bash
    winget install OpenJS.NodeJS
    ```
- **npm**: Node.js comes with npm (Node Package Manager).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```plaintext
IDENTITY_METADATA=<your-identity-metadata-url>
CLIENT_ID=<your-client-id>
REDIRECT_URL=<your-redirect-url>
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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Express](https://expressjs.com/)
- [Passport](http://www.passportjs.org/)
- [passport-azure-ad](https://www.npmjs.com/package/passport-azure-ad)