/*
    Symbolic interface 
*/

interface MyWIUserId extends Number{ __MyWIUserId: MyWIUserId }

interface MyWIUser{
    id: MyWIUserId
    name: string
    pictureURL: string
    territoires : MyWITerritoire[]
}

interface MyWITerritoireId extends Number{ __MyWITerritoireId: MyWITerritoireId }

interface MyWITerritoire{
    id: MyWITerritoireId
    name: string
    description: string 
    queries: MyWIQuery[]

    resultsList: { // as a list
        title: string
        url: string
        excerpt: string
    }[]
    // resultGraph: Graph<domain> // for later
}

interface MyWIQueryId extends Number{ __MyWIQueryId: MyWIQueryId }

interface MyWIQuery{
    id: MyWIQueryId,
    name: string
    q: string
    lang: string // enum
    nbPage: number // still not convinced of this one.
    oracle: MyWIOracleId
}

interface MyWIOracleId extends Number{ __MyWIOracleId: MyWIOracleId }

interface MyWIOracle{
    id: MyWIOracleId
    name: string
    oracleNodeModuleName: string
    options: {
        name: string,
        type: any // "number" or "string" or string[] (enum)
    }[]
    needsCredentials: boolean | any // any is a dictionary object describing how the credentials form shoud be presented
}

interface InitData{
    currentUser: {
        territoires: MyWITerritoire[]
    }
    oracles: MyWIOracle[]
}

