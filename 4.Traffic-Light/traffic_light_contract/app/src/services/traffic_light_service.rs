use sails_rs::{
    prelude::*,
    gstd::msg,
};

// Importar el estado
use crate::states::traffic_light_state::Ticket;
use crate::states::traffic_light_state::{
    TicketState,
    IoTicketState
};

#[derive(Default)]
pub struct TicketService;

impl TicketService {
    // Inicialización del estado del servicio (se llama una vez)
    pub fn seed() {
        TicketState::init_state();
    }
}

#[service]
impl TicketService {
    pub fn new() -> Self {
        Self
    }

    // Emitir un nuevo boleto NFT
    pub fn issue_ticket(&mut self, event_name: String, place: String, date: String, price: u64) -> TicketEvent {
        let ticket = TicketState::new_ticket(event_name, place, date, price);
        TicketState::state_mut().tickets.insert(ticket.id, ticket.clone());

        TicketEvent::Issued(ticket)
    }

    // Validar un boleto (marcarlo como usado)
    pub fn validate_ticket(&mut self, ticket_id: u64) -> TicketEvent {
        let ticket_state = TicketState::state_mut();

        if let Some(ticket) = ticket_state.tickets.get_mut(&ticket_id) {
            if ticket.used {
                TicketEvent::Invalid
            } else {
                ticket.used = true;
                TicketEvent::Validated(ticket_id)
            }
        } else {
            TicketEvent::NotFound
        }
    }

    // Consultar el estado de un boleto
    pub fn query_ticket(&self, ticket_id: u64) -> Option<IoTicketState> {
        // Obtenemos el ticket como una opción
        if let Some(ticket) = TicketState::state_ref().get_ticket(ticket_id) {
            // Si se encuentra el ticket, lo convertimos a IoTicketState y lo devolvemos
            Some(ticket.into())
        } else {
            // Si no se encuentra, devolvemos None
            None
        }
    }
    
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub enum TicketEvent {
    Issued(Ticket),
    Validated(u64),
    NotFound,
    Invalid,
}

/*
// necesary cretes
use sails_rs::{
    prelude::*,
    gstd::msg
};

// import the state
use crate::states::traffic_light_state::{
    TrafficLightState,
    IoTrafficLightState
};

// Traffic light service struct to build the service 
#[derive(Default)]
pub struct TrafficLightService;

// Impl for seed related function to init the state
impl TrafficLightService {
    // Related function to init the service state (call only once)
    // Another related function is created that initializes the state 
    // to avoid unnecessary imports in the "lib.rs" file, you can see 
    // that it remains more "structured"
    pub fn seed() {
        TrafficLightState::init_state();
    }
}

// Trffic light service
#[service]
impl TrafficLightService {
    // Service constructor
    pub fn new() -> Self {
        Self
    }

    // Remote call "green" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn green(&mut self) -> TrafficLightEvent {
        // // Get state as mut
        // let traffic_light_state = traffic_light_state_mut();

        let current_light = "Green".to_string();

        // Changing state
        TrafficLightState::state_mut()
            .current_light = current_light.clone();

        TrafficLightState::state_mut()
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Green
    }

    // Remote call "yellow" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn yellow(&mut self) -> TrafficLightEvent {
        // // Get state as mut
        // let traffic_light_state = traffic_light_state_mut();

        let current_light = "Yellow".to_string();

        // Changing state
        TrafficLightState::state_mut()
            .current_light = current_light.clone();
        TrafficLightState::state_mut()
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Yellow
    }

    // Remote call "yellow" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a command changing the state (&mut self)
    pub fn red(&mut self) -> TrafficLightEvent {
        // // Get state as mut
        // let traffic_light_state = traffic_light_state_mut();

        let current_light = "Red".to_string();

        // Changing state
        TrafficLightState::state_mut()
            .current_light = current_light.clone();
        TrafficLightState::state_mut()
            .all_users
            .insert(msg::source().into(), current_light);

        // returning the response
        TrafficLightEvent::Red
    }

    // Remote call "traffic_light" exposed to external consumers
    // Returns a struct that will be sent as a response to the user
    // Is treated as a query, keeping everything unchanged and returning some data. (&self)
    pub fn traffic_light(&self) -> IoTrafficLightState {
        TrafficLightState::state_ref()
            .to_owned()
            .into()
    }
}

// struct to use as a response to the user
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]

pub enum TrafficLightEvent {
    Green,
    Yellow,
    Red
}
*/

