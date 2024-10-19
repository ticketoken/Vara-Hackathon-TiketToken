#![no_std]

// Librerías necesarias
use sails_rs::prelude::*;

// Importar nuestros módulos
pub mod states;
pub mod services;

// Importar el servicio que será usado para el programa
use services::ticket_service::TicketService;

// Definir el programa de tickets
pub struct TicketProgram;

// Implementar el programa de tickets
// Solo puede haber un programa por contrato
#[program]
impl TicketProgram {
    // Constructor del programa (se llama una sola vez en la vida del contrato)
    pub fn new() -> Self {
        // Inicializar el estado
        TicketService::seed();

        Self
    }

    // Servicio expuesto para capturar la información del ticket
    #[route("TicketService")]
    pub fn ticket_service_svc(&self) -> TicketService {
        TicketService::new()
    }
}
