// Librerías necesarias
use sails_rs::{
    prelude::*,
    gstd::msg,
};


// Importar el estado necesario para el servicio de boletos
use crate::states::ticket_state::{
    TicketState,
    IoTicketState
};

// Definir el servicio de boletos
#[derive(Default)]
pub struct TicketService;

// Inicialización del estado del servicio
impl TicketService {
    // Función para inicializar el estado del servicio (solo llamada una vez)
    pub fn seed() {
        TicketState::init_state();
    }
}

// Servicio de boletos expuesto a usuarios externos
#[service]
impl TicketService {
    // Constructor del servicio
    pub fn new() -> Self {
        Self
    }

    // Función para capturar la información del boleto y generar un NFT
    pub fn generate_ticket(&mut self, actor_id: String, customer_name: String, seat: String, section: String) -> TicketEvent {
        // Generar número de compra
        let purchase_number = self.generate_purchase_number();

        // Guardar el estado del boleto con la información proporcionada
        let ticket_info = format!(
            "Actor ID: {}\nCustomer Name: {}\nSeat: {}\nSection: {}\nPurchase Number: {}",
            actor_id, customer_name, seat, section, purchase_number
        );

        TicketState::state_mut().current_ticket = ticket_info.clone();
        TicketState::state_mut()
            .all_tickets
            .insert(msg::source().into(), ticket_info);

        // Retornar el evento Ticket generado
        TicketEvent::TicketGenerated(purchase_number)
    }

    // Función para devolver siempre el número de compra como 1
    pub fn generate_purchase_number(&self) -> u32 
        {
        1 // Devuelve siempre el valor 1
    }

    // Función para generar el código QR del NFT
    pub fn generate_qr_code(&self) -> String {
        let ticket_info = &TicketState::state_ref().current_ticket;
        
        // Simulación de un código QR basado en la información del boleto
        let qr_code = format!("QR Code for Ticket:\n{}", ticket_info);
        
        // Simular el almacenamiento del QR
        TicketState::state_mut().current_qr = qr_code.clone();
        
        qr_code
    }

    // Función expuesta a usuarios externos para actualizar el QR cada 30 segundos
    pub fn update_qr_code(&mut self) -> TicketEvent {
        let qr_code = self.generate_qr_code();
        
        TicketState::state_mut()
            .qr_history
            .insert(msg::source().into(), qr_code.clone());

        TicketEvent::QrUpdated
    }

    // Función para consultar el estado del boleto actual
    pub fn ticket_info(&self) -> IoTicketState {
        TicketState::state_ref()
            .to_owned()
            .into()
    }
}

// Enum para los eventos que serán enviados como respuesta al usuario
#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]

pub enum TicketEvent {
    TicketGenerated(u32), // Evento generado al crear un ticket (incluye número de compra)
    QrUpdated,            // Evento que indica que el QR ha sido actualizado
}
