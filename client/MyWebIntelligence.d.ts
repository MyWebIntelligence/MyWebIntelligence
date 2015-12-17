/*
    Symbolic interface 
*/

interface MyWIUserId extends String{ __MyWIUserId: MyWIUserId }

interface MyWIUser{
    id: MyWIUserId
    name: string
    pictureURL: string
    territoires : MyWITerritoire[]
}

interface MyWITerritoireId extends String{ __MyWITerritoireId: MyWITerritoireId }

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

interface MyWIQueryId extends String{ __MyWIQueryId: MyWIQueryId }

interface MyWIQuery{
    id: MyWIQueryId,
    name: string
    q: string
    lang: string // enum
    nbPage: number // still not convinced of this one.
    oracle: MyWIOracleId
}

interface MyWIOracleId extends String{ __MyWIOracleId: MyWIOracleId }

interface MyWIOracle{
    id: MyWIOracleId
    name: string
    oracle_node_module_name: string
    options: {
        name: string,
        type: any // "number" or "string" or string[] (enum)
    }[]
    credentials_infos: null | any // any is a dictionary object describing how the credentials form shoud be presented
}

interface InitData{
    user: {
        territoires: MyWITerritoire[]
    }
    oracles: MyWIOracle[]
}

