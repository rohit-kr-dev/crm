// src/contexts/WorkspaceContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  collection, onSnapshot, addDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Property {
  id: string; name: string; location: string; price: number; type: string;
  status: "available" | "sold" | "pending";
}
export interface Agent {
  id: string; name: string; email: string; phone: string;
  salesCount: number; revenue: number; rating: number;
}
export interface Transaction {
  id: string; description: string; amount: number;
  type: "income" | "expense"; date: string; category: string;
}
export interface Lead {
  id: string; name: string; email: string; phone: string;
  status: "new" | "contacted" | "qualified" | "lost"; source: string;
}
export interface Campaign {
  id: string; name: string; platform: string; budget: number;
  leads: number; status: "active" | "paused" | "completed";
}

interface WorkspaceData {
  properties: Property[]; agents: Agent[]; transactions: Transaction[];
  leads: Lead[]; campaigns: Campaign[]; userRole: string; loading: boolean;
}

interface WorkspaceContextType {
  data: WorkspaceData;
  setUserRole: (role: string) => void;
  refreshData: () => Promise<void>;
  addProperty: (p: Omit<Property, "id">) => Promise<void>;
  addAgent: (a: Omit<Agent, "id">) => Promise<void>;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  addLead: (l: Omit<Lead, "id">) => Promise<void>;
  addCampaign: (c: Omit<Campaign, "id">) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);
const COLS = ["properties", "agents", "transactions", "leads", "campaigns"] as const;
type ColName = typeof COLS[number];

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userRole, setUserRole] = useState("Admin");
  const [loading, setLoading] = useState(true);

  const applySnapshot = (col: ColName, docs: { id: string; [k: string]: unknown }[]) => {
    if (col === "properties") setProperties(docs as unknown as Property[]);
    else if (col === "agents") setAgents(docs as unknown as Agent[]);
    else if (col === "transactions") setTransactions(docs as unknown as Transaction[]);
    else if (col === "leads") setLeads(docs as unknown as Lead[]);
    else if (col === "campaigns") setCampaigns(docs as unknown as Campaign[]);
  };

  useEffect(() => {
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= COLS.length) setLoading(false); };
    const unsubs = COLS.map(col => {
      const q = query(collection(db, col), orderBy("createdAt", "desc"));
      return onSnapshot(q, snap => {
        applySnapshot(col, snap.docs.map(d => ({ id: d.id, ...d.data() })));
        done();
      }, () => done());
    });
    return () => unsubs.forEach(u => u());
  }, []);

  const refreshData = async () => {
    await Promise.all(COLS.map(async col => {
      const snap = await getDocs(query(collection(db, col), orderBy("createdAt", "desc")));
      applySnapshot(col, snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));
  };

  const addItem = (col: string) => async (item: object) => {
    await addDoc(collection(db, col), { ...item, createdAt: serverTimestamp() });
  };

  const addProperty    = addItem("properties") as (p: Omit<Property, "id">) => Promise<void>;
  const addAgent       = addItem("agents")     as (a: Omit<Agent, "id">) => Promise<void>;
  const addTransaction = addItem("transactions") as (t: Omit<Transaction, "id">) => Promise<void>;
  const addLead        = addItem("leads")      as (l: Omit<Lead, "id">) => Promise<void>;
  const addCampaign    = addItem("campaigns")  as (c: Omit<Campaign, "id">) => Promise<void>;

  const deleteProperty    = (id: string) => deleteDoc(doc(db, "properties",   id));
  const deleteAgent       = (id: string) => deleteDoc(doc(db, "agents",       id));
  const deleteTransaction = (id: string) => deleteDoc(doc(db, "transactions", id));
  const deleteLead        = (id: string) => deleteDoc(doc(db, "leads",        id));
  const deleteCampaign    = (id: string) => deleteDoc(doc(db, "campaigns",    id));

  return (
    <WorkspaceContext.Provider value={{
      data: { properties, agents, transactions, leads, campaigns, userRole, loading },
      setUserRole, refreshData,
      addProperty, addAgent, addTransaction, addLead, addCampaign,
      deleteProperty, deleteAgent, deleteTransaction, deleteLead, deleteCampaign,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};