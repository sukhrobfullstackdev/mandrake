'use client';

// import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IcoMagic, PassportPage, TransactionRow } from '@magiclabs/ui-components';
// import { usePassportStore } from '@hooks/data/passport/store';

export default function PassportSendUserOperationPage() {
  // const activePayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
  // logger.info('ActivePayload:', activePayload);

  return (
    <PassportPage.Content>
      <TransactionRow onPress={() => {}} primaryText="123.0987 FOO" secondaryText="$50.00" variant="send">
        <TransactionRow.TokenIcon>
          <IcoMagic />
        </TransactionRow.TokenIcon>
      </TransactionRow>
    </PassportPage.Content>
  );
}
