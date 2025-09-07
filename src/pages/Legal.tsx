import React from 'react';
import { FileText, Shield, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Legal: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Legal Information</h1>
          <p className="text-muted-foreground">
            Important legal documents and disclaimers for AI DayTrader Pro
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important Notice:</strong> AI DayTrader Pro is for educational and informational purposes only. 
            This is not financial advice. Please read all disclaimers carefully.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="disclaimers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="arbitration">Arbitration</TabsTrigger>
          </TabsList>

          <TabsContent value="disclaimers">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <span>No Financial Advice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    AI DayTrader Pro provides educational content and analytical tools for informational purposes only. 
                    The information provided through our platform, including AI-generated insights, market analysis, 
                    and trading signals, should not be construed as financial, investment, or trading advice.
                  </p>
                  <p>
                    All users should conduct their own research and consult with qualified financial advisors before 
                    making investment decisions. We do not guarantee the accuracy or completeness of any information 
                    provided.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Trading Risk Statement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    <strong>Trading involves substantial risk of loss.</strong> You may lose some or all of your invested capital. 
                    Past performance is not indicative of future results. The volatile nature of financial markets means that 
                    losses can exceed initial investments in certain circumstances.
                  </p>
                  <p>
                    Key risks include but are not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Market volatility and price fluctuations</li>
                    <li>Liquidity risks in certain securities</li>
                    <li>Technology and system failures</li>
                    <li>Regulatory changes affecting markets</li>
                    <li>Counterparty risks in trading</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Data Sources & Accuracy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our platform aggregates data from various third-party sources including Polygon.io, Finnhub, 
                    and Quiver Quantitative. While we strive for accuracy, we cannot guarantee that all data is 
                    complete, accurate, or up-to-date.
                  </p>
                  <p>
                    Market data may be delayed and should not be relied upon for time-sensitive trading decisions. 
                    Users should verify all information through official sources before acting on it.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    <span>Limitation of Liability</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    In no event shall AI DayTrader Pro, its affiliates, or its suppliers be liable for any indirect, 
                    incidental, special, consequential, or punitive damages, including without limitation, loss of 
                    profits, data, use, goodwill, or other intangible losses.
                  </p>
                  <p>
                    Our total liability to you for all damages shall not exceed the amount paid by you to us in the 
                    twelve (12) months preceding the event giving rise to liability.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Terms of Service</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p>
                    By accessing and using AI DayTrader Pro, you accept and agree to be bound by the terms and 
                    provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Use License</h3>
                  <p>
                    Permission is granted to temporarily download one copy of AI DayTrader Pro for personal, 
                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                  </p>
                  <p className="mt-2">Under this license you may not:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>modify or copy the materials</li>
                    <li>use the materials for any commercial purpose or for any public display</li>
                    <li>attempt to reverse engineer any software contained on the website</li>
                    <li>remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Account Registration</h3>
                  <p>
                    To access certain features of our service, you must register for an account. You agree to provide 
                    accurate, current, and complete information during the registration process and to update such 
                    information to keep it accurate, current, and complete.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">4. Subscription and Billing</h3>
                  <p>
                    Some features of our service are provided on a subscription basis. You will be billed in advance 
                    on a recurring basis. By subscribing, you authorize us to charge your payment method for the 
                    applicable subscription fees.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">5. Termination</h3>
                  <p>
                    We may terminate your access to the service at any time, with or without cause, with or without 
                    notice. Upon termination, your right to use the service will cease immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Policy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Information We Collect</h3>
                  <p>
                    We collect information you provide directly to us, such as when you create an account, subscribe 
                    to our service, or contact us for support. This may include your name, email address, and payment information.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">How We Use Your Information</h3>
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Information Sharing</h3>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your 
                    consent, except as described in this policy. We may share information with trusted third parties who 
                    assist us in operating our website and serving our users.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Data Security</h3>
                  <p>
                    We implement appropriate security measures to protect your personal information against unauthorized 
                    access, alteration, disclosure, or destruction. However, no method of transmission over the Internet 
                    is 100% secure.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Your Rights</h3>
                  <p>
                    You have the right to access, update, or delete your personal information. You may also opt out of 
                    certain communications from us. Contact us if you wish to exercise these rights.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arbitration">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5" />
                  <span>Arbitration Agreement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Binding Arbitration</h3>
                  <p>
                    Any dispute, claim or controversy arising out of or relating to this Agreement or the breach, 
                    termination, enforcement, interpretation or validity thereof, including the determination of the 
                    scope or applicability of this agreement to arbitrate, shall be determined by arbitration.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Arbitration Rules</h3>
                  <p>
                    The arbitration shall be administered by the American Arbitration Association ("AAA") in accordance 
                    with its Commercial Arbitration Rules and the Supplementary Procedures for Consumer Related Disputes. 
                    The arbitration shall be conducted by a single arbitrator.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Class Action Waiver</h3>
                  <p>
                    You and AI DayTrader Pro agree that each may bring claims against the other only in your or its 
                    individual capacity and not as a plaintiff or class member in any purported class or representative 
                    proceeding.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Location and Governing Law</h3>
                  <p>
                    The arbitration will take place in Delaware, USA, and shall be governed by Delaware state law without 
                    regard to conflict of law principles. The arbitrator's award shall be final and binding.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Exceptions</h3>
                  <p>
                    Notwithstanding the foregoing, either party may seek injunctive or other equitable relief to protect 
                    its intellectual property rights in any court of competent jurisdiction.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Legal;