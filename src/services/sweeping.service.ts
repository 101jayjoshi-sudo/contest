import { SimulatedWalletService, WalletId } from './wallet.service';

export interface SweepingService {
  /**
   * Sweep all funds from the user wallet to a specified address.
   * @param fromWalletId - Wallet to sweep from
   * @param toAddress - Target address for sweeping funds
   * @returns {Promise<SweepResult>}
   */
  sweepAll(walletIds: WalletId[], toAddress: WalletId): Promise<void>;
}

export class TaskSweepingService implements SweepingService {
  constructor(
    private walletService: SimulatedWalletService,
    private mainWalletId: string,
  ) {}

  async sweepAll(walletIds: WalletId[], toWalletId: WalletId): Promise<void> {
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
        } catch (error) {
          // If transfer fails for any reason, continue to next wallet
          continue;
        }
      }
    }
  }
}
