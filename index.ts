import 'dotenv/config';
import { Checker } from "./src/Checker";
import { LPTicketsChecker } from "./src/checkers/LPTicketsChecker";
import { CaminoDelReyChecker } from './src/checkers/CaminoDelReyChecker';

async function main() {
    const checkers: Checker<any>[] = [
        new LPTicketsChecker(),
        new CaminoDelReyChecker()
    ];

    for (const checker of checkers) {
        await checker.runAsync();
    }
}

main().then(() => {
    console.log("AllesGut");
}).catch(err => {
    console.log("Bład wykonania");
})