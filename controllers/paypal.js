const axios = require('axios');
require('dotenv').config(); 

const createPayment = async (req, res) => {
    const { total, currency } = req.body;

    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;
    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const SECRET = process.env.PAYPAL_SECRET;
    
    try {
        // Tạo token
        const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
        const tokenResponse = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', null, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                grant_type: 'client_credentials',
            },
        });

        const { access_token } = tokenResponse.data;

        // Tạo thanh toán
        const paymentResponse = await axios.post(PAYPAL_API_URL, {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            transactions: [{
                amount: {
                    total,
                    currency,
                },
                description: 'Payment description',
            }],
            redirect_urls: {
                return_url: 'http://localhost:3001/success',
                cancel_url: 'http://localhost:3001/cancel',
            },
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(paymentResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to create payment' });
    }
};

module.exports = { createPayment };
