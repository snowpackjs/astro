import { useState } from "react"

export default function() {
    const [example] = useState('Example')
    return <h2 id="anonymous_function_default_export">{example}</h2>
}