const axios = require('axios');
require('dotenv').config();
const Payment = require("../models/payment"); 

const createPayment = async (req, res) => {
    const { total, currency, patientId, appointmentId } = req.body;

    console.log('body:', req.body);
    const parsedTotal = parseFloat(total);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
        console.log('Invalid total amount:', total);
        return res.status(400).json({ error: 'Invalid total amount' });
    }
    const formattedTotal = parsedTotal.toFixed(2);

    const validCurrencies = ['USD', 'EUR', 'VND'];
    if (!validCurrencies.includes(currency)) {
        return res.status(400).json({ error: 'Invalid currency' });
    }

    const PAYPAL_API_URL = process.env.PAYPAL_API_URL;
    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const SECRET = process.env.PAYPAL_SECRET;

    try {
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
            intent: 'sale', // Hoặc 'authorize' hoặc 'order'
            payer: {
                payment_method: 'paypal',
            },
            transactions: [{
                amount: {
                    total: formattedTotal,
                    currency,
                },
                description: 'Payment for appointment',
            }],
            redirect_urls: {
                return_url: 'http://localhost:3001/success', // URL khi thanh toán thành công
                cancel_url: 'http://localhost:3001/cancel', // URL khi người dùng hủy thanh toán
            },
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        // Lưu thông tin thanh toán vào cơ sở dữ liệu
        const paymentData = {
            patientId, 
            appointmentId,
            total: parsedTotal,
            currency,
            paymentId: paymentResponse.data.id,
        };

        const newPayment = new Payment(paymentData);
        await newPayment.save();

        // Trả về URL chuyển hướng để front-end chuyển hướng người dùng tới PayPal
        const approvalUrl = paymentResponse.data.links.find(link => link.rel === 'approval_url').href;

        res.json({ approvalUrl });
    } catch (error) {
        console.error('Error response:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Unable to create payment', details: error.response ? error.response.data : null });
    }
};


module.exports = { createPayment };
