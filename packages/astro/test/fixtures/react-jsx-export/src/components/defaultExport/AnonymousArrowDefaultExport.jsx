import { useState } from "react"

export default () => {
    const [example] = useState('Example')
    return <h2 id="anonymous_arrow_default_export">{example}</h2>
}