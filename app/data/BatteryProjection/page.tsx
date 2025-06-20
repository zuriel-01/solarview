'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
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
    data: number[];
    totalSolar: number;
    totalLoad: number;
    timeToEmpty: number | null;
}

export default function BatteryProjectionPage() {
    const [system, setSystem] = useState<SolarSystem | null>(null);
    const [initialAppliances, setInitialAppliances] = useState<Appliance[]>([]);
    const [projectionAppliances, setProjectionAppliances] = useState<Appliance[]>([]);
    const [inputs, setInputs] = useState<ProjectionInput>({
        currentSoC: 80,
        startTime: new Date().getHours(),
        duration: 6,
    });
    const [results, setResults] = useState<ProjectionResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [systemData, appliancesData] = await Promise.all([
                    getUserSolarSystem(),
                    getUserInitialAppliances(),
                ]);

                if (systemData) {
                    setSystem(systemData);
                } else {
                    // Handle case where user has no system
                    console.error("No solar system configured for this user.");
                }

                const formattedAppliances = appliancesData.map((a: any) => ({
                    id: a.id,
                    name: a.appliance_name,
                    wattage: a.wattage,
                    usageHours: a.usage_hours,
                }));
                setInitialAppliances(formattedAppliances);

            } catch (error) {
                console.error("Failed to load initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const handleInputChange = (field: keyof ProjectionInput, value: number) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const runProjection = async () => {
        // Core simulation logic will go here
        console.log("Running projection with:", { inputs, system, initialAppliances, projectionAppliances });
        // Placeholder for now
        alert("Running projection! (Logic to be implemented)");
    };
    
    const resetProjection = () => {
        setResults(null);
        setProjectionAppliances([]);
        setInputs({
            currentSoC: 80,
            startTime: new Date().getHours(),
            duration: 6,
        });
    };

    if (loading) {
        return <div className="text-center p-8">Loading system data...</div>;
    }

    if (!system) {
        return <div className="text-center p-8 text-red-500">Please configure your solar system in the settings before running a projection.</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <Card className="max-w-7xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Battery SoC Projection</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Input Section */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Simulation Inputs</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="current-soc">Current Battery SoC (%)</Label>
                                    <Input id="current-soc" type="number" placeholder="e.g., 80" value={inputs.currentSoC} onChange={e => handleInputChange('currentSoC', parseInt(e.target.value))} />
                                </div>
                                <div>
                                    <Label htmlFor="start-time">Projection Start Time</Label>
                                     <Select value={String(inputs.startTime)} onValueChange={value => handleInputChange('startTime', parseInt(value))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a start hour" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(24).keys()].map(h => (
                                                <SelectItem key={h} value={String(h)}>
                                                    {h % 12 === 0 ? 12 : h % 12} {h < 12 ? 'AM' : 'PM'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="duration">Projection Duration (Hours)</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider value={[inputs.duration]} onValueChange={([val]) => handleInputChange('duration', val)} min={1} max={12} step={1} />
                                        <span className="font-bold text-lg">{inputs.duration} hrs</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Appliance Load</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Appliance logic will go here */}
                                <p className="text-center text-gray-500">Appliance selection will be available here.</p>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button className="w-full" onClick={runProjection}>Run Projection</Button>
                            <Button variant="outline" className="w-full" onClick={resetProjection}>Reset</Button>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>SoC Projection Chart</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 w-full bg-gray-100 rounded-md flex items-center justify-center">
                                     <p className="text-gray-500">Chart will be displayed here after running the projection.</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <p className="text-center text-gray-500">A summary of the projection will appear here.</p>
                            </CardContent>
                        </Card>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
} 