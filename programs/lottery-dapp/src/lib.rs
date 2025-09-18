use anchor_lang::prelude::*;

declare_id!("AKpH6fPQEV7cxF4mRtEsHwtdnYRcNiYwTu6BZYGqUz8u");

#[program]
pub mod lottery_dapp {
    use super::*;

    // Function 1: Initialize a new lottery
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.total_pool = 0;
        lottery.player_count = 0;
        msg!("Lottery initialized");
        Ok(())
    }

    // Function 2: Enter the lottery by paying SOL
    pub fn enter(ctx: Context<Enter>, amount: u64) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;

        // Simple validation
        require!(amount > 0, LotteryError::InvalidAmount);
        require!(lottery.player_count < 10, LotteryError::TooManyPlayers);

        // Update lottery state (simplified - no actual SOL transfer for demo)
        lottery.total_pool += amount;
        lottery.player_count += 1;
        
        msg!("Player entered with {} lamports. Total pool: {}", amount, lottery.total_pool);
        Ok(())
    }

    // Function 3: Pick a winner
    pub fn pick_winner(ctx: Context<PickWinner>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        
        require!(lottery.player_count > 0, LotteryError::NoPlayers);

        let pool_amount = lottery.total_pool;
        msg!("Winner selected! Won {} lamports!", pool_amount);

        // Reset lottery
        lottery.total_pool = 0;
        lottery.player_count = 0;

        Ok(())
    }

    // Function 4: Get lottery info
    pub fn get_lottery_info(ctx: Context<GetLotteryInfo>) -> Result<()> {
        let lottery = &ctx.accounts.lottery;
        msg!("Total pool: {}, Players: {}", lottery.total_pool, lottery.player_count);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8 + 4)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Enter<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct PickWinner<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    /// CHECK: This is safe for demo purposes
    pub winner: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct GetLotteryInfo<'info> {
    pub lottery: Account<'info, Lottery>,
}

#[account]
pub struct Lottery {
    pub total_pool: u64,
    pub player_count: u32,
}

#[error_code]
pub enum LotteryError {
    #[msg("No players in the lottery")]
    NoPlayers,
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
    #[msg("Too many players in the lottery")]
    TooManyPlayers,
}
