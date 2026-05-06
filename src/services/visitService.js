import { supabase } from "../api/supabaseClient";

export const getVisitsByPatient = async (patientId, doctorId) => {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("patient_id", patientId)
    .eq("doctor_id", doctorId)
    .order("visit_date", { ascending: false });
  return { data, error };
};

export const createVisit = async (visitData) => {
  const { data, error } = await supabase
    .from("visits")
    .insert([visitData])
    .select();
  return { data, error };
};

export const updateVisit = async (id, doctorId, visitData) => {
  const { data, error } = await supabase
    .from("visits")
    .update(visitData)
    .eq("id", id)
    .eq("doctor_id", doctorId)
    .select();
  return { data, error };
};

export const deleteVisit = async (id, doctorId) => {
  const { error } = await supabase
    .from("visits")
    .delete()
    .eq("id", id)
    .eq("doctor_id", doctorId);
  return { error };
};
