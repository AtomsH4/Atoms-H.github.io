export const joinBasePath = (basePath: string, pathname: string): string => {
  const base = basePath.replace(/^\/+|\/+$/g, '');
  const path = pathname.replace(/^\/+/, '');

  if (!base) {
    return path ? `/${path}` : '/';
  }

  return path ? `/${base}/${path}` : `/${base}/`;
};
