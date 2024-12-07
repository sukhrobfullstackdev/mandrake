import { RevealViewType } from '@components/reveal-private-key/__type__';
import AgreementViewPage from '@components/reveal-private-key/agreement-view';

export default function AgreementPage() {
  return <AgreementViewPage type={RevealViewType.EXPORT} />;
}
