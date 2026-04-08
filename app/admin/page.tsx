"use client";
import { useState, useEffect } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { ThirdwebProvider, useActiveAccount, ConnectButton, useSendTransaction } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { transfer } from "thirdweb/extensions/erc20";

const client = createThirdwebClient({ clientId: process.env.NEXT_PUBLIC_CLIENT_ID! });
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

const USDC_ARC_TESTNET = "0x3600000000000000000000000000000000000000";

const T: Record<string, Record<string, string>> = {
  en: { title: "Admin Panel", addEmployee: "Add Employee", empName: "Full Name", empWallet: "Wallet Address (0x...)", empSalary: "Monthly Salary (USDC)", addBtn: "Add Employee", employees: "Employees", salary: "Salary (USDC)", wallet: "Wallet", status: "Status", action: "Action", send: "Send USDC", locked: "Locked", ready: "Ready", paid: "Paid", days: "days", newNft: "New Payroll NFT", employee: "Select Employee", amount: "Amount (USDC)", create: "Mint & Stake NFT", notConnected: "Please connect your wallet", totalEmp: "Total Employees", totalLocked: "Locked NFTs", totalReady: "Ready to Pay", deleteBtn: "Remove", saving: "Saving...", saved: "Saved!", sending: "Sending USDC on-chain...", minting: "Minting NFT..." },
  fr: { title: "Panneau Admin", addEmployee: "Ajouter un employé", empName: "Nom complet", empWallet: "Adresse portefeuille (0x...)", empSalary: "Salaire mensuel (USDC)", addBtn: "Ajouter", employees: "Employés", salary: "Salaire (USDC)", wallet: "Portefeuille", status: "Statut", action: "Action", send: "Envoyer USDC", locked: "Bloqué", ready: "Prêt", paid: "Payé", days: "jours", newNft: "Nouveau NFT", employee: "Sélectionner", amount: "Montant (USDC)", create: "Créer & Staker NFT", notConnected: "Connectez votre portefeuille", totalEmp: "Total employés", totalLocked: "NFTs bloqués", totalReady: "Prêt à payer", deleteBtn: "Supprimer", saving: "Enregistrement...", saved: "Enregistré!", sending: "Envoi USDC en cours...", minting: "Création NFT..." },
  de: { title: "Admin-Panel", addEmployee: "Mitarbeiter hinzufügen", empName: "Vollständiger Name", empWallet: "Wallet-Adresse (0x...)", empSalary: "Monatsgehalt (USDC)", addBtn: "Hinzufügen", employees: "Mitarbeiter", salary: "Gehalt (USDC)", wallet: "Wallet", status: "Status", action: "Aktion", send: "USDC senden", locked: "Gesperrt", ready: "Bereit", paid: "Bezahlt", days: "Tage", newNft: "Neue Gehalts-NFT", employee: "Auswählen", amount: "Betrag (USDC)", create: "NFT erstellen & staken", notConnected: "Bitte Wallet verbinden", totalEmp: "Mitarbeiter gesamt", totalLocked: "Gesperrte NFTs", totalReady: "Bereit zur Zahlung", deleteBtn: "Entfernen", saving: "Wird gespeichert...", saved: "Gespeichert!", sending: "USDC wird on-chain gesendet...", minting: "NFT wird erstellt..." },
  es: { title: "Panel Admin", addEmployee: "Agregar empleado", empName: "Nombre completo", empWallet: "Dirección cartera (0x...)", empSalary: "Salario mensual (USDC)", addBtn: "Agregar", employees: "Empleados", salary: "Salario (USDC)", wallet: "Cartera", status: "Estado", action: "Acción", send: "Enviar USDC", locked: "Bloqueado", ready: "Listo", paid: "Pagado", days: "días", newNft: "Nuevo NFT", employee: "Seleccionar", amount: "Monto (USDC)", create: "Crear & Stakear NFT", notConnected: "Conecta tu cartera", totalEmp: "Total empleados", totalLocked: "NFTs bloqueados", totalReady: "Listo para pagar", deleteBtn: "Eliminar", saving: "Guardando...", saved: "Guardado!", sending: "Enviando USDC on-chain...", minting: "Creando NFT..." },
  pt: { title: "Painel Admin", addEmployee: "Adicionar funcionário", empName: "Nome completo", empWallet: "Endereço carteira (0x...)", empSalary: "Salário mensal (USDC)", addBtn: "Adicionar", employees: "Funcionários", salary: "Salário (USDC)", wallet: "Carteira", status: "Status", action: "Ação", send: "Enviar USDC", locked: "Bloqueado", ready: "Pronto", paid: "Pago", days: "dias", newNft: "Novo NFT", employee: "Selecionar", amount: "Valor (USDC)", create: "Criar & Stakear NFT", notConnected: "Conecte sua carteira", totalEmp: "Total funcionários", totalLocked: "NFTs bloqueados", totalReady: "Pronto para pagar", deleteBtn: "Remover", saving: "Salvando...", saved: "Salvo!", sending: "Enviando USDC on-chain...", minting: "Criando NFT..." },
  tr: { title: "Yönetici Paneli", addEmployee: "Çalışan Ekle", empName: "Ad Soyad", empWallet: "Cüzdan Adresi (0x...)", empSalary: "Aylık Maaş (USDC)", addBtn: "Ekle", employees: "Çalışanlar", salary: "Maaş (USDC)", wallet: "Cüzdan", status: "Durum", action: "İşlem", send: "USDC Gönder", locked: "Kilitli", ready: "Hazır", paid: "Ödendi", days: "gün", newNft: "Yeni Maaş NFT", employee: "Çalışan Seç", amount: "Miktar (USDC)", create: "NFT Oluştur & Stake Et", notConnected: "Lütfen cüzdanınızı bağlayın", totalEmp: "Toplam Çalışan", totalLocked: "Kilitli NFT", totalReady: "Ödemeye Hazır", deleteBtn: "Sil", saving: "Kaydediliyor...", saved: "Kaydedildi!", sending: "USDC blockchain'e gönderiliyor...", minting: "NFT oluşturuluyor..." },
};

