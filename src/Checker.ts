import nodemailer from "nodemailer";
import { chromium, Page } from "patchright";
import 'dotenv/config';

export type NotifyData = {
    title: string,
    text: string
}

export abstract class Checker<TCheckResult> {
    public async runAsync(): Promise<void> {
        const browser = await chromium.launch({
            headless: false,
            slowMo: 500
        });
        try {
            const context = await browser.newContext({
                viewport: { width: 1280, height: 800 },
                locale: "pl-PL",
                timezoneId: "Europe/Warsaw"
            });
        
            const page = await context.newPage();
            const result = await this.checkAsync(page);
            if (!result) return;
            const notifyData = this.prepareNotifyMessage(result);
            await this.notifyAsync(notifyData);
        } catch (err) {
            await browser?.close();
        } finally {
            await browser?.close();
        }
    }

    abstract prepareNotifyMessage(result: TCheckResult): NotifyData;

    abstract checkAsync(page: Page): Promise<TCheckResult | null>;

    async notifyAsync(data: NotifyData): Promise<void> {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.ENV_MAIL}`,
                pass: `${process.env.ENV_PASS}`,
            },
            tls: {
                rejectUnauthorized: false
            }
        });


        const mailOptions = {
            from: `${process.env.ENV_MAIL}`,
            to: [`${process.env.ENV_MAIL}`],
            subject: data.title,
            text: data.text
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Błąd:', error);
            } else {
                console.log('Mail wysłany:', info.response);
            }
        });

    }
}