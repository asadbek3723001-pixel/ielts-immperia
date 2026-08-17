const { execSync } = require('child_process');
const path = require('path');

const pgRestorePath = 'C:\\Users\\user\\AppData\\Roaming\\DBeaverData\\drivers\\clients\\postgresql\\win\\17\\pg_restore.exe';
const backupFile = 'C:\\Users\\user\\Desktop\\Projects\\moc\\backend\\backup.backup';

const cmd = `"${pgRestorePath}" --host=altaria.proxy.rlwy.net --port=24667 --username=postgres --dbname=railway --no-owner --clean --if-exists "${backupFile}"`;

console.log('Running pg_restore command...');
try {
  const output = execSync(cmd, {
    env: { ...process.env, PGPASSWORD: 'icBpLgdfZNNTezLBnyVSubJZIXeRAJBO' },
    encoding: 'utf8'
  });
  console.log('OUTPUT:', output);
  console.log('RESTORE SUCCESS!');
} catch (err) {
  console.log('Command completed with warnings/errors:');
  if (err.stdout) console.log('STDOUT:', err.stdout);
  if (err.stderr) console.log('STDERR:', err.stderr);
}
