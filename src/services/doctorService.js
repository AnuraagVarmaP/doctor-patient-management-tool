import { supabase } from "../api/supabaseClient";

export const getDoctorProfile = async (id) => {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("id", id)
      .maybeSingle(); // maybeSingle doesn't throw 406 if 0 rows
    
    return { data, error };
  } catch (error) {
    console.error("getDoctorProfile thrown error:", error);
    return { data: null, error };
  }
};

export const upsertDoctorProfile = async (profileData) => {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .upsert([profileData])
      .select();
    
    return { data, error };
  } catch (error) {
    console.error("upsertDoctorProfile thrown error:", error);
    return { data: null, error };
  }
};
