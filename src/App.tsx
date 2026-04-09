/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
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

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  status: 'completed' | 'blocked';
}

// --- Mock Data ---
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Supermercado Extra', amount: 350.50, category: 'Alimentação', date: '2024-03-20', type: 'expense', status: 'completed' },
  { id: '2', description: 'Salário Mensal', amount: 5000.00, category: 'Renda', date: '2024-03-05', type: 'income', status: 'completed' },
  { id: '3', description: 'Posto Shell', amount: 220.00, category: 'Transporte', date: '2024-03-18', type: 'expense', status: 'completed' },
  { id: '4', description: 'Netflix', amount: 55.90, category: 'Lazer', date: '2024-03-15', type: 'expense', status: 'completed' },
  { id: '5', description: 'Farmácia Pague Menos', amount: 89.90, category: 'Saúde', date: '2024-03-12', type: 'expense', status: 'completed' },
  { id: '6', description: 'Academia Fit', amount: 120.00, category: 'Saúde', date: '2024-03-10', type: 'expense', status: 'completed' },
  { id: '7', description: 'Tentativa de Compra - Loja Gamer', amount: 1200.00, category: 'Lazer', date: '2024-03-21', type: 'expense', status: 'blocked' },
  { id: '8', description: 'Aluguel', amount: 1500.00, category: 'Moradia', date: '2024-03-01', type: 'expense', status: 'completed' },
];

const SPENDING_BY_CATEGORY = [
  { name: 'Alimentação', value: 850, color: '#22c55e' },
  { name: 'Transporte', value: 420, color: '#3b82f6' },
  { name: 'Saúde', value: 310, color: '#ef4444' },
  { name: 'Lazer', value: 250, color: '#f59e0b' },
  { name: 'Moradia', value: 1500, color: '#6366f1' },
];

const MONTHLY_COMPARISON = [
  { month: 'Jan', essential: 2200, nonEssential: 800 },
  { month: 'Fev', essential: 2100, nonEssential: 1200 },
  { month: 'Mar', essential: 2350, nonEssential: 950 },
];

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

const Sidebar = ({ currentPage, onNavigate }: { currentPage: Page, onNavigate: (page: Page) => void }) => {
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
        {menuItems.map((item) => (
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

const AuthPage = ({ type, onNavigate }: { type: 'login' | 'signup', onNavigate: (page: Page) => void }) => (
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="nome@exemplo.com" className="rounded-lg h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" className="rounded-lg h-11" />
        </div>
        <Button className="w-full h-11 text-lg rounded-lg mt-2" onClick={() => onNavigate('dashboard')}>
          {type === 'login' ? 'Entrar' : 'Criar Conta'}
        </Button>
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

const Dashboard = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
  const limitValue = 3000;
  const currentSpent = 2350;
  const percentage = (currentSpent / limitValue) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, Kauã!</h1>
          <p className="text-muted-foreground">Aqui está o resumo das suas finanças hoje.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2 rounded-xl">
            <Plus size={18} /> Nova Transação
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl relative">
            <Bell size={18} />
            {isNearLimit && <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary-foreground/80">Saldo Disponível</CardDescription>
            <CardTitle className="text-4xl font-bold">R$ 5.420,50</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/90">
              <TrendingUp size={16} />
              <span>+12% em relação ao mês passado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Limite Mensal</CardDescription>
            <CardTitle className="text-2xl font-bold">R$ {limitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gasto: R$ {currentSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className={isNearLimit ? "text-destructive font-medium" : "text-primary font-medium"}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={percentage} className={`h-2 ${isNearLimit ? "bg-destructive/20" : ""}`} />
            </div>
            {isNearLimit && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20">
                <AlertTriangle size={14} />
                <span>Você atingiu 80% do seu limite mensal!</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardDescription>Próxima Fatura</CardDescription>
            <CardTitle className="text-2xl font-bold">R$ 1.240,00</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard size={16} />
              <span>Vence em 5 dias</span>
            </div>
            <Button variant="link" className="p-0 h-auto text-primary mt-4">Pagar agora <ChevronRight size={14} /></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição dos seus gastos este mês</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SPENDING_BY_CATEGORY}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SPENDING_BY_CATEGORY.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {SPENDING_BY_CATEGORY.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Suas últimas atividades financeiras</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('transactions')}>Ver todas</Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {MOCK_TRANSACTIONS.slice(0, 6).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.status === 'blocked' ? 'bg-destructive/10 text-destructive' :
                        tx.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'
                      }`}>
                        {tx.status === 'blocked' ? <Lock size={18} /> : 
                         tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.category} • {tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        tx.status === 'blocked' ? 'text-muted-foreground line-through' :
                        tx.type === 'income' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {tx.status === 'blocked' && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1">Bloqueada</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => 
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transações</h1>
          <p className="text-muted-foreground">Histórico detalhado de todas as suas movimentações.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Buscar transações..." 
            className="pl-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{tx.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'completed' ? 'secondary' : 'destructive'} className="capitalize">
                      {tx.status === 'completed' ? 'Concluída' : 'Bloqueada'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-bold ${
                    tx.status === 'blocked' ? 'text-muted-foreground line-through' :
                    tx.type === 'income' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ReportsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
      <p className="text-muted-foreground">Análise profunda do seu comportamento financeiro.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Comparativo Mensal</CardTitle>
          <CardDescription>Gastos essenciais vs. não essenciais</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_COMPARISON}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="essential" name="Essenciais" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nonEssential" name="Não Essenciais" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Evolução de Gastos</CardTitle>
          <CardDescription>Tendência de gastos nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Out', value: 1800 },
              { name: 'Nov', value: 2100 },
              { name: 'Dez', value: 3200 },
              { name: 'Jan', value: 2400 },
              { name: 'Fev', value: 2600 },
              { name: 'Mar', value: 2350 },
            ]}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">R$ 12.450,00</div>
          <p className="text-xs text-muted-foreground">+5.2% desde o último mês</p>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ 78,33</div>
          <p className="text-xs text-muted-foreground">-2.1% desde o último mês</p>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Maior Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Moradia</div>
          <p className="text-xs text-muted-foreground">Representa 45% dos gastos</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SettingsPage = () => (
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
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>KR</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">Kauã Rocha</h3>
              <p className="text-sm text-muted-foreground">kaua@metapay.com</p>
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

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={setCurrentPage} />;
      case 'login': return <AuthPage type="login" onNavigate={setCurrentPage} />;
      case 'signup': return <AuthPage type="signup" onNavigate={setCurrentPage} />;
      default:
        return (
          <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
                  {currentPage === 'transactions' && <TransactionsPage />}
                  {currentPage === 'reports' && <ReportsPage />}
                  {currentPage === 'settings' && <SettingsPage />}
                  {currentPage === 'admin' && <AdminPage />}
                </motion.div>
              </AnimatePresence>
            </main>
            <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />
          </div>
        );
    }
  };

  return (
    <div className="font-sans antialiased">
      {renderPage()}
    </div>
  );
}
