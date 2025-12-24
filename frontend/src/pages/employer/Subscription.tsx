import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";
import { Check, AlertCircle, Crown, Zap, Rocket } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number | string;
  currency: string;
  maxEmployees: number;
  maxMonthlyPayments: number;
  featureList: string[];
  popular?: boolean;
}

interface CurrentSubscription {
  plan: string;
  status: string;
  isValid: boolean;
  daysRemaining: number;
  limits: {
    maxEmployees: number;
    maxMonthlyPayments: number;
  };
  usageStats: {
    employeesCount: number;
    paymentsThisMonth: number;
  };
  pricing: {
    amount: number;
    currency: string;
    billingCycle: string;
  };
}

const Subscription = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        api.get("/subscriptions/plans"),
        api.get("/subscriptions/current")
      ]);
      
      setPlans(plansRes.data.plans);
      setCurrentSubscription(subRes.data.subscription);
    } catch (error: any) {
      console.error("Error fetching subscription data:", error);
      toast.error(error.response?.data?.message || "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (changingPlan) return;

    try {
      setChangingPlan(true);
      await api.post("/subscriptions/change-plan", { plan: planId });
      toast.success("Subscription plan updated successfully!");
      await fetchData();
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast.error(error.response?.data?.message || "Failed to change plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      await api.post("/subscriptions/cancel");
      toast.success("Subscription cancelled successfully");
      await fetchData();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast.error(error.response?.data?.message || "Failed to cancel subscription");
    }
  };

  const getEmployeeUsagePercentage = () => {
    if (!currentSubscription) return 0;
    if (currentSubscription.limits.maxEmployees === -1) return 0;
    return (currentSubscription.usageStats.employeesCount / currentSubscription.limits.maxEmployees) * 100;
  };

  const getPaymentUsagePercentage = () => {
    if (!currentSubscription) return 0;
    if (currentSubscription.limits.maxMonthlyPayments === -1) return 0;
    return (currentSubscription.usageStats.paymentsThisMonth / currentSubscription.limits.maxMonthlyPayments) * 100;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Zap className="h-6 w-6" />;
      case 'professional': return <Crown className="h-6 w-6" />;
      case 'enterprise': return <Rocket className="h-6 w-6" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="employer">
        <div className="flex items-center justify-center h-96">
          <p>Loading subscription information...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="employer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan and billing
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    {currentSubscription.status === 'trial' 
                      ? `${currentSubscription.daysRemaining} days remaining in trial`
                      : `Next billing: ${currentSubscription.daysRemaining} days`
                    }
                  </CardDescription>
                </div>
                <Badge variant={currentSubscription.isValid ? "default" : "destructive"}>
                  {currentSubscription.plan.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!currentSubscription.isValid && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription has expired. Please upgrade to continue using the platform.
                  </AlertDescription>
                </Alert>
              )}

              {currentSubscription.status === 'trial' && currentSubscription.daysRemaining <= 3 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your trial is ending soon! Upgrade now to avoid service interruption.
                  </AlertDescription>
                </Alert>
              )}

              {/* Usage Stats */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Employees</span>
                    <span className="text-muted-foreground">
                      {currentSubscription.usageStats.employeesCount} / {currentSubscription.limits.maxEmployees === -1 ? '∞' : currentSubscription.limits.maxEmployees}
                    </span>
                  </div>
                  <Progress value={getEmployeeUsagePercentage()} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Payments This Month</span>
                    <span className="text-muted-foreground">
                      {currentSubscription.usageStats.paymentsThisMonth} / {currentSubscription.limits.maxMonthlyPayments === -1 ? '∞' : currentSubscription.limits.maxMonthlyPayments}
                    </span>
                  </div>
                  <Progress value={getPaymentUsagePercentage()} className="h-2" />
                </div>
              </div>

              {currentSubscription.pricing.amount > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Current billing: <span className="font-semibold text-foreground">
                      {currentSubscription.pricing.currency} {currentSubscription.pricing.amount.toLocaleString()}/{currentSubscription.pricing.billingCycle}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
            {currentSubscription.status !== 'cancelled' && currentSubscription.plan !== 'free' && (
              <CardFooter>
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </CardFooter>
            )}
          </Card>
        )}

        {/* Available Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${currentSubscription?.plan === plan.id ? 'bg-muted/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2">
                    {getPlanIcon(plan.id)}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    {typeof plan.price === 'number' ? (
                      <>
                        <span className="text-3xl font-bold">{plan.currency} {plan.price.toLocaleString()}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">Contact us</span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {plan.featureList.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  {currentSubscription?.plan === plan.id ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.price === 'custom' ? (
                    <Button className="w-full" variant="outline">
                      Contact Sales
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={changingPlan}
                    >
                      {changingPlan ? 'Processing...' : 'Select Plan'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;

