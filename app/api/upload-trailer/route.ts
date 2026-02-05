import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filmId = formData.get('filmId') as string;

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`trailers/${filmId}/${file.name}`, file, {
      access: 'public',
    });

    console.log('[v0] Trailer uploaded:', {
      filmId,
      fileName: file.name,
      fileSize: file.size,
      url: blob.url,
    });

    return Response.json(
      {
        success: true,
        message: 'Trailer uploaded successfully',
        data: {
          url: blob.url,
          fileKey: blob.pathname,
          fileName: file.name,
          fileSize: file.size,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Upload error:', error);
    return Response.json(
      { error: 'Failed to upload trailer' },
      { status: 500 }
    );
  }
}
