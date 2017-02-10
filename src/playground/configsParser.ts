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
                try {
                    let parseResult = parser.parse(text)
                    filesScanned++
                } catch (error) {
                    console.log("ERROR while parsing " + file + ". Files scanned: (" + filesScanned + "/" + files.length + ")")
                    throw error
                }
            })

            console.log("All config files successfully parsed")
        }
    })
}

main()