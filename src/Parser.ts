import {versatile} from './VersatileFunction'
export class Parser {
    public getFunctionDictionnary(data: string): {[name: string]: versatile.Function} {
        let jsonObject = JSON.parse(data).functions
        let functionDict = {}
        for (let functionName of Object.keys(jsonObject)) {
            let paramsArray = []
            let f = jsonObject[functionName]
            for (let param of f.parameters) {
                paramsArray.push(new versatile.FunctionParameter(param.name, param.type, param.description))
            }
            functionDict[functionName] = new versatile.Function(f.pattern, paramsArray, f.doc)
        }

        return functionDict
    }
}
