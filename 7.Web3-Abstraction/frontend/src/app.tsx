import { useContext } from "react";
import { useApi } from "@gear-js/react-hooks";
import { ApiLoader } from "@/components";
import { dAppContext } from "./Context";
import { Header } from "@/components/layout";
import { withProviders } from "./app/hocs";
import { Routing } from "./pages";
import { useInitSails } from "./app/hooks";
import { 
  CONTRACT_DATA,
  sponsorName,
  sponsorMnemonic
} from "./app/consts";
import "@gear-js/vara-ui/dist/style.css";

function Component() {
  const { isApiReady } = useApi();
  const { 
    signlessAccount, 
  } = useContext(dAppContext);

  // Put your contract id and idl
  useInitSails({
    network: 'wss://testnet.vara.network',
    contractId: CONTRACT_DATA.programId,
    idl: CONTRACT_DATA.idl,
    // You need to put name and mnemonic sponsor if you 
    // will use vouchers feature (vouchers are used for gasless,
    // and signless accounts)
    vouchersSigner: {
      sponsorName,
      sponsorMnemonic
    }
  });
  
  // App with context
  return (
    <>
      <Header isAccountVisible={signlessAccount != null} />
      {isApiReady ? <Routing /> : <ApiLoader />}
    </>
  );
}

export const App = withProviders(Component);
