import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Head>
        <title>XRPL NFT Platform</title>
        <meta name="description" content="XRPL NFT Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="responsive-container mt-16 flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
