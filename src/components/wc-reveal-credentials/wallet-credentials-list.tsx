'use client';

import { Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Flex } from '@styled/jsx';
import { useEffect, useState } from 'react';

interface WalletCredentialsListProps {
  rawWalletCredentials: string;
}

const WalletCredentialsList = ({ rawWalletCredentials }: WalletCredentialsListProps) => {
  const [walletCredentialsList, setWalletCredentialsList] = useState<string[]>([]);
  const textColor = '#E4E7E7';

  useEffect(() => {
    setWalletCredentialsList(rawWalletCredentials.split(' '));
  }, [rawWalletCredentials]);

  if (walletCredentialsList.length === 1) {
    return <Text styles={{ color: textColor, lineHeight: '1.25rem' }}>{walletCredentialsList[0]}</Text>;
  }

  return (
    <ul className={css({ columnCount: 2 })}>
      {walletCredentialsList.map((word, index) => (
        <li key={word} className={css({ breakInside: 'avoid-column' })}>
          <Flex mb={2}>
            <div className={css({ color: 'ink.50', w: 6, textAlign: 'end', mr: 2, userSelect: 'none' })}>
              {index + 1}
            </div>
            <Text styles={{ color: textColor, fontWeight: 500 }}>{word}</Text>
          </Flex>
        </li>
      ))}
    </ul>
  );
};

export default WalletCredentialsList;
