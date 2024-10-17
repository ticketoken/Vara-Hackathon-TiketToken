import { useState } from "react"; 
import { useAlert } from "@gear-js/react-hooks";
import { Button } from "@chakra-ui/react";
import { useSailsCalls } from "@/app/hooks";
import { useDappContext } from "@/Context";
import { SignlessForm } from "@/components/SignlessForm/SignlessForm";
import { addTokensToVoucher, renewVoucher, encryptString } from "@/app/utils";
import { decodeAddress, HexString } from "@gear-js/api";
import { KeyringPair } from '@polkadot/keyring/types';

const GreenColor = () => {
  const sails = useSailsCalls();
  const alert = useAlert();
  const { 
    signlessAccount, 
    currentVoucherId ,
    noWalletSignlessAccountName,
    sailsIsBusy,
    setSailsIsBusy
  } = useDappContext();
  const [modalOpen, setModalOpen] = useState(false);

  const sendMessage = async (encryptedName: string, signer: KeyringPair, voucherId: HexString) => {
    if (!sails) {
      alert.error('sails is not ready');
      return;
    }

    setSailsIsBusy(true);

    const decodedAddress = decodeAddress(signer.address);

    try {
      await addTokensToVoucher(
        sails,
        decodedAddress,
        voucherId,
        1, // On token to add
        2, // Min amount of tokens from voucher
        {
          onLoad() { alert.info('Will add tokens to voucher!') },
          onSuccess() { alert.success('Tokens added to voucher!') },
          onError() { alert.error('Erro while adding tokens to voucher') }
        }
      );
    } catch (e) {
      setSailsIsBusy(false);
      console.error(e);
      return;
    }

    try {
      await renewVoucher(
        sails,
        decodedAddress,
        voucherId,
        1_200, // 1200 blocks (one hour)
        {
          onLoad() { alert.info('Will renew voucher!') },
          onSuccess() { alert.success('Voucher renewed!') },
          onError() { alert.error('Error while renewing voucher') }
        }
      )
    } catch (e) {
      setSailsIsBusy(false);
      console.error(e);
      return;
    }

    console.log('Se mandara mensaje!!!');

    try {
      const response = await sails.command(
        'TrafficLight/Green',
        signer,
        {
          voucherId,
          callArguments: [
            encryptedName
          ],
          callbacks: {
            onLoad() { alert.info('Will send a message'); },
            onBlock(blockHash) { alert.success(`In block: ${blockHash}`); },
            onSuccess() { alert.success('Message send!'); },
            onError() { alert.error('Error while sending message'); }
          }
        }
      );
  
      console.log('Response: ', response);
    } catch(e) {
      console.error(e);
    }

    setSailsIsBusy(false);
  }

  const signer = async () => {
    if (!signlessAccount || !currentVoucherId || !noWalletSignlessAccountName) {
      alert.error('User is not logged in');
      setModalOpen(true);
      return;
    }

    await sendMessage(
      encryptString(noWalletSignlessAccountName), 
      signlessAccount, 
      currentVoucherId
    );
  };

  return (
    <>
      <Button 
        backgroundColor="green.300" 
        onClick={signer}
        isLoading={sailsIsBusy}
      >
        Green
      </Button>
      {
        modalOpen && 
        <SignlessForm 
          closeForm={
            () => {
              setModalOpen(false);
            }
          }
          onGetKeyring={(userCodedName: string, keyring: KeyringPair, voucherId: HexString) => {
            sendMessage(userCodedName, keyring, voucherId);
          }}
        /> 
      }
    </>
  );
}

export { GreenColor };
