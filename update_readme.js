// Assembles README.md / README.en.md from docs/README.header*.md, the GitHub
// wiki pages Intro/Home (or en:Intro/en:Home) and docs/README.footer*.md.
// The README files are generated - edit the docs/ parts, not the output.

const fs = require('fs');

async function page(name) {
    const res = await fetch(`https://raw.githubusercontent.com/wiki/rdmtc/RedMatic/${name}.md`);
    if (!res.ok) {
        console.log(`  wiki/${name} not fetched (${res.status})`);
        return '';
    }
    console.log(`  fetched wiki/${name}`);
    return res.text();
}

async function assemble(target, header, intro, home, docTitle, footer) {
    let out = fs.readFileSync(`${__dirname}/docs/${header}`).toString();

    out += await page(intro);
    out += `\n## ${docTitle}\n\n`;

    let toc = await page(home);
    toc = toc.replace(/^.*\(Intro\)\n/, '');
    toc = toc.replace(/]\((?!http)/g, '](https://github.com/rdmtc/RedMatic/wiki/');
    out += toc;

    out += '\n\n\n' + fs.readFileSync(`${__dirname}/docs/${footer}`).toString();

    fs.writeFileSync(target, out);
}

(async () => {
    console.log('\nAssemble Readme files');
    await assemble('README.md', 'README.header.md', 'Intro', 'Home', 'Dokumentation', 'README.footer.md');
    await assemble('README.en.md', 'README.header.en.md', 'en:Intro', 'en:Home', 'Documentation', 'README.footer.en.md');
    console.log('  done.');
})().catch(err => {
    console.error(err.message);
    process.exit(1);
});
