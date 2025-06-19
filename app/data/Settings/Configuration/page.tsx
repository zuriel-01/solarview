'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { saveConfigAppliance, getUserConfigAppliances, deleteConfigAppliance } from '@/lib/db';

interface Appliance {
  id: string;
  name: string;
  wattage: number;
  usageHours: number;
  room: string;
}

export default function Configuration() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAppliance, setNewAppliance] = useState({
    name: '',
    wattage: '',
    usageHours: '',
    room: ''
  });

  const rooms = [
    'Parlour',
    'Kitchen',
    'Bedroom'
  ];

  useEffect(() => {
    loadAppliances();
  }, []);

  const loadAppliances = async () => {
    try {
      const data = await getUserConfigAppliances();
      const formattedData = data.map(item => ({
        id: item.id,
        name: item.appliance_name,
        wattage: item.wattage,
        usageHours: item.usage_hours,
        room: item.room.charAt(0).toUpperCase() + item.room.slice(1) // Capitalize first letter
      }));
      setAppliances(formattedData);
    } catch (error) {
      console.error('Error loading appliances:', error);
      alert('Error loading appliances');
    } finally {
      setLoading(false);
    }
  };

  const addAppliance = async () => {
    if (!newAppliance.name || !newAppliance.wattage || !newAppliance.usageHours || !newAppliance.room) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await saveConfigAppliance({
        appliance_name: newAppliance.name,
        wattage: parseFloat(newAppliance.wattage),
        usage_hours: parseFloat(newAppliance.usageHours),
        room: newAppliance.room.toLowerCase()
      });

      setNewAppliance({
        name: '',
        wattage: '',
        usageHours: '',
        room: ''
      });

      // Reload appliances
      await loadAppliances();
      alert('Appliance added successfully!');
    } catch (error) {
      console.error('Error adding appliance:', error);
      alert('Error adding appliance');
    }
  };

  const removeAppliance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appliance?')) return;

    try {
      await deleteConfigAppliance(id);
      await loadAppliances();
      alert('Appliance deleted successfully!');
    } catch (error) {
      console.error('Error deleting appliance:', error);
      alert('Error deleting appliance');
    }
  };

  const saveConfiguration = () => {
    // All data is already saved to Supabase, just show confirmation and redirect
    alert('All changes have been saved to your account!');
    // Redirect back to settings page
    window.location.href = '/data/Settings';
  };

  const getTotalWattage = () => {
    return appliances.reduce((total, appliance) => total + appliance.wattage, 0);
  };

  const getTotalDailyUsage = () => {
    return appliances.reduce((total, appliance) => total + (appliance.wattage * appliance.usageHours), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
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

        <div className="grid gap-6">
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
                  <Label htmlFor="appliance-name">Appliance Name</Label>
                  <Input
                    id="appliance-name"
                    placeholder="e.g., Refrigerator"
                    value={newAppliance.name}
                    onChange={(e) => setNewAppliance({...newAppliance, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="wattage">Wattage (W)</Label>
                  <Input
                    id="wattage"
                    type="number"
                    placeholder="e.g., 150"
                    value={newAppliance.wattage}
                    onChange={(e) => setNewAppliance({...newAppliance, wattage: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="usage-hours">Usage Hours/Day</Label>
                  <Input
                    id="usage-hours"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 8"
                    value={newAppliance.usageHours}
                    onChange={(e) => setNewAppliance({...newAppliance, usageHours: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="room">Room</Label>
                  <select
                    id="room"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newAppliance.room}
                    onChange={(e) => setNewAppliance({...newAppliance, room: e.target.value})}
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
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

          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>System Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </CardContent>
          </Card>

          {/* Appliances List */}
          <Card>
            <CardHeader>
              <CardTitle>Configured Appliances</CardTitle>
            </CardHeader>
            <CardContent>
              {appliances.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appliances added yet. Add your first appliance above.</p>
              ) : (
                <div className="space-y-4">
                  {rooms.map(room => {
                    const roomAppliances = appliances.filter(appliance => appliance.room === room);
                    if (roomAppliances.length === 0) return null;

                    return (
                      <div key={room} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-3 text-gray-800">{room}</h3>
                        <div className="grid gap-3">
                          {roomAppliances.map(appliance => (
                            <div key={appliance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{appliance.name}</div>
                                <div className="text-sm text-gray-600">
                                  {appliance.wattage}W • {appliance.usageHours}h/day • 
                                  {(appliance.wattage * appliance.usageHours).toLocaleString()} Wh/day
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

          {/* Save Button */}
          {appliances.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={saveConfiguration} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}