const axios = require('axios');
require('dotenv').config();
const Payment = require("../models/payment");
const Appointment = require("../models/appointment");
const Status = require("../models/status"); // Import model Status

const createPayment = async (req, res) => {
    const { total, currency, patientId, appointmentId } = req.body;

    console.log('body:', req.body);
    const parsedTotal = parseFloat(total);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
        console.log('Invalid total amount:', total);
        return res.status(400).json({ error: 'Invalid total amount' });
    }
    let formattedTotal = parsedTotal;

    // Nếu currency là VND, lấy tỷ giá từ USD -> VND
    if (currency === 'VND') {
        try {
            const exchangeRateResponse = await axios.get(`${API_URL}${EXCHANGE_RATE_API_KEY}/pair/USD/VND`);
            const exchangeRate = exchangeRateResponse.data.conversion_rate;

            // Chuyển đổi từ VND sang USD
            formattedTotal = parsedTotal / exchangeRate;
            currency = 'USD';  // Đổi currency sang USD
        } catch (error) {
            console.error('Error getting exchange rate:', error);
            return res.status(500).json({ error: 'Unable to fetch exchange rate' });
        }
    }

    const validCurrencies = ['USD', 'EUR', 'VND'];
    if (!validCurrencies.includes(currency)) {
        return res.status(400).json({ error: 'Invalid currency' });
    }

    const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com/v1/payments/payment'; // URL chính xác cho sandbox
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
                    total: formattedTotal.toFixed(2), // Làm tròn số tiền để gửi tới PayPal
                    currency,
                },
                description: 'Payment for appointment',
            }],
            redirect_urls: {
                return_url: 'http://192.168.1.3:8081/_expo/', // URL khi thanh toán thành công
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
            total: formattedTotal,
            currency,
            paymentId: paymentResponse.data.id,
        };

        const newPayment = new Payment(paymentData);
        await newPayment.save();

        // Tìm trạng thái "Đã thanh toán" trong bảng Status
        const paidStatus = await Status.findOne({ name: "đã thanh toán" });
        if (!paidStatus) {
            console.error('Status "Đã thanh toán" not found.');
            return res.status(500).json({ error: 'Status "Đã thanh toán" not found' });
        }

        // Cập nhật trạng thái lịch hẹn
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status: paidStatus._id }, // Gán ID của trạng thái "Đã thanh toán"
            { new: true }
        );

        if (!updatedAppointment) {
            console.error(`Appointment with ID ${appointmentId} not found.`);
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Trả về URL chuyển hướng để front-end chuyển hướng người dùng tới PayPal
        const approvalUrl = paymentResponse.data.links.find(link => link.rel === 'approval_url').href;
        console.log(approvalUrl);
        res.json({ approvalUrl, updatedAppointment });
    } catch (error) {
        console.error('Error response:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Unable to create payment', details: error.response ? error.response.data : null });
    }
};

module.exports = { createPayment };
