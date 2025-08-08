"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {  Palette } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

export function DataSourceSidebar() {
    const { polygonData } = useDashboardStore();
    
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
         <CardTitle className="flex items-center gap-2">
          Polygon Data
          {polygonData.area && (
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
       
        
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color Rules
          </h3>
          
          <div className="space-y-2">
            <div className="p-3 border rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <span className="text-sm">{'< 10°C'}</span>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm">{'10°C - 25°C'}</span>
                <div className="w-4 h-4 bg-green-500 rounded"></div>
              </div>
            </div>
            
            <div className="p-3 border rounded-lg bg-green-50">
              <div className="flex items-center justify-between">
                <span className="text-sm">{'≥ 25°C'}</span>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Polygons Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Active Polygons</h3>
          {
            polygonData.area ? (
              <div className="p-3 border rounded-lg bg-green-50"> 
               1 Area selected 
               <p>       
                   {polygonData.centroid?.lat} and  {polygonData.centroid?.lng} 
               </p>
              </div>
            ):(
              <div className="text-xs text-muted-foreground text-center py-4 border rounded-lg border-dashed">
                No polygons created yet
              </div>
            )
          }
          
        </div>
      </CardContent>
    </Card>
  );
}
