import { useState } from 'react'
import { useDappContext } from '@/Context/dappContext'
import { useSailsCalls } from '@/app/hooks';
import { useForm } from 'react-hook-form'
import { Input, Button, Modal } from '@gear-js/vara-ui';
import { useAlert } from '@gear-js/react-hooks';
import { decodeAddress, HexString } from '@gear-js/api';
import { renewVoucher, addTokensToVoucher, encryptString } from '@/app/utils';
import './SignlessForm.css';


interface Props {
    closeForm: any,
    onGetKeyring?: any
}

interface FormDefaultValuesI {
    accountName: string,
    password: string
}

const DEFAULT_VALUES: FormDefaultValuesI = {
    accountName: '',
    password: ''
};


// For fast update, you can change this values
const MIN_AMOUNT_OF_BLOCKS = 2; // min amount of blocks for vouchers
const TOKENS_TO_ADD_TO_VOUCHER = 1; // tokens to add to voucher
const BLOCKS_TO_RENEW_VOUCHER = 1_200; // blocks to renew voucher if is expired (one hour)
const INITIAL_VOUCHER_TOKENS = 2; // Initial tokens for new vouchers
const INITIAL_BLOCKS_FOR_VOUCHER = 30; // Initial blocks for voucher (one minute)



export const SignlessForm = ({ closeForm, onGetKeyring }: Props) => {
    const sails = useSailsCalls();
    const alert = useAlert();
    const { register, handleSubmit, formState } = useForm({ defaultValues: DEFAULT_VALUES });
    const { errors } = formState;
    
    const {
        setSignlessAccount,
        setCurrentVoucherId,
        setNoWalletSignlessAccountName
    } = useDappContext();
    
    const [loadingAnAction, setLoadingAnAction] = useState(false);
    const [sectionConfirmCreationOfSignlessAccountIsOpen, setsectionConfirmCreationOfSignlessAccountIsOpen] = useState(false);
    const [noWalletAccountData, setNoWalletAccountData] = useState<FormDefaultValuesI>({ 
        accountName: '', 
        password: '',
    });

    const handleConfirmData = async () => {
        if (!sails) {
            console.error('SailsCalls is not started')
            return;
        }

        setLoadingAnAction(true);

        const encryptedName = encryptString(noWalletAccountData.accountName); // CryptoJs.SHA256(noWalletAccountData.accountName).toString();
        const newSignlessAccount = await sails.createNewKeyringPair(
            noWalletAccountData.accountName
        );
        const lockedSignlessAccount = sails.lockkeyringPair(
            newSignlessAccount,
            noWalletAccountData.password
        );
        const formatedLockedSignlessAccount = sails.modifyPairToContract(lockedSignlessAccount);
  
        let signlessVoucherId;

        try {
            signlessVoucherId = await sails.createVoucher(
                decodeAddress(newSignlessAccount.address),
                INITIAL_VOUCHER_TOKENS, 
                INITIAL_BLOCKS_FOR_VOUCHER,
                {
                    onLoad() { alert.info('Issue voucher to signless account...') },
                    onSuccess() { alert.success('Voucher created for signless account!') },
                    onError() { alert.error('Error while issue voucher to signless account') }
                }
            );

            setCurrentVoucherId(signlessVoucherId);
        } catch(e) {
            alert.error('Error while issue a voucher to a singless account!');
            setLoadingAnAction(false);
            return;
        }

        try {
            await sails.command(
                'Signless/BindKeyringDataToUserCodedName',
                newSignlessAccount,
                {
                    voucherId: signlessVoucherId,
                    callArguments: [
                        encryptedName,
                        formatedLockedSignlessAccount
                    ],
                    callbacks: {
                        onLoad() { alert.info('Will send a message') },
                        onSuccess() { alert.success('Signless account send!') },
                        onBlock(blockHash) { alert.info(`Message is in block: ${blockHash}`) },
                        onError() { alert.error('Error while sending singless account') }
                    }
                }
            );
        } catch(e) {
            alert.error('Error while sending signless account');
            setLoadingAnAction(false);
            return;
        }

        setSignlessAccount(newSignlessAccount);
        setCurrentVoucherId(signlessVoucherId);
        // if (setNoWalletSignlessAccountName) setNoWalletSignlessAccountName(encryptedName);
        setNoWalletSignlessAccountName(noWalletAccountData.accountName);
        setLoadingAnAction(false);
        closeForm();

        if (onGetKeyring) onGetKeyring(encryptedName, newSignlessAccount, signlessVoucherId);
    };

    const handleSubmitNoWalletSignless = async ({accountName, password}: FormDefaultValuesI) => {
        if (!sails) {
            alert.error('SailsCalls is not ready');
            return;
        }

        setLoadingAnAction(true);

        const encryptedName = encryptString(accountName); // CryptoJs.SHA256(accountName).toString();

        let contractState: any = await sails.query(
            'QueryService/KeyringAddressFromUserCodedName',
            {
                callArguments: [
                    encryptedName
                ]
            }
        );

        const { signlessAccountAddress } = contractState;

        if (!signlessAccountAddress) {
            setsectionConfirmCreationOfSignlessAccountIsOpen(true);
            setLoadingAnAction(false);
            return;
        }

        contractState = await sails.query(
            'QueryService/KeyringAccountData',
            {
                callArguments: [
                    signlessAccountAddress
                ]
            }
        );

        const { signlessAccountData } = contractState;

        let signlessDataFromContract;

        try {
            const lockedSignlessData = sails.formatContractSignlessData(
                signlessAccountData,
                accountName
            );

            signlessDataFromContract = sails.unlockKeyringPair(
                lockedSignlessData,
                password
            );
        } catch(e) {
            alert.error('Incorrect password for signless account!');
            console.error(e);
            setLoadingAnAction(false);
            return;
        }
        const decodedSignlessAddress = decodeAddress(signlessDataFromContract.address);
        const vouchersId = await sails.vouchersInContract(
            decodedSignlessAddress
        );

        await checkUpdatesForVoucher(
            decodedSignlessAddress,
            vouchersId[0]
        );

        setSignlessAccount(signlessDataFromContract);
        setCurrentVoucherId(vouchersId[0]);
        // if (setNoWalletSignlessAccountName) setNoWalletSignlessAccountName(encryptedName);
        setNoWalletSignlessAccountName(accountName);
        setLoadingAnAction(false);
        closeForm();

        if (onGetKeyring) onGetKeyring(encryptedName, signlessDataFromContract, vouchersId[0]);
    };

    const checkUpdatesForVoucher = (address: HexString, voucherId: HexString): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!sails) {
                alert.error();
                reject('SailsCalls is not started');
                return;
            }

            try {
                await renewVoucher(
                    sails,
                    address,
                    voucherId,
                    BLOCKS_TO_RENEW_VOUCHER, // Amout of blocks (one hour)
                    {
                        onLoad() { alert.info('Will renew the voucher') },
                        onSuccess() { alert.success('Voucher renewed!') },
                        onError() { alert.error('Error while renewing voucher') }
                    }
                );
    
                await addTokensToVoucher(
                    sails,
                    address,
                    voucherId,
                    TOKENS_TO_ADD_TO_VOUCHER,
                    MIN_AMOUNT_OF_BLOCKS,
                    {
                        onLoad() { alert.info('Will add tokens to voucher') },
                        onSuccess() { alert.success('Tokens added to voucher') },
                        onError() { alert.error('Error while adding tokens to voucher') }
                    }
                );
                resolve();
            } catch(e) {
                alert.error('Error while updating signless account voucher');
                reject(e);
                return;
            } 
        });
    }

    const formWithoutWallet = () => {
        return (
            <form 
                onSubmit={
                    handleSubmit(
                        !sectionConfirmCreationOfSignlessAccountIsOpen
                        ? handleSubmitNoWalletSignless
                        : handleConfirmData
                    )
                } 
                className='signless-form--form'
            >
                {
                    !sectionConfirmCreationOfSignlessAccountIsOpen && <>
                        <Input 
                            className='signless-form__input'
                            type='account name'
                            label='Set name'
                            error={errors.password?.message}
                            {
                                ...register(
                                    'accountName',
                                    {
                                        required: 'Field is required',
                                        minLength: {
                                            value: 10,
                                            message: 'Minimum length is 10'
                                        }
                                    }
                                )
                            }
                            onChange={(e) => {
                                setNoWalletAccountData({
                                    ...noWalletAccountData,
                                    accountName: e.target.value
                                });
                            }}
                            value={noWalletAccountData.accountName}
                        />
                        <Input 
                            className='signless-form__input'
                            type='password'
                            label='Set password'
                            error={errors.password?.message}
                            {
                                ...register(
                                    'password',
                                    {
                                        required: 'Field is required',
                                        minLength: {
                                            value: 10,
                                            message: 'Minimum length is 10'
                                        }
                                    }
                                )
                            }
                            onChange={(e) => {
                                setNoWalletAccountData({
                                    ...noWalletAccountData,
                                    password: e.target.value
                                });
                            }}
                            value={noWalletAccountData.password}
                        />
                    </>
                }

                {
                    sectionConfirmCreationOfSignlessAccountIsOpen &&
                    <p 
                        style={{
                            width: '280px',
                            textAlign: 'center',
                            marginBottom: '10px'
                        }}
                    >
                        The account does not have a signless account, do you want to create one?
                    </p>
                }
                
                <Button 
                    className='signless-form__button'
                    type='submit'
                    block={true}
                    isLoading={loadingAnAction}
                >
                    {
                        !sectionConfirmCreationOfSignlessAccountIsOpen
                        ? 'Submit'
                        : "Create"
                    }
                </Button>

                {
                    sectionConfirmCreationOfSignlessAccountIsOpen &&  <Button
                        className='signless-form__button'
                        color='grey'
                        block={true}
                        onClick={() => setsectionConfirmCreationOfSignlessAccountIsOpen(false)}
                        isLoading={loadingAnAction}
                    >
                        Cancel
                    </Button>
                }
                {
                    !sectionConfirmCreationOfSignlessAccountIsOpen &&  <Button
                        className='signless-form__button'
                        color='grey'
                        block={true}
                        onClick={closeForm}
                        isLoading={loadingAnAction}
                    >
                        Cancel
                    </Button>
                }
            </form>
        );
    }

    return <Modal
            heading='Signless Form'
            close={
                !loadingAnAction
                 ? closeForm
                 : () => console.log('Cant close modal while an action is active!')
            }
        >
            <div className='signless-form'>
                { formWithoutWallet() }   
            </div>
        </Modal>
}

