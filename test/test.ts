import { bangBasic, bangTypescript } from "../src/bang";
import {  emptyDir, mkdirp } from "fs-extra";
import { resolve } from "path";
import { chdir, cwd } from "process";


const indir = async (directory: string, action: any) : Promise<void> => {
  const cdir = cwd();
  chdir(directory);
  await action();
  chdir(cdir);
}


describe('nodebang', ()=>{
  it('basic', async()=>{
    const testdir = resolve(__dirname, "testproj");
    await mkdirp(testdir);
    await indir(testdir,async()=>{
      await bangBasic();
      await bangTypescript();
      // await bangReact();   // too network heavy, commentted out by default
    });
    await emptyDir(testdir)
  })
})