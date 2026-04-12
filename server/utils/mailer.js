const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendBookingStatusEmail(booking, status) {
  const isApproved = status === 'Approved';

  const subject = isApproved
    ? `Your Booking for ${booking.spaceName} has been Approved`
    : `Your Booking for ${booking.spaceName} has been Rejected`;

  const html = isApproved
    ? `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#16a34a;">Booking Approved ✓</h2>
        <p>Dear <strong>${booking.fullName}</strong>,</p>
        <p>Your facility booking request has been <strong style="color:#16a34a;">approved</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px;background:#f0fdf4;font-weight:bold;">Facility</td><td style="padding:8px;background:#f0fdf4;">${booking.spaceName}</td></tr>
          <tr><td style="padding:8px;">Date</td><td style="padding:8px;">${booking.date}</td></tr>
          <tr><td style="padding:8px;background:#f0fdf4;">Time</td><td style="padding:8px;background:#f0fdf4;">${booking.timeFrom}</td></tr>
          <tr><td style="padding:8px;">Duration</td><td style="padding:8px;">${booking.durationHours}h ${booking.durationMins}m</td></tr>
          <tr><td style="padding:8px;background:#f0fdf4;">Purpose</td><td style="padding:8px;background:#f0fdf4;">${booking.purpose}</td></tr>
        </table>
        <p style="margin-top:20px;">Please arrive on time. If you need to cancel or make changes, contact the administration.</p>
        <p>Thank you,<br/><strong>Manage My Campus Team</strong></p>
      </div>
    `
    : `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#dc2626;">Booking Rejected ✗</h2>
        <p>Dear <strong>${booking.fullName}</strong>,</p>
        <p>Unfortunately, your facility booking request has been <strong style="color:#dc2626;">rejected</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px;background:#fef2f2;font-weight:bold;">Facility</td><td style="padding:8px;background:#fef2f2;">${booking.spaceName}</td></tr>
          <tr><td style="padding:8px;">Date</td><td style="padding:8px;">${booking.date}</td></tr>
          <tr><td style="padding:8px;background:#fef2f2;">Time</td><td style="padding:8px;background:#fef2f2;">${booking.timeFrom}</td></tr>
          <tr><td style="padding:8px;">Purpose</td><td style="padding:8px;">${booking.purpose}</td></tr>
        </table>
        <p style="margin-top:20px;">If you believe this is a mistake or would like more information, please contact the administration.</p>
        <p>Thank you,<br/><strong>Manage My Campus Team</strong></p>
      </div>
    `;

  await transporter.sendMail({
    from: `"Manage My Campus" <${process.env.SMTP_FROM}>`,
    to: booking.email,
    subject,
    html,
  });
}

module.exports = { sendBookingStatusEmail };
