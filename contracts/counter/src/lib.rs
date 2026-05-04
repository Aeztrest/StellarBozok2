#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Counter,
    Admin,
}

#[contract]
pub struct CounterContract;

#[contractimpl]
impl CounterContract {
    /// Sözleşmeyi başlatır; yalnızca bir kez çağrılabilir.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Counter, &0u32);
        env.storage().instance().extend_ttl(100, 518400); // ~30 gün
    }

    /// Sayacı 1 artırır ve yeni değeri döner.
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::Counter, &count);
        env.storage().instance().extend_ttl(100, 518400);
        count
    }

    /// Sayacı 1 azaltır (minimum 0) ve yeni değeri döner.
    pub fn decrement(env: Env) -> u32 {
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);
        let new_count = count.saturating_sub(1);
        env.storage().instance().set(&DataKey::Counter, &new_count);
        env.storage().instance().extend_ttl(100, 518400);
        new_count
    }

    /// Yalnızca admin sıfırlayabilir.
    pub fn reset(env: Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Counter, &0u32);
        env.storage().instance().extend_ttl(100, 518400);
    }

    /// Mevcut sayaç değerini okur.
    pub fn get_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_sayac_temel() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(CounterContract, ());
        let client = CounterContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        assert_eq!(client.get_count(), 0);
        assert_eq!(client.increment(), 1);
        assert_eq!(client.increment(), 2);
        assert_eq!(client.decrement(), 1);

        client.reset();
        assert_eq!(client.get_count(), 0);
    }

    #[test]
    fn test_sifirin_altina_inmez() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(CounterContract, ());
        let client = CounterContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        // 0'dan azaltmaya çalış → hâlâ 0 kalmalı
        assert_eq!(client.decrement(), 0);
    }
}
