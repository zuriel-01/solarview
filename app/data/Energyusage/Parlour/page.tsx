'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserInitialAppliances } from '@/lib/db';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataset,
} from 'chart.js';
import solarData from '@/app/data/solarData.json';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthAbbr = months.map(m => m.slice(0, 3).toUpperCase());

interface Appliance {
  id: string;
  appliance_name: string;
  wattage: number;
  usage_hours: number;
  room: string;
}

interface UsageData {
  time: string;
  date: Date;
  [key: string]: any; // Dynamic appliance usage
}

type SolarEntry = {
  timestamp: string;
  "corrected_irradiance_kWh/m2": number;
};

// Function to get appliance usage pattern based on type and room (consistent with other components)
const getAppliancePattern = (applianceName: string, room: string, usageHours: number) => {
  const name = applianceName.toLowerCase();
  const roomLower = room.toLowerCase();
  
  if (roomLower === 'parlour') {
    if (name.includes('fan')) return (h: number) => h >= 11 && h < 17;
    if (name.includes('tv') || name.includes('television')) return (h: number) => h >= 16 && h < 23;
    if (name.includes('light') || name.includes('bulb')) return (h: number) => h >= 18 && h < 23;
    if (name.includes('ac') || name.includes('air condition')) return (h: number) => h >= 17 && h < (17 + Math.min(usageHours, 10)) % 24;
    if (name.includes('radio') || name.includes('music')) return (h: number) => h >= 7 && h < (7 + usageHours) % 24;
    if (name.includes('decoder') || name.includes('cable')) return (h: number) => h >= 16 && h < 23;
    if (name.includes('lamp')) return (h: number) => h >= 18 && h < 23;
  }
  
  // Default pattern based on usage hours for parlour
  return (h: number) => h >= 15 && h < (15 + usageHours) % 24;
};

