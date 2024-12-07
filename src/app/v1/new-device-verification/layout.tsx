/* istanbul ignore file */
import NewTabContainer from '@components/new-tab/new-tab-container';
import { NewTabProvider } from '@components/new-tab/new-tab-context';

export interface Props {
  children: React.ReactNode;
}

export default function NewDeviceVerificationLayout({ children }: Props) {
  return (
    <NewTabProvider>
      <NewTabContainer>{children}</NewTabContainer>
    </NewTabProvider>
  );
}
