'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart, Handshake } from 'lucide-react';
import Image from 'next/image';

export function CommunitySection() {
  return (
    <section id="community" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Joining the Inclusion Movement</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Be part of a community dedicated to increasing sign language awareness and promoting accessibility for all.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Awareness Growth</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+75%</div>
              <p className="text-xs text-muted-foreground">Increase in sign language awareness in the last 2 years</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+20,000</div>
              <p className="text-xs text-muted-foreground">Contributing to a more inclusive society</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15</div>
              <p className="text-xs text-muted-foreground">Collaborations with NGOs and educational institutions</p>
            </CardContent>
          </Card>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2 pt-8">
            <h3 className="text-xl font-semibold">Subscribe to our Newsletter</h3>
          <form className="flex space-x-2">
            <Input type="email" placeholder="Enter your email" className="max-w-lg flex-1" />
            <Button type="submit">Subscribe</Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Get the latest updates on our mission and features.
          </p>
        </div>
         <div className="pt-8">
            <h3 className="text-xl font-semibold mb-4">Follow our Journey</h3>
            <Image
                src="https://picsum.photos/seed/socialmedia/1000/400"
                width={1000}
                height={400}
                alt="Social Media"
                className="rounded-lg object-cover"
                data-ai-hint="social media feed"
            />
        </div>
      </div>
    </section>
  );
}
