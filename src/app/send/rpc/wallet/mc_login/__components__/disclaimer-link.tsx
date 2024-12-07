import { isGlobalAppScope } from '@lib/utils/connect-utils';
import { token } from '@styled/tokens';

interface Props {
  content: string;
  href: string;
}

export const DisclaimerLink = ({ content, href }: Props) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        color: isGlobalAppScope() ? token('colors.text.primary') : token('colors.text.tertiary'),
        opacity: '0.85',
        fontWeight: '600',
      }}
    >
      {content}
    </a>
  );
};
