import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const distDir = resolve(projectRoot, 'dist')

// Load .env manually (no dotenv dependency needed for deploy script)
function loadEnv() {
  const envPath = resolve(projectRoot, '.env')
  if (!existsSync(envPath)) {
    console.error('Error: .env file not found. Copy .env.example to .env and fill in your credentials.')
    process.exit(1)
  }
  const envContent = readFileSync(envPath, 'utf-8')
  const env = {}
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...valueParts] = trimmed.split('=')
    env[key.trim()] = valueParts.join('=').trim()
  }
  return env
}

const EXTRACT_PHP = `<?php
$zip = new ZipArchive;
if ($zip->open(__DIR__ . '/deploy.zip') === TRUE) {
    $zip->extractTo(__DIR__ . '/');
    $zip->close();
    unlink(__DIR__ . '/deploy.zip');
    unlink(__FILE__);
    echo 'OK';
} else {
    echo 'FAIL';
}
`

async function deploy() {
  const env = loadEnv()
  const { CPANEL_HOST, CPANEL_USER, CPANEL_TOKEN, CPANEL_PASSWORD } = env

  if (!CPANEL_HOST || !CPANEL_USER) {
    console.error('Error: CPANEL_HOST and CPANEL_USER are required in .env')
    process.exit(1)
  }

  // Check if dist exists
  if (!existsSync(distDir)) {
    console.log('Building project first...')
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' })
  }

  console.log(`Deploying to ${CPANEL_HOST}...`)

  // Create zip of dist contents
  console.log('Creating deployment archive...')
  execSync('cd dist && zip -r ../deploy.zip . -x "*.DS_Store"', {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  const zipPath = resolve(projectRoot, 'deploy.zip')
  const extractPhpPath = resolve(projectRoot, 'extract.php')

  // Write temporary extract helper
  writeFileSync(extractPhpPath, EXTRACT_PHP)

  // Use cPanel UAPI via curl with token auth
  const authHeader = CPANEL_TOKEN
    ? `cpanel ${CPANEL_USER}:${CPANEL_TOKEN}`
    : `Basic ${Buffer.from(`${CPANEL_USER}:${CPANEL_PASSWORD}`).toString('base64')}`

  const baseUrl = `https://${CPANEL_HOST}:2083`

  try {
    // Upload zip + extract helper
    console.log('Uploading to cPanel...')
    const uploadStatus = execSync(
      `curl -s -o /dev/null -w "%{http_code}" ` +
      `--header "Authorization: ${authHeader}" ` +
      `-F "dir=/public_html" ` +
      `-F "file-1=@${zipPath}" ` +
      `-F "file-2=@${extractPhpPath}" ` +
      `"${baseUrl}/execute/Fileman/upload_files"`,
      { cwd: projectRoot, encoding: 'utf-8' }
    )

    if (!uploadStatus.includes('200')) {
      throw new Error(`Upload failed with status: ${uploadStatus}`)
    }
    console.log('Upload complete.')

    // Run PHP extract script (extracts zip, deletes zip + itself)
    console.log('Extracting files on server...')
    const extractResult = execSync(
      `curl -s "https://${CPANEL_HOST}/extract.php"`,
      { encoding: 'utf-8' }
    )

    if (extractResult.trim() !== 'OK') {
      throw new Error(`Extract failed: ${extractResult}`)
    }
    console.log('Extract complete.')

    // Clean up local files
    execSync(`rm -f "${zipPath}" "${extractPhpPath}"`)

    console.log(`\nDeployment complete! Visit https://${CPANEL_HOST}`)
  } catch (error) {
    console.error('Deployment failed:', error.message)
    execSync(`rm -f "${zipPath}" "${extractPhpPath}"`)
    process.exit(1)
  }
}

deploy()
