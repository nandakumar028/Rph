const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('route.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src/app/api');
let patchedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to find GET function signature and the createClient call right after
  const regex = /(export\s+async\s+function\s+GET\s*\([^)]*\)\s*\{[\s\S]*?const\s+supabase\s*=\s*await\s+createClient\(\)\n)/;
  
  if (regex.test(content)) {
    // Check if it already has getUserProfile check in GET
    const match = content.match(regex)[1];
    const afterMatch = content.substring(content.indexOf(match) + match.length);
    if (!afterMatch.trim().startsWith('const profile')) {
      content = content.replace(regex, `$1  const profile = await getUserProfile(supabase)\n  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })\n`);
      
      // Also ensure getUserProfile is imported if not already
      if (!content.includes('getUserProfile')) {
         content = content.replace(/import \{([^}]+)\} from '@\/utils\/supabase\/queries'/, (match, p1) => {
            return `import { ${p1.trim()}, getUserProfile } from '@/utils/supabase/queries'`;
         });
      }
      
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Patched ${file}`);
      patchedCount++;
    }
  }
});

console.log(`Finished patching ${patchedCount} files.`);
