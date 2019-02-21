"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("./util");
const which = require("which");
function bangPython() {
    const pythonBin = which.sync('python', { nothrow: true });
    if (pythonBin == null) {
        console.log("Can't explode: where is python?");
        return;
    }
    const pythonPath = path.dirname(pythonBin);
    console.log(`Using python at ${pythonBin}`);
    let pipEnvBin = which.sync("pipenv", { nothrow: true });
    if (pipEnvBin == null) {
        console.log("Installing pipenv for user via --user");
        child_process_1.execSync("pip install --user pipenv");
        const localPath = child_process_1.execSync(`python3 -c 'import site; print(site.USER_BASE)'`).toString();
        pipEnvBin = path.join(localPath, "bin", "pipenv");
        console.log(`pipenv installed at ${pipEnvBin}`);
    }
    let name = path.basename(process.cwd());
    let author = "mhzed";
    let authorEmail = "minhongz@gmail.com";
    util_1.banDir('lib');
    util_1.banDir('.vscode');
    util_1.banDir('tests');
    util_1.bangFile('LICENSE', util_1.loadFile('res/LICENSE'));
    util_1.bangFile('.gitignore', 'dist/\nbuild/\n*.egg-info/\n__pycache__');
    console.log('Initializing pipenv');
    child_process_1.execSync(`${pipEnvBin} install pylint --dev`);
    util_1.bangFile('__init__.py', "");
    util_1.bangFile('lib/module.py', '""" doc """\nv = 1\n');
    util_1.bangFile("lib/__init__.py", "");
    util_1.bangFile("tests/__init__.py", "");
    util_1.bangFile('tests/test.py', `
""" pydoc """
import unittest
import lib.module

class MyTest(unittest.TestCase):
  """ pydoc """
  def test(self):
    """ pydoc """
    self.assertEqual(lib.module.v, 1)
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

    #To run tests:
    python -m unittest discover
    #To package: 
    python3 setup.py sdist bdist_wheel  
    `;
        return name + '\n--------\n' + content;
    });
    util_1.bangJSON(".vscode/settings.json", {
        "python.linting.enabled": true,
        "python.linting.pylintEnabled": true,
        "python.linting.pylintArgs": ["--enable=all",
            "--variable-rgx=^[a-z][a-zA-Z0-9_]*$",
            "--argument-rgx=^[a-z][a-zA-Z0-9_]*$",
            "--function-rgx=^[a-z][a-zA-Z0-9_]*$",
            "--indent-string=\"  \""],
        "python.pythonPath": `${pythonBin}`,
        "python.linting.pylintPath": `${pythonPath}/pylint`
    });
}
exports.bangPython = bangPython;
//# sourceMappingURL=bangPython.js.map