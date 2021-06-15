const path = require('path');
const fs = require('fs');

/**
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function(src, dest) {
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};


const DIST_FOLDER = path.join(__dirname, 'dist');

copyRecursiveSync(path.join(__dirname, 'package.json'),  path.join(DIST_FOLDER, 'package.json'));
copyRecursiveSync(path.join(__dirname, 'README.md'),  path.join(DIST_FOLDER, 'README.md'));
copyRecursiveSync(path.join(__dirname, 'src', 'static'), path.join(DIST_FOLDER, 'static'));
copyRecursiveSync(path.join(__dirname, 'schema'), path.join(DIST_FOLDER, 'schema'));
copyRecursiveSync(path.join(__dirname, 'template'), path.join(DIST_FOLDER, 'template'));
copyRecursiveSync(path.join(__dirname, 'banner.txt'),  path.join(DIST_FOLDER, 'banner.txt'));
