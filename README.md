#OIDC Authenication Application

## Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js**: Install Node.js from [Node.js official website](https://nodejs.js package manager, which is included with Node.js.
- Alternative **Node.js**: Install Node.js via
    ```bash 
    winget install OpenJS.NodeJS
    ```
- **Environment Variables**: Create a `.env` file in the root directory with the following variables:
  - `IDENTITY_METADATA`
  - `CLIENT_ID`
  - `RESPONSE_TYPE`
  - `RESPONSE_MODE`
  - `REDIRECT_URL`
  - `CLIENT_SECRET`
  - `SCOPE`
  - `CERT_KEY_FILE`
  - `CERT_FILE`

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```

3. Install the dependencies:
    ```bash
    npm install express passport passport-azure-ad dotenv express-session
    ```

## Configuration

1. Create a `.env` file in the root directory and add the required environment variables:
    ```plaintext
    IDENTITY_METADATA=<your-identity-metadata-url>
    CLIENT_ID=<your-client-id>
    RESPONSE_TYPE=<your-response-type>
    RESPONSE_MODE=<your-response-mode>
    REDIRECT_URL=<your-redirect-url>
    CLIENT_SECRET=<your-client-secret>
    SCOPE=<your-scope>
    CERT_KEY_FILE=<path-to-your-cert-key-file>
    CERT_FILE=<path-to-your-cert-file>
    ```

2. Ensure your certificate files are correctly placed and paths are specified in the `.env` file.

## Running the Script
1. Start the server:
    ```bash
    node app 1.js
    ```

2. Open your browser and navigate to:
    ```
    https://localhost:3000
    ```

## Usage

- **Authentication**: Navigate to `/auth` to start the authentication process.
- **Callback**: After successful authentication, you will be redirected to `/auth/callback` where user information will be displayed.

## License

This project is licensed under the MIT License - see the [LICENSEfile for details.

## Acknowledgements

- Express
- [Passport](httpnv
- [passport-azure-ad](https://www.npmjs.com/package/passport