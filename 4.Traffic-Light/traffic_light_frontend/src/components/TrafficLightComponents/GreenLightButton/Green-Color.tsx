import { useState } from "react";
import { Button, VStack, Text, Box, SimpleGrid } from "@chakra-ui/react";

function GreenColor() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [showNFTInfo, setShowNFTInfo] = useState<boolean>(false); // Estado para mostrar la info del NFT

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const seatPrices: { [key: string]: number } = {
    A: 180,
    B: 180,
    C: 180,
    D: 220,
    E: 220,
    F: 220,
    G: 220,
    H: 265,
    I: 265,
    J: 265,
  };

  const eventName = "Macbeth";
  const date = "24/11/2024";

  const handleSeatSelect = (seat: string) => {
    let newSelectedSeats = [...selectedSeats];

    // Si el asiento ya está seleccionado, lo removemos
    if (selectedSeats.includes(seat)) {
      newSelectedSeats = selectedSeats.filter((s) => s !== seat);
    } else {
      // Si no está seleccionado, lo agregamos
      newSelectedSeats.push(seat);
    }

    setSelectedSeats(newSelectedSeats);
    calculateTotalPrice(newSelectedSeats);
  };

  const calculateTotalPrice = (seats: string[]) => {
    const price = seats.reduce((acc, seat) => {
      const row = seat[0];
      return acc + seatPrices[row];
    }, 0);

    setTotalPrice(price);

    // Convertir a ETH (suponiendo una tasa de conversión de ejemplo)
    const ethConversionRate = 0.000014; // Tasa ficticia de conversión
    const priceInEth = price * ethConversionRate;
    setEthPrice(Number(priceInEth.toFixed(6)));
  };

  const handlePurchase = () => {
    // Aquí podrías hacer lo necesario para la compra de tickets
    console.log("Compra realizada", selectedSeats, totalPrice, ethPrice);
    setShowNFTInfo(true); // Mostrar la info del NFT al realizar la compra
  };

  return (
    <VStack spacing={4}>
      <Text fontSize="xl" fontWeight="bold">
        Event: {eventName}
      </Text>
      <Text fontSize="lg">Date: {date}</Text>

      {/* Simulación de selección de asientos */}
      <SimpleGrid columns={10} spacing={2}>
        {rows.map((row) =>
          Array.from({ length: 10 }, (_, i) => (
            <Button
              key={`${row}${i + 1}`}
              onClick={() => handleSeatSelect(`${row}${i + 1}`)}
              colorScheme={selectedSeats.includes(`${row}${i + 1}`) ? "blue" : "gray"}
            >
              {`${row}${i + 1}`}
            </Button>
          ))
        )}
      </SimpleGrid>

      {/* Mostrar vista previa del precio */}
      {selectedSeats.length > 0 && (
        <Box borderWidth="1px" borderRadius="lg" padding="4" width="100%" textAlign="center">
          <Text fontWeight="bold">Price Preview:</Text>
          <Text>
            Total Price: {totalPrice} MXN / {ethPrice} ETH
          </Text>
        </Box>
      )}

      <Button backgroundColor="blue.300" onClick={handlePurchase}>
        Buy Ticket
      </Button>

      {/* Contenedor para mostrar el NFT creado, solo si se ha realizado una compra */}
      {showNFTInfo && (
        <Box
          borderWidth="1px"
          borderRadius="lg"
          padding="4"
          width="100%"
          display="flex"
          flexDirection="column"
          alignItems="center" // Centrar horizontalmente
          justifyContent="center" // Centrar verticalmente
          textAlign="center" // Alinear el texto en el centro
        >
          <Text fontWeight="bold">NFT Created:</Text>
          <Text>
            Event: {eventName} <br></br> 
            Place: {selectedSeats.join(", ") || "No seats selected"} <br></br> 
            Date: {date} <br></br> 
            Final Price: {totalPrice} MXN / {ethPrice} ETH
          </Text>
        </Box>
      )}
    </VStack>
  );
}

export { GreenColor };
