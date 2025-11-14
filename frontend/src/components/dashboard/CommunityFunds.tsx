'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  HandHeart, 
  Banknote, 
  Clock, 
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Settings,
  X
} from 'lucide-react';

interface FundData {
  current_balance: number;
  total_raised: number;
  total_loans: number;
  total_investments: number;
  commission_rate: number;
  fixed_return_rate: number;
}

interface Transaction {
  id: number;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
  user_name: string | null;
}

interface Loan {
  id: number;
  amount: number;
  purpose: string;
  status: string;
  loan_date: string;
  due_date: string;
  returned_amount: number;
  borrower_name: string;
  is_overdue: boolean;
}

interface Investment {
  id: number;
  amount: number;
  profit_rate: number;
  status: string;
  investment_date: string;
  maturity_date: string;
  current_value: number;
  investor_name: string;
}

interface CommunityFundsProps {
  communityId: number;
}

const CommunityFunds = ({ communityId }: CommunityFundsProps) => {
  const { user } = useAuth();
  const [fundData, setFundData] = useState<FundData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'warning'; message: string} | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  
  // Form states
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateDescription, setDonateDescription] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('');
  const [loanNotes, setLoanNotes] = useState('');
  const [investAmount, setInvestAmount] = useState('');
  const [investDuration, setInvestDuration] = useState('');

  useEffect(() => {
    fetchAllData();
  }, [communityId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [fundResponse, transactionsResponse, loansResponse, investmentsResponse] = await Promise.all([
        api.getCommunityFund(communityId),
        api.getFundTransactions(communityId),
        api.getCommunityLoans(communityId),
        api.getCommunityInvestments(communityId)
      ]);
      
      setFundData(fundResponse);
      setTransactions(transactionsResponse);
      setLoans(loansResponse);
      setInvestments(investmentsResponse);
    } catch (error) {
      console.error('ডেটা লোড করতে সমস্যা হয়েছে:', error);
      setAlert({ type: 'error', message: 'তহবিলের তথ্য লোড করা সম্ভব হয়নি।' });
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateAmount || parseFloat(donateAmount) <= 0) return;

    try {
      await api.donateToFund(communityId, parseFloat(donateAmount), donateDescription);
      setAlert({ type: 'success', message: 'আপনার দান সফলভাবে গ্রহণ করা হয়েছে!' });
      setShowDonateForm(false);
      setDonateAmount('');
      setDonateDescription('');
      fetchAllData();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'দান করতে সমস্যা হয়েছে।' });
    }
  };

  const handleLoanApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanAmount || !loanPurpose || !loanDueDate) return;

    try {
      await api.applyForLoan(communityId, parseFloat(loanAmount), loanPurpose, loanDueDate, loanNotes);
      setAlert({ type: 'success', message: 'ঋণের আবেদন সফলভাবে জমা দেওয়া হয়েছে!' });
      setShowLoanForm(false);
      setLoanAmount('');
      setLoanPurpose('');
      setLoanDueDate('');
      setLoanNotes('');
      fetchAllData();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'ঋণের আবেদন করতে সমস্যা হয়েছে।' });
    }
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investAmount || !investDuration) return;

    try {
      await api.createInvestment(
        communityId, 
        parseFloat(investAmount), 
        parseInt(investDuration),
        ''
      );
      setAlert({ type: 'success', message: 'বিনিয়োগ সফলভাবে সম্পন্ন হয়েছে!' });
      setShowInvestForm(false);
      setInvestAmount('');
      setInvestDuration('');
      fetchAllData();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'বিনিয়োগ করতে সমস্যা হয়েছে।' });
    }
  };

  const handleReturnLoan = async (loanId: number, amount: number) => {
    try {
      await api.returnLoan(communityId, loanId, amount);
      setAlert({ type: 'success', message: 'ঋণ ফেরত সফলভাবে সম্পন্ন হয়েছে!' });
      fetchAllData();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'ঋণ ফেরত দিতে সমস্যা হয়েছে।' });
    }
  };

  const handleWithdrawInvestment = async (investmentId: number) => {
    try {
      await api.withdrawInvestment(communityId, investmentId);
      setAlert({ type: 'success', message: 'বিনিয়োগ উত্তোলন সফলভাবে সম্পন্ন হয়েছে!' });
      fetchAllData();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'বিনিয়োগ উত্তোলন করতে সমস্যা হয়েছে।' });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'fund_raise': return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
      case 'loan_given': return <ArrowDownCircle className="w-5 h-5 text-orange-600" />;
      case 'loan_returned': return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
      case 'investment_received': return <ArrowUpCircle className="w-5 h-5 text-purple-600" />;
      case 'investment_returned': return <ArrowDownCircle className="w-5 h-5 text-purple-600" />;
      default: return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionTypeBangla = (type: string) => {
    switch (type) {
      case 'fund_raise': return 'দান';
      case 'loan_given': return 'ঋণ দেওয়া';
      case 'loan_returned': return 'ঋণ ফেরত';
      case 'investment_received': return 'বিনিয়োগ';
      case 'investment_returned': return 'বিনিয়োগ ফেরত';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">তহবিলের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const availableBalance = fundData?.current_balance || 0;
  const totalRaised = fundData?.total_raised || 0;
  const totalLoans = fundData?.total_loans || 0;
  const totalInvestments = fundData?.total_investments || 0;
  const returnRate = ((fundData?.fixed_return_rate || 0) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>💰 তহবিল কী?</strong> সম্প্রদায়ের যৌথ তহবিল। আপনি এখানে <strong>দান</strong> করতে পারেন (সম্প্রদায়কে সাহায্য), <strong>ঋণ</strong> নিতে পারেন (সুদ ছাড়া), বা <strong>বিনিয়োগ</strong> করতে পারেন (লাভের জন্য)।
          </p>
        </CardContent>
      </Card>

      {/* Main Balance Card - Prominent */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">বর্তমান ব্যালেন্স</p>
              <p className="text-4xl font-bold text-green-700">৳{availableBalance.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">মোট সংগৃহীত: ৳{totalRaised.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-full p-4">
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-orange-200">
          <CardContent className="p-4 text-center">
            <HandHeart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">মোট ঋণ</p>
            <p className="text-lg font-bold text-orange-600">৳{totalLoans.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">মোট বিনিয়োগ</p>
            <p className="text-lg font-bold text-purple-600">৳{totalInvestments.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <Banknote className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-1">বার্ষিক রিটার্ন</p>
            <p className="text-lg font-bold text-blue-600">{returnRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setShowDonateForm(true)}
            className="bg-green-600 hover:bg-green-700 flex-1 min-w-[140px]"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            দান করুন
          </Button>
          
          <Button 
            onClick={() => setShowLoanForm(true)}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 flex-1 min-w-[140px]"
            size="lg"
          >
            <HandHeart className="w-5 h-5 mr-2" />
            ঋণ নিন
          </Button>

          <Button 
            onClick={() => setShowInvestForm(true)}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50 flex-1 min-w-[140px]"
            size="lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            বিনিয়োগ করুন
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="text-center">💚 সম্প্রদায়কে সাহায্য করুন</div>
          <div className="text-center">🟠 সুদ ছাড়া ঋণ নিন</div>
          <div className="text-center">🟣 লাভের জন্য বিনিয়োগ করুন</div>
        </div>
      </div>

      {/* Transactions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            সাম্প্রতিক লেনদেন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.slice(0, 10).map((transaction) => {
                const isIncome = ['fund_raise', 'loan_returned', 'investment_received'].includes(transaction.transaction_type);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{getTransactionTypeBangla(transaction.transaction_type)}</p>
                        <p className="text-sm text-gray-600">{transaction.description || 'কোন বিবরণ নেই'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.user_name && `${transaction.user_name} • `}
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-orange-600'}`}>
                      {isIncome ? '+' : '-'}৳{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>কোনো লেনদেন নেই</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loans and Investments Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Loans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-orange-600" />
              সক্রিয় ঋণ ({loans.filter(l => l.status === 'active').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.filter(l => l.status === 'active').slice(0, 3).map((loan) => (
                <div key={loan.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{loan.purpose}</p>
                      <p className="text-xs text-gray-600 mt-1">{loan.borrower_name}</p>
                    </div>
                    {loan.is_overdue && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        বিলম্বিত
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>৳{loan.amount.toFixed(2)}</span>
                    <span>ফেরত: {formatDate(loan.due_date)}</span>
                  </div>
                  {loan.borrower_name === user?.full_name && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full mt-2 text-xs"
                      onClick={() => {
                        const remainingAmount = loan.amount - loan.returned_amount;
                        const amount = prompt(`কত টাকা ফেরত দিতে চান? (সর্বোচ্চ: ৳${remainingAmount.toFixed(2)})`);
                        if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= remainingAmount) {
                          handleReturnLoan(loan.id, parseFloat(amount));
                        }
                      }}
                    >
                      ফেরত দিন
                    </Button>
                  )}
                </div>
              ))}
              {loans.filter(l => l.status === 'active').length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm">কোনো সক্রিয় ঋণ নেই</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Investments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              সক্রিয় বিনিয়োগ ({investments.filter(i => i.status === 'active').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investments.filter(i => i.status === 'active').slice(0, 3).map((investment) => (
                <div key={investment.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">বিনিয়োগ #{investment.id}</p>
                      <p className="text-xs text-gray-600 mt-1">{investment.investor_name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {(investment.profit_rate * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>৳{investment.amount.toFixed(2)}</span>
                    <span>বর্তমান: ৳{investment.current_value.toFixed(2)}</span>
                  </div>
                  {investment.investor_name === user?.full_name && 
                   new Date(investment.maturity_date) <= new Date() && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full mt-2 text-xs"
                      onClick={() => handleWithdrawInvestment(investment.id)}
                    >
                      উত্তোলন করুন
                    </Button>
                  )}
                </div>
              ))}
              {investments.filter(i => i.status === 'active').length === 0 && (
                <p className="text-center text-gray-500 py-4 text-sm">কোনো সক্রিয় বিনিয়োগ নেই</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Forms */}
      {/* Donate Form */}
      {showDonateForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Plus className="w-5 h-5" />
                  দান করুন
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDonateForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">পরিমাণ (৳)</label>
                  <Input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="দানের পরিমাণ"
                    required
                    min="1"
                    step="0.01"
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">বিবরণ (ঐচ্ছিক)</label>
                  <Textarea
                    value={donateDescription}
                    onChange={(e) => setDonateDescription(e.target.value)}
                    placeholder="দানের উদ্দেশ্য"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                    দান করুন
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowDonateForm(false)}>
                    বাতিল
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loan Form */}
      {showLoanForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <HandHeart className="w-5 h-5" />
                  ঋণ নিন
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowLoanForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLoanApply} className="space-y-4">
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium">💰 সুদমুক্ত ঋণ</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">পরিমাণ (৳)</label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="ঋণের পরিমাণ"
                    required
                    min="1"
                    step="0.01"
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">উদ্দেশ্য</label>
                  <Input
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    placeholder="ঋণের কারণ"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ফেরতের তারিখ</label>
                  <Input
                    type="date"
                    value={loanDueDate}
                    onChange={(e) => setLoanDueDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                    আবেদন করুন
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowLoanForm(false)}>
                    বাতিল
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investment Form */}
      {showInvestForm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                  বিনিয়োগ করুন
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowInvestForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleInvest} className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">বার্ষিক রিটার্ন রেট: {returnRate}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">পরিমাণ (৳)</label>
                  <Input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="বিনিয়োগের পরিমাণ"
                    required
                    min="1"
                    step="0.01"
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">মেয়াদ (মাস)</label>
                  <Input
                    type="number"
                    value={investDuration}
                    onChange={(e) => setInvestDuration(e.target.value)}
                    placeholder="কত মাস"
                    required
                    min="1"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    বিনিয়োগ করুন
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowInvestForm(false)}>
                    বাতিল
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommunityFunds;
