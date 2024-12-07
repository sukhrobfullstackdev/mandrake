import { Text } from '@magiclabs/ui-components';
import { PayPalHostedField, PayPalHostedFieldProps } from '@paypal/react-paypal-js';
import { css } from '@styled/css';
import { HStack, VStack } from '@styled/jsx';
import { useMemo } from 'react';

type Props = PayPalHostedFieldProps & {
  label: string;
  isFocused: boolean;
  errorMessage?: string;
  rightIcon?: React.ReactElement;
};

export const PaypalTextInput = ({ label, errorMessage, rightIcon, isFocused, ...rest }: Props) => {
  const isError = useMemo(() => {
    return errorMessage && errorMessage.trim().length > 0;
  }, [errorMessage]);

  return (
    <VStack gap={2} w="full" alignItems="flex-start" justifyContent="flex-start">
      <label
        htmlFor="card-number"
        className={css({
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.primary',
        })}
      >
        {label}
      </label>
      <HStack
        h={12}
        w="full"
        justifyContent="space-between"
        transition="all linear 120ms"
        borderRadius={10}
        borderStyle="solid"
        borderWidth="thin"
        borderColor={{
          base: 'neutral.secondary',
          _hover: 'neutral.primary',
        }}
        {...(isFocused && {
          outlineColor: 'brand.base',
          outlineStyle: 'solid',
          outlineOffset: 0.5,
          outlineWidth: 'thick',
        })}
      >
        <PayPalHostedField
          style={{
            padding: rightIcon ? '0.75rem 1rem 0.75rem 0.75rem' : '0.75rem 1rem',
            textAlign: 'left',
            width: '100%',
            background: 'transparent',
            backgroundColor: 'transparent',
          }}
          {...rest}
        />
        {rightIcon && (
          <VStack flex={1} alignItems="right" mr={4}>
            {rightIcon}
          </VStack>
        )}
      </HStack>
      {isError && (
        <Text variant="error" styles={{ fontWeight: 400, textAlign: 'start' }}>
          {errorMessage}
        </Text>
      )}
    </VStack>
  );
};
