use sails_rs::{
    prelude::*,
    collections::HashMap,
};

// Estado global de los boletos
pub static mut TICKET_STATE: Option<TicketState> = None;

#[derive(Clone, Default)]
pub struct TicketState {
    pub tickets: HashMap<u64, Ticket>,
    pub next_id: u64,
}

impl TicketState {
    // Inicialización del estado
    pub fn init_state() {
        unsafe {
            TICKET_STATE = Some(Self::default());
        }
    }

    pub fn state_mut() -> &'static mut TicketState {
        unsafe { TICKET_STATE.as_mut().expect("El estado no está inicializado") }
    }

    pub fn state_ref() -> &'static TicketState {
        unsafe { TICKET_STATE.as_ref().expect("El estado no está inicializado") }
    }

    // Crear un nuevo boleto
    pub fn new_ticket(event_name: String, place: String, date: String, price: u64) -> Ticket {
        let mut state = Self::state_mut();
        let ticket = Ticket {
            id: state.next_id,
            event_name,
            place,
            date,
            price,
            used: false,
        };
        state.next_id += 1;
        ticket
    }

    pub fn get_ticket(&self, ticket_id: u64) -> Option<&Ticket> {
        self.tickets.get(&ticket_id)
    }
}

#[derive(Clone, Default, Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct Ticket {
    pub id: u64,
    pub event_name: String,
    pub place: String,
    pub date: String,
    pub price: u64,
    pub used: bool,
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct IoTicketState {
    pub id: u64,
    pub event_name: String,
    pub place: String,
    pub date: String,
    pub price: u64,
    pub used: bool,
}

impl From<&Ticket> for IoTicketState {
    fn from(ticket: &Ticket) -> Self {
        IoTicketState {
            id: ticket.id,
            event_name: ticket.event_name.clone(),
            place: ticket.place.clone(),
            date: ticket.date.clone(),
            price: ticket.price,
            used: ticket.used,
        }
    }
}

/*
// necesary cretes
use sails_rs::{
    prelude::*,
    collections::HashMap,
    // cell::Ref
};

// static mut variable (contract's state)
pub static mut TRAFFIC_LIGHT_STATE: Option<TrafficLightState> = None;

// Create a struct for the state
#[derive(Clone, Default)]
pub struct TrafficLightState {
    pub current_light: String,
    pub all_users: HashMap<ActorId, String>,
}

// Impl to set methods or related functions in TrafficLightState
impl TrafficLightState {
    // Method to create a new instance of TrafficLightState
    pub fn new() -> Self {
        Self {
            current_light: "".to_string(),
            all_users: HashMap::new()
        }
    }

    // Related function to init the state of traffic light (call once)
    pub fn init_state() {
        unsafe {
            TRAFFIC_LIGHT_STATE = Some(Self::new());
        };
    }

    // Related function to get the state as mut
    pub fn state_mut() -> &'static mut TrafficLightState {
        let state = unsafe { TRAFFIC_LIGHT_STATE.as_mut() };
        debug_assert!(state.is_some(), "The state is not initialized");
        unsafe { state.unwrap_unchecked() }
    }

    // Related function to get the state as ref
    pub fn state_ref() -> &'static TrafficLightState {
        let state = unsafe { TRAFFIC_LIGHT_STATE.as_ref() };
        debug_assert!(state.is_some(), "The state is not initialized");
        unsafe { state.unwrap_unchecked() }
    }
}

// Create a struct that can be send to the user who reads state
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct IoTrafficLightState {
    pub current_light: String,
    pub all_users: Vec<(ActorId, String)>,
}

// Implementation of the From trait for converting CustomStruct to IoCustomStruct
impl From<TrafficLightState> for IoTrafficLightState {

    // Conversion method
    fn from(value: TrafficLightState) -> Self {
        // Destructure the CustomStruct object into its individual fields
        let TrafficLightState {
            current_light,
            all_users,
        } = value;

        // Perform some transformation on second field, cloning its elements (Warning: Just for HashMaps!!)
        let all_users = all_users
            .iter()
            .map(|(k, v)| (*k, v.clone()))
            .collect();
   
        // Create a new IoCustomStruct object using the destructured fields
        Self {
            current_light,
            all_users,
        }
    }
}
*/