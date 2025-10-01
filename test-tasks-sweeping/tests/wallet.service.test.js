"use strict";
// tests/SimulatedWalletService.test.ts
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_service_1 = require("../src/services/wallet.service");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('SimulatedWalletService', () => {
    let walletService;
    let walletAId;
    let walletBId;
    (0, globals_1.beforeEach)(() => {
        walletService = new wallet_service_1.SimulatedWalletService(0.01, 'ETH');
        const walletA = walletService.createWallet(0.05, 100); // HAS gas and tokens
        const walletB = walletService.createWallet(0.02, 50);
        walletAId = walletA.id;
        walletBId = walletB.id;
    });
    (0, globals_1.test)('send transfers the correct amount and deducts gas fee', () => {
        const token = 'USDT';
        const sendAmount = 20;
        const sent = walletService.send(walletAId, walletBId, token, sendAmount);
        (0, globals_1.expect)(sent).toBe(sendAmount);
        // Source wallet balances after send
        (0, globals_1.expect)(walletService.getBalance(walletAId, token)).toBe(80); // 100 - 20
        (0, globals_1.expect)(walletService.getBalance(walletAId, 'ETH')).toBeCloseTo(0.04); // 0.05 - 0.01 gas fee
        // Target wallet balances after receiving
        (0, globals_1.expect)(walletService.getBalance(walletBId, token)).toBe(70); // 50 + 20
    });
    (0, globals_1.test)('send throws NotEnoughGasError if source lacks gas token balance', () => {
        // Create wallet with zero ETH gas
        const poorWallet = walletService.createWallet(0, 100);
        (0, globals_1.expect)(() => walletService.send(poorWallet.id, walletBId, 'USDT', 10)).toThrow(wallet_service_1.NotEnoughGasError);
    });
    (0, globals_1.test)('send throws NotEnoughTokenError if source lacks token balance', () => {
        (0, globals_1.expect)(() => walletService.send(walletAId, walletBId, 'USDT', 200)).toThrow(wallet_service_1.NotEnoughTokenError);
    });
    (0, globals_1.test)('send throws error if source wallet does not exist', () => {
        (0, globals_1.expect)(() => walletService.send('nonexistent', walletBId, 'USDT', 10)).toThrow('Wallet not found');
    });
    (0, globals_1.test)('send throws error if target wallet does not exist', () => {
        (0, globals_1.expect)(() => walletService.send(walletAId, 'nonexistent', 'USDT', 10)).toThrow('Target wallet not found');
    });
    globals_1.test.each([
        [0.009, false], // gas less than fee -> error
        [0.01, true], // exactly gas fee -> send allowed
        [0.02, true], // more than gas fee -> send allowed
    ])('gas fee validation: wallet gas %p leads to send success %p', (ethBalance, shouldSucceed) => {
        const sender = walletService.createWallet(ethBalance, 50);
        const receiver = walletService.createWallet(0.05, 0);
        if (shouldSucceed) {
            (0, globals_1.expect)(() => walletService.send(sender.id, receiver.id, 'USDT', 10)).not.toThrow();
        }
        else {
            (0, globals_1.expect)(() => walletService.send(sender.id, receiver.id, 'USDT', 10)).toThrow(wallet_service_1.NotEnoughGasError);
        }
    });
});
