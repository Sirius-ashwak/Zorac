import { useAccount } from 'wagmi';
import { Plus, TrendingUp, Users, DollarSign, Eye, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatEth, formatNumber } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface DashboardStats {
  totalCampaigns: number;
  totalRaised: number;
  totalSupporters: number;
  reputationScore: number;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  imageUri: string;
  priceETH: number;
  totalSupply: number;
  minted: number;
  status: string;
  endDate: string;
}

export function Dashboard() {
  const { address } = useAccount();

  const { data: stats } = useQuery({
    queryKey: ['/api/users/stats', address],
    queryFn: async () => {
      const response = await fetch(`/api/users/stats?address=${address}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!address,
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/campaigns/creator', address],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/creator?address=${address}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
    enabled: !!address,
  });



  const dashboardStats: DashboardStats = stats?.data || {
    totalCampaigns: 0,
    totalRaised: 0,
    totalSupporters: 0,
    reputationScore: 0,
  };

  const userCampaigns: Campaign[] = campaigns?.data || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Creator Dashboard
          </h1>
          <p className="text-muted-foreground">
            {address ? `Welcome back! Here's an overview of your campaigns and performance.` : 'Explore campaigns and discover amazing creators'}
          </p>
        </div>
        {address ? (
          <Link to="/create">
            <button className="coinbase-button flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Connect to create</span>
            </div>
            <ConnectButton />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Campaigns',
            value: formatNumber(dashboardStats.totalCampaigns),
            icon: TrendingUp,
            change: '+12%',
          },
          {
            title: 'Total Raised',
            value: formatEth(dashboardStats.totalRaised),
            icon: DollarSign,
            change: '+23%',
          },
          {
            title: 'Total Supporters',
            value: formatNumber(dashboardStats.totalSupporters),
            icon: Users,
            change: '+8%',
          },
          {
            title: 'Reputation Score',
            value: dashboardStats.reputationScore.toFixed(1),
            icon: Eye,
            change: '+5%',
          },
        ].map((stat) => (
          <div key={stat.title} className="coinbase-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
                <p className="text-success text-sm mt-1">
                  {stat.change} from last month
                </p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns Section */}
      <div className="coinbase-card p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Your Campaigns</h2>
        {campaignsLoading ? (
          <div className="flex justify-center py-8">
            <div className="spinner w-8 h-8"></div>
          </div>
        ) : userCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCampaigns.map((campaign) => (
              <div key={campaign.id} className="coinbase-card p-4">
                <img
                  src={campaign.imageUri || 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=400&q=80'}
                  alt={campaign.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <h3 className="text-foreground font-semibold mb-2">
                  {campaign.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">
                      {campaign.minted}/{campaign.totalSupply}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((campaign.minted / campaign.totalSupply) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className={`status-pill ${
                      campaign.status === 'active' 
                        ? 'status-pill-success' 
                        : 'status-pill-warning'
                    }`}>
                      {campaign.status}
                    </span>
                    <Link to={`/campaign/${campaign.id}`}>
                      <button className="coinbase-button-secondary text-sm px-3 py-1">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              No campaigns yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first campaign to start building your reputation and connecting with supporters.
            </p>
            <Link to="/create">
              <button className="coinbase-button flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Campaign
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}