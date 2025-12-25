import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Code2, 
  Lock, 
  Zap, 
  Shield, 
  Users, 
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  BookOpen,
  ChevronRight,
  Copy,
  Check,
  Menu,
  X,
  ExternalLink,
  FileText
} from 'lucide-react';

const ApiDocs = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const [activeSection, setActiveSection] = useState('welcome');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const navigation = [
    {
      title: 'Getting Started',
      items: [
        { id: 'welcome', label: 'Welcome', icon: BookOpen },
        { id: 'quick-start', label: 'Quick Start', icon: Zap },
        { id: 'authentication', label: 'Authentication', icon: Lock },
      ],
    },
    {
      title: 'API Reference',
      items: [
        { id: 'auth-endpoints', label: 'Authentication', icon: Lock },
        { id: 'company-endpoints', label: 'Company Management', icon: Building2 },
        { id: 'employee-endpoints', label: 'Employee Management', icon: Users },
        { id: 'timelog-endpoints', label: 'Time Tracking', icon: Clock },
        { id: 'payment-endpoints', label: 'Payments & Payroll', icon: CreditCard },
        { id: 'analytics-endpoints', label: 'Analytics', icon: BarChart3 },
        { id: 'subscription-endpoints', label: 'Subscriptions', icon: Settings },
      ],
    },
    {
      title: 'Resources',
      items: [
        { id: 'errors', label: 'Error Handling', icon: Shield },
        { id: 'rate-limits', label: 'Rate Limits', icon: Zap },
      ],
    },
  ];

  const MethodBadge = ({ method }: { method: string }) => {
    const variants: Record<string, string> = {
      GET: 'bg-blue-500 hover:bg-blue-600',
      POST: 'bg-green-500 hover:bg-green-600',
      PUT: 'bg-yellow-500 hover:bg-yellow-600',
      DELETE: 'bg-red-500 hover:bg-red-600',
    };
    return (
      <Badge className={`${variants[method]} text-white font-mono text-xs px-2 py-0.5`}>
        {method}
      </Badge>
    );
  };

  const CodeBlock = ({ children, language = 'bash', id }: { children: string; language?: string; id?: string }) => (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          onClick={() => id && copyToClipboard(children, id)}
        >
          {copiedCode === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <Code2 className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-400 font-mono">{language}</span>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm border border-gray-800 rounded-b-lg">
        <code>{children}</code>
      </pre>
    </div>
  );

  const EndpointCard = ({ 
    method, 
    path, 
    description, 
    auth = true,
    requestBody,
    responseExample,
    queryParams
  }: {
    method: string;
    path: string;
    description: string;
    auth?: boolean;
    requestBody?: string;
    responseExample?: string;
    queryParams?: string;
  }) => (
    <Card className="mb-6 border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 mb-2 flex-wrap">
          <MethodBadge method={method} />
          <code className="text-sm font-mono bg-gray-100 px-3 py-1.5 rounded flex-1 min-w-0 break-all">
            {path}
          </code>
          {auth && (
            <Badge variant="outline" className="border-orange-400 text-orange-700 text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Auth
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm text-gray-600 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      {(requestBody || responseExample || queryParams) && (
        <CardContent className="pt-0">
          <Tabs defaultValue={requestBody ? "request" : queryParams ? "params" : "response"} className="w-full">
            <TabsList className="bg-gray-100">
              {requestBody && <TabsTrigger value="request">Request</TabsTrigger>}
              {queryParams && <TabsTrigger value="params">Parameters</TabsTrigger>}
              {responseExample && <TabsTrigger value="response">Response</TabsTrigger>}
            </TabsList>
            {requestBody && (
              <TabsContent value="request" className="mt-4">
                <CodeBlock language="json" id={`${method}-${path}-req`}>{requestBody}</CodeBlock>
              </TabsContent>
            )}
            {queryParams && (
              <TabsContent value="params" className="mt-4">
                <CodeBlock language="text" id={`${method}-${path}-params`}>{queryParams}</CodeBlock>
              </TabsContent>
            )}
            {responseExample && (
              <TabsContent value="response" className="mt-4">
                <CodeBlock language="json" id={`${method}-${path}-res`}>{responseExample}</CodeBlock>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center px-4 lg:px-8">
          <Button
            variant="ghost"
            className="mr-2 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-black hidden sm:inline-block">SiraFlow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            <Link to="/">
              <Button variant="ghost" className="text-gray-600 hover:text-black">
                Docs
              </Button>
            </Link>
            <Button variant="ghost" className="text-black font-semibold">
              API Reference
            </Button>
          </nav>

          <div className="ml-auto flex items-center space-x-2">
            <Link to="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar Navigation */}
        <aside className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <ScrollArea className="h-full py-6 px-3">
            <nav className="space-y-6">
              {navigation.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
                            ${isActive 
                              ? 'bg-gray-100 text-black font-medium' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span>{item.label}</span>
                          {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
            {/* Welcome Section */}
            <section id="welcome" className="scroll-mt-20 mb-16">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 mb-4">
                  <FileText className="h-3 w-3" />
                  API Documentation v1.0.0
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
                  Welcome
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Welcome to the SiraFlow developer docs! Our API makes it easy to integrate workforce management, 
                  time tracking, and payroll automation into your applications. SiraFlow is designed to deliver 
                  reliable, efficient payroll processing with instant mobile money disbursements.
                </p>
              </div>

              {/* Hero Feature Card */}
              <Card className="border-2 border-gray-900 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden mb-6">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">SiraFlow REST API</h2>
                  <p className="text-gray-300 mb-6">
                    A comprehensive REST API for Ethiopian businesses. Optimized for high-performance workforce management 
                    and instant payroll processing.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Base URL</div>
                      <code className="text-sm text-emerald-400">{baseUrl}/api</code>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Authentication</div>
                      <div className="text-sm">Bearer Token</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-3">Features</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span>RESTful design</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-blue-400" />
                        <span>JSON responses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span>Secure authentication</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-purple-400" />
                        <span>Instant B2C payments</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-12" />

            {/* Quick Start Section */}
            <section id="quick-start" className="scroll-mt-20 mb-16">
              <h2 className="text-3xl font-bold text-black mb-4">Quick Start</h2>
              <p className="text-gray-600 mb-6">
                Get up and running with the SiraFlow API in minutes. Follow these examples to make your first API call.
              </p>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Installation</CardTitle>
                    <CardDescription>
                      No SDK installation required. Use any HTTP client or library in your preferred language.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Make Your First Request</CardTitle>
                    <CardDescription>
                      Here's how to authenticate and make your first API call:
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="bg-gray-100">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                      </TabsList>
                      <TabsContent value="curl" className="mt-4">
                        <CodeBlock language="bash" id="quick-curl">{`# Login to get access token
curl -X POST ${baseUrl}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "employer@example.com",
    "password": "yourpassword"
  }'

# Use the token for authenticated requests
curl -X GET ${baseUrl}/api/employees \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}</CodeBlock>
                      </TabsContent>
                      <TabsContent value="javascript" className="mt-4">
                        <CodeBlock language="javascript" id="quick-js">{`// Login to get access token
const response = await fetch('${baseUrl}/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'employer@example.com',
    password: 'yourpassword'
  })
});

const { token } = await response.json();

// Use the token for authenticated requests
const employees = await fetch('${baseUrl}/api/employees', {
  headers: { 'Authorization': \`Bearer \${token}\` }
}).then(res => res.json());

console.log(employees);`}</CodeBlock>
                      </TabsContent>
                      <TabsContent value="python" className="mt-4">
                        <CodeBlock language="python" id="quick-python">{`import requests

# Login to get access token
response = requests.post('${baseUrl}/api/auth/login', json={
    'email': 'employer@example.com',
    'password': 'yourpassword'
})
token = response.json()['token']

# Use the token for authenticated requests
headers = {'Authorization': f'Bearer {token}'}
employees = requests.get('${baseUrl}/api/employees', 
                        headers=headers).json()

print(employees)`}</CodeBlock>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator className="my-12" />

            {/* Authentication Section */}
            <section id="authentication" className="scroll-mt-20 mb-16">
              <h2 className="text-3xl font-bold text-black mb-4">Authentication</h2>
              <p className="text-gray-600 mb-6">
                The SiraFlow API uses Bearer token authentication. Include your token in the Authorization header for all authenticated requests.
              </p>

              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Lock className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800">
                  <p>Your API token is obtained by logging in via the <code className="bg-blue-100 px-2 py-1 rounded">/api/auth/login</code> endpoint. 
                  Store it securely and never share it publicly. Tokens should be included in the Authorization header as: 
                  <code className="bg-blue-100 px-2 py-1 rounded ml-1">Bearer YOUR_TOKEN</code></p>
                </CardContent>
              </Card>

              <CodeBlock language="bash" id="auth-example">{`# Example authenticated request
curl -X GET ${baseUrl}/api/employees \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`}</CodeBlock>
            </section>

            <Separator className="my-12" />

            {/* Auth Endpoints Section */}
            <section id="auth-endpoints" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Authentication</h2>
                  <p className="text-gray-600">User authentication and profile management endpoints</p>
                </div>
              </div>

              <EndpointCard
                method="POST"
                path="/api/auth/signup"
                description="Register a new employer account. Only employers can self-register through this endpoint."
                auth={false}
                requestBody={`{
  "email": "employer@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}`}
                responseExample={`{
  "success": true,
  "message": "Employer registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "employer@example.com",
    "name": "John Doe",
    "role": "employer"
  }
}`}
              />

              <EndpointCard
                method="POST"
                path="/api/auth/login"
                description="Authenticate with email and password to receive an access token for subsequent API calls."
                auth={false}
                requestBody={`{
  "email": "employer@example.com",
  "password": "securePassword123"
}`}
                responseExample={`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "employer@example.com",
    "name": "John Doe",
    "role": "employer",
    "companyId": "507f1f77bcf86cd799439012"
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/auth/profile"
                description="Retrieve the authenticated user's profile information."
                responseExample={`{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "employer@example.com",
    "name": "John Doe",
    "role": "employer",
    "companyId": "507f1f77bcf86cd799439012",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}`}
              />

              <EndpointCard
                method="POST"
                path="/api/auth/change-password"
                description="Update the authenticated user's password."
                requestBody={`{
  "newPassword": "newSecurePassword123"
}`}
                responseExample={`{
  "success": true,
  "message": "Password updated successfully"
}`}
              />
            </section>

            {/* Company Endpoints */}
            <section id="company-endpoints" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Company Management</h2>
                  <p className="text-gray-600">Manage company profiles, settings, and statistics</p>
                </div>
              </div>

              <EndpointCard
                method="POST"
                path="/api/company"
                description="Create a new company profile. Required for employers before adding employees."
                requestBody={`{
  "name": "Acme Corp",
  "employerName": "John Doe",
  "paymentCycle": "monthly",
  "bonusRateMultiplier": 1.5,
  "maxDailyHours": 8
}`}
                responseExample={`{
  "success": true,
  "company": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Acme Corp",
    "employerId": "507f1f77bcf86cd799439011",
    "paymentCycle": "monthly",
    "bonusRateMultiplier": 1.5,
    "maxDailyHours": 8,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/company/my/company"
                description="Get the authenticated employer's company details."
                responseExample={`{
  "success": true,
  "company": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Acme Corp",
    "employeeCount": 25,
    "paymentCycle": "monthly"
  }
}`}
              />

              <EndpointCard
                method="PUT"
                path="/api/company/my/company"
                description="Update company information."
                requestBody={`{
  "name": "Acme Corporation",
  "paymentCycle": "weekly"
}`}
                responseExample={`{
  "success": true,
  "message": "Company updated successfully"
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/company/my/stats"
                description="Get comprehensive statistics for your company."
                responseExample={`{
  "success": true,
  "stats": {
    "totalEmployees": 25,
    "activeEmployees": 23,
    "totalHoursThisMonth": 4600,
    "totalPaymentsThisMonth": 450000
  }
}`}
              />
            </section>

            {/* Employee Endpoints */}
            <section id="employee-endpoints" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Employee Management</h2>
                  <p className="text-gray-600">Add, update, and manage employees</p>
                </div>
              </div>

              <EndpointCard
                method="POST"
                path="/api/employees"
                description="Add a new employee to your company. Automatically creates a user account for the employee."
                requestBody={`{
  "email": "employee@example.com",
  "name": "Jane Smith",
  "jobRoleId": "507f1f77bcf86cd799439013",
  "department": "Engineering",
  "telebirrMsisdn": "251912345678"
}`}
                responseExample={`{
  "success": true,
  "message": "Employee added successfully",
  "employee": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Jane Smith",
    "email": "employee@example.com",
    "department": "Engineering",
    "isActive": true
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/employees"
                description="Get all employees in your company with optional filtering."
                queryParams="?page=1&limit=10&isActive=true&department=Engineering"
                responseExample={`{
  "success": true,
  "employees": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Jane Smith",
      "department": "Engineering",
      "isActive": true
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/employees/:id"
                description="Get detailed information about a specific employee."
                responseExample={`{
  "success": true,
  "employee": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Jane Smith",
    "totalHoursWorked": 160,
    "totalEarnings": 80000
  }
}`}
              />

              <EndpointCard
                method="PUT"
                path="/api/employees/:id"
                description="Update an employee's information."
                requestBody={`{
  "department": "Product",
  "position": "Senior Developer"
}`}
                responseExample={`{
  "success": true,
  "message": "Employee updated successfully"
}`}
              />

              <EndpointCard
                method="DELETE"
                path="/api/employees/:id"
                description="Remove an employee from your company."
                responseExample={`{
  "success": true,
  "message": "Employee deleted successfully"
}`}
              />
            </section>

            {/* Time Tracking Endpoints */}
            <section id="timelog-endpoints" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Time Tracking</h2>
                  <p className="text-gray-600">Clock in/out, breaks, and time log management</p>
                </div>
              </div>

              <EndpointCard
                method="POST"
                path="/api/time-logs/clock-in"
                description="Employee clocks in to start their work day."
                requestBody={`{
  "location": "Office"
}`}
                responseExample={`{
  "success": true,
  "message": "Clocked in successfully",
  "timeLog": {
    "_id": "507f1f77bcf86cd799439020",
    "clockIn": "2025-01-15T09:00:00.000Z",
    "status": "pending"
  }
}`}
              />

              <EndpointCard
                method="POST"
                path="/api/time-logs/clock-out"
                description="Employee clocks out to end their work day."
                responseExample={`{
  "success": true,
  "message": "Clocked out successfully",
  "timeLog": {
    "clockOut": "2025-01-15T17:00:00.000Z",
    "totalHours": 7.5
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/time-logs/my/status"
                description="Get the employee's current clock status."
                responseExample={`{
  "success": true,
  "status": {
    "isClockedIn": true,
    "isOnBreak": false
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/time-logs/company"
                description="Employer gets all company time logs with filtering options."
                queryParams="?employeeId=xxx&startDate=2025-01-01&status=pending"
                responseExample={`{
  "success": true,
  "timeLogs": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "employee": {
        "name": "Jane Smith"
      },
      "totalHours": 7.5,
      "status": "pending"
    }
  ]
}`}
              />
            </section>

            {/* Payment Endpoints */}
            <section id="payment-endpoints" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Payments & Payroll</h2>
                  <p className="text-gray-600">Process payroll and manage B2C transfers</p>
                </div>
              </div>

              <EndpointCard
                method="POST"
                path="/api/payments/process-payroll"
                description="Calculate and create pending payments for all approved time logs."
                requestBody={`{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}`}
                responseExample={`{
  "success": true,
  "message": "Payroll processed for 23 employees",
  "summary": {
    "totalEmployees": 23,
    "totalAmount": 460000,
    "totalHours": 920
  }
}`}
              />

              <EndpointCard
                method="POST"
                path="/api/payments/approve"
                description="Approve a single payment and initiate B2C transfer."
                requestBody={`{
  "paymentId": "507f1f77bcf86cd799439030"
}`}
                responseExample={`{
  "success": true,
  "message": "Payment approved and initiated",
  "payment": {
    "status": "processing",
    "amount": 20000
  }
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/payments"
                description="Get all payments for your company with filtering options."
                queryParams="?status=completed&page=1"
                responseExample={`{
  "success": true,
  "payments": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "employee": {
        "name": "Jane Smith"
      },
      "amount": 20000,
      "status": "completed"
    }
  ]
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/payments/my"
                description="Employee gets their own payment history."
                queryParams="?startDate=2025-01-01&page=1"
                responseExample={`{
  "success": true,
  "payments": [
    {
      "amount": 20000,
      "status": "completed",
      "processedAt": "2025-02-01T10:00:00.000Z"
    }
  ]
}`}
              />
            </section>

            {/* Analytics Endpoints */}
            <section id="analytics-endpoints" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Analytics</h2>
                  <p className="text-gray-600">Get insights and analytics for your company</p>
                </div>
              </div>

              <EndpointCard
                method="GET"
                path="/api/analytics"
                description="Get comprehensive analytics for your company."
                queryParams="?startDate=2025-01-01&endDate=2025-01-31"
                responseExample={`{
  "success": true,
  "analytics": {
    "totalHours": 920,
    "totalPayments": 460000,
    "averageHoursPerEmployee": 40,
    "attendanceRate": 95.5
  }
}`}
              />

              <EndpointCard
                method="POST"
                path="/api/analytics/attendance"
                description="Generate attendance report for a specific period."
                requestBody={`{
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31"
}`}
                responseExample={`{
  "success": true,
  "report": {
    "totalEmployees": 25,
    "avgAttendanceRate": 95.5
  }
}`}
              />
            </section>

            {/* Subscription Endpoints */}
            <section id="subscription-endpoints" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Subscriptions</h2>
                  <p className="text-gray-600">Manage subscription plans and billing</p>
                </div>
              </div>

              <EndpointCard
                method="GET"
                path="/api/subscriptions/plans"
                description="Get all available subscription plans. Public endpoint."
                auth={false}
                responseExample={`{
  "success": true,
  "plans": [
    {
      "name": "starter",
      "price": 999,
      "maxEmployees": 20
    }
  ]
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/subscriptions/current"
                description="Get your current subscription details."
                responseExample={`{
  "success": true,
  "subscription": {
    "plan": "starter",
    "status": "active",
    "employeesUsed": 15
  }
}`}
              />

              <EndpointCard
                method="POST"
                path="/api/subscriptions/change-plan"
                description="Change your subscription plan."
                requestBody={`{
  "plan": "professional",
  "billingCycle": "yearly"
}`}
                responseExample={`{
  "success": true,
  "message": "Plan changed successfully"
}`}
              />
            </section>

            {/* Error Handling */}
            <section id="errors" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Error Handling</h2>
                  <p className="text-gray-600">Understanding API error responses</p>
                </div>
              </div>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>HTTP Status Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { code: '200', label: 'OK', desc: 'Request successful', color: 'bg-green-500' },
                      { code: '201', label: 'Created', desc: 'Resource created successfully', color: 'bg-green-500' },
                      { code: '400', label: 'Bad Request', desc: 'Invalid request parameters', color: 'bg-yellow-500' },
                      { code: '401', label: 'Unauthorized', desc: 'Invalid or missing token', color: 'bg-red-500' },
                      { code: '403', label: 'Forbidden', desc: 'Insufficient permissions', color: 'bg-red-500' },
                      { code: '404', label: 'Not Found', desc: 'Resource not found', color: 'bg-red-500' },
                      { code: '429', label: 'Too Many Requests', desc: 'Rate limit exceeded', color: 'bg-orange-500' },
                      { code: '500', label: 'Server Error', desc: 'Internal server error', color: 'bg-red-600' },
                    ].map((status) => (
                      <div key={status.code} className="flex items-start gap-3">
                        <Badge className={`${status.color} text-white w-14 justify-center`}>{status.code}</Badge>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{status.label}</p>
                          <p className="text-sm text-gray-600">{status.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-4">Error responses follow this format:</p>
                <CodeBlock language="json" id="error-format">{`{
  "success": false,
  "error": "Error message description",
  "details": {
    "field": "email",
    "message": "Valid email is required"
  }
}`}</CodeBlock>
              </div>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="scroll-mt-20 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-black">Rate Limits</h2>
                  <p className="text-gray-600">API request limits and quotas</p>
                </div>
              </div>

              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-black mb-1">General Endpoints</p>
                      <p className="text-sm text-gray-700">100 requests per 15 minutes</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-semibold text-black mb-1">Authentication Endpoints</p>
                      <p className="text-sm text-gray-700">5 requests per 15 minutes per IP</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-semibold text-black mb-1">Payment Endpoints</p>
                      <p className="text-sm text-gray-700">20 requests per 15 minutes</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600">
                        Rate limit information is included in response headers:
                      </p>
                      <code className="block mt-2 bg-white p-3 rounded text-xs border border-yellow-200">
                        X-RateLimit-Limit: 100<br />
                        X-RateLimit-Remaining: 95<br />
                        X-RateLimit-Reset: 1609459200
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Support Section */}
            <section className="py-12 px-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl mb-16">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-3">Need Help?</h2>
                <p className="text-gray-300 mb-6">
                  Our support team is here to help you integrate SiraFlow API into your applications.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-white hover:bg-gray-100 text-black">
                      Contact Support
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/help">
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                      Visit Help Center
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Right Sidebar - Quick Links */}
        <aside className="hidden xl:block sticky top-16 h-[calc(100vh-4rem)] w-64 border-l border-gray-200 bg-gray-50/50">
          <ScrollArea className="h-full py-6 px-4">
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  On This Page
                </h4>
                <div className="space-y-2 text-sm">
                  <a href="#welcome" className="block text-gray-600 hover:text-black transition-colors">
                    Welcome
                  </a>
                  <a href="#quick-start" className="block text-gray-600 hover:text-black transition-colors">
                    Quick Start
                  </a>
                  <a href="#authentication" className="block text-gray-600 hover:text-black transition-colors">
                    Authentication
                  </a>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Links
                </h4>
                <div className="space-y-2 text-sm">
                  <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    Home
                  </Link>
                  <Link to="/contact" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    Contact Us
                  </Link>
                  <Link to="/help" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    Help Center
                  </Link>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
};

export default ApiDocs;
