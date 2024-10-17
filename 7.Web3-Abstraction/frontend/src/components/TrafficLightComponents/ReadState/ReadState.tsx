import { useEffect, useState } from "react";
import { useAlert } from "@gear-js/react-hooks";
import { Button, Card, Center, Heading, VStack, Text } from "@chakra-ui/react";
import { useSailsCalls } from "@/app/hooks";

function ReadState() {
  const sails = useSailsCalls();
  const alert = useAlert();

  const [fullState, setFullState] = useState<any | undefined>(0);

  const color = (fullState.current_light) ?? "Black";

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!sails) {
        alert.error('sails is not ready');
        return;
      }
  
      const response = await sails.query('QueryService/TrafficLight');
  
      setFullState(response);
    }, 500);

    return () => clearInterval(intervalId);
  }, [sails]);

  return (
    <Card>
      <Center>
        <VStack>
          <Heading>Traffic-light</Heading>
          <Button
            borderRadius="50px"
            w="400px"
            h="400px"
            backgroundColor={color ?? "black"}
          >
            Light
          </Button>

          <Heading>State Contract</Heading>
          <Text>{JSON.stringify(fullState.current_light)}</Text>
        </VStack>
      </Center>
    </Card>
  );
}

export { ReadState };
