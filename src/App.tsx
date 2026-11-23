/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  CreditCard, 
  Bell, 
  Search,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lock,
  User,
  Users,
  Database,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// --- Types ---
type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'transactions' | 'reports' | 'settings' | 'admin';

type AuthUser = {
  id: number;
  nome: string;
  email: string;
  perfil: 'usuario' | 'admin';
};

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  status: 'completed' | 'blocked';
}

// Integração com a API local do MetaPay. O banco continua no backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

type TransactionPayload = {
  descricao: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  valor: number;
};

type ApiTransaction = TransactionPayload & {
  id: number;
  usuario_id: number;
  data_transacao: string;
};

const CATEGORIES = [
  'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Moradia',
  'Educação', 'Internet', 'Renda', 'Compras', 'Outros'
];
const CHART_COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#6366f1', '#06b6d4', '#ec4899'];
const ESSENTIAL_CATEGORIES = ['Alimentação', 'Transporte', 'Saúde', 'Moradia', 'Educação', 'Internet'];
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');
const monthKey = (date: string) => new Date(date).toISOString().slice(0, 7);
const currentMonth = () => new Date().toISOString().slice(0, 7);

function fromApi(row: ApiTransaction): Transaction {
  return {
    id: String(row.id),
    description: row.descricao,
    amount: Number(row.valor), // pg retorna valores NUMERIC como string
    category: row.categoria,
    date: row.data_transacao,
    type: row.tipo === 'entrada' ? 'income' : 'expense',
    status: 'completed' // banco atual não possui campo de bloqueio
  };
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.erro || body.mensagem || `Erro HTTP ${response.status}`;
  } catch {
    return `Erro HTTP ${response.status}`;
  }
}

