import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Map, Clock, Palette } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Dynamic Data Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visualize dynamic data over interactive maps and timelines with polygon creation 
            and color-coded data display based on selected datasets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 my-12">
          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-blue-600 mx-auto" />
              <CardTitle>Timeline Control</CardTitle>
              <CardDescription>
                Interactive slider with hourly resolution across 30-day window
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Map className="h-8 w-8 text-green-600 mx-auto" />
              <CardTitle>Interactive Maps</CardTitle>
              <CardDescription>
                Draw polygons, analyze regions, and visualize spatial data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Palette className="h-8 w-8 text-purple-600 mx-auto" />
              <CardTitle>Color Coding</CardTitle>
              <CardDescription>
                Dynamic color rules based on data thresholds and conditions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8 py-3">
              Launch Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Built with Next.js, TypeScript, and Zustand state management
          </p>
        </div>
      </div>
    </div>
  );
}
