import { useState } from 'react';

import { joinBasePath } from '../lib/site-path';
import styles from './Navigation.module.css';

type NavigationProps = {
  basePath: string;
  currentPath: string;
};

const items = [
  { label: '博客', pathname: '/blog/' },
  { label: '随笔', pathname: '/notes/' },
  { label: '项目', pathname: '/projects/' },
  { label: '关于', pathname: '/about/' },
];

export const Navigation = ({ basePath, currentPath }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.navigation} aria-label="主导航">
      <button
        className={styles.toggle}
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? '关闭导航' : '打开导航'}
      </button>
      <ul className={styles.links} id="site-navigation" data-open={isOpen}>
        {items.map(({ label, pathname }) => {
          const href = joinBasePath(basePath, pathname);

          return (
            <li key={pathname}>
              <a href={href} aria-current={currentPath === href ? 'page' : undefined}>
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
