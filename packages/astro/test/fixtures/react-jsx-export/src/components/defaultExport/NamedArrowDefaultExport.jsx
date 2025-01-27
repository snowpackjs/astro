import { useState } from "react";

const NamedArrowDefaultExport = () => {
    const [example] = useState('Example')
    return <h2 id="named_arrow_default_export">{example}</h2>
}

export default NamedArrowDefaultExport;