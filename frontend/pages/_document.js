import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    {/* <link rel="shortcut icon" href="/images/favicon.ico" /> */}
                    <link rel="apple-touch-icon" sizes="57x57" href="/images/apple-icon-57x57.png" />
                    <link rel="apple-touch-icon" sizes="60x60" href="/images/apple-icon-60x60.png" />
                    <link rel="apple-touch-icon" sizes="72x72" href="/images/apple-icon-72x72.png" />
                    <link rel="apple-touch-icon" sizes="76x76" href="/images/apple-icon-76x76.png" />
                    <link rel="apple-touch-icon" sizes="114x114" href="/images/apple-icon-114x114.png" />
                    <link rel="apple-touch-icon" sizes="120x120" href="/images/apple-icon-120x120.png" />
                    <link rel="apple-touch-icon" sizes="144x144" href="/images/apple-icon-144x144.png" />
                    <link rel="apple-touch-icon" sizes="152x152" href="/images/apple-icon-152x152.png" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-icon-180x180.png" />
                    <link rel="icon" type="image/png" sizes="192x192" href="/images/android-icon-192x192.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="96x96" href="/images/favicon-96x96.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
                    <link rel="manifest" href="/images/manifest.json" />
                    <meta name="msapplication-TileColor" content="#ffffff" />
                    <meta name="msapplication-TileImage" content="/images/ms-icon-144x144.png" />
                    <meta name="theme-color" content="#ffffff" />
                    {/* <link rel="icon" type="image/png" href="./images/p.png" /> */}
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css" />
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
                    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                    <meta property="og:site_name" content="Spindl" />
                    <meta property="og:url" content="https://spindl.me/" />
                    <meta property="og:type" content="website" />
                    <meta name="title" property="og:title" content="Spindl" />
                    <meta name="image" property="og:image" content="https://www.spindl.me/images/favicon-96x96.png" />
                    <meta property="og:image:type" content="image/png" />
                    <meta property="og:image:width" content="96" />
                    <meta property="og:image:height" content="96" />
                    <meta name="description" property="og:description" content="Send and recieve bitcoin, ethereum, solana, etc. with a simple, shareable link!" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:site" description="@spindlhq" />
                    <meta name="twitter:title" content="Spindl" />
                    <meta name="twitter:description" content="Send and recieve bitcoin, ethereum, solana, etc. with a simple, shareable link!" />
                    <meta name="twitter:image:src" content="https://spindl.me/images/favicon-96x96.png" />
                    <meta name="twitter:domain" content="https://spindl.me/"></meta>
                    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
                    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FNPH2KPEQN"></script>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            
              gtag('config', 'G-FNPH2KPEQN');
          `,
                        }}
                    />
                    <title>Spindl</title>


                </Head>
                <body className=''>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument