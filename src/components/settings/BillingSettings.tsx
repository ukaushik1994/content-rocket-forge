
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CustomBadge } from '@/components/ui/custom-badge';

export function BillingSettings() {
  return (
    <Card className="glass-panel bg-glass">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
        <CardDescription>
          Manage your subscription and payment methods.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4 bg-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">$49/month, billed monthly</p>
              </div>
              <CustomBadge className="bg-green-500 text-white">Active</CustomBadge>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Unlimited content generation</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Advanced SEO tools</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Detailed analytics</span>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline">Change Plan</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Payment Methods</h3>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-14 rounded bg-background mr-3 flex items-center justify-center">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <path d="M22 9H2M22 12H2M22 15H2M6 18H2M22 5H2V19H22V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Visa ending in 1234</div>
                    <div className="text-sm text-muted-foreground">Expires 04/26</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
            
            <Button variant="outline">Add Payment Method</Button>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Billing History</h3>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                      <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-background/50">
                      <td className="p-4 align-middle">Apr 1, 2025</td>
                      <td className="p-4 align-middle">$49.00</td>
                      <td className="p-4 align-middle">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
                          Paid
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                    <tr className="border-b bg-background/50">
                      <td className="p-4 align-middle">Mar 1, 2025</td>
                      <td className="p-4 align-middle">$49.00</td>
                      <td className="p-4 align-middle">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
                          Paid
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
