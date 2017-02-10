import * as fs from 'fs'
import * as path from 'path'
let jison = require("jison");

function main() {
    let configsDirectory = path.join(__dirname, "./../../../resources/conf/");
    fs.readdir(configsDirectory, (err, files) => {
        if (err)
            console.log("Error while reading the configs folder: " + err)
        else {
            let bnf = fs.readFileSync(path.join(__dirname, "./../../../src/playground/versatile-grammar.jison"), "utf8")
            let parser = new jison.Parser(bnf)
            let filesScanned = 0
            files.forEach((file) => {
                let absoluteFileDir = path.join(configsDirectory, file)
                let text = fs.readFileSync(absoluteFileDir, "utf8")
                    console.log("start parsing " + file + " ...")
                    let parseResult = parser.parse(text)
                    if (parseResult) {
                        filesScanned++
                        console.log("... success")

                    } else
                        console.log("ERROR while parsing " + file + ". Files scanned: (" + filesScanned + "/" + files.length + ")")
            })

            console.log("All config files successfully parsed")
        }
    })
}

main()