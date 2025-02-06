import { useState } from "react"

export { ListExportTestComponent } from './ListExportTestComponent'

const ListExport = () => {
    const [example] = useState('Example')
    return <h2 id="default_list_export">{example}</h2>
}

export {ListExport}

const OriginListExport = () => {
    const [example] = useState('Example')
    return <h2 id="renamed_list_export">{example}</h2>
}

export {
    OriginListExport as RenamedListExport
}

const ListAsDefaultExport = () => {
    const [example] = useState('Example')
    return <h2 id="list_as_default_export">{example}</h2>
}

export {
    ListAsDefaultExport as default
}