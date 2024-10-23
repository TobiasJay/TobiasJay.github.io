export class PaddleObj {
    constructor() {
        this.levels = [
            { amount: 10000, count: 0 },
            { amount: 5000, count: 0 },
            { amount: 2500, count: 0 },
            { amount: 1000, count: 0 },
            { amount: 500, count: 0 },
            { amount: 250, count: 0 },
            { amount: 100, count: 0 },
            { amount: 50, count: 0 }
        ];
        this.grandTotal = 0;
    }

    incrementCount(levelAmount) {
        const level = this.levels.find(l => l.amount === levelAmount);
        if (level) {
            level.count++;
        } else {
            console.log(`Level ${levelAmount} not found`);
        }
    }

    decrementCount(levelAmount) {
        const level = this.levels.find(l => l.amount === levelAmount);
        if (level && level.count > 0) {
            level.count--;
        } else {
            console.log(`Level ${levelAmount} not found or count is already 0`);
        }
    }

    updateGrandTotal(levelAmount) {
        this.grandTotal += levelAmount;
    }
}
