'use client';
import { PassportError } from '@components/error/PassportError';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PassportPage } from '@magiclabs/ui-components';

export default function ErrorPage({ searchParams }: { searchParams: { code: string } }) {
  return (
    <PassportPage>
      <PassportPage.Title branding="light" />
      <PassportPage.Content>
        <PassportError errorCode={searchParams.code as PassportPageErrorCodes} />
      </PassportPage.Content>
    </PassportPage>
  );
}
