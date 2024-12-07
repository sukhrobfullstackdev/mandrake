/* istanbul ignore file */

import { useChainInfo } from '@hooks/common/chain-info';
import { LoadingSpinner, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box } from '@styled/jsx';
import { isAddress } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

interface WalletSendAddressProps {
  onChangeWalletAddressHandler: ({ address, isValid }: { address: string; isValid: boolean }) => void;
  isLoading: boolean;
}
export default function WalletSendAddress({ onChangeWalletAddressHandler, isLoading }: WalletSendAddressProps) {
  const { chainInfo } = useChainInfo();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onChangeHandler = useCallback(
    (e: string) => {
      setWalletAddress(e);
    },
    [walletAddress],
  );

  useEffect(() => {
    try {
      if (walletAddress?.length) {
        const isAddressValid = isAddress(walletAddress);
        if (isAddressValid) {
          onChangeWalletAddressHandler({ address: walletAddress, isValid: isAddressValid });
          setErrorMessage('');
        } else {
          onChangeWalletAddressHandler({ address: walletAddress, isValid: false });
          setErrorMessage('Please enter a valid address (e.g. 0x123...)');
        }
      } else {
        setErrorMessage('');
      }
    } catch (e) {
      onChangeWalletAddressHandler({ address: walletAddress, isValid: false });
      setErrorMessage('Please enter a valid address (e.g. 0x123...)');
    }
  }, [walletAddress]);

  return (
    <>
      {isLoading ? (
        <Box m="2rem 0">
          <LoadingSpinner size={48} strokeWidth={4} />
        </Box>
      ) : (
        <TextInput
          errorMessage={errorMessage}
          onChange={onChangeHandler}
          value={walletAddress}
          className={css({ width: '100%', maxWidth: '25rem' })}
          label="Send to"
          placeholder={`${chainInfo?.name} wallet address`}
        ></TextInput>
      )}
    </>
  );
}
