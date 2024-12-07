import React from 'react';

const gradients = {
  sun: 'linear-gradient(315deg, #FFBC57 0%, #FFDF38 84.03%)',
  mercury: 'linear-gradient(315deg, #FFDDBD 0%, #FB59FE 84.03%)',
  mars: 'linear-gradient(315deg, #FBE62F 0%, #FF7474 84.03%)',
  venus: 'linear-gradient(315.81deg, #FF92FB 0%, #F33D32 105.47%)',
  earth: 'linear-gradient(315deg, #FFF06D 0%, #44F227 84.03%)',
  uranus: 'linear-gradient(315deg, #45EFFF 0%, #8875FF 84.03%)',
  neptune: 'linear-gradient(315deg, #F5B6FF 0%, #7862FF 84.03%)',
};

const getRandomGradient = (walletAddress: string) => {
  const addressLength = walletAddress.length;
  const lastChar = walletAddress[addressLength - 1];
  const charCode = lastChar.charCodeAt(0);

  const gradientValues = Object.values(gradients);
  const value = charCode % gradientValues.length;

  return gradientValues[value];
};

type Props = {
  walletAddress: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const GradientCircle = ({ walletAddress, ...rest }: Props) => {
  return (
    <div
      style={{
        width: '1.5rem',
        height: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: getRandomGradient(walletAddress),
        boxShadow: '0rem 0.25rem 1.25rem rgba(0, 0, 0, 0.05)',
        borderRadius: '2.5rem',
      }}
      {...rest}
    />
  );
};
