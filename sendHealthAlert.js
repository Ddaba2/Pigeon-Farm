const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dabadiallo694@gmail.com',
    pass: 'dxhf yvfo kovm vqxq'
  }
});

app.post('/send-health-alert', async (req, res) => {
  const { subject, text, to } = req.body;
  try {
    await transporter.sendMail({
      from: 'PigeonFarm <dabadiallo694@gmail.com>',
      to: to || 'dabadiallo694@gmail.com',
      subject,
      text
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => console.log('API listening on port 3001')); 