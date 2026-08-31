import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Navigation } from './Navigation';

describe('Navigation', () => {
  it('opens the navigation menu and builds links from the Astro base path', async () => {
    const user = userEvent.setup();

    render(
      <Navigation
        basePath="/Atoms-H.github.io/"
        currentPath="/Atoms-H.github.io/"
      />,
    );

    const toggle = screen.getByRole('button', { name: '打开导航' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: '随笔' })).toHaveAttribute(
      'href',
      '/Atoms-H.github.io/notes/',
    );
  });
});
