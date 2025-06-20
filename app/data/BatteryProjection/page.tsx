'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  getUserSolarSystem,
  getUserInitialAppliances,
} from '@/lib/db';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Appliance {
  id: string;
  name: string;
  wattage: number;
  usageHours: number;
  room: string;
  selected?: boolean;
}

interface SolarSystem {
    battery_capacity: number;
    minimum_state_of_charge: number;
    installation_year: number;
    panel_rating: number;
    number_of_panels: number;
}

interface ProjectionInput {
    currentSoC: number;
    startTime: number;
    duration: number;
}

interface ProjectionResult {
    labels: string[];
    socData: number[];
    solarData: number[];
    loadData: number[];
    totalSolar: number;
    totalLoad: number;
    timeToEmpty: number | null;
    lowBatteryWarning: boolean;
}

// Solar irradiance simulation (simplified)
const getSolarIrradiance = (hour: number) => {
  if (hour < 6 || hour > 18) return 0; // No sun
  
  // Simulate sun curve (peak at noon)
  const noonOffset = Math.abs(hour - 12);
  const maxIrradiance = 0.8; // kW/m² peak
  
  if (noonOffset <= 2) {
    return maxIrradiance * (1 - noonOffset * 0.15); // Peak hours
  } else {
    return maxIrradiance * Math.max(0, 1 - (noonOffset - 2) * 0.25); // Declining
  }
};

