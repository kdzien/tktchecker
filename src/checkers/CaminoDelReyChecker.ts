import { Page } from "patchright";
import { Checker, NotifyData } from "../Checker";
import { expect } from "patchright/test";

type CaminoDelReyCheckerResult = string[] | null

export class CaminoDelReyChecker extends Checker<CaminoDelReyCheckerResult> {
    prepareNotifyMessage(result: CaminoDelReyCheckerResult): NotifyData {
        return {
            title: "Nowe bilety na Camino!",
            text: result?.map(e => `${e} czerwca`).join('\n') || ''
        }
    }

    async checkAsync(page: Page): Promise<CaminoDelReyCheckerResult> {
        await page.goto(`${process.env.ENV_URL2}`);
        await this.closeCookieModal(page);
        await page.locator('#calendario_entradas_disponibles').waitFor({state: 'visible'});
        const calendar = page.locator('#calendario_entradas_disponibles');
        const month = await calendar.innerText();
        if (month.includes('MAY')) {
            await calendar.locator('.boton_calendario_mes').click();
            await page.waitForTimeout(2000);
        }
        const availableDays: string[] = [];
        for (const day of ['5', '6', '7']) {
            const dayCell = page.locator(
                `td.boton_calendario_dia[data-t2v-ano="2026"][data-t2v-mes="6"][data-t2v-dia="${day}"]`
            );
            console.log(dayCell);

            await dayCell.waitFor({ state: 'attached' });

            const className = await dayCell.getAttribute('class');

            if (!className?.includes('agotadas')) {
                availableDays.push(day);
            }
        }
        console.log(`Dostępne dni: ${availableDays.join(' ')}`);

        return availableDays.length ? availableDays : null;
    }

    async  closeCookieModal(page: Page) {
        const rejectButton = page.locator(
            '#aviso-cookies-botones-iniciales .button-rechazar'
        );

        if (!(await rejectButton.isVisible().catch(() => false))) {
            return;
        }

        await rejectButton.click();

        await page.locator('#modalCookies').waitFor({
            state: 'hidden',
            timeout: 5000,
        }).catch(() => {});

        await page.locator('.modal-backdrop').waitFor({
            state: 'detached',
            timeout: 5000,
        }).catch(() => {});
    }
}