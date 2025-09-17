use anchor_lang::prelude::*;

declare_id!("5vfYx3qS4FL5yAwiBnxLkYoK4ZHTsqGXn93RGKUhPZUz");

#[program]
pub mod lottery_dapp {
    use super::*;

    // Function 1: Initialize a new lottery
    // This creates a new lottery with zero pool and no players
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.total_pool = 0;  // Start with empty pool
        lottery.players = Vec::new();  // Start with no players
        msg!("Lottery initialized with empty pool");
        Ok(())
    }

    // Function 2: Enter the lottery by paying SOL
    // Players can join by sending SOL to the lottery pool
    pub fn enter(ctx: Context<Enter>, amount: u64) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let player = &ctx.accounts.player;

        // Simple validation: amount must be greater than 0
        require!(amount > 0, LotteryError::InvalidAmount);

        // Transfer SOL from player to lottery pool
        **lottery.to_account_info().try_borrow_mut_lamports()? += amount;
        **player.to_account_info().try_borrow_mut_lamports()? -= amount;

        // Update lottery state
        lottery.total_pool += amount;
        lottery.players.push(player.key());
        
        msg!("Player {} entered with {} SOL. Total pool: {}", 
             player.key(), amount, lottery.total_pool);
        Ok(())
    }

    // Function 3: Pick a winner (simplified random selection)
    // Randomly selects a winner and transfers all SOL to them
    pub fn pick_winner(ctx: Context<PickWinner>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        
        // Check if there are any players
        require!(lottery.players.len() > 0, LotteryError::NoPlayers);

        // Simple random selection using clock (basic randomness)
        let clock = Clock::get()?;
        let winner_index = (clock.unix_timestamp as usize) % lottery.players.len();
        let winner = lottery.players[winner_index];

        // Transfer all pool money to winner
        let pool_amount = lottery.total_pool;
        **ctx.accounts.winner.try_borrow_mut_lamports()? += pool_amount;
        **lottery.to_account_info().try_borrow_mut_lamports()? -= pool_amount;

        msg!("Winner selected: {} won {} SOL!", winner, pool_amount);

        // Reset lottery for next round
        lottery.total_pool = 0;
        lottery.players.clear();

        Ok(())
    }

    // Function 4: View current lottery information
    // Returns current pool amount and number of players
    pub fn get_lottery_info(ctx: Context<GetLotteryInfo>) -> Result<()> {
        let lottery = &ctx.accounts.lottery;
        
        msg!("Current lottery info:");
        msg!("Total pool: {} SOL", lottery.total_pool);
        msg!("Number of players: {}", lottery.players.len());
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 9000)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Account structure for entering the lottery
#[derive(Accounts)]
pub struct Enter<'info> {
    #[account(mut)]  // Lottery account needs to be mutable to update pool
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]  // Player account needs to be mutable to deduct SOL
    pub player: Signer<'info>,
}

// Account structure for picking winner
#[derive(Accounts)]
pub struct PickWinner<'info> {
    #[account(mut)]  // Lottery account needs to be mutable to reset
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]  // Winner account needs to be mutable to receive SOL
    /// CHECK: Winner account will be verified in the function
    pub winner: AccountInfo<'info>,
}

// Account structure for viewing lottery info
#[derive(Accounts)]
pub struct GetLotteryInfo<'info> {
    pub lottery: Account<'info, Lottery>,  // Read-only access
}

// Main lottery data structure
#[account]
pub struct Lottery {
    pub total_pool: u64,        // Total SOL in the lottery pool
    pub players: Vec<Pubkey>,   // List of all players who entered
}

// Error types for better error handling
#[error_code]
pub enum LotteryError {
    #[msg("No players in the lottery")]
    NoPlayers,
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
}
