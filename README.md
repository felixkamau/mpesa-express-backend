

# M-Pesa Express Integration Backend

This repository contains the backend implementation for integrating M-Pesa Express payments using Node.js and Express. The backend handles the initiation of M-Pesa STK push requests, enabling seamless payment processing in your application.

## Features

- **M-Pesa STK Push Integration**: Easily initiate M-Pesa STK push requests for payments.
- **Secure Token Management**: Fetch and manage M-Pesa access tokens securely.
- **Environment Configuration**: Use environment variables for sensitive data like API keys and secrets.

## Requirements

- Node.js v20.15.0 or higher
- npm v10.7.0 or higher

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/mpesa-express-backend.git
    cd mpesa-express-backend
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Create a `.env` file** in the root directory and add the following environment variables:

    ```plaintext
    BASE_URL=https://sandbox.safaricom.co.ke
    CONSUMER_KEY=your_consumer_key
    CONSUMER_SECRET=your_consumer_secret
    SHORT_CODE=your_short_code
    PASSKEY=your_passkey
    CALLBACK_URL=https://your-callback-url.com/callback
    PORT=3000
    ```

4. **Start the server**:

    ```bash
    npm start
    ```

## Usage

Use Postman or any HTTP client to send a POST request to `http://localhost:3000/api/pay` with the following JSON body:

```json
{
    "phone": "2547XXXXXXXX",
    "amount": 100
}
```

### Example Response

A successful response from the M-Pesa API might look like this:

```json
{
    "MerchantRequestID": "12345-67890",
    "CheckoutRequestID": "ws_CO_123456789",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
}
```

## Project Structure

```
mpesa-express-backend/
├── node_modules/
├── .env
├── package.json
├── server.js
└── daraja.js
```

### server.js

```javascript
import express from 'express';
import { initiateMpesaPayment } from './daraja.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/pay', async (req, res) => {
    const { phone, amount } = req.body;

    try {
        const response = await initiateMpesaPayment(phone, amount);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### daraja.js

```javascript
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = process.env.BASE_URL;
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;

// Function to get access token
const getAccessToken = async () => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get(`${baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
            Authorization: `Basic ${auth}`,
        }
    });
    return response.data.access_token;
};

const initiateMpesaPayment = async (phoneNumber, amount) => {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const shortcode = process.env.SHORT_CODE;
    const passkey = process.env.PASSKEY;

    // The password is made up of the shortcode, passkey & timestamp
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // Payload which has all the required data for M-Pesa API structure
    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: 'Test123',
        TransactionDesc: 'Payment for services',
    };

    const response = await axios.post(`${baseURL}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    });
    console.log(response);
    console.log(response.data);
    return response.data;
};

// Test number from Daraja +254708374149
// Set amount
initiateMpesaPayment('+254708374149', 10);

export { initiateMpesaPayment };

// TODO: Error handling
```

## Contributing

Feel free to open issues or submit pull requests if you have any improvements or bug fixes.

## License

This project is licensed under the MIT License.

---

This `README.md` provides a comprehensive overview of your project, including installation instructions, usage guidelines, and code structure, making it easy for others to understand and contribute.