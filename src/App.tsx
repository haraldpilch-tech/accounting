import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  CreditCard,
  Target,
  PlusCircle,
  ArrowRightLeft,
  Filter,
  Download,
  Search,
  Moon,
  Sun,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  DollarSign,
  Calendar,
  PiggyBank,
  Check,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Layers,
  HelpCircle,
  RotateCcw,
  Plus,
  Sliders,
  Globe,
  Coins,
  Cloud,
  CloudOff,
  KeyRound,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { getStoredKey, storeKey, clearKey, loadState, saveState } from './sync';

// --- CURRENCY DEFINITIONS & ESTIMATED CONVERSION RATES TO EUR ---
// Base reference = 1.0 EUR
const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro', rateToEUR: 1.0 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToEUR: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToEUR: 1.18 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToEUR: 0.0062 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToEUR: 0.67 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToEUR: 0.60 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToEUR: 1.05 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToEUR: 0.011 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rateToEUR: 0.13 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rateToEUR: 0.16 },
];

const getCurrency = (code) => CURRENCIES.find(c => c.code === code) || CURRENCIES[0];

const formatMoney = (amount, currencyCode = 'EUR') => {
  const curr = getCurrency(currencyCode);
  return `${curr.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- INITIAL DEFAULT DATA WITH EUR AS PRIMARY ---
const INITIAL_ACCOUNTS = [
  { id: 'acc-1', name: 'Main Euro Checking', type: 'Checking', currency: 'EUR', balance: 6450.00, accountNumber: '•••• 4821', color: 'from-blue-500 to-indigo-600', notes: 'Primary salary and bill payment account' },
  { id: 'acc-2', name: 'Euro High-Yield Savings', type: 'Savings', currency: 'EUR', balance: 14200.00, accountNumber: '•••• 8832', color: 'from-emerald-500 to-teal-600', notes: 'Emergency savings account' },
  { id: 'acc-3', name: 'US Dollar Investment Wallet', type: 'Investment', currency: 'USD', balance: 12500.00, accountNumber: '•••• 1154', color: 'from-amber-500 to-orange-600', notes: 'US stock portfolio' },
  { id: 'acc-4', name: 'UK Business Account', type: 'Checking', currency: 'GBP', balance: 2800.00, accountNumber: '•••• 9102', color: 'from-violet-500 to-purple-600', notes: 'Freelance payouts in Sterling' },
  { id: 'acc-5', name: 'Tokyo Travel Cash', type: 'Cash', currency: 'JPY', balance: 150000.00, accountNumber: 'Cash Box', color: 'from-rose-500 to-red-600', notes: 'Physical cash yen' },
];

const INITIAL_TRANSACTIONS = [
  { id: 'tx-1', date: '2026-10-18', description: 'Monthly Tech Salary', category: 'Salary', amount: 3800.00, type: 'income', accountId: 'acc-1', status: 'Cleared', notes: 'Main Euro payroll payout' },
  { id: 'tx-2', date: '2026-10-17', description: 'Supermarket Groceries', category: 'Groceries', amount: 124.50, type: 'expense', accountId: 'acc-1', status: 'Cleared', notes: 'Weekly grocery run' },
  { id: 'tx-3', date: '2026-10-15', description: 'London Design Consulting', category: 'Freelance', amount: 750.00, type: 'income', accountId: 'acc-4', status: 'Cleared', notes: 'Freelance project fee (£)' },
  { id: 'tx-4', date: '2026-10-14', description: 'Power & Utility Bill', category: 'Utilities', amount: 89.20, type: 'expense', accountId: 'acc-1', status: 'Cleared', notes: 'Electricity and heating' },
  { id: 'tx-5', date: '2026-10-12', description: 'Tokyo Electronics', category: 'Electronics', amount: 18500.00, type: 'expense', accountId: 'acc-5', status: 'Cleared', notes: 'Camera accessory purchase' },
];

const INITIAL_BUDGETS = [
  { id: 'b-1', category: 'Groceries', limit: 500, color: '#3B82F6' },
  { id: 'b-2', category: 'Dining Out', limit: 250, color: '#F59E0B' },
  { id: 'b-3', category: 'Entertainment', limit: 180, color: '#EC4899' },
  { id: 'b-4', category: 'Utilities', limit: 200, color: '#10B981' },
  { id: 'b-5', category: 'Housing', limit: 1400, color: '#6366F1' },
];

const INITIAL_GOALS = [
  { id: 'g-1', name: 'Emergency Reserve', target: 20000, current: 14200, date: '2026-12-31', currency: 'EUR' },
  { id: 'g-2', name: 'US Tech Trip 2027', target: 6000, current: 3500, date: '2027-05-15', currency: 'USD' },
  { id: 'g-3', name: 'Tokyo Vacation', target: 600000, current: 150000, date: '2027-11-30', currency: 'JPY' },
];

const COLOR_THEMES = [
  { name: 'Blue Indigo', value: 'from-blue-500 to-indigo-600' },
  { name: 'Emerald Teal', value: 'from-emerald-500 to-teal-600' },
  { name: 'Violet Purple', value: 'from-violet-500 to-purple-600' },
  { name: 'Amber Orange', value: 'from-amber-500 to-orange-600' },
  { name: 'Rose Red', value: 'from-rose-500 to-red-600' },
  { name: 'Slate Gray', value: 'from-slate-600 to-gray-800' }
];

const CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Groceries', 'Dining Out', 
  'Utilities', 'Housing', 'Entertainment', 'Transportation', 
  'Health & Fitness', 'Electronics', 'Shopping', 'Other'
];

const CATEGORY_COLORS = {
  Salary: '#10B981',
  Freelance: '#3B82F6',
  Investments: '#8B5CF6',
  Groceries: '#06B6D4',
  'Dining Out': '#F59E0B',
  Utilities: '#14B8A6',
  Housing: '#6366F1',
  Entertainment: '#EC4899',
  Transportation: '#A855F7',
  'Health & Fitness': '#EF4444',
  Electronics: '#3B82F6',
  Shopping: '#F43F5E',
  Other: '#64748B'
};

export default function App() {
  // Base Currency state (Defaults to EUR)
  const [baseCurrency, setBaseCurrency] = useState(() => {
    return localStorage.getItem('pf_base_currency') || 'EUR';
  });

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // App Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State loaded from LocalStorage
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('pf_accounts_v3');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('pf_transactions_v3');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('pf_budgets_v3');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('pf_goals_v3');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // --- Live database sync (Postgres via /api/state) ---
  const [accessKey, setAccessKey] = useState(() => getStoredKey());
  const [syncStatus, setSyncStatus] = useState('syncing');
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const hydratedRef = useRef(false);

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Goal create / edit form
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    target: '',
    current: '0',
    date: '',
    currency: 'EUR'
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem('pf_base_currency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    localStorage.setItem('pf_accounts_v3', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('pf_transactions_v3', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pf_budgets_v3', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('pf_goals_v3', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Pull the shared state once the app has a key
  useEffect(() => {
    if (!accessKey) {
      setSyncStatus('locked');
      return;
    }

    let cancelled = false;
    setSyncStatus('syncing');

    loadState(accessKey)
      .then(({ data }) => {
        if (cancelled) return;

        if (data) {
          if (Array.isArray(data.accounts)) setAccounts(data.accounts);
          if (Array.isArray(data.transactions)) setTransactions(data.transactions);
          if (Array.isArray(data.budgets)) setBudgets(data.budgets);
          if (Array.isArray(data.goals)) setGoals(data.goals);
          if (typeof data.baseCurrency === 'string') setBaseCurrency(data.baseCurrency);
          hydratedRef.current = true;
          setSyncStatus('saved');
        } else {
          // First run: seed the database with what is already in this browser
          hydratedRef.current = true;
          setSyncStatus('syncing');
          saveState(accessKey, { accounts, transactions, budgets, goals, baseCurrency })
            .then(() => setSyncStatus('saved'))
            .catch(() => setSyncStatus('offline'));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err && err.status === 401) {
          clearKey();
          setAccessKey('');
          setSyncStatus('locked');
          setKeyError('That key did not match. Please try again.');
        } else {
          hydratedRef.current = true;
          setSyncStatus('offline');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessKey]);

  // Push changes to the database (debounced)
  useEffect(() => {
    if (!accessKey || !hydratedRef.current) return;

    const timer = setTimeout(() => {
      setSyncStatus('syncing');
      saveState(accessKey, { accounts, transactions, budgets, goals, baseCurrency })
        .then(() => setSyncStatus('saved'))
        .catch((err) => {
          if (err && err.status === 401) {
            clearKey();
            setAccessKey('');
            setSyncStatus('locked');
          } else {
            setSyncStatus('offline');
          }
        });
    }, 700);

    return () => clearTimeout(timer);
  }, [accessKey, accounts, transactions, budgets, goals, baseCurrency]);

  const handleUnlock = async (event) => {
    event.preventDefault();
    const value = keyInput.trim();
    if (!value) return;

    setKeyError('');
    try {
      await loadState(value);
      storeKey(value);
      setAccessKey(value);
      setKeyInput('');
    } catch (err) {
      setKeyError(
        err && err.status === 401
          ? 'That key did not match. Please try again.'
          : 'Could not reach the server. Check your connection.'
      );
    }
  };

  // Form States
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'Checking',
    currency: 'EUR',
    balance: '',
    accountNumber: '',
    color: COLOR_THEMES[0].value,
    notes: ''
  });

  const [txForm, setTxForm] = useState({
    description: '',
    amount: '',
    currency: accounts[0]?.currency || 'EUR',
    type: 'expense',
    category: 'Groceries',
    accountId: accounts[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    status: 'Cleared',
    notes: ''
  });

  const [budgetForm, setBudgetForm] = useState({ category: 'Groceries', limit: '' });

  const [transferForm, setTransferForm] = useState({
    fromAccountId: accounts[0]?.id || '',
    toAccountId: accounts[1]?.id || '',
    sourceAmount: '',
    notes: 'Internal Transfer'
  });

  const [depositAmount, setDepositAmount] = useState('');

  // Helper to convert money to Base Currency (EUR default)
  const convertToBase = (amount, fromCurrencyCode) => {
    const fromRateEUR = getCurrency(fromCurrencyCode).rateToEUR;
    const baseRateEUR = getCurrency(baseCurrency).rateToEUR;
    const amountInEUR = amount * fromRateEUR;
    return amountInEUR / baseRateEUR;
  };

  // Convert between two arbitrary currencies
  const convertCurrency = (amount, fromCurrencyCode, toCurrencyCode) => {
    const from = getCurrency(fromCurrencyCode).rateToEUR;
    const to = getCurrency(toCurrencyCode).rateToEUR;
    return (amount * from) / to;
  };

  // --- COMPUTED AGGREGATED STATS (Converted to Base Currency) ---
  const totalNetWorthBase = useMemo(() => {
    return accounts.reduce((acc, curr) => {
      return acc + convertToBase(curr.balance, curr.currency);
    }, 0);
  }, [accounts, baseCurrency]);

  const monthlyIncomeBase = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => {
        const acc = accounts.find(a => a.id === t.accountId);
        const curr = t.currency || (acc ? acc.currency : 'EUR');
        return sum + convertToBase(t.amount, curr);
      }, 0);
  }, [transactions, accounts, baseCurrency]);

  const monthlyExpensesBase = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => {
        const acc = accounts.find(a => a.id === t.accountId);
        const curr = t.currency || (acc ? acc.currency : 'EUR');
        return sum + convertToBase(t.amount, curr);
      }, 0);
  }, [transactions, accounts, baseCurrency]);

  const monthlySavingsBase = useMemo(() => {
    return monthlyIncomeBase - monthlyExpensesBase;
  }, [monthlyIncomeBase, monthlyExpensesBase]);

  // Category Spending Data
  const categorySpendingData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const map = {};
    
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === currentMonth)
      .forEach(t => {
        const acc = accounts.find(a => a.id === t.accountId);
        const amountInBase = convertToBase(t.amount, t.currency || acc?.currency || 'EUR');
        map[t.category] = (map[t.category] || 0) + amountInBase;
      });

    return Object.keys(map).map(cat => ({
      name: cat,
      value: Math.round(map[cat]),
      color: CATEGORY_COLORS[cat] || '#94A3B8'
    }));
  }, [transactions, accounts, baseCurrency]);

  // Trend Data
  const cashFlowTrendData = useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    return months.map((m, idx) => {
      if (idx === 5) {
        return {
          month: m,
          Income: Math.round(monthlyIncomeBase),
          Expenses: Math.round(monthlyExpensesBase)
        };
      }
      return {
        month: m,
        Income: Math.round(monthlyIncomeBase * (0.88 + Math.random() * 0.25)),
        Expenses: Math.round(monthlyExpensesBase * (0.85 + Math.random() * 0.3))
      };
    });
  }, [monthlyIncomeBase, monthlyExpensesBase]);

  // Filtered Transactions List
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesAccount = filterAccount === 'all' || t.accountId === filterAccount;
      
      return matchesSearch && matchesType && matchesAccount;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchTerm, filterType, filterAccount]);

  // --- ACTIONS & HANDLERS ---
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all accounts and transactions back to EUR sample defaults?")) {
      setAccounts(INITIAL_ACCOUNTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setGoals(INITIAL_GOALS);
      setBaseCurrency('EUR');
      localStorage.clear();
    }
  };

  // Account Operations
  const handleOpenAccountModal = (acc = null) => {
    if (acc) {
      setEditingAccount(acc);
      setAccountForm({
        name: acc.name,
        type: acc.type,
        currency: acc.currency || 'EUR',
        balance: acc.balance.toString(),
        accountNumber: acc.accountNumber || '',
        color: acc.color || COLOR_THEMES[0].value,
        notes: acc.notes || ''
      });
    } else {
      setEditingAccount(null);
      setAccountForm({
        name: '',
        type: 'Checking',
        currency: baseCurrency,
        balance: '0',
        accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
        color: COLOR_THEMES[0].value,
        notes: ''
      });
    }
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!accountForm.name || accountForm.balance === '') return;

    const numBalance = parseFloat(accountForm.balance);

    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? {
        ...a,
        name: accountForm.name,
        type: accountForm.type,
        currency: accountForm.currency,
        balance: numBalance,
        accountNumber: accountForm.accountNumber,
        color: accountForm.color,
        notes: accountForm.notes
      } : a));
    } else {
      const newAcc = {
        id: `acc-${Date.now()}`,
        name: accountForm.name,
        type: accountForm.type,
        currency: accountForm.currency,
        balance: numBalance,
        accountNumber: accountForm.accountNumber || '•••• 1234',
        color: accountForm.color,
        notes: accountForm.notes
      };
      setAccounts(prev => [...prev, newAcc]);
    }
    setIsAccountModalOpen(false);
  };

  const handleDeleteAccount = (accId) => {
    if (accounts.length <= 1) {
      alert("At least one active account is required.");
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== accId));
    setTransactions(prev => prev.filter(t => t.accountId !== accId));
    setDeleteAccountConfirm(null);
  };

  // Transaction Operations
  const handleOpenTxModal = (tx = null) => {
    if (tx) {
      setEditingTx(tx);
      setTxForm({
        description: tx.description,
        amount: tx.amount,
        currency: tx.currency || accounts.find(a => a.id === tx.accountId)?.currency || 'EUR',
        type: tx.type,
        category: tx.category,
        accountId: tx.accountId,
        date: tx.date,
        status: tx.status,
        notes: tx.notes || ''
      });
    } else {
      const lastAccountId = localStorage.getItem('pf_last_account');
      const lastAccount = accounts.find(a => a.id === lastAccountId) || accounts[0];

      setEditingTx(null);
      setTxForm({
        description: '',
        amount: '',
        currency: lastAccount?.currency || 'EUR',
        type: 'expense',
        category: 'Groceries',
        accountId: lastAccount?.id || '',
        date: new Date().toISOString().split('T')[0],
        status: 'Cleared',
        notes: ''
      });
    }
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!txForm.description || !txForm.amount) return;

    const numAmount = parseFloat(txForm.amount);
    const txCurrency = txForm.currency || 'EUR';

    try {
      localStorage.setItem('pf_last_account', txForm.accountId);
    } catch {
      /* ignore */
    }
    const targetAccount = accounts.find(a => a.id === txForm.accountId);
    const accountCurrency = targetAccount?.currency || 'EUR';
    const amountInAccountCurrency = convertCurrency(numAmount, txCurrency, accountCurrency);

    if (editingTx) {
      const oldTx = editingTx;
      const oldAccount = accounts.find(a => a.id === oldTx.accountId);
      const oldCurrency = oldTx.currency || oldAccount?.currency || 'EUR';
      const oldAmountInAccount = convertCurrency(oldTx.amount, oldCurrency, oldAccount?.currency || 'EUR');

      setAccounts(prev => prev.map(acc => {
        let balance = acc.balance;

        // Undo the original posting
        if (acc.id === oldTx.accountId) {
          balance = oldTx.type === 'income' ? balance - oldAmountInAccount : balance + oldAmountInAccount;
        }

        // Apply the edited posting
        if (acc.id === txForm.accountId) {
          balance = txForm.type === 'income'
            ? balance + amountInAccountCurrency
            : balance - amountInAccountCurrency;
        }

        return balance === acc.balance ? acc : { ...acc, balance };
      }));

      setTransactions(prev => prev.map(t =>
        t.id === editingTx.id
          ? { ...t, ...txForm, amount: numAmount, currency: txCurrency }
          : t
      ));
    } else {
      const newTx = {
        id: `tx-${Date.now()}`,
        ...txForm,
        amount: numAmount,
        currency: txCurrency
      };

      setTransactions(prev => [newTx, ...prev]);

      setAccounts(prev => prev.map(acc => {
        if (acc.id === txForm.accountId) {
          const newBal = txForm.type === 'income'
            ? acc.balance + amountInAccountCurrency
            : acc.balance - amountInAccountCurrency;
          return { ...acc, balance: newBal };
        }
        return acc;
      }));
    }

    setIsTxModalOpen(false);
  };

  const handleDeleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setAccounts(prev => prev.map(acc => {
      if (acc.id === tx.accountId) {
        const txCurrency = tx.currency || acc.currency || 'EUR';
        const amountInAccount = convertCurrency(tx.amount, txCurrency, acc.currency || 'EUR');
        const reverted = tx.type === 'income' ? acc.balance - amountInAccount : acc.balance + amountInAccount;
        return { ...acc, balance: reverted };
      }
      return acc;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Multi-Currency Inter-Account Transfer Execution
  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    const sourceAmt = parseFloat(transferForm.sourceAmount);
    if (!sourceAmt || transferForm.fromAccountId === transferForm.toAccountId) return;

    const fromAcc = accounts.find(a => a.id === transferForm.fromAccountId);
    const toAcc = accounts.find(a => a.id === transferForm.toAccountId);

    if (!fromAcc || !toAcc) return;

    // Calculate dynamic cross-rate conversion with EUR reference
    const fromRateEUR = getCurrency(fromAcc.currency).rateToEUR;
    const toRateEUR = getCurrency(toAcc.currency).rateToEUR;
    const destAmt = (sourceAmt * fromRateEUR) / toRateEUR;

    setAccounts(prev => prev.map(a => {
      if (a.id === transferForm.fromAccountId) return { ...a, balance: a.balance - sourceAmt };
      if (a.id === transferForm.toAccountId) return { ...a, balance: a.balance + destAmt };
      return a;
    }));

    const transferTxOut = {
      id: `tx-${Date.now()}-1`,
      date: new Date().toISOString().split('T')[0],
      description: `Transfer to ${toAcc.name} (${toAcc.currency})`,
      category: 'Other',
      amount: sourceAmt,
      type: 'expense',
      accountId: fromAcc.id,
      status: 'Cleared',
      notes: transferForm.notes
    };

    const transferTxIn = {
      id: `tx-${Date.now()}-2`,
      date: new Date().toISOString().split('T')[0],
      description: `Transfer from ${fromAcc.name} (${fromAcc.currency})`,
      category: 'Other',
      amount: destAmt,
      type: 'income',
      accountId: toAcc.id,
      status: 'Cleared',
      notes: transferForm.notes
    };

    setTransactions(prev => [transferTxOut, transferTxIn, ...prev]);
    setIsTransferModalOpen(false);
    setTransferForm({ fromAccountId: accounts[0]?.id || '', toAccountId: accounts[1]?.id || '', sourceAmount: '', notes: 'Internal Transfer' });
  };

  // Budget Handlers
  const handleOpenBudgetModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setBudgetForm({ category: budget.category, limit: budget.limit.toString() });
    } else {
      setEditingBudget(null);
      setBudgetForm({ category: CATEGORIES[0], limit: '500' });
    }
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const limitNum = parseFloat(budgetForm.limit);
    if (!limitNum) return;

    if (editingBudget) {
      setBudgets(prev => prev.map(b => b.id === editingBudget.id ? { ...b, limit: limitNum } : b));
    } else {
      const existing = budgets.find(b => b.category === budgetForm.category);
      if (existing) {
        setBudgets(prev => prev.map(b => b.category === budgetForm.category ? { ...b, limit: limitNum } : b));
      } else {
        setBudgets(prev => [...prev, {
          id: `b-${Date.now()}`,
          category: budgetForm.category,
          limit: limitNum,
          color: CATEGORY_COLORS[budgetForm.category] || '#3B82F6'
        }]);
      }
    }
    setIsBudgetModalOpen(false);
  };

  // Goal create / edit / delete
  const handleOpenGoalForm = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({
        name: goal.name,
        target: goal.target.toString(),
        current: goal.current.toString(),
        date: goal.date || '',
        currency: goal.currency || 'EUR'
      });
    } else {
      setEditingGoal(null);
      setGoalForm({
        name: '',
        target: '',
        current: '0',
        date: new Date().toISOString().split('T')[0],
        currency: baseCurrency
      });
    }
    setIsGoalFormOpen(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    const target = parseFloat(goalForm.target);
    const current = parseFloat(goalForm.current) || 0;
    if (!goalForm.name.trim() || !target) return;

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? {
        ...g,
        name: goalForm.name.trim(),
        target,
        current,
        date: goalForm.date,
        currency: goalForm.currency
      } : g));
    } else {
      setGoals(prev => [...prev, {
        id: `g-${Date.now()}`,
        name: goalForm.name.trim(),
        target,
        current,
        date: goalForm.date,
        currency: goalForm.currency
      }]);
    }

    setIsGoalFormOpen(false);
  };

  const handleDeleteGoal = (goal) => {
    if (window.confirm(`Delete the goal "${goal.name}"?`)) {
      setGoals(prev => prev.filter(g => g.id !== goal.id));
    }
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = ['Date,Description,Category,Type,Amount,Currency,Account,Status,Notes'];
    const rows = filteredTransactions.map(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      return `"${t.date}","${t.description}","${t.category}","${t.type}",${t.amount},"${t.currency || acc?.currency || 'EUR'}","${acc?.name || 'Unknown'}","${t.status}","${t.notes || ''}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (syncStatus === 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-5">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg mr-3">
              <Wallet className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              AuraFinance
            </span>
          </div>

          <form
            onSubmit={handleUnlock}
            className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl"
          >
            <div className="flex items-center justify-center mb-5">
              <div className="p-3 rounded-2xl bg-slate-800 text-blue-400">
                <KeyRound className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-lg font-bold text-center text-slate-100">Unlock your books</h1>
            <p className="text-sm text-center text-slate-400 mt-2 mb-6">
              Your data lives in your own database. Enter your access key to continue.
            </p>

            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Access key
            </label>
            <input
              type="password"
              autoFocus
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 text-sm rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {keyError && (
              <p className="mt-3 text-xs font-medium text-rose-400">{keyError}</p>
            )}

            <button
              type="submit"
              className="mt-6 w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              Unlock
            </button>

            <p className="mt-5 text-[11px] text-center text-slate-500">
              Stored in Postgres. Nothing is sent anywhere else.
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className="flex h-screen overflow-hidden">

        {/* --- SIDEBAR NAVIGATION --- */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                AuraFinance
              </span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
              { id: 'accounts', label: 'Accounts & Wallets', icon: CreditCard },
              { id: 'budgets', label: 'Budgets & Goals', icon: Target },
              { id: 'reports', label: 'Analytics & Reports', icon: PieChartIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleResetData}
              className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Reset EUR Sample Data
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header Bar */}
          <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold capitalize text-slate-800 dark:text-slate-100">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Live sync indicator */}
              <div
                className={`hidden sm:flex items-center px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  syncStatus === 'saved'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : syncStatus === 'syncing'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                }`}
                title={syncStatus === 'offline' ? 'Working locally — will retry on the next change' : 'Synced with your database'}
              >
                {syncStatus === 'saved' && <Cloud className="w-3.5 h-3.5 mr-1.5" />}
                {syncStatus === 'syncing' && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {syncStatus === 'offline' && <CloudOff className="w-3.5 h-3.5 mr-1.5" />}
                {syncStatus === 'saved' ? 'Saved' : syncStatus === 'syncing' ? 'Saving' : 'Offline'}
              </div>

              {/* Primary Base Currency Selector */}
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Base:</span>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code} className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleOpenAccountModal()}
                className="hidden sm:flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-1 text-blue-600" />
                Add Account
              </button>

              <button
                onClick={() => handleOpenTxModal()}
                className="hidden sm:flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Log Transaction
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Dark/Light Mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Dynamic Main Body Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* ================= DASHBOARD TAB ================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Overview Cards (Aggregated in Base Currency - Default EUR) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Net Worth</span>
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Wallet className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-3 text-slate-900 dark:text-slate-50">
                      {formatMoney(totalNetWorthBase, baseCurrency)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Aggregated in {baseCurrency}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Income</span>
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-3 text-slate-900 dark:text-slate-50">
                      {formatMoney(monthlyIncomeBase, baseCurrency)}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> All accounts in {baseCurrency}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Expenses</span>
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-3 text-slate-900 dark:text-slate-50">
                      {formatMoney(monthlyExpensesBase, baseCurrency)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Converted to {baseCurrency}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Net Monthly Savings</span>
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <PiggyBank className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-3 text-slate-900 dark:text-slate-50">
                      {formatMoney(monthlySavingsBase, baseCurrency)}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      {monthlyIncomeBase > 0 ? ((monthlySavingsBase / monthlyIncomeBase) * 100).toFixed(1) : 0}% savings rate
                    </p>
                  </div>
                </div>

                {/* Dashboard Action Strip */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Quick Actions:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOpenAccountModal()}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 shadow-2xs flex items-center"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" /> Create Account
                    </button>
                    <button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-500 shadow-2xs flex items-center"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Cross-Currency Transfer
                    </button>
                    <button
                      onClick={() => handleOpenTxModal()}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-2xs flex items-center"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1" /> Log Expense
                    </button>
                  </div>
                </div>

                {/* Account Mini List on Dashboard */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Your Accounts & Currencies</h3>
                    <button onClick={() => setActiveTab('accounts')} className="text-xs font-semibold text-blue-600 hover:underline flex items-center">
                      Manage All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(acc => (
                      <div key={acc.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-10 rounded-full bg-gradient-to-b ${acc.color}`} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{acc.name}</p>
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {acc.currency}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{acc.type} • {acc.accountNumber}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center space-x-2">
                          <div>
                            <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              {formatMoney(acc.balance, acc.currency)}
                            </p>
                            {acc.currency !== baseCurrency && (
                              <p className="text-[10px] text-slate-400">
                                ≈ {formatMoney(convertToBase(acc.balance, acc.currency), baseCurrency)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleOpenAccountModal(acc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit Account"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Income vs Expenses Overview</h3>
                      <span className="text-xs text-slate-400">In {baseCurrency} ({getCurrency(baseCurrency).symbol})</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlowTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#E2E8F0'} />
                          <XAxis dataKey="month" tick={{ fill: darkMode ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                          <YAxis tick={{ fill: darkMode ? '#94A3B8' : '#64748B', fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                              borderColor: darkMode ? '#334155' : '#E2E8F0',
                              borderRadius: '0.75rem',
                              color: darkMode ? '#F8FAFC' : '#0F172A'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Category Breakdown ({baseCurrency})</h3>
                    <div className="h-56">
                      {categorySpendingData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categorySpendingData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {categorySpendingData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                                borderColor: darkMode ? '#334155' : '#E2E8F0',
                                borderRadius: '0.75rem'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                          No expense data available
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      {categorySpendingData.slice(0, 4).map((cat) => (
                        <div key={cat.name} className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="truncate text-slate-600 dark:text-slate-400">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ================= ACCOUNTS TAB ================= */}
            {activeTab === 'accounts' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">Euro (€) Primary Accounts & Multi-Currency Wallets</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      Assign custom currencies per account. Real-time conversion calculates equivalent balances in {baseCurrency} (€).
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAccountModal()}
                    className="flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New Account
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${acc.color} shadow-lg flex flex-col justify-between h-56 group`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs uppercase tracking-widest font-bold opacity-90">{acc.type}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase">
                            {acc.currency} ({getCurrency(acc.currency).symbol})
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-black/20 backdrop-blur-md px-2 py-1 rounded-xl">
                          <button
                            onClick={() => handleOpenAccountModal(acc)}
                            className="p-1 hover:text-blue-200 transition-colors"
                            title="Edit Account Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteAccountConfirm(acc)}
                            className="p-1 hover:text-rose-300 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs opacity-75">{acc.accountNumber || '•••• ----'}</p>
                        <h3 className="text-xl font-bold mt-0.5">{acc.name}</h3>
                        {acc.notes && <p className="text-xs opacity-80 mt-1 line-clamp-1">{acc.notes}</p>}
                      </div>

                      <div className="flex items-end justify-between border-t border-white/20 pt-3">
                        <div>
                          <p className="text-[11px] opacity-75">Native Balance</p>
                          <p className="text-2xl font-black tracking-tight">
                            {formatMoney(acc.balance, acc.currency)}
                          </p>
                        </div>
                        {acc.currency !== baseCurrency && (
                          <div className="text-right">
                            <p className="text-[10px] opacity-75">Base Equivalent ({baseCurrency})</p>
                            <p className="text-sm font-bold opacity-90">
                              ≈ {formatMoney(convertToBase(acc.balance, acc.currency), baseCurrency)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add New Account Card Button */}
                  <button
                    onClick={() => handleOpenAccountModal()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-all h-56 bg-slate-50/50 dark:bg-slate-900/30"
                  >
                    <PlusCircle className="w-8 h-8 mb-2" />
                    <span className="text-sm font-semibold">+ Add New Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= TRANSACTIONS TAB ================= */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search description or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>

                    <select
                      value={filterAccount}
                      onChange={(e) => setFilterAccount(e.target.value)}
                      className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <option value="all">All Accounts</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                      ))}
                    </select>

                    <button
                      onClick={exportToCSV}
                      className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-4">Transaction</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Account & Currency</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                        {filteredTransactions.length > 0 ? (
                          filteredTransactions.map((t) => {
                            const acc = accounts.find(a => a.id === t.accountId);
                            const currencyCode = t.currency || acc?.currency || 'EUR';
                            return (
                              <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                  {t.description}
                                  {t.notes && <p className="text-xs font-normal text-slate-400 mt-0.5">{t.notes}</p>}
                                </td>
                                <td className="px-6 py-4">
                                  <span 
                                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: `${CATEGORY_COLORS[t.category] || '#94A3B8'}20`,
                                      color: CATEGORY_COLORS[t.category] || '#64748B'
                                    }}
                                  >
                                    {t.category}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                  {acc?.name || 'Unknown'} 
                                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {currencyCode}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                  {t.date}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    t.status === 'Cleared'
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                      : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  }`}>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {t.status}
                                  </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                  {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount, currencyCode)}
                                  {acc && currencyCode !== acc.currency && (
                                    <p className="text-[10px] font-normal text-slate-400 mt-0.5">
                                      ≈ {formatMoney(convertCurrency(t.amount, currencyCode, acc.currency), acc.currency)} on {acc.name}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                    <button
                                      onClick={() => handleOpenTxModal(t)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      title="Edit Transaction"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTransaction(t.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      title="Delete Transaction"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                              No matching transactions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= BUDGETS & GOALS TAB ================= */}
            {activeTab === 'budgets' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Monthly Budgets ({baseCurrency})</h2>
                    <button
                      onClick={() => handleOpenBudgetModal()}
                      className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Category Budget
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {budgets.map((b) => {
                      const currentSpentBase = transactions
                        .filter(t => t.type === 'expense' && t.category === b.category)
                        .reduce((sum, t) => {
                          const acc = accounts.find(a => a.id === t.accountId);
                          return sum + convertToBase(t.amount, t.currency || acc?.currency || 'EUR');
                        }, 0);

                      const percent = Math.min(100, Math.round((currentSpentBase / b.limit) * 100));

                      return (
                        <div key={b.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.category}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-slate-500">
                                {formatMoney(currentSpentBase, baseCurrency)} / {formatMoney(b.limit, baseCurrency)}
                              </span>
                              <button onClick={() => handleOpenBudgetModal(b)} className="p-1 text-slate-400 hover:text-blue-600">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
                            <div
                              className={`h-full transition-all duration-500 ${
                                percent >= 100 ? 'bg-rose-500' : percent >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Multi-Currency Savings Goals</h2>
                    <button
                      onClick={() => handleOpenGoalForm()}
                      className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Goal
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                      const currCode = goal.currency || 'EUR';
                      const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                      return (
                        <div key={goal.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                                {currCode} Target
                              </span>
                              <span className="text-xs font-medium text-slate-400">{goal.date}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{goal.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatMoney(goal.current, currCode)} / {formatMoney(goal.target, currCode)}
                            </p>

                            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden my-3">
                              <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-indigo-600">{percent}%</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleOpenGoalForm(goal)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit goal"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(goal)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Delete goal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGoal(goal);
                                  setIsGoalModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                              >
                                + Deposit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================= REPORTS TAB ================= */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Combined Net Growth Projections ({baseCurrency})</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cashFlowTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#E2E8F0'} />
                        <XAxis dataKey="month" tick={{ fill: darkMode ? '#94A3B8' : '#64748B' }} />
                        <YAxis tick={{ fill: darkMode ? '#94A3B8' : '#64748B' }} />
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0F172A' : '#FFFFFF', borderRadius: '0.75rem' }} />
                        <Area type="monotone" dataKey="Income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Account Creation & Editing Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingAccount ? 'Edit Account' : 'Create New Account'}
              </h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. European Travel Checking"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Account Type</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Investment">Investment</option>
                    <option value="Cash">Cash</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Loan">Loan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Currency</label>
                  <select
                    value={accountForm.currency}
                    onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Balance ({getCurrency(accountForm.currency).symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Card Color Theme</label>
                  <select
                    value={accountForm.color}
                    onChange={(e) => setAccountForm({ ...accountForm, color: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {COLOR_THEMES.map(theme => (
                      <option key={theme.name} value={theme.value}>{theme.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Account Number / Mask (Optional)</label>
                <input
                  type="text"
                  placeholder="•••• 4821"
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Primary salary account"
                  value={accountForm.notes}
                  onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Safe Delete Account Dialog */}
      {deleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Delete Account?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Are you sure you want to delete <strong>{deleteAccountConfirm.name}</strong>? All associated transactions will also be removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteAccountConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAccount(deleteAccountConfirm.id)}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Multi-Currency Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cross-Currency Transfer</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">From Source Account</label>
                <select
                  value={transferForm.fromAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — {formatMoney(acc.balance, acc.currency)} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">To Target Account</label>
                <select
                  value={transferForm.toAccountId}
                  onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — {formatMoney(acc.balance, acc.currency)} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Currency Rate Preview Calculation */}
              {(() => {
                const fromAcc = accounts.find(a => a.id === transferForm.fromAccountId);
                const toAcc = accounts.find(a => a.id === transferForm.toAccountId);
                const amt = parseFloat(transferForm.sourceAmount) || 0;

                if (fromAcc && toAcc) {
                  const fromRate = getCurrency(fromAcc.currency).rateToEUR;
                  const toRate = getCurrency(toAcc.currency).rateToEUR;
                  const convertedAmt = (amt * fromRate) / toRate;

                  return (
                    <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                      <div className="flex justify-between font-semibold text-indigo-900 dark:text-indigo-200">
                        <span>Exchange Rate Preview:</span>
                        <span>1 {fromAcc.currency} ≈ {(fromRate / toRate).toFixed(4)} {toAcc.currency}</span>
                      </div>
                      <div className="mt-1 text-indigo-700 dark:text-indigo-300">
                        You send <strong>{formatMoney(amt, fromAcc.currency)}</strong> → Target receives approximately <strong>{formatMoney(convertedAmt, toAcc.currency)}</strong>.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Source Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={transferForm.sourceAmount}
                  onChange={(e) => setTransferForm({ ...transferForm, sourceAmount: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingTx ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery Store"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Amount ({getCurrency(txForm.currency).symbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  />
                  {(() => {
                    const formAccount = accounts.find(a => a.id === txForm.accountId);
                    const accCur = formAccount?.currency || 'EUR';
                    const amt = parseFloat(txForm.amount);
                    if (!formAccount || txForm.currency === accCur || !amt) return null;
                    return (
                      <p className="mt-1.5 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                        ≈ {formatMoney(convertCurrency(amt, txForm.currency, accCur), accCur)} booked to {formAccount.name} ({accCur})
                      </p>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Currency</label>
                  <select
                    value={txForm.currency}
                    onChange={(e) => setTxForm({ ...txForm, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Type</label>
                  <select
                    value={txForm.type}
                    onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Account</label>
                  <select
                    value={txForm.accountId}
                    onChange={(e) => {
                      const nextAccount = accounts.find(a => a.id === e.target.value);
                      setTxForm({
                        ...txForm,
                        accountId: e.target.value,
                        currency: nextAccount?.currency || txForm.currency
                      });
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Budget Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingBudget ? `Edit ${editingBudget.category} Budget` : 'Add Budget Limit'}
              </h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {!editingBudget && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Limit ({getCurrency(baseCurrency).symbol})
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  placeholder="500"
                  value={budgetForm.limit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Save Budget Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal create / edit Modal */}
      {isGoalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingGoal ? 'Edit Goal' : 'New Savings Goal'}
              </h3>
              <button onClick={() => setIsGoalFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Goal name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Reserve"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Saved so far</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={goalForm.current}
                    onChange={(e) => setGoalForm({ ...goalForm, current: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Currency</label>
                  <select
                    value={goalForm.currency}
                    onChange={(e) => setGoalForm({ ...goalForm, currency: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Target date</label>
                  <input
                    type="date"
                    value={goalForm.date}
                    onChange={(e) => setGoalForm({ ...goalForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsGoalFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  {editingGoal ? 'Save changes' : 'Create goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Deposit to Goal Modal */}
      {isGoalModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Deposit to {selectedGoal.name}</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const amt = parseFloat(depositAmount);
              if (!amt) return;
              setGoals(prev => prev.map(g => g.id === selectedGoal.id ? { ...g, current: g.current + amt } : g));
              setIsGoalModalOpen(false);
              setDepositAmount('');
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Deposit Amount ({getCurrency(selectedGoal.currency || 'EUR').symbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}