import { 
    Center, 
    HStack, 
    VStack, 
} from "@chakra-ui/react";
import { 
    GreenColor,
    RedColor,
    YellowColor,
    TrafficLightReadState
} from "@/components";

export const Home = () => {
    return (
        <Center>
          <HStack>
            <VStack>
              <GreenColor />
            </VStack>
          </HStack>
        </Center>
      );
};
