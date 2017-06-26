#!/usr/bin/env node 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var input = process.argv;
function toCamelCase(str) {
    var result = "";
    var words = str.split("_");
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        result += word.charAt(0).toUpperCase() + word.slice(1);
    }
    return result;
}
function createFile(path, file) {
    fs.writeFile(path, file, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("+" + path);
    });
}
console.log(input[1]);
if (input[2] == "create" || input[2] == "c") {
    if (input[3] == "model") {
        var cname = toCamelCase(input[4]);
        cname = cname.slice(0, cname.length - 1);
        var model = fs.readFileSync("templates/model.tmp", "utf8");
        model = model.replace(new RegExp("<MODEL>", "g"), cname);
        model = model.replace(new RegExp("<TABLE>", "g"), input[4]);
        var fields = [];
        var rg = new RegExp("<FIELDS>", "g");
        for (var i = 5; i < input.length; i++) {
            var element = input[i].split(":");
            model = model.replace(rg, element[0] + ": " + element[1] + "\n\t<FIELDS>");
        }
        model = model.replace(new RegExp("<FIELDS>", "g"), "");
        createFile("app/models/" + cname + ".ts", model);
    }
}
