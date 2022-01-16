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
                    <meta property="og:site_name" content="$site_name" />
                    <meta property="og:url" content="https://polychain.tech/" />
                    <meta property="og:type" content="website" />
                    <meta name="title" property="og:title" content="Polychain" />
                    <meta name="image" property="og:image" content="/images/favicon-96x96.png" />
                    <meta property="og:image:type" content="image/png">
                        <meta property="og:image:width" content="1024">
                            <meta property="og:image:height" content="1024">
                                <meta name="description" property="og:description" content="$site_description" />
                                <meta name="twitter:card" content="summary" />
                                <meta name="twitter:site" description="@username" />
                                <meta name="twitter:title" content="$the_title" />
                                <meta name="twitter:description" content="$site_description" />
                                <meta name="twitter:image:src" content="$site_logo">
                                    <meta name="twitter:domain" content="$site_url"></meta>
                                    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

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