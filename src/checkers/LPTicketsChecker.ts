import { Page } from "patchright";
import { Checker, NotifyData } from "../Checker";
import 'dotenv/config';

type LPCheckerResult = {
    type?: string;
    price?: string;
    active?: boolean;
}[] | null

export class LPTicketsChecker extends Checker<LPCheckerResult> {
    prepareNotifyMessage(result: LPCheckerResult): NotifyData {
        return {
            title: "Nowe bilety na LP",
            text: result?.map((item: any) => {
                    return `${item.type} | ${item.price}`;
                }).join('\n') || ''
        }
    }

    async checkAsync(page: Page): Promise<LPCheckerResult> {
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
        console.log(available);

        return available.length ? available : null;
    }
}