// import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process';
import { banDir, bangFile, loadFile, bangJSON } from "./util";
import * as which from "which";
export function bangPython() {
  const pythonBin = which.sync('python', {nothrow: true});
  const pythonPath = path.dirname(pythonBin);
  console.log(`Using python at ${pythonBin}`);

  let name = path.basename(process.cwd())
  let author = "mhzed";
  let authorEmail = "minhongz@gmail.com";

  banDir('lib')
  banDir('.vscode')
  banDir('tests')
  bangFile('LICENSE', loadFile('res/LICENSE'));  
  bangFile('.gitignore', 'dist/\nbuild/\n*.egg-info/\n__pycache__')

  console.log('Initializing pipenv')
  execSync("pipenv install pylint --dev");
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
    "python.linting.pylintEnabled": true,
    "python.linting.pylintArgs": ["--enable=all", 
      "--variable-rgx=^[a-z][a-z0-9]*((_[a-z0-9]+)*)?$", 
      "--argument-rgx=^[a-z][a-z0-9]*((_[a-z0-9]+)*)?$",
      "--function-rgx=^[a-z][a-z0-9]*((_[a-z0-9]+)*)?$",
      "--indent-string=\"  \""],
    "python.pythonPath": `${pythonBin}`,
    "python.linting.pylintPath": `${pythonPath}/pylint`
  });
}