export default function BatteryProjectionPage() {
    const [system, setSystem] = useState<SolarSystem | null>(null);
    const [appliances, setAppliances] = useState<Appliance[]>([]);
    const [inputs, setInputs] = useState<ProjectionInput>({
        currentSoC: 80,
        startTime: new Date().getHours(),
        duration: 6,
    });
    const [results, setResults] = useState<ProjectionResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !session?.user) {
                    router.push('/auth/login');
                    return;
                }

                setUser(session.user);

                const [systemData, appliancesData] = await Promise.all([
                    getUserSolarSystem(session.user, supabase),
                    getUserInitialAppliances(session.user, supabase),
                ]);

                if (systemData) {
                    setSystem(systemData);
                } else {
                    alert("Please configure your solar system first");
                    router.push('/data/Settings/ManageSystemAppliances');
                    return;
                }

                const formattedAppliances = appliancesData.map((a: any) => ({
                    id: a.id,
                    name: a.appliance_name,
                    wattage: a.wattage,
                    usageHours: a.usage_hours,
                    room: a.room,
                    selected: false,
                }));
                setAppliances(formattedAppliances);

            } catch (error) {
                console.error("Failed to load initial data:", error);
                alert("Failed to load system data");
                router.push('/data/Settings/ManageSystemAppliances');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [router, supabase]);

    const handleInputChange = (field: keyof ProjectionInput, value: number) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const toggleAppliance = (applianceId: string) => {
        setAppliances(prev => prev.map(a => 
            a.id === applianceId ? { ...a, selected: !a.selected } : a
        ));
    };

    const runProjection = async () => {
        if (!system) return;

        const selectedAppliances = appliances.filter(a => a.selected);
        const totalLoad = selectedAppliances.reduce((sum, a) => sum + (a.wattage / 1000), 0); // Convert to kW
        
        // Battery specs
        const batteryCapacityKwh = (system.battery_capacity * 12) / 1000; // Assuming 12V system, convert to kWh
        const minSoC = system.minimum_state_of_charge;
        const usableCapacity = batteryCapacityKwh * ((100 - minSoC) / 100);
        
        // Solar generation specs
        const solarCapacityKw = (system.panel_rating * system.number_of_panels) / 1000;
        const solarEfficiency = 0.75; // Real-world efficiency
        
        const labels: string[] = [];
        const socData: number[] = [];
        const solarData: number[] = [];
        const loadData: number[] = [];
        
        let currentSoC = inputs.currentSoC;
        let totalSolarGenerated = 0;
        let totalLoadConsumed = 0;
        let timeToEmpty: number | null = null;
        let lowBatteryWarning = false;

        for (let i = 0; i <= inputs.duration; i++) {
            const currentHour = (inputs.startTime + i) % 24;
            const timeLabel = `${currentHour.toString().padStart(2, '0')}:00`;
            labels.push(timeLabel);

            // Calculate solar generation for this hour
            const irradiance = getSolarIrradiance(currentHour);
            const solarGeneration = irradiance * solarCapacityKw * solarEfficiency;
            solarData.push(solarGeneration);
            totalSolarGenerated += solarGeneration;

            // Calculate load consumption
            loadData.push(totalLoad);
            totalLoadConsumed += totalLoad;

            // Calculate net energy flow (solar - load)
            const netEnergy = solarGeneration - totalLoad;
            
            // Update battery SoC
            const energyChangeKwh = netEnergy;
            const socChange = (energyChangeKwh / batteryCapacityKwh) * 100;
            
            if (i > 0) { // Don't change SoC for the first data point
                currentSoC = Math.max(minSoC, Math.min(100, currentSoC + socChange));
            }
            
            socData.push(currentSoC);

            // Check for low battery
            if (currentSoC <= minSoC + 5) {
                lowBatteryWarning = true;
                if (timeToEmpty === null) {
                    timeToEmpty = i;
                }
            }
        }

        setResults({
            labels,
            socData,
            solarData,
            loadData,
            totalSolar: totalSolarGenerated,
            totalLoad: totalLoadConsumed,
            timeToEmpty,
            lowBatteryWarning
        });
    };
    
    const resetProjection = () => {
        setResults(null);
        setAppliances(prev => prev.map(a => ({ ...a, selected: false })));
        setInputs({
            currentSoC: 80,
            startTime: new Date().getHours(),
            duration: 6,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Loading...</h2>
                    <p>Loading your system data...</p>
                </div>
            </div>
        );
    }

    if (!system) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">System Not Configured</h2>
                    <p className="mb-4">Please configure your solar system first.</p>
                    <Button onClick={() => router.push('/data/Settings/ManageSystemAppliances')}>
                        Configure System
                    </Button>
                </div>
            </div>
        );
    }

    const selectedAppliances = appliances.filter(a => a.selected);
    const totalSelectedLoad = selectedAppliances.reduce((sum, a) => sum + a.wattage, 0);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Battery SoC Projection</CardTitle>
                        <p className="text-center text-gray-600">
                            Simulate your battery performance with different appliance loads
                        </p>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Section */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* System Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Your System</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Battery:</span>
                                        <span className="font-semibold">{system.battery_capacity}Ah</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Solar:</span>
                                        <span className="font-semibold">{(system.panel_rating * system.number_of_panels / 1000).toFixed(1)}kW</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Min SoC:</span>
                                        <span className="font-semibold">{system.minimum_state_of_charge}%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Simulation Inputs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Simulation Inputs</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="current-soc">Current Battery SoC (%)</Label>
                                        <Input 
                                            id="current-soc" 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            value={inputs.currentSoC} 
                                            onChange={e => handleInputChange('currentSoC', parseInt(e.target.value) || 0)} 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="start-time">Start Time</Label>
                                        <Select value={String(inputs.startTime)} onValueChange={value => handleInputChange('startTime', parseInt(value))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select start hour" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[...Array(24).keys()].map(h => (
                                                    <SelectItem key={h} value={String(h)}>
                                                        {h % 12 === 0 ? 12 : h % 12}:00 {h < 12 ? 'AM' : 'PM'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="duration">Duration: {inputs.duration} hours</Label>
                                        <Slider 
                                            value={[inputs.duration]} 
                                            onValueChange={([val]) => handleInputChange('duration', val)} 
                                            min={1} 
                                            max={24} 
                                            step={1} 
                                            className="mt-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Appliance Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Select Appliances</CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Total Load: {totalSelectedLoad}W
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                                    {appliances.map((appliance) => (
                                        <div key={appliance.id} className="flex items-center space-x-2 p-2 border rounded">
                                            <input
                                                type="checkbox"
                                                id={appliance.id}
                                                checked={appliance.selected}
                                                onChange={() => toggleAppliance(appliance.id)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor={appliance.id} className="flex-1 cursor-pointer">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{appliance.name}</span>
                                                    <span className="text-sm text-gray-600">{appliance.wattage}W</span>
                                                </div>
                                                <div className="text-xs text-gray-500">{appliance.room}</div>
                                            </label>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="flex gap-2">
                                <Button className="flex-1" onClick={runProjection}>Run Projection</Button>
                                <Button variant="outline" className="flex-1" onClick={resetProjection}>Reset</Button>
                            </div>
                        </div>

                        {/* Output Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Battery SoC Projection</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {results ? (
                                        <div className="h-80">
                                            <Line
                                                data={{
                                                    labels: results.labels,
                                                    datasets: [
                                                        {
                                                            label: 'Battery SoC (%)',
                                                            data: results.socData,
                                                            borderColor: '#3b82f6',
                                                            backgroundColor: '#3b82f6',
                                                            tension: 0.1,
                                                            yAxisID: 'y',
                                                        },
                                                        // {
                                                        //     label: 'Solar Generation (kW)',
                                                        //     data: results.solarData,
                                                        //     borderColor: '#22c55e',
                                                        //     backgroundColor: '#22c55e',
                                                        //     tension: 0.1,
                                                        //     yAxisID: 'y1',
                                                        // },
                                                        // {
                                                        //     label: 'Load (kW)',
                                                        //     data: results.loadData,
                                                        //     borderColor: '#ef4444',
                                                        //     backgroundColor: '#ef4444',
                                                        //     tension: 0.1,
                                                        //     yAxisID: 'y1',
                                                        // },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top',
                                                        },
                                                    },
                                                    scales: {
                                                        y: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'left',
                                                            title: {
                                                                display: true,
                                                                text: 'Battery SoC (%)',
                                                            },
                                                            min: 0,
                                                            max: 100,
                                                        },
                                                        y1: {
                                                            type: 'linear',
                                                            display: true,
                                                            position: 'right',
                                                            title: {
                                                                display: true,
                                                                text: 'Power (kW)',
                                                            },
                                                            grid: {
                                                                drawOnChartArea: false,
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                                            <p className="text-gray-500">Run a projection to see the chart</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Projection Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {results ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {results.totalSolar.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-gray-600">Solar Generated (kWh)</div>
                                            </div>
                                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {results.totalLoad.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-gray-600">Load Consumed (kWh)</div>
                                            </div>
                                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {results.socData[results.socData.length - 1].toFixed(1)}%
                                                </div>
                                                <div className="text-sm text-gray-600">Final SoC</div>
                                            </div>
                                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {results.timeToEmpty !== null ? `${results.timeToEmpty}h` : 'Safe'}
                                                </div>
                                                <div className="text-sm text-gray-600">Time to Low Battery</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500">Summary will appear after running projection</p>
                                    )}
                                    
                                    {results?.lowBatteryWarning && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-700 font-medium">⚠️ Low Battery Warning</p>
                                            <p className="text-red-600 text-sm">
                                                Your battery will reach minimum SoC during this projection. 
                                                Consider reducing load or ensuring backup power.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}