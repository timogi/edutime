import { Html, Head, Main, NextScript } from 'next/document'
import { ColorSchemeScript } from '@mantine/core'

export default function Document() {
  const handleScriptError = () => {
    // Silently handle script loading errors without exposing details to users
    console.warn('External script failed to load')
  }

  return (
    <Html lang='en'>
      <Head>
        <ColorSchemeScript />
        <link rel='icon' href='/favicon.ico' sizes='1024x1024' type='image/png' />
        <link rel='apple-touch-icon' href='/icon.png' sizes='1024x1024' />
        <script
          defer
          data-domain='edutime.ch'
          src='/js/script.js'
          onError={handleScriptError}
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