async function fetchTransactions(token: string): Promise<Transaction[]> {
  const response = await fetch(`${API_URL}/api/transacoes`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const rows: ApiTransaction[] = await response.json();
  return rows.map(fromApi);
}

// --- Components ---

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 font-bold text-2xl tracking-tighter ${className}`}>
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
      <Wallet size={20} />
    </div>
    <span className="text-foreground">Meta<span className="text-primary">Pay</span></span>
  </div>
);

const Navbar = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-bottom border-border px-6 py-4 flex items-center justify-between">
    <Logo className="cursor-pointer" />
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={() => onNavigate('login')}>Entrar</Button>
      <Button onClick={() => onNavigate('signup')}>Criar Conta</Button>
    </div>
  </nav>
);

const Sidebar = ({ currentPage, onNavigate, isAdmin }: { currentPage: Page; onNavigate: (page: Page) => void; isAdmin: boolean }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ReceiptText },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 border-r border-border h-screen sticky top-0 bg-card flex flex-col p-6 hidden md:flex">
      <Logo className="mb-10" />
      <div className="flex-1 space-y-2">
        {menuItems.filter((item) => item.id !== 'admin' || isAdmin).map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start gap-3 ${currentPage === item.id ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
            onClick={() => onNavigate(item.id as Page)}
          >
            <item.icon size={20} />
            {item.label}
          </Button>
        ))}
      </div>
      <div className="pt-6 border-t border-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => onNavigate('landing')}>
          <LogOut size={20} />
          Sair
        </Button>
      </div>
    </aside>
  );
};

const MobileNav = ({ currentPage, onNavigate }: { currentPage: Page, onNavigate: (page: Page) => void }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard },
    { id: 'transactions', icon: ReceiptText },
    { id: 'reports', icon: BarChart3 },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around items-center md:hidden z-50">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          className={currentPage === item.id ? 'text-primary' : 'text-muted-foreground'}
          onClick={() => onNavigate(item.id as Page)}
        >
          <item.icon size={24} />
        </Button>
      ))}
    </div>
  );
};

// --- Pages ---

const LandingPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar onNavigate={onNavigate} />
    <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl"
      >
        <Badge variant="secondary" className="mb-4 px-4 py-1 rounded-full text-primary bg-primary/10 border-primary/20">
          Novo: Controle de Gastos com IA
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-foreground">
          Controle inteligente para o seu <span className="text-primary">dinheiro</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          MetaPay ajuda você a organizar suas finanças com tecnologia de ponta, 
          limites inteligentes e relatórios detalhados.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="px-8 h-14 text-lg rounded-xl" onClick={() => onNavigate('signup')}>
            Começar Agora
          </Button>
          <Button size="lg" variant="outline" className="px-8 h-14 text-lg rounded-xl">
            Ver Demonstração
          </Button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-12 w-full max-w-2xl mx-auto relative flex justify-center"
      >
        <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-30"></div>
        <a href='https://postimg.cc/rRmxY0yY' target='_blank' rel="noopener noreferrer" className="relative z-10">
          <img 
            src="https://i.postimg.cc/1X0BXwkP/image.png" 
            alt="MetaPay Interface" 
            className="w-full max-w-md h-auto drop-shadow-2xl transition-transform hover:scale-105 duration-300"
            referrerPolicy="no-referrer"
          />
        </a>
      </motion.div>
    </main>
    <footer className="py-10 border-t border-border text-center text-muted-foreground text-sm">
      © 2024 MetaPay. Todos os direitos reservados.
    </footer>
  </div>
);

const AuthPage = ({ type, onNavigate, onAuthenticated }: {
  type: 'login' | 'signup';
  onNavigate: (page: Page) => void;
  onAuthenticated: (token: string, usuario: AuthUser) => void;
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(
        `${API_URL}/api/auth/${type === 'login' ? 'login' : 'register'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            type === 'login'
              ? { email, senha }
              : { nome, email, senha }
          ),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Não foi possível autenticar.');
      }

      if (!dados.token || !dados.usuario) {
        throw new Error('Resposta inválida do servidor.');
      }

      onAuthenticated(dados.token, dados.usuario as AuthUser);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <Logo className="justify-center mb-6" />
          <CardTitle className="text-2xl font-bold">
            {type === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </CardTitle>
          <CardDescription>
            {type === 'login' ? 'Entre com seu e-mail e senha' : 'Comece a controlar seus gastos hoje'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={enviar} className="space-y-4">
            {type === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="register-name">Nome</Label>
                <Input
                  id="register-name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  minLength={2}
                  maxLength={100}
                  className="rounded-lg h-11"
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="auth-email">E-mail</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="rounded-lg h-11"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Senha</Label>
              <Input
                id="auth-password"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={type === 'signup' ? 8 : undefined}
                className="rounded-lg h-11"
                autoComplete={type === 'login' ? 'current-password' : 'new-password'}
                required
              />
            </div>
            {erro && (
              <p role="alert" className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                {erro}
              </p>
            )}
            <Button
              type="submit"
              disabled={carregando}
              className="w-full h-11 text-lg rounded-lg mt-2"
            >
              {carregando ? 'Aguarde...' : type === 'login' ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            {type === 'login' ? (
              <>Não tem uma conta? <button className="text-primary font-medium hover:underline" onClick={() => onNavigate('signup')}>Cadastre-se</button></>
            ) : (
              <>Já tem uma conta? <button className="text-primary font-medium hover:underline" onClick={() => onNavigate('login')}>Entre aqui</button></>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// --- Dashboard real: alimentado pela API ---
const Dashboard = ({ onNavigate, onNew, nome, transactions }: {
  onNavigate: (page: Page) => void;
  onNew: () => void;
  nome: string;
  transactions: Transaction[];
}) => {
  const limitValue = 3000; // valor demonstrativo até existir configuração persistida
  const thisMonth = transactions.filter(tx => monthKey(tx.date) === currentMonth());
  const currentSpent = thisMonth.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const income = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const balance = income - expense;
  const percentage = (currentSpent / limitValue) * 100;
  const isNearLimit = percentage >= 80;
  const categoryTotals = thisMonth.filter(tx => tx.type === 'expense').reduce<Record<string, number>>((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});
  const spendingByCategory = Object.entries(categoryTotals).map(([name, value], index) => ({
    name, value, color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {nome}!</h1>
          <p className="text-muted-foreground">Aqui está o resumo das suas transações registradas.</p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={onNew}>
          <Plus size={18} /> Nova Transação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/80">Saldo Registrado</CardDescription>
            <CardTitle className="text-4xl font-bold">{money(balance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-primary-foreground/90">Entradas menos saídas registradas no MetaPay</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Limite Mensal (exemplo)</CardDescription>
            <CardTitle className="text-2xl font-bold">{money(limitValue)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm gap-2">
                <span className="text-muted-foreground">Gasto neste mês: {money(currentSpent)}</span>
                <span className={isNearLimit ? 'text-destructive font-medium' : 'text-primary font-medium'}>{percentage.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2" />
            </div>
            {isNearLimit && <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg"><AlertTriangle size={14} />80% ou mais do limite de exemplo.</div>}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Total de Entradas</CardDescription>
            <CardTitle className="text-2xl font-bold">{money(income)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRight size={16} /> {transactions.filter(tx => tx.type === 'income').length} receitas registradas
            </div>
            <p className="text-xs text-muted-foreground mt-3">Total de saídas: {money(expense)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Saídas registradas no mês atual</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {spendingByCategory.length ? (
              <>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={spendingByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                        {spendingByCategory.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(Number(value ?? 0))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {spendingByCategory.map(item => <div key={item.name} className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</div>)}
                </div>
              </>
            ) : <p className="text-muted-foreground text-sm text-center py-16">Nenhuma despesa registrada neste mês.</p>}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Transações Recentes</CardTitle><CardDescription>Últimas movimentações salvas no banco</CardDescription></div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('transactions')}>Ver todas</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              {transactions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma transação ainda. Clique em Nova Transação para começar.</p> : (
                <div className="space-y-4">
                  {transactions.slice(0, 6).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between gap-3 p-2 hover:bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}>
                          {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div className="min-w-0"><p className="font-medium text-sm truncate">{tx.description}</p><p className="text-xs text-muted-foreground">{tx.category} • {formatDate(tx.date)}</p></div>
                      </div>
                      <div className={`font-bold text-sm shrink-0 ${tx.type === 'income' ? 'text-primary' : ''}`}>{tx.type === 'income' ? '+' : '-'} {money(tx.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Consulta, busca, filtros e paginação ---
const TransactionsPage = ({ transactions, onNew, onEdit }: {
  transactions: Transaction[];
  onNew: () => void;
  onEdit: (tx: Transaction) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => transactions.filter(tx =>
    (tx.description.toLocaleLowerCase('pt-BR').includes(searchTerm.toLocaleLowerCase('pt-BR')) ||
     tx.category.toLocaleLowerCase('pt-BR').includes(searchTerm.toLocaleLowerCase('pt-BR'))) &&
    (typeFilter === 'todos' || tx.type === typeFilter)
  ), [transactions, searchTerm, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Transações</h1><p className="text-muted-foreground">Histórico de movimentações registradas no banco.</p></div>
        <Button onClick={onNew} className="gap-2"><Plus size={18} /> Nova Transação</Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Buscar por descrição ou categoria..." className="pl-10 rounded-xl" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <select aria-label="Filtrar tipo" className="h-10 rounded-xl border border-border bg-background px-3" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="todos">Todas</option><option value="income">Entradas</option><option value="expense">Saídas</option>
        </select>
      </div>
      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-right">Ação</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {visible.length ? visible.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell><Badge variant="outline">{tx.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.date)}</TableCell>
                  <TableCell><Badge variant="secondary">{tx.type === 'income' ? 'Entrada' : 'Saída'}</Badge></TableCell>
                  <TableCell className={`text-right font-bold ${tx.type === 'income' ? 'text-primary' : ''}`}>{tx.type === 'income' ? '+' : '-'} {money(tx.amount)}</TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => onEdit(tx)}>Editar</Button></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma transação encontrada.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{filtered.length} transação(ões) • Página {Math.min(page, totalPages)} de {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Próxima</Button>
        </div>
      </div>
    </div>
  );
};

// --- Relatórios calculados das transações reais ---
const ReportsPage = ({ transactions }: { transactions: Transaction[] }) => {
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) };
  });
  const monthly = months.map(m => {
    const txs = transactions.filter(tx => monthKey(tx.date) === m.key && tx.type === 'expense');
    return {
      month: m.month,
      essential: txs.filter(tx => ESSENTIAL_CATEGORIES.includes(tx.category)).reduce((a, tx) => a + tx.amount, 0),
      nonEssential: txs.filter(tx => !ESSENTIAL_CATEGORIES.includes(tx.category)).reduce((a, tx) => a + tx.amount, 0),
      total: txs.reduce((a, tx) => a + tx.amount, 0)
    };
  });
  const allExpenses = transactions.filter(tx => tx.type === 'expense');
  const allIncome = transactions.filter(tx => tx.type === 'income');
  const expenses = allExpenses.reduce((a, tx) => a + tx.amount, 0);
  const income = allIncome.reduce((a, tx) => a + tx.amount, 0);
  const categoryTotals = allExpenses.reduce<Record<string, number>>((acc, tx) => { acc[tx.category] = (acc[tx.category] || 0) + tx.amount; return acc; }, {});
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const daysWithExpenses = new Set(allExpenses.map(tx => new Date(tx.date).toISOString().slice(0, 10))).size;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Relatórios</h1><p className="text-muted-foreground">Análise das movimentações salvas no PostgreSQL.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border"><CardHeader><CardTitle>Comparativo Mensal</CardTitle><CardDescription>Despesas essenciais e não essenciais (últimos 6 meses)</CardDescription></CardHeader>
          <CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v) => money(Number(v ?? 0))} />
            <Bar dataKey="essential" name="Essenciais" fill="#22c55e" radius={[4, 4, 0, 0]} /><Bar dataKey="nonEssential" name="Não essenciais" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer></CardContent>
        </Card>
        <Card className="border-border"><CardHeader><CardTitle>Evolução de Gastos</CardTitle><CardDescription>Saídas registradas nos últimos 6 meses</CardDescription></CardHeader>
          <CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthly}>
            <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v) => money(Number(v ?? 0))} />
            <Area type="monotone" dataKey="total" name="Gastos" stroke="#22c55e" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
          </AreaChart></ResponsiveContainer></CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Saldo Registrado</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{money(income - expenses)}</div><p className="text-xs text-muted-foreground">Receitas menos despesas cadastradas</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Média por dia com despesas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{money(daysWithExpenses ? expenses / daysWithExpenses : 0)}</div><p className="text-xs text-muted-foreground">Dias com saídas registradas</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Maior Categoria de Gastos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{topCategory?.[0] || '—'}</div><p className="text-xs text-muted-foreground">{topCategory && expenses > 0 ? `${(topCategory[1] / expenses * 100).toFixed(1)}% das despesas` : 'Sem despesas registradas'}</p></CardContent></Card>
      </div>
    </div>
  );
};

// --- Formulário para POST e PUT ---
const TransactionModal = ({ initial, saving, onCancel, onSave }: {
  initial: Transaction | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (payload: TransactionPayload, id?: string) => Promise<void>;
}) => {
  const [descricao, setDescricao] = useState(initial?.description || '');
  const [categoria, setCategoria] = useState(initial?.category || 'Alimentação');
  const [tipo, setTipo] = useState<'entrada' | 'saida'>(initial?.type === 'income' ? 'entrada' : 'saida');
  const [valor, setValor] = useState(initial ? String(initial.amount) : '');
  const [erro, setErro] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const valorNumero = Number(valor.replace(',', '.'));
    if (!descricao.trim() || !categoria.trim() || !Number.isFinite(valorNumero) || valorNumero <= 0) {
      setErro('Preencha a descrição, a categoria e um valor positivo.');
      return;
    }
    try {
      await onSave({ descricao: descricao.trim(), categoria, tipo, valor: valorNumero }, initial?.id);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={initial ? 'Editar transação' : 'Nova transação'}>
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader><CardTitle>{initial ? 'Editar Transação' : 'Nova Transação'}</CardTitle><CardDescription>Os dados serão salvos no banco PostgreSQL.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="tx-desc">Descrição</Label><Input id="tx-desc" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex.: Supermercado" maxLength={150} required /></div>
            <div className="space-y-2"><Label htmlFor="tx-category">Categoria</Label>
              <select id="tx-category" className="w-full h-10 rounded-md border border-border bg-background px-3" value={categoria} onChange={e => setCategoria(e.target.value)}>
                {!CATEGORIES.includes(categoria) && <option value={categoria}>{categoria}</option>}
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label htmlFor="tx-type">Tipo</Label><select id="tx-type" className="w-full h-10 rounded-md border border-border bg-background px-3" value={tipo} onChange={e => setTipo(e.target.value as 'entrada' | 'saida')}><option value="saida">Saída (despesa)</option><option value="entrada">Entrada (receita)</option></select></div>
            <div className="space-y-2"><Label htmlFor="tx-value">Valor (R$)</Label><Input id="tx-value" type="number" min="0.01" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="150.50" required /></div>
            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
            <div className="flex justify-end gap-2"><Button variant="outline" type="button" disabled={saving} onClick={onCancel}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const SettingsPage = ({ usuario }: { usuario: AuthUser }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      <p className="text-muted-foreground">Gerencie suas preferências e limites.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Limites Inteligentes</CardTitle>
            <CardDescription>Defina quanto você quer gastar por mês.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-limit">Limite Mensal Global (R$)</Label>
              <Input id="monthly-limit" type="number" defaultValue="3000" className="rounded-lg" />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
              <div className="space-y-0.5">
                <p className="font-medium">Bloqueio Automático</p>
                <p className="text-xs text-muted-foreground">Bloquear compras que excedam o limite mensal.</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="rounded-lg">Salvar Alterações</Button>
          </CardFooter>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Categorias Essenciais</CardTitle>
            <CardDescription>Selecione quais categorias são vitais para você.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Alimentação', 'Saúde', 'Moradia', 'Educação', 'Transporte', 'Internet'].map(cat => (
                <div key={cat} className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                  </div>
                  <span className="text-sm font-medium">{cat}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-primary/10">
              
              <AvatarFallback>{usuario.nome.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{usuario.nome}</h3>
              <p className="text-sm text-muted-foreground">{usuario.email}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-lg">Editar Perfil</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Ações irreversíveis para sua conta.</p>
            <Button variant="destructive" size="sm" className="w-full rounded-lg">Excluir Minha Conta</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const AdminPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Área Administrativa</h1>
      <p className="text-muted-foreground">Monitoramento global do sistema MetaPay.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Usuários Ativos', value: '1.284', icon: Users, color: 'text-blue-500' },
        { label: 'Transações/Dia', value: '8.420', icon: ReceiptText, color: 'text-green-500' },
        { label: 'Volume Total', value: 'R$ 2.4M', icon: Database, color: 'text-purple-500' },
        { label: 'Alertas de Fraude', value: '12', icon: ShieldCheck, color: 'text-red-500' },
      ].map((stat, i) => (
        <Card key={i} className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
            <stat.icon size={16} className={stat.color} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="border-border">
      <CardHeader>
        <CardTitle>Monitoramento de Usuários</CardTitle>
        <CardDescription>Últimos usuários cadastrados e atividade.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: 'Ana Silva', email: 'ana@email.com', status: 'Ativo', last: '2 min atrás' },
              { name: 'Bruno Costa', email: 'bruno@email.com', status: 'Inativo', last: '3 dias atrás' },
              { name: 'Carla Dias', email: 'carla@email.com', status: 'Ativo', last: '1 hora atrás' },
              { name: 'Diego Lima', email: 'diego@email.com', status: 'Suspenso', last: '1 semana atrás' },
            ].map((user, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Ativo' ? 'secondary' : user.status === 'Suspenso' ? 'destructive' : 'outline'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.last}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Gerenciar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<AuthUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carrega as movimentações da conta autenticada. Não usa dados de exemplo.
  useEffect(() => {
    if (!token) {
      setTransactions([]);
      return;
    }
    let active = true;
    setLoading(true);
    setDataError('');
    fetchTransactions(token)
      .then(rows => { if (active) setTransactions(rows); })
      .catch(error => {
        if (active) setDataError(error instanceof Error ? error.message : 'Erro ao consultar transações.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  function autenticou(novoToken: string, novoUsuario: AuthUser) {
    setToken(novoToken);
    setUsuario(novoUsuario);
    setCurrentPage('dashboard');
  }

  function sair() {
    setToken(null);
    setUsuario(null);
    setTransactions([]);
    setDataError('');
    setModalOpen(false);
    setCurrentPage('landing');
  }

  function navegar(pagina: Page) {
    if (pagina === 'landing') { sair(); return; }
    if (!token && pagina !== 'login' && pagina !== 'signup') { setCurrentPage('login'); return; }
    if (pagina === 'admin' && usuario?.perfil !== 'admin') { setCurrentPage('dashboard'); return; }
    setCurrentPage(pagina);
  }

  function novaTransacao() {
    setEditing(null);
    setModalOpen(true);
  }

  function editarTransacao(tx: Transaction) {
    setEditing(tx);
    setModalOpen(true);
  }

  async function salvarTransacao(payload: TransactionPayload, id?: string) {
    if (!token) throw new Error('Faça login novamente.');
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/transacoes${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await parseApiError(response));
      // Atualização vem do banco, evitando cálculos com dados antigos.
      const updated = await fetchTransactions(token);
      setTransactions(updated);
      setDataError('');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const renderPage = () => {
    if (!token || !usuario) {
      if (currentPage === 'landing') return <LandingPage onNavigate={navegar} />;
      if (currentPage === 'signup') return <AuthPage type="signup" onNavigate={navegar} onAuthenticated={autenticou} />;
      return <AuthPage type="login" onNavigate={navegar} onAuthenticated={autenticou} />;
    }

    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar currentPage={currentPage} onNavigate={navegar} isAdmin={usuario.perfil === 'admin'} />
        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto">
          {loading && <p className="text-sm text-muted-foreground mb-4">Carregando transações do banco...</p>}
          {dataError && <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {dataError} <Button size="sm" variant="outline" className="ml-2" onClick={() => {
              if (!token) return;
              setLoading(true);
              fetchTransactions(token).then(rows => { setTransactions(rows); setDataError(''); }).catch(error => setDataError(String(error))).finally(() => setLoading(false));
            }}>Tentar novamente</Button>
          </div>}
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              {currentPage === 'dashboard' && <Dashboard onNavigate={navegar} nome={usuario.nome} transactions={transactions} onNew={novaTransacao} />}
              {currentPage === 'transactions' && <TransactionsPage transactions={transactions} onNew={novaTransacao} onEdit={editarTransacao} />}
              {currentPage === 'reports' && <ReportsPage transactions={transactions} />}
              {currentPage === 'settings' && <SettingsPage usuario={usuario} />}
              {currentPage === 'admin' && usuario.perfil === 'admin' && <AdminPage />}
            </motion.div>
          </AnimatePresence>
        </main>
        <MobileNav currentPage={currentPage} onNavigate={navegar} />
        {modalOpen && <TransactionModal key={editing?.id || 'new'} initial={editing} saving={saving} onCancel={() => setModalOpen(false)} onSave={salvarTransacao} />}
      </div>
    );
  };

  return <div className="font-sans antialiased">{renderPage()}</div>;
}
