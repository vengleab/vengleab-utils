import '../styles/index.css';
import CommandPalette from '../components/CommandPalette';
// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <CommandPalette />
    </>
  );
}
