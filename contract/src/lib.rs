#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, vec, Env, Symbol, Vec, String, Address, log};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Question,
    Options,
    Votes,
    Voted(Address),
}

#[contract]
pub struct LivePoll;

#[contractimpl]
impl LivePoll {
    /// Initialize the poll with a question and a list of options.
    pub fn initialize(env: Env, question: String, options: Vec<String>) {
        if env.storage().instance().has(&DataKey::Question) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::Options, &options);
        
        let mut votes = Vec::new(&env);
        for _ in 0..options.len() {
            votes.push_back(0u32);
        }
        env.storage().instance().set(&DataKey::Votes, &votes);
    }

    /// Cast a vote for a specific option index.
    pub fn vote(env: Env, voter: Address, option_index: u32) {
        voter.require_auth();

        if env.storage().persistent().has(&DataKey::Voted(voter.clone())) {
            panic!("already voted");
        }

        let mut votes: Vec<u32> = env.storage().instance().get(&DataKey::Votes).unwrap();
        if option_index >= votes.len() {
            panic!("invalid option index");
        }

        let current_votes = votes.get(option_index).unwrap();
        votes.set(option_index, current_votes + 1);
        env.storage().instance().set(&DataKey::Votes, &votes);
        
        // Mark as voted
        env.storage().persistent().set(&DataKey::Voted(voter.clone()), &true);

        // Emit event
        env.events().publish(
            (symbol_short!("vote"), voter),
            option_index
        );
    }

    /// Get the current results (question, options, and vote counts).
    pub fn get_results(env: Env) -> (String, Vec<String>, Vec<u32>) {
        let question: String = env.storage().instance().get(&DataKey::Question).unwrap();
        let options: Vec<String> = env.storage().instance().get(&DataKey::Options).unwrap();
        let votes: Vec<u32> = env.storage().instance().get(&DataKey::Votes).unwrap();
        (question, options, votes)
    }
}
