/// <reference path="../definitions/node.d.ts" />
/// <reference path="../definitions/Q.d.ts" />
/// <reference path="../definitions/vsts-task-lib.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const path = require('path');
const tl = require('vsts-task-lib/task');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var pathToAlTool = "/Applications/Xcode.app/Contents/Applications/Application\ Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool";
            var username = tl.getInput("username");
            var password = tl.getInput("password");
            // determines whether output to stderr will fail a task.
            // some tools write progress and other warnings to stderr.  scripts can also redirect.
            var failOnStdErr = tl.getBoolInput('failOnStandardError', false);
            var buildRoot = tl.getVariable("");
            var sourceFolder = tl.getPathInput('SourceFolder', true, true);
            var ipas = tl.find(sourceFolder);
            //Work around for itms issue - http://stackoverflow.com/questions/28461768/xcode-organizer-trying-to-access-transporter-at-wrong-directory-path
            var bashTool = tl.createToolRunner(tl.which("bash", true));
            bashTool.argString(path.resolve(__dirname, 'symLinkItms.sh'));
            yield bashTool.exec();
            for (var index = 0; index < ipas.length; index++) {
                var ipaFile = ipas[index];
                if (!ipaFile.endsWith(".ipa")) {
                    continue;
                }
                console.log("Uploading file " + ipaFile);
                var altTool = tl.createToolRunner(pathToAlTool);
                var args = "--upload-app -f \"" + ipaFile + "\" -t iOs -u " + username + " -p " + password;
                console.log("With Args: ");
                console.log(args);
                altTool.argString(args);
                var code = yield altTool.exec({ failOnStdErr: failOnStdErr });
            }
        }
        catch (err) {
            console.log(err);
            tl.setResult(tl.TaskResult.Failed, "Upload Failed");
        }
    });
}
run();
//# sourceMappingURL=shellscript.js.map