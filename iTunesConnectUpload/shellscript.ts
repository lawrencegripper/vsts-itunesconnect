/// <reference path="../definitions/node.d.ts" />
/// <reference path="../definitions/Q.d.ts" />
/// <reference path="../definitions/vsts-task-lib.d.ts" />

import path = require('path');
import tl = require('vsts-task-lib/task');

async function run() {
    try {  
        var pathToAlTool = "/Applications/Xcode.app/Contents/Applications/Application\ Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool";
        var username:string = tl.getInput("username");
        var password:string = tl.getInput("password");

        // determines whether output to stderr will fail a task.
        // some tools write progress and other warnings to stderr.  scripts can also redirect.
        var failOnStdErr: boolean = tl.getBoolInput('failOnStandardError', false);

        var buildRoot = tl.getVariable("");

        var sourceFolder: string = tl.getPathInput('SourceFolder', true, true);
        var ipas = tl.find(sourceFolder);

        //Work around for itms issue - http://stackoverflow.com/questions/28461768/xcode-organizer-trying-to-access-transporter-at-wrong-directory-path
        var bashTool = tl.createToolRunner(tl.which("bash", true));
        bashTool.argString(path.resolve(__dirname,'symLinkItms.sh'));
        await bashTool.exec();

        for (var index:number = 0; index < ipas.length; index++) {
            var ipaFile:string = ipas[index];
            if (!ipaFile.endsWith(".ipa"))
            {
                continue;    
            }

            console.log("Uploading file " + ipaFile);
            var altTool = tl.createToolRunner(pathToAlTool);

            var args = "--upload-app -f \"" + ipaFile + "\" -t iOs -u " + username + " -p " + password;
            
            altTool.argString(args);

            var code: number = await altTool.exec(<any>{failOnStdErr: failOnStdErr});
            
        }
        


        //tl.setResult(tl.TaskResult.Succeeded, tl.loc('BashReturnCode', code));


        // tl.setResourcePath(path.join( __dirname, 'task.json'));

        // var bash = tl.createToolRunner(tl.which('bash', true));

        // var scriptPath: string = tl.getPathInput('scriptPath', true, true);
        // var cwd: string = tl.getPathInput('cwd', true, false);

        // var taskDir = tl


        // bash.pathArg(scriptPath);

        // // additional args should always call argString.  argString() parses quoted arg strings
        // bash.argString(tl.getInput('args', false));


        // var code: number = await bash.exec(<any>{failOnStdErr: failOnStdErr});
        // tl.setResult(tl.TaskResult.Succeeded, tl.loc('BashReturnCode', code));
    }
    catch(err) {
        console.log(err);
        tl.setResult(tl.TaskResult.Failed, "Upload Failed");
    }    
}

run();