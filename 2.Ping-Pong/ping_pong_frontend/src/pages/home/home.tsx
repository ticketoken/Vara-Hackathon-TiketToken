import { useState } from 'react';
import {  Button } from '@/components/ui/button';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { useSailsCalls } from '@/app/hooks';
import { web3FromSource } from '@polkadot/extension-dapp';

import "./examples.css";

function Home () {
    const { account } = useAccount();

    const sails = useSailsCalls();
    const alert = useAlert();

    const [stateEnum, setStateEnum] = useState("");
    const [stateActorId, setStateActorId] = useState("");

    return (
        <div className='examples-container'>
            <div className='examples'>
                <div className='information'>
                    <p>
                        Last action send: {stateEnum}
                    </p>
                    <p>
                        Last who call:
                    </p>
                    <p>
                        {stateActorId}
                    </p>
                </div>
                <Button onClick={async () => {
                    if (!sails) {
                        console.log('Sails is not initialized');
                        return;
                    }

                    if (!account) {
                        console.log('Account does not started!');
                        return;
                    }

                    const { signer } = await web3FromSource(account.meta.source);
                   
                    const response = await sails.command(
                        'Ping/Ping',
                        {
                            userAddress: account.decodedAddress,
                            signer
                        },
                        {
                            callbacks: {
                                onSuccess() {
                                    alert.success('Message send!');
                                },
                                onLoad() {
                                    alert.info('A message will be sent');
                                },
                                onBlock(blockHash) {
                                    alert.info(`ID: ${blockHash}`);
                                },
                                onError() {
                                    alert.error('Error while sending a message');
                                }
                            }
                        }
                    );

                    console.log(`Response from contract: ${response}`);
                }}>
                    Send Ping
                </Button>
                <Button onClick={async () => {
                    if (!sails) {
                        console.log('Sails is not initialized');
                        return;
                    }

                    if (!account) {
                        console.log('Account does not started!');
                        return;
                    }

                    const { signer } = await web3FromSource(account.meta.source);
                   
                    const response = await sails.command(
                        'Ping/Pong',
                        {
                            userAddress: account.decodedAddress,
                            signer
                        },
                        {
                            callbacks: {
                                onSuccess() {
                                    alert.success('Message send!');
                                },
                                onLoad() {
                                    alert.info('A message will be sent');
                                },
                                onBlock(blockHash) {
                                    alert.info(`ID: ${blockHash}`);
                                },
                                onError() {
                                    alert.error('Error while sending a message');
                                }
                            }
                        }
                    );

                    console.log(`Response from contract: ${response}`);

                }}>
                    Send Pong
                </Button>
                <Button onClick={async () => {
                    if (!sails) {
                        console.log('Sails is not initialized');
                        return;
                    }

                    const response = await sails.query('Query/LastWhoCall') as [string, string];

                    console.log(response);
                    
                    setStateEnum(response[1]);
                    setStateActorId(response[0]);

                }}>
                    Last who call
                </Button> 
            </div>
        </div>
    );
}

export {Home };
