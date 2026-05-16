import nodemailer from "nodemailer";
import { chromium, Page } from "patchright";
import 'dotenv/config';

function notify(result: any) {
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

    const text = result
        .map((item: { type: any; price: any; }) => {
            return `${item.type} | ${item.price}`;
        })
        .join('\n');

	const mailOptions = {
		from: `${process.env.ENV_MAIL}`,
		to: [`${process.env.ENV_MAIL}`],
		subject: `Nowe Bilety`,
		text
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log('Błąd:', error);
		} else {
			console.log('Mail wysłany:', info.response);
		}
	});
}

async function main(page: Page) {
	await page.goto(`${process.env.ENV_URL}`);
	await page.locator('.js-cat-check').waitFor({state: 'visible'});

    const divs = page.locator('[data-qa="price-category"]');

    const count = await divs.count();
    const result = [];

    for (let i = 0; i < count; i++) {
        const div = divs.nth(i);
        const text = await div.textContent();
        result.push({
            type: (await div.locator('.pc-list-category').textContent())?.trim(),
            price: (await div.locator('.ticket-type-price').textContent())?.trim(),
            active: !text?.includes('Currently not available')
        })
    }
    const available = result.filter(e => e.active);
    if (available.length) {
        notify(available);
    }
}

async function run() {
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
        main(page).then().catch().finally(() => {
            browser.close();
        });
    } catch (err) {
        await browser?.close();
        run();
    }
}

run();