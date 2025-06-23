'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getUserSolarSystem } from '@/lib/db';
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

interface SystemConfig {
  battery_capacity: number;
  minimum_state_of_charge: number;
  installation_year: number;
  panel_rating: number;
  number_of_panels: number;
}

type SolarEntry = {
  timestamp: string;
  "corrected_irradiance_kWh/m2": number;
};

export default function EnergyGenerated() {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [view, setView] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [datasets, setDatasets] = useState<ChartDataset<'line'>[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [solarEnergyGenerated, setSolarEnergyGenerated] = useState<number>(0);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Load user and system configuration
  useEffect(() => {
    const loadUserAndSystem = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          router.push('/auth/login');
          return;
        }

        setUser(session.user);

        // Load system configuration
        const savedSystem = await getUserSolarSystem(session.user, supabase);
        
        if (!savedSystem) {
          // No system configuration found, redirect to setup
          alert('Please configure your solar system first');
          router.push('/data/Settings/ManageSystemAppliances');
          return;
        }

        setSystemConfig(savedSystem);
        console.log('Loaded system config:', savedSystem);
        console.log('Panel rating:', savedSystem?.panel_rating);
        console.log('Number of panels:', savedSystem?.number_of_panels);
      } catch (error) {
        console.error('Error loading system configuration:', error);
        alert('Failed to load system configuration');
        router.push('/data/Settings/ManageSystemAppliances');
      } finally {
        setLoading(false);
      }
    };

    loadUserAndSystem();
  }, [router, supabase]);

  const getDateLabel = () => {
    if (view === 'daily') {
      return `${months[selectedMonth]} ${selectedDay}, 2024`;
    } else if (view === 'monthly') {
      return `${months[selectedMonth]} 2024`;
    }
    return 'Year 2024';
  };

  const calculateEnergyProduction = (irradiance: number) => {
    if (!systemConfig) {
      console.log('No system config available');
      return 0;
    }
    
    // Debug logging
    console.log('System config:', systemConfig);
    console.log('Irradiance:', irradiance);
    
    // Validate system configuration values
    if (!systemConfig.panel_rating || !systemConfig.number_of_panels) {
      console.log('Missing panel rating or number of panels');
      return 0;
    }
    
    if (systemConfig.panel_rating <= 0 || systemConfig.number_of_panels <= 0) {
      console.log('Invalid panel rating or number of panels');
      return 0;
    }
    
    // Use document specifications: Energy (kWh) = Irradiance (kWh/m²/hr) x System Size x Efficiency
    const systemSizeKw = (systemConfig.panel_rating * systemConfig.number_of_panels) / 1000; // Convert W to kW
    const efficiency = 0.65; // Base efficiency as per document
    
    const production = Math.max(0, irradiance * systemSizeKw * efficiency);
    
    console.log(`Production calculation: ${irradiance} * ${systemSizeKw} * ${efficiency} = ${production}`);
    
    return production;
  };

  useEffect(() => {
    if (!systemConfig) return;

    const data = solarData as SolarEntry[];

    // Find maximum solar generation for the entire year with user's system
    const maxGeneration = data.reduce((max, entry) => {
      const production = calculateEnergyProduction(entry["corrected_irradiance_kWh/m2"]);
      return Math.max(max, production);
    }, 0);

    console.log('Maximum solar generation with your system:', maxGeneration.toFixed(2), 'kWh');

    const filtered = data.filter((entry) => {
      const date = new Date(entry.timestamp);
      if (view === 'daily') {
        return date.getMonth() === selectedMonth && date.getDate() === selectedDay;
      } else if (view === 'monthly') {
        return date.getMonth() === selectedMonth;
      }
      return true; // yearly view
    });

    if (view === 'daily') {
      // --- DAILY: per hour ---
      const hourlyEnergy = filtered.map((entry) => {
        const date = new Date(entry.timestamp);
        const hour = date.getHours();
        const production = calculateEnergyProduction(entry["corrected_irradiance_kWh/m2"]);
        
        return {
          time: `${hour.toString().padStart(2, '0')}:00`,
          energyGenerated: production,
        };
      });
      
      setLabels(hourlyEnergy.map(d => d.time));
      setDatasets([{
        label: 'Energy Generated (kWh)',
        data: hourlyEnergy.map(d => d.energyGenerated),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }]);
      setSolarEnergyGenerated(hourlyEnergy.reduce((acc, curr) => {
        const value = isNaN(curr.energyGenerated) ? 0 : curr.energyGenerated;
        return acc + value;
      }, 0));

    } else if (view === 'monthly') {
      // --- MONTHLY: per day ---
      const dailyTotals: { [key: string]: number } = {};
      let monthlyTotal = 0;
      
      const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
      
      // Initialize all days
      for (let day = 1; day <= daysInMonth; day++) {
        dailyTotals[day.toString()] = 0;
      }
      
      // Sum up hourly production for each day
      filtered.forEach((entry) => {
        const date = new Date(entry.timestamp);
        const dayOfMonth = date.getDate();
        const production = calculateEnergyProduction(entry["corrected_irradiance_kWh/m2"]);
        
        dailyTotals[dayOfMonth.toString()] += production;
        monthlyTotal += production;
      });

      const labels = Object.keys(dailyTotals).sort((a, b) => parseInt(a) - parseInt(b));
      const dailyTotalsArray = labels.map(label => dailyTotals[label] || 0);

      setLabels(labels);
      setDatasets([{
        label: 'Daily Energy Generated (kWh)',
        data: dailyTotalsArray,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }]);
      setSolarEnergyGenerated(monthlyTotal);

    } else {
      // --- YEARLY: per month ---
      const monthlyTotals = Array(12).fill(0);
      let yearlyTotal = 0;

      filtered.forEach((entry) => {
        const date = new Date(entry.timestamp);
        const month = date.getMonth();
        const production = calculateEnergyProduction(entry["corrected_irradiance_kWh/m2"]);
        
        monthlyTotals[month] += production;
        yearlyTotal += production;
      });

      setLabels(monthAbbr);
      setDatasets([{
        label: 'Monthly Energy Generated (kWh)',
        data: monthlyTotals,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      }]);
      setSolarEnergyGenerated(yearlyTotal);
    }
  }, [selectedMonth, selectedDay, view, systemConfig]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>Loading your solar system configuration...</p>
        </div>
      </div>
    );
  }

  if (!systemConfig) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">System Not Configured</h2>
          <p className="mb-4">Please set up your solar system configuration first.</p>
          <Link href="/data/Settings/ManageSystemAppliances">
            <Button>Configure System</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate maximum chart value based on user's system and efficiency
  const maxChartValue = Math.ceil(
    (systemConfig.panel_rating * systemConfig.number_of_panels * 0.65) / 1000
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline">Back</Button>
          </Link>
          <h2 className="text-2xl font-bold">Energy Generated - {getDateLabel()}</h2>
          <div className="flex gap-2">
            <Button onClick={() => setView('daily')} variant={view === 'daily' ? 'default' : 'outline'}>Daily</Button>
            <Button onClick={() => setView('monthly')} variant={view === 'monthly' ? 'default' : 'outline'}>Monthly</Button>
            <Button onClick={() => setView('yearly')} variant={view === 'yearly' ? 'default' : 'outline'}>Yearly</Button>
          </div>
        </div>

        {/* System Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Solar System</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{systemConfig.number_of_panels}</div>
              <div className="text-sm text-gray-600">Solar Panels</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{systemConfig.panel_rating}W</div>
              <div className="text-sm text-gray-600">Per Panel</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{(systemConfig.panel_rating * systemConfig.number_of_panels / 1000).toFixed(1)}kW</div>
              <div className="text-sm text-gray-600">Total Capacity</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">65%</div>
              <div className="text-sm text-gray-600">Efficiency</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{systemConfig.battery_capacity}</div>
              <div className="text-sm text-gray-600">Battery (Ah)</div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selectors */}
        {view === 'daily' && (
          <div className="flex gap-2 mb-4">
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
          </div>
        )}

        {view === 'monthly' && (
          <div className="mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {months.map((m, i) => (
                <option value={i} key={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

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
                  }
                },
                scales: {
                  y: { 
                    title: { display: true, text: 'Energy (kWh)' },
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
            <CardTitle>Energy Generation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {isNaN(solarEnergyGenerated) ? '0.00' : solarEnergyGenerated.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Energy (kWh)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {view === 'daily' ? '24' : view === 'monthly' ? new Date(2024, selectedMonth + 1, 0).getDate() : '365'}
                </div>
                <div className="text-sm text-gray-600">
                  {view === 'daily' ? 'Hours' : view === 'monthly' ? 'Days' : 'Days'} Period
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(() => {
                    let average = 0;
                    if (view === 'daily') {
                      average = solarEnergyGenerated / 24;
                    } else if (view === 'monthly') {
                      const daysInMonth = new Date(2024, selectedMonth + 1, 0).getDate();
                      average = solarEnergyGenerated / daysInMonth;
                    } else {
                      average = solarEnergyGenerated / 365;
                    }
                    return isNaN(average) ? '0.00' : average.toFixed(2);
                  })()}
                </div>
                <div className="text-sm text-gray-600">Average per {view === 'daily' ? 'Hour' : 'Day'} (kWh)</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {(() => {
                    const maxPossible = maxChartValue;
                    const efficiency = solarEnergyGenerated / (maxPossible * (view === 'daily' ? 24 : view === 'monthly' ? new Date(2024, selectedMonth + 1, 0).getDate() : 365)) * 100;
                    return isNaN(efficiency) ? '0.0' : efficiency.toFixed(1);
                  })()}%
                </div>
                <div className="text-sm text-gray-600">System Efficiency</div>
              </div>
            </div>
            
            {/* Additional System Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">System Performance</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Using AI-predicted solar irradiance data for accurate energy calculations</p>
                <p>• Solar panels operating at 65% real-world efficiency (including shading, temperature effects)</p>
                <p>• Energy calculation: Irradiance × System Size × Efficiency</p>
                <p>• Peak theoretical output: {maxChartValue.toFixed(1)} kWh under optimal conditions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}