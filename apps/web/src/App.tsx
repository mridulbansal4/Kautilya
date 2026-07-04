import { Navigate, Route, Routes } from "react-router-dom";
import { DemoShell } from "./components/DemoShell";
import { OpsApp } from "./ops/OpsApp";
import AccountSummary from "./screens/AccountSummary";
import AIPreferences from "./screens/AIPreferences";
import BillPay from "./screens/BillPay";
import FDDetail from "./screens/FDDetail";
import FDList from "./screens/FDList";
import Home from "./screens/Home";
import InstaLoan from "./screens/InstaLoan";
import Investments from "./screens/Investments";
import Login from "./screens/Login";
import Marketplace from "./screens/Marketplace";
import NewFD from "./screens/NewFD";
import Notifications from "./screens/Notifications";
import PayHub from "./screens/PayHub";
import Profile from "./screens/Profile";
import Rewards from "./screens/Rewards";
import ScanPay from "./screens/ScanPay";
import Splash from "./screens/Splash";
import Transfer from "./screens/Transfer";
import TransactionHistory from "./screens/TransactionHistory";
import YonoCash from "./screens/YonoCash";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/home" replace />} />

      {/* The phone app — DemoShell renders the persona stage; screens render inside the phone. */}
      <Route path="/app" element={<DemoShell />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        {/* YONO Pay hub + flows */}
        <Route path="pay" element={<PayHub />} />
        <Route path="pay/send" element={<Transfer />} />
        <Route path="pay/scan" element={<ScanPay />} />
        <Route path="yono-cash" element={<YonoCash />} />
        <Route path="bills" element={<BillPay />} />
        {/* Invest hub */}
        <Route path="invest" element={<Investments />} />
        <Route path="fd" element={<FDList />} />
        <Route path="fd/new" element={<NewFD />} />
        <Route path="fd/:id" element={<FDDetail />} />
        {/* Loans, shop, rewards */}
        <Route path="loan" element={<InstaLoan />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="rewards" element={<Rewards />} />
        {/* account + profile */}
        <Route path="account" element={<AccountSummary />} />
        <Route path="transactions" element={<TransactionHistory />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/ai" element={<AIPreferences />} />
        <Route path="splash" element={<Splash />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* Executive dashboards (desktop) */}
      <Route path="/ops" element={<OpsApp />} />

      <Route path="*" element={<Navigate to="/app/home" replace />} />
    </Routes>
  );
}
