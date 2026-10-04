import { getSupabaseClient } from './supabaseClient';

export interface SubtitleUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class SubtitleService {
  private get client() {
    return getSupabaseClient();
  }

  /**
   * Uploads an Amharic subtitle file to Supabase Storage
   * Organizes by content type and ID: subtitles/{movies|episodes}/{id}/amharic.vtt
   * Safely converts .srt to .vtt if needed.
   */
  async uploadAmharicSubtitle(
    id: string,
    file: File,
    type: 'movie' | 'episode'
  ): Promise<SubtitleUploadResult> {
    const supabase = this.client;
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const folder = type === 'movie' ? 'movies' : 'episodes';
      const extension = file.name.split('.').pop()?.toLowerCase() || 'vtt';
      
      let finalFile: File | Blob = file;
      let finalExtension = extension;

      // Handle SRT to VTT conversion if necessary
      if (extension === 'srt') {
        const text = await file.text();
        const vttText = this.convertToVTT(text);
        finalFile = new Blob([vttText], { type: 'text/vtt' });
        finalExtension = 'vtt';
      }

      const filePath = `${folder}/${id}/amharic.${finalExtension}`;

      // Upload/Replace file
      const { data, error } = await supabase.storage
        .from('subtitles')
        .upload(filePath, finalFile, {
          upsert: true,
          contentType: 'text/vtt',
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('subtitles')
        .getPublicUrl(filePath);

      // Update database record
      const table = type === 'movie' ? 'movies' : 'episodes';
      const { error: dbError } = await supabase
        .from(table)
        .update({ amharic_subtitle_url: publicUrl })
        .eq('id', id);

      if (dbError) throw dbError;

      return { success: true, url: publicUrl };
    } catch (err: any) {
      console.error('Subtitle upload error:', err);
      return { success: false, error: err.message || 'Failed to upload subtitle' };
    }
  }

  /**
   * Basic SRT to VTT conversion
   */
  private convertToVTT(srtText: string): string {
    // 1. Add WEBVTT header
    // 2. Replace commas with dots in timestamps (00:00:20,000 -> 00:00:20.000)
    let vtt = 'WEBVTT\n\n' + srtText;
    
    // Replace timestamp commas with periods
    // Regex matches HH:MM:SS,mmm
    vtt = vtt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    
    return vtt;
  }

  /**
   * Deletes Amharic subtitle for a content item
   */
  async deleteAmharicSubtitle(id: string, type: 'movie' | 'episode'): Promise<boolean> {
    const supabase = this.client;
    if (!supabase) return false;

    try {
      // First, get the current URL to find the file path
      const table = type === 'movie' ? 'movies' : 'episodes';
      const { data, error: fetchError } = await supabase
        .from(table)
        .select('amharic_subtitle_url')
        .eq('id', id)
        .single();

      if (fetchError || !data?.amharic_subtitle_url) return false;

      // Extract path from URL (simple heuristic for Supabase public URLs)
      // https://.../storage/v1/object/public/subtitles/movies/123/amharic.vtt
      const urlParts = data.amharic_subtitle_url.split('/subtitles/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('subtitles').remove([filePath]);
      }

      // Clear DB field
      await supabase
        .from(table)
        .update({ amharic_subtitle_url: null })
        .eq('id', id);

      return true;
    } catch (err) {
      console.error('Subtitle deletion error:', err);
      return false;
    }
  }
}

export const subtitleService = new SubtitleService();
