import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const mailOptions = {
      from: `"Bilimdon Platform" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Email Tasdiqlash Kodi - Bilimdon',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fa;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 40px 30px;
              }
              .code-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .code {
                font-size: 42px;
                font-weight: 700;
                letter-spacing: 8px;
                color: white;
                font-family: 'Courier New', monospace;
              }
              .message {
                color: #4a5568;
                line-height: 1.6;
                font-size: 16px;
                margin-bottom: 20px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #718096;
                font-size: 14px;
                border-top: 1px solid #e2e8f0;
              }
              .warning {
                background-color: #fff5f5;
                border-left: 4px solid #fc8181;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                color: #742a2a;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Bilimdon Platform</h1>
              </div>
              <div class="content">
                <h2 style="color: #2d3748; margin-top: 0;">Email Tasdiqlash</h2>
                <p class="message">
                  Assalomu alaykum! Bilimdon platformasiga xush kelibsiz. 
                  Emailingizni tasdiqlash uchun quyidagi kodni kiriting:
                </p>
                <div class="code-box">
                  <div class="code">${code}</div>
                </div>
                <p class="message">
                  Bu kod <strong>10 daqiqa</strong> davomida amal qiladi.
                </p>
                <div class="warning">
                  <strong>⚠️ Diqqat:</strong> Agar siz bu kodni so'ramagan bo'lsangiz, 
                  bu xabarni e'tiborsiz qoldiring.
                </div>
              </div>
              <div class="footer">
                <p>© 2025 Bilimdon. Barcha huquqlar himoyalangan.</p>
                <p>Bu avtomatik xabar, javob berish shart emas.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email yuborishda xato:', error);
      return { success: false, error };
    }
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const mailOptions = {
      from: `"Bilimdon Platform" <${this.configService.get('SMTP_USER')}>`,
      to: email,
      subject: 'Xush kelibsiz! - Bilimdon',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fa;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
              }
              .content {
                padding: 40px 30px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Bilimdon Platform</h1>
              </div>
              <div class="content">
                <h2 style="color: #2d3748;">Xush kelibsiz, ${fullName}!</h2>
                <p>Bilimdon platformasiga muvaffaqiyatli ro'yxatdan o'tdingiz.</p>
                <p>Endi siz:</p>
                <ul>
                  <li>📚 30+ kategoriyada testlar topshirishingiz</li>
                  <li>🏆 Reytingda raqobatlashishingiz</li>
                  <li>🤖 AI yordamchisidan foydalanishingiz</li>
                  <li>🎯 Achievement'lar to'plashingiz mumkin</li>
                </ul>
                <a href="${this.configService.get('FRONTEND_URL')}" class="button">
                  Platformaga o'tish
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Welcome email yuborishda xato:', error);
    }
  }
}
