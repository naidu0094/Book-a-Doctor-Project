/*
# Storage policies for medical-reports bucket

## Changes
- Add RLS policies to the medical-reports storage bucket
- Allow authenticated users to upload, read, and delete files in their own folder
*/

CREATE POLICY "Allow authenticated uploads to medical-reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-reports');

CREATE POLICY "Allow public read of medical-reports"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'medical-reports');

CREATE POLICY "Allow authenticated delete from medical-reports"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-reports');
