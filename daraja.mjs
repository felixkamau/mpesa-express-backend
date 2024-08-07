import axios from 'axios'
// import express from 'express'
import { configDotenv } from 'dotenv'
configDotenv('./.env');


const baseURL = process.env.BASE_URL;
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;


// function to get accestoken
const getAccessToken = async () => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get(`${baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
            Authorization: `Basic ${auth}`,
        }
    });
    return response.data.access_token;
}


const initiateMpesaPayment = async (phoneNumber, amount) => {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const shortcode = process.env.SHORT_CODE;
    const passkey = process.env.PASSKEY;

    // the password is made up of the shortcode, passkey & timestamp
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    // Payload which has all the require data for M-pesa api structure
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

// test number from daraja +254708374149
// set amount
initiateMpesaPayment(+254708374149, 10);

export { initiateMpesaPayment };

// TODO:error handling