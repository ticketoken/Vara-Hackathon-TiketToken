use sails_rs::{
    gstd::{
        service,
        msg
    },
    cell::RefMut,
    prelude::*
};

use crate::states::keyring_state::{
    KeyringAccounts,
    KeyringData,
    KeyringError
};

// Struct for no wallet service
pub struct SignlessService<'a> {
    data: RefMut<'a, KeyringAccounts>
}

#[service]
impl<'a> SignlessService<'a> {
    pub fn new(data: RefMut<'a, KeyringAccounts>) -> Self {
        Self {
            data
        }
    }

    // ## Binds keyring data to an user coded name
    pub fn bind_keyring_data_to_user_coded_name(
        &mut self,
        no_wallet_account: String,
        keyring_data: KeyringData
    ) -> SignlessEvent {
        let keyring_address: ActorId = msg::source().into();

        let result = self.data
            .set_keyring_account_to_user_coded_name(
                keyring_address, 
                no_wallet_account, 
                keyring_data
            );

        match result {
            Err(keyring_error) => SignlessEvent::Error(keyring_error),
            Ok(_) => SignlessEvent::NoWalletAccountSet
        }
    }
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]

pub enum SignlessEvent {
    NoWalletAccountSet,
    Error(KeyringError)
}