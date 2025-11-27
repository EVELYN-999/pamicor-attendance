// Supabase Service Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_CONFIG } from './supabase-config.js';

// Initialize Supabase client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

export class SupabaseService {
  
  // Save meeting to database
  static async saveMeeting(meetingData) {
    try {
      const { attendees, ...meeting } = meetingData;
      
      // Insert meeting
      const { data: savedMeeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          id: meeting.id,
          meeting_name: meeting.meetingName,
          topic: meeting.topic,
          date: meeting.date,
          session: meeting.session,
          start_time: meeting.startTime,
          end_time: meeting.endTime,
          duration: meeting.duration,
          type: meeting.type,
          site: meeting.site,
          conducted_by: meeting.conductedBy,
          conductor_signature: meeting.conductorSignature || false,
          conductor_sign_time: meeting.conductorSignTime || null
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Insert attendees
      if (attendees && attendees.length > 0) {
        const attendeesData = attendees.map(att => ({
          meeting_id: savedMeeting.id,
          name: att.name,
          company: att.company,
          job_title: att.jobTitle,
          signature: att.signature || false,
          sign_time: att.signTime || null,
          is_late: att.isLate || false
        }));

        const { error: attendeesError } = await supabase
          .from('attendees')
          .insert(attendeesData);

        if (attendeesError) throw attendeesError;
      }

      return { success: true, data: savedMeeting };
    } catch (error) {
      console.error('Error saving meeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Update existing meeting
  static async updateMeeting(meetingData) {
    try {
      const { attendees, ...meeting } = meetingData;
      
      // Update meeting
      const { error: meetingError } = await supabase
        .from('meetings')
        .update({
          meeting_name: meeting.meetingName,
          topic: meeting.topic,
          date: meeting.date,
          session: meeting.session,
          start_time: meeting.startTime,
          end_time: meeting.endTime,
          duration: meeting.duration,
          type: meeting.type,
          site: meeting.site,
          conducted_by: meeting.conductedBy,
          conductor_signature: meeting.conductorSignature || false,
          conductor_sign_time: meeting.conductorSignTime || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', meeting.id);

      if (meetingError) throw meetingError;

      // Delete existing attendees and insert new ones
      await supabase.from('attendees').delete().eq('meeting_id', meeting.id);
      
      if (attendees && attendees.length > 0) {
        const attendeesData = attendees.map(att => ({
          meeting_id: meeting.id,
          name: att.name,
          company: att.company,
          job_title: att.jobTitle,
          signature: att.signature || false,
          sign_time: att.signTime || null,
          is_late: att.isLate || false
        }));

        const { error: attendeesError } = await supabase
          .from('attendees')
          .insert(attendeesData);

        if (attendeesError) throw attendeesError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating meeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Load all meetings with attendees
  static async loadAllMeetings() {
    try {
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select(`
          *,
          attendees (*)
        `)
        .order('created_at', { ascending: false });

      if (meetingsError) throw meetingsError;

      // Transform data to match your current format
      const transformedMeetings = meetings.map(meeting => ({
        id: meeting.id,
        meetingName: meeting.meeting_name,
        topic: meeting.topic,
        date: meeting.date,
        session: meeting.session,
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        duration: meeting.duration,
        type: meeting.type,
        site: meeting.site,
        conductedBy: meeting.conducted_by,
        conductorSignature: meeting.conductor_signature,
        conductorSignTime: meeting.conductor_sign_time,
        attendees: meeting.attendees.map(att => ({
          id: att.id,
          name: att.name,
          company: att.company,
          jobTitle: att.job_title,
          signature: att.signature,
          signTime: att.sign_time,
          isLate: att.is_late
        }))
      }));

      return { success: true, data: transformedMeetings };
    } catch (error) {
      console.error('Error loading meetings:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete meeting
  static async deleteMeeting(meetingId) {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting meeting:', error);
      return { success: false, error: error.message };
    }
  }

  // Add attendee to existing meeting
  static async addAttendee(meetingId, attendeeData) {
    try {
      const { error } = await supabase
        .from('attendees')
        .insert({
          meeting_id: meetingId,
          name: attendeeData.name,
          company: attendeeData.company,
          job_title: attendeeData.jobTitle,
          signature: attendeeData.signature || false,
          sign_time: attendeeData.signTime || null,
          is_late: attendeeData.isLate || false
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding attendee:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time subscription for meetings
  static subscribeToMeetings(callback) {
    const subscription = supabase
      .channel('meetings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meetings' }, 
        callback
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'attendees' }, 
        callback
      )
      .subscribe();

    return subscription;
  }

  // Check connection status
  static async testConnection() {
    try {
      const { data, error } = await supabase.from('meetings').select('count').limit(1);
      return { success: !error, error: error?.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default SupabaseService;