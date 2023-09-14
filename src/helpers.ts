export const transformDomain = (domain: string) => {
  if (domain?.startsWith('www.')) {
    domain = domain.substring(4);
  }

  return domain.replace(/\./g, '-');
};
