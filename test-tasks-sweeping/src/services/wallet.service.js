"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatedWalletService = exports.NotEnoughTokenError = exports.NotEnoughGasError = void 0;
class NotEnoughGasError extends Error {
}
exports.NotEnoughGasError = NotEnoughGasError;
class NotEnoughTokenError extends Error {
}
exports.NotEnoughTokenError = NotEnoughTokenError;
class SimulatedWalletService {
    constructor(gasFee = 0.01, gasToken = 'ETH') {
        this.wallets = new Map();
        this.gasFee = gasFee;
        this.gasToken = gasToken;
    }
    createWallet(ethBalance = 0, usdtBalance = 0) {
        const id = Math.random().toString(36).substring(2, 15);
        const wallet = { id, balances: { ETH: ethBalance, USDT: usdtBalance } };
        this.wallets.set(id, wallet);
        return wallet;
    }
    getBalance(walletId, token) {
        var _a, _b;
        return (_b = (_a = this.wallets.get(walletId)) === null || _a === void 0 ? void 0 : _a.balances[token]) !== null && _b !== void 0 ? _b : 0;
    }
    send(sourceId, targetId, token, amount) {
        const sourceWallet = this.wallets.get(sourceId);
        if (!sourceWallet)
            throw new Error('Wallet not found');
        if (sourceWallet.balances[this.gasToken] < this.gasFee) {
            throw new NotEnoughGasError(`Not enough ${this.gasToken} for gas`);
        }
        if (token == this.gasToken &&
            sourceWallet.balances[this.gasToken] < this.gasFee + amount) {
            throw new NotEnoughTokenError(`Insufficient ${token} balance`);
        }
        if (sourceWallet.balances[token] <= amount) {
            throw new NotEnoughTokenError(`Insufficient ${token} balance`);
        }
        const targetWallet = this.wallets.get(targetId);
        if (!targetWallet)
            throw new Error('Target wallet not found');
        sourceWallet.balances[this.gasToken] -= this.gasFee;
        sourceWallet.balances[token] -= amount;
        targetWallet.balances[token] += amount;
        return amount;
    }
}
exports.SimulatedWalletService = SimulatedWalletService;
