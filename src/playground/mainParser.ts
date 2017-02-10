import * as fs from 'fs'
import * as path from 'path'
let jison = require("jison");

function main() {
    let text = fs.readFile(path.join(__dirname, "./../../../resources/source.config"), "utf8", (err, data) => {
        let bnf = fs.readFileSync(path.join(__dirname, "./../../../src/playground/versatile-grammar.jison"), "utf8")
        let parser = new jison.Parser(bnf)
        let tmp = parser.parse(data)
        console.log("It works !")
    })
}

main()