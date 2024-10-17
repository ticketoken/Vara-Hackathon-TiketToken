#![no_std]

// necesary crates
use sails_rs::{
    cell::RefCell, 
    gstd::{
        program,
        route
    }, 
    prelude::*,
};

// import our modules 
pub mod states;
pub mod services;

// Import service to be used for the program
use services::{
    traffic_light_service::TrafficLightService,
    signless_service::SignlessService,
    query_service::QueryService
};

// import necesary data (CustomStruct state)
use states::{
    traffic_light_state::TrafficLightState,
    keyring_state::KeyringAccounts
};

// Traffic light program struct to build the program (there can only be one per contract)
// Data is stored as a part of the program and passed to the services as Ref (query) 
// or RefMut (command), because services are instantiated for every incoming request
// message indicating that these services are stateless.
pub struct TrafficLightProgram {
    traffic_light_state: RefCell<TrafficLightState>,
    keyring_state: RefCell<KeyringAccounts>
}

// Traffic light program, it host one or more services and it expose them to the 
// externar consumer.
// Only one program is allowed per application
#[program]
impl TrafficLightProgram {
    // Application constructor (it is an associated function)
    // It can be called once per application lifetime.
    pub fn new() -> Self {
        let traffic_light_state = RefCell::new(TrafficLightState::default());
        let keyring_state = RefCell::new(KeyringAccounts::default());

        Self {
            traffic_light_state,
            keyring_state
        }
    }

    // Method working with "&self", havind no other parameters are treated as exposed
    // service constructors, and are called each time when an incoming request message 
    // needs to be dispatched to a selected service
    // It has "message routing", This will change the way a service will be called 
    // (if omitted, the method name will be used, in this case TrafficLightSvc).
    #[route("TrafficLight")]
    pub fn traffic_light_svc(&self) -> TrafficLightService {
        TrafficLightService::new(
            self.traffic_light_state.borrow_mut(),
            self.keyring_state.borrow()
        )
    }


    // Method working with "&self", havind no other parameters are treated as exposed
    // service constructors, and are called each time when an incoming request message 
    // needs to be dispatched to a selected service
    // It has "message routing", This will change the way a service will be called 
    // (if omitted, the method name will be used, in this case NoWalletSvc).
    #[route("Signless")]
    pub fn signless_svc(&self) -> SignlessService<'_> {
        SignlessService::new(
            self.keyring_state.borrow_mut()
        )
    }

    // Method working with "&self", havind no other parameters are treated as exposed
    // service constructors, and are called each time when an incoming request message 
    // needs to be dispatched to a selected service
    // It has "message routing", This will change the way a service will be called 
    // (if omitted, the method name will be used, in this case QuerySvc).
    #[route("QueryService")]
    pub fn query_svc(&self) -> QueryService {
        QueryService::new(
            self.traffic_light_state.borrow(),
            self.keyring_state.borrow()
        )
    }
}