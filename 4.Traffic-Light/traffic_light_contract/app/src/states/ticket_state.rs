// Librerías necesarias
use sails_rs::{
    prelude::*,
    collections::HashMap,
};

// Estado estático del contrato (estado de los boletos)
pub static mut TICKET_STATE: Option<TicketState> = None;

// Crear una estructura para el estado del boleto
#[derive(Clone, Default)]
pub struct TicketState {
    pub current_ticket: String, // Almacena la información del boleto actual
    pub all_tickets: HashMap<ActorId, String>, // Almacena todos los boletos por usuario (ActorId)
    pub current_qr: String, // Almacena el código QR actual generado
    pub qr_history: HashMap<ActorId, String>, // Histórico de códigos QR generados por usuario
}

// Implementación para añadir métodos o funciones relacionadas en TicketState
impl TicketState {
    // Método para crear una nueva instancia de TicketState
    pub fn new() -> Self {
        Self {
            current_ticket: "".to_string(),
            all_tickets: HashMap::new(),
            current_qr: "".to_string(),
            qr_history: HashMap::new(),
        }
    }

    // Función para inicializar el estado del ticket (se llama una vez)
    pub fn init_state() {
        unsafe {
            TICKET_STATE = Some(Self::new());
        };
    }

    // Función para obtener el estado mutable
    pub fn state_mut() -> &'static mut TicketState {
        let state = unsafe { TICKET_STATE.as_mut() };
        debug_assert!(state.is_some(), "El estado no está inicializado");
        unsafe { state.unwrap_unchecked() }
    }

    // Función para obtener el estado como referencia
    pub fn state_ref() -> &'static TicketState {
        let state = unsafe { TICKET_STATE.as_ref() };
        debug_assert!(state.is_some(), "El estado no está inicializado");
        unsafe { state.unwrap_unchecked() }
    }
}

// Crear una estructura que se enviará al usuario que lee el estado
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct IoTicketState {
    pub current_ticket: String, // Información del boleto actual
    pub all_tickets: Vec<(ActorId, String)>, // Lista de todos los boletos (por usuario)
    pub current_qr: String, // Código QR actual
    pub qr_history: Vec<(ActorId, String)>, // Histórico de códigos QR generados
}

// Implementación de la conversión de TicketState a IoTicketState
impl From<TicketState> for IoTicketState {
    // Método de conversión
    fn from(value: TicketState) -> Self {
        // Desestructurar el objeto TicketState en sus campos individuales
        let TicketState {
            current_ticket,
            all_tickets,
            current_qr,
            qr_history,
        } = value;

        // Transformar el HashMap de boletos y QR históricos en vectores
        let all_tickets = all_tickets
            .iter()
            .map(|(k, v)| (*k, v.clone()))
            .collect();

        let qr_history = qr_history
            .iter()
            .map(|(k, v)| (*k, v.clone()))
            .collect();
   
        // Crear una nueva instancia de IoTicketState utilizando los campos desestructurados
        Self {
            current_ticket,
            all_tickets,
            current_qr,
            qr_history,
        }
    }
}
