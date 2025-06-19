import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// Solar System Functions
export async function saveSolarSystem(systemData: {
  battery_capacity: number;
  minimum_state_of_charge: number;
  installation_year: number;
  panel_rating: number;
  number_of_panels: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No authenticated user');

  // Check if user already has a system
  const { data: existingSystem } = await supabase
    .from('solar_systems')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existingSystem) {
    // Update existing system
    const { data, error } = await supabase
      .from('solar_systems')
      .update({
        ...systemData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    return data;
  } else {
    // Create new system
    const { data, error } = await supabase
      .from('solar_systems')
      .insert({
        ...systemData,
        user_id: user.id
      })
      .select();

    if (error) throw error;
    return data;
  }
}

export async function getUserSolarSystem() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User:', user); // ✅ Debug: Show who is logged in

  if (!user) return null;

  const { data, error } = await supabase
    .from('solar_systems')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle(); // ✅ FIXED: changed from `.single()` to `.maybeSingle()` to avoid crashing when empty

  if (error) throw error;
  return data;
}

// Initial Appliances Functions (for Manage System Appliances page)
export async function saveInitialAppliances(appliances: Array<{
  appliance_name: string;
  wattage: number;
  usage_hours: number;
  room: string;
}>) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No authenticated user');

  // Delete existing initial appliances for this user
  await supabase
    .from('initial_appliances')
    .delete()
    .eq('user_id', user.id);

  // Insert new appliances
  const appliancesWithUserId = appliances.map(appliance => ({
    ...appliance,
    user_id: user.id
  }));

  const { data, error } = await supabase
    .from('initial_appliances')
    .insert(appliancesWithUserId)
    .select();

  if (error) throw error;
  return data;
}

export async function getUserInitialAppliances() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('initial_appliances')
    .select('*')
    .eq('user_id', user.id)
    .order('room', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Configuration Appliances Functions (for Configuration page)
export async function saveConfigAppliance(appliance: {
  appliance_name: string;
  wattage: number;
  usage_hours: number;
  room: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('appliances')
    .insert({
      ...appliance,
      user_id: user.id
    })
    .select();

  if (error) throw error;
  return data;
}

export async function getUserConfigAppliances() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('appliances')
    .select('*')
    .eq('user_id', user.id)
    .order('room', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function deleteConfigAppliance(applianceId: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('appliances')
    .delete()
    .eq('id', applianceId)
    .eq('user_id', user.id); // Extra security check

  if (error) throw error;
}

// export async function saAVESOLARSYSYTEM(systemData: {
//   battery_capacity: number;
//   minimum_state_of_charge: number;
//   installation_year: number;
//   panel_rating: number;
//   number_of_panels: number;
// }) {
//   const { data: { user } } = await supabase.auth.getUser();

//   if (!user) throw new Error('No authenticated user');

//   // Check if user already has a system
//   const { data: existingSystem } = await supabase
//     .from('solar_systems')
//     .select('id')
//     .eq('user_id', user.id)
//     .single();

//   if (existingSystem) {
//     // Update existing system
//     const { data, error } = await supabase
//       .from('solar_systems')
//       .update({
//         ...systemData,
//         updated_at: new Date().toISOString()
//       })
//       .eq('user_id', user.id)
//       .select();

//     if (error) throw error;
//     return data;
//   } else {
//     // Create new system
//     const { data, error } = await supabase
//       .from('solar_systems')
//       .insert({
//         ...systemData,
//         user_id: user.id
//       })
//       .select();

//     if (error) throw error;
//     return data;
//   }
// }
