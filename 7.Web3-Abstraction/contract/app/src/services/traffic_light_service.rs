// necesary cretes
use sails_rs::{
    prelude::*,
    gstd::{
        service,
        msg
    },
    cell::{
        RefMut,
        Ref
    }
};

// import the states
use crate::states::{
    traffic_light_state::TrafficLightState,
    keyring_state::{
        KeyringAccounts,
        KeyringError
    }
};

// Traffic light service struct to build the service 
// Data is passed to the service as RefMut (command, this change the state)
pub struct TrafficLightService<'a> {
    pub state: RefMut<'a, TrafficLightState>,
    pub keyring_state: Ref<'a, KeyringAccounts>
}

// Trffic light service
#[service]
impl<'a> TrafficLightService<'a> {
    // Service constructor
    pub fn new(
        state: RefMut<'a, TrafficLightState>,
        keyring_state: Ref<'a, KeyringAccounts>
    ) -> Self {
        Self {
            state,
            keyring_state
        }
    }

    // Remote call "green" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn green(
        &mut self,
        user_coded_name: String
    ) -> TrafficLightEvent {
        let keyring_address = msg::source();

        // Check if the address is associated to the user coded name
        let temp = self.keyring_state
            .check_keyring_address_by_user_coded_name(
                keyring_address, 
                user_coded_name
            );

        // If temp is an Err, returns the error
        if let Err(error) = temp {
            return TrafficLightEvent::Error(error);
        }

        let current_light = "Green".to_string();

        // Changing state
        self.state
            .current_light = current_light.clone();
        
        self.state
            .all_users
            .insert(keyring_address, current_light);

        // returning the response
        TrafficLightEvent::Green
    }

    // Remote call "yellow" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn yellow(
        &mut self,
        user_coded_name: String
    ) -> TrafficLightEvent {
        let keyring_address = msg::source();

        // Check if the address is associated to the user coded name
        let temp = self.keyring_state
            .check_keyring_address_by_user_coded_name(
                keyring_address, 
                user_coded_name
            );

        // If temp is an Err, returns the error
        if let Err(error) = temp {
            return TrafficLightEvent::Error(error);
        }

        let current_light = "Yellow".to_string();

        // Changing state
        self.state
            .current_light = current_light.clone();
        
        self.state
            .all_users
            .insert(keyring_address, current_light);

        // returning the response
        TrafficLightEvent::Yellow
    }

    // Remote call "Red" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn red(
        &mut self,
        user_coded_name: String
    ) -> TrafficLightEvent {
        let keyring_address = msg::source();

        // Check if the address is associated to the user coded name
        let temp = self.keyring_state
            .check_keyring_address_by_user_coded_name(
                keyring_address, 
                user_coded_name
            );

        // If temp is an Err, returns the error
        if let Err(error) = temp {
            return TrafficLightEvent::Error(error);
        }

        let current_light = "Red".to_string();

        // Changing state
        self.state
            .current_light = current_light.clone();
        
        self.state
            .all_users
            .insert(keyring_address, current_light);

        // returning the response
        TrafficLightEvent::Red
    }
}

// struct to use as a response to the user
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]

pub enum TrafficLightEvent {
    Green,
    Yellow,
    Red,
    Error(KeyringError)
}


