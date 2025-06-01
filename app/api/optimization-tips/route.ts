import { NextResponse } from 'next/server';
import solarData from '../../data/solarData.json';

const BATTERY_CONFIG = {
  usableCapacity: 5.0, // kWh
  minSoC: 1.0, // kWh (20% of capacity)
  maxSoC: 6.0, // kWh
  efficiency: 0.75,
};

const SYSTEM_SIZE = 2.0; // kW

interface HourlyData {
  hour: number;
  ALLSKY_SFC_SW_DWN: number;
  solar: number;
  load: number;
  soc: number;
  prevSoc: number;
  activeAppliances: Array<{
    name: string;
    power: number;
    isActive: boolean;
  }>;
}

interface Tip {
  id: number;
  category: 'weather' | 'battery' | 'appliance' | 'system';
  title: string;
  description: string;
  condition: (hourlyData: HourlyData[]) => boolean;
}

const OPTIMIZATION_TIPS: Tip[] = [
  {
    id: 1,
    category: 'weather',
    title: 'Low Solar Day',
    description: '☁️ Solar output was low today. Limit appliance use during early or late hours, or consider a backup energy plan on cloudy days.',
    condition: (hourlyData) => {
      const avgIrradiance = hourlyData.reduce((sum, hour) => 
        sum + hour.ALLSKY_SFC_SW_DWN, 0) / hourlyData.length;
      return avgIrradiance < 0.15;
    }
  },
  {
    id: 2,
    category: 'weather',
    title: 'Peak Solar Period Not Utilized',
    description: '⚡ Solar generation peaked midday but wasn\'t fully used. Shift some appliance use (e.g., ironing or TV) into 10:00–14:00.',
    condition: (hourlyData) => {
      const peakHours = hourlyData.filter(h => h.hour >= 10 && h.hour <= 14);
      const highIrradiance = peakHours.some(h => h.ALLSKY_SFC_SW_DWN > 0.3);
      const lowLoad = peakHours.every(h => h.load < 0.3);
      return highIrradiance && lowLoad;
    }
  },
  {
    id: 3,
    category: 'battery',
    title: 'Battery Entered Low State',
    description: '🔴 Battery dropped to critical levels today. Try moving high-consumption appliances to daylight hours when solar is available.',
    condition: (hourlyData) => {
      return hourlyData.some(h => h.soc <= BATTERY_CONFIG.minSoC);
    }
  },
  {
    id: 4,
    category: 'battery',
    title: 'Battery Stayed Full Too Long',
    description: '♻️ Battery remained full during solar hours. Consider shifting appliance use to daylight to make better use of solar energy.',
    condition: (hourlyData) => {
      const fullHours = hourlyData.filter(h => 
        h.hour >= 9 && h.hour <= 16 && 
        h.soc >= BATTERY_CONFIG.usableCapacity * 0.9
      ).length;
      return fullHours > 3;
    }
  },
  {
    id: 5,
    category: 'appliance',
    title: 'Heavy Appliance Used During Low Solar',
    description: '⏰ High-power appliance was used when solar generation was low. Delay its use to after 10:00 for better battery health.',
    condition: (hourlyData) => {
      return hourlyData.some(h => {
        const highPowerActive = h.activeAppliances.some(app => 
          app.power >= 400 && app.isActive
        );
        return highPowerActive && h.ALLSKY_SFC_SW_DWN < 0.15;
      });
    }
  },
  {
    id: 6,
    category: 'appliance',
    title: 'Appliance Load Caused Peak Discharge',
    description: '💡 A high load period caused heavy battery discharge. Avoid clustering multiple appliances at the same time.',
    condition: (hourlyData) => {
      return hourlyData.some(h => 
        h.load > 1.2 && (h.prevSoc - h.soc) > 1.0
      );
    }
  },
  {
    id: 7,
    category: 'system',
    title: 'Solar Barely Covered Load',
    description: '📉 Solar generation just covered your household load. Reduce high-power usage during early or late hours.',
    condition: (hourlyData) => {
      let closeMatchCount = 0;
      hourlyData.forEach(h => {
        if (Math.abs(h.solar - h.load) < 0.2) closeMatchCount++;
      });
      return closeMatchCount > (hourlyData.length / 2);
    }
  },
  {
    id: 8,
    category: 'system',
    title: 'Battery Covered Load All Day',
    description: '🪫 Battery handled most of the day\'s usage. Shift more load to daylight when solar is available.',
    condition: (hourlyData) => {
      let batteryDependentCount = 0;
      hourlyData.forEach(h => {
        if (h.solar < h.load && h.soc < h.prevSoc) batteryDependentCount++;
      });
      return batteryDependentCount > (hourlyData.length / 2);
    }
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  try {
    // Filter data for the selected date
    const dayData = solarData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.toISOString().split('T')[0] === date;
    });

    if (dayData.length === 0) {
      return NextResponse.json({ error: 'No data available for this date' }, { status: 404 });
    }

    // Calculate hourly data
    let currentSoC = BATTERY_CONFIG.usableCapacity;
    const hourlyData = dayData.map(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const solar = entry.ALLSKY_SFC_SW_DWN * SYSTEM_SIZE * BATTERY_CONFIG.efficiency;
      let load = 0;
      const activeAppliances: Array<{ name: string; power: number; isActive: boolean }> = [];

      // Calculate load from appliances
      const rooms = {
        bedroom: {
          AC: { power: 1000, pattern: (h: number) => h >= 21 || h < 2 },
          laptop: { power: 40, pattern: (h: number) => h >= 8 && h < 16 },
          bulbs: { power: 24, pattern: (h: number) => h >= 18 && h <= 23 },
          iron: { power: 1000, pattern: (h: number) => h >= 13 && h < 14 },
        },
        kitchen: {
          refrigerator: { power: 100, pattern: (h: number) => h >= 9 && h < 21 },
          microwave: { power: 1000, pattern: (h: number) => h === 8 || h === 16 },
          washingMachine: { power: 400, pattern: (h: number) => h >= 10 && h < 11.5 },
          bulbs: { power: 18, pattern: (h: number) => h >= 19 && h <= 23 },
        },
        parlour: {
          fan: { power: 45, pattern: (h: number) => h >= 11 && h < 17 },
          TV: { power: 90, pattern: (h: number) => h >= 16 && h < 23 },
          bulbs: { power: 18, pattern: (h: number) => h >= 18 && h < 23 },
        },
      };

      for (const [room, appliances] of Object.entries(rooms)) {
        for (const [name, app] of Object.entries(appliances)) {
          const isActive = app.pattern(hour);
          if (isActive) {
            const variation = 0.9 + Math.random() * 0.2;
            const appLoad = (app.power * variation) / 1000;
            load += appLoad;
            activeAppliances.push({ name: `${room}_${name}`, power: app.power, isActive });
          }
        }
      }

      const prevSoC = currentSoC;

      // Update battery state
      if (solar >= load) {
        const excess = solar - load;
        if (currentSoC < BATTERY_CONFIG.usableCapacity) {
          const charge = Math.min(excess, BATTERY_CONFIG.usableCapacity - currentSoC);
          currentSoC += charge;
        }
      } else {
        const deficit = load - solar;
        if (currentSoC > BATTERY_CONFIG.minSoC) {
          const discharge = Math.min(deficit, currentSoC - BATTERY_CONFIG.minSoC);
          currentSoC -= discharge;
        }
      }

      return {
        hour,
        ALLSKY_SFC_SW_DWN: entry.ALLSKY_SFC_SW_DWN,
        solar,
        load,
        soc: currentSoC,
        prevSoc: prevSoC,
        activeAppliances,
      };
    });

    // Generate tips based on the data
    const tips = OPTIMIZATION_TIPS
      .filter(tip => tip.condition(hourlyData))
      .map(tip => ({
        title: tip.title,
        description: tip.description
      }));

    return NextResponse.json(tips);
  } catch (error) {
    console.error('Error processing optimization tips:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 