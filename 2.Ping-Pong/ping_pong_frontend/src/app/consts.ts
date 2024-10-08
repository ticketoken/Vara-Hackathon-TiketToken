import { HexString } from '@gear-js/api';

interface ContractSails {
  programId: HexString,
  idl: string
}

export const ACCOUNT_ID_LOCAL_STORAGE_KEY = 'account';

export const ADDRESS = {
  NODE: 'wss://testnet.vara.network', // import.meta.env.VITE_NODE_ADDRESS,
  BACK: import.meta.env.VITE_BACKEND_ADDRESS,
  GAME: import.meta.env.VITE_CONTRACT_ADDRESS as HexString,
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
  programId: '0xd5b968efed7405852f08f4ab9fc07276bd17c353dddb5196479d0af616be8470',
  idl: `
    type PingEnum = enum {
      Ping,
      Pong,
    };

    constructor {
      New : ();
    };

    service Ping {
      Ping : () -> PingEnum;
      Pong : () -> PingEnum;
    };

    service Query {
      query AllCalls : () -> vec struct { actor_id, PingEnum };
      query LastWhoCall : () -> struct { actor_id, PingEnum };
    };
  `
};