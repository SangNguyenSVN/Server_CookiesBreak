const axios = require('axios');
require('dotenv').config();
const Payment = require("../models/payment"); // Import mô hình Payment

const createPayment = async (req, res) => {
    const { total, currency, patientId } = req.body; // Thêm patientId vào destructuring

    console.log('body :', req.body); // Kiểm tra giá trị sau khi chuyển đổi
    // Kiểm tra và định dạng số tiền
    const parsedTotal = parseFloat(total);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
        console.log('Invalid total amount:', total); // In ra giá trị không hợp lệ
        return res.status(400).json({ error: 'Invalid total amount' });
    }
    const formattedTotal = parsedTotal.toFixed(2); // Chuyển đổi và định dạng thành chuỗi với hai chữ số thập phân

    // Kiểm tra loại tiền tệ (có thể thêm danh sách tiền tệ hợp lệ nếu cần)
    const validCurrencies = ['USD', 'EUR', 'VND']; // Thêm các loại tiền tệ khác nếu cần
    if (!validCurrencies.includes(currency)) {
        return res.status(400).json({ error: 'Invalid currency' });
    }

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
                    total: formattedTotal,
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

        // Lưu thông tin thanh toán vào cơ sở dữ liệu
        const paymentData = {
            patientId, // Cung cấp patientId
            total: parsedTotal,
            currency,
            paymentId: paymentResponse.data.id,
            status: 'pending', // Đặt trạng thái là 'pending'
        };

        const newPayment = new Payment(paymentData);
        await newPayment.save();

        // Trả về phản hồi từ PayPal
        res.json(paymentResponse.data);
    } catch (error) {
        console.error('Error response:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Unable to create payment', details: error.response ? error.response.data : null });
    }
};


module.exports = { createPayment };