type Employee = { name: string; salary: number; status: string; days: number; wallet: string; unlockDate: number; };
type Toast = { msg: string; type: "success" | "loading" | "error" };

function AdminPanel() {
  const [lang, setLang] = useState("en");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newName, setNewName] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [mintEmployee, setMintEmployee] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();
  const t = T[lang];

  const usdcContract = getContract({
    client,
    chain: arcTestnet,
    address: USDC_ARC_TESTNET,
  });

  useEffect(() => {
    const saved = localStorage.getItem("payrollchain_employees");
    if (saved) setEmployees(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("payrollchain_employees", JSON.stringify(employees));
    }
  }, [employees]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmployees(prev => prev.map(emp => {
        if (emp.status === "locked" && emp.unlockDate > 0) {
          const daysLeft = Math.ceil((emp.unlockDate - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 0) return { ...emp, status: "ready", days: 0 };
          return { ...emp, days: daysLeft };
        }
        return emp;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string, type: "success" | "loading" | "error" = "success") => {
    setToast({ msg, type });
    if (type !== "loading") setTimeout(() => setToast(null), 3500);
  };

  const addEmployee = () => {
    if (!newName || !newWallet || !newSalary) return;
    if (!newWallet.startsWith("0x") || newWallet.length < 10) {
      showToast(lang === "tr" ? "Geçersiz cüzdan adresi!" : "Invalid wallet address!", "error");
      return;
    }
    showToast(t.saving, "loading");
    setTimeout(() => {
      const emp: Employee = { name: newName, salary: parseInt(newSalary), status: "ready", days: 0, wallet: newWallet, unlockDate: 0 };
      setEmployees(prev => {
        const updated = [...prev, emp];
        localStorage.setItem("payrollchain_employees", JSON.stringify(updated));
        return updated;
      });
      setNewName(""); setNewWallet(""); setNewSalary("");
      setShowAddForm(false);
      showToast(t.saved, "success");
    }, 1200);
  };

  const removeEmployee = (i: number) => {
    setEmployees(prev => {
      const updated = prev.filter((_, idx) => idx !== i);
      localStorage.setItem("payrollchain_employees", JSON.stringify(updated));
      return updated;
    });
  };

  const sendPayment = (i: number) => {
    const emp = employees[i];
    showToast(t.sending, "loading");
    try {
      const transaction = transfer({
        contract: usdcContract,
        to: emp.wallet as `0x${string}`,
        amount: emp.salary,
      });
      sendTx(transaction, {
        onSuccess: () => {
          setEmployees(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: "paid" };
            localStorage.setItem("payrollchain_employees", JSON.stringify(updated));
            return updated;
          });
          showToast(lang === "tr" ? `${emp.name} adlı çalışana ${emp.salary} USDC gönderildi!` : `${emp.salary} USDC sent to ${emp.name}!`, "success");
        },
        onError: () => {
          showToast(lang === "tr" ? "İşlem başarısız! USDC bakiyenizi kontrol edin." : "Transaction failed! Check your USDC balance.", "error");
        },
      });
    } catch {
      showToast(lang === "tr" ? "Hata oluştu!" : "Error occurred!", "error");
    }
  };

  const mintNFT = () => {
    if (!mintEmployee || !mintAmount) return;
    showToast(t.minting, "loading");
    const unlockDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
    setTimeout(() => {
      setEmployees(prev => {
        const updated = prev.map(e => e.name === mintEmployee
          ? { ...e, status: "locked", days: 30, salary: parseInt(mintAmount), unlockDate }
          : e
        );
        localStorage.setItem("payrollchain_employees", JSON.stringify(updated));
        return updated;
      });
      setMintEmployee(""); setMintAmount("");
      showToast(lang === "tr" ? "NFT oluşturuldu ve 30 gün stake'e alındı!" : "NFT minted and staked for 30 days!", "success");
    }, 2000);
  };

  const statusColor = (s: string) => s === "ready" ? "#22c55e" : s === "locked" ? "#f59e0b" : "#6b7280";
  const toastBg = toast?.type === "success" ? "#22c55e" : toast?.type === "error" ? "#ef4444" : "#3b82f6";
  const s: React.CSSProperties = { padding: "9px 14px", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#fff", fontSize: 14, width: "100%" };

  if (!account) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif", gap: 16 }}>
      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>PayrollChain</div>
      <p style={{ color: "#666" }}>{t.notConnected}</p>
      <ConnectButton client={client} chain={arcTestnet} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "sans-serif", padding: "24px 32px" }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: toastBg, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, zIndex: 999, display: "flex", alignItems: "center", gap: 8 }}>
          {toast.type === "loading" && <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>PayrollChain</h1>
          <p style={{ color: "#555", fontSize: 13, margin: "4px 0 0" }}>{t.title} · Arc Testnet · {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.slice(0, 10)}...</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {Object.keys(T).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #333", background: lang === l ? "#fff" : "transparent", color: lang === l ? "#000" : "#fff", cursor: "pointer", fontSize: 12 }}>{l.toUpperCase()}</button>
          ))}
          <ConnectButton client={client} chain={arcTestnet} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: t.totalEmp, value: employees.length, color: "#fff" },
          { label: t.totalLocked, value: employees.filter(e => e.status === "locked").length, color: "#f59e0b" },
          { label: t.totalReady, value: employees.filter(e => e.status === "ready").length, color: "#22c55e" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#141414", borderRadius: 12, padding: "16px 20px", border: "1px solid #1e1e1e" }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#141414", borderRadius: 12, padding: 20, border: "1px solid #1e1e1e" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#aaa", margin: 0 }}>{t.addEmployee}</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #333", background: showAddForm ? "#333" : "transparent", color: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{showAddForm ? "−" : "+"}</button>
          </div>
          {showAddForm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={s} placeholder={t.empName} value={newName} onChange={e => setNewName(e.target.value)} />
              <input style={s} placeholder={t.empWallet} value={newWallet} onChange={e => setNewWallet(e.target.value)} />
              <input style={s} type="number" placeholder={t.empSalary} value={newSalary} onChange={e => setNewSalary(e.target.value)} />
              <button onClick={addEmployee} style={{ padding: "10px", borderRadius: 8, background: "#fff", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none" }}>{t.addBtn}</button>
            </div>
          ) : (
            <p style={{ color: "#444", fontSize: 13, margin: 0 }}>
              {lang === "tr" ? `${employees.length} çalışan kayıtlı. Eklemek için + butonuna bas.` : `${employees.length} employee(s) registered. Click + to add.`}
            </p>
          )}
        </div>

        <div style={{ background: "#141414", borderRadius: 12, padding: 20, border: "1px solid #1e1e1e" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#aaa", marginBottom: 16, margin: "0 0 16px" }}>{t.newNft}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select value={mintEmployee} onChange={e => setMintEmployee(e.target.value)} style={{ ...s, appearance: "none" as const }}>
              <option value="">{t.employee}</option>
              {employees.filter(e => e.status !== "locked").map(e => <option key={e.name} value={e.name}>{e.name} — {e.salary.toLocaleString()} USDC</option>)}
            </select>
            <input type="number" placeholder={t.amount} value={mintAmount} onChange={e => setMintAmount(e.target.value)} style={s} />
            <button onClick={mintNFT} style={{ padding: "10px", borderRadius: 8, background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none" }}>{t.create}</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#141414", borderRadius: 12, border: "1px solid #1e1e1e", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
              {[t.employees, t.salary, t.wallet, t.status, "", t.action].map((h, i) => (
                <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#333" }}>
                {lang === "tr" ? "Henüz çalışan eklenmedi." : "No employees yet. Add one above."}
              </td></tr>
            ) : employees.map((emp, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #141414" }}>
                <td style={{ padding: "13px 16px", fontWeight: 500 }}>{emp.name}</td>
                <td style={{ padding: "13px 16px", color: "#aaa" }}>{emp.salary.toLocaleString()} USDC</td>
                <td style={{ padding: "13px 16px", color: "#555", fontSize: 11, fontFamily: "monospace" }}>{emp.wallet.slice(0, 8)}...{emp.wallet.slice(-6)}</td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ background: statusColor(emp.status) + "22", color: statusColor(emp.status), padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                    {emp.status === "locked" ? t.locked : emp.status === "ready" ? t.ready : t.paid}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", color: "#555", fontSize: 12 }}>
                  {emp.status === "locked" ? `${emp.days} ${t.days}` : "—"}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {emp.status === "ready" ? (
                      <button onClick={() => sendPayment(i)} style={{ padding: "5px 14px", borderRadius: 7, background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none" }}>{t.send}</button>
                    ) : emp.status === "locked" ? (
                      <button disabled style={{ padding: "5px 14px", borderRadius: 7, background: "#1a1a1a", color: "#444", fontSize: 12, cursor: "not-allowed", border: "none" }}>{t.send}</button>
                    ) : (
                      <span style={{ color: "#444", fontSize: 12, padding: "5px 0" }}>{t.paid}</span>
                    )}
                    <button onClick={() => removeEmployee(i)} style={{ padding: "5px 10px", borderRadius: 7, background: "transparent", color: "#555", fontSize: 12, cursor: "pointer", border: "1px solid #2a2a2a" }}>{t.deleteBtn}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <ThirdwebProvider><AdminPanel /></ThirdwebProvider>;
}