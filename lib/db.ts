import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Solar System Functions
export async function saveSolarSystem(
  systemData: {
    battery_capacity: number;
    minimum_state_of_charge: number;
    installation_year: number;
    panel_rating: number;
    number_of_panels: number;
  },
  user: User,
  supabaseClient?: SupabaseClient
) {
  const supabase = supabaseClient || createClientComponentClient();
  
  try {
    console.log('Starting saveSolarSystem for user:', user.id);
    console.log('Input system data:', systemData);

    // Validate input data
    if (systemData.battery_capacity <= 0) {
      throw new Error('Battery capacity must be positive');
    }
    if (systemData.minimum_state_of_charge < 0 || systemData.minimum_state_of_charge > 100) {
      throw new Error('Minimum state of charge must be between 0 and 100');
    }
    if (systemData.panel_rating <= 0) {
      throw new Error('Panel rating must be positive');
    }
    if (systemData.number_of_panels <= 0) {
      throw new Error('Number of panels must be positive');
    }

    const configData = {
      battery_capacity: Math.min(99999, Math.abs(systemData.battery_capacity)), // Cap at 99,999
      panel_size: Math.min(999.99, Math.round((Math.abs(systemData.panel_rating) * Math.abs(systemData.number_of_panels)) / 1000 * 100) / 100), // Cap at 999.99 kW
      min_soc: Math.min(100, Math.max(0, systemData.minimum_state_of_charge)), // 0-100
      installation_year: systemData.installation_year,
      panel_rating: Math.abs(systemData.panel_rating),
      number_of_panels: Math.abs(systemData.number_of_panels),
      updated_at: new Date().toISOString()
    };

    console.log('Config data to save:', configData);

    // Additional validation for database limits
    if (configData.battery_capacity > 999999) {
      throw new Error('Battery capacity too large (max: 999,999)');
    }
    if (configData.panel_size > 999.99) {
      throw new Error('Panel size too large (max: 999.99 kW)');
    }

    // Check if user already has a system config
    const { data: existingSystem, error: selectError } = await supabase
      .from('system_config')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing system:', selectError);
      throw new Error(`Database select error: ${selectError.message}`);
    }

    if (existingSystem) {
      // Update existing system
      const { data, error } = await supabase
        .from('system_config')
        .update(configData)
        .eq('user_id', user.id)
        .select();

      if (error) throw new Error(`Update failed: ${error.message}`);
      console.log('Update successful:', data);
      return data;
    } else {
      // Create new system
      const { data, error } = await supabase
        .from('system_config')
        .insert({
          ...configData,
          user_id: user.id
        })
        .select();

      if (error) throw new Error(`Insert failed: ${error.message}`);
      console.log('Insert successful:', data);
      return data;
    }
  } catch (error) {
    console.error('Error in saveSolarSystem:', error);
    throw error;
  }
}

