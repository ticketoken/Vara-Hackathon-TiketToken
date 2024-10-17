// necesary crates
use sails_rs::{
    prelude::*,
    gstd::service,
    cell::Ref
};

use crate::states::{
    traffic_light_state::{
        IoTrafficLightState,
        TrafficLightState
    },
    keyring_state::{
        KeyringAccounts,
        KeyringData
    }
};

// Struct QueryService that will be used for all queries
// Data is passed to the service as Ref (query, does not change state)
pub struct QueryService<'a> {
    traffic_light_state: Ref<'a, TrafficLightState>,
    keyring_state_ref: Ref<'a, KeyringAccounts>
}

#[service]
impl<'a> QueryService<'a> {
    // Service constructor
    pub fn new(
        traffic_light_state: Ref<'a, TrafficLightState>,
        keyring_state_ref: Ref<'a, KeyringAccounts>
    ) -> Self {
        Self {
            traffic_light_state,
            keyring_state_ref
        }
    }

    // Remote call "traffic_light" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a query, keeping everything unchanged and returning some data. (&self)
    pub fn traffic_light(&self) -> IoTrafficLightState {
        self
            .traffic_light_state
            .to_owned()
            .into()
    }
    
    // Remote call "keyring_address_from_no_wallet_coded_name" exposed to external consumenrs
    // Returns an enum variant (from QueryEvent) that will be sent as a response to the user
    // Is treated as a query, keeping everything unchanged and returning some data. (&self)
    // Returns the keyring address from an user coded name
    pub fn keyring_address_from_user_coded_name(
        &self,
        user_coded_name: String
    ) -> QueryEvent {
        let keyring_address = self.keyring_state_ref
            .keyring_accounts_address_by_user_coded_name
            .get(&user_coded_name);

        QueryEvent::SignlessAccountAddress(keyring_address.copied())
    }

    // Remote call "keyring_account_data" exposed to external consumenrs
    // Returns an enum variant (from QueryEvent) that will be sent as a response to the user
    // Is treated as a query, keeping everything unchanged and returning some data. (&self)
    // Returns the keyring coded account from an keyring address
    pub fn keyring_account_data(
        &self,
        keyring_address: ActorId
    ) -> QueryEvent {
        let signless_data = self.keyring_state_ref
            .keyring_data_by_keyring_address
            .get(&keyring_address);

        let response = match signless_data {
            Some(data) => Some(data.clone()),
            None => None
        };

        QueryEvent::SignlessAccountData(response)
    }
}

#[derive(Encode, Decode, TypeInfo, Clone)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub enum QueryEvent {
    LastWhoCall(ActorId),
    SignlessAccountAddress(Option<ActorId>),
    SignlessAccountData(Option<KeyringData>),
}