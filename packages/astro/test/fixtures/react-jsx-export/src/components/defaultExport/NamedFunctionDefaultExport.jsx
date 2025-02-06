import { useState } from "react"

export default function NamedFunctionDefaultExport() {
    const [example] = useState('Example')
    return <h2 id="named_Function_default_export">{example}</h2>
}