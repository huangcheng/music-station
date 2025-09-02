import fs from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: Request) {
  try {
    await ensureUploadDir();

    const form = await req.formData();
    const entries = [...form.entries()];

    const saved: Array<{
      field: string;
      originalName: string;
      fileName: string;
      size: number;
      url: string;
    }> = [];

    for (const [field, value] of entries) {
      // value may be a File (Web File) for file inputs
      // skip non-file fields
      if (typeof (value as File).arrayBuffer !== 'function') continue;

      const file = value as File;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // sanitize and avoid collisions by prefixing a timestamp
      const safeName = `${Date.now()}_${path.basename(file.name)}`;
      const filePath = path.join(UPLOAD_DIR, safeName);

      await fs.writeFile(filePath, buffer);

      saved.push({
        field,
        originalName: file.name,
        fileName: safeName,
        size: buffer.length,
        url: `/uploads/${safeName}`,
      });
    }

    return NextResponse.json({ success: true, files: saved });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await ensureUploadDir();
    const files = await fs.readdir(UPLOAD_DIR);
    const list = await Promise.all(
      files.map(async (fileName) => {
        const stats = await fs.stat(path.join(UPLOAD_DIR, fileName));
        return {
          fileName,
          size: stats.size,
          url: `/uploads/${fileName}`,
          createdAt: stats.birthtime,
        };
      }),
    );

    return NextResponse.json({ success: true, files: list });
  } catch (error) {
    console.error('List upload error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
