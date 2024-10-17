use sails_rs::{
    prelude::*,
    collections::BTreeMap
};

/// # Struct to handle keyring data for no wallet sessions
#[derive(Default)]
pub struct KeyringAccounts {
    pub keyring_accounts_address_by_user_coded_name: BTreeMap<String, ActorId>,
    pub keyring_data_by_keyring_address: BTreeMap<ActorId, KeyringData>
}

impl KeyringAccounts {
    /// ## Checks keyring address and user coded name
    /// If the keyring addres is not afiliated to the given user coded name,
    /// it will return an error.
    pub fn check_keyring_address_by_user_coded_name(
        &self,
        keyring_address: ActorId,
        user_coded_name: String
    ) -> Result<(), KeyringError> {
        // Gets the keyring address from the coded name, if its None, 
        // returns a KeyringError.
        let keyring_address_by_user_coded_name = self
            .keyring_accounts_address_by_user_coded_name
            .get(&user_coded_name)
            .ok_or(KeyringError::UserDoesNotHasKeyringAccount)?;

        // If the address is not equal with the given keyring address
        // is an invalid session.
        if !keyring_address.eq(keyring_address_by_user_coded_name) {
            return Err(KeyringError::SessionHasInvalidCredentials);
        }

        Ok(())
    }

    /// ## Sets keyring data to an user coded name
    /// Associate a keyring account with a user coded name.
    /// If the keyring address or the user coded name already exists,
    /// it will return an error.
    pub fn set_keyring_account_to_user_coded_name(
        &mut self,
        keyring_address: ActorId,
        user_coded_name: String,
        keyring_data: KeyringData
    ) -> Result<(), KeyringError> {
        // Check if the coded name already exists in the contract
        if self.keyring_accounts_address_by_user_coded_name.contains_key(&user_coded_name) {
            return Err(KeyringError::KeyringAccountAlreadyExists);
        }

        // Check if the keyring address already exists in the contract
        if self.keyring_data_by_keyring_address.contains_key(&keyring_address) {
            return Err(KeyringError::KeyringAddressAlreadyEsists);
        }

        // Add keyring address and data to the contract
        self.add_keyring_data_to_state(keyring_address, keyring_data);

        // Associate the coded name with the keyring address
        self
            .keyring_accounts_address_by_user_coded_name
            .insert(user_coded_name, keyring_address);

        Ok(())
    }

    pub fn add_keyring_data_to_state(&mut self, keyring_address: ActorId, keyring_data: KeyringData) {
        self.keyring_data_by_keyring_address
            .insert(keyring_address, keyring_data);
    }
}

/// # Enum to handle each error in no wallet sessions
#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub enum KeyringError {
    KeyringAddressAlreadyEsists,
    UserDoesNotHasKeyringAccount,
    KeyringAccountAlreadyExists,
    SessionHasInvalidCredentials
}

/// # Keyring struct
#[derive(Encode, Decode, TypeInfo, Clone, Default)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct KeyringData {
    address: String,
    encoded: String,
}