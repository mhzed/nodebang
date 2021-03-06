// import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process';
import { bangFile } from "./util";
import * as which from "which";
import * as mkdirp from "mkdirp";

export function bangJava() {

  const javaBin = which.sync('java', { nothrow: true });
  if (javaBin == null) {
    console.log("Can't explode: where is java?");
    return;
  }
  console.log(`Using java at ${javaBin}\n${execSync('java -version')}`);

  const mavenBin = which.sync('mvn', { nothrow: true });
  if (mavenBin == null) {
    console.log("Can't explode: where is maven?");
    return;
  }
  console.log(`Using maven at ${mavenBin}`);

  let name = path.basename(process.cwd())

  mkdirp.sync('src/main/java/com/acme');
  mkdirp.sync('src/main/resources');
  mkdirp.sync('src/test/java/com/acme');
  mkdirp.sync('src/test/resources');
  mkdirp.sync('.vscode')
  bangFile('.gitignore', 'target/\nbuild/\n*.egg-info/')

  bangFile('README.md', () => {
    let content = `
## Misc commands

Project generated by nodebang

    `;
    return name + '\n--------\n' + content;
  });
  bangFile('src/main/java/com/acme/Main.java', `
package com.acme;

public class Main { 
  public static void main(String [] args)
  {
    System.out.println("hello world");
  }
}  
  `)
  bangFile('src/test/java/com/acme/MyTests.java', `
package com.acme;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

public class MyTests {
    @AfterClass
    public static void setup() {

    }
    @BeforeClass
    public static void teardown() {
      
    }
    @Test
    public void test1() {
        // assert statements
        assertEquals(0, 0);
    }
}  `)
  bangFile('pom.xml', `
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
<modelVersion>4.0.0</modelVersion>
<groupId>com.mhzed</groupId>
<artifactId>${name}</artifactId>
<version>\${revision}</version>
<packaging>jar</packaging>
<name>${name}</name>
<url>http://maven.apache.org</url>
<properties>
  <encoding>UTF-8</encoding>
  <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
  <java.version>1.8</java.version>
  <maven.compiler.source>1.8</maven.compiler.source>
  <maven.compiler.target>1.8</maven.compiler.target>
  <revision>1.0.0-SNAPSHOT</revision>
</properties>
<dependencies>
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
    <scope>test</scope>
  </dependency>
</dependencies>
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-shade-plugin</artifactId>
      <version>3.2.1</version>
      <executions>
        <execution>
          <phase>package</phase>
          <goals>
            <goal>shade</goal>
          </goals>            
          <configuration>
            <minimizeJar>true</minimizeJar>
          </configuration>            
        </execution>
      </executions>        
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>2.22.1</version>
      <configuration>
        <trimStackTrace>false</trimStackTrace>
        <argLine>\${surefireArgLine}</argLine>
        <skipTests>\${skip.unit.tests}</skipTests>
        <excludes>
          <exclude>**/Docker*.java</exclude>
        </excludes>
        <systemPropertyVariables>
        </systemPropertyVariables>
      </configuration>
    </plugin>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-failsafe-plugin</artifactId>
      <version>2.22.1</version>
      <executions>
        <execution>
          <id>integration-tests</id>
          <goals>
            <goal>integration-test</goal>
            <goal>verify</goal>
          </goals>
          <configuration>
            <argLine>\${failsafeArgLine}</argLine>
            <skipTests>\${skip.integration.tests}</skipTests>
          </configuration>
        </execution>
      </executions>
    </plugin>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.2</version>
      <executions>
        <execution>
          <id>pre-unit-test</id>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
          <configuration>
            <destFile>\${project.build.directory}/coverage-reports/jacoco-ut.exec</destFile>
            <propertyName>surefireArgLine</propertyName>
          </configuration>
        </execution>
        <execution>
          <id>post-unit-test</id>
          <phase>test</phase>
          <goals>
            <goal>report</goal>
          </goals>
          <configuration>
            <dataFile>\${project.build.directory}/coverage-reports/jacoco-ut.exec</dataFile>
            <outputDirectory>\${project.reporting.outputDirectory}/jacoco-ut</outputDirectory>
          </configuration>
        </execution>
        <execution>
          <id>pre-integration-test</id>
          <phase>pre-integration-test</phase>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
          <configuration>
            <destFile>\${project.build.directory}/coverage-reports/jacoco-it.exec</destFile>
            <propertyName>failsafeArgLine</propertyName>
          </configuration>
        </execution>
        <execution>
          <id>post-integration-test</id>
          <phase>post-integration-test</phase>
          <goals>
            <goal>report</goal>
          </goals>
          <configuration>
            <dataFile>\${project.build.directory}/coverage-reports/jacoco-it.exec</dataFile>
            <outputDirectory>\${project.reporting.outputDirectory}/jacoco-it</outputDirectory>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>  
</project>  
  `)

}