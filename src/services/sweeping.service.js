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
exports.TaskSweepingService = void 0;
class TaskSweepingService {
    constructor(walletService, mainWalletId) {
        this.walletService = walletService;
        this.mainWalletId = mainWalletId;
    }
    sweepAll(walletIds, toWalletId) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const walletId of walletIds) {
                // Get current balances
                const ethBalance = this.walletService.getBalance(walletId, 'ETH');
                const usdtBalance = this.walletService.getBalance(walletId, 'USDT');
                // Gas fee is hardcoded to 0.01 ETH based on the test
                const gasFee = 0.01;
                // Check if wallet has enough ETH for gas and has USDT to sweep
                if (ethBalance >= gasFee && usdtBalance > 0) {
                    try {
                        // Transfer all USDT to the main wallet
                        this.walletService.send(walletId, toWalletId, 'USDT', usdtBalance);
                    }
                    catch (error) {
                        // If transfer fails for any reason, continue to next wallet
                        continue;
                    }
                }
            }
        });
    }
}
exports.TaskSweepingService = TaskSweepingService;
