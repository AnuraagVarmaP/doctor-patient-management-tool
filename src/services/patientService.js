import { supabase } from "../api/supabaseClient";

export const getPatients = async (doctorId) => {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getPatientById = async (id, doctorId) => {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("doctor_id", doctorId)
    .single();
  return { data, error };
};

export const createPatient = async (patientData) => {
  const { data, error } = await supabase
    .from("patients")
    .insert([patientData])
    .select();
  return { data, error };
};

export const updatePatient = async (id, doctorId, patientData) => {
  const { data, error } = await supabase
    .from("patients")
    .update(patientData)
    .eq("id", id)
    .eq("doctor_id", doctorId)
    .select();
  return { data, error };
};

export const deletePatient = async (id, doctorId) => {
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .eq("doctor_id", doctorId);
  return { error };
};
