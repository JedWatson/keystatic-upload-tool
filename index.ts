import 'dotenv/config';
import {
  HEADERS,
  KEYSTATIC_CLOUD_UPLOAD_URL,
  UPLOAD_FROM_DIR,
  RESULTS_PATH,
} from './config';
import { ALLOWED_IMAGE_EXTENSIONS, imageUploadSchema } from './schema';
import fs from 'node:fs/promises';
import path from 'node:path';

let uploaded = 0;
let skipped = 0;

function plural(string: string, num: number) {
  return num === 1 ? string : `${string}s`;
}

async function uploadFile(name: string) {
  let results: Record<string, string> = {};
  try {
    const content = await fs.readFile(RESULTS_PATH, 'utf-8');
    results = JSON.parse(content);
  } catch (e) {}

  if (results[name]) {
    console.log(`>  Skipping ${name} because it has already been uploaded`);
    skipped++;
    return;
  }

  const parsed = path.parse(name);

  const data = {
    filename: parsed.name,
    extension: parsed.ext.slice(1),
    defaultAltText: '',
    notes: '',
  };

  const check = imageUploadSchema.safeParse(data);
  if (!check.success) {
    console.log(`>  Skipping ${name} because:`);
    for (const error of check.error.errors) {
      console.log(`   - ${error.message}`);
    }
    skipped++;
    return;
  }

  const stats = await fs.stat(`${UPLOAD_FROM_DIR}/${name}`);
  if (stats.size > 1024 * 1024 * 5) {
    console.log(
      `>  Skipping ${name} because it is larger than 5MB (${Math.round(
        stats.size / 1024 / 1024,
      )}MB)`,
    );
    skipped++;
    return;
  }

  const formData = new FormData();

  const content = await fs.readFile(`${UPLOAD_FROM_DIR}/${name}`);
  formData.append('image', new Blob([content]));
  formData.append('filename', data.filename);
  formData.append('extension', data.extension);
  formData.append('defaultAltText', data.defaultAltText);
  formData.append('notes', data.notes);

  const response = await fetch(KEYSTATIC_CLOUD_UPLOAD_URL, {
    method: 'POST',
    headers: HEADERS,
    body: formData,
    redirect: 'manual',
  });
  const result = await response.text();

  // we'll get a redirect to /signin if the session cookie isn't valid. This
  // isn't recoverable, so we bail and prompt for a fresh session secret.
  if (result.startsWith('/signin')) {
    console.log(`
🚨 Your Session Secret is not valid. Please log in to https://keystatic.cloud
   and update the value of SESSION_COOKIE in your .env file.
`);
    process.exit(1);
  }

  // result will be the redirect path for the new image in the cloud dashboard
  // e.g /teams/thinkmill-labs/project/keystatic-site/images/{id}
  const [, , , , , , id] = result.split('/');

  results[name] = `${id}/${data.filename}`;
  console.log(`>  Uploaded ${name} to ${results[name]}`);
  uploaded++;

  await fs.writeFile(RESULTS_PATH, JSON.stringify(results, null, 2));
}

const allFiles = await fs.readdir(UPLOAD_FROM_DIR);
const files = allFiles.filter((file) => !file.startsWith('.'));

console.log(`🤞 Uploading ${files.length} files from ${UPLOAD_FROM_DIR}...
`);

for (const file of files) {
  const parsed = path.parse(file);
  const ext = parsed.ext.slice(1);
  // @ts-ignore
  if (ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    await uploadFile(file);
  } else {
    skipped++;
    console.log(`>  Skipping ${file} because it is not a valid image type`);
  }
}

console.log(`
✅ Uploaded ${uploaded} ${plural(
  'file',
  uploaded,
)}, skipped ${skipped} ${plural('file', skipped)}.
`);
