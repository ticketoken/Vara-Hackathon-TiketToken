import { HexString } from '@gear-js/api';

interface ContractSails {
  programId: HexString,
  idl: string
}

export const ACCOUNT_ID_LOCAL_STORAGE_KEY = 'account';

export const ADDRESS = {
  NODE: 'wss://testnet.vara.network', // import.meta.env.VITE_NODE_ADDRESS,
};

export const ROUTES = {
  HOME: '/',
  EXAMPLES: '/examples',
  NOTFOUND: '*',
};

// To use the example code, enter the details of the account that will pay the vouchers, etc. (name and mnemonic)
export const sponsorName = "";
export const sponsorMnemonic = "";

export const CONTRACT_DATA: ContractSails = {
  programId: '0xff07656ea367eecb3196bb897ddb39d272f035a9cfc258bd078d336927320a4c',
  idl: `
    type QueryEvent = enum {
      LastWhoCall: actor_id,
      SignlessAccountAddress: opt actor_id,
      SignlessAccountData: opt KeyringData,
    };

    type KeyringData = struct {
      address: str,
      encoded: str,
    };

    type IoTrafficLightState = struct {
      current_light: str,
      all_users: vec struct { actor_id, str },
    };

    type SignlessEvent = enum {
      NoWalletAccountSet,
      Error: KeyringError,
    };

    type KeyringError = enum {
      KeyringAddressAlreadyEsists,
      UserDoesNotHasKeyringAccount,
      KeyringAccountAlreadyExists,
      SessionHasInvalidCredentials,
    };

    type TrafficLightEvent = enum {
      Green,
      Yellow,
      Red,
      Error: KeyringError,
    };

    constructor {
      New : ();
    };

    service QueryService {
      query KeyringAccountData : (keyring_address: actor_id) -> QueryEvent;
      query KeyringAddressFromUserCodedName : (user_coded_name: str) -> QueryEvent;
      query TrafficLight : () -> IoTrafficLightState;
    };

    service Signless {
      BindKeyringDataToUserCodedName : (no_wallet_account: str, keyring_data: KeyringData) -> SignlessEvent;
    };

    service TrafficLight {
      Green : (user_coded_name: str) -> TrafficLightEvent;
      Red : (user_coded_name: str) -> TrafficLightEvent;
      Yellow : (user_coded_name: str) -> TrafficLightEvent;
    };
  `
};