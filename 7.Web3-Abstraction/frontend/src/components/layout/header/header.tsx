import { useState } from 'react';
import { Logo } from './logo';
import { Button } from '@chakra-ui/react';
import { SignlessForm } from '@/components/SignlessForm/SignlessForm';
import { useDappContext } from '@/Context';
import { UserAccountDataModal } from '@/components/UserAccountDataModal/UserAccountData';
import { UserIcon } from 'lucide-react';
import styles from './header.module.scss';

type Props = {
  isAccountVisible: boolean;
};

export function Header({ isAccountVisible }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const { sailsIsBusy } = useDappContext();

  return (
    <header className={styles.header}>
      <Logo />
      {
        isAccountVisible ? (
          <Button
            padding={0}
            onClick={() => setAccountModalOpen(true)}
            isLoading={sailsIsBusy}
          >
            <UserIcon />
          </Button>
        ) : (
          <Button  
            // text="Sign in" 
            backgroundColor='green.400'
            onClick={() => setModalOpen(true)}
          >
            Sign in
          </Button>
        )
      }
      { modalOpen && <SignlessForm closeForm={() => setModalOpen(false)}/> }
      { accountModalOpen && <UserAccountDataModal closeModal={() => setAccountModalOpen(false)} /> }
    </header>
  );

  
}

