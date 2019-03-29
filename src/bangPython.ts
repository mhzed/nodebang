// import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process';
import { banDir, bangFile, loadFile, bangJSON } from "./util";
import * as which from "which";

/** 
 * https://packaging.python.org/tutorials/installing-packages/
 * https://docs.python.org/3/tutorial/modules.html
 * 
*/
export function bangPython() {
  const pythonBin = which.sync('python', {nothrow: true});
  if (pythonBin == null) {
    console.log("Can't explode: where is python?");
    return;
  }
  const pythonPath = path.dirname(pythonBin);
  console.log(`Using python at ${pythonBin}`);

  let pipEnvBin = which.sync("pipenv", {nothrow: true});
  if (pipEnvBin == null) {
    console.log("Installing pipenv for user via --user");
    execSync("pip install --user pipenv");
    const localPath = execSync(`python3 -c 'import site; print(site.USER_BASE)'`).toString();
    pipEnvBin = path.join(localPath, "bin", "pipenv");
    console.log(`pipenv installed at ${pipEnvBin}`);
  }
  
  let name = path.basename(process.cwd())
  let author = "mhzed";
  let authorEmail = "minhongz@gmail.com";

  banDir('lib')
  banDir('.vscode')
  banDir('tests')
  bangFile('LICENSE', loadFile('res/LICENSE'));  
  bangFile('.gitignore', 'dist/\nbuild/\n*.egg-info/\n__pycache__')

  console.log('Initializing pipenv')
  execSync(`${pipEnvBin} install flake8 autopep8 --dev`);
  bangFile('__init__.py', "");
  bangFile('lib/module.py', '""" doc """\nv = 1\n');
  bangFile("lib/__init__.py", "");
  bangFile("tests/__init__.py", "");
  bangFile('tests/test.py', `
""" pydoc """
import unittest
import lib.module

class MyTest(unittest.TestCase):
  """ pydoc """
  def test(self):
    """ pydoc """
    self.assertEqual(lib.module.v, 1)
  `)
  bangFile("main.py", `import lib.module`)
  bangFile('setup.py', `
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
  `)
  bangFile('README.md', () => {
    let content = `
## Misc commands

    #To run tests:
    python -m unittest discover
    #To package: 
    python3 setup.py sdist bdist_wheel  
    `;
    return name + '\n--------\n' + content;
  });

  
  bangJSON(".vscode/settings.json", {
    "python.linting.enabled": true,
    "python.formatting.autopep8Args": [
      "--max-line-length",
      "80",
      "--indent-size",
      "2"
    ],
    "python.linting.flake8Enabled": true,
    "python.linting.flake8Args": [
      "--ignore=E111,E501,E114,E265"
    ]
  });
}