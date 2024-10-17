#  Web3-Abstraction-Integration-Kit

## Table of contents

- [Introduction](#introduction)
- [Features](#features)
- [Functionality](#functionality)
- [Prerequisites](#prerequisites)
- [Instalation](#instalation)
- [Examples](#examples)

## Introduction

dApps have grown rapidly, however, many users are not familiar with web3 concepts, or are unaware of the steps to have a wallet, which is why we have this abstraction of a dApp without a wallet (template) that works with the Vara network (a Substrate-based blockchain).

## Features

- **Wallet-less service**: The contract includes the wallet-less service to manage user accounts.
- **SailsCalls**: The frontend example contains this library to easy manage of vouchers, signless, queries, commands, etc. (It works using the [sails-js](https://github.com/gear-tech/sails/blob/master/js/README.md) library.)
- **Custom hooks and context**: Frontend contains hooks and context that helps to manage when SailsCalls is "busy" (is sending a message, etc), get the current voucher id from the user, get the keyring account of the user, etc.

## Functionality

<div align="center">
  <img src="https://github.com/David-HernandezM/images-for-repos/blob/main/wallet-less_diagram/Wallet-less%20diagram.png?raw=true" alt="Descripción de la imagen">
</div>

### Steps that makes the wallet-less functionality

1. If the frontend does not have the user account, it will ask the user to enter their credentials (username and password).
2. Once the frontend have the username and password, the frontend will encrypt the username (with sha256 algorithm) and search in the contract state the address of the keyring account from the user.
    - If the user does not have an account, the form will ask him to create a new account. If the user accepts, it will create a new keyring account, lock it with the password and send it to the contract.
    - If the user hace an account, the frontend will get the locked account, then it will unlock the keyring with the password.
3. And, with the unlocked keyring account (or with the newly created one), the form will save the keyring in the context of the dApp (at application level).
4. The frontend will use this keyring account to sign all extrinsics.



## Prerequisites

- **Node.js** (version 14.x or higher)
- **npm** or **yarn** for package management
- **Vara Network RPC Endpoint**: A WebSocket endpoint to connect to the Vara network. Example: `wss://rpc.vara.network`.
- **Sponsor data**: To sign vouchers for users, you need the mnemonic seed and a name from a wallet with tokens.

## Instalation

### Option 1: Clone this repository and install dependencies

**First, clone this repository**:

```bash
git clone https://github.com/Vara-Lab/Web3-Abstraction-Integration-Kit.git
cd vara-walletconnect-library
```

### Frontend steps:

1. **Install dependencies**:

```bash
cd frontend
yarn
```

2. **Run in dev mode:**

```bash
yarn dev
```

### Contract steps:

1. **Build project**:

```bash
cd contract
cargo build --release
```

2. **Upload the wasm and idl file in the Gear IDEA**

### Option 2: You can follow the steps above using gitpod!

Note: si el compilador de rust tiene una versión anterior a la necesaria, tendras que actualizarla de la siguiente manera:

```sh
rustup install 1.80.1
rustup default 1.80.1
```

In case that the compiler does not have the target 'wasm32-unknown-unknown', you need to install it with: 

```sh
rustup target add wasm32-unknown-unknown
```

<p align="center">
  <a href="https://gitpod.io/#https://github.com/Vara-Lab/Web3-Abstraction-Integration-Kit.git" target="_blank">
    <img src="https://gitpod.io/button/open-in-gitpod.svg" width="240" alt="Gitpod">
  </a>
</p>

## Examples:

### Change the program contract id, idl and sponsor data:

- In the file **src/app/consts** you can find the const 'CONTRACT_DATA', where you have to put the contract id and IDL of the contract (It already contains a that fields of an existing contract):

```javascript
export const CONTRACT_DATA: ContractSails = {
  programId: '',
  idl: ``
};
```

- In the same file, you will find two consts 'sponsorName' and 'sponsorMnemonic', where you have to put a wallet name and the mnemonic seed of the wallet to sign the voucher for the users accounts.

```javascript
export const sponsorName = "";
export const sponsorMnemonic = "";
```

### Use of SailsCalls

- Initiate SailsCalls with the ''useInitSails' hook: in the 'app.tsx' file that is in **src** directory, you will find the use of this hook, where you have to put the data required to initiate SaisCalls (tha data is in the 'consts' file, explained above):

```javascript
import { useInitSails } from "./app/hooks";
import { 
  CONTRACT_DATA,
  sponsorName,
  sponsorMnemonic
} from "./app/consts";

const App = () => {
  // code ...

  useInitSails({
    // Set network, in this case testnet (if not, it wil use localhost)
    network: 'wss://testnet.vara.network',
    // Contract id 
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

  // code ...
}
```

- Use of SailsCalls: Once you have initiated Sails Calls, you can use the 'useSailsCalls' hook (if is not initiate the hook will return 'null'):

```javascript
import { useSailsCalls } from "@/app/hooks";

export const Component = () => {
  const sails = useSailsCalls();

  const singMessage = async () => {
    // Check if SaisCalls is started
    if (!sails) {
      console.error('SailsCalls is not ready!');
      return;
    }

    // code ..
  }

  // code ..
}
```

- Sending a message with SailsCalls: you will need the 'signer' to sign the extrinsic (SailsCalls have its own documentation) and you need to import some helper functions that check for you the state of the user voucher: 

```javascript
import { useSailsCalls } from "@/app/hooks";
import { useDappContext } from "@/Context";
import { decodeAddress, HexString } from "@gear-js/api";
// Helper functions to check voucher
import { addTokensToVoucher, renewVoucher, encryptString } from "@/app/utils";
import { encryptString } from "@/app/utils";

export const Component = () => {
  const sails = useSailsCalls();
  const { 
    signlessAccount, 
    currentVoucherId ,
    noWalletSignlessAccountName,
  } = useDappContext();

  const singMessage = async () => {
    // Check if SaisCalls is started
    if (!sails) {
      console.error('SailsCalls is not ready!');
      return;
    }

    // Check if the user keyring account is not null
    if (!signlessAccount) {
      console.error('Signless account is not ready!');
      return;
    }

    try {
      // Checks if the voucher needs tokens
      await addTokensToVoucher(
        sails,
        decodedAddress,
        currentVoucherId,
        1, // On token to add
        2, // Min amount of tokens from voucher
        {
          onLoad() { console.log('Will add tokens to voucher!') },
          onSuccess() { console.log('Tokens added to voucher!') },
          onError() { console.log('Erro while adding tokens to voucher') }
        }
      );
    } catch (e) {
      console.error(e);
      return;
    }

    try {
      // Check if the voucher is expired
      await renewVoucher(
        sails,
        decodedAddress,
        currentVoucherId,
        1_200, // 1200 blocks (one hour)
        {
          onLoad() { console.log('Will renew voucher!') },
          onSuccess() { aconsole.log('Voucher renewed!') },
          onError() { console.log('Error while renewing voucher') }
        }
      )
    } catch (e) {
      console.error(e);
      return;
    }

    try {
      // Send the message to the contract
      const response = await sails.command(
        'ServiceName/MethodName',
        signlessAccount,
        {
          voucherId: currentVoucherId,
          callArguments: [
            // You need to send as an argument the encrypted name 
            //of the user that is associated with the keyring account
            encryptString(noWalletSignlessAccountName)
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
  }

  // code ..
}
```

- Reading state with queries:

```tsx
import { useSailsCalls } from "@/app/hooks";

export const Component = () => {
  const sails = useSailsCalls();

  const readState = () => {
    if (!sails) {
      console.error('sails is not ready');
      return;
    }

    // Send a query to the contract:
    const response = await sails.query('QueryService/TrafficLight');

    console.log('state: ', JSON.stringify(response));
  }

  // code ...
}
```

### Keyring account verification:

- If you will build a new components that send a message, you have to check that the actual session has an account, so, you need to import the 'signless form' that helps you to optain that account and some data from the context (to handle this part):

```tsx
import { useState } from "react"; 
import { useSailsCalls } from "@/app/hooks";
// dApp context and SinglessForm works together to put the keyring account
// at 'application level'
import { useDappContext } from "@/Context";
import { SignlessForm } from "@/components/SignlessForm/SignlessForm";
import { addTokensToVoucher, renewVoucher, encryptString } from "@/app/utils";

const Action = () => {
  const sails = useSailsCalls();

  const { 
    signlessAccount, 
    currentVoucherId ,
    noWalletSignlessAccountName,
  } = useDappContext();

  const [modalOpen, setModalOpen] = useState(false); 

  const signMessage = async () => {
    if (!signlessAccount || !currentVoucherId || !noWalletSignlessAccountName) {
      alert.error('User is not logged in');
      setModalOpen(true);
      return;
    }

    // code ..
  }

  const closeForm = () => {
    setModalOpen(false);
  }

  return (
    <>
      <button
        onClick={signMessage}
      >
        Send message
      </button>
      {
        // Form modal to ask the user credentials
        modalOpen && 
        <SignlessForm 
          closeForm={closeForm}
        />
      }
    </>
  );
}
```