export async function getUserSolarSystem(user: User, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || createClientComponentClient();
  
  try {
    console.log('Getting system for user:', user.id);

    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch system: ${error.message}`);
    
    console.log('System config data:', data);
    
    if (data) {
      // Return the actual values from the database, including the new fields we added
      return {
        battery_capacity: data.battery_capacity,
        minimum_state_of_charge: data.min_soc,
        installation_year: data.installation_year || 2024, // Use saved value or fallback
        panel_rating: data.panel_rating || Math.round((data.panel_size * 1000) / (data.number_of_panels || 10)),
        number_of_panels: data.number_of_panels || 10
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getUserSolarSystem:', error);
    return null;
  }
}

// Appliances Functions
export async function saveInitialAppliances(
  appliances: Array<{
    appliance_name: string;
    wattage: number;
    usage_hours: number;
    room: string;
  }>,
  user: User,
  supabaseClient?: SupabaseClient
) {
  const supabase = supabaseClient || createClientComponentClient();
  
  try {
    console.log('Saving appliances for user:', user.id);

    // Create/get rooms
    const roomNames = [...new Set(appliances.map(a => a.room.toLowerCase()))];
    const roomMapping: { [key: string]: string } = {};

    for (const roomName of roomNames) {
      let { data: existingRoom } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('name', roomName)
        .maybeSingle();

      if (!existingRoom) {
        const { data: newRoom, error: roomError } = await supabase
          .from('rooms')
          .insert({ user_id: user.id, name: roomName })
          .select('id, name')
          .single();

        if (roomError) throw new Error(`Failed to create room: ${roomError.message}`);
        existingRoom = newRoom;
      }

      roomMapping[roomName] = existingRoom.id;
    }

    // Delete existing appliances for this user
    const { data: userRooms } = await supabase
      .from('rooms')
      .select('id')
      .eq('user_id', user.id);

    if (userRooms && userRooms.length > 0) {
      const roomIds = userRooms.map(room => room.id);
      await supabase.from('appliances').delete().in('room_id', roomIds);
    }

    // Insert new appliances
    const appliancesData = appliances.map(appliance => ({
      room_id: roomMapping[appliance.room.toLowerCase()],
      name: appliance.appliance_name,
      wattage: appliance.wattage,
      usage_hours: appliance.usage_hours // Now save the actual usage hours
    }));

    const { data, error } = await supabase
      .from('appliances')
      .insert(appliancesData)
      .select('id, name, wattage, room_id, usage_hours');

    if (error) throw new Error(`Failed to save appliances: ${error.message}`);
    
    console.log('Saved appliances:', data);
    return data;

  } catch (error) {
    console.error('Error in saveInitialAppliances:', error);
    throw error;
  }
}

export async function getUserInitialAppliances(user: User, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || createClientComponentClient();
  
  try {
    console.log('Getting appliances for user:', user.id);

    // Get user's rooms
    const { data: userRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name')
      .eq('user_id', user.id);

    if (roomsError) throw new Error(`Failed to fetch rooms: ${roomsError.message}`);

    if (!userRooms || userRooms.length === 0) {
      console.log('No rooms found for user');
      return [];
    }

    // Get appliances for those rooms
    const roomIds = userRooms.map(room => room.id);
    const { data, error } = await supabase
      .from('appliances')
      .select('id, name, wattage, room_id, usage_hours')
      .in('room_id', roomIds);

    if (error) throw new Error(`Failed to fetch appliances: ${error.message}`);
    
    // Create room mapping
    const roomMap = userRooms.reduce((acc, room) => {
      acc[room.id] = room.name;
      return acc;
    }, {} as { [key: string]: string });
    
    // Format data for the app
    const formattedData = data?.map(item => ({
      id: item.id,
      appliance_name: item.name,
      wattage: item.wattage,
      usage_hours: item.usage_hours || 4, // Use saved value or fallback
      room: roomMap[item.room_id] || 'unknown'
    })) || [];
    
    return formattedData;
  } catch (error) {
    console.error('Error in getUserInitialAppliances:', error);
    return [];
  }
}

export async function deleteConfigAppliance(applianceId: string, user: User, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || createClientComponentClient();
  
  try {
    // Get the appliance and verify ownership
    const { data: appliance, error: fetchError } = await supabase
      .from('appliances')
      .select('id, room_id')
      .eq('id', applianceId)
      .single();

    if (fetchError || !appliance) throw new Error('Appliance not found');

    // Check if the room belongs to the user
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('user_id')
      .eq('id', appliance.room_id)
      .single();

    if (roomError || !room || room.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    const { error } = await supabase
      .from('appliances')
      .delete()
      .eq('id', applianceId);

    if (error) throw new Error(`Failed to delete appliance: ${error.message}`);
  } catch (error) {
    console.error('Error in deleteConfigAppliance:', error);
    throw error;
  }
}

// Auth helper functions
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(`Sign up failed: ${error.message}`);
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(`Sign in failed: ${error.message}`);
  return data;
}

export async function signOut() {
  const supabase = createClientComponentClient();
  
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Sign out failed: ${error.message}`);
}

export async function getCurrentUser() {
  const supabase = createClientComponentClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } catch (error) {
    return null;
  }
}