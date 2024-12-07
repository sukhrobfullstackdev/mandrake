import { LEGACY_RELAYER_DOM_ELEMENT_ID } from '@constants/legacy-relayer';

const LegacyIframe = () => {
  return (
    <iframe
      title="auth-relayer"
      src="about:blank"
      id={LEGACY_RELAYER_DOM_ELEMENT_ID}
      style={{
        display: 'none',
        position: 'fixed',
        top: '0',
        right: '0',
        width: '100%',
        height: '100%',
        borderRadius: '0',
        border: 'none',
        zIndex: '2147483647',
      }}
    />
  );
};

export default LegacyIframe;
