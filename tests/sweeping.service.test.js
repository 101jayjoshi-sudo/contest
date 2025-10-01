"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sweeping_service_1 = require("../src/services/sweeping.service");
const wallet_service_1 = require("../src/services/wallet.service");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('SweepingService - Extended Edge Cases', () => {
    (0, globals_1.it)('should sweep all USDT into main wallet and handle all edge cases', () => __awaiter(void 0, void 0, void 0, function* () {
        const sweepGasFeeEth = 0.01;
        const walletService = new wallet_service_1.SimulatedWalletService(sweepGasFeeEth);
        const initialData = [
            [0.1, 100], // Enough gas and tokens - should sweep
            [0.005, 80], // Not enough gas - no sweep
            [0.01, 50], // Exactly enough gas - should sweep
            [0.02, 0], // Enough gas but zero USDT - no sweep, no gas deducted
            [0.02, 5], // Enough gas, small tokens - should sweep
            [0, 200], // No gas, but tokens - no sweep
            [0.01, 0], // Exactly gas, zero token - no sweep
            [0.009, 10], // Just below gas, some token - no sweep
            [0.05, 1000], // Big balance, enough gas - sweep
        ];
        // Create wallets
        const wallets = initialData.map(([eth, usdt]) => walletService.createWallet(eth, usdt));
        // Create main wallet
        const mainWallet = walletService.createWallet(0, 0);
        // Sweeping service instance
        const sweepingService = new sweeping_service_1.TaskSweepingService(walletService, mainWallet.id);
        // Wallet ids to sweep from (excluding main)
        const walletIds = wallets.map((w) => w.id);
        // Perform sweeping
        yield sweepingService.sweepAll(walletIds, mainWallet.id);
        // Helper to check if wallet should have swept:
        // condition: gas >= fee && USDT > 0
        const shouldSweep = (eth, usdt) => eth >= sweepGasFeeEth && usdt > 0;
        // Track total swept USDT for main wallet verification
        let totalSwept = 0;
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const [eth, usdt] = initialData[i];
            if (shouldSweep(eth, usdt)) {
                // Swept wallets should have zero USDT now
                (0, globals_1.expect)(walletService.getBalance(wallet.id, 'USDT')).toBe(0);
                // ETH should be decreased by gas fee
                (0, globals_1.expect)(walletService.getBalance(wallet.id, 'ETH')).toBeCloseTo(eth - sweepGasFeeEth, 8);
                totalSwept += usdt;
            }
            else {
                // Wallets that didn't sweep keep their original balances
                (0, globals_1.expect)(walletService.getBalance(wallet.id, 'USDT')).toBe(usdt);
                // ETH balance unchanged for those that did not sweep (no gas fee)
                (0, globals_1.expect)(walletService.getBalance(wallet.id, 'ETH')).toBeCloseTo(eth, 8);
            }
        }
        // Main wallet should have sum of swept USDT
        (0, globals_1.expect)(walletService.getBalance(mainWallet.id, 'USDT')).toBe(totalSwept);
        // Main wallet ETH balance remains zero (assumption: no gas cost for receiving)
        (0, globals_1.expect)(walletService.getBalance(mainWallet.id, 'ETH')).toBe(0);
    }));
});
