import '../styles/tela.css'; // Import TELA link styles
import '../styles/node-connection.css'; // Import node connection styles
import { TelaLinkHandler } from '../components/TelaLinkHandler';

function MyApp({ Component, pageProps }) {
  return (
    <>
      {process.env.NODE_ENV === 'production' && <TelaLinkHandler disableAutoOpen={true} />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 