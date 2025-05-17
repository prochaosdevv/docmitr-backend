export const welcomeEmail = (name, email, password) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Docmitr</title>
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #2c5282;
                    padding: 30px;
                    text-align: center;
                }
                .logo {
                    color: white;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 1px;
                }
                .content {
                    padding: 30px;
                }
                .welcome-title {
                    font-size: 24px;
                    color: #2c5282;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .message {
                    margin-bottom: 30px;
                    font-size: 16px;
                }
                .credentials-box {
                    background-color: #f0f7ff;
                    border: 1px solid #bfdeff;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 25px;
                }
                .credential-item {
                    margin-bottom: 15px;
                }
                .credential-label {
                    font-weight: bold;
                    color: #2c5282;
                    margin-bottom: 5px;
                    display: block;
                }
                .credential-value {
                    background-color: #ffffff;
                    border: 1px solid #e1e7ef;
                    border-radius: 4px;
                    padding: 10px;
                    font-family: monospace;
                    font-size: 15px;
                }
                .cta-button {
                    display: block;
                    background-color: #3182ce;
                    color: white;
                    text-decoration: none;
                    padding: 15px 25px;
                    border-radius: 6px;
                    text-align: center;
                    font-weight: bold;
                    margin: 30px auto;
                    width: 200px;
                    transition: background-color 0.3s;
                }
                .cta-button:hover {
                    background-color: #2c5282;
                }
                .footer {
                    background-color: #f1f5f9;
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #64748b;
                }
                .social-links {
                    margin-top: 15px;
                }
                .social-icon {
                    display: inline-block;
                    width: 32px;
                    height: 32px;
                    background-color: #3182ce;
                    border-radius: 50%;
                    color: white;
                    line-height: 32px;
                    margin: 0 5px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">Docmitr</div>
                </div>
                <div class="content">
                    <h1 class="welcome-title">Welcome, Dr. ${name}</h1>
                    
                    <div class="message">
                        <p>Thank you for joining Docmitr, your comprehensive healthcare management platform. We're excited to have you on board and are committed to making your practice more efficient and patient care more effective.</p>
                        <p>Your account has been successfully created. Below you'll find your login credentials:</p>
                    </div>
                    
                    <div class="credentials-box">
                        <div class="credential-item">
                            <span class="credential-label">Email Address:</span>
                            <div class="credential-value">${email}</div>
                        </div>
                        <div class="credential-item">
                            <span class="credential-label">Password:</span>
                            <div class="credential-value">${password}</div>
                        </div>
                        <p style="font-size: 14px; color: #64748b; margin-top: 15px;">For security reasons, please change your password after your first login.</p>
                    </div>
                    
                    <a href="https://doc-mitr.vercel.app/login" class="cta-button" target="_blank">Log In To Docmitr</a>
                    
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@docmitr.com" style="color: #3182ce;">support@docmitr.com</a>.</p>
                    
                    <p>Best regards,<br>The Docmitr Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
