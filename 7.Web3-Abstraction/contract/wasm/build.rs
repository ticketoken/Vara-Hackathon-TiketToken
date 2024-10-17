use sails_idl_gen::program;
use sails_client_gen::ClientGenerator;
use app::TrafficLightProgram;
use std::{env, path::PathBuf};

fn main() {
    // Build contract to get .opt.wasm
    gear_wasm_builder::build();

    // Path where the file "Cargo.toml" is located (points to the root of the project)
    // 'CARGO_MANIFEST_DIR' specifies this directory in en::var
    let manifest_dir_path = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());

    // Path where the file "app.idl" will be created
    let idl_file_path = manifest_dir_path.clone().join("app.idl");

     // This generate the contract IDL
     program::generate_idl_to_file::<TrafficLightProgram>(idl_file_path.clone())
        .unwrap();

    // Generator of the clients of the contract
    ClientGenerator::from_idl_path(&idl_file_path)
        .with_mocks("with_mocks")
        .generate_to(manifest_dir_path.join("app_client.rs"))
        .unwrap(); 
}
