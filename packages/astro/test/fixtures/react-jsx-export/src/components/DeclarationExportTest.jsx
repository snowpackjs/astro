import { useState } from "react"

export const ConstDeclarationExport = () => {
    const [example] = useState('Example')
    return <h2 id="export_const_declaration">{example}</h2>
}

export let LetDeclarationExport = () => {
    const [example] = useState('Example')
    return <h2 id="export_let_declaration">{example}</h2>
}

export function FunctionDeclarationExport() {
    const [example] = useState('Example')
    return <h2 id="export_function_declaration">{example}</h2>
}