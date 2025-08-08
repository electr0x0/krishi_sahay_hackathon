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
  BarChart3,
  PieChart
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
  const [showReturnRateForm, setShowReturnRateForm] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateDescription, setDonateDescription] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('');
  const [loanNotes, setLoanNotes] = useState('');
  const [investAmount, setInvestAmount] = useState('');
  const [investDuration, setInvestDuration] = useState('');
  const [investNotes, setInvestNotes] = useState('');
  const [newReturnRate, setNewReturnRate] = useState('');

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
        investNotes
      );
      setAlert({ type: 'success', message: 'বিনিয়োগ সফলভাবে সম্পন্ন হয়েছে!' });
      setShowInvestForm(false);
      setInvestAmount('');
      setInvestDuration('');
      setInvestNotes('');
      fetchAllData();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'বিনিয়োগ করতে সমস্যা হয়েছে।' });
    }
  };

  const handleSetReturnRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReturnRate) return;

    try {
      await api.setReturnRate(communityId, parseFloat(newReturnRate) / 100); // Convert percentage to decimal
      setAlert({ type: 'success', message: 'রিটার্ন রেট সফলভাবে আপডেট করা হয়েছে!' });
      setShowReturnRateForm(false);
      setNewReturnRate('');
      fetchAllData();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.message || 'রিটার্ন রেট আপডেট করতে সমস্যা হয়েছে।' });
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
      case 'fund_raise': return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
      case 'loan_given': return <ArrowDownCircle className="w-4 h-4 text-red-600" />;
      case 'loan_returned': return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
      case 'investment_received': return <ArrowUpCircle className="w-4 h-4 text-blue-600" />;
      case 'investment_returned': return <ArrowDownCircle className="w-4 h-4 text-blue-600" />;
      case 'commission_earned': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'expense': return <ArrowDownCircle className="w-4 h-4 text-orange-600" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionTypeBangla = (type: string) => {
    switch (type) {
      case 'fund_raise': return 'তহবিল সংগ্রহ';
      case 'loan_given': return 'ঋণ প্রদান';
      case 'loan_returned': return 'ঋণ ফেরত';
      case 'investment_received': return 'বিনিয়োগ গ্রহণ';
      case 'investment_returned': return 'বিনিয়োগ প্রত্যাবর্তন';
      case 'commission_earned': return 'কমিশন আয়';
      case 'expense': return 'খরচ';
      default: return type;
    }
  };

  const getStatusBangla = (status: string) => {
    switch (status) {
      case 'active': return 'সক্রিয়';
      case 'completed': return 'সম্পন্ন';
      case 'overdue': return 'বিলম্বিত';
      case 'matured': return 'পরিপক্ব';
      case 'withdrawn': return 'উত্তোলিত';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">তহবিলের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Fund Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">বর্তমান ব্যালেন্স</p>
                <p className="text-xl font-bold text-green-600">৳{fundData?.current_balance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">মোট সংগৃহীত</p>
                <p className="text-xl font-bold text-blue-600">৳{fundData?.total_raised?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">মোট ঋণ</p>
                <p className="text-xl font-bold text-orange-600">৳{fundData?.total_loans?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">মোট বিনিয়োগ</p>
                <p className="text-xl font-bold text-purple-600">৳{fundData?.total_investments?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">বার্ষিক রিটার্ন রেট</p>
                <p className="text-xl font-bold text-indigo-600">{((fundData?.fixed_return_rate || 0) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={() => setShowDonateForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          দান করুন
        </Button>
        
        <Button 
          onClick={() => setShowLoanForm(true)}
          variant="outline"
          className="border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <HandHeart className="w-4 h-4 mr-2" />
          ঋণের আবেদন
        </Button>

        <Button 
          onClick={() => setShowInvestForm(true)}
          variant="outline"
          className="border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          বিনিয়োগ করুন
        </Button>

        {isLeader && (
          <Button 
            onClick={() => setShowReturnRateForm(true)}
            variant="outline"
            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            রিটার্ন রেট সেট করুন
          </Button>
        )}
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">লেনদেন</TabsTrigger>
          <TabsTrigger value="loans">ঋণ</TabsTrigger>
          <TabsTrigger value="investments">বিনিয়োগ</TabsTrigger>
          <TabsTrigger value="charts">চার্ট</TabsTrigger>
          <TabsTrigger value="summary">সারসংক্ষেপ</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>সাম্প্রতিক লেনদেন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium">{getTransactionTypeBangla(transaction.transaction_type)}</p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {transaction.user_name && `${transaction.user_name} • `}
                            {new Date(transaction.created_at).toLocaleDateString('bn-BD')}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        ['fund_raise', 'loan_returned', 'investment_received', 'commission_earned'].includes(transaction.transaction_type)
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {['fund_raise', 'loan_returned', 'investment_received', 'commission_earned'].includes(transaction.transaction_type)
                          ? '+' : '-'}৳{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">কোনো লেনদেন নেই।</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>ঋণের তালিকা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loans.length > 0 ? (
                  loans.map((loan) => (
                    <div key={loan.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{loan.purpose}</h4>
                            <Badge variant={loan.status === 'completed' ? 'default' : loan.is_overdue ? 'destructive' : 'secondary'}>
                              {getStatusBangla(loan.status)}
                            </Badge>
                            {loan.is_overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>ঋণগ্রহীতা: {loan.borrower_name}</p>
                            <p>পরিমাণ: ৳{loan.amount.toFixed(2)}</p>
                            <p>ফেরত: ৳{loan.returned_amount.toFixed(2)}</p>
                            <p>বাকি: ৳{(loan.amount - loan.returned_amount).toFixed(2)}</p>
                            <p>শেষ তারিখ: {new Date(loan.due_date).toLocaleDateString('bn-BD')}</p>
                          </div>
                        </div>
                        {loan.status === 'active' && loan.borrower_name === user?.full_name && (
                          <Button 
                            size="sm"
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
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">কোনো ঋণ নেই।</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments">
          <Card>
            <CardHeader>
              <CardTitle>বিনিয়োগের তালিকা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {investments.length > 0 ? (
                  investments.map((investment) => (
                    <div key={investment.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">বিনিয়োগ #{investment.id}</h4>
                            <Badge variant={investment.status === 'active' ? 'secondary' : 'default'}>
                              {getStatusBangla(investment.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>বিনিয়োগকারী: {investment.investor_name}</p>
                            <p>মূল পরিমাণ: ৳{investment.amount.toFixed(2)}</p>
                            <p>লাভের হার: {(investment.profit_rate * 100).toFixed(1)}% (বার্ষিক)</p>
                            <p>বর্তমান মূল্য: ৳{investment.current_value.toFixed(2)}</p>
                            <p>পরিপক্বতার তারিখ: {new Date(investment.maturity_date).toLocaleDateString('bn-BD')}</p>
                          </div>
                        </div>
                        {investment.status === 'active' && 
                         investment.investor_name === user?.full_name && 
                         new Date(investment.maturity_date) <= new Date() && (
                          <Button 
                            size="sm"
                            onClick={() => handleWithdrawInvestment(investment.id)}
                          >
                            উত্তোলন করুন
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">কোনো বিনিয়োগ নেই।</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fund Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  তহবিল বণ্টন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span>উপলব্ধ ব্যালেন্স</span>
                    </div>
                    <span className="font-bold">৳{fundData?.current_balance?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span>ঋণে দেওয়া</span>
                    </div>
                    <span className="font-bold">৳{fundData?.total_loans?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span>বিনিয়োগে</span>
                    </div>
                    <span className="font-bold">৳{fundData?.total_investments?.toFixed(2) || '0.00'}</span>
                  </div>
                  
                  {/* Simple bar visualization */}
                  <div className="mt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">ব্যালেন্স</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full" 
                            style={{
                              width: `${Math.max(10, (fundData?.current_balance || 0) / (fundData?.total_raised || 1) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">ঋণ</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-orange-500 h-3 rounded-full" 
                            style={{
                              width: `${Math.max(10, (fundData?.total_loans || 0) / (fundData?.total_raised || 1) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm w-20">বিনিয়োগ</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-purple-500 h-3 rounded-full" 
                            style={{
                              width: `${Math.max(10, (fundData?.total_investments || 0) / (fundData?.total_raised || 1) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  লেনদেনের ধরন
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const transactionStats = transactions.reduce((acc, t) => {
                      acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    const maxCount = Math.max(...Object.values(transactionStats), 1);

                    return Object.entries(transactionStats).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-sm w-24">{getTransactionTypeBangla(type)}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full flex items-center justify-center" 
                            style={{ width: `${Math.max(15, (count / maxCount) * 100)}%` }}
                          >
                            <span className="text-xs text-white font-medium">{count}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Fund Health Indicator */}
            <Card>
              <CardHeader>
                <CardTitle>তহবিলের স্বাস্থ্য</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-6xl ${
                    (fundData?.current_balance || 0) > (fundData?.total_loans || 0) * 0.5 
                      ? 'text-green-500' 
                      : (fundData?.current_balance || 0) > 0 
                        ? 'text-yellow-500' 
                        : 'text-red-500'
                  }`}>
                    {(fundData?.current_balance || 0) > (fundData?.total_loans || 0) * 0.5 
                      ? '😊' 
                      : (fundData?.current_balance || 0) > 0 
                        ? '😐' 
                        : '😟'}
                  </div>
                  <p className={`font-medium ${
                    (fundData?.current_balance || 0) > (fundData?.total_loans || 0) * 0.5 
                      ? 'text-green-600' 
                      : (fundData?.current_balance || 0) > 0 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`}>
                    {(fundData?.current_balance || 0) > (fundData?.total_loans || 0) * 0.5 
                      ? 'তহবিল খুবই ভালো অবস্থায়' 
                      : (fundData?.current_balance || 0) > 0 
                        ? 'তহবিল ঠিক আছে' 
                        : 'তহবিলে সমস্যা আছে'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Commission Settings */}
            <Card>
              <CardHeader>
                <CardTitle>কমিশন সেটিংস</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>বর্তমান কমিশন রেট:</span>
                    <span className="font-medium">{((fundData?.commission_rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>বার্ষিক রিটার্ন রেট:</span>
                    <span className="font-medium">{((fundData?.fixed_return_rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      প্রতি বিক্রয়ে {((fundData?.commission_rate || 0) * 100).toFixed(1)}% কমিশন 
                      স্বয়ংক্রিয়ভাবে কমিউনিটি তহবিলে যোগ হয়।
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>তহবিল সারসংক্ষেপ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>কমিশনের হার:</span>
                  <span className="font-medium">{((fundData?.commission_rate || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>সক্রিয় ঋণ:</span>
                  <span className="font-medium">{loans.filter(l => l.status === 'active').length}টি</span>
                </div>
                <div className="flex justify-between">
                  <span>সক্রিয় বিনিয়োগ:</span>
                  <span className="font-medium">{investments.filter(i => i.status === 'active').length}টি</span>
                </div>
                <div className="flex justify-between">
                  <span>বিলম্বিত ঋণ:</span>
                  <span className="font-medium text-red-600">{loans.filter(l => l.is_overdue).length}টি</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>আর্থিক স্বাস্থ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    (fundData?.current_balance || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(fundData?.current_balance || 0) > 0 ? '✓' : '⚠'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {(fundData?.current_balance || 0) > 0 
                      ? 'তহবিল স্বাস্থ্যকর অবস্থায় আছে' 
                      : 'তহবিলে পর্যাপ্ত অর্থ নেই'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Forms */}
      {/* Donate Form */}
      {showDonateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl border-0">
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                তহবিলে দান করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleDonate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">পরিমাণ (৳)</label>
                  <Input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="দানের পরিমাণ লিখুন"
                    required
                    min="1"
                    step="0.01"
                    className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">বিবরণ (ঐচ্ছিক)</label>
                  <Textarea
                    value={donateDescription}
                    onChange={(e) => setDonateDescription(e.target.value)}
                    placeholder="দানের উদ্দেশ্য বা বিবরণ"
                    rows={3}
                    className="border-gray-300 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">দান করুন</Button>
                  <Button type="button" variant="outline" onClick={() => setShowDonateForm(false)} className="border-gray-300">বাতিল</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loan Form */}
      {showLoanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl border-0">
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <HandHeart className="w-5 h-5" />
                ঋণের আবেদন
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLoanApply} className="space-y-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">💰 সুদমুক্ত ঋণ</p>
                  <p className="text-xs text-orange-600 mt-1">কমিউনিটি থেকে সুদ ছাড়াই ঋণ নিন</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">পরিমাণ (৳)</label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="ঋণের পরিমাণ"
                    required
                    min="1"
                    step="0.01"
                    className="border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">উদ্দেশ্য</label>
                  <Input
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    placeholder="ঋণের কারণ বা উদ্দেশ্য"
                    required
                    className="border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">ফেরতের তারিখ</label>
                  <Input
                    type="date"
                    value={loanDueDate}
                    onChange={(e) => setLoanDueDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">অতিরিক্ত তথ্য (ঐচ্ছিক)</label>
                  <Textarea
                    value={loanNotes}
                    onChange={(e) => setLoanNotes(e.target.value)}
                    placeholder="অন্যান্য তথ্য বা মন্তব্য"
                    rows={3}
                    className="border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">আবেদন করুন</Button>
                  <Button type="button" variant="outline" onClick={() => setShowLoanForm(false)} className="border-gray-300">বাতিল</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investment Form */}
      {showInvestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl border-0">
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                বিনিয়োগ করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleInvest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">পরিমাণ (৳)</label>
                  <Input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="বিনিয়োগের পরিমাণ"
                    required
                    min="1"
                    step="0.01"
                    className="border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">বার্ষিক রিটার্ন রেট: {((fundData?.fixed_return_rate || 0) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 mt-1">এই রেট কমিউনিটি নেতৃত্ব নির্ধারণ করেছে</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">মেয়াদ (মাস)</label>
                  <Input
                    type="number"
                    value={investDuration}
                    onChange={(e) => setInvestDuration(e.target.value)}
                    placeholder="বিনিয়োগের মেয়াদ মাসে"
                    required
                    min="1"
                    className="border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">মন্তব্য (ঐচ্ছিক)</label>
                  <Textarea
                    value={investNotes}
                    onChange={(e) => setInvestNotes(e.target.value)}
                    placeholder="বিনিয়োগ সম্পর্কে অতিরিক্ত তথ্য"
                    rows={3}
                    className="border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">বিনিয়োগ করুন</Button>
                  <Button type="button" variant="outline" onClick={() => setShowInvestForm(false)} className="border-gray-300">বাতিল</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Return Rate Form */}
      {showReturnRateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl border-0">
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                রিটার্ন রেট সেট করুন
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSetReturnRate} className="space-y-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-700 font-medium">বর্তমান রেট: {((fundData?.fixed_return_rate || 0) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-indigo-600 mt-1">নতুন বিনিয়োগে এই রেট প্রযোজ্য হবে</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">নতুন বার্ষিক রিটার্ন রেট (%)</label>
                  <Input
                    type="number"
                    value={newReturnRate}
                    onChange={(e) => setNewReturnRate(e.target.value)}
                    placeholder="যেমন: ১২ (১২% এর জন্য)"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-700">⚠️ এই পরিবর্তন শুধুমাত্র নতুন বিনিয়োগে প্রযোজ্য হবে। পুরাতন বিনিয়োগে আগের রেট বলবৎ থাকবে।</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">রেট আপডেট করুন</Button>
                  <Button type="button" variant="outline" onClick={() => setShowReturnRateForm(false)} className="border-gray-300">বাতিল</Button>
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
