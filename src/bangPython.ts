// import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process';
import { banDir, bangFile, loadFile } from "./util";

export function bangPython() {
  let name = path.basename(process.cwd())
  let author = "mhzed";
  let authorEmail = "minhongz@gmail.com";

  banDir('lib')
  banDir('tests')
  bangFile('LICENSE', loadFile('res/LICENSE'));  
  bangFile('.gitignore', 'dist/\nbuild/\n*.egg-info/\n__pycache__')

  console.log('Initializing for python')
  execSync("pipenv check");
  bangFile('lib/module.py', '')
  bangFile("lib/__init__.py", "");
  bangFile("tests/__init__.py", "");
  bangFile('tests/test.py', `
import unittest
import lib.module

class MyTest(unittest.TestCase):
  def test(self):
    self.assertEqual(1,1)
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

To run tests:

    python -m unittest discover

To package: 

    python3 setup.py sdist bdist_wheel  
    `;
    return name + '\n--------\n' + content;
  })
}