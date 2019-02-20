"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("./util");
function bangPython() {
    let name = path.basename(process.cwd());
    let author = "mhzed";
    let authorEmail = "minhongz@gmail.com";
    util_1.banDir('lib');
    util_1.banDir('tests');
    util_1.bangFile('LICENSE', util_1.loadFile('res/LICENSE'));
    util_1.bangFile('.gitignore', 'dist/\nbuild/\n*.egg-info/\n__pycache__');
    console.log('Initializing for python');
    child_process_1.execSync("pipenv check");
    util_1.bangFile('lib/module.py', '');
    util_1.bangFile("lib/__init__.py", "");
    util_1.bangFile("tests/__init__.py", "");
    util_1.bangFile('tests/test.py', `
import unittest
import lib.module

class MyTest(unittest.TestCase):
  def test(self):
    self.assertEqual(1,1)
  `);
    util_1.bangFile("main.py", `import lib.module`);
    util_1.bangFile('setup.py', `
import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="${name}",
    version="0.0.1",
    author="${author}",
    author_email="${authorEmail}",
    description="",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)  
  `);
    util_1.bangFile('README.md', () => {
        let content = `
## Misc commands

To run tests:

    python -m unittest discover

To package: 

    python3 setup.py sdist bdist_wheel  
    `;
        return name + '\n--------\n' + content;
    });
}
exports.bangPython = bangPython;
//# sourceMappingURL=bangPython.js.map