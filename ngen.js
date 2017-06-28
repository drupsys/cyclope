#!/usr/bin/env node 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
let input = process.argv;
function toCamelCase(str) {
    let result = "";
    let words = str.split("_");
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
if (input[2] == "create" || input[2] == "c") {
    if (input[3] == "model") {
        let cname = toCamelCase(input[4]);
        cname = cname.slice(0, cname.length - 1);
        let model = fs.readFileSync("templates/model.tmp", "utf8");
        model = model.replace(new RegExp("<MODEL>", "g"), cname);
        model = model.replace(new RegExp("<TABLE>", "g"), input[4]);
        let fields = [];
        let rg = new RegExp("<FIELDS>", "g");
        for (var i = 5; i < input.length; i++) {
            var element = input[i].split(":");
            model = model.replace(rg, element[0] + ": " + element[1] + "\n\t<FIELDS>");
        }
        model = model.replace(new RegExp("<FIELDS>", "g"), "");
        createFile("app/models/" + cname + ".ts", model);
    }
}
