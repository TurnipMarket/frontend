import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../src/context/ThemeContext.jsx';
import SealMark from '../src/components/SealMark.jsx';
import ThemeToggle from '../src/components/ThemeToggle.jsx';

describe('Components', () => {
  describe('SealMark', () => {
    it('renderiza un SVG', () => {
      const html = renderToString(<SealMark size={40} />);
      expect(html).toContain('<svg');
    });

    it('acepta diferentes tamaños', () => {
      const html40 = renderToString(<SealMark size={40} />);
      const html60 = renderToString(<SealMark size={60} />);
      expect(html40).toBeTruthy();
      expect(html60).toBeTruthy();
    });
  });

  describe('ThemeToggle', () => {
    it('renderiza un botón dentro de ThemeProvider', () => {
      const html = renderToString(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      expect(html).toContain('<button');
    });
  });
});
