import Document, {Html, Head, Main, NextScript} from 'next/document'

export default class MyDocument extends Document {
   render() {
     return(
    <Html lang="pt-br">
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css?family=Inter:100,200,300,regular,500,600,700,800,900" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
    )
  }
}
