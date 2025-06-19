'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import {
  saveInitialAppliances,
  getUserInitialAppliances,
  saveSolarSystem,
  getUserSolarSystem
} from '@/lib/db';

interface Appliance {
  id: string;
  name: string;
  wattage: number;
  usageHours: number;
  room: string;
}

export default function ManageSystemAppliances() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [newAppliance, setNewAppliance] = useState({
    name: '',
    wattage: '',
    usageHours: '',
    room: ''
  });

  const [system, setSystem] = useState({
    battery_capacity: '',
    minimum_state_of_charge: '',
    installation_year: '',
    panel_rating: '',
    number_of_panels: ''
  });

  const [loading, setLoading] = useState(true);

  const rooms = ['Parlour', 'Kitchen', 'Bedroom'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSystem = await getUserSolarSystem();
        const savedAppliances = await getUserInitialAppliances();

        if (savedSystem) {
          setSystem({
            battery_capacity: savedSystem.battery_capacity.toString(),
            minimum_state_of_charge: savedSystem.minimum_state_of_charge.toString(),
            installation_year: savedSystem.installation_year.toString(),
            panel_rating: savedSystem.panel_rating.toString(),
            number_of_panels: savedSystem.number_of_panels.toString()
          });
        } else {
          // No system found, leave fields empty
          setSystem({
            battery_capacity: '',
            minimum_state_of_charge: '',
            installation_year: '',
            panel_rating: '',
            number_of_panels: ''
          });
        }

        if (savedAppliances.length > 0) {
          const formatted = savedAppliances.map((item) => ({
            id: item.id,
            name: item.appliance_name,
            wattage: item.wattage,
            usageHours: item.usage_hours,
            room: item.room.charAt(0).toUpperCase() + item.room.slice(1)
          }));
          setAppliances(formatted);
        } else {
          setAppliances([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        // Only show alert if it's a real error, not just empty data
        if (err && err.message && err.message !== '{}') {
          alert('Failed to load system data.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addAppliance = () => {
    if (!newAppliance.name || !newAppliance.wattage || !newAppliance.usageHours || !newAppliance.room) {
      alert('Please fill in all fields');
      return;
    }

    const appliance: Appliance = {
      id: Date.now().toString(),
      name: newAppliance.name,
      wattage: parseFloat(newAppliance.wattage),
      usageHours: parseFloat(newAppliance.usageHours),
      room: newAppliance.room
    };

    setAppliances([...appliances, appliance]);
    setNewAppliance({ name: '', wattage: '', usageHours: '', room: '' });
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter((appliance) => appliance.id !== id));
  };

  const handleSystemChange = (field: string, value: string) => {
    setSystem((prev) => ({ ...prev, [field]: value }));
  };

  const saveConfiguration = async () => {
    try {
      // Save solar system
      await saveSolarSystem({
        battery_capacity: parseInt(system.battery_capacity),
        minimum_state_of_charge: parseInt(system.minimum_state_of_charge),
        installation_year: parseInt(system.installation_year),
        panel_rating: parseInt(system.panel_rating),
        number_of_panels: parseInt(system.number_of_panels)
      });

      // Save appliances
      const formattedAppliances = appliances.map((a) => ({
        appliance_name: a.name,
        wattage: a.wattage,
        usage_hours: a.usageHours,
        room: a.room.toLowerCase()
      }));

      await saveInitialAppliances(formattedAppliances);

      alert('Configuration saved successfully!');
      window.location.href = '/home';
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save configuration.');
    }
  };

  const getTotalWattage = () =>
    appliances.reduce((total, a) => total + a.wattage, 0);

  const getTotalDailyUsage = () =>
    appliances.reduce((total, a) => total + a.wattage * a.usageHours, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <Link href="/data/Settings">
            <Button variant="outline">Back</Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <div className="w-[89px]" />
        </div>

        {/* System Info Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Solar System Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Battery Capacity (Ah)</Label>
              <Input
                type="number"
                value={system.battery_capacity}
                onChange={(e) => handleSystemChange('battery_capacity', e.target.value)}
              />
            </div>
            <div>
              <Label>Minimum SoC (%)</Label>
              <Input
                type="number"
                value={system.minimum_state_of_charge}
                onChange={(e) => handleSystemChange('minimum_state_of_charge', e.target.value)}
              />
            </div>
            <div>
              <Label>Installation Year</Label>
              <Input
                type="number"
                value={system.installation_year}
                onChange={(e) => handleSystemChange('installation_year', e.target.value)}
              />
            </div>
            <div>
              <Label>Panel Rating (W)</Label>
              <Input
                type="number"
                value={system.panel_rating}
                onChange={(e) => handleSystemChange('panel_rating', e.target.value)}
              />
            </div>
            <div>
              <Label>Number of Panels</Label>
              <Input
                type="number"
                value={system.number_of_panels}
                onChange={(e) => handleSystemChange('number_of_panels', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appliance Form + Summary + List (Your UI stays same from here) */}
        {/* ...reuse the rest of your UI exactly as you had it */}
        {/* Add Appliance Form, Summary Card, Appliance List, Save Button — all already perfect in your file */}
        {/* Just call saveConfiguration on Save click */}

        {/* Add New Appliance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Appliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Appliance Name</Label>
                <Input
                  value={newAppliance.name}
                  onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Wattage (W)</Label>
                <Input
                  type="number"
                  value={newAppliance.wattage}
                  onChange={(e) => setNewAppliance({ ...newAppliance, wattage: e.target.value })}
                />
              </div>
              <div>
                <Label>Usage Hours/Day</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={newAppliance.usageHours}
                  onChange={(e) => setNewAppliance({ ...newAppliance, usageHours: e.target.value })}
                />
              </div>
              <div>
                <Label>Room</Label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={newAppliance.room}
                  onChange={(e) => setNewAppliance({ ...newAppliance, room: e.target.value })}
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={addAppliance} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Appliance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card and Appliance List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{appliances.length}</div>
              <div className="text-sm text-gray-600">Total Appliances</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{getTotalWattage().toLocaleString()}W</div>
              <div className="text-sm text-gray-600">Total Wattage</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{getTotalDailyUsage().toLocaleString()} Wh</div>
              <div className="text-sm text-gray-600">Daily Usage</div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configured Appliances</CardTitle>
          </CardHeader>
          <CardContent>
            {appliances.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No appliances added yet.</p>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => {
                  const roomAppliances = appliances.filter((a) => a.room === room);
                  if (roomAppliances.length === 0) return null;
                  return (
                    <div key={room} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">{room}</h3>
                      <div className="grid gap-3">
                        {roomAppliances.map((appliance) => (
                          <div key={appliance.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div>
                              <div className="font-medium">{appliance.name}</div>
                              <div className="text-sm text-gray-600">
                                {appliance.wattage}W • {appliance.usageHours}h/day • {(appliance.wattage * appliance.usageHours).toLocaleString()} Wh/day
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAppliance(appliance.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {appliances.length > 0 && (
          <div className="flex justify-end mt-6">
            <Button onClick={saveConfiguration} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
