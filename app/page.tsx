"use client";
import { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { ThirdwebProvider } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { useRouter } from "next/navigation";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
});

const arcTestnet = defineChain({
  id: 1116,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpc: "https://rpc.testnet.arc.network",
  testnet: true,
});

const translations: Record<string, Record<string, string>> = {
  en: { title: "PayrollChain", subtitle: "Decentralized Payroll System", connect: "Connect Wallet", admin: "Go to Admin Panel", lang: "Language" },
  fr: { title: "PayrollChain", subtitle: "Système de paie décentralisé", connect: "Connecter le portefeuille", admin: "Panneau d'administration", lang: "Langue" },
  de: { title: "PayrollChain", subtitle: "Dezentrales Gehaltssystem", connect: "Wallet verbinden", admin: "Admin-Panel öffnen", lang: "Sprache" },
  es: { title: "PayrollChain", subtitle: "Sistema de nómina descentralizado", connect: "Conectar cartera", admin: "Panel de administración", lang: "Idioma" },
  pt: { title: "PayrollChain", subtitle: "Sistema de folha de pagamento", connect: "Conectar carteira", admin: "Painel de administração", lang: "Idioma" },
  tr: { title: "PayrollChain", subtitle: "Merkeziyetsiz Maaş Sistemi", connect: "Cüzdan Bağla", admin: "Yönetici Paneli", lang: "Dil" },
};

function Home() {
  const [lang, setLang] = useState("en");
  const router = useRouter();
  const t = translations[lang];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0f0f0f", color: "#fff", fontFamily: "sans-serif" }}>
      <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 8 }}>
        {Object.keys(translations).map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 12px", borderRadius: 8, border: "1px solid #333", background: lang === l ? "#fff" : "transparent", color: lang === l ? "#000" : "#fff", cursor: "pointer", fontSize: 13 }}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>{t.title}</h1>
      <p style={{ color: "#888", marginBottom: 40, fontSize: 16 }}>{t.subtitle}</p>
      <ConnectButton client={client} chain={arcTestnet} />
      <button onClick={() => router.push("/admin")} style={{ marginTop: 24, padding: "10px 28px", borderRadius: 10, border: "1px solid #333", background: "transparent", color: "#fff", cursor: "pointer", fontSize: 14 }}>
        {t.admin} →
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <ThirdwebProvider>
      <Home />
    </ThirdwebProvider>
  );
}