export default function ParlourEnergyUsage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [datasets, setDatasets] = useState<ChartDataset<'line'>[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [totalUsage, setTotalUsage] = useState<number>(0);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Load user and appliances
  useEffect(() => {
    const loadUserAndAppliances = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          router.push('/auth/login');
          return;
        }

        setUser(session.user);

        // Load appliances - filter for parlour only
        const savedAppliances = await getUserInitialAppliances(session.user, supabase);
        
        // Filter for parlour appliances only
        const parlourAppliances = savedAppliances.filter(
          appliance => appliance.room.toLowerCase() === 'parlour'
        );
        
        if (!parlourAppliances || parlourAppliances.length === 0) {
          alert('No parlour appliances configured. Please set up your parlour appliances first.');
          router.push('/data/Settings/ManageSystemAppliances');
          return;
        }

        setAppliances(parlourAppliances);
        
        console.log('Loaded parlour appliances:', parlourAppliances);
      } catch (error) {
        console.error('Error loading appliances:', error);
        alert('Failed to load appliances configuration');
        router.push('/data/Settings/ManageSystemAppliances');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndAppliances();
  }, [router, supabase]);

  const getDateLabel = () => {
    if (view === 'daily') {
      return `${months[selectedMonth]} ${selectedDay}, 2024`;
    } else if (view === 'monthly') {
      return `${months[selectedMonth]} 2024`;
    }
    return `Year 2024`;
  };

  useEffect(() => {
    if (!appliances.length) return;

    const data = solarData as SolarEntry[];
    const filtered = data.filter((entry) => {
      const date = new Date(entry.timestamp);
      if (view === 'daily') {
        return date.getMonth() === selectedMonth && date.getDate() === selectedDay;
      } else if (view === 'monthly') {
        return date.getMonth() === selectedMonth;
      }
      return true;
    });

    // Use all parlour appliances
    const filteredAppliances = appliances;

    let usageTotal = 0;
    let hourlyUsage: UsageData[] = [];

    // Create appliance info with usage patterns (consistent with other components)
    const applianceInfo: { [key: string]: { power: number; pattern: (h: number) => boolean; name: string } } = {};
    filteredAppliances.forEach(appliance => {
      applianceInfo[appliance.id] = {
        power: appliance.wattage,
        pattern: getAppliancePattern(appliance.appliance_name, appliance.room, appliance.usage_hours),
        name: appliance.appliance_name
      };
    });

    hourlyUsage = filtered.map((entry) => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const usage: { [key: string]: number } = {};

      for (const [applianceId, { power, pattern }] of Object.entries(applianceInfo)) {
        if (pattern(hour)) {
          // Remove random variation - use actual power consumption
          const value = power / 1000; // Convert to kWh
          usage[applianceId] = value;
          usageTotal += value;
        } else {
          usage[applianceId] = 0;
        }
      }

      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        date,
        ...usage,
      } as UsageData;
    });

    setTotalUsage(usageTotal);

    let allLabels: string[];
    if (view === 'daily') {
      allLabels = hourlyUsage.map(d => d.time);
    } else if (view === 'monthly') {
      const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
      const dailyTotals = Array(daysInMonth).fill(0).map(() => 
        Object.keys(applianceInfo).reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      );

      hourlyUsage.forEach(usage => {
        const dayOfMonth = usage.date.getDate() - 1;
        if (dayOfMonth >= 0 && dayOfMonth < daysInMonth) {
          Object.keys(applianceInfo).forEach(applianceId => {
            dailyTotals[dayOfMonth][applianceId] += usage[applianceId] || 0;
          });
        }
      });

      allLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      hourlyUsage = dailyTotals.map((day, i) => ({
        time: (i + 1).toString(),
        date: new Date(2024, selectedMonth, i + 1),
        ...day
      }));
    } else {
      // Yearly view
      const monthlyTotals = Array(12).fill(0).map(() => 
        Object.keys(applianceInfo).reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
      );

      hourlyUsage.forEach(usage => {
        const month = usage.date.getMonth();
        if (month >= 0 && month < 12) {
          Object.keys(applianceInfo).forEach(applianceId => {
            monthlyTotals[month][applianceId] += usage[applianceId] || 0;
          });
        }
      });

      allLabels = monthAbbr;
      hourlyUsage = monthlyTotals.map((month, i) => ({
        time: monthAbbr[i],
        date: new Date(2024, i, 1),
        ...month
      }));
    }

    // Create datasets for each appliance
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    const datasets: ChartDataset<'line'>[] = filteredAppliances.map((appliance, idx) => ({
      label: appliance.appliance_name,
      data: hourlyUsage.map((d) => isNaN(d[appliance.id]) ? 0 : d[appliance.id] || 0),
      borderColor: colors[idx % colors.length],
      backgroundColor: `${colors[idx % colors.length]}33`,
      tension: 0.4,
      fill: false,
    }));

    setLabels(allLabels);
    setDatasets(datasets);
  }, [selectedMonth, selectedDay, view, appliances]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Loading your parlour appliances configuration...</p>
        </div>
      </div>
    );
  }

  if (!appliances.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">No Parlour Appliances Configured</h2>
          <p className="mb-4">Please set up your parlour appliances first.</p>
          <Link href="/data/Settings/ManageSystemAppliances">
            <Button>Configure Appliances</Button>
          </Link>
        </div>
      </div>
    );
  }

  const maxChartValue = Math.max(
    0.2,
    Math.ceil(Math.max(...datasets.flatMap(d => d.data as number[])) * 1.2)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-6">
          <Link href="/energy-usage">
            <Button variant="outline">Back</Button>
          </Link>
          <h2 className="text-2xl font-bold">Parlour Energy Usage - {getDateLabel()}</h2>
          <div className="flex gap-2">
            <Button onClick={() => setView('daily')} variant={view === 'daily' ? 'default' : 'outline'}>Daily</Button>
            <Button onClick={() => setView('monthly')} variant={view === 'monthly' ? 'default' : 'outline'}>Monthly</Button>
            <Button onClick={() => setView('yearly')} variant={view === 'yearly' ? 'default' : 'outline'}>Yearly</Button>
          </div>
        </div>

        {/* Parlour Appliances Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Parlour Appliances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{appliances.length}</div>
                <div className="text-sm text-gray-600">Total Appliances</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{appliances.reduce((sum, a) => sum + a.wattage, 0)}W</div>
                <div className="text-sm text-gray-600">Total Wattage</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{appliances.reduce((sum, a) => sum + a.usage_hours, 0).toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Total Usage Hours</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(appliances.reduce((sum, a) => sum + (a.wattage * a.usage_hours), 0) / 1000).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Daily Energy (kWh)</div>
              </div>
            </div>
            
            {/* List of parlour appliances */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {appliances.map((appliance) => (
                <div key={appliance.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{appliance.appliance_name}</div>
                    <div className="text-sm text-gray-600">{appliance.wattage}W • {appliance.usage_hours}h/day</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {((appliance.wattage * appliance.usage_hours) / 1000).toFixed(2)} kWh
                    </div>
                    <div className="text-xs text-gray-500">per day</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {view === 'daily' && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {months.map((m, i) => (
                  <option value={i} key={m}>{m}</option>
                ))}
              </select>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option value={d} key={d}>{d}</option>
                ))}
              </select>
            </>
          )}

          {view === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {months.map((m, i) => (
                <option value={i} key={m}>{m}</option>
              ))}
            </select>
          )}
        </div>

        {/* Chart */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Line
              data={{ labels, datasets }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: { 
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value.toFixed(3)} kWh`;
                      }
                    }
                  },
                },
                scales: {
                  y: {
                    title: { display: true, text: 'Energy Usage (kWh)' },
                    min: 0,
                    max: maxChartValue
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Summary Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Parlour Energy Usage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Usage */}
              <div className="space-y-3">
                <h4 className="font-semibold">Total Usage</h4>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {isNaN(totalUsage) ? '0.00' : totalUsage.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Energy Used (kWh)</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {(() => {
                      let average = 0;
                      if (view === 'daily') {
                        average = totalUsage / 24;
                      } else if (view === 'monthly') {
                        const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
                        average = totalUsage / daysInMonth;
                      } else {
                        average = totalUsage / 365;
                      }
                      return isNaN(average) ? '0.000' : average.toFixed(3);
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Average per {view === 'daily' ? 'Hour' : 'Day'} (kWh)</div>
                </div>
              </div>

              {/* Per Appliance Usage */}
              <div className="space-y-3">
                <h4 className="font-semibold">Per Appliance Usage</h4>
                <div className="space-y-2">
                  {datasets.map((dataset, index) => {
                    const total = (dataset.data as number[]).reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
                    const appliance = appliances[index];
                    const percentage = totalUsage > 0 ? (total / totalUsage) * 100 : 0;
                    
                    return (
                      <div key={dataset.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{dataset.label}</span>
                          <div className="text-xs text-gray-500">
                            {appliance?.wattage}W • {appliance?.usage_hours}h/day
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{total.toFixed(2)} kWh</span>
                          <div className="text-xs text-gray-500">({percentage.toFixed(1)}%)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Usage Insights */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Parlour Usage Insights</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Appliance usage patterns based on typical parlour activities</p>
                <p>• TV/Entertainment: Peak usage 16:00-23:00 (evening entertainment)</p>
                <p>• Fans: Active 11:00-17:00 (afternoon comfort)</p>
                <p>• Lighting: Evening hours 18:00-23:00 (nighttime illumination)</p>
                <p>• Calculations use exact wattage without artificial variation for consistent results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}