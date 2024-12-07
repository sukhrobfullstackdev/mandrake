'use client';

import { BrandCard } from '@app/send/rpc/nft/magic_nft_checkout/__components__/card-payment/brand-card';
import { PaypalTextInput } from '@app/send/rpc/nft/magic_nft_checkout/__components__/card-payment/paypal-text-input';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { CARD_TYPES } from '@constants/card-types';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useTranslation } from '@lib/common/i18n';
import { getClientLogger } from '@lib/services/client-logger';
import { isEmpty } from '@lib/utils/is-empty';
import { Button, TextInput } from '@magiclabs/ui-components';
import { HostedFieldsEvent } from '@paypal/paypal-js';
import { usePayPalHostedFields } from '@paypal/react-paypal-js';
import { css } from '@styled/css';
import { HStack, Spacer, VStack } from '@styled/jsx';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function PaypalCardForm() {
  const { t } = useTranslation('send');
  const { setStatus } = useNftCheckoutContext();
  const [isPending, setIsPending] = useState(false);

  const hostedFields = usePayPalHostedFields();
  const [validity, setValidity] = useState({
    number: { isValid: false, errorMessage: '', isFocused: false },
    expirationDate: { isValid: false, errorMessage: '', isFocused: false },
    cvv: { isValid: false, errorMessage: '', isFocused: false },
  });
  const [formData, setFormData] = useState({
    fullLegalName: '',
    zipCode: '',
    cardType: CARD_TYPES.UNKNOWN,
  });

  const isValid = useMemo(() => {
    return Object.values(validity).every(field => field.isValid) && Object.values(formData).every(v => !isEmpty(v));
  }, [validity, formData]);

  const updateValidity = useCallback(
    (e: HostedFieldsEvent) => {
      const { number, expirationDate, cvv } = e.fields;

      setValidity({
        number: {
          isValid: number.isValid,
          isFocused: number.isFocused,
          errorMessage: number.isEmpty || number.isValid ? '' : t('Please enter a valid credit/debit card number'),
        },
        expirationDate: {
          isValid: expirationDate.isValid,
          isFocused: expirationDate.isFocused,
          errorMessage:
            expirationDate.isEmpty || expirationDate.isValid ? '' : t('Please enter a valid expiration date (MM/YY)'),
        },
        cvv: {
          isValid: cvv.isValid,
          isFocused: cvv.isFocused,
          errorMessage: cvv.isEmpty || cvv.isValid ? '' : t('Invalid security code'),
        },
      });
    },
    [validity],
  );

  const clearValidityFocus = useCallback(() => {
    setValidity(prev => ({
      ...prev,
      number: { ...prev.number, isFocused: false },
      expirationDate: { ...prev.expirationDate, isFocused: false },
      cvv: { ...prev.cvv, isFocused: false },
    }));
  }, [setValidity]);

  const handleReviewPurchase = async () => {
    try {
      setIsPending(true);

      if (!hostedFields?.cardFields) {
        throw new Error('Hosted fields not initialized');
      }

      const isFormInvalid =
        Object.values(hostedFields.cardFields.getState().fields).some(field => !field.isValid) ||
        Object.values(formData).some(v => !isEmpty(v));

      if (!isFormInvalid) {
        throw new Error('The payment form is invalid');
      }

      const data = await hostedFields.cardFields.submit({
        fullLegalName: formData.fullLegalName,
        zipCode: formData.zipCode,
      });

      if (data.authenticationStatus !== 'APPROVED') {
        throw new Error('Error approving the payment');
      }

      const params = new URLSearchParams({
        orderId: data.orderId,
        brandType: formData.cardType,
        last4: data.card.last_digits,
      });
      window.history.pushState(null, '', `?${params.toString()}`);

      setStatus(NFT_CHECKOUT_STATUS.PAYPAL_CHECKOUT);
    } catch (error: unknown) {
      getClientLogger().error('Failed to create paypal order with credit/debit card', {}, error as Error);
      setStatus(NFT_CHECKOUT_STATUS.SOMETHING_WENT_WRONG);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (!hostedFields?.cardFields) {
      return;
    }

    hostedFields.cardFields?.on('cardTypeChange', (e: HostedFieldsEvent) => {
      if (e.cards.length === 1) {
        const card = e.cards[0];
        if (Object.values(CARD_TYPES).includes(card.type)) {
          setFormData(prev => ({
            ...prev,
            cardType: card.type,
          }));
          return;
        }
      }

      setFormData(prev => ({
        ...prev,
        cardType: CARD_TYPES.UNKNOWN,
      }));
    });

    hostedFields.cardFields?.on('blur', () => clearValidityFocus());
    hostedFields.cardFields?.on('focus', e => updateValidity(e));
    hostedFields.cardFields?.on('validityChange', e => updateValidity(e));
  }, [hostedFields]);

  return (
    <>
      <VStack gap={5} w="full" alignItems="flex-start" mb={8}>
        <TextInput
          className={css({
            w: 'full',
            '& input': {
              fontWeight: 400,
            },
          })}
          label={t('Full legal name')}
          placeholder="Arthur Clarke"
          type="text"
          value={formData.fullLegalName}
          onChange={v =>
            setFormData(prev => ({
              ...prev,
              fullLegalName: v,
            }))
          }
        />

        <PaypalTextInput
          id="card-number"
          label={t('Card number')}
          isFocused={validity.number.isFocused}
          errorMessage={validity.number.errorMessage}
          rightIcon={<BrandCard type={formData.cardType} />}
          className="card-field"
          hostedFieldType="number"
          options={{
            selector: '#card-number',
            placeholder: '4111 1111 1111 1111',
          }}
        />

        <HStack alignItems="flex-start" gap={4}>
          <PaypalTextInput
            id="expiration-date-1"
            label={t('Expiration')}
            isFocused={validity.expirationDate.isFocused}
            errorMessage={validity.expirationDate.errorMessage}
            className="card-field"
            hostedFieldType="expirationDate"
            options={{
              selector: '#expiration-date-1',
              placeholder: 'MM / YY',
            }}
          />
          <PaypalTextInput
            id="cvv"
            label={t('Security Code')}
            isFocused={validity.cvv.isFocused}
            errorMessage={validity.cvv.errorMessage}
            className="card-field"
            hostedFieldType="cvv"
            options={{
              selector: '#cvv',
              placeholder: '123',
              maskInput: true,
            }}
          />
        </HStack>

        <HStack w="full" gap={4}>
          <TextInput
            className={css({
              flex: 1,
              '& input': {
                fontWeight: 400,
              },
            })}
            label={t('Postal code')}
            placeholder="00000"
            type="text"
            maxLength={6}
            value={formData.zipCode}
            onChange={v =>
              setFormData(prev => ({
                ...prev,
                zipCode: v,
              }))
            }
          />
          <Spacer flex={1} />
        </HStack>
      </VStack>

      <Button
        type="button"
        onPress={e => {
          e.continuePropagation();
          handleReviewPurchase();
        }}
        variant="primary"
        expand
        label={t('Review Purchase')}
        validating={isPending}
        disabled={isPending || !isValid}
      />
    </>
  );
}
