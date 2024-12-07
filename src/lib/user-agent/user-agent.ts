export const isFirefoxAgent = navigator.userAgent.indexOf('Firefox') > -1;
export const isChromeAgent = navigator.userAgent.indexOf('Chrome') > -1;

export const isSafariAgent = () => {
  const isSafari = navigator.userAgent.indexOf('Safari') > -1;
  if (!isSafari) return false;
  return !(isChromeAgent && isSafari);
};

export const isChromeiOSMobile = /CriOS/i.test(navigator.userAgent) && /iPad|iPhone|iPod/.test(navigator.userAgent);
