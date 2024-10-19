import { useState } from "react";
import { useAccount, useAlert } from "@gear-js/react-hooks";
import { Button, Input, VStack, Text, Box } from "@chakra-ui/react";
import { useSailsCalls } from "@/app/hooks";

function GreenColor () {
  const sails = useSailsCalls();
  const alert = useAlert();
  const { account } = useAccount();

  const [eventName, setEventName] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");

  const handlePurchase = async () => {
    if (!sails) {
      alert.error('sails is not ready');
      return;
    }

    try {
      const response = await sails.command(
        'Ticket/Purchase', // Asegúrate de que este sea el comando correcto en tu contrato
        {
          event_name: eventName,
          place,
          date,
          price: parseInt(price, 10),
          owner: account.decodedAddress,
        }
      );

      alert.success('Ticket purchased successfully!');
      console.log(response);
    } catch (error) {
      alert.error('Error while purchasing ticket');
      console.error(error);
    }
  };

  return (
    <VStack spacing={4}>
      <Input
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />
      <Input
        placeholder="Place"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
      />
      <Input
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Input
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <Button backgroundColor="blue.300" onClick={handlePurchase}>
        Buy Ticket
      </Button>

      {/* Contenedor para mostrar el NFT creado */}
      <Box borderWidth="1px" borderRadius="lg" padding="4" width="100%">
        <Text fontWeight="bold">NFT Created:</Text>
        {/* Aquí puedes mostrar la información del NFT, puedes formatearlo como necesites */}
        <Text>
          Event: {eventName}, Place: {place}, Date: {date}, Price: {price}
        </Text>
      </Box>
    </VStack>
  );
}

export { GreenColor };
